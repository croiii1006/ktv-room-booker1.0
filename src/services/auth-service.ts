import apiClient from './api-client';
import { ResultStaffResp } from '@/models';

// H5 登录请求参数
interface H5LoginRequest {
  phone: string;
  password: string;
}

// H5 登录响应（与 ResultLoginResp 匹配）
interface H5LoginResponse {
  code?: number;
  message?: string;
  data?: {
    token?: string;
  };
  timestamp?: number;
  success?: boolean;
}

// 管理端登录请求参数
interface AdminLoginRequest {
  username: string;
  password: string;
}

// H5 登录（业务员/队长）
export const h5Login = async (phone: string, password: string): Promise<H5LoginResponse> => {
  const request: H5LoginRequest = { phone, password };
  const response = await apiClient.post<H5LoginResponse>('/api/auth/h5/login', request);
  return response.data;
};

// 管理端登录（管理员）
export const adminLogin = async (username: string, password: string): Promise<H5LoginResponse> => {
  const request: AdminLoginRequest = { username, password };
  const response = await apiClient.post<H5LoginResponse>('/api/auth/admin/login', request);
  return response.data;
};

// 获取当前登录员工信息
export const getCurrentStaff = async (): Promise<ResultStaffResp> => {
  const response = await apiClient.get<ResultStaffResp>('/api/h5/staffs/me');
  return response.data;
};

// 登出（本地清除 token）
export const logout = () => {
  localStorage.removeItem('token');
  // 可以调用后端登出接口（如果存在）但 API 文档中未提供
};