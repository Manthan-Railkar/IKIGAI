import { SupabaseClient } from "@supabase/supabase-js";
import {
  Discovery,
  DiscoverySource,
  MuseumCollectionStatus,
  InstrumentWithDiscoveryStatus,
} from "@/types/discovery";
import { getInstrumentsByMuseum } from "./instruments";

const LOCAL_DISCOVERIES_KEY = "mm_discovered_instruments_v1";

interface LocalDiscoveryRecord {
  instrument_id: string;
  museum_id: string;
  discovered_at: string;
  source: DiscoverySource;
}

/**
 * Get all discoveries stored in localStorage for guest/offline support.
 */
export function getLocalDiscoveries(museumId?: string): Discovery[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_DISCOVERIES_KEY);
    if (!raw) return [];
    const list: LocalDiscoveryRecord[] = JSON.parse(raw);
    return list
      .filter((item) => !museumId || item.museum_id === museumId || museumId === "kelkar-museum" || item.museum_id === "csmvs")
      .map((item) => ({
        id: `local-${item.instrument_id}`,
        user_id: "local-user",
        museum_id: item.museum_id,
        instrument_id: item.instrument_id,
        source: item.source,
        discovered_at: item.discovered_at,
      }));
  } catch {
    return [];
  }
}

/**
 * Save a discovery to localStorage synchronously and dispatch an update event.
 */
export function saveLocalDiscovery(
  instrumentId: string,
  museumId: string,
  source: DiscoverySource = "physical"
): Discovery {
  const now = new Date().toISOString();
  const fallbackItem: Discovery = {
    id: `local-${instrumentId}`,
    user_id: "local-user",
    museum_id: museumId,
    instrument_id: instrumentId,
    source,
    discovered_at: now,
  };

  if (typeof window === "undefined") return fallbackItem;
  try {
    const raw = localStorage.getItem(LOCAL_DISCOVERIES_KEY);
    const list: LocalDiscoveryRecord[] = raw ? JSON.parse(raw) : [];
    const existing = list.find((item) => item.instrument_id === instrumentId);
    if (!existing) {
      list.push({
        instrument_id: instrumentId,
        museum_id: museumId,
        discovered_at: now,
        source,
      });
      localStorage.setItem(LOCAL_DISCOVERIES_KEY, JSON.stringify(list));
      window.dispatchEvent(
        new CustomEvent("mm_discovery_updated", {
          detail: { instrumentId, museumId },
        })
      );
    }
  } catch (e) {
    console.warn("Failed to persist local discovery:", e);
  }
  return fallbackItem;
}

/**
 * Get the set of discovered instrument IDs from localStorage.
 */
export function getLocalDiscoveredIds(museumId?: string): Set<string> {
  const list = getLocalDiscoveries(museumId);
  return new Set(list.map((d) => d.instrument_id));
}

/**
 * Retrieves all discoveries for the currently authenticated user,
 * optionally filtered by museum ID. Also merges with localStorage discoveries.
 */
export async function getUserDiscoveries(
  supabase: SupabaseClient,
  museumId?: string
): Promise<Discovery[]> {
  const localList = getLocalDiscoveries(museumId);
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return localList;
    }

    let query = supabase
      .from("discoveries")
      .select("*")
      .eq("user_id", user.id)
      .order("discovered_at", { ascending: false });

    if (museumId) {
      query = query.eq("museum_id", museumId);
    }

    const { data, error } = await query;

    if (error || !data) {
      console.warn("Could not load user discoveries:", error?.message);
      return localList;
    }

    const merged = new Map<string, Discovery>();
    data.forEach((d) => merged.set(d.instrument_id, d as Discovery));
    localList.forEach((d) => {
      if (!merged.has(d.instrument_id)) {
        merged.set(d.instrument_id, d);
      }
    });

    return Array.from(merged.values());
  } catch (err) {
    console.warn("Exception fetching user discoveries:", err);
    return localList;
  }
}

/**
 * Record a discovery idempotently.
 * Always saves to localStorage immediately and syncs with Supabase when available.
 */
export async function recordDiscovery(
  supabase: SupabaseClient,
  params: {
    museum_id: string;
    instrument_id: string;
    source: DiscoverySource;
  }
): Promise<{ discovery: Discovery | null; was_new: boolean; error: Error | null }> {
  // Always persist to localStorage first so discoveries are never lost
  const localDisc = saveLocalDiscovery(params.instrument_id, params.museum_id, params.source);

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        discovery: localDisc,
        was_new: true,
        error: null,
      };
    }

    // Check if discovery already exists for this instrument
    const { data: existing, error: findError } = await supabase
      .from("discoveries")
      .select("*")
      .eq("user_id", user.id)
      .eq("instrument_id", params.instrument_id)
      .maybeSingle();

    if (findError) {
      console.warn("Error checking existing discovery:", findError.message);
    }

    if (existing) {
      return { discovery: existing as Discovery, was_new: false, error: null };
    }

    // Insert new discovery
    const newRecord = {
      user_id: user.id,
      museum_id: params.museum_id,
      instrument_id: params.instrument_id,
      source: params.source,
      discovered_at: new Date().toISOString(),
    };

    const { data: inserted, error: insertError } = await supabase
      .from("discoveries")
      .insert(newRecord)
      .select("*")
      .single();

    if (insertError) {
      // In case of race conditions, query one more time
      const { data: fallbackExisting } = await supabase
        .from("discoveries")
        .select("*")
        .eq("user_id", user.id)
        .eq("instrument_id", params.instrument_id)
        .maybeSingle();

      if (fallbackExisting) {
        return {
          discovery: fallbackExisting as Discovery,
          was_new: false,
          error: null,
        };
      }

      return {
        discovery: null,
        was_new: false,
        error: new Error(insertError.message),
      };
    }

    return { discovery: inserted as Discovery, was_new: true, error: null };
  } catch (err) {
    const error =
      err instanceof Error ? err : new Error("Failed to record discovery");
    return { discovery: null, was_new: false, error };
  }
}

/**
 * Calculates complete museum collection progress for the current user.
 */
export async function getMuseumCollectionStatus(
  supabase: SupabaseClient,
  museumId: string
): Promise<MuseumCollectionStatus> {
  const [instruments, discoveries] = await Promise.all([
    getInstrumentsByMuseum(supabase, museumId),
    getUserDiscoveries(supabase, museumId),
  ]);

  const discoveryMap = new Map<string, Discovery>();
  discoveries.forEach((d) => discoveryMap.set(d.instrument_id, d));

  const enrichedInstruments: InstrumentWithDiscoveryStatus[] = instruments.map(
    (inst) => {
      const discovery =
        discoveryMap.get(inst.id) ||
        (inst.model_class ? discoveryMap.get(inst.model_class) : undefined);
      return {
        ...inst,
        is_discovered: Boolean(discovery),
        discovered_at: discovery?.discovered_at,
        discovery_source: discovery?.source,
      };
    }
  );

  const total = enrichedInstruments.length;
  const discovered_count = enrichedInstruments.filter(
    (i) => i.is_discovered
  ).length;
  const remaining_count = total - discovered_count;
  const progress_percentage =
    total > 0 ? Math.round((discovered_count / total) * 100) : 0;
  const is_complete = total > 0 && discovered_count === total;

  return {
    museum_id: museumId,
    total,
    discovered_count,
    remaining_count,
    progress_percentage,
    is_complete,
    instruments: enrichedInstruments,
  };
}

/**
 * Returns the total number of unique instruments discovered by the user across all museums.
 */
export async function getUserTotalDiscoveriesCount(
  supabase: SupabaseClient
): Promise<number> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return 0;

    const { count, error } = await supabase
      .from("discoveries")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (error || count === null) return 0;
    return count;
  } catch {
    return 0;
  }
}
