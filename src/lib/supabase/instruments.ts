import { SupabaseClient } from "@supabase/supabase-js";
import { Instrument } from "@/types/instrument";

export const CANONICAL_INSTRUMENTS: Instrument[] = [
  // RAJA DINKAR KELKAR MUSEUM (kelkar-museum)
  {
    id: "mayuri-veena",
    museum_id: "kelkar-museum",
    name: "Mayuri Veena",
    category: "Tata (String)",
    description:
      "An exquisite 19th-century bowed instrument sculpted in the likeness of a royal peacock, with peacock feathers and carved plumage.",
    historical_context:
      "Prominently preserved in Maharashtra and Punjab royal courts, its peacock body symbolizes Saraswati while sympathetic strings produce an ethereal choral resonance.",
    image_url: "/Assets/hero_elem-01.png",
    audio_url: "/Assets/audio_01.png",
    model_class: "mayuri_veena",
    confidence_threshold: 0.75,
    active: true,
    display_order: 1,
    interaction: "strings",
  },
  {
    id: "miraj-tanpura",
    museum_id: "kelkar-museum",
    name: "Miraj Tanpura",
    category: "Tata (String)",
    description:
      "The premier acoustic drone lute carved from carefully cured gourds harvested along the Krishna River in Miraj, Maharashtra.",
    historical_context:
      "For more than two centuries, the artisan guilds of Miraj have crafted tanpuras that provide the acoustic foundation for Indian classical maestros.",
    image_url: "/Assets/hero_elem-02.png",
    audio_url: "/Assets/audio_02.png",
    model_class: "tanpura",
    confidence_threshold: 0.8,
    active: true,
    display_order: 2,
    interaction: "strings",
  },
  {
    id: "tutari",
    museum_id: "kelkar-museum",
    name: "Tutari",
    category: "Sushira (Wind)",
    description:
      "A dramatic curved C-shaped brass trumpet whose piercing calls reverberate across mountain passes and fortress battlements.",
    historical_context:
      "The revered acoustic herald of Chhatrapati Shivaji Maharaj’s Maratha empire, sounded to announce royal arrivals, auspicious ceremonies, and battle rallying.",
    image_url: "/Assets/hero_elem-03.jpg",
    audio_url: "/Assets/audio_03.png",
    model_class: "tutari",
    confidence_threshold: 0.8,
    active: true,
    display_order: 3,
    interaction: "tiles",
  },
  {
    id: "pakhawaj",
    museum_id: "kelkar-museum",
    name: "Pakhawaj",
    category: "Avanaddha (Percussion)",
    description:
      "An ancient two-headed asymmetrical barrel drum tuned with moistened wheat-dough paste to generate thunderous low frequencies.",
    historical_context:
      "The sacred rhythmic spine of Maharashtra’s Warkari Vithoba kirtans, Sant Dnyaneshwar chants, and temple Dhrupad traditions.",
    image_url: "/Assets/media_illustr.png",
    audio_url: "/Assets/audio_01.png",
    model_class: "pakhawaj",
    confidence_threshold: 0.75,
    active: true,
    display_order: 4,
    interaction: "tiles",
  },
  {
    id: "sundari",
    museum_id: "kelkar-museum",
    name: "Sundari",
    category: "Sushira (Wind)",
    description:
      "A high-pitched double-reed woodwind developed in Solapur, smaller than a shehnai yet possessing exceptional melodic agility.",
    historical_context:
      "Invented in the 1930s by master artisan Baburao Jadhav in Solapur, Maharashtra, becoming a rare gem of regional wind craft.",
    image_url: "/Assets/hero_elem-04.jpg",
    audio_url: "/Assets/audio_02.png",
    model_class: "sundari",
    confidence_threshold: 0.75,
    active: true,
    display_order: 5,
    interaction: "tiles",
  },
  {
    id: "tarpa",
    museum_id: "kelkar-museum",
    name: "Tarpa",
    category: "Sushira (Wind)",
    description:
      "An ancient tribal horn constructed from a dried bottle gourd, bamboo pipes, and tightly wound palm leaf funnel.",
    historical_context:
      "Sacred instrument of the Warli indigenous community in northern Maharashtra, played at harvest celebrations where villagers dance in spiral cosmic circles.",
    image_url: "/Assets/visit-illustr.png",
    audio_url: "/Assets/audio_03.png",
    model_class: "tarpa",
    confidence_threshold: 0.75,
    active: true,
    display_order: 6,
    interaction: "tiles",
  },
  {
    id: "ektara-tuntuna",
    museum_id: "kelkar-museum",
    name: "Tuntuna & Ektara",
    category: "Tata (String)",
    description:
      "A rustic single-string rhythm-drone instrument made from a wooden or tin cylinder with a parchment membrane.",
    historical_context:
      "Essential accompaniment for Maharashtra’s Gondhali balladeers and Shahiri Powada bards who narrate heroic legends of Maratha warriors.",
    image_url: "/Assets/audio_01.png",
    audio_url: "/Assets/audio_01.png",
    model_class: "tuntuna",
    confidence_threshold: 0.75,
    active: true,
    display_order: 7,
    interaction: "strings",
  },
  {
    id: "dholki",
    museum_id: "kelkar-museum",
    name: "Dholki",
    category: "Avanaddha (Percussion)",
    description:
      "A high-tension wooden folk drum with tuned iron paste (masala) on the treble skin, producing rapid sharp slaps.",
    historical_context:
      "The electrifying pulse of Maharashtra’s Lavani folk dance and Tamasha theatre traditions across Deccan villages and historic arenas.",
    image_url: "/Assets/audio_02.png",
    audio_url: "/Assets/audio_02.png",
    model_class: "dholki",
    confidence_threshold: 0.8,
    active: true,
    display_order: 8,
    interaction: "tiles",
  },
  {
    id: "santoor",
    museum_id: "kelkar-museum",
    name: "Santoor",
    category: "Tata (String)",
    description:
      "A trapezoidal wooden box strung with dozens of metal strings, struck using delicate curved walnut-wood mallets.",
    historical_context:
      "Originally an ancient hundred-stringed lute (Shatatantri Veena) evolved into a celebrated acoustic instrument known for crystalline ripples of sound.",
    image_url: "/Assets/audio_03.png",
    audio_url: "/Assets/audio_03.png",
    model_class: "santoor",
    confidence_threshold: 0.75,
    active: true,
    display_order: 9,
    interaction: "tiles",
  },

  // CSMVS MUMBAI (csmvs) — 10 instruments matching the YOLO detection model
  {
    id: "tabla",
    museum_id: "csmvs",
    name: "Tabla",
    category: "Avanaddha (Percussion)",
    description:
      "A pair of hand drums combining a tuned wooden treble drum (dayan) with a rounded copper bass kettle drum (bayan).",
    historical_context:
      "Developed in 18th-century courtly musical dialogues, the tabla is recognized worldwide for its intricate rhythmic syllables (bols).",
    image_url: "/Assets/hero_elem-03.jpg",
    audio_url: "/Assets/audio_03.png",
    model_class: "tabla",
    confidence_threshold: 0.75,
    active: true,
    display_order: 1,
    interaction: "tiles",
  },
  {
    id: "sitar",
    museum_id: "csmvs",
    name: "Sitar",
    category: "Tata (String)",
    description:
      "A long-necked plucked lute with a gourd resonator, movable curved brass frets, and thirteen sympathetic strings that shimmer with every note.",
    historical_context:
      "Popularized globally by Pandit Ravi Shankar, the sitar evolved from the Persian setar and became the quintessential voice of Hindustani classical music.",
    image_url: "/Assets/hero_elem-01.png",
    audio_url: "/Assets/audio_01.png",
    model_class: "sitar",
    confidence_threshold: 0.75,
    active: true,
    display_order: 2,
    interaction: "strings",
  },
  {
    id: "tanpura",
    museum_id: "csmvs",
    name: "Tanpura",
    category: "Tata (String)",
    description:
      "The premier acoustic drone lute with four or five metal strings tuned to the tonic and fifth, providing the harmonic foundation for all classical performance.",
    historical_context:
      "For centuries the tanpura has been the indispensable acoustic canvas upon which every raga unfolds, its continuous drone enveloping musicians and audiences alike.",
    image_url: "/Assets/hero_elem-02.png",
    audio_url: "/Assets/audio_02.png",
    model_class: "tanpura",
    confidence_threshold: 0.75,
    active: true,
    display_order: 3,
    interaction: "strings",
  },
  {
    id: "sarangi",
    museum_id: "csmvs",
    name: "Sarangi",
    category: "Tata (String)",
    description:
      "A short-necked bowed instrument carved from a single block of tun wood, with a goat-skin soundboard and up to forty sympathetic strings.",
    historical_context:
      "Known as the instrument closest to the human voice, the sarangi was the principal accompaniment for vocal classical music and Kathak dance in Mughal courts.",
    image_url: "/Assets/hero_elem-04.jpg",
    audio_url: "/Assets/audio_01.png",
    model_class: "sarangi",
    confidence_threshold: 0.75,
    active: true,
    display_order: 4,
    interaction: "strings",
  },
  {
    id: "bansuri",
    museum_id: "csmvs",
    name: "Bansuri",
    category: "Sushira (Wind)",
    description:
      "A side-blown transverse flute handcrafted from special straight-grained hollow bamboo with six or seven finger holes.",
    historical_context:
      "Mentioned in the Natya Shastra as one of the divine acoustic instruments, capable of creating subtle vocal-like microtonal glides (meend).",
    image_url: "/Assets/media_illustr.png",
    audio_url: "/Assets/audio_02.png",
    model_class: "bansuri",
    confidence_threshold: 0.75,
    active: true,
    display_order: 5,
    interaction: "tiles",
  },
  {
    id: "shehnai",
    museum_id: "csmvs",
    name: "Shehnai",
    category: "Sushira (Wind)",
    description:
      "A conical wooden oboe fitted with a quadrupled reed and a flared brass bell, producing an intensely auspicious timbre.",
    historical_context:
      "Integral to Indian weddings, dawn temple ceremonies (Mangal Vadya), and classical stages throughout Maharashtra and western India.",
    image_url: "/Assets/visit-illustr.png",
    audio_url: "/Assets/audio_03.png",
    model_class: "shehnai",
    confidence_threshold: 0.75,
    active: true,
    display_order: 6,
    interaction: "tiles",
  },
  {
    id: "pakhawaj",
    museum_id: "csmvs",
    name: "Pakhawaj",
    category: "Avanaddha (Percussion)",
    description:
      "An ancient two-headed asymmetrical barrel drum tuned with moistened wheat-dough paste to generate thunderous low frequencies.",
    historical_context:
      "The sacred rhythmic spine of Dhrupad traditions and temple kirtans, played horizontally across the lap with both palms.",
    image_url: "/Assets/audio_01.png",
    audio_url: "/Assets/audio_01.png",
    model_class: "pakhawaj",
    confidence_threshold: 0.75,
    active: true,
    display_order: 7,
    interaction: "tiles",
  },
  {
    id: "harmonium",
    museum_id: "csmvs",
    name: "Harmonium",
    category: "Sushira (Wind)",
    description:
      "A portable keyboard reed organ with hand-pumped bellows, producing sustained notes through tuned brass reeds activated by finger keys.",
    historical_context:
      "Introduced to India in the 19th century, the harmonium was adapted into a floor-seated instrument and became central to bhajan, qawwali, and light classical music.",
    image_url: "/Assets/audio_02.png",
    audio_url: "/Assets/audio_02.png",
    model_class: "harmonium",
    confidence_threshold: 0.75,
    active: true,
    display_order: 8,
    interaction: "tiles",
  },
  {
    id: "santoor",
    museum_id: "csmvs",
    name: "Santoor",
    category: "Tata (String)",
    description:
      "A trapezoidal wooden box strung with dozens of metal strings, struck using delicate curved walnut-wood mallets.",
    historical_context:
      "Originally an ancient hundred-stringed lute (Shatatantri Veena) evolved into a celebrated acoustic instrument known for crystalline ripples of sound.",
    image_url: "/Assets/audio_03.png",
    audio_url: "/Assets/audio_03.png",
    model_class: "santoor",
    confidence_threshold: 0.75,
    active: true,
    display_order: 9,
    interaction: "tiles",
  },
  {
    id: "sarod",
    museum_id: "csmvs",
    name: "Sarod",
    category: "Tata (String)",
    description:
      "A deep, waist-carved lute featuring a seamless goat-skin soundboard and a fretless polished chrome steel fingerboard.",
    historical_context:
      "Evolved from the Central Asian Afghan rubab, celebrated for explosive acoustic attacks and continuous sliding melodic ornamentations.",
    image_url: "/Assets/hero_elem-01.png",
    audio_url: "/Assets/audio_01.png",
    model_class: "sarod",
    confidence_threshold: 0.75,
    active: true,
    display_order: 10,
    interaction: "strings",
  },

  // DR. BHAU DAJI LAD MUMBAI CITY MUSEUM (bhau-daji-lad)
  {
    id: "dilruba",
    museum_id: "bhau-daji-lad",
    name: "Dilruba",
    category: "Tata (String)",
    description:
      'Literally translating to "Heart-Stealer", a bowed instrument popular in 19th-century Bombay with sympathetic resonant steel strings.',
    historical_context:
      "Favored in urban Bombay salons and Sikh devotional kirtan, providing lush bowed accompaniment to classical vocalists.",
    image_url: "/Assets/hero_elem-01.png",
    audio_url: "/Assets/audio_01.png",
    model_class: "dilruba",
    confidence_threshold: 0.75,
    active: true,
    display_order: 1,
    interaction: "strings",
  },
  {
    id: "pungi-been",
    museum_id: "bhau-daji-lad",
    name: "Pungi (Been)",
    category: "Sushira (Wind)",
    description:
      "A wind instrument fashioned from a dried bottle gourd fitted with twin natural reed pipes (one melodic, one drone).",
    historical_context:
      "A hallmark of itinerant folk musicians and historic street performances in colonial Bombay and rural Maharashtra.",
    image_url: "/Assets/hero_elem-02.png",
    audio_url: "/Assets/audio_02.png",
    model_class: "pungi",
    confidence_threshold: 0.75,
    active: true,
    display_order: 2,
    interaction: "tiles",
  },
  {
    id: "morchang",
    museum_id: "bhau-daji-lad",
    name: "Morchang",
    category: "Ghana (Idiophone)",
    description:
      "A forged wrought-iron jaw harp held between the teeth, using the player’s mouth cavity as a resonant acoustic chamber.",
    historical_context:
      "Found across Maharashtra, Rajasthan, and South India, creating rhythmic percussive chirps, galloping beats, and nasal harmonics.",
    image_url: "/Assets/hero_elem-03.jpg",
    audio_url: "/Assets/audio_03.png",
    model_class: "morchang",
    confidence_threshold: 0.75,
    active: true,
    display_order: 3,
    interaction: "tiles",
  },
  {
    id: "swarmandal",
    museum_id: "bhau-daji-lad",
    name: "Swarmandal",
    category: "Tata (String)",
    description:
      "A plucked acoustic box harp or zither strung with thirty to forty steel strings, kept in the lap of vocal performers.",
    historical_context:
      "Creates glissando cascades of resonant notes that envelop the singer in harmonic warmth during classical recitals.",
    image_url: "/Assets/hero_elem-04.jpg",
    audio_url: "/Assets/audio_01.png",
    model_class: "swarmandal",
    confidence_threshold: 0.75,
    active: true,
    display_order: 4,
    interaction: "strings",
  },
  {
    id: "chimta",
    museum_id: "bhau-daji-lad",
    name: "Chimta",
    category: "Ghana (Idiophone)",
    description:
      "A large two-pronged steel tong adorned with jangling brass discs that ring out when struck against the musician’s palm.",
    historical_context:
      "Historically played by travelling minstrels, folk storytellers, and sufi kirtankars across western and northern India.",
    image_url: "/Assets/media_illustr.png",
    audio_url: "/Assets/audio_02.png",
    model_class: "chimta",
    confidence_threshold: 0.75,
    active: true,
    display_order: 5,
    interaction: "tiles",
  },
  {
    id: "khanjira",
    museum_id: "bhau-daji-lad",
    name: "Khanjira",
    category: "Avanaddha (Percussion)",
    description:
      "A compact circular wooden frame drum covered with monitor lizard skin and equipped with a pair of slotted brass jingles.",
    historical_context:
      "Renowned for its bendable bass tones produced by moistening the inner skin with water droplets during performance.",
    image_url: "/Assets/visit-illustr.png",
    audio_url: "/Assets/audio_03.png",
    model_class: "khanjira",
    confidence_threshold: 0.75,
    active: true,
    display_order: 6,
    interaction: "tiles",
  },
  {
    id: "taal-manjira",
    museum_id: "bhau-daji-lad",
    name: "Taal (Manjira)",
    category: "Ghana (Idiophone)",
    description:
      "A pair of thick, bell-metal alloy hand cymbals connected by a cotton cord that produce a pristine, ringing chime.",
    historical_context:
      "The sacred rhythmic heartbeat of Warkari pilgrims walking the annual Pandharpur Palkhi procession across Maharashtra.",
    image_url: "/Assets/audio_01.png",
    audio_url: "/Assets/audio_01.png",
    model_class: "manjira",
    confidence_threshold: 0.75,
    active: true,
    display_order: 7,
    interaction: "tiles",
  },
  {
    id: "surshringar",
    museum_id: "bhau-daji-lad",
    name: "Surshringar",
    category: "Tata (String)",
    description:
      "A deep-toned bass acoustic lute combining elements of the veena and sarod, with a wooden resonator and metal fingerplate.",
    historical_context:
      "Pioneered in the 19th century by Ustad Jafar Khan to perform deep Dhrupad alap movements before being succeeded by the modern sarod.",
    image_url: "/Assets/audio_02.png",
    audio_url: "/Assets/audio_02.png",
    model_class: "surshringar",
    confidence_threshold: 0.75,
    active: true,
    display_order: 8,
    interaction: "strings",
  },
];

/**
 * Retrieves all active instruments for a given museum ID.
 * Falls back to canonical data if the database table is not yet migrated.
 */
export async function getInstrumentsByMuseum(
  supabase: SupabaseClient,
  museumId: string
): Promise<Instrument[]> {
  try {
    const { data, error } = await supabase
      .from("instruments")
      .select("*")
      .eq("museum_id", museumId)
      .eq("active", true)
      .order("display_order", { ascending: true });

    if (error || !data || data.length === 0) {
      if (error) {
        console.warn(
          `Notice: Could not load instruments from Supabase for museum ${museumId}, using canonical seed:`,
          error.message
        );
      }
      return CANONICAL_INSTRUMENTS.filter(
        (inst) => inst.museum_id === museumId && inst.active
      );
    }

    return (data as Instrument[]).map(inst => ({ ...inst, interaction: inst.interaction || (inst.category?.includes("String") ? "strings" : "tiles") }));
  } catch (err) {
    console.warn("Exception loading instruments:", err);
    return CANONICAL_INSTRUMENTS.filter(
      (inst) => inst.museum_id === museumId && inst.active
    );
  }
}

/**
 * Retrieves a single instrument by its ID.
 */
export async function getInstrumentById(
  supabase: SupabaseClient,
  instrumentId: string
): Promise<Instrument | null> {
  try {
    const { data, error } = await supabase
      .from("instruments")
      .select("*")
      .eq("id", instrumentId)
      .maybeSingle();

    if (error || !data) {
      const fallback = CANONICAL_INSTRUMENTS.find(
        (inst) => inst.id === instrumentId
      );
      return fallback || null;
    }

    const inst = data as Instrument; return { ...inst, interaction: inst.interaction || (inst.category?.includes("String") ? "strings" : "tiles") };
  } catch {
    const fallback = CANONICAL_INSTRUMENTS.find(
      (inst) => inst.id === instrumentId
    );
    return fallback || null;
  }
}

/**
 * Retrieves all active instruments across all museums.
 */
export async function getAllInstruments(
  supabase: SupabaseClient
): Promise<Instrument[]> {
  try {
    const { data, error } = await supabase
      .from("instruments")
      .select("*")
      .eq("active", true)
      .order("display_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return CANONICAL_INSTRUMENTS.filter((inst) => inst.active);
    }

    return data as Instrument[];
  } catch {
    return CANONICAL_INSTRUMENTS.filter((inst) => inst.active);
  }
}
