import React, { useState } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { OrderDetailDialog } from '@/components/OrderDetailDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';

export default function BookingApproval() {
  const { user } = useAuth();
  const { getPendingBookings, rooms, fetchPendingRequests, teamMembers } = useData();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  React.useEffect(() => {
    fetchPendingRequests();
  }, [fetchPendingRequests]);

  const pendingOrders = getPendingBookings(user?.staffNo);
  const sortedOrders = [...pendingOrders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="订房申请审核" />

      <main className="p-4 space-y-3">
        {sortedOrders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">暂无待审核订单</p>
          </div>
        ) : (
          sortedOrders.map((order) => {
            const room = rooms.find((r) => r.id === order.roomId);
            const formattedDate = format(new Date(order.date), 'MM/dd EEEE', {
              locale: zhCN,
            });

            // Resolve Sales Name
            let salesName = order.salesName;
            if (!salesName || salesName === 'Unknown' || salesName === order.salesId) {
                const staff = teamMembers.find(t => t.id === order.salesId || t.staffNo === order.salesStaffNo);
                if (staff) salesName = staff.name;
                else if (user && (user.id.toString() === order.salesId || user.staffNo === order.salesStaffNo)) {
                    salesName = user.name;
                }
            }

            return (
              <div
                key={order.id}
                onClick={() => setSelectedOrderId(order.id)}
                className="bg-card rounded-lg border border-border p-4 active:bg-accent transition-colors cursor-pointer animate-fade-in"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {room ? `${room.roomNo} - ${room.name}` : `房间 ${order.roomId}`}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {formattedDate}
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    申请人: {salesName} ({order.salesStaffNo})
                  </span>
                  <span className="font-medium text-foreground">¥{order.price}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {order.createdAt}
                </div>
              </div>
            );
          })
        )}
      </main>

      <OrderDetailDialog
        open={!!selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
        bookingId={selectedOrderId || ''}
        showActions={true}
      />
    </div>
  );
}
