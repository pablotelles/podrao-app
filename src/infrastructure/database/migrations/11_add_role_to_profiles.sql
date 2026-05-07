-- KAN-6: Add role column to profiles
-- Valid values: 'user' (default) | 'admin'
-- First admin must be promoted manually in Supabase Studio:
--   UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
  CHECK (role IN ('user', 'admin'));
