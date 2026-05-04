# Arquitetura do Fluxo de Avaliação

## 1. O que o design pede (7 steps)

| # | Step | O que coleta |
|---|------|-------------|
| 1 | **Ação** | Trigger — botão "Escrever avaliação" na página do lugar |
| 2 | **Nota geral** | Rating 1–5 estrelas ("Como foi sua experiência?") |
| 3 | **Detalhes** | Scores por categoria: Comida, Atendimento, Ambiente, Custo-benefício, Limpeza (cada 1–5) |
| 4 | **Comentário** | Texto livre, máx 500 chars |
| 5 | **Fotos (opcional)** | Múltiplas fotos da experiência |
| 6 | **Revisão** | Tela de confirmação antes de publicar |
| 7 | **Sucesso** | Feedback de publicação + pontos/nível (gamificação) |

---

## 2. O que o backend suporta hoje

### Tabela `reviews` (atual)
```
id, place_id, user_id, thumbs_up BOOLEAN, amount_paid NUMERIC(8,2), meal_type, comment, created_at
```

### O que já funciona
| Campo | Status | Observação |
|-------|--------|-----------|
| `comment` (500 chars) | ✅ Mantém | Idêntico ao design |
| `meal_type` | ✅ Mantém | Junto com `amount_paid` dá perspectiva de valor por tipo de refeição |
| `amount_paid` | ✅ Mantém | **Valor por pessoa** — renomear semanticamente para deixar claro |
| `thumbs_up` | ⚠️ Vira derivado | Calculado a partir de `rating >= 4`; stats continuam funcionando |
| Scores por categoria | ❌ Adicionar | Não existe |
| Fotos da review | ❌ Adicionar | Não existe |
| Gamificação (pontos/nível) | ❌ Adicionar | Não existe |
| Rating numérico | ❌ Adicionar | Só boolean hoje |

### API routes existentes
- `GET /api/places/[id]/reviews` — lista reviews do lugar
- `POST /api/places/[id]/reviews` — cria review (requer auth)

---

## 3. Decisões sobre campos existentes

### `amount_paid` + `meal_type` — manter e valorizar

Juntos formam a perspectiva de **valor real por tipo de refeição**:

```
"Paguei R$38 num almoço" → contexto muito mais útil que só o priceBucket do lugar
"Paguei R$15 num lanche" vs "Paguei R$80 num jantar" no mesmo lugar → padrões diferentes
```

O campo passa a ser explicitamente **por pessoa** — adicionar constraint e label:
```sql
-- Coluna já existe, adicionar constraint de sanidade
ALTER TABLE reviews ADD CONSTRAINT amount_paid_per_person
  CHECK (amount_paid IS NULL OR (amount_paid > 0 AND amount_paid < 2000));
-- R$2.000 é teto razoável para uma refeição individual
```

No frontend: label explícito **"Quanto você gastou por pessoa?"** com placeholder `R$ 0,00`.

### Como `amount_paid` + `meal_type` alimentam stats

A `place_stats.median_price` já usa `PERCENTILE_CONT(0.5) OVER amount_paid`. Com `meal_type` disponível, podemos expor futuramente:

```sql
-- Mediana por tipo de refeição (pós-MVP, sem migration agora)
SELECT meal_type, PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY amount_paid) AS median
FROM reviews WHERE place_id = $1 AND amount_paid IS NOT NULL
GROUP BY meal_type;
```

Isso permite mostrar: _"Almoço: ~R$35 · Jantar: ~R$62"_ — dado que nenhum concorrente tem.

---

## 4. O que precisa ser expandido

### 4a. Schema — migrations necessárias

**Migration 1 — `rating` + constraint `amount_paid` na tabela `reviews`**
```sql
ALTER TABLE reviews
  ADD COLUMN rating SMALLINT CHECK (rating BETWEEN 1 AND 5),
  ADD CONSTRAINT amount_paid_per_person
    CHECK (amount_paid IS NULL OR (amount_paid > 0 AND amount_paid < 2000));
-- thumbs_up vira derivado via trigger: rating >= 4 → true
```

**Migration 2 — nova tabela `review_scores` (scores por categoria)**
```sql
CREATE TABLE review_scores (
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  category  TEXT NOT NULL,  -- 'food' | 'service' | 'ambience' | 'value' | 'cleanliness'
  score     SMALLINT NOT NULL CHECK (score BETWEEN 1 AND 5),
  PRIMARY KEY (review_id, category)
);
```

**Migration 3 — nova tabela `review_photos`**
```sql
CREATE TABLE review_photos (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id  UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Migration 4 — coluna `points` em `profiles` (gamificação simples)**
```sql
ALTER TABLE profiles ADD COLUMN points INTEGER NOT NULL DEFAULT 0;
-- Trigger: +10 pontos ao inserir uma review
```

### 4b. Domínio — mudanças em entidades e interfaces

**`Review` entity** — campos adicionados:
```typescript
export interface Review {
  id: string;
  placeId: string;
  userId: string;
  rating: number;           // 1–5 (novo — input real do usuário)
  thumbsUp: boolean;        // derivado: rating >= 4
  scores?: ReviewScore[];   // (novo)
  photos?: string[];        // URLs (novo)
  comment?: string;
  mealType?: MealType;      // mantido
  amountPaidPerPerson?: number;  // mantido — renomeado semanticamente
  createdAt: Date;
}

export interface ReviewScore {
  category: ReviewCategory;
  score: number;  // 1–5
}

export type ReviewCategory =
  | 'food' | 'service' | 'ambience' | 'value' | 'cleanliness';
```

**`CreateReviewData` / `SubmitReviewDTO`** — expandidos:
```typescript
export interface SubmitReviewDTO {
  placeId: string;
  userId: string;
  rating: number;                                          // obrigatório
  scores?: { category: ReviewCategory; score: number }[]; // opcional
  photoUrls?: string[];                                    // opcional
  comment?: string;                                        // opcional, max 500
  mealType?: MealType;                                     // opcional
  amountPaidPerPerson?: number;                            // opcional, > 0 < 2000
}
```

### 4c. Infraestrutura

**`SupabaseReviewRepository.create`** — insert em 3 tabelas:
1. `reviews` (rating + comment + meal_type + amount_paid)
2. `review_scores` (uma linha por categoria)
3. `review_photos` (uma linha por foto)

Upload de fotos reutiliza `IStorageProvider` (já existe em `SupabaseStorageProvider`).

### 4d. API route `POST /api/places/[id]/reviews`

Schema Zod expandido:
```typescript
export const submitReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  scores: z.array(z.object({
    category: z.enum(['food', 'service', 'ambience', 'value', 'cleanliness']),
    score: z.number().int().min(1).max(5),
  })).optional(),
  photoUrls: z.array(z.string().url()).max(5).optional(),
  comment: z.string().max(500).optional(),
  mealType: z.enum(MEAL_TYPES).optional(),
  amountPaidPerPerson: z.number().positive().max(1999).optional(),
});
```

Upload de fotos: reutilizar `POST /api/upload` antes do submit final.

---

## 5. Estratégia de implementação

### Fases

**Fase 1 — Domínio + Migrations** *(sem breaking change)*
- Adicionar `rating` column como nullable (reviews antigas ficam sem nota)
- Criar tabelas `review_scores` e `review_photos`
- Constraint `amount_paid` + semântica "por pessoa"
- Atualizar entidade `Review`, `IReviewRepository`, DTOs

**Fase 2 — Infraestrutura + API**
- Expandir `SupabaseReviewRepository.create`
- Atualizar schema Zod da route
- Atualizar `SubmitReview` use case

**Fase 3 — Frontend (flow)**
- Componente container `ReviewFlow` (igual ao add-place: steps + header + btn fixo)
- Steps individuais (ver seção 6)
- Hook `useSubmitReview` (análogo ao `useAddPlace`)

**Fase 4 — Gamificação** *(pode ser deferred)*
- Trigger SQL: `+10 pontos` ao criar review
- Tela de sucesso lê `profiles.points` após submit

---

## 6. Componentes frontend

### Steps mapeados com campos

| Step | Componente | Campos coletados |
|------|-----------|-----------------|
| 2 | `StepRating` | `rating` (1–5) |
| 3 | `StepCategories` | `scores[]` |
| 4 | `StepComment` | `comment`, `mealType`, `amountPaidPerPerson` |
| 5 | `StepPhotos` | `photoFiles` → `photoUrls` |
| 6 | `StepReview` | resumo (readonly) |
| 7 | `StepSuccess` | — |

> O step 4 agrupa comentário + contexto da visita (refeição + valor por pessoa) — são dados relacionados e juntos fazem sentido como "conte mais sobre sua visita".

### Estrutura de pastas
```
src/presentation/components/review/
  StepRating.tsx          # Step 2 — estrelas 1–5 (nota geral)
  StepCategories.tsx      # Step 3 — scores por categoria
  StepComment.tsx         # Step 4 — texto + tipo de refeição + valor por pessoa
  StepPhotos.tsx          # Step 5 — upload múltiplo
  StepReview.tsx          # Step 6 — resumo antes de publicar
  StepSuccess.tsx         # Step 7 — sucesso + pontos

src/presentation/components/ui/
  StarRating.tsx          # Primitivo reutilizável: 1–5 estrelas (tap/click)
```

### `StarRating` — primitivo central
```typescript
interface StarRatingProps {
  value: number;       // 0 = não avaliado, 1–5
  onChange: (v: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
}
```
Usado em `StepRating` (size lg, 1 instância) e `StepCategories` (size sm, 5 instâncias).

### Page — `/places/[id]/review`
- Rota dedicada (não modal) — mesma estrutura de `/add-place`
- `PageHeader` com título do step + back
- `ProgressSteps` (6 steps, excluindo o trigger)
- Botão sticky "Continuar" / "Publicar avaliação"

### Hook `useSubmitReview`
```typescript
function useSubmitReview(placeId: string) {
  // 1. uploadPhotos(files[]) → string[] (reutiliza /api/upload)
  // 2. POST /api/places/[id]/reviews com payload completo
  // mutate('/api/me/stats') + mutate(`/api/places/${placeId}/reviews`)
}
```

---

## 7. Tabela de decisões

| Campo | Decisão | Motivo |
|-------|---------|--------|
| `thumbsUp` | Vira derivado (`rating >= 4`) | Stats trigger e `thumbs_up_count` continuam funcionando sem alteração |
| `rating` | Novo campo obrigatório 1–5 | Input real do usuário — substitui a fórmula artificial de hoje |
| `amount_paid` | **Mantém** como "por pessoa" | Com `meal_type` dá perspectiva de custo real por tipo de visita |
| `meal_type` | **Mantém** | Contexto essencial para interpretar `amount_paid` |
| Scores por categoria | Tabela separada | Permite AVG por categoria por lugar, extensível |
| Upload de fotos | `/api/upload` existente | Reutiliza `IStorageProvider` sem duplicação |
| Gamificação | Trigger SQL simples | Atômico com o insert da review; sem race condition |
| `amount_paid` constraint | `> 0 AND < 2000` | Sanidade para valor por pessoa em reais |
| Route `/places/[id]/review` | Rota dedicada | Deep link, back button natural, mesma UX do add-place |
