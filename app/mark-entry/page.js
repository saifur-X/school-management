'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Printer, X, Save, CheckCircle2 } from 'lucide-react';

export default function MarkEntryPage() {
  const [selectedClass, setSelectedClass] = useState('Class 1');
  const [examName, setExamName] = useState('Annual Examination 2026');
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [marks, setMarks] = useState({});
  const [school, setSchool] = useState({});
  const [printData, setPrintData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  const router = useRouter();

  useEffect(() => {
    fetchClassData();
    fetchSchool();
  }, [selectedClass, examName]);

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

    const { data: savedMarksData } = await supabase.from('marksheets').select('*').eq('class_name', selectedClass).eq('exam_name', examName);

    if (savedMarksData && savedMarksData.length > 0) {
      const loadedMarksObj = {};
      savedMarksData.forEach(row => { loadedMarksObj[row.student_id] = row.marks_data; });
      setMarks(loadedMarksObj);
    } else { setMarks({}); }
  };

  const handleMarkChange = (stId, subName, type, val, maxMark) => {
    let numVal = val === '' ? '' : parseInt(val);
    if (numVal !== '' && numVal > maxMark) { alert(`সর্বোচ্চ নম্বর ${maxMark}!`); numVal = maxMark; } 
    else if (numVal !== '' && numVal < 0) { numVal = 0; }

    setMarks(prev => ({ ...prev, [stId]: { ...(prev[stId] || {}), [`${subName}_${type}`]: numVal } }));
  };

  const handleAutoSave = async (stId) => {
    const studentMarks = marks[stId];
    if (!studentMarks) return;
    setSaveStatus('Saving...');
    await supabase.from('marksheets').upsert([{ student_id: stId, class_name: selectedClass, exam_name: examName, marks_data: studentMarks }], { onConflict: 'student_id,exam_name' });
    setSaveStatus('Saved!'); setTimeout(() => setSaveStatus(''), 2000);
  };

  const calculateGrade = (avg) => {
    if (avg >= 80) return 'A+'; if (avg >= 70) return 'A'; if (avg >= 60) return 'A-';
    if (avg >= 50) return 'B'; if (avg >= 40) return 'C'; return 'F';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      
      {/* PERFECT A4 LANDSCAPE CENTERED CSS */}
      <style jsx global>{`
        @media print {
          @page { size: A4 landscape; margin: 0; }
          html, body {
            margin: 0 !important; padding: 0 !important;
            width: 100% !important; height: 100% !important;
            background: white !important; color: black !important;
          }
          .no-print { display: none !important; }
          .print-wrapper {
            width: 297mm !important; height: 209mm !important;
            margin: 0 auto !important;
            display: flex !important; justify-content: center !important; align-items: center !important;
            page-break-after: always !important;
            page-break-inside: avoid !important;
            overflow: hidden !important;
          }
          .print-card {
            width: 277mm !important; height: 189mm !important;
            border: 3px solid #0f172a !important; border-radius: 12px !important;
            padding: 20px !important; box-sizing: border-box !important;
            display: flex !important; flex-direction: column !important; justify-content: space-between !important;
          }
        }
      `}</style>

      {printData && (
        <div className="fixed inset-0 bg-white text-slate-900 z-50 overflow-y-auto p-4 print:p-0 print:overflow-hidden flex flex-col items-center">
          
          <div className="max-w-5xl w-full flex justify-between items-center mb-4 no-print">
            <button onClick={() => setPrintData(null)} className="bg-slate-200 text-slate-800 px-4 py-2 rounded-lg font-bold text-sm"><X size={16} /> বন্ধ করুন</button>
            <button onClick={() => window.print()} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-sm"><Printer size={16} /> প্রিন্ট / Save PDF (A4 Landscape)</button>
          </div>

          {printData.map((st) => {
            const m = marks[st.id] || {};
            let grandTotal = 0; let maxTotal = subjects.length * 100;

            return (
              <div key={st.id} className="print-wrapper bg-white mb-8 print:mb-0">
                <div className="print-card bg-white border-4 border-slate-900 p-6 rounded-xl shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="text-center border-b-2 border-slate-900 pb-2 mb-3">
                      <h1 className="text-2xl font-black uppercase tracking-wider text-slate-900">{school.school_name || 'ISLAMIC NATIONAL SCHOOL'}</h1>
                      <p className="text-[11px] font-semibold text-slate-600">{school.address} | Contact: {school.phone}</p>
                      <div className="mt-1 inline-block bg-slate-900 text-white font-bold px-3 py-0.5 rounded text-[11px] uppercase tracking-wide">
                        OFFICIAL ACADEMIC TRANSCRIPT — {examName}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[11px] mb-3 bg-slate-100 p-2.5 rounded-lg border border-slate-300">
                      <p><strong>Student Name:</strong> {st.name}</p><p><strong>Roll No:</strong> #{st.roll_no}</p><p><strong>Class:</strong> {st.student_class}</p>
                      <p><strong>Gender:</strong> {st.gender || 'Male'}</p><p><strong>Blood Group:</strong> {st.blood_group || 'N/A'}</p><p><strong>Phone:</strong> {st.phone || 'N/A'}</p>
                    </div>

                    <table className="w-full text-left text-[11px] border-collapse border border-slate-900 mb-3">
                      <thead>
                        <tr className="bg-slate-200 text-slate-900 border-b border-slate-900">
                          <th className="p-2 border-r border-slate-900">Subject Name</th>
                          <th className="p-2 border-r border-slate-900 text-center">Oral (Max)</th><th className="p-2 border-r border-slate-900 text-center">Oral (Obt)</th>
                          <th className="p-2 border-r border-slate-900 text-center">Theory (Max)</th><th className="p-2 border-r border-slate-900 text-center">Theory (Obt)</th>
                          <th className="p-2 border-r border-slate-900 text-center">Total (100)</th><th className="p-2 text-center">Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subjects.map((sub, idx) => {
                          const oral = Number(m[`${sub.name}_oral`]) || 0; const theory = Number(m[`${sub.name}_theory`]) || 0;
                          const total = oral + theory; grandTotal += total;
                          return (
                            <tr key={idx} className="border-b border-slate-900">
                              <td className="p-2 border-r border-slate-900 font-bold">{sub.name}</td>
                              <td className="p-2 border-r border-slate-900 text-center">{sub.oral}</td><td className="p-2 border-r border-slate-900 text-center font-medium">{oral}</td>
                              <td className="p-2 border-r border-slate-900 text-center">{sub.theory}</td><td className="p-2 border-r border-slate-900 text-center font-medium">{theory}</td>
                              <td className="p-2 border-r border-slate-900 text-center font-black">{total}</td><td className="p-2 text-center font-black text-blue-800">{calculateGrade(total)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    <div className="flex justify-between items-center bg-slate-100 p-2.5 rounded-lg border border-slate-300 text-[11px]">
                      <p><strong>Grand Total Marks:</strong> {grandTotal} / {maxTotal}</p>
                      <p><strong>Percentage:</strong> {(grandTotal / (subjects.length || 1)).toFixed(1)}%</p>
                      <p><strong>Final Grade:</strong> <span className="text-blue-900 font-black text-xs">{calculateGrade(grandTotal / (subjects.length || 1))}</span></p>
                    </div>
                  </div>
                  <div className="text-center pt-2 border-t border-dashed border-slate-400 mt-2">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">This is a computer-generated document. No signature is required.</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Main Mark Entry Content stays exactly the same as previously formatted */}
      <div className="no-print space-y-6">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => router.push('/')} className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-800 transition">
            <ArrowLeft size={16} /> ড্যাশবোর্ডে ফিরে যান
          </button>
          {saveStatus && (<div className="flex items-center gap-2 text-emerald-400 font-bold bg-emerald-500/10 px-4 py-2 rounded-xl text-sm animate-pulse"><CheckCircle2 size={18} /> {saveStatus}</div>)}
          <h1 className="text-2xl font-bold text-blue-400 hidden md:block">Class-wise Mark Entry Auto-Save Panel</h1>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-6 shadow-2xl">
          <div className="flex flex-col md:flex-row gap-4 justify-between bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex gap-4 flex-1">
              <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="bg-slate-900 border border-slate-700 p-3 rounded-xl text-white font-bold">
                {['Class 1','Class 2','Class 3','Class 4','Class 5','Class 6','Class 7','Class 8','Class 9','Class 10','Class 11','Class 12'].map(cls => (<option key={cls} value={cls}>{cls}</option>))}
              </select>
              <input type="text" value={examName} onChange={(e) => setExamName(e.target.value)} className="bg-slate-900 border border-slate-700 p-3 rounded-xl text-white flex-1 font-bold" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setPrintData(students)} className="bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-xl font-bold text-xs transition">Bulk Marksheets ({selectedClass})</button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-800 text-slate-300">
                <tr>
                  <th className="p-3">রোল ও নাম</th>
                  {subjects.map((sub, idx) => (
                    <th key={idx} className="p-3 text-center border-l border-slate-700">{sub.name} <br/><span className="text-[10px] text-amber-400 font-medium">(Oral: {sub.oral} | Theory: {sub.theory})</span></th>
                  ))}
                  <th className="p-3 text-center border-l border-slate-700">একক মার্কশিট</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/40">
                {students.map((st) => {
                  const m = marks[st.id] || {};
                  return (
                    <tr key={st.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3 font-medium"><span className="text-blue-400 font-bold">#{st.roll_no}</span> - {st.name}</td>
                      {subjects.map((sub, idx) => (
                        <td key={idx} className="p-3 text-center border-l border-slate-800">
                          <div className="flex gap-1 justify-center">
                            <input type="number" placeholder="O" value={m[`${sub.name}_oral`] !== undefined ? m[`${sub.name}_oral`] : ''} onChange={(e) => handleMarkChange(st.id, sub.name, 'oral', e.target.value, sub.oral)} onBlur={() => handleAutoSave(st.id)} className="w-14 bg-slate-950 border border-slate-700 text-center p-1.5 rounded-lg font-bold" />
                            <input type="number" placeholder="T" value={m[`${sub.name}_theory`] !== undefined ? m[`${sub.name}_theory`] : ''} onChange={(e) => handleMarkChange(st.id, sub.name, 'theory', e.target.value, sub.theory)} onBlur={() => handleAutoSave(st.id)} className="w-14 bg-slate-950 border border-slate-700 text-center p-1.5 rounded-lg font-bold" />
                          </div>
                        </td>
                      ))}
                      <td className="p-3 text-center border-l border-slate-800"><button onClick={() => setPrintData([st])} className="bg-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold">মার্কশিট</button></td>
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
