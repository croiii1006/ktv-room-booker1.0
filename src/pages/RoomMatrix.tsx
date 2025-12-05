import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { PageHeader } from '@/components/PageHeader';
import { BookingDialog } from '@/components/BookingDialog';
import { BookingDetailDialog } from '@/components/BookingDetailDialog';
import { useData, BookingStatus } from '@/contexts/DataContext';
import { cn } from '@/lib/utils';

export default function RoomMatrix() {
  const location = useLocation();
  const { rooms, getBookingByRoomAndDate } = useData();
  const [selectedCell, setSelectedCell] = useState<{ roomId: string; date: string } | null>(null);
  const [viewBookingId, setViewBookingId] = useState<string | null>(null);

  const preselectedCustomerId = location.state?.selectedCustomerId;

  // Generate 7 days starting from today
  const today = new Date();
  const dates = Array.from({ length: 7 }, (_, i) => addDays(today, i));

  const handleCellClick = (roomId: string, date: string) => {
    const booking = getBookingByRoomAndDate(roomId, date);
    if (booking) {
      setViewBookingId(booking.id);
    } else {
      setSelectedCell({ roomId, date });
    }
  };

  const getCellStatus = (roomId: string, date: string): BookingStatus => {
    const booking = getBookingByRoomAndDate(roomId, date);
    return booking?.status || 'free';
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'free':
        return 'bg-muted hover:bg-muted/80';
      case 'pending':
        return 'bg-status-pending/30 border-2 border-status-pending';
      case 'booked':
        return 'bg-status-booked/80 text-white';
      case 'finished':
        return 'bg-status-finished/80 text-white';
      default:
        return 'bg-muted';
    }
  };

  const getStatusLabel = (status: BookingStatus) => {
    switch (status) {
      case 'pending':
        return '待审';
      case 'booked':
        return '已订';
      case 'finished':
        return '完成';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="排房情况" />

      {/* Legend */}
      <div className="px-4 py-3 flex items-center gap-4 bg-card border-b border-border">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-muted" />
          <span className="text-xs text-muted-foreground">可订</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-status-pending/30 border-2 border-status-pending" />
          <span className="text-xs text-muted-foreground">待审</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-status-booked/80" />
          <span className="text-xs text-muted-foreground">已订</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-status-finished/80" />
          <span className="text-xs text-muted-foreground">完成</span>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="p-4 overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-left text-sm font-medium text-muted-foreground bg-card border border-border sticky left-0 z-10">
                房号
              </th>
              {dates.map((date) => (
                <th
                  key={date.toISOString()}
                  className="p-2 text-center text-xs font-medium text-muted-foreground bg-card border border-border min-w-[70px]"
                >
                  <div>{format(date, 'MM/dd')}</div>
                  <div className="text-[10px]">{format(date, 'EEE', { locale: zhCN })}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id}>
                <td className="p-2 text-sm font-medium text-foreground bg-card border border-border sticky left-0 z-10">
                  <div>{room.name}</div>
                  <div className="text-xs text-muted-foreground">¥{room.price}</div>
                </td>
                {dates.map((date) => {
                  const dateStr = format(date, 'yyyy-MM-dd');
                  const status = getCellStatus(room.id, dateStr);
                  const label = getStatusLabel(status);
                  return (
                    <td
                      key={dateStr}
                      className="p-1 border border-border"
                      onClick={() => handleCellClick(room.id, dateStr)}
                    >
                      <div
                        className={cn(
                          'h-12 rounded-md flex items-center justify-center cursor-pointer transition-colors text-xs font-medium',
                          getStatusColor(status)
                        )}
                      >
                        {label}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Booking Dialog */}
      <BookingDialog
        open={!!selectedCell}
        onClose={() => setSelectedCell(null)}
        roomId={selectedCell?.roomId || ''}
        date={selectedCell?.date || ''}
        preselectedCustomerId={preselectedCustomerId}
      />

      {/* Booking Detail Dialog */}
      <BookingDetailDialog
        open={!!viewBookingId}
        onClose={() => setViewBookingId(null)}
        bookingId={viewBookingId || ''}
      />
    </div>
  );
}
