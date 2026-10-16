import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Reservation } from '../types';

interface DeleteConfirmModalProps {
  reservation: Reservation | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  reservation,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !reservation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 text-center p-6"
        dir="rtl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon matching video */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-50 flex items-center justify-center border-2 border-rose-200 text-rose-500">
          <AlertTriangle className="w-8 h-8 stroke-[2.2]" />
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-2">تأكيد حذف الحجز</h3>

        <p className="text-sm text-slate-600 mb-2">
          هل أنت متأكد من حذف حجز الطالب{' '}
          <strong className="text-slate-900">"{reservation.studentName}"</strong>؟
        </p>

        <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-100 mb-6 font-medium">
          سيتم إلغاء حجز الطالب وإعادة {reservation.quantity} نسخة إلى المخزون تلقائياً.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onConfirm}
            className="px-6 py-2.5 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            نعم، احذف الآن
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};
