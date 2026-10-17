import { Book, Reservation, Student, User, InventoryAlertSettings } from '../types';

export const api = {
  // Authentication
  async login(username: string, password?: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'فشل تسجيل الدخول' };
      }
      return data;
    } catch (err) {
      console.error('API login error:', err);
      return { success: false, error: 'تعذر الاتصال بالخادم' };
    }
  },

  // Users Management
  async getUsers(): Promise<User[]> {
    try {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      return await res.json();
    } catch {
      return [];
    }
  },

  async createUser(user: Partial<User>): Promise<User> {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'فشل إنشاء المستخدم');
    }
    return await res.json();
  },

  async updateUser(id: string, user: Partial<User>): Promise<User> {
    const res = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'فشل تعديل المستخدم');
    }
    return await res.json();
  },

  async deleteUser(id: string): Promise<void> {
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'فشل حذف المستخدم');
    }
  },

  // Reservations
  async getReservations(): Promise<Reservation[]> {
    try {
      const res = await fetch('/api/reservations');
      if (!res.ok) throw new Error('Failed to fetch reservations');
      return await res.json();
    } catch {
      return [];
    }
  },

  async createReservation(reservation: Reservation): Promise<Reservation> {
    const res = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reservation),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'فشل حفظ الحجز');
    }
    return await res.json();
  },

  async updateReservation(id: string, reservation: Partial<Reservation>): Promise<Reservation> {
    const res = await fetch(`/api/reservations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reservation),
    });
    if (!res.ok) throw new Error('فشل تعديل الحجز');
    return await res.json();
  },

  async deleteReservation(id: string): Promise<void> {
    const res = await fetch(`/api/reservations/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('فشل حذف الحجز');
  },

  async deliverReservation(id: string, collectRemaining = false): Promise<Reservation> {
    const res = await fetch(`/api/reservations/${id}/deliver`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collectRemaining }),
    });
    if (!res.ok) throw new Error('فشل تأكيد التسليم');
    return await res.json();
  },

  // Books
  async getBooks(): Promise<Book[]> {
    try {
      const res = await fetch('/api/books');
      if (!res.ok) throw new Error('Failed to fetch books');
      return await res.json();
    } catch {
      return [];
    }
  },

  async createBook(book: Book): Promise<Book> {
    const res = await fetch('/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(book),
    });
    if (!res.ok) throw new Error('فشل إضافة الكتاب');
    return await res.json();
  },

  async updateBook(id: string, book: Partial<Book>): Promise<Book> {
    const res = await fetch(`/api/books/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(book),
    });
    if (!res.ok) throw new Error('فشل تعديل الكتاب');
    return await res.json();
  },

  async deleteBook(id: string): Promise<void> {
    const res = await fetch(`/api/books/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('فشل حذف الكتاب');
  },

  async addBookStock(id: string, amount: number): Promise<Book> {
    const res = await fetch(`/api/books/${id}/stock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });
    if (!res.ok) throw new Error('فشل توريد المخزون');
    return await res.json();
  },

  // Students
  async getStudents(): Promise<Student[]> {
    try {
      const res = await fetch('/api/students');
      if (!res.ok) throw new Error('Failed to fetch students');
      return await res.json();
    } catch {
      return [];
    }
  },

  // Settings
  async getSettings(): Promise<InventoryAlertSettings> {
    try {
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Failed to fetch settings');
      return await res.json();
    } catch {
      return { minStockThreshold: 50, soundEnabled: true };
    }
  },

  async updateSettings(settings: InventoryAlertSettings): Promise<InventoryAlertSettings> {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error('فشل حفظ الإعدادات');
    return await res.json();
  },

  // Clear all reservations (Wipe demo data for live production)
  async clearAllReservations(): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/system/clear-reservations', { method: 'POST' });
    if (!res.ok) throw new Error('فشل تنظيف السجل');
    return await res.json();
  },
};
