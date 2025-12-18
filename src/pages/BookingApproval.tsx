import React, { useState } from 'react';
import { format } from 'date-fns';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { BookingDetailDialog } from '@/components/BookingDetailDialog';
import { MemberNameDisplay } from '@/components/MemberNameDisplay';
import { StaffNameDisplay } from '@/components/StaffNameDisplay';
import { useAuth } from '@/contexts/AuthContext';
import { usePendingReservationList } from '@/queries/reservation-queries';

export default function BookingApproval() {
  const { user } = useAuth();
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  const { data: pendingData, isLoading } = usePendingReservationList(1, 100);
  const pendingOrders = pendingData?.data?.data?.list || [];

  const sortedOrders = [...pendingOrders].sort(
    (a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
    }
  );

  const selectedOrder = pendingOrders.find(o => o.id?.toString() === selectedBookingId);

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="订房申请审核" />

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
            return (
              <div
                key={order.id}
                onClick={() => setSelectedBookingId(order.id?.toString() || '')}
                className="bg-card rounded-lg border border-border p-4 space-y-3 active:bg-accent transition-colors cursor-pointer animate-fade-in"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {order.storeName && <span className="mr-2 text-sm text-muted-foreground">[{order.storeName}]</span>}
                      {order.roomName && <span className="mr-1">{order.roomName}</span>}
                      {order.roomTypeName} {order.roomNo}
                    </h3>
                    <div className="text-sm text-muted-foreground mt-0.5 space-y-1">
                      {order.reserveNo && <p>订单号: {order.reserveNo}</p>}
                      <p>
                         {order.guestCount ? `${order.guestCount}人` : ''} 
                         {order.sourceDesc ? ` · ${order.sourceDesc}` : ''}
                         {' · '}
                         <MemberNameDisplay id={order.memberId?.toString()} initialName={order.memberName} />
                      </p>
                      <p>
                        申请人: <StaffNameDisplay id={order.staffId?.toString()} initialName={order.applyStaffName} showStaffNo />
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={order.status || 'PENDING'} />
                </div>

                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>到店时间</span>
                    <span>
                      {(() => {
                        if (order.arrivalTime) {
                          return format(new Date(order.arrivalTime), 'MM-dd HH:mm');
                        }
                        if (order.reserveDate) {
                          try {
                            const date = new Date(order.reserveDate);
                             if (order.startMin !== undefined) {
                               date.setMinutes(date.getMinutes() + order.startMin);
                             }
                             return format(date, 'MM-dd HH:mm');
                          } catch (e) {
                            return '-';
                          }
                        }
                        return '-';
                      })()}
                    </span>
                  </div>
                  {order.deposit > 0 && (
                     <div className="flex justify-between">
                      <span>定金</span>
                      <span>¥{order.deposit}</span>
                    </div>
                  )}
                   <div className="flex justify-between">
                    <span>备注</span>
                    <span>{order.remark || '无'}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-border/50 mt-1">
                     <span className="text-xs">申请时间</span>
                     <span className="text-xs">{order.createdAt ? format(new Date(order.createdAt), 'yyyy-MM-dd HH:mm') : ''}</span>
                  </div>
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
        roomName={selectedOrder?.roomTypeName}
        roomNo={selectedOrder?.roomNo}
      />
    </div>
  );
}
