import { SupabaseClient } from "@supabase/supabase-js";
import { Museum } from "@/types/museum";

export const CANONICAL_MUSEUMS: Museum[] = [
  {
    id: "csmvs",
    name: "Chhatrapati Shivaji Maharaj Vastu Sangrahalaya",
    city: "Mumbai",
    description:
      "One of India’s premier art and cultural history institutions featuring rare musical instruments, Mughal miniature paintings, and centuries-old sculptural relics.",
    category: "Art & Cultural History",
    image_url: "/Assets/csmvs_mumbai.png",
    active: true,
    display_order: 1,
    is_pilot: true,
  },
  {
    id: "kelkar-museum",
    name: "Raja Dinkar Kelkar Museum",
    city: "Pune",
    description:
      "World-renowned collection containing historical Indian musical instruments, including the legendary peacock-shaped Mayuri veena, stringed tanpuras, and historical folk instruments.",
    category: "Heritage & Musical Artefacts",
    image_url: "/Assets/kelkar_museum_pune.png",
    active: true,
    display_order: 2,
    is_pilot: true,
  },
  {
    id: "bhau-daji-lad",
    name: "Dr. Bhau Daji Lad Mumbai City Museum",
    city: "Mumbai",
    description:
      "Mumbai’s oldest museum showcasing Victorian architecture, decorative arts, early industrial heritage, and 19th-century cultural artefacts.",
    category: "Decorative Arts & City Heritage",
    image_url: "/Assets/bhau_daji_lad_mumbai.jpg",
    active: true,
    display_order: 3,
    is_pilot: true,
  },
  {
    id: "nagpur-central",
    name: "Nagpur Central Museum",
    city: "Nagpur",
    description:
      "One of the oldest museums in Maharashtra preserving prehistoric antiquities, ancient coins, tribal crafts, and archaeological musical relics.",
    category: "Archaeology & Antiquities",
    image_url: "/Assets/nagpur_central_museum.jpg",
    active: true,
    display_order: 4,
    is_pilot: false,
  },
  {
    id: "mahatma-phule",
    name: "Mahatma Phule Museum",
    city: "Pune",
    description:
      "Dedicated to industry, agriculture, and handicrafts with an archival collection of regional craft tools, folk instruments, and historical textiles.",
    category: "Crafts & Social Heritage",
    image_url: "/Assets/mahatma_phule_museum.jpg",
    active: true,
    display_order: 5,
    is_pilot: false,
  },
  {
    id: "aga-khan-palace",
    name: "Aga Khan Palace Museum",
    city: "Pune",
    description:
      "Historic monument of national importance commemorating India’s freedom struggle with personal artefacts, archival photographs, and memorial exhibits.",
    category: "National Memorial & Modern History",
    image_url: "/Assets/aga_khan_palace_museum.jpg",
    active: true,
    display_order: 6,
    is_pilot: false,
  },
];

/**
 * Fetches all active museums ordered by display_order.
 * Gracefully falls back to canonical data if the museums table hasn't been migrated yet.
 */
export async function getMuseums(supabase: SupabaseClient): Promise<Museum[]> {
  try {
    const { data, error } = await supabase
      .from("museums")
      .select("*")
      .eq("active", true)
      .order("display_order", { ascending: true });

    if (error || !data || data.length === 0) {
      if (error) {
        console.warn(
          "Notice: Could not load museums from Supabase table, falling back to canonical seed list:",
          error.message
        );
      }
      return CANONICAL_MUSEUMS;
    }

    return data.map((m) => ({
      ...m,
      is_pilot: m.display_order <= 3,
    })) as Museum[];
  } catch (err) {
    console.warn("Exception loading museums from Supabase:", err);
    return CANONICAL_MUSEUMS;
  }
}

/**
 * Retrieves a single museum by its unique ID.
 */
export async function getMuseumById(
  supabase: SupabaseClient,
  id: string
): Promise<Museum | null> {
  try {
    const { data, error } = await supabase
      .from("museums")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      const fallback = CANONICAL_MUSEUMS.find((m) => m.id === id);
      return fallback || null;
    }

    return {
      ...data,
      is_pilot: data.display_order <= 3,
    } as Museum;
  } catch {
    const fallback = CANONICAL_MUSEUMS.find((m) => m.id === id);
    return fallback || null;
  }
}
