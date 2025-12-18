import apiClient from './api-client';
import {
  ReservationCreateReq,
  ReservationReviewReq,
  ReservationCancelReq,
  ReservationResp,
  PageResultReservationResp,
  RechargeApplyCreateReq,
  RechargeReviewReq,
  RechargeResp,
  PageResultRechargeResp,
  ConsumeApplyCreateReq,
  ConsumeReviewReq,
  ConsumeResp,
  PageResultConsumeResp,
  ResultListStoreSimpleResp,
  ResultRoomScheduleResp,
  ResultString,
  ResultVoid,
  PageResultH5TeamStaffResp,
  H5StaffCreateReq,
  PageResultH5MemberResp,
  H5MemberCreateReq,
  H5MemberResp,
  ResultListH5CardTypeResp,
} from '@/models';

// ==================== 团队管理 ====================

// 团队成员列表
export const getTeamMembers = async (page?: number, size?: number): Promise<PageResultH5TeamStaffResp> => {
  const params = new URLSearchParams();
  if (page) params.append('page', page.toString());
  if (size) params.append('size', size.toString());
  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await apiClient.get<PageResultH5TeamStaffResp>(`/api/h5/team/staffs${query}`);
  return response.data;
};

// 业务员详情
export const getStaffDetail = async (id: string): Promise<ResultH5TeamStaffResp> => {
  const response = await apiClient.get<ResultH5TeamStaffResp>(`/api/h5/team/staffs/${id}`);
  return response.data;
};

// 新增团队成员
export const createTeamMember = async (request: H5StaffCreateReq): Promise<ResultVoid> => {
  const response = await apiClient.post<ResultVoid>('/api/h5/team/staffs', request);
  return response.data;
};

// ==================== 会员管理 ====================

// 卡类型列表
export const getCardTypes = async (): Promise<ResultListH5CardTypeResp> => {
  const response = await apiClient.get<ResultListH5CardTypeResp>('/api/h5/card-types');
  return response.data;
};

// 新增会员
export const createMember = async (request: H5MemberCreateReq): Promise<ResultVoid> => {
  const response = await apiClient.post<ResultVoid>('/api/h5/members', request);
  return response.data;
};

// 我的会员列表
export const getMyMembers = async (page?: number, size?: number): Promise<PageResultH5MemberResp> => {
  const params = new URLSearchParams();
  if (page) params.append('page', page.toString());
  if (size) params.append('size', size.toString());
  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await apiClient.get<PageResultH5MemberResp>(`/api/h5/members/my${query}`);
  return response.data;
};

// 会员详情
export const getMemberDetail = async (id: string): Promise<ResultH5MemberResp> => {
  const response = await apiClient.get<ResultH5MemberResp>(`/api/h5/members/${id}`);
  return response.data;
};

// ==================== 预定相关 ====================

// 提交预定
export const createReservation = async (request: ReservationCreateReq): Promise<ReservationResp> => {
  const response = await apiClient.post<ReservationResp>('/api/h5/reservations', request);
  return response.data;
};

// 预定审核通过（队长）
export const approveReservation = async (request: ReservationReviewReq): Promise<ReservationResp> => {
  const response = await apiClient.post<ReservationResp>('/api/h5/reservations/approve', request);
  return response.data;
};

// 预定审核拒绝（队长）
export const rejectReservation = async (request: ReservationReviewReq): Promise<ReservationResp> => {
  const response = await apiClient.post<ReservationResp>('/api/h5/reservations/reject', request);
  return response.data;
};

// 取消预定
export const cancelReservation = async (request: ReservationCancelReq): Promise<ReservationResp> => {
  const response = await apiClient.post<ReservationResp>('/api/h5/reservations/cancel', request);
  return response.data;
};

// 预定详情
export const getReservationDetail = async (id: string): Promise<ReservationResp> => {
  const response = await apiClient.get<ReservationResp>(`/api/h5/reservations/${id}`);
  return response.data;
};

// 待审核列表（队长）
export const getPendingReservations = async (page?: number, size?: number): Promise<PageResultReservationResp> => {
  const params = new URLSearchParams();
  if (page) params.append('page', page.toString());
  if (size) params.append('size', size.toString());
  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await apiClient.get<PageResultReservationResp>(`/api/h5/reservations/pending${query}`);
  return response.data;
};

// 我的预定列表
export const getMyReservations = async (page?: number, size?: number, status?: string): Promise<PageResultReservationResp> => {
  const params = new URLSearchParams();
  if (page) params.append('page', page.toString());
  if (size) params.append('size', size.toString());
  if (status) params.append('status', status);
  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await apiClient.get<PageResultReservationResp>(`/api/h5/reservations/my${query}`);
  return response.data;
};

// 业务员预定列表（队长查看）
export const getTeamMemberReservations = async (staffId: string, page?: number, size?: number, status?: string): Promise<PageResultReservationResp> => {
  const params = new URLSearchParams();
  if (page) params.append('page', page.toString());
  if (size) params.append('size', size.toString());
  if (status) params.append('status', status);
  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await apiClient.get<PageResultReservationResp>(`/api/h5/team/staffs/${staffId}/reservations${query}`);
  return response.data;
};

// ==================== 充值相关 ====================

// 提交充值申请
export const createRechargeApply = async (request: RechargeApplyCreateReq): Promise<RechargeResp> => {
  const response = await apiClient.post<RechargeResp>('/api/h5/recharge-applies', request);
  return response.data;
};

// 充值审核通过（队长）
export const approveRecharge = async (request: RechargeReviewReq): Promise<RechargeResp> => {
  const response = await apiClient.post<RechargeResp>('/api/h5/recharge-applies/approve', request);
  return response.data;
};

// 充值审核拒绝（队长）
export const rejectRecharge = async (request: RechargeReviewReq): Promise<RechargeResp> => {
  const response = await apiClient.post<RechargeResp>('/api/h5/recharge-applies/reject', request);
  return response.data;
};

// 充值申请详情
export const getRechargeDetail = async (id: string): Promise<RechargeResp> => {
  const response = await apiClient.get<RechargeResp>(`/api/h5/recharge-applies/${id}`);
  return response.data;
};

// 待审核列表（队长）
export const getPendingRecharges = async (page?: number, size?: number): Promise<PageResultRechargeResp> => {
  const params = new URLSearchParams();
  if (page) params.append('page', page.toString());
  if (size) params.append('size', size.toString());
  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await apiClient.get<PageResultRechargeResp>(`/api/h5/recharge-applies/pending${query}`);
  return response.data;
};

// 我的充值申请列表
export const getMyRecharges = async (page?: number, size?: number, status?: string): Promise<PageResultRechargeResp> => {
  const params = new URLSearchParams();
  if (page) params.append('page', page.toString());
  if (size) params.append('size', size.toString());
  if (status) params.append('status', status);
  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await apiClient.get<PageResultRechargeResp>(`/api/h5/recharge-applies/my${query}`);
  return response.data;
};

// 业务员充值申请列表（队长查看）
export const getTeamMemberRecharges = async (staffId: string, page?: number, size?: number, status?: string): Promise<PageResultRechargeResp> => {
  const params = new URLSearchParams();
  if (page) params.append('page', page.toString());
  if (size) params.append('size', size.toString());
  if (status) params.append('status', status);
  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await apiClient.get<PageResultRechargeResp>(`/api/h5/team/staffs/${staffId}/recharge-applies${query}`);
  return response.data;
};

// ==================== 消费相关 ====================

// 提交消费确认
export const createConsumeApply = async (request: ConsumeApplyCreateReq): Promise<ConsumeResp> => {
  const response = await apiClient.post<ConsumeResp>('/api/h5/consume-applies', request);
  return response.data;
};

// 消费审核通过（队长）
export const approveConsume = async (request: ConsumeReviewReq): Promise<ConsumeResp> => {
  const response = await apiClient.post<ConsumeResp>('/api/h5/consume-applies/approve', request);
  return response.data;
};

// 消费审核拒绝（队长）
export const rejectConsume = async (request: ConsumeReviewReq): Promise<ConsumeResp> => {
  const response = await apiClient.post<ConsumeResp>('/api/h5/consume-applies/reject', request);
  return response.data;
};

// 消费详情
export const getConsumeDetail = async (id: string): Promise<ConsumeResp> => {
  const response = await apiClient.get<ConsumeResp>(`/api/h5/consume-applies/${id}`);
  return response.data;
};

// 待审核列表（队长）
export const getPendingConsumes = async (page?: number, size?: number): Promise<PageResultConsumeResp> => {
  const params = new URLSearchParams();
  if (page) params.append('page', page.toString());
  if (size) params.append('size', size.toString());
  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await apiClient.get<PageResultConsumeResp>(`/api/h5/consume-applies/pending${query}`);
  return response.data;
};

// 我的消费申请列表
export const getMyConsumes = async (page?: number, size?: number, status?: string): Promise<PageResultConsumeResp> => {
  const params = new URLSearchParams();
  if (page) params.append('page', page.toString());
  if (size) params.append('size', size.toString());
  if (status) params.append('status', status);
  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await apiClient.get<PageResultConsumeResp>(`/api/h5/consume-applies/my${query}`);
  return response.data;
};

// 业务员消费确认列表（队长查看）
export const getTeamMemberConsumes = async (staffId: string, page?: number, size?: number, status?: string): Promise<PageResultConsumeResp> => {
  const params = new URLSearchParams();
  if (page) params.append('page', page.toString());
  if (size) params.append('size', size.toString());
  if (status) params.append('status', status);
  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await apiClient.get<PageResultConsumeResp>(`/api/h5/team/staffs/${staffId}/consume-applies${query}`);
  return response.data;
};

// ==================== 门店相关 ====================

// 门店列表（仅 id 和名称）
export const getStoreList = async (): Promise<ResultListStoreSimpleResp> => {
  const response = await apiClient.get<ResultListStoreSimpleResp>('/api/h5/stores');
  return response.data;
};

// ==================== 排房情况 ====================

// 排房情况
export const getRoomSchedule = async (params: { storeId?: string; startDate: string; endDate: string }): Promise<ResultRoomScheduleResp> => {
  const queryParams = new URLSearchParams();
  if (params.storeId) queryParams.append('storeId', params.storeId.toString());
  queryParams.append('startDate', params.startDate);
  queryParams.append('endDate', params.endDate);
  const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
  const response = await apiClient.get<ResultRoomScheduleResp>(`/api/h5/room-schedules${query}`);
  return response.data;
};

// ==================== 文件上传 ====================

// 通用文件上传
export const uploadFile = async (file: File): Promise<ResultString> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post<ResultString>('/api/h5/oss/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
