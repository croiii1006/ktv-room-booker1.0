import React from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { toast } from 'sonner';

interface BookingDetailDialogProps {
  open: boolean;
  onClose: () => void;
  bookingId: string;
}

export function BookingDetailDialog({
  open,
  onClose,
  bookingId,
}: BookingDetailDialogProps) {
  const { user } = useAuth();
  const { bookings, rooms, updateBookingStatus } = useData();

  const booking = bookings.find((b) => b.id === bookingId);
  const room = booking ? rooms.find((r) => r.id === booking.roomId) : null;

  if (!booking || !room) return null;

  const formattedDate = format(new Date(booking.date), 'yyyy年MM月dd日 EEEE', {
    locale: zhCN,
  });

  const handleMarkFinished = () => {
    updateBookingStatus(bookingId, 'finished');
    toast.success('已标记为完成');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-4 rounded-xl">
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
              <span className="text-muted-foreground">申请人</span>
              <span className="font-medium">
                {booking.salesName} ({booking.salesStaffNo})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">申请时间</span>
              <span className="font-medium text-sm">{booking.createdAt}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="mobileSecondary" size="full" onClick={onClose}>
            关闭
          </Button>
          {booking.status === 'booked' && user?.role === 'leader' && (
            <Button variant="success" size="full" onClick={handleMarkFinished}>
              标记完成
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
