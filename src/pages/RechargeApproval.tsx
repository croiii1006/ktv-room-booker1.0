import React, { useState } from 'react';
import { format } from 'date-fns';
import { PageHeader } from '@/components/PageHeader';
import { RequestStatusBadge } from '@/components/RequestStatusBadge';
import { RechargeDetailDialog } from '@/components/RechargeDetailDialog';
import { MemberNameDisplay } from '@/components/MemberNameDisplay';
import { StaffNameDisplay } from '@/components/StaffNameDisplay';
import { useAuth } from '@/contexts/AuthContext';
import { usePendingRechargeList } from '@/queries/recharge-queries';

export default function RechargeApproval() {
  const { user } = useAuth();
  const { data: res, isLoading } = usePendingRechargeList(1, 100);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const pendingRequests = res?.data?.data?.list || [];

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="充值申请审核" />

      <main className="p-4 space-y-3">
        {isLoading ? (
            <div className="text-center py-12">
            <p className="text-muted-foreground">加载中...</p>
          </div>
        ) : pendingRequests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">暂无待审核充值申请</p>
          </div>
        ) : (
          pendingRequests.map((request) => {
            return (
            <div
              key={request.id}
              onClick={() => setSelectedId(request.id?.toString() || '')}
              className="bg-card rounded-lg border border-border p-4 active:bg-accent transition-colors cursor-pointer animate-fade-in"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-foreground">
                    <MemberNameDisplay id={request.memberId?.toString() || ''} initialName={request.memberName} />
                  </h3>
                  <p className="text-lg font-bold text-primary mt-1">
                    ¥{(request.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <RequestStatusBadge status={request.status?.toLowerCase() || 'pending'} />
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span className="text-xs">单号: {request.applyNo || '-'}</span>
                <span>申请人: <StaffNameDisplay id={request.staffId?.toString() || ''} showStaffNo /></span>
              </div>
              
              {(request.giftAmount !== undefined && request.giftAmount !== null) ? (
                <p className="text-sm text-muted-foreground mt-1">
                   送¥{(request.giftAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              ) : null}
              
              <div className="text-xs text-muted-foreground mt-1">
                {request.createdAt ? format(new Date(request.createdAt), 'yyyy-MM-dd HH:mm') : ''}
              </div>
            </div>
            );
          })
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
