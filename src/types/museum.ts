export interface Museum {
  id: string;
  name: string;
  city: string;
  description: string;
  category: string;
  image_url: string;
  active: boolean;
  display_order: number;
  created_at?: string;
  is_pilot?: boolean;
}
