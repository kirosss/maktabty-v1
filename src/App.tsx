import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Bookmark, 
  Scan, 
  BookOpen, 
  Users, 
  Search, 
  FileText, 
  LogOut, 
  Plus, 
  Bell, 
  CheckCircle2, 
  Menu, 
  X,
  Volume2,
  VolumeX,
  RefreshCw,
  QrCode
} from 'lucide-react';
import { Book, Reservation, Student, User, InventoryAlertSettings } from './types';
import { INITIAL_BOOKS, INITIAL_RESERVATIONS, INITIAL_STUDENTS, INITIAL_USERS } from './data/initialData';
import { LoginScreen } from './components/LoginScreen';
import { DashboardView } from './components/DashboardView';
import { ReservationsView } from './components/ReservationsView';
import { BooksView } from './components/BooksView';
import { ReportsView } from './components/ReportsView';
import { StudentsView } from './components/StudentsView';
import { InquiryView } from './components/InquiryView';
import { NewReservationModal } from './components/NewReservationModal';
import { BookModal } from './components/BookModal';
import { ReceiptModal } from './components/ReceiptModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { FastDeliveryModal } from './components/FastDeliveryModal';
import { sound } from './utils/audio';

export default function App() {
  // State Initialization from localStorage or Initial Data
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('raya_current_user');
    return saved ? JSON.parse(saved) : INITIAL_USERS[0]; // default logged in as admin for instant preview
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const [reservations, setReservations] = useState<Reservation[]>(() => {
    const saved = localStorage.getItem('raya_reservations');
    return saved ? JSON.parse(saved) : INITIAL_RESERVATIONS;
  });

  const [books, setBooks] = useState<Book[]>(() => {
    const saved = localStorage.getItem('raya_books');
    return saved ? JSON.parse(saved) : INITIAL_BOOKS;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('raya_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  // Low Stock Alert Settings
  const [alertSettings, setAlertSettings] = useState<InventoryAlertSettings>(() => {
    const saved = localStorage.getItem('raya_alert_settings');
    return saved ? JSON.parse(saved) : { minStockThreshold: 100, soundEnabled: true };
  });

  // Modals state
  const [isNewReservationOpen, setIsNewReservationOpen] = useState(false);
  const [reservationToEdit, setReservationToEdit] = useState<Reservation | null>(null);

  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [activeReceiptReservation, setActiveReceiptReservation] = useState<Reservation | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState<Reservation | null>(null);

  const [isFastDeliveryOpen, setIsFastDeliveryOpen] = useState(false);
  const [fastDeliveryBarcode, setFastDeliveryBarcode] = useState<string>('');

  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookToEdit, setBookToEdit] = useState<Book | null>(null);

  // Success Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Mobile sidebar toggle
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sync state to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('raya_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('raya_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('raya_reservations', JSON.stringify(reservations));
  }, [reservations]);

  useEffect(() => {
    localStorage.setItem('raya_books', JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem('raya_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('raya_alert_settings', JSON.stringify(alertSettings));
  }, [alertSettings]);

  // Toast trigger helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Hardware Barcode Scanner Global Keypress Listener
  // Handheld USB/Bluetooth barcode guns send keystrokes rapidly ending with Enter
  const barcodeBufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);

  useEffect(() => {
    let clearTimer: NodeJS.Timeout;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // If user is currently typing inside an input/textarea and the FastDeliveryModal is open,
      // let the FastDeliveryModal handle it directly.
      const target = e.target as HTMLElement;
      const isInput =
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT');

      const now = Date.now();
      const diff = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      // Clear buffer if more than 350ms elapsed since last keystroke (manual human typing or idle)
      if (diff > 350) {
        barcodeBufferRef.current = '';
      }

      if (e.key === 'Enter') {
        const potentialCode = barcodeBufferRef.current.trim();
        if (potentialCode.length >= 4) {
          e.preventDefault();
          sound.playScanBeep();
          setFastDeliveryBarcode(potentialCode);
          setIsFastDeliveryOpen(true);
        }
        barcodeBufferRef.current = '';
      } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        // Collect alphanumeric barcode characters
        barcodeBufferRef.current += e.key;

        // Auto-clear buffer after 500ms of inactivity
        clearTimeout(clearTimer);
        clearTimer = setTimeout(() => {
          barcodeBufferRef.current = '';
        }, 500);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      clearTimeout(clearTimer);
    };
  }, []);


  // Save Reservation (New or Edit)
  const handleSaveReservation = (res: Reservation) => {
    if (reservationToEdit) {
      // Edit existing
      setReservations((prev) => prev.map((r) => (r.id === res.id ? res : r)));
      showToast(`تم تحديث حجز الطالب "${res.studentName}" بنجاح`);
    } else {
      // Create new
      setReservations((prev) => [res, ...prev]);

      // Decrement inventory stock & increment reserved count
      setBooks((prev) =>
        prev.map((b) => {
          if (b.id === res.bookId) {
            return {
              ...b,
              stock: Math.max(0, b.stock - res.quantity),
              reservedCount: b.reservedCount + res.quantity,
            };
          }
          return b;
        })
      );

      // Add to student registry if not present
      setStudents((prev) => {
        const existing = prev.find((s) => s.phone === res.phone || s.name === res.studentName);
        if (existing) {
          return prev.map((s) =>
            s.id === existing.id
              ? {
                  ...s,
                  totalReservations: s.totalReservations + 1,
                  totalSpent: s.totalSpent + res.paidAmount,
                  lastActive: res.reservationDate,
                }
              : s
          );
        } else {
          const newStudent: Student = {
            id: `s-${Date.now()}`,
            name: res.studentName,
            phone: res.phone,
            grade: res.grade,
            totalReservations: 1,
            totalSpent: res.paidAmount,
            lastActive: res.reservationDate,
          };
          return [newStudent, ...prev];
        }
      });

      // Check if this reservation causes the book's stock to reach or fall below threshold
      const targetBook = books.find((b) => b.id === res.bookId);
      const newStock = targetBook ? Math.max(0, targetBook.stock - res.quantity) : 0;
      const threshold = targetBook?.minStockThreshold ?? alertSettings.minStockThreshold;
      const isNowLowStock = targetBook && newStock <= threshold;

      if (isNowLowStock) {
        if (alertSettings.soundEnabled) {
          sound.playLowStockAlert();
        } else {
          sound.playSuccess();
        }
        showToast(`⚠️ تنبيه انخفاض المخزون: متبقي ${newStock} نسخة فقط من كتاب "${targetBook.subject}" (الحد الأدنى: ${threshold})`);
      } else {
        sound.playSuccess();
        showToast('تم الحجز بنجاح - تم تسجيل بيانات الحجز وتحديث المخزن');
      }

      // Automatically open receipt preview modal as shown in video
      setActiveReceiptReservation(res);
      setIsReceiptOpen(true);
    }


    setIsNewReservationOpen(false);
    setReservationToEdit(null);
  };

  // Delete Reservation and restore book stock
  const handleConfirmDelete = () => {
    if (!reservationToDelete) return;

    const res = reservationToDelete;
    setReservations((prev) => prev.filter((r) => r.id !== res.id));

    // Restore stock if reservation was still reserved
    if (res.status === 'reserved') {
      setBooks((prev) =>
        prev.map((b) => {
          if (b.id === res.bookId) {
            return {
              ...b,
              stock: b.stock + res.quantity,
              reservedCount: Math.max(0, b.reservedCount - res.quantity),
            };
          }
          return b;
        })
      );
    }

    sound.playSuccess();
    showToast(`تم الحذف - تم إلغاء حجز الطالب "${res.studentName}" وإعادة ${res.quantity} نسخة للمخزون`);
    setIsDeleteModalOpen(false);
    setReservationToDelete(null);
  };

  // Deliver Book
  const handleDeliverReservation = (reservationId: string, collectRemaining = false) => {
    const res = reservations.find((r) => r.id === reservationId);
    if (!res) return;

    const now = new Date();
    const dateStr = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`;
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setReservations((prev) =>
      prev.map((r) => {
        if (r.id === reservationId) {
          return {
            ...r,
            status: 'delivered',
            deliveryDate: dateStr,
            deliveryTime: timeStr,
            paidAmount: collectRemaining ? r.totalPrice : r.paidAmount,
            remainingAmount: collectRemaining ? 0 : r.remainingAmount,
          };
        }
        return r;
      })
    );

    // Update book delivered count
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id === res.bookId) {
          return {
            ...b,
            deliveredCount: b.deliveredCount + res.quantity,
          };
        }
        return b;
      })
    );

    sound.playSuccess();
    showToast(`تم تسليم الكتاب بنجاح للطالب "${res.studentName}"`);
  };

  // Save Book (Add or Edit)
  const handleSaveBook = (bookToSave: Book) => {
    if (bookToEdit) {
      setBooks((prev) => prev.map((b) => (b.id === bookToSave.id ? bookToSave : b)));
      showToast(`تم تعديل بيانات كتاب "${bookToSave.subject}"`);
    } else {
      setBooks((prev) => [bookToSave, ...prev]);
      showToast(`تمت إضافة كتاب جديد "${bookToSave.subject}" بنجاح`);
    }
    setIsBookModalOpen(false);
    setBookToEdit(null);
  };

  // Delete Book
  const handleDeleteBook = (bookId: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== bookId));
    showToast('تم حذف الكتاب من النظام');
  };

  // Add stock
  const handleAddStock = (bookId: string, amount: number) => {
    setBooks((prev) =>
      prev.map((b) => (b.id === bookId ? { ...b, stock: b.stock + amount } : b))
    );
    showToast(`تمت إضافة ${amount} نسخة إلى المخزون بنجاح`);
  };

  // Reset to initial demo data
  const handleResetData = () => {
    if (window.confirm('هل تريد استعادة البيانات الافتراضية الأصلية للنظام؟')) {
      setReservations(INITIAL_RESERVATIONS);
      setBooks(INITIAL_BOOKS);
      setStudents(INITIAL_STUDENTS);
      showToast('تمت استعادة البيانات التجريبية بنجاح');
    }
  };

  // If user is not logged in, show Login Screen
  if (!currentUser) {
    return <LoginScreen onLogin={(user) => setCurrentUser(user)} />;
  }

  // Navigation Items
  const navItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard, adminOnly: true },
    { id: 'reservations', label: 'الحجوزات', icon: Bookmark, adminOnly: false },
    { id: 'delivery', label: 'التسليم بالباركود', icon: Scan, adminOnly: true },
    { id: 'books', label: 'الكتب والملازم', icon: BookOpen, adminOnly: true },
    { id: 'students', label: 'الطلاب', icon: Users, adminOnly: true },
    { id: 'inquiry', label: 'الاستعلام', icon: Search, adminOnly: true },
    { id: 'reports', label: 'التقارير', icon: FileText, adminOnly: true },
  ];

  // Cashier only sees reservations or allowed tabs
  const allowedNavItems =
    currentUser.role === 'admin'
      ? navItems
      : navItems.filter((item) => !item.adminOnly || item.id === 'reservations');

  // If cashier tries to visit admin page, redirect to reservations
  const effectiveTab =
    currentUser.role === 'cashier' && activeTab !== 'reservations'
      ? 'reservations'
      : activeTab;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans" dir="rtl">
      {/* Toast Notification Popup matching video */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Main Viewport Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Right Sidebar (Desktop) matching video layout */}
        <aside className="w-64 bg-white border-l border-slate-200 shadow-xs flex-col justify-between hidden md:flex shrink-0">
          <div>
            {/* Library Branding Header matching video */}
            <div className="p-5 border-b border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm font-black text-slate-900 leading-tight">
                  مكتبة راية لحجز الكتب
                </h1>
                <span className="text-[10px] text-slate-400 font-medium block">
                  {currentUser.role === 'admin' ? 'صلاحيات المشرف (أدمن)' : 'نقطة بيع (كاشير)'}
                </span>
              </div>
            </div>

            {/* Navigation List matching video menu items */}
            <nav className="p-3 space-y-1">
              {allowedNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = effectiveTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (item.id === 'delivery') {
                        setIsFastDeliveryOpen(true);
                      } else {
                        setActiveTab(item.id);
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive && item.id !== 'delivery'
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                    {item.id === 'reservations' && (
                      <span
                        className={`mr-auto text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                          isActive
                            ? 'bg-blue-700 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {reservations.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Sidebar User Profile & Logout */}
          <div className="p-4 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  {currentUser.name.slice(0, 1)}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block leading-tight">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    @{currentUser.username}
                  </span>
                </div>
              </div>

              {/* Sound Test / Toggle */}
              <button
                type="button"
                onClick={() => sound.playScanBeep()}
                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-md transition-colors"
                title="اختبار صوت الماسح"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentUser(null)}
                className="flex-1 py-2 px-3 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>تسجيل الخروج</span>
              </button>

              <button
                type="button"
                onClick={handleResetData}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                title="استعادة البيانات الأصلية"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Bar matching video */}
          <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between gap-4 sticky top-0 z-20">
            <div className="flex items-center gap-3">
              {/* Mobile menu toggle */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl md:hidden cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                <span className="text-base font-black text-slate-900 tracking-tight">
                  {currentUser.role === 'cashier' ? 'شاشة الكاشير السريعة' : 'نظام مكتبة راية'}
                </span>
                <span className="hidden sm:inline-block text-xs text-slate-400">|</span>
                <span className="hidden sm:inline-block text-xs text-slate-500 font-mono">
                  2026/10/16
                </span>
              </div>
            </div>

            {/* Quick Actions Header */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setFastDeliveryBarcode('');
                  setIsFastDeliveryOpen(true);
                }}
                className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="مسح إيصال وتسليم فوري"
              >
                <Scan className="w-4 h-4 text-blue-600" />
                <span className="hidden sm:inline">تسليم بالباركود</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setReservationToEdit(null);
                  setIsNewReservationOpen(true);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ حجز جديد</span>
              </button>
            </div>
          </header>

          {/* Mobile Drawer Menu */}
          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-40 bg-black/60 md:hidden flex" dir="rtl">
              <div className="w-64 bg-white h-full p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="font-bold text-slate-900">مكتبة راية</span>
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-1 text-slate-400"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <nav className="mt-4 space-y-1">
                    {allowedNavItems.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          if (item.id === 'delivery') {
                            setIsFastDeliveryOpen(true);
                          } else {
                            setActiveTab(item.id);
                          }
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg ${
                          activeTab === item.id ? 'bg-blue-600 text-white' : 'text-slate-600'
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentUser(null)}
                  className="py-2 text-xs font-bold text-rose-600"
                >
                  تسجيل الخروج
                </button>
              </div>
            </div>
          )}

          {/* Active Tab View Body */}
          <main className="p-6 max-w-7xl w-full mx-auto">
            {effectiveTab === 'dashboard' && (
              <DashboardView
                reservations={reservations}
                books={books}
                alertSettings={alertSettings}
                onUpdateAlertSettings={setAlertSettings}
                onAddStock={handleAddStock}
                onOpenNewReservation={() => {
                  setReservationToEdit(null);
                  setIsNewReservationOpen(true);
                }}
                onOpenFastDelivery={() => {
                  setFastDeliveryBarcode('');
                  setIsFastDeliveryOpen(true);
                }}
                onNavigateToTab={(tab) => setActiveTab(tab)}
                onOpenReceipt={(res) => {
                  setActiveReceiptReservation(res);
                  setIsReceiptOpen(true);
                }}
              />
            )}


            {effectiveTab === 'reservations' && (
              <ReservationsView
                reservations={reservations}
                onOpenNewReservation={() => {
                  setReservationToEdit(null);
                  setIsNewReservationOpen(true);
                }}
                onEditReservation={(res) => {
                  setReservationToEdit(res);
                  setIsNewReservationOpen(true);
                }}
                onDeleteReservation={(res) => {
                  setReservationToDelete(res);
                  setIsDeleteModalOpen(true);
                }}
                onOpenReceipt={(res) => {
                  setActiveReceiptReservation(res);
                  setIsReceiptOpen(true);
                }}
                onDeliverReservation={(id) => handleDeliverReservation(id)}
                onOpenFastDelivery={(barcode) => {
                  setFastDeliveryBarcode(barcode || '');
                  setIsFastDeliveryOpen(true);
                }}
              />
            )}

            {effectiveTab === 'books' && (
              <BooksView
                books={books}
                onOpenAddBook={() => {
                  setBookToEdit(null);
                  setIsBookModalOpen(true);
                }}
                onEditBook={(book) => {
                  setBookToEdit(book);
                  setIsBookModalOpen(true);
                }}
                onDeleteBook={handleDeleteBook}
                onAddStock={handleAddStock}
              />
            )}

            {effectiveTab === 'reports' && (
              <ReportsView reservations={reservations} books={books} />
            )}

            {effectiveTab === 'students' && (
              <StudentsView
                students={students}
                reservations={reservations}
                onSelectStudent={(studentName) => {
                  setActiveTab('reservations');
                }}
              />
            )}

            {effectiveTab === 'inquiry' && (
              <InquiryView
                reservations={reservations}
                onOpenReceipt={(res) => {
                  setActiveReceiptReservation(res);
                  setIsReceiptOpen(true);
                }}
                onDeliver={(id) => handleDeliverReservation(id)}
              />
            )}
          </main>
        </div>
      </div>

      {/* Global Modals */}

      {/* New / Edit Reservation Modal */}
      <NewReservationModal
        isOpen={isNewReservationOpen}
        onClose={() => {
          setIsNewReservationOpen(false);
          setReservationToEdit(null);
        }}
        books={books}
        students={students}
        cashierName={currentUser.name}
        onSave={handleSaveReservation}
        initialReservation={reservationToEdit}
      />

      {/* Book Modal (Add / Edit) */}
      <BookModal
        isOpen={isBookModalOpen}
        onClose={() => {
          setIsBookModalOpen(false);
          setBookToEdit(null);
        }}
        onSave={handleSaveBook}
        initialBook={bookToEdit}
      />

      {/* Receipt Modal (matching video receipt) */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => {
          setIsReceiptOpen(false);
          setActiveReceiptReservation(null);
        }}
        reservation={activeReceiptReservation}
        onSimulateScan={(barcode) => {
          setIsReceiptOpen(false);
          setFastDeliveryBarcode(barcode);
          setIsFastDeliveryOpen(true);
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setReservationToDelete(null);
        }}
        reservation={reservationToDelete}
        onConfirm={handleConfirmDelete}
      />

      {/* Fast Delivery Barcode Scanner Modal */}
      <FastDeliveryModal
        isOpen={isFastDeliveryOpen}
        onClose={() => {
          setIsFastDeliveryOpen(false);
          setFastDeliveryBarcode('');
        }}
        reservations={reservations}
        initialBarcode={fastDeliveryBarcode}
        onDeliver={handleDeliverReservation}
        onOpenReceipt={(res) => {
          setIsFastDeliveryOpen(false);
          setActiveReceiptReservation(res);
          setIsReceiptOpen(true);
        }}
      />
    </div>
  );
}
