'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Users, CreditCard, FileSpreadsheet, UserCheck, Key, LogOut, 
  Plus, School, Search, ArrowUpCircle, DollarSign, Settings, Trash2, Edit, Save, 
  X, User, BookOpen, Phone, Droplet, MapPin, Image, Printer, AlertCircle, PhoneCall, 
  Calendar, Mail, Globe, Building, FileText, BadgeCheck, Camera
} from 'lucide-react';

export default function Dashboard() {
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Advanced School Profile
  const [school, setSchool] = useState({ 
    school_name: '', address: '', phone: '', email: '', 
    logo_url: '', cover_url: '', estd_year: '', reg_no: '', 
    principal_name: '', website: '', alternate_phone: '', board: '', medium: '' 
  });
  const [editSchool, setEditSchool] = useState(false);

  // Class List & Custom Support
  const defaultClasses = ['Nursery', 'KG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
  const [classList, setClassList] = useState(defaultClasses);
  const [customClassInput, setCustomClassInput] = useState('');
  const [isAddingCustomClass, setIsAddingCustomClass] = useState(false);

  // Derived Active Classes
  const activeClasses = [...new Set(students.map(s => s.student_class))].sort((a, b) => {
    const aIdx = classList.indexOf(a); const bIdx = classList.indexOf(b);
    return (aIdx !== -1 ? aIdx : 99) - (bIdx !== -1 ? bIdx : 99);
  });

  // Global Filter & Search
  const [selectedClassFilter, setSelectedClassFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Student Form & Detail Modal State
  const [formData, setFormData] = useState({
    id: null, name: '', rollNo: '', studentClass: 'Class 1', phone: '', bloodGroup: '', address: '', gender: 'Male', photoUrl: ''
  });
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [contactModalStudent, setContactModalStudent] = useState(null);

  // ID Card State
  const [idSelectedClass, setIdSelectedClass] = useState('');
  const [selectedIdStudent, setSelectedIdStudent] = useState(null);
  const [printIdCard, setPrintIdCard] = useState(false); 

  // Class Management States
  const [selectedConfigClass, setSelectedConfigClass] = useState('Class 1');
  const [allClassConfigs, setAllClassConfigs] = useState({});
  const [classConfig, setClassConfig] = useState({
    academic_year: '2026', start_month: 1, 
    subjects: [{ name: 'Bangla', oral: 20, theory: 80 }, { name: 'English', oral: 20, theory: 80 }],
    admission_fee: 1000, tuition_fee: 500, exam1_fee: 200, exam2_fee: 200, exam3_fee: 200, custom_fee: 0
  });

  // ERP Billing & Pending Tracker States
  const [erpSelectedClass, setErpSelectedClass] = useState(''); 
  const [erpStudent, setErpStudent] = useState(null);
  const [erpClassConfig, setErpClassConfig] = useState(null);
  const [agreedFees, setAgreedFees] = useState({ monthly: 0, admission: 0 }); 
  
  const feeOptionsList = ['Admission Fee', 'Tuition Fee', 'Term 1 Exam Fee', 'Term 2 Exam Fee', 'Term 3 Exam Fee', 'Custom Fee'];
  const [erpSelectedFeeTypes, setErpSelectedFeeTypes] = useState(['Tuition Fee']);
  const [erpBaseAmount, setErpBaseAmount] = useState(0);
  const [erpPaidAmount, setErpPaidAmount] = useState(0);
  const [erpDiscount, setErpDiscount] = useState(0);
  
  const [erpTransactions, setErpTransactions] = useState([]);
  const [allErpTransactions, setAllErpTransactions] = useState([]);
  const [showOnlyPendingList, setShowOnlyPendingList] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [editingTx, setEditingTx] = useState(null);

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
    if (data) setSchool({ ...school, ...data });
  };

  const loadClassConfigs = async () => {
    const { data } = await supabase.from('class_configs').select('*');
    if (data) {
      const configMap = {};
      data.forEach(item => { configMap[item.class_name] = item; });
      setAllClassConfigs(configMap);
      const customClasses = data.map(d => d.class_name);
      setClassList(Array.from(new Set([...defaultClasses, ...customClasses])));
    }
  };

  const fetchAllErpTransactions = async () => {
    const { data } = await supabase.from('erp_transactions').select('*, students(name, roll_no, student_class, phone)').order('created_at', { ascending: false });
    setAllErpTransactions(data || []);
  };

  const getNextRollForClass = (cls) => {
    const classSts = students.filter(s => s.student_class === cls);
    return classSts.length === 0 ? 1 : Math.max(...classSts.map(s => s.roll_no)) + 1;
  };

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleClassChangeInForm = (e) => {
    const cls = e.target.value;
    if (cls === 'CUSTOM') { setIsAddingCustomClass(true); } 
    else { setIsAddingCustomClass(false); setFormData({ ...formData, studentClass: cls, rollNo: getNextRollForClass(cls) }); }
  };

  const handleAddCustomClass = () => {
    if (!customClassInput.trim()) return;
    if (!classList.includes(customClassInput)) {
      setClassList([...classList, customClassInput]);
      setFormData({ ...formData, studentClass: customClassInput, rollNo: getNextRollForClass(customClassInput) });
    }
    setCustomClassInput(''); setIsAddingCustomClass(false);
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.studentClass) return alert('নাম এবং ক্লাস পূরণ করা আবশ্যক!');

    if (isEditingStudent) {
      const { error } = await supabase.from('students').update({
        name: formData.name, student_class: formData.studentClass, phone: formData.phone, blood_group: formData.bloodGroup, address: formData.address, gender: formData.gender, photo_url: formData.photoUrl || 'https://via.placeholder.com/150'
      }).eq('id', formData.id);
      if (!error) { alert('আপডেট হয়েছে!'); resetStudentForm(); fetchStudents(); }
    } else {
      const roll = getNextRollForClass(formData.studentClass);
      const { error } = await supabase.from('students').insert([{
        name: formData.name, roll_no: roll, student_class: formData.studentClass, phone: formData.phone, blood_group: formData.bloodGroup, address: formData.address, gender: formData.gender, photo_url: formData.photoUrl || 'https://via.placeholder.com/150', email: `student_${formData.studentClass}_${roll}@school.com`
      }]);
      if (!error) { alert(`যুক্ত হয়েছে (রোল: #${roll})!`); resetStudentForm(); fetchStudents(); }
    }
  };

  const handleEditClick = (st) => {
    setFormData({ id: st.id, name: st.name, rollNo: st.roll_no, studentClass: st.student_class, phone: st.phone || '', bloodGroup: st.blood_group || '', address: st.address || '', gender: st.gender || 'Male', photoUrl: st.photo_url || '' });
    setIsEditingStudent(true); setActiveTab('dashboard');
  };

  const handleDeleteStudent = async (id, className) => {
    if (confirm('ডিলিট করতে চান? রোল রি-অর্ডার হয়ে যাবে।')) {
      await supabase.from('students').delete().eq('id', id);
      const remaining = students.filter(s => s.student_class === className && s.id !== id);
      for (let i = 0; i < remaining.length; i++) { await supabase.from('students').update({ roll_no: i + 1 }).eq('id', remaining[i].id); }
      alert('মুছে ফেলা হয়েছে!'); fetchStudents();
    }
  };

  const handleUpgradeClass = (currentClass) => {
    const nextClassMap = { 'Nursery':'KG', 'KG':'Class 1', 'Class 1':'Class 2', 'Class 2':'Class 3', 'Class 3':'Class 4', 'Class 4':'Class 5', 'Class 5':'Class 6', 'Class 6':'Class 7', 'Class 7':'Class 8', 'Class 8':'Class 9', 'Class 9':'Class 10', 'Class 10':'Class 11', 'Class 11':'Class 12', 'Class 12':'Graduated' };
    const targetClass = nextClassMap[currentClass] || 'Higher Class';
    if (confirm(`${currentClass} কে ${targetClass} এ প্রমোট করতে চান?`)) {
      const classSts = students.filter(s => s.student_class === currentClass);
      Promise.all(classSts.map(async (st, idx) => { await supabase.from('students').update({ student_class: targetClass, roll_no: idx + 1 }).eq('id', st.id); })).then(() => {
        alert('আপগ্রেড হয়েছে!'); fetchStudents();
      });
    }
  };

  const resetStudentForm = () => { setFormData({ id: null, name: '', rollNo: getNextRollForClass('Class 1'), studentClass: 'Class 1', phone: '', bloodGroup: '', address: '', gender: 'Male', photoUrl: '' }); setIsEditingStudent(false); };

  const handleUpdateSchool = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('school_settings').update(school).eq('id', 1);
    if (!error) { alert('স্কুল প্রোফাইল সফলভাবে আপডেট হয়েছে!'); setEditSchool(false); }
    else alert('Error: ' + error.message);
  };

  const filterStudentsList = (list) => {
    return list.filter(st => {
      const matchClass = selectedClassFilter === 'All' || st.student_class === selectedClassFilter;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchClass;
      return matchClass && (st.name.toLowerCase().includes(q) || st.roll_no.toString().includes(q));
    });
  };

  const fetchClassConfigDetails = async (cls) => {
    setSelectedConfigClass(cls);
    const data = allClassConfigs[cls];
    if (data) { setClassConfig({ ...data, academic_year: data.academic_year || '2026', start_month: data.start_month || 1 }); } 
    else { setClassConfig({ academic_year: '2026', start_month: 1, subjects: [{ name: 'Bangla', oral: 20, theory: 80 }, { name: 'English', oral: 20, theory: 80 }], admission_fee: 1000, tuition_fee: 500, exam1_fee: 200, exam2_fee: 200, exam3_fee: 200, custom_fee: 0 }); }
  };

  const handleSaveClassConfig = async () => {
    const { error } = await supabase.from('class_configs').upsert({ 
      class_name: selectedConfigClass, academic_year: classConfig.academic_year, start_month: parseInt(classConfig.start_month) || 1, subjects: classConfig.subjects, admission_fee: classConfig.admission_fee, tuition_fee: classConfig.tuition_fee, exam1_fee: classConfig.exam1_fee, exam2_fee: classConfig.exam2_fee, exam3_fee: classConfig.exam3_fee, custom_fee: classConfig.custom_fee 
    }, { onConflict: 'class_name' });
    if (!error) { alert('Class Config সেভ হয়েছে!'); loadClassConfigs(); }
  };

  const handleAddSubjectField = () => { setClassConfig({ ...classConfig, subjects: [...classConfig.subjects, { name: '', oral: 20, theory: 80 }] }); };

  // ==============================
  // ERP LOGIC
  // ==============================

  const handleSelectErpStudent = async (st) => {
    setErpStudent(st);
    if (!st) return;

    const { data: txData } = await supabase.from('erp_transactions').select('*').eq('student_id', st.id).order('created_at', { ascending: false });
    const currentTx = txData || [];
    setErpTransactions(currentTx);

    const cConfig = allClassConfigs[st.student_class] || {};
    setErpClassConfig(cConfig);

    const aMonthly = st.agreed_monthly_fee !== null ? st.agreed_monthly_fee : (cConfig.tuition_fee || 0);
    const aAdmission = st.agreed_admission_fee !== null ? st.agreed_admission_fee : (cConfig.admission_fee || 0);
    setAgreedFees({ monthly: aMonthly, admission: aAdmission });

    calculateTotalDues(['Tuition Fee'], cConfig, aMonthly, aAdmission, currentTx);
    setErpSelectedFeeTypes(['Tuition Fee']);
  };

  const saveAgreedFeesToDB = async () => {
    if (!erpStudent) return;
    const { error } = await supabase.from('students').update({ agreed_monthly_fee: Number(agreedFees.monthly), agreed_admission_fee: Number(agreedFees.admission) }).eq('id', erpStudent.id);
    if (!error) {
      alert("এই স্টুডেন্টের নির্দিষ্ট ফিস প্রোফাইল সেভ হয়েছে!");
      setErpStudent({...erpStudent, agreed_monthly_fee: Number(agreedFees.monthly), agreed_admission_fee: Number(agreedFees.admission)});
      fetchStudents(); 
      calculateTotalDues(erpSelectedFeeTypes, erpClassConfig, Number(agreedFees.monthly), Number(agreedFees.admission), erpTransactions);
    }
  };

  const toggleFeeType = (feeType) => {
    let updatedTypes = [...erpSelectedFeeTypes];
    if (updatedTypes.includes(feeType)) updatedTypes = updatedTypes.filter(t => t !== feeType);
    else updatedTypes.push(feeType);
    if (updatedTypes.length === 0) updatedTypes = ['Tuition Fee'];
    setErpSelectedFeeTypes(updatedTypes);
    calculateTotalDues(updatedTypes, erpClassConfig, agreedFees.monthly, agreedFees.admission, erpTransactions);
  };

  const getExpectedAmountForFee = (feeType, configData, aMonthly, aAdmission) => {
    if (feeType === 'Tuition Fee') {
      const currentMonth = new Date().getMonth() + 1;
      const startM = configData.start_month || 1;
      const activeMonthsCount = Math.max(1, (currentMonth - startM) + 1);
      return aMonthly * activeMonthsCount;
    }
    if (feeType === 'Admission Fee') return aAdmission;
    if (feeType === 'Term 1 Exam Fee') return configData.exam1_fee || 0;
    if (feeType === 'Term 2 Exam Fee') return configData.exam2_fee || 0;
    if (feeType === 'Term 3 Exam Fee') return configData.exam3_fee || 0;
    return configData.custom_fee || 0;
  };

  const calculateTotalDues = (selectedTypes, configData, aMonthly, aAdmission, studentTx = []) => {
    if (!configData) return;
    let totalDue = 0;
    selectedTypes.forEach(feeType => {
      const payable = getExpectedAmountForFee(feeType, configData, aMonthly, aAdmission);
      const alreadyPaid = studentTx.filter(tx => tx.fee_type === feeType).reduce((s, tx) => s + (Number(tx.paid_amount) || Number(tx.final_amount) || 0), 0);
      totalDue += Math.max(0, payable - alreadyPaid);
    });
    setErpBaseAmount(totalDue);
    setErpPaidAmount(totalDue);
    setErpDiscount(0);
  };

  const handleCreateInvoice = async () => {
    if (!erpStudent) return alert('স্টুডেন্ট সিলেক্ট করুন!');
    if (erpSelectedFeeTypes.length === 0) return alert('অন্তত একটি ফি টাইপ সিলেক্ট করুন!');
    
    let remainingPayment = Number(erpPaidAmount);
    if (remainingPayment <= 0) return alert('পেমেন্ট অ্যামাউন্ট 0 হতে পারে না!');

    const transactionsToInsert = [];
    const receiptItems = [];
    const globalDiscount = Number(erpDiscount);
    let discountApplied = false;

    for (let i = 0; i < erpSelectedFeeTypes.length; i++) {
      const feeType = erpSelectedFeeTypes[i];
      const payable = getExpectedAmountForFee(feeType, erpClassConfig, agreedFees.monthly, agreedFees.admission);
      const alreadyPaid = erpTransactions.filter(tx => tx.fee_type === feeType).reduce((s, tx) => s + (Number(tx.paid_amount) || Number(tx.final_amount) || 0), 0);
      const due = Math.max(0, payable - alreadyPaid);

      const isLastItem = (i === erpSelectedFeeTypes.length - 1);
      const allowAdvance = (feeType === 'Tuition Fee' || isLastItem);

      let allocateAmount = allowAdvance ? remainingPayment : Math.min(remainingPayment, due);
      
      if (allocateAmount > 0 || (!discountApplied && globalDiscount > 0)) {
        let appliedDisc = 0;
        if (!discountApplied && globalDiscount > 0) { appliedDisc = globalDiscount; discountApplied = true; }

        const netPayableForThisItem = payable - appliedDisc;
        const newTotalPaidForThisItem = alreadyPaid + allocateAmount;
        const itemPending = Math.max(0, netPayableForThisItem - newTotalPaidForThisItem);

        transactionsToInsert.push({
          student_id: erpStudent.id, fee_type: feeType, amount: payable, discount: appliedDisc, final_amount: netPayableForThisItem, paid_amount: allocateAmount, pending_amount: itemPending, status: (newTotalPaidForThisItem >= netPayableForThisItem) ? 'Paid' : 'Pending'
        });

        receiptItems.push({ feeType: feeType, base: payable, discount: appliedDisc, net: netPayableForThisItem, paid: allocateAmount });
        remainingPayment -= allocateAmount;
      }
    }

    if (transactionsToInsert.length === 0) return alert('কোনো নতুন বকেয়া নেই বা পেমেন্ট জিরো!');

    const invoiceId = 'INV-' + Math.floor(100000 + Math.random() * 900000);
    const { error } = await supabase.from('erp_transactions').insert(transactionsToInsert);

    if (error) { alert('ট্রানজেকশন ব্যর্থ: ' + error.message); } 
    else {
      setReceiptData({ invoiceNo: invoiceId, date: new Date().toLocaleDateString('en-GB'), student: erpStudent, items: receiptItems, totalPaid: Number(erpPaidAmount) });
      alert('ফি জমার রসিদ তৈরি হয়েছে!');
      handleSelectErpStudent(erpStudent); 
      fetchAllErpTransactions();
      setErpPaidAmount(0); setErpDiscount(0);
    }
  };

  const viewReceiptFromHistory = (tx) => {
    setReceiptData({
      invoiceNo: tx.id ? tx.id.substring(0, 8).toUpperCase() : 'INV-HIST',
      date: new Date(tx.created_at).toLocaleDateString('en-GB'),
      student: erpStudent,
      items: [{ feeType: tx.fee_type, base: tx.amount, discount: tx.discount, net: tx.final_amount, paid: tx.paid_amount || tx.final_amount }],
      totalPaid: tx.paid_amount || tx.final_amount
    });
  };

  const handleUpdateTx = async () => {
    const net = Number(editingTx.amount) - Number(editingTx.discount);
    const pend = Math.max(0, net - Number(editingTx.paid_amount));
    const stat = pend <= 0 ? 'Paid' : 'Pending';
    
    const { error } = await supabase.from('erp_transactions').update({
      paid_amount: Number(editingTx.paid_amount), discount: Number(editingTx.discount), final_amount: net, pending_amount: pend, status: stat
    }).eq('id', editingTx.id);
    
    if (!error) {
      alert('পেমেন্ট সফলভাবে আপডেট হয়েছে!');
      setEditingTx(null);
      fetchAllErpTransactions();
      handleSelectErpStudent(erpStudent);
    } else { alert('আপডেট ফেইলড: ' + error.message); }
  };

  const getMonthlyStatus = (monthIndex) => {
    const currentMonth = new Date().getMonth(); 
    const startM = (erpClassConfig?.start_month || 1) - 1; 
    
    if (monthIndex < startM) return { label: 'N/A', bg: 'bg-slate-900', text: 'text-slate-600', border: 'border-slate-800', badgeBg: 'bg-slate-800' };
    
    const totalTuitionPaid = erpTransactions.filter(tx => tx.fee_type === 'Tuition Fee').reduce((s, tx) => s + (Number(tx.paid_amount) || Number(tx.final_amount) || 0), 0);
    const feePerMonth = agreedFees.monthly;
    const monthsBeforeThis = monthIndex - startM;
    const requiredBeforeThisMonth = monthsBeforeThis * feePerMonth;
    const availableForThisMonth = Math.max(0, totalTuitionPaid - requiredBeforeThisMonth);

    if (availableForThisMonth >= feePerMonth) {
      return { label: 'Paid', subText: `₹${feePerMonth}`, bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', badgeBg: 'bg-emerald-500/20' };
    } else if (availableForThisMonth > 0) {
      return { label: 'Partial', subText: `Paid: ₹${availableForThisMonth}`, bg: 'bg-lime-500/10', text: 'text-lime-400', border: 'border-lime-500/40', badgeBg: 'bg-lime-500/20' };
    } else {
      if (monthIndex <= currentMonth) {
        return { label: 'Due', subText: `Due: ₹${feePerMonth}`, bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30', badgeBg: 'bg-rose-500/20' };
      } else {
        return { label: 'Upcoming', bg: 'bg-slate-800/50', text: 'text-slate-300', border: 'border-slate-700', badgeBg: 'bg-slate-700' };
      }
    }
  };

  // Global Dues Calculation
  const totalCollectedRevenue = allErpTransactions.reduce((acc, curr) => acc + (Number(curr.paid_amount) || 0), 0);
  
  const generatePendingDuesArray = () => {
    let pendingList = [];
    students.forEach(st => {
      const config = allClassConfigs[st.student_class];
      if (!config) return;
      const currentMonth = new Date().getMonth() + 1;
      const startM = config.start_month || 1;
      const activeMonths = Math.max(1, (currentMonth - startM) + 1);
      
      const expectedTuition = (st.agreed_monthly_fee !== null ? st.agreed_monthly_fee : (config.tuition_fee || 0)) * activeMonths;
      const expectedAdmission = st.agreed_admission_fee !== null ? st.agreed_admission_fee : (config.admission_fee || 0);

      const studentTx = allErpTransactions.filter(tx => tx.student_id === st.id);
      const tuitionPaid = studentTx.filter(tx => tx.fee_type === 'Tuition Fee').reduce((s, tx) => s + (Number(tx.paid_amount) || Number(tx.final_amount) || 0), 0);
      const admissionPaid = studentTx.filter(tx => tx.fee_type === 'Admission Fee').reduce((s, tx) => s + (Number(tx.paid_amount) || Number(tx.final_amount) || 0), 0);

      const tuitionDue = Math.max(0, expectedTuition - tuitionPaid);
      const admissionDue = Math.max(0, expectedAdmission - admissionPaid);

      if (tuitionDue > 0) pendingList.push({ id: st.id + '_tui', students: st, fee_type: 'Tuition Fee (Pending)', pending_amount: tuitionDue });
      if (admissionDue > 0) pendingList.push({ id: st.id + '_adm', students: st, fee_type: 'Admission Fee (Pending)', pending_amount: admissionDue });
    });
    return pendingList;
  };

  const pendingTransactionsList = generatePendingDuesArray();
  const totalPendingDue = pendingTransactionsList.reduce((acc, curr) => acc + curr.pending_amount, 0);

  if (!session) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-medium">Loading EduAdmin...</div>;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-950 text-slate-100 font-sans">
      
      {/* DYNAMIC STYLES */}
      <style dangerouslySetInnerHTML={{ __html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        
        @media print {
          .no-print { display: none !important; }
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          ${receiptData ? `
            @page { size: A4 portrait; margin: 10mm; }
            body { background: white !important; color: black !important; }
            aside, main { display: none !important; }
          ` : ''}
          
          ${printIdCard ? `
            @page { size: 54mm 86mm; margin: 0; }
            html, body { 
              width: 54mm !important; 
              height: 86mm !important; 
              margin: 0 !important; 
              padding: 0 !important; 
              overflow: hidden !important; 
              background: white !important; 
            }
            aside, main { display: none !important; }
            .pvc-modal-overlay {
              position: absolute !important;
              top: 0 !important; left: 0 !important;
              width: 54mm !important; height: 86mm !important;
              background: none !important; padding: 0 !important;
              display: block !important;
            }
            .pvc-card { 
              width: 54mm !important; height: 86mm !important; 
              border: none !important; border-radius: 0 !important; 
              margin: 0 !important; padding: 4mm !important; 
              box-sizing: border-box !important; box-shadow: none !important;
            }
          ` : ''}
        }
      `}} />

      {/* EDIT TRANSACTION MODAL */}
      {editingTx && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-sm w-full shadow-2xl relative">
            <h3 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2"><Edit size={18}/> Update Payment</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Fee Type</label>
                <input type="text" value={editingTx.fee_type} disabled className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-slate-500 text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Discount Amount (₹)</label>
                <input type="number" value={editingTx.discount} onChange={(e) => setEditingTx({...editingTx, discount: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-lg text-white text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Actually Paid Amount (₹)</label>
                <input type="number" value={editingTx.paid_amount} onChange={(e) => setEditingTx({...editingTx, paid_amount: e.target.value})} className="w-full bg-emerald-950/30 border border-emerald-500/50 p-2.5 rounded-lg text-emerald-400 font-bold text-sm" />
              </div>
              <div className="flex gap-3 pt-4 border-t border-slate-800">
                <button onClick={() => setEditingTx(null)} className="flex-1 bg-slate-800 hover:bg-slate-700 py-2 rounded-lg text-xs font-bold transition">Cancel</button>
                <button onClick={handleUpdateTx} className="flex-1 bg-blue-600 hover:bg-blue-500 py-2 rounded-lg text-xs font-bold transition">Save Update</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STUDENT CONTACT DETAILS MODAL */}
      {contactModalStudent && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-sm w-full space-y-4 shadow-2xl relative">
            <button onClick={() => setContactModalStudent(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={18} /></button>
            <div className="text-center">
              <img src={contactModalStudent.photo_url || 'https://via.placeholder.com/150'} alt="" className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-blue-500 mb-3" />
              <h3 className="text-xl font-bold text-white">{contactModalStudent.name}</h3>
              <p className="text-xs text-blue-400 font-semibold">{contactModalStudent.student_class} | Roll: #{contactModalStudent.roll_no}</p>
            </div>
            <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300">
              <div className="flex items-center gap-3"><Phone className="text-blue-400" size={16} /><div><p className="text-[10px] text-slate-500">Contact Number</p><p className="font-bold text-white">{contactModalStudent.phone || 'N/A'}</p></div></div>
              <div className="flex items-center gap-3"><Droplet className="text-rose-400" size={16} /><div><p className="text-[10px] text-slate-500">Blood Group</p><p className="font-bold text-rose-400">{contactModalStudent.blood_group || 'N/A'}</p></div></div>
              <div className="flex items-center gap-3"><MapPin className="text-emerald-400" size={16} /><div><p className="text-[10px] text-slate-500">Address</p><p className="font-medium">{contactModalStudent.address || 'N/A'}</p></div></div>
            </div>
            {contactModalStudent.phone && (
              <a href={`tel:${contactModalStudent.phone}`} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-xs transition"><PhoneCall size={16} /> কল করুন</a>
            )}
          </div>
        </div>
      )}

      {/* PRINTABLE MONEY RECEIPT MODAL */}
      {receiptData && (
        <div className="fixed inset-0 bg-white text-slate-900 z-50 p-6 overflow-y-auto print:p-0">
          <div className="max-w-xl mx-auto flex justify-between items-center mb-4 no-print">
            <button onClick={() => setReceiptData(null)} className="bg-slate-200 px-4 py-2 rounded-lg font-bold text-xs text-slate-800"><X size={16} /> বন্ধ করুন</button>
            <button onClick={() => window.print()} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-lg"><Printer size={16} /> রসিদ প্রিন্ট / PDF</button>
          </div>
          <div className="max-w-xl mx-auto border-2 border-slate-900 p-8 rounded-xl bg-white shadow-2xl relative">
            <div className="text-center border-b-2 border-slate-900 pb-4 mb-4">
              <h1 className="text-2xl font-black uppercase text-slate-900">{school.school_name || 'ISLAMIC NATIONAL SCHOOL'}</h1>
              <p className="text-xs text-slate-600">{school.address} | Phone: {school.phone}</p>
              <span className="inline-block bg-slate-900 text-white font-bold text-[10px] uppercase px-3 py-1 rounded mt-2">OFFICIAL PAYMENT RECEIPT</span>
            </div>
            <div className="flex justify-between text-xs mb-4">
              <p><strong>Receipt No:</strong> {receiptData.invoiceNo}</p><p><strong>Date:</strong> {receiptData.date}</p>
            </div>
            <div className="bg-slate-100 p-3 rounded-lg text-xs space-y-1 border mb-4">
              <p><strong>Student:</strong> {receiptData.student.name} | <strong>Class:</strong> {receiptData.student.student_class} | <strong>Roll:</strong> #{receiptData.student.roll_no}</p>
            </div>
            <table className="w-full text-left text-xs border-collapse border border-slate-900 mb-4">
              <thead><tr className="bg-slate-200 border-b border-slate-900"><th className="p-2 border-r border-slate-900">Fee Type</th><th className="p-2 text-right border-r border-slate-900">Net Amount</th><th className="p-2 text-right">Paid (₹)</th></tr></thead>
              <tbody>
                {receiptData.items.map((item, i) => (
                  <tr key={i} className="border-b border-slate-900">
                    <td className="p-2 border-r border-slate-900 font-semibold">{item.feeType} {item.discount > 0 && <span className="text-rose-600 font-normal text-[10px]"><br/>(Discount: -₹{item.discount})</span>}</td>
                    <td className="p-2 text-right border-r border-slate-900">₹{item.net}</td>
                    <td className="p-2 text-right font-bold text-emerald-700">₹{item.paid}</td>
                  </tr>
                ))}
                <tr className="bg-slate-100 font-bold border-b border-slate-900">
                  <td colSpan="2" className="p-2 border-r border-slate-900 text-right">Total Amount Paid Now:</td><td className="p-2 text-right text-blue-900 text-sm font-black">₹{receiptData.totalPaid}</td>
                </tr>
              </tbody>
            </table>
            <div className="flex justify-between items-center text-xs mt-8 pt-4 border-t border-dashed">
              <p className="text-[10px] text-slate-500 font-semibold">Thank you for your payment!</p>
              <div className="text-center"><div className="w-32 border-b border-slate-900 mb-1"></div><p className="text-[10px] text-slate-500">Authorized Accountant</p></div>
            </div>
          </div>
        </div>
      )}

      {/* PVC ID CARD PRINT MODAL */}
      {printIdCard && selectedIdStudent && (
        <div className="fixed inset-0 bg-slate-900/95 z-50 flex items-center justify-center p-4 pvc-modal-overlay">
          <div className="absolute top-6 right-6 flex gap-4 no-print">
            <button onClick={() => setPrintIdCard(false)} className="bg-slate-700 px-5 py-2.5 rounded-xl font-bold text-white hover:bg-slate-600 transition"><X size={16} className="inline mr-2" /> Cancel</button>
            <button onClick={() => window.print()} className="bg-blue-600 px-5 py-2.5 rounded-xl font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500 transition"><Printer size={16} className="inline mr-2" /> Print PVC (54x86mm)</button>
          </div>

          <div className="pvc-card w-[204px] h-[324px] bg-gradient-to-br from-blue-900 to-indigo-950 overflow-hidden relative flex flex-col items-center justify-between text-white p-4 rounded-xl border-4 border-slate-800 shadow-2xl">
             <div className="text-center w-full z-10">
                 <h2 className="font-black text-[14px] uppercase leading-tight tracking-wide">{school.school_name || 'SCHOOL NAME'}</h2>
                 <p className="text-[8px] opacity-80 mt-1">{school.address}</p>
             </div>
             <img src={selectedIdStudent.photo_url || 'https://via.placeholder.com/150'} className="w-20 h-20 rounded-full border-[3px] border-white object-cover my-2 shadow-lg z-10" />
             <div className="text-center w-full z-10">
                 <h3 className="font-bold text-[16px] leading-tight text-white">{selectedIdStudent.name}</h3>
                 <p className="text-[11px] text-amber-300 font-bold mt-0.5">{selectedIdStudent.student_class} | Roll: #{selectedIdStudent.roll_no}</p>
             </div>
             <div className="bg-white/10 backdrop-blur-md w-full rounded-lg p-2.5 text-[9px] space-y-1 mt-2 z-10 border border-white/20">
                 <p><strong>Blood Group:</strong> <span className="text-rose-400 font-bold">{selectedIdStudent.blood_group || 'N/A'}</span></p>
                 <p><strong>Phone:</strong> {selectedIdStudent.phone || 'N/A'}</p>
             </div>
             <div className="w-full h-1.5 bg-gradient-to-r from-amber-400 to-orange-500 absolute bottom-0 left-0"></div>
          </div>
        </div>
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-72 bg-slate-900/80 backdrop-blur-xl border-r border-slate-800/80 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-8">
            {school.logo_url ? (
              <img src={school.logo_url} alt="Logo" className="w-12 h-12 rounded-xl object-cover bg-white p-1" />
            ) : (
              <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-3 rounded-2xl shadow-lg shadow-blue-500/20"><School className="text-white" size={26} /></div>
            )}
            <div><h1 className="text-xl font-black bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">{school.school_name || 'EduAdmin'}</h1><p className="text-xs text-slate-400">Smart School Portal</p></div>
          </div>
          <nav className="space-y-2">
            {[
              { id: 'dashboard', label: 'ভর্তি ও ড্যাশবোর্ড', icon: LayoutDashboard },
              { id: 'students', label: 'স্টুডেন্ট লিস্ট ও আপগ্রেড', icon: Users },
              { id: 'class_mgmt', label: 'Class Management', icon: Settings },
              { id: 'erp', label: 'ERP Billing & Fees', icon: DollarSign },
              { id: 'idcard', label: 'আইডি কার্ড জেনারেটর', icon: CreditCard },
              { id: 'profile', label: 'স্কুল প্রোফাইল', icon: Building },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${ activeTab === item.id ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 scale-102' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'}`}><Icon size={18} />{item.label}</button>
              );
            })}
            <button onClick={() => router.push('/mark-entry')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition mt-4"><FileSpreadsheet size={18} />মার্ক্স এনট্রি ও মার্কশিট →</button>
          </nav>
        </div>
        <div className="pt-6 border-t border-slate-800/80 space-y-2">
          <button onClick={() => router.push('/change-password')} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-white transition"><Key size={16} /> পাসওয়ার্ড পরিবর্তন</button>
          <button onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition"><LogOut size={16} /> লগ আউট</button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto w-full">
        
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            <h2 className="text-3xl font-bold">ওভারভিউ ও ভর্তি</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl flex items-center gap-4"><div className="p-4 bg-blue-500/10 text-blue-400 rounded-xl"><Users size={28} /></div><div><p className="text-xs text-slate-400">মোট স্টুডেন্ট</p><h3 className="text-3xl font-black text-white">{students.length} জন</h3></div></div>
            </div>
            
            <div className="bg-slate-900/60 border border-slate-800/80 p-6 md:p-8 rounded-2xl shadow-xl">
              <h3 className="text-xl font-bold flex items-center gap-2 text-blue-400 mb-6"><Plus size={22}/> {isEditingStudent ? 'স্টুডেন্টের তথ্য পরিবর্তন' : 'নতুন স্টুডেন্ট ভর্তি'}</h3>
              <form onSubmit={handleSaveStudent} className="space-y-6">
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2"><BookOpen size={14}/> ক্লাস সিলেক্ট *</label>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {classList.map(cls => (
                      <button type="button" key={cls} onClick={() => handleClassChangeInForm({target: {value: cls}})} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${formData.studentClass === cls ? 'bg-blue-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800'}`}>
                        {cls}
                      </button>
                    ))}
                    <button type="button" onClick={() => handleClassChangeInForm({target: {value: 'CUSTOM'}})} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${isAddingCustomClass ? 'bg-amber-600 text-white' : 'bg-slate-950 text-amber-500 border border-slate-800 hover:bg-slate-800'}`}>
                      + Custom Class
                    </button>
                  </div>
                  {isAddingCustomClass && (
                    <div className="flex gap-2 mt-2">
                      <input type="text" placeholder="Type Custom Class Name" value={customClassInput} onChange={(e) => setCustomClassInput(e.target.value)} className="bg-slate-950 border border-slate-800 px-3 py-3 rounded-xl text-white flex-1 text-xs" />
                      <button type="button" onClick={handleAddCustomClass} className="bg-amber-600 px-4 py-2 rounded-xl text-xs font-bold text-white">Save Class</button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div><label className="text-xs font-semibold text-slate-300 mb-2 block">অটো রোল নম্বর</label><input type="text" value={`#${formData.rollNo || getNextRollForClass(formData.studentClass)}`} disabled className="w-full bg-slate-900 border border-slate-800 px-4 py-3 rounded-xl text-blue-400 font-bold" /></div>
                  <div><label className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2"><User size={14}/> নাম *</label><input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-white" required /></div>
                  <div><label className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2"><Phone size={14}/> মোবাইল</label><input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-white" /></div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2"><Droplet size={14}/> ব্লাড গ্রুপ</label>
                    <select name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-white"><option value="">সিলেক্ট করুন</option><option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option><option value="O+">O+</option><option value="O-">O-</option><option value="AB+">AB+</option><option value="AB-">AB-</option></select>
                  </div>
                  <div><label className="text-xs font-semibold text-slate-300 mb-2 block">জেন্ডার</label><select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-white"><option value="Male">Male</option><option value="Female">Female</option></select></div>
                  <div className="md:col-span-2"><label className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2"><Image size={14}/> ফটো URL</label><input type="url" name="photoUrl" value={formData.photoUrl} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-white" /></div>
                  <div className="md:col-span-3"><label className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2"><MapPin size={14}/> ঠিকানা</label><input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-white" /></div>
                </div>
                <button type="submit" className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3.5 rounded-xl font-bold shadow-lg">{isEditingStudent ? 'আপডেট সেভ করুন' : 'স্টুডেন্ট ভর্তি করুন'}</button>
              </form>
            </div>
          </div>
        )}

        {/* STUDENTS LIST TAB */}
        {activeTab === 'students' && (
          <div className="space-y-6 animate-fade-in w-full">
            <h2 className="text-2xl font-bold">স্টুডেন্ট লিস্ট ও কন্টাক্ট ইনফো</h2>
            
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button onClick={() => setSelectedClassFilter('All')} className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${selectedClassFilter === 'All' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'}`}>All Classes</button>
              {activeClasses.map(cls => (
                <button key={cls} onClick={() => setSelectedClassFilter(cls)} className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${selectedClassFilter === cls ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'}`}>{cls}</button>
              ))}
            </div>

            <div className="flex justify-between items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3.5 text-slate-500" size={18} />
                <input type="text" placeholder="সার্চ করুন..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-900 border border-slate-800 pl-12 pr-4 py-3 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              {selectedClassFilter !== 'All' && (<button onClick={() => handleUpgradeClass(selectedClassFilter)} className="bg-emerald-600 hover:bg-emerald-700 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap"><ArrowUpCircle size={16} /> আপগ্রেড ক্লাস</button>)}
            </div>
            
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-x-auto shadow-xl">
              <table className="w-full text-left min-w-[600px]">
                <thead className="bg-slate-800/50 text-slate-400 text-xs"><tr><th className="p-4">রোল</th><th className="p-4">নাম</th><th className="p-4">ক্লাস</th><th className="p-4">ফোন</th><th className="p-4">কন্টাক্ট</th><th className="p-4">অ্যাকশন</th></tr></thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {filterStudentsList(students).map((st) => (
                    <tr key={st.id} className="hover:bg-slate-800/30">
                      <td className="p-4 font-bold text-blue-400">#{st.roll_no}</td><td className="p-4 font-medium">{st.name}</td>
                      <td className="p-4"><span className="bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-lg text-xs">{st.student_class}</span></td>
                      <td className="p-4 text-slate-400">{st.phone || 'N/A'}</td>
                      <td className="p-4"><button onClick={() => setContactModalStudent(st)} className="bg-blue-600/20 text-blue-400 border border-blue-500/30 px-3 py-1.5 rounded-lg text-xs font-bold"><PhoneCall size={14} /> প্রোফাইল</button></td>
                      <td className="p-4 flex gap-2">
                        <button onClick={() => handleEditClick(st)} className="bg-amber-500/10 text-amber-400 p-2 rounded-lg"><Edit size={16} /></button>
                        <button onClick={() => handleDeleteStudent(st.id, st.student_class)} className="bg-red-500/10 text-red-400 p-2 rounded-lg"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CLASS MANAGEMENT TAB */}
        {activeTab === 'class_mgmt' && (
          <div className="space-y-6 animate-fade-in w-full">
            <h2 className="text-2xl font-bold">Class Management & Academic Config</h2>
            
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {classList.map(cls => (
                <button key={cls} onClick={() => fetchClassConfigDetails(cls)} className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${selectedConfigClass === cls ? 'bg-amber-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'}`}>{cls}</button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-4">
                <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2"><Calendar size={18}/> একাডেমিক বছর ও সেশন কনফিগ</h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div><label className="block text-slate-400 mb-1">Academic Year</label><input type="text" value={classConfig.academic_year} onChange={(e) => setClassConfig({ ...classConfig, academic_year: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white font-bold" /></div>
                  <div>
                    <label className="block text-slate-400 mb-1">Class Start Month</label>
                    <select value={classConfig.start_month} onChange={(e) => setClassConfig({ ...classConfig, start_month: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white">
                      {monthsName.map((m, idx) => (<option key={idx} value={idx + 1}>{m}</option>))}
                    </select>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-blue-400 pt-4">সাবজেক্ট ও মার্ক্স কনফিগারেশন</h3>
                {classConfig.subjects.map((sub, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input type="text" placeholder="Sub" value={sub.name} onChange={(e) => { const updated = [...classConfig.subjects]; updated[idx].name = e.target.value; setClassConfig({ ...classConfig, subjects: updated }); }} className="bg-slate-950 border border-slate-800 p-2 rounded-lg text-white flex-1 text-xs" />
                    <input type="number" placeholder="Oral" value={sub.oral} onChange={(e) => { const updated = [...classConfig.subjects]; updated[idx].oral = parseInt(e.target.value) || 0; setClassConfig({ ...classConfig, subjects: updated }); }} className="bg-slate-950 border border-slate-800 p-2 rounded-lg text-white w-20 text-xs text-center" />
                    <input type="number" placeholder="Theory" value={sub.theory} onChange={(e) => { const updated = [...classConfig.subjects]; updated[idx].theory = parseInt(e.target.value) || 0; setClassConfig({ ...classConfig, subjects: updated }); }} className="bg-slate-950 border border-slate-800 p-2 rounded-lg text-white w-20 text-xs text-center" />
                  </div>
                ))}
                <button type="button" onClick={handleAddSubjectField} className="text-xs bg-slate-800 text-blue-400 px-3 py-2 rounded-lg">+ সাবজেক্ট যোগ করুন</button>
              </div>
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-4">
                <h3 className="text-lg font-bold text-emerald-400">ফি স্ট্রাকচার (₹) ({selectedConfigClass})</h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div><label className="block text-slate-400 mb-1">Admission Fee (₹)</label><input type="number" value={classConfig.admission_fee} onChange={(e) => setClassConfig({ ...classConfig, admission_fee: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white" /></div>
                  <div><label className="block text-slate-400 mb-1">Monthly Tuition Fee (₹)</label><input type="number" value={classConfig.tuition_fee} onChange={(e) => setClassConfig({ ...classConfig, tuition_fee: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white" /></div>
                  <div><label className="block text-slate-400 mb-1">Term 1 Exam Fee (₹)</label><input type="number" value={classConfig.exam1_fee} onChange={(e) => setClassConfig({ ...classConfig, exam1_fee: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white" /></div>
                  <div><label className="block text-slate-400 mb-1">Term 2 Exam Fee (₹)</label><input type="number" value={classConfig.exam2_fee} onChange={(e) => setClassConfig({ ...classConfig, exam2_fee: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white" /></div>
                  <div><label className="block text-slate-400 mb-1">Term 3 Exam Fee (₹)</label><input type="number" value={classConfig.exam3_fee} onChange={(e) => setClassConfig({ ...classConfig, exam3_fee: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white" /></div>
                  <div><label className="block text-slate-400 mb-1">Custom Fee (₹)</label><input type="number" value={classConfig.custom_fee} onChange={(e) => setClassConfig({ ...classConfig, custom_fee: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white" /></div>
                </div>
              </div>
            </div>
            <button onClick={handleSaveClassConfig} className="bg-emerald-600 px-8 py-3 rounded-xl font-bold">Class Config সেভ করুন</button>
          </div>
        )}

        {/* ADVANCED ERP BILLING & MONTHLY TRACKER */}
        {activeTab === 'erp' && (
          <div className="space-y-6 animate-fade-in w-full">
            <h2 className="text-2xl font-bold">ERP Financial Summary & Billing</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-emerald-950/40 border border-emerald-500/30 p-6 rounded-2xl flex items-center justify-between">
                <div><p className="text-xs text-emerald-400 font-semibold">Total Revenue Collected</p><h3 className="text-3xl font-black text-white mt-1">₹{totalCollectedRevenue}</h3></div><div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl"><DollarSign size={28} /></div>
              </div>
              <div onClick={() => setShowOnlyPendingList(!showOnlyPendingList)} className={`border p-6 rounded-2xl flex items-center justify-between cursor-pointer transition ${showOnlyPendingList ? 'bg-rose-900/60 border-rose-500 ring-2 ring-rose-500' : 'bg-rose-950/40 border-rose-500/30'}`}>
                <div><p className="text-xs text-rose-400 font-semibold">Total Pending Due (ফিল্টার করতে ক্লিক করুন)</p><h3 className="text-3xl font-black text-white mt-1">₹{totalPendingDue}</h3></div><div className="p-3 bg-rose-500/20 text-rose-400 rounded-xl"><AlertCircle size={28} /></div>
              </div>
            </div>

            {!showOnlyPendingList ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Column: Student Selection & Profile Edit */}
                <div className="lg:col-span-4 space-y-6">
                  
                  <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-xl">
                    <div className="space-y-5">
                      <div>
                        <label className="text-xs text-slate-400 block mb-2">১. ক্লাস সিলেক্ট করুন</label>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                          {activeClasses.length > 0 ? activeClasses.map(c => (
                            <button key={c} onClick={() => { setErpSelectedClass(c); setErpStudent(null); }} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${erpSelectedClass === c ? 'bg-blue-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800'}`}>
                              {c}
                            </button>
                          )) : <p className="text-xs text-slate-500">কোনো স্টুডেন্ট ভর্তি নেই।</p>}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-slate-400 block mb-2">২. স্টুডেন্ট সিলেক্ট করুন</label>
                        <select disabled={!erpSelectedClass} value={erpStudent?.id || ''} onChange={(e) => handleSelectErpStudent(students.find(s => s.id === e.target.value))} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                          <option value="">স্টুডেন্ট বেছে নিন...</option>
                          {students.filter(s => s.student_class === erpSelectedClass).map(s => (
                            <option key={s.id} value={s.id}>{s.name} (Roll: #{s.roll_no})</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {erpStudent && (
                      <div className="mt-6 pt-6 border-t border-slate-800 space-y-4">
                        <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2"><User size={16}/> Student Fee Profile</h4>
                        <p className="text-[10px] text-slate-400 mb-2">এই স্টুডেন্টের নির্দিষ্ট ফিস সেট করুন। এই ফিস থেকে অটো ডিসকাউন্ট হিসাব হবে।</p>
                        <div><label className="text-xs text-slate-400 block mb-1">Agreed Monthly Fee (₹)</label><input type="number" value={agreedFees.monthly} onChange={e => setAgreedFees({...agreedFees, monthly: e.target.value})} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white text-sm" /></div>
                        <div><label className="text-xs text-slate-400 block mb-1">Agreed Admission Fee (₹)</label><input type="number" value={agreedFees.admission} onChange={e => setAgreedFees({...agreedFees, admission: e.target.value})} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white text-sm" /></div>
                        <button onClick={saveAgreedFeesToDB} className="w-full bg-amber-600/20 text-amber-500 border border-amber-500/30 py-2 rounded-xl text-xs font-bold hover:bg-amber-600/40 transition">প্রোফাইল সেভ করুন</button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Collection & Tracking */}
                {erpStudent && erpClassConfig && (
                  <div className="lg:col-span-8 space-y-6">
                    
                    {/* ADMISSION & MONTHLY TRACKER */}
                    <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-xl overflow-x-auto">
                      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                        <h3 className="text-lg font-bold text-blue-400 flex items-center gap-2"><Calendar size={18}/> Payment Status Tracker</h3>
                        {(() => {
                          const admFee = agreedFees.admission;
                          const admPaid = erpTransactions.filter(tx => tx.fee_type === 'Admission Fee').reduce((s,tx) => s+(Number(tx.paid_amount)||0), 0);
                          const isPaid = admPaid >= admFee && admFee > 0;
                          return (
                            <div className={`px-4 py-1.5 rounded-lg border text-xs font-bold ${isPaid ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'}`}>
                              Admission Fee: {isPaid ? 'Paid' : `Due (₹${Math.max(0, admFee - admPaid)})`}
                            </div>
                          );
                        })()}
                      </div>

                      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 min-w-[500px]">
                        {monthsName.map((m, idx) => {
                          const statusObj = getMonthlyStatus(idx);
                          return (
                            <div key={idx} className={`p-3 rounded-xl text-center flex flex-col justify-center items-center h-20 border ${statusObj.bg} ${statusObj.border}`}>
                              <span className={`text-xs font-bold ${statusObj.text}`}>{m}</span>
                              <span className={`text-[10px] mt-1 font-semibold px-2 py-0.5 rounded ${statusObj.badgeBg}`}>{statusObj.label}</span>
                              {statusObj.subText && <span className="text-[9px] mt-0.5 opacity-80">{statusObj.subText}</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Multiple Fee Selection Form */}
                    <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-5">
                      <h3 className="text-lg font-bold text-emerald-400">ফি কালেকশন সার্ভিস</h3>
                      <div>
                        <label className="text-xs text-slate-400 block mb-2">যে যে ফি প্রদান করছে তা সিলেক্ট করুন:</label>
                        <div className="flex flex-wrap gap-2">
                          {feeOptionsList.map(fee => (
                            <button type="button" key={fee} onClick={() => toggleFeeType(fee)} className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${ erpSelectedFeeTypes.includes(fee) ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20' : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-600' }`}>
                              {fee}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                          <label className="text-[10px] text-slate-500 block mb-1 uppercase tracking-wider">Total Due For Selected Fees</label>
                          <p className="text-xl font-black text-rose-400">₹{erpBaseAmount}</p>
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Discount Amount (₹)</label>
                          <input type="number" placeholder="Enter manual discount" value={erpDiscount} onChange={(e) => setErpDiscount(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white text-sm outline-none focus:border-blue-500" />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-emerald-400 block mb-1">Amount Paying Now (₹) *</label>
                        <input type="number" placeholder="কত টাকা প্রদান করল" value={erpPaidAmount} onChange={(e) => setErpPaidAmount(e.target.value)} className="w-full bg-slate-950 border border-emerald-500/50 p-4 rounded-xl text-emerald-400 font-black text-lg outline-none focus:border-emerald-400" />
                      </div>

                      <button onClick={handleCreateInvoice} className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 text-white py-3.5 rounded-xl font-black text-sm transition">
                        ফি জমা নিন ও রসিদ প্রিন্ট করুন
                      </button>
                    </div>

                    {/* Transaction History */}
                    <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
                      <h3 className="text-lg font-bold text-blue-400 flex items-center gap-2">পেমেন্ট হিস্ট্রি</h3>
                      {erpTransactions.length > 0 ? (
                        <div className="overflow-x-auto rounded-xl border border-slate-800">
                          <table className="w-full text-left text-xs border-collapse min-w-[500px]">
                            <thead className="bg-slate-800 text-slate-400">
                              <tr><th className="p-3">তারিখ</th><th className="p-3">ফি টাইপ</th><th className="p-3 text-right">Payment</th><th className="p-3 text-right">Due Left</th><th className="p-3 text-center">অ্যাকশন</th></tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800 bg-slate-900/40">
                              {erpTransactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-slate-800/40">
                                  <td className="p-3 text-slate-400">{new Date(tx.created_at).toLocaleDateString()}</td>
                                  <td className="p-3 font-bold text-white">{tx.fee_type}</td>
                                  <td className="p-3 text-right font-black text-emerald-400">₹{tx.paid_amount || tx.final_amount}</td>
                                  <td className="p-3 text-right font-bold text-rose-400">{tx.pending_amount > 0 ? `₹${tx.pending_amount}` : '-'}</td>
                                  <td className="p-3 flex justify-center gap-2">
                                    <button onClick={() => viewReceiptFromHistory(tx)} className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/40 p-1.5 rounded"><Printer size={14} /></button>
                                    <button onClick={() => setEditingTx(tx)} className="bg-amber-500/20 text-amber-400 hover:bg-amber-500/40 p-1.5 rounded"><Edit size={14} /></button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (<p className="text-xs text-slate-500 p-4 border border-slate-800 border-dashed rounded-xl text-center">এখনো কোনো ট্রানজেকশন হয়নি।</p>)}
                    </div>

                  </div>
                )}
              </div>
            ) : (
              /* Pending Due List */
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-rose-400">বকেয়া / পেন্ডিং ফি স্টুডেন্টদের তালিকা</h3>
                  <button onClick={() => setShowOnlyPendingList(false)} className="bg-slate-800 px-3 py-1.5 rounded-lg text-xs hover:bg-slate-700">ফিল্টার সরান</button>
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs border-collapse min-w-[600px]">
                    <thead className="bg-slate-800 text-slate-400"><tr><th className="p-3">স্টুডেন্ট ও ক্লাস</th><th className="p-3">ফি বিবরণ</th><th className="p-3 text-right">মোট বাকি (₹)</th><th className="p-3 text-center">যোগাযোগ</th></tr></thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-900/40">
                      {pendingTransactionsList.map((tx, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40">
                          <td className="p-3"><p className="font-bold text-white">{tx.students?.name || 'N/A'}</p><p className="text-[10px] text-slate-400">{tx.students?.student_class} | Roll: #{tx.students?.roll_no}</p></td>
                          <td className="p-3 font-semibold text-slate-300">{tx.fee_type}</td>
                          <td className="p-3 text-right font-black text-rose-400">₹{tx.pending_amount}</td>
                          <td className="p-3 text-center">
                            {tx.students?.phone ? (<a href={`tel:${tx.students.phone}`} className="bg-emerald-600/20 text-emerald-400 px-3 py-1.5 rounded-lg font-bold inline-flex items-center gap-1.5"><PhoneCall size={12} /> কল দিন</a>) : '-'}
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

        {/* ID CARD TAB (PVC Print Ready) */}
        {activeTab === 'idcard' && (
          <div className="space-y-6 animate-fade-in w-full">
            <h2 className="text-2xl font-bold">PVC আইডি কার্ড জেনারেটর</h2>
            
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-5">
              <div>
                <label className="text-xs text-slate-400 block mb-2">১. ক্লাস সিলেক্ট করুন</label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {activeClasses.length > 0 ? activeClasses.map(c => (
                    <button key={c} onClick={() => { setIdSelectedClass(c); setSelectedIdStudent(null); }} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${idSelectedClass === c ? 'bg-blue-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800'}`}>
                      {c}
                    </button>
                  )) : <p className="text-xs text-slate-500">কোনো স্টুডেন্ট ভর্তি নেই।</p>}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-2">২. স্টুডেন্ট সিলেক্ট করুন</label>
                <select disabled={!idSelectedClass} value={selectedIdStudent?.id || ''} onChange={(e) => setSelectedIdStudent(students.find(s => s.id === e.target.value))} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                  <option value="">স্টুডেন্ট বেছে নিন...</option>
                  {students.filter(s => s.student_class === idSelectedClass).map(s => (
                    <option key={s.id} value={s.id}>{s.name} (Roll: #{s.roll_no})</option>
                  ))}
                </select>
              </div>

              {selectedIdStudent && (
                <div className="pt-6 border-t border-slate-800 flex flex-col md:flex-row gap-8 items-center md:items-start">
                  
                  {/* Digital Preview */}
                  <div className="w-[204px] h-[324px] bg-gradient-to-br from-blue-900 to-indigo-950 overflow-hidden relative flex flex-col items-center justify-between text-white p-4 rounded-xl border-4 border-slate-800 shadow-2xl shrink-0">
                     <div className="text-center w-full z-10">
                         <h2 className="font-black text-[14px] uppercase leading-tight tracking-wide">{school.school_name || 'SCHOOL NAME'}</h2>
                         <p className="text-[8px] opacity-80 mt-1">{school.address}</p>
                     </div>
                     <img src={selectedIdStudent.photo_url || 'https://via.placeholder.com/150'} className="w-20 h-20 rounded-full border-[3px] border-white object-cover my-2 shadow-lg z-10" />
                     <div className="text-center w-full z-10">
                         <h3 className="font-bold text-[16px] leading-tight text-white">{selectedIdStudent.name}</h3>
                         <p className="text-[11px] text-amber-300 font-bold mt-0.5">{selectedIdStudent.student_class} | Roll: #{selectedIdStudent.roll_no}</p>
                     </div>
                     <div className="bg-white/10 backdrop-blur-md w-full rounded-lg p-2.5 text-[9px] space-y-1 mt-2 z-10 border border-white/20">
                         <p><strong>Blood Group:</strong> <span className="text-rose-400 font-bold">{selectedIdStudent.blood_group || 'N/A'}</span></p>
                         <p><strong>Phone:</strong> {selectedIdStudent.phone || 'N/A'}</p>
                     </div>
                     <div className="w-full h-1.5 bg-gradient-to-r from-amber-400 to-orange-500 absolute bottom-0 left-0"></div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">PVC Print Ready</h3>
                    <p className="text-xs text-slate-400 mb-6 max-w-sm">কার্ডটি সরাসরি প্রিন্টারে দিয়ে PVC (Standard 54x86mm) সাইজে প্রিন্ট করতে নিচের বাটনে ক্লিক করুন এবং PDF সেভ করুন।</p>
                    <button onClick={() => setPrintIdCard(true)} className="bg-blue-600 px-6 py-3 rounded-xl font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500 transition flex items-center gap-2">
                      <Printer size={18} /> Print PVC Card
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ADVANCED ENTERPRISE SCHOOL PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="space-y-6 animate-fade-in w-full pb-10">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">স্কুল প্রোফাইল ও সেটিংস</h2>
              <button onClick={() => setEditSchool(!editSchool)} className="bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition flex items-center gap-2 shadow-lg shadow-blue-500/30">
                {editSchool ? <><X size={16}/> বাতিল করুন</> : <><Edit size={16}/> প্রোফাইল এডিট</>}
              </button>
            </div>

            {editSchool ? (
              <div className="bg-slate-900/80 border border-slate-800 p-6 md:p-8 rounded-3xl shadow-2xl">
                <form onSubmit={handleUpdateSchool} className="space-y-8">
                  
                  {/* Basic & Brand Identity */}
                  <div>
                    <h3 className="text-lg font-bold text-blue-400 mb-4 border-b border-slate-800 pb-2">ব্র্যান্ড আইডেন্টিটি</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div><label className="text-xs text-slate-400 block mb-1">স্কুলের নাম *</label><input type="text" value={school.school_name} onChange={(e) => setSchool({ ...school, school_name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white font-bold" required /></div>
                      <div><label className="text-xs text-slate-400 block mb-1">প্রতিষ্ঠাকাল (Estd. Year)</label><input type="text" value={school.estd_year || ''} onChange={(e) => setSchool({ ...school, estd_year: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white" placeholder="যেমন: 2005" /></div>
                      <div><label className="text-xs text-slate-400 block mb-1">লোগো URL (Image Link)</label><input type="url" value={school.logo_url || ''} onChange={(e) => setSchool({ ...school, logo_url: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white" placeholder="https://..." /></div>
                      <div><label className="text-xs text-slate-400 block mb-1">কভার ফটো URL (Banner)</label><input type="url" value={school.cover_url || ''} onChange={(e) => setSchool({ ...school, cover_url: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white" placeholder="https://..." /></div>
                    </div>
                  </div>

                  {/* Academic Details */}
                  <div>
                    <h3 className="text-lg font-bold text-amber-400 mb-4 border-b border-slate-800 pb-2">একাডেমিক তথ্য</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div><label className="text-xs text-slate-400 block mb-1">Govt. Registration No</label><input type="text" value={school.reg_no || ''} onChange={(e) => setSchool({ ...school, reg_no: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white" /></div>
                      <div><label className="text-xs text-slate-400 block mb-1">Education Board</label><input type="text" value={school.board || ''} onChange={(e) => setSchool({ ...school, board: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white" placeholder="যেমন: WBBSE, CBSE" /></div>
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Medium</label>
                        <select value={school.medium || ''} onChange={(e) => setSchool({ ...school, medium: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white">
                          <option value="">Select Medium</option><option value="Bengali">Bengali</option><option value="English">English</option><option value="Arabic">Arabic</option>
                        </select>
                      </div>
                      <div className="md:col-span-3"><label className="text-xs text-slate-400 block mb-1">প্রধান শিক্ষকের নাম (Principal/Headmaster)</label><input type="text" value={school.principal_name || ''} onChange={(e) => setSchool({ ...school, principal_name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white" /></div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div>
                    <h3 className="text-lg font-bold text-emerald-400 mb-4 border-b border-slate-800 pb-2">যোগাযোগের ঠিকানা</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div><label className="text-xs text-slate-400 block mb-1">Primary Phone</label><input type="text" value={school.phone || ''} onChange={(e) => setSchool({ ...school, phone: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white" /></div>
                      <div><label className="text-xs text-slate-400 block mb-1">Alternate / WhatsApp Phone</label><input type="text" value={school.alternate_phone || ''} onChange={(e) => setSchool({ ...school, alternate_phone: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white" /></div>
                      <div><label className="text-xs text-slate-400 block mb-1">Official Email</label><input type="email" value={school.email || ''} onChange={(e) => setSchool({ ...school, email: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white" /></div>
                      <div><label className="text-xs text-slate-400 block mb-1">Website URL</label><input type="url" value={school.website || ''} onChange={(e) => setSchool({ ...school, website: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white" /></div>
                      <div className="md:col-span-2"><label className="text-xs text-slate-400 block mb-1">Full Address</label><textarea value={school.address || ''} onChange={(e) => setSchool({ ...school, address: e.target.value })} rows="3" className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white resize-none" /></div>
                    </div>
                  </div>

                  <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 px-6 py-4 rounded-xl font-black text-sm transition shadow-lg shadow-emerald-500/20">আপডেট সেভ করুন</button>
                </form>
              </div>
            ) : (
              /* Premium View Mode */
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative">
                
                {/* Banner & Logo Section */}
                <div className="h-48 w-full bg-slate-800 relative" style={{ backgroundImage: `url(${school.cover_url || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop'})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                  <div className="absolute top-4 right-4 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-1 backdrop-blur-md">
                    <BadgeCheck size={14} /> Verified Enterprise
                  </div>
                </div>

                <div className="px-6 md:px-10 pb-8 relative -mt-16 flex flex-col md:flex-row gap-6 items-center md:items-end border-b border-slate-800">
                  <div className="w-32 h-32 rounded-full border-4 border-slate-900 bg-white shadow-xl flex items-center justify-center overflow-hidden shrink-0 z-10 relative group">
                    {school.logo_url ? (
                      <img src={school.logo_url} alt="School Logo" className="w-full h-full object-contain p-2" />
                    ) : (
                      <School className="text-slate-300" size={50} />
                    )}
                  </div>
                  <div className="text-center md:text-left flex-1 pb-4">
                    <h1 className="text-3xl font-black text-white">{school.school_name || 'School Name Not Set'}</h1>
                    <p className="text-sm text-slate-400 mt-1 font-medium">{school.address || 'Address not added yet'}</p>
                  </div>
                </div>

                {/* Info Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 md:p-10">
                  
                  {/* Contact Info Card */}
                  <div className="bg-slate-950/50 border border-slate-800/80 p-6 rounded-2xl hover:bg-slate-900/80 transition">
                    <h3 className="text-xs uppercase tracking-widest font-bold text-slate-500 mb-5 border-b border-slate-800 pb-2">Contact Details</h3>
                    <div className="space-y-4 text-sm text-slate-300">
                      <div className="flex items-center gap-3"><PhoneCall size={18} className="text-blue-400" /> <div><p className="text-[10px] text-slate-500 font-semibold">Primary Phone</p><p className="font-bold text-white">{school.phone || 'N/A'}</p></div></div>
                      <div className="flex items-center gap-3"><Phone size={18} className="text-amber-400" /> <div><p className="text-[10px] text-slate-500 font-semibold">Alternate Phone</p><p className="font-bold text-white">{school.alternate_phone || 'N/A'}</p></div></div>
                      <div className="flex items-center gap-3"><Mail size={18} className="text-emerald-400" /> <div><p className="text-[10px] text-slate-500 font-semibold">Email Address</p><p className="font-medium text-white">{school.email || 'N/A'}</p></div></div>
                      <div className="flex items-center gap-3"><Globe size={18} className="text-indigo-400" /> <div><p className="text-[10px] text-slate-500 font-semibold">Website</p><a href={school.website} target="_blank" className="font-medium text-indigo-400 hover:underline">{school.website || 'N/A'}</a></div></div>
                    </div>
                  </div>

                  {/* Academic Info Card */}
                  <div className="bg-slate-950/50 border border-slate-800/80 p-6 rounded-2xl hover:bg-slate-900/80 transition">
                    <h3 className="text-xs uppercase tracking-widest font-bold text-slate-500 mb-5 border-b border-slate-800 pb-2">Academic Information</h3>
                    <div className="space-y-4 text-sm text-slate-300">
                      <div className="flex items-center gap-3"><FileText size={18} className="text-rose-400" /> <div><p className="text-[10px] text-slate-500 font-semibold">Govt. Registration No</p><p className="font-bold text-white">{school.reg_no || 'N/A'}</p></div></div>
                      <div className="flex items-center gap-3"><BookOpen size={18} className="text-blue-400" /> <div><p className="text-[10px] text-slate-500 font-semibold">Education Board</p><p className="font-bold text-white">{school.board || 'N/A'}</p></div></div>
                      <div className="flex items-center gap-3"><Globe size={18} className="text-emerald-400" /> <div><p className="text-[10px] text-slate-500 font-semibold">Medium of Study</p><p className="font-bold text-white">{school.medium || 'N/A'}</p></div></div>
                      <div className="flex items-center gap-3"><Calendar size={18} className="text-amber-400" /> <div><p className="text-[10px] text-slate-500 font-semibold">Established Year</p><p className="font-bold text-white">{school.estd_year || 'N/A'}</p></div></div>
                    </div>
                  </div>

                  {/* Administration Card */}
                  <div className="bg-slate-950/50 border border-slate-800/80 p-6 rounded-2xl hover:bg-slate-900/80 transition">
                    <h3 className="text-xs uppercase tracking-widest font-bold text-slate-500 mb-5 border-b border-slate-800 pb-2">Administration</h3>
                    <div className="space-y-4 text-sm text-slate-300">
                      <div className="flex items-center gap-3"><UserCheck size={18} className="text-purple-400" /> <div><p className="text-[10px] text-slate-500 font-semibold">Principal / Headmaster</p><p className="font-bold text-white">{school.principal_name || 'N/A'}</p></div></div>
                      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                        <p className="text-[10px] text-blue-400 font-bold mb-1">System Info</p>
                        <p className="text-xs text-slate-400">Total Admitted Students: <span className="font-bold text-white">{students.length}</span></p>
                        <p className="text-xs text-slate-400 mt-1">Active Classes: <span className="font-bold text-white">{activeClasses.length}</span></p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}