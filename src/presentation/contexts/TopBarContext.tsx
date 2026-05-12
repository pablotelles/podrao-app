'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useLayoutEffect,
  type ReactNode,
} from 'react';

interface TopBarContextValue {
  title: string;
  setTitle: (title: string) => void;
  hideBottomNav: boolean;
  setHideBottomNav: (hide: boolean) => void;
  hideTopBar: boolean;
  setHideTopBar: (hide: boolean) => void;
  trailingAction: ReactNode;
  setTrailingAction: (node: ReactNode) => void;
}

const TopBarContext = createContext<TopBarContextValue>({
  title: '',
  setTitle: () => {},
  hideBottomNav: false,
  setHideBottomNav: () => {},
  hideTopBar: false,
  setHideTopBar: () => {},
  trailingAction: null,
  setTrailingAction: () => {},
});

export function TopBarProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState('');
  const [hideBottomNav, setHideBottomNav] = useState(false);
  const [hideTopBar, setHideTopBar] = useState(false);
  const [trailingAction, setTrailingAction] = useState<ReactNode>(null);
  return (
    <TopBarContext.Provider
      value={{
        title,
        setTitle,
        hideBottomNav,
        setHideBottomNav,
        hideTopBar,
        setHideTopBar,
        trailingAction,
        setTrailingAction,
      }}
    >
      {children}
    </TopBarContext.Provider>
  );
}

export function useTopBarContext() {
  return useContext(TopBarContext);
}

/** Hook para páginas Client Component definirem o título da TopBar. */
export function usePageTitle(title: string) {
  const { setTitle } = useTopBarContext();
  useEffect(() => {
    setTitle(title);
  }, [title, setTitle]);
}

/** Hook para esconder o BottomNav enquanto o componente estiver montado. */
export function useHideBottomNav() {
  const { setHideBottomNav } = useTopBarContext();
  useLayoutEffect(() => {
    setHideBottomNav(true);
    return () => setHideBottomNav(false);
  }, [setHideBottomNav]);
}

/** Hook para esconder a TopBar enquanto o componente estiver montado. */
export function useHideTopBar() {
  const { setHideTopBar } = useTopBarContext();
  useLayoutEffect(() => {
    setHideTopBar(true);
    return () => setHideTopBar(false);
  }, [setHideTopBar]);
}

/** Hook para injetar uma ação no slot direito da TopBar enquanto o componente estiver montado. */
export function useTopBarAction(action: ReactNode) {
  const { setTrailingAction } = useTopBarContext();
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
