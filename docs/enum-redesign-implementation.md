# Enum Redesign — Levantamento e Plano de Implementação

## Resumo da mudança

| Enum                      | Ação                  | Detalhes                                                                       |
| ------------------------- | --------------------- | ------------------------------------------------------------------------------ |
| `establishment_type_enum` | Reduzir               | Remove 4 valores: `sorveteria`, `mercado`, `confeitaria`, `outro`              |
| `cuisine_type_enum`       | Reduzir drasticamente | De 21 → 7 valores; remove 15 valores culturais específicos, adiciona `outro`   |
| `meal_type_enum`          | Reduzir               | Remove `rodizio`                                                               |
| `food_type_enum`          | **CRIAR NOVO**        | 12 valores: comida concreta (pizza, sushi…) + bebidas (cerveja, drinks, vinho) |

---

## Diff por enum

### `establishment_type_enum`

```
MANTER:    restaurante, bar, cafeteria, padaria, lanchonete, food_truck
REMOVER:   sorveteria, mercado, confeitaria, outro
```

### `cuisine_type_enum`

```
MANTER:    brasileira, japonesa, italiana, arabe, chinesa, mexicana
REMOVER:   americana, portuguesa, francesa, indiana, peruana, vegana,
           vegetariana, frutos_do_mar, churrasco, pizza, sushi,
           fast_food, padaria, doces, outras
ADICIONAR: outro
```

### `meal_type_enum`

```
MANTER:    cafe, almoco, lanche, jantar
REMOVER:   rodizio
```

### `food_type_enum` (novo)

```
CRIAR:     pizza, hamburguer, sushi, comida_caseira, doces, cafe,
           sorvete, churrasco, salgados, cerveja, drinks, vinho
```

---

## Decisão de arquitetura: `food_type` como pivot table

O padrão do projeto usa pivot tables para relações N:N entre `places` e tipos
(`place_cuisines`, `place_meals`). `food_types` segue o mesmo padrão:

```
places  ←→  place_food_types  ←→  food_type_enum
```

Isso permite:

- filtrar por food type no RPC `search_nearby_places`
- múltiplos food types por lugar
- consistência com cuisine/meal

---

## Arquivos impactados

### Backend

| Arquivo                                                           | Tipo de mudança                                                                 |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `src/infrastructure/database/migrations/09_redesign_enums.sql`    | **CRIAR** — nova migration                                                      |
| `src/domain/value-objects/EstablishmentType.ts`                   | Atualizar array + META                                                          |
| `src/domain/value-objects/CuisineType.ts`                         | Atualizar array + META                                                          |
| `src/domain/value-objects/MealType.ts`                            | Atualizar array + META                                                          |
| `src/domain/value-objects/FoodType.ts`                            | **CRIAR** — novo value object                                                   |
| `src/domain/entities/Place.ts`                                    | Adicionar `foodTypes: FoodType[]`                                               |
| `src/domain/interfaces/shared.ts`                                 | Adicionar `foodTypes` em `CreatePlaceData`; `foodType?` em `SearchPlacesParams` |
| `src/application/dtos/CreatePlaceDTO.ts`                          | Adicionar `foodTypes: FoodType[]`                                               |
| `src/application/dtos/SearchPlacesDTO.ts`                         | Adicionar `foodType?: FoodType`                                                 |
| `src/application/use-cases/places/CreatePlace.ts`                 | Validar `foodTypes.length > 0`; passar ao repo                                  |
| `src/application/use-cases/places/SearchNearbyPlaces.ts`          | Incluir `foodType` na cache key                                                 |
| `src/application/use-cases/places/GeneratePlaceEmbedding.ts`      | Incluir `foodTypes` no texto do embedding                                       |
| `src/infrastructure/database/supabase/SupabasePlaceRepository.ts` | Ler/gravar `place_food_types`; mapear `foodTypes` em `mapRowToPlace`            |

### Frontend

| Arquivo                                                       | Tipo de mudança                                          |
| ------------------------------------------------------------- | -------------------------------------------------------- |
| `src/presentation/lib/forms/place/schema.ts`                  | Atualizar Zod enums; adicionar `foodTypes`               |
| `src/presentation/lib/forms/review/schema.ts`                 | Remover `rodizio` de `MEAL_TYPES` (já reflete o domínio) |
| `src/presentation/components/add-place/StepEstablishment.tsx` | Automático via `ESTABLISHMENT_TYPE_META`                 |
| `src/presentation/components/add-place/StepCuisine.tsx`       | Automático via `CUISINE_TYPE_META`                       |
| `src/presentation/components/add-place/StepMealTypes.tsx`     | Automático via `MEAL_TYPE_META`                          |
| `src/presentation/components/add-place/StepFoodType.tsx`      | **CRIAR** — novo step de seleção                         |
| `src/app/add-place/page.tsx`                                  | Adicionar `StepFoodType` ao fluxo de steps               |
| `src/presentation/components/filters/FilterBar.tsx`           | Adicionar filtro por `food_type`                         |
| `src/presentation/hooks/useNearbyPlaces.ts`                   | Passar `foodType` na query string                        |
| `src/app/api/places/route.ts`                                 | Aceitar e validar parâmetro `food` (foodType)            |

---

## Steps de implementação (ordem obrigatória)

### Step 1 — Migration SQL

Criar `src/infrastructure/database/migrations/09_redesign_enums.sql`:

```sql
-- Step 1: Drop pivot tables que dependem dos enums antigos
DROP TABLE IF EXISTS place_food_types CASCADE;
DROP TABLE IF EXISTS place_meals CASCADE;
DROP TABLE IF EXISTS place_cuisines CASCADE;

-- Step 2: Dropar coluna establishment_type da tabela places
-- (será recriada com o enum atualizado)
ALTER TABLE places DROP COLUMN IF EXISTS establishment_type;

-- Step 3: Drop enums antigos
DROP TYPE IF EXISTS establishment_type_enum CASCADE;
DROP TYPE IF EXISTS cuisine_type_enum CASCADE;
DROP TYPE IF EXISTS meal_type_enum CASCADE;
DROP TYPE IF EXISTS food_type_enum CASCADE;

-- Step 4: Recriar enums com novos valores
CREATE TYPE establishment_type_enum AS ENUM (
  'restaurante', 'bar', 'cafeteria', 'padaria', 'lanchonete', 'food_truck'
);

CREATE TYPE cuisine_type_enum AS ENUM (
  'brasileira', 'japonesa', 'italiana', 'arabe', 'chinesa', 'mexicana', 'outro'
);

CREATE TYPE meal_type_enum AS ENUM (
  'cafe', 'almoco', 'lanche', 'jantar'
);

CREATE TYPE food_type_enum AS ENUM (
  'pizza', 'hamburguer', 'sushi', 'comida_caseira', 'doces', 'cafe',
  'sorvete', 'churrasco', 'salgados', 'cerveja', 'drinks', 'vinho'
);

-- Step 5: Readicionar coluna com enum atualizado
ALTER TABLE places
  ADD COLUMN establishment_type establishment_type_enum NOT NULL DEFAULT 'restaurante';

-- Remove o DEFAULT após adicionar (NOT NULL sem default exige valor em inserts)
ALTER TABLE places ALTER COLUMN establishment_type DROP DEFAULT;

-- Step 6: Recriar pivot tables
CREATE TABLE place_cuisines (
  place_id     UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  cuisine_type cuisine_type_enum NOT NULL,
  PRIMARY KEY (place_id, cuisine_type)
);

CREATE TABLE place_meals (
  place_id  UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  meal_type meal_type_enum NOT NULL,
  PRIMARY KEY (place_id, meal_type)
);

CREATE TABLE place_food_types (
  place_id  UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  food_type food_type_enum NOT NULL,
  PRIMARY KEY (place_id, food_type)
);

-- Step 7: Recriar a reviews.meal_type (afetada pelo DROP CASCADE do enum)
ALTER TABLE reviews DROP COLUMN IF EXISTS meal_type;
ALTER TABLE reviews ADD COLUMN meal_type meal_type_enum;

-- Step 8: Atualizar a função search_nearby_places para incluir food_types
-- (ver código completo abaixo — substituir o CREATE OR REPLACE da migration 05)
```

**Atualização do RPC `search_nearby_places`** — adicionar:

- `p_food_type TEXT DEFAULT NULL` nos parâmetros
- `food_types TEXT[]` no RETURNS TABLE
- `LEFT JOIN place_food_types pf ON pf.place_id = p.id`
- `array_agg(DISTINCT pf.food_type::TEXT ...)` no SELECT
- filtro `AND (p_food_type IS NULL OR EXISTS (SELECT 1 FROM place_food_types ...))` no WHERE
- `pf` no GROUP BY (ou usar subquery para evitar produto cartesiano)

> ⚠️ Adicionar o JOIN de food_types ao mesmo query dos outros JOINs causa produto cartesiano
> nas agregações. Usar subqueries correlacionadas ou CTEs separadas para cada pivot table.

---

### Step 2 — Domain value objects

**`EstablishmentType.ts`** — atualizar:

```typescript
export const ESTABLISHMENT_TYPES = [
  'restaurante',
  'bar',
  'cafeteria',
  'padaria',
  'lanchonete',
  'food_truck',
] as const;

export const ESTABLISHMENT_TYPE_META = {
  restaurante: { icon: '🍽️', label: 'Restaurante' },
  bar: { icon: '🍺', label: 'Bar' },
  cafeteria: { icon: '☕', label: 'Cafeteria' },
  padaria: { icon: '🥖', label: 'Padaria' },
  lanchonete: { icon: '🥪', label: 'Lanchonete' },
  food_truck: { icon: '🚚', label: 'Food Truck' },
};
```

**`CuisineType.ts`** — atualizar (de 21 para 7 valores):

```typescript
export const CUISINE_TYPES = [
  'brasileira',
  'japonesa',
  'italiana',
  'arabe',
  'chinesa',
  'mexicana',
  'outro',
] as const;
```

**`MealType.ts`** — remover `rodizio`:

```typescript
export const MEAL_TYPES = ['cafe', 'almoco', 'lanche', 'jantar'] as const;
```

**`FoodType.ts`** — criar novo arquivo:

```typescript
export const FOOD_TYPES = [
  'pizza',
  'hamburguer',
  'sushi',
  'comida_caseira',
  'doces',
  'cafe',
  'sorvete',
  'churrasco',
  'salgados',
  'cerveja',
  'drinks',
  'vinho',
] as const;

export type FoodType = (typeof FOOD_TYPES)[number];

export const FOOD_TYPE_META: Record<FoodType, { label: string; emoji: string }> = {
  pizza: { label: 'Pizza', emoji: '🍕' },
  hamburguer: { label: 'Hamburguer', emoji: '🍔' },
  sushi: { label: 'Sushi', emoji: '🍣' },
  comida_caseira: { label: 'Comida caseira', emoji: '🍲' },
  doces: { label: 'Doces', emoji: '🍬' },
  cafe: { label: 'Café', emoji: '☕' },
  sorvete: { label: 'Sorvete', emoji: '🍦' },
  churrasco: { label: 'Churrasco', emoji: '🥩' },
  salgados: { label: 'Salgados', emoji: '🥐' },
  cerveja: { label: 'Cerveja', emoji: '🍺' },
  drinks: { label: 'Drinks', emoji: '🍹' },
  vinho: { label: 'Vinho', emoji: '🍷' },
};
```

---

### Step 3 — Domain entities e interfaces

**`src/domain/entities/Place.ts`** — adicionar campo:

```typescript
foodTypes: FoodType[];
```

**`src/domain/interfaces/shared.ts`** — atualizar:

```typescript
// Em CreatePlaceData:
foodTypes: FoodType[];

// Em SearchPlacesParams:
foodType?: FoodType;
```

---

### Step 4 — Application layer

**`CreatePlaceDTO.ts`** — adicionar:

```typescript
foodTypes: FoodType[];
```

**`SearchPlacesDTO.ts`** — adicionar:

```typescript
foodType?: FoodType;
```

**`CreatePlace.ts` use case** — adicionar validação:

```typescript
if (!dto.foodTypes.length) throw new ValidationError('Selecione ao menos um tipo de comida');
```

**`SearchNearbyPlaces.ts`** — atualizar cache key:

```typescript
const key = `places:${lat}:${lng}:${radiusM}:${mealType}:${cuisine}:${foodType}:${maxPrice}`;
```

**`GeneratePlaceEmbedding.ts`** — incluir `foodTypes` no texto:

```typescript
`${name} | ${establishmentType} | ${cuisines} | ${foodTypes} | ${mealTypes} | ${bairro} | ${cidade} | ${priceBucket}`;
```

---

### Step 5 — Infrastructure (SupabasePlaceRepository)

**`mapRowToPlace`** — adicionar mapeamento:

```typescript
foodTypes: (row.food_types ?? []) as FoodType[],
```

**`create`** — inserir em `place_food_types` após criar o place:

```typescript
if (data.foodTypes.length) {
  await client
    .from('place_food_types')
    .insert(data.foodTypes.map((ft) => ({ place_id: place.id, food_type: ft })));
}
```

**`update`** — suportar partial update de `foodTypes`:

```typescript
if (data.foodTypes !== undefined) {
  await client.from('place_food_types').delete().eq('place_id', id);
  if (data.foodTypes.length) {
    await client
      .from('place_food_types')
      .insert(data.foodTypes.map((ft) => ({ place_id: id, food_type: ft })));
  }
}
```

**`search_nearby_places` RPC call** — passar `p_food_type`:

```typescript
.rpc('search_nearby_places', {
  p_lat, p_lng, p_radius_m,
  p_meal_type: params.mealType ?? null,
  p_cuisine: params.cuisine ?? null,
  p_food_type: params.foodType ?? null,   // novo
  p_max_price: params.maxPrice ?? null,
})
```

---

### Step 6 — Presentation schemas (Zod)

**`src/presentation/lib/forms/place/schema.ts`** — atualizar:

```typescript
import { FOOD_TYPES } from '@/domain/value-objects/FoodType';

// No createPlaceSchema:
foodTypes: z.array(z.enum(FOOD_TYPES)).min(1, 'Selecione ao menos um tipo de comida'),

// No searchPlacesSchema:
food: z.enum(FOOD_TYPES).optional(),
```

**`src/presentation/lib/forms/review/schema.ts`** — nenhuma mudança necessária;
o Zod usa `MEAL_TYPES` importado do domínio, que já terá `rodizio` removido.

---

### Step 7 — API route `/api/places`

**GET** — adicionar parsing do parâmetro `food`:

```typescript
const { meal, cuisine, food, maxPrice, lat, lng, radius } =
  searchPlacesSchema.parse(params);

// Passar ao use case:
foodType: food,
```

---

### Step 8 — Hook `useNearbyPlaces`

```typescript
...(params.foodType && { food: params.foodType }),
```

---

### Step 9 — Componentes React

#### `StepFoodType.tsx` (novo)

Seguir o mesmo padrão de `StepCuisine.tsx`: grid multi-select usando `FOOD_TYPES` e
`FOOD_TYPE_META`. Sugerir limite de 3 seleções (mesmo que cuisine).

#### `StepEstablishment.tsx`, `StepCuisine.tsx`, `StepMealTypes.tsx`

Nenhuma mudança estrutural necessária. Os componentes iteram sobre as constantes
(`ESTABLISHMENT_TYPES`, `CUISINE_TYPES`, `MEAL_TYPES`) que serão automaticamente
reduzidas quando os value objects forem atualizados.

> ⚠️ Validar que não há nenhum valor hardcoded nesses componentes — confirmar que
> só usam as constantes importadas.

#### `FilterBar.tsx`

Adicionar seção de filtro por `food_type`, seguindo o padrão dos filtros existentes de
meal e cuisine.

#### `src/app/add-place/page.tsx`

Inserir `StepFoodType` no array de steps do formulário multi-step, após `StepCuisine`
ou `StepMealTypes` (decidir posição baseado no UX flow).

---

## Checklist de execução

```
[ ] Step 1  — Criar migration 09_redesign_enums.sql
[ ] Step 1  — Executar npm run db:migrate no Supabase
[ ] Step 2  — Atualizar EstablishmentType.ts
[ ] Step 2  — Atualizar CuisineType.ts
[ ] Step 2  — Atualizar MealType.ts
[ ] Step 2  — Criar FoodType.ts
[ ] Step 3  — Atualizar Place.ts (entity)
[ ] Step 3  — Atualizar shared.ts (interfaces)
[ ] Step 4  — Atualizar CreatePlaceDTO.ts
[ ] Step 4  — Atualizar SearchPlacesDTO.ts
[ ] Step 4  — Atualizar CreatePlace.ts (use case)
[ ] Step 4  — Atualizar SearchNearbyPlaces.ts (cache key)
[ ] Step 4  — Atualizar GeneratePlaceEmbedding.ts
[ ] Step 5  — Atualizar SupabasePlaceRepository.ts
[ ] Step 6  — Atualizar place/schema.ts (Zod)
[ ] Step 7  — Atualizar /api/places/route.ts
[ ] Step 8  — Atualizar useNearbyPlaces.ts
[ ] Step 9  — Criar StepFoodType.tsx
[ ] Step 9  — Atualizar add-place/page.tsx (novo step)
[ ] Step 9  — Atualizar FilterBar.tsx
[ ] Verificar — npm run typecheck (zero erros)
[ ] Verificar — npm run build (zero erros)
```

---

## Notas de atenção

### Produto cartesiano no RPC

O `search_nearby_places` atual usa `LEFT JOIN` para `place_cuisines` e `place_meals`
com `GROUP BY` para agregar. Adicionar um terceiro `LEFT JOIN place_food_types` multiplica
as linhas antes do GROUP BY. Solução recomendada: usar subqueries `(SELECT array_agg(...) FROM place_food_types WHERE place_id = p.id)` no SELECT, como faz em alguns ORMs.

### `cafe` em `food_type_enum` vs `meal_type_enum`

O valor `'cafe'` existe em ambos os enums:

- Em `meal_type_enum` significa "café da manhã" (refeição)
- Em `food_type_enum` significa "café" (produto — bebida)

Não há conflito no banco (são tipos distintos), mas labels no FE devem ser claros:

- `meal_type.cafe` → "Café da manhã"
- `food_type.cafe` → "Café"

### `EstablishmentType` ainda como `string` no `Place` entity?

Atualmente `Place.ts` usa `establishmentType: string` (não o tipo `EstablishmentType`).
Considerar tipar corretamente para pegar erros em tempo de compilação, embora não seja
bloqueador para esta mudança.
