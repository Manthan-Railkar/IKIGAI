-- Phase 2: Museums Table and Initial Seed Migration
-- Create the museums table
CREATE TABLE IF NOT EXISTS public.museums (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  active BOOLEAN DEFAULT true NOT NULL,
  display_order INTEGER DEFAULT 1 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.museums ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all active museum records
CREATE POLICY "Allow public read access on museums"
  ON public.museums
  FOR SELECT
  USING (true);

-- Seed initial 6 Maharashtra museums (First 3 are MVP Pilot Museums)
INSERT INTO public.museums (id, name, city, description, category, image_url, active, display_order)
VALUES
  (
    'csmvs',
    'Chhatrapati Shivaji Maharaj Vastu Sangrahalaya',
    'Mumbai',
    'One of India’s premier art and cultural history institutions featuring rare musical instruments, Mughal miniature paintings, and centuries-old sculptural relics.',
    'Art & Cultural History',
    '/Assets/csmvs_mumbai.png',
    true,
    1
  ),
  (
    'kelkar-museum',
    'Raja Dinkar Kelkar Museum',
    'Pune',
    'World-renowned collection containing historical Indian musical instruments, including the legendary peacock-shaped Mayuri veena, stringed tanpuras, and historical folk instruments.',
    'Heritage & Musical Artefacts',
    '/Assets/kelkar_museum_pune.png',
    true,
    2
  ),
  (
    'bhau-daji-lad',
    'Dr. Bhau Daji Lad Mumbai City Museum',
    'Mumbai',
    'Mumbai’s oldest museum showcasing Victorian architecture, decorative arts, early industrial heritage, and 19th-century cultural artefacts.',
    'Decorative Arts & City Heritage',
    '/Assets/bhau_daji_lad_mumbai.jpg',
    true,
    3
  ),
  (
    'nagpur-central',
    'Nagpur Central Museum',
    'Nagpur',
    'One of the oldest museums in Maharashtra preserving prehistoric antiquities, ancient coins, tribal crafts, and archaeological musical relics.',
    'Archaeology & Antiquities',
    '/Assets/nagpur_central_museum.jpg',
    true,
    4
  ),
  (
    'mahatma-phule',
    'Mahatma Phule Museum',
    'Pune',
    'Dedicated to industry, agriculture, and handicrafts with an archival collection of regional craft tools, folk instruments, and historical textiles.',
    'Crafts & Social Heritage',
    '/Assets/mahatma_phule_museum.jpg',
    true,
    5
  ),
  (
    'aga-khan-palace',
    'Aga Khan Palace Museum',
    'Pune',
    'Historic monument of national importance commemorating India’s freedom struggle with personal artefacts, archival photographs, and memorial exhibits.',
    'National Memorial & Modern History',
    '/Assets/aga_khan_palace_museum.jpg',
    true,
    6
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  city = EXCLUDED.city,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  image_url = EXCLUDED.image_url,
  active = EXCLUDED.active,
  display_order = EXCLUDED.display_order;
