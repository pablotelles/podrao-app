# Prompt: Texto de Embedding de Lugar

**Usado em:** `src/application/use-cases/places/GeneratePlaceEmbedding.ts`
**Modelo:** `text-embedding-3-small`
**Fase:** Pós-MVP

## Template

```
{name} | {establishmentType} | {cuisineTypes} | {mealTypes} | {bairro} | {cidade} | {priceBucket}
```

## Campos

| Campo | Tipo | Obrigatório | Notas |
|---|---|---|---|
| `name` | string | sim | nome do estabelecimento |
| `establishmentType` | string | sim | ex: restaurante, padaria, lanchonete |
| `cuisineTypes` | string[] | sim | join com `', '` |
| `mealTypes` | string[] | sim | join com `', '` |
| `bairro` | string | não | omitido se ausente |
| `cidade` | string | sim | |
| `priceBucket` | string | sim | ex: `25_40` |

## Exemplo de saída

```
Temakeria Zen | restaurante | japonesa, sushi | almoço, jantar | Vila Madalena | São Paulo | 25_40
```

## Regras

- Campos `undefined`/`null`/`''` devem ser filtrados antes do join (`.filter(Boolean)`)
- Separador entre campos: ` | ` (espaço-pipe-espaço)
- Arrays usam `, ` como separador interno
- Não adicionar pontuação ou markdown — texto simples para o tokenizador

## Histórico de versões

| Versão | Data | Mudança |
|---|---|---|
| v1 | 2026-05-03 | Versão inicial |
