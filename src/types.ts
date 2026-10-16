export type UserRole = 'admin' | 'cashier';

export interface User {
  username: string;
  name: string;
  role: UserRole;
}

export interface Book {
  id: string;
  subject: string;
  teacher: string;
  grade: string;
  price: number;
  stock: number;
  minStockThreshold?: number; // Optional specific threshold for this book
  reservedCount: number;
  deliveredCount: number;
}

export interface InventoryAlertSettings {
  minStockThreshold: number; // Global threshold (default e.g. 50 or 100)
  soundEnabled: boolean;
}


export type ReservationStatus = 'reserved' | 'delivered' | 'cancelled';

export interface Reservation {
  id: string;
  barcode: string;
  studentName: string;
  phone: string;
  bookId: string;
  bookTitle: string;
  teacherName: string;
  grade: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  paidAmount: number;
  remainingAmount: number;
  notes?: string;
  status: ReservationStatus;
  reservationDate: string; // YYYY/MM/DD
  reservationTime: string; // HH:mm
  deliveryDate?: string;
  deliveryTime?: string;
  cashierName: string;
}

export interface Student {
  id: string;
  name: string;
  phone: string;
  grade?: string;
  totalReservations: number;
  totalSpent: number;
  lastActive: string;
}
