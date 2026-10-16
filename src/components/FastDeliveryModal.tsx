import React, { useState, useEffect, useRef } from 'react';
import { X, Scan, CheckCircle2, AlertCircle, Phone, BookOpen, DollarSign, Camera } from 'lucide-react';
import { Reservation } from '../types';
import { sound } from '../utils/audio';

interface FastDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservations: Reservation[];
  onDeliver: (reservationId: string, collectRemaining?: boolean) => void;
  onOpenReceipt: (reservation: Reservation) => void;
  initialBarcode?: string;
}

export const FastDeliveryModal: React.FC<FastDeliveryModalProps> = ({
  isOpen,
  onClose,
  reservations,
  onDeliver,
  onOpenReceipt,
  initialBarcode = '',
}) => {
  const [barcodeInput, setBarcodeInput] = useState(initialBarcode);
  const [foundReservation, setFoundReservation] = useState<Reservation | null>(null);
  const [searchFeedback, setSearchFeedback] = useState<string>('');
  const [collectAmount, setCollectAmount] = useState<number>(0);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Focus input automatically
  useEffect(() => {
    if (isOpen) {
      if (initialBarcode) {
        setBarcodeInput(initialBarcode);
        lookupBarcode(initialBarcode);
      } else {
        setBarcodeInput('');
        setFoundReservation(null);
        setSearchFeedback('');
      }
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      stopCamera();
    }
  }, [isOpen, initialBarcode]);

  const lookupBarcode = (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) {
      setFoundReservation(null);
      setSearchFeedback('');
      return;
    }

    const match = reservations.find(
      (r) =>
        r.barcode.toLowerCase() === trimmed.toLowerCase() ||
        r.phone === trimmed ||
        r.id.toLowerCase() === trimmed.toLowerCase()
    );

    if (match) {
      sound.playScanBeep();
      setFoundReservation(match);
      setCollectAmount(match.remainingAmount);
      setSearchFeedback('');
    } else {
      sound.playError();
      setFoundReservation(null);
      setSearchFeedback('لم يتم العثور على حجز بهذا الباركود أو رقم الهاتف');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      lookupBarcode(barcodeInput);
    }
  };

  const handleDeliverClick = () => {
    if (!foundReservation) return;
    sound.playSuccess();
    onDeliver(foundReservation.id, collectAmount > 0);
    // Refresh found reservation status locally
    setFoundReservation({
      ...foundReservation,
      status: 'delivered',
      paidAmount: foundReservation.paidAmount + collectAmount,
      remainingAmount: 0,
    });
  };

  // Optional Camera barcode detection using BarcodeDetector API if supported
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch {
      setIsCameraActive(false);
      alert('لم نتمكن من الوصول لكاميرا الجهاز');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Scan className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold">تسليم الكتب والمسح بالباركود</h2>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Scanner Input field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              امسح الباركود بجهاز قارئ الباركود أو أدخل الرقم / الهاتف
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="اضغط Enter أو امسح الباركود..."
                  className="w-full px-3.5 py-2.5 text-base font-mono bg-slate-50 border-2 border-blue-500 rounded-xl focus:bg-white outline-none pr-10"
                />
                <Scan className="w-5 h-5 text-blue-600 absolute left-3 top-3" />
              </div>
              <button
                type="button"
                onClick={() => lookupBarcode(barcodeInput)}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                بحث
              </button>
              <button
                type="button"
                onClick={isCameraActive ? stopCamera : startCamera}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-300 transition-colors cursor-pointer"
                title={isCameraActive ? 'إيقاف الكاميرا' : 'مسح عبر الكاميرا'}
              >
                <Camera className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>

          {/* Quick Scanner Simulation helper for demo */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] text-slate-500">
            <span>نماذج سريعة للتجربة:</span>
            {reservations.slice(0, 3).map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  setBarcodeInput(r.barcode);
                  lookupBarcode(r.barcode);
                }}
                className="px-2 py-0.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded border border-slate-200 font-mono cursor-pointer"
              >
                {r.studentName} ({r.barcode})
              </button>
            ))}
          </div>

          {/* Camera Viewport if active */}
          {isCameraActive && (
            <div className="relative bg-black rounded-xl overflow-hidden aspect-video flex items-center justify-center">
              <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline />
              <div className="absolute inset-x-8 inset-y-12 border-2 border-red-500 rounded-lg pointer-events-none animate-pulse flex items-center justify-center">
                <span className="text-[11px] text-white bg-black/60 px-2 py-1 rounded">وجه الباركود للمربع</span>
              </div>
            </div>
          )}

          {/* Feedback if not found */}
          {searchFeedback && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{searchFeedback}</span>
            </div>
          )}

          {/* Found Reservation Card */}
          {foundReservation && (
            <div className="bg-slate-50 rounded-2xl p-4 border-2 border-blue-200 space-y-3">
              {/* Header Badge */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-slate-900">
                    {foundReservation.studentName}
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    ({foundReservation.phone})
                  </span>
                </div>
                <span
                  className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                    foundReservation.status === 'delivered'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {foundReservation.status === 'delivered' ? 'تم التسليم بالفعل' : 'حجز قيد الانتظار'}
                </span>
              </div>

              {/* Book Details */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">الكتاب والمدرس</span>
                  <span className="font-bold text-slate-900 block mt-0.5">
                    {foundReservation.bookTitle} - {foundReservation.teacherName}
                  </span>
                  <span className="text-blue-700 text-[10px] block font-medium">
                    {foundReservation.grade}
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">الكمية وتاريخ الحجز</span>
                  <span className="font-bold text-slate-900 block mt-0.5">
                    {foundReservation.quantity} نسخة
                  </span>
                  <span className="text-slate-500 font-mono text-[10px] block">
                    {foundReservation.reservationDate} - {foundReservation.reservationTime}
                  </span>
                </div>
              </div>

              {/* Financial Box */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 block">الإجمالي</span>
                  <span className="text-sm font-bold text-slate-900 font-mono">
                    {foundReservation.totalPrice} ج.م
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">المدفوع</span>
                  <span className="text-sm font-bold text-blue-700 font-mono">
                    {foundReservation.paidAmount} ج.م
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">المتبقي</span>
                  <span
                    className={`text-sm font-black font-mono ${
                      foundReservation.remainingAmount > 0 ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {foundReservation.remainingAmount} ج.م
                  </span>
                </div>
              </div>

              {/* Outstanding balance warning if remaining > 0 and not yet delivered */}
              {foundReservation.remainingAmount > 0 && foundReservation.status !== 'delivered' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-amber-600" />
                    <span className="font-bold">
                      يوجد مبلغ متبقي للتحصيل: {foundReservation.remainingAmount} ج.م
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-amber-700">
                    سيتم قيده كمدفوع عند التسليم
                  </span>
                </div>
              )}

              {/* Actions for this reservation */}
              <div className="flex items-center gap-2 pt-2">
                {foundReservation.status !== 'delivered' ? (
                  <button
                    type="button"
                    onClick={handleDeliverClick}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>
                      {foundReservation.remainingAmount > 0
                        ? `تحصيل ${foundReservation.remainingAmount} ج.م وتأكيد التسليم`
                        : 'تأكيد تسليم الكتاب للطالب'}
                    </span>
                  </button>
                ) : (
                  <div className="flex-1 py-2.5 bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>تم التسليم بنجاح في {foundReservation.deliveryDate || 'اليوم'}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => onOpenReceipt(foundReservation)}
                  className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  عرض الإيصال
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
