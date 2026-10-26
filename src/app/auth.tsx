import React, { useEffect, useState } from 'react';
import { getCurrentUser, loginApi, type LoginRequest, type Session, type User } from '../api/auth';
import { getStoredToken, setStoredToken } from '../api/client';
import { AuthContext } from './authContext';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(() => Boolean(getStoredToken()));

  useEffect(() => {
    const existingToken = getStoredToken();
    if (!existingToken) {
      return;
    }

    let active = true;
    getCurrentUser(existingToken)
      .then((me) => {
        if (!active) return;
        setUser(me);
        setToken(existingToken);
      })
      .catch(() => {
        if (!active) return;
        setStoredToken(null);
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = async (credentials: LoginRequest): Promise<Session> => {
    const session = await loginApi(credentials);
    setStoredToken(session.token);
    setToken(session.token);
    setUser(session.user);
    return session;
  };

  const logout = () => {
    setStoredToken(null);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

