import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { h5Api } from '../api/h5-api';
import { ConsumeApplyCreateReq, ConsumeReviewReq } from '../models';

export const consumeKeys = {
  all: ['consumes'] as const,
  lists: () => [...consumeKeys.all, 'list'] as const,
  list: (page?: number, size?: number, status?: string) => [...consumeKeys.lists(), { page, size, status }] as const,
  pendingLists: () => [...consumeKeys.all, 'pending'] as const,
  pendingList: (page?: number, size?: number) => [...consumeKeys.pendingLists(), { page, size }] as const,
  details: () => [...consumeKeys.all, 'detail'] as const,
  detail: (id: number) => [...consumeKeys.details(), id] as const,
  staffLists: () => [...consumeKeys.all, 'staff'] as const,
  staffList: (staffId: number, page?: number, size?: number, status?: string) => [...consumeKeys.staffLists(), staffId, { page, size, status }] as const,
};

// 我的消费申请列表
export const useConsumeList = (page?: number, size?: number, status?: string) => {
  return useQuery({
    queryKey: consumeKeys.list(page, size, status),
    queryFn: () => h5Api.myList2(page, size, status),
  });
};

// 待审核列表（队长）
export const usePendingConsumeList = (page?: number, size?: number) => {
  return useQuery({
    queryKey: consumeKeys.pendingList(page, size),
    queryFn: () => h5Api.pendingList2(page, size),
  });
};

// 消费详情
export const useConsumeDetail = (id: number) => {
  return useQuery({
    queryKey: consumeKeys.detail(id),
    queryFn: () => h5Api.detail3(id),
    enabled: !!id,
  });
};

// 提交消费确认
export const useCreateConsume = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ConsumeApplyCreateReq) => h5Api.create3(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: consumeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: consumeKeys.pendingLists() });
    },
  });
};

// 消费审核通过
export const useApproveConsume = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ConsumeReviewReq) => h5Api.approve2(data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: consumeKeys.pendingLists() });
      queryClient.invalidateQueries({ queryKey: consumeKeys.lists() });
       if (variables.ids) {
        variables.ids.forEach(id => {
             queryClient.invalidateQueries({ queryKey: consumeKeys.detail(id) });
        });
      }
    },
  });
};

// 消费审核拒绝
export const useRejectConsume = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ConsumeReviewReq) => h5Api.reject2(data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: consumeKeys.pendingLists() });
      queryClient.invalidateQueries({ queryKey: consumeKeys.lists() });
       if (variables.ids) {
        variables.ids.forEach(id => {
             queryClient.invalidateQueries({ queryKey: consumeKeys.detail(id) });
        });
      }
    },
  });
};
