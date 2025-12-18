import { useQuery, useMutation } from '@tanstack/react-query';
import { h5Api } from '../api/h5-api';
import { h5OssApi } from '../api/h5-ossapi';

export const commonKeys = {
  stores: ['stores'] as const,
  cardTypes: ['cardTypes'] as const,
  schedule: (startDate: string, endDate: string, storeId?: string) => ['schedule', { startDate, endDate, storeId }] as const,
};

// 门店列表（仅 id 和名称）
export const useStoreList = () => {
  return useQuery({
    queryKey: commonKeys.stores,
    queryFn: () => h5Api.list(),
  });
};

// 卡类型列表
export const useCardTypeList = () => {
  return useQuery({
    queryKey: commonKeys.cardTypes,
    queryFn: () => h5Api.list1(),
  });
};

// 排房情况
export const useRoomSchedule = (startDate: string, endDate: string, storeId?: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: commonKeys.schedule(startDate, endDate, storeId),
    queryFn: () => h5Api.schedule(startDate, endDate, storeId),
    enabled: (options?.enabled !== false) && !!startDate && !!endDate && !!storeId,
  });
};

// 通用文件上传
export const useUploadFile = () => {
  return useMutation({
    mutationFn: (file: File) => h5OssApi.upload(file),
  });
};
