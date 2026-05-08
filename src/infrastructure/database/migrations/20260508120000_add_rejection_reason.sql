-- KAN-9: Add rejection_reason column to places
-- Stores the moderator's reason when a place is rejected.
-- Constraint: rejection_reason must be NOT NULL when status='rejected', NULL otherwise.

-- Step 1: add column (nullable initially so backfill can run first)
ALTER TABLE places ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Step 2: backfill any pre-existing rejected rows that have no reason recorded
UPDATE places
SET rejection_reason = 'Migrado: motivo não registrado'
WHERE status = 'rejected'
  AND rejection_reason IS NULL;

-- Step 3: enforce the business rule via CHECK constraint
--   - rejected  → rejection_reason must be present
--   - any other status → rejection_reason must be NULL
ALTER TABLE places DROP CONSTRAINT IF EXISTS places_rejection_reason_check;
ALTER TABLE places ADD CONSTRAINT places_rejection_reason_check CHECK (
  (status = 'rejected' AND rejection_reason IS NOT NULL)
  OR
  (status <> 'rejected' AND rejection_reason IS NULL)
);

-- Step 4: partial index for efficient pending-queue listing (admin moderation page)
CREATE INDEX IF NOT EXISTS idx_places_pending_created_at
  ON places (created_at DESC)
  WHERE status = 'pending';

-- Step 5: partial index for efficient rejected-places lookup
CREATE INDEX IF NOT EXISTS idx_places_rejected_status
  ON places (status)
  WHERE status = 'rejected';
