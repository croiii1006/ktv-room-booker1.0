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
import { useData } from "@/contexts/DataContext";
import { toast } from "sonner";

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
  const {
    consumptionRequests,
    updateConsumptionStatus,
    updateBooking,            // ✅ 改这里：使用 updateBooking
  } = useData();

  const [showRejectForm, setShowRejectForm] = useState(false);
  const [reason, setReason] = useState("");

  // 先找到请求
  const request = consumptionRequests.find((r) => r.id === requestId);

  const isPending = request?.status === "pending";
  const isRejected = request?.status === "rejected";
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

  const formattedDate = format(new Date(request.date), "yyyy年MM月dd日 EEEE", {
    locale: zhCN,
  });

  const handleApprove = () => {
    console.log("[handleApprove] requestId =", requestId);

    // 1. 审核通过消费确认申请
    updateConsumptionStatus(requestId, "approved");

    // 2. 同步更新订房记录：设为已完成，并写入服务业务员信息
    updateBooking(request.bookingId, {
      status: "finished",
      serviceSalesId: request.serviceSalesId,
      serviceSalesName: request.serviceSalesName,
      serviceSalesStaffNo: request.serviceSalesStaffNo,
    });

    toast.success("消费确认申请已通过");
    onClose();
  };

  const handleReject = () => {
    if (!reason.trim()) {
      toast.error("请填写驳回理由");
      return;
    }
    updateConsumptionStatus(requestId, "rejected", reason.trim());
    toast.success("消费确认申请已驳回");
    setShowRejectForm(false);
    setReason("");
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
            <RequestStatusBadge
              status={request.status}
              className="text-sm px-4 py-1.5"
            />
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

            {!isPending && (
              <div className="border-t border-border pt-3 mt-3">
                <p className="text-sm text-muted-foreground mb-1">审核状态</p>
                <p className="text-sm font-medium">
                  {request.status === "approved" ? "已通过" : "已驳回"}
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

          {request.imageUrl && (
            <div>
              <p className="text-sm font-medium text-foreground mb-2">
                到店凭证
              </p>
              <img
                src={request.imageUrl}
                alt="凭证"
                className="w-full rounded-lg"
              />
            </div>
          )}

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
                <Button variant="danger" size="full" onClick={handleReject}>
                  确认驳回
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
            <Button variant="success" size="full" onClick={handleApprove}>
              通过
            </Button>
          </div>
        ) : (
          <Button variant="mobileSecondary" size="full" onClick={onClose}>
            关闭
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
