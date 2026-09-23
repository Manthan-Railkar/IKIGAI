/**
 * Detection API Client
 * ====================
 * Clean, decoupled HTTP client for the YOLO instrument detection endpoint.
 * This module only cares about sending an image and receiving a detection result.
 * It knows nothing about instruments, audio, or UI logic.
 */

export interface DetectionApiResponse {
  detected: boolean;
  class?: string;
  confidence?: number;
  bbox?: [number, number, number, number];
}

export interface DetectionApiError {
  type: "NETWORK" | "TIMEOUT" | "SERVER" | "UNKNOWN";
  message: string;
  status?: number;
}

export type DetectionResult =
  | { ok: true; data: DetectionApiResponse }
  | { ok: false; error: DetectionApiError };

const DETECT_ENDPOINT = "/api/detect";
const TIMEOUT_MS = 8000;

/**
 * Send a captured camera frame to the detection backend.
 *
 * @param imageBlob - A Blob containing the JPEG/PNG image data
 * @returns A discriminated union: either `{ ok: true, data }` or `{ ok: false, error }`
 */
export async function detectInstrument(
  imageBlob: Blob
): Promise<DetectionResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const formData = new FormData();
    formData.append("image", imageBlob, "frame.jpg");

    const response = await fetch(DETECT_ENDPOINT, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        ok: false,
        error: {
          type: "SERVER",
          message: `Server responded with ${response.status}: ${response.statusText}`,
          status: response.status,
        },
      };
    }

    const data: DetectionApiResponse = await response.json();
    return { ok: true, data };
  } catch (err: unknown) {
    clearTimeout(timeoutId);

    if (err instanceof DOMException && err.name === "AbortError") {
      return {
        ok: false,
        error: {
          type: "TIMEOUT",
          message: "Detection request timed out after 8 seconds",
        },
      };
    }

    if (err instanceof TypeError) {
      // fetch throws TypeError for network failures (backend down, CORS, DNS)
      return {
        ok: false,
        error: {
          type: "NETWORK",
          message: "Could not reach the detection server. Is the backend running?",
        },
      };
    }

    return {
      ok: false,
      error: {
        type: "UNKNOWN",
        message: err instanceof Error ? err.message : "Unknown detection error",
      },
    };
  }
}

/**
 * Convert a canvas data URL to a Blob suitable for upload.
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] || "image/jpeg";
  const binary = atob(base64);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  return new Blob([array], { type: mime });
}
