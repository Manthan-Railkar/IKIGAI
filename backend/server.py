"""
Museum Melody — YOLO Instrument Detection API
================================================
FastAPI server that loads a fine-tuned YOLO model (best.pt) once at startup
and exposes a POST /detect endpoint for real-time instrument recognition.

Usage:
    cd backend
    pip install -r requirements.txt
    uvicorn server:app --reload --port 8000

Environment variables:
    MODEL_PATH            — Path to the YOLO weights file (default: ../models/best.pt)
    CONFIDENCE_THRESHOLD  — Minimum confidence to accept a detection (default: 0.60)
    ALLOWED_ORIGINS       — Comma-separated CORS origins (default: http://localhost:3000)
"""

from __future__ import annotations

import os
import io
import logging
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image

# ── Configuration ────────────────────────────────────────────────────────────

MODEL_PATH: str = os.getenv("MODEL_PATH", os.path.join(os.path.dirname(__file__), "..", "models", "best.pt"))
CONFIDENCE_THRESHOLD: float = float(os.getenv("CONFIDENCE_THRESHOLD", "0.60"))
ALLOWED_ORIGINS: list[str] = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("museum-detect")

# ── Global model reference (loaded once at startup) ──────────────────────────

_model: Any = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load the YOLO model once when the server starts."""
    global _model
    from ultralytics import YOLO

    resolved_path = os.path.abspath(MODEL_PATH)
    logger.info(f"Loading YOLO model from: {resolved_path}")

    if not os.path.isfile(resolved_path):
        logger.error(f"Model file not found at {resolved_path}")
        raise FileNotFoundError(f"Model file not found: {resolved_path}")

    _model = YOLO(resolved_path)
    logger.info(f"Model loaded successfully. Classes: {_model.names}")
    logger.info(f"Confidence threshold: {CONFIDENCE_THRESHOLD}")

    yield  # Server is running

    # Cleanup
    _model = None
    logger.info("Model unloaded.")


# ── FastAPI App ──────────────────────────────────────────────────────────────

app = FastAPI(
    title="Museum Melody Detection API",
    description="Real-time musical instrument detection using a fine-tuned YOLO model",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["*"],
)


# ── Health Check ─────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    """Quick health check to verify the server and model are running."""
    return {
        "status": "ok",
        "model_loaded": _model is not None,
        "confidence_threshold": CONFIDENCE_THRESHOLD,
    }


# ── Detection Endpoint ───────────────────────────────────────────────────────

@app.post("/detect")
async def detect(image: UploadFile = File(...)):
    """
    Accept an image (webcam frame or upload), run YOLO inference,
    and return the top detection result.

    Returns:
        { "detected": true, "class": "Sitar", "confidence": 0.87, "bbox": [x, y, w, h] }
        or
        { "detected": false }
    """
    if _model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    # Validate content type
    if image.content_type and not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail=f"Expected an image file, got {image.content_type}")

    try:
        # Read and decode the uploaded image
        contents = await image.read()
        pil_image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception as e:
        logger.warning(f"Failed to decode image: {e}")
        raise HTTPException(status_code=400, detail="Could not decode the uploaded image")

    try:
        # Run YOLO inference
        results = _model(pil_image, verbose=False)
    except Exception as e:
        logger.error(f"Inference failed: {e}")
        raise HTTPException(status_code=500, detail="Inference error")

    # Parse results — find the highest-confidence detection above threshold
    best_detection = None
    best_confidence = 0.0

    for result in results:
        if result.boxes is None or len(result.boxes) == 0:
            continue

        for box in result.boxes:
            confidence = float(box.conf[0])
            class_id = int(box.cls[0])
            class_name = _model.names.get(class_id, f"class_{class_id}")

            if confidence >= CONFIDENCE_THRESHOLD and confidence > best_confidence:
                # Convert bbox from xyxy to xywh format
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                bbox_xywh = [
                    round(x1, 2),
                    round(y1, 2),
                    round(x2 - x1, 2),
                    round(y2 - y1, 2),
                ]

                best_detection = {
                    "detected": True,
                    "class": class_name,
                    "confidence": round(confidence, 4),
                    "bbox": bbox_xywh,
                }
                best_confidence = confidence

    if best_detection is None:
        return JSONResponse(content={"detected": False})

    logger.info(f"Detected: {best_detection['class']} ({best_detection['confidence']:.2%})")
    return JSONResponse(content=best_detection)
