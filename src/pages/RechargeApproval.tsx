import React, { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { RequestStatusBadge } from '@/components/RequestStatusBadge';
import { RechargeDetailDialog } from '@/components/RechargeDetailDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';

export default function RechargeApproval() {
  const { user } = useAuth();
  const { getPendingRechargeRequests } = useData();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const pendingRequests = getPendingRechargeRequests(user?.staffNo || '');
  const sortedRequests = [...pendingRequests].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="充值申请审核" />

      <main className="p-4 space-y-3">
        {sortedRequests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">暂无待审核充值申请</p>
          </div>
        ) : (
          sortedRequests.map((request) => (
            <div
              key={request.id}
              onClick={() => setSelectedId(request.id)}
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
                <RequestStatusBadge status={request.status} />
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>申请人: {request.salesName} ({request.salesStaffNo})</span>
              </div>
              {request.giftProduct && (
                <p className="text-sm text-muted-foreground mt-1">
                  赠送: {request.giftProduct}
                </p>
              )}
              <div className="text-xs text-muted-foreground mt-1">
                {request.createdAt}
              </div>
            </div>
          ))
        )}
      </main>

      <RechargeDetailDialog
        open={!!selectedId}
        onClose={() => setSelectedId(null)}
        requestId={selectedId || ''}
        showActions={true}
      />
    </div>
  );
}
