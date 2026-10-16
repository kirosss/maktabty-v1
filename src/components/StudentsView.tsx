import React, { useState } from 'react';
import { Users, Search, Phone, BookOpen, DollarSign, Calendar } from 'lucide-react';
import { Student, Reservation } from '../types';

interface StudentsViewProps {
  students: Student[];
  reservations: Reservation[];
  onSelectStudent: (studentName: string) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  students,
  reservations,
  onSelectStudent,
}) => {
  const [search, setSearch] = useState('');

  const filtered = students.filter(
    (s) => s.name.includes(search.trim()) || s.phone.includes(search.trim())
  );

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">سجل الطلاب</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            قائمة بجميع الطلاب المسجلين بالحجوزات السابقة والحالية
          </p>
        </div>

        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث باسم الطالب أو رقم الهاتف..."
            className="w-full px-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none pr-9"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
        </div>
      </div>

      {/* Students Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((student) => {
          const studentReservations = reservations.filter(
            (r) => r.studentName === student.name || r.phone === student.phone
          );
          const totalSpent = studentReservations.reduce((sum, r) => sum + r.paidAmount, 0);

          return (
            <div
              key={student.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-200 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 font-bold flex items-center justify-center border border-blue-200">
                    {student.name.slice(0, 1)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{student.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-slate-500 font-mono">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{student.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100 font-mono text-xs mb-4">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">عدد الحجوزات</span>
                    <span className="font-bold text-slate-900">
                      {studentReservations.length} كتب
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">إجمالي المدفوع</span>
                    <span className="font-bold text-emerald-700">
                      {totalSpent} ج.م
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => onSelectStudent(student.name)}
                  className="w-full py-2 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  عرض حجوزات الطالب ({studentReservations.length})
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
