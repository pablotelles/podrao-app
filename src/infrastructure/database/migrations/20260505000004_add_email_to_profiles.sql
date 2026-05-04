-- Phase 1: cache email in profiles to eliminate the auth.admin.getUserById()
-- call on every profile read (SupabaseUserRepository.findById currently makes
-- two round-trips: one to profiles, one to the Supabase Auth admin API).

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Backfill from auth.users for all existing profiles.
UPDATE profiles p
SET email = u.email
FROM auth.users u
WHERE u.id = p.id;

-- Enforce NOT NULL after backfill (all profiles have a matching auth.users row
-- due to the FK profiles.id REFERENCES auth.users(id)).
ALTER TABLE profiles ALTER COLUMN email SET NOT NULL;

-- Update the handle_new_user trigger to include email on insert.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_nick  TEXT;
  final_nick TEXT;
  counter    INT := 0;
BEGIN
  base_nick  := lower(regexp_replace(split_part(NEW.email, '@', 1), '[^a-z0-9_]', '', 'g'));
  IF base_nick = '' THEN base_nick := 'user'; END IF;

  final_nick := base_nick;
  WHILE EXISTS (SELECT 1 FROM profiles WHERE nickname = final_nick) LOOP
    counter    := counter + 1;
    final_nick := base_nick || counter::TEXT;
  END LOOP;

  INSERT INTO profiles (id, nickname, email)
  VALUES (NEW.id, final_nick, NEW.email);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
