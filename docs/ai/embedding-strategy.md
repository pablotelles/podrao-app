# Estratégia de Embedding

## Modelo

`text-embedding-3-small` (OpenAI) — 1536 dimensões, ~$0.02/1M tokens.
Interface: `IEmbeddingProvider` em `src/domain/interfaces/IEmbeddingProvider.ts`.
Implementação ativa: `src/infrastructure/ai/OpenAIEmbeddingProvider.ts`.

## Texto descritivo por lugar

O texto enviado ao modelo no momento do cadastro:

```
{nome} | {establishmentType} | {cuisineTypes.join(', ')} | {mealTypes.join(', ')} | {bairro} | {cidade} | {priceBucket}
```

**Exemplo:**

```
Temakeria Zen | restaurante | japonesa, sushi | almoço, jantar | Vila Madalena | São Paulo | 25_40
```

**Intenção:** capturar semântica de tipo, culinária, refeição e localização num único vetor.
Campos opcionais ausentes são filtrados com `.filter(Boolean)` antes do join.

## Índice vetorial

```sql
CREATE INDEX idx_places_embedding
  ON places
  USING hnsw (embedding vector_cosine_ops);
```

HNSW — melhor recall que IVFFlat, ideal para buscas semânticas em tempo real.

## Ativação (MVP → pós-MVP)

| Fase    | Estado                                                             |
| ------- | ------------------------------------------------------------------ |
| MVP     | Coluna `embedding` existe mas é NULL; código de geração desativado |
| Pós-MVP | Ativar `GeneratePlaceEmbedding` use case no fluxo de cadastro      |
| Pós-MVP | Backfill dos lugares existentes via script único                   |
| Pós-MVP | A/B test: filtros estruturados vs semântica vs híbrido             |

## Custo estimado

- 10.000 cadastros: ~$0.02 total
- 100.000 buscas/mês: ~$0.20 total
