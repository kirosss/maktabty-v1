import React, { useState, useEffect } from 'react';
import { X, CheckCircle, BookOpen, User, Phone, DollarSign, Layers } from 'lucide-react';
import { Book, Reservation, Student } from '../types';

interface NewReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  students: Student[];
  cashierName: string;
  onSave: (reservation: Reservation) => void;
  initialReservation?: Reservation | null; // For editing
}

export const NewReservationModal: React.FC<NewReservationModalProps> = ({
  isOpen,
  onClose,
  books,
  students,
  cashierName,
  onSave,
  initialReservation,
}) => {
  const [studentName, setStudentName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedBookId, setSelectedBookId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [studentSuggestions, setStudentSuggestions] = useState<Student[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Set or reset form state
  useEffect(() => {
    if (initialReservation) {
      setStudentName(initialReservation.studentName);
      setPhone(initialReservation.phone);
      setSelectedBookId(initialReservation.bookId);
      setQuantity(initialReservation.quantity);
      setPaidAmount(initialReservation.paidAmount);
      setNotes(initialReservation.notes || '');
    } else {
      setStudentName('');
      setPhone('');
      setSelectedBookId(books.length > 0 ? books[0].id : '');
      setQuantity(1);
      const defaultBook = books[0];
      setPaidAmount(defaultBook ? defaultBook.price : 200);
      setNotes('');
    }
  }, [initialReservation, isOpen, books]);

  const selectedBook = books.find((b) => b.id === selectedBookId) || books[0];
  const unitPrice = selectedBook ? selectedBook.price : 0;
  const totalPrice = unitPrice * quantity;
  const remainingAmount = Math.max(0, totalPrice - paidAmount);

  // Auto-update paid amount when book or quantity changes if not manually set
  const handleBookChange = (bookId: string) => {
    setSelectedBookId(bookId);
    const bk = books.find((b) => b.id === bookId);
    if (bk) {
      setPaidAmount(bk.price * quantity);
    }
  };

  const handleQuantityChange = (newQty: number) => {
    const qty = Math.max(1, newQty);
    setQuantity(qty);
    if (selectedBook) {
      setPaidAmount(selectedBook.price * qty);
    }
  };

  // Student autocomplete
  const handleStudentNameChange = (val: string) => {
    setStudentName(val);
    if (val.trim().length > 0) {
      const matched = students.filter(
        (s) => s.name.includes(val) || s.phone.includes(val)
      );
      setStudentSuggestions(matched);
      setShowSuggestions(matched.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectStudent = (student: Student) => {
    setStudentName(student.name);
    setPhone(student.phone);
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !phone.trim() || !selectedBook) return;

    const now = new Date();
    const dateStr = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`;
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Barcode number format: YYYYMMDD + 3-digit random or sequence
    const barcodeCode = initialReservation
      ? initialReservation.barcode
      : `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${Math.floor(100 + Math.random() * 900)}`;

    const newRes: Reservation = {
      id: initialReservation ? initialReservation.id : `RES-${Date.now().toString().slice(-6)}`,
      barcode: barcodeCode,
      studentName: studentName.trim(),
      phone: phone.trim(),
      bookId: selectedBook.id,
      bookTitle: selectedBook.subject,
      teacherName: selectedBook.teacher,
      grade: selectedBook.grade,
      quantity,
      unitPrice,
      totalPrice,
      paidAmount,
      remainingAmount,
      notes: notes.trim() || undefined,
      status: initialReservation ? initialReservation.status : 'reserved',
      reservationDate: initialReservation ? initialReservation.reservationDate : dateStr,
      reservationTime: initialReservation ? initialReservation.reservationTime : timeStr,
      cashierName,
    };

    onSave(newRes);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {initialReservation ? 'تعديل الحجز' : 'حجز جديد'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              أدخل بيانات الطالب والكتاب لإتمام عملية الحجز سريعاً
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Student Name with Autocomplete */}
          <div className="relative">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              اسم الطالب <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => handleStudentNameChange(e.target.value)}
                onFocus={() => studentName && setShowSuggestions(true)}
                placeholder="أدخل اسم الطالب..."
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all pr-10"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>

            {/* Suggestions dropdown */}
            {showSuggestions && studentSuggestions.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                {studentSuggestions.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => selectStudent(st)}
                    className="w-full px-3.5 py-2 text-right hover:bg-blue-50 text-xs flex items-center justify-between border-b border-slate-100 last:border-0 cursor-pointer"
                  >
                    <span className="font-bold text-slate-800">{st.name}</span>
                    <span className="text-slate-500 font-mono">{st.phone}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              رقم التليفون <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01xxxxxxxxx"
                className="w-full px-3.5 py-2.5 text-sm font-mono bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all pr-10"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* Book Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              اسم الكتاب والمدرس <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                value={selectedBookId}
                onChange={(e) => handleBookChange(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              >
                {books.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.subject} | {b.teacher} ({b.grade}) - {b.price} ج.م [المتوفر: {b.stock}]
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quantity, Unit Price, Total Price Grid */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">الكمية</label>
              <input
                type="number"
                min="1"
                max={selectedBook?.stock || 99}
                value={quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                className="w-full px-2.5 py-1.5 text-sm font-bold text-center bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">سعر الكتاب</label>
              <div className="px-2.5 py-1.5 text-sm font-bold text-center bg-white border border-slate-200 rounded-lg text-slate-800 font-mono">
                {unitPrice} ج.م
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">إجمالي السعر</label>
              <div className="px-2.5 py-1.5 text-sm font-black text-center bg-blue-50 border border-blue-200 rounded-lg text-blue-900 font-mono">
                {totalPrice} ج.م
              </div>
            </div>
          </div>

          {/* Paid & Remaining Amounts */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                المبلغ المدفوع (ج.م) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                max={totalPrice}
                value={paidAmount}
                onChange={(e) => setPaidAmount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm font-bold font-mono bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                المتبقي (تلقائياً)
              </label>
              <div
                className={`px-3.5 py-2.5 text-sm font-bold font-mono rounded-xl border ${
                  remainingAmount > 0
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}
              >
                {remainingAmount} ج.م
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ملاحظات (اختياري)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أي تفاصيل أو ملاحظات إضافية..."
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{initialReservation ? 'حفظ التعديلات' : 'حفظ الحجز'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
