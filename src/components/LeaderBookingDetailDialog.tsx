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
import { useData } from '@/contexts/DataContext';
import { toast } from 'sonner';

interface LeaderBookingDetailDialogProps {
  open: boolean;
  onClose: () => void;
  bookingId: string;
}

export function LeaderBookingDetailDialog({
  open,
  onClose,
  bookingId,
}: LeaderBookingDetailDialogProps) {
  const { bookings, rooms, updateBookingStatus } = useData();
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [reason, setReason] = useState('');

  // Handle free cell view
  if (bookingId.startsWith('free_')) {
    const [, roomId, date] = bookingId.split('_');
    const room = rooms.find((r) => r.id === roomId);
    
    // Check for cancelled bookings on this date/room
    const cancelledBooking = bookings.find(
      (b) => b.roomId === roomId && b.date === date && b.status === 'cancelled'
    );

    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-sm mx-4 rounded-xl">
          <DialogHeader>
            <DialogTitle>房间详情</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">房号</span>
                <span className="font-medium">{room?.name}</span>
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
              {cancelledBooking && (
                <>
                  <div className="border-t border-border pt-3 mt-3">
                    <p className="text-sm text-muted-foreground mb-1">提前取消记录：</p>
                    <p className="text-sm">{cancelledBooking.cancelReason || '无原因'}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          <Button variant="mobileSecondary" size="full" onClick={onClose}>
            关闭
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  const booking = bookings.find((b) => b.id === bookingId);
  const room = booking ? rooms.find((r) => r.id === booking.roomId) : null;

  if (!booking || !room) return null;

  const formattedDate = format(new Date(booking.date), 'yyyy年MM月dd日 EEEE', {
    locale: zhCN,
  });

  const handleApprove = () => {
    updateBookingStatus(bookingId, 'booked');
    toast.success('订单已通过');
    onClose();
  };

  const handleReject = () => {
    if (!reason.trim()) {
      toast.error('请填写驳回理由');
      return;
    }
    updateBookingStatus(bookingId, 'rejected', reason);
    toast.success('订单已驳回');
    setShowRejectForm(false);
    setReason('');
    onClose();
  };

  const handleCancel = () => {
    if (!reason.trim()) {
      toast.error('请填写取消原因');
      return;
    }
    updateBookingStatus(bookingId, 'cancelled', reason);
    toast.success('订单已取消');
    setShowCancelForm(false);
    setReason('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-4 rounded-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>订单详情</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex justify-center mb-4">
            <StatusBadge status={booking.status} className="text-sm px-4 py-1.5" />
          </div>

          <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">房号</span>
              <span className="font-medium">{room.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">预定日期</span>
              <span className="font-medium">{formattedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">客户</span>
              <span className="font-medium">{booking.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">价格</span>
              <span className="font-medium text-primary">¥{booking.price}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">预定业务员</span>
              <span className="font-medium">
                {booking.salesName} ({booking.salesStaffNo})
              </span>
            </div>
            {booking.serviceSalesName && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">服务业务员</span>
                <span className="font-medium">
                  {booking.serviceSalesName} ({booking.serviceSalesStaffNo})
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">申请时间</span>
              <span className="font-medium text-sm">{booking.createdAt}</span>
            </div>
            {booking.rejectReason && (
              <div className="border-t border-border pt-3 mt-3">
                <p className="text-sm text-muted-foreground mb-1">驳回理由：</p>
                <p className="text-sm text-destructive">{booking.rejectReason}</p>
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
                <Button variant="danger" size="full" onClick={handleReject}>
                  确认驳回
                </Button>
              </div>
            </div>
          )}

          {/* Cancel Form */}
          {showCancelForm && (
            <div className="space-y-3 p-4 bg-accent/50 rounded-lg">
              <p className="text-sm font-medium">请填写提前取消原因</p>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="请输入取消原因..."
                className="min-h-[80px]"
              />
              <div className="flex gap-3">
                <Button variant="mobileSecondary" size="full" onClick={() => setShowCancelForm(false)}>
                  返回
                </Button>
                <Button variant="danger" size="full" onClick={handleCancel}>
                  确认取消
                </Button>
              </div>
            </div>
          )}
        </div>

        {!showRejectForm && !showCancelForm && (
          <div className="flex flex-col gap-3">
            {booking.status === 'pending' && (
              <div className="flex gap-3">
                <Button variant="danger" size="full" onClick={() => setShowRejectForm(true)}>
                  驳回
                </Button>
                <Button variant="success" size="full" onClick={handleApprove}>
                  通过
                </Button>
              </div>
            )}
            {booking.status === 'finished' && (
              <Button variant="danger" size="full" onClick={() => setShowCancelForm(true)}>
                提前取消
              </Button>
            )}
            <Button variant="mobileSecondary" size="full" onClick={onClose}>
              关闭
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
