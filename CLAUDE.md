# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Commands

```bash
npm run dev          # dev server (Turbopack)
npm run build        # production build
npm run typecheck    # tsc --noEmit (run before every commit)
npm run lint         # next lint
npm run format       # prettier --write .
npm run format:check # prettier --check .
```

**Pre-commit ritual** (mandatory): `npm run typecheck && npm run format:check`

Copy `.env.local.example` → `.env.local` and fill in values before running locally.

---

## Architecture

This is a **Clean Architecture** Next.js 15 monorepo (App Router). No Express, no NestJS — Next.js is the only server.

### Dependency rule

```
presentation → application → domain ← infrastructure
```

- `src/domain/` — pure TypeScript interfaces and entities. **Zero external imports allowed.**
- `src/application/` — use cases that orchestrate domain interfaces. Imports only `domain/`.
- `src/infrastructure/` — concrete adapters (Supabase, Upstash, LocationIQ, OpenAI). Implements domain interfaces.
- `src/presentation/` — Next.js App Router pages, API routes, React components, hooks.

### Composition root

`src/presentation/lib/container.ts` is the **only file** that instantiates infrastructure classes and wires them into use cases. API routes import from the container; they never `new` a repository directly.

To swap an infrastructure provider (e.g., replace LocationIQ with Mapbox): create the new file under `src/infrastructure/maps/`, implement `IMapProvider`, change one line in `container.ts`. Zero impact elsewhere.

### Key interfaces (domain/interfaces/)

| Interface | Purpose |
|---|---|
| `IPlaceRepository` | Geo search + CRUD for places (extends `IPlaceReader` + `IPlaceWriter`) |
| `IReviewRepository` | Review CRUD; enforces one-review-per-user |
| `ICacheProvider` | Generic KV cache with TTL and pattern deletion |
| `IMapProvider` | Geocoding, reverse geocoding, static map URL, tile template |
| `IStorageProvider` | File upload/delete (Supabase Storage) |
| `IEmbeddingProvider` | Text → float[] for semantic search (OpenAI, pós-MVP) |

### Geo search

Geo queries go through a Supabase RPC call (`search_nearby_places`). Always use `ST_DWithin` in `WHERE` (uses GIST index), and `ST_Distance` only in `SELECT`/`ORDER BY`. Never filter by distance using `ST_Distance` in `WHERE` — it causes a sequential scan.

Cache keys for geo results are built by rounding lat/lng to 3 decimal places (~111m cells):
`places:{lat}:{lng}:{radiusM}:{mealType}:{cuisine}:{maxPrice}`

### Design system

All colors, spacing, and radii are CSS custom properties defined in `src/app/globals.css` under `:root`. Tailwind v4 `@theme` block maps those tokens to utility classes (`bg-brand`, `text-text-secondary`, `rounded-md`). Components use CVA (`class-variance-authority`) for type-safe variants. **No hex values or hardcoded numbers in component files.**

**Tailwind v4 class syntax rules:**
- Token defined in `@theme` → use generated utility: `text-text-primary`, `bg-brand-subtle`, `rounded-lg`
- CSS var NOT in `@theme` → use shorthand: `shadow-(--shadow-card)`, `px-(--spacing-page-x)`
- Never write `[var(--...)]` — always use one of the two forms above

### Auth

Magic-link only (Supabase Auth). Session lives in an httpOnly cookie via `@supabase/ssr`. Server components and API routes use `createServerClient()`; the middleware at `src/middleware.ts` guards `/add-place` and `/profile`.

### API conventions

- All routes under `/api/`
- Every input validated with Zod
- Error shape: `{ error: string, code: string }`
- Auth via session cookie — never pass JWT in Authorization header

### Caching layers

1. **Vercel Edge** — SSG pages and images
2. **Upstash Redis** — geo search results, 60–300 s TTL depending on time of day
3. **SWR** — client-side stale-while-revalidate

### PWA

Service worker is at `src/sw.ts` and compiled with a separate `tsconfig.sw.json` (lib: `webworker`). It is excluded from the main tsconfig to avoid DOM/ServiceWorker type conflicts.

### Database

Supabase (Postgres + PostGIS + pgvector). Migrations are plain SQL files in `src/infrastructure/database/migrations/`. The `places` table has:
- `location GEOGRAPHY(POINT, 4326)` — used by PostGIS for accurate meter-based distance
- `lat` / `lng` as numeric columns — redundant for simple queries that don't need PostGIS
- `embedding vector(1536)` — NULL during MVP, populated pós-MVP for semantic search

### AI (pós-MVP)

`IEmbeddingProvider` abstracts the embedding model. `OpenAIEmbeddingProvider` uses `text-embedding-3-small`. The embedding text for a place is built as:
`"{name} | {establishmentType} | {cuisines} | {mealTypes} | {bairro} | {cidade} | {priceBucket}"`

Semantic search runs via `search_places_semantic` RPC, combining pgvector cosine distance (60%) with geo proximity (40%).

---

## AI Architecture (prompts & agents)

Live documentation for AI features built into this product is maintained in `docs/ai/`. Update those files when adding or changing prompts, agent flows, or embedding strategies.
