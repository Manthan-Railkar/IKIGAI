/**
 * YOLO Class → Canonical Instrument Resolver
 * ============================================
 * Bridges the gap between YOLO model class names and the app's
 * CANONICAL_INSTRUMENTS data. This is the ONLY place that maps
 * detection output to instrument manifest data.
 *
 * YOLO model classes: Tabla, Sitar, Tanpura, Sarangi, Bansuri,
 *                     Shehnai, Pakhawaz, Harmonium, Santoor, Sarod
 */

import { CANONICAL_INSTRUMENTS } from "@/lib/supabase/instruments";
import { Instrument } from "@/types/instrument";

/**
 * Normalization map: YOLO class name → canonical model_class value.
 * Handles spelling differences and casing mismatches.
 */
const CLASS_NORMALIZATION: Record<string, string> = {
  // Direct matches (case-insensitive lookup handled below)
  tabla: "tabla",
  sitar: "sitar",
  tanpura: "tanpura",
  sarangi: "sarangi",
  bansuri: "bansuri",
  shehnai: "shehnai",
  santoor: "santoor",
  sarod: "sarod",
  harmonium: "harmonium",

  // Spelling variants
  pakhawaz: "pakhawaj",
  pakhawaj: "pakhawaj",
  pakhavaj: "pakhawaj",

  // Additional possible YOLO output variants
  shenai: "shehnai",
  shahnai: "shehnai",
  tanpoora: "tanpura",
  tampura: "tanpura",
};

/**
 * Normalize a YOLO class name to the canonical model_class value.
 */
function normalizeClassName(yoloClass: string): string {
  const lower = yoloClass.toLowerCase().trim();
  return CLASS_NORMALIZATION[lower] || lower;
}

/**
 * Resolve a YOLO detection class name to a canonical Instrument.
 *
 * Strategy:
 * 1. Normalize the class name
 * 2. Search instruments in the specified museum first
 * 3. If not found in that museum, search across all museums
 * 4. Return null if no match exists
 *
 * @param yoloClassName - The class name returned by the YOLO model (e.g. "Sitar")
 * @param museumId - The currently active museum ID
 * @returns The matching Instrument, or null
 */
export function resolveInstrument(
  yoloClassName: string,
  museumId: string
): Instrument | null {
  const normalizedClass = normalizeClassName(yoloClassName);

  // First: try to find in the current museum
  const museumMatch = CANONICAL_INSTRUMENTS.find(
    (inst) =>
      inst.museum_id === museumId &&
      inst.active &&
      inst.model_class === normalizedClass
  );

  if (museumMatch) return museumMatch;

  // Fallback: search across all museums
  const globalMatch = CANONICAL_INSTRUMENTS.find(
    (inst) => inst.active && inst.model_class === normalizedClass
  );

  return globalMatch || null;
}

/**
 * Get all class names the YOLO model is trained to detect.
 */
export const YOLO_CLASSES = [
  "Tabla",
  "Sitar",
  "Tanpura",
  "Sarangi",
  "Bansuri",
  "Shehnai",
  "Pakhawaz",
  "Harmonium",
  "Santoor",
  "Sarod",
] as const;

export type YoloClassName = (typeof YOLO_CLASSES)[number];
