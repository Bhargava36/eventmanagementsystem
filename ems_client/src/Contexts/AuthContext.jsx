import React, { createContext, useState, useEffect, useCallback } from 'react';

export const AuthContext = createContext(null);

export function parseJwt(token) {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function isTokenExpired(token) {
  const decoded = parseJwt(token);
  if (!decoded || !decoded.exp) return false;
  return decoded.exp * 1000 < Date.now();
}

export function getDefaultDashboard(role) {
  switch (role) {
    case 'super_admin':
      return '/sidebar';
    case 'admin':
      return '/admin/dashboard';
    case 'teamlead':
      return '/user/dashboard';
    default:
      return '/';
  }
}

export function getRoleLoginPath(role) {
  switch (role) {
    case 'super_admin':
      return '/login';
    case 'admin':
      return '/admin/login';
    case 'teamlead':
      return '/user/login';
    default:
      return '/login';
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [role, setRole] = useState(() => localStorage.getItem('role'));
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    setToken(null);
    setUser(null);
    setRole(null);
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      if (isTokenExpired(savedToken)) {
        logout();
      } else {
        const decoded = parseJwt(savedToken);
        const resolvedRole = decoded?.role || localStorage.getItem('role') || null;
        setToken(savedToken);
        setRole(resolvedRole);
        if (resolvedRole && !localStorage.getItem('role')) {
          localStorage.setItem('role', resolvedRole);
        }
      }
    } else {
      logout();
    }
    setIsLoading(false);
  }, [logout]);

  const login = useCallback((newToken, userData, explicitRole) => {
    if (newToken) {
      localStorage.setItem('token', newToken);
      setToken(newToken);
    }

    const decoded = parseJwt(newToken);
    const resolvedRole = explicitRole || decoded?.role || userData?.role || null;

    const mergedUser = {
      ...(userData || {}),
      ...(resolvedRole ? { role: resolvedRole } : {}),
    };

    localStorage.setItem('user', JSON.stringify(mergedUser));
    setUser(mergedUser);

    if (resolvedRole) {
      localStorage.setItem('role', resolvedRole);
      setRole(resolvedRole);
    }
  }, []);

  const isAuthenticated = Boolean(token && !isTokenExpired(token));

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        role,
        isAuthenticated,
        isLoading,
        login,
        logout,
        getDefaultDashboard,
        getRoleLoginPath,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
