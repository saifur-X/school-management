'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [rollNo, setRollNo] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('students')
      .select('*, profiles(full_name, email)');

    if (error) console.error(error);
    else setStudents(data || []);
    setLoading(false);
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!fullName || !rollNo) return alert('সব ফিল্ড পূরণ করুন!');

    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .insert([{ full_name: fullName, email: `student_${rollNo}@school.com`, role_id: 3 }])
      .select()
      .single();

    if (profileErr) return alert('Error creating profile: ' + profileErr.message);

    const { error: studentErr } = await supabase
      .from('students')
      .insert([{ profile_id: profile.id, roll_no: parseInt(rollNo) }]);

    if (studentErr) {
      alert('Error adding student: ' + studentErr.message);
    } else {
      setFullName('');
      setRollNo('');
      fetchStudents();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <header className="mb-8 text-center md:text-left border-b pb-4">
        <h1 className="text-3xl font-bold text-blue-700">🏫 School Management System</h1>
        <p className="text-slate-600 mt-1">স্টুডেন্ট ডাটাবেস ও ম্যানেজমেন্ট প্যানেল</p>
      </header>

      <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4 text-slate-800">নতুন স্টুডেন্ট যোগ করুন</h2>
        <form onSubmit={handleAddStudent} className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="স্টুডেন্টের নাম"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="border p-3 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="number"
            placeholder="রোল নম্বর"
            value={rollNo}
            onChange={(e) => setRollNo(e.target.value)}
            className="border p-3 rounded-lg sm:w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition"
          >
            অ্যাড করুন
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-slate-800">স্টুডেন্টদের তালিকা</h2>
        </div>
        {loading ? (
          <p className="p-6 text-center text-slate-500">ডাটা লোড হচ্ছে...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b text-slate-700">
                  <th className="p-4 font-semibold">রোল</th>
                  <th className="p-4 font-semibold">নাম</th>
                  <th className="p-4 font-semibold">ইমেইল</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="p-6 text-center text-slate-500">
                      কোনো স্টুডেন্ট পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id} className="border-b hover:bg-slate-50">
                      <td className="p-4 font-bold text-slate-700">{student.roll_no}</td>
                      <td className="p-4 text-slate-800">{student.profiles?.full_name || 'N/A'}</td>
                      <td className="p-4 text-slate-600">{student.profiles?.email || 'N/A'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
              }

