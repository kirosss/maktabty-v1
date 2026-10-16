import React, { useState } from 'react';
import { 
  FileText, 
  Calendar, 
  DollarSign, 
  Bookmark, 
  CheckCircle2, 
  Clock, 
  Printer, 
  TrendingUp,
  Download
} from 'lucide-react';
import { Reservation, Book } from '../types';

interface ReportsViewProps {
  reservations: Reservation[];
  books: Book[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ reservations, books }) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'popular' | 'revenue' | 'pending'>('daily');
  const [selectedDate, setSelectedDate] = useState('2026/10/16');

  // Filter reservations for the selected date
  const dayReservations = reservations.filter((r) => r.reservationDate === selectedDate);
  const dayReservationsCount = dayReservations.length;
  const dayDeliveriesCount = dayReservations.filter((r) => r.status === 'delivered').length;
  const dayRevenue = dayReservations.reduce((sum, r) => sum + r.paidAmount, 0);
  const dayRemaining = dayReservations.reduce((sum, r) => sum + r.remainingAmount, 0);

  // Most popular books calculation
  const popularBooks = [...books].sort((a, b) => b.reservedCount - a.reservedCount);

  // Pending deliveries
  const pendingList = reservations.filter((r) => r.status === 'reserved');

  return (
    <div className="space-y-4" dir="rtl">
      {/* Top Header & Tabs Bar matching video */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900">التقارير والإحصائيات</h1>
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">التاريخ:</span>
            <div className="relative">
              <input
                type="text"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
              />
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Tab Buttons matching video */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('daily')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'daily'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            تقرير اليوم
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('popular')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'popular'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            الأكثر طلباً
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('revenue')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'revenue'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            الأرباح والتحصيل
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            التسليمات المعلقة ({pendingList.length})
          </button>
        </div>
      </div>

      {/* Summary Cards Row matching video */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-600">حجوزات اليوم</span>
            <Bookmark className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-2xl font-black text-slate-900 font-mono tabular-nums">
            {dayReservationsCount}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-600">تسليمات اليوم</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-slate-900 font-mono tabular-nums">
            {dayDeliveriesCount}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-600">تحصيل اليوم</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-emerald-700 font-mono tabular-nums">
            {dayRevenue.toFixed(1)} ج.م
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-600">المتبقي للتحصيل</span>
            <Clock className="w-4 h-4 text-rose-600" />
          </div>
          <span className="text-2xl font-black text-slate-800 font-mono tabular-nums">
            {dayRemaining.toFixed(1)} ج.م
          </span>
        </div>
      </div>

      {/* Report Tab Contents */}
      {activeTab === 'daily' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              بيان تفصيلي بحجوزات تاريخ ({selectedDate})
            </h3>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة البيان</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50/75 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">الطالب</th>
                  <th className="py-3 px-4">الكتاب</th>
                  <th className="py-3 px-4">المدرس والصف</th>
                  <th className="py-3 px-4 text-center">الكمية</th>
                  <th className="py-3 px-4 text-left">المدفوع</th>
                  <th className="py-3 px-4 text-left">المتبقي</th>
                  <th className="py-3 px-4 text-center">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {dayReservations.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-sans font-bold text-slate-900">
                      {r.studentName}
                      <span className="block text-[11px] text-slate-400 font-mono">{r.phone}</span>
                    </td>
                    <td className="py-3 px-4 font-sans text-blue-900 font-semibold">{r.bookTitle}</td>
                    <td className="py-3 px-4 font-sans text-slate-600">
                      {r.teacherName} ({r.grade})
                    </td>
                    <td className="py-3 px-4 text-center font-bold">{r.quantity}</td>
                    <td className="py-3 px-4 text-left font-bold text-blue-700">{r.paidAmount.toFixed(1)} ج.م</td>
                    <td className="py-3 px-4 text-left font-bold text-slate-700">{r.remainingAmount.toFixed(1)} ج.م</td>
                    <td className="py-3 px-4 text-center font-sans">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          r.status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {r.status === 'delivered' ? 'تم التسليم' : 'محجوز'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'popular' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-4">
            ترتيب الكتب والمدرسين الأكثر طلباً وحجزاً
          </h3>
          <div className="space-y-3">
            {popularBooks.map((book, idx) => (
              <div
                key={book.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    {idx + 1}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">{book.subject}</span>
                    <span className="text-xs text-slate-500 font-medium">
                      {book.teacher} · {book.grade}
                    </span>
                  </div>
                </div>

                <div className="text-left font-mono">
                  <span className="text-sm font-black text-blue-700 block">
                    {book.reservedCount} حجز
                  </span>
                  <span className="text-[11px] text-emerald-700 block">
                    تم تسليم: {book.deliveredCount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'revenue' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900">الملخص المالي والتحصيل النقدي</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
              <span className="text-xs text-emerald-800 font-bold block mb-1">إجمالي المبالغ المحصلة</span>
              <span className="text-2xl font-black text-emerald-800 font-mono">
                {reservations.reduce((sum, r) => sum + r.paidAmount, 0).toLocaleString()} ج.م
              </span>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-center">
              <span className="text-xs text-amber-800 font-bold block mb-1">مبالغ آجلة قيد التحصيل</span>
              <span className="text-2xl font-black text-amber-800 font-mono">
                {reservations.reduce((sum, r) => sum + r.remainingAmount, 0).toLocaleString()} ج.م
              </span>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-center">
              <span className="text-xs text-blue-800 font-bold block mb-1">القيمة الإجمالية للحجوزات</span>
              <span className="text-2xl font-black text-blue-900 font-mono">
                {reservations.reduce((sum, r) => sum + r.totalPrice, 0).toLocaleString()} ج.م
              </span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'pending' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-3">
            قائمة الطلاب المنتظرين لاستلام كتبهم ({pendingList.length})
          </h3>
          <div className="space-y-2.5">
            {pendingList.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between p-3 rounded-xl bg-amber-50/50 border border-amber-200"
              >
                <div>
                  <span className="text-sm font-bold text-slate-900 block">{r.studentName}</span>
                  <span className="text-xs text-slate-600">
                    {r.phone} · {r.bookTitle} ({r.teacherName})
                  </span>
                </div>
                <div className="text-left font-mono text-xs">
                  <span className="font-bold text-slate-800 block">تاريخ الحجز: {r.reservationDate}</span>
                  <span className="text-amber-700 font-semibold">بانتظار وصول الطالب</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
