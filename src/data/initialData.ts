import { Book, Reservation, Student, User } from '../types';

export const INITIAL_USERS: User[] = [
  { id: 'u-admin', username: 'ادمن', name: 'المدير العام', role: 'admin', status: 'active' },
  { id: 'u-cashier', username: 'كاشير', name: 'كاشير الفرع', role: 'cashier', status: 'active' },
];

export const INITIAL_BOOKS: Book[] = [
  {
    id: 'b-1',
    subject: 'كيمياء',
    teacher: 'أ. / خالد صقر - كتاب الثالث والرابع',
    grade: 'الصف الثالث الثانوي',
    price: 200,
    stock: 500,
    minStockThreshold: 50,
    reservedCount: 0,
    deliveredCount: 0,
  },
  {
    id: 'b-2',
    subject: 'فيزياء',
    teacher: 'أ. / أحمد عادل - بنك الأسئلة والشرح',
    grade: 'الصف الثاني الثانوي',
    price: 200,
    stock: 450,
    minStockThreshold: 50,
    reservedCount: 0,
    deliveredCount: 0,
  },
  {
    id: 'b-3',
    subject: 'أحياء',
    teacher: 'د. / الجوهري - المرجع الشامل',
    grade: 'الصف الثالث الثانوي',
    price: 220,
    stock: 350,
    minStockThreshold: 50,
    reservedCount: 0,
    deliveredCount: 0,
  },
  {
    id: 'b-4',
    subject: 'لغة عربية',
    teacher: 'أ. / رضا الفاروق - اللواء في النحو واللغة',
    grade: 'الصف الثالث الثانوي',
    price: 250,
    stock: 250,
    minStockThreshold: 50,
    reservedCount: 0,
    deliveredCount: 0,
  },
  {
    id: 'b-5',
    subject: 'رياضيات',
    teacher: 'أ. / أحمد عصام - التفاضل والتكامل',
    grade: 'الصف الثالث الثانوي',
    price: 210,
    stock: 300,
    minStockThreshold: 50,
    reservedCount: 0,
    deliveredCount: 0,
  },
];

// Clean fresh initial data: Zero demo reservations for live production
export const INITIAL_RESERVATIONS: Reservation[] = [];
export const INITIAL_STUDENTS: Student[] = [];
