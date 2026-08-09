'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Users, CreditCard, FileSpreadsheet, UserCheck, Key, LogOut, 
  Plus, School, Search, ArrowUpCircle, DollarSign, Settings, Trash2, Edit, Save, 
  X, User, BookOpen, Phone, Droplet, MapPin, Image, Printer, AlertCircle, PhoneCall, 
  Calendar, Mail, Globe, Building, FileText, BadgeCheck, Loader2, CheckCircle, GraduationCap, FileOutput, File,
  Activity, Bell, CalendarCheck, Briefcase, UploadCloud, BarChart3
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

export default function Dashboard() {
  const [session, setSession] = useState(null);
  const [studentSession, setStudentSession] = useState(null);
  const [portalUrl, setPortalUrl] = useState('https://eduadmin.vercel.app'); 
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAdmissionModalOpen, setIsAdmissionModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const [school, setSchool] = useState({ school_name: '', address: '', phone: '', email: '', logo_url: '', cover_url: '', estd_year: '', reg_no: '', principal_name: '', website: '', alternate_phone: '', board: '', medium: '' });
  const [editSchool, setEditSchool] = useState(false);

  const defaultClasses = ['Nursery', 'KG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
  const [classList, setClassList] = useState(defaultClasses);
  const [customClassInput, setCustomClassInput] = useState('');
  const [isAddingCustomClass, setIsAddingCustomClass] = useState(false);

  const activeClasses = [...new Set(students.filter(s => s.status === 'Active' || !s.status).map(s => s.student_class))].sort((a, b) => {
    const aIdx = classList.indexOf(a); const bIdx = classList.indexOf(b);
    return (aIdx !== -1 ? aIdx : 99) - (bIdx !== -1 ? bIdx : 99);
  });

  const [studentStatusTab, setStudentStatusTab] = useState('Active');
  const [selectedClassFilter, setSelectedClassFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({ id: null, name: '', rollNo: '', studentClass: 'Class 1', phone: '', bloodGroup: '', address: '', gender: 'Male', photoUrl: '', fatherName: '', motherName: '', dob: '', aadharNo: '', religion: '', category: 'General' });
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  
  // Staff State
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [staffData, setStaffData] = useState({ id: null, name: '', role: 'Teacher', phone: '', salary: 0, status: 'Active' });

  // Attendance State
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceClass, setAttendanceClass] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState({});

  const [contactModalStudent, setContactModalStudent] = useState(null);
  const [statusModalStudent, setStatusModalStudent] = useState(null);
  const [statusAction, setStatusAction] = useState('Transferred'); 
  const [statusReason, setStatusReason] = useState('Relocation');
  const [tcPrintData, setTcPrintData] = useState(null);

  const [idSelectedClass, setIdSelectedClass] = useState('');
  const [selectedIdStudent, setSelectedIdStudent] = useState(null);
  const [printIdCard, setPrintIdCard] = useState(false); 

  const [selectedConfigClass, setSelectedConfigClass] = useState('Class 1');
  const [allClassConfigs, setAllClassConfigs] = useState({});
  const [classConfig, setClassConfig] = useState({ academic_year: '2026', start_month: 1, subjects: [], admission_fee: 1000, tuition_fee: 500, exam1_fee: 200, exam2_fee: 200, exam3_fee: 200, custom_fee: 0 });

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

  const [studentPortalData, setStudentPortalData] = useState({ marks: [], tx: [] });
  const monthsName = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const router = useRouter();

  const getPaidAmount = (tx) => tx.paid_amount != null ? Number(tx.paid_amount) : Number(tx.final_amount || 0);

  const getExpectedAmountForFee = (feeType, configData, aMonthly, aAdmission) => {
    if (feeType === 'Tuition Fee') {
      const currentMonth = new Date().getMonth() + 1;
      const startM = configData?.start_month || 1;
      return aMonthly * Math.max(1, (currentMonth - startM) + 1);
    }
    if (feeType === 'Admission Fee') return aAdmission;
    if (feeType === 'Term 1 Exam Fee') return Number(configData?.exam1_fee || 0);
    if (feeType === 'Term 2 Exam Fee') return Number(configData?.exam2_fee || 0);
    if (feeType === 'Term 3 Exam Fee') return Number(configData?.exam3_fee || 0);
    return Number(configData?.custom_fee || 0);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') setPortalUrl(window.location.origin);
    const checkAuth = async () => {
      const { data: { session: adminSession } } = await supabase.auth.getSession();
      const localStudent = localStorage.getItem('student_session');
      if (adminSession) {
        setSession(adminSession); fetchSchoolDetails(); loadClassConfigs(); fetchData(); fetchStaff();
      } else if (localStudent) {
        const student = JSON.parse(localStudent); setStudentSession(student);
        fetchSchoolDetails(); loadClassConfigs(); fetchStudentSpecificData(student.id, student.student_class);
      } else { router.push('/login'); }
    }; checkAuth();
  }, [router]);

  const fetchStudentSpecificData = async (studentId, studentClass) => {
    const { data: marks } = await supabase.from('marksheets').select('*').eq('student_id', studentId);
    const { data: tx } = await supabase.from('erp_transactions').select('*').eq('student_id', studentId).order('created_at', { ascending: false });
    setStudentPortalData({ marks: marks || [], tx: tx || [] }); setLoading(false);
  };

  const fetchData = async () => {
    setLoading(true);
    const { data: stData } = await supabase.from('students').select('*').order('student_class', { ascending: true }).order('roll_no', { ascending: true });
    setStudents(stData || []);
    const { data: txData } = await supabase.from('erp_transactions').select('*, students(name, roll_no, student_class, phone, status)').order('created_at', { ascending: false });
    setAllErpTransactions(txData || []); setLoading(false);
  };

  const fetchStaff = async () => {
    const { data } = await supabase.from('staff').select('*').order('id', { ascending: true });
    if(data) setStaffList(data);
  };

  const loadAttendance = async (cls, date) => {
    if(!cls || !date) return;
    const { data } = await supabase.from('attendance').select('*').eq('class_name', cls).eq('date', date);
    const records = {};
    if(data) data.forEach(d => { records[d.student_id] = d.status; });
    setAttendanceRecords(records);
  };

  const handleSaveAttendance = async (studentId, status) => {
    const newRecords = { ...attendanceRecords, [studentId]: status };
    setAttendanceRecords(newRecords);
    await supabase.from('attendance').upsert({ student_id: studentId, class_name: attendanceClass, date: attendanceDate, status: status }, { onConflict: 'student_id, date' });
  };

  const fetchSchoolDetails = async () => {
    const { data } = await supabase.from('school_settings').select('*').eq('id', 1).single();
    if (data) setSchool({ ...school, ...data });
  };

  const loadClassConfigs = async () => {
    const { data } = await supabase.from('class_configs').select('*');
    if (data) {
      const configMap = {}; data.forEach(item => { configMap[item.class_name] = item; });
      setAllClassConfigs(configMap);
      const customClasses = data.map(d => d.class_name);
      setClassList(Array.from(new Set([...defaultClasses, ...customClasses])));
    }
  };

  const getNextRollForClass = (cls) => {
    const classSts = students.filter(s => s.student_class === cls && (s.status === 'Active' || !s.status));
    return classSts.length === 0 ? 1 : Math.max(...classSts.map(s => s.roll_no)) + 1;
  };

  const getNextUniqueId = async () => {
    const { data } = await supabase.from('students').select('unique_id').order('unique_id', { ascending: true }).limit(1);
    if (data && data.length > 0 && data[0].unique_id) return data[0].unique_id - 1;
    return 99999;
  };

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleClassChangeInForm = (e) => {
    const cls = e.target.value;
    if (cls === 'CUSTOM') setIsAddingCustomClass(true); 
    else { setIsAddingCustomClass(false); setFormData({ ...formData, studentClass: cls, rollNo: getNextRollForClass(cls) }); }
  };

  const handleAddCustomClass = () => {
    if (!customClassInput.trim()) return;
    if (!classList.includes(customClassInput)) {
      setClassList([...classList, customClassInput]); setFormData({ ...formData, studentClass: customClassInput, rollNo: getNextRollForClass(customClassInput) });
    }
    setCustomClassInput(''); setIsAddingCustomClass(false);
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.studentClass || !formData.dob) return showToast('নাম, ক্লাস এবং জন্মতারিখ আবশ্যক!', 'error');
    setIsProcessing(true);
    if (isEditingStudent) {
      const { error } = await supabase.from('students').update({
        name: formData.name, father_name: formData.fatherName, mother_name: formData.motherName, dob: formData.dob, 
        student_class: formData.studentClass, phone: formData.phone, blood_group: formData.bloodGroup, address: formData.address, 
        gender: formData.gender, photo_url: formData.photoUrl || 'https://via.placeholder.com/150',
        aadhar_no: formData.aadharNo, religion: formData.religion, category: formData.category
      }).eq('id', formData.id);
      if (!error) { showToast('স্টুডেন্ট আপডেট হয়েছে!'); resetStudentForm(); fetchData(); } else showToast('আপডেট ব্যর্থ: ' + error.message, 'error');
    } else {
      const roll = getNextRollForClass(formData.studentClass); const newUniqueId = await getNextUniqueId();
      const { error } = await supabase.from('students').insert([{
        name: formData.name, father_name: formData.fatherName, mother_name: formData.motherName, dob: formData.dob, 
        unique_id: newUniqueId, roll_no: roll, student_class: formData.studentClass, phone: formData.phone, 
        blood_group: formData.bloodGroup, address: formData.address, gender: formData.gender, status: 'Active', 
        photo_url: formData.photoUrl || 'https://via.placeholder.com/150', email: `student_${formData.studentClass}_${roll}@school.com`,
        aadhar_no: formData.aadharNo, religion: formData.religion, category: formData.category
      }]);
      if (!error) { showToast(`স্টুডেন্ট ভর্তি সম্পন্ন! Unique ID: ${newUniqueId}`); resetStudentForm(); fetchData(); } else showToast('ভর্তি ব্যর্থ: ' + error.message, 'error');
    }
    setIsProcessing(false);
  };

  const handleSaveStaff = async (e) => {
    e.preventDefault(); setIsProcessing(true);
    if (staffData.id) {
      await supabase.from('staff').update({ name: staffData.name, role: staffData.role, phone: staffData.phone, salary: staffData.salary, status: staffData.status }).eq('id', staffData.id);
      showToast('Staff Updated!');
    } else {
      await supabase.from('staff').insert([{ name: staffData.name, role: staffData.role, phone: staffData.phone, salary: staffData.salary, status: 'Active' }]);
      showToast('New Staff Added!');
    }
    setIsStaffModalOpen(false); fetchStaff(); setIsProcessing(false);
  };

  const handleEditClick = (st) => {
    setFormData({ id: st.id, name: st.name, fatherName: st.father_name || '', motherName: st.mother_name || '', dob: st.dob || '', rollNo: st.roll_no, studentClass: st.student_class, phone: st.phone || '', bloodGroup: st.blood_group || '', address: st.address || '', gender: st.gender || 'Male', photoUrl: st.photo_url || '', aadharNo: st.aadhar_no || '', religion: st.religion || '', category: st.category || 'General' });
    setIsEditingStudent(true); setIsAdmissionModalOpen(true);
  };

  const handleDeleteStudent = async (id, className) => {
    if (confirm('স্টুডেন্টের সকল তথ্য পার্মানেন্ট ডিলিট করতে চান?')) {
      await supabase.from('students').delete().eq('id', id);
      const remaining = students.filter(s => s.student_class === className && s.id !== id && (s.status === 'Active' || !s.status));
      for (let i = 0; i < remaining.length; i++) { await supabase.from('students').update({ roll_no: i + 1 }).eq('id', remaining[i].id); }
      showToast('স্টুডেন্ট মুছে ফেলা হয়েছে!'); fetchData();
    }
  };

  const handleUpgradeClass = async (currentClass) => {
    if (currentClass === 'Class 12') {
      if (confirm(`Class 12-এর সবাইকে Passout করে Alumni লিস্টে পাঠাতে চান?`)) {
        const classSts = students.filter(s => s.student_class === currentClass && (s.status === 'Active' || !s.status));
        const currentYear = new Date().getFullYear().toString();
        Promise.all(classSts.map(async (st) => { await supabase.from('students').update({ status: 'Passout', passout_year: currentYear }).eq('id', st.id); })).then(() => { showToast('সকল স্টুডেন্ট Passout হয়েছে!'); fetchData(); });
      } return;
    }
    const nextClassMap = { 'Nursery':'KG', 'KG':'Class 1', 'Class 1':'Class 2', 'Class 2':'Class 3', 'Class 3':'Class 4', 'Class 4':'Class 5', 'Class 5':'Class 6', 'Class 6':'Class 7', 'Class 7':'Class 8', 'Class 8':'Class 9', 'Class 9':'Class 10', 'Class 10':'Class 11', 'Class 11':'Class 12' };
    const targetClass = nextClassMap[currentClass] || 'Higher Class';
    if (confirm(`${currentClass} এর সবাইকে ${targetClass} এ প্রমোট করতে চান?`)) {
      const classSts = students.filter(s => s.student_class === currentClass && (s.status === 'Active' || !s.status));
      Promise.all(classSts.map(async (st, idx) => { await supabase.from('students').update({ student_class: targetClass, roll_no: idx + 1 }).eq('id', st.id); })).then(() => { showToast('ক্লাস আপগ্রেড সম্পন্ন হয়েছে!'); fetchData(); });
    }
  };

  const handleChangeStatus = async () => {
    if (!statusModalStudent) return; setIsProcessing(true);
    let payload = statusAction === 'Passout' ? { status: 'Passout', passout_year: new Date().getFullYear().toString() } : { status: 'Transferred', transfer_date: new Date().toISOString(), tc_reason: statusReason };
    const { error } = await supabase.from('students').update(payload).eq('id', statusModalStudent.id);
    if (!error) { showToast(`স্টুডেন্ট ${statusAction} হিসেবে সেভ হয়েছে!`); setStatusModalStudent(null); fetchData(); } else showToast('Error: ' + error.message, 'error');
    setIsProcessing(false);
  };

  const resetStudentForm = () => { 
    setFormData({ id: null, name: '', fatherName: '', motherName: '', dob: '', rollNo: getNextRollForClass('Class 1'), studentClass: 'Class 1', phone: '', bloodGroup: '', address: '', gender: 'Male', photoUrl: '', aadharNo: '', religion: '', category: 'General' }); 
    setIsEditingStudent(false); setIsAdmissionModalOpen(false);
  };

  const handleUpdateSchool = async (e) => {
    e.preventDefault(); setIsProcessing(true);
    const { error } = await supabase.from('school_settings').update(school).eq('id', 1);
    if (!error) { showToast('স্কুল প্রোফাইল আপডেট হয়েছে!'); setEditSchool(false); } else showToast('Error', 'error');
    setIsProcessing(false);
  };

  const getFilteredStudents = () => {
    let filtered = students.filter(st => {
      const dbStatus = st.status || 'Active';
      if (studentStatusTab === 'Active' && dbStatus !== 'Active') return false;
      if (studentStatusTab === 'Passout' && dbStatus !== 'Passout') return false;
      if (studentStatusTab === 'Transferred' && dbStatus !== 'Transferred') return false;
      const matchClass = selectedClassFilter === 'All' || st.student_class === selectedClassFilter;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchClass;
      return matchClass && (st.name.toLowerCase().includes(q) || st.roll_no.toString().includes(q) || (st.unique_id && st.unique_id.toString().includes(q)));
    });
    if (studentStatusTab === 'Passout') filtered.sort((a, b) => (b.passout_year || '').localeCompare(a.passout_year || ''));
    else if (studentStatusTab === 'Transferred') filtered.sort((a, b) => new Date(b.transfer_date || 0) - new Date(a.transfer_date || 0));
    return filtered;
  };

  // EXPORT CSV
  const handleExportCSV = () => {
    const dataToExport = getFilteredStudents();
    if (dataToExport.length === 0) return showToast('এক্সপোর্ট করার মতো কোনো ডাটা নেই!', 'error');
    const headers = ['Unique ID', 'Roll No', 'Student Name', 'Class', 'DOB', 'Father Name', 'Phone', 'Address', 'Status'];
    const csvRows = dataToExport.map(st => [st.unique_id || 'N/A', st.roll_no || '', `"${st.name || ''}"`, st.student_class || '', st.dob || '', `"${st.father_name || ''}"`, st.phone || '', `"${st.address || ''}"`, st.status || 'Active']);
    const csvContent = [headers.join(','), ...csvRows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.setAttribute("href", url); link.setAttribute("download", `Students_Record_${new Date().toLocaleDateString('en-GB')}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    showToast('ডাটা সফলভাবে এক্সপোর্ট হয়েছে!');
  };

  // IMPORT CSV
  const handleImportCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      setIsProcessing(true);
      const text = e.target.result;
      const rows = text.split('\n').slice(1); // Skip header
      let count = 0;
      for (let row of rows) {
        if (!row.trim()) continue;
        const cols = row.split(',').map(col => col.replace(/(^"|"$)/g, '').trim()); // Remove quotes
        // Assuming CSV format: Name, Class, DOB, FatherName, Phone
        if (cols.length >= 3) {
          const cls = cols[1] || 'Class 1';
          const roll = getNextRollForClass(cls) + count; 
          await supabase.from('students').insert([{ name: cols[0], student_class: cls, dob: cols[2] || '2010-01-01', father_name: cols[3] || '', phone: cols[4] || '', roll_no: roll, status: 'Active' }]);
          count++;
        }
      }
      showToast(`${count} Students Imported Successfully!`);
      fetchData(); setIsProcessing(false); event.target.value = null;
    };
    reader.readAsText(file);
  };

  const fetchClassConfigDetails = async (cls) => {
    setSelectedConfigClass(cls); const data = allClassConfigs[cls];
    if (data) { setClassConfig({ ...data, academic_year: data.academic_year || '2026', start_month: data.start_month || 1, subjects: data.subjects || [] }); } 
    else { setClassConfig({ academic_year: '2026', start_month: 1, subjects: [], admission_fee: 1000, tuition_fee: 500, exam1_fee: 200, exam2_fee: 200, exam3_fee: 200, custom_fee: 0 }); }
  };
  
  const handleSaveClassConfig = async () => {
    setIsProcessing(true);
    const { error } = await supabase.from('class_configs').upsert({ class_name: selectedConfigClass, academic_year: classConfig.academic_year, start_month: parseInt(classConfig.start_month) || 1, subjects: classConfig.subjects || [], admission_fee: Number(classConfig.admission_fee)||0, tuition_fee: Number(classConfig.tuition_fee)||0, exam1_fee: Number(classConfig.exam1_fee)||0, exam2_fee: Number(classConfig.exam2_fee)||0, exam3_fee: Number(classConfig.exam3_fee)||0, custom_fee: Number(classConfig.custom_fee)||0 }, { onConflict: 'class_name' });
    if (!error) { showToast('Class Config সেভ হয়েছে!'); loadClassConfigs(); }
    setIsProcessing(false);
  };
  const handleAddSubjectField = () => { setClassConfig({ ...classConfig, subjects: [...(classConfig.subjects || []), { name: '', oral: 20, theory: 80 }] }); };

  // ERP Logic
  const handleSelectErpStudent = async (st) => {
    setErpStudent(st); if (!st) return;
    const { data: txData } = await supabase.from('erp_transactions').select('*').eq('student_id', st.id).order('created_at', { ascending: false });
    setErpTransactions(txData || []);
    const cConfig = allClassConfigs[st.student_class] || {}; setErpClassConfig(cConfig);
    const aMonthly = (st.agreed_monthly_fee !== null && st.agreed_monthly_fee !== "") ? Number(st.agreed_monthly_fee) : Number(cConfig.tuition_fee || 0);
    const aAdmission = (st.agreed_admission_fee !== null && st.agreed_admission_fee !== "") ? Number(st.agreed_admission_fee) : Number(cConfig.admission_fee || 0);
    setAgreedFees({ monthly: aMonthly, admission: aAdmission });
    calculateTotalDues(['Tuition Fee'], cConfig, aMonthly, aAdmission, txData || []);
    setErpSelectedFeeTypes(['Tuition Fee']);
  };

  const calculateTotalDues = (selectedTypes, configData, aMonthly, aAdmission, studentTx = []) => {
    let totalDue = 0;
    selectedTypes.forEach(feeType => {
      const payable = getExpectedAmountForFee(feeType, configData, aMonthly, aAdmission);
      const alreadyPaid = studentTx.filter(tx => tx.fee_type === feeType).reduce((s, tx) => s + getPaidAmount(tx), 0);
      totalDue += Math.max(0, payable - alreadyPaid);
    });
    setErpBaseAmount(totalDue); setErpPaidAmount(totalDue); setErpDiscount(0);
  };

  const toggleFeeType = (feeType) => {
    let updated = [...erpSelectedFeeTypes]; if (updated.includes(feeType)) updated = updated.filter(t => t !== feeType); else updated.push(feeType);
    if (updated.length === 0) updated = ['Tuition Fee']; setErpSelectedFeeTypes(updated); calculateTotalDues(updated, erpClassConfig, agreedFees.monthly, agreedFees.admission, erpTransactions);
  };

  const handleCreateInvoice = async () => {
    if (!erpStudent || erpSelectedFeeTypes.length === 0 || Number(erpPaidAmount) <= 0) return showToast('সঠিক তথ্য দিন!', 'error');
    setIsProcessing(true);
    const transactionsToInsert = []; const receiptItems = []; const globalDiscount = Number(erpDiscount); let discountApplied = false; let remainingPayment = Number(erpPaidAmount);

    for (let i = 0; i < erpSelectedFeeTypes.length; i++) {
      const feeType = erpSelectedFeeTypes[i];
      const payable = getExpectedAmountForFee(feeType, erpClassConfig, agreedFees.monthly, agreedFees.admission);
      const alreadyPaid = erpTransactions.filter(tx => tx.fee_type === feeType).reduce((s, tx) => s + getPaidAmount(tx), 0);
      const due = Math.max(0, payable - alreadyPaid);
      let allocateAmount = (feeType === 'Tuition Fee' || i === erpSelectedFeeTypes.length - 1) ? remainingPayment : Math.min(remainingPayment, due);
      if (allocateAmount > 0 || (!discountApplied && globalDiscount > 0)) {
        let appliedDisc = (!discountApplied && globalDiscount > 0) ? globalDiscount : 0; discountApplied = appliedDisc > 0 ? true : discountApplied;
        const netPayable = payable - appliedDisc; const newTotal = alreadyPaid + allocateAmount; const pending = Math.max(0, netPayable - newTotal);
        transactionsToInsert.push({ student_id: erpStudent.id, fee_type: feeType, amount: payable, discount: appliedDisc, final_amount: netPayable, paid_amount: allocateAmount, pending_amount: pending, status: (newTotal >= netPayable) ? 'Paid' : 'Pending' });
        receiptItems.push({ feeType, base: payable, discount: appliedDisc, net: netPayable, paid: allocateAmount });
        remainingPayment -= allocateAmount;
      }
    }
    const { error } = await supabase.from('erp_transactions').insert(transactionsToInsert);
    if (!error) {
      setReceiptData({ invoiceNo: 'INV-' + Math.floor(100000 + Math.random() * 900000), date: new Date().toLocaleDateString('en-GB'), student: erpStudent, items: receiptItems, totalPaid: Number(erpPaidAmount) });
      showToast('রসিদ তৈরি হয়েছে!'); handleSelectErpStudent(erpStudent); fetchData(); setErpPaidAmount(0); setErpDiscount(0);
    }
    setIsProcessing(false);
  };

  const handleUpdateTx = async () => {
    setIsProcessing(true);
    const net = Number(editingTx.amount) - Number(editingTx.discount);
    const actualPaid = Number(editingTx.paid_amount);
    const pend = Math.max(0, net - actualPaid);
    const stat = pend <= 0 ? 'Paid' : 'Pending';
    const { error } = await supabase.from('erp_transactions').update({ paid_amount: actualPaid, discount: Number(editingTx.discount), final_amount: net, pending_amount: pend, status: stat }).eq('id', editingTx.id);
    if (!error) { showToast('পেমেন্ট সফলভাবে আপডেট হয়েছে!'); setEditingTx(null); await fetchData(); handleSelectErpStudent(erpStudent); }
    setIsProcessing(false);
  };

  const saveAgreedFeesToDB = async () => {
    if (!erpStudent) return;
    const { error } = await supabase.from('students').update({ agreed_monthly_fee: Number(agreedFees.monthly), agreed_admission_fee: Number(agreedFees.admission) }).eq('id', erpStudent.id);
    if (!error) { showToast("এই স্টুডেন্টের নির্দিষ্ট ফিস প্রোফাইল সেভ হয়েছে!"); setErpStudent({...erpStudent, agreed_monthly_fee: Number(agreedFees.monthly), agreed_admission_fee: Number(agreedFees.admission)}); fetchData(); calculateTotalDues(erpSelectedFeeTypes, erpClassConfig, Number(agreedFees.monthly), Number(agreedFees.admission), erpTransactions); }
  };

  const viewReceiptFromHistory = (tx) => {
    const paidAmt = getPaidAmount(tx);
    setReceiptData({ invoiceNo: tx.id ? tx.id.substring(0, 8).toUpperCase() : 'INV-HIST', date: new Date(tx.created_at).toLocaleDateString('en-GB'), student: erpStudent, items: [{ feeType: tx.fee_type, base: tx.amount, discount: tx.discount, net: tx.final_amount, paid: paidAmt }], totalPaid: paidAmt });
  };

  const getMonthlyStatus = (monthIndex, studentObj = null, txData = null, cConfig = null) => {
    const config = cConfig || erpClassConfig; const tx = txData || erpTransactions; const st = studentObj || erpStudent;
    const currentMonth = new Date().getMonth(); const startM = (config?.start_month || 1) - 1; 
    if (monthIndex < startM) return { label: 'N/A', bg: 'bg-slate-900', text: 'text-slate-600', border: 'border-slate-800', badgeBg: 'bg-slate-800' };
    const totalTuitionPaid = tx.filter(t => t.fee_type === 'Tuition Fee').reduce((s, t) => s + getPaidAmount(t), 0);
    const feePerMonth = (st?.agreed_monthly_fee !== null && st?.agreed_monthly_fee !== "") ? Number(st.agreed_monthly_fee) : Number(config?.tuition_fee || 0);
    const availableForThisMonth = Math.max(0, totalTuitionPaid - ((monthIndex - startM) * feePerMonth));
    if (availableForThisMonth >= feePerMonth) return { label: 'Paid', subText: `₹${feePerMonth}`, bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', badgeBg: 'bg-emerald-500/20' };
    if (availableForThisMonth > 0) return { label: 'Partial', subText: `Paid: ₹${availableForThisMonth}`, bg: 'bg-lime-500/10', text: 'text-lime-400', border: 'border-lime-500/40', badgeBg: 'bg-lime-500/20' };
    if (monthIndex <= currentMonth) return { label: 'Due', subText: `Due: ₹${feePerMonth}`, bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30', badgeBg: 'bg-rose-500/20' };
    return { label: 'Upcoming', bg: 'bg-slate-800/50', text: 'text-slate-300', border: 'border-slate-700', badgeBg: 'bg-slate-700' };
  };

  const handleLogout = async () => {
    if (studentSession) { localStorage.removeItem('student_session'); router.push('/login'); } else { await supabase.auth.signOut(); router.push('/login'); }
  };

  // Dashboard Chart Data Prep
  const chartData = activeClasses.map(cls => ({
    name: cls,
    Students: students.filter(s => s.student_class === cls && (s.status === 'Active' || !s.status)).length
  }));

  if (!session && !studentSession) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white"><Loader2 className="animate-spin mr-2"/> Loading...</div>;

  // STUDENT PORTAL VIEW
  if (studentSession) {
    const config = allClassConfigs[studentSession.student_class] || {};
    const aMonthly = (studentSession.agreed_monthly_fee !== null && studentSession.agreed_monthly_fee !== "") ? Number(studentSession.agreed_monthly_fee) : Number(config.tuition_fee || 0);
    const aAdmission = (studentSession.agreed_admission_fee !== null && studentSession.agreed_admission_fee !== "") ? Number(studentSession.agreed_admission_fee) : Number(config.admission_fee || 0);
    const totalPaid = studentPortalData.tx.reduce((acc, curr) => acc + getPaidAmount(curr), 0);
    const currentMonth = new Date().getMonth() + 1; const activeMonths = Math.max(1, (currentMonth - (config.start_month || 1)) + 1);
    const expectedTuition = aMonthly * activeMonths;
    const tuitionPaid = studentPortalData.tx.filter(t => t.fee_type === 'Tuition Fee').reduce((s, t) => s + getPaidAmount(t), 0);
    const admissionPaid = studentPortalData.tx.filter(t => t.fee_type === 'Admission Fee').reduce((s, t) => s + getPaidAmount(t), 0);
    const totalDue = Math.max(0, expectedTuition - tuitionPaid) + Math.max(0, aAdmission - admissionPaid);

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 md:p-10">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
            <div className="flex items-center gap-4">
              {school.logo_url && <img src={school.logo_url} alt="Logo" className="w-14 h-14 rounded-full bg-white object-contain p-1 border-2 border-blue-500" />}
              <div><h1 className="text-xl md:text-2xl font-black text-white">{school.school_name || 'My School Portal'}</h1><p className="text-xs text-blue-400 font-bold">Student Dashboard</p></div>
            </div>
            <button onClick={handleLogout} className="bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition"><LogOut size={16}/> Logout</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-900 to-indigo-900 p-6 rounded-3xl shadow-xl border border-blue-500/30 flex items-center gap-5">
              <img src={studentSession.photo_url || 'https://via.placeholder.com/150'} className="w-20 h-20 rounded-full border-4 border-white/20 object-cover" />
              <div><h2 className="text-xl font-black text-white">{studentSession.name}</h2><p className="text-sm text-blue-200 mt-1">{studentSession.student_class} | Roll: #{studentSession.roll_no}</p><p className="text-xs font-bold bg-black/20 inline-block px-3 py-1 rounded-full mt-2">ID: {studentSession.unique_id}</p></div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col justify-center"><p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Total Fees Paid</p><h3 className="text-4xl font-black text-emerald-400 mt-2">₹{totalPaid}</h3></div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col justify-center"><p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Current Dues (Arrears)</p><h3 className="text-4xl font-black text-rose-400 mt-2">₹{totalDue}</h3></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl shadow-xl">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Calendar className="text-blue-400"/> Month-wise Fee Status</h3>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {monthsName.map((m, idx) => {
                  const statusObj = getMonthlyStatus(idx, studentSession, studentPortalData.tx, config);
                  return (
                    <div key={idx} className={`p-3 rounded-2xl text-center flex flex-col justify-center items-center h-20 border transition ${statusObj.bg} ${statusObj.border}`}><span className={`text-xs font-bold ${statusObj.text}`}>{m.substring(0,3)}</span><span className={`text-[10px] mt-1 font-bold px-2.5 py-0.5 rounded-full ${statusObj.badgeBg}`}>{statusObj.label}</span></div>
                  );
                })}
              </div>
            </div>
            
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl shadow-xl">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><FileText className="text-amber-400"/> Academic Results</h3>
              {studentPortalData.marks.length > 0 ? (
                <div className="space-y-4">
                  {studentPortalData.marks.map((mRecord, i) => (
                    <div key={i} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
                      <p className="text-sm font-bold text-amber-400 mb-3">{mRecord.exam_name}</p>
                      <div className="space-y-2">
                        {Object.keys(mRecord.marks_data || {}).filter(k => k.includes('_theory')).map(key => {
                          const subName = key.split('_')[0];
                          const theory = mRecord.marks_data[`${subName}_theory`] || 0;
                          const oral = mRecord.marks_data[`${subName}_oral`] || 0;
                          const total = theory + oral;
                          return (
                            <div key={subName} className="flex justify-between items-center text-xs border-b border-slate-800 pb-2">
                              <span className="text-slate-300 font-medium">{subName}</span>
                              <span className="font-bold text-white bg-slate-800 px-3 py-1 rounded-lg">Score: {total}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-10 border border-dashed border-slate-800 rounded-2xl text-slate-500">
                  <File size={32} className="mx-auto mb-2 opacity-30"/>
                  <p className="text-xs font-semibold">No exam results published yet.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ADMIN PORTAL VIEW
  const activeStudentsList = students.filter(s => s.status === 'Active' || !s.status);
  const totalCollectedRevenue = allErpTransactions.reduce((acc, curr) => acc + getPaidAmount(curr), 0);
  const generatePendingDuesArray = () => {
    let pendingList = [];
    activeStudentsList.forEach(st => {
      const config = allClassConfigs[st.student_class]; if (!config) return;
      const currentMonth = new Date().getMonth() + 1; const activeMonths = Math.max(1, (currentMonth - (config.start_month || 1)) + 1);
      const studentTx = allErpTransactions.filter(tx => tx.student_id === st.id);
      const tuitionDue = Math.max(0, (((st.agreed_monthly_fee !== null && st.agreed_monthly_fee !== "") ? Number(st.agreed_monthly_fee) : Number(config.tuition_fee || 0)) * activeMonths) - studentTx.filter(tx => tx.fee_type === 'Tuition Fee').reduce((s, tx) => s + getPaidAmount(tx), 0));
      const admissionDue = Math.max(0, ((st.agreed_admission_fee !== null && st.agreed_admission_fee !== "") ? Number(st.agreed_admission_fee) : Number(config.admission_fee || 0)) - studentTx.filter(tx => tx.fee_type === 'Admission Fee').reduce((s, tx) => s + getPaidAmount(tx), 0));
      if (tuitionDue > 0) pendingList.push({ id: st.id + '_tui', students: st, fee_type: 'Tuition Fee', pending_amount: tuitionDue });
      if (admissionDue > 0) pendingList.push({ id: st.id + '_adm', students: st, fee_type: 'Admission Fee', pending_amount: admissionDue });
    });
    return pendingList;
  };
  const pendingTransactionsList = generatePendingDuesArray();
  const totalPendingDue = pendingTransactionsList.reduce((acc, curr) => acc + curr.pending_amount, 0);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-950 text-slate-100 font-sans">
      <style dangerouslySetInnerHTML={{ __html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @media print {
          .no-print { display: none !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          ${receiptData || tcPrintData ? `@page { size: A4 portrait; margin: 10mm; } body { background: white !important; color: black !important; } aside, main { display: none !important; }` : ''}
          ${printIdCard ? `@page { size: 54mm 86mm; margin: 0; } html, body { width: 54mm !important; height: 86mm !important; margin: 0 !important; padding: 0 !important; overflow: hidden !important; background: white !important; } aside, main { display: none !important; } .pvc-modal-overlay { position: absolute !important; top: 0 !important; left: 0 !important; width: 54mm !important; height: 86mm !important; background: none !important; padding: 0 !important; display: block !important; } .pvc-card { width: 54mm !important; height: 86mm !important; border: none !important; border-radius: 0 !important; margin: 0 !important; padding: 4mm !important; box-sizing: border-box !important; box-shadow: none !important; }` : ''}
        }
      `}} />

      {toast.show && (
        <div className={`fixed bottom-6 right-6 z-[100] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 font-bold text-sm transform transition-all animate-bounce-in ${toast.type === 'error' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}`}>
          {toast.type === 'error' ? <AlertCircle size={20}/> : <CheckCircle size={20}/>} {toast.message}
        </div>
      )}

      {/* ADMISSION MODAL */}
      {isAdmissionModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-[60] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 p-6 md:p-8 rounded-2xl w-full max-w-4xl shadow-2xl relative my-8">
            <button onClick={resetStudentForm} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 p-2 rounded-lg transition"><X size={20}/></button>
            <h3 className="text-xl font-bold flex items-center gap-2 text-blue-400 mb-6"><Plus size={22}/> {isEditingStudent ? 'Update Profile' : 'New Admission'}</h3>
            <form onSubmit={handleSaveStudent} className="space-y-6">
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2"><BookOpen size={14}/> Select Class *</label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {classList.map(cls => (
                    <button type="button" key={cls} onClick={() => handleClassChangeInForm({target: {value: cls}})} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${formData.studentClass === cls ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-950 text-slate-400 border border-slate-800'}`}>{cls}</button>
                  ))}
                  <button type="button" onClick={() => handleClassChangeInForm({target: {value: 'CUSTOM'}})} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${isAddingCustomClass ? 'bg-amber-600 text-white' : 'bg-slate-950 text-amber-500 border border-slate-800'}`}>+ Custom</button>
                </div>
                {isAddingCustomClass && (
                  <div className="flex gap-2 mt-2">
                    <input type="text" placeholder="Custom Class Name" value={customClassInput} onChange={(e) => setCustomClassInput(e.target.value)} className="bg-slate-950 border border-slate-800 px-3 py-3 rounded-xl text-white flex-1 text-xs outline-none" />
                    <button type="button" onClick={handleAddCustomClass} className="bg-amber-600 px-4 py-2 rounded-xl text-xs font-bold text-white">Save</button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div><label className="text-xs text-slate-300 mb-2 block">Roll Number</label><input type="text" value={`#${formData.rollNo || getNextRollForClass(formData.studentClass)}`} disabled className="w-full bg-slate-900/50 border border-slate-800 px-4 py-3 rounded-xl text-blue-400 font-bold" /></div>
                <div><label className="text-xs text-slate-300 mb-2 block">Student Name *</label><input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-white outline-none" required /></div>
                <div><label className="text-xs text-slate-300 mb-2 block">Father's Name</label><input type="text" name="fatherName" value={formData.fatherName} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-white outline-none" /></div>
                <div><label className="text-xs text-slate-300 mb-2 block">Mother's Name</label><input type="text" name="motherName" value={formData.motherName} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-white outline-none" /></div>
                <div><label className="text-xs text-slate-300 mb-2 block">Date of Birth *</label><input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-white outline-none" required /></div>
                <div><label className="text-xs text-slate-300 mb-2 block">Mobile No</label><input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-white outline-none" /></div>
                <div><label className="text-xs text-slate-300 mb-2 block">Aadhar No</label><input type="text" name="aadharNo" value={formData.aadharNo} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-white outline-none" /></div>
                <div><label className="text-xs text-slate-300 mb-2 block">Religion</label><input type="text" name="religion" value={formData.religion} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-white outline-none" /></div>
                <div><label className="text-xs text-slate-300 mb-2 block">Category</label><select name="category" value={formData.category} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-white outline-none"><option value="General">General</option><option value="OBC">OBC</option><option value="SC">SC</option><option value="ST">ST</option></select></div>
                <div><label className="text-xs text-slate-300 mb-2 block">Blood Group</label><select name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-white outline-none"><option value="">Select...</option><option value="A+">A+</option><option value="A-">A-</option><option value="O+">O+</option></select></div>
                <div><label className="text-xs text-slate-300 mb-2 block">Gender</label><select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-white outline-none"><option value="Male">Male</option><option value="Female">Female</option></select></div>
                <div className="md:col-span-2"><label className="text-xs text-slate-300 mb-2 block">Address</label><input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-white outline-none" /></div>
              </div>
              <button type="submit" disabled={isProcessing} className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold text-white transition flex justify-center items-center gap-2">{isProcessing ? <Loader2 className="animate-spin"/> : <Save/>} Submit</button>
            </form>
          </div>
        </div>
      )}

      {/* STAFF MODAL */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-sm w-full shadow-2xl relative">
            <button onClick={() => setIsStaffModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={18} /></button>
            <h3 className="text-lg font-bold text-purple-400 mb-4 flex items-center gap-2"><Briefcase size={18}/> Manage Staff</h3>
            <form onSubmit={handleSaveStaff} className="space-y-4">
              <div><label className="text-xs text-slate-400 block mb-1">Full Name</label><input type="text" value={staffData.name} onChange={e => setStaffData({...staffData, name: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-lg text-white text-sm" required/></div>
              <div><label className="text-xs text-slate-400 block mb-1">Role / Position</label><input type="text" value={staffData.role} onChange={e => setStaffData({...staffData, role: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-lg text-white text-sm" placeholder="e.g. Teacher, Admin" required/></div>
              <div><label className="text-xs text-slate-400 block mb-1">Phone</label><input type="text" value={staffData.phone} onChange={e => setStaffData({...staffData, phone: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-lg text-white text-sm"/></div>
              <div><label className="text-xs text-slate-400 block mb-1">Monthly Salary (₹)</label><input type="number" value={staffData.salary} onChange={e => setStaffData({...staffData, salary: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-lg text-white text-sm"/></div>
              <button type="submit" disabled={isProcessing} className="w-full bg-purple-600 hover:bg-purple-500 py-3 rounded-xl text-sm font-bold text-white transition">{isProcessing ? 'Saving...' : 'Save Staff'}</button>
            </form>
          </div>
        </div>
      )}

      {/* STATUS CHANGE / TRANSFER OUT MODAL */}
      {statusModalStudent && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-sm w-full shadow-2xl relative">
            <button onClick={() => setStatusModalStudent(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={18} /></button>
            <h3 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2"><FileOutput size={18}/> Manage Status / Transfer</h3>
            
            <div className="space-y-4">
              <div className="p-3 bg-slate-950 rounded-xl text-xs text-slate-300">
                <p><strong>Student:</strong> {statusModalStudent.name}</p>
                <p><strong>Class:</strong> {statusModalStudent.student_class} | <strong>Roll:</strong> #{statusModalStudent.roll_no}</p>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Select Action</label>
                <select value={statusAction} onChange={e => setStatusAction(e.target.value)} className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-lg text-white text-sm">
                  <option value="Transferred">Transfer Out (Mid-Year / Mid-Session)</option>
                  <option value="Passout">Mark as Passout (Alumni)</option>
                </select>
              </div>

              {statusAction === 'Transferred' && (
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Reason for Transfer</label>
                  <input type="text" value={statusReason} onChange={e => setStatusReason(e.target.value)} placeholder="e.g. Relocation, Parent Request" className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-lg text-white text-sm" />
                </div>
              )}

              <button onClick={handleChangeStatus} disabled={isProcessing} className="w-full bg-amber-600 hover:bg-amber-500 py-3 rounded-xl text-sm font-bold transition flex justify-center items-center gap-2 mt-4 text-white">
                {isProcessing ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} 
                Confirm {statusAction}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TRANSFER CERTIFICATE (TC) PRINT MODAL */}
      {tcPrintData && (
        <div className="fixed inset-0 bg-white text-slate-900 z-50 p-6 overflow-y-auto print:p-0">
          <div className="max-w-2xl mx-auto flex justify-between items-center mb-4 no-print">
            <button onClick={() => setTcPrintData(null)} className="bg-slate-200 px-4 py-2 rounded-lg font-bold text-xs text-slate-800"><X size={16} className="inline mr-1" /> Close</button>
            <button onClick={() => window.print()} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-lg"><Printer size={16} /> Print TC</button>
          </div>
          
          <div className="max-w-2xl mx-auto border-4 border-double border-slate-900 p-10 rounded-none bg-white relative">
             <div className="text-center mb-8 border-b-2 border-slate-900 pb-6">
                {school.logo_url && <img src={school.logo_url} className="w-24 h-24 mx-auto mb-3 object-contain" alt="Logo" />}
                <h1 className="text-3xl font-black uppercase text-blue-950">{school.school_name || 'SCHOOL NAME'}</h1>
                <p className="text-sm font-medium text-slate-700 mt-1">{school.address}</p>
                <p className="text-xs font-semibold text-slate-600">Reg No: {school.reg_no || 'N/A'} | Contact: {school.phone}</p>
             </div>

             <div className="text-center mb-8">
                <span className="inline-block bg-slate-900 text-white font-black text-lg uppercase px-6 py-2 rounded-full tracking-widest shadow-lg">Transfer Certificate</span>
             </div>

             <div className="space-y-6 text-sm font-medium leading-relaxed px-4">
               <p>This is to certify that <strong>{tcPrintData.name}</strong> was a bonafide student of this institution.</p>
               
               <table className="w-full mt-4 border-collapse">
                 <tbody>
                   <tr><td className="py-2 border-b w-1/2 text-slate-600">Admission Roll No:</td><td className="py-2 border-b font-bold">#{tcPrintData.roll_no}</td></tr>
                   <tr><td className="py-2 border-b text-slate-600">Unique ID:</td><td className="py-2 border-b font-bold">{tcPrintData.unique_id || 'N/A'}</td></tr>
                   <tr><td className="py-2 border-b text-slate-600">Class of Leaving:</td><td className="py-2 border-b font-bold">{tcPrintData.student_class}</td></tr>
                   <tr><td className="py-2 border-b text-slate-600">Contact Number:</td><td className="py-2 border-b font-bold">{tcPrintData.phone || 'N/A'}</td></tr>
                   <tr><td className="py-2 border-b text-slate-600">Blood Group:</td><td className="py-2 border-b font-bold">{tcPrintData.blood_group || 'N/A'}</td></tr>
                   <tr><td className="py-2 border-b text-slate-600">Status:</td><td className="py-2 border-b font-bold">{tcPrintData.status}</td></tr>
                   {tcPrintData.status === 'Transferred' && (
                     <>
                     <tr><td className="py-2 border-b text-slate-600">Date of Transfer:</td><td className="py-2 border-b font-bold">{new Date(tcPrintData.transfer_date).toLocaleDateString()}</td></tr>
                     <tr><td className="py-2 border-b text-slate-600">Reason for Leaving:</td><td className="py-2 border-b font-bold">{tcPrintData.tc_reason || 'Personal'}</td></tr>
                     </>
                   )}
                   {tcPrintData.status === 'Passout' && (
                     <tr><td className="py-2 border-b text-slate-600">Year of Passing:</td><td className="py-2 border-b font-bold">{tcPrintData.passout_year}</td></tr>
                   )}
                 </tbody>
               </table>

               <p className="mt-8 italic">We wish him/her all the best for future endeavors. His/her conduct and character during the stay in the school were good.</p>
             </div>

             <div className="flex justify-between items-end mt-20 px-4 pt-10">
               <div className="text-center"><p className="font-bold text-xs">{new Date().toLocaleDateString()}</p><div className="w-32 border-t border-slate-900 mt-1"></div><p className="text-[10px] text-slate-600 uppercase mt-1">Date of Issue</p></div>
               <div className="text-center"><p className="font-bold text-xs italic">{school.principal_name || 'Principal'}</p><div className="w-40 border-t border-slate-900 mt-1"></div><p className="text-[10px] text-slate-600 uppercase mt-1">Principal Signature & Seal</p></div>
             </div>
          </div>
        </div>
      )}

      {/* EDIT TRANSACTION MODAL */}
      {editingTx && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-sm w-full shadow-2xl relative">
            <h3 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2"><Edit size={18}/> Update Payment</h3>
            <div className="space-y-4">
              <div><label className="text-xs text-slate-400 block mb-1">Fee Type</label><input type="text" value={editingTx.fee_type} disabled className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-slate-500 text-sm" /></div>
              <div><label className="text-xs text-slate-400 block mb-1">Discount Amount (₹)</label><input type="number" value={editingTx.discount} onChange={(e) => setEditingTx({...editingTx, discount: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-lg text-white text-sm" /></div>
              <div><label className="text-xs text-slate-400 block mb-1">Actually Paid Amount (₹)</label><input type="number" value={editingTx.paid_amount} onChange={(e) => setEditingTx({...editingTx, paid_amount: e.target.value})} className="w-full bg-emerald-950/30 border border-emerald-500/50 p-2.5 rounded-lg text-emerald-400 font-bold text-sm" /></div>
              <div className="flex gap-3 pt-4 border-t border-slate-800">
                <button onClick={() => setEditingTx(null)} className="flex-1 bg-slate-800 hover:bg-slate-700 py-2 rounded-lg text-xs font-bold transition">Cancel</button>
                <button onClick={handleUpdateTx} disabled={isProcessing} className="flex-1 bg-blue-600 hover:bg-blue-500 py-2 rounded-lg text-xs font-bold transition flex justify-center items-center">{isProcessing ? <Loader2 className="animate-spin" size={16}/> : 'Save Update'}</button>
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
              <p className="text-[10px] text-amber-400 font-bold mt-1">ID: {contactModalStudent.unique_id}</p>
            </div>
            <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300">
              <div className="flex items-center gap-3"><User className="text-purple-400" size={16} /><div><p className="text-[10px] text-slate-500">Father's Name</p><p className="font-bold text-white">{contactModalStudent.father_name || 'N/A'}</p></div></div>
              <div className="flex items-center gap-3"><Calendar className="text-amber-400" size={16} /><div><p className="text-[10px] text-slate-500">Date of Birth</p><p className="font-bold text-white">{contactModalStudent.dob || 'N/A'}</p></div></div>
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
            <div className="flex justify-between text-xs mb-4"><p><strong>Receipt No:</strong> {receiptData.invoiceNo}</p><p><strong>Date:</strong> {receiptData.date}</p></div>
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
                <tr className="bg-slate-100 font-bold border-b border-slate-900"><td colSpan="2" className="p-2 border-r border-slate-900 text-right">Total Amount Paid Now:</td><td className="p-2 text-right text-blue-900 text-sm font-black">₹{receiptData.totalPaid}</td></tr>
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
          
          <div className="pvc-card w-[204px] h-[324px] bg-gradient-to-br from-slate-900 to-indigo-950 overflow-hidden relative flex flex-col text-white rounded-xl border-4 border-slate-800 shadow-2xl shrink-0">
             
             <div className="text-center w-full px-2 pt-3 pb-1 z-10">
                 <h2 className="font-black text-[12px] uppercase leading-tight tracking-wider text-blue-300">{school.school_name || 'SCHOOL NAME'}</h2>
                 <p className="text-[6px] opacity-70 mt-0.5 leading-tight">{school.address}</p>
             </div>
             
             {school.logo_url && <img src={school.logo_url} className="w-8 h-8 rounded-full absolute top-2 left-2 border border-slate-700 bg-white object-cover z-20" alt="Logo"/>}
             <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(portalUrl)}`} className="w-8 h-8 absolute top-2 right-2 border border-slate-700 bg-white p-0.5 z-20 rounded-md" alt="QR"/>

             <div className="flex justify-center mt-1 z-10">
                 <img src={selectedIdStudent.photo_url || 'https://via.placeholder.com/150'} className="w-16 h-16 rounded-full border-[2px] border-amber-400 object-cover shadow-lg" alt="Student" />
             </div>
             
             <div className="text-center w-full z-10 mt-1.5 px-2">
                 <h3 className="font-black text-[14px] leading-tight text-white">{selectedIdStudent.name}</h3>
                 <p className="text-[9px] text-amber-300 font-bold mt-0.5">Class: {selectedIdStudent.student_class} | Roll: #{selectedIdStudent.roll_no}</p>
             </div>
             
             <div className="bg-slate-950/60 backdrop-blur-md mx-2 rounded-lg p-1.5 text-[8px] space-y-1 mt-1.5 z-10 border border-slate-700 leading-tight">
                 <div className="flex justify-between"><span className="text-slate-400">ID:</span> <span className="font-bold">{selectedIdStudent.unique_id}</span></div>
                 <div className="flex justify-between"><span className="text-slate-400">DOB:</span> <span className="font-bold">{selectedIdStudent.dob || 'N/A'}</span></div>
                 <div className="flex justify-between"><span className="text-slate-400">Blood:</span> <span className="font-bold text-rose-400">{selectedIdStudent.blood_group || 'N/A'}</span></div>
                 <div className="flex justify-between"><span className="text-slate-400">Phone:</span> <span className="font-bold truncate max-w-[80px] text-right">{selectedIdStudent.phone || 'N/A'}</span></div>
             </div>
             
             {selectedIdStudent.unique_id && (
               <div className="flex justify-center items-center mt-auto mb-3 z-10 bg-white p-1 mx-4 rounded-md h-8">
                   <img src={`https://bwipjs-api.metafloor.com/?bcid=code128&text=${selectedIdStudent.unique_id}&scale=2&height=10&includetext=false`} alt="barcode" className="h-full w-full object-contain" />
               </div>
             )}

             <div className="w-full h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 absolute bottom-0 left-0"></div>
          </div>
        </div>
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-72 bg-slate-900/80 backdrop-blur-xl border-r border-slate-800/80 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-8">
            {school.logo_url ? <img src={school.logo_url} alt="Logo" className="w-12 h-12 rounded-xl object-cover bg-white p-1" /> : <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-3 rounded-2xl shadow-lg shadow-blue-500/20"><School className="text-white" size={26} /></div>}
            <div><h1 className="text-xl font-black bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">{school.school_name || 'EduAdmin'}</h1><p className="text-xs text-slate-400">Smart School Portal</p></div>
          </div>
          <nav className="space-y-2 max-h-[60vh] overflow-y-auto scrollbar-hide pr-2">
            {[
              { id: 'dashboard', label: 'Overview & Charts', icon: LayoutDashboard },
              { id: 'students', label: 'Students Mgmt.', icon: Users },
              { id: 'attendance', label: 'Daily Attendance', icon: CalendarCheck },
              { id: 'staff', label: 'Staff & HR Mgmt.', icon: Briefcase },
              { id: 'class_mgmt', label: 'Class Config', icon: Settings },
              { id: 'erp', label: 'ERP Billing & Fees', icon: DollarSign },
              { id: 'idcard', label: 'PVC ID Card Generator', icon: CreditCard },
              { id: 'profile', label: 'School Profile', icon: Building },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${ activeTab === item.id ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 scale-102' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'}`}><Icon size={18} />{item.label}</button>
              );
            })}
            <button onClick={() => router.push('/mark-entry')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition mt-4"><FileSpreadsheet size={18} />Mark Entry & Report</button>
          </nav>
        </div>
        <div className="pt-6 border-t border-slate-800/80 space-y-2 mt-4">
          <button onClick={() => router.push('/change-password')} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-white transition"><Key size={16} /> Change Password</button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition"><LogOut size={16} /> Logout Securely</button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto w-full">
        
        {/* DASHBOARD TAB (WITH CHARTS) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-4 gap-4">
               <div><h2 className="text-3xl font-bold text-white">Dashboard & Analytics</h2><p className="text-sm text-slate-400 mt-1">Welcome back to your school portal.</p></div>
               <button onClick={() => setIsAdmissionModalOpen(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 rounded-xl font-bold text-white flex items-center gap-2"><Plus size={20}/> New Admission</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex items-center gap-4"><div className="p-4 bg-blue-500/10 text-blue-400 rounded-xl"><Users size={28} /></div><div><p className="text-xs text-slate-400 font-semibold">Active Students</p><h3 className="text-3xl font-black text-white mt-1">{activeStudentsList.length}</h3></div></div>
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex items-center gap-4"><div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-xl"><DollarSign size={28} /></div><div><p className="text-xs text-slate-400 font-semibold">Total Revenue</p><h3 className="text-3xl font-black text-emerald-400 mt-1">₹{totalCollectedRevenue}</h3></div></div>
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex items-center gap-4"><div className="p-4 bg-purple-500/10 text-purple-400 rounded-xl"><Briefcase size={28} /></div><div><p className="text-xs text-slate-400 font-semibold">Total Staff</p><h3 className="text-3xl font-black text-purple-400 mt-1">{staffList.length}</h3></div></div>
            </div>

            {/* CHART SECTION */}
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-xl h-[400px]">
              <h3 className="text-lg font-bold text-blue-400 flex items-center gap-2 mb-6"><BarChart3 size={18}/> Class-wise Enrollment Chart</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 12}} />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="Students" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* STUDENTS TAB (WITH IMPORT/EXPORT) */}
        {activeTab === 'students' && (
          <div className="space-y-6 animate-fade-in w-full">
            <h2 className="text-2xl font-bold border-b border-slate-800 pb-4">Student Records</h2>
            
            <div className="flex bg-slate-950 border border-slate-800 p-1 rounded-2xl w-fit">
              <button onClick={() => setStudentStatusTab('Active')} className={`px-6 py-2 rounded-xl text-xs font-bold transition ${studentStatusTab === 'Active' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Active Students</button>
              <button onClick={() => setStudentStatusTab('Passout')} className={`px-6 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${studentStatusTab === 'Passout' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}><GraduationCap size={14}/> Alumni</button>
              <button onClick={() => setStudentStatusTab('Transferred')} className={`px-6 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${studentStatusTab === 'Transferred' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}><FileOutput size={14}/> Transferred</button>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="relative w-full md:flex-1">
                <Search className="absolute left-4 top-3.5 text-slate-500" size={18} />
                <input type="text" placeholder="Search by name, roll or Unique ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-900 border border-slate-800 pl-12 pr-4 py-3 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              
              <div className="flex gap-3 w-full md:w-auto overflow-x-auto scrollbar-hide pb-2 md:pb-0">
                <input type="file" accept=".csv" ref={fileInputRef} onChange={handleImportCSV} className="hidden" />
                <button onClick={() => fileInputRef.current.click()} className="bg-slate-800 hover:bg-slate-700 text-amber-400 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap"><UploadCloud size={16} /> Import CSV</button>
                <button onClick={handleExportCSV} className="bg-slate-800 hover:bg-slate-700 text-emerald-400 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap"><FileSpreadsheet size={16} /> Export Excel</button>
                
                <select onChange={(e) => setSelectedClassFilter(e.target.value)} value={selectedClassFilter} className="bg-slate-900 text-white border border-slate-800 px-4 py-2.5 rounded-xl text-xs font-bold outline-none">
                  <option value="All">All Classes</option>
                  {activeClasses.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                </select>

                {selectedClassFilter !== 'All' && studentStatusTab === 'Active' && (
                  <button onClick={() => handleUpgradeClass(selectedClassFilter)} className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 text-white whitespace-nowrap"><ArrowUpCircle size={16} /> Upgrade {selectedClassFilter}</button>
                )}
              </div>
            </div>
            
            {/* Table Rendering */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-x-auto shadow-xl">
              {getFilteredStudents().length > 0 ? (
                <table className="w-full text-left min-w-[700px]">
                  <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="p-4">ID & Roll</th>
                      <th className="p-4">Name & DOB</th>
                      <th className="p-4">Class</th>
                      {studentStatusTab === 'Active' && <th className="p-4">Phone</th>}
                      {studentStatusTab === 'Passout' && <th className="p-4">Passout Year</th>}
                      {studentStatusTab === 'Transferred' && <th className="p-4">Transfer Date & Reason</th>}
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-sm">
                    {getFilteredStudents().map((st) => (
                      <tr key={st.id} className="hover:bg-slate-800/30 transition">
                        <td className="p-4">
                          <p className="font-bold text-blue-400">ID: {st.unique_id || 'N/A'}</p>
                          <p className="text-xs text-slate-500 font-bold">Roll: #{st.roll_no}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-white">{st.name}</p>
                          <p className="text-[10px] text-slate-400">DOB: {st.dob || 'N/A'}</p>
                        </td>
                        <td className="p-4"><span className="bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1 rounded-lg text-xs font-semibold">{st.student_class}</span></td>
                        
                        {studentStatusTab === 'Active' && <td className="p-4 text-slate-400 font-medium">{st.phone || '-'}</td>}
                        
                        {studentStatusTab === 'Passout' && (
                          <td className="p-4"><span className="bg-emerald-500/10 text-emerald-400 font-black px-3 py-1 rounded-lg text-xs">{st.passout_year}</span></td>
                        )}
                        
                        {studentStatusTab === 'Transferred' && (
                          <td className="p-4">
                            <p className="font-bold text-rose-400 text-xs">{new Date(st.transfer_date).toLocaleDateString()}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{st.tc_reason || 'N/A'}</p>
                          </td>
                        )}

                        <td className="p-4 flex gap-2 justify-center">
                          {studentStatusTab === 'Active' ? (
                            <>
                              <button title="Status/TC" onClick={() => setStatusModalStudent(st)} className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-lg transition"><FileOutput size={16} /></button>
                              <button title="Edit" onClick={() => handleEditClick(st)} className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 p-2 rounded-lg transition"><Edit size={16} /></button>
                            </>
                          ) : (
                            <button onClick={() => setTcPrintData(st)} className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5">
                              <Printer size={14}/> View TC
                            </button>
                          )}
                          <button title="Delete Permanently" onClick={() => handleDeleteStudent(st.id, st.student_class)} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2 rounded-lg transition"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-slate-500">
                  <Users size={48} className="mb-4 opacity-20" />
                  <p className="font-semibold">কোনো ডাটা পাওয়া যায়নি!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ATTENDANCE TAB */}
        {activeTab === 'attendance' && (
          <div className="space-y-6 animate-fade-in w-full">
            <h2 className="text-2xl font-bold border-b border-slate-800 pb-4">Daily Attendance System</h2>
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 flex flex-wrap gap-4 items-end">
               <div>
                  <label className="text-xs text-slate-400 block mb-1 font-bold">Select Class</label>
                  <select value={attendanceClass} onChange={e => {setAttendanceClass(e.target.value); loadAttendance(e.target.value, attendanceDate);}} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-white outline-none font-bold">
                      <option value="">Select...</option>{activeClasses.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
               </div>
               <div>
                  <label className="text-xs text-slate-400 block mb-1 font-bold">Select Date</label>
                  <input type="date" value={attendanceDate} onChange={e => {setAttendanceDate(e.target.value); loadAttendance(attendanceClass, e.target.value);}} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-white outline-none font-bold"/>
               </div>
            </div>

            {attendanceClass && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <table className="w-full text-left">
                  <thead className="text-xs text-slate-400 uppercase border-b border-slate-800">
                      <tr><th className="pb-3 px-2">Roll No</th><th className="pb-3 px-2">Student Name</th><th className="pb-3 text-right px-2">Mark Status</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {students.filter(s => s.student_class === attendanceClass && s.status === 'Active').map(st => (
                      <tr key={st.id} className="hover:bg-slate-800/20 transition">
                        <td className="py-4 px-2 text-sm font-bold text-slate-400">#{st.roll_no}</td>
                        <td className="py-4 px-2 text-sm font-bold text-white">{st.name}</td>
                        <td className="py-4 px-2 text-right flex justify-end gap-2">
                          <button onClick={() => handleSaveAttendance(st.id, 'Present')} className={`px-5 py-2 rounded-xl text-xs font-bold transition ${attendanceRecords[st.id] === 'Present' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>Present</button>
                          <button onClick={() => handleSaveAttendance(st.id, 'Absent')} className={`px-5 py-2 rounded-xl text-xs font-bold transition ${attendanceRecords[st.id] === 'Absent' ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>Absent</button>
                        </td>
                      </tr>
                    ))}
                    {students.filter(s => s.student_class === attendanceClass && s.status === 'Active').length === 0 && (
                        <tr><td colSpan="3" className="text-center py-6 text-slate-500 font-semibold">No students in this class.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* STAFF MANAGEMENT TAB */}
        {activeTab === 'staff' && (
          <div className="space-y-6 animate-fade-in w-full">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <h2 className="text-2xl font-bold text-white">Staff & HR Management</h2>
              <button onClick={() => { setStaffData({ id: null, name: '', role: 'Teacher', phone: '', salary: 0, status: 'Active' }); setIsStaffModalOpen(true); }} className="bg-purple-600 hover:bg-purple-500 px-5 py-2.5 rounded-xl font-bold text-white flex items-center gap-2 shadow-lg shadow-purple-500/20 transition"><Plus size={16}/> Add Staff</button>
            </div>
            
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-x-auto shadow-xl">
              <table className="w-full text-left min-w-[600px]">
                <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider"><tr className="border-b border-slate-800"><th className="p-4">Name & Role</th><th className="p-4">Phone Number</th><th className="p-4">Monthly Salary</th><th className="p-4 text-center">Actions</th></tr></thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {staffList.map((stf) => (
                    <tr key={stf.id} className="hover:bg-slate-800/30 transition">
                      <td className="p-4"><p className="font-bold text-white">{stf.name}</p><p className="text-[10px] text-purple-400 font-black bg-purple-500/10 inline-block px-2 py-0.5 rounded mt-1 uppercase tracking-widest">{stf.role}</p></td>
                      <td className="p-4 text-slate-300 font-medium">{stf.phone || '-'}</td>
                      <td className="p-4 font-black text-emerald-400 text-lg">₹{stf.salary}</td>
                      <td className="p-4 flex gap-2 justify-center">
                        <button onClick={() => { setStaffData(stf); setIsStaffModalOpen(true); }} className="text-blue-400 p-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition"><Edit size={16} /></button>
                        <button onClick={async () => { if(confirm('Are you sure you want to permanently delete this staff member?')){ await supabase.from('staff').delete().eq('id', stf.id); fetchStaff(); } }} className="text-red-400 p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                  {staffList.length === 0 && <tr><td colSpan="4" className="text-center p-12 text-slate-500"><Briefcase size={40} className="mx-auto mb-3 opacity-20"/><p className="font-semibold">No staff records found. Add your first staff member!</p></td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CLASS MANAGEMENT TAB */}
        {activeTab === 'class_mgmt' && (
          <div className="space-y-6 animate-fade-in w-full">
            <h2 className="text-2xl font-bold border-b border-slate-800 pb-4">Academic Configurations</h2>
            
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {classList.map(cls => (
                <button key={cls} onClick={() => fetchClassConfigDetails(cls)} className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${selectedConfigClass === cls ? 'bg-amber-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'}`}>{cls}</button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-4">
                <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2"><Calendar size={18}/> Session Settings</h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div><label className="block text-slate-400 mb-1">Academic Year</label><input type="text" value={classConfig.academic_year || ''} onChange={(e) => setClassConfig({ ...classConfig, academic_year: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white font-bold outline-none focus:border-amber-500" /></div>
                  <div>
                    <label className="block text-slate-400 mb-1">Class Start Month</label>
                    <select value={classConfig.start_month || 1} onChange={(e) => setClassConfig({ ...classConfig, start_month: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white outline-none focus:border-amber-500">
                      {monthsName.map((m, idx) => (<option key={idx} value={idx + 1}>{m}</option>))}
                    </select>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-blue-400 pt-4 border-t border-slate-800 mt-4">Subject & Marks Schema</h3>
                {(classConfig.subjects || []).map((sub, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input type="text" placeholder="Subject Name" value={sub.name || ''} onChange={(e) => { const updated = [...(classConfig.subjects || [])]; updated[idx].name = e.target.value; setClassConfig({ ...classConfig, subjects: updated }); }} className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white flex-1 text-xs outline-none focus:border-blue-500" />
                    <input type="number" placeholder="Oral" title="Oral Max Marks" value={sub.oral || 0} onChange={(e) => { const updated = [...(classConfig.subjects || [])]; updated[idx].oral = parseInt(e.target.value) || 0; setClassConfig({ ...classConfig, subjects: updated }); }} className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white w-16 text-xs text-center outline-none focus:border-blue-500" />
                    <input type="number" placeholder="Theory" title="Theory Max Marks" value={sub.theory || 0} onChange={(e) => { const updated = [...(classConfig.subjects || [])]; updated[idx].theory = parseInt(e.target.value) || 0; setClassConfig({ ...classConfig, subjects: updated }); }} className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white w-16 text-xs text-center outline-none focus:border-blue-500" />
                  </div>
                ))}
                <button type="button" onClick={handleAddSubjectField} className="text-xs bg-slate-800 hover:bg-slate-700 text-blue-400 font-bold px-4 py-2.5 rounded-xl transition w-full">+ Add New Subject</button>
              </div>
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-4">
                <h3 className="text-lg font-bold text-emerald-400">Default Fee Structure (₹)</h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div><label className="block text-slate-400 mb-1">Admission Fee</label><input type="number" value={classConfig.admission_fee || 0} onChange={(e) => setClassConfig({ ...classConfig, admission_fee: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-bold outline-none focus:border-emerald-500" /></div>
                  <div><label className="block text-slate-400 mb-1">Monthly Tuition Fee</label><input type="number" value={classConfig.tuition_fee || 0} onChange={(e) => setClassConfig({ ...classConfig, tuition_fee: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-bold outline-none focus:border-emerald-500" /></div>
                  <div><label className="block text-slate-400 mb-1">Term 1 Exam Fee</label><input type="number" value={classConfig.exam1_fee || 0} onChange={(e) => setClassConfig({ ...classConfig, exam1_fee: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white outline-none focus:border-emerald-500" /></div>
                  <div><label className="block text-slate-400 mb-1">Term 2 Exam Fee</label><input type="number" value={classConfig.exam2_fee || 0} onChange={(e) => setClassConfig({ ...classConfig, exam2_fee: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white outline-none focus:border-emerald-500" /></div>
                  <div><label className="block text-slate-400 mb-1">Term 3 Exam Fee</label><input type="number" value={classConfig.exam3_fee || 0} onChange={(e) => setClassConfig({ ...classConfig, exam3_fee: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white outline-none focus:border-emerald-500" /></div>
                  <div><label className="block text-slate-400 mb-1">Custom / Other Fee</label><input type="number" value={classConfig.custom_fee || 0} onChange={(e) => setClassConfig({ ...classConfig, custom_fee: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white outline-none focus:border-emerald-500" /></div>
                </div>
              </div>
            </div>
            <button onClick={handleSaveClassConfig} disabled={isProcessing} className="bg-emerald-600 hover:bg-emerald-500 px-8 py-3.5 rounded-xl font-black shadow-lg shadow-emerald-500/20 transition flex items-center gap-2">
              {isProcessing ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} Save Class Config
            </button>
          </div>
        )}

        {/* ERP BILLING */}
        {activeTab === 'erp' && (
          <div className="space-y-6 animate-fade-in w-full">
            <h2 className="text-2xl font-bold border-b border-slate-800 pb-4">Financial Operations</h2>

            {!showOnlyPendingList ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-xl">
                    <div className="space-y-5">
                      <div>
                        <label className="text-xs text-slate-400 block mb-2 font-bold uppercase tracking-wider">Step 1: Select Class</label>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                          {activeClasses.length > 0 ? activeClasses.map(c => (
                            <button key={c} onClick={() => { setErpSelectedClass(c); setErpStudent(null); }} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${erpSelectedClass === c ? 'bg-blue-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800'}`}>
                              {c}
                            </button>
                          )) : <p className="text-xs text-slate-500">No active classes found.</p>}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-slate-400 block mb-2 font-bold uppercase tracking-wider">Step 2: Select Student</label>
                        <select disabled={!erpSelectedClass} value={erpStudent?.id || ''} onChange={(e) => handleSelectErpStudent(students.find(s => s.id === e.target.value))} className="w-full bg-slate-950 border border-slate-800 p-3.5 rounded-xl text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed outline-none focus:border-blue-500 font-bold">
                          <option value="">Select Student...</option>
                          {students.filter(s => s.student_class === erpSelectedClass && (s.status === 'Active' || !s.status)).map(s => (
                            <option key={s.id} value={s.id}>{s.name} (Roll: #{s.roll_no})</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {erpStudent && (
                      <div className="mt-6 pt-6 border-t border-slate-800 space-y-4">
                        <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2"><Settings size={16}/> Override Default Fees</h4>
                        <p className="text-[10px] text-slate-400 mb-2 leading-relaxed">Customize tuition or admission fee for this specific student.</p>
                        <div><label className="text-xs text-slate-400 block mb-1">Custom Monthly Fee (₹)</label><input type="number" value={agreedFees.monthly} onChange={e => setAgreedFees({...agreedFees, monthly: e.target.value})} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white text-sm outline-none focus:border-amber-500 font-bold" /></div>
                        <div><label className="text-xs text-slate-400 block mb-1">Custom Admission Fee (₹)</label><input type="number" value={agreedFees.admission} onChange={e => setAgreedFees({...agreedFees, admission: e.target.value})} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white text-sm outline-none focus:border-amber-500 font-bold" /></div>
                        <button onClick={saveAgreedFeesToDB} className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl text-xs font-bold transition">Update Fee Profile</button>
                      </div>
                    )}
                  </div>
                </div>

                {erpStudent && erpClassConfig && (
                  <div className="lg:col-span-8 space-y-6">
                    
                    <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-xl overflow-x-auto">
                      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                        <h3 className="text-lg font-bold text-blue-400 flex items-center gap-2"><Calendar size={18}/> Status Tracker Tracker ({erpClassConfig.academic_year})</h3>
                        {(() => {
                          const admFee = agreedFees.admission;
                          const admPaid = erpTransactions.filter(tx => tx.fee_type === 'Admission Fee').reduce((s,tx) => s+getPaidAmount(tx), 0);
                          const isPaid = admPaid >= admFee && admFee > 0;
                          return (
                            <div className={`px-4 py-2 rounded-xl border text-xs font-bold shadow-lg ${isPaid ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'}`}>
                              Admission Fee: {isPaid ? 'PAID' : `DUE (₹${Math.max(0, admFee - admPaid)})`}
                            </div>
                          );
                        })()}
                      </div>

                      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 min-w-[500px]">
                        {monthsName.map((m, idx) => {
                          const statusObj = getMonthlyStatus(idx);
                          return (
                            <div key={idx} className={`p-3 rounded-xl text-center flex flex-col justify-center items-center h-20 border transition ${statusObj.bg} ${statusObj.border}`}>
                              <span className={`text-xs font-bold ${statusObj.text}`}>{m.substring(0,3)}</span>
                              <span className={`text-[10px] mt-1 font-bold px-2.5 py-0.5 rounded-full ${statusObj.badgeBg}`}>{statusObj.label}</span>
                              {statusObj.subText && <span className="text-[9px] mt-1 opacity-80">{statusObj.subText}</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
                      <h3 className="text-lg font-bold text-emerald-400">Payment Collection</h3>
                      <div>
                        <label className="text-xs text-slate-400 block mb-3 font-semibold">Select Fees to Pay:</label>
                        <div className="flex flex-wrap gap-2">
                          {feeOptionsList.map(fee => (
                            <button type="button" key={fee} onClick={() => toggleFeeType(fee)} className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition shadow-sm ${ erpSelectedFeeTypes.includes(fee) ? 'bg-blue-600 text-white border-blue-500 shadow-blue-500/30' : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-600 hover:text-white' }`}>
                              {fee}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950 p-5 rounded-2xl border border-slate-800">
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-1 uppercase tracking-wider font-bold">Total Arrears (Due)</label>
                          <p className="text-2xl font-black text-rose-400">₹{erpBaseAmount}</p>
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Manual Discount (₹)</label>
                          <input type="number" placeholder="Enter amount" value={erpDiscount} onChange={(e) => setErpDiscount(e.target.value)} className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-white text-sm outline-none focus:border-blue-500" />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-emerald-400 block mb-2 font-bold uppercase tracking-wider">Amount Receiving Now (₹)</label>
                        <input type="number" placeholder="Enter Cash/Online Amount" value={erpPaidAmount} onChange={(e) => setErpPaidAmount(e.target.value)} className="w-full bg-slate-950 border-2 border-emerald-500/50 p-5 rounded-2xl text-emerald-400 font-black text-2xl outline-none focus:border-emerald-400 shadow-inner" />
                      </div>

                      <button onClick={handleCreateInvoice} disabled={isProcessing} className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white py-4 rounded-2xl font-black text-sm transition shadow-lg shadow-emerald-500/30 flex justify-center items-center gap-2">
                        {isProcessing ? <Loader2 className="animate-spin" size={20}/> : <CreditCard size={20}/>} Generate Official Receipt
                      </button>
                    </div>

                    <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
                      <h3 className="text-lg font-bold text-blue-400 flex items-center gap-2">Transaction History</h3>
                      {erpTransactions.length > 0 ? (
                        <div className="overflow-x-auto rounded-xl border border-slate-800">
                          <table className="w-full text-left text-xs border-collapse min-w-[500px]">
                            <thead className="bg-slate-800 text-slate-400">
                              <tr><th className="p-3">Date</th><th className="p-3">Particulars</th><th className="p-3 text-right">Paid</th><th className="p-3 text-right">Balance</th><th className="p-3 text-center">Actions</th></tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800 bg-slate-900/40">
                              {erpTransactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-slate-800/40">
                                  <td className="p-3 text-slate-400 font-medium">{new Date(tx.created_at).toLocaleDateString()}</td>
                                  <td className="p-3 font-bold text-white">{tx.fee_type}</td>
                                  <td className="p-3 text-right font-black text-emerald-400">₹{getPaidAmount(tx)}</td>
                                  <td className="p-3 text-right font-bold text-rose-400">{tx.pending_amount > 0 ? `₹${tx.pending_amount}` : '-'}</td>
                                  <td className="p-3 flex justify-center gap-2">
                                    <button onClick={() => viewReceiptFromHistory(tx)} className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/40 p-1.5 rounded transition"><Printer size={14} /></button>
                                    <button onClick={() => setEditingTx({ ...tx, paid_amount: getPaidAmount(tx) })} className="bg-amber-500/20 text-amber-400 hover:bg-amber-500/40 p-1.5 rounded transition"><Edit size={14} /></button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="p-8 border border-slate-800 border-dashed rounded-2xl flex flex-col items-center justify-center text-slate-500">
                          <FileText size={32} className="mb-2 opacity-30" />
                          <p className="text-xs font-semibold">No transactions recorded yet.</p>
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-rose-400 border-b border-slate-800 pb-2 flex-1">Defaulters List (Due Fees)</h3>
                  <button onClick={() => setShowOnlyPendingList(false)} className="bg-slate-800 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-700 transition shadow-lg ml-4">Close List</button>
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs border-collapse min-w-[600px]">
                    <thead className="bg-slate-800 text-slate-400 uppercase tracking-wider"><tr><th className="p-4">Student Details</th><th className="p-4">Arrears Type</th><th className="p-4 text-right">Amount Due</th><th className="p-4 text-center">Action</th></tr></thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-900/40 text-sm">
                      {pendingTransactionsList.map((tx, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40 transition">
                          <td className="p-4"><p className="font-bold text-white text-sm">{tx.students?.name || 'N/A'}</p><p className="text-xs text-slate-400 mt-1"><span className="bg-slate-800 px-2 py-0.5 rounded">{tx.students?.student_class}</span> Roll: #{tx.students?.roll_no}</p></td>
                          <td className="p-4 font-semibold text-slate-300">{tx.fee_type}</td>
                          <td className="p-4 text-right font-black text-rose-400 text-lg">₹{tx.pending_amount}</td>
                          <td className="p-4 text-center">
                            {tx.students?.phone ? (<a href={`tel:${tx.students.phone}`} className="bg-emerald-600/20 text-emerald-400 px-4 py-2 rounded-lg font-bold inline-flex items-center gap-2 hover:bg-emerald-600/30 transition"><PhoneCall size={14} /> Call Parent</a>) : <span className="text-slate-600 italic">No Phone</span>}
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
          <div className="space-y-6 animate-fade-in w-full">
            <h2 className="text-2xl font-bold border-b border-slate-800 pb-4">PVC ID Card System</h2>
            
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
              <div>
                <label className="text-xs text-slate-400 block mb-2 font-bold uppercase tracking-wider">Step 1: Select Class</label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {activeClasses.length > 0 ? activeClasses.map(c => (
                    <button key={c} onClick={() => { setIdSelectedClass(c); setSelectedIdStudent(null); }} className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${idSelectedClass === c ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800'}`}>
                      {c}
                    </button>
                  )) : <p className="text-xs text-slate-500">No active students found.</p>}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-2 font-bold uppercase tracking-wider">Step 2: Select Student</label>
                <select disabled={!idSelectedClass} value={selectedIdStudent?.id || ''} onChange={(e) => setSelectedIdStudent(students.find(s => s.id === e.target.value))} className="w-full bg-slate-950 border border-slate-800 p-3.5 rounded-xl text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed outline-none focus:border-blue-500 font-bold">
                  <option value="">Select Student...</option>
                  {students.filter(s => s.student_class === idSelectedClass && (s.status === 'Active' || !s.status)).map(s => (
                    <option key={s.id} value={s.id}>{s.name} (Roll: #{s.roll_no})</option>
                  ))}
                </select>
              </div>

              {selectedIdStudent && (
                <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row gap-10 items-center md:items-start">
                  
                  <div className="w-[204px] h-[324px] bg-gradient-to-br from-slate-900 to-indigo-950 overflow-hidden relative flex flex-col text-white rounded-xl border-4 border-slate-800 shadow-2xl shrink-0">
                     
                     <div className="text-center w-full px-2 pt-3 pb-1 z-10">
                         <h2 className="font-black text-[12px] uppercase leading-tight tracking-wider text-blue-300">{school.school_name || 'SCHOOL NAME'}</h2>
                         <p className="text-[6px] opacity-70 mt-0.5 leading-tight">{school.address}</p>
                     </div>
                     
                     {school.logo_url && <img src={school.logo_url} className="w-8 h-8 rounded-full absolute top-2 left-2 border border-slate-700 bg-white object-cover z-20" alt="Logo"/>}
                     <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(portalUrl)}`} className="w-8 h-8 absolute top-2 right-2 border border-slate-700 bg-white p-0.5 z-20 rounded-md" alt="QR"/>

                     <div className="flex justify-center mt-1 z-10">
                         <img src={selectedIdStudent.photo_url || 'https://via.placeholder.com/150'} className="w-16 h-16 rounded-full border-[2px] border-amber-400 object-cover shadow-lg" alt="Student" />
                     </div>
                     
                     <div className="text-center w-full z-10 mt-1.5 px-2">
                         <h3 className="font-black text-[14px] leading-tight text-white">{selectedIdStudent.name}</h3>
                         <p className="text-[9px] text-amber-300 font-bold mt-0.5">Class: {selectedIdStudent.student_class} | Roll: #{selectedIdStudent.roll_no}</p>
                     </div>
                     
                     <div className="bg-slate-950/60 backdrop-blur-md mx-2 rounded-lg p-1.5 text-[8px] space-y-1 mt-1.5 z-10 border border-slate-700 leading-tight">
                         <div className="flex justify-between"><span className="text-slate-400">ID:</span> <span className="font-bold">{selectedIdStudent.unique_id}</span></div>
                         <div className="flex justify-between"><span className="text-slate-400">DOB:</span> <span className="font-bold">{selectedIdStudent.dob || 'N/A'}</span></div>
                         <div className="flex justify-between"><span className="text-slate-400">Blood:</span> <span className="font-bold text-rose-400">{selectedIdStudent.blood_group || 'N/A'}</span></div>
                         <div className="flex justify-between"><span className="text-slate-400">Phone:</span> <span className="font-bold truncate max-w-[80px] text-right">{selectedIdStudent.phone || 'N/A'}</span></div>
                     </div>
                     
                     {selectedIdStudent.unique_id && (
                       <div className="flex justify-center items-center mt-auto mb-3 z-10 bg-white p-1 mx-4 rounded-md h-8">
                           <img src={`https://bwipjs-api.metafloor.com/?bcid=code128&text=${selectedIdStudent.unique_id}&scale=2&height=10&includetext=false`} alt="barcode" className="h-full w-full object-contain" />
                       </div>
                     )}

                     <div className="w-full h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 absolute bottom-0 left-0"></div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-white mb-3">PVC Print Ready</h3>
                    <p className="text-sm text-slate-400 mb-6 max-w-sm leading-relaxed">The card is perfectly calibrated for ISO CR80 (54x86mm) standard PVC printing. Background graphics and colors are forced enabled.</p>
                    <button onClick={() => setPrintIdCard(true)} className="bg-blue-600 hover:bg-blue-500 px-6 py-4 rounded-2xl font-black text-white shadow-lg shadow-blue-500/30 transition flex items-center gap-3">
                      <Printer size={20} /> Launch PVC Print Layout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="space-y-6 animate-fade-in w-full pb-10">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">School Profile & Branding</h2>
              <button onClick={() => setEditSchool(!editSchool)} className="bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition flex items-center gap-2 shadow-lg shadow-blue-500/30">
                {editSchool ? <><X size={16}/> Cancel Edit</> : <><Edit size={16}/> Edit Profile</>}
              </button>
            </div>

            {editSchool ? (
              <div className="bg-slate-900/80 border border-slate-800 p-6 md:p-8 rounded-3xl shadow-2xl">
                <form onSubmit={handleUpdateSchool} className="space-y-8">
                  
                  <div>
                    <h3 className="text-lg font-bold text-blue-400 mb-4 border-b border-slate-800 pb-2">Brand Identity</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div><label className="text-xs text-slate-400 block mb-1">School Name *</label><input type="text" value={school.school_name || ''} onChange={(e) => setSchool({ ...school, school_name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white font-bold outline-none focus:border-blue-500" required /></div>
                      <div><label className="text-xs text-slate-400 block mb-1">Established Year</label><input type="text" value={school.estd_year || ''} onChange={(e) => setSchool({ ...school, estd_year: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white outline-none focus:border-blue-500" placeholder="e.g. 2005" /></div>
                      <div><label className="text-xs text-slate-400 block mb-1">Logo URL (Direct Image Link)</label><input type="url" value={school.logo_url || ''} onChange={(e) => setSchool({ ...school, logo_url: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white outline-none focus:border-blue-500" placeholder="https://...png" /></div>
                      <div><label className="text-xs text-slate-400 block mb-1">Cover Photo URL (Banner)</label><input type="url" value={school.cover_url || ''} onChange={(e) => setSchool({ ...school, cover_url: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white outline-none focus:border-blue-500" placeholder="https://..." /></div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-amber-400 mb-4 border-b border-slate-800 pb-2">Academic Info</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div><label className="text-xs text-slate-400 block mb-1">Govt. Registration No</label><input type="text" value={school.reg_no || ''} onChange={(e) => setSchool({ ...school, reg_no: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white outline-none focus:border-amber-500" /></div>
                      <div><label className="text-xs text-slate-400 block mb-1">Education Board</label><input type="text" value={school.board || ''} onChange={(e) => setSchool({ ...school, board: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white outline-none focus:border-amber-500" placeholder="e.g. WBBSE, CBSE" /></div>
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Medium</label>
                        <select value={school.medium || ''} onChange={(e) => setSchool({ ...school, medium: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white outline-none focus:border-amber-500">
                          <option value="">Select Medium</option><option value="Bengali">Bengali</option><option value="English">English</option><option value="Arabic">Arabic</option>
                        </select>
                      </div>
                      <div className="md:col-span-3"><label className="text-xs text-slate-400 block mb-1">Principal / Headmaster Name</label><input type="text" value={school.principal_name || ''} onChange={(e) => setSchool({ ...school, principal_name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white outline-none focus:border-amber-500" /></div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-emerald-400 mb-4 border-b border-slate-800 pb-2">Contact Configuration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div><label className="text-xs text-slate-400 block mb-1">Primary Phone</label><input type="text" value={school.phone || ''} onChange={(e) => setSchool({ ...school, phone: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white outline-none focus:border-emerald-500" /></div>
                      <div><label className="text-xs text-slate-400 block mb-1">Alternate / WhatsApp Phone</label><input type="text" value={school.alternate_phone || ''} onChange={(e) => setSchool({ ...school, alternate_phone: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white outline-none focus:border-emerald-500" /></div>
                      <div><label className="text-xs text-slate-400 block mb-1">Official Email</label><input type="email" value={school.email || ''} onChange={(e) => setSchool({ ...school, email: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white outline-none focus:border-emerald-500" /></div>
                      <div><label className="text-xs text-slate-400 block mb-1">Website URL</label><input type="url" value={school.website || ''} onChange={(e) => setSchool({ ...school, website: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white outline-none focus:border-emerald-500" /></div>
                      <div className="md:col-span-2"><label className="text-xs text-slate-400 block mb-1">Full Postal Address</label><textarea value={school.address || ''} onChange={(e) => setSchool({ ...school, address: e.target.value })} rows="3" className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white resize-none outline-none focus:border-emerald-500" /></div>
                    </div>
                  </div>

                  <button type="submit" disabled={isProcessing} className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 px-6 py-4 rounded-xl font-black text-sm transition shadow-lg shadow-emerald-500/20 flex justify-center items-center gap-2">
                    {isProcessing ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} Save Master Settings
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative">
                
                <div className="h-48 w-full bg-slate-800 relative" style={{ backgroundImage: `url(${school.cover_url || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop'})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-80"></div>
                  <div className="absolute top-4 right-4 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-1 backdrop-blur-md">
                    <BadgeCheck size={14} /> Verified Enterprise
                  </div>
                </div>

                <div className="px-6 md:px-10 pb-8 relative -mt-16 flex flex-col md:flex-row gap-6 items-center md:items-end border-b border-slate-800/80">
                  <div className="w-32 h-32 rounded-full border-4 border-slate-950 bg-slate-900 shadow-2xl flex items-center justify-center overflow-hidden shrink-0 z-10 relative">
                    {school.logo_url ? <img src={school.logo_url} alt="School Logo" className="w-full h-full object-cover bg-white" /> : <School className="text-slate-500" size={50} />}
                  </div>
                  <div className="text-center md:text-left flex-1 pb-2">
                    <h1 className="text-3xl font-black text-white tracking-tight">{school.school_name || 'School Name Not Set'}</h1>
                    <p className="text-sm text-slate-400 mt-1 font-medium flex items-center justify-center md:justify-start gap-1"><MapPin size={14}/> {school.address || 'Address not added yet'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 md:p-10">
                  <div className="bg-slate-950/50 border border-slate-800/80 p-6 rounded-2xl hover:border-slate-700 transition">
                    <h3 className="text-xs uppercase tracking-widest font-bold text-slate-500 mb-5 border-b border-slate-800 pb-2">Contact Details</h3>
                    <div className="space-y-4 text-sm text-slate-300">
                      <div className="flex items-center gap-3"><PhoneCall size={18} className="text-blue-400" /> <div><p className="text-[10px] text-slate-500 font-semibold">Primary Phone</p><p className="font-bold text-white">{school.phone || 'N/A'}</p></div></div>
                      <div className="flex items-center gap-3"><Phone size={18} className="text-amber-400" /> <div><p className="text-[10px] text-slate-500 font-semibold">Alternate Phone</p><p className="font-bold text-white">{school.alternate_phone || 'N/A'}</p></div></div>
                      <div className="flex items-center gap-3"><Mail size={18} className="text-emerald-400" /> <div><p className="text-[10px] text-slate-500 font-semibold">Email Address</p><p className="font-medium text-white">{school.email || 'N/A'}</p></div></div>
                      <div className="flex items-center gap-3"><Globe size={18} className="text-indigo-400" /> <div><p className="text-[10px] text-slate-500 font-semibold">Website</p><a href={school.website} target="_blank" className="font-medium text-indigo-400 hover:underline">{school.website || 'N/A'}</a></div></div>
                    </div>
                  </div>

                  <div className="bg-slate-950/50 border border-slate-800/80 p-6 rounded-2xl hover:border-slate-700 transition">
                    <h3 className="text-xs uppercase tracking-widest font-bold text-slate-500 mb-5 border-b border-slate-800 pb-2">Academic Information</h3>
                    <div className="space-y-4 text-sm text-slate-300">
                      <div className="flex items-center gap-3"><FileText size={18} className="text-rose-400" /> <div><p className="text-[10px] text-slate-500 font-semibold">Govt. Registration No</p><p className="font-bold text-white">{school.reg_no || 'N/A'}</p></div></div>
                      <div className="flex items-center gap-3"><BookOpen size={18} className="text-blue-400" /> <div><p className="text-[10px] text-slate-500 font-semibold">Education Board</p><p className="font-bold text-white">{school.board || 'N/A'}</p></div></div>
                      <div className="flex items-center gap-3"><Globe size={18} className="text-emerald-400" /> <div><p className="text-[10px] text-slate-500 font-semibold">Medium of Study</p><p className="font-bold text-white">{school.medium || 'N/A'}</p></div></div>
                      <div className="flex items-center gap-3"><Calendar size={18} className="text-amber-400" /> <div><p className="text-[10px] text-slate-500 font-semibold">Established Year</p><p className="font-bold text-white">{school.estd_year || 'N/A'}</p></div></div>
                    </div>
                  </div>

                  <div className="bg-slate-950/50 border border-slate-800/80 p-6 rounded-2xl hover:border-slate-700 transition flex flex-col">
                    <h3 className="text-xs uppercase tracking-widest font-bold text-slate-500 mb-5 border-b border-slate-800 pb-2">Administration</h3>
                    <div className="flex items-center gap-3 text-slate-300"><UserCheck size={18} className="text-purple-400" /> <div><p className="text-[10px] text-slate-500 font-semibold">Principal / Headmaster</p><p className="font-bold text-white">{school.principal_name || 'N/A'}</p></div></div>
                    
                    <div className="mt-auto pt-6">
                      <div className="p-4 bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border border-blue-500/20 rounded-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><School size={40}/></div>
                        <p className="text-[10px] text-blue-400 font-black mb-1 uppercase tracking-wider">System Snapshot</p>
                        <p className="text-xs text-slate-400">Total Admitted: <span className="font-bold text-white">{activeStudentsList.length}</span></p>
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
