'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import MarksheetView from '../components/MarksheetView';
import { Users, Plus, Edit, Trash2, Printer, Search, ArrowUpCircle, X } from 'lucide-react';

export default function Dashboard() {
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState([]);
  const [school, setSchool] = useState({ school_name: '', address: '', phone: '' });
  const [editSchool, setEditSchool] = useState(false);
  const [selectedClassFilter, setSelectedClassFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({ id: null, name: '', rollNo: 1, studentClass: 'Class 6', phone: '', bloodGroup: '', address: '', gender: 'Male', photoUrl: '' });
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [selectedIdStudent, setSelectedIdStudent] = useState(null);

  const [markClassSelect, setMarkClassSelect] = useState('Class 6');
  const [examName, setExamName] = useState('Annual Examination 2026');
  const [classMarks, setClassMarks] = useState({});
  const [printMarksheetData, setPrintMarksheetData] = useState(null);

  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login');
      else {
        setSession(session);
        fetchStudents();
        fetchSchoolDetails();
      }
    });
  }, [router]);

  const fetchStudents = async () => {
    const { data } = await supabase.from('students').select('*').order('student_class', { ascending: true }).order('roll_no', { ascending: true });
    setStudents(data || []);
  };

  const fetchSchoolDetails = async () => {
    const { data } = await supabase.from('school_settings').select('*').eq('id', 1).single();
    if (data) setSchool(data);
  };

  const getNextRollForClass = (cls) => {
    const classSts = students.filter(s => s.student_class === cls);
    return classSts.length === 0 ? 1 : Math.max(...classSts.map(s => s.roll_no)) + 1;
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    if (isEditingStudent) {
      await supabase.from('students').update({ name: formData.name, student_class: formData.studentClass, phone: formData.phone, blood_group: formData.bloodGroup, gender: formData.gender, photo_url: formData.photoUrl }).eq('id', formData.id);
    } else {
      const roll = getNextRollForClass(formData.studentClass);
      await supabase.from('students').insert([{ name: formData.name, roll_no: roll, student_class: formData.studentClass, phone: formData.phone, blood_group: formData.bloodGroup, gender: formData.gender, photo_url: formData.photoUrl }]);
    }
    setFormData({ id: null, name: '', rollNo: 1, studentClass: 'Class 6', phone: '', bloodGroup: '', address: '', gender: 'Male', photoUrl: '' });
    setIsEditingStudent(false);
    fetchStudents();
  };

  const handleDeleteStudent = async (id, className) => {
    if (confirm('স্টুডেন্ট মুছে ফেলতে চান?')) {
      await supabase.from('students').delete().eq('id', id);
      const remaining = students.filter(s => s.student_class === className && s.id !== id);
      for (let i = 0; i < remaining.length; i++) {
        await supabase.from('students').update({ roll_no: i + 1 }).eq('id', remaining[i].id);
      }
      fetchStudents();
    }
  };

  const calculateGrade = (avg) => {
    if (avg >= 80) return 'A+';
    if (avg >= 70) return 'A';
    if (avg >= 60) return 'A-';
    if (avg >= 50) return 'B';
    if (avg >= 40) return 'C';
    return 'F';
  };

  if (!session) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-950 text-slate-100 font-sans">
      <MarksheetView school={school} examName={examName} printMarksheetData={printMarksheetData} setPrintMarksheetData={setPrintMarksheetData} classMarks={classMarks} calculateGrade={calculateGrade} />
      <Navbar school={school} activeTab={activeTab} setActiveTab={setActiveTab} router={router} handleLogout={() => supabase.auth.signOut().then(() => router.push('/login'))} />

      <main className="flex-1 p-6 md:p-10 overflow-y-auto print:hidden">
        {/* TAB CONTENT IMPLEMENTATION */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">ওভারভিউ</h2>
            <form onSubmit={handleSaveStudent} className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-xl font-bold text-blue-400">{isEditingStudent ? 'আপডেট করুন' : 'নতুন ভর্তি'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="text" placeholder="নাম" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-white" required />
                <select value={formData.studentClass} onChange={(e) => setFormData({ ...formData, studentClass: e.target.value })} className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-white">
                  {['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'].map(cls => <option key={cls} value={cls}>{cls}</option>)}
                </select>
                <input type="text" placeholder="ফোন" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-white" />
              </div>
              <button type="submit" className="bg-blue-600 px-6 py-3 rounded-xl font-bold">সেভ করুন</button>
            </form>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">স্টুডেন্ট তালিকা</h2>
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              {students.map(st => (
                <div key={st.id} className="flex justify-between items-center p-3 border-b border-slate-800">
                  <p>#{st.roll_no} - {st.name} ({st.student_class})</p>
                  <button onClick={() => handleDeleteStudent(st.id, st.student_class)} className="text-red-400 p-2"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'marksheet' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">মার্কশিট প্যানেল</h2>
            <button onClick={() => setPrintMarksheetData(students.filter(s => s.student_class === markClassSelect))} className="bg-emerald-600 px-6 py-3 rounded-xl font-bold flex items-center gap-2">
              <Printer size={18} /> ক্লাসের মার্কশিট জেনারেট করুন ({markClassSelect})
            </button>
          </div>
        )}
      </main>
    </div>
  );
          }
          
