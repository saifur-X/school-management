'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Users, CreditCard, FileSpreadsheet, UserCheck, Key, LogOut, 
  Plus, School, Search, ArrowUpCircle, DollarSign, Settings, Trash2, Edit, Save, 
  X, User, BookOpen, Phone, Droplet, MapPin, Image, Printer, AlertCircle, PhoneCall, 
  Calendar, Mail, Globe, Building, FileText, BadgeCheck, Loader2, CheckCircle, GraduationCap, FileOutput, File,
  Activity, Bell, CalendarCheck, Briefcase, UploadCloud, Download, Lock, Megaphone, Sparkles, Clock,
  Barcode, CheckCheck, MessageCircle, AlertTriangle, ChevronRight, PieChart, Sun, Coffee, BookMarked, ShieldAlert,
  Moon, Menu
} from 'lucide-react';

// স্মুথ কাউন্ট-আপ অ্যানিমেশন কম্পোনেন্ট
function AnimatedNumber({ value = 0, prefix = '', suffix = '' }) {
  const [displayVal, setDisplayVal] = useState(0);
  const num = Number(value) || 0;

  useEffect(() => {
    let start = 0;
    const end = num;
    if (start === end) {
      setDisplayVal(end);
      return;
    }
    const duration = 650;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = (end - start) / steps;
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
        setDisplayVal(end);
        clearInterval(timer);
      } else {
        setDisplayVal(Math.round(current));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [num]);

  return <span>{prefix}{displayVal.toLocaleString()}{suffix}</span>;
}

export default function Dashboard() {
  const [session, setSession] = useState(null);
  const [studentSession, setStudentSession] = useState(null);
  const [teacherSession, setTeacherSession] = useState(null);
  const [portalUrl, setPortalUrl] = useState('https://eduadmin.vercel.app'); 
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Theme & Mobile Drawer State
  const [theme, setTheme] = useState('dark');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // লাইভ ক্লক
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAdmissionModalOpen, setIsAdmissionModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // সংরক্ষিত থিম লোড
  useEffect(() => {
    const savedTheme = localStorage.getItem('portal_theme');
    if (savedTheme) setTheme(savedTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('portal_theme', nextTheme);
  };

  const [school, setSchool] = useState({ 
    school_name: '', address: '', phone: '', email: '', logo_url: '', cover_url: '', 
    estd_year: '', reg_no: '', principal_name: '', website: '', alternate_phone: '', board: '', medium: '' 
  });
  const [editSchool, setEditSchool] = useState(false);

  const defaultClasses = ['Nursery', 'KG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
  const [classList, setClassList] = useState(defaultClasses);
  const [customClassInput, setCustomClassInput] = useState('');
  const [isAddingCustomClass, setIsAddingCustomClass] = useState(false);

  const isStudentActive = (st) => {
    if (!st) return false;
    if (!st.status) return true; 
    return String(st.status).trim().toLowerCase() === 'active';
  };

  const isSameClass = (c1, c2) => {
    if (!c1 || !c2) return false;
    return String(c1).trim().toLowerCase() === String(c2).trim().toLowerCase();
  };

  const activeClasses = [...new Set(students.filter(isStudentActive).map(s => s.student_class?.trim()).filter(Boolean))].sort((a, b) => {
    const aIdx = classList.indexOf(a); const bIdx = classList.indexOf(b);
    return (aIdx !== -1 ? aIdx : 99) - (bIdx !== -1 ? bIdx : 99);
  });

  const [studentStatusTab, setStudentStatusTab] = useState('Active');
  const [selectedClassFilter, setSelectedClassFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({ 
    id: null, name: '', rollNo: '', studentClass: 'Class 1', phone: '', bloodGroup: '', 
    address: '', gender: 'Male', photoUrl: '', fatherName: '', motherName: '', 
    dob: '', aadharNo: '', religion: '', category: 'General' 
  });
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  
  // Staff State
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [staffData, setStaffData] = useState({ id: null, name: '', role: 'Teacher', phone: '', password: '', salary: 0, status: 'Active' });

  // Notice State
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [noticeFormData, setNoticeFormData] = useState({ title: '', content: '', target_class: 'All', publish_date: new Date().toISOString().split('T')[0] });
  const [selectedNoticeToPrint, setSelectedNoticeToPrint] = useState(null);

  // Attendance
  const [attendanceMode, setAttendanceMode] = useState('students');
  const [attendanceView, setAttendanceView] = useState('daily');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceMonth, setAttendanceMonth] = useState(new Date().toISOString().slice(0, 7));
  const [attendanceClass, setAttendanceClass] = useState('Class 1');
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [monthlyAttendanceData, setMonthlyAttendanceData] = useState([]);
  const [barcodeScanInput, setBarcodeScanInput] = useState('');
  const barcodeInputRef = useRef(null);
  const [dayType, setDayType] = useState('Class Day');

  const [statusModalStudent, setStatusModalStudent] = useState(null);
  const [statusAction, setStatusAction] = useState('Transferred'); 
  const [statusReason, setStatusReason] = useState('Relocation');
  const [tcPrintData, setTcPrintData] = useState(null);

  const [idSelectedClass, setIdSelectedClass] = useState('');
  const [selectedIdStudent, setSelectedIdStudent] = useState(null);
  const [printIdCard, setPrintIdCard] = useState(false); 

  const [selectedConfigClass, setSelectedConfigClass] = useState('Class 1');
  const [allClassConfigs, setAllClassConfigs] = useState({});
  const [classConfig, setClassConfig] = useState({ 
    academic_year: '2026', start_month: 1, subjects: [], admission_fee: 1000, 
    tuition_fee: 500, exam1_fee: 200, exam2_fee: 200, exam3_fee: 200, custom_fee: 0 
  });

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

  const [studentPortalData, setStudentPortalData] = useState({ marks: [], tx: [], attendance: [] });
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
      const localTeacher = typeof window !== 'undefined' ? localStorage.getItem('teacher_session') : null;
      const localStudent = typeof window !== 'undefined' ? localStorage.getItem('student_session') : null;

      if (adminSession) {
        setSession(adminSession); 
        fetchSchoolDetails(); 
        loadClassConfigs(); 
        fetchData(); 
        fetchStaff();
        fetchNotices();
      } else if (localTeacher) {
        const teacher = JSON.parse(localTeacher);
        setTeacherSession(teacher);
        fetchSchoolDetails(); 
        loadClassConfigs(); 
        fetchData(); 
        fetchNotices();
      } else if (localStudent) {
        const student = JSON.parse(localStudent); 
        setStudentSession(student);
        fetchSchoolDetails(); 
        loadClassConfigs(); 
        fetchNotices();
        fetchStudentSpecificData(student.id, student.student_class);
      } else { 
        router.push('/login'); 
      }
    }; 
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (activeClasses.length > 0 && !activeClasses.some(c => isSameClass(c, attendanceClass))) {
      setAttendanceClass(activeClasses[0]);
    }
  }, [activeClasses]);

  const fetchStudentSpecificData = async (studentId, studentClass) => {
    const { data: marks } = await supabase.from('marksheets').select('*').eq('student_id', studentId);
    const { data: tx } = await supabase.from('erp_transactions').select('*').eq('student_id', studentId).order('created_at', { ascending: false });
    const { data: att } = await supabase.from('attendance').select('*').eq('student_id', studentId);
    setStudentPortalData({ marks: marks || [], tx: tx || [], attendance: att || [] }); 
    setLoading(false);
  };

  const fetchData = async () => {
    setLoading(true);
    const { data: stData } = await supabase.from('students').select('*').order('student_class', { ascending: true }).order('roll_no', { ascending: true });
    setStudents(stData || []);
    const { data: txData } = await supabase.from('erp_transactions').select('*, students(name, roll_no, student_class, phone, status)').order('created_at', { ascending: false });
    setAllErpTransactions(txData || []); 
    setLoading(false);
  };

  const fetchStaff = async () => {
    const { data } = await supabase.from('staff').select('*').order('id', { ascending: true });
    if (data) setStaffList(data);
  };

  const fetchNotices = async () => {
    const { data } = await supabase.from('notices').select('*').order('created_at', { ascending: false });
    if (data) setNotices(data);
  };

  const loadAttendance = async (cls, date, mode = attendanceMode) => {
    if (!date) return;
    try {
      const localDay = localStorage.getItem(`day_type_${date}`);
      if (localDay) setDayType(localDay);
      else setDayType('Class Day');
      const { data: dayData } = await supabase.from('attendance_day_types').select('day_type').eq('date', date).maybeSingle();
      if (dayData && dayData.day_type) {
        setDayType(dayData.day_type);
        localStorage.setItem(`day_type_${date}`, dayData.day_type);
      }
    } catch (err) {
      console.log('Day type loading error:', err);
    }

    let query = supabase.from('attendance').select('*').eq('date', date);
    if (mode === 'students') {
      if (!cls) return;
      query = query.eq('class_name', cls);
    } else {
      query = query.eq('class_name', 'STAFF');
    }
    const { data } = await query;
    const records = {};
    if (data) data.forEach(d => { records[d.student_id] = d.status; });
    setAttendanceRecords(records);
  };

  const handleSelectDayType = async (type) => {
    setDayType(type);
    localStorage.setItem(`day_type_${attendanceDate}`, type);
    showToast(`আজকের দিনটি "${type}" হিসেবে চিহ্নিত হয়েছে!`);
    try { await supabase.from('attendance_day_types').upsert({ date: attendanceDate, day_type: type }, { onConflict: 'date' }); } catch (e) { console.log(e); }
  };

  const loadMonthlyAttendance = async () => {
    if (!attendanceMonth) return;
    setIsProcessing(true);
    const startDate = `${attendanceMonth}-01`;
    const endDate = `${attendanceMonth}-31`;
    let query = supabase.from('attendance').select('*').gte('date', startDate).lte('date', endDate);
    if (attendanceMode === 'students') query = query.eq('class_name', attendanceClass);
    else query = query.eq('class_name', 'STAFF');
    const { data } = await query;
    setMonthlyAttendanceData(data || []);
    setIsProcessing(false);
  };

  useEffect(() => {
    if (activeTab === 'attendance') {
      if (attendanceView === 'daily') loadAttendance(attendanceClass, attendanceDate, attendanceMode);
      else loadMonthlyAttendance();
    }
  }, [attendanceClass, attendanceDate, attendanceMonth, attendanceMode, attendanceView, activeTab]);

  const handleSaveAttendance = async (id, status, isStaff = false) => {
    const newRecords = { ...attendanceRecords, [id]: status };
    setAttendanceRecords(newRecords);
    await supabase.from('attendance').upsert({ 
      student_id: id, class_name: isStaff ? 'STAFF' : attendanceClass, date: attendanceDate, status: status 
    }, { onConflict: 'student_id, date' });
  };

  const handleMarkAllPresent = async () => {
    const activeList = currentAttendanceTargetList;
    if (activeList.length === 0) return showToast('উপস্থিতি মার্ক করার কেউ নেই!', 'error');
    setIsProcessing(true);
    const updated = { ...attendanceRecords };
    const payload = [];
    activeList.forEach(item => {
      updated[item.id] = 'Present';
      payload.push({ student_id: item.id, class_name: attendanceMode === 'students' ? attendanceClass : 'STAFF', date: attendanceDate, status: 'Present' });
    });
    setAttendanceRecords(updated);
    const { error } = await supabase.from('attendance').upsert(payload, { onConflict: 'student_id, date' });
    if (!error) showToast('সবাইকে সফলভাবে Present মার্ক করা হয়েছে!');
    else showToast('ত্রুটি: ' + error.message, 'error');
    setIsProcessing(false);
  };

  const handleMarkAllAsLeave = async () => {
    const activeList = currentAttendanceTargetList;
    if (activeList.length === 0) return;
    setIsProcessing(true);
    const updated = { ...attendanceRecords };
    const payload = [];
    activeList.forEach(item => {
      updated[item.id] = 'Leave';
      payload.push({ student_id: item.id, class_name: attendanceMode === 'students' ? attendanceClass : 'STAFF', date: attendanceDate, status: 'Leave' });
    });
    setAttendanceRecords(updated);
    await supabase.from('attendance').upsert(payload, { onConflict: 'student_id, date' });
    showToast('সকলকে ছুটি (Leave) হিসেবে চিহ্নিত করা হয়েছে!');
    setIsProcessing(false);
  };

  const handleBarcodeSubmit = async (e) => {
    e.preventDefault();
    const scannedVal = barcodeScanInput.trim();
    if (!scannedVal) return;
    if (attendanceMode === 'students') {
      const matched = students.find(s => (s.unique_id && String(s.unique_id) === scannedVal) || String(s.roll_no) === scannedVal);
      if (matched) {
        await handleSaveAttendance(matched.id, 'Present', false);
        showToast(`✅ ${matched.name} (Roll #${matched.roll_no}) - Present!`);
      } else showToast('❌ কোনো স্টুডেন্ট খুঁজে পাওয়া যায়নি!', 'error');
    } else {
      const matchedStaff = staffList.find(s => s.phone === scannedVal || String(s.id) === scannedVal);
      if (matchedStaff) {
        await handleSaveAttendance(matchedStaff.id, 'Present', true);
        showToast(`✅ ${matchedStaff.name} - Present!`);
      } else showToast('❌ স্টাফ খুঁজে পাওয়া যায়নি!', 'error');
    }
    setBarcodeScanInput('');
    if (barcodeInputRef.current) barcodeInputRef.current.focus();
  };

  const getWhatsAppLink = (st) => {
    if (!st.phone) return null;
    const cleanPhone = st.phone.replace(/[^0-9]/g, '');
    const phoneWithCode = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const text = `সম্মানিত অভিভাবক, আপনার সন্তান ${st.name} (ক্লাস: ${st.student_class}, রোল: #${st.roll_no}) আজ ${attendanceDate} তারিখে বিদ্যালয়ে অনুপস্থিত রয়েছে। - ${school.school_name || 'স্কুল কর্তৃপক্ষ'}`;
    return `https://wa.me/${phoneWithCode}?text=${encodeURIComponent(text)}`;
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

  const getNextRollForClass = (cls) => {
    const classSts = students.filter(s => isSameClass(s.student_class, cls) && isStudentActive(s));
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
      setClassList([...classList, customClassInput]); 
      setFormData({ ...formData, studentClass: customClassInput, rollNo: getNextRollForClass(customClassInput) });
    }
    setCustomClassInput(''); 
    setIsAddingCustomClass(false);
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
      if (!error) { showToast('স্টুডেন্ট আপডেট হয়েছে!'); resetStudentForm(); fetchData(); } 
      else showToast('আপডেট ব্যর্থ: ' + error.message, 'error');
    } else {
      const roll = getNextRollForClass(formData.studentClass); 
      const newUniqueId = await getNextUniqueId();
      const { error } = await supabase.from('students').insert([{
        name: formData.name, father_name: formData.fatherName, mother_name: formData.motherName, dob: formData.dob, 
        unique_id: newUniqueId, roll_no: roll, student_class: formData.studentClass, phone: formData.phone, 
        blood_group: formData.bloodGroup, address: formData.address, gender: formData.gender, status: 'Active', 
        photo_url: formData.photoUrl || 'https://via.placeholder.com/150', email: `student_${formData.studentClass}_${roll}@school.com`,
        aadhar_no: formData.aadharNo, religion: formData.religion, category: formData.category
      }]);
      if (!error) { showToast(`স্টুডেন্ট ভর্তি সম্পন্ন! Unique ID: ${newUniqueId}`); resetStudentForm(); fetchData(); } 
      else showToast('ভর্তি ব্যর্থ: ' + error.message, 'error');
    }
    setIsProcessing(false);
  };

  const handleSaveStaff = async (e) => {
    e.preventDefault(); 
    if (!staffData.name || !staffData.phone || !staffData.password) return showToast('নাম, মোবাইল নম্বর ও পাসওয়ার্ড আবশ্যক!', 'error');
    setIsProcessing(true);
    if (staffData.id) {
      const { error } = await supabase.from('staff').update({ name: staffData.name, role: staffData.role, phone: staffData.phone, password: staffData.password, salary: Number(staffData.salary) || 0, status: staffData.status }).eq('id', staffData.id);
      if (!error) showToast('স্টাফ আপডেট হয়েছে!'); else showToast('Error: ' + error.message, 'error');
    } else {
      const { error } = await supabase.from('staff').insert([{ name: staffData.name, role: staffData.role, phone: staffData.phone, password: staffData.password, salary: Number(staffData.salary) || 0, status: 'Active' }]);
      if (!error) showToast('নতুন স্টাফ যুক্ত হয়েছে!'); else showToast('Error: ' + error.message, 'error');
    }
    setIsStaffModalOpen(false); fetchStaff(); setIsProcessing(false);
  };

  const handleSaveNotice = async (e) => {
    e.preventDefault();
    if (!noticeFormData.title || !noticeFormData.content) return showToast('নোটিশের শিরোনাম ও বিস্তারিত আবশ্যক!', 'error');
    setIsProcessing(true);
    const { error } = await supabase.from('notices').insert([{ title: noticeFormData.title, content: noticeFormData.content, target_class: noticeFormData.target_class || 'All', publish_date: noticeFormData.publish_date || new Date().toISOString().split('T')[0] }]);
    if (!error) {
      showToast('নতুন নোটিশ প্রকাশিত হয়েছে!'); setIsNoticeModalOpen(false);
      setNoticeFormData({ title: '', content: '', target_class: 'All', publish_date: new Date().toISOString().split('T')[0] }); fetchNotices();
    } else showToast('নোটিশ পাবলিশ ব্যর্থ: ' + error.message, 'error');
    setIsProcessing(false);
  };

  const handleDeleteNotice = async (id) => {
    if (confirm('আপনি কি এই নোটিশটি মুছে ফেলতে চান?')) {
      const { error } = await supabase.from('notices').delete().eq('id', id);
      if (!error) { showToast('নোটিশ মুছে ফেলা হয়েছে!'); fetchNotices(); } else showToast('Error: ' + error.message, 'error');
    }
  };

  const handleEditClick = (st) => {
    setFormData({ 
      id: st.id, name: st.name, fatherName: st.father_name || '', motherName: st.mother_name || '', dob: st.dob || '', rollNo: st.roll_no, studentClass: st.student_class, phone: st.phone || '', bloodGroup: st.blood_group || '', address: st.address || '', gender: st.gender || 'Male', photoUrl: st.photo_url || '', aadharNo: st.aadhar_no || '', religion: st.religion || '', category: st.category || 'General' 
    });
    setIsEditingStudent(true); setIsAdmissionModalOpen(true);
  };

  const handleDeleteStudent = async (id, className) => {
    if (confirm('স্টুডেন্টের সকল তথ্য পার্মানেন্ট ডিলিট করতে চান?')) {
      await supabase.from('students').delete().eq('id', id);
      const remaining = students.filter(s => isSameClass(s.student_class, className) && s.id !== id && isStudentActive(s));
      for (let i = 0; i < remaining.length; i++) { await supabase.from('students').update({ roll_no: i + 1 }).eq('id', remaining[i].id); }
      showToast('স্টুডেন্ট মুছে ফেলা হয়েছে!'); fetchData();
    }
  };

  const handleUpgradeClass = async (currentClass) => {
    if (currentClass === 'Class 12') {
      if (confirm(`Class 12-এর সবাইকে Passout করে Alumni লিস্টে পাঠাতে চান?`)) {
        const classSts = students.filter(s => isSameClass(s.student_class, currentClass) && isStudentActive(s));
        const currentYear = new Date().getFullYear().toString();
        Promise.all(classSts.map(async (st) => { await supabase.from('students').update({ status: 'Passout', passout_year: currentYear }).eq('id', st.id); })).then(() => { showToast('সকল স্টুডেন্ট Passout হয়েছে!'); fetchData(); });
      } return;
    }
    const nextClassMap = { 'Nursery':'KG', 'KG':'Class 1', 'Class 1':'Class 2', 'Class 2':'Class 3', 'Class 3':'Class 4', 'Class 4':'Class 5', 'Class 5':'Class 6', 'Class 6':'Class 7', 'Class 7':'Class 8', 'Class 8':'Class 9', 'Class 9':'Class 10', 'Class 10':'Class 11', 'Class 11':'Class 12' };
    const targetClass = nextClassMap[currentClass] || 'Higher Class';
    if (confirm(`${currentClass} এর সবাইকে ${targetClass} এ প্রমোট করতে চান?`)) {
      const classSts = students.filter(s => isSameClass(s.student_class, currentClass) && isStudentActive(s));
      Promise.all(classSts.map(async (st, idx) => { await supabase.from('students').update({ student_class: targetClass, roll_no: idx + 1 }).eq('id', st.id); })).then(() => { showToast('ক্লাস আপগ্রেড সম্পন্ন হয়েছে!'); fetchData(); });
    }
  };

  const resetStudentForm = () => { 
    setFormData({ id: null, name: '', fatherName: '', motherName: '', dob: '', rollNo: getNextRollForClass('Class 1'), studentClass: 'Class 1', phone: '', bloodGroup: '', address: '', gender: 'Male', photoUrl: '', aadharNo: '', religion: '', category: 'General' }); 
    setIsEditingStudent(false); setIsAdmissionModalOpen(false);
  };

  const handleUpdateSchool = async (e) => {
    e.preventDefault(); 
    setIsProcessing(true);
    const { error } = await supabase.from('school_settings').update(school).eq('id', 1);
    if (!error) { showToast('স্কুল প্রোফাইল আপডেট হয়েছে!'); setEditSchool(false); } else showToast('Error', 'error');
    setIsProcessing(false);
  };

  const getFilteredStudents = () => {
    let filtered = students.filter(st => {
      const dbStatus = st.status || 'Active';
      if (studentStatusTab === 'Active' && !isStudentActive(st)) return false;
      if (studentStatusTab === 'Passout' && dbStatus !== 'Passout') return false;
      if (studentStatusTab === 'Transferred' && dbStatus !== 'Transferred') return false;
      const matchClass = selectedClassFilter === 'All' || isSameClass(st.student_class, selectedClassFilter);
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchClass;
      return matchClass && (st.name.toLowerCase().includes(q) || st.roll_no.toString().includes(q) || (st.unique_id && st.unique_id.toString().includes(q)));
    });
    if (studentStatusTab === 'Passout') filtered.sort((a, b) => (b.passout_year || '').localeCompare(a.passout_year || ''));
    else if (studentStatusTab === 'Transferred') filtered.sort((a, b) => new Date(b.transfer_date || 0) - new Date(a.transfer_date || 0));
    return filtered;
  };

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
    showToast('ডাটা এক্সপোর্ট হয়েছে!');
  };

  const handleImportCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      setIsProcessing(true);
      const text = e.target.result; const rows = text.split('\n').slice(1); let count = 0;
      for (let row of rows) {
        if (!row.trim()) continue;
        const cols = row.split(',').map(col => col.replace(/(^"|"$)/g, '').trim());
        if (cols.length >= 3) {
          const cls = cols[1] || 'Class 1'; const roll = getNextRollForClass(cls) + count; 
          await supabase.from('students').insert([{ name: cols[0], student_class: cls, dob: cols[2] || '2010-01-01', father_name: cols[3] || '', phone: cols[4] || '', roll_no: roll, status: 'Active' }]);
          count++;
        }
      }
      showToast(`${count} Students Imported Successfully!`); fetchData(); setIsProcessing(false); event.target.value = null;
    };
    reader.readAsText(file);
  };

  const fetchClassConfigDetails = async (cls) => {
    setSelectedConfigClass(cls); 
    const data = allClassConfigs[cls];
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
    let updated = [...erpSelectedFeeTypes]; 
    if (updated.includes(feeType)) updated = updated.filter(t => t !== feeType); else updated.push(feeType);
    if (updated.length === 0) updated = ['Tuition Fee']; 
    setErpSelectedFeeTypes(updated); 
    calculateTotalDues(updated, erpClassConfig, agreedFees.monthly, agreedFees.admission, erpTransactions);
  };

  const handleCreateInvoice = async () => {
    if (!erpStudent || erpSelectedFeeTypes.length === 0 || Number(erpPaidAmount) <= 0) return showToast('সঠিক তথ্য দিন!', 'error');
    setIsProcessing(true);
    const transactionsToInsert = []; const receiptItems = []; const globalDiscount = Number(erpDiscount); 
    let discountApplied = false; let remainingPayment = Number(erpPaidAmount);

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
    const net = Number(editingTx.amount) - Number(editingTx.discount); const actualPaid = Number(editingTx.paid_amount);
    const pend = Math.max(0, net - actualPaid); const stat = pend <= 0 ? 'Paid' : 'Pending';
    const { error } = await supabase.from('erp_transactions').update({ paid_amount: actualPaid, discount: Number(editingTx.discount), final_amount: net, pending_amount: pend, status: stat }).eq('id', editingTx.id);
    if (!error) { showToast('পেমেন্ট আপডেট হয়েছে!'); setEditingTx(null); await fetchData(); handleSelectErpStudent(erpStudent); }
    setIsProcessing(false);
  };

  const saveAgreedFeesToDB = async () => {
    if (!erpStudent) return;
    const { error } = await supabase.from('students').update({ agreed_monthly_fee: Number(agreedFees.monthly), agreed_admission_fee: Number(agreedFees.admission) }).eq('id', erpStudent.id);
    if (!error) { 
      showToast("স্টুডেন্টের ফিস প্রোফাইল সেভ হয়েছে!"); 
      setErpStudent({...erpStudent, agreed_monthly_fee: Number(agreedFees.monthly), agreed_admission_fee: Number(agreedFees.admission)}); fetchData(); 
      calculateTotalDues(erpSelectedFeeTypes, erpClassConfig, Number(agreedFees.monthly), Number(agreedFees.admission), erpTransactions); 
    }
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
    if (availableForThisMonth >= feePerMonth) return { label: 'Paid', subText: `₹${feePerMonth}`, bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/30', badgeBg: 'bg-emerald-500/20' };
    if (availableForThisMonth > 0) return { label: 'Partial', subText: `Paid: ₹${availableForThisMonth}`, bg: 'bg-lime-500/10', text: 'text-lime-500', border: 'border-lime-500/40', badgeBg: 'bg-lime-500/20' };
    if (monthIndex <= currentMonth) return { label: 'Due', subText: `Due: ₹${feePerMonth}`, bg: 'bg-rose-500/10', text: 'text-rose-500', border: 'border-rose-500/30', badgeBg: 'bg-rose-500/20' };
    return { label: 'Upcoming', bg: 'bg-slate-800/50', text: 'text-slate-400', border: 'border-slate-700', badgeBg: 'bg-slate-700' };
  };

  const handleLogout = async () => {
    if (studentSession) { localStorage.removeItem('student_session'); router.push('/login'); } 
    else if (teacherSession) { localStorage.removeItem('teacher_session'); router.push('/login'); } 
    else { await supabase.auth.signOut(); router.push('/login'); }
  };

  // =====================================
  // CSS STYLING & ANIMATIONS
  // =====================================
  const sharedGlobalStyle = (
    <style dangerouslySetInnerHTML={{ __html: `
      .scrollbar-hide::-webkit-scrollbar { display: none; }
      .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

      @keyframes dynamicMeshAnimation { 
        0% { background-position: 0% 50%; } 
        50% { background-position: 100% 50%; } 
        100% { background-position: 0% 50%; } 
      }
      .animated-mesh-bg { 
        background: linear-gradient(-45deg, #090e1a, #161233, #0b1f3a, #1d102e, #071929, #140d28) !important; 
        background-size: 350% 350% !important; 
        animation: dynamicMeshAnimation 16s ease infinite !important; 
      }

      /* কার্ড এন্ট্রান্স অ্যানিমেশন */
      @keyframes smoothCardFade {
        0% { opacity: 0; transform: translateY(12px) scale(0.99); }
        100% { opacity: 1; transform: translateY(0) scale(1); }
      }
      .animate-card-view {
        animation: smoothCardFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      .card-lift {
        transition: transform 0.25s ease, box-shadow 0.25s ease;
      }
      .card-lift:hover {
        transform: translateY(-3px);
      }

      /* LIGHT THEME (সবার জন্য ক্রিস্টাল ক্লিয়ার কালার ও হাই কনট্রাস্ট) */
      .light-mode { 
        background: #f8fafc !important; 
        color: #0f172a !important; 
      }
      .light-mode .animated-mesh-bg { 
        background: linear-gradient(-45deg, #f8fafc, #f1f5f9, #e2e8f0, #f8fafc) !important; 
      }
      .light-mode .bg-slate-900\\/80, 
      .light-mode .bg-slate-900\\/70, 
      .light-mode .bg-slate-950\\/80, 
      .light-mode .bg-slate-900\\/90,
      .light-mode .bg-slate-900 {
        background-color: #ffffff !important; 
        border-color: #e2e8f0 !important; 
        box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05) !important;
      }
      .light-mode .bg-slate-950, 
      .light-mode .bg-slate-950\\/70, 
      .light-mode .bg-slate-950\\/50 { 
        background-color: #f1f5f9 !important; 
        border-color: #cbd5e1 !important; 
      }
      .light-mode .border-white\\/10, 
      .light-mode .border-slate-800, 
      .light-mode .border-slate-700 { 
        border-color: #e2e8f0 !important; 
      }
      .light-mode .text-white, 
      .light-mode .text-slate-100 { 
        color: #0f172a !important; 
      }
      .light-mode .text-slate-300 { 
        color: #334155 !important; 
      }
      .light-mode .text-slate-400 { 
        color: #475569 !important; 
      }
      .light-mode .text-slate-500 { 
        color: #64748b !important; 
      }
      .light-mode input, 
      .light-mode select, 
      .light-mode textarea { 
        background-color: #ffffff !important; 
        color: #0f172a !important; 
        border-color: #cbd5e1 !important; 
      }
      .light-mode table thead { 
        background-color: #f8fafc !important; 
        color: #475569 !important; 
        border-color: #e2e8f0 !important; 
      }
      .light-mode table tbody tr:hover { 
        background-color: #f8fafc !important; 
      }
      .light-mode .divide-white\\/5 > :not([hidden]) ~ :not([hidden]),
      .light-mode .divide-slate-800 > :not([hidden]) ~ :not([hidden]) { 
        border-color: #e2e8f0 !important; 
      }
      .light-mode .btn-glow-blue, 
      .light-mode .btn-glow-emerald, 
      .light-mode .btn-glow-amber, 
      .light-mode .btn-glow-purple, 
      .light-mode .btn-glow-rose {
        color: #ffffff !important;
      }
      .light-mode .orb-float-anim-1,
      .light-mode .orb-float-anim-2,
      .light-mode .orb-float-anim-3 {
        opacity: 0.15 !important;
      }

      @keyframes floatGlowOrb { 
        0%, 100% { transform: translateY(0px) scale(1) rotate(0deg); } 
        50% { transform: translateY(-30px) scale(1.12) rotate(180deg); } 
      }
      .orb-float-anim-1 { animation: floatGlowOrb 12s ease-in-out infinite; }
      .orb-float-anim-2 { animation: floatGlowOrb 16s ease-in-out infinite reverse; }
      .orb-float-anim-3 { animation: floatGlowOrb 14s ease-in-out infinite 3s; }

      .btn-glow-blue { box-shadow: 0 0 16px -1px rgba(59, 130, 246, 0.45); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
      .btn-glow-blue:hover { box-shadow: 0 0 28px 3px rgba(59, 130, 246, 0.75); transform: translateY(-2px); }
      .btn-glow-emerald { box-shadow: 0 0 16px -1px rgba(16, 185, 129, 0.45); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
      .btn-glow-emerald:hover { box-shadow: 0 0 28px 3px rgba(16, 185, 129, 0.75); transform: translateY(-2px); }
      .btn-glow-amber { box-shadow: 0 0 16px -1px rgba(245, 158, 11, 0.45); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
      .btn-glow-amber:hover { box-shadow: 0 0 28px 3px rgba(245, 158, 11, 0.75); transform: translateY(-2px); }
      .btn-glow-purple { box-shadow: 0 0 16px -1px rgba(168, 85, 247, 0.45); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
      .btn-glow-purple:hover { box-shadow: 0 0 28px 3px rgba(168, 85, 247, 0.75); transform: translateY(-2px); }
      .btn-glow-rose { box-shadow: 0 0 16px -1px rgba(244, 63, 94, 0.45); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
      .btn-glow-rose:hover { box-shadow: 0 0 28px 3px rgba(244, 63, 94, 0.75); transform: translateY(-2px); }

      .school-brand-title { 
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
        background: linear-gradient(135deg, #0284c7 0%, #db2777 50%, #d97706 100%); 
        -webkit-background-clip: text; 
        -webkit-text-fill-color: transparent; 
      }

      @media print {
        .no-print { display: none !important; }
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        ${receiptData || tcPrintData || selectedNoticeToPrint ? `
          @page { size: A4 portrait; margin: 12mm; } 
          body { background: white !important; color: black !important; } 
          aside, main { display: none !important; }
        ` : ''}
        ${printIdCard ? `
          @page { size: 54mm 85.6mm; margin: 0mm !important; } 
          html, body { width: 54mm !important; height: 85.6mm !important; max-height: 85.6mm !important; margin: 0 !important; padding: 0 !important; overflow: hidden !important; background: #ffffff !important; } 
          aside, main, nav { display: none !important; } 
          .pvc-modal-overlay { position: fixed !important; top: 0 !important; left: 0 !important; width: 54mm !important; height: 85.6mm !important; max-height: 85.6mm !important; background: none !important; padding: 0 !important; margin: 0 !important; display: flex !important; align-items: center !important; justify-content: center !important; overflow: hidden !important; } 
          .pvc-card { width: 54mm !important; height: 85.6mm !important; max-height: 85.6mm !important; border: none !important; border-radius: 0 !important; margin: 0 !important; padding: 2.2mm !important; box-sizing: border-box !important; box-shadow: none !important; overflow: hidden !important; }
        ` : ''}
      }
    `}} />
  );

  if (!session && !studentSession && !teacherSession) {
    return (
      <div className={`min-h-screen ${theme === 'light' ? 'light-mode' : 'bg-slate-950'} flex items-center justify-center text-white`}>
        <Loader2 className="animate-spin mr-2 text-cyan-400"/> Loading Portal...
      </div>
    );
  }

  // ==============================================================
  // STUDENT PORTAL VIEW
  // ==============================================================
  if (studentSession) {
    const config = allClassConfigs[studentSession.student_class] || {};
    const aMonthly = (studentSession.agreed_monthly_fee !== null && studentSession.agreed_monthly_fee !== "") ? Number(studentSession.agreed_monthly_fee) : Number(config.tuition_fee || 0);
    const aAdmission = (studentSession.agreed_admission_fee !== null && studentSession.agreed_admission_fee !== "") ? Number(studentSession.agreed_admission_fee) : Number(config.admission_fee || 0);
    const totalPaid = studentPortalData.tx.reduce((acc, curr) => acc + getPaidAmount(curr), 0);
    const currentMonth = new Date().getMonth() + 1; 
    const activeMonths = Math.max(1, (currentMonth - (config.start_month || 1)) + 1);
    const expectedTuition = aMonthly * activeMonths;
    const tuitionPaid = studentPortalData.tx.filter(t => t.fee_type === 'Tuition Fee').reduce((s, t) => s + getPaidAmount(t), 0);
    const admissionPaid = studentPortalData.tx.filter(t => t.fee_type === 'Admission Fee').reduce((s, t) => s + getPaidAmount(t), 0);
    const totalDue = Math.max(0, expectedTuition - tuitionPaid) + Math.max(0, aAdmission - admissionPaid);

    const studentNotices = notices.filter(n => n.target_class === 'All' || isSameClass(n.target_class, studentSession.student_class));
    const totalWorkingDays = studentPortalData.attendance.length;
    const presents = studentPortalData.attendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
    const attendancePct = totalWorkingDays > 0 ? Math.round((presents / totalWorkingDays) * 100) : 100;

    return (
      <div className={`min-h-screen ${theme === 'light' ? 'light-mode' : 'bg-slate-950 animated-mesh-bg'} text-slate-100 font-sans p-4 md:p-10 relative overflow-hidden`}>
        {sharedGlobalStyle}
        <div className="absolute -top-24 -left-24 w-[420px] h-[420px] bg-gradient-to-tr from-cyan-500/20 to-blue-600/25 rounded-full blur-3xl pointer-events-none orb-float-anim-1"></div>
        <div className="absolute top-1/3 -right-28 w-[450px] h-[450px] bg-gradient-to-bl from-purple-600/25 via-pink-600/20 to-indigo-600/20 rounded-full blur-3xl pointer-events-none orb-float-anim-2"></div>

        <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 relative z-10">
          <div className="animate-card-view flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900/80 border border-white/10 p-5 md:p-8 rounded-3xl shadow-xl backdrop-blur-2xl gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              {school.logo_url ? (
                <img src={school.logo_url} alt="Logo" className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white object-contain p-1 border-2 border-indigo-500 shadow-md shrink-0" />
              ) : (
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shrink-0">
                  <School size={28} className="text-white"/>
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-xl md:text-3xl font-black tracking-tight school-brand-title leading-tight line-clamp-1">{school.school_name || 'My School Portal'}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-400 font-medium">
                  {school.phone && (<span className="flex items-center gap-1 bg-white/5 px-2.5 py-0.5 rounded-full border border-slate-700/50"><PhoneCall size={12} className="text-emerald-500 shrink-0"/> {school.phone}</span>)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t border-slate-700/40 md:border-t-0 pt-3 md:pt-0">
              <button onClick={toggleTheme} className="p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800 transition border border-slate-700 text-amber-500 shadow-sm" title="Toggle Light/Dark Theme">
                {theme === 'dark' ? <Sun size={18}/> : <Moon size={18}/>}
              </button>
              <span className="px-3 py-1.5 rounded-full bg-indigo-500/15 text-indigo-500 border border-indigo-500/30 text-[10px] md:text-xs font-bold uppercase tracking-wider">Student Portal</span>
              <button onClick={handleLogout} className="btn-glow-rose bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 px-4 py-2 md:px-5 md:py-2.5 rounded-2xl text-xs md:text-sm font-bold flex items-center gap-2 transition"><LogOut size={16}/> Logout</button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="animate-card-view card-lift bg-gradient-to-br from-blue-900/80 to-indigo-900/80 p-5 md:p-6 rounded-3xl shadow-xl border border-blue-500/40 flex items-center gap-4 backdrop-blur-xl sm:col-span-2 md:col-span-1 text-white">
              <img src={studentSession.photo_url || 'https://via.placeholder.com/150'} className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-white/20 object-cover shadow-lg" />
              <div><h2 className="text-lg md:text-xl font-black text-white leading-tight">{studentSession.name}</h2><p className="text-xs md:text-sm text-blue-200 mt-1">{studentSession.student_class} | Roll: #{studentSession.roll_no}</p><p className="text-[10px] md:text-xs font-bold bg-black/30 inline-block px-2.5 py-1 rounded-full mt-1.5">ID: {studentSession.unique_id}</p></div>
            </div>
            
            <div className="animate-card-view card-lift bg-slate-900/70 border border-white/10 p-5 md:p-6 rounded-3xl flex flex-col justify-center backdrop-blur-2xl">
              <p className="text-[10px] md:text-xs text-slate-400 uppercase tracking-widest font-bold">Attendance Rate</p>
              <h3 className={`text-3xl md:text-4xl font-black mt-1.5 ${attendancePct >= 75 ? 'text-emerald-500' : 'text-rose-500'}`}>
                <AnimatedNumber value={attendancePct} suffix="%" />
              </h3>
              <p className="text-[10px] md:text-[11px] text-slate-500 mt-1">{presents} / {totalWorkingDays} Days Present</p>
            </div>
            
            <div className="animate-card-view card-lift bg-slate-900/70 border border-white/10 p-5 md:p-6 rounded-3xl flex flex-col justify-center backdrop-blur-2xl">
              <p className="text-[10px] md:text-xs text-slate-400 uppercase tracking-widest font-bold">Total Fees Paid</p>
              <h3 className="text-3xl md:text-4xl font-black text-emerald-500 mt-1.5">
                <AnimatedNumber value={totalPaid} prefix="₹" />
              </h3>
            </div>

            <div className="animate-card-view card-lift bg-slate-900/70 border border-white/10 p-5 md:p-6 rounded-3xl flex flex-col justify-center backdrop-blur-2xl">
              <p className="text-[10px] md:text-xs text-slate-400 uppercase tracking-widest font-bold">Current Dues</p>
              <h3 className="text-3xl md:text-4xl font-black text-rose-500 mt-1.5">
                <AnimatedNumber value={totalDue} prefix="₹" />
              </h3>
            </div>
          </div>

          <div className="animate-card-view bg-slate-900/70 border border-white/10 p-5 md:p-6 rounded-3xl shadow-xl space-y-4 backdrop-blur-2xl">
            <h3 className="text-base md:text-lg font-bold text-amber-500 flex items-center gap-2"><Megaphone size={18}/> School Notice Board</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studentNotices.length > 0 ? studentNotices.map((n) => (
                <div key={n.id} className="card-lift bg-slate-950/80 p-4 md:p-5 rounded-2xl border border-white/10 flex flex-col justify-between space-y-3 hover:border-amber-500/40 transition">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-slate-100 text-sm md:text-base leading-snug">{n.title}</h4>
                      <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-md text-[9px] md:text-[10px] font-bold whitespace-nowrap">{n.publish_date}</span>
                    </div>
                    <p className="text-[11px] md:text-xs text-slate-400 mt-2 leading-relaxed whitespace-pre-line">{n.content}</p>
                  </div>
                  <button onClick={() => setSelectedNoticeToPrint(n)} className="btn-glow-blue bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition w-fit shadow-md">
                    <Download size={14}/> Download PDF
                  </button>
                </div>
              )) : (
                <div className="col-span-2 text-center p-6 text-slate-500 border border-dashed border-slate-700/50 rounded-2xl">
                  <Megaphone size={28} className="mx-auto mb-2 opacity-30"/>
                  <p className="text-xs font-medium">কোনো নোটিশ এখনো প্রকাশিত হয়নি।</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 pb-10">
            <div className="animate-card-view bg-slate-900/70 border border-white/10 p-5 md:p-6 rounded-3xl shadow-xl backdrop-blur-2xl">
              <h3 className="text-base md:text-lg font-bold text-slate-100 mb-4 flex items-center gap-2"><Calendar className="text-blue-500" size={18}/> Month-wise Fee Status</h3>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
                {monthsName.map((m, idx) => {
                  const statusObj = getMonthlyStatus(idx, studentSession, studentPortalData.tx, config);
                  return (
                    <div key={idx} className={`p-2 md:p-3 rounded-2xl text-center flex flex-col justify-center items-center h-16 md:h-20 border transition ${statusObj.bg} ${statusObj.border}`}><span className={`text-[10px] md:text-xs font-bold ${statusObj.text}`}>{m.substring(0,3)}</span><span className={`text-[9px] md:text-[10px] mt-1 font-bold px-2 py-0.5 rounded-full ${statusObj.badgeBg}`}>{statusObj.label}</span></div>
                  );
                })}
              </div>
            </div>
            
            <div className="animate-card-view bg-slate-900/70 border border-white/10 p-5 md:p-6 rounded-3xl shadow-xl backdrop-blur-2xl">
              <h3 className="text-base md:text-lg font-bold text-slate-100 mb-4 flex items-center gap-2"><FileText className="text-amber-500" size={18}/> Academic Results</h3>
              {studentPortalData.marks.length > 0 ? (
                <div className="space-y-3">
                  {studentPortalData.marks.map((mRecord, i) => (
                    <div key={i} className="bg-slate-950 border border-white/10 p-4 rounded-2xl">
                      <p className="text-xs md:text-sm font-bold text-amber-500 mb-2">{mRecord.exam_name}</p>
                      <div className="space-y-2">
                        {Object.keys(mRecord.marks_data || {}).filter(k => k.includes('_theory')).map(key => {
                          const subName = key.split('_')[0];
                          const theory = mRecord.marks_data[`${subName}_theory`] || 0;
                          const oral = mRecord.marks_data[`${subName}_oral`] || 0;
                          const total = theory + oral;
                          return (
                            <div key={subName} className="flex justify-between items-center text-[11px] md:text-xs border-b border-slate-700/50 pb-2">
                              <span className="text-slate-400 font-medium">{subName}</span>
                              <span className="font-bold text-slate-100 bg-slate-800 px-2.5 py-1 rounded-lg">Score: {total}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 border border-dashed border-slate-700/50 rounded-2xl text-slate-500">
                  <File size={28} className="mx-auto mb-2 opacity-30"/>
                  <p className="text-[11px] md:text-xs font-semibold">No results published yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==============================================================
  // ADMIN & TEACHER SHARED PORTAL VIEW
  // ==============================================================
  const activeStudentsList = students.filter(isStudentActive);
  const totalCollectedRevenue = allErpTransactions.reduce((acc, curr) => acc + getPaidAmount(curr), 0);
  
  const generatePendingDuesArray = () => {
    let pendingList = [];
    activeStudentsList.forEach(st => {
      const config = allClassConfigs[st.student_class]; 
      if (!config) return;
      const currentMonth = new Date().getMonth() + 1; 
      const activeMonths = Math.max(1, (currentMonth - (config.start_month || 1)) + 1);
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

  const navItems = teacherSession ? [
    { id: 'dashboard', label: 'Overview & Notices', icon: LayoutDashboard },
    { id: 'students', label: 'Students Mgmt.', icon: Users },
    { id: 'attendance', label: 'Daily Attendance', icon: CalendarCheck },
    { id: 'idcard', label: 'PVC ID Card Generator', icon: CreditCard },
  ] : [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'students', label: 'Students Mgmt.', icon: Users },
    { id: 'attendance', label: 'Daily Attendance', icon: CalendarCheck },
    { id: 'staff', label: 'Staff & Teachers', icon: Briefcase },
    { id: 'class_mgmt', label: 'Class Config', icon: Settings },
    { id: 'erp', label: 'ERP Billing & Fees', icon: DollarSign },
    { id: 'idcard', label: 'PVC ID Card Generator', icon: CreditCard },
    { id: 'profile', label: 'School Profile', icon: Building },
  ];

  const currentAttendanceTargetList = attendanceMode === 'students' ? students.filter(s => isSameClass(s.student_class, attendanceClass) && isStudentActive(s)) : staffList.filter(s => !s.status || s.status.trim().toLowerCase() === 'active');
  const presentCount = Object.values(attendanceRecords).filter(v => v === 'Present').length;
  const absentCount = Object.values(attendanceRecords).filter(v => v === 'Absent').length;
  const lateCount = Object.values(attendanceRecords).filter(v => v === 'Late').length;
  const leaveCount = Object.values(attendanceRecords).filter(v => v === 'Leave').length;
  const attendanceRate = currentAttendanceTargetList.length > 0 ? Math.round(((presentCount + lateCount) / currentAttendanceTargetList.length) * 100) : 0;

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'light-mode' : 'bg-slate-950 animated-mesh-bg'} text-slate-100 font-sans relative overflow-x-hidden flex flex-col md:flex-row`}>
      {sharedGlobalStyle}

      {/* ব্যাকগ্রাউন্ড অরোরা গ্লো */}
      <div className="absolute -top-24 -left-24 w-[420px] h-[420px] bg-gradient-to-tr from-cyan-500/20 to-blue-600/25 rounded-full blur-3xl pointer-events-none orb-float-anim-1"></div>
      <div className="absolute top-1/3 -right-28 w-[450px] h-[450px] bg-gradient-to-bl from-purple-600/25 via-pink-600/20 to-indigo-600/20 rounded-full blur-3xl pointer-events-none orb-float-anim-2"></div>

      {toast.show && (
        <div className={`fixed bottom-6 right-6 z-[100] px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2.5 font-bold text-xs md:text-sm transform transition-all animate-bounce ${toast.type === 'error' ? 'bg-rose-600 text-white shadow-rose-600/40' : 'bg-emerald-600 text-white shadow-emerald-600/40'}`}>
          {toast.type === 'error' ? <AlertCircle size={18}/> : <CheckCircle size={18}/>} {toast.message}
        </div>
      )}

      {/* ADMISSION MODAL */}
      {isAdmissionModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[80] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900/95 border border-white/10 p-5 md:p-8 rounded-3xl w-full max-w-4xl shadow-2xl relative my-6">
            <button onClick={resetStudentForm} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 p-2 rounded-xl transition"><X size={18}/></button>
            <h3 className="text-lg md:text-xl font-bold flex items-center gap-2 text-blue-500 mb-5"><Plus size={20}/> {isEditingStudent ? 'Update Profile' : 'New Admission'}</h3>
            <form onSubmit={handleSaveStudent} className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2"><BookOpen size={14}/> Select Class *</label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {classList.map(cls => (
                    <button type="button" key={cls} onClick={() => handleClassChangeInForm({target: {value: cls}})} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${formData.studentClass === cls ? 'btn-glow-blue bg-blue-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-700/60'}`}>{cls}</button>
                  ))}
                  <button type="button" onClick={() => handleClassChangeInForm({target: {value: 'CUSTOM'}})} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${isAddingCustomClass ? 'btn-glow-amber bg-amber-600 text-white' : 'bg-slate-950 text-amber-500 border border-slate-700/60'}`}>+ Custom</button>
                </div>
                {isAddingCustomClass && (
                  <div className="flex gap-2 mt-2">
                    <input type="text" placeholder="Custom Class Name" value={customClassInput} onChange={(e) => setCustomClassInput(e.target.value)} className="bg-slate-950 border border-slate-700 px-3 py-2.5 rounded-xl text-white flex-1 text-xs outline-none focus:border-blue-500" />
                    <button type="button" onClick={handleAddCustomClass} className="btn-glow-amber bg-amber-600 px-4 py-2 rounded-xl text-xs font-bold text-white">Save</button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 text-xs">
                <div><label className="text-slate-400 mb-1 block font-semibold">Roll Number</label><input type="text" value={`#${formData.rollNo || getNextRollForClass(formData.studentClass)}`} disabled className="w-full bg-slate-950/60 border border-slate-700/60 px-3.5 py-2.5 rounded-xl text-blue-500 font-bold" /></div>
                <div><label className="text-slate-400 mb-1 block font-semibold">Student Name *</label><input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700/80 px-3.5 py-2.5 rounded-xl text-slate-100 outline-none focus:border-blue-500 font-semibold" required /></div>
                <div><label className="text-slate-400 mb-1 block font-semibold">Father's Name</label><input type="text" name="fatherName" value={formData.fatherName} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700/80 px-3.5 py-2.5 rounded-xl text-slate-100 outline-none focus:border-blue-500" /></div>
                <div><label className="text-slate-400 mb-1 block font-semibold">Mother's Name</label><input type="text" name="motherName" value={formData.motherName} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700/80 px-3.5 py-2.5 rounded-xl text-slate-100 outline-none focus:border-blue-500" /></div>
                <div><label className="text-slate-400 mb-1 block font-semibold">Date of Birth *</label><input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700/80 px-3.5 py-2.5 rounded-xl text-slate-100 outline-none focus:border-blue-500" required /></div>
                <div><label className="text-slate-400 mb-1 block font-semibold">Mobile No</label><input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700/80 px-3.5 py-2.5 rounded-xl text-slate-100 outline-none focus:border-blue-500" /></div>
                <div><label className="text-slate-400 mb-1 block font-semibold">National ID / Aadhar</label><input type="text" name="aadharNo" value={formData.aadharNo} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700/80 px-3.5 py-2.5 rounded-xl text-slate-100 outline-none focus:border-blue-500" /></div>
                <div><label className="text-slate-400 mb-1 block font-semibold">Religion</label><input type="text" name="religion" value={formData.religion} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700/80 px-3.5 py-2.5 rounded-xl text-slate-100 outline-none focus:border-blue-500" /></div>
                <div><label className="text-slate-400 mb-1 block font-semibold">Blood Group</label><select name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700/80 px-3.5 py-2.5 rounded-xl text-slate-100 outline-none focus:border-blue-500"><option value="">Select...</option><option value="A+">A+</option><option value="A-">A-</option><option value="O+">O+</option><option value="B+">B+</option></select></div>
                <div className="md:col-span-3"><label className="text-slate-400 mb-1 block font-semibold">Address</label><input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700/80 px-3.5 py-2.5 rounded-xl text-slate-100 outline-none focus:border-blue-500" /></div>
              </div>
              <button type="submit" disabled={isProcessing} className="btn-glow-blue w-full bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 rounded-xl font-bold text-white transition flex justify-center items-center gap-2">
                {isProcessing ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} Submit Admission
              </button>
            </form>
          </div>
        </div>
      )}

      {/* STAFF MODAL */}
      {!teacherSession && isStaffModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[80] flex items-center justify-center p-4">
          <div className="bg-slate-900/95 border border-white/10 p-5 md:p-7 rounded-3xl max-w-md w-full shadow-2xl relative">
            <button onClick={() => setIsStaffModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 p-2 rounded-xl transition"><X size={16} /></button>
            <h3 className="text-base md:text-lg font-bold text-purple-500 mb-2 flex items-center gap-2"><Briefcase size={18}/> {staffData.id ? 'Edit Staff Profile' : 'Add Teacher / Staff'}</h3>
            <form onSubmit={handleSaveStaff} className="space-y-3.5 text-xs mt-3">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Full Name *</label>
                <input type="text" value={staffData.name} onChange={e => setStaffData({...staffData, name: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-slate-100 outline-none focus:border-purple-500 font-bold" required/>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Role *</label>
                  <select value={staffData.role} onChange={e => setStaffData({...staffData, role: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-slate-100 outline-none focus:border-purple-500">
                    <option value="Teacher">Teacher</option>
                    <option value="Senior Teacher">Senior Teacher</option>
                    <option value="Accountant">Accountant</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Salary (₹)</label>
                  <input type="number" value={staffData.salary} onChange={e => setStaffData({...staffData, salary: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-slate-100 outline-none focus:border-purple-500"/>
                </div>
              </div>
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Mobile (Login Phone) *</label>
                <input type="text" value={staffData.phone} onChange={e => setStaffData({...staffData, phone: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-slate-100 outline-none focus:border-purple-500 font-mono" required/>
              </div>
              <div>
                <label className="text-slate-400 block mb-1 font-semibold flex items-center gap-1"><Lock size={12} className="text-amber-500"/> Password *</label>
                <input type="text" value={staffData.password} onChange={e => setStaffData({...staffData, password: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-amber-500 font-bold outline-none focus:border-amber-500 font-mono" required/>
              </div>
              <button type="submit" disabled={isProcessing} className="btn-glow-purple w-full bg-gradient-to-r from-purple-600 to-fuchsia-600 py-3 rounded-xl font-bold text-white transition flex justify-center items-center gap-2 mt-2">
                {isProcessing ? <Loader2 className="animate-spin" size={14}/> : <Save size={14}/>} Save Staff
              </button>
            </form>
          </div>
        </div>
      )}

      {/* NOTICE MODAL */}
      {isNoticeModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[80] flex items-center justify-center p-4">
          <div className="bg-slate-900/95 border border-white/10 p-5 md:p-7 rounded-3xl max-w-lg w-full shadow-2xl relative">
            <button onClick={() => setIsNoticeModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 p-2 rounded-xl transition"><X size={16} /></button>
            <h3 className="text-base md:text-lg font-bold text-amber-500 mb-2 flex items-center gap-2"><Megaphone size={18}/> Publish Notice</h3>
            <form onSubmit={handleSaveNotice} className="space-y-3 text-xs mt-2">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Title *</label>
                <input type="text" value={noticeFormData.title} onChange={e => setNoticeFormData({...noticeFormData, title: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-slate-100 font-bold outline-none focus:border-amber-500" placeholder="Notice title" required/>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Audience</label>
                  <select value={noticeFormData.target_class} onChange={e => setNoticeFormData({...noticeFormData, target_class: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-slate-100 outline-none focus:border-amber-500">
                    <option value="All">All Classes</option>
                    {classList.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Date</label>
                  <input type="date" value={noticeFormData.publish_date} onChange={e => setNoticeFormData({...noticeFormData, publish_date: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-slate-100 outline-none focus:border-amber-500"/>
                </div>
              </div>
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Content *</label>
                <textarea rows={4} value={noticeFormData.content} onChange={e => setNoticeFormData({...noticeFormData, content: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-slate-100 outline-none focus:border-amber-500 resize-none" placeholder="Write notice details..." required/>
              </div>
              <button type="submit" disabled={isProcessing} className="btn-glow-amber w-full bg-gradient-to-r from-amber-600 to-orange-600 py-3 rounded-xl font-bold text-white transition flex justify-center items-center gap-2">
                {isProcessing ? <Loader2 className="animate-spin" size={14}/> : <Megaphone size={14}/>} Publish
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MOBILE BACKDROP OVERLAY */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[65] md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* SIDEBAR NAVIGATION (Mobile Off-canvas Drawer & Desktop Sidebar) */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-[70] w-[275px] md:w-80 bg-slate-900/95 md:bg-slate-900/80 backdrop-blur-2xl border-r border-white/10 p-5 md:p-6 flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        md:static md:translate-x-0
      `}>
        <div className="flex-1 overflow-y-auto scrollbar-hide pr-1">
          <div className="flex justify-between items-center md:hidden mb-4 pb-2 border-b border-slate-700/50">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Navigation Menu</span>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"><X size={18}/></button>
          </div>

          <div className="p-4 rounded-2xl md:rounded-3xl bg-slate-950/70 border border-white/10 mb-5 shadow-inner">
            <div className="flex items-center gap-3 mb-2.5">
              {school.logo_url ? (
                <img src={school.logo_url} alt="Logo" className="w-10 h-10 md:w-12 md:h-12 rounded-xl object-cover bg-white p-1 shrink-0" />
              ) : (
                <div className="bg-blue-600 p-2 rounded-xl text-white shrink-0"><School size={22} /></div>
              )}
              <div className="overflow-hidden">
                <h1 className="text-base md:text-lg font-black tracking-tight school-brand-title truncate leading-tight">
                  {school.school_name || 'EduAdmin'}
                </h1>
                <p className="text-[10px] md:text-[11px] text-indigo-400 font-bold uppercase tracking-wider mt-0.5">
                  {teacherSession ? teacherSession.name : 'Management'}
                </p>
              </div>
            </div>
          </div>
          
          <nav className="space-y-1 md:space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button 
                  key={item.id} 
                  onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }} 
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold transition-all duration-200 ${ activeTab === item.id ? 'btn-glow-blue bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'}`}
                >
                  <Icon size={17} />{item.label}
                </button>
              );
            })}
            <button onClick={() => router.push('/mark-entry')} className="w-full flex items-center gap-3 px-3.5 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition mt-2">
              <FileSpreadsheet size={17} />Mark Entry & Report
            </button>
          </nav>
        </div>

        <div className="pt-3 border-t border-slate-700/50 space-y-1.5 mt-auto">
          {!teacherSession && (
            <button onClick={() => router.push('/change-password')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800/60 transition"><Key size={14} /> Password</button>
          )}
          <button onClick={handleLogout} className="btn-glow-rose w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 transition"><LogOut size={14} /> Logout</button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 md:p-6 lg:p-10 w-full relative z-10 overflow-x-hidden">
        
        {/* TOP BANNER WITH THEME SWITCH & MOBILE HAMBURGER */}
        <div className="animate-card-view bg-slate-900/80 border border-white/10 p-4 md:p-6 rounded-2xl md:rounded-3xl mb-5 md:mb-7 shadow-lg backdrop-blur-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3.5">
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-2.5">
              {/* মোবাইল ড্রয়ার বাটন */}
              <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 hover:bg-slate-800 transition" aria-label="Open Menu">
                <Menu size={20}/>
              </button>
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-black school-brand-title tracking-tight line-clamp-1">
                  {school.school_name || 'Smart School System'}
                </h1>
                <p className="text-[10px] md:text-xs text-slate-400 line-clamp-1">{school.address || 'Smart School Dashboard'}</p>
              </div>
            </div>

            {/* মোবাইলের জন্য থিম সুইচ বাটন */}
            <div className="md:hidden">
              <button onClick={toggleTheme} className="p-2 rounded-xl bg-slate-950 border border-slate-700 text-amber-500 shadow-sm" title="Toggle Light/Dark Theme">
                {theme === 'dark' ? <Sun size={18}/> : <Moon size={18}/>}
              </button>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-500 hover:bg-slate-800 transition shadow-sm flex items-center gap-1.5 text-xs font-bold" title="Toggle Light/Dark Theme">
              {theme === 'dark' ? <><Sun size={16}/> Light</> : <><Moon size={16}/> Dark</>}
            </button>

            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-400 text-[11px] font-mono font-bold">
              <Calendar size={13} />
              <span>{currentDateTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              <span className="text-slate-500">|</span>
              <Clock size={13} className="text-amber-500" />
              <span className="text-amber-500 font-bold">{currentDateTime.toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-5 md:space-y-7 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-700/50 pb-3.5 gap-3">
               <div>
                 <h2 className="text-xl md:text-2xl font-black text-slate-100">Live Institution Overview</h2>
                 <p className="text-[11px] md:text-xs text-slate-400 mt-0.5">Welcome back to your administration portal.</p>
               </div>
               <div className="flex gap-2 w-full sm:w-auto">
                 <button onClick={() => setIsNoticeModalOpen(true)} className="btn-glow-amber flex-1 sm:flex-none bg-gradient-to-r from-amber-600 to-orange-600 px-3.5 py-2 md:py-2.5 rounded-xl font-bold text-white flex justify-center items-center gap-1.5 text-xs">
                   <Megaphone size={14}/> Notice
                 </button>
                 <button onClick={() => setIsAdmissionModalOpen(true)} className="btn-glow-blue flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-2 md:py-2.5 rounded-xl font-bold text-white flex justify-center items-center gap-1.5 text-xs">
                   <Plus size={14}/> Admission
                 </button>
               </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 md:gap-5">
              <div className="animate-card-view card-lift bg-slate-900/70 border border-white/10 p-5 rounded-2xl md:rounded-3xl flex items-center gap-4 shadow-sm">
                <div className="p-3.5 bg-blue-500/15 text-blue-500 rounded-2xl"><Users size={24} /></div>
                <div>
                  <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider">Active Students</p>
                  <h3 className="text-2xl md:text-3xl font-black text-slate-100 mt-0.5">
                    <AnimatedNumber value={activeStudentsList.length} />
                  </h3>
                </div>
              </div>

              <div className="animate-card-view card-lift bg-slate-900/70 border border-white/10 p-5 rounded-2xl md:rounded-3xl flex items-center gap-4 shadow-sm">
                <div className="p-3.5 bg-purple-500/15 text-purple-500 rounded-2xl"><Briefcase size={24} /></div>
                <div>
                  <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider">{teacherSession ? 'My Role' : 'Total Staff'}</p>
                  <h3 className="text-xl md:text-2xl font-black text-purple-500 mt-0.5">
                    {teacherSession ? teacherSession.role : <AnimatedNumber value={staffList.length} />}
                  </h3>
                </div>
              </div>

              <div className="animate-card-view card-lift bg-slate-900/70 border border-white/10 p-5 rounded-2xl md:rounded-3xl flex items-center gap-4 shadow-sm sm:col-span-2 lg:col-span-1">
                <div className="p-3.5 bg-amber-500/15 text-amber-500 rounded-2xl"><Megaphone size={24} /></div>
                <div>
                  <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider">Published Notices</p>
                  <h3 className="text-2xl md:text-3xl font-black text-amber-500 mt-0.5">
                    <AnimatedNumber value={notices.length} />
                  </h3>
                </div>
              </div>
            </div>

            {/* NOTICES SECTION */}
            <div className="animate-card-view bg-slate-900/70 border border-white/10 p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-md space-y-4">
              <div className="flex justify-between items-center border-b border-slate-700/50 pb-3">
                <h3 className="text-sm md:text-base font-bold text-amber-500 flex items-center gap-2"><Megaphone size={16}/> Notice Board</h3>
                <button onClick={() => setIsNoticeModalOpen(true)} className="text-[11px] font-bold text-amber-500 hover:underline">+ New Notice</button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {notices.length > 0 ? notices.map((n) => (
                  <div key={n.id} className="card-lift bg-slate-950/80 p-4 rounded-2xl border border-white/10 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-slate-100 text-sm leading-snug">{n.title}</h4>
                        <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md text-[9px] font-bold whitespace-nowrap">{n.publish_date}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2 leading-relaxed whitespace-pre-line line-clamp-3">{n.content}</p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-700/40">
                      <span className="text-[10px] text-slate-400">Class: <strong className="text-cyan-500">{n.target_class || 'All'}</strong></span>
                      <div className="flex gap-2">
                        <button onClick={() => setSelectedNoticeToPrint(n)} className="bg-blue-600/15 text-blue-500 hover:bg-blue-600 hover:text-white px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1">
                          <Printer size={12}/> PDF
                        </button>
                        {!teacherSession && (
                          <button onClick={() => handleDeleteNotice(n.id)} className="bg-rose-500/15 text-rose-500 hover:bg-rose-600 hover:text-white p-1 rounded-lg transition">
                            <Trash2 size={13}/>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-1 lg:col-span-2 text-center p-6 text-slate-500 border border-dashed border-slate-700/60 rounded-2xl">
                    <p className="text-xs">কোনো নোটিশ নেই।</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==============================================================
            ATTENDANCE SYSTEM
            ============================================================== */}
        {activeTab === 'attendance' && (
          <div className="space-y-4 md:space-y-6 animate-fade-in w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-700/50 pb-3 gap-3">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-slate-100 flex items-center gap-2">
                  <CalendarCheck size={22} className="text-emerald-500"/> Attendance Control
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">উপস্থিতি রেজিস্টার ও লাইভ ট্র্যাকিং।</p>
              </div>

              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <div className="bg-slate-900/90 border border-white/10 p-1 rounded-xl flex gap-1 flex-1 md:flex-none">
                  <button onClick={() => setAttendanceMode('students')} className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition ${attendanceMode === 'students' ? 'btn-glow-emerald bg-emerald-600 text-white' : 'text-slate-400'}`}>Students</button>
                  <button onClick={() => setAttendanceMode('staff')} className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition ${attendanceMode === 'staff' ? 'btn-glow-purple bg-purple-600 text-white' : 'text-slate-400'}`}>Staff</button>
                </div>
                <div className="bg-slate-900/90 border border-white/10 p-1 rounded-xl flex gap-1 flex-1 md:flex-none">
                  <button onClick={() => setAttendanceView('daily')} className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition ${attendanceView === 'daily' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Daily</button>
                  <button onClick={() => setAttendanceView('monthly')} className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition ${attendanceView === 'monthly' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Monthly</button>
                </div>
              </div>
            </div>

            {/* DAY TYPE SELECTOR */}
            <div className="animate-card-view bg-slate-900/70 border border-white/10 p-4 rounded-2xl md:rounded-3xl flex flex-col xl:flex-row justify-between items-start xl:items-center gap-3">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Day Schedule Type:</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Selected: <span className="font-bold text-slate-200">{attendanceDate}</span> ({dayType})</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full xl:w-auto">
                <button type="button" onClick={() => handleSelectDayType('Class Day')} className={`px-3 py-2 rounded-xl text-xs font-bold transition ${dayType === 'Class Day' ? 'btn-glow-emerald bg-emerald-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-700'}`}>Class Day</button>
                <button type="button" onClick={() => handleSelectDayType('Exam Day')} className={`px-3 py-2 rounded-xl text-xs font-bold transition ${dayType === 'Exam Day' ? 'btn-glow-amber bg-amber-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-700'}`}>Exam Day</button>
                <button type="button" onClick={() => handleSelectDayType('Class Off')} className={`px-3 py-2 rounded-xl text-xs font-bold transition ${dayType === 'Class Off' ? 'bg-orange-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-700'}`}>Class Off</button>
                <button type="button" onClick={() => handleSelectDayType('Holiday')} className={`px-3 py-2 rounded-xl text-xs font-bold transition ${dayType === 'Holiday' ? 'btn-glow-rose bg-rose-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-700'}`}>Holiday</button>
              </div>
            </div>

            {/* লাইভ কাউন্ট বার */}
            {attendanceView === 'daily' && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 md:gap-3.5">
                <div className="bg-slate-900/70 border border-white/10 p-3 rounded-2xl"><p className="text-[9px] text-slate-400 font-bold uppercase">Total</p><h4 className="text-xl font-black text-slate-100"><AnimatedNumber value={currentAttendanceTargetList.length} /></h4></div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-2xl"><p className="text-[9px] text-emerald-500 font-bold uppercase">Present</p><h4 className="text-xl font-black text-emerald-500"><AnimatedNumber value={presentCount} /></h4></div>
                <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-2xl"><p className="text-[9px] text-rose-500 font-bold uppercase">Absent</p><h4 className="text-xl font-black text-rose-500"><AnimatedNumber value={absentCount} /></h4></div>
                <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl"><p className="text-[9px] text-amber-500 font-bold uppercase">Late</p><h4 className="text-xl font-black text-amber-500"><AnimatedNumber value={lateCount} /></h4></div>
                <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-2xl"><p className="text-[9px] text-blue-500 font-bold uppercase">Leave</p><h4 className="text-xl font-black text-blue-500"><AnimatedNumber value={leaveCount} /></h4></div>
                <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-2xl"><p className="text-[9px] text-cyan-500 font-bold uppercase">Rate</p><h4 className="text-xl font-black text-cyan-500"><AnimatedNumber value={attendanceRate} suffix="%" /></h4></div>
              </div>
            )}

            {/* কন্ট্রোল বার */}
            <div className="animate-card-view bg-slate-900/70 border border-white/10 p-4 md:p-5 rounded-2xl md:rounded-3xl flex flex-col lg:flex-row gap-3 justify-between items-stretch lg:items-center">
              <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                {attendanceMode === 'students' && (
                  <div>
                    <label className="text-[9px] text-slate-400 block mb-1 font-bold uppercase">Class</label>
                    <select value={attendanceClass} onChange={e => setAttendanceClass(e.target.value)} className="w-full sm:w-auto bg-slate-950 border border-slate-700 p-2 rounded-xl text-xs font-bold outline-none">
                      {activeClasses.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label className="text-[9px] text-slate-400 block mb-1 font-bold uppercase">{attendanceView === 'daily' ? 'Date' : 'Month'}</label>
                  {attendanceView === 'daily' ? (
                    <input type="date" value={attendanceDate} onChange={e => setAttendanceDate(e.target.value)} className="w-full sm:w-auto bg-slate-950 border border-slate-700 p-2 rounded-xl text-xs font-bold outline-none"/>
                  ) : (
                    <input type="month" value={attendanceMonth} onChange={e => setAttendanceMonth(e.target.value)} className="w-full sm:w-auto bg-slate-950 border border-slate-700 p-2 rounded-xl text-xs font-bold outline-none"/>
                  )}
                </div>
              </div>

              {attendanceView === 'daily' && (
                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                  <form onSubmit={handleBarcodeSubmit} className="relative flex-1 sm:w-52">
                    <Barcode className="absolute left-3 top-2.5 text-cyan-500" size={16} />
                    <input ref={barcodeInputRef} type="text" placeholder="Scan ID / Roll..." value={barcodeScanInput} onChange={e => setBarcodeScanInput(e.target.value)} className="w-full bg-slate-950 border border-slate-700 pl-8 pr-3 py-2 rounded-xl text-xs font-mono font-bold"/>
                  </form>
                  <button type="button" onClick={handleMarkAllPresent} disabled={isProcessing} className="btn-glow-emerald bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 whitespace-nowrap">
                    {isProcessing ? <Loader2 className="animate-spin" size={14}/> : <CheckCheck size={14}/>} Mark All Present
                  </button>
                </div>
              )}
            </div>

            {/* DAILY TABLE */}
            {attendanceView === 'daily' && (
              <div className="animate-card-view bg-slate-900/70 border border-white/10 rounded-2xl md:rounded-3xl overflow-hidden shadow-md">
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[650px]">
                    <thead className="bg-slate-800/60 text-slate-400 text-[10px] md:text-xs uppercase border-b border-slate-700">
                      <tr><th className="p-3">Name & Info</th><th className="p-3">Phone</th><th className="p-3 text-center">Status</th><th className="p-3 text-right">Alert</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-xs">
                      {currentAttendanceTargetList.map(person => {
                        const curStatus = attendanceRecords[person.id] || 'Pending';
                        const waLink = attendanceMode === 'students' ? getWhatsAppLink(person) : null;
                        return (
                          <tr key={person.id} className="hover:bg-slate-800/30">
                            <td className="p-3">
                              <p className="font-bold text-slate-100">{person.name}</p>
                              <p className="text-[10px] text-slate-400">{attendanceMode === 'students' ? `Roll: #${person.roll_no} | ${person.student_class}` : person.role}</p>
                            </td>
                            <td className="p-3 font-mono">{person.phone || 'N/A'}</td>
                            <td className="p-3 text-center">
                              <div className="inline-flex bg-slate-950 p-1 rounded-xl border border-slate-700 gap-1">
                                <button onClick={() => handleSaveAttendance(person.id, 'Present', attendanceMode === 'staff')} className={`px-2.5 py-1 rounded-lg font-bold ${curStatus === 'Present' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>P</button>
                                <button onClick={() => handleSaveAttendance(person.id, 'Absent', attendanceMode === 'staff')} className={`px-2.5 py-1 rounded-lg font-bold ${curStatus === 'Absent' ? 'bg-rose-600 text-white' : 'text-slate-400'}`}>A</button>
                                <button onClick={() => handleSaveAttendance(person.id, 'Late', attendanceMode === 'staff')} className={`px-2.5 py-1 rounded-lg font-bold ${curStatus === 'Late' ? 'bg-amber-600 text-white' : 'text-slate-400'}`}>L</button>
                                <button onClick={() => handleSaveAttendance(person.id, 'Leave', attendanceMode === 'staff')} className={`px-2.5 py-1 rounded-lg font-bold ${curStatus === 'Leave' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Lv</button>
                              </div>
                            </td>
                            <td className="p-3 text-right">
                              {curStatus === 'Absent' && waLink ? (
                                <a href={waLink} target="_blank" rel="noopener noreferrer" className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 px-2.5 py-1 rounded-lg text-[10px] font-bold inline-flex items-center gap-1">WhatsApp</a>
                              ) : <span className="text-[10px] text-slate-500">-</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STUDENTS TAB */}
        {activeTab === 'students' && (
          <div className="space-y-4 md:space-y-6 animate-fade-in w-full">
            <h2 className="text-xl md:text-2xl font-bold border-b border-slate-700/50 pb-3 text-slate-100">Students Directory</h2>
            
            <div className="flex bg-slate-950/80 border border-slate-700 p-1 rounded-xl w-fit overflow-x-auto">
              <button onClick={() => setStudentStatusTab('Active')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${studentStatusTab === 'Active' ? 'btn-glow-blue bg-blue-600 text-white' : 'text-slate-400'}`}>Active</button>
              <button onClick={() => setStudentStatusTab('Passout')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${studentStatusTab === 'Passout' ? 'btn-glow-emerald bg-emerald-600 text-white' : 'text-slate-400'}`}>Alumni</button>
              <button onClick={() => setStudentStatusTab('Transferred')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${studentStatusTab === 'Transferred' ? 'btn-glow-rose bg-rose-600 text-white' : 'text-slate-400'}`}>Transferred</button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
                <input type="text" placeholder="Search by name, roll..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-950 border border-slate-700 pl-8 pr-3 py-2 rounded-xl text-xs text-slate-100 outline-none" />
              </div>
              <div className="flex gap-2">
                <button onClick={handleExportCSV} className="bg-slate-800 hover:bg-slate-700 text-emerald-500 px-3 py-2 rounded-xl text-xs font-bold border border-slate-700">Export</button>
                <select onChange={(e) => setSelectedClassFilter(e.target.value)} value={selectedClassFilter} className="bg-slate-950 text-slate-100 border border-slate-700 px-3 py-2 rounded-xl text-xs font-bold">
                  <option value="All">All Classes</option>
                  {activeClasses.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                </select>
              </div>
            </div>

            <div className="animate-card-view bg-slate-900/70 border border-white/10 rounded-2xl md:rounded-3xl overflow-x-auto shadow-md">
              <table className="w-full text-left min-w-[600px] text-xs">
                <thead className="bg-slate-800/60 text-slate-400 uppercase border-b border-slate-700">
                  <tr><th className="p-3">Roll & Name</th><th className="p-3">Class</th><th className="p-3">Phone</th><th className="p-3 text-center">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {getFilteredStudents().map((st) => (
                    <tr key={st.id} className="hover:bg-slate-800/30">
                      <td className="p-3"><p className="font-bold text-slate-100">{st.name}</p><p className="text-[10px] text-slate-400">Roll: #{st.roll_no} | ID: {st.unique_id}</p></td>
                      <td className="p-3"><span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] font-bold">{st.student_class}</span></td>
                      <td className="p-3 font-mono">{st.phone || '-'}</td>
                      <td className="p-3 flex gap-2 justify-center">
                        <button onClick={() => handleEditClick(st)} className="text-blue-500 p-1.5 hover:bg-blue-500/10 rounded-lg"><Edit size={14}/></button>
                        {!teacherSession && <button onClick={() => handleDeleteStudent(st.id, st.student_class)} className="text-rose-500 p-1.5 hover:bg-rose-500/10 rounded-lg"><Trash2 size={14}/></button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* STAFF TAB */}
        {!teacherSession && activeTab === 'staff' && (
          <div className="space-y-4 md:space-y-6 animate-fade-in w-full">
            <div className="flex justify-between items-center border-b border-slate-700/50 pb-3">
              <h2 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2"><Briefcase size={20} className="text-purple-500"/> Staff Management</h2>
              <button onClick={() => { setStaffData({ id: null, name: '', role: 'Teacher', phone: '', password: '', salary: 0, status: 'Active' }); setIsStaffModalOpen(true); }} className="btn-glow-purple bg-purple-600 px-3.5 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5">
                <Plus size={14}/> Add Staff
              </button>
            </div>
            
            <div className="animate-card-view bg-slate-900/70 border border-white/10 rounded-2xl md:rounded-3xl overflow-x-auto shadow-md">
              <table className="w-full text-left min-w-[550px] text-xs">
                <thead className="bg-slate-800/60 text-slate-400 uppercase border-b border-slate-700">
                  <tr><th className="p-3">Staff</th><th className="p-3">Mobile</th><th className="p-3">Password</th><th className="p-3">Salary</th><th className="p-3 text-center">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {staffList.map((stf) => (
                    <tr key={stf.id} className="hover:bg-slate-800/30">
                      <td className="p-3"><p className="font-bold text-slate-100">{stf.name}</p><p className="text-[10px] text-purple-500 font-bold">{stf.role}</p></td>
                      <td className="p-3 font-mono">{stf.phone}</td>
                      <td className="p-3 font-mono text-amber-500 font-bold">{stf.password}</td>
                      <td className="p-3 font-black text-emerald-500">₹{stf.salary}</td>
                      <td className="p-3 flex gap-2 justify-center">
                        <button onClick={() => { setStaffData(stf); setIsStaffModalOpen(true); }} className="text-blue-500 p-1.5"><Edit size={14}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ERP BILLING */}
        {!teacherSession && activeTab === 'erp' && (
          <div className="space-y-4 md:space-y-6 animate-fade-in w-full">
            <h2 className="text-xl md:text-2xl font-bold border-b border-slate-700/50 pb-3 text-slate-100">Fee Collection & Revenue</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="animate-card-view card-lift bg-slate-900/70 border border-white/10 p-5 rounded-2xl md:rounded-3xl flex items-center gap-3.5">
                <div className="p-3 bg-emerald-500/15 text-emerald-500 rounded-xl"><DollarSign size={24} /></div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Total Collected</p>
                  <h3 className="text-2xl font-black text-emerald-500 mt-0.5">
                    <AnimatedNumber value={totalCollectedRevenue} prefix="₹" />
                  </h3>
                </div>
              </div>

              <div className="animate-card-view card-lift bg-slate-900/70 border border-white/10 p-5 rounded-2xl md:rounded-3xl flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 bg-rose-500/15 text-rose-500 rounded-xl"><AlertCircle size={24} /></div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Pending Arrears</p>
                    <h3 className="text-2xl font-black text-rose-500 mt-0.5">
                      <AnimatedNumber value={totalPendingDue} prefix="₹" />
                    </h3>
                  </div>
                </div>
                <button onClick={() => setShowOnlyPendingList(!showOnlyPendingList)} className="text-xs font-bold text-rose-500 hover:underline">
                  {showOnlyPendingList ? 'Back' : 'Defaulters'}
                </button>
              </div>
            </div>

            {!showOnlyPendingList && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-4 space-y-4">
                  <div className="animate-card-view bg-slate-900/70 border border-white/10 p-5 rounded-2xl md:rounded-3xl space-y-3">
                    <label className="text-xs text-slate-400 block font-bold uppercase">Select Class</label>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                      {activeClasses.map(c => (
                        <button key={c} onClick={() => { setErpSelectedClass(c); setErpStudent(null); }} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${erpSelectedClass === c ? 'bg-blue-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-700'}`}>{c}</button>
                      ))}
                    </div>

                    <label className="text-xs text-slate-400 block font-bold uppercase pt-2">Select Student</label>
                    <select disabled={!erpSelectedClass} value={erpStudent?.id || ''} onChange={(e) => handleSelectErpStudent(students.find(s => s.id === e.target.value))} className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-xs font-bold text-slate-100 outline-none">
                      <option value="">Select Student...</option>
                      {students.filter(s => isSameClass(s.student_class, erpSelectedClass) && isStudentActive(s)).map(s => (
                        <option key={s.id} value={s.id}>{s.name} (Roll: #{s.roll_no})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {erpStudent && erpClassConfig && (
                  <div className="lg:col-span-8 space-y-4">
                    <div className="animate-card-view bg-slate-900/70 border border-white/10 p-5 rounded-2xl md:rounded-3xl space-y-4">
                      <h3 className="text-sm font-bold text-emerald-500">Collect Payment</h3>
                      <div className="flex flex-wrap gap-2">
                        {feeOptionsList.map(fee => (
                          <button type="button" key={fee} onClick={() => toggleFeeType(fee)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${erpSelectedFeeTypes.includes(fee) ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-950 text-slate-400 border-slate-700'}`}>{fee}</button>
                        ))}
                      </div>

                      <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-700 flex justify-between items-center">
                        <span className="text-xs text-slate-400 font-bold">Total Arrears (Due):</span>
                        <span className="text-lg font-black text-rose-500">₹{erpBaseAmount}</span>
                      </div>

                      <div>
                        <label className="text-xs text-emerald-500 block mb-1 font-bold">Amount Receiving (₹)</label>
                        <input type="number" value={erpPaidAmount} onChange={(e) => setErpPaidAmount(e.target.value)} className="w-full bg-slate-950 border border-emerald-500 p-3 rounded-xl text-emerald-500 font-black text-xl outline-none" />
                      </div>

                      <button onClick={handleCreateInvoice} disabled={isProcessing} className="btn-glow-emerald w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-bold text-xs">
                        {isProcessing ? <Loader2 className="animate-spin" size={16}/> : 'Generate Receipt'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* PVC ID CARD TAB */}
        {activeTab === 'idcard' && (
          <div className="space-y-4 md:space-y-6 animate-fade-in w-full">
            <h2 className="text-xl md:text-2xl font-bold border-b border-slate-700/50 pb-3 text-slate-100">PVC ID Card Generator</h2>
            <div className="animate-card-view bg-slate-900/70 border border-white/10 p-5 rounded-2xl md:rounded-3xl space-y-4">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {activeClasses.map(c => (
                  <button key={c} onClick={() => { setIdSelectedClass(c); setSelectedIdStudent(null); }} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${idSelectedClass === c ? 'bg-blue-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-700'}`}>{c}</button>
                ))}
              </div>
              <select disabled={!idSelectedClass} value={selectedIdStudent?.id || ''} onChange={(e) => setSelectedIdStudent(students.find(s => s.id === e.target.value))} className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-xs font-bold text-slate-100 outline-none">
                <option value="">Select Student...</option>
                {students.filter(s => isSameClass(s.student_class, idSelectedClass) && isStudentActive(s)).map(s => (
                  <option key={s.id} value={s.id}>{s.name} (Roll: #{s.roll_no})</option>
                ))}
              </select>

              {selectedIdStudent && (
                <div className="pt-4 flex flex-col sm:flex-row items-center gap-6">
                  <div className="pvc-card w-[204px] h-[323px] bg-slate-950 overflow-hidden relative flex flex-col text-white rounded-2xl border border-indigo-500/40 shadow-xl shrink-0 p-3">
                    <p className="text-[10px] font-bold text-center text-amber-400 uppercase truncate">{school.school_name || 'School Name'}</p>
                    <div className="flex justify-center my-3">
                      <img src={selectedIdStudent.photo_url || 'https://via.placeholder.com/150'} className="w-16 h-16 rounded-full object-cover border-2 border-indigo-400" />
                    </div>
                    <p className="text-center font-bold text-xs">{selectedIdStudent.name}</p>
                    <p className="text-center text-[10px] text-slate-400 mt-0.5">{selectedIdStudent.student_class} | Roll: #{selectedIdStudent.roll_no}</p>
                    <div className="mt-auto text-[9px] space-y-1 bg-slate-900/60 p-2 rounded-xl">
                      <p>ID: <span className="font-bold text-cyan-400">{selectedIdStudent.unique_id}</span></p>
                      <p>Phone: <span>{selectedIdStudent.phone || 'N/A'}</span></p>
                    </div>
                  </div>
                  <button onClick={() => setPrintIdCard(true)} className="btn-glow-blue bg-blue-600 text-white px-5 py-3 rounded-xl font-bold text-xs flex items-center gap-2">
                    <Printer size={16}/> Print Card (CR80)
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {!teacherSession && activeTab === 'profile' && (
          <div className="space-y-4 md:space-y-6 animate-fade-in w-full pb-8">
            <div className="flex justify-between items-center border-b border-slate-700/50 pb-3">
              <h2 className="text-xl md:text-2xl font-bold text-slate-100">School Profile</h2>
              <button onClick={() => setEditSchool(!editSchool)} className="bg-blue-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
                {editSchool ? <X size={14}/> : <Edit size={14}/>} {editSchool ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {editSchool ? (
              <form onSubmit={handleUpdateSchool} className="animate-card-view bg-slate-900/70 border border-white/10 p-5 rounded-2xl md:rounded-3xl space-y-4 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">School Name *</label>
                  <input type="text" value={school.school_name || ''} onChange={(e) => setSchool({ ...school, school_name: e.target.value })} className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-slate-100 font-bold" required />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Address</label>
                  <input type="text" value={school.address || ''} onChange={(e) => setSchool({ ...school, address: e.target.value })} className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-slate-100" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-slate-400 block mb-1 font-semibold">Phone</label><input type="text" value={school.phone || ''} onChange={(e) => setSchool({ ...school, phone: e.target.value })} className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-slate-100" /></div>
                  <div><label className="text-slate-400 block mb-1 font-semibold">Email</label><input type="email" value={school.email || ''} onChange={(e) => setSchool({ ...school, email: e.target.value })} className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-slate-100" /></div>
                </div>
                <button type="submit" disabled={isProcessing} className="btn-glow-emerald bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold">Save Settings</button>
              </form>
            ) : (
              <div className="animate-card-view bg-slate-900/70 border border-white/10 p-5 rounded-2xl md:rounded-3xl space-y-3">
                <h3 className="text-lg font-black text-slate-100">{school.school_name || 'School Name'}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1.5"><MapPin size={14} className="text-cyan-500"/> {school.address || 'Address not set'}</p>
                <p className="text-xs text-slate-400 flex items-center gap-1.5"><PhoneCall size={14} className="text-emerald-500"/> {school.phone || 'Phone not set'}</p>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
