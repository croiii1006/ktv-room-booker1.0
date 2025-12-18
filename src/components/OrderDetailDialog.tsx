import React, { useState } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/StatusBadge';
import { toast } from 'sonner';
import { MemberNameDisplay } from './MemberNameDisplay';
import { StaffNameDisplay } from './StaffNameDisplay';
import { useReservationDetail, useApproveReservation, useRejectReservation, useCancelReservation } from '@/queries/reservation-queries';
import { useAuth } from '@/contexts/AuthContext';

interface OrderDetailDialogProps {
  open: boolean;
  onClose: () => void;
  bookingId: string;
  showActions: boolean;
  roomName?: string;
  storeName?: string;
}

export function OrderDetailDialog({
  open,
  onClose,
  bookingId,
  showActions,
  roomName,
  storeName,
}: OrderDetailDialogProps) {
  const { user } = useAuth();
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [reason, setReason] = useState('');
  const [showCancelForm, setShowCancelForm] = useState(false);

  const { data: res } = useReservationDetail(bookingId ? parseInt(bookingId) : 0);
  const booking = res?.data?.data;

  const approveMutation = useApproveReservation();
  const rejectMutation = useRejectReservation();
  const cancelMutation = useCancelReservation();

  if (!booking) return null;

  const roomDisplay = roomName 
      ? roomName 
      : (booking.roomId ? `Room #${booking.roomId}` : '未知房间');

  const displayStoreName = storeName || (booking.storeId ? `Store #${booking.storeId}` : '未知门店');

  const formattedDate = booking.reserveDate ? format(new Date(booking.reserveDate), 'yyyy年MM月dd日 EEEE', {
    locale: zhCN,
  }) : '';

  const handleApprove = async () => {
    try {
        await approveMutation.mutateAsync({ id: parseInt(bookingId), reviewerId: user?.id || 0 });
        toast.success('订单已通过');
        onClose();
    } catch (e) {
        toast.error('操作失败');
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) {
      toast.error('请填写驳回理由');
      return;
    }
    try {
        await rejectMutation.mutateAsync({ id: parseInt(bookingId), reviewerId: user?.id || 0, reason });
        toast.success('订单已驳回');
        setShowRejectForm(false);
        setReason('');
        onClose();
    } catch (e) {
        toast.error('操作失败');
    }
  };

  const handleCancel = async () => {
    if (!reason.trim()) {
      toast.error('请填写取消理由');
      return;
    }
    try {
        await cancelMutation.mutateAsync({ id: parseInt(bookingId), staffId: user?.id || 0, reason });
        toast.success('订单已取消');
        setShowCancelForm(false);
        setReason('');
        onClose();
    } catch (e) {
        toast.error('操作失败');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-4 rounded-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>订单详情</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex justify-center mb-4">
            <StatusBadge status={booking.status || 'PENDING'} className="text-sm px-4 py-1.5" />
          </div>

          <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">门店</span>
              <span className="font-medium">{displayStoreName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">房号</span>
              <span className="font-medium">{roomDisplay}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">预定日期</span>
              <span className="font-medium">{formattedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">客户</span>
              <span className="font-medium">
                <MemberNameDisplay id={booking.memberId?.toString()} initialName={booking.memberName} />
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">价格</span>
              <span className="font-medium text-primary">¥{0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">申请人</span>
              <span className="font-medium">
                <StaffNameDisplay id={booking.staffId?.toString()} initialName={booking.applyStaffName} />
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">申请时间</span>
              <span className="font-medium text-sm">{booking.createdAt}</span>
            </div>
            {booking.remark && (
              <div className="border-t border-border pt-3 mt-3">
                <p className="text-sm text-muted-foreground mb-1">驳回理由：</p>
                <p className="text-sm text-destructive">{booking.remark}</p>
              </div>
            )}
          </div>

          {/* Reject Form */}
          {showRejectForm && (
            <div className="space-y-3 p-4 bg-accent/50 rounded-lg">
              <p className="text-sm font-medium">请填写驳回理由</p>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="请输入驳回理由..."
                className="min-h-[80px]"
              />
              <div className="flex gap-3">
                <Button variant="mobileSecondary" size="full" onClick={() => setShowRejectForm(false)}>
                  取消
                </Button>
                <Button variant="danger" size="full" onClick={handleReject} disabled={rejectMutation.isPending}>
                  {rejectMutation.isPending ? '提交中...' : '确认驳回'}
                </Button>
              </div>
            </div>
          )}
          {/* Cancel Form */}
          {showCancelForm && (
            <div className="space-y-3 p-4 bg-accent/50 rounded-lg">
              <p className="text-sm font-medium">请填写取消理由</p>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="请输入取消理由..."
                className="min-h-[80px]"
              />
              <div className="flex gap-3">
                <Button variant="mobileSecondary" size="full" onClick={() => setShowCancelForm(false)}>
                  取消
                </Button>
                <Button variant="danger" size="full" onClick={handleCancel} disabled={cancelMutation.isPending}>
                  {cancelMutation.isPending ? '提交中...' : '确认取消'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {!showRejectForm && !showCancelForm && (
          showActions && booking.status === 'PENDING' ? (
            <div className="flex gap-3">
              <Button variant="danger" size="full" onClick={() => setShowRejectForm(true)}>
                驳回
              </Button>
              <Button variant="success" size="full" onClick={handleApprove} disabled={approveMutation.isPending}>
                {approveMutation.isPending ? '提交中...' : '审核通过'}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
               {/* Salesperson can cancel their own pending/booked requests */}
               {!showActions && user && (booking.staffId === user.id) && 
                (booking.status === 'PENDING' || booking.status === 'APPROVED') && (
                 <Button variant="destructive" size="full" onClick={() => setShowCancelForm(true)}>
                   取消订单
                 </Button>
               )}
               <Button variant="mobileSecondary" size="full" onClick={onClose}>
                 关闭
               </Button>
            </div>
          )
        )}
      </DialogContent>
    </Dialog>
  );
}
