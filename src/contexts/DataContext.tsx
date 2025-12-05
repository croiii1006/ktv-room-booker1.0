import React, { createContext, useContext, useState, ReactNode } from 'react';
import { format, addDays } from 'date-fns';

export type CardType = '普' | '银' | '金';
export type BookingStatus = 'free' | 'pending' | 'booked' | 'finished' | 'rejected';

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
}

interface DataContextType {
  customers: Customer[];
  rooms: Room[];
  bookings: Booking[];
  addCustomer: (customer: Omit<Customer, 'id'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => void;
  updateBookingStatus: (id: string, status: BookingStatus) => void;
  getBookingByRoomAndDate: (roomId: string, date: string) => Booking | undefined;
  getCustomersByStaff: (staffId: string) => Customer[];
  getBookingsByStaff: (staffId: string) => Booking[];
  getPendingBookings: () => Booking[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Generate initial mock data
const generateMockData = () => {
  const customers: Customer[] = [
    { id: 'c1', name: '陈先生', phone: '13800138001', idCard: '310101199001011234', cardType: '金', openDate: '2024-01-15', balance: 5000, giftAmount: 500, salesId: 'S001' },
    { id: 'c2', name: '刘女士', phone: '13800138002', idCard: '310101199202022345', cardType: '银', openDate: '2024-02-20', balance: 2000, giftAmount: 200, salesId: 'S001' },
    { id: 'c3', name: '王先生', phone: '13800138003', idCard: '310101198803033456', cardType: '普', openDate: '2024-03-10', balance: 800, giftAmount: 0, salesId: 'S002' },
    { id: 'c4', name: '赵女士', phone: '13800138004', idCard: '310101199504044567', cardType: '金', openDate: '2024-01-01', balance: 8000, giftAmount: 1000, salesId: 'L001' },
  ];

  const rooms: Room[] = [
    { id: 'r1', name: '101', price: 288, type: 'small' },
    { id: 'r2', name: '102', price: 288, type: 'small' },
    { id: 'r3', name: '201', price: 388, type: 'medium' },
    { id: 'r4', name: '202', price: 388, type: 'medium' },
    { id: 'r5', name: '301', price: 588, type: 'large' },
    { id: 'r6', name: '302', price: 588, type: 'large' },
    { id: 'r7', name: '303', price: 588, type: 'large' },
    { id: 'r8', name: '401', price: 888, type: 'large' },
  ];

  const today = new Date();
  const bookings: Booking[] = [
    { id: 'b1', roomId: 'r1', date: format(today, 'yyyy-MM-dd'), customerId: 'c1', customerName: '陈先生', price: 288, status: 'booked', salesId: 'S001', salesName: '张三', salesStaffNo: 'S001', createdAt: format(addDays(today, -1), 'yyyy-MM-dd HH:mm') },
    { id: 'b2', roomId: 'r3', date: format(addDays(today, 1), 'yyyy-MM-dd'), customerId: 'c2', customerName: '刘女士', price: 388, status: 'pending', salesId: 'S001', salesName: '张三', salesStaffNo: 'S001', createdAt: format(today, 'yyyy-MM-dd HH:mm') },
    { id: 'b3', roomId: 'r5', date: format(addDays(today, 2), 'yyyy-MM-dd'), customerId: 'c4', customerName: '赵女士', price: 588, status: 'booked', salesId: 'L001', salesName: '王队长', salesStaffNo: 'L001', createdAt: format(addDays(today, -2), 'yyyy-MM-dd HH:mm') },
    { id: 'b4', roomId: 'r2', date: format(addDays(today, -1), 'yyyy-MM-dd'), customerId: 'c3', customerName: '王先生', price: 288, status: 'finished', salesId: 'S002', salesName: '李四', salesStaffNo: 'S002', createdAt: format(addDays(today, -3), 'yyyy-MM-dd HH:mm') },
  ];

  return { customers, rooms, bookings };
};

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('ktv_data');
    return saved ? JSON.parse(saved) : generateMockData();
  });

  const saveData = (newData: typeof data) => {
    setData(newData);
    localStorage.setItem('ktv_data', JSON.stringify(newData));
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

  const updateBookingStatus = (id: string, status: BookingStatus) => {
    saveData({
      ...data,
      bookings: data.bookings.map((b: Booking) => b.id === id ? { ...b, status } : b)
    });
  };

  const getBookingByRoomAndDate = (roomId: string, date: string) => {
    return data.bookings.find((b: Booking) => 
      b.roomId === roomId && 
      b.date === date && 
      b.status !== 'rejected' &&
      b.status !== 'finished'
    );
  };

  const getCustomersByStaff = (staffId: string) => {
    return data.customers.filter((c: Customer) => c.salesId === staffId);
  };

  const getBookingsByStaff = (staffId: string) => {
    return data.bookings.filter((b: Booking) => b.salesId === staffId);
  };

  const getPendingBookings = () => {
    return data.bookings.filter((b: Booking) => b.status === 'pending');
  };

  return (
    <DataContext.Provider value={{
      customers: data.customers,
      rooms: data.rooms,
      bookings: data.bookings,
      addCustomer,
      updateCustomer,
      addBooking,
      updateBookingStatus,
      getBookingByRoomAndDate,
      getCustomersByStaff,
      getBookingsByStaff,
      getPendingBookings,
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
