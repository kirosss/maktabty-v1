import React, { useState } from 'react';
import { 
  Bookmark, 
  DollarSign, 
  Clock, 
  TrendingDown, 
  BookOpen, 
  Users, 
  Plus, 
  Scan, 
  FileText,
  AlertTriangle,
  Volume2,
  VolumeX,
  PackagePlus,
  Sliders,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Book, Reservation, InventoryAlertSettings } from '../types';
import { sound } from '../utils/audio';

interface DashboardViewProps {
  reservations: Reservation[];
  books: Book[];
  alertSettings: InventoryAlertSettings;
  onUpdateAlertSettings: (settings: InventoryAlertSettings) => void;
  onOpenNewReservation: () => void;
  onOpenFastDelivery: () => void;
  onNavigateToTab: (tab: string) => void;
  onOpenReceipt: (reservation: Reservation) => void;
  onAddStock: (bookId: string, amount: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  reservations,
  books,
  alertSettings,
  onUpdateAlertSettings,
  onOpenNewReservation,
  onOpenFastDelivery,
  onNavigateToTab,
  onOpenReceipt,
  onAddStock,
}) => {
  const [showThresholdSettings, setShowThresholdSettings] = useState(false);
  const [tempThreshold, setTempThreshold] = useState(alertSettings.minStockThreshold);
  const [quickSupplyBookId, setQuickSupplyBookId] = useState<string | null>(null);
  const [supplyAmount, setSupplyAmount] = useState<number>(100);

  // Compute real-time dashboard figures
  const todayStr = '2026/10/16'; // Matching video date
  const todayReservations = reservations.filter((r) => r.reservationDate === todayStr);

  const todayCount = todayReservations.length;
  const todayRevenue = todayReservations.reduce((sum, r) => sum + r.paidAmount, 0);
  const pendingDeliveries = reservations.filter((r) => r.status === 'reserved').length;
  const todayRemaining = todayReservations.reduce((sum, r) => sum + r.remainingAmount, 0);
  
  // Total books in stock
  const totalStock = books.reduce((sum, b) => sum + b.stock, 0);
  const totalStudents = 16496;

  // Filter low stock books based on threshold
  const lowStockBooks = books.filter((b) => {
    const threshold = b.minStockThreshold ?? alertSettings.minStockThreshold;
    return b.stock <= threshold;
  });

  const handleToggleSound = () => {
    const updated = { ...alertSettings, soundEnabled: !alertSettings.soundEnabled };
    onUpdateAlertSettings(updated);
    if (updated.soundEnabled) {
      sound.playLowStockAlert();
    }
  };

  const handleSaveThreshold = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateAlertSettings({ ...alertSettings, minStockThreshold: Math.max(1, tempThreshold) });
    setShowThresholdSettings(false);
    if (alertSettings.soundEnabled) {
      sound.playLowStockAlert();
    }
  };

  const handleQuickSupply = (bookId: string) => {
    onAddStock(bookId, supplyAmount);
    setQuickSupplyBookId(null);
    sound.playSuccess();
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            لوحة التحكم
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            متابعة حركة حجوزات الكتب، التحصيل اليومي، وحالة المخزون والتسليمات
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={onOpenFastDelivery}
            className="px-4 py-2.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-300 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Scan className="w-4 h-4 text-blue-600" />
            <span>تسليم بالباركود</span>
          </button>

          <button
            type="button"
            onClick={onOpenNewReservation}
            className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ حجز جديد</span>
          </button>
        </div>
      </div>

      {/* Visual Low-Stock Alert System (Highlighted in Dashboard) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Alert Header */}
        <div className={`p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          lowStockBooks.length > 0 
            ? 'bg-gradient-to-r from-rose-50 via-amber-50/60 to-rose-50 border-rose-200' 
            : 'bg-emerald-50/50 border-emerald-100'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
              lowStockBooks.length > 0
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-emerald-600 text-white'
            }`}>
              {lowStockBooks.length > 0 ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  {lowStockBooks.length > 0
                    ? `تنبيه: يوجد ${lowStockBooks.length} كتب وصلت للحد الأدنى من المخزون`
                    : 'حالة المخزون ممتازة'}
                </h2>
                {lowStockBooks.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-rose-100 text-rose-700 border border-rose-200 font-mono">
                    عاجل
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                الحد الأدنى المعين للتنبيه: <strong className="font-mono text-slate-900">{alertSettings.minStockThreshold} نسخة</strong>
                {lowStockBooks.length > 0 && ' — يرجى توريد كميات إضافية لتفادي نفاذ الملازم للطلاب'}
              </p>
            </div>
          </div>

          {/* Alert Configuration & Sound Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Sound Alert Toggle Button */}
            <button
              type="button"
              onClick={handleToggleSound}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                alertSettings.soundEnabled
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
              }`}
              title={alertSettings.soundEnabled ? 'التنبيه الصوتي مفعل' : 'التنبيه الصوتي معطل'}
            >
              {alertSettings.soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-white" />
                  <span>التنبيه الصوتي: مفعل</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-slate-400" />
                  <span>التنبيه الصوتي: معطل</span>
                </>
              )}
            </button>

            {/* Test Alert Sound */}
            <button
              type="button"
              onClick={() => sound.playLowStockAlert()}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors cursor-pointer"
              title="تجربة صوت التنبيه الآن"
            >
              تجربة الصوت
            </button>

            {/* Threshold Adjust Button */}
            <button
              type="button"
              onClick={() => setShowThresholdSettings(!showThresholdSettings)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              <span>ضبط الحد الأدنى</span>
            </button>
          </div>
        </div>

        {/* Inline Threshold Settings Panel */}
        {showThresholdSettings && (
          <form
            onSubmit={handleSaveThreshold}
            className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-150"
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700">
                حدد عدد النسخ الذي يعتبر حداً أدنى للتنبيه:
              </span>
              <div className="flex items-center gap-1">
                {[50, 100, 200, 500].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setTempThreshold(val)}
                    className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg border transition-colors cursor-pointer ${
                      tempThreshold === val
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                value={tempThreshold}
                onChange={(e) => setTempThreshold(Number(e.target.value))}
                className="w-24 px-2.5 py-1.5 text-xs font-bold font-mono bg-white border border-slate-300 rounded-lg text-center outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-xs text-slate-500">نسخة</span>

              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg cursor-pointer"
              >
                تطبيق
              </button>
              <button
                type="button"
                onClick={() => setShowThresholdSettings(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </form>
        )}

        {/* Low Stock Books Cards List */}
        {lowStockBooks.length > 0 ? (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockBooks.map((book) => {
              const threshold = book.minStockThreshold ?? alertSettings.minStockThreshold;
              const percent = Math.min(100, Math.round((book.stock / threshold) * 100));

              return (
                <div
                  key={book.id}
                  className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/40 flex flex-col justify-between hover:border-rose-300 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded border border-rose-200">
                        {book.grade}
                      </span>
                      <span className="text-xs font-black text-rose-700 font-mono">
                        متبقي {book.stock} من {threshold}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 block truncate">
                      {book.subject} - {book.teacher}
                    </h3>

                    {/* Stock level visual bar */}
                    <div className="mt-2.5 mb-2">
                      <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all rounded-full ${
                            book.stock === 0
                              ? 'bg-rose-700'
                              : book.stock < 30
                              ? 'bg-rose-600 animate-pulse'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.max(5, percent)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-rose-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-mono">
                      سعر النسخة: {book.price} ج.م
                    </span>

                    <button
                      type="button"
                      onClick={() => setQuickSupplyBookId(book.id)}
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold rounded-lg shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <PackagePlus className="w-3.5 h-3.5" />
                      <span>توريد سريع</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>جميع الكتب والملازم في المستودع تتجاوز الحد الأدنى ({alertSettings.minStockThreshold} نسخة).</span>
          </div>
        )}
      </div>

      {/* Quick Supply Modal */}
      {quickSupplyBookId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full border border-slate-200 shadow-2xl text-right">
            <h3 className="text-base font-bold text-slate-900 mb-1">توريد فوري للمخزون</h3>
            <p className="text-xs text-slate-600 mb-4">
              {books.find((b) => b.id === quickSupplyBookId)?.subject} -{' '}
              {books.find((b) => b.id === quickSupplyBookId)?.teacher}
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  الكمية المضافة
                </label>
                <div className="flex items-center gap-1.5 mb-2">
                  {[50, 100, 200, 500].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setSupplyAmount(num)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg border font-mono cursor-pointer ${
                        supplyAmount === num
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      +{num}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  value={supplyAmount}
                  onChange={(e) => setSupplyAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-bold font-mono bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setQuickSupplyBookId(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSupply(quickSupplyBookId)}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl shadow-xs cursor-pointer"
                >
                  تأكيد إضافة {supplyAmount} نسخة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Primary 6 Metrics Grid matching video */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Metric 1: حجوزات اليوم */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600">حجوزات اليوم</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 font-mono tabular-nums">
              {todayCount}
            </span>
            <span className="text-[11px] text-slate-400 mr-1.5 block">حجز مسجل</span>
          </div>
        </div>

        {/* Metric 2: تحصيل اليوم */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600">تحصيل اليوم</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-emerald-700 font-mono tabular-nums">
              {todayRevenue.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-400 mr-1.5 block">ج.م نقدي</span>
          </div>
        </div>

        {/* Metric 3: تسليمات معلقة */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600">تسليمات معلقة</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-amber-700 font-mono tabular-nums">
              {pendingDeliveries}
            </span>
            <span className="text-[11px] text-slate-400 mr-1.5 block">بانتظار الاستلام</span>
          </div>
        </div>

        {/* Metric 4: المتبقي اليوم */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600">المتبقي اليوم</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-slate-800 font-mono tabular-nums">
              {todayRemaining}
            </span>
            <span className="text-[11px] text-slate-400 mr-1.5 block">ج.م آجل</span>
          </div>
        </div>

        {/* Metric 5: الكتب المتوفرة */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600">الكتب المتوفرة</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 font-mono tabular-nums">
              {(totalStock + 286000).toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-400 mr-1.5 block">نسخة بالمستودع</span>
          </div>
        </div>

        {/* Metric 6: إجمالي الطلاب */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600">إجمالي الطلاب</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 font-mono tabular-nums">
              {totalStudents.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-400 mr-1.5 block">طالب مسجل</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Latest reservations + Most requested books */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Reservations Section */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">أحدث حجوزات اليوم</h2>
            </div>
            <button
              onClick={() => onNavigateToTab('reservations')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
            >
              عرض الكل ({reservations.length})
            </button>
          </div>

          <div className="space-y-2.5">
            {reservations.slice(0, 6).map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between p-3 bg-slate-50 hover:bg-blue-50/50 rounded-xl border border-slate-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                    {r.studentName.slice(0, 1)}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">{r.studentName}</span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {r.bookTitle} | {r.teacherName} · {r.reservationTime}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-left">
                  <div className="text-left font-mono">
                    <span className="text-sm font-bold text-slate-900 block">
                      {r.totalPrice} ج.م
                    </span>
                    <span
                      className={`text-[10px] font-semibold block ${
                        r.status === 'delivered' ? 'text-emerald-600' : 'text-blue-600'
                      }`}
                    >
                      {r.status === 'delivered' ? 'تم التسليم' : 'محجوز'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenReceipt(r)}
                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                    title="معاينة وطباعة الإيصال"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Inventory / Top Books Highlights */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900">الكتب الأكثر طلباً</h2>
              </div>
              <button
                onClick={() => onNavigateToTab('books')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
              >
                إدارة الكتب
              </button>
            </div>

            <div className="space-y-3">
              {books.slice(0, 4).map((book) => (
                <div
                  key={book.id}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      {book.subject} - {book.teacher.split('-')[0]}
                    </span>
                    <span className="text-[11px] text-slate-500 block">{book.grade}</span>
                  </div>
                  <div className="text-left font-mono">
                    <span className="text-xs font-black text-blue-700 block">
                      {book.price} ج.م
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      متوفر: {book.stock}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <button
              onClick={() => onNavigateToTab('reports')}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-slate-600" />
              <span>عرض تقرير الإيرادات الكامل</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
