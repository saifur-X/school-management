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
  
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [loginType, setLoginType] = useState('admin'); 
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  const [email, setEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  
  const [uniqueId, setUniqueId] = useState('');
  const [dob, setDob] = useState('');

  // ব্লিঙ্কিং ফিক্স: সেশন চেক শেষ না হওয়া পর্যন্ত ফর্ম ফ্ল্যাশ হবে না
  useEffect(() => {
    let isMounted = true;
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const localTeacher = typeof window !== 'undefined' ? localStorage.getItem('teacher_session') : null;
        const localStudent = typeof window !== 'undefined' ? localStorage.getItem('student_session') : null;
        
        if (session || localTeacher || localStudent) {
          router.replace('/');
          return;
        }
      } catch (err) {
        console.error('Session check error:', err);
      } finally {
        if (isMounted) setIsCheckingAuth(false);
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
        .single();

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
        .single();

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

  // রোল অনুযায়ী ডায়নামিক কালার স্কিম
  const getThemeStyles = () => {
    switch (loginType) {
      case 'teacher':
        return {
          glow: 'from-purple-600/30 via-fuchsia-600/20 to-pink-600/30',
          accent: 'text-purple-400',
          border: 'focus:border-purple-500 focus:ring-purple-500/30',
          badge: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
          button: 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-purple-600/30'
        };
      case 'student':
        return {
          glow: 'from-emerald-600/30 via-teal-600/20 to-cyan-600/30',
          accent: 'text-emerald-400',
          border: 'focus:border-emerald-500 focus:ring-emerald-500/30',
          badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
          button: 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 shadow-emerald-600/30'
        };
      default:
        return {
          glow: 'from-blue-600/30 via-indigo-600/20 to-violet-600/30',
          accent: 'text-blue-400',
          border: 'focus:border-blue-500 focus:ring-blue-500/30',
          badge: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
          button: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 shadow-blue-600/30'
        };
    }
  };

  const theme = getThemeStyles();

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="relative flex items-center justify-center mb-4">
          <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
          <School size={24} className="absolute text-indigo-400" />
        </div>
        <p className="text-xs font-semibold tracking-wider text-slate-400 animate-pulse">পোর্টাল লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-slate-100 relative overflow-hidden">
      
      {/* ভাইব্র্যান্ট ব্যাকগ্রাউন্ড লাইট বাবলস */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-indigo-600/30 to-purple-600/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-gradient-to-tl from-cyan-600/30 to-blue-600/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

      {/* মডার্ন গ্লাস কার্ড */}
      <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800/90 p-8 sm:p-10 rounded-3xl shadow-[0_0_60px_-15px_rgba(79,70,229,0.2)] w-full max-w-md relative z-10 transition-all duration-500">
        
        {/* লোগো ও হেডার */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 p-[2px] shadow-xl shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center">
              <School size={30} className="text-white" />
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border mb-2 text-[11px] font-bold tracking-wide uppercase transition-colors duration-300 ${theme.badge}">
            <Sparkles size={12} /> Smart Education Portal
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">স্বাগতম পোর্টালে</h1>
          <p className="text-xs text-slate-400 mt-1">আপনার প্রয়োজনীয় রোল সিলেক্ট করে লগইন করুন</p>
        </div>

        {/* ৩টি রোল সিলেক্টর ট্যাব */}
        <div className="grid grid-cols-3 bg-slate-950/80 p-1.5 rounded-2xl mb-6 border border-slate-800/80 gap-1 shadow-inner">
          <button 
            type="button" 
            onClick={() => { setLoginType('admin'); setErrorMsg(''); }} 
            className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${loginType === 'admin' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25' : 'text-slate-400 hover:text-white'}`}
          >
            <ShieldCheck size={14} /> Admin
          </button>
          
          <button 
            type="button" 
            onClick={() => { setLoginType('teacher'); setErrorMsg(''); }} 
            className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${loginType === 'teacher' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25' : 'text-slate-400 hover:text-white'}`}
          >
            <Briefcase size={14} /> Teacher
          </button>
          
          <button 
            type="button" 
            onClick={() => { setLoginType('student'); setErrorMsg(''); }} 
            className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${loginType === 'student' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25' : 'text-slate-400 hover:text-white'}`}
          >
            <GraduationCap size={14} /> Student
          </button>
        </div>

        {/* এরর নোটিফিকেশন */}
        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3.5 rounded-xl text-xs font-bold text-center mb-6 flex items-center justify-center gap-2 animate-shake">
            <AlertCircle size={16} className="shrink-0" /> <span>{errorMsg}</span>
          </div>
        )}

        {/* অ্যাডমিন লগইন ফর্ম */}
        {loginType === 'admin' && (
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">অ্যাডমিন ইমেইল</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 text-slate-500" size={17} />
                <input 
                  type="email" 
                  placeholder="admin@school.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className={`w-full bg-slate-950/70 border border-slate-800 pl-11 pr-4 py-3 rounded-xl text-sm text-white outline-none transition-all ${theme.border}`} 
                  required 
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">পাসওয়ার্ড</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 text-slate-500" size={17} />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={adminPassword} 
                  onChange={(e) => setAdminPassword(e.target.value)} 
                  className={`w-full bg-slate-950/70 border border-slate-800 pl-11 pr-4 py-3 rounded-xl text-sm text-white outline-none transition-all ${theme.border}`} 
                  required 
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={isLoading} 
              className={`w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all duration-300 flex justify-center items-center gap-2 shadow-lg mt-2 ${theme.button}`}
            >
              {isLoading ? <Loader2 className="animate-spin" size={18}/> : <><span>Admin Login</span><ArrowRight size={16}/></>}
            </button>
          </form>
        )}

        {/* শিক্ষক / স্টাফ লগইন ফর্ম */}
        {loginType === 'teacher' && (
          <form onSubmit={handleTeacherLogin} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">রেজিস্টার্ড মোবাইল নম্বর</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 text-slate-500" size={17} />
                <input 
                  type="text" 
                  placeholder="01XXXXXXXXX" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  className={`w-full bg-slate-950/70 border border-slate-800 pl-11 pr-4 py-3 rounded-xl text-sm text-white font-mono outline-none transition-all ${theme.border}`} 
                  required 
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">অ্যাসাইন করা পাসওয়ার্ড</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 text-slate-500" size={17} />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className={`w-full bg-slate-950/70 border border-slate-800 pl-11 pr-4 py-3 rounded-xl text-sm text-white outline-none transition-all ${theme.border}`} 
                  required 
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={isLoading} 
              className={`w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all duration-300 flex justify-center items-center gap-2 shadow-lg mt-2 ${theme.button}`}
            >
              {isLoading ? <Loader2 className="animate-spin" size={18}/> : <><span>Teacher Login</span><ArrowRight size={16}/></>}
            </button>
          </form>
        )}

        {/* শিক্ষার্থী লগইন ফর্ম */}
        {loginType === 'student' && (
          <form onSubmit={handleStudentLogin} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">Student Unique ID</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 text-slate-500" size={17} />
                <input 
                  type="text" 
                  placeholder="e.g. 10025" 
                  value={uniqueId} 
                  onChange={(e) => setUniqueId(e.target.value)} 
                  className={`w-full bg-slate-950/70 border border-slate-800 pl-11 pr-4 py-3 rounded-xl text-sm text-white font-mono outline-none transition-all ${theme.border}`} 
                  required 
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">জন্মতারিখ (DOB)</label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-3.5 text-slate-500" size={17} />
                <input 
                  type="date" 
                  value={dob} 
                  onChange={(e) => setDob(e.target.value)} 
                  className={`w-full bg-slate-950/70 border border-slate-800 pl-11 pr-4 py-3 rounded-xl text-sm text-white outline-none transition-all ${theme.border}`} 
                  required 
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={isLoading} 
              className={`w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all duration-300 flex justify-center items-center gap-2 shadow-lg mt-2 ${theme.button}`}
            >
              {isLoading ? <Loader2 className="animate-spin" size={18}/> : <><span>Student Portal Login</span><ArrowRight size={16}/></>}
            </button>
          </form>
        )}

        {/* সিকিউরিটি ব্যাজ ফুটার */}
        <div className="mt-8 pt-6 border-t border-slate-800/60 text-center flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-semibold">
          <ShieldCheck size={14} className="text-emerald-500" /> End-to-End Encrypted Session
        </div>

      </div>
    </div>
  );
}