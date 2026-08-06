'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Users, CreditCard, FileSpreadsheet, LogOut } from 'lucide-react';

export default function Dashboard() {
  const [session, setSession] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Auth Check
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login');
      } else {
        setSession(session);
        fetchStudents();
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (!session) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-400 tracking-wider">🏫 EduAdmin</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <a href="#" className="flex items-center gap-3 bg-blue-600/20 text-blue-400 p-3 rounded-lg"><LayoutDashboard size={20}/> ড্যাশবোর্ড</a>
          <a href="#" className="flex items-center gap-3 hover:bg-slate-800 text-slate-300 p-3 rounded-lg transition"><Users size={20}/> স্টুডেন্ট লিস্ট</a>
          <a href="#" className="flex items-center gap-3 hover:bg-slate-800 text-slate-300 p-3 rounded-lg transition"><CreditCard size={20}/> আইডি কার্ড (শীঘ্রই)</a>
          <a href="#" className="flex items-center gap-3 hover:bg-slate-800 text-slate-300 p-3 rounded-lg transition"><FileSpreadsheet size={20}/> মার্কশিট (শীঘ্রই)</a>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="flex items-center gap-3 text-red-400 hover:bg-red-400/10 w-full p-3 rounded-lg transition">
            <LogOut size={20}/> লগ আউট
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">ড্যাশবোর্ড ওভারভিউ</h2>
            <p className="text-slate-500">স্বাগতম, {session.user.email}</p>
          </div>
          <button onClick={handleLogout} className="md:hidden bg-slate-200 p-2 rounded-md"><LogOut size={20}/></button>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="bg-blue-100 p-4 rounded-xl text-blue-600"><Users size={24}/></div>
            <div>
              <p className="text-slate-500 text-sm font-medium">মোট স্টুডেন্ট</p>
              <h3 className="text-2xl font-bold text-slate-800">{students.length} জন</h3>
            </div>
          </div>
        </div>

        {/* Student Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">সাম্প্রতিক স্টুডেন্ট তালিকা</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-sm">
                <tr>
                  <th className="p-4 font-semibold">রোল</th>
                  <th className="p-4 font-semibold">নাম</th>
                  <th className="p-4 font-semibold">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                    <td className="p-4 font-medium text-slate-700">{student.roll_no}</td>
                    <td className="p-4 text-slate-800">{student.name}</td>
                    <td className="p-4">
                      <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-xs font-medium">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
    }
          
