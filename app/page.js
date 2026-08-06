'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Users, CreditCard, FileSpreadsheet, UserCheck, Key, LogOut, 
  Plus, School, Search, ArrowUpCircle, DollarSign, Settings, Trash2, Edit, Save, 
  X, User, BookOpen, Phone, Droplet, MapPin, Image, Printer, AlertCircle, PhoneCall, Calendar
} from 'lucide-react';

export default function Dashboard() {
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // School Profile
  const [school, setSchool] = useState({ school_name: '', address: '', phone: '', email: '' });
  const [editSchool, setEditSchool] = useState(false);

  // Class List & Custom Support
  const [classList, setClassList] = useState(['Class 1','Class 2','Class 3','Class 4','Class 5','Class 6','Class 7','Class 8','Class 9','Class 10','Class 11','Class 12']);
  const [customClassInput, setCustomClassInput] = useState('');
  const [isAddingCustomClass, setIsAddingCustomClass] = useState(false);

  // Global Filter & Search
  const [selectedClassFilter, setSelectedClassFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Student Form & Detail Modal State
  const [formData, setFormData] = useState({
    id: null, name: '', fatherName: '', rollNo: '', studentClass: 'Class 1', phone: '', bloodGroup: '', address: '', gender: 'Male', photoUrl: ''
  });
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [contactModalStudent, setContactModalStudent] = useState(null);

  // ID Card State
  const [selectedIdStudent, setSelectedIdStudent] = useState(null);

  // Class Management States
  const [selectedConfigClass, setSelectedConfigClass] = useState('Class 1');
  const [classConfig, setClassConfig] = useState({
    academic_year: '2026',
    start_month: 1,
    subjects: [{ name: 'Bangla', oral: 20, theory: 80 }, { name: 'English', oral: 20, theory: 80 }],
    admission_fee: 1000, tuition_fee: 500, exam1_fee: 200, exam2_fee: 200, exam3_fee: 200, custom_fee: 0
  });

  // ERP Billing & Pending Tracker States
  const [erpStudent, setErpStudent] = useState(null);
  const [erpFeeType, setErpFeeType] = useState('Tuition Fee');
  const [erpBaseAmount, setErpBaseAmount] = useState(0);
  const [erpPaidAmount, setErpPaidAmount] = useState(0);
  const [erpDiscount, setErpDiscount] = useState(0);
  const [erpTransactions, setErpTransactions] = useState([]);
  const [allErpTransactions, setAllErpTransactions] = useState([]);
  const [showOnlyPendingList, setShowOnlyPendingList] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  const monthsName = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login');
      else {
        setSession(session);
        fetchStudents();
        fetchSchoolDetails();
        loadClassConfigs();
        fetchAllErpTransactions();
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
    const { data } = await supabase.from('students').select('*').order('student_class', { ascending: true }).order('roll_no', { ascending: true });
    setStudents(data || []);
    setLoading(false);
  };

  const fetchSchoolDetails = async () => {
    const { data } = await supabase.from('school_settings').select('*').eq('id', 1).single();
    if (data) setSchool(data);
  };

  const loadClassConfigs = async () => {
    const { data } = await supabase.from('class_configs').select('class_name');
    if (data) {
      const customClasses = data.map(d => d.class_name);
      setClassList(prev => Array.from(new Set([...prev, ...customClasses])));
    }
  };

  const fetchAllErpTransactions = async () => {
    const { data } = await supabase.from('erp_transactions').select('*, students(name, roll_no, student_class, phone)');
    setAllErpTransactions(data || []);
  };

  const getNextRollForClass = (cls) => {
    const classSts = students.filter(s => s.student_class === cls);
    return classSts.length === 0 ? 1 : Math.max(...classSts.map(s => s.roll_no)) + 1;
  };

  const handleAddCustomClass = () => {
    if (!customClassInput.trim()) return;
    if (!classList.includes(customClassInput)) {
      setClassList([...classList, customClassInput]);
      setFormData({ ...formData, studentClass: customClassInput, rollNo: getNextRollForClass(customClassInput) });
    }
    setCustomClassInput('');
    setIsAddingCustomClass(false);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleClassChangeInForm = (e) => {
    const cls = e.target.value;
    if (cls === 'CUSTOM') {
      setIsAddingCustomClass(true);
    } else {
      setIsAddingCustomClass(false);
      setFormData({ ...formData, studentClass: cls, rollNo: getNextRollForClass(cls) });
    }
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.studentClass) return alert('নাম এবং ক্লাস পূরণ করা আবশ্যক!');

    if (isEditingStudent) {
      const { error } = await supabase.from('students').update({
        name: formData.name,
        father_name: formData.fatherName,
        student_class: formData.studentClass,
        phone: formData.phone,
        blood_group: formData.bloodGroup,
        address: formData.address,
        gender: formData.gender,
        photo_url: formData.photoUrl || 'https://via.placeholder.com/150'
      }).eq('id', formData.id);

      if (error) alert('আপডেট ব্যর্থ: ' + error.message);
      else {
        alert('স্টুডেন্টের তথ্য সফলভাবে আপডেট হয়েছে!');
        resetStudentForm();
        fetchStudents();
      }
    } else {
      const roll = getNextRollForClass(formData.studentClass);
      const { error } = await supabase.from('students').insert([{
        name: formData.name,
        father_name: formData.fatherName,
        roll_no: roll,
        student_class: formData.studentClass,
        phone: formData.phone,
        blood_group: formData.bloodGroup,
        address: formData.address,
        gender: formData.gender,
        photo_url: formData.photoUrl || 'https://via.placeholder.com/150',
        email: `student_${formData.studentClass}_${roll}@school.com`
      }]);

      if (error) alert('এরর: ' + error.message);
      else {
        alert(`সফলভাবে স্টুডেন্ট যুক্ত হয়েছে (রোল: #${roll})!`);
        resetStudentForm();
        fetchStudents();
      }
    }
  };

  const handleEditClick = (st) => {
    setFormData({
      id: st.id, 
      name: st.name, 
      fatherName: st.father_name || '', 
      rollNo: st.roll_no, 
      studentClass: st.student_class,
      phone: st.phone || '', 
      bloodGroup: st.blood_group || '', 
      address: st.address || '', 
      gender: st.gender || 'Male', 
      photoUrl: st.photo_url || ''
    });
    setIsEditingStudent(true);
    setActiveTab('dashboard');
  };

  const handleDeleteStudent = async (id, className) => {
    if (confirm('আপনি কি নিশ্চিত এই স্টুডেন্টকে ডিলিট করতে চান? রোল স্বয়ংক্রিয়ভাবে রি-অর্ডার হয়ে যাবে।')) {
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (error) {
        alert('ডিলিট করা যায়নি: ' + error.message);
        return;
      }

      const remainingInClass = students.filter(s => s.student_class === className && s.id !== id);
      for (let i = 0; i < remainingInClass.length; i++) {
        await supabase.from('students').update({ roll_no: i + 1 }).eq('id', remainingInClass[i].id);
      }

      alert('স্টুডেন্ট মুছে ফেলা হয়েছে এবং রোল পুনঃবিন্যাস করা হয়েছে!');
      fetchStudents();
    }
  };

  const handleUpgradeClass = (currentClass) => {
    const nextClassMap = { 
      'Class 1': 'Class 2', 'Class 2': 'Class 3', 'Class 3': 'Class 4', 'Class 4': 'Class 5',
      'Class 5': 'Class 6', 'Class 6': 'Class 7', 'Class 7': 'Class 8', 'Class 8': 'Class 9', 
      'Class 9': 'Class 10', 'Class 10': 'Class 11', 'Class 11': 'Class 12', 'Class 12': 'Graduated' 
    };
    const targetClass = nextClassMap[currentClass] || 'Higher Class';

    if (confirm(`আপনি কি ${currentClass} এর সকল স্টুডেন্টকে ${targetClass} এ প্রমোট করতে চান?`)) {
      const classSts = students.filter(s => s.student_class === currentClass);
      Promise.all(classSts.map(async (st, idx) => {
        await supabase.from('students').update({ student_class: targetClass, roll_no: idx + 1 }).eq('id', st.id);
      })).then(() => {
        alert('ক্লাস সফলভাবে আপগ্রেড করা হয়েছে!');
        fetchStudents();
      });
    }
  };

  const resetStudentForm = () => {
    setFormData({ id: null, name: '', fatherName: '', rollNo: getNextRollForClass('Class 1'), studentClass: 'Class 1', phone: '', bloodGroup: '', address: '', gender: 'Male', photoUrl: '' });
    setIsEditingStudent(false);
  };

  const handleUpdateSchool = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('school_settings').update(school).eq('id', 1);
    if (error) alert(error.message);
    else {
      alert('স্কুলের তথ্য আপডেট হয়েছে!');
      setEditSchool(false);
    }
  };

  const filterStudentsList = (list) => {
    return list.filter(st => {
      const matchClass = selectedClassFilter === 'All' || st.student_class === selectedClassFilter;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchClass;
      const nameMatch = st.name.toLowerCase().includes(q) || st.name.toLowerCase().split('').some(char => q.includes(char));
      const rollMatch = st.roll_no.toString().includes(q);
      return matchClass && (nameMatch || rollMatch);
    });
  };

  const fetchClassConfigDetails = async (cls) => {
    setSelectedConfigClass(cls);
    const { data } = await supabase.from('class_configs').select('*').eq('class_name', cls).single();
    if (data) {
      setClassConfig({
        academic_year: data.academic_year || '2026',
        start_month: data.start_month || 1,
        subjects: data.subjects || [{ name: 'Bangla', oral: 20, theory: 80 }, { name: 'English', oral: 20, theory: 80 }],
        admission_fee: data.admission_fee || 1000,
        tuition_fee: data.tuition_fee || 500,
        exam1_fee: data.exam1_fee || 200,
        exam2_fee: data.exam2_fee || 200,
        exam3_fee: data.exam3_fee || 200,
        custom_fee: data.custom_fee || 0
      });
    } else {
      setClassConfig({
        academic_year: '2026',
        start_month: 1,
        subjects: [{ name: 'Bangla', oral: 20, theory: 80 }, { name: 'English', oral: 20, theory: 80 }],
        admission_fee: 1000, tuition_fee: 500, exam1_fee: 200, exam2_fee: 200, exam3_fee: 200, custom_fee: 0
      });
    }
  };

  const handleSaveClassConfig = async () => {
    const { error } = await supabase.from('class_configs').upsert({
      class_name: selectedConfigClass,
      academic_year: classConfig.academic_year,
      start_month: parseInt(classConfig.start_month) || 1,
      subjects: classConfig.subjects,
      admission_fee: classConfig.admission_fee,
      tuition_fee: classConfig.tuition_fee,
      exam1_fee: classConfig.exam1_fee,
      exam2_fee: classConfig.exam2_fee,
      exam3_fee: classConfig.exam3_fee,
      custom_fee: classConfig.custom_fee
    }, { onConflict: 'class_name' });

    if (error) alert('সেভ করা যায়নি: ' + error.message);
    else alert('Class Settings & Academic Config সেভ হয়েছে!');
  };

  const handleAddSubjectField = () => {
    setClassConfig({
      ...classConfig,
      subjects: [...classConfig.subjects, { name: '', oral: 20, theory: 80 }]
    });
  };

  const updateBaseFeeBySelection = (feeType, configData, studentTransactions = erpTransactions) => {
    if (!configData) return;
    setErpFeeType(feeType);
    
    const previousTx = studentTransactions.find(tx => tx.fee_type === feeType);

    if (feeType === 'Tuition Fee') {
      const currentMonth = new Date().getMonth() + 1;
      const startM = configData.start_month || 1;
      const activeMonthsCount = Math.max(1, (currentMonth - startM) + 1);
      const calculatedTuition = (configData.tuition_fee || 0) * activeMonthsCount;
      setErpBaseAmount(calculatedTuition);
    } else {
      let feeVal = 0;
      if (feeType === 'Admission Fee') feeVal = configData.admission_fee || 0;
      else if (feeType === 'Term 1 Exam Fee') feeVal = configData.exam1_fee || 0;
      else if (feeType === 'Term 2 Exam Fee') feeVal = configData.exam2_fee || 0;
      else if (feeType === 'Term 3 Exam Fee') feeVal = configData.exam3_fee || 0;
      else if (feeType === 'Custom Fee') feeVal = configData.custom_fee || 0;

      if (previousTx && previousTx.status === 'Paid') {
        setErpBaseAmount(0);
      } else if (previousTx && previousTx.pending_amount > 0) {
        setErpBaseAmount(previousTx.pending_amount);
      } else {
        setErpBaseAmount(feeVal);
      }
    }
  };

  const handleSelectErpStudent = async (st) => {
    setErpStudent(st);
    if (!st) return;

    const { data: txData } = await supabase.from('erp_transactions').select('*').eq('student_id', st.id).order('created_at', { ascending: false });
    const currentTxList = txData || [];
    setErpTransactions(currentTxList);

    const { data: configData } = await supabase.from('class_configs').select('*').eq('class_name', st.student_class).single();
    if (configData) {
      updateBaseFeeBySelection(erpFeeType, configData, currentTxList);
    }
  };

  const handleCreateInvoice = async () => {
    if (!erpStudent) return alert('স্টুডেন্ট সিলেক্ট করুন!');
    
    const base = Number(erpBaseAmount) || 0;
    const disc = Number(erpDiscount) || 0;
    const paid = Number(erpPaidAmount) || 0;
    const finalPayable = base - disc;
    const pending = finalPayable - paid;
    const status = pending <= 0 ? 'Paid' : 'Pending';

    const { data, error } = await supabase.from('erp_transactions').insert([{
      student_id: erpStudent.id,
      fee_type: erpFeeType,
      amount: base,
      discount: disc,
      final_amount: finalPayable,
      paid_amount: paid,
      pending_amount: pending > 0 ? pending : 0,
      status: status
    }]).select().single();

    if (error) {
      alert('ট্রানজেকশন ব্যর্থ: ' + error.message);
    } else {
      setReceiptData({
        invoiceNo: data?.id ? data.id.substring(0, 8).toUpperCase() : 'INV-101',
        date: new Date().toLocaleDateString('en-GB'),
        student: erpStudent,
        feeType: erpFeeType,
        baseAmount: base,
        discount: disc,
        finalPayable: finalPayable,
        paidAmount: paid,
        pendingAmount: pending > 0 ? pending : 0,
        status: status
      });

      alert('ফি জমার রসিদ তৈরি হয়েছে!');
      handleSelectErpStudent(erpStudent);
      fetchAllErpTransactions();
    }
  };

  // Financial Totals calculation with robust checks
  const totalCollectedRevenue = allErpTransactions.reduce((acc, curr) => acc + (Number(curr.paid_amount) || Number(curr.final_amount) || 0), 0);
  const totalPendingDue = allErpTransactions.reduce((acc, curr) => {
    const pending = Number(curr.pending_amount) || (Number(curr.final_amount || 0) - Number(curr.paid_amount || 0));
    return acc + (pending > 0 ? pending : 0);
  }, 0);
  
  const pendingTransactionsList = allErpTransactions.filter(tx => (Number(tx.pending_amount) > 0) || tx.status === 'Pending');

  if (!session) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-medium">Loading EduAdmin...</div>;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-950 text-slate-100 font-sans">
      
      {/* STUDENT CONTACT DETAILS MODAL */}
      {contactModalStudent && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-sm w-full space-y-4 shadow-2xl relative">
            <button onClick={() => setContactModalStudent(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X size={18} />
            </button>
            <div className="text-center">
              <img src={contactModalStudent.photo_url || 'https://via.placeholder.com/150'} alt="" className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-blue-500 mb-3" />
              <h3 className="text-xl font-bold text-white">{contactModalStudent.name}</h3>
              {contactModalStudent.father_name && <p className="text-xs text-slate-400">Father: {contactModalStudent.father_name}</p>}
              <p className="text-xs text-blue-400 font-semibold mt-1">{contactModalStudent.student_class} | Roll: #{contactModalStudent.roll_no}</p>
            </div>
            
            <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300">
              <div className="flex items-center gap-3">
                <Phone className="text-blue-400" size={16} />
                <div>
                  <p className="text-[10px] text-slate-500">Contact Number</p>
                  <p className="font-bold text-white">{contactModalStudent.phone || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Droplet className="text-rose-400" size={16} />
                <div>
                  <p className="text-[10px] text-slate-500">Blood Group</p>
                  <p className="font-bold text-rose-400">{contactModalStudent.blood_group || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="text-emerald-400" size={16} />
                <div>
                  <p className="text-[10px] text-slate-500">Address</p>
                  <p className="font-medium">{contactModalStudent.address || 'N/A'}</p>
                </div>
              </div>
            </div>

            {contactModalStudent.phone && (
              <a href={`tel:${contactModalStudent.phone}`} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-xs transition">
                <PhoneCall size={16} /> কল করুন ({contactModalStudent.phone})
              </a>
            )}
          </div>
        </div>
      )}

      {/* PRINTABLE MONEY RECEIPT & MARKSHEET MODAL */}
      {receiptData && (
        <div className="fixed inset-0 bg-white text-slate-900 z-50 p-6 overflow-y-auto print:p-0">
          <style jsx global>{`
            @media print {
              @page { size: A4 portrait; margin: 5mm; }
              body { background: #ffffff !important; color: #000000 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
              .no-print { display: none !important; }
              .print-container {
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 10px !important;
                box-shadow: none !important;
                border: 1px solid #000 !important;
                page-break-inside: avoid;
              }
            }
          `}</style>

          <div className="max-w-xl mx-auto flex justify-between items-center mb-4 no-print">
            <button onClick={() => setReceiptData(null)} className="bg-slate-200 px-4 py-2 rounded-lg font-bold text-xs text-slate-800">
              <X size={16} /> বন্ধ করুন
            </button>
            <button onClick={() => window.print()} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-lg">
              <Printer size={16} /> রসিদ প্রিন্ট / Save PDF
            </button>
          </div>

          <div className="print-container max-w-xl mx-auto border-2 border-slate-900 p-8 rounded-xl bg-white shadow-2xl relative">
            <div className="text-center border-b-2 border-slate-900 pb-4 mb-4">
              <h1 className="text-2xl font-black uppercase text-slate-900">{school.school_name || 'ISLAMIC NATIONAL SCHOOL'}</h1>
              <p className="text-xs text-slate-600">{school.address} | Phone: {school.phone}</p>
              <span className="inline-block bg-slate-900 text-white font-bold text-[10px] uppercase px-3 py-1 rounded mt-2">
                OFFICIAL PAYMENT RECEIPT
              </span>
            </div>

            <div className="flex justify-between text-xs mb-4">
              <p><strong>Receipt No:</strong> #{receiptData.invoiceNo}</p>
              <p><strong>Date:</strong> {receiptData.date}</p>
            </div>

            <div className="bg-slate-100 p-3 rounded-lg text-xs space-y-1 border mb-4">
              <p><strong>Student Name:</strong> {receiptData.student.name}</p>
              {receiptData.student.father_name && <p><strong>Father's Name:</strong> {receiptData.student.father_name}</p>}
              <p><strong>Class:</strong> {receiptData.student.student_class} | <strong>Roll:</strong> #{receiptData.student.roll_no}</p>
              <p><strong>Contact Phone:</strong> {receiptData.student.phone || 'N/A'}</p>
            </div>

            <table className="w-full text-left text-xs border-collapse border border-slate-900 mb-4">
              <thead>
                <tr className="bg-slate-200 border-b border-slate-900">
                  <th className="p-2 border-r border-slate-900">Description / Fee Type</th>
                  <th className="p-2 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-900">
                  <td className="p-2 border-r border-slate-900 font-semibold">{receiptData.feeType}</td>
                  <td className="p-2 text-right font-bold">₹{receiptData.baseAmount}</td>
                </tr>
                {receiptData.discount > 0 && (
                  <tr className="border-b border-slate-900 text-rose-600">
                    <td className="p-2 border-r border-slate-900">Special Discount (-)</td>
                    <td className="p-2 text-right font-bold">-₹{receiptData.discount}</td>
                  </tr>
                )}
                <tr className="bg-slate-100 font-bold border-b border-slate-900">
                  <td className="p-2 border-r border-slate-900">Total Net Payable</td>
                  <td className="p-2 text-right text-blue-900">₹{receiptData.finalPayable}</td>
                </tr>
                <tr className="bg-emerald-50 text-emerald-800 font-bold border-b border-slate-900">
                  <td className="p-2 border-r border-slate-900">Amount Paid</td>
                  <td className="p-2 text-right">₹{receiptData.paidAmount}</td>
                </tr>
                {receiptData.pendingAmount > 0 && (
                  <tr className="bg-rose-50 text-rose-800 font-bold">
                    <td className="p-2 border-r border-slate-900">Due / Pending Amount</td>
                    <td className="p-2 text-right">₹{receiptData.pendingAmount}</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex justify-between items-center text-xs mt-8 pt-4 border-t border-dashed">
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Payment Status: <span className={receiptData.status === 'Paid' ? 'text-emerald-700 font-black' : 'text-rose-700 font-black'}>{receiptData.status}</span></p>
              </div>
              <div className="text-center">
                <div className="w-32 border-b border-slate-900 mb-1"></div>
                <p className="text-[10px] text-slate-500">Authorized Accountant</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR NAVIGATION */}
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
              { id: 'dashboard', label: 'ভর্তি ও ড্যাশবোর্ড', icon: LayoutDashboard },
              { id: 'students', label: 'স্টুডেন্ট লিস্ট ও আপগ্রেড', icon: Users },
              { id: 'class_mgmt', label: 'Class Management', icon: Settings },
              { id: 'erp', label: 'ERP Billing & Fees', icon: DollarSign },
              { id: 'idcard', label: 'আইডি কার্ড জেনারেটর', icon: CreditCard },
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

            <button
              onClick={() => router.push('/mark-entry')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition mt-4"
            >
              <FileSpreadsheet size={18} />
              মার্ক্স এনট্রি ও মার্কশিট →
            </button>
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800/80 space-y-2">
          <button onClick={() => router.push('/change-password')} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-white transition">
            <Key size={16} /> পাসওয়ার্ড পরিবর্তন
          </button>
          <button onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition">
            <LogOut size={16} /> লগ আউট
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        
        {/* DASHBOARD & ADMISSION TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            <header className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold">ওভারভিউ ও ভর্তি</h2>
                <p className="text-slate-400 text-sm mt-1">অটোমেটিক রোল জেনারেটর সিস্টেম সক্রিয়</p>
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

            <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-lg p-6 md:p-8 rounded-2xl shadow-xl">
              <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold flex items-center gap-2 text-blue-400">
                  <Plus size={22}/> {isEditingStudent ? 'স্টুডেন্টের তথ্য পরিবর্তন করুন' : 'নতুন স্টুডেন্ট ভর্তি করুন'}
                </h3>
                {isEditingStudent && (
                  <button onClick={resetStudentForm} className="text-xs bg-slate-800 px-3 py-1.5 rounded-lg text-slate-300 flex items-center gap-1">
                    <X size={14}/> বাতিল
                  </button>
                )}
              </div>
              
              <form onSubmit={handleSaveStudent} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2"><BookOpen size={14}/> ক্লাস সিলেক্ট করুন *</label>
                    {!isAddingCustomClass ? (
                      <select name="studentClass" value={formData.studentClass} onChange={handleClassChangeInForm} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-white">
                        {classList.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                        <option value="CUSTOM">+ Custom Class যোগ করুন</option>
                      </select>
                    ) : (
                      <div className="flex gap-2">
                        <input type="text" placeholder="Class Name" value={customClassInput} onChange={(e) => setCustomClassInput(e.target.value)} className="bg-slate-950 border border-slate-800 px-3 py-3 rounded-xl text-white flex-1 text-xs" />
                        <button type="button" onClick={handleAddCustomClass} className="bg-blue-600 px-4 py-2 rounded-xl text-xs font-bold">Save</button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 mb-2 block">অটো রোল নম্বর</label>
                    <input type="text" value={`#${formData.rollNo || getNextRollForClass(formData.studentClass)} (Auto)`} disabled className="w-full bg-slate-900 border border-slate-800 px-4 py-3 rounded-xl text-blue-400 font-bold" />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2"><User size={14}/> স্টুডেন্টের নাম *</label>
                    <input type="text" name="name" placeholder="যেমন: Amit Kumar" value={formData.name} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-white" required />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2"><User size={14}/> বাবার নাম</label>
                    <input type="text" name="fatherName" placeholder="অভিভাবক/বাবার নাম" value={formData.fatherName} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-white" />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2"><Phone size={14}/> মোবাইল নম্বর</label>
                    <input type="text" name="phone" placeholder="+91 ..." value={formData.phone} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-white" />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2"><Droplet size={14}/> ব্লাড গ্রুপ</label>
                    <select name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-white">
                      <option value="">সিলেক্ট করুন</option>
                      <option value="A+">A+</option><option value="A-">A-</option>
                      <option value="B+">B+</option><option value="B-">B-</option>
                      <option value="O+">O+</option><option value="O-">O-</option>
                      <option value="AB+">AB+</option><option value="AB-">AB-</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 mb-2 block">জেন্ডার</label>
                    <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-white">
                      <option value="Male">Male</option><option value="Female">Female</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2"><Image size={14}/> ফটো ইমেজ URL (Optional)</label>
                    <input type="url" name="photoUrl" placeholder="https://..." value={formData.photoUrl} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-white" />
                  </div>

                  <div className="md:col-span-3">
                    <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2"><MapPin size={14}/> ঠিকানা</label>
                    <input type="text" name="address" placeholder="শহর, জেলা..." value={formData.address} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-white" />
                  </div>
                </div>

                <button type="submit" className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3.5 rounded-xl font-bold shadow-lg">
                  {isEditingStudent ? 'আপডেট সেভ করুন' : 'স্টুডেন্ট ভর্তি করুন'}
                </button>
              </form>
            </div>
          </div>
        )}
        {/* STUDENTS LIST & CONTACT VIEW TAB */}
        {activeTab === 'students' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-2xl font-bold">স্টুডেন্ট লিস্ট ও কন্টাক্ট ইনফো</h2>
              <div className="flex gap-3">
                <select value={selectedClassFilter} onChange={(e) => setSelectedClassFilter(e.target.value)} className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-sm">
                  <option value="All">সকল ক্লাস</option>
                  {classList.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                </select>
                {selectedClassFilter !== 'All' && (
                  <button onClick={() => handleUpgradeClass(selectedClassFilter)} className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5">
                    <ArrowUpCircle size={16} /> {selectedClassFilter} আপগ্রেড করুন
                  </button>
                )}
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-3.5 text-slate-500" size={18} />
              <input
                type="text"
                placeholder="নাম বা রোল দিয়ে সার্চ করুন (বানান ভুল হলেও সাজেস্ট করবে)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 pl-12 pr-4 py-3 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-800/50 text-slate-400 text-xs">
                    <tr>
                      <th className="p-4">রোল</th>
                      <th className="p-4">নাম</th>
                      <th className="p-4">বাবার নাম</th>
                      <th className="p-4">ক্লাস</th>
                      <th className="p-4">ফোন</th>
                      <th className="p-4">কন্টাক্ট অপশন</th>
                      <th className="p-4">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-sm">
                    {filterStudentsList(students).map((st) => (
                      <tr key={st.id} className="hover:bg-slate-800/30">
                        <td className="p-4 font-bold text-blue-400">#{st.roll_no}</td>
                        <td className="p-4 font-medium">{st.name}</td>
                        <td className="p-4 text-slate-400">{st.father_name || 'N/A'}</td>
                        <td className="p-4"><span className="bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-lg text-xs">{st.student_class}</span></td>
                        <td className="p-4 text-slate-400">{st.phone || 'N/A'}</td>
                        <td className="p-4">
                          <button onClick={() => setContactModalStudent(st)} className="bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/40 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5">
                            <PhoneCall size={14} /> কন্টাক্ট ডিটেইলস
                          </button>
                        </td>
                        <td className="p-4 flex gap-2">
                          <button onClick={() => handleEditClick(st)} className="bg-amber-500/10 text-amber-400 p-2 rounded-lg hover:bg-amber-500/20"><Edit size={16} /></button>
                          <button onClick={() => handleDeleteStudent(st.id, st.student_class)} className="bg-red-500/10 text-red-400 p-2 rounded-lg hover:bg-red-500/20"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CLASS MANAGEMENT TAB */}
        {activeTab === 'class_mgmt' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold">Class Management & Academic Config</h2>
            <div className="flex gap-4">
              <select value={selectedConfigClass} onChange={(e) => fetchClassConfigDetails(e.target.value)} className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-white">
                {classList.map(cls => <option key={cls} value={cls}>{cls}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-4">
                <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2"><Calendar size={18}/> একাডেমিক বছর ও সেশন কনফিগ ({selectedConfigClass})</h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Academic Year</label>
                    <input type="text" value={classConfig.academic_year} onChange={(e) => setClassConfig({ ...classConfig, academic_year: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white font-bold" placeholder="Ex: 2026" />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Class Start Month</label>
                    <select value={classConfig.start_month} onChange={(e) => setClassConfig({ ...classConfig, start_month: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white">
                      {monthsName.map((m, idx) => (
                        <option key={idx} value={idx + 1}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                  💡 নির্বাচিত শুরুর মাস থেকে বর্তমান মাস পর্যন্ত হিসাব করে টিউশন ফি নির্ধারিত হবে।
                </div>

                <h3 className="text-lg font-bold text-blue-400 pt-4">সাবজেক্ট ও মার্ক্স কনফিগারেশন</h3>
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

              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-4">
                <h3 className="text-lg font-bold text-emerald-400">ফি স্ট্রাকচার (₹) ({selectedConfigClass})</h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Admission Fee (₹)</label>
                    <input type="number" value={classConfig.admission_fee} onChange={(e) => setClassConfig({ ...classConfig, admission_fee: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white" />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Monthly Tuition Fee (₹)</label>
                    <input type="number" value={classConfig.tuition_fee} onChange={(e) => setClassConfig({ ...classConfig, tuition_fee: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white" />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Term 1 Exam Fee (₹)</label>
                    <input type="number" value={classConfig.exam1_fee} onChange={(e) => setClassConfig({ ...classConfig, exam1_fee: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white" />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Term 2 Exam Fee (₹)</label>
                    <input type="number" value={classConfig.exam2_fee} onChange={(e) => setClassConfig({ ...classConfig, exam2_fee: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white" />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Term 3 Exam Fee (₹)</label>
                    <input type="number" value={classConfig.exam3_fee} onChange={(e) => setClassConfig({ ...classConfig, exam3_fee: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white" />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Custom Fee (₹)</label>
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

        {/* ADVANCED ERP BILLING & OVERALL PENDING REVENUE TRACKER */}
        {activeTab === 'erp' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold">ERP Financial Summary & Billing</h2>

            {/* Financial Overview Cards in INR (₹) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-emerald-950/40 border border-emerald-500/30 p-6 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs text-emerald-400 font-semibold">Total Revenue Collected</p>
                  <h3 className="text-3xl font-black text-white mt-1">₹{totalCollectedRevenue}</h3>
                </div>
                <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl"><DollarSign size={28} /></div>
              </div>

              <div 
                onClick={() => setShowOnlyPendingList(!showOnlyPendingList)} 
                className={`border p-6 rounded-2xl flex items-center justify-between cursor-pointer transition ${showOnlyPendingList ? 'bg-rose-900/60 border-rose-500 ring-2 ring-rose-500' : 'bg-rose-950/40 border-rose-500/30'}`}
              >
                <div>
                  <p className="text-xs text-rose-400 font-semibold">Total Pending Due (ফিল্টার করতে ক্লিক করুন)</p>
                  <h3 className="text-3xl font-black text-white mt-1">₹{totalPendingDue}</h3>
                </div>
                <div className="p-3 bg-rose-500/20 text-rose-400 rounded-xl"><AlertCircle size={28} /></div>
              </div>
            </div>

            {!showOnlyPendingList ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Payment Form */}
                <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
                  <h3 className="text-lg font-bold text-blue-400">ফি কালেকশন সার্ভিস</h3>
                  <label className="text-xs text-slate-400 block">স্টুডেন্ট সিলেক্ট করুন</label>
                  <select onChange={(e) => handleSelectErpStudent(students.find(s => s.id === e.target.value))} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white text-sm">
                    <option value="">স্টুডেন্ট বেছে নিন</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name} (Class: {s.student_class} - Roll: #{s.roll_no})</option>)}
                  </select>

                  {erpStudent && (
                    <div className="space-y-4 pt-4 border-t border-slate-800">
                      <p className="text-xs font-bold text-emerald-400">ক্লাস ফিস ডাটা লোড হয়েছে: {erpStudent.student_class}</p>
                      
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">ফি টাইপ সিলেক্ট করুন</label>
                        <select 
                          value={erpFeeType} 
                          onChange={async (e) => {
                            const type = e.target.value;
                            const { data: cData } = await supabase.from('class_configs').select('*').eq('class_name', erpStudent.student_class).single();
                            updateBaseFeeBySelection(type, cData);
                          }} 
                          className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white text-xs"
                        >
                          <option value="Tuition Fee">Tuition Fee</option>
                          <option value="Admission Fee">Admission Fee</option>
                          <option value="Term 1 Exam Fee">Term 1 Exam Fee</option>
                          <option value="Term 2 Exam Fee">Term 2 Exam Fee</option>
                          <option value="Term 3 Exam Fee">Term 3 Exam Fee</option>
                          <option value="Custom Fee">Custom Fee</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Calculated Base Amount (₹)</label>
                          <input type="number" value={erpBaseAmount} onChange={(e) => setErpBaseAmount(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white text-xs font-bold" />
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Discount Amount (₹)</label>
                          <input type="number" value={erpDiscount} onChange={(e) => setErpDiscount(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white text-xs" />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Paid Amount (₹)</label>
                        <input type="number" placeholder="কত টাকা প্রদান করল" value={erpPaidAmount} onChange={(e) => setErpPaidAmount(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-emerald-400 font-bold text-sm" />
                      </div>

                      <div className="p-4 bg-slate-950 rounded-xl space-y-1 text-xs border border-slate-800">
                        <div className="flex justify-between text-slate-400">
                          <span>Net Payable Amount:</span>
                          <span className="font-bold text-white">₹{Number(erpBaseAmount) - Number(erpDiscount)}</span>
                        </div>
                        <div className="flex justify-between text-rose-400">
                          <span>Due / Pending Amount:</span>
                          <span className="font-bold">₹{Math.max(0, (Number(erpBaseAmount) - Number(erpDiscount)) - Number(erpPaidAmount))}</span>
                        </div>
                      </div>

                      <button onClick={handleCreateInvoice} className="w-full bg-emerald-600 hover:bg-emerald-700 py-3 rounded-xl font-bold text-sm transition">
                        ফি জমা ও রসিদ প্রিন্ট করুন
                      </button>
                    </div>
                  )}
                </div>

                {/* Single Student History */}
                <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
                  <h3 className="text-lg font-bold text-blue-400">পেমেন্ট হিস্ট্রি</h3>
                  {erpStudent ? (
                    <div className="space-y-3">
                      <p className="text-xs text-slate-400">স্টুডেন্ট: <strong className="text-white">{erpStudent.name}</strong> (#{erpStudent.roll_no})</p>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead className="bg-slate-800 text-slate-400">
                            <tr>
                              <th className="p-2.5">ফি টাইপ</th>
                              <th className="p-2.5 text-right">পেয়েছ</th>
                              <th className="p-2.5 text-right">বাকি</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                            {erpTransactions.map((tx) => (
                              <tr key={tx.id}>
                                <td className="p-2.5">
                                  <p className="font-semibold text-white">{tx.fee_type}</p>
                                </td>
                                <td className="p-2.5 text-right font-bold text-emerald-400">₹{tx.paid_amount || tx.final_amount}</td>
                                <td className="p-2.5 text-right font-bold text-rose-400">₹{tx.pending_amount || 0}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">বাম পাশের প্যানেল থেকে স্টুডেন্ট সিলেক্ট করলে তার ট্রানজেকশন দেখা যাবে।</p>
                  )}
                </div>
              </div>
            ) : (
              /* Pending Due List Filter Table */
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-rose-400">বকেয়া / পেন্ডিং ফি স্টুডেন্টদের তালিকা</h3>
                  <button onClick={() => setShowOnlyPendingList(false)} className="bg-slate-800 px-3 py-1.5 rounded-lg text-xs">
                    ফিল্টার সরান
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-800 text-slate-400">
                      <tr>
                        <th className="p-3">স্টুডেন্ট ও ক্লাস</th>
                        <th className="p-3">ফি বিবরণ</th>
                        <th className="p-3 text-right">মোট বাকি (₹)</th>
                        <th className="p-3 text-center">যোগাযোগ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {pendingTransactionsList.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-800/40">
                          <td className="p-3">
                            <p className="font-bold text-white">{tx.students?.name || 'N/A'}</p>
                            <p className="text-[10px] text-slate-400">{tx.students?.student_class} | Roll: #{tx.students?.roll_no}</p>
                          </td>
                          <td className="p-3 text-slate-300">{tx.fee_type}</td>
                          <td className="p-3 text-right font-black text-rose-400">₹{tx.pending_amount || (Number(tx.final_amount || 0) - Number(tx.paid_amount || 0))}</td>
                          <td className="p-3 text-center">
                            {tx.students?.phone ? (
                              <a href={`tel:${tx.students.phone}`} className="bg-emerald-600/20 text-emerald-400 px-2.5 py-1 rounded-lg font-bold hover:bg-emerald-600/40 inline-flex items-center gap-1">
                                <PhoneCall size={12} /> কল দিন
                              </a>
                            ) : 'No Phone'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ID CARD TAB */}
        {activeTab === 'idcard' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold">আইডি কার্ড জেনারেটর</h2>
            <select onChange={(e) => setSelectedIdStudent(students.find(s => s.id === e.target.value))} className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-white">
              <option value="">স্টুডেন্ট সিলেক্ট করুন</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name} (Class: {s.student_class} - Roll: #{s.roll_no})</option>)}
            </select>

            {selectedIdStudent && (
              <div className="w-80 bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 border border-indigo-500/30 p-6 rounded-3xl shadow-2xl text-center border-t-4 border-t-blue-500">
                <h3 className="font-extrabold text-blue-300 text-lg">{school.school_name}</h3>
                <p className="text-[10px] text-slate-400">{school.address}</p>
                <img src={selectedIdStudent.photo_url || 'https://via.placeholder.com/150'} alt="" className="w-24 h-24 rounded-full mx-auto my-4 object-cover border-2 border-blue-400" />
                <h4 className="font-bold text-xl text-white">{selectedIdStudent.name}</h4>
                {selectedIdStudent.father_name && <p className="text-xs text-slate-300">Father: {selectedIdStudent.father_name}</p>}
                <p className="text-xs text-blue-400 font-semibold my-2">{selectedIdStudent.student_class} | Roll: #{selectedIdStudent.roll_no}</p>
                <div className="text-left text-xs space-y-1.5 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80 text-slate-300">
                  <p><strong>Blood:</strong> <span className="text-rose-400 font-bold">{selectedIdStudent.blood_group || 'N/A'}</span></p>
                  <p><strong>Phone:</strong> {selectedIdStudent.phone || 'N/A'}</p>
                  <p><strong>Address:</strong> {selectedIdStudent.address || 'N/A'}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SCHOOL PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">স্কুল প্রোফাইল</h2>
              <button onClick={() => setEditSchool(!editSchool)} className="bg-slate-800 px-4 py-2 rounded-xl text-xs font-semibold">
                {editSchool ? 'বাতিল' : 'এডিট করুন'}
              </button>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl space-y-4 max-w-xl shadow-xl">
              {editSchool ? (
                <form onSubmit={handleUpdateSchool} className="space-y-4">
                  <input type="text" value={school.school_name} onChange={(e) => setSchool({ ...school, school_name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white" />
                  <input type="text" value={school.address} onChange={(e) => setSchool({ ...school, address: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white" />
                  <input type="text" value={school.phone} onChange={(e) => setSchool({ ...school, phone: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white" />
                  <button type="submit" className="bg-emerald-600 px-6 py-3 rounded-xl font-bold">সেভ করুন</button>
                </form>
              ) : (
                <div className="space-y-3">
                  <div><p className="text-xs text-slate-400">নাম</p><p className="font-bold text-lg">{school.school_name}</p></div>
                  <div><p className="text-xs text-slate-400">ঠিকানা</p><p>{school.address}</p></div>
                  <div><p className="text-xs text-slate-400">ফোন</p><p>{school.phone}</p></div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
                }
