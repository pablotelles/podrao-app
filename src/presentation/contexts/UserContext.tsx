'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
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

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(() => {
    setLoading(true);
    fetch('/api/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data: User | null) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchUser();
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
