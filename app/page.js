'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Users, CreditCard, FileSpreadsheet, UserCheck, Key, LogOut, Edit, Save, Plus, School, Image, Phone, MapPin, Droplet, User, BookOpen, Trash2, Printer, X } from 'lucide-react';

export default function Dashboard() {
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New Student / Edit Student Form States
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    rollNo: '',
    studentClass: '',
    phone: '',
    bloodGroup: '',
    address: '',
    gender: 'Male',
    photoUrl: ''
  });
  const [isEditingStudent, setIsEditingStudent] = useState(false);

  // School Profile
  const [school, setSchool] = useState({ school_name: '', address: '', phone: '', email: '' });
  const [editSchool, setEditSchool] = useState(false);

  // ID Card Selection
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Marksheet States
  const [marksheetStudent, setMarksheetStudent] = useState(null);
  const [marks, setMarks] = useState({ examName: 'Annual Exam 2026', bangla: 80, english: 75, math: 90, science: 85 });
  const [generatedMarksheet, setGeneratedMarksheet] = useState(null);

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

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.rollNo || !formData.studentClass) {
      return alert('নাম, রোল নম্বর এবং ক্লাস পূরণ করা আবশ্যক!');
    }

    if (isEditingStudent) {
      // Update existing student
      const { error } = await supabase.from('students').update({
        name: formData.name,
        roll_no: parseInt(formData.rollNo),
        student_class: formData.studentClass,
        phone: formData.phone,
        blood_group: formData.bloodGroup,
        address: formData.address,
        gender: formData.gender,
        photo_url: formData.photoUrl || 'https://via.placeholder.com/150'
      }).eq('id', formData.id);

      if (error) alert('আপডেট সফল হয়নি: ' + error.message);
      else {
        alert('স্টুডেন্টের তথ্য সফলভাবে আপডেট হয়েছে!');
        resetStudentForm();
        fetchStudents();
      }
    } else {
      // Add new student
      const { error } = await supabase.from('students').insert([
        { 
          name: formData.name, 
          roll_no: parseInt(formData.rollNo), 
          student_class: formData.studentClass,
          phone: formData.phone,
          blood_group: formData.bloodGroup,
          address: formData.address,
          gender: formData.gender,
          photo_url: formData.photoUrl || 'https://via.placeholder.com/150',
          email: `student_${formData.rollNo}@school.com` 
        }
      ]);

      if (error) alert('এরর: ' + error.message);
      else {
        alert('নতুন স্টুডেন্ট যুক্ত হয়েছে!');
        resetStudentForm();
        fetchStudents();
      }
    }
  };

  const handleEditClick = (student) => {
    setFormData({
      id: student.id,
      name: student.name || '',
      rollNo: student.roll_no || '',
      studentClass: student.student_class || '',
      phone: student.phone || '',
      bloodGroup: student.blood_group || '',
      address: student.address || '',
      gender: student.gender || 'Male',
      photoUrl: student.photo_url || ''
    });
    setIsEditingStudent(true);
    setActiveTab('dashboard'); // Edit form e niye jabe
  };

  const handleDeleteStudent = async (id) => {
    if (confirm('আপনি কি নিশ্চিত যে এই স্টুডেন্টকে ডিলিট করতে চান?')) {
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (error) alert('ডিলিট করা যায়নি: ' + error.message);
      else {
        alert('স্টুডেন্ট মুছে ফেলা হয়েছে!');
        fetchStudents();
      }
    }
  };

  const resetStudentForm = () => {
    setFormData({ id: null, name: '', rollNo: '', studentClass: '', phone: '', bloodGroup: '', address: '', gender: 'Male', photoUrl: '' });
    setIsEditingStudent(false);
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

  const handleGenerateMarksheet = (e) => {
    e.preventDefault();
    if (!marksheetStudent) return alert('অনুগ্রহ করে একজন স্টুডেন্ট সিলেক্ট করুন!');
    
    const total = Number(marks.bangla) + Number(marks.english) + Number(marks.math) + Number(marks.science);
    const avg = total / 4;
    let grade = 'F';
    if (avg >= 80) grade = 'A+';
    else if (avg >= 70) grade = 'A';
    else if (avg >= 60) grade = 'A-';
    else if (avg >= 50) grade = 'B';
    else if (avg >= 40) grade = 'C';

    setGeneratedMarksheet({
      student: marksheetStudent,
      examName: marks.examName,
      subjects: [
        { name: 'বাংলা (Bangla)', mark: marks.bangla },
        { name: 'ইংরেজি (English)', mark: marks.english },
        { name: 'গণিত (Mathematics)', mark: marks.math },
        { name: 'বিজ্ঞান (General Science)', mark: marks.science }
      ],
      total,
      avg: avg.toFixed(1),
      grade
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (!session) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-medium">Loading EduAdmin...</div>;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-72 bg-slate-900/80 backdrop-blur-xl border-r border-slate-800/80 p-6 flex flex-col justify-between">
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
                <p className="text-slate-400 text-sm mt-1">এডমিন: {session.user.email}</p>
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

            {/* Comprehensive Add/Edit Student Form */}
            <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-lg p-6 md:p-8 rounded-2xl shadow-xl">
              <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold flex items-center gap-2 text-blue-400">
                  <Plus size={22}/> {isEditingStudent ? 'স্টুডেন্টের তথ্য পরিবর্তন করুন' : 'নতুন স্টুডেন্ট এর ডিটেইলস যোগ করুন'}
                </h3>
                {isEditingStudent && (
                  <button onClick={resetStudentForm} className="text-xs bg-slate-800 px-3 py-1.5 rounded-lg text-slate-300 flex items-center gap-1 hover:bg-slate-700">
                    <X size={14}/> নতুন অ্যাড মোড
                  </button>
                )}
              </div>
              
              <form onSubmit={handleSaveStudent} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Name */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2"><User size={14}/> স্টুডেন্টের নাম *</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="যেমন: Saifur Rahaman"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Roll No */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 mb-2 block">রোল নম্বর *</label>
                    <input
                      type="number"
                      name="rollNo"
                      placeholder="যেমন: 101"
                      value={formData.rollNo}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Class */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2"><BookOpen size={14}/> ক্লাস / শ্রেণী *</label>
                    <input
                      type="text"
                      name="studentClass"
                      placeholder="যেমন: Class 10"
                      value={formData.studentClass}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2"><Phone size={14}/> মোবাইল নম্বর</label>
                    <input
                      type="text"
                      name="phone"
                      placeholder="+880 / +91 ..."
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Blood Group */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2"><Droplet size={14}/> ব্লাড গ্রুপ</label>
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">সিলেক্ট করুন</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 mb-2 block">জেন্ডার</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Photo URL */}
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2"><Image size={14}/> ফটো ইমেজ URL (Optional)</label>
                    <input
                      type="url"
                      name="photoUrl"
                      placeholder="https://example.com/photo.jpg"
                      value={formData.photoUrl}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Address */}
                  <div className="md:col-span-3">
                    <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2"><MapPin size={14}/> বর্তমান ঠিকানা</label>
                    <input
                      type="text"
                      name="address"
                      placeholder="গ্রাম/শহর, জেলা..."
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button type="submit" className={`w-full md:w-auto ${isEditingStudent ? 'bg-amber-600 hover:bg-amber-700' : 'bg-gradient-to-r from-blue-600 to-indigo-600'} px-8 py-3.5 rounded-xl font-bold transition shadow-lg`}>
                  {isEditingStudent ? 'আপডেট সেভ করুন' : 'স্টুডেন্ট ডাটা সেভ করুন'}
                </button>
              </form>
            </div>
          </div>
        )}
 {/* STUDENTS TAB (EDIT / DELETE OPTION ADDED) */}
        {activeTab === 'students' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold">স্টুডেন্টদের বিস্তারিত তালিকা</h2>
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-800/50 text-slate-400 text-xs">
                    <tr>
                      <th className="p-4">ছবি</th>
                      <th className="p-4">রোল</th>
                      <th className="p-4">নাম</th>
                      <th className="p-4">ক্লাস</th>
                      <th className="p-4">মোবাইল</th>
                      <th className="p-4">ব্লাড</th>
                      <th className="p-4">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-sm">
                    {students.map((st) => (
                      <tr key={st.id} className="hover:bg-slate-800/30">
                        <td className="p-4">
                          <img 
                            src={st.photo_url || 'https://via.placeholder.com/150'} 
                            alt={st.name} 
                            className="w-10 h-10 rounded-full object-cover border border-slate-700" 
                          />
                        </td>
                        <td className="p-4 font-bold text-blue-400">#{st.roll_no}</td>
                        <td className="p-4 font-medium">{st.name}</td>
                        <td className="p-4 text-slate-300"><span className="bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-lg text-xs">{st.student_class || 'N/A'}</span></td>
                        <td className="p-4 text-slate-400">{st.phone || 'N/A'}</td>
                        <td className="p-4 text-rose-400 font-semibold">{st.blood_group || 'N/A'}</td>
                        <td className="p-4 flex gap-2">
                          <button 
                            onClick={() => handleEditClick(st)} 
                            className="bg-amber-500/10 text-amber-400 p-2 rounded-lg hover:bg-amber-500/20 transition"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteStudent(st.id)} 
                            className="bg-red-500/10 text-red-400 p-2 rounded-lg hover:bg-red-500/20 transition"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
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
            <h2 className="text-2xl font-bold">আর্টিফিশিয়াল আইডি কার্ড জেনারেটর</h2>
            <div className="flex gap-4">
              <select
                onChange={(e) => setSelectedStudent(students.find(s => s.id === e.target.value))}
                className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">স্টুডেন্ট সিলেক্ট করুন</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name} (Roll: {s.roll_no} - {s.student_class})</option>)}
              </select>
            </div>

            {selectedStudent && (
              <div className="w-80 h-auto bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 border border-indigo-500/30 p-6 rounded-3xl shadow-2xl relative overflow-hidden text-center border-t-4 border-t-blue-500">
                <h3 className="font-extrabold text-blue-300 tracking-wide text-lg">{school.school_name}</h3>
                <p className="text-[10px] text-slate-400">{school.address}</p>

                <div className="my-4">
                  <img 
                    src={selectedStudent.photo_url || 'https://via.placeholder.com/150'} 
                    alt={selectedStudent.name} 
                    className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-blue-400 shadow-md"
                  />
                </div>

                <h4 className="font-bold text-xl text-white">{selectedStudent.name}</h4>
                <p className="text-xs text-blue-400 font-semibold mb-4">{selectedStudent.student_class} | Roll: {selectedStudent.roll_no}</p>

                <div className="text-left text-xs space-y-1.5 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80 text-slate-300">
                  <p><strong>Gender:</strong> {selectedStudent.gender || 'N/A'}</p>
                  <p><strong>Blood:</strong> <span className="text-rose-400 font-bold">{selectedStudent.blood_group || 'N/A'}</span></p>
                  <p><strong>Phone:</strong> {selectedStudent.phone || 'N/A'}</p>
                  <p><strong>Address:</strong> {selectedStudent.address || 'N/A'}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MARKSHEET TAB (FUNCTIONAL) */}
        {activeTab === 'marksheet' && (
          <div className="space-y-8 animate-fade-in">
            <h2 className="text-2xl font-bold">মার্কশিট জেনারেটর প্যানেল</h2>
            
            <form onSubmit={handleGenerateMarksheet} className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-6 max-w-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-2">স্টুডেন্ট সিলেক্ট করুন *</label>
                  <select
                    onChange={(e) => setMarksheetStudent(students.find(s => s.id === e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">স্টুডেন্ট বেছে নিন</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name} (Roll: {s.roll_no})</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-2">পরীক্ষার নাম</label>
                  <input
                    type="text"
                    value={marks.examName}
                    onChange={(e) => setMarks({ ...marks, examName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">বাংলা (Bangla)</label>
                  <input type="number" value={marks.bangla} onChange={(e) => setMarks({ ...marks, bangla: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">ইংরেজি (English)</label>
                  <input type="number" value={marks.english} onChange={(e) => setMarks({ ...marks, english: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">গণিত (Math)</label>
                  <input type="number" value={marks.math} onChange={(e) => setMarks({ ...marks, math: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">বিজ্ঞান (Science)</label>
                  <input type="number" value={marks.science} onChange={(e) => setMarks({ ...marks, science: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white" />
                </div>
              </div>

              <button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 rounded-xl font-bold">
                মার্কশিট তৈরি করুন
              </button>
            </form>

            {/* Generated Marksheet Display */}
            {generatedMarksheet && (
              <div className="bg-white text-slate-900 p-8 rounded-2xl max-w-2xl shadow-2xl border border-slate-200 animate-fade-in">
                <div className="text-center border-b pb-4 mb-6">
                  <h3 className="text-2xl font-black text-blue-900">{school.school_name}</h3>
                  <p className="text-xs text-slate-600">{school.address} | Phone: {school.phone}</p>
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full mt-2">
                    ACADEMIC MARKSHEET - {generatedMarksheet.examName}
                  </span>
                </div>

                <div className="grid grid-cols-2 text-sm mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p><strong>Student Name:</strong> {generatedMarksheet.student.name}</p>
                  <p><strong>Roll No:</strong> #{generatedMarksheet.student.roll_no}</p>
                  <p><strong>Class:</strong> {generatedMarksheet.student.student_class}</p>
                  <p><strong>Overall Grade:</strong> <span className="font-extrabold text-blue-700">{generatedMarksheet.grade}</span></p>
                </div>

                <table className="w-full text-left text-sm border-collapse mb-6">
                  <thead>
                    <tr className="bg-slate-100 border-b">
                      <th className="p-3">Subject</th>
                      <th className="p-3 text-right">Marks Obtained</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generatedMarksheet.subjects.map((s, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="p-3">{s.name}</td>
                        <td className="p-3 text-right font-bold">{s.mark}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-between items-center pt-4 border-t">
                  <div>
                    <p className="text-xs text-slate-500">Total Marks: <strong>{generatedMarksheet.total} / 400</strong></p>
                    <p className="text-xs text-slate-500">Average: <strong>{generatedMarksheet.avg}%</strong></p>
                  </div>
                  <button onClick={() => window.print()} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-800">
                    <Printer size={16} /> প্রিন্ট / PDF
                  </button>
                </div>
              </div>
            )}
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

            <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl space-y-4 max-w-xl shadow-xl">
              {editSchool ? (
                <form onSubmit={handleUpdateSchool} className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">স্কুলের নাম</label>
                    <input
                      type="text"
                      value={school.school_name}
                      onChange={(e) => setSchool({ ...school, school_name: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">ঠিকানা</label>
                    <input
                      type="text"
                      value={school.address}
                      onChange={(e) => setSchool({ ...school, address: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">ফোন নম্বর</label>
                    <input
                      type="text"
                      value={school.phone}
                      onChange={(e) => setSchool({ ...school, phone: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button type="submit" className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/20">
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
