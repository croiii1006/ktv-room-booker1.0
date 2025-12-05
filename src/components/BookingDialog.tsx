import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { toast } from 'sonner';

interface BookingDialogProps {
  open: boolean;
  onClose: () => void;
  roomId: string;
  date: string;
  preselectedCustomerId?: string;
}

export function BookingDialog({
  open,
  onClose,
  roomId,
  date,
  preselectedCustomerId,
}: BookingDialogProps) {
  const { user } = useAuth();
  const { rooms, customers, addBooking, getCustomersByStaff } = useData();
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  const room = rooms.find((r) => r.id === roomId);
  const availableCustomers = user ? getCustomersByStaff(user.staffNo) : [];

  useEffect(() => {
    if (open && preselectedCustomerId) {
      setSelectedCustomerId(preselectedCustomerId);
    } else if (open) {
      setSelectedCustomerId('');
    }
  }, [open, preselectedCustomerId]);

  const handleSubmit = () => {
    if (!selectedCustomerId) {
      toast.error('请选择客户');
      return;
    }

    const customer = customers.find((c) => c.id === selectedCustomerId);
    if (!customer) {
      toast.error('客户不存在');
      return;
    }

    const isLeader = user?.role === 'leader';
    const status = isLeader ? 'booked' : 'pending';

    addBooking({
      roomId,
      date,
      customerId: selectedCustomerId,
      customerName: customer.name,
      price: room?.price || 0,
      status,
      salesId: user?.staffNo || '',
      salesName: user?.name || '',
      salesStaffNo: user?.staffNo || '',
    });

    if (isLeader) {
      toast.success('预定成功');
    } else {
      toast.success('申请已提交，等待队长审核');
    }

    onClose();
  };

  if (!room) return null;

  const formattedDate = date
    ? format(new Date(date), 'yyyy年MM月dd日 EEEE', { locale: zhCN })
    : '';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-4 rounded-xl">
        <DialogHeader>
          <DialogTitle>预定房间</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">房号</span>
              <span className="font-medium">{room.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">预定日期</span>
              <span className="font-medium">{formattedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">价格</span>
              <span className="font-medium text-primary">¥{room.price}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              选择客户
            </label>
            <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
              <SelectTrigger>
                <SelectValue placeholder="请选择客户" />
              </SelectTrigger>
              <SelectContent>
                {availableCustomers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name} (余额: ¥{customer.balance})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sales Info */}
          <div className="text-center text-sm text-muted-foreground pt-2">
            <p>
              {user?.name} ({user?.staffNo})
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="mobileSecondary" size="full" onClick={onClose}>
            取消
          </Button>
          <Button variant="mobileAction" size="full" onClick={handleSubmit}>
            {user?.role === 'leader' ? '预定' : '提交申请'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
