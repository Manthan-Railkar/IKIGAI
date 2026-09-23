export interface Instrument {
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
  created_at?: string;
  interaction: "strings" | "tiles";
}

export type InstrumentCategory =
  | "Tata (String)"
  | "Avanaddha (Percussion)"
  | "Sushira (Wind)"
  | "Ghana (Idiophone)";
