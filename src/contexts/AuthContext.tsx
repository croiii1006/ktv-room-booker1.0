import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'sales' | 'leader';

export interface User {
  name: string;
  staffNo: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (account: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const MOCK_USERS: Record<string, { password: string; user: User }> = {
  'sales001': {
    password: '123456',
    user: { name: '张三', staffNo: 'S0000001', role: 'sales' }
  },
  'sales002': {
    password: '123456',
    user: { name: '李四', staffNo: 'S0000002', role: 'sales' }
  },
  'leader001': {
    password: '123456',
    user: { name: '王队长', staffNo: 'L0000001', role: 'leader' }
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ktv_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (account: string, password: string): boolean => {
    const userData = MOCK_USERS[account];
    if (userData && userData.password === password) {
      setUser(userData.user);
      localStorage.setItem('ktv_user', JSON.stringify(userData.user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ktv_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
