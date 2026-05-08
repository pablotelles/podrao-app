-- Migration 07: Disable RLS (Row Level Security)
-- 
-- Context: This architecture uses code-only validation (Clean Architecture pattern)
-- All authentication and authorization logic lives in the application layer
-- RLS is disabled to avoid JWT propagation issues and maintain testability
-- 
-- Security is enforced through 3-step validation in API routes:
-- 1. Validate authentication with regular client (reads cookies)
-- 2. Use admin client for DB operations
-- 3. Validate business logic in Use Cases
--
-- See CLAUDE.md for full security model explanation

ALTER TABLE places DISABLE ROW LEVEL SECURITY;
ALTER TABLE place_cuisines DISABLE ROW LEVEL SECURITY;
ALTER TABLE place_meals DISABLE ROW LEVEL SECURITY;
ALTER TABLE place_photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE place_stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE review_scores DISABLE ROW LEVEL SECURITY;
ALTER TABLE review_photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE favorites DISABLE ROW LEVEL SECURITY;
ALTER TABLE lists DISABLE ROW LEVEL SECURITY;
ALTER TABLE list_places DISABLE ROW LEVEL SECURITY;
ALTER TABLE list_favorites DISABLE ROW LEVEL SECURITY;
ALTER TABLE list_saves DISABLE ROW LEVEL SECURITY;
ALTER TABLE reactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE reaction_counts DISABLE ROW LEVEL SECURITY;
