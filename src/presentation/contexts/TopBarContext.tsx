'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface TopBarContextValue {
  title: string;
  setTitle: (title: string) => void;
}

const TopBarContext = createContext<TopBarContextValue>({
  title: '',
  setTitle: () => {},
});

export function TopBarProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState('');
  return <TopBarContext.Provider value={{ title, setTitle }}>{children}</TopBarContext.Provider>;
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

/** Componente para definir título a partir de Server Components (via prop). */
export function PageTitle({ title }: { title: string }) {
  usePageTitle(title);
  return null;
}
