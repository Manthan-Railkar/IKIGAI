# Playable UI, recording & jam feature

Design notes for the interaction layer that runs after YOLO detection: how a detected
instrument becomes playable, how performances get recorded, and how a visitor can jam
across multiple discovered instruments in one continuous take.

## 1. Layout selection

Each instrument in `manifest.json` gets an `interaction` field that decides which UI
renders after detection:

| interaction | instruments (example) | layout |
|---|---|---|
| `strings` | sitar, veena, sarod, tanpura | Plucked string layout |
| `tiles` | harmonium, santoor, shehnai, bansuri, tabla, pakhawaj | Tapped tile grid |
| `drone` | tanpura (if not rendered as strings) | Single loop toggle, no notes |

This keeps "how it sounds" (existing manifest: clip, type, modes) separate from
"how it's played" (this new field).

## 2. String layout

- 4–7 lines rendered on screen (SVG/canvas), spaced to resemble the real instrument's
  string count.
- **Pluck detection:** `pointerdown` + `pointermove`, checking which string's hitbox
  the pointer crosses.
- **Multiple notes per string:** optional fret-style zones along a string's length;
  moving further from one end pitch-shifts the triggered note up, using Tone.js's
  per-playback pitch-shifting (no extra samples needed).
- **Feedback:** a quick CSS wiggle/transform on the plucked string so it reads as a
  physical pluck, not a button press.
- **Audio engine:** Tone.js `Sampler` (retunes the generated clip per note), or
  `PluckSynth` as a synthesized fallback where no clip exists yet.

## 3. Tile layout

- Grid of tiles labeled with a note (Sa Re Ga Ma…) or, for percussion, a stroke name
  (Na, Tin, Dha, Ge).
- Tap/click triggers the note/stroke instantly; a brief scale-down + color flash gives
  press feedback.
- **Audio engine:** same Sampler approach for melodic tiles; discrete one-shot samples
  per tile for percussion, since real strokes differ in timbre, not just pitch.

## 4. Recording, real audio → MP3

- A single **app-level `Tone.Recorder`**, connected to one shared `Tone.Destination`
  bus. Every instrument screen's audio output feeds this same bus — not a separate
  recorder per instrument.
- **Record / Stop** controls live in a persistent header/bar, visible on every screen,
  with a pulsing indicator + timer while active.
- On Stop, the recorder returns a Blob. Since browsers can't natively encode MP3:
  - Decode the Blob to PCM via `AudioContext.decodeAudioData`.
  - Encode PCM to MP3 client-side with **lamejs** (pure JS, no backend needed).
  - Generate a download link (`URL.createObjectURL`) named e.g. `session-recording.mp3`.
- A parallel **note-event log** (`{ instrument, note, time }` per action) is kept
  alongside the raw audio — useful later for a visual "who played what when" timeline,
  independent of the MP3 export.

## 5. Cross-instrument jam (the key recent decision)

Instead of a separate "merge two recordings" screen, the recorder is **session-scoped,
not instrument-scoped**:

1. User taps Record while on the tabla tile screen and plays a few strokes.
2. User navigates to the sitar string screen — **recording keeps running**, nothing is
   torn down on navigation.
3. User plucks strings — sitar's audio hits the same shared bus, captured right after
   the tabla part, in the order actually played.
4. User taps Stop — one continuous Blob, covering both instruments in sequence, ready
   for the same decode → lamejs → MP3 → download flow.

No audio mixing, offset alignment, or multi-track logic is needed — whatever the
visitor plays live is what gets captured, in real time, across as many discovered
instruments as they visit during one recording session.

## 6. Reference

Interaction modes (Ambient/Pitch/Beat) and the instrument-picker-then-play flow are
modeled on Google Arts & Culture's Instrument Playground:
https://artsandculture.google.com/experiment/instrument-playground/8QFo2oQr2uT3pg
