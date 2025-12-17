import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { h5Api } from '../api/h5-api';
import { H5StaffCreateReq } from '../models';
import { reservationKeys } from './reservation-queries';
import { rechargeKeys } from './recharge-queries';
import { consumeKeys } from './consume-queries';

export const teamKeys = {
  all: ['team'] as const,
  lists: () => [...teamKeys.all, 'list'] as const,
  list: (page?: number, size?: number) => [...teamKeys.lists(), { page, size }] as const,
  details: () => [...teamKeys.all, 'detail'] as const,
  detail: (id: number) => [...teamKeys.details(), id] as const,
  me: () => ['staff', 'me'] as const,
};

// 我的团队成员列表（业务员）
export const useTeamList = (page?: number, size?: number) => {
  return useQuery({
    queryKey: teamKeys.list(page, size),
    queryFn: () => h5Api.staffs(page, size),
  });
};

// 团队业务员详情（队长权限）
export const useTeamMemberDetail = (id: number) => {
  return useQuery({
    queryKey: teamKeys.detail(id),
    queryFn: () => h5Api.staffDetail(id),
    enabled: !!id,
  });
};

// 新增业务员（队长权限）
export const useCreateTeamMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: H5StaffCreateReq) => h5Api.createStaff(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
  });
};

// 业务员预定列表（队长查看）
export const useTeamMemberReservations = (staffId: number, page?: number, size?: number, status?: string) => {
  return useQuery({
    queryKey: reservationKeys.staffList(staffId, page, size, status),
    queryFn: () => h5Api.staffReservations(staffId, page, size, status),
    enabled: !!staffId,
  });
};

// 业务员充值申请列表（队长查看）
export const useTeamMemberRecharges = (staffId: number, page?: number, size?: number, status?: string) => {
  return useQuery({
    queryKey: rechargeKeys.staffList(staffId, page, size, status),
    queryFn: () => h5Api.staffRechargeApplies(staffId, page, size, status),
    enabled: !!staffId,
  });
};

// 业务员消费确认列表（队长查看）
export const useTeamMemberConsumes = (staffId: number, page?: number, size?: number, status?: string) => {
  return useQuery({
    queryKey: consumeKeys.staffList(staffId, page, size, status),
    queryFn: () => h5Api.staffConsumeApplies(staffId, page, size, status),
    enabled: !!staffId,
  });
};

// 当前登录员工信息
export const useStaffMe = () => {
  return useQuery({
    queryKey: teamKeys.me(),
    queryFn: () => h5Api.me(),
  });
};
