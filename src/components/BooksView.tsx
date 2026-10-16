import React, { useState } from 'react';
import { Plus, Search, BookOpen, Edit3, Trash2, PackagePlus, AlertCircle } from 'lucide-react';
import { Book } from '../types';

interface BooksViewProps {
  books: Book[];
  onOpenAddBook: () => void;
  onEditBook: (book: Book) => void;
  onDeleteBook: (bookId: string) => void;
  onAddStock: (bookId: string, amount: number) => void;
}

export const BooksView: React.FC<BooksViewProps> = ({
  books,
  onOpenAddBook,
  onEditBook,
  onDeleteBook,
  onAddStock,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [stockModalBook, setStockModalBook] = useState<Book | null>(null);
  const [stockAmount, setStockAmount] = useState(100);

  const filteredBooks = books.filter((b) => {
    if (selectedGrade !== 'all' && b.grade !== selectedGrade) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        b.subject.toLowerCase().includes(q) ||
        b.teacher.toLowerCase().includes(q) ||
        b.grade.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockModalBook || stockAmount <= 0) return;
    onAddStock(stockModalBook.id, stockAmount);
    setStockModalBook(null);
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900">الكتب والملازم</h1>
            <button
              type="button"
              onClick={onOpenAddBook}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ إضافة كتاب جديد</span>
            </button>
          </div>

          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالمادة أو المدرس أو الصف..."
              className="w-full px-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none pr-9"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          </div>
        </div>

        {/* Grade Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            type="button"
            onClick={() => setSelectedGrade('all')}
            className={`px-3 py-1.5 font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              selectedGrade === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            جميع الصفوف ({books.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedGrade('الصف الثالث الثانوي')}
            className={`px-3 py-1.5 font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              selectedGrade === 'الصف الثالث الثانوي'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            الصف الثالث الثانوي
          </button>
          <button
            type="button"
            onClick={() => setSelectedGrade('الصف الثاني الثانوي')}
            className={`px-3 py-1.5 font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              selectedGrade === 'الصف الثاني الثانوي'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            الصف الثاني الثانوي
          </button>
          <button
            type="button"
            onClick={() => setSelectedGrade('الصف الأول الثانوي')}
            className={`px-3 py-1.5 font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              selectedGrade === 'الصف الأول الثانوي'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            الصف الأول الثانوي
          </button>
        </div>
      </div>

      {/* Book Cards Grid matching video */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBooks.map((book) => (
          <div
            key={book.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Top Tag & Grade */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                  {book.grade}
                </span>
                <span className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600">
                  <BookOpen className="w-4 h-4" />
                </span>
              </div>

              {/* Subject Title & Teacher */}
              <h3 className="text-xl font-black text-slate-900 mb-1">{book.subject}</h3>
              <p className="text-xs text-slate-600 font-medium mb-4">{book.teacher}</p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 font-mono text-center mb-4">
                <div>
                  <span className="text-[10px] text-slate-500 block">السعر</span>
                  <span className="text-sm font-black text-slate-900 block">
                    {book.price} ج.م
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">المتوفر بالمخزن</span>
                  <span
                    className={`text-sm font-black block ${
                      book.stock < 100 ? 'text-rose-600' : 'text-emerald-700'
                    }`}
                  >
                    {book.stock.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions: Edit, Delete, Add Stock matching video */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
              <button
                type="button"
                onClick={() => setStockModalBook(book)}
                className="px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors flex items-center gap-1 cursor-pointer"
                title="توريد كمية جديدة"
              >
                <PackagePlus className="w-3.5 h-3.5" />
                <span>+ توريد مخزون</span>
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onEditBook(book)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>تعديل</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteBook(book.id)}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Stock Quick Modal */}
      {stockModalBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-200 shadow-xl text-right">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              توريد نسخ جديدة للمخزون
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              {stockModalBook.subject} - {stockModalBook.teacher}
            </p>
            <form onSubmit={handleStockSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  الكمية الموردة الجديدة
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={stockAmount}
                  onChange={(e) => setStockAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-bold font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStockModalBook(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
                >
                  تأكيد التوريد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
