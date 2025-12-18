
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
  getTeamMembers as apiGetTeamMembers,
  createTeamMember,
  getCardTypes,
  createMember,
  getMyMembers,
  getReservationDetail, // Imported
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
  H5StaffCreateReq,
  H5MemberCreateReq,
  H5CardTypeResp,
} from '@/models';

export type CardType = '普' | '银' | '金';
export type BookingStatus = 'free' | 'pending' | 'booked' | 'finished' | 'rejected' | 'cancelled';
export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  idCard: string;
  cardType: string;
  cardTypeId?: number;
  openDate: string;
  balance: number;
  giftAmount: number;
  salesId: string;
}

export interface Room {
  id: string;
  name: string;
  roomNo: string;
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
  applyNo?: string;
  customerId: string;
  customerName: string;
  amount: number;
  giftProduct: string;
  giftAmount: number;
  imageUrl?: string;
  status: RequestStatus;
  salesId: string;
  salesName: string;
  salesStaffNo: string;
  leaderId: string;
  storeId?: number;
  createdAt: string;
  updatedAt?: string;
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
  storeId?: string;
  amount?: number;
}

export interface TeamMember {
  id: string;
  staffNo: string;
  name: string;
  leaderId: string;
  phone?: string;
}

interface DataContextType {
  customers: Customer[];
  rooms: Room[];
  stores: Store[];
  bookings: Booking[];
  rechargeRequests: RechargeRequest[];
  consumptionRequests: ConsumptionRequest[];
  teamMembers: TeamMember[];
  cardTypes: H5CardTypeResp[];
  isLoading: boolean;
  
  // Data Fetching
  fetchRoomSchedule: (storeId: string, startDate: string, endDate: string) => Promise<void>;
  fetchPendingRequests: () => Promise<void>;
  fetchMyRequests: () => Promise<void>;
  fetchCardTypes: () => Promise<void>;
  fetchCustomers: () => Promise<void>;
  fetchTeamMembers: () => Promise<void>;

  // Actions
  addCustomer: (customer: H5MemberCreateReq) => Promise<void>;
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
  
  addRechargeRequest: (request: Omit<RechargeRequest, 'id' | 'createdAt'>) => Promise<boolean>;
  updateRechargeStatus: (id: string, status: RequestStatus, reason?: string) => Promise<void>;
  getRechargeRequestsBySales: (salesId: string) => RechargeRequest[];
  getPendingRechargeRequests: (leaderId: string) => RechargeRequest[];
  
  addConsumptionRequest: (request: Omit<ConsumptionRequest, 'id' | 'createdAt'>) => Promise<boolean>;
  updateConsumptionStatus: (id: string, status: RequestStatus, reason?: string) => Promise<void>;
  getConsumptionRequestsBySales: (salesId: string) => ConsumptionRequest[];
  getPendingConsumptionRequests: (leaderId: string) => ConsumptionRequest[];
  
  addTeamMember: (member: H5StaffCreateReq) => Promise<void>;
  removeTeamMember: (id: string) => void;
  getTeamMembers: (leaderId: string) => TeamMember[];
  getLeaderIdForSales: (salesId: string) => string | undefined;
  getCustomersBySalesId: (salesId: string) => Customer[];
  getAllRechargeRequestsBySales: (salesId: string) => RechargeRequest[];
  getAllConsumptionRequestsBySales: (salesId: string) => ConsumptionRequest[];
  getAllBookingsBySales: (salesId: string) => Booking[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

import { useAuth } from './AuthContext';

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rechargeRequests, setRechargeRequests] = useState<RechargeRequest[]>([]);
  const [consumptionRequests, setConsumptionRequests] = useState<ConsumptionRequest[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [cardTypes, setCardTypes] = useState<H5CardTypeResp[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);

  // Initialize Data when user logs in
  useEffect(() => {
    const initGlobalData = async () => {
      try {
        const storeRes = await getStoreList();
        if (storeRes.code === 200 && storeRes.data) {
          const storeList: Store[] = storeRes.data.map((item: any) => ({
            id: item.id.toString(),
            name: item.name,
          }));
          setStores(storeList);
        }
        
        const cardTypeRes = await getCardTypes();
        if (cardTypeRes.code === 200 && cardTypeRes.data) {
          setCardTypes(cardTypeRes.data);
        }
      } catch (err) {
        console.error('Initialization failed', err);
      }
    };

    if (user) {
      // Fetch global config data
      initGlobalData();

      if (user.role === 'leader') {
        fetchPendingRequests();
        fetchTeamMembers();
      }
      fetchMyRequests();
      
      // Prefetch room schedule for today to populate room definitions
      const today = format(new Date(), 'yyyy-MM-dd');
      fetchRoomSchedule((user.storeId || 1).toString(), today, today);
    }
  }, [user]);

  // --- Data Fetching ---

  const fetchCardTypes = useCallback(async () => {
    try {
      const res = await getCardTypes();
      if (res.code === 200 && res.data) {
        setCardTypes(res.data);
      }
    } catch (err) {
      console.error('Fetch card types failed', err);
    }
  }, []);

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await getMyMembers(1, 100);
      if (res.code === 200 && res.data && res.data.list) {
        const newCustomers: Customer[] = res.data.list.map(m => ({
          id: m.id?.toString() || '',
          name: m.name || '',
          phone: m.phone || '',
          idCard: '', // Not returned by API
          cardType: m.cardTypeName || '普',
          cardTypeId: m.cardTypeId,
          openDate: m.createdAt || '',
          balance: m.balance || 0,
          giftAmount: m.giftBalance || 0,
          salesId: m.staffId?.toString() || '', // Or staffNo if available, but using ID for linking
        }));
        setCustomers(newCustomers);
      }
    } catch (err) {
      console.error('Fetch customers failed', err);
    }
  }, []);

  const fetchTeamMembers = useCallback(async () => {
    try {
      const res = await apiGetTeamMembers(1, 100);
      if (res.code === 200 && res.data && res.data.list) {
        const newMembers: TeamMember[] = res.data.list.map(m => ({
          id: m.id?.toString() || '',
          staffNo: m.phone || '', // Fallback to phone as staffNo if not available, or maybe name? Using phone for now.
          name: m.name || '',
          leaderId: '', // I am the leader
          phone: m.phone,
        }));
        setTeamMembers(newMembers);
      }
    } catch (err) {
      console.error('Fetch team members failed', err);
    }
  }, []);

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
          roomNo: r.roomNo || r.roomName || '', // Fallback to name if no number
          price: r.price || 0,
          type: (r.roomType as any) || 'small', // assuming type matches or we map it
          storeId: storeId,
        }));
        
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
                  customerName: 'Unknown', // No name in response
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
        
        setBookings(prev => {
           // 1. Identify rooms involved in this update (from the current store)
            const roomIdsInStore = new Set(newRooms.map(r => r.id));
            
            const newBookingMap = new Map(newBookings.map(b => [b.id, b]));
            const resultMap = new Map<string, Booking>();
            
            prev.forEach(existing => {
                const isTargetRoom = roomIdsInStore.has(existing.roomId);
                const isTargetDate = existing.date >= startDate && existing.date <= endDate;
                
                if (isTargetRoom && isTargetDate) {
                    // This booking is in the range we just refreshed.
                    // Check if it's still valid (present in new response).
                    if (newBookingMap.has(existing.id)) {
                        // It exists. Merge it.
                        const fresh = newBookingMap.get(existing.id)!;
                        
                        const merged = {
                            ...fresh,
                            // Preserve nice names if they exist and fresh doesn't have them (or has IDs)
                            salesName: (existing.salesName && existing.salesName !== 'Unknown' && existing.salesName !== existing.salesId) ? existing.salesName : fresh.salesName,
                            customerName: (existing.customerName && existing.customerName !== 'Unknown' && existing.customerName !== existing.customerId) ? existing.customerName : fresh.customerName,
                            rejectReason: fresh.rejectReason || existing.rejectReason,
                            createdAt: existing.createdAt || fresh.createdAt,
                            reserveNo: fresh.reserveNo || existing.reserveNo
                        };
                        resultMap.set(existing.id, merged);
                        newBookingMap.delete(existing.id); // Mark as handled
                    } else {
                        // It's in the range but NOT in the new response.
                        // It must have been cancelled/removed. Drop it.
                    }
                } else {
                    // Outside of range/store. Keep as is.
                    // We use resultMap to prevent duplicates if prev already had duplicates
                    if (!resultMap.has(existing.id)) {
                         resultMap.set(existing.id, existing);
                    }
                }
            });
            
            // Add remaining new bookings (that weren't in prev)
            newBookingMap.forEach(b => {
                 resultMap.set(b.id, b);
            });
            
            return Array.from(resultMap.values());
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
           customerName: b.memberName || b.memberId?.toString() || 'Unknown',
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
          pendingBookings.forEach(b => {
             const existing = bookingMap.get(b.id);
             const merged = existing ? {
                 ...existing,
                 ...b,
                 roomId: (b.roomId && b.roomId !== '') ? b.roomId : existing.roomId,
             } : b;
             bookingMap.set(b.id, merged);
          });
          return Array.from(bookingMap.values());
        });
      }

      // Fetch Recharges
      const resRecharge = await getPendingRecharges(1, 100);
      if (resRecharge.code === 200 && resRecharge.data && resRecharge.data.list) {
         const pendingRecharges = resRecharge.data.list.map(r => ({
           id: r.id?.toString() || '',
           customerId: r.memberId?.toString() || '',
           customerName: r.memberName || 'Unknown',
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
            const map = new Map(prev.map(r => [r.id, r]));
            pendingRecharges.forEach(r => map.set(r.id, r));
            return Array.from(map.values());
         });
      }

      // Fetch Consumes
      const resConsume = await getPendingConsumes(1, 100);
      if (resConsume.code === 200 && resConsume.data && resConsume.data.list) {
        const consumeList = resConsume.data.list;

        const pendingConsumes = consumeList.map(c => {
          return {
            id: c.id?.toString() || '',
            bookingId: c.reservationId?.toString() || '', 
            customerId: c.memberId?.toString() || '',
            customerName: c.memberName || 'Unknown',
            roomId: c.roomId?.toString() || '',
            roomName: '', // Need lookup
            date: c.createdAt || '', 
            bookingSalesId: '', // Resolved in UI using reservationId
            bookingSalesName: '', // Resolved in UI
            serviceSalesId: c.receptionStaffId?.toString() || c.applyStaffId?.toString() || '',
            serviceSalesName: 'Unknown',
            serviceSalesStaffNo: c.receptionStaffId?.toString() || c.applyStaffId?.toString() || '',
            status: 'pending' as RequestStatus,
            leaderId: '',
            createdAt: c.createdAt || '',
            rejectReason: c.remark,
            amount: c.consumeAmount || 0
          };
        });
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
        // Common data for all roles
        await fetchCardTypes();

        // "My" lists are only for sales
        if (user?.role !== 'sales') {
            setIsLoading(false);
            return;
        }

        await fetchCustomers();

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
              myBookings.forEach(b => {
                const existing = bookingMap.get(b.id);
                // Preserve roomId from existing booking if new one is missing
                // This prevents RoomMatrix items from disappearing if getMyReservations lacks roomId
                const merged = existing ? {
                    ...existing,
                    ...b,
                    roomId: (b.roomId && b.roomId !== '') ? b.roomId : existing.roomId,
                    customerName: (b.customerName && b.customerName !== 'Unknown') ? b.customerName : existing.customerName
                } : b;
                bookingMap.set(b.id, merged);
              });
              return Array.from(bookingMap.values());
            });
        }

        // Fetch Recharges
        const resRecharge = await getMyRecharges(1, 100);
        if (resRecharge.code === 200 && resRecharge.data && resRecharge.data.list) {
            const myRecharges = resRecharge.data.list.map(r => ({
               id: r.id?.toString() || '',
               applyNo: r.applyNo,
               customerId: r.memberId?.toString() || '',
               customerName: r.memberName || 'Unknown',
               amount: r.amount || 0,
               giftProduct: r.giftAmount ? `送${r.giftAmount}` : '',
               giftAmount: r.giftAmount || 0,
               status: (r.status === 'PENDING' ? 'pending' : r.status === 'APPROVED' ? 'approved' : 'rejected') as RequestStatus,
               salesId: r.staffId?.toString() || '',
               salesName: 'Me',
               salesStaffNo: r.staffId?.toString() || '',
               leaderId: '',
               storeId: r.storeId,
               createdAt: r.createdAt || '',
               updatedAt: r.updatedAt,
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
              bookingId: c.reservationId?.toString() || '',
              customerId: c.memberId?.toString() || '',
              customerName: c.memberName || 'Unknown',
              roomId: c.roomId?.toString() || '',
              roomName: '',
              date: c.createdAt || '',
              bookingSalesId: '',
              bookingSalesName: '',
              serviceSalesId: c.applyStaffId?.toString() || c.staffId?.toString() || '',
          serviceSalesName: 'Me', // Since this is getMyConsumes, I am the service staff
          serviceSalesStaffNo: c.applyStaffId?.toString() || c.staffId?.toString() || '',
              status: (c.status === 'PENDING' ? 'pending' : c.status === 'APPROVED' ? 'approved' : 'rejected') as RequestStatus,
              leaderId: '',
              createdAt: c.createdAt || '',
              rejectReason: c.remark,
              amount: c.consumeAmount || 0
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
  }, [fetchCustomers, fetchTeamMembers, fetchCardTypes]);

  // --- Actions ---

  const addCustomer = async (customer: H5MemberCreateReq) => {
    try {
      const res = await createMember(customer);
      if (res.code === 200) {
        toast.success('客户添加成功');
        fetchCustomers(); // Refresh
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || '客户添加失败');
    }
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    // Optimistic update only
    setCustomers(customers.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const addBooking = async (booking: Omit<Booking, 'id' | 'createdAt'>) => {
    try {
        const req: ReservationCreateReq = {
            storeId: 1, 
            roomId: parseInt(booking.roomId),
            memberId: parseInt(booking.customerId), 
            staffId: parseInt(booking.salesId) || 0,
            reserveDate: booking.date,
            guestCount: 1,
            remark: ''
        };
        const room = rooms.find(r => r.id === booking.roomId);
        if (room) {
            req.storeId = parseInt(room.storeId);
        }

        const res = await createReservation(req);
        if (res.code === 200) {
             toast.success('预定提交成功');
             // Refresh schedule if viewing the same period
             // Since we don't know the current view params here easily, 
             // we can trigger a refetch if we store the last fetched params or just rely on the component to refresh.
             // But for immediate feedback, let's update local state optimistically or re-fetch.
             
             // Simple optimistic update:
             // But we need the real ID and status. 
             // Re-fetching room schedule is safer.
             if (room) {
                 // Trigger a refresh of the room schedule for the booked date
                 // We need to know which store/dates were being viewed.
                 // Ideally, components should subscribe to changes or we expose a refresh method.
                 // For now, let's add it to the local bookings list so it shows up.
                 
                 const newBooking: Booking = {
                     id: res.data?.id?.toString() || `temp_${Date.now()}`,
                     roomId: booking.roomId,
                     date: booking.date,
                     customerId: booking.customerId,
                     customerName: booking.customerName,
                     price: room.price,
                     status: 'pending',
                     salesId: user?.id.toString() || '',
                     salesName: user?.name || '',
                     salesStaffNo: user?.staffNo || '',
                     createdAt: format(new Date(), 'yyyy-MM-dd HH:mm'),
                     reserveNo: res.data?.reserveNo
                 };
                 
                 setBookings(prev => [...prev, newBooking]);
                 
                 // Also refresh the schedule from server to be sure
                 fetchRoomSchedule(room.storeId, booking.date, booking.date);
             }
        }
    } catch (err) {
        console.error(err);
        toast.error('预定提交失败');
    }
  };

  const updateBooking = async (id: string, updates: Partial<Booking>) => {
      console.warn("General updateBooking not implemented fully with API");
  };

  const updateBookingStatus = async (id: string, status: BookingStatus, reason?: string) => {
      try {
          if (!user?.id) {
            toast.error('用户信息缺失，无法操作');
            return;
          }

          if (status === 'booked') {
              await approveReservation({ id: parseInt(id), reviewerId: user.id, reason });
              toast.success('审核通过');
          } else if (status === 'rejected') {
              await rejectReservation({ id: parseInt(id), reviewerId: user.id, reason });
              toast.success('审核拒绝');
          } else if (status === 'cancelled') {
              await cancelReservation({ id: parseInt(id), staffId: user.id, reason });
              toast.success('已取消');
          }
          
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
    // If role is leader, fetch all customers of my team?
    // Currently getMyMembers returns my members.
    // If I am a leader, maybe I can see my team's members?
    // The API /api/h5/members/my might only return members where I am the staff.
    // We'll stick to what we have.
    return customers;
  };

  const getBookingsByStaff = (staffId: string) => {
    return bookings.filter((b: Booking) => b.salesId === staffId || b.salesStaffNo === staffId);
  };

  const getPendingBookings = (leaderId?: string) => {
      return bookings.filter((b: Booking) => b.status === 'pending');
  };

  const getRoomsByStore = (storeId: string) => {
    return rooms.filter((r: Room) => r.storeId === storeId);
  };

  const addRechargeRequest = async (request: Omit<RechargeRequest, 'id' | 'createdAt'>): Promise<boolean> => {
      try {
          const req: RechargeApplyCreateReq = {
              memberId: parseInt(request.customerId),
              storeId: user?.storeId || 1,
              staffId: parseInt(request.salesId),
              amount: request.amount,
              giftAmount: 0, 
              remark: ''
          };
          if (request.giftProduct && request.giftProduct.includes('送')) {
              const num = parseInt(request.giftProduct.replace('送', ''));
              if (!isNaN(num)) req.giftAmount = num;
          }

          const res = await createRechargeApply(req);
          if (res.code === 200) {
              toast.success('充值申请提交成功');
              // Refresh requests to include the new one
              fetchMyRequests();
              return true;
          } else {
              toast.error(res.message || '充值申请提交失败');
              return false;
          }
      } catch (err: any) {
          console.error(err);
          toast.error(err.message || '充值申请提交失败');
          return false;
      }
  };

  const updateRechargeStatus = async (id: string, status: RequestStatus, reason?: string) => {
      try {
          if (!user?.id) {
            toast.error('用户信息缺失，无法操作');
            return;
          }

          if (status === 'approved') {
              await approveRecharge({ id: parseInt(id), reviewerId: user.id, reason });
              toast.success('审核通过');
          } else if (status === 'rejected') {
              await rejectRecharge({ id: parseInt(id), reviewerId: user.id, reason });
              toast.success('审核拒绝');
          }
          setRechargeRequests(prev => prev.map(r => r.id === id ? { ...r, status, rejectReason: reason } : r));
      } catch (err) {
          console.error(err);
          toast.error('操作失败');
      }
  };

  const getRechargeRequestsBySales = (salesId: string) => {
    // salesId can be id (number string) or staffNo (string)
    // The API response returns requests where staffId is the database ID.
    // So we should primarily filter by matching salesId (which is staffId in the object)
    return rechargeRequests.filter((r: RechargeRequest) => 
        r.salesId === salesId || r.salesStaffNo === salesId
    );
  };

  const getPendingRechargeRequests = (leaderId: string) => {
    return rechargeRequests.filter((r: RechargeRequest) => r.status === 'pending');
  };

  const addConsumptionRequest = async (request: Omit<ConsumptionRequest, 'id' | 'createdAt'>): Promise<boolean> => {
       try {
          const req: ConsumeApplyCreateReq = {
              roomId: parseInt(request.roomId),
              memberId: parseInt(request.customerId),
              reservationId: request.bookingId ? parseInt(request.bookingId) : undefined,
              storeId: request.storeId ? parseInt(request.storeId) : (user?.storeId || 1),
              applyStaffId: parseInt(request.serviceSalesId),
              consumeAmount: request.amount || 0,
              remark: ''
          };
          const res = await createConsumeApply(req);
          if (res.code === 200) {
              toast.success('消费申请提交成功');
              
              // We need to fetch both room schedule AND my requests to keep everything in sync
              // fetchMyRequests() updates the status of the booking in "My Bookings"
              // but might lack full room details.
              // So we just fetch my requests for now, relying on the robust merge logic we added.
              fetchMyRequests();
              return true;
          } else {
              toast.error(res.message || '消费申请提交失败');
              return false;
          }
      } catch (err: any) {
          console.error(err);
          toast.error(err.message || '消费申请提交失败');
          return false;
      }
  };

  const updateConsumptionStatus = async (id: string, status: RequestStatus, reason?: string) => {
       try {
          if (!user?.id) {
            toast.error('用户信息缺失，无法操作');
            return;
          }

          if (status === 'approved') {
              await approveConsume({ id: parseInt(id), reviewerId: user.id, reason });
              toast.success('审核通过');
          } else if (status === 'rejected') {
              await rejectConsume({ id: parseInt(id), reviewerId: user.id, reason });
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

  const addTeamMember = async (member: H5StaffCreateReq): Promise<boolean> => {
    try {
      const res = await createTeamMember(member);
      if (res.code === 200) {
        toast.success('业务员添加成功');
        fetchTeamMembers(); // Refresh
        return true;
      } else {
        toast.error(res.message || '添加失败');
        return false;
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || '添加失败');
      return false;
    }
  };

  const removeTeamMember = (id: string) => {
    toast.error('API暂不支持删除业务员');
  };

  const getTeamMembers = (leaderId: string) => {
    return teamMembers;
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
      cardTypes,
      isLoading,
      fetchRoomSchedule,
      fetchPendingRequests,
      fetchMyRequests,
      fetchCardTypes,
      fetchCustomers,
      fetchTeamMembers,
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
