-- Migration 10: Community place editing system
-- KAN-56 — Edição comunitária de places — backend

-- ─── ENUMs ───────────────────────────────────────────────────────────────────

-- Status lifecycle of a single field edit proposal
DO $$ BEGIN
  CREATE TYPE place_edit_status_enum AS ENUM (
    'pending',
    'approved',
    'rejected',
    'expired'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Vote cast by a community member on an edit proposal
DO $$ BEGIN
  CREATE TYPE edit_vote_type_enum AS ENUM (
    'confirm',
    'contest'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Who/what resolved a pending edit
DO $$ BEGIN
  CREATE TYPE edit_resolved_by_enum AS ENUM (
    'community',
    'admin',
    'system'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- How a field change was applied to the place
DO $$ BEGIN
  CREATE TYPE edit_mechanism_enum AS ENUM (
    'community',
    'admin'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── place_edit ───────────────────────────────────────────────────────────────
-- One row per field-level edit proposal. Only one pending edit per (place, field)
-- is allowed at a time (enforced by partial unique index below).
--
-- level:
--   1 = simple scalar fields (name, description, price_bucket, establishment_type,
--       cover_photo, operating periods, most place_attributes)
--   2 = high-impact fields (location/address) that require admin confirmation

CREATE TABLE IF NOT EXISTS place_edit (
  id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id        UUID            NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  field_name      TEXT            NOT NULL,
  old_value       JSONB           NOT NULL,
  new_value       JSONB           NOT NULL,
  status          place_edit_status_enum NOT NULL DEFAULT 'pending',
  level           SMALLINT        NOT NULL CHECK (level IN (1, 2)),
  user_id         UUID            NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note            TEXT            CHECK (length(note) <= 280),
  created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  resolved_at     TIMESTAMPTZ,
  resolved_by     edit_resolved_by_enum
);

-- Enforce at most one pending edit per (place, field) at a time.
-- Partial index: only rows where status = 'pending' participate.
CREATE UNIQUE INDEX IF NOT EXISTS idx_place_edit_one_pending_per_field
  ON place_edit (place_id, field_name)
  WHERE status = 'pending';

-- Used by rate-limit queries (how many edits has this user submitted recently?)
CREATE INDEX IF NOT EXISTS idx_place_edit_user_created
  ON place_edit (user_id, created_at DESC);

-- Used by admin/community queues that list edits by status
CREATE INDEX IF NOT EXISTS idx_place_edit_status_created
  ON place_edit (status, created_at DESC);

-- Used by admin queue that shows pending level-2 edits awaiting manual review
CREATE INDEX IF NOT EXISTS idx_place_edit_pending_level
  ON place_edit (status, level, created_at)
  WHERE status = 'pending';

-- Used when listing all edits for a given place (place detail page, history tab)
CREATE INDEX IF NOT EXISTS idx_place_edit_place
  ON place_edit (place_id, status);

-- ─── edit_vote ────────────────────────────────────────────────────────────────
-- Community members confirm or contest a pending edit.
-- One vote per (edit, user) enforced by the UNIQUE constraint.

CREATE TABLE IF NOT EXISTS edit_vote (
  id         UUID               PRIMARY KEY DEFAULT gen_random_uuid(),
  edit_id    UUID               NOT NULL REFERENCES place_edit(id) ON DELETE CASCADE,
  user_id    UUID               NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type  edit_vote_type_enum NOT NULL,
  created_at TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  UNIQUE (edit_id, user_id)
);

-- Used to count confirms vs contests for a given edit efficiently
CREATE INDEX IF NOT EXISTS idx_edit_vote_edit
  ON edit_vote (edit_id, vote_type);

-- ─── field_history ────────────────────────────────────────────────────────────
-- Immutable audit log: one row per field change that was actually applied to a place.
-- Populated by apply_approved_edit(); never updated after insert.

CREATE TABLE IF NOT EXISTS field_history (
  id          UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id    UUID                NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  field_name  TEXT                NOT NULL,
  old_value   JSONB               NOT NULL,
  new_value   JSONB               NOT NULL,
  changed_at  TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  changed_by  UUID                REFERENCES auth.users(id),
  mechanism   edit_mechanism_enum NOT NULL,
  edit_id     UUID                REFERENCES place_edit(id) ON DELETE SET NULL
);

-- Primary lookup: all history for a place, newest first
CREATE INDEX IF NOT EXISTS idx_field_history_place_changed
  ON field_history (place_id, changed_at DESC);

-- Lookup: history for a specific field within a place (diff view)
CREATE INDEX IF NOT EXISTS idx_field_history_field
  ON field_history (place_id, field_name, changed_at DESC);

-- ─── apply_approved_edit ─────────────────────────────────────────────────────
-- Deliberate exception to the "no logic in SQL" rule: this function is justified
-- by the requirement for a single atomic transaction across place_edit,
-- the target table (places / place_attributes / place_periods), and field_history.
-- Scoring, ranking, and business-rule weights remain in TypeScript.
--
-- Caller responsibilities (TypeScript use case):
--   - Verify the requesting actor is authorised before calling this function.
--   - Pass p_mechanism = 'admin' for direct admin approvals,
--                        'community' for vote-threshold approvals.
--   - Pass p_actor_id = the admin/system user that triggered the approval.
--
-- Supported field_name values and their effect on places / related tables:
--   Scalar columns on places:
--     name, description, price_bucket, establishment_type
--       → UPDATE places SET <col> = new_value WHERE id = place_id
--   Special scalar:
--     address
--       → UPDATE places SET address = new_value->>'value' WHERE id = place_id
--   Location (level-2):
--     location
--       → UPDATE places SET address = new_value->>'address',
--                           lat     = (new_value->>'lat')::NUMERIC,
--                           lng     = (new_value->>'lng')::NUMERIC,
--                           location = ST_SetSRID(ST_Point(lng, lat), 4326)
--   Cover photo:
--     cover_photo
--       → UPSERT place_photos row of type='cover' with new URL
--   place_attributes keys (stored as TEXT arrays in JSONB):
--     payment_methods, food_tags, drink_tags, specialty_tags
--       → DELETE existing rows for (place_id, key), INSERT new rows from new_value array
--   place_attributes scalar keys (stored as TEXT in JSONB):
--     service_type, has_happy_hour, opens_early, bar_focus
--       → DELETE existing rows for (place_id, key), INSERT new single row
--   place_periods (operating periods, stored as TEXT array in JSONB):
--     periods
--       → DELETE all existing place_periods rows for place_id,
--         INSERT new rows for each value in new_value array

CREATE OR REPLACE FUNCTION apply_approved_edit(
  p_edit_id    UUID,
  p_mechanism  edit_mechanism_enum,
  p_actor_id   UUID
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_edit      place_edit%ROWTYPE;
  v_new_text  TEXT;
  v_new_lat   NUMERIC;
  v_new_lng   NUMERIC;
  v_period    TEXT;
  v_tag       TEXT;
BEGIN
  -- Lock the row to prevent concurrent applications of the same edit
  SELECT * INTO v_edit
    FROM place_edit
   WHERE id = p_edit_id
     FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'place_edit not found: %', p_edit_id;
  END IF;

  -- Idempotency guard: already applied → return without error
  IF v_edit.status = 'approved' THEN
    RETURN;
  END IF;

  -- Only pending or expired edits can be approved via this path
  IF v_edit.status NOT IN ('pending', 'expired') THEN
    RAISE EXCEPTION 'Cannot approve edit % with status %', p_edit_id, v_edit.status;
  END IF;

  -- ── Apply change to the target table ────────────────────────────────────────

  CASE v_edit.field_name

    -- ── Scalar columns on places ────────────────────────────────────────────
    WHEN 'name' THEN
      v_new_text := v_edit.new_value->>'value';
      UPDATE places SET name = v_new_text, updated_at = NOW()
       WHERE id = v_edit.place_id;

    WHEN 'description' THEN
      v_new_text := v_edit.new_value->>'value';
      UPDATE places SET description = v_new_text, updated_at = NOW()
       WHERE id = v_edit.place_id;

    WHEN 'price_bucket' THEN
      v_new_text := v_edit.new_value->>'value';
      UPDATE places SET price_bucket = v_new_text::price_bucket_enum, updated_at = NOW()
       WHERE id = v_edit.place_id;

    WHEN 'establishment_type' THEN
      v_new_text := v_edit.new_value->>'value';
      UPDATE places SET establishment_type = v_new_text::establishment_type_enum, updated_at = NOW()
       WHERE id = v_edit.place_id;

    -- ── Address (text only, no geo update) ──────────────────────────────────
    WHEN 'address' THEN
      v_new_text := v_edit.new_value->>'value';
      UPDATE places SET address = v_new_text, updated_at = NOW()
       WHERE id = v_edit.place_id;

    -- ── Location (address + coordinates + PostGIS geography) ────────────────
    WHEN 'location' THEN
      v_new_lat := (v_edit.new_value->>'lat')::NUMERIC;
      v_new_lng := (v_edit.new_value->>'lng')::NUMERIC;
      UPDATE places
         SET address  = v_edit.new_value->>'address',
             lat      = v_new_lat,
             lng      = v_new_lng,
             location = ST_SetSRID(
                          ST_Point(v_new_lng::FLOAT8, v_new_lat::FLOAT8),
                          4326
                        )::geography,
             updated_at = NOW()
       WHERE id = v_edit.place_id;

    -- ── Cover photo — upsert into place_photos ───────────────────────────────
    -- Deletes existing cover row (if any) then inserts the new one.
    WHEN 'cover_photo' THEN
      v_new_text := v_edit.new_value->>'value';
      DELETE FROM place_photos
       WHERE place_id = v_edit.place_id AND type = 'cover';
      INSERT INTO place_photos (place_id, url, type, position, uploaded_by, uploaded_at)
      VALUES (v_edit.place_id, v_new_text, 'cover', 0, p_actor_id, NOW());

    -- ── place_attributes: array-valued keys ─────────────────────────────────
    -- Stored in new_value as: {"values": ["tag1", "tag2", ...]}
    WHEN 'payment_methods', 'food_tags', 'drink_tags', 'specialty_tags' THEN
      DELETE FROM place_attributes
       WHERE place_id = v_edit.place_id AND key = v_edit.field_name;
      FOR v_tag IN
        SELECT jsonb_array_elements_text(v_edit.new_value->'values')
      LOOP
        INSERT INTO place_attributes (place_id, key, value)
        VALUES (v_edit.place_id, v_edit.field_name, v_tag)
        ON CONFLICT (place_id, key, value) DO NOTHING;
      END LOOP;

    -- ── place_attributes: scalar-valued keys ────────────────────────────────
    -- Stored in new_value as: {"value": "some_text"}
    WHEN 'service_type', 'has_happy_hour', 'opens_early', 'bar_focus' THEN
      v_new_text := v_edit.new_value->>'value';
      DELETE FROM place_attributes
       WHERE place_id = v_edit.place_id AND key = v_edit.field_name;
      IF v_new_text IS NOT NULL AND length(trim(v_new_text)) > 0 THEN
        INSERT INTO place_attributes (place_id, key, value)
        VALUES (v_edit.place_id, v_edit.field_name, v_new_text)
        ON CONFLICT (place_id, key, value) DO NOTHING;
      END IF;

    -- ── place_periods (operating periods) ───────────────────────────────────
    -- Stored in new_value as: {"values": ["manha", "noite", ...]}
    WHEN 'periods' THEN
      DELETE FROM place_periods
       WHERE place_id = v_edit.place_id;
      FOR v_period IN
        SELECT jsonb_array_elements_text(v_edit.new_value->'values')
      LOOP
        INSERT INTO place_periods (place_id, period)
        VALUES (v_edit.place_id, v_period::operating_period_enum)
        ON CONFLICT (place_id, period) DO NOTHING;
      END LOOP;

    ELSE
      RAISE EXCEPTION 'Unknown field_name for apply_approved_edit: %', v_edit.field_name;

  END CASE;

  -- ── Audit log ────────────────────────────────────────────────────────────────
  INSERT INTO field_history (
    place_id, field_name, old_value, new_value,
    changed_at, changed_by, mechanism, edit_id
  ) VALUES (
    v_edit.place_id, v_edit.field_name, v_edit.old_value, v_edit.new_value,
    NOW(), p_actor_id, p_mechanism, p_edit_id
  );

  -- ── Mark edit as approved ────────────────────────────────────────────────────
  UPDATE place_edit
     SET status      = 'approved',
         resolved_at = NOW(),
         resolved_by  = p_mechanism::TEXT::edit_resolved_by_enum
   WHERE id = p_edit_id;

END;
$$;

COMMENT ON FUNCTION apply_approved_edit IS
  'Atomically applies an approved field edit to the target place table, '
  'writes an immutable row to field_history, and marks the place_edit as approved. '
  'Uses SELECT ... FOR UPDATE to prevent race conditions. '
  'Idempotent: calling with an already-approved edit_id returns immediately. '
  'p_mechanism: community = vote threshold reached; admin = manual admin action. '
  'p_actor_id: UUID of the admin or system user triggering the approval.';

-- ─── Permissions ─────────────────────────────────────────────────────────────

GRANT ALL ON TABLE place_edit     TO anon, authenticated, service_role;
GRANT ALL ON TABLE edit_vote      TO anon, authenticated, service_role;
GRANT ALL ON TABLE field_history  TO anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION apply_approved_edit(UUID, edit_mechanism_enum, UUID)
  TO service_role;
