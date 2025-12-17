import React, { useState } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { BookingDetailDialog } from '@/components/BookingDetailDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';

export default function BookingApproval() {
  const { user } = useAuth();
  const { bookings, rooms, teamMembers, isLoading } = useData();
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  const pendingOrders = bookings
    .filter(b => b.status === 'pending')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="订房申请审核" />

      <main className="p-4 space-y-3">
        {isLoading ? (
            <div className="text-center py-12">
            <p className="text-muted-foreground">加载中...</p>
          </div>
        ) : pendingOrders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">暂无待审核订单</p>
          </div>
        ) : (
          pendingOrders.map((order) => {
            const formattedDate = order.date ? format(new Date(order.date), 'MM/dd EEEE', {
              locale: zhCN,
            }) : '-';

            // Resolve Room Info
            const room = rooms.find(r => r.id === order.roomId);
            const roomDisplay = room ? `${room.roomNo} - ${room.name}` : (order.roomId || '未知房间');

            // Resolve Sales Name
            const staff = teamMembers.find(t => t.id === order.salesId || t.staffNo === order.salesStaffNo);
            const salesName = staff?.name || (order.salesName !== 'Unknown' ? order.salesName : '未知');

            return (
              <div
                key={order.id}
                onClick={() => setSelectedBookingId(order.id)}
                className="bg-card rounded-lg border border-border p-4 active:bg-accent transition-colors cursor-pointer animate-fade-in"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {roomDisplay}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {formattedDate}
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    申请人: {salesName}
                  </span>
                  {/* Deposit is not currently available in Booking model */}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {order.createdAt ? format(new Date(order.createdAt), 'yyyy-MM-dd HH:mm') : ''}
                </div>
              </div>
            );
          })
        )}
      </main>

      <BookingDetailDialog
        open={!!selectedBookingId}
        onOpenChange={(open) => !open && setSelectedBookingId(null)}
        bookingId={selectedBookingId}
        isReviewMode={true}
      />
    </div>
  );
}
