import React, { useState } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Plus, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

import { MemberNameDisplay } from './MemberNameDisplay';
import { StaffNameDisplay } from './StaffNameDisplay';
import { useReservationDetail, useApproveReservation, useRejectReservation, useCancelReservation } from '@/queries/reservation-queries';
import { useCreateConsume } from '@/queries/consume-queries';
import { useUploadFile } from '@/queries/common-queries';

interface BookingDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string | null;
  roomName?: string;
  roomNo?: string;
  isReviewMode?: boolean;
  bookingState?: string;
  hideConsumptionAction?: boolean;
}

export function BookingDetailDialog({
  open,
  onOpenChange,
  bookingId,
  roomName,
  roomNo,
  roomType,
  isReviewMode = false,
  bookingState,
  hideConsumptionAction = false,
}: BookingDetailDialogProps) {
  const { user } = useAuth();
  const [showConsumptionForm, setShowConsumptionForm] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [consumeAmount, setConsumeAmount] = useState('');
  const [remark, setRemark] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: res, isLoading } = useReservationDetail(bookingId || '');
  const booking = res?.data?.data;

  const approveMutation = useApproveReservation();
  const rejectMutation = useRejectReservation();
  const createConsumeMutation = useCreateConsume();
  const uploadFileMutation = useUploadFile();

  if (!open) return null;

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-sm mx-4 rounded-xl flex justify-center py-12" aria-describedby={undefined}>
            <DialogTitle className="sr-only">加载中</DialogTitle>
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </DialogContent>
      </Dialog>
    );
  }

  if (!booking) return null;

  // Use props for room info if available (since API detail might lack it)
  // Or if API has it, we could use it. Assuming props are reliable for now.
  const roomDisplay = roomName && roomNo ? `${roomNo} - ${roomName}` : (roomName || '未知房间');

  const formattedDate = booking.reserveDate ? format(new Date(booking.reserveDate), 'yyyy年MM月dd日 EEEE', {
    locale: zhCN,
  }) : '';

  // Determine display status based on state and status
  const displayStatus = (bookingState && bookingState !== 'AVAILABLE' 
      ? bookingState 
      : (booking.state && booking.state !== 'AVAILABLE' ? booking.state : booking.status)) || 'PENDING';

  const isFinished = displayStatus === 'FINISHED';

  const handleApprove = async () => {
      setIsSubmitting(true);
      try {
          await approveMutation.mutateAsync({ id: bookingId!, reviewerId: user?.id || '0' });
          toast.success("订单已通过");
          onOpenChange(false);
      } catch (error) {
          toast.error("操作失败");
      } finally {
          setIsSubmitting(false);
      }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("请填写驳回理由");
      return;
    }
    setIsSubmitting(true);
    try {
        await rejectMutation.mutateAsync({ id: bookingId!, reviewerId: user?.id || '0', reason: rejectReason });
        toast.success("订单已驳回");
        setShowRejectForm(false);
        setRejectReason("");
        onOpenChange(false);
    } catch (error) {
        toast.error("操作失败");
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleConsumptionRequest = async () => {
    if (!consumeAmount || parseFloat(consumeAmount) <= 0) {
      toast.error('请输入有效的消费金额');
      return;
    }

    setIsSubmitting(true);
    try {
        await createConsumeMutation.mutateAsync({
            memberId: booking.memberId || '',
            storeId: booking.storeId || '',
            roomId: booking.roomId,
            reservationId: booking.id,
            applyStaffId: user?.id || '0',
            consumeAmount: parseFloat(consumeAmount),
            remark: remark,
            voucherUrls: imageUrl ? [imageUrl] : [],
        });
        
        toast.success('消费申请提交成功');
        setShowConsumptionForm(false);
        setImageUrl('');
        setConsumeAmount('');
        setRemark('');
        onOpenChange(false);
    } catch (error) {
        toast.error('提交失败');
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await uploadFileMutation.mutateAsync(file);
      if (res.data.code === 200 && res.data.data) {
        setImageUrl(res.data.data);
        toast.success('凭证上传成功');
      } else {
        toast.error(res.data.message || '上传失败');
      }
    } catch (err) {
      console.error(err);
      toast.error('上传出错');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-4 rounded-xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>订单详情</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex justify-center mb-4">
            <StatusBadge status={displayStatus} className="text-sm px-4 py-1.5" />
          </div>

          <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
            {booking.storeName && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">门店</span>
                <span className="font-medium">{booking.storeName}</span>
              </div>
            )}
            {booking.reserveNo && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">订单号</span>
                <span className="font-medium text-xs">{booking.reserveNo}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">房号</span>
              <span className="font-medium">{roomNo || booking.roomNo || '-'}</span>
            </div>
            {roomType && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">房型</span>
                <span className="font-medium">{roomType}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">房名</span>
              <span className="font-medium">{roomName || booking.roomName || '未知房间'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">预定日期</span>
              <span className="font-medium">{formattedDate}</span>
            </div>
            <div className="flex justify-between">
               <span className="text-muted-foreground">人数</span>
               <span className="font-medium">{booking.guestCount ? `${booking.guestCount}人` : '-'}</span>
            </div>
             {booking.sourceDesc && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">来源</span>
                <span className="font-medium">{booking.sourceDesc}</span>
              </div>
            )}
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
            {booking.remark && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">备注</span>
                <span className="font-medium">{booking.remark}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">申请时间</span>
              <span className="font-medium text-sm">{booking.createdAt}</span>
            </div>
          </div>

          {/* Reject Form */}
          {showRejectForm && (
            <div className="space-y-3 p-4 bg-accent/50 rounded-lg">
              <p className="text-sm font-medium">请填写驳回理由</p>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="请输入驳回理由..."
                className="min-h-[80px]"
              />
              <div className="flex gap-3">
                <Button variant="mobileSecondary" size="full" onClick={() => setShowRejectForm(false)}>
                  取消
                </Button>
                <Button variant="danger" size="full" onClick={handleReject} disabled={isSubmitting}>
                  {isSubmitting ? '提交中...' : '确认驳回'}
                </Button>
              </div>
            </div>
          )}

          {/* Consumption Request Form */}
          {showConsumptionForm && (
            <div className="space-y-3 p-4 bg-accent/50 rounded-lg">
              <p className="text-sm font-medium">提交到店消费申请</p>
              
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">消费金额 <span className="text-destructive">*</span></label>
                <Input 
                    type="number" 
                    placeholder="请输入消费金额" 
                    value={consumeAmount}
                    onChange={(e) => setConsumeAmount(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">上传凭证</label>
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
                <div className="relative">
                   <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      disabled={uploadFileMutation.isPending}
                   />
                  <div
                    className="w-full h-24 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary transition-colors"
                  >
                    <Plus className="w-6 h-6 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {uploadFileMutation.isPending ? '上传中...' : '上传凭证'}
                    </span>
                  </div>
                </div>
              )}
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">备注</label>
                <Textarea 
                    placeholder="请输入备注 (可选)" 
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    className="min-h-[60px]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="mobileSecondary" size="full" onClick={() => setShowConsumptionForm(false)}>
                  取消
                </Button>
                <Button variant="mobileAction" size="full" onClick={handleConsumptionRequest} disabled={isSubmitting || uploadFileMutation.isPending}>
                  {isSubmitting ? '提交中...' : '确认提交'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {!showConsumptionForm && !showRejectForm && (
          <div className="flex flex-col gap-3">
            {isReviewMode && booking.status === 'PENDING' ? (
              <div className="flex gap-3">
                <Button 
                  variant="danger" 
                  size="full" 
                  onClick={() => setShowRejectForm(true)}
                >
                  驳回
                </Button>
                <Button variant="success" size="full" onClick={handleApprove} disabled={isSubmitting}>
                  通过
                </Button>
              </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {!isReviewMode && booking.status === 'APPROVED' && !isFinished && !hideConsumptionAction && (
                    <Button variant="success" size="full" onClick={() => setShowConsumptionForm(true)}>
                        已到店消费申请
                    </Button>
                    )}
                    <Button variant="mobileSecondary" size="full" onClick={() => onOpenChange(false)}>
                        关闭
                    </Button>
                </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
