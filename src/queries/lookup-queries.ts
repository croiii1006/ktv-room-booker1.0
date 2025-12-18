import { useQuery } from '@tanstack/react-query';
import { h5LookupApi } from '../api/h5-lookup-api';

export const lookupKeys = {
  all: ['lookup'] as const,
  members: () => [...lookupKeys.all, 'member'] as const,
  member: (id: string) => [...lookupKeys.members(), id] as const,
  staffs: () => [...lookupKeys.all, 'staff'] as const,
  staff: (id: string) => [...lookupKeys.staffs(), id] as const,
};

// 根据ID查询客户个人信息
export const useLookupMember = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: lookupKeys.member(id),
    queryFn: () => h5LookupApi.member(id),
    enabled: options?.enabled !== undefined ? options.enabled : !!id,
  });
};

// 根据ID查询员工个人信息
export const useLookupStaff = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: lookupKeys.staff(id),
    queryFn: () => h5LookupApi.staff(id),
    enabled: options?.enabled !== undefined ? options.enabled : !!id,
  });
};
