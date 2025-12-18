import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { h5Api } from '../api/h5-api';
import { RechargeApplyCreateReq, RechargeReviewReq } from '../models';

export const rechargeKeys = {
  all: ['recharges'] as const,
  lists: () => [...rechargeKeys.all, 'list'] as const,
  list: (page?: number, size?: number, status?: string) => [...rechargeKeys.lists(), { page, size, status }] as const,
  pendingLists: () => [...rechargeKeys.all, 'pending'] as const,
  pendingList: (page?: number, size?: number) => [...rechargeKeys.pendingLists(), { page, size }] as const,
  details: () => [...rechargeKeys.all, 'detail'] as const,
  detail: (id: string) => [...rechargeKeys.details(), id] as const,
  staffLists: () => [...rechargeKeys.all, 'staff'] as const,
  staffList: (staffId: string, page?: number, size?: number, status?: string) => [...rechargeKeys.staffLists(), staffId, { page, size, status }] as const,
};

// 我的充值申请列表
export const useRechargeList = (page?: number, size?: number, status?: string) => {
  return useQuery({
    queryKey: rechargeKeys.list(page, size, status),
    queryFn: () => h5Api.myList1(page, size, status),
  });
};

// 待审核列表（队长）
export const usePendingRechargeList = (page?: number, size?: number) => {
  return useQuery({
    queryKey: rechargeKeys.pendingList(page, size),
    queryFn: () => h5Api.pendingList1(page, size),
  });
};

// 充值申请详情
export const useRechargeDetail = (id: string) => {
  return useQuery({
    queryKey: rechargeKeys.detail(id),
    queryFn: () => h5Api.detail1(id),
    enabled: !!id,
  });
};

// 提交充值申请
export const useCreateRecharge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RechargeApplyCreateReq) => h5Api.create1(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rechargeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: rechargeKeys.pendingLists() });
    },
  });
};

// 充值审核通过
export const useApproveRecharge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RechargeReviewReq) => h5Api.approve1(data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: rechargeKeys.pendingLists() });
      queryClient.invalidateQueries({ queryKey: rechargeKeys.lists() });
      if (variables.ids) {
        variables.ids.forEach(id => {
             queryClient.invalidateQueries({ queryKey: rechargeKeys.detail(id) });
        });
      }
    },
  });
};

// 充值审核拒绝
export const useRejectRecharge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RechargeReviewReq) => h5Api.reject1(data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: rechargeKeys.pendingLists() });
      queryClient.invalidateQueries({ queryKey: rechargeKeys.lists() });
      if (variables.ids) {
        variables.ids.forEach(id => {
             queryClient.invalidateQueries({ queryKey: rechargeKeys.detail(id) });
        });
      }
    },
  });
};
