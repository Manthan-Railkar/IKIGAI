-- Phase 5: Discovery Tracking Schema

-- Create discoveries table
CREATE TABLE IF NOT EXISTS public.discoveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  museum_id TEXT NOT NULL REFERENCES public.museums(id) ON DELETE CASCADE,
  instrument_id TEXT NOT NULL REFERENCES public.instruments(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('physical', 'painting', 'sculpture', 'ocr')),
  discovered_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_user_instrument UNIQUE (user_id, instrument_id)
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_discoveries_user_id ON public.discoveries(user_id);
CREATE INDEX IF NOT EXISTS idx_discoveries_museum_id ON public.discoveries(museum_id);
CREATE INDEX IF NOT EXISTS idx_discoveries_instrument_id ON public.discoveries(instrument_id);
CREATE INDEX IF NOT EXISTS idx_discoveries_user_museum ON public.discoveries(user_id, museum_id);

-- Enable Row Level Security
ALTER TABLE public.discoveries ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view only their own discoveries
CREATE POLICY "Users can view own discoveries"
  ON public.discoveries
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own discoveries
CREATE POLICY "Users can insert own discoveries"
  ON public.discoveries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own discoveries (e.g. updating source)
CREATE POLICY "Users can update own discoveries"
  ON public.discoveries
  FOR UPDATE
  USING (auth.uid() = user_id);
