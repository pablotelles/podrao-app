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
import { createBrowserClient } from '@supabase/ssr';
import type { User } from '@/domain/entities/User';

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
  const listenerRegistered = useRef(false);

  const fetchUser = useCallback(() => {
    setLoading(true);
    fetch('/api/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data: User | null) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // If no initialUser was provided, fetch on mount (fallback for unauthenticated SSR)
  useEffect(() => {
    if (initialUser === null) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [initialUser, fetchUser]);

  // Listen for auth state changes (login/logout) — registered once
  useEffect(() => {
    if (listenerRegistered.current) return;
    listenerRegistered.current = true;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) return;

    const supabase = createBrowserClient(supabaseUrl, supabaseKey);
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        fetchUser();
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
