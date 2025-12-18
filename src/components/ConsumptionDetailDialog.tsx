import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RequestStatusBadge } from "@/components/RequestStatusBadge";
import { toast } from "sonner";
import { MemberNameDisplay } from './MemberNameDisplay';
import { StaffNameDisplay } from './StaffNameDisplay';
import { useConsumeDetail, useApproveConsume, useRejectConsume } from '@/queries/consume-queries';
import { useAuth } from '@/contexts/AuthContext';

import { getReservationDetail, getStaffDetail } from "@/services/h5-service";

interface ConsumptionDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestId: string;
  roomName?: string;
  roomNo?: string;
  showActions: boolean;
}

export function ConsumptionDetailDialog({
  open,
  onOpenChange,
  requestId,
  roomName,
  roomNo,
  showActions,
}: ConsumptionDetailDialogProps) {
  const { user } = useAuth();
  const { data: res } = useConsumeDetail(requestId ? parseInt(requestId) : 0);
  const request = res?.data?.data;

  const approveMutation = useApproveConsume();
  const rejectMutation = useRejectConsume();

  const onClose = () => {
    if (typeof onOpenChange === 'function') {
      onOpenChange(false);
    }
  };

  const [showRejectForm, setShowRejectForm] = useState(false);
  const [reason, setReason] = useState("");
  const [realBookingSalesName, setRealBookingSalesName] = useState("");
  const [realBookingSalesStaffNo, setRealBookingSalesStaffNo] = useState("");

  const displayRoomName = roomName && roomNo 
      ? `${roomNo} - ${roomName}` 
      : (roomName || request?.roomName || '未知房间');

  // Resolve Service Sales Name
  // Use applyStaffId for service sales
  const serviceSalesId = request?.applyStaffId;

  // Resolve Booking Sales Name
  // Need to fetch reservation to get booking staff ID if not provided in consume response
  const [bookingSalesId, setBookingSalesId] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (request?.reservationId) {
      getReservationDetail(request.reservationId)
        .then(async (res) => {
          if (res.code === 200 && res.data) {
             setBookingSalesId(res.data.staffId);
          }
        })
        .catch(err => {
          console.error("Failed to fetch reservation detail", err);
        });
    } else {
        setBookingSalesId(undefined);
    }
  }, [request?.reservationId]);

  const isPending = request?.status === "PENDING";
  const isRejected = request?.status === "REJECTED";
  const shouldShowRejectReason =
    !!request && (isRejected || !!request.rejectReason);

  // 只有待审核且允许操作时才显示按钮
  const canShowActions = isPending && showActions;

  useEffect(() => {
    if (!isPending) {
      setShowRejectForm(false);
      setReason("");
    }
  }, [isPending, requestId]);

  // request 不存在时
  if (!request) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-sm mx-4 rounded-xl">
          <DialogHeader>
            <DialogTitle>申请不存在</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-4">
            未找到对应的消费确认申请，可能已被删除或数据异常。
          </p>
          <Button variant="mobileSecondary" size="full" onClick={onClose}>
            关闭
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  const formattedDate = request.createdAt ? format(new Date(request.createdAt), "yyyy年MM月dd日 EEEE", {
    locale: zhCN,
  }) : '';

  const handleApprove = async () => {
    console.log("[handleApprove] requestId =", requestId);

    try {
        await approveMutation.mutateAsync({ id: parseInt(requestId), reviewerId: user?.id || 0 });
        toast.success("消费确认申请已通过");
        onClose();
    } catch (e) {
        toast.error('操作失败');
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) {
      toast.error("请填写驳回理由");
      return;
    }
    try {
        await rejectMutation.mutateAsync({ id: parseInt(requestId), reviewerId: user?.id || 0, reason: reason.trim() });
        toast.success("消费确认申请已驳回");
        setShowRejectForm(false);
        setReason("");
        onClose();
    } catch (e) {
        toast.error('操作失败');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-4 rounded-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>消费确认申请详情</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex justify-center mb-4">
            <RequestStatusBadge
              status={request.status || 'PENDING'}
              className="text-sm px-4 py-1.5"
            />
          </div>

          <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
            {request.storeName && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">门店</span>
                <span className="font-medium">{request.storeName}</span>
              </div>
            )}
            {request.consumeNo && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">单号</span>
                <span className="font-medium text-xs">{request.consumeNo}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">房号</span>
              <span className="font-medium">{displayRoomName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">日期</span>
              <span className="font-medium">{formattedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">客户</span>
              <span className="font-medium">
                <MemberNameDisplay id={request.memberId?.toString() || ''} initialName={request.memberName} />
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">预定业务员</span>
              <span className="font-medium">
                <StaffNameDisplay 
                  id={bookingSalesId?.toString() || ''} 
                  showStaffNo
                />
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">服务业务员</span>
              <span className="font-medium">
                <StaffNameDisplay 
                  id={serviceSalesId?.toString() || ''} 
                  showStaffNo
                />
              </span>
            </div>
            {request.consumeAmount !== undefined && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">消费金额</span>
                <span className="font-medium text-primary">¥{request.consumeAmount}</span>
              </div>
            )}
             {request.useBalance !== undefined && request.useBalance > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">使用本金</span>
                <span className="font-medium">¥{request.useBalance}</span>
              </div>
            )}
             {request.useGiftAmount !== undefined && request.useGiftAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">使用赠送金</span>
                <span className="font-medium">¥{request.useGiftAmount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">申请时间</span>
              <span className="font-medium text-sm">{request.createdAt}</span>
            </div>

            {!isPending && (
              <div className="border-t border-border pt-3 mt-3">
                <p className="text-sm text-muted-foreground mb-1">审核状态</p>
                <p className="text-sm font-medium">
                  {request.status === "APPROVED" ? "已通过" : "已驳回"}
                </p>
              </div>
            )}

            {shouldShowRejectReason && (
              <div className="border-t border-border pt-3 mt-3">
                <p className="text-sm text-muted-foreground mb-1">驳回理由：</p>
                <p className="text-sm text-destructive">
                  {request.rejectReason || "无驳回理由"}
                </p>
              </div>
            )}
          </div>

          {/* 驳回理由输入区域：仅 pending + 正在驳回流程时显示 */}
          {showRejectForm && isPending && (
            <div className="space-y-3 p-4 bg-accent/50 rounded-lg">
              <p className="text-sm font-medium">请填写驳回理由</p>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="请输入驳回理由..."
                className="min-h-[80px]"
              />
              <div className="flex gap-3">
                <Button
                  variant="mobileSecondary"
                  size="full"
                  onClick={() => setShowRejectForm(false)}
                >
                  取消
                </Button>
                <Button variant="danger" size="full" onClick={handleReject} disabled={rejectMutation.isPending}>
                  {rejectMutation.isPending ? '提交中...' : '确认驳回'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* 底部按钮：仅 pending 时可操作，否则只显示“关闭” */}
        {canShowActions && !showRejectForm ? (
          <div className="flex gap-3">
            <Button
              variant="danger"
              size="full"
              onClick={() => setShowRejectForm(true)}
            >
              驳回
            </Button>
            <Button variant="success" size="full" onClick={handleApprove} disabled={approveMutation.isPending}>
               {approveMutation.isPending ? '提交中...' : '通过'}
            </Button>
          </div>
        ) : (
          <Button variant="mobileSecondary" size="full" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
