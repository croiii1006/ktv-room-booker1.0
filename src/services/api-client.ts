import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'sonner';

const API_BASE_URL = '';

// 从 localStorage 获取 token
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// 创建 axios 实例
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：添加 Authorization 头
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：统一错误处理
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // 如果响应数据是 Result 格式，可以根据 code 判断是否成功
    const data = response.data;
    if (data && typeof data === 'object' && 'success' in data) {
      if (!data.success) {
        // 业务错误
        toast.error(data.message || '请求失败');
        return Promise.reject(new Error(data.message));
      }
    }
    return response;
  },
  (error) => {
    // 网络错误或 HTTP 状态码错误
    if (error.response) {
      const { status, data } = error.response;
      let message = '请求失败';
      if (data && data.message) {
        message = data.message;
      } else if (status === 401) {
        message = '未授权，请重新登录';
        // 可以触发登出逻辑
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else if (status === 403) {
        message = '权限不足';
      } else if (status === 404) {
        message = '资源不存在';
      } else if (status >= 500) {
        message = '服务器错误';
      }
      toast.error(message);
    } else if (error.request) {
      toast.error('网络错误，请检查网络连接');
    } else {
      toast.error('请求配置错误');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
