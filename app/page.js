'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Users, CreditCard, FileSpreadsheet, UserCheck, Key, LogOut, Edit, Save, Plus, School, Image, Phone, MapPin, Droplet, User, BookOpen, Trash2, Printer, X, Search, ArrowUpCircle } from 'lucide-react';

export default function Dashboard() {
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // School Profile
  const [school, setSchool] = useState({ school_name: '', address: '', phone: '', email: '' });
  const [editSchool, setEditSchool] = useState(false);

  // Global Class Filter & Search
  const [selectedClassFilter, setSelectedClassFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Student Form State
  const [formData, setFormData] = useState({
    id: null, name: '', rollNo: '', studentClass: 'Class 6', phone: '', bloodGroup: '', address: '', gender: 'Male', photoUrl: ''
  });
  const [isEditingStudent, setIsEditingStudent] = useState(false);

  // ID Card State
  const [selectedIdStudent, setSelectedIdStudent] = useState(null);

  // Mark Entry & Marksheet States
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.push('/login');
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, [router]);

  const fetchStudents = async () => {
    setLoading(true);
    const { data } = await supabase.from('students').select('*').order('student_class', { ascending: true }).order('roll_no', { ascending: true });
    setStudents(data || []);
    setLoading(false);
  };

  const fetchSchoolDetails = async () => {
    const { data } = await supabase.from('school_settings').select('*').eq('id', 1).single();
    if (data) setSchool(data);
  };

  const getNextRollForClass = (className) => {
    const classStudents = students.filter(s => s.student_class === className);
    if (classStudents.length === 0) return 1;
    const maxRoll = Math.max(...classStudents.map(s => s.roll_no));
    return maxRoll + 1;
  };

  const handleClassChangeInForm = (e) => {
    const cls = e.target.value;
    if (!isEditingStudent) {
      setFormData({ ...formData, studentClass: cls, rollNo: getNextRollForClass(cls) });
    } else {
      setFormData({ ...formData, studentClass: cls });
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.studentClass) return alert('নাম এবং ক্লাস পূরণ করা আবশ্যক!');

    if (isEditingStudent) {
      const { error } = await supabase.from('students').update({
        name: formData.name,
        student_class: formData.studentClass,
        phone: formData.phone,
        blood_group: formData.bloodGroup,
        address: formData.address,
        gender: formData.gender,
        photo_url: formData.photoUrl || 'https://via.placeholder.com/150'
      }).eq('id', formData.id);

      if (error) alert('আপডেট ব্যর্থ: ' + error.message);
      else {
        alert('স্টুডেন্টের তথ্য সফলভাবে আপডেট হয়েছে!');
        resetStudentForm();
        fetchStudents();
      }
    } else {
      const roll = getNextRollForClass(formData.studentClass);
      const { error } = await supabase.from('students').insert([{
        name: formData.name,
        roll_no: roll,
        student_class: formData.studentClass,
        phone: formData.phone,
        blood_group: formData.bloodGroup,
        address: formData.address,
        gender: formData.gender,
        photo_url: formData.photoUrl || 'https://via.placeholder.com/150',
        email: `student_${formData.studentClass}_${roll}@school.com`
      }]);

      if (error) alert('এরর: ' + error.message);
      else {
        alert(`সফলভাবে স্টুডেন্ট যুক্ত হয়েছে (রোল: #${roll})!`);
        resetStudentForm();
        fetchStudents();
      }
    }
  };

  const handleEditClick = (st) => {
    setFormData({
      id: st.id, name: st.name, rollNo: st.roll_no, studentClass: st.student_class,
      phone: st.phone || '', bloodGroup: st.blood_group || '', address: st.address || '', gender: st.gender || 'Male', photoUrl: st.photo_url || ''
    });
    setIsEditingStudent(true);
    setActiveTab('dashboard');
  };

  const handleDeleteStudent = async (id, className) => {
    if (confirm('আপনি কি নিশ্চিত এই স্টুডেন্টকে ডিলিট করতে চান? রোল স্বয়ংক্রিয়ভাবে আপডেট হয়ে যাবে।')) {
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (error) {
        alert('ডিলিট করা যায়নি: ' + error.message);
        return;
      }

      const remainingInClass = students.filter(s => s.student_class === className && s.id !== id);
      for (let i = 0; i < remainingInClass.length; i++) {
        await supabase.from('students').update({ roll_no: i + 1 }).eq('id', remainingInClass[i].id);
      }

      alert('স্টুডেন্ট মুছে ফেলা হয়েছে এবং রোল পুনঃবিন্যাস করা হয়েছে!');
      fetchStudents();
    }
  };

  const handleUpgradeClass = (currentClass) => {
    const nextClassMap = { 'Class 6': 'Class 7', 'Class 7': 'Class 8', 'Class 8': 'Class 9', 'Class 9': 'Class 10', 'Class 10': 'Graduated' };
    const targetClass = nextClassMap[currentClass] || 'Higher Class';

    if (confirm(`আপনি কি ${currentClass} এর সকল স্টুডেন্টকে ${targetClass} এ প্রমোট করতে চান?`)) {
      const classSts = students.filter(s => s.student_class === currentClass);
      Promise.all(classSts.map(async (st, idx) => {
        await supabase.from('students').update({ student_class: targetClass, roll_no: idx + 1 }).eq('id', st.id);
      })).then(() => {
        alert('ক্লাস সফলভাবে আপগ্রেড করা হয়েছে!');
        fetchStudents();
      });
    }
  };

  const resetStudentForm = () => {
    setFormData({ id: null, name: '', rollNo: getNextRollForClass('Class 6'), studentClass: 'Class 6', phone: '', bloodGroup: '', address: '', gender: 'Male', photoUrl: '' });
    setIsEditingStudent(false);
  };

  const handleUpdateSchool = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('school_settings').update(school).eq('id', 1);
    if (error) alert(error.message);
    else {
      alert('স্কুলের তথ্য আপডেট হয়েছে!');
      setEditSchool(false);
    }
  };

  const filterStudentsList = (list) => {
    return list.filter(st => {
      const matchClass = selectedClassFilter === 'All' || st.student_class === selectedClassFilter;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchClass;
      const nameMatch = st.name.toLowerCase().includes(q) || st.name.toLowerCase().split('').some(char => q.includes(char));
      const rollMatch = st.roll_no.toString().includes(q);
      return matchClass && (nameMatch || rollMatch);
    });
  };

  const handleMarkChange = (studentId, subKey, type, val) => {
    setClassMarks(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [`${subKey}_${type}`]: parseInt(val) || 0
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (!session) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-medium">Loading EduAdmin...</div>;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-950 text-slate-100 font-sans">
      
      {/* LANDSCAPE A4 PRINTABLE MARKSHEET MODAL */}
      {printMarksheetData && (
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
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-72 bg-slate-900/80 backdrop-blur-xl border-r border-slate-800/80 p-6 flex flex-col justify-between print:hidden">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-3 rounded-2xl shadow-lg shadow-blue-500/20">
              <School className="text-white" size={26} />
            </div>
            <div>
              <h1 className="text-xl font-black bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                {school.school_name || 'EduAdmin'}
              </h1>
              <p className="text-xs text-slate-400">Smart School Portal</p>
            </div>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'dashboard', label: 'ড্যাশবোর্ড ও স্টুডেন্ট অ্যাড', icon: LayoutDashboard },
              { id: 'students', label: 'স্টুডেন্ট লিস্ট ও ক্লাস আপগ্রেড', icon: Users },
              { id: 'idcard', label: 'আইডি কার্ড জেনারেটর', icon: CreditCard },
              { id: 'marksheet', label: 'মার্কস এনট্রি ও মার্কশিট প্যানেল', icon: FileSpreadsheet },
              { id: 'profile', label: 'স্কুল প্রোফাইল', icon: UserCheck },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 scale-102'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800/80 space-y-2">
          <button onClick={() => router.push('/change-password')} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-white transition">
            <Key size={16} /> পাসওয়ার্ড পরিবর্তন
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition">
            <LogOut size={16} /> লগ আউট
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto print:hidden">
        
        {/* DASHBOARD TAB - ADD STUDENT */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            <header className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold">ওভারভিউ ও ভর্তি</h2>
                <p className="text-slate-400 text-sm mt-1">অটোমেটিক রোল জেনারেটর সিস্টেম সক্রিয়</p>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-lg p-6 rounded-2xl shadow-xl flex items-center gap-4">
                <div className="p-4 bg-blue-500/10 text-blue-400 rounded-xl"><Users size={28} /></div>
                <div>
                  <p className="text-xs text-slate-400">মোট স্টুডেন্ট</p>
                  <h3 className="text-3xl font-black text-white">{students.length} জন</h3>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-lg p-6 md:p-8 rounded-2xl shadow-xl">
              <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold flex items-center gap-2 text-blue-400">
                  <Plus size={22}/> {isEditingStudent ? 'স্টুডেন্টের তথ্য পরিবর্তন করুন' : 'নতুন স্টুডেন্ট ভর্তি করুন'}
                </h3>
                {isEditingStudent && (
                  <button onClick={resetStudentForm} className="text-xs bg-slate-800 px-3 py-1.5 rounded-lg text-slate-300">
                    <X size={14}/> বাতিল
                  </button>
                )}
              </div>
              
              <form onSubmit={handleSaveStudent} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 mb-2 block">ক্লাস সিলেক্ট করুন *</label>
                    <select name="studentClass" value={formData.studentClass} onChange={handleClassChangeInForm} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-white">
                      {['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'].map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                                          <label className="text-xs font-semibold text-slate-300 mb-2 block">অটো রোল নম্বর</label>
                    <input type="text" value={`#${formData.rollNo || getNextRollForClass(formData.studentClass)} (Auto Assigned)`} disabled className="w-full bg-slate-900 border border-slate-800 px-4 py-3 rounded-xl text-blue-400 font-bold" />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 mb-2 block">স্টুডেন্টের নাম *</label>
                    <input type="text" name="name" placeholder="যেমন: Amit Kumar" value={formData.name} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-white" required />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 mb-2 block">মোবাইল নম্বর</label>
                    <input type="text" name="phone" placeholder="+880 / +91 ..." value={formData.phone} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-white" />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 mb-2 block">ব্লাড গ্রুপ</label>
                    <select name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-white">
                      <option value="">সিলেক্ট করুন</option>
                      <option value="A+">A+</option><option value="A-">A-</option>
                      <option value="B+">B+</option><option value="B-">B-</option>
                      <option value="O+">O+</option><option value="O-">O-</option>
                      <option value="AB+">AB+</option><option value="AB-">AB-</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 mb-2 block">জেন্ডার</label>
                    <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-white">
                      <option value="Male">Male</option><option value="Female">Female</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-slate-300 mb-2 block">ফটো ইমেজ URL (Optional)</label>
                    <input type="url" name="photoUrl" placeholder="https://..." value={formData.photoUrl} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-white" />
                  </div>

                  <div className="md:col-span-3">
                    <label className="text-xs font-semibold text-slate-300 mb-2 block">ঠিকানা</label>
                    <input type="text" name="address" placeholder="শহর, জেলা..." value={formData.address} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-white" />
                  </div>
                </div>

                <button type="submit" className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3.5 rounded-xl font-bold shadow-lg">
                  {isEditingStudent ? 'আপডেট সেভ করুন' : 'স্টুডেন্ট ভর্তি করুন'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* STUDENTS LIST & CLASS UPGRADE TAB */}
        {activeTab === 'students' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-2xl font-bold">স্টুডেন্ট লিস্ট ও ক্লাস আপগ্রেড</h2>
              <div className="flex gap-3">
                <select value={selectedClassFilter} onChange={(e) => setSelectedClassFilter(e.target.value)} className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-sm">
                  <option value="All">সকল ক্লাস</option>
                  {['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Graduated'].map(cls => <option key={cls} value={cls}>{cls}</option>)}
                </select>
                {selectedClassFilter !== 'All' && (
                  <button onClick={() => handleUpgradeClass(selectedClassFilter)} className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5">
                    <ArrowUpCircle size={16} /> {selectedClassFilter} আপগ্রেড করুন
                  </button>
                )}
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-3.5 text-slate-500" size={18} />
              <input
                type="text"
                placeholder="নাম বা রোল দিয়ে সার্চ করুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 pl-12 pr-4 py-3 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-800/50 text-slate-400 text-xs">
                    <tr>
                      <th className="p-4">রোল</th>
                      <th className="p-4">নাম</th>
                      <th className="p-4">ক্লাস</th>
                      <th className="p-4">ফোন</th>
                      <th className="p-4">রক্তের গ্রুপ</th>
                      <th className="p-4">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-sm">
                    {filterStudentsList(students).map((st) => (
                      <tr key={st.id} className="hover:bg-slate-800/30">
                        <td className="p-4 font-bold text-blue-400">#{st.roll_no}</td>
                        <td className="p-4 font-medium">{st.name}</td>
                        <td className="p-4"><span className="bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-lg text-xs">{st.student_class}</span></td>
                        <td className="p-4 text-slate-400">{st.phone || 'N/A'}</td>
                        <td className="p-4 text-rose-400 font-semibold">{st.blood_group || 'N/A'}</td>
                        <td className="p-4 flex gap-2">
                          <button onClick={() => handleEditClick(st)} className="bg-amber-500/10 text-amber-400 p-2 rounded-lg hover:bg-amber-500/20"><Edit size={16} /></button>
                          <button onClick={() => handleDeleteStudent(st.id, st.student_class)} className="bg-red-500/10 text-red-400 p-2 rounded-lg hover:bg-red-500/20"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ID CARD TAB */}
        {activeTab === 'idcard' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold">আইডি কার্ড জেনারেটর</h2>
            <select onChange={(e) => setSelectedIdStudent(students.find(s => s.id === e.target.value))} className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-white">
              <option value="">স্টুডেন্ট সিলেক্ট করুন</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name} (Class: {s.student_class} - Roll: #{s.roll_no})</option>)}
            </select>

            {selectedIdStudent && (
              <div className="w-80 bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 border border-indigo-500/30 p-6 rounded-3xl shadow-2xl text-center border-t-4 border-t-blue-500">
                <h3 className="font-extrabold text-blue-300 text-lg">{school.school_name}</h3>
                <p className="text-[10px] text-slate-400">{school.address}</p>
                <img src={selectedIdStudent.photo_url || 'https://via.placeholder.com/150'} alt="" className="w-24 h-24 rounded-full mx-auto my-4 object-cover border-2 border-blue-400" />
                <h4 className="font-bold text-xl text-white">{selectedIdStudent.name}</h4>
                <p className="text-xs text-blue-400 font-semibold mb-4">{selectedIdStudent.student_class} | Roll: #{selectedIdStudent.roll_no}</p>
                <div className="text-left text-xs space-y-1.5 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80 text-slate-300">
                  <p><strong>Blood:</strong> <span className="text-rose-400 font-bold">{selectedIdStudent.blood_group || 'N/A'}</span></p>
                  <p><strong>Phone:</strong> {selectedIdStudent.phone || 'N/A'}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MARK ENTRY & MARKSHEET PANEL */}
        {activeTab === 'marksheet' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold">ক্লাস-ভিত্তিক মার্ক্স এনট্রি ও মার্কশিট জেনারেটর</h2>
                <p className="text-xs text-slate-400 mt-1">প্রথমে ক্লাস ও পরীক্ষা সিলেক্ট করে রোল অনুযায়ী নম্বর প্রদান করুন</p>
              </div>
              <div className="flex gap-3">
                <select value={markClassSelect} onChange={(e) => setMarkClassSelect(e.target.value)} className="bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl text-sm">
                  {['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'].map(cls => <option key={cls} value={cls}>{cls}</option>)}
                </select>
                <input type="text" value={examName} onChange={(e) => setExamName(e.target.value)} className="bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl text-sm text-white" placeholder="Exam Name" />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setPrintMarksheetData(students.filter(s => s.student_class === markClassSelect))}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2"
              >
                <Printer size={18} /> সম্পূর্ণ ক্লাসের মার্কশিট একসাথে জেনারেট করুন ({markClassSelect})
              </button>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/60 text-slate-300">
                    <tr>
                      <th className="p-3">রোল ও নাম</th>
                      <th className="p-3 text-center">বাংলা (Oral [20] | Theory [80])</th>
                      <th className="p-3 text-center">ইংরেজি (Oral [20] | Theory [80])</th>
                      <th className="p-3 text-center">গণিত (Oral [20] | Theory [80])</th>
                      <th className="p-3 text-center">বিজ্ঞান (Oral [20] | Theory [80])</th>
                      <th className="p-3 text-center">একক মার্কশিট</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {students.filter(s => s.student_class === markClassSelect).map((st) => {
                      const m = classMarks[st.id] || {};
                      return (
                        <tr key={st.id} className="hover:bg-slate-800/30">
                          <td className="p-3 font-medium">
                            <span className="text-blue-400 font-bold">#{st.roll_no}</span> - {st.name}
                          </td>
                          {['bangla', 'english', 'math', 'science'].map(sub => (
                            <td key={sub} className="p-3 text-center">
                              <div className="flex gap-1 justify-center">
                                <input type="number" placeholder="Oral" value={m[`${sub}_oral`] || ''} onChange={(e) => handleMarkChange(st.id, sub, 'oral', e.target.value)} className="w-14 bg-slate-950 border border-slate-800 text-center p-1.5 rounded" />
                                <input type="number" placeholder="Theory" value={m[`${sub}_theory`] || ''} onChange={(e) => handleMarkChange(st.id, sub, 'theory', e.target.value)} className="w-14 bg-slate-950 border border-slate-800 text-center p-1.5 rounded" />
                              </div>
                            </td>
                          ))}
                          <td className="p-3 text-center">
                            <button onClick={() => setPrintMarksheetData([st])} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold">
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
        )}

        {/* SCHOOL PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">স্কুল প্রোফাইল</h2>
              <button onClick={() => setEditSchool(!editSchool)} className="bg-slate-800 px-4 py-2 rounded-xl text-xs font-semibold">
                {editSchool ? 'বাতিল' : 'এডিট করুন'}
              </button>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl space-y-4 max-w-xl shadow-xl">
              {editSchool ? (
                <form onSubmit={handleUpdateSchool} className="space-y-4">
                  <input type="text" value={school.school_name} onChange={(e) => setSchool({ ...school, school_name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white" />
                  <input type="text" value={school.address} onChange={(e) => setSchool({ ...school, address: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white" />
                  <input type="text" value={school.phone} onChange={(e) => setSchool({ ...school, phone: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white" />
                  <button type="submit" className="bg-emerald-600 px-6 py-3 rounded-xl font-bold">সেভ করুন</button>
                </form>
              ) : (
                <div className="space-y-3">
                  <div><p className="text-xs text-slate-400">নাম</p><p className="font-bold text-lg">{school.school_name}</p></div>
                  <div><p className="text-xs text-slate-400">ঠিকানা</p><p>{school.address}</p></div>
                  <div><p className="text-xs text-slate-400">ফোন</p><p>{school.phone}</p></div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
                }
