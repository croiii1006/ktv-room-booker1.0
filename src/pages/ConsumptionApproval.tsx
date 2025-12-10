import React, { useState } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { PageHeader } from '@/components/PageHeader';
import { RequestStatusBadge } from '@/components/RequestStatusBadge';
import { ConsumptionDetailDialog } from '@/components/ConsumptionDetailDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';

export default function ConsumptionApproval() {
  const { user } = useAuth();
  const { getPendingConsumptionRequests } = useData();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const pendingRequests = getPendingConsumptionRequests(user?.staffNo || '');
  const sortedRequests = [...pendingRequests].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="确认消费申请审核" />

      <main className="p-4 space-y-3">
        {sortedRequests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">暂无待审核消费确认申请</p>
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
                    {request.roomName}房 - {request.customerName}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {format(new Date(request.date), 'MM/dd EEEE', { locale: zhCN })}
                  </p>
                </div>
                <RequestStatusBadge status={request.status} />
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>服务业务员: {request.serviceSalesName}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                预定业务员: {request.bookingSalesName}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {request.createdAt}
              </div>
            </div>
          ))
        )}
      </main>

      <ConsumptionDetailDialog
        open={!!selectedId}
        onClose={() => setSelectedId(null)}
        requestId={selectedId || ''}
        showActions={true}
      />
    </div>
  );
}
