# Estratégia de Busca

## Busca por filtros (MVP — ativa)

RPC `search_nearby_places` no Supabase. Combina:
- `ST_DWithin` para filtro geográfico (usa índice GIST)
- Filtros opcionais: `meal_type`, `cuisine`, `max_price`
- Ranking composto:
  - 40% proximidade (distância normalizada pelo raio)
  - 40% rating (0–5 → 0–1)
  - 20% popularidade (log do reviews_count)

**Quando falha:** queries em linguagem natural sem correspondência nos filtros estruturados.

## Busca semântica (pós-MVP)

RPC `search_places_semantic`. Combina:
- pgvector cosine distance (`<=>`) entre embedding da query e embeddings dos lugares
- `ST_DWithin` para garantir relevância geográfica
- Ranking: 60% semântica + 40% proximidade

**Operador correto:** `<=>` (cosine) para texto. Não usar `<->` (euclidiana) com text-embedding-3-small.

## Fluxo de decisão

```
Query do usuário
  ├─ Tem filtros estruturados selecionados?
  │   └─ SIM → search_nearby_places (filtros + geo)
  └─ É busca textual livre?
      └─ SIM → embed query → search_places_semantic (semântica + geo)
```

## Cache de resultados

Chave: `places:{lat3}:{lng3}:{radiusM}:{mealType}:{cuisine}:{maxPrice}`
- Coordenadas arredondadas a 3 casas decimais (~111m de célula)
- TTL: 60s (11h–14h), 300s (demais horários), 600s (noite)
- Invalidação: ao aprovar novo lugar, deletar padrão `places:{lat3}:{lng3}:*`
