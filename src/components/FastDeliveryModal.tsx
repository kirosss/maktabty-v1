import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Scan, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  DollarSign, 
  Camera, 
  Keyboard, 
  Sparkles, 
  RotateCcw,
  Zap,
  Volume2
} from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
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
  const [scanMode, setScanMode] = useState<'hardware' | 'camera'>('hardware');
  const [barcodeInput, setBarcodeInput] = useState(initialBarcode);
  const [foundReservation, setFoundReservation] = useState<Reservation | null>(null);
  const [searchFeedback, setSearchFeedback] = useState<string>('');
  const [collectAmount, setCollectAmount] = useState<number>(0);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'raya-barcode-reader';

  // Lookup function for reservations
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
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(100);
      }
      setFoundReservation(match);
      setCollectAmount(match.remainingAmount);
      setSearchFeedback('');
      // If camera was active, stop camera after successful scan
      if (isCameraActive) {
        stopCameraScanner();
      }
    } else {
      sound.playError();
      setFoundReservation(null);
      setSearchFeedback(`لم يتم العثور على حجز برقم الباركود "${trimmed}". تأكد من صحة الرقم أو ابحث برقم هاتف الطالب.`);
    }
  };

  // Auto-focus input on open or when switching to hardware mode
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
      
      if (scanMode === 'hardware') {
        setTimeout(() => inputRef.current?.focus(), 150);
      }
    } else {
      stopCameraScanner();
    }
  }, [isOpen, initialBarcode]);

  // When scanMode changes to hardware, focus input
  useEffect(() => {
    if (scanMode === 'hardware') {
      stopCameraScanner();
      setTimeout(() => inputRef.current?.focus(), 150);
    } else if (scanMode === 'camera' && isOpen) {
      startCameraScanner();
    }
  }, [scanMode]);

  // Real-time input change with instant auto-match for fast scanners
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setBarcodeInput(val);

    // If input matches any reservation's barcode or phone exactly, auto trigger lookup immediately!
    const clean = val.trim();
    if (clean.length >= 6) {
      const match = reservations.find(
        (r) => r.barcode.toLowerCase() === clean.toLowerCase() || r.phone === clean
      );
      if (match) {
        lookupBarcode(clean);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      lookupBarcode(barcodeInput);
    }
  };

  // Start Camera Barcode Scanner
  const startCameraScanner = async () => {
    setCameraError(null);
    setIsCameraActive(true);

    try {
      // Ensure existing scanner is cleaned up
      if (html5QrCodeRef.current) {
        try {
          if (html5QrCodeRef.current.isScanning) {
            await html5QrCodeRef.current.stop();
          }
        } catch {}
      }

      const qrCodeScanner = new Html5Qrcode(scannerContainerId);
      html5QrCodeRef.current = qrCodeScanner;

      const config = {
        fps: 15,
        qrbox: { width: 280, height: 160 },
        aspectRatio: 1.777778,
        formatsToSupport: [
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.UPC_A,
        ],
      };

      await qrCodeScanner.start(
        { facingMode: 'environment' }, // Prefer back camera on mobile
        config,
        (decodedText) => {
          // Scanned successfully!
          setBarcodeInput(decodedText);
          lookupBarcode(decodedText);
        },
        () => {
          // Normal frame scan attempt, ignore errors
        }
      );
    } catch (err: unknown) {
      console.error('Camera Scanner Error:', err);
      setIsCameraActive(false);
      setCameraError('لم نتمكن من فتح الكاميرا. يرجى التأكد من إعطاء المتصفح إذن الكاميرا أو استخدام ماسح الباركود اليدوي.');
    }
  };

  const stopCameraScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch {}
      html5QrCodeRef.current = null;
    }
    setIsCameraActive(false);
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

  const handleModalClose = () => {
    stopCameraScanner();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">مسح الباركود وتسليم الكتب</h2>
              <span className="text-[11px] text-blue-300 block">
                متوافق مع أجهزة قارئ الباركود USB وكاميرا الموبايل
              </span>
            </div>
          </div>
          <button
            onClick={handleModalClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs (Hardware vs Camera) */}
        <div className="p-3 bg-slate-100 border-b border-slate-200 shrink-0">
          <div className="grid grid-cols-2 gap-2 bg-slate-200/80 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setScanMode('hardware')}
              className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                scanMode === 'hardware'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Keyboard className="w-4 h-4" />
              <span>جهاز قارئ الباركود (USB / كمبيوتر)</span>
            </button>

            <button
              type="button"
              onClick={() => setScanMode('camera')}
              className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                scanMode === 'camera'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>كاميرا الموبايل / اللابتوب</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* HARDWARE SCANNER MODE */}
          {scanMode === 'hardware' && (
            <div className="space-y-3">
              {/* Ready Indicator Banner */}
              <div
                onClick={() => inputRef.current?.focus()}
                className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between cursor-pointer hover:bg-emerald-100/70 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 -mr-4.5" />
                  <div>
                    <span className="text-xs font-bold text-emerald-900 block">
                      القارئ متصل وجاهز للمسح الآن
                    </span>
                    <span className="text-[11px] text-emerald-700 block">
                      وجّه مسدس الباركود على الإيصال واضغط الزر، سيتم التعرف الفوري!
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-200/80 px-2 py-1 rounded">
                  انقر للتركيز
                </span>
              </div>

              {/* Barcode Input Form */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  رقم الباركود أو رقم هاتف الطالب:
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      ref={inputRef}
                      type="text"
                      autoFocus
                      value={barcodeInput}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder="امسح بالباركود أو اكتب الرقم ثم اضغط Enter..."
                      className="w-full px-4 py-2.5 text-sm font-mono font-bold bg-white border-2 border-blue-500 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none pr-10 shadow-xs"
                    />
                    <Scan className="w-5 h-5 text-blue-600 absolute right-3 top-3" />
                  </div>
                  <button
                    type="button"
                    onClick={() => lookupBarcode(barcodeInput)}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
                  >
                    بحث
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CAMERA SCANNER MODE */}
          {scanMode === 'camera' && (
            <div className="space-y-3">
              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center gap-2">
                <Camera className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  وجّه كاميرا الموبايل نحو باركود الإيصال ليتم مسحه وتحديد الطالب تلقائياً.
                </span>
              </div>

              {/* HTML5 QR/Barcode Video Container */}
              <div className="relative bg-slate-950 rounded-2xl overflow-hidden border-2 border-blue-600 min-h-[220px] flex flex-col items-center justify-center text-white">
                <div id={scannerContainerId} className="w-full max-w-md mx-auto" />

                {!isCameraActive && !cameraError && (
                  <button
                    type="button"
                    onClick={startCameraScanner}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>تشغيل الكاميرا الآن</span>
                  </button>
                )}

                {cameraError && (
                  <div className="p-4 text-center text-rose-300 text-xs space-y-2">
                    <p>{cameraError}</p>
                    <button
                      type="button"
                      onClick={() => setScanMode('hardware')}
                      className="px-4 py-1.5 bg-white text-slate-900 font-bold text-xs rounded-lg cursor-pointer"
                    >
                      التحويل للمسح برقم الباركود
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Demo Helper */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] text-slate-500 pt-1">
            <span className="font-semibold text-slate-700 whitespace-nowrap">تجربة سريعة:</span>
            {reservations.slice(0, 4).map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  setBarcodeInput(r.barcode);
                  lookupBarcode(r.barcode);
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded-lg border border-slate-200 font-mono text-[11px] cursor-pointer whitespace-nowrap"
              >
                {r.studentName} ({r.barcode})
              </button>
            ))}
          </div>

          {/* Search Feedback If Not Found */}
          {searchFeedback && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{searchFeedback}</span>
            </div>
          )}

          {/* FOUND RESERVATION CARD */}
          {foundReservation && (
            <div className="bg-slate-50 rounded-2xl p-4 border-2 border-blue-400 space-y-3.5 shadow-sm animate-in fade-in duration-150">
              {/* Header Badge */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-slate-900">
                    {foundReservation.studentName}
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    ({foundReservation.phone})
                  </span>
                </div>
                <span
                  className={`px-3 py-1 text-xs font-bold rounded-full ${
                    foundReservation.status === 'delivered'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {foundReservation.status === 'delivered' ? 'تم التسليم بالفعل' : 'حجز جاهز للاستلام'}
                </span>
              </div>

              {/* Book Details */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">الكتاب والمدرس</span>
                  <span className="font-bold text-slate-900 block mt-0.5 text-sm">
                    {foundReservation.bookTitle} - {foundReservation.teacherName}
                  </span>
                  <span className="text-blue-700 text-[11px] block font-semibold mt-0.5">
                    {foundReservation.grade}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">الكمية وتاريخ الحجز</span>
                  <span className="font-bold text-slate-900 block mt-0.5 text-sm">
                    {foundReservation.quantity} نسخة
                  </span>
                  <span className="text-slate-500 font-mono text-[11px] block mt-0.5">
                    {foundReservation.reservationDate} - {foundReservation.reservationTime}
                  </span>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between text-center">
                <div>
                  <span className="text-[11px] text-slate-500 block">الإجمالي</span>
                  <span className="text-sm font-bold text-slate-900 font-mono">
                    {foundReservation.totalPrice} ج.م
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-blue-700 block">المدفوع</span>
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

              {/* Outstanding Balance Notice */}
              {foundReservation.remainingAmount > 0 && foundReservation.status !== 'delivered' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="font-bold">
                      متبقي للتحصيل: {foundReservation.remainingAmount} ج.م
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-amber-800">
                    سيتم قيده كمدفوع بالكامل الآن
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                {foundReservation.status !== 'delivered' ? (
                  <button
                    type="button"
                    onClick={handleDeliverClick}
                    className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>
                      {foundReservation.remainingAmount > 0
                        ? `تحصيل ${foundReservation.remainingAmount} ج.م وتأكيد التسليم`
                        : 'تأكيد تسليم الكتاب للطالب الآن'}
                    </span>
                  </button>
                ) : (
                  <div className="flex-1 py-2.5 bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>تم التسليم بنجاح في ({foundReservation.deliveryDate || 'اليوم'})</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => onOpenReceipt(foundReservation)}
                  className="px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer whitespace-nowrap"
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
