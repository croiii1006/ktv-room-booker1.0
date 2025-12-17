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
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-foreground">
                    {request.customerName}
                  </h3>
                  <p className="text-lg font-bold text-primary mt-1">
                    ¥{request.amount.toLocaleString()}
                  </p>
                </div>
                <RequestStatusBadge status={request.status || 'PENDING'} />
              </div>
              {request.giftAmount > 0 && (
                <p className="text-sm text-muted-foreground mb-2">
                  赠送: ¥{request.giftAmount}
                </p>
              )}
              <div className="text-xs text-muted-foreground">
                {request.createdAt ? format(new Date(request.createdAt), 'yyyy-MM-dd HH:mm') : ''}
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
