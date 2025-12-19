import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { BookingDetailDialog } from '@/components/BookingDetailDialog';
import { useReservationList } from '@/queries/reservation-queries';
import { format } from 'date-fns';

import { MemberNameDisplay } from '@/components/MemberNameDisplay';

export default function OrderList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  // Map tab to API status param (if backend supports it, otherwise filter client side)
  // Assuming API supports status filtering. If not, remove status param and filter in client.
  const statusMap = {
    'all': undefined,
    'pending': 'PENDING',
    'approved': 'APPROVED',
    'rejected': 'REJECTED'
  };

  const { data: reservationData, isLoading, error } = useReservationList(undefined, undefined, statusMap[activeTab]);
  const bookings = reservationData?.data?.data?.list || [];

  const selectedBooking = bookings.find(b => b.id?.toString() === selectedBookingId);

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="我的预定" />

      {/* Tabs */}
      <div className="sticky top-[44px] z-10 bg-background border-b border-border">
        <div className="flex overflow-x-auto hide-scrollbar">
          {[
            { id: 'all', label: '全部' },
            { id: 'pending', label: '待审核' },
            { id: 'approved', label: '已通过' },
            { id: 'rejected', label: '已驳回' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[80px] py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="p-4 space-y-3 pb-24">
        {isLoading ? (
           <div className="text-center py-12 text-muted-foreground">加载中...</div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            暂无预定记录
          </div>
        ) : (
          bookings.map((booking) => (
            <div
              key={booking.id}
              onClick={() => setSelectedBookingId(booking.id?.toString() || '')}
              className="bg-card rounded-lg border border-border p-4 space-y-3 active:bg-accent transition-colors cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-foreground">
                    {booking.storeName && <span className="mr-2 text-sm text-muted-foreground">[{booking.storeName}]</span>}
                    {booking.roomName || booking.roomTypeName} {booking.roomNo}
                  </h3>
                  <div className="text-sm text-muted-foreground mt-0.5 space-y-1">
                    {booking.reserveNo && <p>订单号: {booking.reserveNo}</p>}
                    <p>
                       {booking.guestCount ? `${booking.guestCount}人` : ''} 
                       {booking.sourceDesc ? ` · ${booking.sourceDesc}` : ''}
                       {' · '}
                       <MemberNameDisplay id={booking.memberId?.toString()} initialName={booking.memberName} />
                    </p>
                  </div>
                </div>
                <StatusBadge status={booking.status || 'PENDING'} state={booking.state} />
              </div>

              <div className="text-sm text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>到店时间</span>
                  <span>
                    {(() => {
                      if (booking.arrivalTime) {
                        return format(new Date(booking.arrivalTime), 'MM-dd HH:mm');
                      }
                      if (booking.reserveDate) {
                        try {
                          const date = new Date(booking.reserveDate);
                           if (booking.startMin !== undefined) {
                             date.setMinutes(date.getMinutes() + booking.startMin);
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
                {booking.deposit > 0 && (
                   <div className="flex justify-between">
                    <span>定金</span>
                    <span>¥{booking.deposit}</span>
                  </div>
                )}
                 <div className="flex justify-between">
                  <span>备注</span>
                  <span>{booking.remark || '无'}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </main>

      {/* Footer Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border z-20">
        <Button 
          variant="mobileAction" 
          size="full"
          onClick={() => navigate('/rooms')}
        >
          新增预定
        </Button>
      </div>

      <BookingDetailDialog
        bookingId={selectedBookingId}
        open={!!selectedBookingId}
        onOpenChange={(open) => !open && setSelectedBookingId(null)}
        hideConsumptionAction={true}
      />
    </div>
  );
}

function StatusBadge({ status, state }: { status: string, state?: string }) {
  const styles = {
    PENDING: 'bg-yellow-500/10 text-yellow-600',
    APPROVED: 'bg-green-500/10 text-green-600',
    REJECTED: 'bg-red-500/10 text-red-600',
    CANCELLED: 'bg-gray-500/10 text-gray-600',
    FINISHED: 'bg-status-finished/20 text-red-700',
  };

  const labels = {
    PENDING: '待审核',
    APPROVED: '已通过',
    REJECTED: '已驳回',
    CANCELLED: '已取消',
    FINISHED: '已完成',
  };

  const displayStatus = (state && state !== 'AVAILABLE' ? state : status) as keyof typeof styles;
  const safeStatus = styles[displayStatus] ? displayStatus : 'PENDING';

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[safeStatus]}`}>
      {labels[safeStatus] || safeStatus}
    </span>
  );
}
