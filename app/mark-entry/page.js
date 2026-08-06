'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Printer, X } from 'lucide-react';

export default function MarkEntryPage() {
  const [selectedClass, setSelectedClass] = useState('Class 1');
  const [examName, setExamName] = useState('Annual Examination 2026');
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [marks, setMarks] = useState({});
  const [school, setSchool] = useState({});
  const [printData, setPrintData] = useState(null);

  const router = useRouter();

  useEffect(() => {
    fetchClassData();
    fetchSchool();
  }, [selectedClass]);

  const fetchSchool = async () => {
    const { data } = await supabase.from('school_settings').select('*').eq('id', 1).single();
    if (data) setSchool(data);
  };

  const fetchClassData = async () => {
    const { data: configData } = await supabase.from('class_configs').select('subjects').eq('class_name', selectedClass).single();
    if (configData && configData.subjects) {
      setSubjects(configData.subjects);
    } else {
      setSubjects([{ name: 'Bangla', oral: 20, theory: 80 }, { name: 'English', oral: 20, theory: 80 }]);
    }

    const { data: studentData } = await supabase.from('students').select('*').eq('student_class', selectedClass).order('roll_no', { ascending: true });
    setStudents(studentData || []);
  };

  const handleMarkChange = (stId, subName, type, val) => {
    setMarks(prev => ({
      ...prev,
      [stId]: {
        ...(prev[stId] || {}),
        [`${subName}_${type}`]: parseInt(val) || 0
      }
    }));
  };

  const calculateGrade = (avg) => {
    if (avg >= 80) return 'A+';
    if (avg >= 70) return 'A';
    if (avg >= 60) return 'A-';
    if (avg >= 50) return 'B';
    if (avg >= 40) return 'C';
    return 'F';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      
      {/* Dynamic CSS Style for Perfect A4 Landscape Printing */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 0;
          }
          body {
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .print-container {
            width: 100vw !important;
            height: 100vh !important;
            padding: 15mm !important;
            margin: 0 !important;
            box-sizing: border-box !important;
            page-break-after: always;
            page-break-inside: avoid;
          }
        }
      `}</style>

      {/* Printable Landscape View */}
      {printData && (
        <div className="fixed inset-0 bg-white text-slate-900 z-50 overflow-y-auto p-4 print:p-0 print:overflow-hidden">
          
          <div className="max-w-5xl mx-auto flex justify-between items-center mb-4 no-print">
            <button onClick={() => setPrintData(null)} className="bg-slate-200 text-slate-800 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-1">
              <X size={16} /> বন্ধ করুন
            </button>
            <button onClick={() => window.print()} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg">
              <Printer size={16} /> প্রিন্ট / Save PDF (A4 Landscape)
            </button>
          </div>

          {printData.map((st) => {
            const m = marks[st.id] || {};
            let grandTotal = 0;
            let maxTotal = subjects.length * 100;

            return (
              <div key={st.id} className="print-container max-w-5xl mx-auto bg-white border-4 border-slate-900 p-8 rounded-xl shadow-xl flex flex-col justify-between mb-8 print:mb-0">
                <div>
                  {/* School Header */}
                  <div className="text-center border-b-2 border-slate-900 pb-3 mb-4">
                    <h1 className="text-3xl font-black uppercase tracking-wider text-slate-900">{school.school_name || 'ISLAMIC NATIONAL SCHOOL'}</h1>
                    <p className="text-xs font-semibold text-slate-600">{school.address} | Contact: {school.phone}</p>
                    <div className="mt-2 inline-block bg-slate-900 text-white font-bold px-4 py-1 rounded text-xs uppercase tracking-wide">
                      OFFICIAL ACADEMIC TRANSCRIPT — {examName}
                    </div>
                  </div>

                  {/* Student Details Grid */}
                  <div className="grid grid-cols-3 gap-3 text-xs mb-4 bg-slate-100 p-3 rounded-lg border border-slate-300">
                    <p><strong>Student Name:</strong> {st.name}</p>
                    <p><strong>Roll No:</strong> #{st.roll_no}</p>
                    <p><strong>Class:</strong> {st.student_class}</p>
                    <p><strong>Gender:</strong> {st.gender || 'Male'}</p>
                    <p><strong>Blood Group:</strong> {st.blood_group || 'N/A'}</p>
                    <p><strong>Phone:</strong> {st.phone || 'N/A'}</p>
                  </div>

                  {/* Subject Table */}
                  <table className="w-full text-left text-xs border-collapse border border-slate-900 mb-4">
                    <thead>
                      <tr className="bg-slate-200 text-slate-900 border-b border-slate-900">
                        <th className="p-2.5 border-r border-slate-900">Subject Name</th>
                        <th className="p-2.5 border-r border-slate-900 text-center">Oral Full Marks</th>
                        <th className="p-2.5 border-r border-slate-900 text-center">Oral Obtained</th>
                        <th className="p-2.5 border-r border-slate-900 text-center">Theory Full Marks</th>
                        <th className="p-2.5 border-r border-slate-900 text-center">Theory Obtained</th>
                        <th className="p-2.5 border-r border-slate-900 text-center">Total (100)</th>
                        <th className="p-2.5 text-center">Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjects.map((sub, idx) => {
                        const oral = m[`${sub.name}_oral`] || 0;
                        const theory = m[`${sub.name}_theory`] || 0;
                        const total = oral + theory;
                        grandTotal += total;
                        return (
                          <tr key={idx} className="border-b border-slate-900">
                            <td className="p-2.5 border-r border-slate-900 font-bold">{sub.name}</td>
                            <td className="p-2.5 border-r border-slate-900 text-center">{sub.oral}</td>
                            <td className="p-2.5 border-r border-slate-900 text-center font-medium">{oral}</td>
                            <td className="p-2.5 border-r border-slate-900 text-center">{sub.theory}</td>
                            <td className="p-2.5 border-r border-slate-900 text-center font-medium">{theory}</td>
                            <td className="p-2.5 border-r border-slate-900 text-center font-black">{total}</td>
                            <td className="p-2.5 text-center font-black text-blue-800">{calculateGrade(total)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Summary Box */}
                  <div className="flex justify-between items-center bg-slate-100 p-3 rounded-lg border border-slate-300 text-xs">
                    <p><strong>Grand Total Marks:</strong> {grandTotal} / {maxTotal}</p>
                    <p><strong>Percentage:</strong> {(grandTotal / subjects.length).toFixed(1)}%</p>
                    <p><strong>Final Grade:</strong> <span className="text-blue-900 font-black text-sm">{calculateGrade(grandTotal / subjects.length)}</span></p>
                  </div>
                </div>

                {/* Footer Disclaimer */}
                <div className="text-center pt-4 border-t border-dashed border-slate-400 mt-4">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    This is a computer-generated document. No signature is required.
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Main Panel Content */}
      <div className="no-print space-y-6">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => router.push('/')} className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-800">
            <ArrowLeft size={16} /> ড্যাশবোর্ডে ফিরে যান
          </button>
          <h1 className="text-2xl font-bold text-blue-400">Class-wise Dynamic Mark Entry Page</h1>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-white">
              {['Class 1','Class 2','Class 3','Class 4','Class 5','Class 6','Class 7','Class 8','Class 9','Class 10','Class 11','Class 12'].map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
            <input type="text" value={examName} onChange={(e) => setExamName(e.target.value)} className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-white flex-1" />
            <button onClick={() => setPrintData(students)} className="bg-emerald-600 px-6 py-3 rounded-xl font-bold text-xs">
              Generate Bulk Marksheets ({selectedClass})
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-800/80 text-slate-300">
                <tr>
                  <th className="p-3">রোল ও নাম</th>
                  {subjects.map((sub, idx) => (
                    <th key={idx} className="p-3 text-center border-l border-slate-700">
                      {sub.name} <br/>
                      <span className="text-[10px] text-slate-400">(Oral: {sub.oral} | Theory: {sub.theory})</span>
                    </th>
                  ))}
                  <th className="p-3 text-center border-l border-slate-700">একক মার্কশিট</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {students.map((st) => {
                  const m = marks[st.id] || {};
                  return (
                    <tr key={st.id} className="hover:bg-slate-800/30">
                      <td className="p-3 font-medium">#{st.roll_no} - {st.name}</td>
                      {subjects.map((sub, idx) => (
                        <td key={idx} className="p-3 text-center border-l border-slate-800">
                          <div className="flex gap-1 justify-center">
                            <input type="number" placeholder="O" value={m[`${sub.name}_oral`] || ''} onChange={(e) => handleMarkChange(st.id, sub.name, 'oral', e.target.value)} className="w-12 bg-slate-950 border border-slate-800 text-center p-1 rounded" />
                            <input type="number" placeholder="T" value={m[`${sub.name}_theory`] || ''} onChange={(e) => handleMarkChange(st.id, sub.name, 'theory', e.target.value)} className="w-12 bg-slate-950 border border-slate-800 text-center p-1 rounded" />
                          </div>
                        </td>
                      ))}
                      <td className="p-3 text-center border-l border-slate-800">
                        <button onClick={() => setPrintData([st])} className="bg-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold">
                          মার্কশিট
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
            }

