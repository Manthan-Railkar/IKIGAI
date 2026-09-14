export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdateInput {
  full_name?: string;
  avatar_url?: string;
}
