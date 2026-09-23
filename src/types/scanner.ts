export type ScannerState =
  | "IDLE"
  | "REQUESTING_CAMERA"
  | "SCANNING"
  | "DETECTING"
  | "VERIFYING"
  | "DISCOVERED"
  | "NOT_DETECTED"
  | "ERROR";

export type ScannerErrorType =
  | "CAMERA_DENIED"
  | "CAMERA_UNAVAILABLE"
  | "DETECTION_FAILED"
  | "GENERIC_ERROR";

export interface DetectionResult {
  instrument_id: string;
  name: string;
  category: string;
  confidence: number;
  boundingBox?: {
    x: number; // percentage
    y: number; // percentage
    width: number; // percentage
    height: number; // percentage
  };
}
