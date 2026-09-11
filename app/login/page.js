/* eslint-disable */
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase'; 
import { useRouter } from 'next/navigation';
import { 
  School, User, Lock, Phone, Mail, Loader2, ShieldCheck, 
  GraduationCap, Briefcase, AlertCircle, Calendar, Sparkles, ArrowRight 
} from 'lucide-react';

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

  // সেফটি সেশন চেক (টাইমআউট সহ, যাতে পেজ কখনো লোডিংয়ে আটকে না থাকে)
  useEffect(() => {
    let isMounted = true;
    const checkSession = async () => {
      try {
        const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 800));
        const sessionPromise = supabase.auth.getSession();
        
        const res = await Promise.race([sessionPromise, timeoutPromise]);
        const session = res?.data?.session;
        
        const localTeacher = typeof window !== 'undefined' ? localStorage.getItem('teacher_session') : null;
        const localStudent = typeof window !== 'undefined' ? localStorage.getItem('student_session') : null;
        
        // সক্রিয় কোনো সেশন থাকলে তবেই ড্যাশবোর্ডে পাঠাবে
        if (session || localStudent) {
          if (isMounted) router.replace('/');
        }
      } catch (err) {
        console.error('Session check error:', err);
      }
    };
    checkSession();
    return () => { isMounted = false; };
  }, [router]);

  const handleTeacherLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true); setErrorMsg('');

    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('phone', phone.trim())
        .eq('password', password.trim())
        .maybeSingle();

      if (error || !data) {
        setErrorMsg('মোবাইল নম্বর অথবা পাসওয়ার্ডটি সঠিক নয়!');
        setIsLoading(false);
        return;
      }

      if (data.status !== 'Active') {
        setErrorMsg('আপনার অ্যাকাউন্টটি নিষ্ক্রিয় রয়েছে। অ্যাডমিনের সাথে যোগাযোগ করুন।');
        setIsLoading(false);
        return;
      }

      localStorage.setItem('teacher_session', JSON.stringify(data));
      router.replace('/'); 
    } catch (err) {
      setErrorMsg('লগইন প্রক্রিয়ায় সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।');
    }
    setIsLoading(false);
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true); setErrorMsg('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: adminPassword.trim(),
      });

      if (error) {
        setErrorMsg('ভুল অ্যাডমিন ইমেইল অথবা পাসওয়ার্ড!');
        setIsLoading(false);
        return;
      }

      router.replace('/');
    } catch (err) {
      setErrorMsg('লগইন সম্পন্ন করা সম্ভব হয়নি।');
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
        .eq('unique_id', uniqueId.trim())
        .eq('dob', dob)
        .maybeSingle();

      if (error || !data) {
        setErrorMsg('ইউনিক আইডি অথবা জন্মতারিখ সঠিক নয়!');
        setIsLoading(false);
        return;
      }

      if (data.status !== 'Active' && data.status) {
        setErrorMsg('এই শিক্ষার্থীর প্রোফাইলটি বর্তমানে সক্রিয় নেই।');
        setIsLoading(false);
        return;
      }

      localStorage.setItem('student_session', JSON.stringify(data));
      router.replace('/');
    } catch (err) {
      setErrorMsg('লগইন ব্যর্থ হয়েছে। তথ্য যাচাই করুন।');
    }
    setIsLoading(false);
  };

  const getThemeStyles = () => {
    switch (loginType) {
      case 'teacher':
        return {
          accent: 'text-purple-400',
          border: 'focus:border-purple-500',
          badge: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
          button: 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-purple-600/30'
        };
      case 'student':
        return {
          accent: 'text-emerald-400',
          border: 'focus:border-emerald-500',
          badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
          button: 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 shadow-emerald-600/30'
        };
      default:
        return {
          accent: 'text-blue-400',
          border: 'focus:border-blue-500',
          badge: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
          button: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 shadow-blue-600/30'
        };
    }
  };

  const theme = getThemeStyles();

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-slate-100 relative overflow-hidden">
      {/* ব্যাকগ্রাউন্ড লাইটিং ইফেক্ট */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* মূল লগইন কার্ড */}
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-7 sm:p-9 rounded-3xl shadow-2xl w-full max-w-md relative z-10">
        
        {/* লোগো ও শিরোনাম */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
            <School size={28} className="text-white" />
          </div>
          <div className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border mb-1.5 text-[11px] font-bold tracking-wide uppercase ${theme.badge}`}>
            <Sparkles size={11} /> Education Portal
          </div>
          <h1 className="text-2xl font-black text-white">স্বাগতম</h1>
          <p className="text-xs text-slate-400 mt-0.5">আপনার রোল সিলেক্ট করে লগইন করুন</p>
        </div>

        {/* ট্যাব বাটনসমূহ */}
        <div className="grid grid-cols-3 bg-slate-950 p-1 rounded-2xl mb-6 border border-slate-800 gap-1">
          <button 
            type="button" 
            onClick={() => { setLoginType('admin'); setErrorMsg(''); }} 
            className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${loginType === 'admin' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <ShieldCheck size={14} /> Admin
          </button>
          
          <button 
            type="button" 
            onClick={() => { setLoginType('teacher'); setErrorMsg(''); }} 
            className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${loginType === 'teacher' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <Briefcase size={14} /> Teacher
          </button>
          
          <button 
            type="button" 
            onClick={() => { setLoginType('student'); setErrorMsg(''); }} 
            className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${loginType === 'student' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <GraduationCap size={14} /> Student
          </button>
        </div>

        {/* এরর মেসেজ */}
        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl text-xs font-bold text-center mb-5 flex items-center justify-center gap-2">
            <AlertCircle size={15} className="shrink-0" /> <span>{errorMsg}</span>
          </div>
        )}

        {/* অ্যাডমিন ফর্ম */}
        {loginType === 'admin' && (
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">অ্যাডমিন ইমেইল</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
                <input 
                  type="email" 
                  placeholder="admin@school.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className={`w-full bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 rounded-xl text-sm text-white outline-none ${theme.border}`} 
                  required 
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">পাসওয়ার্ড</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={adminPassword} 
                  onChange={(e) => setAdminPassword(e.target.value)} 
                  className={`w-full bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 rounded-xl text-sm text-white outline-none ${theme.border}`} 
                  required 
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={isLoading} 
              className={`w-full py-3 rounded-xl font-bold text-sm text-white transition flex justify-center items-center gap-2 shadow-lg mt-2 ${theme.button}`}
            >
              {isLoading ? <Loader2 className="animate-spin" size={18}/> : <><span>Admin Login</span><ArrowRight size={15}/></>}
            </button>
          </form>
        )}

        {/* শিক্ষক ফর্ম */}
        {loginType === 'teacher' && (
          <form onSubmit={handleTeacherLogin} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">মোবাইল নম্বর</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
                <input 
                  type="text" 
                  placeholder="01XXXXXXXXX" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  className={`w-full bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 rounded-xl text-sm text-white font-mono outline-none ${theme.border}`} 
                  required 
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">অ্যাসাইন করা পাসওয়ার্ড</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className={`w-full bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 rounded-xl text-sm text-white outline-none ${theme.border}`} 
                  required 
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={isLoading} 
              className={`w-full py-3 rounded-xl font-bold text-sm text-white transition flex justify-center items-center gap-2 shadow-lg mt-2 ${theme.button}`}
            >
              {isLoading ? <Loader2 className="animate-spin" size={18}/> : <><span>Teacher Login</span><ArrowRight size={15}/></>}
            </button>
          </form>
        )}

        {/* শিক্ষার্থী ফর্ম */}
        {loginType === 'student' && (
          <form onSubmit={handleStudentLogin} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">Student Unique ID</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
                <input 
                  type="text" 
                  placeholder="e.g. 10025" 
                  value={uniqueId} 
                  onChange={(e) => setUniqueId(e.target.value)} 
                  className={`w-full bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 rounded-xl text-sm text-white font-mono outline-none ${theme.border}`} 
                  required 
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">জন্মতারিখ (DOB)</label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
                <input 
                  type="date" 
                  value={dob} 
                  onChange={(e) => setDob(e.target.value)} 
                  className={`w-full bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 rounded-xl text-sm text-white outline-none ${theme.border}`} 
                  required 
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={isLoading} 
              className={`w-full py-3 rounded-xl font-bold text-sm text-white transition flex justify-center items-center gap-2 shadow-lg mt-2 ${theme.button}`}
            >
              {isLoading ? <Loader2 className="animate-spin" size={18}/> : <><span>Student Portal Login</span><ArrowRight size={15}/></>}
            </button>
          </form>
        )}

        {/* ফুটার */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 text-center flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-semibold">
          <ShieldCheck size={13} className="text-emerald-500" /> End-to-End Encrypted Session
        </div>

      </div>
    </div>
  );
}
