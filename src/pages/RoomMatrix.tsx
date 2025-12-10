import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { format, addDays, addWeeks } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { BookingDialog } from '@/components/BookingDialog';
import { BookingDetailDialog } from '@/components/BookingDetailDialog';
import { LeaderBookingDetailDialog } from '@/components/LeaderBookingDetailDialog';
import { useData, BookingStatus } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export default function RoomMatrix() {
  const location = useLocation();
  const { user } = useAuth();
  const { stores, getRoomsByStore, getBookingByRoomAndDate } = useData();
  const [selectedCell, setSelectedCell] = useState<{ roomId: string; date: string } | null>(null);
  const [viewBookingId, setViewBookingId] = useState<string | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState(stores[0]?.id || 'store1');
  const [weekOffset, setWeekOffset] = useState(0);

  const preselectedCustomerId = location.state?.selectedCustomerId;
  const isLeader = user?.role === 'leader';

  // Generate 7 days starting from today + week offset
  const today = new Date();
  const startDate = addWeeks(today, weekOffset);
  const dates = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  // Max 8 weeks (2 months) into the future
  const maxWeekOffset = 8;

  const rooms = getRoomsByStore(selectedStoreId);

  const handleCellClick = (roomId: string, date: string) => {
    const booking = getBookingByRoomAndDate(roomId, date);
    if (booking) {
      setViewBookingId(booking.id);
    } else if (!isLeader) {
      // Only salesperson can create bookings
      setSelectedCell({ roomId, date });
    } else {
      // Leader can view free cell details too
      setViewBookingId(`free_${roomId}_${date}`);
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
      case 'cancelled':
        return 'bg-muted border-2 border-status-rejected';
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
      case 'cancelled':
        return '已取消';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title={isLeader ? "排房详情" : "排房情况"} />

      {/* Store Selector & Week Navigation */}
      <div className="px-4 py-3 flex items-center justify-between bg-card border-b border-border">
        <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {stores.map((store) => (
              <SelectItem key={store.id} value={store.id}>
                {store.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            disabled={weekOffset === 0}
            onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground min-w-[60px] text-center">
            {weekOffset === 0 ? '本周' : `+${weekOffset}周`}
          </span>
          <Button
            variant="ghost"
            size="icon"
            disabled={weekOffset >= maxWeekOffset}
            onClick={() => setWeekOffset(Math.min(maxWeekOffset, weekOffset + 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-3 flex items-center gap-4 bg-card border-b border-border overflow-x-auto">
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

      {/* Booking Dialog - Only for salesperson */}
      {!isLeader && (
        <BookingDialog
          open={!!selectedCell}
          onClose={() => setSelectedCell(null)}
          roomId={selectedCell?.roomId || ''}
          date={selectedCell?.date || ''}
          preselectedCustomerId={preselectedCustomerId}
        />
      )}

      {/* Booking Detail Dialog */}
      {isLeader ? (
        <LeaderBookingDetailDialog
          open={!!viewBookingId}
          onClose={() => setViewBookingId(null)}
          bookingId={viewBookingId || ''}
        />
      ) : (
        <BookingDetailDialog
          open={!!viewBookingId}
          onClose={() => setViewBookingId(null)}
          bookingId={viewBookingId || ''}
        />
      )}
    </div>
  );
}
