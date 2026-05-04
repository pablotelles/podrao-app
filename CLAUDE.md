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
npm run db:migrate   # apply schema migrations (run once per migration)
npm run db:policies  # apply RLS policies (idempotent, run anytime)
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

| Interface            | Purpose                                                                |
| -------------------- | ---------------------------------------------------------------------- |
| `IPlaceRepository`   | Geo search + CRUD for places (extends `IPlaceReader` + `IPlaceWriter`) |
| `IReviewRepository`  | Review CRUD; enforces one-review-per-user                              |
| `ICacheProvider`     | Generic KV cache with TTL and pattern deletion                         |
| `IMapProvider`       | Geocoding, reverse geocoding, static map URL, tile template            |
| `IStorageProvider`   | File upload/delete (Supabase Storage)                                  |
| `IEmbeddingProvider` | Text → float[] for semantic search (OpenAI, pós-MVP)                   |

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

**Z-index hierarchy** (prevents overlay conflicts):

All z-index values are defined as CSS custom properties in `globals.css`:

```css
--z-base: 0; /* Normal flow */
--z-dropdown: 10; /* Dropdowns, autocomplete */
--z-sticky: 20; /* Sticky headers, form footers */
--z-nav: 30; /* Bottom navigation */
--z-overlay: 40; /* Modal/sheet backdrops */
--z-modal: 50; /* Modals, sheets, drawers */
--z-toast: 60; /* Toasts, notifications */
--z-tooltip: 70; /* Tooltips */
```

**Usage:** Always use inline styles with CSS variables, never hardcoded z-index classes:

```tsx
// ✅ Correct — uses design token
<div style={{ zIndex: 'var(--z-modal)' }}>Modal content</div>

// ❌ Wrong — hardcoded value
<div className="z-50">Modal content</div>
```

This ensures all overlays (sheets, modals, dropdowns) maintain correct stacking order globally.

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

Supabase (Postgres + PostGIS + pgvector). The `places` table has:

- `location GEOGRAPHY(POINT, 4326)` — used by PostGIS for accurate meter-based distance
- `lat` / `lng` as numeric columns — redundant for simple queries that don't need PostGIS
- `embedding vector(1536)` — NULL during MVP, populated pós-MVP for semantic search

#### Migrations

**Migrations** (`src/infrastructure/database/migrations/`):

- Plain SQL files with timestamp prefix: `YYYYMMDDHHMMSS_description.sql`
- Track schema changes: tables, columns, indexes, functions, triggers, buckets
- Run once via `npm run db:migrate` — tracked in `_migrations` table
- Immutable — never edit a migration that was already applied

Example:

```bash
# Create new migration
# src/infrastructure/database/migrations/20260503120000_add_verified_column.sql
npm run db:migrate
```

#### Security Model: Code-Only Validation

**RLS is DISABLED.** All authentication and authorization logic lives in the application layer.

**Why no RLS?**

- RLS adds complexity without practical benefits for this architecture
- JWT context propagation is unreliable in Next.js SSR
- RLS policies conflict with service_role admin client
- Clean Architecture already validates everything in Use Cases
- Testable, maintainable, and debuggable in TypeScript

**Security Pattern** (3-step validation in API routes):

```typescript
export async function POST(req: NextRequest) {
  // 1. Validate authentication
  const supabase = await createRouteSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new UnauthorizedError();

  // 2. Use admin client for DB operations
  const adminClient = createAdminClient();
  const repository = new SupabaseRepository(adminClient);

  // 3. Validate business logic in Use Case or route
  const place = await repository.findById(id);
  if (place.createdBy !== user.id) throw new UnauthorizedError();

  // Safe to proceed
  const result = await useCase.execute({ userId: user.id, ...data });
  return NextResponse.json(result);
}
```

CREATE POLICY "table_update_own"
ON table_name FOR UPDATE
USING (auth.uid() = created_by); -- NO! JWT doesn't propagate correctly

````

**Why `USING (true)`?**

- RLS is still enabled (blocks anonymous access at the table level)
- Policies with `USING (true)` allow authenticated clients (anon key, service_role key)
- Anonymous access is still blocked by middleware and API route auth checks
- Service role key (admin client) can execute operations after auth validation in code

**API Route Pattern** (3-step validation):

```typescript
export async function POST(req: NextRequest) {
  // 1. Validate authentication with regular client (reads cookies)
  const supabase = await createRouteSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new UnauthorizedError();

  // 2. Use admin client for DB operations (bypasses RLS)
  const adminClient = createAdminClient();
  const repository = new SupabaseRepository(adminClient);

  // 3. Validate business logic in Use Case or route
  // Example: ownership, status, permissions, etc.
  const place = await repository.findById(id);
  if (place.createdBy !== user.id) throw new UnauthorizedError();

  // Safe to proceed — auth validated, ownership validated
  const result = await useCase.execute({ userId: user.id, ...data });
  return NextResponse.json(result);
}
````

**Use Case Pattern**: DTOs receive `userId` (who is authenticated), not domain fields like `createdBy`. The Use Case sets domain fields internally:

```typescript
export interface CreatePlaceDTO {
  name: string;
  // ...other fields
  userId: string; // ✅ Who is creating (from auth)
  // createdBy: string;  ❌ Never in DTO — set internally
}

export class CreatePlace {
  async execute(dto: CreatePlaceDTO): Promise<Place> {
    // Validate business rules
    if (!dto.name.trim()) throw new ValidationError('...');

    // Set domain fields from userId
    return this.repo.create({
      ...dto,
      createdBy: dto.userId, // Use Case controls this
    });
  }
}
```

This pattern is **mandatory** for all authenticated write operations (POST/PATCH/DELETE).

### AI (pós-MVP)

`IEmbeddingProvider` abstracts the embedding model. `OpenAIEmbeddingProvider` uses `text-embedding-3-small`. The embedding text for a place is built as:
`"{name} | {establishmentType} | {cuisines} | {mealTypes} | {bairro} | {cidade} | {priceBucket}"`

Semantic search runs via `search_places_semantic` RPC, combining pgvector cosine distance (60%) with geo proximity (40%).

---

## Monorepo Strategy & Mobile Migration Readiness

**Current decision: monorepo (Next.js full-stack).** This is intentional and correct for the current team size. A React Native / Expo mobile client is planned for the future. When that happens, we will split into a separate Node.js/Express backend that both web and mobile consume.

Full feasibility analysis: [`docs/FE_BE_SPLIT_ANALYSIS.md`](docs/FE_BE_SPLIT_ANALYSIS.md)

### Rules that keep future migration cheap

These rules are **mandatory** now — not because of current complexity, but because violating them makes the future split expensive.

**1. API routes must be thin shells**

Route handlers do exactly three things: validate auth, call a use case, return JSON. Nothing else.

```typescript
// ✅ Correct — thin shell
export async function POST(req: NextRequest) {
  const user = await requireAuth(); // 1. auth
  const dto = parseBody(req, schema); // 1. validate input
  const result = await useCase.execute(dto); // 2. use case
  return NextResponse.json(result); // 3. return
}

// ❌ Wrong — business logic in route handler
export async function POST(req: NextRequest) {
  const user = await requireAuth();
  const body = await req.json();
  // calculating things, querying DB directly, building domain objects here...
  const place = await supabase.from('places').insert({ ...body, createdBy: user.id });
  return NextResponse.json(place);
}
```

When the split happens, each route file becomes a 1:1 Express route with zero logic changes.

**2. `container.ts` is the only composition root**

Infrastructure classes (`SupabasePlaceRepository`, `UpstashCacheProvider`, etc.) are instantiated **only** in `src/presentation/lib/container.ts`. API routes import use cases from the container; they never `new` a repository or provider directly.

```typescript
// ✅ Correct
import { createPlace } from '@/presentation/lib/container';
const result = await createPlace.execute(dto);

// ❌ Wrong — infrastructure instantiated in route
import { SupabasePlaceRepository } from '@/infrastructure/...';
const repo = new SupabasePlaceRepository();
```

At split time, `container.ts` is the only file that changes location/content.

**3. Domain and application layers must have zero framework imports**

`src/domain/` and `src/application/` must never import from `next`, `react`, `@supabase/ssr`, or any infrastructure package. They are the portable core that will be copied as-is to the Express backend.

If you need to add something to these layers, ask: "would this compile in a plain Node.js process with no framework?" If yes, it's fine. If no, it belongs in `infrastructure/` or `presentation/`.

**4. DTOs receive `userId`, not auth context**

Use cases receive the authenticated user's ID as a plain string in the DTO. They never receive Supabase client objects, session tokens, or Next.js request objects. Auth is validated before the use case is called; the use case only knows about `userId`.

```typescript
// ✅ Correct — auth-agnostic DTO
await submitReview.execute({
  placeId,
  userId: user.id,
  rating: 5,
  comment,
  amountPaidPerPerson: 45.0,
});

// ❌ Wrong — leaking auth context into use case
await submitReview.execute({ placeId, session, rating, comment });
```

**5. Client hooks fetch from `/api/*` paths only**

SWR hooks and client-side fetch calls always use relative `/api/...` URLs. Never import repositories or infrastructure directly in client components or hooks.

```typescript
// ✅ Correct — hooks are transport-agnostic
const { data } = useSWR(`/api/places?lat=${lat}&lng=${lng}`, fetcher);

// ❌ Wrong — importing infra in client hook
import { placeRepository } from '@/presentation/lib/container';
const places = await placeRepository.searchNearby(params);
```

At split time, swapping `/api/places` → `https://api.podrao.com/places` is a one-line config change.

### When to split (trigger conditions)

Split into FE + Express backend when **any** of these is true:

- React Native / Expo mobile client is being built
- A third-party integration needs to consume the API directly
- The backend requires independent scaling (high DB load, separate infra)

Do not split before these conditions — the overhead is not worth it.

---

## AI Architecture (prompts & agents)

Live documentation for AI features built into this product is maintained in `docs/ai/`. Update those files when adding or changing prompts, agent flows, or embedding strategies.
