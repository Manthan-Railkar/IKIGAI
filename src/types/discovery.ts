export type DiscoverySource = "physical" | "painting" | "sculpture" | "ocr";

export interface Discovery {
  id: string;
  user_id: string;
  museum_id: string;
  instrument_id: string;
  source: DiscoverySource;
  discovered_at: string;
}

export interface InstrumentWithDiscoveryStatus {
  id: string;
  museum_id: string;
  name: string;
  category: string;
  description: string;
  historical_context: string;
  image_url: string;
  audio_url: string;
  model_class: string;
  confidence_threshold: number;
  active: boolean;
  display_order?: number;
  is_discovered: boolean;
  discovered_at?: string;
  discovery_source?: DiscoverySource;
}

export interface MuseumCollectionStatus {
  museum_id: string;
  total: number;
  discovered_count: number;
  remaining_count: number;
  progress_percentage: number;
  is_complete: boolean;
  instruments: InstrumentWithDiscoveryStatus[];
}
