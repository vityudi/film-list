-- Create shared_lists table for sharing favorites
CREATE TABLE IF NOT EXISTS public.shared_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  share_token VARCHAR(16) UNIQUE NOT NULL,
  favorites_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT share_token_not_empty CHECK (char_length(share_token) > 0)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_shared_lists_token ON public.shared_lists(share_token);
CREATE INDEX IF NOT EXISTS idx_shared_lists_user_id ON public.shared_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_shared_lists_created_at ON public.shared_lists(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.shared_lists ENABLE ROW LEVEL SECURITY;

-- Create policies for shared_lists table
-- Anyone can view shared lists by token (public access)
CREATE POLICY "Anyone can view shared lists by token"
  ON public.shared_lists FOR SELECT
  USING (true);

-- Only the owner can create their own shared lists
CREATE POLICY "Users can create their own shared lists"
  ON public.shared_lists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only the owner can delete their own shared lists
CREATE POLICY "Users can delete their own shared lists"
  ON public.shared_lists FOR DELETE
  USING (auth.uid() = user_id);

-- Only the owner can update their own shared lists
CREATE POLICY "Users can update their own shared lists"
  ON public.shared_lists FOR UPDATE
  USING (auth.uid() = user_id);
