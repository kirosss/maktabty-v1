import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Persistent database file
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'bookstore_db.json');

// Initial default state (Zero demo reservations for clean production)
const DEFAULT_BOOKS = [
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

interface UserRecord {
  id: string;
  username: string;
  name: string;
  password?: string;
  role: 'admin' | 'cashier';
  status: 'active' | 'inactive';
  createdAt: string;
}

const DEFAULT_USERS: UserRecord[] = [
  {
    id: 'u-admin',
    username: 'ادمن',
    name: 'المدير العام',
    password: '123',
    role: 'admin',
    status: 'active',
    createdAt: '2026/10/16',
  },
  {
    id: 'u-cashier',
    username: 'كاشير',
    name: 'كاشير الفرع',
    password: '123',
    role: 'cashier',
    status: 'active',
    createdAt: '2026/10/16',
  },
];

interface DatabaseSchema {
  users: UserRecord[];
  reservations: any[];
  books: any[];
  students: any[];
  alertSettings: {
    minStockThreshold: number;
    soundEnabled: boolean;
  };
}


// Read database
function readDB(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initialDB: DatabaseSchema = {
        users: DEFAULT_USERS,
        reservations: [], // Clean fresh database: zero demo reservations!
        books: DEFAULT_BOOKS,
        students: [], // Clean fresh students
        alertSettings: {
          minStockThreshold: 50,
          soundEnabled: true,
        },
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2), 'utf-8');
      return initialDB;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading DB, using defaults:', err);
    return {
      users: DEFAULT_USERS,
      reservations: [],
      books: DEFAULT_BOOKS,
      students: [],
      alertSettings: { minStockThreshold: 50, soundEnabled: true },
    };
  }
}

// Write database
function writeDB(data: DatabaseSchema) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing DB:', err);
  }
}

// ======================== API ROUTES ========================

// Health & Status
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Authentication Endpoint
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'اسم المستخدم مطلوب' });
  }

  const db = readDB();
  const cleanUsername = String(username).trim().toLowerCase();
  
  const user = db.users.find(
    (u) => u.username.toLowerCase() === cleanUsername && u.status !== 'inactive'
  );

  if (!user) {
    return res.status(401).json({ error: 'اسم المستخدم غير صحيح أو الحساب معطل' });
  }

  // Check password if set
  if (user.password && password && user.password !== String(password)) {
    return res.status(401).json({ error: 'كلمة المرور غير صحيحة' });
  }

  const { password: _, ...userWithoutPass } = user;
  res.json({ success: true, user: userWithoutPass });
});

// Users Management (Admin)
app.get('/api/users', (req: Request, res: Response) => {
  const db = readDB();
  res.json(db.users.map(({ password: _, ...u }) => u));
});

app.post('/api/users', (req: Request, res: Response) => {
  const { username, name, password, role, status } = req.body;
  if (!username || !name || !role) {
    return res.status(400).json({ error: 'جميع الحقول الأساسية مطلوبة' });
  }

  const db = readDB();
  const cleanUsername = String(username).trim();

  if (db.users.some((u) => u.username.toLowerCase() === cleanUsername.toLowerCase())) {
    return res.status(400).json({ error: 'اسم المستخدم هذا مسجل مسبقاً، اختر اسماً آخر' });
  }

  const now = new Date();
  const dateStr = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`;

  const newUser: UserRecord = {
    id: `u-${Date.now()}`,
    username: cleanUsername,
    name: String(name).trim(),
    password: String(password || '123456'),
    role: role === 'admin' ? 'admin' : 'cashier',
    status: status === 'inactive' ? 'inactive' : 'active',
    createdAt: dateStr,
  };


  db.users.push(newUser);
  writeDB(db);

  const { password: _, ...created } = newUser;
  res.status(201).json(created);
});

app.put('/api/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, password, role, status } = req.body;

  const db = readDB();
  const userIndex = db.users.findIndex((u) => u.id === id);

  if (userIndex === -1) {
    return res.status(404).json({ error: 'المستخدم غير موجود' });
  }

  const existingUser = db.users[userIndex];

  // Prevent disabling the last active admin
  if (existingUser.role === 'admin' && (role !== 'admin' || status === 'inactive')) {
    const activeAdmins = db.users.filter((u) => u.role === 'admin' && u.status === 'active');
    if (activeAdmins.length <= 1) {
      return res.status(400).json({ error: 'لا يمكن تعطيل أو تغيير رتبة آخر مسؤول نشط في النظام' });
    }
  }

  db.users[userIndex] = {
    ...existingUser,
    name: name ? String(name).trim() : existingUser.name,
    password: password ? String(password) : existingUser.password,
    role: role ? (role === 'admin' ? 'admin' : 'cashier') : existingUser.role,
    status: status ? (status === 'inactive' ? 'inactive' : 'active') : existingUser.status,
  };

  writeDB(db);
  const { password: _, ...updated } = db.users[userIndex];
  res.json(updated);
});

app.delete('/api/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = readDB();

  const userToDelete = db.users.find((u) => u.id === id);
  if (!userToDelete) {
    return res.status(404).json({ error: 'المستخدم غير موجود' });
  }

  if (userToDelete.role === 'admin') {
    const adminCount = db.users.filter((u) => u.role === 'admin').length;
    if (adminCount <= 1) {
      return res.status(400).json({ error: 'لا يمكن حذف آخر مسؤول للنظام' });
    }
  }

  db.users = db.users.filter((u) => u.id !== id);
  writeDB(db);
  res.json({ success: true, message: 'تم حذف المستخدم بنجاح' });
});

// Reservations Endpoints
app.get('/api/reservations', (req: Request, res: Response) => {
  const db = readDB();
  res.json(db.reservations);
});

app.post('/api/reservations', (req: Request, res: Response) => {
  const newRes = req.body;
  if (!newRes || !newRes.studentName || !newRes.bookId) {
    return res.status(400).json({ error: 'بيانات الحجز غير مكتملة' });
  }

  const db = readDB();

  // Deduct book stock
  const bookIndex = db.books.findIndex((b) => b.id === newRes.bookId);
  if (bookIndex !== -1) {
    db.books[bookIndex].stock = Math.max(0, db.books[bookIndex].stock - (newRes.quantity || 1));
    db.books[bookIndex].reservedCount = (db.books[bookIndex].reservedCount || 0) + (newRes.quantity || 1);
  }

  // Update or add student
  const studentIndex = db.students.findIndex(
    (s) => s.phone === newRes.phone || s.name === newRes.studentName
  );
  if (studentIndex !== -1) {
    db.students[studentIndex].totalReservations += 1;
    db.students[studentIndex].totalSpent += newRes.paidAmount || 0;
    db.students[studentIndex].lastActive = newRes.reservationDate;
  } else {
    db.students.unshift({
      id: `s-${Date.now()}`,
      name: newRes.studentName,
      phone: newRes.phone,
      grade: newRes.grade,
      totalReservations: 1,
      totalSpent: newRes.paidAmount || 0,
      lastActive: newRes.reservationDate,
    });
  }

  db.reservations.unshift(newRes);
  writeDB(db);
  res.status(201).json(newRes);
});

app.put('/api/reservations/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = req.body;
  const db = readDB();

  const idx = db.reservations.findIndex((r) => r.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'الحجز غير موجود' });
  }

  db.reservations[idx] = { ...db.reservations[idx], ...updated };
  writeDB(db);
  res.json(db.reservations[idx]);
});

app.delete('/api/reservations/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = readDB();

  const target = db.reservations.find((r) => r.id === id);
  if (!target) {
    return res.status(404).json({ error: 'الحجز غير موجود' });
  }

  // Restore book stock if it was still reserved
  if (target.status === 'reserved') {
    const bIdx = db.books.findIndex((b) => b.id === target.bookId);
    if (bIdx !== -1) {
      db.books[bIdx].stock += target.quantity || 1;
      db.books[bIdx].reservedCount = Math.max(0, (db.books[bIdx].reservedCount || 0) - (target.quantity || 1));
    }
  }

  db.reservations = db.reservations.filter((r) => r.id !== id);
  writeDB(db);
  res.json({ success: true, message: 'تم حذف الحجز وإعادة النسخ للمخزون' });
});

app.post('/api/reservations/:id/deliver', (req: Request, res: Response) => {
  const { id } = req.params;
  const { collectRemaining } = req.body;
  const db = readDB();

  const idx = db.reservations.findIndex((r) => r.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'الحجز غير موجود' });
  }

  const resItem = db.reservations[idx];
  const now = new Date();
  const dateStr = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`;
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  db.reservations[idx] = {
    ...resItem,
    status: 'delivered',
    deliveryDate: dateStr,
    deliveryTime: timeStr,
    paidAmount: collectRemaining ? resItem.totalPrice : resItem.paidAmount,
    remainingAmount: collectRemaining ? 0 : resItem.remainingAmount,
  };

  // Increment book delivered count
  const bIdx = db.books.findIndex((b) => b.id === resItem.bookId);
  if (bIdx !== -1) {
    db.books[bIdx].deliveredCount = (db.books[bIdx].deliveredCount || 0) + (resItem.quantity || 1);
  }

  writeDB(db);
  res.json(db.reservations[idx]);
});

// Books Endpoints
app.get('/api/books', (req: Request, res: Response) => {
  const db = readDB();
  res.json(db.books);
});

app.post('/api/books', (req: Request, res: Response) => {
  const newBook = req.body;
  if (!newBook || !newBook.subject || !newBook.teacher) {
    return res.status(400).json({ error: 'بيانات الكتاب غير مكتملة' });
  }

  const db = readDB();
  newBook.id = newBook.id || `book-${Date.now()}`;
  db.books.unshift(newBook);
  writeDB(db);
  res.status(201).json(newBook);
});

app.put('/api/books/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedBook = req.body;
  const db = readDB();

  const idx = db.books.findIndex((b) => b.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'الكتاب غير موجود' });
  }

  db.books[idx] = { ...db.books[idx], ...updatedBook };
  writeDB(db);
  res.json(db.books[idx]);
});

app.delete('/api/books/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = readDB();
  db.books = db.books.filter((b) => b.id !== id);
  writeDB(db);
  res.json({ success: true });
});

app.post('/api/books/:id/stock', (req: Request, res: Response) => {
  const { id } = req.params;
  const { amount } = req.body;
  const db = readDB();

  const idx = db.books.findIndex((b) => b.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'الكتاب غير موجود' });
  }

  const addAmount = Number(amount) || 0;
  db.books[idx].stock = (db.books[idx].stock || 0) + addAmount;
  writeDB(db);
  res.json(db.books[idx]);
});

// Students
app.get('/api/students', (req: Request, res: Response) => {
  const db = readDB();
  res.json(db.students);
});

// Settings
app.get('/api/settings', (req: Request, res: Response) => {
  const db = readDB();
  res.json(db.alertSettings || { minStockThreshold: 50, soundEnabled: true });
});

app.put('/api/settings', (req: Request, res: Response) => {
  const db = readDB();
  db.alertSettings = { ...db.alertSettings, ...req.body };
  writeDB(db);
  res.json(db.alertSettings);
});

// Clear all reservations (Wipe for live production)
app.post('/api/system/clear-reservations', (req: Request, res: Response) => {
  const db = readDB();
  db.reservations = [];
  db.students = [];
  // Reset book reservation counters
  db.books.forEach((b) => {
    b.reservedCount = 0;
    b.deliveredCount = 0;
  });
  writeDB(db);
  res.json({ success: true, message: 'تم تنظيف كافة الحجوزات بنجاح والبدء بسجل نظيف للإنتاج' });
});

// ======================== STATIC & VITE SERVING ========================

async function startServer() {
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.join(__dirname, 'dist'))) {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Raya Bookstore] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
