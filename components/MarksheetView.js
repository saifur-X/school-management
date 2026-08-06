import { Printer } from 'lucide-react';

export default function MarksheetView({ school, examName, printMarksheetData, setPrintMarksheetData, classMarks, calculateGrade }) {
  if (!printMarksheetData) return null;

  return (
    <div className="fixed inset-0 bg-white text-slate-900 z-50 p-6 overflow-y-auto print:p-0 print:m-0 print:inset-auto">
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-4 print:hidden">
        <button onClick={() => setPrintMarksheetData(null)} className="bg-slate-200 px-4 py-2 rounded-lg font-bold text-sm">
          ← ফিরে যান
        </button>
        <button onClick={() => window.print()} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
          <Printer size={16} /> প্রিন্ট / PDF সেভ করুন (Landscape A4)
        </button>
      </div>

      {printMarksheetData.map((st, index) => {
        const m = classMarks[st.id] || {};
        const subjects = [
          { name: 'Bangla', key: 'bangla', oralMax: 20, theoryMax: 80 },
          { name: 'English', key: 'english', oralMax: 20, theoryMax: 80 },
          { name: 'Mathematics', key: 'math', oralMax: 20, theoryMax: 80 },
          { name: 'General Science', key: 'science', oralMax: 20, theoryMax: 80 },
        ];

        let grandTotal = 0;
        let maxPossible = subjects.length * 100;

        return (
          <div key={st.id} className={`bg-white border-4 border-slate-900 p-8 rounded-xl shadow-2xl relative mb-10 print:mb-0 print:h-screen print:page-break-after-always flex flex-col justify-between ${index > 0 ? 'print:break-before-page' : ''}`}>
            <div>
              <div className="text-center border-b-2 border-slate-900 pb-4 mb-4">
                <h1 className="text-3xl font-black uppercase tracking-wider">{school.school_name}</h1>
                <p className="text-xs font-semibold text-slate-600">{school.address} | Contact: {school.phone}</p>
                <div className="mt-2 inline-block bg-slate-900 text-white font-bold px-4 py-1 rounded text-xs uppercase">
                  OFFICIAL ACADEMIC TRANSCRIPT — {examName}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs mb-4 bg-slate-100 p-3 rounded-lg border border-slate-300">
                <p><strong>Student Name:</strong> {st.name}</p>
                <p><strong>Roll No:</strong> #{st.roll_no}</p>
                <p><strong>Class:</strong> {st.student_class}</p>
                <p><strong>Gender:</strong> {st.gender || 'N/A'}</p>
                <p><strong>Blood Group:</strong> {st.blood_group || 'N/A'}</p>
                <p><strong>Phone:</strong> {st.phone || 'N/A'}</p>
              </div>

              <table className="w-full text-left text-xs border-collapse border border-slate-900 mb-4">
                <thead>
                  <tr className="bg-slate-200 text-slate-900 border-b border-slate-900">
                    <th className="p-2 border-r border-slate-900">Subject Name</th>
                    <th className="p-2 border-r border-slate-900 text-center">Oral Full Marks</th>
                    <th className="p-2 border-r border-slate-900 text-center">Oral Obtained</th>
                    <th className="p-2 border-r border-slate-900 text-center">Theory Full Marks</th>
                    <th className="p-2 border-r border-slate-900 text-center">Theory Obtained</th>
                    <th className="p-2 border-r border-slate-900 text-center">Total (100)</th>
                    <th className="p-2 text-center">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((sub, idx) => {
                    const oral = m[`${sub.key}_oral`] || 0;
                    const theory = m[`${sub.key}_theory`] || 0;
                    const total = oral + theory;
                    grandTotal += total;
                    return (
                      <tr key={idx} className="border-b border-slate-900">
                        <td className="p-2 border-r border-slate-900 font-semibold">{sub.name}</td>
                        <td className="p-2 border-r border-slate-900 text-center">{sub.oralMax}</td>
                        <td className="p-2 border-r border-slate-900 text-center font-medium">{oral}</td>
                        <td className="p-2 border-r border-slate-900 text-center">{sub.theoryMax}</td>
                        <td className="p-2 border-r border-slate-900 text-center font-medium">{theory}</td>
                        <td className="p-2 border-r border-slate-900 text-center font-bold">{total}</td>
                        <td className="p-2 text-center font-extrabold text-blue-800">{calculateGrade(total)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {(() => {
                const avg = grandTotal / subjects.length;
                return (
                  <div className="flex justify-between items-center bg-slate-100 p-3 rounded-lg border border-slate-300 text-xs mb-4">
                    <p><strong>Grand Total Marks:</strong> {grandTotal} / {maxPossible}</p>
                    <p><strong>Percentage:</strong> {avg.toFixed(1)}%</p>
                    <p><strong>Final Grade:</strong> <span className="text-blue-900 font-extrabold text-sm">{calculateGrade(avg)}</span></p>
                  </div>
                );
              })()}
            </div>

            <div className="text-center pt-3 border-t border-dashed border-slate-400">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                This is a computer-generated document. No signature is required.
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

