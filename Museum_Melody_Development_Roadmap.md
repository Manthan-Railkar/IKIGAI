# Museum Melody --- Full Development Roadmap & AI Coding Instructions

## 1. Project Context

You are helping build **Museum Melody**, a mobile-first web experience
that turns a museum visit into a musical treasure hunt.

Core idea:

> **Don't just look at history. Find it, hear it, and play it.**

Museum Melody uses Computer Vision to connect a visitor's phone camera
to the physical museum. Visitors discover musical instruments hidden in
physical artefacts, paintings, sculptures, or relevant textual
references. After discovery, they can learn about the instrument, hear
it, play it, record a short performance, layer discoveries into a
composition, complete a collection, take a quiz, and earn badges.

Canonical product loop:

**EXPLORE → SCAN → DISCOVER → LEARN → HEAR → PLAY → RECORD → LAYER →
COLLECT → QUIZ → BADGE → EXPLORE AGAIN**

The MVP is mobile-first and is initially designed around 3 pilot
Maharashtra museums, with architecture ready to expand to 6 museums. The
target is approximately 8--10 instruments per museum.

------------------------------------------------------------------------

## 2. Current Project Status

Already completed:

-   Login page/frontend
-   Supabase project setup
-   Supabase authentication
-   Login/user data storage

Do **not** rebuild these unless the existing implementation is
incorrect.

The next goal is to build the authenticated Museum Melody experience
from museum selection onward.

------------------------------------------------------------------------

## 3. Technology Stack

Use the following stack unless there is a strong technical reason to
change something:

-   Next.js
-   React
-   TypeScript
-   Tailwind CSS
-   shadcn/ui where useful
-   Supabase: Authentication, PostgreSQL, Storage, APIs
-   YOLO-family detector + museum-specific dataset
-   Lightweight fine-tuned classifier
-   Tesseract.js or cloud OCR
-   Web Audio API
-   MediaRecorder API
-   Vercel

Prefer clean, maintainable, production-oriented code over unnecessary
abstraction.

------------------------------------------------------------------------

# 4. CRITICAL FRONTEND DESIGN RULE

## Ask me before making significant frontend design decisions.

When you reach a point where the frontend needs a new visual design,
layout, interaction, animation, page composition, or visual direction,
**STOP and ask me about the design first**.

Do not automatically invent a complete design for:

-   New pages
-   Major page sections
-   Hero sections
-   Instrument pages
-   Scanner UI
-   Music/playable instrument UI
-   Collection UI
-   Quiz UI
-   Badge UI
-   Major animations
-   Major navigation changes
-   Card layouts
-   Visual themes
-   Page transitions

Instead, explain briefly:

1.  What page/component needs to be designed
2.  Its functional purpose
3.  What information/actions it must contain
4.  What design decisions need to be made
5.  If useful, suggest 2--4 design directions
6.  Ask me to choose or provide a reference before implementing the
    frontend

Example:

> We are now building the Hidden Collection page. It needs to show
> discovered/undiscovered instruments, progress, and a CTA to scan the
> museum. For the visual design, I can implement it as:
>
> 1.  An archival museum catalogue
> 2.  A gamified discovery board
> 3.  A cinematic editorial collection
>
> Which direction do you want, or should I use a reference image you
> provide?

### Small implementation decisions

You may make small implementation-level decisions without asking if they
do not materially affect the visual design, such as:

-   Responsive spacing
-   Accessibility improvements
-   Semantic HTML
-   Button states
-   Loading/error states
-   Mobile breakpoints
-   Technical component organization

If I have already provided a design/reference for a component, follow
that reference instead of asking again.

------------------------------------------------------------------------

# 5. General Development Philosophy

Work intelligently and thoughtfully.

Do not blindly follow a checklist if the existing application structure
requires a better approach.

Before implementing a feature:

1.  Inspect the existing code.
2.  Understand the current architecture.
3.  Reuse existing components and utilities.
4.  Check the Supabase schema before creating duplicate tables.
5.  Check existing routes before adding routes.
6.  Check existing authentication before creating another auth system.
7.  Consider loading, error, empty, permission-denied, and mobile
    states.
8.  Keep implementation consistent with the MVP.
9.  Avoid overengineering features outside the MVP.
10. If an important requirement is ambiguous, ask me instead of
    guessing.

Do not replace working code unnecessarily.

------------------------------------------------------------------------

# 6. Product Flow

Build the application in this general sequence:

``` text
LOGIN
  ↓
PROFILE
  ↓
MUSEUM SELECTION
  ↓
HIDDEN COLLECTION
  ↓
INSTRUMENT DATA
  ↓
DISCOVERY TRACKING
  ↓
SCANNER UI
  ↓
CV/OCR RECOGNITION
  ↓
DISCOVERY REVEAL
  ↓
INSTRUMENT STORY
  ↓
HEAR
  ↓
PLAYABLE INSTRUMENT
  ↓
RECORDING
  ↓
MUSIC LAYERING
  ↓
COLLECTION COMPLETION
  ↓
QUIZ
  ↓
BADGES
  ↓
FINAL SONG
  ↓
EXPLORE AGAIN
```

The exact implementation can evolve if a better architecture is
discovered.

------------------------------------------------------------------------

# 7. Phase 1 --- User Profile

Since authentication already exists, create or verify a profile system.

Recommended table:

``` text
profiles
├── id
├── full_name
├── email
├── avatar_url
├── created_at
└── updated_at
```

The profile `id` should correspond to the authenticated Supabase user
ID.

Requirements:

-   Create a profile when appropriate after signup.
-   Retrieve profile information for authenticated users.
-   Protect authenticated application routes.
-   Do not duplicate Supabase authentication logic.
-   Handle users whose profile row does not yet exist.
-   Do not expose another user's profile data.

------------------------------------------------------------------------

# 8. Phase 2 --- Museum Selection

This is the next major page after login.

Route:

``` text
/museums
```

Purpose:

Allow the visitor to choose the museum they are currently exploring.

Use the previously established Museum Melody visual language and the
existing 3D museum-card concept.

Six candidate museums:

1.  Chhatrapati Shivaji Maharaj Vastu Sangrahalaya --- Mumbai
2.  Raja Dinkar Kelkar Museum --- Pune
3.  Dr. Bhau Daji Lad Mumbai City Museum --- Mumbai
4.  Nagpur Central Museum --- Nagpur
5.  Mahatma Phule Museum --- Pune
6.  Aga Khan Palace Museum --- Pune

The MVP is scoped around 3 pilot museums while being architecturally
ready for 6.

Recommended table:

``` text
museums
├── id
├── name
├── city
├── description
├── category
├── image_url
├── active
├── display_order
└── created_at
```

Do not hardcode museum data inside React components when it should come
from Supabase.

------------------------------------------------------------------------

# 9. Phase 3 --- Hidden Collection

Route:

``` text
/museum/[museumId]
```

Purpose:

Show the instruments that can potentially be discovered in the selected
museum.

The user should immediately understand:

-   How many instruments they discovered
-   How many remain
-   Which instruments are unlocked
-   Which instruments are hidden
-   How to continue exploring

Relationship:

``` text
museums
   ↓
instruments
   ↓
discoveries
   ↓
current user's collection
```

Do not make this page purely static.

------------------------------------------------------------------------

# 10. Phase 4 --- Instrument Database

Recommended table:

``` text
instruments
├── id
├── museum_id
├── name
├── category
├── description
├── historical_context
├── image_url
├── audio_url
├── model_class
├── confidence_threshold
├── active
└── created_at
```

Additional fields may be introduced if they genuinely support the
application.

Each museum should initially have approximately 8--10 target
instruments.

Do not attempt universal musical-instrument recognition for the MVP.

------------------------------------------------------------------------

# 11. Phase 5 --- Discovery Tracking

Recommended table:

``` text
discoveries
├── id
├── user_id
├── museum_id
├── instrument_id
├── source
└── discovered_at
```

Potential source values:

``` text
physical
painting
sculpture
ocr
```

The same instrument must not increase progress multiple times.

Discovery should be idempotent.

Example:

``` text
User scans Tabla
      ↓
Discovery does not exist
      ↓
Create discovery
      ↓
Collection: 3/10 → 4/10
```

If the user scans Tabla again:

``` text
Discovery already exists
      ↓
Do not increase progress
      ↓
Open existing discovery
```

------------------------------------------------------------------------

# 12. Phase 6 --- Scanner UI

Route:

``` text
/scanner
```

The scanner is one of the most important parts of Museum Melody.

Do not immediately connect the real CV system.

First implement the complete scanner UI/state machine using simulated
results.

Required states:

``` text
IDLE
REQUESTING_CAMERA
SCANNING
SEARCHING
POSSIBLE_DETECTION
VERIFYING
DISCOVERED
```

Failure states:

``` text
NO_INSTRUMENT
LOW_CONFIDENCE
WRONG_OBJECT
BLURRY_IMAGE
CAMERA_DENIED
CV_ERROR
```

The application must never falsely claim a discovery.

Eventually support:

### Physical artefact

``` text
Object detection
→ classification
→ museum verification
→ discovery
```

### Painting/sculpture

``` text
Scene/object detection
→ identify depicted instrument
→ museum verification
→ discovery
```

### Text/inscription

``` text
OCR
→ instrument/entity extraction
→ controlled instrument dictionary
→ museum verification
→ discovery
```

------------------------------------------------------------------------

# 13. Phase 7 --- Real Computer Vision Integration

After the scanner UI is stable, connect the actual CV pipeline.

Conceptual flow:

``` text
Camera
  ↓
Selected frame
  ↓
Object detection
  ↓
Classification
  ↓
Confidence evaluation
  ↓
Museum catalogue verification
  ↓
Discovery
```

Do not upload every video frame unnecessarily.

Use occasional/selected frames.

Prioritize a small, high-quality museum-specific dataset.

If the CV service is unavailable:

-   Show an honest retry state.
-   Never fabricate a result.

If confidence is low:

-   Do not unlock.
-   Ask the user to reframe, move closer, or hold steady.

------------------------------------------------------------------------

# 14. Phase 8 --- Discovery Reveal

Functional flow:

``` text
SCANNER
  ↓
SUCCESS
  ↓
DISCOVERY REVEAL
  ↓
INSTRUMENT
  ↓
+1 COLLECTION
  ↓
LEARN / HEAR
```

The visual design must be discussed with me before implementation unless
I provide a reference.

The interaction should make discovery feel rewarding without slowing the
user down.

------------------------------------------------------------------------

# 15. Phase 9 --- Instrument Detail

Route:

``` text
/instrument/[instrumentId]
```

Required content:

-   Instrument name
-   Instrument image
-   Short historical story
-   Museum context
-   Category/family
-   Relevant metadata
-   Sound preview
-   Similar instruments
-   Optional clue
-   CTA to play

Keep historical text concise and scannable.

------------------------------------------------------------------------

# 16. Phase 10 --- Playable Instrument

Route:

``` text
/play/[instrumentId]
```

This is a major differentiator.

Use:

-   Web Audio API
-   Curated/royalty-free samples
-   Touch-friendly controls
-   Visual feedback
-   Clear play interaction
-   Recording control

The exact visual design must be discussed with me before implementation.

Do not create a generic music app without considering the museum/history
context.

The interface should communicate:

> The instrument you just discovered is now playable.

------------------------------------------------------------------------

# 17. Phase 11 --- Recording

Flow:

``` text
PLAY
 ↓
RECORD
 ↓
STOP
 ↓
PLAYBACK
 ↓
SAVE / DISCARD
```

Use the MediaRecorder API.

Recommended table:

``` text
recordings
├── id
├── user_id
├── instrument_id
├── audio_url
├── duration
└── created_at
```

Use Supabase Storage for audio files.

Handle:

-   Recording permission denied
-   Browser incompatibility
-   Recording too long
-   Empty/failed recordings
-   Upload failure
-   Playback failure

Recording is optional; play-only mode must remain available.

------------------------------------------------------------------------

# 18. Phase 12 --- Music Creation / Layering

Route:

``` text
/create
```

Purpose:

Allow users to combine recordings/discoveries into a personal
composition.

Keep it much simpler than a professional DAW.

Recommended tables:

``` text
compositions
├── id
├── user_id
├── museum_id
├── name
└── created_at
```

``` text
composition_layers
├── id
├── composition_id
├── recording_id
├── start_time
└── volume
```

Required capabilities:

-   Add a recording
-   Add multiple instrument layers
-   Basic timing/position adjustment
-   Playback
-   Save composition

Advanced DAW functionality is outside the MVP.

------------------------------------------------------------------------

# 19. Phase 13 --- Collection Completion

Calculate progress from actual discoveries.

Example:

``` text
7 / 10 DISCOVERED
```

When the required collection is complete:

``` text
Collection complete
      ↓
Quiz
      ↓
Guided final song
      ↓
Badge
```

Do not rely on client-side progress alone.

Persist important progress server-side.

------------------------------------------------------------------------

# 20. Phase 14 --- Quiz

Route:

``` text
/quiz
```

Recommended table:

``` text
quiz_questions
├── id
├── museum_id
├── question
├── options
├── correct_answer
└── instrument_id
```

The quiz should test things the visitor actually encountered.

Possible question types:

-   Identify an instrument
-   Match instrument to sound
-   Match instrument to historical context
-   Museum-specific discovery question

Handle:

-   Question progress
-   Selected answer
-   Correct/incorrect feedback
-   Final score
-   Completion state

The visual design must be discussed with me before implementation.

------------------------------------------------------------------------

# 21. Phase 15 --- Badges

Recommended tables:

``` text
badges
├── id
├── name
├── description
├── icon_url
└── criteria
```

``` text
user_badges
├── user_id
├── badge_id
└── earned_at
```

Potential MVP badges:

``` text
FIRST DISCOVERY
SOUND HUNTER
COLLECTOR
MUSEUM EXPLORER
MELODY MAKER
```

Badge criteria should be data-driven where practical.

------------------------------------------------------------------------

# 22. Phase 16 --- Final Song

After the visitor completes the collection/quiz flow, show their
composition.

Purpose:

Make the visitor feel that their museum exploration resulted in
something personally created.

Flow:

``` text
DISCOVERIES
  ↓
RECORDINGS
  ↓
LAYERS
  ↓
FINAL COMPOSITION
  ↓
SAVE
  ↓
EXPLORE ANOTHER MUSEUM
```

Do not add social-sharing/community features unless explicitly
requested.

------------------------------------------------------------------------

# 23. Phase 17 --- Admin / Content Management

Museum content should be data-driven.

Eventually support:

``` text
Create museum
Create instrument
Upload instrument image
Add recognition references
Set confidence threshold
Add audio samples
Add related instruments
Create quiz questions
Create badges
Publish/deactivate content
```

Implement admin functionality after the visitor-facing core flow is
working unless an earlier implementation requires it.

------------------------------------------------------------------------

# 24. Error and Edge-Case Requirements

Handle intentionally:

## Camera

-   Permission denied
-   Camera unavailable
-   Retry
-   Poor lighting
-   Blur
-   Glare

## Recognition

-   No instrument
-   Wrong object
-   Similar-looking instrument
-   Low confidence
-   CV service unavailable
-   Instrument outside current museum catalogue

## OCR

-   Text cannot be read
-   Instrument mentioned but not a target
-   OCR confidence too low

## Discovery

-   Duplicate scan
-   Discovery already exists
-   Museum target deactivated

## Audio

-   Audio unavailable
-   Playback failure
-   Slow asset loading

## Recording

-   Permission denied
-   Browser incompatibility
-   Recording too long
-   Upload failure

## Network

-   Weak internet
-   Temporary API failure
-   Session restoration

Never fabricate a CV result, discovery, score, or saved recording.

------------------------------------------------------------------------

# 25. Authentication and Security

Use Supabase Auth and Row Level Security appropriately.

Important rules:

-   Users can access their own discoveries.
-   Users can access their own recordings.
-   Users can access their own compositions.
-   Users can access their own badges/progress.
-   Public museum/instrument content can be readable as intended.
-   Admin mutations must be protected.
-   Never expose service-role secrets in client code.
-   Validate IDs and user ownership server-side.
-   Do not trust client-provided progress values.

------------------------------------------------------------------------

# 26. Route Structure

Possible structure:

``` text
/app
  /login
  /signup
  /museums
  /museum/[museumId]
  /scanner
  /instrument/[instrumentId]
  /play/[instrumentId]
  /create
  /quiz
  /badges
  /profile
  /about
  /admin
```

Adapt this to the existing Next.js routing structure instead of blindly
replacing it.

------------------------------------------------------------------------

# 27. Component Strategy

Potential reusable components:

``` text
MuseumCard
MuseumCarousel
CollectionCard
InstrumentCard
LockedInstrumentCard
ProgressIndicator
ScannerFrame
DetectionBox
DiscoveryReveal
InstrumentInfo
AudioPreview
PlayableInstrument
RecordButton
RecordingPlayer
CompositionTimeline
QuizQuestion
QuizProgress
BadgeCard
LoadingState
ErrorState
EmptyState
```

Do not create dozens of components for trivial one-off markup.

------------------------------------------------------------------------

# 28. Current Visual Direction

The established Museum Melody visual direction is:

-   Dark near-black background
-   Large white editorial typography
-   Small monospaced uppercase labels
-   Thin borders
-   Geometric shapes
-   Museum/art imagery
-   Warm orange/yellow accent
-   Cyan/blue secondary accent
-   Cinematic imagery
-   Subtle 3D movement
-   Minimal navigation
-   Strong visual hierarchy

The existing museum carousel uses:

> **Hovered card pops forward and scales up; other cards shrink
> slightly.**

Cards should **not** slide left/right merely because another card is
hovered.

Preserve this interaction unless I explicitly request a change.

------------------------------------------------------------------------

# 29. Data-Driven Principle

Avoid hardcoded content whenever the content belongs in the database.

Bad:

``` tsx
const museums = [
  { name: "Museum 1" },
  { name: "Museum 2" }
];
```

Prefer:

``` text
Supabase
   ↓
museums
   ↓
Next.js data layer
   ↓
MuseumCard
```

Likewise, instruments, discovery status, badges, quiz questions, and
compositions should ultimately come from persistent data.

Static mock data is acceptable temporarily during UI prototyping, but
clearly separate mock data from production data.

------------------------------------------------------------------------

# 30. Quality Requirements

Every feature should consider:

### Loading

Show an intentional loading state rather than a blank screen.

### Empty state

Explain what the user can do next.

### Error state

Explain what happened and provide a useful next action.

### Mobile

Museum visitors are primarily using phones.

Prioritize:

-   Touch targets
-   Camera access
-   Readable typography
-   Fast loading
-   Portrait layouts
-   Minimal typing

### Accessibility

Consider:

-   Semantic HTML
-   Keyboard navigation
-   Visible focus
-   Adequate contrast
-   Alt text
-   Reduced-motion support
-   Accessible button labels

### Performance

Avoid:

-   Unnecessary client components
-   Unnecessary API calls
-   Uploading every camera frame
-   Huge images
-   Unnecessary re-renders

------------------------------------------------------------------------

# 31. Testing Strategy

After each major feature:

1.  Test the normal path.
2.  Test the empty state.
3.  Test the error state.
4.  Test mobile layout.
5.  Test authentication/authorization.
6.  Test refresh/session persistence.
7.  Test duplicate actions.
8.  Test network/API failures where relevant.

For discovery specifically, test:

``` text
Correct instrument
Wrong object
No object
Low confidence
Duplicate discovery
Instrument in painting
OCR reference
CV unavailable
```

------------------------------------------------------------------------

# 32. Immediate Development Plan

The next implementation milestone is:

``` text
LOGIN                         DONE
   ↓
PROFILE                       NEXT
   ↓
MUSEUM SELECTION              NEXT
   ↓
HIDDEN COLLECTION             NEXT
   ↓
INSTRUMENT DATA
   ↓
DISCOVERY TRACKING
```

Do **not** jump directly into the CV model.

First prove that the application architecture and data flow work.

------------------------------------------------------------------------

# 33. Immediate Task Sequence

## Task 1

Inspect the existing authentication implementation.

Verify:

-   Supabase client setup
-   Auth session handling
-   Login redirect
-   Protected routes
-   User ID availability
-   Existing profile/user table

Do not recreate anything that already works.

## Task 2

Create/verify the `profiles` table and profile handling.

## Task 3

Create the `museums` table.

## Task 4

Seed the six museum records.

## Task 5

**Before implementing the major frontend design**, ask me for the Museum
Selection page design direction.

## Task 6

Build `/museums` using database-driven museum records.

## Task 7

**Before implementing the major frontend design**, ask me for the Hidden
Collection page design direction.

## Task 8

Create the `instruments` table and seed initial museum-specific
instruments.

## Task 9

Create `discoveries`.

## Task 10

Connect the Hidden Collection to real user discoveries.

## Task 11

**Before implementing the major frontend design**, ask me about the
Scanner page design.

## Task 12

Build the scanner using simulated recognition.

## Task 13

Integrate the real CV/OCR pipeline.

## Task 14

Continue through discovery → learn → hear → play → record → layer → quiz
→ badge.

------------------------------------------------------------------------

# 34. How the Coding Agent Should Behave

Think like a careful senior developer helping build an MVP, not like a
code generator.

Before changing code:

-   Inspect.
-   Understand.
-   Plan.
-   Implement the smallest correct change.
-   Test.
-   Report what changed.

When there are multiple technically valid approaches, choose the one
that is:

1.  Simple
2.  Maintainable
3.  Secure
4.  Compatible with the existing project
5.  Appropriate for an MVP

Do not introduce libraries merely because they are popular.

Do not rewrite working architecture without a reason.

Do not invent product requirements.

If the MVP does not specify something, use reasonable engineering
judgment for backend/data implementation, but **ask me when the missing
decision affects the frontend's visual design or user experience**.

------------------------------------------------------------------------

# 35. Core Product Principle

Museum Melody should not feel like:

> "A museum website with a scanner."

It should feel like:

> **"A game of discovering music hidden inside a real museum."**

Every implementation decision should preserve that core experience.

The user should continually feel:

``` text
I wonder what is hidden here.
        ↓
I found something.
        ↓
What is it?
        ↓
What does it sound like?
        ↓
I can PLAY it?
        ↓
I can RECORD it?
        ↓
I can ADD it to my song?
        ↓
What should I find next?
```

That curiosity loop is more important than adding unnecessary features.

------------------------------------------------------------------------

# 36. Source-Aligned Product Definition

Museum Melody is a Computer-Vision-powered museum exploration and
music-creation platform in which visitors discover musical instruments
hidden in physical artefacts, artworks, or textual references, then
learn about, hear, play, record, and combine those instruments while
progressing through a gamified collection.

The strongest differentiators are:

-   Physical museum exploration
-   Computer Vision discovery
-   Historical context
-   Playable heritage
-   Recording and composition
-   Gamified collection

Keep these elements central throughout development.

------------------------------------------------------------------------

# 37. Final Instruction

When I ask you to implement something:

1.  First inspect the existing project and understand what is already
    implemented.
2.  Reuse existing architecture wherever possible.
3.  Implement backend/database logic intelligently and securely.
4.  Handle edge cases rather than only the happy path.
5.  Keep the implementation within MVP scope.
6.  **If the task requires a new or significant frontend design, stop
    and ask me for the design direction/reference before implementing
    it.**
7.  If I provide a screenshot/reference, use it as the visual source of
    truth.
8.  If I explicitly tell you to decide the design yourself, then you may
    make the design decision.
9.  After implementation, test the feature and explain exactly what was
    changed.
10. Do not claim something works unless it has actually been verified.
