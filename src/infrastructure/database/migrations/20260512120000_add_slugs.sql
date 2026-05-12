-- Migration 09: Add slug columns to places and lists, enable text search indexes
-- KAN-55 — SEO, slugs e busca por texto

-- ─── Extensions ──────────────────────────────────────────────────────────────

-- Trigram extension for GIN-based ilike text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Unaccent for accent-stripping in slug generation (backfill only)
CREATE EXTENSION IF NOT EXISTS unaccent;

-- ─── places.slug ─────────────────────────────────────────────────────────────

ALTER TABLE places ADD COLUMN IF NOT EXISTS slug TEXT;

-- Partial unique index: null slugs (rejected/draft places) are allowed to repeat
CREATE UNIQUE INDEX IF NOT EXISTS idx_places_slug
  ON places (slug)
  WHERE slug IS NOT NULL;

-- ─── lists.slug ──────────────────────────────────────────────────────────────

ALTER TABLE lists ADD COLUMN IF NOT EXISTS slug TEXT;

-- Partial unique index: null slugs (private lists) are allowed to repeat
CREATE UNIQUE INDEX IF NOT EXISTS idx_lists_slug
  ON lists (slug)
  WHERE slug IS NOT NULL;

-- ─── GIN trigram indexes for text search ─────────────────────────────────────

-- Used by ilike '%query%' on places.name — orders of magnitude faster than seq scan
CREATE INDEX IF NOT EXISTS idx_places_name_trgm
  ON places USING GIN (name gin_trgm_ops);

-- Used by ilike '%query%' on lists.name
CREATE INDEX IF NOT EXISTS idx_lists_name_trgm
  ON lists USING GIN (name gin_trgm_ops);

-- ─── Backfill: places ────────────────────────────────────────────────────────
-- Generates slug = <slugified-name>-<first-2-chars-of-cidade>
-- Slug format: lowercase, accents stripped, non-alphanumeric → hyphen,
--              leading/trailing hyphens removed, cidade suffix appended.
-- Collisions resolved with -2, -3, ... numeric suffix.

DO $$
DECLARE
  rec         RECORD;
  base_slug   TEXT;
  candidate   TEXT;
  suffix      INT;
BEGIN
  FOR rec IN
    SELECT id, name, cidade
      FROM places
     WHERE status IN ('approved', 'pending')
       AND slug IS NULL
     ORDER BY created_at ASC
  LOOP
    -- Build base slug from name + 2-char cidade suffix
    base_slug := lower(
                   regexp_replace(
                     regexp_replace(
                       unaccent(rec.name),
                       '[^a-zA-Z0-9\s-]', '', 'g'   -- strip non-alphanumeric (keep spaces and hyphens)
                     ),
                     '[\s-]+', '-', 'g'              -- spaces/hyphens → single hyphen
                   )
                 );
    -- Strip leading/trailing hyphens
    base_slug := regexp_replace(base_slug, '^-+|-+$', '', 'g');
    -- Append cidade prefix (first 2 chars)
    base_slug := base_slug || '-' || left(lower(unaccent(rec.cidade)), 2);

    -- Resolve collision
    candidate := base_slug;
    suffix    := 2;
    WHILE EXISTS (SELECT 1 FROM places WHERE slug = candidate) LOOP
      candidate := base_slug || '-' || suffix;
      suffix    := suffix + 1;
    END LOOP;

    UPDATE places SET slug = candidate WHERE id = rec.id;
  END LOOP;
END;
$$;

-- ─── Backfill: lists ─────────────────────────────────────────────────────────
-- Only public lists receive a slug; private lists remain NULL.
-- Slug is derived from list name only (lists have no cidade column).

DO $$
DECLARE
  rec         RECORD;
  base_slug   TEXT;
  candidate   TEXT;
  suffix      INT;
BEGIN
  FOR rec IN
    SELECT id, name
      FROM lists
     WHERE is_public = true
       AND slug IS NULL
     ORDER BY created_at ASC
  LOOP
    base_slug := lower(
                   regexp_replace(
                     regexp_replace(
                       unaccent(rec.name),
                       '[^a-zA-Z0-9\s-]', '', 'g'
                     ),
                     '[\s-]+', '-', 'g'
                   )
                 );
    base_slug := regexp_replace(base_slug, '^-+|-+$', '', 'g');

    candidate := base_slug;
    suffix    := 2;
    WHILE EXISTS (SELECT 1 FROM lists WHERE slug = candidate) LOOP
      candidate := base_slug || '-' || suffix;
      suffix    := suffix + 1;
    END LOOP;

    UPDATE lists SET slug = candidate WHERE id = rec.id;
  END LOOP;
END;
$$;
