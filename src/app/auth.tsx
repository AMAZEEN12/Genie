import React, { useEffect, useState } from 'react';
import { getCurrentUser, loginApi, type LoginRequest, type Session, type User } from '../api/auth';
import { getStoredToken, getStoredUser, setStoredToken, setStoredUser } from '../api/client';
import { AuthContext } from './authContext';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [isLoading, setIsLoading] = useState<boolean>(() => Boolean(getStoredToken() && !getStoredUser()));

  useEffect(() => {
    const existingToken = getStoredToken();
    if (!existingToken) {
      return;
    }

    let active = true;
    getCurrentUser(existingToken)
      .then((me) => {
        if (!active) return;
        const storedUser = getStoredUser();
        const isMockResponse =
          me.email === 'string' ||
          me.displayName === 'string' ||
          me.id === 'string' ||
          me.id === '497f6eca-6276-4993-bfeb-53cbbbba6f08';
        const effectiveUser: User = {
          ...me,
          id: (isMockResponse && storedUser?.id) ? storedUser.id : me.id,
          email: (isMockResponse && storedUser?.email) ? storedUser.email : me.email,
          role: (isMockResponse && storedUser?.role) ? storedUser.role : me.role,
          displayName: (isMockResponse && storedUser?.displayName) ? storedUser.displayName : me.displayName,
        };
        setUser(effectiveUser);
        setStoredUser(effectiveUser);
        setToken(existingToken);
      })
      .catch(() => {
        if (!active) return;
        setStoredToken(null);
        setStoredUser(null);
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
    setStoredUser(session.user);
    setToken(session.token);
    setUser(session.user);
    return session;
  };

  const logout = () => {
    setStoredToken(null);
    setStoredUser(null);
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
