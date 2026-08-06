'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Users, CreditCard, FileSpreadsheet, UserCheck, Key, LogOut, Edit, Save, Plus, School } from 'lucide-react';

export default function Dashboard() {
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Student Form
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');

  // School Profile
  const [school, setSchool] = useState({ school_name: '', address: '', phone: '', email: '' });
  const [editSchool, setEditSchool] = useState(false);

  // ID Card Selection
  const [selectedStudent, setSelectedStudent] = useState(null);

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
    const { data } = await supabase.from('students').select('*').order('roll_no', { ascending: true });
    setStudents(data || []);
    setLoading(false);
  };

  const fetchSchoolDetails = async () => {
    const { data } = await supabase.from('school_settings').select('*').eq('id', 1).single();
    if (data) setSchool(data);
  };

  const handleUpdateSchool = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('school_settings').update(school).eq('id', 1);
    if (error) alert(error.message);
    else {
      alert('স্কুলের তথ্য সফলভাবে আপডেট হয়েছে!');
      setEditSchool(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!name || !rollNo) return alert('সব ফিল্ড পূরণ করুন!');

    const { error } = await supabase.from('students').insert([
      { name, roll_no: parseInt(rollNo), email: `student_${rollNo}@school.com` }
    ]);

    if (error) alert('এরর: ' + error.message);
    else {
      setName('');
      setRollNo('');
      fetchStudents();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (!session) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-72 bg-slate-900/80 backdrop-blur-xl border-r border-slate-800 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-3 rounded-2xl shadow-lg shadow-blue-500/30">
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
              { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
              { id: 'students', label: 'স্টুডেন্ট লিস্ট', icon: Users },
              { id: 'idcard', label: 'আইডি কার্ড জেনারেটর', icon: CreditCard },
              { id: 'marksheet', label: 'মার্কশিট প্যানেল', icon: FileSpreadsheet },
              { id: 'profile', label: 'স্কুল প্রোফাইল', icon: UserCheck },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 scale-105'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
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
          <button
            onClick={() => router.push('/change-password')}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <Key size={16} /> পাসওয়ার্ড পরিবর্তন
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition"
          >
            <LogOut size={16} /> লগ আউট
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            <header className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold">ওভারভিউ</h2>
                <p className="text-slate-400 text-sm mt-1">এডমিন: saifurrahaman.me@gmail.com</p>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900/60 border border-slate-800 backdrop-blur-lg p-6 rounded-2xl shadow-xl flex items-center gap-4">
                <div className="p-4 bg-blue-500/10 text-blue-400 rounded-xl"><Users size={28} /></div>
                <div>
                  <p className="text-xs text-slate-400">মোট স্টুডেন্ট</p>
                  <h3 className="text-3xl font-black text-white">{students.length} জন</h3>
                </div>
              </div>
            </div>

            {/* Quick Add Form */}
            <div className="bg-slate-900/60 border border-slate-800 backdrop-blur-lg p-6 rounded-2xl">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-400"><Plus size={20}/> নতুন স্টুডেন্ট যোগ করুন</h3>
              <form onSubmit={handleAddStudent} className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  placeholder="স্টুডেন্টের নাম"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl flex-1 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="number"
                  placeholder="রোল নম্বর"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  className="bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl md:w-36 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 rounded-xl font-bold hover:opacity-90 transition">
                  অ্যাড করুন
                </button>
              </form>
            </div>
          </div>
        )}

        {/* STUDENTS TAB */}
        {activeTab === 'students' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold">স্টুডেন্টদের তালিকা</h2>
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-800/50 text-slate-400 text-xs">
                  <tr>
                    <th className="p-4">রোল</th>
                    <th className="p-4">নাম</th>
                    <th className="p-4">ইমেইল</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {students.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-800/30">
                      <td className="p-4 font-bold text-blue-400">#{st.roll_no}</td>
                      <td className="p-4 font-medium">{st.name}</td>
                      <td className="p-4 text-slate-400">{st.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ID CARD TAB */}
        {activeTab === 'idcard' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold">আর্টিফিশিয়াল আইডি কার্ড জেনারেটর</h2>
            <div className="flex gap-4">
              <select
                onChange={(e) => setSelectedStudent(students.find(s => s.id === e.target.value))}
                className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-white"
              >
                <option value="">স্টুডেন্ট সিলেক্ট করুন</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name} (Roll: {s.roll_no})</option>)}
              </select>
            </div>

            {selectedStudent && (
              <div className="w-80 h-auto bg-gradient-to-br from-indigo-900 via-slate-900 to-blue-900 border border-indigo-500/30 p-6 rounded-3xl shadow-2xl relative overflow-hidden text-center border-t-4 border-t-blue-500">
                <h3 className="font-extrabold text-blue-300 tracking-wide text-lg">{school.school_name}</h3>
                <p className="text-[10px] text-slate-400">{school.address}</p>

                <div className="w-20 h-20 bg-slate-800 border-2 border-blue-400 rounded-full mx-auto my-4 flex items-center justify-center font-bold text-2xl text-blue-400">
                  {selectedStudent.name[0]}
                </div>

                <h4 className="font-bold text-xl text-white">{selectedStudent.name}</h4>
                <p className="text-xs text-blue-400 font-semibold mb-4">Roll No: {selectedStudent.roll_no}</p>

                <div className="text-left text-xs space-y-1 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-slate-300">
                  <p><strong>Email:</strong> {selectedStudent.email}</p>
                  <p><strong>Phone:</strong> {school.phone}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MARKSHEET TAB */}
        {activeTab === 'marksheet' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold">মার্কশিট জেনারেটর</h2>
            <p className="text-slate-400">পরীক্ষার সাবজেক্ট নম্বর প্রদান করে মার্কশিট তৈরির প্যানেল শীঘ্রই যুক্ত হচ্ছে।</p>
          </div>
        )}

        {/* SCHOOL PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">স্কুল প্রোফাইল ও সেটিংস</h2>
              <button
                onClick={() => setEditSchool(!editSchool)}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl text-xs font-semibold"
              >
                <Edit size={16} /> {editSchool ? 'বাতিল' : 'এডিট করুন'}
              </button>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-4 max-w-xl">
              {editSchool ? (
                <form onSubmit={handleUpdateSchool} className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">স্কুলের নাম</label>
                    <input
                      type="text"
                      value={school.school_name}
                      onChange={(e) => setSchool({ ...school, school_name: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">ঠিকানা</label>
                    <input
                      type="text"
                      value={school.address}
                      onChange={(e) => setSchool({ ...school, address: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">ফোন নম্বর</label>
                    <input
                      type="text"
                      value={school.phone}
                      onChange={(e) => setSchool({ ...school, phone: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white"
                    />
                  </div>
                  <button type="submit" className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 px-6 py-3 rounded-xl text-sm font-bold">
                    <Save size={16} /> সেভ করুন
                  </button>
                </form>
              ) : (
                <div className="space-y-3">
                  <div><p className="text-xs text-slate-400">স্কুলের নাম</p><p className="font-bold text-lg">{school.school_name}</p></div>
                  <div><p className="text-xs text-slate-400">ঠিকানা</p><p className="font-medium">{school.address}</p></div>
                  <div><p className="text-xs text-slate-400">ফোন</p><p className="font-medium">{school.phone}</p></div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
                    }
                  
