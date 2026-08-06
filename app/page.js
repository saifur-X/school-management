'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Users, CreditCard, FileSpreadsheet, UserCheck, Key, LogOut, Plus, School, Search, ArrowUpCircle, DollarSign, Settings, Trash2, Edit, Save } from 'lucide-react';

export default function Dashboard() {
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState([]);
  const [classList, setClassList] = useState(['Class 1','Class 2','Class 3','Class 4','Class 5','Class 6','Class 7','Class 8','Class 9','Class 10','Class 11','Class 12']);
  const [customClassInput, setCustomClassInput] = useState('');
  const [isAddingCustomClass, setIsAddingCustomClass] = useState(false);

  // Student Form
  const [formData, setFormData] = useState({ id: null, name: '', rollNo: '', studentClass: 'Class 1', phone: '', bloodGroup: '', address: '', gender: 'Male', photoUrl: '' });
  const [isEditingStudent, setIsEditingStudent] = useState(false);

  // Class Management States
  const [selectedConfigClass, setSelectedConfigClass] = useState('Class 1');
  const [classConfig, setClassConfig] = useState({
    subjects: [{ name: 'Bangla', oral: 20, theory: 80 }],
    admission_fee: 1000, tuition_fee: 500, exam1_fee: 200, exam2_fee: 200, exam3_fee: 200, custom_fee: 0
  });

  // ERP States
  const [erpStudent, setErpStudent] = useState(null);
  const [erpFeeType, setErpFeeType] = useState('Tuition Fee');
  const [erpBaseAmount, setErpBaseAmount] = useState(0);
  const [erpDiscount, setErpDiscount] = useState(0);

  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login');
      else {
        setSession(session);
        fetchStudents();
        loadClassConfigs();
      }
    });
  }, [router]);

  const fetchStudents = async () => {
    const { data } = await supabase.from('students').select('*').order('student_class', { ascending: true }).order('roll_no', { ascending: true });
    setStudents(data || []);
  };

  const loadClassConfigs = async () => {
    const { data } = await supabase.from('class_configs').select('class_name');
    if (data) {
      const customClasses = data.map(d => d.class_name);
      setClassList(prev => Array.from(new Set([...prev, ...customClasses])));
    }
  };

  const getNextRollForClass = (cls) => {
    const classSts = students.filter(s => s.student_class === cls);
    return classSts.length === 0 ? 1 : Math.max(...classSts.map(s => s.roll_no)) + 1;
  };

  const handleAddCustomClass = () => {
    if (!customClassInput) return;
    if (!classList.includes(customClassInput)) {
      setClassList([...classList, customClassInput]);
      setFormData({ ...formData, studentClass: customClassInput, rollNo: getNextRollForClass(customClassInput) });
    }
    setCustomClassInput('');
    setIsAddingCustomClass(false);
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    if (!formData.name) return alert('নাম পূরণ করা আবশ্যক!');

    if (isEditingStudent) {
      await supabase.from('students').update({
        name: formData.name, student_class: formData.studentClass, phone: formData.phone, blood_group: formData.bloodGroup, gender: formData.gender, photo_url: formData.photoUrl
      }).eq('id', formData.id);
    } else {
      const roll = getNextRollForClass(formData.studentClass);
      await supabase.from('students').insert([{
        name: formData.name, roll_no: roll, student_class: formData.studentClass, phone: formData.phone, blood_group: formData.bloodGroup, gender: formData.gender, photo_url: formData.photoUrl
      }]);
    }

    setFormData({ id: null, name: '', rollNo: getNextRollForClass('Class 1'), studentClass: 'Class 1', phone: '', bloodGroup: '', address: '', gender: 'Male', photoUrl: '' });
    setIsEditingStudent(false);
    fetchStudents();
  };

  // Class Management Functions
  const fetchClassConfigDetails = async (cls) => {
    setSelectedConfigClass(cls);
    const { data } = await supabase.from('class_configs').select('*').eq('class_name', cls).single();
    if (data) {
      setClassConfig(data);
    } else {
      setClassConfig({
        subjects: [{ name: 'Bangla', oral: 20, theory: 80 }, { name: 'English', oral: 20, theory: 80 }],
        admission_fee: 1000, tuition_fee: 500, exam1_fee: 200, exam2_fee: 200, exam3_fee: 200, custom_fee: 0
      });
    }
  };

  const handleSaveClassConfig = async () => {
    const { error } = await supabase.from('class_configs').upsert({
      class_name: selectedConfigClass,
      subjects: classConfig.subjects,
      admission_fee: classConfig.admission_fee,
      tuition_fee: classConfig.tuition_fee,
      exam1_fee: classConfig.exam1_fee,
      exam2_fee: classConfig.exam2_fee,
      exam3_fee: classConfig.exam3_fee,
      custom_fee: classConfig.custom_fee
    }, { onConflict: 'class_name' });

    if (error) alert('সেভ করা যায়নি: ' + error.message);
    else alert('Class Settings & Subjects সেভ হয়েছে!');
  };

  const handleAddSubjectField = () => {
    setClassConfig({
      ...classConfig,
      subjects: [...classConfig.subjects, { name: '', oral: 20, theory: 80 }]
    });
  };

  // ERP Billing Handlers
  const handleSelectErpStudent = async (st) => {
    setErpStudent(st);
    const { data } = await supabase.from('class_configs').select('*').eq('class_name', st.student_class).single();
    if (data) {
      setErpBaseAmount(data.tuition_fee || 0);
    }
  };

  const handleCreateInvoice = async () => {
    if (!erpStudent) return alert('স্টুডেন্ট সিলেক্ট করুন!');
    const finalAmount = Number(erpBaseAmount) - Number(erpDiscount);
    const { error } = await supabase.from('erp_transactions').insert([{
      student_id: erpStudent.id,
      fee_type: erpFeeType,
      amount: Number(erpBaseAmount),
      discount: Number(erpDiscount),
      final_amount: finalAmount,
      status: 'Paid'
    }]);

    if (error) alert(error.message);
    else alert('ERP Invoice Generated & Payment Collected!');
  };

  if (!session) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading EduAdmin...</div>;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-950 text-slate-100 font-sans">
      <aside className="w-full md:w-72 bg-slate-900/80 backdrop-blur-xl border-r border-slate-800/80 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-3 rounded-2xl shadow-lg">
              <School className="text-white" size={26} />
            </div>
            <div>
              <h1 className="text-xl font-black text-blue-400">EduAdmin ERP</h1>
              <p className="text-xs text-slate-400">Advanced School Suite</p>
            </div>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'dashboard', label: 'ভর্তি ও ড্যাশবোর্ড', icon: LayoutDashboard },
              { id: 'class_mgmt', label: 'Class Management', icon: Settings },
              { id: 'erp', label: 'ERP Billing System', icon: DollarSign },
              { id: 'students', label: 'স্টুডেন্ট লিস্ট', icon: Users },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === item.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}

            {/* Separate Link for Dedicated Mark Entry Page */}
            <button
              onClick={() => router.push('/mark-entry')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-emerald-400 hover:bg-slate-800 border border-emerald-500/20 mt-4"
            >
              <FileSpreadsheet size={18} />
              মার্ক্স এনট্রি পেজ →
            </button>
          </nav>
        </div>

        <button onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} className="flex items-center gap-2 text-red-400 p-3">
          <LogOut size={16} /> লগ আউট
        </button>
      </aside>

      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {/* ADMISSION FORM TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">স্টুডেন্ট ভর্তি ও এডমিশন প্যানেল</h2>
            <form onSubmit={handleSaveStudent} className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-xs text-slate-400 block mb-2">ক্লাস সিলেক্ট করুন</label>
                  {!isAddingCustomClass ? (
                    <select
                      value={formData.studentClass}
                      onChange={(e) => {
                        if (e.target.value === 'CUSTOM') setIsAddingCustomClass(true);
                        else setFormData({ ...formData, studentClass: e.target.value, rollNo: getNextRollForClass(e.target.value) });
                      }}
                      className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white"
                    >
                      {classList.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                      <option value="CUSTOM">+ Custom Class যোগ করুন</option>
                    </select>
                  ) : (
                    <div className="flex gap-2">
                      <input type="text" placeholder="Custom Class Name" value={customClassInput} onChange={(e) => setCustomClassInput(e.target.value)} className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-white flex-1" />
                      <button type="button" onClick={handleAddCustomClass} className="bg-blue-600 px-4 py-2 rounded-xl text-xs font-bold">Save</button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-2">অটো রোল</label>
                  <input type="text" value={`#${getNextRollForClass(formData.studentClass)} (Auto)`} disabled className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-blue-400 font-bold" />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-2">স্টুডেন্টের নাম *</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white" required />
                </div>
              </div>

              <button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3.5 rounded-xl font-bold">
                স্টুডেন্ট সেভ করুন
              </button>
            </form>
          </div>
        )}

        {/* CLASS MANAGEMENT TAB */}
        {activeTab === 'class_mgmt' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Class Management & Fee Structure</h2>
            <div className="flex gap-4">
              <select value={selectedConfigClass} onChange={(e) => fetchClassConfigDetails(e.target.value)} className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-white">
                {classList.map(cls => <option key={cls} value={cls}>{cls}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Subjects & Full Marks Management */}
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-4">
                <h3 className="text-lg font-bold text-blue-400">সাবজেক্ট ও মার্ক্স কনফিগারেশন ({selectedConfigClass})</h3>
                {classConfig.subjects.map((sub, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input type="text" placeholder="Subject Name" value={sub.name} onChange={(e) => {
                      const updated = [...classConfig.subjects];
                      updated[idx].name = e.target.value;
                      setClassConfig({ ...classConfig, subjects: updated });
                    }} className="bg-slate-950 border border-slate-800 p-2 rounded-lg text-white flex-1 text-xs" />
                    <input type="number" placeholder="Oral Max" value={sub.oral} onChange={(e) => {
                      const updated = [...classConfig.subjects];
                      updated[idx].oral = parseInt(e.target.value) || 0;
                      setClassConfig({ ...classConfig, subjects: updated });
                    }} className="bg-slate-950 border border-slate-800 p-2 rounded-lg text-white w-20 text-xs text-center" />
                    <input type="number" placeholder="Theory Max" value={sub.theory} onChange={(e) => {
                      const updated = [...classConfig.subjects];
                      updated[idx].theory = parseInt(e.target.value) || 0;
                      setClassConfig({ ...classConfig, subjects: updated });
                    }} className="bg-slate-950 border border-slate-800 p-2 rounded-lg text-white w-20 text-xs text-center" />
                  </div>
                ))}
                <button type="button" onClick={handleAddSubjectField} className="text-xs bg-slate-800 text-blue-400 px-3 py-2 rounded-lg">+ সাবজেক্ট যোগ করুন</button>
              </div>

              {/* Fees Structure Config */}
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-4">
                <h3 className="text-lg font-bold text-emerald-400">ফি স্ট্রাকচার ({selectedConfigClass})</h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Admission Fee</label>
                    <input type="number" value={classConfig.admission_fee} onChange={(e) => setClassConfig({ ...classConfig, admission_fee: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white" />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Monthly Tuition Fee</label>
                    <input type="number" value={classConfig.tuition_fee} onChange={(e) => setClassConfig({ ...classConfig, tuition_fee: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white" />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Term 1 Exam Fee</label>
                    <input type="number" value={classConfig.exam1_fee} onChange={(e) => setClassConfig({ ...classConfig, exam1_fee: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white" />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Term 2 Exam Fee</label>
                    <input type="number" value={classConfig.exam2_fee} onChange={(e) => setClassConfig({ ...classConfig, exam2_fee: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white" />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Term 3 Exam Fee</label>
                    <input type="number" value={classConfig.exam3_fee} onChange={(e) => setClassConfig({ ...classConfig, exam3_fee: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white" />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Custom Fee</label>
                    <input type="number" value={classConfig.custom_fee} onChange={(e) => setClassConfig({ ...classConfig, custom_fee: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white" />
                  </div>
                </div>
              </div>
            </div>

            <button onClick={handleSaveClassConfig} className="bg-emerald-600 px-8 py-3 rounded-xl font-bold">
              Class Config সেভ করুন
            </button>
          </div>
        )}

        {/* ERP BILLING TAB */}
        {activeTab === 'erp' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">ERP Financial & Billing System</h2>
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-4 max-w-xl">
              <label className="text-xs text-slate-400 block">স্টুডেন্ট সিলেক্ট করুন</label>
              <select onChange={(e) => handleSelectErpStudent(students.find(s => s.id === e.target.value))} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white">
                <option value="">স্টুডেন্ট বেছে নিন</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name} (Class: {s.student_class} - Roll: #{s.roll_no})</option>)}
              </select>

              {erpStudent && (
                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <p className="text-sm font-bold text-blue-400">ক্লাস ফিস ডাটা লোড হয়েছে: {erpStudent.student_class}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">ফি টাইপ</label>
                      <select value={erpFeeType} onChange={(e) => setErpFeeType(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white text-xs">
                        <option value="Tuition Fee">Tuition Fee</option>
                        <option value="Admission Fee">Admission Fee</option>
                        <option value="Exam Fee">Exam Fee</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Base Amount (Editiable)</label>
                      <input type="number" value={erpBaseAmount} onChange={(e) => setErpBaseAmount(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Discount Amount</label>
                    <input type="number" value={erpDiscount} onChange={(e) => setErpDiscount(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white" />
                  </div>
                  <div className="p-4 bg-slate-950 rounded-xl flex justify-between items-center">
                    <span className="text-xs text-slate-400">Final Payable:</span>
                    <span className="text-xl font-black text-emerald-400">৳ {Number(erpBaseAmount) - Number(erpDiscount)}</span>
                  </div>
                  <button onClick={handleCreateInvoice} className="w-full bg-emerald-600 py-3 rounded-xl font-bold">
                    Collect & Print Receipt
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STUDENTS LIST TAB */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">স্টুডেন্টদের তালিকা</h2>
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
              {students.map(st => (
                <div key={st.id} className="flex justify-between items-center p-3 border-b border-slate-800">
                  <p>#{st.roll_no} - {st.name} ({st.student_class})</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
