import React, { useState } from 'react';
import { format } from 'date-fns';
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RequestStatusBadge } from '@/components/RequestStatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { MemberNameDisplay } from './MemberNameDisplay';
import { StaffNameDisplay } from './StaffNameDisplay';
import { useRechargeDetail, useApproveRecharge, useRejectRecharge } from '@/queries/recharge-queries';

interface RechargeDetailDialogProps {
  open: boolean;
  onClose: () => void;
  requestId: string;
  showActions: boolean;
}

export function RechargeDetailDialog({
  open,
  onClose,
  requestId,
  showActions,
}: RechargeDetailDialogProps) {
  const { user } = useAuth();
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [reason, setReason] = useState('');

  const { data: res, isLoading } = useRechargeDetail(requestId || '');
  const request = res?.data?.data;

  const approveMutation = useApproveRecharge();
  const rejectMutation = useRejectRecharge();

  if (!open) return null;
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
  if (!request) return null;

  const handleApprove = async () => {
    try {
        await approveMutation.mutateAsync({ id: requestId, reviewerId: user?.id || '0' });
        toast.success('充值申请已通过');
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
        await rejectMutation.mutateAsync({ id: requestId, reviewerId: user?.id || '0', reason });
        toast.success('充值申请已驳回');
        setShowRejectForm(false);
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
          <DialogTitle>充值申请详情</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex justify-center mb-4">
            <RequestStatusBadge status={request.status?.toLowerCase() || 'pending'} className="text-sm px-4 py-1.5" />
          </div>

          <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
             <div className="flex justify-between">
              <span className="text-muted-foreground">申请单号</span>
              <span className="font-medium text-sm">{request.applyNo || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">客户姓名</span>
              <span className="font-medium">
                  <MemberNameDisplay id={request.memberId?.toString() || ''} initialName={request.memberName} />
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">充值金额</span>
              <span className="font-medium text-primary">¥{(request.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            {(request.giftAmount !== undefined && request.giftAmount !== null) ? (
              <div className="flex justify-between">
                <span className="text-muted-foreground">赠送金额</span>
                <span className="font-medium">¥{(request.giftAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            ) : null}
            
             <div className="flex justify-between">
              <span className="text-muted-foreground">门店</span>
              <span className="font-medium">{request.storeName || (request.storeId ? `门店 #${request.storeId}` : '-')}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">申请人</span>
              <span className="font-medium">
                <StaffNameDisplay 
                  id={request.staffId?.toString() || ''} 
                  initialName={request.staffName}
                  showStaffNo={false}
                />
              </span>
            </div>
            
            {request.reviewerName && (
               <div className="flex justify-between">
                <span className="text-muted-foreground">审核人</span>
                <span className="font-medium">{request.reviewerName}</span>
              </div>
            )}

            {request.reviewedAt && (
               <div className="flex justify-between">
                <span className="text-muted-foreground">审核时间</span>
                <span className="font-medium text-sm">{format(new Date(request.reviewedAt), 'yyyy-MM-dd HH:mm')}</span>
              </div>
            )}

            {request.remark && (
              <div className="flex flex-col space-y-1 border-t border-border/50 pt-2">
                <span className="text-muted-foreground">备注</span>
                <span className="font-medium text-sm whitespace-pre-wrap">{request.remark}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-muted-foreground">申请时间</span>
              <span className="font-medium text-sm">{request.createdAt ? format(new Date(request.createdAt), 'yyyy-MM-dd HH:mm') : ''}</span>
            </div>
            
            {request.updatedAt && (
             <div className="flex justify-between">
              <span className="text-muted-foreground">更新时间</span>
              <span className="font-medium text-sm">{format(new Date(request.updatedAt), 'yyyy-MM-dd HH:mm')}</span>
            </div>
            )}

            {request.rejectReason && (
              <div className="border-t border-border pt-3 mt-3">
                <p className="text-sm text-muted-foreground mb-1">驳回理由：</p>
                <p className="text-sm text-destructive">{request.rejectReason}</p>
              </div>
            )}
          </div>

          {request.voucherUrls && request.voucherUrls.length > 0 && (
            <div>
              <p className="text-sm font-medium text-foreground mb-2">凭证截图</p>
              <div className="grid grid-cols-2 gap-2">
                  {request.voucherUrls.map((url, idx) => (
                      <img key={idx} src={url} alt={`凭证 ${idx + 1}`} className="w-full rounded-lg" />
                  ))}
              </div>
            </div>
          )}
          {/* Fallback for single imageUrl if API model differs from actual response or if previously used */}
           {/* The user JSON showed voucherUrls: Array<string> */}
          

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
          showActions && (request.status === 'PENDING' || request.status === 'pending') ? (
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
          )
        )}
      </DialogContent>
    </Dialog>
  );
}
