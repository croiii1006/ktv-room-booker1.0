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
import { RequestStatusBadge } from '@/components/RequestStatusBadge';
import { useData } from '@/contexts/DataContext';
import { toast } from 'sonner';

interface ConsumptionDetailDialogProps {
  open: boolean;
  onClose: () => void;
  requestId: string;
  showActions: boolean;
}

export function ConsumptionDetailDialog({
  open,
  onClose,
  requestId,
  showActions,
}: ConsumptionDetailDialogProps) {
  const { consumptionRequests, updateConsumptionStatus, updateBookingStatus } = useData();
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [reason, setReason] = useState('');

  const request = consumptionRequests.find((r) => r.id === requestId);

  if (!request) return null;

  const formattedDate = format(new Date(request.date), 'yyyy年MM月dd日 EEEE', {
    locale: zhCN,
  });

  const handleApprove = () => {
    updateConsumptionStatus(requestId, 'approved');
    // Also update the booking status to finished
    updateBookingStatus(request.bookingId, 'finished');
    toast.success('消费确认申请已通过');
    onClose();
  };

  const handleReject = () => {
    if (!reason.trim()) {
      toast.error('请填写驳回理由');
      return;
    }
    updateConsumptionStatus(requestId, 'rejected', reason);
    toast.success('消费确认申请已驳回');
    setShowRejectForm(false);
    setReason('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-4 rounded-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>消费确认申请详情</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex justify-center mb-4">
            <RequestStatusBadge status={request.status} className="text-sm px-4 py-1.5" />
          </div>

          <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">房号</span>
              <span className="font-medium">{request.roomName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">日期</span>
              <span className="font-medium">{formattedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">客户</span>
              <span className="font-medium">{request.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">预定业务员</span>
              <span className="font-medium">{request.bookingSalesName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">服务业务员</span>
              <span className="font-medium">
                {request.serviceSalesName} ({request.serviceSalesStaffNo})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">申请时间</span>
              <span className="font-medium text-sm">{request.createdAt}</span>
            </div>
            {request.rejectReason && (
              <div className="border-t border-border pt-3 mt-3">
                <p className="text-sm text-muted-foreground mb-1">驳回理由：</p>
                <p className="text-sm text-destructive">{request.rejectReason}</p>
              </div>
            )}
          </div>

          {request.imageUrl && (
            <div>
              <p className="text-sm font-medium text-foreground mb-2">到店凭证</p>
              <img src={request.imageUrl} alt="凭证" className="w-full rounded-lg" />
            </div>
          )}

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
        </div>

        {!showRejectForm && (
          showActions && request.status === 'pending' ? (
            <div className="flex gap-3">
              <Button variant="danger" size="full" onClick={() => setShowRejectForm(true)}>
                驳回
              </Button>
              <Button variant="success" size="full" onClick={handleApprove}>
                通过
              </Button>
            </div>
          ) : (
            <Button variant="mobileSecondary" size="full" onClick={onClose}>
              关闭
            </Button>
          )
        )}
      </DialogContent>
    </Dialog>
  );
}
