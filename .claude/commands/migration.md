---
description: Plan and write a database schema change using the podrao-supabase-migration agent
argument-hint: <schema change description>
---

Use the `podrao-supabase-migration` subagent to handle this schema change for the Podrao app:

$ARGUMENTS

The migration agent MUST:

1. Read CLAUDE.md (Database section) and inspect recent migrations for naming/style.
2. Use the next numeric prefix for the migration file (e.g., `11_<description>.sql`).
3. Update the corresponding domain entity, repository interface, and SupabaseXRepository implementation to keep TS in sync.
4. Run `npm run typecheck && npm run format:check`.
5. NOT run `npm run db:migrate` — provide the file and the exact command for me to apply manually.
6. If the change is destructive (DROP, type change), STOP and present the migration plan first; wait for my approval before writing the SQL.
