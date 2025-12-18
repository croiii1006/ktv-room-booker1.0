import React, { useState } from 'react';
import { format } from 'date-fns';
import { PageHeader } from '@/components/PageHeader';
import { RequestStatusBadge } from '@/components/RequestStatusBadge';
import { RechargeDetailDialog } from '@/components/RechargeDetailDialog';
import { MemberNameDisplay } from '@/components/MemberNameDisplay';
import { StaffNameDisplay } from '@/components/StaffNameDisplay';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';

export default function RechargeApproval() {
  const { user } = useAuth();
  const { rechargeRequests, teamMembers, isLoading } = useData();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const pendingRequests = rechargeRequests
    .filter(r => r.status === 'pending')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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
            // Resolve Sales Name
            const staff = teamMembers.find(t => t.id === request.salesId || t.staffNo === request.salesStaffNo);
            const salesName = staff?.name || (request.salesName !== 'Unknown' ? request.salesName : '未知');

            return (
            <div
              key={request.id}
              onClick={() => setSelectedId(request.id)}
              className="bg-card rounded-lg border border-border p-4 active:bg-accent transition-colors cursor-pointer animate-fade-in"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-foreground">
                    <MemberNameDisplay id={request.memberId || request.customerId} initialName={request.customerName} />
                  </h3>
                  <p className="text-lg font-bold text-primary mt-1">
                    ¥{request.amount.toLocaleString()}
                  </p>
                </div>
                <RequestStatusBadge status={request.status} />
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>申请人: <StaffNameDisplay id={request.salesId} initialName={salesName} /></span>
              </div>
              {/* DataContext stores gift amount in giftProduct string like "送100", let's parse or use giftProduct if amount is missing */}
              {/* Actually DataContext RechargeRequest has giftProduct string, but we can try to parse it if we want amount. */}
              {/* Wait, the raw API has giftAmount. DataContext map: giftProduct: r.giftAmount ? `送${r.giftAmount}` : '', */}
              {request.giftProduct && (
                <p className="text-sm text-muted-foreground mt-1">
                   {request.giftProduct}
                </p>
              )}
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
