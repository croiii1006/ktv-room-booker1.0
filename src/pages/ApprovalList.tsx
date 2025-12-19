import React, { useState } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { OrderDetailDialog } from '@/components/OrderDetailDialog';
import { MemberNameDisplay } from '@/components/MemberNameDisplay';
import { StaffNameDisplay } from '@/components/StaffNameDisplay';
import { usePendingReservationList } from '@/queries/reservation-queries';

export default function ApprovalList() {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const { data: pendingData, isLoading } = usePendingReservationList(1, 100);
  const pendingOrders = pendingData?.data?.data?.list || [];

  const sortedOrders = [...pendingOrders].sort(
    (a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
    }
  );

  const selectedOrder = pendingOrders.find(o => o.id?.toString() === selectedOrderId);

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="订单审核" />

      <main className="p-4 space-y-3">
        {isLoading ? (
           <div className="text-center py-12">
            <p className="text-muted-foreground">加载中...</p>
          </div>
        ) : sortedOrders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">暂无待审核订单</p>
          </div>
        ) : (
          sortedOrders.map((order) => {
            const formattedDate = order.reserveDate ? format(new Date(order.reserveDate), 'MM/dd EEEE', {
              locale: zhCN,
            }) : '';

            const roomDisplayName = order.roomTypeName ? `${order.roomTypeName} ${order.roomNo}` : (order.roomNo || '未知房间');

            return (
              <div
                key={order.id}
                onClick={() => setSelectedOrderId(order.id?.toString() || '')}
                className="bg-card rounded-lg border border-border p-4 active:bg-accent transition-colors cursor-pointer animate-fade-in"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {roomDisplayName} - <MemberNameDisplay id={order.memberId?.toString()} initialName={order.memberName} />
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {formattedDate}
                    </p>
                  </div>
                  <StatusBadge status={order.status || 'PENDING'} />
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    申请人: <StaffNameDisplay id={order.staffId?.toString()} initialName={order.applyStaffName} showStaffNo />
                  </span>
                  <span className="font-medium text-foreground">¥{order.price ?? 0}</span>
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
        roomName={selectedOrder?.roomTypeName ? `${selectedOrder.roomTypeName} ${selectedOrder.roomNo}` : (selectedOrder?.roomNo || '')}
        // storeName?
      />
    </div>
  );
}
