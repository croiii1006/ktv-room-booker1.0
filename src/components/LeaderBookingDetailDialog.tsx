import React, { useState } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';
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

interface LeaderBookingDetailDialogProps {
  open: boolean;
  onClose: () => void;
  bookingId: string;
  roomName?: string;
  roomNo?: string;
  roomType?: string;
}

export function LeaderBookingDetailDialog({
  open,
  onClose,
  bookingId,
  roomName,
  roomNo,
  roomType,
}: LeaderBookingDetailDialogProps) {
  const { user } = useAuth();
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [reason, setReason] = useState('');

  // Determine if it's a real booking ID
  const isFreeSlot = bookingId.startsWith('free_');
  const realBookingId = isFreeSlot ? '' : bookingId;

  const { data: res, isLoading } = useReservationDetail(realBookingId);
  const booking = res?.data?.data;

  const approveMutation = useApproveReservation();
  const rejectMutation = useRejectReservation();

  // Handle free cell view
  if (isFreeSlot) {
    const [, roomId, date] = bookingId.split('_');
    // We don't have cancelled bookings list here easily without fetching list.
    // If we want to show cancelled booking history for this slot, we'd need to fetch bookings for this room/date.
    // For now, removing cancelled booking display to simplify, or we can fetch it if critical.
    // Assuming showing room info is main purpose.
    
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-sm mx-4 rounded-xl" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>房间详情</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">房号</span>
                <span className="font-medium">{roomNo || '-'}</span>
              </div>
              {roomType && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">房型</span>
                  <span className="font-medium">{roomType}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">房名</span>
                <span className="font-medium">{roomName || '未知房间'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">日期</span>
                <span className="font-medium">
                  {date && format(new Date(date), 'yyyy年MM月dd日', { locale: zhCN })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">状态</span>
                <span className="font-medium text-status-free">可预订</span>
              </div>
            </div>
          </div>

          <Button variant="mobileSecondary" size="full" onClick={onClose}>
            关闭
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-sm mx-4 rounded-xl flex justify-center py-12" aria-describedby={undefined}>
            <DialogTitle className="sr-only">加载中</DialogTitle>
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </DialogContent>
      </Dialog>
    );
  }

  if (!booking) return null;

  const formattedDate = booking.reserveDate ? format(new Date(booking.reserveDate), 'yyyy年MM月dd日 EEEE', {
    locale: zhCN,
  }) : '';

  const handleApprove = async () => {
    try {
        await approveMutation.mutateAsync({ id: realBookingId, reviewerId: user?.id?.toString() || '' });
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
        await rejectMutation.mutateAsync({ id: realBookingId, reviewerId: user?.id?.toString() || '', reason });
        toast.success('订单已驳回');
        setShowRejectForm(false);
        setReason('');
        onClose();
    } catch (e) {
        toast.error('操作失败');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-4 rounded-xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>订单详情</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex justify-center mb-4">
            <StatusBadge status={booking.status || 'PENDING'} className="text-sm px-4 py-1.5" />
          </div>

          <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
                <span className="text-muted-foreground">房号</span>
                <span className="font-medium">{roomNo || '-'}</span>
              </div>
              {roomType && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">房型</span>
                  <span className="font-medium">{roomType}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">房名</span>
                <span className="font-medium">{roomName || '未知房间'}</span>
              </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">预定日期</span>
              <span className="font-medium">{formattedDate}</span>
            </div>
            <div className="flex justify-between">
               <span className="text-muted-foreground">人数</span>
               <span className="font-medium">{booking.guestCount ? `${booking.guestCount}人` : '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">客户</span>
              <span className="font-medium">
                <MemberNameDisplay id={booking.memberId?.toString()} initialName={booking.memberName} />
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">价格</span>
              <span className="font-medium text-primary">¥{booking.price ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">预定业务员</span>
              <span className="font-medium">
                <StaffNameDisplay id={booking.staffId?.toString()} initialName={booking.applyStaffName} />
              </span>
            </div>
            {booking.serviceStaffName && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">服务业务员</span>
                <span className="font-medium">
                  <StaffNameDisplay initialName={booking.serviceStaffName} />
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">申请时间</span>
              <span className="font-medium text-sm">{booking.createdAt}</span>
            </div>
            {booking.remark && ( // Assuming rejectReason mapped to remark in some cases or field exists
              <div className="border-t border-border pt-3 mt-3">
                <p className="text-sm text-muted-foreground mb-1">备注：</p>
                <p className="text-sm">{booking.remark}</p>
              </div>
            )}
            {booking.cancelReason && (
              <div className="border-t border-border pt-3 mt-3">
                <p className="text-sm text-muted-foreground mb-1">取消原因：</p>
                <p className="text-sm text-destructive">{booking.cancelReason}</p>
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
        </div>

        {!showRejectForm && (
          <div className="flex flex-col gap-3">
            {booking.status === 'PENDING' ? (
              <div className="flex gap-3">
                <Button variant="danger" size="full" onClick={() => setShowRejectForm(true)}>
                  驳回
                </Button>
                <Button variant="success" size="full" onClick={handleApprove} disabled={approveMutation.isPending}>
                  {approveMutation.isPending ? '提交中...' : '通过'}
                </Button>
              </div>
            ) : (
                <Button variant="mobileSecondary" size="full" onClick={onClose}>
                    关闭
                </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
