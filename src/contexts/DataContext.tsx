
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { format, addDays } from 'date-fns';
import { toast } from 'sonner';
import {
  getStoreList,
  getRoomSchedule,
  createReservation,
  approveReservation,
  rejectReservation,
  cancelReservation,
  getPendingReservations,
  getMyReservations,
  createRechargeApply,
  approveRecharge,
  rejectRecharge,
  getPendingRecharges,
  getMyRecharges,
  createConsumeApply,
  approveConsume,
  rejectConsume,
  getPendingConsumes,
  getMyConsumes,
} from '@/services/h5-service';
import {
  ReservationCreateReq,
  RechargeApplyCreateReq,
  ConsumeApplyCreateReq,
  ReservationResp,
  RechargeResp,
  ConsumeResp,
  RoomScheduleBookingResp,
  ResultRoomScheduleResp,
} from '@/models';

export type CardType = '普' | '银' | '金';
export type BookingStatus = 'free' | 'pending' | 'booked' | 'finished' | 'rejected' | 'cancelled';
export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  idCard: string;
  cardType: CardType;
  openDate: string;
  balance: number;
  giftAmount: number;
  salesId: string;
}

export interface Room {
  id: string;
  name: string;
  price: number;
  type: 'small' | 'medium' | 'large';
  storeId: string;
}

export interface Store {
  id: string;
  name: string;
}

export interface Booking {
  id: string;
  roomId: string;
  date: string;
  customerId: string;
  customerName: string;
  price: number;
  status: BookingStatus;
  salesId: string;
  salesName: string;
  salesStaffNo: string;
  createdAt: string;
  rejectReason?: string;
  cancelReason?: string;
  serviceSalesId?: string;
  serviceSalesName?: string;
  serviceSalesStaffNo?: string;
  reserveNo?: string; // Add reserveNo from API
}

export interface RechargeRequest {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  giftProduct: string;
  imageUrl?: string;
  status: RequestStatus;
  salesId: string;
  salesName: string;
  salesStaffNo: string;
  leaderId: string;
  createdAt: string;
  rejectReason?: string;
}

export interface ConsumptionRequest {
  id: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  roomId: string;
  roomName: string;
  date: string;
  bookingSalesId: string;
  bookingSalesName: string;
  serviceSalesId: string;
  serviceSalesName: string;
  serviceSalesStaffNo: string;
  imageUrl?: string;
  status: RequestStatus;
  leaderId: string;
  createdAt: string;
  rejectReason?: string;
}

export interface TeamMember {
  id: string;
  staffNo: string;
  name: string;
  leaderId: string;
}

interface DataContextType {
  customers: Customer[];
  rooms: Room[];
  stores: Store[];
  bookings: Booking[];
  rechargeRequests: RechargeRequest[];
  consumptionRequests: ConsumptionRequest[];
  teamMembers: TeamMember[];
  isLoading: boolean;
  
  // Data Fetching
  fetchRoomSchedule: (storeId: string, startDate: string, endDate: string) => Promise<void>;
  fetchPendingRequests: () => Promise<void>;
  fetchMyRequests: () => Promise<void>;

  // Actions
  addCustomer: (customer: Omit<Customer, 'id'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => Promise<void>;
  updateBooking: (id: string, updates: Partial<Booking>) => Promise<void>;
  updateBookingStatus: (id: string, status: BookingStatus, reason?: string) => Promise<void>;
  
  getBookingByRoomAndDate: (roomId: string, date: string) => Booking | undefined;
  getBookingsByRoomAndDateRange: (roomId: string, startDate: string, endDate: string) => Booking[];
  getCustomersByStaff: (staffId: string, role?: 'sales' | 'leader') => Customer[];
  getBookingsByStaff: (staffId: string) => Booking[];
  getPendingBookings: (leaderId?: string) => Booking[];
  getRoomsByStore: (storeId: string) => Room[];
  
  addRechargeRequest: (request: Omit<RechargeRequest, 'id' | 'createdAt'>) => Promise<void>;
  updateRechargeStatus: (id: string, status: RequestStatus, reason?: string) => Promise<void>;
  getRechargeRequestsBySales: (salesId: string) => RechargeRequest[];
  getPendingRechargeRequests: (leaderId: string) => RechargeRequest[];
  
  addConsumptionRequest: (request: Omit<ConsumptionRequest, 'id' | 'createdAt'>) => Promise<void>;
  updateConsumptionStatus: (id: string, status: RequestStatus, reason?: string) => Promise<void>;
  getConsumptionRequestsBySales: (salesId: string) => ConsumptionRequest[];
  getPendingConsumptionRequests: (leaderId: string) => ConsumptionRequest[];
  
  addTeamMember: (member: Omit<TeamMember, 'id'>) => void;
  removeTeamMember: (id: string) => void;
  getTeamMembers: (leaderId: string) => TeamMember[];
  getLeaderIdForSales: (salesId: string) => string | undefined;
  getCustomersBySalesId: (salesId: string) => Customer[];
  getAllRechargeRequestsBySales: (salesId: string) => RechargeRequest[];
  getAllConsumptionRequestsBySales: (salesId: string) => ConsumptionRequest[];
  getAllBookingsBySales: (salesId: string) => Booking[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Keep mock data for fallback (customers, team members)
const generateMockData = () => {
  const customers: Customer[] = [
    { id: 'c0000001', name: '陈先生', phone: '13800138001', idCard: '310101199001011234', cardType: '金', openDate: '2024-01-15', balance: 5000, giftAmount: 500, salesId: 'S0000001' },
    { id: 'c0000002', name: '刘女士', phone: '13800138002', idCard: '310101199202022345', cardType: '银', openDate: '2024-02-20', balance: 2000, giftAmount: 200, salesId: 'S0000001' },
    { id: 'c0000003', name: '王先生', phone: '13800138003', idCard: '310101198803033456', cardType: '普', openDate: '2024-03-10', balance: 800, giftAmount: 0, salesId: 'S0000002' },
    { id: 'c0000004', name: '赵女士', phone: '13800138004', idCard: '310101199504044567', cardType: '金', openDate: '2024-01-01', balance: 8000, giftAmount: 1000, salesId: 'S0000001' },
  ];
  
  const teamMembers: TeamMember[] = [
    { id: 'tm1', staffNo: 'S0000001', name: '张三', leaderId: 'L0000001' },
    { id: 'tm2', staffNo: 'S0000002', name: '李四', leaderId: 'L0000001' },
  ];

  return { customers, teamMembers };
};

export function DataProvider({ children }: { children: ReactNode }) {
  const [stores, setStores] = useState<Store[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rechargeRequests, setRechargeRequests] = useState<RechargeRequest[]>([]);
  const [consumptionRequests, setConsumptionRequests] = useState<ConsumptionRequest[]>([]);
  
  // Mock data for things we can't fetch yet
  const [customers, setCustomers] = useState<Customer[]>(generateMockData().customers);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(generateMockData().teamMembers);
  
  const [isLoading, setIsLoading] = useState(false);

  // Initialize Stores
  useEffect(() => {
    getStoreList().then(result => {
      if (result.code === 200 && result.data) {
        const storeList: Store[] = result.data.map((item: any) => ({
          id: item.id.toString(),
          name: item.name,
        }));
        setStores(storeList);
      }
    }).catch(err => console.error('获取门店失败', err));
  }, []);

  // --- Data Fetching ---

  const fetchRoomSchedule = useCallback(async (storeId: string, startDate: string, endDate: string) => {
    setIsLoading(true);
    try {
      const res = await getRoomSchedule({ 
        storeId: parseInt(storeId), 
        startDate, 
        endDate 
      });
      
      if (res.code === 200 && res.data) {
        const data = res.data;
        // Update Rooms
        const newRooms: Room[] = (data.rooms || []).map(r => ({
          id: r.id?.toString() || '',
          name: r.roomName || '',
          price: r.price || 0,
          type: (r.roomType as any) || 'small', // assuming type matches or we map it
          storeId: storeId,
        }));
        
        // Merge with existing rooms if needed, or just replace for the current store
        // For simplicity, we might want to keep rooms from other stores if we switch back and forth, 
        // but replacing is safer for consistency with the schedule.
        // However, getRoomsByStore filters by storeId.
        setRooms(prev => {
          const otherStoreRooms = prev.filter(r => r.storeId !== storeId);
          return [...otherStoreRooms, ...newRooms];
        });

        // Update Bookings
        const newBookings: Booking[] = [];
        (data.rooms || []).forEach(r => {
          if (r.bookings) {
            Object.entries(r.bookings).forEach(([date, bookingResp]) => {
              if (bookingResp.state !== 'AVAILABLE') {
                let status: BookingStatus = 'free';
                if (bookingResp.state === 'PENDING') status = 'pending';
                else if (bookingResp.state === 'BOOKED') status = 'booked';
                else if (bookingResp.state === 'FINISHED') status = 'finished';
                
                // Map API booking to internal Booking
                newBookings.push({
                  id: bookingResp.reservationId?.toString() || `temp_${r.id}_${date}`,
                  roomId: r.id?.toString() || '',
                  date: date,
                  customerId: bookingResp.memberId?.toString() || '',
                  customerName: bookingResp.memberId?.toString() || 'Unknown', // No name in response
                  price: r.price || 0,
                  status: status,
                  salesId: bookingResp.staffId?.toString() || '',
                  salesName: bookingResp.staffId?.toString() || 'Unknown',
                  salesStaffNo: bookingResp.staffId?.toString() || '',
                  createdAt: format(new Date(), 'yyyy-MM-dd HH:mm'), // Missing in response
                  reserveNo: bookingResp.reserveNo,
                });
              }
            });
          }
        });
        
        // Replace bookings for this store/date range? 
        // Or just replace all? RoomMatrix assumes we have the data.
        // We should merge carefully or just replace if we only view one store at a time.
        // To be safe, we can filter out bookings for this store/date range and append new ones.
        // But simpler: just setBookings(newBookings) if we only care about what's visible.
        // But getPendingBookings might need data from other stores?
        // Let's replace bookings for the current view, but we also have fetchPendingRequests which adds more bookings.
        
        // Strategy: Keep a master list. Remove intersection, add new.
        setBookings(prev => {
           // This is complex. For now, let's just use the loaded bookings for the matrix.
           // But if we do that, we lose pending bookings fetched separately.
           // Let's append/update based on ID.
           const bookingMap = new Map(prev.map(b => [b.id, b]));
           newBookings.forEach(b => bookingMap.set(b.id, b));
           return Array.from(bookingMap.values());
        });
      }
    } catch (err) {
      console.error('Fetch schedule failed', err);
      toast.error('获取房态失败');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPendingRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch Reservations
      const resRes = await getPendingReservations(1, 100);
      if (resRes.code === 200 && resRes.data && resRes.data.list) {
        const pendingBookings = resRes.data.list.map(b => ({
           id: b.id?.toString() || '',
           roomId: b.roomId?.toString() || '',
           date: b.reserveDate || '',
           customerId: b.memberId?.toString() || '',
           customerName: b.memberId?.toString() || 'Unknown',
           price: 0, // Need to look up room price?
           status: 'pending' as BookingStatus,
           salesId: b.staffId?.toString() || '',
           salesName: 'Unknown',
           salesStaffNo: b.staffId?.toString() || '',
           createdAt: b.createdAt || '',
           reserveNo: b.reserveNo,
           rejectReason: b.remark
        }));
        
        setBookings(prev => {
          const bookingMap = new Map(prev.map(b => [b.id, b]));
          pendingBookings.forEach(b => bookingMap.set(b.id, b));
          return Array.from(bookingMap.values());
        });
      }

      // Fetch Recharges
      const resRecharge = await getPendingRecharges(1, 100);
      if (resRecharge.code === 200 && resRecharge.data && resRecharge.data.list) {
         const pendingRecharges = resRecharge.data.list.map(r => ({
           id: r.id?.toString() || '',
           customerId: r.memberId?.toString() || '',
           customerName: 'Unknown',
           amount: r.amount || 0,
           giftProduct: r.giftAmount ? `送${r.giftAmount}` : '',
           status: 'pending' as RequestStatus,
           salesId: r.staffId?.toString() || '',
           salesName: 'Unknown',
           salesStaffNo: r.staffId?.toString() || '',
           leaderId: '', // Unknown
           createdAt: r.createdAt || '',
           rejectReason: r.remark
         }));
         setRechargeRequests(prev => {
            // Replace all pending? Or merge?
            // Simple merge by ID
            const map = new Map(prev.map(r => [r.id, r]));
            pendingRecharges.forEach(r => map.set(r.id, r));
            return Array.from(map.values());
         });
      }

      // Fetch Consumes
      const resConsume = await getPendingConsumes(1, 100);
      if (resConsume.code === 200 && resConsume.data && resConsume.data.list) {
        const pendingConsumes = resConsume.data.list.map(c => ({
          id: c.id?.toString() || '',
          bookingId: '', // Not in list resp?
          customerId: c.memberId?.toString() || '',
          customerName: 'Unknown',
          roomId: c.roomId?.toString() || '',
          roomName: '', // Need lookup
          date: '', 
          bookingSalesId: '',
          bookingSalesName: '',
          serviceSalesId: c.staffId?.toString() || '',
          serviceSalesName: 'Unknown',
          serviceSalesStaffNo: c.staffId?.toString() || '',
          status: 'pending' as RequestStatus,
          leaderId: '',
          createdAt: c.createdAt || '',
          rejectReason: c.remark
        }));
        setConsumptionRequests(prev => {
            const map = new Map(prev.map(r => [r.id, r]));
            pendingConsumes.forEach(r => map.set(r.id, r));
            return Array.from(map.values());
        });
      }

    } catch (err) {
      console.error('Fetch pending failed', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMyRequests = useCallback(async () => {
    setIsLoading(true);
    try {
        // Fetch My Reservations
        const resRes = await getMyReservations(1, 100);
        if (resRes.code === 200 && resRes.data && resRes.data.list) {
            const myBookings = resRes.data.list.map(b => ({
               id: b.id?.toString() || '',
               roomId: b.roomId?.toString() || '',
               date: b.reserveDate || '',
               customerId: b.memberId?.toString() || '',
               customerName: b.memberId?.toString() || 'Unknown',
               price: 0, 
               status: (b.status === 'PENDING' ? 'pending' : b.status === 'APPROVED' ? 'booked' : b.status === 'REJECTED' ? 'rejected' : 'cancelled') as BookingStatus,
               salesId: b.staffId?.toString() || '',
               salesName: 'Me',
               salesStaffNo: b.staffId?.toString() || '',
               createdAt: b.createdAt || '',
               reserveNo: b.reserveNo,
               rejectReason: b.remark,
               cancelReason: b.cancelReason
            }));
            
            setBookings(prev => {
              const bookingMap = new Map(prev.map(b => [b.id, b]));
              myBookings.forEach(b => bookingMap.set(b.id, b));
              return Array.from(bookingMap.values());
            });
        }

        // Similar to fetchPendingRequests but calling getMy...
        // Implementing simplified version
        const resRecharge = await getMyRecharges(1, 100);
        if (resRecharge.code === 200 && resRecharge.data && resRecharge.data.list) {
             const myRecharges = resRecharge.data.list.map(r => ({
               id: r.id?.toString() || '',
               customerId: r.memberId?.toString() || '',
               customerName: 'Unknown',
               amount: r.amount || 0,
               giftProduct: r.giftAmount ? `送${r.giftAmount}` : '',
               status: (r.status === 'PENDING' ? 'pending' : r.status === 'APPROVED' ? 'approved' : 'rejected') as RequestStatus,
               salesId: r.staffId?.toString() || '',
               salesName: 'Me',
               salesStaffNo: r.staffId?.toString() || '',
               leaderId: '',
               createdAt: r.createdAt || '',
               rejectReason: r.remark
             }));
             setRechargeRequests(prev => {
                const map = new Map(prev.map(r => [r.id, r]));
                myRecharges.forEach(r => map.set(r.id, r));
                return Array.from(map.values());
             });
        }
        
        const resConsume = await getMyConsumes(1, 100);
        if (resConsume.code === 200 && resConsume.data && resConsume.data.list) {
            const myConsumes = resConsume.data.list.map(c => ({
              id: c.id?.toString() || '',
              bookingId: '',
              customerId: c.memberId?.toString() || '',
              customerName: 'Unknown',
              roomId: c.roomId?.toString() || '',
              roomName: '',
              date: '',
              bookingSalesId: '',
              bookingSalesName: '',
              serviceSalesId: c.staffId?.toString() || '',
              serviceSalesName: 'Me',
              serviceSalesStaffNo: c.staffId?.toString() || '',
              status: (c.status === 'PENDING' ? 'pending' : c.status === 'APPROVED' ? 'approved' : 'rejected') as RequestStatus,
              leaderId: '',
              createdAt: c.createdAt || '',
              rejectReason: c.remark
            }));
            setConsumptionRequests(prev => {
                const map = new Map(prev.map(r => [r.id, r]));
                myConsumes.forEach(r => map.set(r.id, r));
                return Array.from(map.values());
            });
        }

    } catch (err) {
        console.error('Fetch my requests failed', err);
    } finally {
        setIsLoading(false);
    }
  }, []);

  // --- Actions ---

  const addCustomer = (customer: Omit<Customer, 'id'>) => {
    // Mock
    const newCustomer = { ...customer, id: `c${Date.now()}` };
    setCustomers([...customers, newCustomer]);
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers(customers.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const addBooking = async (booking: Omit<Booking, 'id' | 'createdAt'>) => {
    try {
        const req: ReservationCreateReq = {
            storeId: 1, // Default to 1? Or find storeId from roomId
            roomId: parseInt(booking.roomId),
            memberId: parseInt(booking.customerId), // Assuming customerId is number
            staffId: parseInt(booking.salesId) || 0, // Need correct ID
            reserveDate: booking.date,
            guestCount: 1,
            remark: ''
        };
        // Find storeId from room
        const room = rooms.find(r => r.id === booking.roomId);
        if (room) {
            req.storeId = parseInt(room.storeId);
        }

        const res = await createReservation(req);
        if (res.code === 200) {
             toast.success('预定提交成功');
             // Refresh data?
             // Since we don't know the new ID immediately in a useful way to update state locally without re-fetch,
             // ideally we re-fetch.
        }
    } catch (err) {
        console.error(err);
        toast.error('预定提交失败');
    }
  };

  const updateBooking = async (id: string, updates: Partial<Booking>) => {
      // General update not fully supported by API for all fields
      // But status update is supported via approve/reject
      console.warn("General updateBooking not implemented fully with API");
  };

  const updateBookingStatus = async (id: string, status: BookingStatus, reason?: string) => {
      try {
          if (status === 'booked') {
              // Approve
              await approveReservation({ reservationId: parseInt(id), remark: reason });
              toast.success('审核通过');
          } else if (status === 'rejected') {
              await rejectReservation({ reservationId: parseInt(id), remark: reason });
              toast.success('审核拒绝');
          } else if (status === 'cancelled') {
              await cancelReservation({ reservationId: parseInt(id), remark: reason });
              toast.success('已取消');
          }
          
          // Optimistic update
          setBookings(prev => prev.map(b => b.id === id ? { ...b, status, rejectReason: reason } : b));
          
      } catch (err) {
          console.error(err);
          toast.error('操作失败');
      }
  };

  const getBookingByRoomAndDate = (roomId: string, date: string) => {
    return bookings.find((b: Booking) => 
      b.roomId === roomId && 
      b.date === date && 
      b.status !== 'rejected' &&
      b.status !== 'cancelled'
    );
  };

  const getBookingsByRoomAndDateRange = (roomId: string, startDate: string, endDate: string) => {
    return bookings.filter((b: Booking) => 
      b.roomId === roomId && 
      b.date >= startDate && 
      b.date <= endDate
    );
  };

  const getCustomersByStaff = (staffId: string, role?: 'sales' | 'leader') => {
    if (role === 'leader') {
      const teamMemberIds = teamMembers
        .filter((tm: TeamMember) => tm.leaderId === staffId)
        .map((tm: TeamMember) => tm.staffNo);
      return customers.filter((c: Customer) => teamMemberIds.includes(c.salesId));
    }
    return customers.filter((c: Customer) => c.salesId === staffId);
  };

  const getBookingsByStaff = (staffId: string) => {
    return bookings.filter((b: Booking) => b.salesId === staffId);
  };

  const getPendingBookings = (leaderId?: string) => {
      // In real API, we just fetch pending.
      // If leaderId is provided, we might filter locally if we have mixed data, 
      // but getPendingReservations API usually returns what the user can see.
      return bookings.filter((b: Booking) => b.status === 'pending');
  };

  const getRoomsByStore = (storeId: string) => {
    return rooms.filter((r: Room) => r.storeId === storeId);
  };

  const addRechargeRequest = async (request: Omit<RechargeRequest, 'id' | 'createdAt'>) => {
      try {
          const req: RechargeApplyCreateReq = {
              memberId: parseInt(request.customerId),
              amount: request.amount,
              giftAmount: 0, // Parse from giftProduct?
              remark: ''
          };
          // Try to parse gift amount
          if (request.giftProduct && request.giftProduct.includes('送')) {
              const num = parseInt(request.giftProduct.replace('送', ''));
              if (!isNaN(num)) req.giftAmount = num;
          }

          const res = await createRechargeApply(req);
          if (res.code === 200) {
              toast.success('充值申请提交成功');
          }
      } catch (err) {
          console.error(err);
          toast.error('充值申请提交失败');
      }
  };

  const updateRechargeStatus = async (id: string, status: RequestStatus, reason?: string) => {
      try {
          if (status === 'approved') {
              await approveRecharge({ applyId: parseInt(id), remark: reason });
              toast.success('审核通过');
          } else if (status === 'rejected') {
              await rejectRecharge({ applyId: parseInt(id), remark: reason });
              toast.success('审核拒绝');
          }
          setRechargeRequests(prev => prev.map(r => r.id === id ? { ...r, status, rejectReason: reason } : r));
      } catch (err) {
          console.error(err);
          toast.error('操作失败');
      }
  };

  const getRechargeRequestsBySales = (salesId: string) => {
    return rechargeRequests.filter((r: RechargeRequest) => r.salesId === salesId);
  };

  const getPendingRechargeRequests = (leaderId: string) => {
    return rechargeRequests.filter((r: RechargeRequest) => r.status === 'pending');
  };

  const addConsumptionRequest = async (request: Omit<ConsumptionRequest, 'id' | 'createdAt'>) => {
       try {
          const req: ConsumeApplyCreateReq = {
              roomId: parseInt(request.roomId),
              memberId: parseInt(request.customerId),
              amount: 0, // Missing in ConsumptionRequest?
              remark: ''
          };
          const res = await createConsumeApply(req);
          if (res.code === 200) {
              toast.success('消费申请提交成功');
          }
      } catch (err) {
          console.error(err);
          toast.error('消费申请提交失败');
      }
  };

  const updateConsumptionStatus = async (id: string, status: RequestStatus, reason?: string) => {
       try {
          if (status === 'approved') {
              await approveConsume({ applyId: parseInt(id), remark: reason });
              toast.success('审核通过');
          } else if (status === 'rejected') {
              await rejectConsume({ applyId: parseInt(id), remark: reason });
              toast.success('审核拒绝');
          }
          setConsumptionRequests(prev => prev.map(r => r.id === id ? { ...r, status, rejectReason: reason } : r));
      } catch (err) {
          console.error(err);
          toast.error('操作失败');
      }
  };

  const getConsumptionRequestsBySales = (salesId: string) => {
    return consumptionRequests.filter((r: ConsumptionRequest) => r.serviceSalesId === salesId);
  };

  const getPendingConsumptionRequests = (leaderId: string) => {
    return consumptionRequests.filter((r: ConsumptionRequest) => r.status === 'pending');
  };

  const addTeamMember = (member: Omit<TeamMember, 'id'>) => {
    const newMember = { ...member, id: `tm${Date.now()}` };
    setTeamMembers([...teamMembers, newMember]);
  };

  const removeTeamMember = (id: string) => {
    setTeamMembers(teamMembers.filter((tm: TeamMember) => tm.id !== id));
  };

  const getTeamMembers = (leaderId: string) => {
    return teamMembers.filter((tm: TeamMember) => tm.leaderId === leaderId);
  };

  const getLeaderIdForSales = (salesId: string): string | undefined => {
    const member = teamMembers.find((tm: TeamMember) => tm.staffNo === salesId);
    return member?.leaderId;
  };

  const getCustomersBySalesId = (salesId: string) => {
    return customers.filter((c: Customer) => c.salesId === salesId);
  };

  const getAllRechargeRequestsBySales = (salesId: string) => {
    return rechargeRequests.filter((r: RechargeRequest) => r.salesId === salesId);
  };

  const getAllConsumptionRequestsBySales = (salesId: string) => {
    return consumptionRequests.filter((r: ConsumptionRequest) =>
      r.serviceSalesId === salesId || r.bookingSalesId === salesId
    );
  };

  const getAllBookingsBySales = (salesId: string) => {
    return bookings.filter((b: Booking) => b.salesId === salesId || b.serviceSalesId === salesId);
  };

  return (
    <DataContext.Provider value={{
      customers,
      rooms,
      stores,
      bookings,
      rechargeRequests,
      consumptionRequests,
      teamMembers,
      isLoading,
      fetchRoomSchedule,
      fetchPendingRequests,
      fetchMyRequests,
      addCustomer,
      updateCustomer,
      addBooking,
      updateBooking,
      updateBookingStatus,
      getBookingByRoomAndDate,
      getBookingsByRoomAndDateRange,
      getCustomersByStaff,
      getBookingsByStaff,
      getPendingBookings,
      getRoomsByStore,
      addRechargeRequest,
      updateRechargeStatus,
      getRechargeRequestsBySales,
      getPendingRechargeRequests,
      addConsumptionRequest,
      updateConsumptionStatus,
      getConsumptionRequestsBySales,
      getPendingConsumptionRequests,
      addTeamMember,
      removeTeamMember,
      getTeamMembers,
      getLeaderIdForSales,
      getCustomersBySalesId,
      getAllRechargeRequestsBySales,
      getAllConsumptionRequestsBySales,
      getAllBookingsBySales,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
