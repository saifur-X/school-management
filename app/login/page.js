'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (type) => {
    setLoading(true);
    let result;
    
    if (type === 'signup') {
      result = await supabase.auth.signUp({ email, password });
      if (result.error) alert(result.error.message);
      else alert('অ্যাকাউন্ট তৈরি হয়েছে! এবার লগইন করুন।');
    } else {
      result = await supabase.auth.signInWithPassword({ email, password });
      if (result.error) alert(result.error.message);
      else router.push('/'); // লগইন সফল হলে ড্যাশবোর্ডে যাবে
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">🏫 EduAdmin</h1>
          <p className="text-slate-300 mt-2">স্কুল ম্যানেজমেন্ট সিস্টেমে স্বাগতম</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-slate-300 text-sm font-medium mb-1 block">ইমেইল ঠিকানা</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin@school.com"
            />
          </div>
          <div>
            <label className="text-slate-300 text-sm font-medium mb-1 block">পাসওয়ার্ড</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>
          
          <div className="flex gap-4 pt-4">
            <button
              onClick={() => handleAuth('login')}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
            >
              {loading ? 'অপেক্ষা করুন...' : 'লগইন'}
            </button>
            <button
              onClick={() => handleAuth('signup')}
              disabled={loading}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-semibold transition"
            >
              সাইন আপ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

