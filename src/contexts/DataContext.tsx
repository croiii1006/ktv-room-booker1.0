import React, { createContext, useContext, useState, ReactNode } from 'react';
import { format, addDays } from 'date-fns';

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
  addCustomer: (customer: Omit<Customer, 'id'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => void;
  updateBooking: (id: string, updates: Partial<Booking>) => void;
  updateBookingStatus: (id: string, status: BookingStatus, reason?: string) => void;
  getBookingByRoomAndDate: (roomId: string, date: string) => Booking | undefined;
  getBookingsByRoomAndDateRange: (roomId: string, startDate: string, endDate: string) => Booking[];
  getCustomersByStaff: (staffId: string, role: 'sales' | 'leader') => Customer[];
  getBookingsByStaff: (staffId: string) => Booking[];
  getPendingBookings: (leaderId?: string) => Booking[];
  getRoomsByStore: (storeId: string) => Room[];
  addRechargeRequest: (request: Omit<RechargeRequest, 'id' | 'createdAt'>) => void;
  updateRechargeStatus: (id: string, status: RequestStatus, reason?: string) => void;
  getRechargeRequestsBySales: (salesId: string) => RechargeRequest[];
  getPendingRechargeRequests: (leaderId: string) => RechargeRequest[];
  addConsumptionRequest: (request: Omit<ConsumptionRequest, 'id' | 'createdAt'>) => void;
  updateConsumptionStatus: (id: string, status: RequestStatus, reason?: string) => void;
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

const generateMockData = () => {
  const stores: Store[] = [
    { id: 'store1', name: '上海店' },
    { id: 'store2', name: '武汉店' },
  ];

  const customers: Customer[] = [
    { id: 'c1', name: '陈先生', phone: '13800138001', idCard: '310101199001011234', cardType: '金', openDate: '2024-01-15', balance: 5000, giftAmount: 500, salesId: 'S001' },
    { id: 'c2', name: '刘女士', phone: '13800138002', idCard: '310101199202022345', cardType: '银', openDate: '2024-02-20', balance: 2000, giftAmount: 200, salesId: 'S001' },
    { id: 'c3', name: '王先生', phone: '13800138003', idCard: '310101198803033456', cardType: '普', openDate: '2024-03-10', balance: 800, giftAmount: 0, salesId: 'S002' },
    { id: 'c4', name: '赵女士', phone: '13800138004', idCard: '310101199504044567', cardType: '金', openDate: '2024-01-01', balance: 8000, giftAmount: 1000, salesId: 'S001' },
  ];

  const rooms: Room[] = [
    // 上海店
    { id: 'r1', name: '101', price: 288, type: 'small', storeId: 'store1' },
    { id: 'r2', name: '102', price: 288, type: 'small', storeId: 'store1' },
    { id: 'r3', name: '201', price: 388, type: 'medium', storeId: 'store1' },
    { id: 'r4', name: '202', price: 388, type: 'medium', storeId: 'store1' },
    { id: 'r5', name: '301', price: 588, type: 'large', storeId: 'store1' },
    { id: 'r6', name: '302', price: 588, type: 'large', storeId: 'store1' },
    // 武汉店
    { id: 'r7', name: 'A01', price: 258, type: 'small', storeId: 'store2' },
    { id: 'r8', name: 'A02', price: 258, type: 'small', storeId: 'store2' },
    { id: 'r9', name: 'B01', price: 358, type: 'medium', storeId: 'store2' },
    { id: 'r10', name: 'B02', price: 358, type: 'medium', storeId: 'store2' },
    { id: 'r11', name: 'C01', price: 558, type: 'large', storeId: 'store2' },
  ];

  const teamMembers: TeamMember[] = [
    { id: 'tm1', staffNo: 'S001', name: '张三', leaderId: 'L001' },
    { id: 'tm2', staffNo: 'S002', name: '李四', leaderId: 'L001' },
  ];

  const today = new Date();
  const bookings: Booking[] = [
    { id: 'b1', roomId: 'r1', date: format(today, 'yyyy-MM-dd'), customerId: 'c1', customerName: '陈先生', price: 288, status: 'booked', salesId: 'S001', salesName: '张三', salesStaffNo: 'S001', createdAt: format(addDays(today, -1), 'yyyy-MM-dd HH:mm') },
    { id: 'b2', roomId: 'r3', date: format(addDays(today, 1), 'yyyy-MM-dd'), customerId: 'c2', customerName: '刘女士', price: 388, status: 'pending', salesId: 'S001', salesName: '张三', salesStaffNo: 'S001', createdAt: format(today, 'yyyy-MM-dd HH:mm') },
    { id: 'b3', roomId: 'r5', date: format(addDays(today, 2), 'yyyy-MM-dd'), customerId: 'c4', customerName: '赵女士', price: 588, status: 'booked', salesId: 'S001', salesName: '张三', salesStaffNo: 'S001', createdAt: format(addDays(today, -2), 'yyyy-MM-dd HH:mm') },
    { id: 'b4', roomId: 'r2', date: format(addDays(today, -1), 'yyyy-MM-dd'), customerId: 'c3', customerName: '王先生', price: 288, status: 'finished', salesId: 'S002', salesName: '李四', salesStaffNo: 'S002', createdAt: format(addDays(today, -3), 'yyyy-MM-dd HH:mm') },
  ];

  const rechargeRequests: RechargeRequest[] = [];
  const consumptionRequests: ConsumptionRequest[] = [];

  return { customers, rooms, stores, bookings, rechargeRequests, consumptionRequests, teamMembers };
};

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('ktv_data_v2');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure new fields exist
      return {
        ...generateMockData(),
        ...parsed,
        stores: parsed.stores || generateMockData().stores,
        rechargeRequests: parsed.rechargeRequests || [],
        consumptionRequests: parsed.consumptionRequests || [],
        teamMembers: parsed.teamMembers || generateMockData().teamMembers,
      };
    }
    return generateMockData();
  });

  const saveData = (newData: typeof data) => {
    setData(newData);
    localStorage.setItem('ktv_data_v2', JSON.stringify(newData));
  };

  const addCustomer = (customer: Omit<Customer, 'id'>) => {
    const newCustomer = { ...customer, id: `c${Date.now()}` };
    saveData({ ...data, customers: [...data.customers, newCustomer] });
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    saveData({
      ...data,
      customers: data.customers.map((c: Customer) => c.id === id ? { ...c, ...updates } : c)
    });
  };

  const addBooking = (booking: Omit<Booking, 'id' | 'createdAt'>) => {
    const newBooking = {
      ...booking,
      id: `b${Date.now()}`,
      createdAt: format(new Date(), 'yyyy-MM-dd HH:mm')
    };
    saveData({ ...data, bookings: [...data.bookings, newBooking] });
  };

  const updateBooking = (id: string, updates: Partial<Booking>) => {
    saveData({
      ...data,
      bookings: data.bookings.map((b: Booking) => b.id === id ? { ...b, ...updates } : b)
    });
  };

  const updateBookingStatus = (id: string, status: BookingStatus, reason?: string) => {
    saveData({
      ...data,
      bookings: data.bookings.map((b: Booking) => 
        b.id === id ? { 
          ...b, 
          status,
          ...(status === 'rejected' && reason ? { rejectReason: reason } : {}),
          ...(status === 'cancelled' && reason ? { cancelReason: reason } : {})
        } : b
      )
    });
  };

  const getBookingByRoomAndDate = (roomId: string, date: string) => {
    return data.bookings.find((b: Booking) => 
      b.roomId === roomId && 
      b.date === date && 
      b.status !== 'rejected' &&
      b.status !== 'cancelled'
    );
  };

  const getBookingsByRoomAndDateRange = (roomId: string, startDate: string, endDate: string) => {
    return data.bookings.filter((b: Booking) => 
      b.roomId === roomId && 
      b.date >= startDate && 
      b.date <= endDate
    );
  };

  const getCustomersByStaff = (staffId: string, role: 'sales' | 'leader') => {
    if (role === 'leader') {
      // Get all team members' customers
      const teamMemberIds = data.teamMembers
        .filter((tm: TeamMember) => tm.leaderId === staffId)
        .map((tm: TeamMember) => tm.staffNo);
      return data.customers.filter((c: Customer) => teamMemberIds.includes(c.salesId));
    }
    return data.customers.filter((c: Customer) => c.salesId === staffId);
  };

  const getBookingsByStaff = (staffId: string) => {
    return data.bookings.filter((b: Booking) => b.salesId === staffId);
  };

  const getPendingBookings = (leaderId?: string) => {
    if (leaderId) {
      const teamMemberIds = data.teamMembers
        .filter((tm: TeamMember) => tm.leaderId === leaderId)
        .map((tm: TeamMember) => tm.staffNo);
      return data.bookings.filter((b: Booking) => b.status === 'pending' && teamMemberIds.includes(b.salesId));
    }
    return data.bookings.filter((b: Booking) => b.status === 'pending');
  };

  const getRoomsByStore = (storeId: string) => {
    return data.rooms.filter((r: Room) => r.storeId === storeId);
  };

  const addRechargeRequest = (request: Omit<RechargeRequest, 'id' | 'createdAt'>) => {
    const newRequest = {
      ...request,
      id: `rr${Date.now()}`,
      createdAt: format(new Date(), 'yyyy-MM-dd HH:mm')
    };
    saveData({ ...data, rechargeRequests: [...data.rechargeRequests, newRequest] });
  };

  const updateRechargeStatus = (id: string, status: RequestStatus, reason?: string) => {
    saveData({
      ...data,
      rechargeRequests: data.rechargeRequests.map((r: RechargeRequest) => 
        r.id === id ? { ...r, status, ...(reason ? { rejectReason: reason } : {}) } : r
      )
    });
  };

  const getRechargeRequestsBySales = (salesId: string) => {
    return data.rechargeRequests.filter((r: RechargeRequest) => r.salesId === salesId);
  };

  const getPendingRechargeRequests = (leaderId: string) => {
    return data.rechargeRequests.filter((r: RechargeRequest) => 
      r.leaderId === leaderId && r.status === 'pending'
    );
  };

  const addConsumptionRequest = (request: Omit<ConsumptionRequest, 'id' | 'createdAt'>) => {
    const newRequest = {
      ...request,
      id: `cr${Date.now()}`,
      createdAt: format(new Date(), 'yyyy-MM-dd HH:mm')
    };
    saveData({ ...data, consumptionRequests: [...data.consumptionRequests, newRequest] });
  };

  const updateConsumptionStatus = (id: string, status: RequestStatus, reason?: string) => {
    saveData({
      ...data,
      consumptionRequests: data.consumptionRequests.map((r: ConsumptionRequest) => 
        r.id === id ? { ...r, status, ...(reason ? { rejectReason: reason } : {}) } : r
      )
    });
  };

  const getConsumptionRequestsBySales = (salesId: string) => {
    return data.consumptionRequests.filter((r: ConsumptionRequest) => r.serviceSalesId === salesId);
  };

  const getPendingConsumptionRequests = (leaderId: string) => {
    return data.consumptionRequests.filter((r: ConsumptionRequest) => 
      r.leaderId === leaderId && r.status === 'pending'
    );
  };

  const addTeamMember = (member: Omit<TeamMember, 'id'>) => {
    // Check if already assigned to another leader
    const existing = data.teamMembers.find((tm: TeamMember) => tm.staffNo === member.staffNo);
    if (existing) {
      return; // Already assigned
    }
    const newMember = { ...member, id: `tm${Date.now()}` };
    saveData({ ...data, teamMembers: [...data.teamMembers, newMember] });
  };

  const removeTeamMember = (id: string) => {
    saveData({
      ...data,
      teamMembers: data.teamMembers.filter((tm: TeamMember) => tm.id !== id)
    });
  };

  const getTeamMembers = (leaderId: string) => {
    return data.teamMembers.filter((tm: TeamMember) => tm.leaderId === leaderId);
  };

  const getLeaderIdForSales = (salesId: string): string | undefined => {
    const member = data.teamMembers.find((tm: TeamMember) => tm.staffNo === salesId);
    return member?.leaderId;
  };

  const getCustomersBySalesId = (salesId: string) => {
    return data.customers.filter((c: Customer) => c.salesId === salesId);
  };

  const getAllRechargeRequestsBySales = (salesId: string) => {
    return data.rechargeRequests.filter((r: RechargeRequest) => r.salesId === salesId);
  };

  const getAllConsumptionRequestsBySales = (salesId: string) => {
    return data.consumptionRequests.filter((r: ConsumptionRequest) => 
      r.serviceSalesId === salesId || r.bookingSalesId === salesId
    );
  };

  const getAllBookingsBySales = (salesId: string) => {
    return data.bookings.filter((b: Booking) => b.salesId === salesId || b.serviceSalesId === salesId);
  };

  return (
    <DataContext.Provider value={{
      customers: data.customers,
      rooms: data.rooms,
      stores: data.stores,
      bookings: data.bookings,
      rechargeRequests: data.rechargeRequests,
      consumptionRequests: data.consumptionRequests,
      teamMembers: data.teamMembers,
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
