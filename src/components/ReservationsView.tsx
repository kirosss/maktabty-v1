import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Printer, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Phone, 
  Scan, 
  Calendar,
  Layers,
  ChevronDown,
  Filter
} from 'lucide-react';
import { Reservation, ReservationStatus } from '../types';

interface ReservationsViewProps {
  reservations: Reservation[];
  onOpenNewReservation: () => void;
  onEditReservation: (reservation: Reservation) => void;
  onDeleteReservation: (reservation: Reservation) => void;
  onOpenReceipt: (reservation: Reservation) => void;
  onDeliverReservation: (reservationId: string) => void;
  onOpenFastDelivery: (barcode?: string) => void;
}

export const ReservationsView: React.FC<ReservationsViewProps> = ({
  reservations,
  onOpenNewReservation,
  onEditReservation,
  onDeleteReservation,
  onOpenReceipt,
  onDeliverReservation,
  onOpenFastDelivery,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'reserved' | 'delivered'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('2026/10/16');
  const [filterByDate, setFilterByDate] = useState(false);

  // Filter logic
  const filtered = reservations.filter((r) => {
    // Status filter
    if (activeFilter === 'reserved' && r.status !== 'reserved') return false;
    if (activeFilter === 'delivered' && r.status !== 'delivered') return false;

    // Date filter
    if (filterByDate && r.reservationDate !== selectedDate) return false;

    // Text search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = r.studentName.toLowerCase().includes(q);
      const matchPhone = r.phone.includes(q);
      const matchBook = r.bookTitle.toLowerCase().includes(q);
      const matchTeacher = r.teacherName.toLowerCase().includes(q);
      const matchBarcode = r.barcode.includes(q);
      const matchGrade = r.grade.toLowerCase().includes(q);

      return matchName || matchPhone || matchBook || matchTeacher || matchBarcode || matchGrade;
    }

    return true;
  });

  return (
    <div className="space-y-4" dir="rtl">
      {/* Top Header & Search Control Bar matching video */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Right side: Title & New Reservation Button */}
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900 whitespace-nowrap">الحجوزات</h1>
            <button
              type="button"
              onClick={onOpenNewReservation}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>+ حجز جديد</span>
            </button>
          </div>

          {/* Center: Search Bar matching video */}
          <div className="relative flex-1 max-w-lg">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم الطالب، المادة، المدرس، رقم الهاتف، أو الباركود..."
              className="w-full px-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all pr-9"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          </div>

          {/* Left: Filter Tabs matching video */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                الكل ({reservations.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('reserved')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeFilter === 'reserved'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                محجوز ({reservations.filter((r) => r.status === 'reserved').length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('delivered')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeFilter === 'delivered'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                تم التسليم ({reservations.filter((r) => r.status === 'delivered').length})
              </button>
            </div>

            {/* Quick Barcode Scan Button */}
            <button
              type="button"
              onClick={() => onOpenFastDelivery()}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition-colors cursor-pointer"
              title="مسح سريع للباركود"
            >
              <Scan className="w-4 h-4 text-blue-600" />
            </button>
          </div>
        </div>

        {/* Date Filter Strip */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">تصفية التاريخ:</span>
            <button
              type="button"
              onClick={() => setFilterByDate(!filterByDate)}
              className={`px-2.5 py-1 rounded-lg border font-mono text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                filterByDate
                  ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold'
                  : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{selectedDate}</span>
              {filterByDate ? '(مفعل)' : '(انقر للتفعيل)'}
            </button>
            {filterByDate && (
              <button
                type="button"
                onClick={() => setFilterByDate(false)}
                className="text-xs text-rose-600 hover:underline cursor-pointer"
              >
                إلغاء التصفية
              </button>
            )}
          </div>

          <span className="font-mono text-slate-500">
            عدد النتائج المعروضة: {filtered.length} حجز
          </span>
        </div>
      </div>

      {/* Reservations List Cards matching the video list layout */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">لا توجد حجوزات مطابقة للبحث</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            يمكنك إضافة حجز جديد أو تعديل معايير البحث والفلترة.
          </p>
          <button
            type="button"
            onClick={onOpenNewReservation}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>حجز جديد الآن</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-200 transition-all p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4"
            >
              {/* Right Zone: Student & Book Info */}
              <div className="flex items-center gap-4 min-w-[280px]">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 ${
                    r.status === 'delivered'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}
                >
                  {r.studentName.slice(0, 1)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{r.studentName}</h3>
                    <span className="flex items-center gap-1 text-xs text-slate-600 font-mono">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {r.phone}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-600 flex-wrap">
                    <span className="font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                      {r.bookTitle} | {r.teacherName}
                    </span>
                    <span>·</span>
                    <span className="text-slate-500">{r.grade}</span>
                    <span>·</span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {r.quantity} نسخة
                    </span>
                    <span>·</span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {r.reservationDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Center Zone: Pricing Columns matching video */}
              <div className="grid grid-cols-3 gap-4 text-center px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block">الإجمالي</span>
                  <span className="text-xs font-bold text-slate-900 block">
                    {r.totalPrice.toFixed(1)} ج.م
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-blue-700 block">المدفوع</span>
                  <span className="text-xs font-bold text-blue-700 block">
                    {r.paidAmount.toFixed(1)} ج.م
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">المتبقي</span>
                  <span
                    className={`text-xs font-bold block ${
                      r.remainingAmount > 0 ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {r.remainingAmount.toFixed(1)} ج.م
                  </span>
                </div>
              </div>

              {/* Left Zone: Action Buttons matching video */}
              <div className="flex items-center gap-2 justify-end shrink-0">
                {/* Deliver Status & Button */}
                {r.status === 'reserved' ? (
                  <button
                    type="button"
                    onClick={() => onDeliverReservation(r.id)}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    title="تسليم الكتاب للطالب"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>تسليم</span>
                  </button>
                ) : (
                  <span className="px-2.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>تم التسليم</span>
                  </span>
                )}

                {/* Print Receipt Button */}
                <button
                  type="button"
                  onClick={() => onOpenReceipt(r)}
                  className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                  title="طباعة إيصال الحجز"
                >
                  <Printer className="w-4 h-4" />
                </button>

                {/* Edit Reservation */}
                <button
                  type="button"
                  onClick={() => onEditReservation(r)}
                  className="p-2 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                  title="تعديل بيانات الحجز"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                {/* Delete Reservation */}
                <button
                  type="button"
                  onClick={() => onDeleteReservation(r)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                  title="حذف الحجز وإعادة النسخة للمخزن"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
