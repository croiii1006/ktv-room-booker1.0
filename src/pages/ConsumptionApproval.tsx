import React, { useState } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { PageHeader } from '@/components/PageHeader';
import { RequestStatusBadge } from '@/components/RequestStatusBadge';
import { ConsumptionDetailDialog } from '@/components/ConsumptionDetailDialog';
import { useAuth } from '@/contexts/AuthContext';
import { usePendingConsumeList } from '@/queries/consume-queries';
import { StaffNameDisplay } from '@/components/StaffNameDisplay';

export default function ConsumptionApproval() {
  const { user } = useAuth();
  const { data: res, isLoading } = usePendingConsumeList(1, 100);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const pendingRequests = res?.data?.data?.list || [];
  const selectedRequest = pendingRequests.find(r => r.id?.toString() === selectedId);

  // Only allow leader
  if (!user || user.role !== 'leader') {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="消费申请审核" />
        <main className="p-4">
          <p className="text-muted-foreground text-sm">仅队长可查看消费确认申请。</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="消费申请审核" />

      <main className="p-4 space-y-3">
        {isLoading ? (
             <div className="text-center py-12">
             <p className="text-muted-foreground">加载中...</p>
           </div>
        ) : pendingRequests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">暂无待审核消费确认申请</p>
          </div>
        ) : (
          pendingRequests.map((request) => {
            const roomDisplay = request.roomTypeName ? `${request.roomTypeName} ${request.roomNo}` : (request.roomNo || '未知房间');
            const dateDisplay = request.createdAt ? format(new Date(request.createdAt), 'MM/dd EEEE', { locale: zhCN }) : '-';
            
            return (
            <div
              key={request.id}
              onClick={() => setSelectedId(request.id?.toString() || '')}
              className="bg-card rounded-lg border border-border p-4 active:bg-accent transition-colors cursor-pointer animate-fade-in"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-foreground">
                    {roomDisplay} - {request.memberName || request.customerName}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {dateDisplay}
                  </p>
                </div>
                <RequestStatusBadge status={request.status || 'PENDING'} />
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>服务业务员: <StaffNameDisplay id={request.applyStaffId?.toString()} initialName={request.serviceSalesName} /></span>
              </div>
              {request.bookingSalesName && (
                <div className="text-xs text-muted-foreground mt-1">
                  预定业务员: {request.bookingSalesName}
                </div>
              )}
              <div className="text-xs text-muted-foreground mt-1">
                {request.createdAt ? format(new Date(request.createdAt), 'yyyy-MM-dd HH:mm') : ''}
              </div>
            </div>
            );
          })
        )}
      </main>

      <ConsumptionDetailDialog
        open={!!selectedId}
        onOpenChange={(open) => !open && setSelectedId(null)}
        requestId={selectedId || ''}
        showActions={true}
        roomName={selectedRequest?.roomTypeName}
        roomNo={selectedRequest?.roomNo}
      />
    </div>
  );
}
