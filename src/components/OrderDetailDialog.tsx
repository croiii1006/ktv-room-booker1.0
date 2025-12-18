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
import { MemberNameDisplay } from './MemberNameDisplay';
import { StaffNameDisplay } from './StaffNameDisplay';

interface OrderDetailDialogProps {
  open: boolean;
  onClose: () => void;
  bookingId: string;
  showActions: boolean;
}

export function OrderDetailDialog({
  open,
  onClose,
  bookingId,
  showActions,
}: OrderDetailDialogProps) {
  const { bookings, rooms, stores, updateBookingStatus, user } = useData();
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [reason, setReason] = useState('');
  const [showCancelForm, setShowCancelForm] = useState(false);

  // Ensure we can find the room for display.
  // If fetchRoomSchedule hasn't been called for this room's date/store, 'room' might be undefined.
  // However, we can try to fall back to just finding the room by ID in the full list if available,
  // or show a placeholder name.
  const booking = bookings.find((b) => b.id === bookingId);

  const room = booking ? rooms.find((r) => r.id === booking.roomId) : null;

  if (!booking) return null;

  const roomDisplay = room 
      ? `${room.roomNo} - ${room.name}` 
      : (booking.roomId || '未知房间');

  const roomStoreId = room?.storeId || '1'; // Fallback
  const store = stores.find(s => s.id === roomStoreId);
  const storeName = store?.name || '未知门店';

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
      toast.error('请填写取消理由');
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
              <span className="text-muted-foreground">门店</span>
              <span className="font-medium">{storeName}</span>
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
                <MemberNameDisplay id={booking.customerId} initialName={booking.customerName} />
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">价格</span>
              <span className="font-medium text-primary">¥{booking.price}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">申请人</span>
              <span className="font-medium">
                <StaffNameDisplay id={booking.salesId} initialName={booking.salesName} staffNo={booking.salesStaffNo} showStaffNo />
              </span>
            </div>
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
                <Button variant="danger" size="full" onClick={handleCancel}>
                  确认取消
                </Button>
              </div>
            </div>
          )}
        </div>

        {!showRejectForm && !showCancelForm && (
          showActions && booking.status === 'pending' ? (
            <div className="flex gap-3">
              <Button variant="danger" size="full" onClick={() => setShowRejectForm(true)}>
                驳回
              </Button>
              <Button variant="success" size="full" onClick={handleApprove}>
                审核通过
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
               {/* Salesperson can cancel their own pending/booked requests */}
               {!showActions && user && (booking.salesId === user.id.toString() || booking.salesStaffNo === user.staffNo) && 
                (booking.status === 'pending' || booking.status === 'booked') && (
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
