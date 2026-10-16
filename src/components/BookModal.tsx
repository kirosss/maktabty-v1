import React, { useState, useEffect } from 'react';
import { X, BookOpen, Save } from 'lucide-react';
import { Book } from '../types';

interface BookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (book: Book) => void;
  initialBook?: Book | null;
}

const GRADES = [
  'الصف الأول الثانوي',
  'الصف الثاني الثانوي',
  'الصف الثالث الثانوي',
  'الصف الثالث الإعدادي',
  'الصف الثاني الإعدادي',
  'الصف الأول الإعدادي',
];

export const BookModal: React.FC<BookModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialBook,
}) => {
  const [subject, setSubject] = useState('');
  const [teacher, setTeacher] = useState('');
  const [grade, setGrade] = useState(GRADES[2]); // default to 3rd secondary
  const [price, setPrice] = useState<number>(200);
  const [stock, setStock] = useState<number>(1000);

  useEffect(() => {
    if (initialBook) {
      setSubject(initialBook.subject);
      setTeacher(initialBook.teacher);
      setGrade(initialBook.grade);
      setPrice(initialBook.price);
      setStock(initialBook.stock);
    } else {
      setSubject('');
      setTeacher('');
      setGrade(GRADES[2]);
      setPrice(200);
      setStock(1000);
    }
  }, [initialBook, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !teacher.trim() || price <= 0) return;

    const bookToSave: Book = {
      id: initialBook ? initialBook.id : `book-${Date.now()}`,
      subject: subject.trim(),
      teacher: teacher.trim(),
      grade,
      price: Number(price),
      stock: Number(stock),
      reservedCount: initialBook ? initialBook.reservedCount : 0,
      deliveredCount: initialBook ? initialBook.deliveredCount : 0,
    };

    onSave(bookToSave);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">
              {initialBook ? 'تعديل بيانات الكتاب' : 'إضافة كتاب جديد'}
            </h2>
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
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              اسم المادة <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="مثال: لغة عربية، كيمياء، فيزياء..."
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              اسم المدرس <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={teacher}
              onChange={(e) => setTeacher(e.target.value)}
              placeholder="أ. / محمد علي..."
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              الصف الدراسي <span className="text-rose-500">*</span>
            </label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                السعر (ج.م) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm font-bold font-mono bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                الكمية المتاحة (المخزون)
              </label>
              <input
                type="number"
                min="0"
                required
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm font-bold font-mono bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

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
              className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>حفظ الكتاب</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
