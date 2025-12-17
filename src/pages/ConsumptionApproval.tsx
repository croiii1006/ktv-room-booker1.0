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
  const { consumptionRequests, rooms, teamMembers, isLoading } = useData();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const sortedRequests = consumptionRequests
    .filter(r => r.status === 'pending')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Only allow leader
  if (!user || user.role !== 'leader') {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="确认消费申请审核" />
        <main className="p-4">
          <p className="text-muted-foreground text-sm">仅队长可查看消费确认申请。</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="确认消费申请审核" />

      <main className="p-4 space-y-3">
        {isLoading ? (
             <div className="text-center py-12">
             <p className="text-muted-foreground">加载中...</p>
           </div>
        ) : sortedRequests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">暂无待审核消费确认申请</p>
          </div>
        ) : (
          sortedRequests.map((request) => {
            const room = rooms.find(r => r.id === request.roomId);
            const roomDisplay = room ? `${room.roomNo} - ${room.name}` : (request.roomName || request.roomId || '未知房间');
            const dateDisplay = request.createdAt ? format(new Date(request.createdAt), 'MM/dd EEEE', { locale: zhCN }) : '-';
            
            const serviceStaff = teamMembers.find(t => t.id === request.serviceSalesId || t.staffNo === request.serviceSalesStaffNo);
            const serviceSalesName = serviceStaff?.name || (request.serviceSalesName !== 'Unknown' ? request.serviceSalesName : '未知');
            
            let bookingSalesName = request.bookingSalesName;
            if (!bookingSalesName || bookingSalesName === 'Unknown') {
                 const bookingStaff = teamMembers.find(t => t.id === request.bookingSalesId || t.staffNo === request.bookingSalesId);
                 if (bookingStaff) {
                     bookingSalesName = bookingStaff.name;
                 }
            }
            
            return (
            <div
              key={request.id}
              onClick={() => setSelectedId(request.id)}
              className="bg-card rounded-lg border border-border p-4 active:bg-accent transition-colors cursor-pointer animate-fade-in"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-foreground">
                    {roomDisplay} - {request.customerName}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {dateDisplay}
                  </p>
                </div>
                <RequestStatusBadge status={request.status} />
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>服务业务员: {serviceSalesName}</span>
              </div>
              {bookingSalesName && (
                <div className="text-xs text-muted-foreground mt-1">
                  预定业务员: {bookingSalesName}
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
      />
    </div>
  );
}
