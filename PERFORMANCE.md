# Performance Roadmap — Podrao

Auditoria realizada em 2026-05-13. Itens ordenados por impacto.
Ganho estimado após A1–A6: LCP home ~−40%, TTI ~−30%, `/p/[slug]` ~−200ms.

---

## 🔴 Alto Impacto

- [x] **A1 — Home como Server Component**
      `app/page.tsx` convertido para async Server Component. Cookie httpOnly substitui `localStorage` para flag de onboarding. `getFeaturedLists` pré-buscado no servidor e injetado como `fallbackData` no SWR. Zona C (listas) renderiza independente do geo.

- [x] **A2 — `/p/[slug]` parallelizar auth + fetch do place**
      `supabase.auth.getUser()` e `fetchPlace(slug)` rodam em série hoje. `fetchPlace` não depende de `user`. `Promise.all([getUser(), fetchPlace(slug)])` economiza um RTT inteiro na página mais compartilhada.

- [x] **A3 — Sheet "adicionar a lista" faz N requests**
      Para cada lista do usuário, chama `GET /api/lists/{id}/places` para checar se o place já está lá. Fix: novo endpoint `GET /api/lists/contains?placeId=X` que resolve tudo em 1 query.

- [x] **A5 — `searchNearby` usa bbox em `lat`/`lng` (btree), não PostGIS GIST**
      Viola a diretriz do `CLAUDE.md`. Em cidades densas traz centenas de rows com JOINs para descartar no haversine do TypeScript. Fix: RPC `search_nearby_places` com `ST_DWithin` no `WHERE` e `ST_Distance` só no `SELECT`.

- [x] **A6 — Cards de listagem usam `<img>` em vez de `next/image`**
      `PlaceCardHome`, `ListCardDestaque`, `ListCardRecente`, `TopBar` — todos com `eslint-disable`. Sem AVIF/WebP, sem `srcSet`, sem lazy load. Fix: trocar por `<Image>` com `width`/`height`; `priority` no primeiro card do carrossel (LCP provável).

- [x] **A7 — `requestLocation()` seta `isLoading: true` no refresh silencioso**
      `watchPosition` substituído por `getCurrentPosition` periódico (3min). Threshold de ~150m para ignorar jitter de GPS. `visibilitychange` dispara refresh ao voltar ao app. Reverse geocode com lat/lng arredondado para células de ~111m (SWR key estável).

---

## 🟡 Médio Impacto

- [ ] **M3 — `UserContext` faz `GET /api/me` em toda página, mesmo sem sessão**
      Round-trip de 401 desperdiçado para usuários anônimos. Fix: `initialUser` via SSR no `RootLayout` (middleware já roda `getUser`).

- [ ] **M4 — `useLists` chamado na home mesmo para usuários anônimos**
      Retorna 401 sempre. Fix trivial: desativar o hook quando não há usuário logado.

- [x] **M5 — Filtros de nearby sem debounce**
      Arrastar o slider de raio dispara N requests. `useDebounce` já existe no projeto — só falta aplicar.

- [ ] **M7 — Leaflet carrega imediato em `/p/[slug]`**
      ~150KB de JS + tiles de mapa no carregamento inicial. Fix: imagem estática via `mapProvider.getStaticMapUrl()` (interface já existe) acima do fold; Leaflet só monta quando o usuário toca o mapa.

- [ ] **M8 — `TopBarContext` re-renderiza toda a árvore a cada mudança**
      `title`, `hideBottomNav`, `trailingAction` no mesmo objeto de contexto. Qualquer mudança re-renderiza todos os consumidores. Fix: fatiar em contextos separados ou `use-context-selector`.

- [ ] **Cache Redis não explorado**
  - `getPlaceBySlug` — slug é imutável, TTL 300s seria enorme no LCP de compartilhamentos; invalidar em `updatePlace`/`approveEdit`
  - `getPlaceReviews` por `placeId` — TTL 60s, invalidar em `submitReview`
  - `getRecentLists` — query custosa, aceita TTL 120s

---

## 🟢 Baixo Impacto / Quick Wins

- [ ] **`<a>` → `<Link>` nos cards** — ativa prefetch no hover/viewport; place já carregado ao tocar
- [ ] **Preconnect Supabase + LocationIQ no `<head>`** — ~100ms DNS+TLS economizados
- [ ] **`useRecentLists` com `revalidateOnFocus: true`** — único no projeto; trocar para `false`
