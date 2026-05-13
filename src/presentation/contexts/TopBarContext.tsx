'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  type ReactNode,
} from 'react';

// ── State context (read-only values) ─────────────────────────────────────────

interface TopBarState {
  title: string;
  hideBottomNav: boolean;
  hideTopBar: boolean;
  trailingAction: ReactNode;
}

const TopBarStateContext = createContext<TopBarState>({
  title: '',
  hideBottomNav: false,
  hideTopBar: false,
  trailingAction: null,
});

// ── Actions context (stable setters) ─────────────────────────────────────────

interface TopBarActions {
  setTitle: (title: string) => void;
  setHideBottomNav: (hide: boolean) => void;
  setHideTopBar: (hide: boolean) => void;
  setTrailingAction: (node: ReactNode) => void;
}

const TopBarActionsContext = createContext<TopBarActions>({
  setTitle: () => {},
  setHideBottomNav: () => {},
  setHideTopBar: () => {},
  setTrailingAction: () => {},
});

// ── Provider ──────────────────────────────────────────────────────────────────

export function TopBarProvider({ children }: { children: ReactNode }) {
  const [title, setTitleState] = useState('');
  const [hideBottomNav, setHideBottomNavState] = useState(false);
  const [hideTopBar, setHideTopBarState] = useState(false);
  const [trailingAction, setTrailingActionState] = useState<ReactNode>(null);

  const setTitle = useCallback((t: string) => setTitleState(t), []);
  const setHideBottomNav = useCallback((h: boolean) => setHideBottomNavState(h), []);
  const setHideTopBar = useCallback((h: boolean) => setHideTopBarState(h), []);
  const setTrailingAction = useCallback((n: ReactNode) => setTrailingActionState(n), []);

  const state: TopBarState = { title, hideBottomNav, hideTopBar, trailingAction };
  const actions: TopBarActions = { setTitle, setHideBottomNav, setHideTopBar, setTrailingAction };

  return (
    <TopBarActionsContext.Provider value={actions}>
      <TopBarStateContext.Provider value={state}>{children}</TopBarStateContext.Provider>
    </TopBarActionsContext.Provider>
  );
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

/** Read the full state object (use for components that read multiple fields). */
export function useTopBarState() {
  return useContext(TopBarStateContext);
}

/**
 * @deprecated Consumers should prefer useTopBarState() for reads and the
 * individual action hooks for writes. Kept for backwards compatibility.
 */
export function useTopBarContext() {
  const state = useContext(TopBarStateContext);
  const actions = useContext(TopBarActionsContext);
  return { ...state, ...actions };
}

/** Hook para páginas Client Component definirem o título da TopBar. */
export function usePageTitle(title: string) {
  const { setTitle } = useContext(TopBarActionsContext);
  useEffect(() => {
    setTitle(title);
    return () => setTitle('');
  }, [title, setTitle]);
}

/** Hook para esconder o BottomNav enquanto o componente estiver montado. */
export function useHideBottomNav() {
  const { setHideBottomNav } = useContext(TopBarActionsContext);
  useLayoutEffect(() => {
    setHideBottomNav(true);
    return () => setHideBottomNav(false);
  }, [setHideBottomNav]);
}

/** Hook para esconder a TopBar enquanto o componente estiver montado. */
export function useHideTopBar() {
  const { setHideTopBar } = useContext(TopBarActionsContext);
  useLayoutEffect(() => {
    setHideTopBar(true);
    return () => setHideTopBar(false);
  }, [setHideTopBar]);
}

/** Hook para injetar uma ação no slot direito da TopBar enquanto o componente estiver montado. */
export function useTopBarAction(action: ReactNode) {
  const { setTrailingAction } = useContext(TopBarActionsContext);
  useLayoutEffect(() => {
    setTrailingAction(action);
    return () => setTrailingAction(null);
    // action é um ReactNode — comparação por referência causaria loops; executa uma vez por mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/** Componente para definir título a partir de Server Components (via prop). */
export function PageTitle({ title }: { title: string }) {
  usePageTitle(title);
  return null;
}
