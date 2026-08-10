'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase'; // আপনার supabase ফাইলের সঠিক পাথ দিন
import { useRouter } from 'next/navigation';
import { School, User, Lock, Phone, Mail, Loader2, ArrowRight, ShieldCheck, GraduationCap, Briefcase } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  
  // Login Tabs: 'admin', 'teacher', 'student'
  const [loginType, setLoginType] = useState('teacher'); 
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form States
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  const [email, setEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  
  const [uniqueId, setUniqueId] = useState('');
  const [dob, setDob] = useState('');

  // Check if someone is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const localTeacher = localStorage.getItem('teacher_session');
      const localStudent = localStorage.getItem('student_session');
      
      if (session || localTeacher || localStudent) {
        router.push('/'); // অথবা আপনার ড্যাশবোর্ডের লিংকে রিডাইরেক্ট করুন (যেমন: '/dashboard')
      }
    };
    checkSession();
  }, [router]);

  // Handle Teacher Login
  const handleTeacherLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true); setErrorMsg('');

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

    // Save session and redirect
    localStorage.setItem('teacher_session', JSON.stringify(data));
    router.push('/'); 
  };

  // Handle Admin Login
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true); setErrorMsg('');

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
  };

  // Handle Student Login
  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true); setErrorMsg('');

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

    // Save session and redirect
    localStorage.setItem('student_session', JSON.stringify(data));
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-slate-200">
      
      {/* Background Decor */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl"></div>

      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md relative z-10">
        
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4">
            <School size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">EduAdmin Portal</h1>
          <p className="text-sm text-slate-400 mt-1">Please login to continue</p>
        </div>

        {/* Login Type Selection Tabs */}
        <div className="flex bg-slate-950 p-1.5 rounded-2xl mb-8 border border-slate-800">
          <button 
            onClick={() => {setLoginType('teacher'); setErrorMsg('');}} 
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${loginType === 'teacher' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>
            <Briefcase size={16}/> Teacher
          </button>
          <button 
            onClick={() => {setLoginType('student'); setErrorMsg('');}} 
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${loginType === 'student' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>
            <GraduationCap size={16}/> Student
          </button>
          <button 
            onClick={() => {setLoginType('admin'); setErrorMsg('');}} 
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${loginType === 'admin' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>
            <ShieldCheck size={16}/> Admin
          </button>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 p-3 rounded-xl text-sm font-bold text-center mb-6 flex items-center justify-center gap-2 animate-bounce-in">
            <AlertCircle size={16} /> {errorMsg}
          </div>
        )}

        {/* =======================================
            TEACHER LOGIN FORM
        ======================================= */}
        {loginType === 'teacher' && (
          <form onSubmit={handleTeacherLogin} className="space-y-5 animate-fade-in">
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-2 uppercase tracking-wider">Registered Mobile No</label>
              <div className="relative">
                <Phone className="absolute left-4 top-3.5 text-slate-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Enter your phone number" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-800 pl-12 pr-4 py-3 rounded-xl text-white outline-none focus:border-purple-500 transition" 
                  required 
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-2 uppercase tracking-wider">Assigned Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-slate-500" size={18} />
                <input 
                  type="password" 
                  placeholder="Enter password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-800 pl-12 pr-4 py-3 rounded-xl text-white outline-none focus:border-purple-500 transition" 
                  required 
                />
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3.5 rounded-xl font-black transition shadow-lg shadow-purple-500/20 flex justify-center items-center gap-2 mt-2">
              {isLoading ? <Loader2 className="animate-spin" size={20}/> : 'Access Teacher Panel'} <ArrowRight size={18}/>
            </button>
          </form>
        )}

        {/* =======================================
            STUDENT LOGIN FORM
        ======================================= */}
        {loginType === 'student' && (
          <form onSubmit={handleStudentLogin} className="space-y-5 animate-fade-in">
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-2 uppercase tracking-wider">Student Unique ID</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 text-slate-500" size={18} />
                <input 
                  type="text" 
                  placeholder="e.g. 99999" 
                  value={uniqueId} 
                  onChange={(e) => setUniqueId(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-800 pl-12 pr-4 py-3 rounded-xl text-white outline-none focus:border-blue-500 transition" 
                  required 
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-2 uppercase tracking-wider">Date of Birth</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-3.5 text-slate-500" size={18} />
                <input 
                  type="date" 
                  value={dob} 
                  onChange={(e) => setDob(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-800 pl-12 pr-4 py-3 rounded-xl text-white outline-none focus:border-blue-500 transition" 
                  required 
                />
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-xl font-black transition shadow-lg shadow-blue-500/20 flex justify-center items-center gap-2 mt-2">
              {isLoading ? <Loader2 className="animate-spin" size={20}/> : 'Access Student Portal'} <ArrowRight size={18}/>
            </button>
          </form>
        )}

        {/* =======================================
            ADMIN LOGIN FORM
        ======================================= */}
        {loginType === 'admin' && (
          <form onSubmit={handleAdminLogin} className="space-y-5 animate-fade-in">
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-2 uppercase tracking-wider">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-slate-500" size={18} />
                <input 
                  type="email" 
                  placeholder="admin@school.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-800 pl-12 pr-4 py-3 rounded-xl text-white outline-none focus:border-emerald-500 transition" 
                  required 
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-2 uppercase tracking-wider">Master Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-slate-500" size={18} />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={adminPassword} 
                  onChange={(e) => setAdminPassword(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-800 pl-12 pr-4 py-3 rounded-xl text-white outline-none focus:border-emerald-500 transition" 
                  required 
                />
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-xl font-black transition shadow-lg shadow-emerald-500/20 flex justify-center items-center gap-2 mt-2">
              {isLoading ? <Loader2 className="animate-spin" size={20}/> : 'Login as Admin'} <ArrowRight size={18}/>
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
