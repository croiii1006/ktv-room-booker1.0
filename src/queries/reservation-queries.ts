import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { h5Api } from '../api/h5-api';
import { ReservationCreateReq, ReservationReviewReq, ReservationCancelReq } from '../models';

export const reservationKeys = {
  all: ['reservations'] as const,
  lists: () => [...reservationKeys.all, 'list'] as const,
  list: (page?: number, size?: number, status?: string) => [...reservationKeys.lists(), { page, size, status }] as const,
  pendingLists: () => [...reservationKeys.all, 'pending'] as const,
  pendingList: (page?: number, size?: number) => [...reservationKeys.pendingLists(), { page, size }] as const,
  details: () => [...reservationKeys.all, 'detail'] as const,
  detail: (id: number) => [...reservationKeys.details(), id] as const,
  staffLists: () => [...reservationKeys.all, 'staff'] as const,
  staffList: (staffId: number, page?: number, size?: number, status?: string) => [...reservationKeys.staffLists(), staffId, { page, size, status }] as const,
};

// 我的预定列表
export const useReservationList = (page?: number, size?: number, status?: string) => {
  return useQuery({
    queryKey: reservationKeys.list(page, size, status),
    queryFn: () => h5Api.myList(page, size, status),
  });
};

// 待审核列表（队长）
export const usePendingReservationList = (page?: number, size?: number) => {
  return useQuery({
    queryKey: reservationKeys.pendingList(page, size),
    queryFn: () => h5Api.pendingList(page, size),
  });
};

// 预定详情
export const useReservationDetail = (id: number) => {
  return useQuery({
    queryKey: reservationKeys.detail(id),
    queryFn: () => h5Api.detail(id),
    enabled: !!id,
  });
};

// 提交预定
export const useCreateReservation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ReservationCreateReq) => h5Api.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reservationKeys.pendingLists() }); 
      // Invalidate schedule query to update room matrix immediately
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
    },
  });
};

// 预定审核通过
export const useApproveReservation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ReservationReviewReq) => h5Api.approve(data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.pendingLists() });
      queryClient.invalidateQueries({ queryKey: reservationKeys.lists() });
      // Also invalidate specific detail
      // We don't have ID in req easily unless we look at variables.ids
      if (variables.ids) {
        variables.ids.forEach(id => {
             queryClient.invalidateQueries({ queryKey: reservationKeys.detail(id) });
        });
      }
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
    },
  });
};

// 预定审核拒绝
export const useRejectReservation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ReservationReviewReq) => h5Api.reject(data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.pendingLists() });
      queryClient.invalidateQueries({ queryKey: reservationKeys.lists() });
      if (variables.ids) {
        variables.ids.forEach(id => {
             queryClient.invalidateQueries({ queryKey: reservationKeys.detail(id) });
        });
      }
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
    },
  });
};

// 取消预定
export const useCancelReservation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ReservationCancelReq) => h5Api.cancel(data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.lists() });
       if (variables.id) {
             queryClient.invalidateQueries({ queryKey: reservationKeys.detail(variables.id) });
      }
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
    },
  });
};
