/* eslint-disable */
'use client';

import { useState, useEffect } from 'react';
// আপনার supabase ফাইলটি যেখানে আছে, সেই অনুযায়ী নিচের পাথটি ঠিক করে নেবেন
import { supabase } from '../../lib/supabase'; 
import { useRouter } from 'next/navigation';
// ফিক্স: এখানে 'Calendar' আইকনটি যুক্ত করা হয়েছে
import { School, User, Lock, Phone, Mail, Loader2, ShieldCheck, GraduationCap, Briefcase, AlertCircle, Calendar } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  
  const [loginType, setLoginType] = useState('admin'); 
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  const [email, setEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  
  const [uniqueId, setUniqueId] = useState('');
  const [dob, setDob] = useState('');

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const localTeacher = localStorage.getItem('teacher_session');
      const localStudent = localStorage.getItem('student_session');
      
      if (session || localTeacher || localStudent) {
        router.push('/');
      }
    };
    checkSession();
  }, [router]);

  const handleTeacherLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true); setErrorMsg('');

    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('phone', phone)
        .eq('password', password)
        .single();

      if (error || !data) {
        setErrorMsg('Invalid Phone Number or Password!');
        setIsLoading(false);
        return;
      }

      if (data.status !== 'Active') {
        setErrorMsg('Your account is inactive. Contact Admin.');
        setIsLoading(false);
        return;
      }

      localStorage.setItem('teacher_session', JSON.stringify(data));
      router.push('/'); 
    } catch (err) {
      setErrorMsg('Something went wrong. Please try again.');
    }
    setIsLoading(false);
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true); setErrorMsg('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: adminPassword,
      });

      if (error) {
        setErrorMsg('Invalid Admin Email or Password!');
        setIsLoading(false);
        return;
      }

      router.push('/');
    } catch (err) {
      setErrorMsg('Something went wrong.');
    }
    setIsLoading(false);
  };

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true); setErrorMsg('');

    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('unique_id', uniqueId)
        .eq('dob', dob)
        .single();

      if (error || !data) {
        setErrorMsg('Invalid Unique ID or Date of Birth!');
        setIsLoading(false);
        return;
      }

      if (data.status !== 'Active') {
        setErrorMsg('Your account is no longer active.');
        setIsLoading(false);
        return;
      }

      localStorage.setItem('student_session', JSON.stringify(data));
      router.push('/');
    } catch (err) {
      setErrorMsg('Something went wrong. Try again.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-slate-200">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md relative z-10">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-xl mx-auto flex items-center justify-center shadow-lg mb-4">
            <School size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="text-sm text-slate-400 mt-1">Please login to your account</p>
        </div>

        <div className="flex bg-slate-950 p-1 rounded-xl mb-6 border border-slate-800">
           <button onClick={() => {setLoginType('admin'); setErrorMsg('');}} className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${loginType === 'admin' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-white'}`}>Admin</button>
           <button onClick={() => {setLoginType('teacher'); setErrorMsg('');}} className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${loginType === 'teacher' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-white'}`}>Teacher</button>
           <button onClick={() => {setLoginType('student'); setErrorMsg('');}} className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${loginType === 'student' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-white'}`}>Student</button>
        </div>

        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-lg text-sm font-semibold text-center mb-6 flex items-center justify-center gap-2">
            <AlertCircle size={16} /> {errorMsg}
          </div>
        )}

        {loginType === 'admin' && (
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-500" size={16} />
                <input type="email" placeholder="admin@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 rounded-lg text-white outline-none focus:border-blue-500" required />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-500" size={16} />
                <input type="password" placeholder="••••••••" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 rounded-lg text-white outline-none focus:border-blue-500" required />
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-bold transition flex justify-center items-center gap-2 mt-2">
              {isLoading ? <Loader2 className="animate-spin" size={18}/> : 'Login to Admin Panel'}
            </button>
          </form>
        )}

        {loginType === 'teacher' && (
          <form onSubmit={handleTeacherLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 text-slate-500" size={16} />
                <input type="text" placeholder="Enter phone number" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 rounded-lg text-white outline-none focus:border-blue-500" required />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-500" size={16} />
                <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 rounded-lg text-white outline-none focus:border-blue-500" required />
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-bold transition flex justify-center items-center gap-2 mt-2">
              {isLoading ? <Loader2 className="animate-spin" size={18}/> : 'Login to Teacher Panel'}
            </button>
          </form>
        )}

        {loginType === 'student' && (
          <form onSubmit={handleStudentLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Unique ID</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-slate-500" size={16} />
                <input type="text" placeholder="Enter Unique ID" value={uniqueId} onChange={(e) => setUniqueId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 rounded-lg text-white outline-none focus:border-blue-500" required />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Date of Birth</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 text-slate-500" size={16} />
                <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 rounded-lg text-white outline-none focus:border-blue-500" required />
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-bold transition flex justify-center items-center gap-2 mt-2">
              {isLoading ? <Loader2 className="animate-spin" size={18}/> : 'Login to Student Portal'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
          }
