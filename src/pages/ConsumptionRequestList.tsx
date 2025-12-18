import React, { useState } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { PageHeader } from '@/components/PageHeader';
import { RequestStatusBadge } from '@/components/RequestStatusBadge';
import { ConsumptionDetailDialog } from '@/components/ConsumptionDetailDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useConsumeList } from '@/queries/consume-queries';

export default function ConsumptionRequestList() {
  const { user } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: consumeData, isLoading } = useConsumeList();
  const requests = consumeData?.data?.data?.list || [];

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="确认消费申请" />

      <main className="p-4 space-y-3">
        {isLoading ? (
             <div className="text-center py-12">
             <p className="text-muted-foreground">加载中...</p>
           </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">暂无消费确认申请记录</p>
          </div>
        ) : (
          requests.map((request) => {
            const roomDisplay = request.roomNo ? `${request.roomNo} - ${request.roomTypeName}` : (request.roomTypeName || '未知房间');
            const dateDisplay = request.bookingDate ? format(new Date(request.bookingDate), 'MM/dd EEEE', { locale: zhCN }) : '-';

            return (
            <div
              key={request.id}
              onClick={() => setSelectedId(request.id?.toString() || '')}
              className="bg-card rounded-lg border border-border p-4 active:bg-accent transition-colors cursor-pointer animate-fade-in"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-foreground">
                    {roomDisplay} {request.customerName}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {dateDisplay}
                  </p>
                </div>
                <RequestStatusBadge status={request.status || 'PENDING'} />
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>服务业务员: {request.serviceStaffName || '未知'}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {request.createdAt ? format(new Date(request.createdAt), 'yyyy-MM-dd HH:mm') : ''}
              </div>
            </div>
          )})
        )}
      </main>

      <ConsumptionDetailDialog
        open={!!selectedId}
        onOpenChange={(open) => !open && setSelectedId(null)}
        requestId={selectedId || ''}
        roomName={requests.find(r => r.id?.toString() === selectedId)?.roomTypeName}
        roomNo={requests.find(r => r.id?.toString() === selectedId)?.roomNo}
        showActions={false}
      />
    </div>
  );
}
