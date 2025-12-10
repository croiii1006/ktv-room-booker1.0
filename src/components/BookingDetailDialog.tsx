import React, { useState } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
  const { bookings, rooms, addConsumptionRequest, getLeaderIdForSales } = useData();
  const [showConsumptionForm, setShowConsumptionForm] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const booking = bookings.find((b) => b.id === bookingId);
  const room = booking ? rooms.find((r) => r.id === booking.roomId) : null;

  if (!booking || !room) return null;

  const formattedDate = format(new Date(booking.date), 'yyyy年MM月dd日 EEEE', {
    locale: zhCN,
  });

  const handleConsumptionRequest = () => {
    const leaderId = getLeaderIdForSales(user?.staffNo || '');
    if (!leaderId) {
      toast.error('未找到关联的队长');
      return;
    }

    addConsumptionRequest({
      bookingId: booking.id,
      customerId: booking.customerId,
      customerName: booking.customerName,
      roomId: booking.roomId,
      roomName: room.name,
      date: booking.date,
      bookingSalesId: booking.salesId,
      bookingSalesName: booking.salesName,
      serviceSalesId: user?.staffNo || '',
      serviceSalesName: user?.name || '',
      serviceSalesStaffNo: user?.staffNo || '',
      imageUrl: imageUrl || undefined,
      status: 'pending',
      leaderId,
    });

    toast.success('已到店消费申请已提交');
    setShowConsumptionForm(false);
    setImageUrl('');
    onClose();
  };

  const handleImageUpload = () => {
    // Simulate image upload with a placeholder URL
    setImageUrl(`https://placeholder.pics/svg/300x200/DEDEDE/555555/凭证${Date.now()}`);
    toast.success('凭证上传成功');
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
          </div>

          {/* Consumption Request Form */}
          {showConsumptionForm && (
            <div className="space-y-3 p-4 bg-accent/50 rounded-lg">
              <p className="text-sm font-medium">提交到店消费凭证（可选）</p>
              {imageUrl ? (
                <div className="relative">
                  <img src={imageUrl} alt="凭证" className="w-full h-32 object-cover rounded-lg" />
                  <button
                    onClick={() => setImageUrl('')}
                    className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 text-xs"
                  >
                    删除
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleImageUpload}
                  className="w-full h-24 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary transition-colors"
                >
                  <Plus className="w-6 h-6 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">上传凭证</span>
                </button>
              )}
              <div className="flex gap-3">
                <Button variant="mobileSecondary" size="full" onClick={() => setShowConsumptionForm(false)}>
                  取消
                </Button>
                <Button variant="mobileAction" size="full" onClick={handleConsumptionRequest}>
                  确认提交
                </Button>
              </div>
            </div>
          )}
        </div>

        {!showConsumptionForm && (
          <div className="flex flex-col gap-3">
            {booking.status === 'booked' && (
              <Button variant="success" size="full" onClick={() => setShowConsumptionForm(true)}>
                已到店消费申请
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
