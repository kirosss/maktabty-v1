import React from 'react';
import { X, Printer, CheckCircle2, Phone, BookOpen, QrCode } from 'lucide-react';
import { Reservation } from '../types';
import { BarcodeRenderer } from './BarcodeRenderer';
import { sound } from '../utils/audio';

interface ReceiptModalProps {
  reservation: Reservation | null;
  isOpen: boolean;
  onClose: () => void;
  onSimulateScan?: (barcode: string) => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  reservation,
  isOpen,
  onClose,
  onSimulateScan,
}) => {
  if (!isOpen || !reservation) return null;

  const handlePrint = () => {
    sound.playSuccess();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
        dir="rtl"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">معاينة إيصال الحجز</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Receipt Content */}
        <div className="p-6 overflow-y-auto max-h-[75vh] flex flex-col items-center">
          {/* Printable Ticket Card matching physical receipt in video */}
          <div
            id="receipt-printable"
            className="w-full max-w-sm bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 p-3.5 rounded-xl text-white shadow-lg border-2 border-blue-950 font-sans"
          >
            {/* Ticket Header */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-blue-700/60">
              <div className="flex items-center gap-1.5">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                  <BookOpen className="w-4 h-4 text-blue-200" />
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-blue-200 font-medium block leading-tight">حجز فوري للكتب</span>
                  <span className="text-xs text-white/80 font-mono">#{reservation.barcode}</span>
                </div>
              </div>

              {/* Main Calligraphic Title */}
              <div className="text-center">
                <h1 className="text-2xl font-black tracking-wide text-white drop-shadow-sm font-['Changa','Cairo']">
                  مكتبة راية
                </h1>
                <p className="text-[10px] text-blue-200 font-medium -mt-1">للخدمات التعليمية والكتب المدرسية</p>
              </div>

              <div className="w-8 h-8 rounded bg-white p-0.5 flex items-center justify-center shadow-xs">
                <QrCode className="w-7 h-7 text-blue-950" />
              </div>
            </div>

            {/* Inner White Body (Thermal Card) */}
            <div className="bg-white text-slate-900 rounded-lg p-3.5 shadow-inner border border-slate-200">
              {/* Row 1: Barcode & Student Name */}
              <div className="grid grid-cols-2 gap-3 items-center pb-2 border-b border-dashed border-slate-300">
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 font-medium block">اسم الطالب</span>
                  <span className="text-base font-bold text-slate-900 truncate block">
                    {reservation.studentName}
                  </span>
                  <span className="text-xs font-mono text-slate-600 block mt-0.5">
                    {reservation.phone}
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <BarcodeRenderer
                    value={reservation.barcode}
                    width={1.6}
                    height={38}
                    fontSize={11}
                  />
                </div>
              </div>

              {/* Row 2: Book Title & Teacher */}
              <div className="py-2.5 border-b border-dashed border-slate-300">
                <div className="flex items-baseline justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">الكتاب والمدرس</span>
                  <span className="text-[11px] text-blue-700 font-semibold">{reservation.grade}</span>
                </div>
                <div className="mt-1">
                  <span className="text-sm font-bold text-slate-900 block">
                    {reservation.bookTitle} - {reservation.teacherName}
                  </span>
                </div>
              </div>

              {/* Row 3: Financial Details */}
              <div className="grid grid-cols-3 gap-2 pt-2.5 text-center">
                <div className="p-1.5 bg-slate-50 rounded border border-slate-100">
                  <span className="text-[10px] text-slate-500 block">التاريخ</span>
                  <span className="text-xs font-semibold text-slate-800 font-mono">
                    {reservation.reservationDate}
                  </span>
                </div>
                <div className="p-1.5 bg-blue-50/70 rounded border border-blue-100">
                  <span className="text-[10px] text-blue-700 block">المدفوع</span>
                  <span className="text-xs font-bold text-blue-950 font-mono">
                    {reservation.paidAmount} ج.م
                  </span>
                </div>
                <div className="p-1.5 bg-slate-50 rounded border border-slate-100">
                  <span className="text-[10px] text-slate-500 block">الكمية</span>
                  <span className="text-xs font-bold text-slate-800 font-mono">
                    {reservation.quantity}
                  </span>
                </div>
              </div>

              {/* Remaining balance notice if partial payment */}
              {reservation.remainingAmount > 0 ? (
                <div className="mt-2 p-1.5 bg-amber-50 rounded border border-amber-200 text-center text-xs text-amber-900 font-bold">
                  المتبقي عند الاستلام: {reservation.remainingAmount} ج.م
                </div>
              ) : (
                <div className="mt-2 p-1 bg-emerald-50 rounded border border-emerald-200 text-center text-[11px] text-emerald-800 font-semibold flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  تم دفع المبلغ بالكامل
                </div>
              )}
            </div>

            {/* Bottom Footer info banner */}
            <div className="flex items-center justify-between text-[10px] text-blue-200 font-mono pt-2 px-1">
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-blue-300" />
                <span>01032171885 / 01025249022</span>
              </div>
              <span className="text-[9px] text-blue-300">الاستلام بهذا الإيصال فقط</span>
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-500 text-center">
            يرجى تسليم هذا الإيصال للطالب لإحضاره عند استلام الكتاب ومسح الباركود به.
          </p>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
          {onSimulateScan && (
            <button
              onClick={() => onSimulateScan(reservation.barcode)}
              className="text-xs font-medium text-blue-700 hover:text-blue-900 hover:underline flex items-center gap-1 cursor-pointer"
              title="محاكاة مسح الباركود لهذا الحجز"
            >
              <span>تجربة مسح الباركود</span>
            </button>
          )}

          <div className="flex items-center gap-2 mr-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              إغلاق
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الإيصال</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
