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
  const { getPendingConsumptionRequests, fetchPendingRequests, rooms, teamMembers } = useData();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  React.useEffect(() => {
    fetchPendingRequests();
  }, [fetchPendingRequests]);

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

  const visibleRequests = getPendingConsumptionRequests(user.staffNo);
  const sortedRequests = [...visibleRequests].sort(
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
          sortedRequests.map((request) => {
            // Find room
            const room = rooms.find((r) => r.id === request.roomId);
            const roomDisplay = room 
                ? `${room.roomNo} - ${room.name}` 
                : (request.roomName || request.roomId || '未知房间');

            // Resolve Service Sales Name
            let serviceSalesName = request.serviceSalesName;
            if (!serviceSalesName || serviceSalesName === 'Unknown' || serviceSalesName === request.serviceSalesId) {
                const staff = teamMembers.find(t => t.id === request.serviceSalesId || t.staffNo === request.serviceSalesStaffNo);
                if (staff) serviceSalesName = staff.name;
                else if (user && (user.id.toString() === request.serviceSalesId || user.staffNo === request.serviceSalesStaffNo)) {
                    serviceSalesName = user.name;
                }
            }

            // Resolve Booking Sales Name (if ID is available but name is missing)
            // Note: DataContext might need to be enriched to link booking sales info more robustly if missing.
            // For now, if it's missing, we leave it empty or try to find it if we have the ID.
            let bookingSalesName = request.bookingSalesName;
            if (!bookingSalesName && request.bookingSalesId) {
                const staff = teamMembers.find(t => t.id === request.bookingSalesId || t.staffNo === request.bookingSalesId);
                if (staff) bookingSalesName = staff.name;
                else if (user && (user.id.toString() === request.bookingSalesId || user.staffNo === request.bookingSalesId)) {
                    bookingSalesName = user.name;
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
                    {request.date ? format(new Date(request.date), 'MM/dd EEEE', { locale: zhCN }) : ''}
                  </p>
                </div>
                <RequestStatusBadge status={request.status} />
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>服务业务员: {serviceSalesName}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                预定业务员: {bookingSalesName}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {request.createdAt}
              </div>
            </div>
            );
          })
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
