import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { h5Login, getCurrentStaff, logout as apiLogout } from '@/services/auth-service';
import { toast } from 'sonner';

export type UserRole = 'sales' | 'leader';

export interface User {
  id: string;
  name: string;
  staffNo: string;
  role: UserRole;
  storeId?: string;
  leaderId?: string;
}

interface AuthContextType {
  user: User | null;
  login: (account: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 从 localStorage 加载已保存的用户和 token
const loadSavedUser = (): User | null => {
  const token = localStorage.getItem('token');
  const saved = localStorage.getItem('ktv_user');
  if (!token || !saved) return null;
  return JSON.parse(saved);
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadSavedUser);
  const [loading, setLoading] = useState(false);

  // 初始化时，如果有 token 但没有用户信息，可以尝试获取当前员工信息
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user) {
      // 可选：自动获取用户信息
      // 暂时不实现，因为可能不需要
    }
  }, [user]);

  const login = async (account: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      // 调用 H5 登录接口
      const response = await h5Login(account, password);
      if (response.success && response.data?.token) {
        const token = response.data.token;
        localStorage.setItem('token', token);

        // 获取当前员工信息
        const staffResp = await getCurrentStaff();
        if (staffResp.success && staffResp.data) {
          const staff = staffResp.data;
          // 映射角色
          let role: UserRole = 'sales';
          if (staff.role === 'TEAM_LEADER') {
            role = 'leader';
          } else if (staff.role === 'ADMIN') {
            // 管理员暂时视为 leader 或 sales？根据业务决定
            role = 'leader';
          }
          const userData: User = {
            id: staff.id || '0',
            name: staff.name || '',
            staffNo: staff.username || '',
            role,
            storeId: staff.storeId,
            leaderId: staff.leaderId,
          };
          setUser(userData);
          localStorage.setItem('ktv_user', JSON.stringify(userData));
          // toast.success('登录成功'); // Removed to avoid duplicate toast with Login.tsx
          setLoading(false);
          return true;
        } else {
          toast.error('获取用户信息失败');
        }
      } else {
        toast.error(response.message || '登录失败');
      }
    } catch (error: any) {
      console.error('登录错误:', error);
      toast.error(error.message || '网络错误');
    }
    setLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('ktv_user');
    // 可以调用后端登出接口
    apiLogout();
    toast.info('已退出登录');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loading }}>
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
