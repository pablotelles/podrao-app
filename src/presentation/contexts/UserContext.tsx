'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import type { User } from '@/domain/entities/User';
import { getSupabaseBrowser } from '@/presentation/lib/supabase-browser';

interface UserContextValue {
  user: User | null;
  loading: boolean;
  updateUser: (partial: Partial<User>) => void;
  refetch: () => void;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  loading: true,
  updateUser: () => {},
  refetch: () => {},
});

interface UserProviderProps {
  children: ReactNode;
  initialUser?: User | null;
}

export function UserProvider({ children, initialUser = null }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [loading, setLoading] = useState(initialUser === null);
  const skipFirstEvent = useRef(true);

  const fetchUser = useCallback((opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    fetch('/api/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data: User | null) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // Listen for auth state changes (login/logout) — registered once
  useEffect(() => {
    const supabase = getSupabaseBrowser();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      // Skip first event — it reflects the current session already handled by SSR
      if (skipFirstEvent.current) {
        skipFirstEvent.current = false;
        return;
      }
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      } else if (event === 'SIGNED_IN') {
        void fetchUser();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUser]);

  const updateUser = useCallback((partial: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...partial } : null));
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, updateUser, refetch: fetchUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
