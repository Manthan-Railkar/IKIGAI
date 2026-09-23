-- Phase 6: User Jam Recordings & Cloud Audio Storage Schema

-- 1. Create user_recordings table
CREATE TABLE IF NOT EXISTS public.user_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Museum Jam Session',
  duration_ms INTEGER NOT NULL,
  notes_count INTEGER NOT NULL DEFAULT 0,
  audio_url TEXT NOT NULL,
  instruments TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_user_recordings_user_id ON public.user_recordings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_recordings_created_at ON public.user_recordings(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.user_recordings ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own recordings
CREATE POLICY "Users can view own recordings"
  ON public.user_recordings
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own recordings
CREATE POLICY "Users can insert own recordings"
  ON public.user_recordings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own recordings
CREATE POLICY "Users can delete own recordings"
  ON public.user_recordings
  FOR DELETE
  USING (auth.uid() = user_id);

-- 2. Configure Storage Bucket for Jam Recordings (Public read, authenticated upload)
INSERT INTO storage.buckets (id, name, public)
VALUES ('jam-recordings', 'jam-recordings', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policy: Authenticated users can upload to jam-recordings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Allow authenticated users to upload jam recordings'
  ) THEN
    CREATE POLICY "Allow authenticated users to upload jam recordings"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'jam-recordings' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;
END $$;

-- Storage Policy: Public access to listen to jam recordings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Allow public playback of jam recordings'
  ) THEN
    CREATE POLICY "Allow public playback of jam recordings"
      ON storage.objects
      FOR SELECT
      TO public
      USING (bucket_id = 'jam-recordings');
  END IF;
END $$;

-- Storage Policy: Users can delete their own stored audio files
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Allow users to delete their own jam recordings'
  ) THEN
    CREATE POLICY "Allow users to delete their own jam recordings"
      ON storage.objects
      FOR DELETE
      TO authenticated
      USING (bucket_id = 'jam-recordings' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;
END $$;
