# Database Architecture Proposal

**Data:** 2026-05-04  
**Autor:** Staff Engineer Review  
**Escopo:** Schema atual → proposta de refatoração + plano de migração sem downtime

---

## Executive Summary

### Problema atual

O schema atual é funcional para o MVP mas carrega decisões de modelagem que vão gerar dívida técnica conforme o produto cresce. Os três problemas críticos são:

1. **Arrays de strings sem integridade referencial** — `cuisine_types TEXT[]` e `meal_types TEXT[]` permitem qualquer valor; a tipagem só existe no TypeScript, não no banco. Filtros com `ANY()` em arrays não escalam tão bem quanto joins em tabelas pivô.
2. **Dados derivados denormalizados diretamente em `places`** — `rating`, `reviews_count` e `median_price` são calculados por trigger sobre `places`. O trigger atual tem um bug crítico: na última versão da `search_nearby_places`, o filtro `status = 'approved'` foi removido acidentalmente, expondo lugares pendentes/rejeitados.
3. **`establishment_type TEXT`** — campo livre sem constraint nenhuma além de NOT NULL. Qualquer string pode ser inserida.

### Melhorias propostas

- PostgreSQL ENUMs para `establishment_type`, `cuisine_type`, `meal_type`, `price_bucket`
- Tabelas pivô `place_cuisines` e `place_meals` em substituição aos arrays
- Tabela `place_stats` separada para dados derivados (ou materialized view)
- Cache de `email` em `profiles` para eliminar chamada `auth.admin.getUserById` em cada leitura
- Tabelas `favorites` e `lists` já modeladas para as features planejadas
- Correção do bug de `status` na função de busca

### Impacto esperado

| Área | Antes | Depois |
|---|---|---|
| Integridade de tipos | Runtime TS only | DB + TS |
| Queries de filtro | `ANY()` em array | join em tabela pivô com índice |
| Stats de lugar | Trigger em `places` | Tabela dedicada, queries explícitas |
| Leitura de perfil | 2 round-trips (profile + auth admin API) | 1 query |
| Features futuras | Sem schema | Favorites + Lists já modelados |

---

## Current Schema Analysis

### Tabela `places` — fazendo trabalho demais

```sql
-- Responsabilidades misturadas na mesma tabela:
id, name, address, bairro, cidade, estado  -- identidade e endereço
location, lat, lng                          -- geo (duplicado — dois formatos do mesmo dado)
establishment_type, cuisine_types, meal_types, price_bucket  -- classificação
rating, reviews_count, median_price         -- stats derivados de reviews
photo_url                                   -- DEPRECATED, mantido por backwards compat
embedding                                   -- AI (pós-MVP)
status, created_by, created_at, updated_at  -- workflow + auditoria
```

**Problemas específicos:**

**1. `cuisine_types TEXT[]` e `meal_types TEXT[]`**

```sql
-- Permite inserir qualquer coisa:
INSERT INTO places (cuisine_types) VALUES ('{"Brasileira", "JAPONESA", "sushii", "qualquer coisa"}');

-- GIN index funciona, mas:
-- - Sem integridade referencial
-- - Sem metadados na relação (ex: "serve sushi só no jantar")
-- - Conta de agregação exige `unnest()`: "quantos lugares têm culinária japonesa?"
SELECT COUNT(DISTINCT p.id) FROM places p WHERE 'japonesa' = ANY(p.cuisine_types);
-- vs. com tabela pivô:
SELECT COUNT(*) FROM place_cuisines WHERE cuisine_type = 'japonesa';
```

**2. `establishment_type TEXT`**

Sem CHECK constraint, sem enum, sem lookup table. Valor completamente livre. Dados históricos provavelmente já têm variações de case e typos (`"Restaurante"`, `"restaurante"`, `"Restarante"`).

**3. `rating`, `reviews_count`, `median_price` em `places`**

Dados derivados persistidos. O trigger `update_place_stats` os atualiza após cada insert/update/delete em `reviews`. Riscos:

- Trigger silencioso em falha (sem logging)
- Escrita em `places` em cada review cria contenção de lock na tabela principal
- `median_price` baseado em `amount_paid` das reviews é uma estimativa frágil

**4. Bug crítico na função de busca (migration `20260503000007`)**

A última versão da `search_nearby_places` removeu o filtro `status = 'approved'`:

```sql
-- Versão original (correto):
WHERE p.status = 'approved' AND ST_DWithin(...)

-- Versão "corrigida" (bug!):
WHERE ST_DWithin(...)  -- lugares pendentes e rejeitados aparecem na busca
```

Também introduziu filtro de preço quebrado:
```sql
-- String comparison de enum — não funciona como esperado:
AND (p_max_price IS NULL OR p.price_bucket <= p_max_price::TEXT)
-- '40_70' <= '70_plus' é TRUE, mas '40_70' <= '25_40' também pode ser TRUE
-- dependendo de colação de string, não de ordem de preço
```

**5. `lat` e `lng` duplicando `location GEOGRAPHY`**

Dois formatos do mesmo dado. A coluna `location GEOGRAPHY(POINT, 4326)` já contém lat/lng como `ST_X()` e `ST_Y()`. As colunas `lat` e `lng` existem por conveniência de query simples, mas criam risco de inconsistência se não mantidas em sync.

**6. `photo_url TEXT` deprecated**

A migration `20260503000005` criou `place_photos`, migrou os dados, e marcou `photo_url` como deprecated — mas o campo ainda existe no schema. É dead weight que confunde leitura do código.

**7. `profiles` exige dois round-trips para montar `User`**

```typescript
// SupabaseUserRepository.findById():
const { data } = await this.db.from('profiles').select('*').eq('id', id).single();
// Depois:
const { data } = await admin.auth.admin.getUserById(profile.id);  // chamada HTTP ao Supabase Auth
```

Para cada leitura de perfil, há uma chamada à API admin do Supabase. Isso é lento e cria coupling com o sistema de auth.

**8. Sem índice em `reviews.user_id`**

`IReviewRepository.findByUser()` é chamado mas não há índice em `reviews(user_id)`. Full scan em tabela de reviews.

**9. Features planejadas sem schema**

`favorites` e `lists` (coleções) estão no roadmap do produto mas sem schema definido.

---

## Proposed Architecture

O objetivo é normalizar sem over-engineer. A regra é: se uma relação vai ter metadata própria ou precisa de integridade referencial, ela vira tabela pivô. Se é apenas um valor escalar constrained, vira enum.

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│    profiles     │     │     places       │     │   place_stats   │
│ (usuários)      │     │ (core enxuto)    │     │ (dados derivados│
│                 │     │                  │     │  de reviews)    │
└────────┬────────┘     └────────┬─────────┘     └─────────────────┘
         │                       │
         │               ┌───────┴────────┐
         │               │                │
         │       ┌───────▼──────┐  ┌──────▼───────┐
         │       │place_cuisines│  │  place_meals  │
         │       └──────────────┘  └──────────────┘
         │
         │               ┌──────────────────┐
         └───────────────► reviews           │
                         │ (thumbs_up, price)│
                         └──────────────────┘
         │
         ├───────────────► favorites
         │
         └───────────────► lists ──► list_places
```

---

## Entity Descriptions

### `places` — core enxuto

Apenas dados estruturais e imutáveis do lugar. Sem stats, sem arrays de classificação.

```sql
CREATE TYPE establishment_type AS ENUM (
  'restaurante', 'lanchonete', 'cafeteria', 'bar', 'padaria',
  'sorveteria', 'food_truck', 'mercado', 'confeitaria', 'outro'
);

CREATE TYPE price_bucket AS ENUM (
  'up_to_15', '15_25', '25_40', '40_70', '70_plus'
);

CREATE TABLE places (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL CHECK (length(trim(name)) >= 2),
  address             TEXT NOT NULL,
  numero              TEXT,
  complemento         TEXT,
  bairro              TEXT,
  cidade              TEXT NOT NULL,
  estado              CHAR(2) NOT NULL,
  location            GEOGRAPHY(POINT, 4326) NOT NULL,
  -- lat/lng mantidos como conveniência, gerados automaticamente (trigger ou app)
  lat                 NUMERIC(10, 7) NOT NULL GENERATED ALWAYS AS (ST_Y(location::geometry)) STORED,
  lng                 NUMERIC(10, 7) NOT NULL GENERATED ALWAYS AS (ST_X(location::geometry)) STORED,
  establishment_type  establishment_type NOT NULL,
  price_bucket        price_bucket NOT NULL,
  embedding           vector(1536),
  status              TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_by          UUID REFERENCES auth.users(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Responsabilidade única:** identidade, localização, tipo, preço, workflow de moderação.

---

### `place_stats` — dados derivados

Separado de `places` para eliminar lock contention. Atualizado por trigger nas reviews.

```sql
CREATE TABLE place_stats (
  place_id        UUID PRIMARY KEY REFERENCES places(id) ON DELETE CASCADE,
  rating          NUMERIC(3, 2) NOT NULL DEFAULT 0,
  reviews_count   INTEGER NOT NULL DEFAULT 0,
  thumbs_up_count INTEGER NOT NULL DEFAULT 0,
  median_price    NUMERIC(8, 2),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Responsabilidade:** cache de métricas calculadas. Sempre consistente com `reviews`.

---

### `place_cuisines` — pivot N:N

```sql
CREATE TYPE cuisine_type AS ENUM (
  'brasileira', 'japonesa', 'italiana', 'árabe', 'chinesa', 'mexicana',
  'americana', 'portuguesa', 'francesa', 'indiana', 'peruana',
  'vegana', 'vegetariana', 'frutos_do_mar', 'churrasco', 'pizza',
  'sushi', 'fast_food', 'padaria', 'doces', 'outras'
);

CREATE TABLE place_cuisines (
  place_id     UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  cuisine_type cuisine_type NOT NULL,
  PRIMARY KEY (place_id, cuisine_type)
);
```

**Responsabilidade:** relação entre lugar e tipos de cozinha.

---

### `place_meals` — pivot N:N

```sql
CREATE TYPE meal_type AS ENUM (
  'cafe', 'almoco', 'lanche', 'jantar', 'rodizio'
);

CREATE TABLE place_meals (
  place_id  UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  meal_type meal_type NOT NULL,
  PRIMARY KEY (place_id, meal_type)
);
```

**Responsabilidade:** relação entre lugar e tipos de refeição.

> **Nota sobre acentos em ENUMs:** ENUMs em Postgres são case-sensitive e suportam UTF-8, mas nomes de enum com acentos (`'café'`, `'almoço'`) causam problemas em alguns ORMs e drivers. Recomendado usar versões sem acento (`'cafe'`, `'almoco'`) no banco e manter os labels de exibição na camada de apresentação.

---

### `reviews`

```sql
CREATE TABLE reviews (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id     UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id),
  thumbs_up    BOOLEAN NOT NULL,
  amount_paid  NUMERIC(8, 2) CHECK (amount_paid IS NULL OR amount_paid >= 0),
  meal_type    meal_type,
  comment      TEXT CHECK (comment IS NULL OR length(comment) <= 500),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (place_id, user_id)
);
```

---

### `place_photos`

Sem mudança estrutural relevante. Remover backfill da migration e formalizar o `status` como guardião.

```sql
CREATE TABLE place_photos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id     UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  url          TEXT NOT NULL,
  type         TEXT NOT NULL CHECK (type IN ('logo', 'cover', 'gallery')),
  position     SMALLINT NOT NULL DEFAULT 0,
  uploaded_by  UUID REFERENCES auth.users(id),
  uploaded_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### `profiles`

Adicionar `email` para eliminar chamada ao auth admin em leituras de perfil.

```sql
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  nickname    TEXT UNIQUE NOT NULL,
  name        TEXT,
  headline    TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

O trigger `handle_new_user` já tem `NEW.email` disponível — basta inserir.

---

### `favorites`

```sql
CREATE TABLE favorites (
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  place_id   UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, place_id)
);
```

---

### `lists`

```sql
CREATE TABLE lists (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL CHECK (length(trim(name)) >= 1),
  description TEXT,
  is_public   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE list_places (
  list_id    UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  place_id   UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  position   SMALLINT NOT NULL DEFAULT 0,
  note       TEXT,
  added_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (list_id, place_id)
);
```

---

## Relations

| Relação | Tipo | Constraint |
|---|---|---|
| `place` → `place_stats` | 1:1 | FK + ON DELETE CASCADE |
| `place` → `place_cuisines` | 1:N | PK (place_id, cuisine_type) |
| `place` → `place_meals` | 1:N | PK (place_id, meal_type) |
| `place` → `place_photos` | 1:N | FK |
| `place` → `reviews` | 1:N | FK + UNIQUE(place_id, user_id) — um review por user |
| `user` → `reviews` | 1:N | FK |
| `user` → `favorites` | N:N via favorites | PK(user_id, place_id) |
| `user` → `lists` | 1:N | FK (owner_id) |
| `list` → `list_places` | N:N via list_places | PK(list_id, place_id) |

---

## Typing Strategy

### Por que não strings livres

```sql
-- Com TEXT livre, o banco aceita tudo silenciosamente:
INSERT INTO places (establishment_type) VALUES ('Restarante');  -- typo
INSERT INTO places (establishment_type) VALUES ('RESTAURANTE'); -- case errado
INSERT INTO places (establishment_type) VALUES ('restaurant');  -- inglês

-- Com ENUM, o banco rejeita no nível de storage:
INSERT INTO places (establishment_type) VALUES ('restarante');
-- ERROR: invalid input value for enum establishment_type: "restarante"
```

### Por que não CHECK constraints em vez de ENUM

ENUMs em Postgres têm indexação mais eficiente para equi-joins e ocupam 4 bytes de armazenamento versus comprimento variável de TEXT. A desvantagem é que adicionar valores ao ENUM requer `ALTER TYPE ... ADD VALUE` — mas isso é não-bloqueante desde Postgres 12.

### Mapeamento TypeScript → SQL

```typescript
// TypeScript (domain/value-objects/)
export const ESTABLISHMENT_TYPES = [
  'restaurante', 'lanchonete', 'cafeteria', 'bar', 'padaria',
  'sorveteria', 'food_truck', 'mercado', 'confeitaria', 'outro'
] as const;
export type EstablishmentType = (typeof ESTABLISHMENT_TYPES)[number];
```

Manter os arrays `as const` no TypeScript como fonte de verdade para o frontend. Os ENUMs do banco são derivados deles. Quando adicionar um novo tipo, adicionar no TypeScript e criar migration com `ALTER TYPE`.

---

## Derived Data Strategy

### O que não salvar diretamente em `places`

| Campo | Por quê não em `places` |
|---|---|
| `rating` | Derivado de reviews; salvar em `places` cria lock contention e risco de drift |
| `reviews_count` | Idem |
| `thumbs_up_count` | Idem |
| `median_price` | Estimativa volátil baseada em `amount_paid` dos reviews |

### Opção A: tabela `place_stats` + trigger (recomendado)

```sql
CREATE OR REPLACE FUNCTION update_place_stats()
RETURNS TRIGGER AS $$
DECLARE
  v_place_id UUID;
BEGIN
  v_place_id := COALESCE(NEW.place_id, OLD.place_id);

  INSERT INTO place_stats (place_id, rating, reviews_count, thumbs_up_count, median_price)
  SELECT
    v_place_id,
    ROUND(AVG(CASE WHEN thumbs_up THEN 1.0 ELSE 0.0 END) * 5, 2),
    COUNT(*),
    COUNT(*) FILTER (WHERE thumbs_up),
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY amount_paid)
      FILTER (WHERE amount_paid IS NOT NULL)
  FROM reviews
  WHERE place_id = v_place_id
  ON CONFLICT (place_id) DO UPDATE SET
    rating          = EXCLUDED.rating,
    reviews_count   = EXCLUDED.reviews_count,
    thumbs_up_count = EXCLUDED.thumbs_up_count,
    median_price    = EXCLUDED.median_price,
    updated_at      = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

Vantagem sobre trigger atual: usa `INSERT ... ON CONFLICT DO UPDATE` (upsert atômico), não trava a tabela `places`.

### Opção B: materialized view (para futuro)

Quando o volume de reviews justificar refresh periódico (ao invés de por evento), trocar trigger por materialized view com `REFRESH MATERIALIZED VIEW CONCURRENTLY`.

---

## Performance & Indexing

```sql
-- Geo (obrigatório)
CREATE INDEX idx_places_location ON places USING GIST(location);

-- Workflow de moderação
CREATE INDEX idx_places_status ON places(status) WHERE status != 'approved';

-- Filtro por tipo de estabelecimento
CREATE INDEX idx_places_establishment ON places(establishment_type);

-- Filtro por preço
CREATE INDEX idx_places_price_bucket ON places(price_bucket);

-- Culinária — lookup e joins
CREATE INDEX idx_place_cuisines_cuisine ON place_cuisines(cuisine_type);
CREATE INDEX idx_place_cuisines_place ON place_cuisines(place_id);

-- Refeição
CREATE INDEX idx_place_meals_meal ON place_meals(meal_type);

-- Reviews por usuário (ausente hoje)
CREATE INDEX idx_reviews_user_id ON reviews(user_id);

-- Stats por score (feed principal)
CREATE INDEX idx_place_stats_rating ON place_stats(rating DESC);
CREATE INDEX idx_place_stats_reviews ON place_stats(reviews_count DESC);

-- Fotos
CREATE INDEX idx_place_photos_type ON place_photos(place_id, type);

-- Favorites por usuário
CREATE INDEX idx_favorites_user ON favorites(user_id);

-- Listas por dono
CREATE INDEX idx_lists_owner ON lists(owner_id);

-- AI
CREATE INDEX idx_places_embedding ON places USING hnsw (embedding vector_cosine_ops);
```

### Query principal refatorada (com pivot tables)

```sql
CREATE OR REPLACE FUNCTION search_nearby_places(
  p_lat          NUMERIC,
  p_lng          NUMERIC,
  p_radius_m     INTEGER  DEFAULT 3000,
  p_meal_type    meal_type DEFAULT NULL,
  p_cuisine      cuisine_type DEFAULT NULL,
  p_max_price    price_bucket DEFAULT NULL,
  p_limit        INTEGER  DEFAULT 20,
  p_offset       INTEGER  DEFAULT 0
)
RETURNS TABLE (
  id                 UUID,
  name               TEXT,
  address            TEXT,
  numero             TEXT,
  bairro             TEXT,
  cidade             TEXT,
  estado             TEXT,
  lat                NUMERIC,
  lng                NUMERIC,
  establishment_type establishment_type,
  price_bucket       price_bucket,
  logo_url           TEXT,
  rating             NUMERIC,
  reviews_count      INTEGER,
  distance_m         NUMERIC
) AS $$
DECLARE
  v_point GEOGRAPHY := ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography;
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.address,
    p.numero,
    p.bairro,
    p.cidade,
    p.estado,
    p.lat,
    p.lng,
    p.establishment_type,
    p.price_bucket,
    ph.url AS logo_url,
    COALESCE(s.rating, 0),
    COALESCE(s.reviews_count, 0),
    ST_Distance(p.location, v_point)::NUMERIC AS distance_m
  FROM places p
  LEFT JOIN place_stats s ON s.place_id = p.id
  LEFT JOIN LATERAL (
    SELECT url FROM place_photos
    WHERE place_id = p.id AND type = 'logo'
    ORDER BY position LIMIT 1
  ) ph ON true
  WHERE
    p.status = 'approved'                                              -- filtro de status de volta
    AND ST_DWithin(p.location, v_point, p_radius_m)                   -- usa GIST index
    AND (p_meal_type IS NULL OR EXISTS (
      SELECT 1 FROM place_meals pm
      WHERE pm.place_id = p.id AND pm.meal_type = p_meal_type
    ))
    AND (p_cuisine IS NULL OR EXISTS (
      SELECT 1 FROM place_cuisines pc
      WHERE pc.place_id = p.id AND pc.cuisine_type = p_cuisine
    ))
    AND (p_max_price IS NULL OR p.price_bucket <= p_max_price)        -- enum comparison é correto
  ORDER BY
    (
      (1.0 - LEAST(ST_Distance(p.location, v_point) / p_radius_m, 1.0)) * 0.4
      + (COALESCE(s.rating, 0) / 5.0) * 0.4
      + (LOG(GREATEST(COALESCE(s.reviews_count, 0), 1)) / 5.0) * 0.2
    ) DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;
```

> **Nota sobre enum ordering:** `price_bucket <= p_max_price` só funciona corretamente se os valores do enum forem declarados na ordem crescente de preço (`'up_to_15', '15_25', '25_40', '40_70', '70_plus'`). Postgres compara ENUMs pela ordem de declaração.

---

## Migration Plan

### Princípio

Zero downtime. Cada fase é reversível antes do Switch. A aplicação continua lendo e escrevendo normalmente em cada fase.

---

### Fase 1 — Criação paralela + correção de bugs urgentes

**Objetivo:** criar a nova estrutura sem tocar nos dados existentes. Corrigir o bug de `status` imediatamente.

```sql
-- 1a. Corrigir bug urgente na search function (restaurar filtro de status)
-- Migration: 20260505000001_fix_search_status_filter.sql
CREATE OR REPLACE FUNCTION search_nearby_places(...) AS $$
  ...
  WHERE p.status = 'approved'  -- RESTAURAR esta linha
  AND ST_DWithin(...)
  ...
$$ LANGUAGE plpgsql STABLE;

-- 1b. Criar ENUMs
-- Migration: 20260505000002_create_enums.sql
CREATE TYPE establishment_type AS ENUM (...);
CREATE TYPE cuisine_type AS ENUM (...);
CREATE TYPE meal_type AS ENUM (...);
CREATE TYPE price_bucket_enum AS ENUM ('up_to_15', '15_25', '25_40', '40_70', '70_plus');

-- 1c. Criar tabelas novas (sem remover antigas)
-- Migration: 20260505000003_create_normalized_tables.sql
CREATE TABLE place_cuisines (...);
CREATE TABLE place_meals (...);
CREATE TABLE place_stats (...);
CREATE TABLE favorites (...);
CREATE TABLE lists (...);
CREATE TABLE list_places (...);

-- 1d. Adicionar coluna email em profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
UPDATE profiles p
SET email = u.email
FROM auth.users u
WHERE u.id = p.id;
ALTER TABLE profiles ALTER COLUMN email SET NOT NULL;
```

**Duração estimada:** 1 dia  
**Risco:** baixo — apenas criação e correção de bug

---

### Fase 2 — Dual Write

**Objetivo:** a aplicação escreve nos dois formatos simultaneamente (arrays antigos + tabelas pivô novas).

Modificar `SupabasePlaceRepository.create()` e `update()`:

```typescript
// Ao criar um lugar, escrever cuisine_types NO array antigo E nas novas tabelas
async create(data: CreatePlaceData): Promise<Place> {
  const { data: row } = await this.db.from('places').insert({
    ...
    cuisine_types: data.cuisineTypes,  // mantém array antigo
    meal_types: data.mealTypes,        // mantém array antigo
  }).select().single();

  // Dual write nas tabelas novas
  if (data.cuisineTypes.length > 0) {
    await this.db.from('place_cuisines').insert(
      data.cuisineTypes.map(ct => ({ place_id: row.id, cuisine_type: ct }))
    );
  }
  if (data.mealTypes.length > 0) {
    await this.db.from('place_meals').insert(
      data.mealTypes.map(mt => ({ place_id: row.id, meal_type: mt }))
    );
  }

  return toDomain(row);
}
```

Também atualizar o trigger `update_place_stats` para popular `place_stats` em vez de `places`.

**Duração estimada:** 2 dias  
**Risco:** médio — nova lógica de escrita. Testar bem os casos de update parcial.

---

### Fase 3 — Backfill

**Objetivo:** popular `place_cuisines`, `place_meals` e `place_stats` com os dados históricos.

```sql
-- Migration: 20260505000004_backfill_pivot_tables.sql

-- Backfill place_cuisines
INSERT INTO place_cuisines (place_id, cuisine_type)
SELECT p.id, unnest(p.cuisine_types)::cuisine_type
FROM places p
ON CONFLICT DO NOTHING;

-- Backfill place_meals
INSERT INTO place_meals (place_id, meal_type)
SELECT p.id, unnest(p.meal_types)::meal_type
FROM places p
ON CONFLICT DO NOTHING;

-- Backfill place_stats
INSERT INTO place_stats (place_id, rating, reviews_count, thumbs_up_count, median_price)
SELECT
  place_id,
  ROUND(AVG(CASE WHEN thumbs_up THEN 1.0 ELSE 0.0 END) * 5, 2),
  COUNT(*),
  COUNT(*) FILTER (WHERE thumbs_up),
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY amount_paid)
    FILTER (WHERE amount_paid IS NOT NULL)
FROM reviews
GROUP BY place_id
ON CONFLICT (place_id) DO UPDATE SET
  rating          = EXCLUDED.rating,
  reviews_count   = EXCLUDED.reviews_count,
  thumbs_up_count = EXCLUDED.thumbs_up_count,
  median_price    = EXCLUDED.median_price;

-- Backfill email em profiles (se ainda houver NULLs)
UPDATE profiles p
SET email = u.email
FROM auth.users u
WHERE u.id = p.id AND p.email IS NULL;
```

**Validação antes de continuar:**

```sql
-- Verificar que place_cuisines tem mesma contagem que arrays:
SELECT
  (SELECT COUNT(*) FROM place_cuisines) AS pivot_count,
  (SELECT SUM(array_length(cuisine_types, 1)) FROM places WHERE cuisine_types != '{}') AS array_count;
-- Devem ser iguais

-- Verificar place_stats cobre todos os lugares com reviews:
SELECT COUNT(*) FROM reviews r
LEFT JOIN place_stats s ON s.place_id = r.place_id
WHERE s.place_id IS NULL;
-- Deve ser 0
```

**Duração estimada:** 1 dia  
**Risco:** baixo — apenas escrita em tabelas novas, leitura ainda do antigo

---

### Fase 4 — Switch (leitura da nova estrutura)

**Objetivo:** `search_nearby_places` e os repositórios passam a ler das novas tabelas.

Passos:
1. Atualizar `search_nearby_places` para usar `place_stats` e joins em `place_cuisines`/`place_meals` (SQL da seção Performance acima)
2. Atualizar `SupabasePlaceRepository.findById()` para join com `place_stats`
3. Atualizar `SupabaseUserRepository.findById()` para ler `email` de `profiles` sem chamada admin

```typescript
// findById sem auth admin call
async findById(id: string): Promise<User | null> {
  const { data, error } = await this.db
    .from('profiles')
    .select('id, email, nickname, name, headline, avatar_url, created_at')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return {
    id: data.id,
    email: data.email,
    nickname: data.nickname,
    name: data.name ?? undefined,
    headline: data.headline ?? undefined,
    avatarUrl: data.avatar_url ?? undefined,
    createdAt: new Date(data.created_at),
  };
}
```

**Feature flag opcional:** envolver a nova query em `process.env.USE_NORMALIZED_SCHEMA === 'true'` durante os primeiros dias em produção para permitir rollback rápido.

**Duração estimada:** 2–3 dias  
**Risco:** médio-alto — mudança de leitura em produção. Monitorar latência de queries.

---

### Fase 5 — Cleanup

**Objetivo:** remover estrutura antiga após 1–2 semanas estável em produção.

```sql
-- Migration: 20260505000005_cleanup_deprecated_columns.sql

-- Remover dual write do código primeiro (Fase 2 → apenas nova estrutura)
-- Depois:
ALTER TABLE places DROP COLUMN cuisine_types;
ALTER TABLE places DROP COLUMN meal_types;
ALTER TABLE places DROP COLUMN rating;
ALTER TABLE places DROP COLUMN reviews_count;
ALTER TABLE places DROP COLUMN median_price;
ALTER TABLE places DROP COLUMN photo_url;  -- deprecated desde 20260503000005

-- Converter establishment_type de TEXT para ENUM
ALTER TABLE places
  ALTER COLUMN establishment_type TYPE establishment_type
  USING establishment_type::establishment_type;

-- Converter price_bucket de TEXT para ENUM
ALTER TABLE places
  ALTER COLUMN price_bucket TYPE price_bucket_enum
  USING price_bucket::price_bucket_enum;

-- Dropar trigger antigo (stats agora em place_stats)
DROP TRIGGER trigger_update_place_stats ON reviews;
-- Criar novo trigger que popula place_stats (upsert)
```

**Riscos e mitigação:**

| Risco | Mitigação |
|---|---|
| Backfill incompleto (Fase 3) | Validar contagens antes de prosseguir |
| Typos em `establishment_type` histórico | Mapear valores inválidos para `'outro'` antes da conversão |
| Performance pior com joins vs. array | Medir queries em staging com volume realista antes do Switch |
| Rollback do Switch | Feature flag permite revert em < 5 min |

---

## Evolution Strategy

### Novos filtros

Com tabelas pivô, adicionar um novo tipo de culinária é `ALTER TYPE cuisine_type ADD VALUE 'coreana'` — não bloqueante. Com arrays de texto, seria apenas adicionar o valor ao TypeScript (mas sem garantia no banco).

### Ranking mais inteligente

`place_stats` tem `thumbs_up_count` separado de `reviews_count`. Isso permite calcular `recommendation_rate` (thumbs_up / total) sem recalcular. Pode ser adicionada uma coluna `score` pré-calculada ao `place_stats` para queries ultra-rápidas de feed.

### Features sociais

`favorites` e `lists` já estão modelados. Quando implementar:
- "Meus favoritos": `SELECT * FROM places JOIN favorites ON ... WHERE user_id = ?`
- "Listas públicas": `SELECT * FROM lists WHERE is_public = true ORDER BY updated_at`
- Feed social: "Amigos favoritaram X" requer tabela `follows(follower_id, following_id)` adicional

### Crescimento de usuários e reviews

- `place_stats` como tabela separada elimina lock contention na tabela principal ao crescer volume de reviews
- Quando `reviews` ultrapassar ~500k linhas, considerar particionamento por `created_at` (Postgres declarative partitioning)
- `favorites` e `list_places` são tabelas de join puras — escalam linearmente

### Semantic search

`embedding` permanece em `places` com índice HNSW. Nenhuma mudança necessária — a função `search_places_semantic` já existe e está correta.

---

## Technical Examples

### CREATE TABLE completo (resumido)

```sql
-- ENUMs
CREATE TYPE establishment_type AS ENUM (
  'restaurante', 'lanchonete', 'cafeteria', 'bar', 'padaria',
  'sorveteria', 'food_truck', 'mercado', 'confeitaria', 'outro'
);

CREATE TYPE cuisine_type AS ENUM (
  'brasileira', 'japonesa', 'italiana', 'árabe', 'chinesa', 'mexicana',
  'americana', 'portuguesa', 'francesa', 'indiana', 'peruana',
  'vegana', 'vegetariana', 'frutos_do_mar', 'churrasco', 'pizza',
  'sushi', 'fast_food', 'padaria', 'doces', 'outras'
);

CREATE TYPE meal_type AS ENUM ('cafe', 'almoco', 'lanche', 'jantar', 'rodizio');

CREATE TYPE price_bucket AS ENUM ('up_to_15', '15_25', '25_40', '40_70', '70_plus');

-- Core
CREATE TABLE places (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name               TEXT NOT NULL CHECK (length(trim(name)) >= 2),
  address            TEXT NOT NULL,
  numero             TEXT,
  complemento        TEXT,
  bairro             TEXT,
  cidade             TEXT NOT NULL,
  estado             CHAR(2) NOT NULL,
  location           GEOGRAPHY(POINT, 4326) NOT NULL,
  establishment_type establishment_type NOT NULL,
  price_bucket       price_bucket NOT NULL,
  embedding          vector(1536),
  status             TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'approved', 'rejected')),
  created_by         UUID REFERENCES auth.users(id),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pivot tables
CREATE TABLE place_cuisines (
  place_id     UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  cuisine_type cuisine_type NOT NULL,
  PRIMARY KEY (place_id, cuisine_type)
);

CREATE TABLE place_meals (
  place_id  UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  meal_type meal_type NOT NULL,
  PRIMARY KEY (place_id, meal_type)
);

-- Stats
CREATE TABLE place_stats (
  place_id        UUID PRIMARY KEY REFERENCES places(id) ON DELETE CASCADE,
  rating          NUMERIC(3,2) NOT NULL DEFAULT 0,
  reviews_count   INTEGER NOT NULL DEFAULT 0,
  thumbs_up_count INTEGER NOT NULL DEFAULT 0,
  median_price    NUMERIC(8,2),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Query de feed (busca próxima com todos os filtros)

```sql
-- Exemplo: almoço, culinária japonesa, raio 2km, máximo R$40
SELECT
  p.id,
  p.name,
  p.address,
  p.bairro,
  s.rating,
  s.reviews_count,
  ST_Distance(p.location, ST_MakePoint(-43.1729, -22.9068)::geography)::INT AS distance_m
FROM places p
JOIN place_stats s ON s.place_id = p.id
WHERE
  p.status = 'approved'
  AND ST_DWithin(p.location, ST_MakePoint(-43.1729, -22.9068)::geography, 2000)
  AND EXISTS (
    SELECT 1 FROM place_meals pm WHERE pm.place_id = p.id AND pm.meal_type = 'almoco'
  )
  AND EXISTS (
    SELECT 1 FROM place_cuisines pc WHERE pc.place_id = p.id AND pc.cuisine_type = 'japonesa'
  )
  AND p.price_bucket <= '25_40'
ORDER BY
  (
    (1.0 - LEAST(ST_Distance(p.location, ST_MakePoint(-43.1729, -22.9068)::geography) / 2000, 1.0)) * 0.4
    + (s.rating / 5.0) * 0.4
    + (LOG(GREATEST(s.reviews_count, 1)) / 5.0) * 0.2
  ) DESC
LIMIT 20;
```

### Contagem de lugares por culinária (impossível sem pivot table)

```sql
SELECT cuisine_type, COUNT(*) AS places_count
FROM place_cuisines pc
JOIN places p ON p.id = pc.place_id
WHERE p.status = 'approved'
GROUP BY cuisine_type
ORDER BY places_count DESC;
```

---

## Next Steps

**Imediato (esta semana):**

1. **Corrigir bug urgente de `status`** — criar migration `20260505000001_fix_search_status_filter.sql` e rodar em produção agora
2. Criar migration `20260505000002_fix_price_bucket_filter.sql` para corrigir comparação de preço

**Curto prazo (próximas 2 semanas):**

3. Fase 1: criar ENUMs e tabelas novas
4. Fase 2: dual write no repositório
5. Fase 3: backfill + validação

**Médio prazo (1 mês):**

6. Fase 4: switch de leitura
7. Testes de performance em staging
8. Fase 5: cleanup das colunas deprecated

**Não fazer agora:**
- Não migrar `establishment_type` para ENUM antes do backfill (pode haver valores com typo nos dados históricos)
- Não remover `cuisine_types` e `meal_types` antes de validar o backfill
- Não criar features de `favorites`/`lists` antes do Fase 4 — usar o schema novo desde o início nessas features
