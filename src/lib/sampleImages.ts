/**
 * Sample Image Resolver
 * =====================
 * Maps detected instrument classes/names to their authentic sample image
 * stored in /sample/{instrument}.jpeg.
 *
 * Target YOLO classes:
 *  - bansuri.jpeg
 *  - harmonium.jpeg
 *  - pakhawaz.jpeg
 *  - santoor.jpeg
 *  - sarangi.jpeg
 *  - sarod.jpeg
 *  - shehnai.jpeg
 *  - sitar.jpeg
 *  - tabla.jpeg
 *  - tanpura.jpeg
 */

const SAMPLE_IMAGE_MAP: Record<string, string> = {
  // Direct YOLO classes & normalized variants
  bansuri: "/sample/bansuri.jpeg",
  harmonium: "/sample/harmonium.jpeg",
  pakhawaz: "/sample/pakhawaz.jpeg",
  pakhawaj: "/sample/pakhawaz.jpeg",
  pakhavaj: "/sample/pakhawaz.jpeg",
  santoor: "/sample/santoor.jpeg",
  sarangi: "/sample/sarangi.jpeg",
  sarod: "/sample/sarod.jpeg",
  shehnai: "/sample/shehnai.jpeg",
  shahnai: "/sample/shehnai.jpeg",
  shenai: "/sample/shehnai.jpeg",
  sundari: "/sample/shehnai.jpeg",
  sitar: "/sample/sitar.jpeg",
  veena: "/sample/sitar.jpeg",
  "mayuri-veena": "/sample/sitar.jpeg",
  "saraswati-veena": "/sample/sitar.jpeg",
  tabla: "/sample/tabla.jpeg",
  tanpura: "/sample/tanpura.jpeg",
  tampura: "/sample/tanpura.jpeg",
  tutari: "/sample/shehnai.jpeg",
  tarpa: "/sample/bansuri.jpeg",
};

/**
 * Returns the path to the sample image in /sample/ for a detected instrument.
 */
export function getSampleImagePath(identifier?: string | null): string {
  if (!identifier) return "/sample/sitar.jpeg";
  const key = identifier.toLowerCase().trim();

  if (SAMPLE_IMAGE_MAP[key]) {
    return SAMPLE_IMAGE_MAP[key];
  }

  // Fallback to substring matching
  for (const [k, path] of Object.entries(SAMPLE_IMAGE_MAP)) {
    if (key.includes(k) || k.includes(key)) {
      return path;
    }
  }

  return "/sample/sitar.jpeg";
}
