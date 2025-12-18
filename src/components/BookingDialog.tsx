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
import { toast } from 'sonner';
import { useMemberList } from '@/queries/member-queries';
import { useCreateReservation } from '@/queries/reservation-queries';

interface BookingDialogProps {
  open: boolean;
  onClose: () => void;
  roomId: string;
  roomName: string;
  roomNo: string;
  roomType: string;
  roomPrice: number;
  date: string;
  preselectedCustomerId?: string;
}

export function BookingDialog({
  open,
  onClose,
  roomId,
  roomName,
  roomNo,
  roomType,
  roomPrice,
  date,
  preselectedCustomerId,
}: BookingDialogProps) {
  const { user } = useAuth();
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  // Fetch customers directly
  const { data: memberData } = useMemberList(1, 100, undefined, { enabled: open });
  // API response structure: response.data (body) -> data (payload) -> list
  const customers = memberData?.data?.data?.list || [];
  
  const createReservationMutation = useCreateReservation();

  useEffect(() => {
    if (open && preselectedCustomerId) {
      setSelectedCustomerId(preselectedCustomerId);
    } else if (open) {
      setSelectedCustomerId('');
    }
  }, [open, preselectedCustomerId]);

  const handleSubmit = async () => {
    if (!selectedCustomerId) {
      toast.error('请选择客户');
      return;
    }

    const customer = customers.find((c) => c.id?.toString() === selectedCustomerId);
    if (!customer) {
      toast.error('客户不存在');
      return;
    }

    try {
      await createReservationMutation.mutateAsync({
        storeId: customer.storeId || 1, // Fallback to 1 or user store
        roomId: parseInt(roomId),
        memberId: parseInt(selectedCustomerId),
        staffId: user?.id || 0,
        reserveDate: date,
        guestCount: 1,
        remark: ''
      });
      
      toast.success('申请已提交，等待队长审核');
      
      // Invalidate queries to refresh the matrix
      // Since we don't have direct access to invalidate specific schedule query from here without prop drilling queryClient,
      // we can rely on React Query's global invalidation or just assume the parent will refetch if we signal it.
      // But better yet, use queryClient.
      // queryClient.invalidateQueries({ queryKey: ['schedule'] }); is handled in the mutation onSuccess in reservation-queries usually.
      
      onClose();
    } catch (error) {
      toast.error('提交失败');
      console.error(error);
    }
  };

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
              <span className="font-medium">{roomNo}</span>
            </div>
            {roomType && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">房型</span>
                <span className="font-medium">{roomType}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">房名</span>
              <span className="font-medium">{roomName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">预定日期</span>
              <span className="font-medium">{formattedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">价格</span>
              <span className="font-medium text-primary">¥{roomPrice}</span>
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
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id?.toString() || ''}>
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
          <Button variant="mobileAction" size="full" onClick={handleSubmit} disabled={createReservationMutation.isPending}>
            {createReservationMutation.isPending ? '提交中...' : '提交申请'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
