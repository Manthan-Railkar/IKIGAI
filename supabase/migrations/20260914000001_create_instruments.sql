-- Phase 4: Instruments Database Schema & Seed Data

-- Create instruments table
CREATE TABLE IF NOT EXISTS public.instruments (
  id TEXT PRIMARY KEY,
  museum_id TEXT NOT NULL REFERENCES public.museums(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  historical_context TEXT NOT NULL,
  image_url TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  model_class TEXT NOT NULL,
  confidence_threshold NUMERIC DEFAULT 0.75 NOT NULL,
  active BOOLEAN DEFAULT true NOT NULL,
  display_order INTEGER DEFAULT 1 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on museum_id for speedy lookups
CREATE INDEX IF NOT EXISTS idx_instruments_museum_id ON public.instruments(museum_id);
CREATE INDEX IF NOT EXISTS idx_instruments_model_class ON public.instruments(model_class);

-- Enable Row Level Security
ALTER TABLE public.instruments ENABLE ROW LEVEL SECURITY;

-- Allow public read access to instruments
CREATE POLICY "Allow public read access on instruments"
  ON public.instruments
  FOR SELECT
  USING (true);

-- Seed Target Instruments for Pilot Museums
INSERT INTO public.instruments (
  id, museum_id, name, category, description, historical_context, image_url, audio_url, model_class, confidence_threshold, active, display_order
)
VALUES
  -- RAJA DINKAR KELKAR MUSEUM (kelkar-museum)
  (
    'mayuri-veena',
    'kelkar-museum',
    'Mayuri Veena',
    'Tata (String)',
    'An exquisite 19th-century bowed instrument sculpted in the likeness of a royal peacock, with peacock feathers and carved plumage.',
    'Prominently preserved in Maharashtra and Punjab royal courts, its peacock body symbolizes Saraswati while sympathetic strings produce an ethereal choral resonance.',
    '/Assets/hero_elem-01.png',
    '/Assets/audio_01.png',
    'mayuri_veena',
    0.75,
    true,
    1
  ),
  (
    'miraj-tanpura',
    'kelkar-museum',
    'Miraj Tanpura',
    'Tata (String)',
    'The premier acoustic drone lute carved from carefully cured gourds harvested along the Krishna River in Miraj, Maharashtra.',
    'For more than two centuries, the artisan guilds of Miraj have crafted tanpuras that provide the acoustic foundation for Indian classical maestros.',
    '/Assets/hero_elem-02.png',
    '/Assets/audio_02.png',
    'tanpura',
    0.80,
    true,
    2
  ),
  (
    'tutari',
    'kelkar-museum',
    'Tutari',
    'Sushira (Wind)',
    'A dramatic curved C-shaped brass trumpet whose piercing calls reverberate across mountain passes and fortress battlements.',
    'The revered acoustic herald of Chhatrapati Shivaji Maharaj’s Maratha empire, sounded to announce royal arrivals, auspicious ceremonies, and battle rallying.',
    '/Assets/hero_elem-03.jpg',
    '/Assets/audio_03.png',
    'tutari',
    0.80,
    true,
    3
  ),
  (
    'pakhawaj',
    'kelkar-museum',
    'Pakhawaj',
    'Avanaddha (Percussion)',
    'An ancient two-headed asymmetrical barrel drum tuned with moistened wheat-dough paste to generate thunderous low frequencies.',
    'The sacred rhythmic spine of Maharashtra’s Warkari Varkari Vithoba kirtans, Sant Dnyaneshwar chants, and temple Dhrupad traditions.',
    '/Assets/media_illustr.png',
    '/Assets/audio_01.png',
    'pakhawaj',
    0.75,
    true,
    4
  ),
  (
    'sundari',
    'kelkar-museum',
    'Sundari',
    'Sushira (Wind)',
    'A high-pitched double-reed woodwind developed in Solapur, smaller than a shehnai yet possessing exceptional melodic agility.',
    'Invented in the 1930s by master artisan Baburao Jadhav in Solapur, Maharashtra, becoming a rare gem of regional wind craft.',
    '/Assets/hero_elem-04.jpg',
    '/Assets/audio_02.png',
    'sundari',
    0.75,
    true,
    5
  ),
  (
    'tarpa',
    'kelkar-museum',
    'Tarpa',
    'Sushira (Wind)',
    'An ancient tribal horn constructed from a dried bottle gourd, bamboo pipes, and tightly wound palm leaf funnel.',
    'Sacred instrument of the Warli indigenous community in northern Maharashtra, played at harvest celebrations where villagers dance in spiral cosmic circles.',
    '/Assets/visit-illustr.png',
    '/Assets/audio_03.png',
    'tarpa',
    0.75,
    true,
    6
  ),
  (
    'ektara-tuntuna',
    'kelkar-museum',
    'Tuntuna & Ektara',
    'Tata (String)',
    'A rustic single-string rhythm-drone instrument made from a wooden or tin cylinder with a parchment membrane.',
    'Essential accompaniment for Maharashtra’s Gondhali balladeers and Shahiri Powada bards who narrate heroic legends of Maratha warriors.',
    '/Assets/audio_01.png',
    '/Assets/audio_01.png',
    'tuntuna',
    0.75,
    true,
    7
  ),
  (
    'dholki',
    'kelkar-museum',
    'Dholki',
    'Avanaddha (Percussion)',
    'A high-tension wooden folk drum with tuned iron paste (masala) on the treble skin, producing rapid sharp slaps.',
    'The electrifying pulse of Maharashtra’s Lavani folk dance and Tamasha theatre traditions across Deccan villages and historic arenas.',
    '/Assets/audio_02.png',
    '/Assets/audio_02.png',
    'dholki',
    0.80,
    true,
    8
  ),
  (
    'santoor',
    'kelkar-museum',
    'Santoor',
    'Tata (String)',
    'A trapezoidal wooden box strung with dozens of metal strings, struck using delicate curved walnut-wood mallets.',
    'Originally an ancient hundred-stringed lute (Shatatantri Veena) evolved into a celebrated acoustic instrument known for crystalline ripples of sound.',
    '/Assets/audio_03.png',
    '/Assets/audio_03.png',
    'santoor',
    0.75,
    true,
    9
  ),

  -- CSMVS MUMBAI (csmvs)
  (
    'saraswati-veena',
    'csmvs',
    'Saraswati Veena',
    'Tata (String)',
    'Classical long-necked lute with twenty-four fixed brass frets, four melodic strings, and three rhythm drone strings.',
    'Represented in ancient Indian stone sculptures from the 2nd century BCE, venerated as the embodiment of artistic wisdom.',
    '/Assets/hero_elem-01.png',
    '/Assets/audio_01.png',
    'saraswati_veena',
    0.80,
    true,
    1
  ),
  (
    'rudra-veena',
    'csmvs',
    'Rudra Veena',
    'Tata (String)',
    'The most sacred ancient Indian instrument, featuring two massive dried hollow gourds supporting a teakwood tubular dandi.',
    'Named after Lord Shiva (Rudra), this instrument requires profound meditative breath control and produces unmatched deep acoustic overtones.',
    '/Assets/hero_elem-02.png',
    '/Assets/audio_02.png',
    'rudra_veena',
    0.80,
    true,
    2
  ),
  (
    'tabla-pair',
    'csmvs',
    'Tabla & Dagga',
    'Avanaddha (Percussion)',
    'A pair of hand drums combining a tuned wooden treble drum (dayan) with a rounded copper bass kettle drum (bayan).',
    'Developed in 18th-century courtly musical dialogues, the tabla is recognized worldwide for its intricate rhythmic syllables (bols).',
    '/Assets/hero_elem-03.jpg',
    '/Assets/audio_03.png',
    'tabla',
    0.80,
    true,
    3
  ),
  (
    'bansuri',
    'csmvs',
    'Bansuri',
    'Sushira (Wind)',
    'A side-blown transverse flute handcrafted from special straight-grained hollow bamboo with six or seven finger holes.',
    'Mentioned in the Natya Shastra as one of the divine acoustic instruments, capable of creating subtle vocal-like microtonal glides (meend).',
    '/Assets/hero_elem-04.jpg',
    '/Assets/audio_01.png',
    'bansuri',
    0.75,
    true,
    4
  ),
  (
    'shehnai',
    'csmvs',
    'Shehnai',
    'Sushira (Wind)',
    'A conical wooden oboe fitted with a quadrupled reed and a flared brass bell, producing an intensely auspicious timbre.',
    'Integral to Indian weddings, dawn temple ceremonies (Mangal Vadya), and classical stages throughout Maharashtra and western India.',
    '/Assets/media_illustr.png',
    '/Assets/audio_02.png',
    'shehnai',
    0.75,
    true,
    5
  ),
  (
    'esraj',
    'csmvs',
    'Esraj',
    'Tata (String)',
    'A bowed string instrument combining the skin-covered soundbox of a sarangi with the fretted neck of a sitar.',
    'Popularized in 19th-century musical gatherings and devotional Rabindra Sangeet, known for its warm, poignant vocal resonance.',
    '/Assets/visit-illustr.png',
    '/Assets/audio_03.png',
    'esraj',
    0.75,
    true,
    6
  ),
  (
    'jaltarang',
    'csmvs',
    'Jaltarang',
    'Ghana (Idiophone)',
    'A tuned acoustic array of porcelain china bowls filled with varying depths of water and struck with slender bamboo wands.',
    'First documented in Vatsyayana’s Kama Sutra as one of the 64 classical arts, turning liquid levels into delicate melodic vibrations.',
    '/Assets/audio_01.png',
    '/Assets/audio_01.png',
    'jaltarang',
    0.75,
    true,
    7
  ),
  (
    'sarod',
    'csmvs',
    'Sarod',
    'Tata (String)',
    'A deep, waist-carved lute featuring a seamless goat-skin soundboard and a fretless polished chrome steel fingerboard.',
    'Evolved from the Central Asian Afghan rubab, celebrated for explosive acoustic attacks and continuous sliding melodic ornamentations.',
    '/Assets/audio_02.png',
    '/Assets/audio_02.png',
    'sarod',
    0.75,
    true,
    8
  ),

  -- DR. BHAU DAJI LAD MUMBAI CITY MUSEUM (bhau-daji-lad)
  (
    'dilruba',
    'bhau-daji-lad',
    'Dilruba',
    'Tata (String)',
    'Literally translating to "Heart-Stealer", a bowed instrument popular in 19th-century Bombay with sympathetic resonant steel strings.',
    'Favored in urban Bombay salons and Sikh devotional kirtan, providing lush bowed accompaniment to classical vocalists.',
    '/Assets/hero_elem-01.png',
    '/Assets/audio_01.png',
    'dilruba',
    0.75,
    true,
    1
  ),
  (
    'pungi-been',
    'bhau-daji-lad',
    'Pungi (Been)',
    'Sushira (Wind)',
    'A wind instrument fashioned from a dried bottle gourd fitted with twin natural reed pipes (one melodic, one drone).',
    'A hallmark of itinerant folk musicians and historic street performances in colonial Bombay and rural Maharashtra.',
    '/Assets/hero_elem-02.png',
    '/Assets/audio_02.png',
    'pungi',
    0.75,
    true,
    2
  ),
  (
    'morchang',
    'bhau-daji-lad',
    'Morchang',
    'Ghana (Idiophone)',
    'A forged wrought-iron jaw harp held between the teeth, using the player’s mouth cavity as a resonant acoustic chamber.',
    'Found across Maharashtra, Rajasthan, and South India, creating rhythmic percussive chirps, galloping beats, and nasal harmonics.',
    '/Assets/hero_elem-03.jpg',
    '/Assets/audio_03.png',
    'morchang',
    0.75,
    true,
    3
  ),
  (
    'swarmandal',
    'bhau-daji-lad',
    'Swarmandal',
    'Tata (String)',
    'A plucked acoustic box harp or zither strung with thirty to forty steel strings, kept in the lap of vocal performers.',
    'Creates glissando cascades of resonant notes that envelop the singer in harmonic warmth during classical recitals.',
    '/Assets/hero_elem-04.jpg',
    '/Assets/audio_01.png',
    'swarmandal',
    0.75,
    true,
    4
  ),
  (
    'chimta',
    'bhau-daji-lad',
    'Chimta',
    'Ghana (Idiophone)',
    'A large two-pronged steel tong adorned with jangling brass discs that ring out when struck against the musician’s palm.',
    'Historically played by travelling minstrels, folk storytellers, and sufi kirtankars across western and northern India.',
    '/Assets/media_illustr.png',
    '/Assets/audio_02.png',
    'chimta',
    0.75,
    true,
    5
  ),
  (
    'khanjira',
    'bhau-daji-lad',
    'Khanjira',
    'Avanaddha (Percussion)',
    'A compact circular wooden frame drum covered with monitor lizard skin and equipped with a pair of slotted brass jingles.',
    'Renowned for its bendable bass tones produced by moistening the inner skin with water droplets during performance.',
    '/Assets/visit-illustr.png',
    '/Assets/audio_03.png',
    'khanjira',
    0.75,
    true,
    6
  ),
  (
    'taal-manjira',
    'bhau-daji-lad',
    'Taal (Manjira)',
    'Ghana (Idiophone)',
    'A pair of thick, bell-metal alloy hand cymbals connected by a cotton cord that produce a pristine, ringing chime.',
    'The sacred rhythmic heartbeat of Warkari pilgrims walking the annual Pandharpur Palkhi procession across Maharashtra.',
    '/Assets/audio_01.png',
    '/Assets/audio_01.png',
    'manjira',
    0.75,
    true,
    7
  ),
  (
    'surshringar',
    'bhau-daji-lad',
    'Surshringar',
    'Tata (String)',
    'A deep-toned bass acoustic lute combining elements of the veena and sarod, with a wooden resonator and metal fingerplate.',
    'Pioneered in the 19th century by Ustad Jafar Khan to perform deep Dhrupad alap movements before being succeeded by the modern sarod.',
    '/Assets/audio_02.png',
    '/Assets/audio_02.png',
    'surshringar',
    0.75,
    true,
    8
  )
ON CONFLICT (id) DO UPDATE SET
  museum_id = EXCLUDED.museum_id,
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  historical_context = EXCLUDED.historical_context,
  image_url = EXCLUDED.image_url,
  audio_url = EXCLUDED.audio_url,
  model_class = EXCLUDED.model_class,
  confidence_threshold = EXCLUDED.confidence_threshold,
  active = EXCLUDED.active,
  display_order = EXCLUDED.display_order;
