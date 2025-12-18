import React, { useState } from 'react';
import { format } from 'date-fns';
import { PageHeader } from '@/components/PageHeader';
import { RequestStatusBadge } from '@/components/RequestStatusBadge';
import { RechargeDetailDialog } from '@/components/RechargeDetailDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useRechargeList } from '@/queries/recharge-queries';

export default function RechargeRequestList() {
  const { user } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: rechargeData, isLoading } = useRechargeList();
  const requests = rechargeData?.data?.data?.list || [];

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="充值申请" />

      <main className="p-4 space-y-3">
        {isLoading ? (
            <div className="text-center py-12">
            <p className="text-muted-foreground">加载中...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">暂无充值申请记录</p>
          </div>
        ) : (
          requests.map((request) => (
            <div
              key={request.id}
              onClick={() => setSelectedId(request.id?.toString() || '')}
              className="bg-card rounded-lg border border-border p-4 active:bg-accent transition-colors cursor-pointer animate-fade-in"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-foreground">
                    {request.memberName || '无名'}
                  </h3>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    单号: {request.applyNo}
                  </div>
                </div>
                <RequestStatusBadge status={request.status || 'PENDING'} />
              </div>

              <div className="mb-2">
                <p className="text-lg font-bold text-primary">
                  ¥{request.amount?.toLocaleString()}
                  {request.giftAmount && request.giftAmount > 0 ? (
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      (赠: ¥{request.giftAmount})
                    </span>
                  ) : null}
                </p>
              </div>

              <div className="text-sm text-muted-foreground space-y-1">
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  <span>门店: {request.storeName}</span>
                  <span>业务员: {request.staffName}</span>
                </div>
                
                {request.remark && (
                  <div>备注: {request.remark}</div>
                )}
                
                {request.status === 'REJECTED' && request.rejectReason && (
                  <div className="text-destructive">
                    拒绝原因: {request.rejectReason}
                  </div>
                )}

                <div className="flex justify-between items-center mt-2 pt-2 border-t border-border/50 text-xs">
                  <span>
                    {request.reviewerName ? `审核人: ${request.reviewerName}` : ''}
                  </span>
                  <span>
                    {request.createdAt
                      ? format(new Date(request.createdAt), 'yyyy-MM-dd HH:mm')
                      : ''}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </main>

      <RechargeDetailDialog
        open={!!selectedId}
        onClose={() => setSelectedId(null)}
        requestId={selectedId || ''}
        showActions={false}
      />
    </div>
  );
}
