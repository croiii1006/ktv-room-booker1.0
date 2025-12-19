import React, { useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { format, addDays, addWeeks } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { BookingDialog } from '@/components/BookingDialog';
import { BookingDetailDialog } from '@/components/BookingDetailDialog';
import { LeaderBookingDetailDialog } from '@/components/LeaderBookingDetailDialog';
import { BookingStatus } from '@/contexts/DataContext';
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
import { useStoreList, useRoomSchedule } from '@/queries/common-queries';

export default function RoomMatrix() {
  const location = useLocation();
  const { customerId } = useParams<{ customerId: string }>();
  const { user } = useAuth();
  
  const { data: storeData } = useStoreList();
  const allStores = storeData?.data?.data || [];

  const stores = React.useMemo(() => {
    if (user?.storeId) {
      // Use loose equality to handle potential string/number mismatches
      return allStores.filter(s => s.id == user.storeId);
    }
    return allStores;
  }, [allStores, user?.storeId]);

  const [selectedCell, setSelectedCell] = useState<{ roomId: string; date: string } | null>(null);
  const [viewBookingId, setViewBookingId] = useState<string | null>(null);
  const [viewBookingRoomId, setViewBookingRoomId] = useState<string | null>(null);
  const [viewBookingState, setViewBookingState] = useState<string | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [weekOffset, setWeekOffset] = useState(0);

  const preselectedCustomerId = customerId || location.state?.selectedCustomerId;
  const isLeader = user?.role === 'leader';

  // Generate 7 days starting from today + week offset
  const today = new Date();
  const startDate = addWeeks(today, weekOffset);
  const dates = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
  const endDate = dates[dates.length - 1];

  // Set default store based on user profile
  React.useEffect(() => {
    if (stores.length > 0) {
      // Check if current selectedStoreId is valid
      const currentStore = stores.find(s => s.id?.toString() === selectedStoreId);
      
      if (!currentStore) {
        // If invalid or not set, select the first available store
        setSelectedStoreId(stores[0].id?.toString() || '');
      }
    }
  }, [stores, selectedStoreId]);

  const { data: scheduleData, isLoading } = useRoomSchedule(
    format(startDate, 'yyyy-MM-dd'), 
    format(endDate, 'yyyy-MM-dd'), 
    selectedStoreId ? parseInt(selectedStoreId) : undefined,
    { enabled: !!selectedStoreId }
  );

  const schedule = scheduleData?.data?.data || {}; 
  // Transform schedule to rooms list with nested schedule
  // Assuming API returns list of rooms with their schedules
  // But wait, h5Api.schedule returns RoomScheduleResp[] which contains RoomInfo and list of DaySchedule
  // We need to map this.
  const rooms = schedule.rooms || []; 

  // Max 8 weeks (2 months) into the future
  const maxWeekOffset = 8;

  const getBookingByRoomAndDate = (roomId: string, date: string) => {
      const room = rooms.find(r => r.id?.toString() === roomId);
      if (!room || !room.bookings) return null;
      // schedule date format: yyyy-MM-dd
      // bookings is a Map/Object where keys are dates
      return room.bookings[date];
  };

  const handleCellClick = (roomId: string, date: string) => {
    const booking = getBookingByRoomAndDate(roomId, date);
    // If booking exists and is not available/free
    const isBooked = booking && (!booking.state || booking.state !== 'AVAILABLE');
    
    if (isBooked) {
      setViewBookingId(booking.reservationId?.toString() || '');
      setViewBookingRoomId(roomId);
      setViewBookingState(booking.state || booking.status || null);
    } else if (!isLeader) {
      // Only salesperson can create bookings
      setSelectedCell({ roomId, date });
    } else {
      // Leader can view free cell details too
      setViewBookingId(`free_${roomId}_${date}`);
      setViewBookingRoomId(roomId);
      setViewBookingState(null);
    }
  };

  const getCellStatus = (roomId: string, date: string): string => {
    const booking = getBookingByRoomAndDate(roomId, date);
    if (!booking) return 'free';
    
    // Prioritize state if it exists (e.g., FINISHED, BOOKED)
    if (booking.state && booking.state !== 'AVAILABLE') {
      return booking.state;
    }
    
    return booking.status || 'free';
  };

  const getStatusColor = (status: string) => {
    // Map API status to UI colors
    switch (status.toLowerCase()) {
      case 'free':
        return 'bg-muted hover:bg-muted/80';
      case 'pending':
        return 'bg-status-pending/30 border-2 border-status-pending';
      case 'booked':
      case 'approved':
        return 'bg-status-booked/80 text-white';
      case 'finished':
        return 'bg-status-finished/80 text-white';
      case 'cancelled':
      case 'rejected':
        return 'bg-muted border-2 border-status-rejected';
      default:
        return 'bg-muted';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '待审';
      case 'booked':
      case 'approved':
        return '已订';
      case 'finished':
        return '完成';
      case 'cancelled':
      case 'rejected':
        return '已取消';
      default:
        return '';
    }
  };

  const resolveRoomName = (roomId: string | null) => {
    if (!roomId) return '';
    const room = rooms.find(r => r.id?.toString() === roomId);
    return room?.roomName || room?.roomNo || '';
  };

  const getRoomNo = (roomId: string | null) => {
    if (!roomId) return '';
    const room = rooms.find(r => r.id?.toString() === roomId);
    return room?.roomNo || '';
  };

  const getRoomType = (roomId: string | null) => {
    if (!roomId) return '';
    const room = rooms.find(r => r.id?.toString() === roomId);
    return room?.roomType || '';
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title={isLeader ? "排房详情" : "排房情况"} />

      {/* Store Selector & Week Navigation */}
      <div className="px-4 py-3 flex items-center justify-between bg-card border-b border-border">
        <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="选择门店" />
          </SelectTrigger>
          <SelectContent>
            {stores.map((store) => (
              <SelectItem key={store.id} value={store.id?.toString() || ''}>
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
        {isLoading ? (
             <div className="text-center py-12">
             <p className="text-muted-foreground">加载中...</p>
           </div>
        ) : (
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
                  <div>{room.roomNo}</div>
                  <div className="text-xs text-muted-foreground">{room.roomType}</div>
                  <div className="text-xs text-muted-foreground">¥{room.price}</div>
                </td>
                {dates.map((date) => {
                  const dateStr = format(date, 'yyyy-MM-dd');
                  const status = getCellStatus(room.id?.toString() || '', dateStr);
                  const label = getStatusLabel(status);
                  return (
                    <td
                      key={dateStr}
                      className="p-1 border border-border"
                      onClick={() => handleCellClick(room.id?.toString() || '', dateStr)}
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
        )}
      </div>

      {/* Booking Dialog - Only for salesperson */}
      {!isLeader && (
        <BookingDialog
          open={!!selectedCell}
          onClose={() => setSelectedCell(null)}
          roomId={selectedCell?.roomId || ''}
          roomName={resolveRoomName(selectedCell?.roomId || null)}
          roomNo={getRoomNo(selectedCell?.roomId || null)}
          roomType={getRoomType(selectedCell?.roomId || null)}
          roomPrice={selectedCell ? rooms.find(r => r.id?.toString() === selectedCell.roomId)?.price || 0 : 0}
          date={selectedCell?.date || ''}
          preselectedCustomerId={preselectedCustomerId}
        />
      )}

      {/* Booking Detail Dialog */}
      {isLeader ? (
        <LeaderBookingDetailDialog
          open={!!viewBookingId}
          onClose={() => {
            setViewBookingId(null);
            setViewBookingRoomId(null);
            setViewBookingState(null);
          }}
          bookingId={viewBookingId || ''}
          roomName={resolveRoomName(viewBookingRoomId)}
          roomNo={getRoomNo(viewBookingRoomId)}
          roomType={getRoomType(viewBookingRoomId)}
        />
      ) : (
        <BookingDetailDialog
          open={!!viewBookingId}
          onOpenChange={(open) => {
            if (!open) {
              setViewBookingId(null);
              setViewBookingRoomId(null);
              setViewBookingState(null);
            }
          }}
          bookingId={viewBookingId || ''}
          roomName={resolveRoomName(viewBookingRoomId)}
          roomNo={getRoomNo(viewBookingRoomId)}
          roomType={getRoomType(viewBookingRoomId)}
          bookingState={viewBookingState || undefined}
        />
      )}
    </div>
  );
}
