# Database Migration Reset

This directory contains a **clean, consolidated** set of migrations that replaces the previous 34 fragmented migrations.

## New Migration Structure

```
01_init.sql              # Extensions (PostGIS, pgvector, uuid-ossp)
02_create_enums.sql      # All PostgreSQL ENUMs
03_create_tables.sql     # All tables (places, reviews, profiles, lists, etc.)
04_create_indexes.sql    # All indexes (including GIST for geo queries)
05_create_functions.sql  # Functions and triggers (search, stats, gamification)
06_create_storage.sql    # Supabase Storage buckets
07_disable_rls.sql       # Disable RLS (code-only validation pattern)
```

**7 migrations** instead of 34 ✨

## How to Reset and Apply Clean Migrations

### Option 1: Using Supabase Dashboard (Recommended)

1. **Backup any important data first!**
2. Go to Supabase Dashboard → SQL Editor
3. Run `scripts/reset-database.sql` to drop everything
4. Run `npm run db:migrate` to apply clean migrations
5. Restart PostgREST: Settings → API → Restart now

### Option 2: Using Migration Script

```bash
# Reset database and apply clean migrations
npm run db:migrate
```

The migration script will automatically detect that no tables exist and apply all migrations in order.

### Option 3: Manual Reset (if you have data to preserve)

If you have production data or want to be extra careful:

1. **Export existing data** (Supabase Dashboard → Table Editor → Export)
2. Run reset script: `scripts/reset-database.sql`
3. Apply clean migrations: `npm run db:migrate`
4. Re-import data (transform to match new schema if needed)

## What Changed

### Consolidated Features

- **Normalized structure**: `place_cuisines` and `place_meals` pivot tables instead of TEXT[]
- **Separated stats**: `place_stats` table eliminates lock contention
- **Complete reviews**: Now includes `rating` (1-5), `review_scores`, and `review_photos`
- **Social features**: Lists, favorites, saves with counters
- **Gamification**: Points system in profiles
- **ENUMs**: Type-safe value constraints for establishment types, cuisines, meal types, price buckets

### Removed Confusion

- No more duplicate `user_id` fix migrations
- No more "fix" migrations stacked on fixes
- No more RLS policies that weren't being used
- No more stale schema cache issues

## Migration Tracking

The `_migrations` table tracks which migrations have been applied. The migration script (`scripts/migrate.mjs`) uses this to know which migrations to run.

## After Applying Migrations

1. **Verify schema**: Check Supabase Table Editor to confirm all tables exist
2. **Test search**: Try creating a place and searching nearby
3. **Test reviews**: Create a review with scores and photos
4. **Check PostgREST**: If you get "column does not exist" errors, restart PostgREST

## Rollback Strategy

If something goes wrong:

1. Run `scripts/reset-database.sql` to drop everything
2. Restore old migrations: `Move-Item migrations_old\*.sql migrations\`
3. Run old migrations: `npm run db:migrate`

## Notes

- **Local development**: Safe to reset anytime
- **Production**: NEVER run reset script! Create forward-only migrations instead
- **Schema changes**: Add new numbered migrations (08, 09, etc.) - never edit existing ones
