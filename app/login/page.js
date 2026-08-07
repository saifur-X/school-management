'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { Loader2, School, User, Lock, Calendar } from 'lucide-react';

export default function Login() {
  const [loginType, setLoginType] = useState('admin'); // 'admin' or 'student'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [uniqueId, setUniqueId] = useState('');
  const [dob, setDob] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else router.push('/');
    setLoading(false);
  };

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    
    // Check student in database
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('unique_id', parseInt(uniqueId))
      .eq('dob', dob)
      .single();

    if (error || !data) {
      setError('ভুল ইউনিক আইডি বা জন্মতারিখ!');
    } else {
      // Save student session in local storage
      localStorage.setItem('student_session', JSON.stringify(data));
      router.push('/');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-400 to-cyan-400 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-w-4xl w-full min-h-[500px]">
        
        {/* Left Side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-3 rounded-2xl shadow-lg">
              <School className="text-white" size={32} />
            </div>
          </div>
          <h2 className="text-3xl font-black text-slate-800 text-center mb-8">
            {loginType === 'admin' ? 'Admin Sign In' : 'Student Sign In'}
          </h2>

          {error && <p className="text-rose-500 text-sm font-bold text-center mb-4 bg-rose-50 p-2 rounded-lg">{error}</p>}

          {loginType === 'admin' ? (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-3.5 text-slate-400" size={18} />
                <input type="email" placeholder="Admin Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-3 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 font-medium" required />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-3 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 font-medium" required />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition flex justify-center mt-2">
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'SIGN IN'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleStudentLogin} className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-3.5 text-slate-400" size={18} />
                <input type="number" placeholder="5-Digit Unique ID (e.g. 99999)" value={uniqueId} onChange={e => setUniqueId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-3 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 font-medium" required />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-3.5 text-slate-400" size={18} />
                <input type="date" placeholder="Date of Birth" value={dob} onChange={e => setDob(e.target.value)} className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-3 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 font-medium" required />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition flex justify-center mt-2">
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'SIGN IN'}
              </button>
            </form>
          )}
        </div>

        {/* Right Side - Toggle Panel */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-cyan-400 to-blue-500 text-white p-8 md:p-12 flex flex-col justify-center items-center text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4">Hello, {loginType === 'admin' ? 'Student!' : 'Admin!'}</h2>
          <p className="text-sm md:text-base text-blue-50 mb-8 max-w-xs">
            {loginType === 'admin' 
              ? 'Are you a student? Enter your personal details and view your dashboard.' 
              : 'Are you an administrator? Login here to manage the school system.'}
          </p>
          <button 
            onClick={() => { setLoginType(loginType === 'admin' ? 'student' : 'admin'); setError(''); }} 
            className="border-2 border-white text-white font-bold py-3 px-10 rounded-full hover:bg-white hover:text-blue-500 transition shadow-lg"
          >
            {loginType === 'admin' ? 'STUDENT LOGIN' : 'ADMIN LOGIN'}
          </button>
        </div>

      </div>
    </div>
  );
          }
