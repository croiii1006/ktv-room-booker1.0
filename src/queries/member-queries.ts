import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { h5Api } from '../api/h5-api';
import { H5MemberCreateReq } from '../models';

export const memberKeys = {
  all: ['members'] as const,
  lists: () => [...memberKeys.all, 'list'] as const,
  list: (page?: number, size?: number, keyword?: string) => [...memberKeys.lists(), { page, size, keyword }] as const,
  details: () => [...memberKeys.all, 'detail'] as const,
  detail: (id: string) => [...memberKeys.details(), id] as const,
};

// 我的客户列表
export const useMemberList = (page?: number, size?: number, keyword?: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: memberKeys.list(page, size, keyword),
    queryFn: () => h5Api.myMembers(page, size, keyword),
    enabled: options?.enabled,
  });
};

// 客户详情
export const useMemberDetail = (id: string) => {
  return useQuery({
    queryKey: memberKeys.detail(id),
    queryFn: () => h5Api.detail2(id),
    enabled: !!id,
  });
};

// 新增客户
export const useCreateMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: H5MemberCreateReq) => h5Api.create2(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memberKeys.lists() });
    },
  });
};
