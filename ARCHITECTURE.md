# Arquitetura Técnica — MVP PWA Descoberta de Lugares para Comer

> Versão: 1.1 | Data: 2026-05-03
> Base: SOLID + Clean Code + Clean Architecture

---

## Sumário

1. [Visão Geral da Arquitetura](#1-visão-geral-da-arquitetura)
2. [Stack Técnica](#2-stack-técnica)
3. [Clean Architecture em Camadas](#3-clean-architecture-em-camadas)
4. [Estrutura de Pastas](#4-estrutura-de-pastas)
5. [Modelagem do Banco de Dados](#5-modelagem-do-banco-de-dados)
6. [Estratégia de Geolocalização](#6-estratégia-de-geolocalização)
7. [Busca Semântica com pgvector](#7-busca-semântica-com-pgvector)
8. [SOLID Aplicado](#8-solid-aplicado)
9. [Autenticação](#9-autenticação)
10. [API Design](#10-api-design)
11. [Caching](#11-caching)
12. [Design System](#12-design-system)
13. [PWA Config](#13-pwa-config)
14. [Deploy e Infraestrutura](#14-deploy-e-infraestrutura)
15. [Monitoramento](#15-monitoramento)
16. [Fases de Implementação](#16-fases-de-implementação)
17. [Decisões Técnicas Críticas](#17-decisões-técnicas-críticas)

---

## 1. Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTE (PWA)                        │
│              Next.js App Router + React + TailwindCSS        │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTPS
┌────────────────────────────▼────────────────────────────────┐
│                   NEXT.JS (Full Stack)                       │
│  ┌─────────────────┐   ┌──────────────────────────────────┐ │
│  │  Server Comps   │   │     Route Handlers (API)         │ │
│  │  (SSR / SSG)    │   │   /api/places  /api/reviews      │ │
│  └─────────────────┘   └──────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Application Layer (Use Cases)            │   │
│  │  SearchNearbyPlaces · AddPlace · SubmitReview · …    │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │             Domain Layer (Entities + Interfaces)      │   │
│  │  Place · Review · User · IPlaceRepository · …        │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Infrastructure Layer (Adapters)             │   │
│  │  SupabasePlaceRepository · UpstashCacheAdapter · …   │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────┘
                             │
       ┌─────────────────────┼──────────────────────┐
       │                     │                       │
┌──────▼──────┐   ┌──────────▼──────────┐   ┌──────▼──────────────┐
│  Supabase   │   │   Upstash Redis      │   │  IMapProvider        │
│  Postgres   │   │   (Cache de Geo)     │   │  (interface domínio) │
│  + PostGIS  │   │                      │   │  ↳ LocationIQ (MVP)  │
│  + pgvector │   └──────────────────────┘   │  ↳ Mapbox (futuro)   │
│  + Auth     │                              └──────────────────────┘
│  + Storage  │
└─────────────┘
```

**Princípio fundamental:** Next.js é o único servidor. Supabase é o banco + auth + storage. Nenhuma camada extra (Express, NestJS) é necessária no MVP.

---

## 2. Stack Técnica

### Frontend / Full Stack

| Tecnologia                     | Versão          | Papel                                             |
| ------------------------------ | --------------- | ------------------------------------------------- |
| Next.js                        | 15 (App Router) | Framework full stack                              |
| React                          | 19              | UI                                                |
| TailwindCSS                    | 4               | Estilização — configurado via CSS tokens (não JS) |
| class-variance-authority (CVA) | latest          | Variantes de componentes type-safe                |
| next-pwa / serwist             | latest          | Service Worker + PWA                              |
| Leaflet + MapLibre GL          | latest          | Mapa interativo (consome tiles via IMapProvider)  |
| SWR                            | 2               | Cache do client-side + revalidação                |
| Zod                            | 3               | Validação de schemas                              |
| React Hook Form                | 7               | Formulários                                       |

### Backend / Infraestrutura

| Tecnologia                                   | Papel                                                          |
| -------------------------------------------- | -------------------------------------------------------------- |
| Supabase (Postgres + PostGIS + **pgvector**) | Banco principal + geo queries + busca semântica                |
| Supabase Auth                                | Magic link                                                     |
| Supabase Storage                             | Fotos de lugares                                               |
| Supabase RLS                                 | Segurança por linha                                            |
| Upstash Redis                                | Cache de buscas geo recentes                                   |
| LocationIQ                                   | Geocoding + reverse geocoding + mapa estático (provedor atual) |
| Vercel                                       | Deploy + Edge Network                                          |

### Por que Upstash e não outro Redis?

- Serverless-native: cobra por request, não por hora
- Compatível com Vercel Edge Functions
- Custo próximo de zero no MVP (free tier generoso)

### Por que LocationIQ como provedor de mapas?

- Free tier: 5.000 requisições/dia (suficiente para MVP)
- Geocoding: ~$1 / 1.000 req (vs $5 no Google, $0.75 no Mapbox)
- Tiles via OpenStreetMap: **gratuitos e sem cota**
- Provedor isolado atrás de `IMapProvider` — troca em 1 arquivo sem impacto no resto do código

---

## 3. Clean Architecture em Camadas

A separação em camadas garante que regras de negócio nunca dependam de frameworks ou bancos de dados. Isso é Dependency Inversion (SOLID-D) na prática.

```
src/
├── domain/          ← Entidades puras + interfaces (zero dependência externa)
├── application/     ← Use Cases (orquestração, regras de negócio)
├── infrastructure/  ← Implementações concretas (Supabase, Redis, LocationIQ)
└── presentation/    ← Next.js pages, components, API routes
```

### Regra de dependência

```
presentation → application → domain ← infrastructure
```

- `domain` não importa nada externo
- `application` importa apenas `domain`
- `infrastructure` implementa as interfaces do `domain`
- `presentation` chama `application`, nunca `infrastructure` diretamente

---

## 4. Estrutura de Pastas

```
src/
│
├── domain/
│   ├── entities/
│   │   ├── Place.ts           # Entidade Place (tipo puro, sem ORM)
│   │   ├── Review.ts
│   │   └── User.ts
│   ├── interfaces/
│   │   ├── IPlaceRepository.ts
│   │   ├── IReviewRepository.ts
│   │   ├── IUserRepository.ts
│   │   ├── ICacheProvider.ts
│   │   ├── IStorageProvider.ts
│   │   └── IMapProvider.ts        # contrato de mapas/geocoding (provedor-agnóstico)
│   └── value-objects/
│       ├── Coordinates.ts     # lat/lng com validação
│       ├── PriceBucket.ts     # enum dos buckets de preço
│       ├── MealType.ts
│       └── CuisineType.ts
│
├── application/
│   ├── use-cases/
│   │   ├── places/
│   │   │   ├── SearchNearbyPlaces.ts   # caso de uso principal
│   │   │   ├── CreatePlace.ts
│   │   │   ├── GetPlaceById.ts
│   │   │   └── ApprovePlace.ts
│   │   └── reviews/
│   │       ├── SubmitReview.ts
│   │       └── GetPlaceReviews.ts
│   ├── dtos/
│   │   ├── SearchPlacesDTO.ts
│   │   ├── CreatePlaceDTO.ts
│   │   └── SubmitReviewDTO.ts
│   └── errors/
│       ├── PlaceNotFoundError.ts
│       ├── UnauthorizedError.ts
│       └── ValidationError.ts
│
├── infrastructure/
│   ├── database/
│   │   ├── supabase/
│   │   │   ├── client.ts              # singleton do client Supabase
│   │   │   ├── SupabasePlaceRepository.ts
│   │   │   ├── SupabaseReviewRepository.ts
│   │   │   └── SupabaseUserRepository.ts
│   │   └── migrations/                # SQL de migração versionado
│   ├── cache/
│   │   └── UpstashCacheProvider.ts
│   ├── storage/
│   │   └── SupabaseStorageProvider.ts
│   └── maps/
│       ├── LocationIQMapProvider.ts    # implementação atual (MVP)
│       └── MapboxMapProvider.ts        # implementação futura (só criar e trocar no container)
│
└── presentation/
    ├── app/                           # Next.js App Router
    │   ├── (public)/
    │   │   ├── page.tsx               # Feed principal / busca
    │   │   └── places/[id]/page.tsx   # Detalhe do lugar
    │   ├── (auth)/
    │   │   └── login/page.tsx
    │   ├── (protected)/
    │   │   ├── add-place/page.tsx     # Cadastro de lugar
    │   │   └── profile/page.tsx
    │   ├── api/
    │   │   ├── places/
    │   │   │   ├── route.ts           # GET /api/places, POST /api/places
    │   │   │   └── [id]/
    │   │   │       ├── route.ts       # GET /api/places/:id, PATCH
    │   │   │       └── reviews/route.ts
    │   │   ├── auth/
    │   │   │   ├── magic-link/route.ts
    │   │   │   └── callback/route.ts
    │   │   └── upload/route.ts
    │   ├── layout.tsx
    │   └── manifest.ts                # PWA manifest dinâmico
    ├── components/
    │   ├── ui/                        # Componentes genéricos (Button, Input…)
    │   ├── places/
    │   │   ├── PlaceCard.tsx
    │   │   ├── PlaceList.tsx
    │   │   ├── PlaceMap.tsx
    │   │   └── AddPlaceForm/
    │   │       ├── index.tsx
    │   │       ├── StepLocation.tsx
    │   │       ├── StepMealTypes.tsx
    │   │       ├── StepEstablishment.tsx
    │   │       ├── StepCuisine.tsx
    │   │       ├── StepPrice.tsx
    │   │       └── StepPhoto.tsx
    │   ├── filters/
    │   │   └── FilterBar.tsx
    │   └── reviews/
    │       ├── ReviewForm.tsx
    │       └── ReviewList.tsx
    ├── hooks/
    │   ├── useGeolocation.ts
    │   ├── useNearbyPlaces.ts
    │   └── useAddPlace.ts
    └── lib/
        ├── schemas/               # Schemas Zod reutilizáveis
        │   ├── placeSchema.ts
        │   └── reviewSchema.ts
        └── container.ts           # DI manual — ÚNICO arquivo que conhece implementações concretas
                                   # Trocar provedor de mapas = 1 linha aqui, zero impacto no resto
```

---

## 5. Modelagem do Banco de Dados

### Extensões necessárias

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;
```

### Tabela `places`

```sql
CREATE TABLE places (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name               TEXT NOT NULL,
  address            TEXT NOT NULL,
  bairro             TEXT,
  cidade             TEXT NOT NULL,
  estado             TEXT NOT NULL,

  -- PostGIS: coluna geography para cálculos de distância precisos
  -- geography usa coordenadas esféricas (metros reais, não graus)
  location           GEOGRAPHY(POINT, 4326) NOT NULL,

  -- redundância intencional para queries simples sem PostGIS
  lat                NUMERIC(10, 7) NOT NULL,
  lng                NUMERIC(10, 7) NOT NULL,

  establishment_type TEXT NOT NULL,                  -- restaurante, padaria…
  cuisine_types      TEXT[] NOT NULL DEFAULT '{}',   -- array: ['japonesa', 'sushi']
  meal_types         TEXT[] NOT NULL DEFAULT '{}',   -- array: ['almoço', 'lanche']
  price_bucket       TEXT NOT NULL,                  -- 'up_to_15', '15_25', '25_40', '40_70', '70_plus'
  median_price       NUMERIC(8, 2),                  -- calculado via reviews

  photo_url          TEXT,
  rating             NUMERIC(3, 2) DEFAULT 0,
  reviews_count      INTEGER DEFAULT 0,
  status             TEXT NOT NULL DEFAULT 'pending', -- pending | approved | rejected

  created_by         UUID REFERENCES auth.users(id),
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);
```

### Índices críticos para performance

```sql
-- Índice espacial: base de tudo para busca geográfica eficiente
CREATE INDEX idx_places_location ON places USING GIST(location);

-- Índice para busca por status (filtra apenas aprovados)
CREATE INDEX idx_places_status ON places(status);

-- Índice composto: status + meal_types + price (filtros mais comuns juntos)
CREATE INDEX idx_places_filters ON places(status, price_bucket);

-- Índice GIN para busca em arrays de cozinha e refeição
CREATE INDEX idx_places_cuisine_types ON places USING GIN(cuisine_types);
CREATE INDEX idx_places_meal_types    ON places USING GIN(meal_types);
```

### Tabela `reviews`

```sql
CREATE TABLE reviews (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  place_id     UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id),
  thumbs_up    BOOLEAN NOT NULL,           -- true = 👍, false = 👎
  amount_paid  NUMERIC(8, 2),              -- quanto pagou de verdade
  meal_type    TEXT,                       -- o que comeu (almoço, lanche…)
  comment      TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(place_id, user_id)                -- um review por usuário por lugar
);

CREATE INDEX idx_reviews_place_id ON reviews(place_id);
```

### Trigger para atualizar rating e median_price

```sql
CREATE OR REPLACE FUNCTION update_place_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE places
  SET
    rating        = (
      SELECT ROUND(AVG(CASE WHEN thumbs_up THEN 1.0 ELSE 0.0 END) * 5, 2)
      FROM reviews WHERE place_id = NEW.place_id
    ),
    reviews_count = (
      SELECT COUNT(*) FROM reviews WHERE place_id = NEW.place_id
    ),
    median_price  = (
      SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY amount_paid)
      FROM reviews
      WHERE place_id = NEW.place_id AND amount_paid IS NOT NULL
    ),
    updated_at    = NOW()
  WHERE id = NEW.place_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_place_stats
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_place_stats();
```

### Row Level Security (RLS)

```sql
ALTER TABLE places  ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Qualquer um lê lugares aprovados
CREATE POLICY "places_read_approved"
  ON places FOR SELECT
  USING (status = 'approved');

-- Usuário logado cria lugar
CREATE POLICY "places_insert_auth"
  ON places FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Usuário edita apenas o próprio lugar (admin via service role)
CREATE POLICY "places_update_own"
  ON places FOR UPDATE
  USING (auth.uid() = created_by);

-- Usuário logado cria review
CREATE POLICY "reviews_insert_auth"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Review visível para todos
CREATE POLICY "reviews_read_all"
  ON reviews FOR SELECT
  USING (true);
```

---

## 6. Estratégia de Geolocalização

Esta é a decisão técnica mais crítica do projeto. **Custo, velocidade e precisão dependem das escolhas abaixo.**

### 6.1 Por que `GEOGRAPHY` e não `GEOMETRY`?

|                | `GEOMETRY`               | `GEOGRAPHY`            |
| -------------- | ------------------------ | ---------------------- |
| Unidade        | Graus                    | **Metros**             |
| Distância real | Imprecisa em lat/lng     | **Precisa**            |
| Performance    | Ligeiramente mais rápido | Adequada com GIST      |
| Uso correto    | Mapas locais planos      | **Localização global** |

**Usar `GEOGRAPHY` elimina a necessidade de conversões manuais de graus para km.**

### 6.2 Query de Busca Principal (Supabase RPC)

Encapsular em uma função PostgreSQL evita N+1 e permite usar o índice espacial corretamente.

```sql
-- migration: create_search_nearby_places.sql
CREATE OR REPLACE FUNCTION search_nearby_places(
  p_lat          FLOAT,
  p_lng          FLOAT,
  p_radius_m     FLOAT DEFAULT 3000,     -- 3km padrão
  p_meal_type    TEXT   DEFAULT NULL,
  p_cuisine      TEXT   DEFAULT NULL,
  p_max_price    NUMERIC DEFAULT NULL,
  p_limit        INT    DEFAULT 20,
  p_offset       INT    DEFAULT 0
)
RETURNS TABLE (
  id                 UUID,
  name               TEXT,
  address            TEXT,
  bairro             TEXT,
  establishment_type TEXT,
  cuisine_types      TEXT[],
  meal_types         TEXT[],
  price_bucket       TEXT,
  median_price       NUMERIC,
  photo_url          TEXT,
  rating             NUMERIC,
  reviews_count      INT,
  distance_m         FLOAT   -- retorna a distância calculada
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.address,
    p.bairro,
    p.establishment_type,
    p.cuisine_types,
    p.meal_types,
    p.price_bucket,
    p.median_price,
    p.photo_url,
    p.rating,
    p.reviews_count,
    ST_Distance(
      p.location,
      ST_MakePoint(p_lng, p_lat)::geography
    ) AS distance_m
  FROM places p
  WHERE
    p.status = 'approved'

    -- ST_DWithin usa o índice GIST — NÃO usar ST_Distance no WHERE
    AND ST_DWithin(
      p.location,
      ST_MakePoint(p_lng, p_lat)::geography,
      p_radius_m
    )

    -- filtros opcionais com short-circuit
    AND (p_meal_type IS NULL OR p_meal_type = ANY(p.meal_types))
    AND (p_cuisine    IS NULL OR p_cuisine   = ANY(p.cuisine_types))
    AND (p_max_price  IS NULL OR COALESCE(p.median_price, 9999) <= p_max_price)

  ORDER BY
    -- ranking composto: distância + qualidade
    (
      -- normaliza distância: mais perto = maior score
      (1.0 - LEAST(distance_m / p_radius_m, 1.0)) * 0.4 +
      -- nota (0-5 → 0-1)
      (COALESCE(p.rating, 0) / 5.0) * 0.4 +
      -- popularidade (log para não dominar)
      (LOG(GREATEST(p.reviews_count, 1)) / 5.0) * 0.2
    ) DESC

  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;
```

**Regra de ouro PostGIS:**

- `ST_DWithin` no `WHERE` → usa índice GIST → O(log n)
- `ST_Distance` apenas no `SELECT` / `ORDER BY` → calcula só nos registros já filtrados

### 6.3 Cache de Geolocalização

Buscas no mesmo bairro/raio chegam centenas de vezes por hora no horário de almoço. Cache evita queries desnecessárias.

**Estratégia de chave de cache:**

```typescript
// src/infrastructure/cache/geoCache.ts

// Arredonda coordenadas para células de ~100m
// Evita cache miss por diferença de 0.0001 grau
function buildGeoKey(params: SearchPlacesDTO): string {
  const latRounded = Math.round(params.lat * 1000) / 1000; // ~111m
  const lngRounded = Math.round(params.lng * 1000) / 1000;
  return [
    'places',
    latRounded,
    lngRounded,
    params.radiusMeters ?? 3000,
    params.mealType ?? 'all',
    params.cuisine ?? 'all',
    params.maxPrice ?? 'all',
  ].join(':');
}

// TTL por contexto
const TTL = {
  LUNCH_RUSH: 60, // segundos — 11h-14h, cache curto (novos lugares aparecem)
  OFF_PEAK: 300, // 5 minutos fora do rush
  NIGHT: 600, // 10 minutos à noite
};
```

### 6.4 Geocoding de Endereço (Cadastro)

Para converter endereço digitado em lat/lng durante o cadastro:

```
Fluxo A — GPS do navegador (preferencial, custo zero):
  Navegador → navigator.geolocation.getCurrentPosition()
  → lat/lng direto
  → Use case ReverseGeocodeCoordinates preenche endereço textual via IMapProvider

Fluxo B — usuário digita endereço (fallback):
  Input de texto → Use case GeocodeAddress → IMapProvider.geocode()
  → LocationIQ Geocoding API (MVP)
  → Custo: ~$1 / 1.000 req | Free tier: 5.000 req/dia
```

### 6.5 Abstração de Provedor de Mapas (`IMapProvider`)

Todos os use cases de geocoding dependem da interface `IMapProvider`, nunca do SDK de um provedor específico.

```
IMapProvider (domain/interfaces/)
  .geocode(address)              → GeocodingResult | null
  .reverseGeocode(coordinates)   → ReverseGeocodingResult | null
  .getStaticMapUrl(options)      → string  (para OG tags e Server Components)
  .getTileUrlTemplate()          → string  (para Leaflet/MapLibre no frontend)

Implementações (infrastructure/maps/):
  LocationIQMapProvider   ← ativo no container.ts (MVP)
  MapboxMapProvider       ← criar futuramente se necessário

Regra:
  Para trocar de provedor → criar novo arquivo em infrastructure/maps/
  → atualizar 1 linha no container.ts
  → zero impacto em domain/, application/ ou presentation/
```

**Comparativo de custo dos provedores:**

|                        | LocationIQ     | Mapbox           | Google Maps   |
| ---------------------- | -------------- | ---------------- | ------------- |
| Geocoding (por 1k req) | ~$1            | $0.75            | $5            |
| Free tier diário       | 5.000 req      | —                | —             |
| Free tier mensal       | —              | 100.000 req      | $200 crédito  |
| Tiles de mapa          | Gratuito (OSM) | $0.50 / 1k loads | $7 / 1k loads |
| **Adequado para MVP**  | ✅             | ✅               | ⚠️ caro       |

---

## 7. Busca Semântica com pgvector

### Por que adicionar busca semântica

A busca por filtros exatos resolve 80% dos casos. Mas falha quando o usuário digita de forma livre:

```
"comida leve"         → não encontra "saudável", "vegano", "japonês"
"lugar tranquilo"     → não mapeia para nenhum filtro estruturado
"igual àquele do centro" → zero resultado sem semântica
```

pgvector roda **no mesmo Supabase**, sem infraestrutura extra, e já está ativo por padrão.

---

### 7.1 Como funciona

```
Cadastro do lugar:
  nome + cozinhas + tipo + bairro
    → concatena em texto descritivo
    → envia para modelo de embedding (OpenAI text-embedding-3-small)
    → recebe vetor de 1536 floats
    → salva na coluna embedding da tabela places

Busca do usuário:
  "comida leve pra almoço"
    → mesmo modelo gera embedding da query
    → pgvector calcula distância coseno entre query e todos os lugares
    → retorna os semanticamente mais próximos
    → combinado com filtro geo (ST_DWithin) → resultado relevante E perto
```

---

### 7.2 Modelagem

```sql
-- Extensão (já ativa no Supabase)
CREATE EXTENSION IF NOT EXISTS vector;

-- Coluna adicionada à tabela places (migration separada, pós-MVP)
ALTER TABLE places ADD COLUMN embedding vector(1536);

-- Índice HNSW: melhor recall, ideal para buscas semânticas
-- (alternativa: ivfflat — mais rápido de criar, recall levemente inferior)
CREATE INDEX idx_places_embedding
  ON places
  USING hnsw (embedding vector_cosine_ops);
```

---

### 7.3 Busca combinada: geo + semântica

```sql
CREATE OR REPLACE FUNCTION search_places_semantic(
  p_lat          FLOAT,
  p_lng          FLOAT,
  p_radius_m     FLOAT,
  p_query_embed  vector(1536),   -- embedding gerado da query do usuário
  p_limit        INT DEFAULT 20
)
RETURNS TABLE (
  id           UUID,
  name         TEXT,
  distance_m   FLOAT,
  similarity   FLOAT            -- 0 a 1, quanto mais alto mais similar
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    ST_Distance(p.location, ST_MakePoint(p_lng, p_lat)::geography) AS distance_m,
    1 - (p.embedding <=> p_query_embed)                            AS similarity
  FROM places p
  WHERE
    p.status = 'approved'
    AND ST_DWithin(p.location, ST_MakePoint(p_lng, p_lat)::geography, p_radius_m)
    AND p.embedding IS NOT NULL
  ORDER BY
    -- score composto: 60% semântica + 40% proximidade
    ((1 - (p.embedding <=> p_query_embed)) * 0.6)
    + ((1.0 - LEAST(ST_Distance(p.location, ST_MakePoint(p_lng, p_lat)::geography) / p_radius_m, 1.0)) * 0.4)
    DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;
```

**Operadores pgvector:**

- `<=>` distância coseno (semântica — padrão para texto)
- `<->` distância euclidiana (L2)
- `<#>` produto interno negativo

---

### 7.4 Interface `IEmbeddingProvider` (isolamento por princípio D do SOLID)

Assim como `IMapProvider`, o modelo de embedding fica atrás de uma interface. Trocar de OpenAI para Gemini = 1 arquivo.

```typescript
// domain/interfaces/IEmbeddingProvider.ts
export interface IEmbeddingProvider {
  /**
   * Gera embedding de um texto.
   * Retorna array de floats (dimensões dependem do modelo).
   */
  embed(text: string): Promise<number[]>;
}
```

```typescript
// infrastructure/ai/OpenAIEmbeddingProvider.ts
import type { IEmbeddingProvider } from '@/domain/interfaces/IEmbeddingProvider';

export class OpenAIEmbeddingProvider implements IEmbeddingProvider {
  private readonly apiKey: string;
  private readonly model = 'text-embedding-3-small'; // 1536 dims, ~$0.02/1M tokens

  constructor(apiKey: string) {
    if (!apiKey) throw new Error('OpenAI API key não fornecida.');
    this.apiKey = apiKey;
  }

  async embed(text: string): Promise<number[]> {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input: text, model: this.model }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI embedding falhou: ${response.status}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  }
}
```

---

### 7.5 Texto descritivo para embedding no cadastro

O texto enviado para o modelo precisa ser rico o suficiente para capturar semântica:

```typescript
// application/use-cases/places/GeneratePlaceEmbedding.ts
function buildEmbeddingText(place: CreatePlaceDTO): string {
  return [
    place.name,
    place.establishmentType,
    place.cuisineTypes.join(', '),
    place.mealTypes.join(', '),
    place.bairro,
    place.cidade,
    place.priceBucket,
  ]
    .filter(Boolean)
    .join(' | ');
}
// Exemplo: "Temakeria Zen | restaurante | japonesa, sushi | almoço, jantar | Vila Madalena | São Paulo | 25_40"
```

---

### 7.6 Custo estimado

| Operação                    | Modelo                 | Custo              |
| --------------------------- | ---------------------- | ------------------ |
| Gerar embedding no cadastro | text-embedding-3-small | ~$0.000002 / lugar |
| Gerar embedding na busca    | text-embedding-3-small | ~$0.000002 / query |
| 10.000 cadastros            |                        | ~$0.02 total       |
| 100.000 buscas/mês          |                        | ~$0.20 total       |

**Custo prático: insignificante.** O free tier do MVP cobre tudo.

---

### 7.7 Estratégia de ativação

```
MVP (agora):
  → Busca por filtros estruturados (meal_type, cuisine, price, geo)
  → Coluna embedding criada mas NULL — migration já preparada, sem impacto

Pós-MVP (quando tiver dados reais):
  → Ativar generação de embedding no cadastro
  → Backfill dos lugares existentes (script único)
  → Ativar endpoint de busca semântica como opção paralela
  → A/B test: filtros estruturados vs semântica vs híbrido
```

---

## 8. SOLID Aplicado

### S — Single Responsibility

Cada classe/função faz uma coisa só.

```typescript
// ERRADO ❌ — mistura busca, cache e formatação
async function searchPlaces(lat, lng, filters) {
  const cache = await redis.get(`places:${lat}:${lng}`);
  if (cache) return JSON.parse(cache);
  const raw = await supabase.rpc('search_nearby_places', {...});
  const formatted = raw.map(p => ({ ...p, distanceLabel: formatDistance(p.distance_m) }));
  await redis.set(`places:${lat}:${lng}`, JSON.stringify(formatted), { ex: 300 });
  return formatted;
}

// CORRETO ✅ — cada responsabilidade em seu lugar
// Use Case: orquestra
class SearchNearbyPlaces {
  constructor(
    private placeRepo: IPlaceRepository,
    private cache: ICacheProvider,
  ) {}

  async execute(dto: SearchPlacesDTO): Promise<Place[]> {
    const key = buildGeoKey(dto);
    const cached = await this.cache.get<Place[]>(key);
    if (cached) return cached;

    const places = await this.placeRepo.searchNearby(dto);
    await this.cache.set(key, places, { ttl: 300 });
    return places;
  }
}
```

### O — Open/Closed

Adicionar novo filtro não quebra o código existente.

```typescript
// domain/interfaces/IPlaceRepository.ts
interface IPlaceRepository {
  searchNearby(params: SearchPlacesDTO): Promise<Place[]>;
  findById(id: string): Promise<Place | null>;
  create(data: CreatePlaceDTO): Promise<Place>;
  updateStatus(id: string, status: PlaceStatus): Promise<void>;
}

// Novos filtros entram no DTO, não na interface
interface SearchPlacesDTO {
  lat: number;
  lng: number;
  radiusMeters?: number;
  mealType?: MealType;
  cuisine?: CuisineType;
  maxPrice?: number;
  // fase 2: sem quebrar nada
  openNow?: boolean;
  minRating?: number;
}
```

### L — Liskov Substitution

Qualquer implementação de repositório pode substituir outra.

```typescript
// Implementação Supabase (produção)
class SupabasePlaceRepository implements IPlaceRepository {
  async searchNearby(params: SearchPlacesDTO): Promise<Place[]> {
    const { data } = await supabase.rpc('search_nearby_places', { ... });
    return data.map(toDomainPlace);
  }
}

// Implementação In-Memory (testes)
class InMemoryPlaceRepository implements IPlaceRepository {
  private places: Place[] = [];
  async searchNearby(params: SearchPlacesDTO): Promise<Place[]> {
    return this.places.filter(p => isWithinRadius(p, params));
  }
}
// Use cases testáveis sem banco, sem rede, sem Supabase
```

### I — Interface Segregation

Interfaces pequenas e focadas.

```typescript
// ERRADO ❌ — interface gorda
interface IRepository {
  findAll(): Promise<any[]>;
  findById(id: string): Promise<any>;
  create(data: any): Promise<any>;
  update(id: string, data: any): Promise<any>;
  delete(id: string): Promise<void>;
  search(query: string): Promise<any[]>;
  searchNearby(params: any): Promise<any[]>;
  getStats(): Promise<any>;
}

// CORRETO ✅ — interfaces segregadas por intenção
interface IPlaceReader {
  findById(id: string): Promise<Place | null>;
  searchNearby(params: SearchPlacesDTO): Promise<Place[]>;
}

interface IPlaceWriter {
  create(data: CreatePlaceDTO): Promise<Place>;
  updateStatus(id: string, status: PlaceStatus): Promise<void>;
}

interface IPlaceRepository extends IPlaceReader, IPlaceWriter {}
```

### D — Dependency Inversion

Use cases dependem de abstrações, nunca de Supabase diretamente.

```typescript
// src/presentation/lib/container.ts
// Composição raiz: único lugar que sabe quais implementações usar

import { SupabasePlaceRepository } from '@/infrastructure/database/supabase/SupabasePlaceRepository';
import { UpstashCacheProvider } from '@/infrastructure/cache/UpstashCacheProvider';
import { SearchNearbyPlaces } from '@/application/use-cases/places/SearchNearbyPlaces';
import { CreatePlace } from '@/application/use-cases/places/CreatePlace';

const placeRepository = new SupabasePlaceRepository();
const cacheProvider = new UpstashCacheProvider();

export const searchNearbyPlaces = new SearchNearbyPlaces(placeRepository, cacheProvider);
export const createPlace = new CreatePlace(placeRepository);

// API Route usa o container, nunca instancia repositórios
// src/presentation/app/api/places/route.ts
import { searchNearbyPlaces } from '@/presentation/lib/container';
```

---

## 9. Autenticação

### Fluxo Magic Link com Supabase Auth

```
1. POST /api/auth/magic-link  { email }
   → supabase.auth.signInWithOtp({ email, redirectTo })
   → Supabase envia email com link

2. Usuário clica no link
   → Redireciona para /auth/callback?token_hash=...&type=email

3. GET /auth/callback  (Next.js route handler)
   → supabase.auth.verifyOtp({ token_hash, type: 'email' })
   → Cria sessão (cookie httpOnly)
   → Redireciona para /

4. Sessão mantida via cookie seguro
   → SSR e API Routes acessam com createServerClient()
```

### Middleware de proteção de rotas

```typescript
// src/middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { supabase, response } = createServerClient(request);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isProtected =
    request.nextUrl.pathname.startsWith('/add-place') ||
    request.nextUrl.pathname.startsWith('/profile');

  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}
```

---

## 10. API Design

### Convenções

- Todas as rotas em `/api/`
- Validação com Zod em toda entrada
- Erros padronizados: `{ error: string, code: string }`
- Autenticação via cookie de sessão (nunca JWT no header em produção)

### Endpoints

```
GET  /api/places
     ?lat=float &lng=float &radius=int &meal=text &cuisine=text &maxPrice=int
     → 200 Place[]
     → 400 se lat/lng ausentes

POST /api/places                        (auth required)
     body: CreatePlaceDTO
     → 201 Place
     → 400 validation error
     → 401 não autenticado

GET  /api/places/:id
     → 200 Place + últimas reviews
     → 404 não encontrado

PATCH /api/places/:id                   (auth: owner ou admin)
     body: Partial<CreatePlaceDTO>
     → 200 Place atualizado
     → 403 sem permissão

GET  /api/places/:id/reviews
     → 200 Review[]

POST /api/places/:id/reviews            (auth required)
     body: SubmitReviewDTO
     → 201 Review
     → 409 já avaliou

POST /api/auth/magic-link
     body: { email: string }
     → 200 { message: 'Email enviado' }

POST /api/auth/logout
     → 200 + limpa cookie

GET  /api/me                            (auth required)
     → 200 UserProfile

POST /api/upload                        (auth required)
     body: FormData com arquivo
     → 200 { url: string }
     → 413 arquivo muito grande
```

---

## 11. Caching

### Estratégia em camadas

```
Layer 1: Vercel Edge Cache (CDN)
  → Páginas SSG e imagens
  → TTL: horas/dias

Layer 2: Upstash Redis (Server-side)
  → Resultados de busca geo (por célula de localização)
  → TTL: 60-300s conforme horário

Layer 3: SWR (Client-side)
  → Resultados já buscados no browser
  → Revalidação em background
  → staleWhileRevalidate: resultado instantâneo + refresh silencioso
```

### Invalidação de cache

```typescript
// Quando novo lugar é aprovado → invalida células de cache próximas
async function invalidateGeoCache(place: Place): Promise<void> {
  const pattern = `places:${roundCoord(place.lat)}:${roundCoord(place.lng)}:*`;
  await cacheProvider.deletePattern(pattern);
}
```

---

## 12. Design System

### Princípio central

> **Trocar todo o visual do site = editar 1 arquivo de tokens CSS.**  
> Nenhum componente carrega cor, espaçamento ou fonte hardcoded.

A estratégia tem três camadas:

```
Camada 1 — Design Tokens (CSS custom properties)
  globals.css → define :root com todas as variáveis
  → mudar aqui muda TODO o site instantaneamente

Camada 2 — Tailwind v4 mapeado nos tokens
  tailwind.config (CSS @theme) → utilities geradas a partir dos tokens
  → className="bg-brand" vira var(--color-brand) automaticamente

Camada 3 — Componentes com variantes (CVA)
  Button, Card, Badge → variantes type-safe (primary, secondary, ghost…)
  → sem inline styles, sem classes condicionais soltas
```

---

### 11.1 Design Tokens — fonte única da verdade

```css
/* src/styles/globals.css */
/* ÚNICO lugar que define visual. Trocar tema = trocar este bloco. */

@layer base {
  :root {
    /* --- Cores de marca --- */
    --color-brand: #f97316; /* laranja principal */
    --color-brand-hover: #ea6c0a;
    --color-brand-subtle: #fff7ed;

    /* --- Superfícies --- */
    --color-bg: #ffffff;
    --color-bg-subtle: #f9fafb;
    --color-bg-card: #ffffff;
    --color-border: #e5e7eb;

    /* --- Texto --- */
    --color-text-primary: #111827;
    --color-text-secondary: #6b7280;
    --color-text-disabled: #d1d5db;
    --color-text-inverse: #ffffff;

    /* --- Feedback --- */
    --color-success: #16a34a;
    --color-warning: #d97706;
    --color-error: #dc2626;
    --color-info: #2563eb;

    /* --- Espaçamento base --- */
    --spacing-page-x: 1rem; /* padding horizontal das páginas */
    --spacing-card-gap: 0.75rem;

    /* --- Tipografia --- */
    --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
    --font-size-base: 1rem;
    --line-height-base: 1.5;

    /* --- Raios de borda --- */
    --radius-sm: 0.375rem;
    --radius-md: 0.75rem;
    --radius-lg: 1rem;
    --radius-full: 9999px;

    /* --- Sombras --- */
    --shadow-card: 0 1px 3px 0 rgb(0 0 0 / 0.08);
    --shadow-modal: 0 10px 40px -4px rgb(0 0 0 / 0.15);
  }

  /* Tema escuro — basta adicionar estas overrides no futuro */
  /* @media (prefers-color-scheme: dark) { :root { ... } } */
}
```

---

### 11.2 Tailwind v4 consumindo os tokens

Tailwind v4 usa `@theme` em CSS puro — sem `tailwind.config.js`.

```css
/* src/styles/globals.css — continuação */

@import 'tailwindcss';

@theme {
  /* Tailwind gera: bg-brand, text-brand, border-brand, ring-brand… */
  --color-brand: var(--color-brand);
  --color-brand-hover: var(--color-brand-hover);
  --color-brand-subtle: var(--color-brand-subtle);
  --color-bg: var(--color-bg);
  --color-bg-subtle: var(--color-bg-subtle);
  --color-bg-card: var(--color-bg-card);
  --color-border: var(--color-border);
  --color-text-primary: var(--color-text-primary);
  --color-text-secondary: var(--color-text-secondary);
  --color-success: var(--color-success);
  --color-error: var(--color-error);

  --font-family-sans: var(--font-sans);
  --radius-sm: var(--radius-sm);
  --radius-md: var(--radius-md);
  --radius-lg: var(--radius-lg);
  --radius-full: var(--radius-full);
}
```

Resultado: `className="bg-brand text-text-secondary rounded-md"` — tudo resolvido via token, sem hex hardcoded em nenhum componente.

---

### 11.3 Componentes com variantes (CVA)

`class-variance-authority` garante que variantes de componentes sejam type-safe e centralizadas.

```typescript
// src/presentation/components/ui/Button.tsx
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  // base — sempre aplicado
  'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:   'bg-brand text-text-inverse hover:bg-brand-hover',
        secondary: 'bg-bg-subtle text-text-primary border border-border hover:bg-border',
        ghost:     'text-text-secondary hover:bg-bg-subtle hover:text-text-primary',
        danger:    'bg-error text-text-inverse hover:opacity-90',
      },
      size: {
        sm:   'h-8  px-3 text-sm',
        md:   'h-10 px-4 text-sm',
        lg:   'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return <button className={buttonVariants({ variant, size, className })} {...props} />;
}
```

```typescript
// Uso — tipo verificado em compile time
<Button variant="primary" size="lg">Buscar perto de mim</Button>
<Button variant="ghost" size="icon"><FilterIcon /></Button>
```

---

### 11.4 Estrutura de pastas do Design System

```
src/
├── styles/
│   └── globals.css            ← ÚNICO arquivo de tokens. Trocar tema = editar aqui.
│
└── presentation/
    └── components/
        └── ui/                ← Componentes primitivos (sem lógica de negócio)
            ├── Button.tsx
            ├── Input.tsx
            ├── Card.tsx
            ├── Badge.tsx      ← preço, refeição, cozinha
            ├── Sheet.tsx      ← bottom sheet mobile (filtros, reviews)
            ├── Skeleton.tsx   ← loading states
            └── index.ts       ← re-exporta tudo (barrel)
```

**Regras dos componentes `ui/`:**

- Zero conhecimento de domínio (`Place`, `Review` etc.)
- Zero chamadas de API ou hooks de dados
- Apenas aparência + variantes
- Toda cor/espaçamento via token — nunca hex ou número fixo

---

### 11.5 Como trocar o designer/tema em produção

```
Passo 1 — Atualizar os tokens em globals.css (:root)
  → Ex: trocar --color-brand de laranja para verde

Passo 2 — Ajustar variantes nos componentes ui/ se necessário
  → Ex: renomear variante, adicionar nova

Passo 3 — Deploy normal
  → Todo o site reflete as mudanças
```

Nenhuma página, hook ou use case precisa ser tocado para uma mudança visual completa.

---

## 13. PWA Config

```typescript
// src/app/manifest.ts
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Onde Comer',
    short_name: 'OndeComer',
    description: 'Descubra lugares para comer perto de você',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#f97316',
    orientation: 'portrait',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
```

### Service Worker com Serwist

```typescript
// next.config.ts
import withSerwist from '@serwist/next';

export default withSerwist({
  swSrc: 'src/sw.ts',
  swDest: 'public/sw.js',
})(nextConfig);

// src/sw.ts
import { defaultCache } from '@serwist/next/worker';
import { installSerwist } from '@serwist/sw';

installSerwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  runtimeCaching: [
    ...defaultCache,
    {
      // Cache de imagens de lugares (foto dos estabelecimentos)
      matcher: /^https:\/\/.*\.supabase\.co\/storage\/.*/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'place-images',
        expiration: { maxEntries: 100, maxAgeSeconds: 7 * 24 * 60 * 60 },
      },
    },
  ],
});
```

---

## 14. Deploy e Infraestrutura

### Diagrama de deploy

```
GitHub
  └─→ Vercel (CI/CD automático)
        ├─ Preview: PR branches
        └─ Production: main branch

Supabase
  ├─ Project: produção
  └─ Project: staging (branch do Supabase)

Upstash Redis
  └─ Database: produção (serverless, auto-scale)
```

### Variáveis de ambiente

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=     # apenas server-side

# Cache
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Maps
NEXT_PUBLIC_MAPBOX_TOKEN=

# App
NEXT_PUBLIC_APP_URL=           # para redirect do magic link
```

### Migrations via Supabase CLI

```bash
# Estrutura
supabase/
  migrations/
    20260101000000_init.sql
    20260101000001_create_places.sql
    20260101000002_create_reviews.sql
    20260101000003_create_indexes.sql
    20260101000004_rls_policies.sql
    20260101000005_search_function.sql
    20260101000006_update_stats_trigger.sql
```

---

## 15. Monitoramento

### Métricas de produto (Supabase Analytics + custom)

```sql
-- View para dashboard de métricas diárias
CREATE VIEW daily_metrics AS
SELECT
  DATE(created_at)             AS day,
  COUNT(*)                     AS new_places,
  COUNT(*) FILTER (WHERE status = 'approved') AS approved_places
FROM places
GROUP BY DATE(created_at)
ORDER BY day DESC;
```

### Performance monitoring

- **Vercel Analytics**: Web Vitals automático (LCP, FID, CLS)
- **Vercel Speed Insights**: tempo de resposta por rota
- **Supabase Dashboard**: slow queries + query planner
- **Meta alvo de performance:**
  - Busca geo (cache miss): < 400ms
  - Busca geo (cache hit): < 50ms
  - LCP mobile (3G): < 2.5s

---

## 16. Fases de Implementação

### Sprint 1 — Fundação (Semanas 1–2)

**Objetivo:** Infraestrutura funcionando, busca geo básica rodando.

| #    | Tarefa                                          | Critério de aceite                 |
| ---- | ----------------------------------------------- | ---------------------------------- |
| 1.1  | Setup Next.js 15 + Tailwind + TypeScript strict | `npm run dev` sem erros            |
| 1.2  | Supabase: projeto criado + migrations rodando   | `supabase db push` OK              |
| 1.3  | PostGIS: tabela `places` com coluna `geography` | INSERT + ST_DWithin funciona       |
| 1.4  | Índices GIST + GIN criados e validados          | EXPLAIN ANALYZE mostra Index Scan  |
| 1.5  | Função `search_nearby_places` SQL criada        | RPC retorna resultados ordenados   |
| 1.6  | Magic link auth funcionando end-to-end          | Login + sessão + logout            |
| 1.7  | Middleware de proteção de rotas                 | `/add-place` redireciona sem auth  |
| 1.8  | PWA manifest + service worker básico            | Lighthouse PWA score > 90          |
| 1.9  | Estrutura de pastas + interfaces domain criadas | Zero dependência em domain/        |
| 1.10 | Container de DI configurado                     | Use cases instanciam via container |

---

### Sprint 2 — Core Features (Semanas 3–4)

**Objetivo:** Usuário consegue buscar e cadastrar lugares.

| #    | Tarefa                                           | Critério de aceite                |
| ---- | ------------------------------------------------ | --------------------------------- |
| 2.1  | Hook `useGeolocation` + permissão no browser     | Captura lat/lng com fallback      |
| 2.2  | `SearchNearbyPlaces` use case + testes unitários | 100% testável sem banco           |
| 2.3  | API `GET /api/places` com todos os filtros       | Query params validados com Zod    |
| 2.4  | Feed principal com lista de lugares              | Renderiza cards com distância     |
| 2.5  | Filtros de preço + refeição + cozinha + raio     | Filtros atualizam busca           |
| 2.6  | Formulário multi-step de cadastro (6 steps)      | Completa em < 30s                 |
| 2.7  | API `POST /api/places` com validação             | Cria com status `pending`         |
| 2.8  | Upload de foto para Supabase Storage             | URL salva no lugar                |
| 2.9  | Geocoding via GPS (passo 1 do form)              | Captura localização com 1 clique  |
| 2.10 | Geocoding via endereço (Mapbox fallback)         | Busca endereço e preenche lat/lng |

---

### Sprint 3 — Qualidade e Moderação (Semanas 5–6)

**Objetivo:** Reviews funcionando, moderação básica, cache implementado.

| #    | Tarefa                                                 | Critério de aceite                     |
| ---- | ------------------------------------------------------ | -------------------------------------- |
| 3.1  | Tabela `reviews` + trigger de atualização de stats     | Rating e median_price atualizados auto |
| 3.2  | `SubmitReview` use case                                | Um review por usuário por lugar        |
| 3.3  | Formulário de review (👍/👎 + quanto pagou + refeição) | Submete em < 10s                       |
| 3.4  | Página de detalhe do lugar + lista de reviews          | Exibe todas informações                |
| 3.5  | Painel de admin (rota protegida por role)              | Aprovar/rejeitar lugares pendentes     |
| 3.6  | Upstash Redis integrado no use case de busca           | Cache hit visível nos logs             |
| 3.7  | Invalidação de cache ao aprovar lugar                  | Novo lugar aparece na busca            |
| 3.8  | Score de ranking composto implementado                 | Ordenação faz sentido                  |
| 3.9  | RLS policies completas testadas                        | Usuário B não edita lugar do A         |
| 3.10 | Testes de integração nas APIs críticas                 | CI não quebra com PRs                  |

---

### Sprint 4 — Polimento e Beta (Semanas 7–8)

**Objetivo:** Produto pronto para beta real com usuários reais.

| #    | Tarefa                                         | Critério de aceite                     |
| ---- | ---------------------------------------------- | -------------------------------------- |
| 4.1  | Mapa interativo com Mapbox (lista + mapa)      | Places exibidos como pins no mapa      |
| 4.2  | Onboarding para novos usuários                 | Explica como funciona em 3 telas       |
| 4.3  | Empty states e error states em todas as telas  | Nunca tela em branco sem contexto      |
| 4.4  | Loading skeletons para listas                  | UX fluida em 3G                        |
| 4.5  | Vercel Analytics + Speed Insights configurados | Dashboard de Web Vitals ativo          |
| 4.6  | Meta tags OG para compartilhamento de lugares  | Link de lugar gera preview no WhatsApp |
| 4.7  | Testes A/B de filtros (qual ordem importa)     | Hipótese definida e medida             |
| 4.8  | EXPLAIN ANALYZE nas 3 queries mais usadas      | Nenhum Seq Scan em produção            |
| 4.9  | Checklist OWASP: XSS, CSRF, IDOR revisados     | Nenhuma vulnerabilidade crítica        |
| 4.10 | Beta launch com 20–50 usuários reais           | Primeiros dados reais de uso           |

---

## 17. Decisões Técnicas Críticas

### Por que LocationIQ e não Google Maps ou Mapbox?

|                  | LocationIQ (MVP)              | Mapbox            | Google Maps    |
| ---------------- | ----------------------------- | ----------------- | -------------- |
| Geocoding        | ~$1 / 1.000 req               | $0.75 / 1.000 req | $5 / 1.000 req |
| Free tier diário | **5.000 req/dia**             | —                 | —              |
| Free tier mensal | —                             | 100.000 req       | $200 crédito   |
| Tiles de mapa    | **Gratuito (OSM)**            | $0.50 / 1k loads  | $7 / 1k loads  |
| Lock-in          | Baixo (isolado por interface) | Moderado          | Alto           |

LocationIQ oferece free tier diário generoso, tiles gratuitos via OpenStreetMap e custo de geocoding competitivo. O isolamento via `IMapProvider` garante que a troca de provedor no futuro seja uma mudança de 1 arquivo.

---

### Por que não usar Prisma + Postgres standalone?

Supabase inclui PostGIS, Auth, Storage e RLS prontos. Configurar tudo do zero com Prisma + servidor próprio dobraria o tempo de desenvolvimento sem benefício real no MVP.

Prisma não tem suporte nativo a tipos PostGIS. Queries geo precisariam de raw SQL de qualquer forma.

---

### Por que PostGIS e não MongoDB geospatial ou Elasticsearch?

|                    | PostGIS            | MongoDB Geo        | Elasticsearch Geo |
| ------------------ | ------------------ | ------------------ | ----------------- |
| Precisão (metros)  | ✅ geography type  | ⚠️ apenas geometry | ✅                |
| SQL + joins        | ✅                 | ❌                 | ❌                |
| Custo              | $0 (Supabase free) | $57/mês mínimo     | $95/mês mínimo    |
| Supabase integrado | ✅                 | ❌                 | ❌                |
| Índice espacial    | GIST (robusto)     | 2dsphere           | Geohash           |

PostGIS no Supabase é **gratuito, preciso e integrado**.

---

### Escalabilidade futura (pós-MVP)

Quando o volume justificar:

1. **Read replicas Supabase** — buscas geo em réplica, escritas no primário
2. **Supabase Edge Functions** — lógica pesada próxima do banco
3. **Geohash para cache** — dividir o mundo em células fixas para cache mais eficiente
4. **Materialized Views** — pré-computar score de ranking por bairro
5. **pgvector ativo** — ver Seção 7 (estratégia já documentada e migration preparada)

---

_Documento gerado com base nas especificações do produto. Versão de arquitetura para o MVP. Revisão recomendada antes de cada sprint._
