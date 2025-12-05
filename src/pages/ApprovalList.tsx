import React, { useState } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { OrderDetailDialog } from '@/components/OrderDetailDialog';
import { useData } from '@/contexts/DataContext';

export default function ApprovalList() {
  const { getPendingBookings, rooms } = useData();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const pendingOrders = getPendingBookings();
  const sortedOrders = [...pendingOrders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="订单审核" />

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

            return (
              <div
                key={order.id}
                onClick={() => setSelectedOrderId(order.id)}
                className="bg-card rounded-lg border border-border p-4 active:bg-accent transition-colors cursor-pointer animate-fade-in"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {room?.name}房 - {order.customerName}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {formattedDate}
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    申请人: {order.salesName} ({order.salesStaffNo})
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
