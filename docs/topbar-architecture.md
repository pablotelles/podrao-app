# TopBar Global — Arquitetura e Plano de Implementação

## Visão Geral

TopBar fixa no topo de **todas as páginas** (exceto login e fluxos full-screen). Título é controlado via Context — cada página declara seu próprio título sem precisar renderizar nada além de um hook. Sem botão voltar (mobile usa o gesto/botão nativo do aparelho).

### Anatomia

```
┌─────────────────────────────────────────┐
│  [avatar]      Explorar      [🔍]  [🔔] │
└─────────────────────────────────────────┘
```

| Zona     | Conteúdo                                                |
| -------- | ------------------------------------------------------- |
| Esquerda | Avatar do usuário (foto ou iniciais) — tap → `/profile` |
| Centro   | Título da página atual (via Context)                    |
| Direita  | Busca + Notificações (Bell placeholder por ora)         |

---

## Onde aparece / onde não aparece

```
VISÍVEL (todas as páginas autenticadas):
  /                → "Explorar"
  /lists           → "Listas"
  /lists/[id]      → nome da lista
  /lists/new       → "Nova lista"
  /lists/[id]/edit → "Editar lista"
  /places/[id]     → nome do lugar
  /profile         → "Minha conta"
  /add-place       → "Adicionar lugar"
  ...etc

OCULTA:
  /login           → sem usuário
```

---

## Arquitetura de componentes

```
src/presentation/
  contexts/
    TopBarContext.tsx       ← novo: Context + Provider + useTopBar hook

  components/navigation/
    TopBar.tsx             ← novo: componente visual
    BottomNav.tsx          ← sem mudanças

src/app/
  layout.tsx               ← adicionar TopBarProvider + TopBar
```

---

## TopBarContext

```typescript
// src/presentation/contexts/TopBarContext.tsx

interface TopBarContextValue {
  title: string;
  setTitle: (title: string) => void;
}

export function TopBarProvider({ children }: { children: ReactNode });
export function useTopBar(): TopBarContextValue;
```

### Hook de conveniência por página

Cada página chama um hook simples no topo do componente:

```typescript
// Exemplo: página Explorar
export default function HomePage() {
  useTopBar().setTitle('Explorar');  // ou hook dedicado usePageTitle('Explorar')
  ...
}

// Exemplo: página de detalhe de lista (Server Component)
// → o título vem dos dados, então o Client Component filho seta via hook
```

Para **Server Components** que não podem usar hooks: o filho Client Component mais próximo seta o título após receber os dados como props.

---

## TopBar Component

```typescript
// src/presentation/components/navigation/TopBar.tsx
'use client';

// Lê título do Context
// Avatar: busca perfil do usuário logado
// Ações: Search (funcional) + Bell (placeholder)
// Posicionamento: fixed top-0, pt-safe (iOS notch)
// Altura: --topbar-height (CSS var)
```

---

## Layout

```tsx
// src/app/layout.tsx
<TopBarProvider>
  <LocationProvider>
    <TopBar />
    <div className="pt-(--topbar-height)">{children}</div>
    <InstallPWA />
    <BottomNav />
  </LocationProvider>
</TopBarProvider>
```

CSS variable a adicionar em `globals.css`:

```css
--topbar-height: 56px;
```

---

## O que remover

| O que                                   | Onde                                            | Por quê                        |
| --------------------------------------- | ----------------------------------------------- | ------------------------------ |
| `PageHeader` component                  | `src/presentation/components/ui/PageHeader.tsx` | Substituído pela TopBar global |
| Todas as instâncias de `<PageHeader />` | `add-place`, `lists/*`, `profile`, `review`     | Título vai para Context        |
| Header customizado                      | `src/app/page.tsx`                              | Substituído pela TopBar        |
| `showBackButton` em qualquer lugar      | —                                               | Mobile usa back nativo         |

---

## Steps de implementação

### 1. CSS variable

Adicionar `--topbar-height: 56px` em `globals.css`.

### 2. Criar `TopBarContext`

Provider com `title` state + `setTitle`. Exportar hook `usePageTitle(title: string)` que chama `setTitle` via `useEffect` ao montar.

### 3. Criar `TopBar` component

Visual fixo no topo: avatar (left) + título do context (center) + search/bell (right).

### 4. Integrar no `layout.tsx`

Envolver tudo com `TopBarProvider`, adicionar `<TopBar />`, adicionar `pt-(--topbar-height)` no wrapper de conteúdo.

### 5. Adicionar `usePageTitle` em cada página

Cada página chama `usePageTitle('Nome da página')`. Para páginas de detalhe, criar um Client Component wrapper que recebe o nome como prop e chama o hook.

### 6. Deletar `PageHeader`

Remover o componente e todos os seus usos.

### 7. Refatorar `app/page.tsx`

Remover header customizado. Manter apenas os controles internos (toggle Lista/Mapa).

---

## Decisões pendentes

| Questão                     | Decisão                             |
| --------------------------- | ----------------------------------- |
| Botão voltar                | ❌ Não — mobile usa back nativo     |
| Título em Server Components | Client wrapper filho seta via hook  |
| Search → o que faz?         | A definir antes de implementar      |
| Bell → o que faz?           | Placeholder por ora, feature futura |
| Avatar sem foto             | Iniciais do nome sobre fundo brand  |
