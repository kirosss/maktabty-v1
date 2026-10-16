import React, { useState } from 'react';
import { Search, Phone, BookOpen, CheckCircle2, Clock, FileText, AlertCircle } from 'lucide-react';
import { Reservation } from '../types';

interface InquiryViewProps {
  reservations: Reservation[];
  onOpenReceipt: (reservation: Reservation) => void;
  onDeliver: (reservationId: string) => void;
}

export const InquiryView: React.FC<InquiryViewProps> = ({
  reservations,
  onOpenReceipt,
  onDeliver,
}) => {
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const results = query.trim()
    ? reservations.filter(
        (r) =>
          r.phone.includes(query.trim()) ||
          r.studentName.toLowerCase().includes(query.trim().toLowerCase()) ||
          r.barcode.includes(query.trim())
      )
    : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Search Hero Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs max-w-2xl mx-auto text-center">
        <h1 className="text-2xl font-black text-slate-900 mb-1">الاستعلام السريع عن الحجز</h1>
        <p className="text-xs text-slate-500 mb-6">
          أدخل رقم هاتف الطالب أو اسمه أو رقم الباركود للاستعلام الفوري عن حالة الكتاب وموعد الاستلام
        </p>

        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setHasSearched(false);
              }}
              placeholder="اكتب رقم التليفون أو اسم الطالب أو الباركود..."
              className="w-full px-4 py-3 text-sm bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 outline-none pr-10"
            />
            <Search className="w-5 h-5 text-slate-400 absolute right-3 top-3.5" />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-sm rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
          >
            بحث الآن
          </button>
        </form>

        {/* Quick Suggestions */}
        <div className="flex items-center justify-center gap-2 mt-4 text-[11px] text-slate-400">
          <span>بحث سريع:</span>
          {['011234569', 'أحمد محمد', '01067829014'].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setQuery(item);
                setHasSearched(true);
              }}
              className="px-2 py-0.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded border border-slate-200 cursor-pointer font-mono"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Results Display */}
      {query.trim() && (
        <div className="max-w-3xl mx-auto space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 px-2">
            <span>نتائج الاستعلام ({results.length})</span>
          </div>

          {results.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">لم يتم العثور على أي حجز مطابق</p>
              <p className="text-xs text-slate-500 mt-1">تأكد من صحة رقم الهاتف أو اسم الطالب المدخل</p>
            </div>
          ) : (
            results.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-slate-900">{r.studentName}</h3>
                    <span className="text-xs font-mono text-slate-500">({r.phone})</span>
                    <span
                      className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                        r.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {r.status === 'delivered' ? 'تم التسليم' : 'محجوز - بانتظار الاستلام'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 font-medium">
                    {r.bookTitle} | {r.teacherName} ({r.grade})
                  </p>

                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 font-mono">
                    <span>تاريخ الحجز: {r.reservationDate}</span>
                    <span>·</span>
                    <span>المدفوع: {r.paidAmount} ج.م</span>
                    {r.remainingAmount > 0 && (
                      <>
                        <span>·</span>
                        <span className="text-rose-600 font-bold">
                          المتبقي: {r.remainingAmount} ج.م
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 justify-end">
                  {r.status === 'reserved' && (
                    <button
                      type="button"
                      onClick={() => onDeliver(r.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>تسليم الكتاب</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onOpenReceipt(r)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>عرض الإيصال</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
