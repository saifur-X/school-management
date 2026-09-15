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

  // Theme & Mobile UI State
  const [theme, setTheme] = useState('dark');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // লাইভ ক্লক ও রিয়েলটাইম তারিখ
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

  // Load Saved Theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('portal_theme');
    if (savedTheme) setTheme(savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('portal_theme', newTheme);
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

  // কেস-ইনসেনসিটিভ অ্যাক্টিভ স্টুডেন্ট হেল্পার
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

  // ADVANCED ATTENDANCE SYSTEM STATES & DAY TYPE
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
      console.log('Notice on day type loading:', err);
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
    showToast(`আজকের দিনটি "${type}" হিসেবে চিহ্নিত করা হয়েছে!`);
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
    if (activeList.length === 0) return showToast('উপস্থিতি মার্ক করার মতো কেউ নেই!', 'error');
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
    showToast('সকলকে ছুটি (Leave) হিসেবে মার্ক করা হয়েছে!');
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
      if (!error) showToast('Staff Member Updated Successfully!'); else showToast('Error: ' + error.message, 'error');
    } else {
      const { error } = await supabase.from('staff').insert([{ name: staffData.name, role: staffData.role, phone: staffData.phone, password: staffData.password, salary: Number(staffData.salary) || 0, status: 'Active' }]);
      if (!error) showToast('New Staff / Teacher Added Successfully!'); else showToast('Error: ' + error.message, 'error');
    }
    setIsStaffModalOpen(false); fetchStaff(); setIsProcessing(false);
  };

  const handleSaveNotice = async (e) => {
    e.preventDefault();
    if (!noticeFormData.title || !noticeFormData.content) return showToast('নোটিশের শিরোনাম ও বিস্তারিত আবশ্যক!', 'error');
    setIsProcessing(true);
    const { error } = await supabase.from('notices').insert([{ title: noticeFormData.title, content: noticeFormData.content, target_class: noticeFormData.target_class || 'All', publish_date: noticeFormData.publish_date || new Date().toISOString().split('T')[0] }]);
    if (!error) {
      showToast('নতুন নোটিশ সফলভাবে পাবলিশ হয়েছে!'); setIsNoticeModalOpen(false);
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

  const handleChangeStatus = async () => {
    if (!statusModalStudent) return; 
    setIsProcessing(true);
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
    showToast('ডাটা সফলভাবে এক্সপোর্ট হয়েছে!');
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
    if (!error) { showToast('পেমেন্ট সফলভাবে আপডেট হয়েছে!'); setEditingTx(null); await fetchData(); handleSelectErpStudent(erpStudent); }
    setIsProcessing(false);
  };

  const saveAgreedFeesToDB = async () => {
    if (!erpStudent) return;
    const { error } = await supabase.from('students').update({ agreed_monthly_fee: Number(agreedFees.monthly), agreed_admission_fee: Number(agreedFees.admission) }).eq('id', erpStudent.id);
    if (!error) { 
      showToast("এই স্টুডেন্টের নির্দিষ্ট ফিস প্রোফাইল সেভ হয়েছে!"); 
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
    if (availableForThisMonth >= feePerMonth) return { label: 'Paid', subText: `₹${feePerMonth}`, bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', badgeBg: 'bg-emerald-500/20' };
    if (availableForThisMonth > 0) return { label: 'Partial', subText: `Paid: ₹${availableForThisMonth}`, bg: 'bg-lime-500/10', text: 'text-lime-400', border: 'border-lime-500/40', badgeBg: 'bg-lime-500/20' };
    if (monthIndex <= currentMonth) return { label: 'Due', subText: `Due: ₹${feePerMonth}`, bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30', badgeBg: 'bg-rose-500/20' };
    return { label: 'Upcoming', bg: 'bg-slate-800/50', text: 'text-slate-300', border: 'border-slate-700', badgeBg: 'bg-slate-700' };
  };

  const handleLogout = async () => {
    if (studentSession) { localStorage.removeItem('student_session'); router.push('/login'); } 
    else if (teacherSession) { localStorage.removeItem('teacher_session'); router.push('/login'); } 
    else { await supabase.auth.signOut(); router.push('/login'); }
  };

  // =====================================
  // GLOBAL STYLE & THEME CSS OVERRIDES
  // =====================================
  const sharedGlobalStyle = (
    <style dangerouslySetInnerHTML={{ __html: `
      .scrollbar-hide::-webkit-scrollbar { display: none; }
      .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

      @keyframes dynamicMeshAnimation { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
      .animated-mesh-bg { background: linear-gradient(-45deg, #090e1a, #161233, #0b1f3a, #1d102e, #071929, #140d28) !important; background-size: 350% 350% !important; animation: dynamicMeshAnimation 16s ease infinite !important; }

      /* Light Theme Overrides */
      .light-mode { background-color: #f8fafc !important; color: #0f172a !important; }
      .light-mode .animated-mesh-bg { background: linear-gradient(-45deg, #f8fafc, #e2e8f0, #f1f5f9, #cbd5e1, #e2e8f0) !important; }
      .light-mode .bg-slate-900\\/80, .light-mode .bg-slate-900\\/70, .light-mode .bg-slate-950\\/70, .light-mode .bg-slate-950\\/80, .light-mode .bg-slate-900\\/90 {
        background-color: rgba(255, 255, 255, 0.9) !important; border-color: rgba(226, 232, 240, 1) !important; box-shadow: 0 10px 30px -10px rgba(0,0,0,0.1) !important;
      }
      .light-mode .bg-slate-950, .light-mode .bg-slate-900, .light-mode .bg-slate-800 { background-color: #ffffff !important; border-color: #e2e8f0 !important; }
      .light-mode .bg-slate-800\\/50, .light-mode .bg-slate-800\\/60, .light-mode .bg-slate-800\\/80 { background-color: #f1f5f9 !important; }
      .light-mode .border-white\\/10, .light-mode .border-slate-800, .light-mode .border-slate-700 { border-color: #cbd5e1 !important; }
      .light-mode .text-white, .light-mode .text-slate-100 { color: #0f172a !important; }
      .light-mode .text-slate-300 { color: #334155 !important; }
      .light-mode .text-slate-400 { color: #475569 !important; }
      .light-mode .text-slate-500 { color: #64748b !important; }
      .light-mode input, .light-mode select, .light-mode textarea { background-color: #ffffff !important; color: #0f172a !important; border-color: #cbd5e1 !important; }
      .light-mode input:focus, .light-mode select:focus, .light-mode textarea:focus { background-color: #ffffff !important; }
      .light-mode table thead { background-color: #f1f5f9 !important; color: #334155 !important; border-color: #cbd5e1 !important; }
      .light-mode table tbody tr:hover { background-color: #f8fafc !important; }
      .light-mode .hover\\:bg-slate-800\\/60:hover, .light-mode .hover\\:bg-slate-800:hover, .light-mode .hover\\:bg-slate-700:hover { background-color: #e2e8f0 !important; color: #0f172a !important; }
      .light-mode .text-amber-400 { color: #d97706 !important; }
      .light-mode .text-blue-400 { color: #2563eb !important; }
      .light-mode .text-emerald-400 { color: #059669 !important; }
      .light-mode .text-cyan-400, .light-mode .text-cyan-300 { color: #0891b2 !important; }
      .light-mode .text-rose-400 { color: #e11d48 !important; }
      .light-mode .text-purple-400 { color: #9333ea !important; }
      .light-mode .text-indigo-400, .light-mode .text-indigo-300 { color: #4f46e5 !important; }
      .light-mode .shadow-inner { box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05) !important; }
      .light-mode .divide-white\\/5 > :not([hidden]) ~ :not([hidden]) { border-color: #e2e8f0 !important; }
      .light-mode .btn-glow-blue, .light-mode .btn-glow-emerald, .light-mode .btn-glow-amber, .light-mode .btn-glow-purple, .light-mode .btn-glow-rose {
        color: white !important; /* Keep buttons text white in light mode */
      }

      @keyframes floatGlowOrb { 0%, 100% { transform: translateY(0px) scale(1) rotate(0deg); } 50% { transform: translateY(-30px) scale(1.12) rotate(180deg); } }
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

      .school-brand-title { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #38bdf8 0%, #ec4899 50%, #facc15 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 0 30px rgba(236, 72, 153, 0.3); }

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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900/80 border border-white/10 p-5 md:p-8 rounded-3xl shadow-2xl backdrop-blur-2xl gap-5">
            <div className="flex items-center gap-4 md:gap-5 w-full md:w-auto">
              {school.logo_url ? (
                <img src={school.logo_url} alt="Logo" className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white object-contain p-1 border-2 border-indigo-500 shadow-[0_0_25px_rgba(99,102,241,0.5)] shrink-0" />
              ) : (
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shrink-0">
                  <School size={28} className="text-white"/>
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-xl md:text-3xl font-black tracking-tight school-brand-title leading-tight line-clamp-1">{school.school_name || 'My School Portal'}</h1>
                <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1.5 text-xs text-slate-300 font-medium">
                  {school.phone && (<span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full border border-white/10"><PhoneCall size={12} className="text-emerald-400 shrink-0"/> {school.phone}</span>)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t border-white/10 md:border-t-0 pt-4 md:pt-0">
              <button onClick={toggleTheme} className="p-2.5 rounded-xl bg-slate-950/50 hover:bg-slate-800 transition border border-white/10 text-amber-400" title="Toggle Theme">
                {theme === 'dark' ? <Sun size={18}/> : <Moon size={18}/>}
              </button>
              <span className="px-3 py-1.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[10px] md:text-xs font-bold uppercase tracking-wider">Student Portal</span>
              <button onClick={handleLogout} className="btn-glow-rose bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 px-4 py-2 md:px-5 md:py-2.5 rounded-2xl text-xs md:text-sm font-bold flex items-center gap-2 transition"><LogOut size={16}/> Logout</button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-gradient-to-br from-blue-900/80 to-indigo-900/80 p-5 md:p-6 rounded-3xl shadow-xl border border-blue-500/40 flex items-center gap-4 backdrop-blur-xl sm:col-span-2 md:col-span-1">
              <img src={studentSession.photo_url || 'https://via.placeholder.com/150'} className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-white/20 object-cover shadow-lg" />
              <div><h2 className="text-lg md:text-xl font-black text-white leading-tight">{studentSession.name}</h2><p className="text-xs md:text-sm text-blue-200 mt-1">{studentSession.student_class} | Roll: #{studentSession.roll_no}</p><p className="text-[10px] md:text-xs font-bold bg-black/30 inline-block px-2.5 py-1 rounded-full mt-1.5">ID: {studentSession.unique_id}</p></div>
            </div>
            <div className="bg-slate-900/70 border border-white/10 p-5 md:p-6 rounded-3xl flex flex-col justify-center backdrop-blur-2xl"><p className="text-[10px] md:text-xs text-slate-400 uppercase tracking-widest font-bold">Attendance Rate</p><h3 className={`text-3xl md:text-4xl font-black mt-1.5 ${attendancePct >= 75 ? 'text-emerald-400' : 'text-rose-400'}`}>{attendancePct}%</h3><p className="text-[10px] md:text-[11px] text-slate-400 mt-1">{presents} / {totalWorkingDays} Days Present</p></div>
            <div className="bg-slate-900/70 border border-white/10 p-5 md:p-6 rounded-3xl flex flex-col justify-center backdrop-blur-2xl"><p className="text-[10px] md:text-xs text-slate-400 uppercase tracking-widest font-bold">Total Fees Paid</p><h3 className="text-3xl md:text-4xl font-black text-emerald-400 mt-1.5">₹{totalPaid}</h3></div>
            <div className="bg-slate-900/70 border border-white/10 p-5 md:p-6 rounded-3xl flex flex-col justify-center backdrop-blur-2xl"><p className="text-[10px] md:text-xs text-slate-400 uppercase tracking-widest font-bold">Current Dues</p><h3 className="text-3xl md:text-4xl font-black text-rose-400 mt-1.5">₹{totalDue}</h3></div>
          </div>

          <div className="bg-slate-900/70 border border-white/10 p-5 md:p-6 rounded-3xl shadow-xl space-y-4 backdrop-blur-2xl">
            <h3 className="text-base md:text-lg font-bold text-amber-400 flex items-center gap-2"><Megaphone size={18}/> School Notice Board</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studentNotices.length > 0 ? studentNotices.map((n) => (
                <div key={n.id} className="bg-slate-950/80 p-4 md:p-5 rounded-2xl border border-white/10 flex flex-col justify-between space-y-3 hover:border-amber-500/40 transition">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-white text-sm md:text-base leading-snug">{n.title}</h4>
                      <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-md text-[9px] md:text-[10px] font-bold whitespace-nowrap">{n.publish_date}</span>
                    </div>
                    <p className="text-[11px] md:text-xs text-slate-400 mt-2 leading-relaxed whitespace-pre-line">{n.content}</p>
                  </div>
                  <button onClick={() => setSelectedNoticeToPrint(n)} className="btn-glow-blue bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition w-fit shadow-md">
                    <Download size={14}/> Download Official PDF
                  </button>
                </div>
              )) : (
                <div className="col-span-2 text-center p-6 text-slate-500 border border-dashed border-white/10 rounded-2xl">
                  <Megaphone size={28} className="mx-auto mb-2 opacity-30"/>
                  <p className="text-xs font-medium">কোনো নোটিশ এখনো প্রকাশিত হয়নি।</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 pb-10">
            <div className="bg-slate-900/70 border border-white/10 p-5 md:p-6 rounded-3xl shadow-xl backdrop-blur-2xl">
              <h3 className="text-base md:text-lg font-bold text-white mb-4 md:mb-6 flex items-center gap-2"><Calendar className="text-blue-400" size={18}/> Month-wise Fee Status</h3>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
                {monthsName.map((m, idx) => {
                  const statusObj = getMonthlyStatus(idx, studentSession, studentPortalData.tx, config);
                  return (
                    <div key={idx} className={`p-2 md:p-3 rounded-2xl text-center flex flex-col justify-center items-center h-16 md:h-20 border transition ${statusObj.bg} ${statusObj.border}`}><span className={`text-[10px] md:text-xs font-bold ${statusObj.text}`}>{m.substring(0,3)}</span><span className={`text-[9px] md:text-[10px] mt-1 font-bold px-2 py-0.5 rounded-full ${statusObj.badgeBg}`}>{statusObj.label}</span></div>
                  );
                })}
              </div>
            </div>
            
            <div className="bg-slate-900/70 border border-white/10 p-5 md:p-6 rounded-3xl shadow-xl backdrop-blur-2xl">
              <h3 className="text-base md:text-lg font-bold text-white mb-4 md:mb-6 flex items-center gap-2"><FileText className="text-amber-400" size={18}/> Academic Results</h3>
              {studentPortalData.marks.length > 0 ? (
                <div className="space-y-3 md:space-y-4">
                  {studentPortalData.marks.map((mRecord, i) => (
                    <div key={i} className="bg-slate-950 border border-white/10 p-4 rounded-2xl">
                      <p className="text-xs md:text-sm font-bold text-amber-400 mb-2 md:mb-3">{mRecord.exam_name}</p>
                      <div className="space-y-2">
                        {Object.keys(mRecord.marks_data || {}).filter(k => k.includes('_theory')).map(key => {
                          const subName = key.split('_')[0];
                          const theory = mRecord.marks_data[`${subName}_theory`] || 0;
                          const oral = mRecord.marks_data[`${subName}_oral`] || 0;
                          const total = theory + oral;
                          return (
                            <div key={subName} className="flex justify-between items-center text-[11px] md:text-xs border-b border-white/10 pb-2">
                              <span className="text-slate-300 font-medium">{subName}</span>
                              <span className="font-bold text-white bg-slate-800 px-2.5 py-1 rounded-lg">Score: {total}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 border border-dashed border-white/10 rounded-2xl text-slate-500">
                  <File size={28} className="mx-auto mb-2 opacity-30"/>
                  <p className="text-[11px] md:text-xs font-semibold">No exam results published yet.</p>
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
    <div className={`flex flex-col md:flex-row min-h-screen ${theme === 'light' ? 'light-mode' : 'bg-slate-950 animated-mesh-bg'} text-slate-100 font-sans relative overflow-x-hidden`}>
      {sharedGlobalStyle}

      <div className="absolute -top-24 -left-24 w-[420px] h-[420px] bg-gradient-to-tr from-cyan-500/20 to-blue-600/25 rounded-full blur-3xl pointer-events-none orb-float-anim-1"></div>
      <div className="absolute top-1/3 -right-28 w-[450px] h-[450px] bg-gradient-to-bl from-purple-600/25 via-pink-600/20 to-indigo-600/20 rounded-full blur-3xl pointer-events-none orb-float-anim-2"></div>
      <div className="absolute -bottom-24 left-1/3 w-[400px] h-[400px] bg-gradient-to-tr from-teal-500/20 to-emerald-600/20 rounded-full blur-3xl pointer-events-none orb-float-anim-3"></div>

      {toast.show && (
        <div className={`fixed bottom-6 right-6 z-[100] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-bold text-sm transform transition-all animate-bounce-in ${toast.type === 'error' ? 'bg-rose-600 text-white shadow-rose-600/40' : 'bg-emerald-600 text-white shadow-emerald-600/40'}`}>
          {toast.type === 'error' ? <AlertCircle size={20}/> : <CheckCircle size={20}/>} {toast.message}
        </div>
      )}

      {/* ADMISSION MODAL */}
      {isAdmissionModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[80] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900/90 border border-white/10 p-6 md:p-8 rounded-3xl w-full max-w-4xl shadow-2xl relative my-8 backdrop-blur-2xl">
            <button onClick={resetStudentForm} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 p-2 rounded-xl transition"><X size={20}/></button>
            <h3 className="text-xl font-bold flex items-center gap-2 text-blue-400 mb-6"><Plus size={22}/> {isEditingStudent ? 'Update Profile' : 'New Admission'}</h3>
            <form onSubmit={handleSaveStudent} className="space-y-6">
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2"><BookOpen size={14}/> Select Class *</label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {classList.map(cls => (
                    <button type="button" key={cls} onClick={() => handleClassChangeInForm({target: {value: cls}})} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${formData.studentClass === cls ? 'btn-glow-blue bg-blue-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'}`}>{cls}</button>
                  ))}
                  <button type="button" onClick={() => handleClassChangeInForm({target: {value: 'CUSTOM'}})} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${isAddingCustomClass ? 'btn-glow-amber bg-amber-600 text-white' : 'bg-slate-950 text-amber-500 border border-slate-800 hover:border-slate-700'}`}>+ Custom</button>
                </div>
                {isAddingCustomClass && (
                  <div className="flex gap-2 mt-2">
                    <input type="text" placeholder="Custom Class Name" value={customClassInput} onChange={(e) => setCustomClassInput(e.target.value)} className="bg-slate-950 border border-slate-800 px-3 py-3 rounded-xl text-white flex-1 text-xs outline-none focus:border-blue-500" />
                    <button type="button" onClick={handleAddCustomClass} className="btn-glow-amber bg-amber-600 px-4 py-2 rounded-xl text-xs font-bold text-white">Save</button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div><label className="text-xs text-slate-300 mb-2 block">Roll Number</label><input type="text" value={`#${formData.rollNo || getNextRollForClass(formData.studentClass)}`} disabled className="w-full bg-slate-900/50 border border-slate-800 px-4 py-3 rounded-xl text-blue-400 font-bold" /></div>
                <div><label className="text-xs text-slate-300 mb-2 block">Student Name *</label><input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-white outline-none focus:border-blue-500" required /></div>
                <div><label className="text-xs text-slate-300 mb-2 block">Father's Name</label><input type="text" name="fatherName" value={formData.fatherName} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-white outline-none focus:border-blue-500" /></div>
                <div><label className="text-xs text-slate-300 mb-2 block">Mother's Name</label><input type="text" name="motherName" value={formData.motherName} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-white outline-none focus:border-blue-500" /></div>
                <div><label className="text-xs text-slate-300 mb-2 block">Date of Birth *</label><input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-white outline-none focus:border-blue-500" required /></div>
                <div><label className="text-xs text-slate-300 mb-2 block">Mobile No</label><input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-white outline-none focus:border-blue-500" /></div>
                <div><label className="text-xs text-slate-300 mb-2 block">National ID / Aadhar</label><input type="text" name="aadharNo" value={formData.aadharNo} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-white outline-none focus:border-blue-500" /></div>
                <div><label className="text-xs text-slate-300 mb-2 block">Religion</label><input type="text" name="religion" value={formData.religion} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-white outline-none focus:border-blue-500" /></div>
                <div><label className="text-xs text-slate-300 mb-2 block">Category</label><select name="category" value={formData.category} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-white outline-none focus:border-blue-500"><option value="General">General</option><option value="OBC">OBC</option><option value="SC">SC</option><option value="ST">ST</option></select></div>
                <div><label className="text-xs text-slate-300 mb-2 block">Blood Group</label><select name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-white outline-none focus:border-blue-500"><option value="">Select...</option><option value="A+">A+</option><option value="A-">A-</option><option value="O+">O+</option></select></div>
                <div><label className="text-xs text-slate-300 mb-2 block">Gender</label><select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-white outline-none focus:border-blue-500"><option value="Male">Male</option><option value="Female">Female</option></select></div>
                <div className="md:col-span-2"><label className="text-xs text-slate-300 mb-2 block">Address</label><input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-white outline-none focus:border-blue-500" /></div>
              </div>
              <button type="submit" disabled={isProcessing} className="btn-glow-blue w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 py-4 rounded-2xl font-bold text-white transition flex justify-center items-center gap-2">{isProcessing ? <Loader2 className="animate-spin"/> : <Save/>} Submit Admission</button>
            </form>
          </div>
        </div>
      )}

      {/* STAFF MODAL */}
      {!teacherSession && isStaffModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[80] flex items-center justify-center p-4">
          <div className="bg-slate-900/90 border border-white/10 p-6 md:p-8 rounded-3xl max-w-md w-full shadow-2xl relative backdrop-blur-2xl">
            <button onClick={() => setIsStaffModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 p-2 rounded-xl transition"><X size={18} /></button>
            <h3 className="text-lg font-bold text-purple-400 mb-2 flex items-center gap-2"><Briefcase size={20}/> {staffData.id ? 'Edit Staff Profile' : 'Add New Teacher / Staff'}</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">শিক্ষকরা তাদের মোবাইল নম্বর এবং দেওয়া পাসওয়ার্ড দিয়ে লগইন করতে পারবেন।</p>
            <form onSubmit={handleSaveStaff} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1 font-semibold">Teacher / Staff Full Name *</label>
                <input type="text" value={staffData.name} onChange={e => setStaffData({...staffData, name: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white text-sm outline-none focus:border-purple-500" placeholder="e.g. Master Anisur Rahman" required/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1 font-semibold">Role / Position *</label>
                  <select value={staffData.role} onChange={e => setStaffData({...staffData, role: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white text-sm outline-none focus:border-purple-500">
                    <option value="Teacher">Teacher</option>
                    <option value="Senior Teacher">Senior Teacher</option>
                    <option value="Assistant Teacher">Assistant Teacher</option>
                    <option value="Accountant">Accountant</option>
                    <option value="Clerk">Clerk</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1 font-semibold">Monthly Salary (₹)</label>
                  <input type="number" value={staffData.salary} onChange={e => setStaffData({...staffData, salary: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white text-sm outline-none focus:border-purple-500" placeholder="e.g. 15000"/>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-300 block mb-1 font-semibold">Mobile Number (Login ID) *</label>
                <input type="text" value={staffData.phone} onChange={e => setStaffData({...staffData, phone: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white text-sm outline-none focus:border-purple-500 font-mono" placeholder="e.g. 9876543210" required/>
              </div>
              <div>
                <label className="text-xs text-slate-300 block mb-1 font-semibold flex items-center gap-1.5"><Lock size={14} className="text-amber-400"/> Assign Login Password *</label>
                <input type="text" value={staffData.password} onChange={e => setStaffData({...staffData, password: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-amber-300 text-sm outline-none focus:border-amber-500 font-mono font-bold" placeholder="Set login password for teacher" required/>
              </div>
              <button type="submit" disabled={isProcessing} className="btn-glow-purple w-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 py-3.5 rounded-2xl text-sm font-bold text-white transition flex justify-center items-center gap-2">
                {isProcessing ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} Save Staff & Login Access
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PUBLISH NOTICE MODAL */}
      {isNoticeModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[80] flex items-center justify-center p-4">
          <div className="bg-slate-900/90 border border-white/10 p-6 md:p-8 rounded-3xl max-w-lg w-full shadow-2xl relative backdrop-blur-2xl">
            <button onClick={() => setIsNoticeModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 p-2 rounded-xl transition"><X size={18} /></button>
            <h3 className="text-lg font-bold text-amber-400 mb-2 flex items-center gap-2"><Megaphone size={20}/> Publish New School Notice</h3>
            <p className="text-xs text-slate-400 mb-4">এই নোটিশটি ছাত্রছাত্রীদের ড্যাশবোর্ডে প্রকাশিত হবে এবং লেটারহেড সহ PDF প্রিন্ট করা যাবে।</p>
            <form onSubmit={handleSaveNotice} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1 font-semibold">Notice Title (শিরোনাম) *</label>
                <input type="text" value={noticeFormData.title} onChange={e => setNoticeFormData({...noticeFormData, title: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white text-sm outline-none focus:border-amber-500 font-bold" placeholder="e.g. Eid Vacation Notice / Exam Announcement" required/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1 font-semibold">Target Audience</label>
                  <select value={noticeFormData.target_class} onChange={e => setNoticeFormData({...noticeFormData, target_class: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white text-sm outline-none focus:border-amber-500">
                    <option value="All">All Classes (সবাই)</option>
                    {classList.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1 font-semibold">Date of Notice</label>
                  <input type="date" value={noticeFormData.publish_date} onChange={e => setNoticeFormData({...noticeFormData, publish_date: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white text-sm outline-none focus:border-amber-500"/>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-300 block mb-1 font-semibold">Notice Description / Content *</label>
                <textarea rows={5} value={noticeFormData.content} onChange={e => setNoticeFormData({...noticeFormData, content: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white text-sm outline-none focus:border-amber-500 resize-none leading-relaxed" placeholder="Write notice details here..." required/>
              </div>
              <button type="submit" disabled={isProcessing} className="btn-glow-amber w-full bg-gradient-to-r from-amber-600 to-orange-600 py-3.5 rounded-2xl text-sm font-bold text-white transition flex justify-center items-center gap-2">
                {isProcessing ? <Loader2 className="animate-spin" size={16}/> : <Megaphone size={16}/>} Publish Notice
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MOBILE MENU OVERLAY */}
      <div className={`fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[60] md:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMobileMenuOpen(false)}></div>

      {/* SIDEBAR NAVIGATION (Responsive Drawer) */}
      <aside className={`fixed md:relative inset-y-0 left-0 w-[280px] md:w-80 bg-slate-900/95 md:bg-slate-900/80 backdrop-blur-2xl border-r border-white/10 p-5 md:p-6 flex flex-col justify-between z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/50 p-2 rounded-xl transition"><X size={20}/></button>
        
        <div>
          {/* স্কুল প্রোফাইল ব্রান্ডিং কার্ড */}
          <div className="p-4 rounded-3xl bg-slate-950/70 border border-white/10 mb-6 shadow-inner backdrop-blur-md mt-6 md:mt-0">
            <div className="flex items-center gap-3.5 mb-3">
              {school.logo_url ? (
                <img src={school.logo_url} alt="Logo" className="w-12 h-12 rounded-2xl object-cover bg-white p-1 shadow-[0_0_20px_rgba(59,130,246,0.4)] shrink-0" />
              ) : (
                <div className="bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-500 p-2.5 rounded-2xl shadow-[0_0_25px_rgba(59,130,246,0.5)] shrink-0">
                  <School className="text-white" size={24} />
                </div>
              )}
              <div className="overflow-hidden">
                <h1 className="text-lg font-black tracking-tight school-brand-title truncate">
                  {school.school_name || 'EduAdmin'}
                </h1>
                <p className="text-[11px] text-indigo-300 font-bold uppercase tracking-wider">
                  {teacherSession ? `Teacher: ${teacherSession.name}` : 'School Management'}
                </p>
              </div>
            </div>

            <div className="space-y-1.5 pt-2.5 border-t border-white/10 text-[11px] text-slate-300">
              {school.address && (
                <p className="flex items-start gap-1.5 leading-snug">
                  <MapPin size={12} className="text-cyan-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{school.address}</span>
                </p>
              )}
              {school.phone && (
                <p className="flex items-center gap-1.5 font-mono text-emerald-300">
                  <PhoneCall size={12} className="text-emerald-400 shrink-0" />
                  <span>{school.phone}</span>
                </p>
              )}
              {school.email && (
                <p className="flex items-center gap-1.5 text-amber-300 truncate">
                  <Mail size={12} className="text-amber-400 shrink-0" />
                  <span className="truncate">{school.email}</span>
                </p>
              )}
            </div>
          </div>
          
          <nav className="space-y-1.5 md:space-y-2 overflow-y-auto scrollbar-hide pr-1 pb-4 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button 
                  key={item.id} 
                  onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }} 
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${ activeTab === item.id ? 'btn-glow-blue bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'}`}
                >
                  <Icon size={18} />{item.label}
                </button>
              );
            })}
            <button onClick={() => router.push('/mark-entry')} className="btn-glow-emerald w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition mt-3">
              <FileSpreadsheet size={18} />Mark Entry & Report
            </button>
          </nav>
        </div>

        <div className="pt-4 md:pt-5 border-t border-white/10 space-y-2 mt-auto">
          {!teacherSession && (
            <button onClick={() => router.push('/change-password')} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800/60 hover:text-white transition"><Key size={16} /> Change Password</button>
          )}
          <button onClick={handleLogout} className="btn-glow-rose w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 transition"><LogOut size={16} /> Logout Securely</button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 md:p-6 lg:p-10 w-full relative z-10 overflow-x-hidden">
        
        {/* টপ ব্যানার */}
        <div className="bg-slate-900/80 border border-white/10 p-5 md:p-6 rounded-3xl mb-6 md:mb-8 shadow-xl backdrop-blur-2xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-3 w-full lg:w-auto">
            {/* Hamburger Button for Mobile */}
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2.5 rounded-xl bg-slate-950/50 hover:bg-slate-800 border border-white/10 text-white transition"><Menu size={22}/></button>
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black school-brand-title tracking-tight line-clamp-1">
                {school.school_name || 'Smart Educational Institution'}
              </h1>
              <div className="hidden sm:flex flex-wrap items-center gap-2 md:gap-3.5 text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1"><MapPin size={12} className="text-cyan-400"/> <span className="line-clamp-1 max-w-[200px]">{school.address || 'Location Address'}</span></span>
                <span className="flex items-center gap-1 font-mono text-emerald-400"><PhoneCall size={12} className="text-emerald-400"/> {school.phone || 'Phone'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end border-t border-white/10 lg:border-none pt-4 lg:pt-0">
            {/* Theme Toggle Switch */}
            <button onClick={toggleTheme} className="p-2.5 rounded-xl bg-slate-950/50 hover:bg-slate-800 transition border border-white/10 text-amber-400 flex items-center justify-center shrink-0 shadow-inner" title="Toggle Light/Dark Theme">
              {theme === 'dark' ? <Sun size={18}/> : <Moon size={18}/>}
            </button>

            <div className="inline-flex items-center justify-center gap-2 px-3 md:px-4 py-2 rounded-2xl border border-purple-500/40 bg-purple-500/10 text-purple-300 text-[10px] md:text-xs font-mono font-bold shadow-[0_0_15px_rgba(168,85,247,0.2)] backdrop-blur-md w-full sm:w-auto">
              <Calendar size={14} className="text-purple-400 hidden sm:block" />
              <span>{currentDateTime.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</span>
              <span className="text-slate-500">|</span>
              <Clock size={14} className="text-amber-400 hidden sm:block" />
              <span className="text-amber-400 font-black tracking-wider text-xs md:text-sm">{currentDateTime.toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 md:space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-4 gap-4">
               <div>
                 <h2 className="text-2xl md:text-3xl font-black text-white">Live Overview</h2>
                 <p className="text-xs text-slate-400 mt-1">Welcome back to your school portal.</p>
               </div>
               <div className="flex gap-2 sm:gap-3 flex-wrap w-full sm:w-auto">
                 <button onClick={() => setIsNoticeModalOpen(true)} className="btn-glow-amber flex-1 sm:flex-none bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-2.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 text-xs">
                   <Megaphone size={16}/> Notice
                 </button>
                 <button onClick={() => setIsAdmissionModalOpen(true)} className="btn-glow-blue flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 text-xs">
                   <Plus size={16}/> Admission
                 </button>
               </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <div className="bg-slate-900/70 border border-white/10 p-5 md:p-6 rounded-3xl flex items-center gap-4 hover:border-blue-500/40 transition backdrop-blur-xl">
                <div className="p-3.5 md:p-4 bg-blue-500/15 text-blue-400 rounded-2xl shadow-[0_0_15px_rgba(59,130,246,0.2)]"><Users size={24} className="md:w-7 md:h-7" /></div>
                <div><p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider">Active Students</p><h3 className="text-2xl md:text-3xl font-black text-white mt-0.5">{activeStudentsList.length}</h3></div>
              </div>

              <div className="bg-slate-900/70 border border-white/10 p-5 md:p-6 rounded-3xl flex items-center gap-4 hover:border-purple-500/40 transition backdrop-blur-xl">
                <div className="p-3.5 md:p-4 bg-purple-500/15 text-purple-400 rounded-2xl shadow-[0_0_15px_rgba(168,85,247,0.2)]"><Briefcase size={24} className="md:w-7 md:h-7" /></div>
                <div><p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider">{teacherSession ? 'My Role' : 'Total Staff'}</p><h3 className="text-xl md:text-2xl font-black text-purple-400 mt-0.5">{teacherSession ? teacherSession.role : staffList.length}</h3></div>
              </div>

              <div className="bg-slate-900/70 border border-white/10 p-5 md:p-6 rounded-3xl flex items-center gap-4 hover:border-amber-500/40 transition backdrop-blur-xl sm:col-span-2 lg:col-span-1">
                <div className="p-3.5 md:p-4 bg-amber-500/15 text-amber-400 rounded-2xl shadow-[0_0_15px_rgba(245,158,11,0.2)]"><Megaphone size={24} className="md:w-7 md:h-7" /></div>
                <div><p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider">Notices</p><h3 className="text-2xl md:text-3xl font-black text-amber-400 mt-0.5">{notices.length}</h3></div>
              </div>
            </div>

            {/* NOTICES SECTION */}
            <div className="bg-slate-900/70 border border-white/10 p-5 md:p-8 rounded-3xl shadow-xl space-y-4 md:space-y-5 backdrop-blur-2xl">
              <div className="flex justify-between items-center border-b border-white/10 pb-3 md:pb-4">
                <h3 className="text-base md:text-lg font-bold text-amber-400 flex items-center gap-2"><Megaphone size={18}/> Published Notices Board</h3>
                <button onClick={() => setIsNoticeModalOpen(true)} className="text-[10px] md:text-xs font-bold text-amber-400 hover:text-amber-500 flex items-center gap-1">+ New Notice</button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
                {notices.length > 0 ? notices.map((n) => (
                  <div key={n.id} className="bg-slate-950/80 p-4 md:p-5 rounded-2xl border border-white/10 flex flex-col justify-between space-y-3 hover:border-amber-500/40 transition backdrop-blur-md">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-white text-sm md:text-base leading-snug">{n.title}</h4>
                        <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md text-[9px] md:text-[10px] font-bold whitespace-nowrap">{n.publish_date}</span>
                      </div>
                      <p className="text-[11px] md:text-xs text-slate-400 mt-2 leading-relaxed whitespace-pre-line line-clamp-3">{n.content}</p>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <span className="text-[9px] md:text-[10px] text-slate-400 font-semibold">Audience: <strong className="text-cyan-400">{n.target_class || 'All'}</strong></span>
                      <div className="flex gap-2">
                        <button onClick={() => setSelectedNoticeToPrint(n)} className="btn-glow-blue bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 px-3 py-1.5 rounded-xl text-[10px] md:text-xs font-bold flex items-center gap-1.5 transition">
                          <Printer size={12}/> PDF
                        </button>
                        {!teacherSession && (
                          <button onClick={() => handleDeleteNotice(n.id)} className="btn-glow-rose bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 p-1.5 rounded-xl transition">
                            <Trash2 size={14}/>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-1 lg:col-span-2 text-center p-8 md:p-12 text-slate-400 border border-dashed border-white/10 rounded-3xl bg-slate-950/40">
                    <Megaphone size={32} className="mx-auto mb-2 opacity-30 text-amber-400"/>
                    <p className="text-[11px] md:text-xs font-medium">কোনো নোটিশ এখনো পাবলিশ করা হয়নি।</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==============================================================
            ADVANCED ATTENDANCE SYSTEM 
            ============================================================== */}
        {activeTab === 'attendance' && (
          <div className="space-y-5 md:space-y-6 animate-fade-in w-full">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-4 gap-4">
              <div>
                <h2 className="text-xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 flex items-center gap-2 md:gap-3">
                  <CalendarCheck size={28} className="text-emerald-400"/> Smart Attendance
                </h2>
                <p className="text-[11px] md:text-xs text-slate-400 mt-1">বারকোড স্ক্যানার, ডে-টাইপ সিলেকশন ও লাইভ উপস্থিতি।</p>
              </div>

              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <div className="bg-slate-900/80 border border-white/10 p-1 md:p-1.5 rounded-2xl flex gap-1 backdrop-blur-xl flex-1 md:flex-none">
                  <button onClick={() => setAttendanceMode('students')} className={`flex-1 md:flex-none px-3 py-2 md:px-4 md:py-2.5 rounded-xl text-[10px] md:text-xs font-bold transition flex items-center justify-center gap-1.5 ${attendanceMode === 'students' ? 'btn-glow-emerald bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                    <GraduationCap size={14}/> Students
                  </button>
                  <button onClick={() => setAttendanceMode('staff')} className={`flex-1 md:flex-none px-3 py-2 md:px-4 md:py-2.5 rounded-xl text-[10px] md:text-xs font-bold transition flex items-center justify-center gap-1.5 ${attendanceMode === 'staff' ? 'btn-glow-purple bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                    <Briefcase size={14}/> Staff
                  </button>
                </div>

                <div className="bg-slate-900/80 border border-white/10 p-1 md:p-1.5 rounded-2xl flex gap-1 backdrop-blur-xl flex-1 md:flex-none">
                  <button onClick={() => setAttendanceView('daily')} className={`flex-1 md:flex-none px-3 py-2 md:px-4 md:py-2.5 rounded-xl text-[10px] md:text-xs font-bold transition ${attendanceView === 'daily' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>Daily</button>
                  <button onClick={() => setAttendanceView('monthly')} className={`flex-1 md:flex-none px-3 py-2 md:px-4 md:py-2.5 rounded-xl text-[10px] md:text-xs font-bold transition ${attendanceView === 'monthly' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>Monthly</button>
                </div>
              </div>
            </div>

            {/* DAY TYPE SELECTOR BUTTONS */}
            <div className="bg-slate-900/70 border border-white/10 p-4 md:p-5 rounded-3xl shadow-xl backdrop-blur-2xl flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-2 bg-amber-500/10 rounded-xl hidden sm:block"><Sun size={20} className="text-amber-400"/></div>
                <div>
                  <h4 className="text-[11px] md:text-xs font-bold uppercase tracking-wider text-slate-400">Select Day Schedule:</h4>
                  <p className="text-[10px] md:text-[11px] text-slate-500 mt-0.5">তারিখ: <span className="text-slate-300 font-mono font-bold">{attendanceDate}</span> ({dayType})</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full xl:w-auto">
                <button type="button" onClick={() => handleSelectDayType('Class Day')} className={`px-3 py-2 md:px-4 md:py-2.5 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-bold transition flex items-center justify-center gap-1.5 ${dayType === 'Class Day' ? 'btn-glow-emerald bg-emerald-600 text-white border border-emerald-500' : 'bg-slate-950/80 text-slate-400 border border-white/10 hover:border-emerald-500'}`}>
                  <BookOpen size={14}/> Class Day
                </button>
                <button type="button" onClick={() => handleSelectDayType('Exam Day')} className={`px-3 py-2 md:px-4 md:py-2.5 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-bold transition flex items-center justify-center gap-1.5 ${dayType === 'Exam Day' ? 'btn-glow-amber bg-amber-600 text-white border border-amber-500' : 'bg-slate-950/80 text-slate-400 border border-white/10 hover:border-amber-500'}`}>
                  <BookMarked size={14}/> Exam Day
                </button>
                <button type="button" onClick={() => handleSelectDayType('Class Off')} className={`px-3 py-2 md:px-4 md:py-2.5 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-bold transition flex items-center justify-center gap-1.5 ${dayType === 'Class Off' ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30 border border-orange-500' : 'bg-slate-950/80 text-slate-400 border border-white/10 hover:border-orange-500'}`}>
                  <Coffee size={14}/> Class Off
                </button>
                <button type="button" onClick={() => handleSelectDayType('Holiday')} className={`px-3 py-2 md:px-4 md:py-2.5 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-bold transition flex items-center justify-center gap-1.5 ${dayType === 'Holiday' ? 'btn-glow-rose bg-rose-600 text-white border border-rose-500' : 'bg-slate-950/80 text-slate-400 border border-white/10 hover:border-rose-500'}`}>
                  <ShieldAlert size={14}/> Holiday (ছুটি)
                </button>
              </div>
            </div>

            {/* HOLIDAY বা CLASS OFF ব্যানার */}
            {(dayType === 'Holiday' || dayType === 'Class Off') && (
              <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-r from-rose-900/20 via-orange-900/20 to-slate-900/50 border border-rose-500/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 backdrop-blur-xl">
                <div className="flex items-start sm:items-center gap-3">
                  <AlertTriangle className="text-amber-500 shrink-0 mt-0.5 sm:mt-0" size={20} />
                  <p className="text-[11px] md:text-xs font-medium text-slate-300 leading-relaxed">
                    আজকের দিনটি <strong className="text-rose-400 underline">{dayType}</strong> হিসেবে চিহ্নিত রয়েছে। আপনি চাইলে সবাইকে এক ক্লিকে ছুটির মার্ক করতে পারেন।
                  </p>
                </div>
                <button onClick={handleMarkAllAsLeave} className="w-full sm:w-auto px-4 py-2 md:px-5 md:py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shrink-0 shadow-md shadow-rose-600/20">
                  Mark All as Leave (ছুটি)
                </button>
              </div>
            )}

            {/* লাইভ স্ট্যাটাস বার */}
            {attendanceView === 'daily' && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
                <div className="bg-slate-900/70 border border-white/10 p-3 md:p-4 rounded-2xl backdrop-blur-xl"><p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Active</p><h4 className="text-xl md:text-2xl font-black text-slate-100 mt-1">{currentAttendanceTargetList.length}</h4></div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 md:p-4 rounded-2xl backdrop-blur-xl"><p className="text-[9px] md:text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Present</p><h4 className="text-xl md:text-2xl font-black text-emerald-500 mt-1">{presentCount}</h4></div>
                <div className="bg-rose-500/10 border border-rose-500/20 p-3 md:p-4 rounded-2xl backdrop-blur-xl"><p className="text-[9px] md:text-[10px] text-rose-500 font-bold uppercase tracking-wider">Absent</p><h4 className="text-xl md:text-2xl font-black text-rose-500 mt-1">{absentCount}</h4></div>
                <div className="bg-amber-500/10 border border-amber-500/20 p-3 md:p-4 rounded-2xl backdrop-blur-xl"><p className="text-[9px] md:text-[10px] text-amber-500 font-bold uppercase tracking-wider">Late In</p><h4 className="text-xl md:text-2xl font-black text-amber-500 mt-1">{lateCount}</h4></div>
                <div className="bg-blue-500/10 border border-blue-500/20 p-3 md:p-4 rounded-2xl backdrop-blur-xl"><p className="text-[9px] md:text-[10px] text-blue-500 font-bold uppercase tracking-wider">Leave</p><h4 className="text-xl md:text-2xl font-black text-blue-500 mt-1">{leaveCount}</h4></div>
                <div className="bg-indigo-500/10 border border-indigo-500/30 p-3 md:p-4 rounded-2xl backdrop-blur-xl flex flex-col justify-center"><p className="text-[9px] md:text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Attendance %</p><h4 className={`text-xl md:text-2xl font-black mt-1 ${attendanceRate >= 75 ? 'text-cyan-400' : 'text-rose-500'}`}>{attendanceRate}%</h4></div>
              </div>
            )}

            {/* কন্ট্রোল বার: ক্লাস ও ডেট সিলেক্টর এবং স্ক্যানার */}
            <div className="bg-slate-900/70 border border-white/10 p-4 md:p-6 rounded-3xl backdrop-blur-2xl shadow-xl flex flex-col lg:flex-row gap-4 lg:gap-6 justify-between items-stretch lg:items-center">
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center w-full lg:w-auto">
                {attendanceMode === 'students' && (
                  <div className="flex-1 sm:flex-none">
                    <label className="text-[9px] md:text-[10px] text-slate-500 block mb-1 font-bold uppercase tracking-wider">Select Class</label>
                    <select value={attendanceClass} onChange={e => setAttendanceClass(e.target.value)} className="w-full sm:w-auto bg-slate-950 border border-slate-800 p-2.5 md:p-3 rounded-xl md:rounded-2xl text-slate-100 text-[11px] md:text-xs font-bold outline-none focus:border-emerald-500">
                      {activeClasses.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                )}

                <div className="flex-1 sm:flex-none">
                  <label className="text-[9px] md:text-[10px] text-slate-500 block mb-1 font-bold uppercase tracking-wider">{attendanceView === 'daily' ? 'Attendance Date' : 'Select Month'}</label>
                  {attendanceView === 'daily' ? (
                    <input type="date" value={attendanceDate} onChange={e => setAttendanceDate(e.target.value)} className="w-full sm:w-auto bg-slate-950 border border-slate-800 p-2.5 md:p-3 rounded-xl md:rounded-2xl text-slate-100 text-[11px] md:text-xs font-bold outline-none focus:border-emerald-500"/>
                  ) : (
                    <input type="month" value={attendanceMonth} onChange={e => setAttendanceMonth(e.target.value)} className="w-full sm:w-auto bg-slate-950 border border-slate-800 p-2.5 md:p-3 rounded-xl md:rounded-2xl text-slate-100 text-[11px] md:text-xs font-bold outline-none focus:border-emerald-500"/>
                  )}
                </div>
              </div>

              {attendanceView === 'daily' && (
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full lg:w-auto mt-2 lg:mt-0 pt-3 lg:pt-0 border-t border-white/5 lg:border-none">
                  <form onSubmit={handleBarcodeSubmit} className="relative flex-1 sm:w-56 md:w-64">
                    <Barcode className="absolute left-3 md:left-3.5 top-2.5 md:top-3 text-cyan-500" size={16} />
                    <input ref={barcodeInputRef} type="text" placeholder={attendanceMode === 'students' ? 'Scan ID / Enter Roll...' : 'Scan / Phone No...'} value={barcodeScanInput} onChange={e => setBarcodeScanInput(e.target.value)} className="w-full bg-slate-950 border border-cyan-500/30 pl-9 md:pl-10 pr-3 md:pr-4 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-[11px] md:text-xs text-slate-100 outline-none focus:border-cyan-500 shadow-inner font-mono font-bold placeholder:text-slate-500"/>
                  </form>
                  <button type="button" onClick={handleMarkAllPresent} disabled={isProcessing} className="btn-glow-emerald bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 md:px-5 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-[11px] md:text-xs font-bold flex items-center justify-center gap-1.5 md:gap-2 whitespace-nowrap">
                    {isProcessing ? <Loader2 className="animate-spin" size={14}/> : <CheckCheck size={14}/>} Mark All Present
                  </button>
                </div>
              )}
            </div>

            {/* DAILY ATTENDANCE TABLE VIEW */}
            {attendanceView === 'daily' && (
              <div className="bg-slate-900/70 border border-white/10 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl backdrop-blur-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[700px]">
                    <thead className="bg-slate-800/60 text-slate-500 text-[10px] md:text-xs uppercase tracking-wider border-b border-slate-700">
                      <tr><th className="p-3 md:p-4">Profile & Identification</th><th className="p-3 md:p-4">Contact Info</th><th className="p-3 md:p-4 text-center">Set Status (4 Actions)</th><th className="p-3 md:p-4 text-right">Parent Alerts</th></tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-[11px] md:text-sm text-slate-300">
                      {currentAttendanceTargetList.map(person => {
                        const stId = person.id;
                        const curStatus = attendanceRecords[stId] || 'Pending';
                        const isAbsent = curStatus === 'Absent';
                        const waLink = attendanceMode === 'students' ? getWhatsAppLink(person) : null;

                        return (
                          <tr key={stId} className="hover:bg-slate-800/60 transition">
                            <td className="p-3 md:p-4">
                              <div className="flex items-center gap-2.5 md:gap-3">
                                <img src={person.photo_url || 'https://via.placeholder.com/150'} className="w-8 h-8 md:w-10 md:h-10 rounded-xl object-cover border border-white/10" alt="" />
                                <div><p className="font-bold text-slate-100 leading-tight">{person.name}</p><p className="text-[9px] md:text-[10px] text-slate-500 mt-0.5">{attendanceMode === 'students' ? `Class: ${person.student_class} | Roll: #${person.roll_no}` : `Role: ${person.role}`}</p></div>
                              </div>
                            </td>
                            <td className="p-3 md:p-4 font-mono font-medium">{person.phone || 'N/A'}</td>
                            <td className="p-3 md:p-4 text-center">
                              <div className="inline-flex bg-slate-950 p-1 rounded-xl md:rounded-2xl border border-slate-800 gap-0.5 md:gap-1 shadow-inner">
                                <button onClick={() => handleSaveAttendance(stId, 'Present', attendanceMode === 'staff')} className={`px-2.5 md:px-3.5 py-1 md:py-1.5 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold transition ${curStatus === 'Present' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-emerald-500'}`}>Present</button>
                                <button onClick={() => handleSaveAttendance(stId, 'Absent', attendanceMode === 'staff')} className={`px-2.5 md:px-3.5 py-1 md:py-1.5 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold transition ${curStatus === 'Absent' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-500 hover:text-rose-500'}`}>Absent</button>
                                <button onClick={() => handleSaveAttendance(stId, 'Late', attendanceMode === 'staff')} className={`px-2.5 md:px-3.5 py-1 md:py-1.5 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold transition ${curStatus === 'Late' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-500 hover:text-amber-500'}`}>Late</button>
                                <button onClick={() => handleSaveAttendance(stId, 'Leave', attendanceMode === 'staff')} className={`px-2.5 md:px-3.5 py-1 md:py-1.5 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold transition ${curStatus === 'Leave' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-blue-500'}`}>Leave</button>
                              </div>
                            </td>
                            <td className="p-3 md:p-4 text-right">
                              {attendanceMode === 'students' && isAbsent && waLink ? (
                                <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-glow-emerald bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white px-2.5 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold inline-flex items-center gap-1 md:gap-1.5 transition"><MessageCircle size={12}/> WA</a>
                              ) : (<span className="text-[10px] md:text-[11px] text-slate-600 font-semibold italic">{curStatus === 'Present' ? 'Normal' : '-'}</span>)}
                            </td>
                          </tr>
                        );
                      })}
                      {currentAttendanceTargetList.length === 0 && (<tr><td colSpan="4" className="text-center py-10 text-slate-500 font-semibold">এই ক্লাসে কোনো ডাটা নেই।</td></tr>)}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* MONTHLY REGISTER VIEW */}
            {attendanceView === 'monthly' && (
              <div className="bg-slate-900/70 border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-xl backdrop-blur-2xl space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/10 pb-3 md:pb-4">
                  <div><h3 className="text-base md:text-lg font-bold text-slate-100 flex items-center gap-2"><PieChart size={18} className="text-cyan-500"/> Monthly Register Report</h3><p className="text-[10px] md:text-xs text-slate-500 mt-0.5">স্বয়ংক্রিয় ৭৫% উপস্থিতি নিয়ম ও পার্সেন্টেজ মনিটরিং।</p></div>
                  <button onClick={() => { /* Export logic */ }} className="bg-slate-800 hover:bg-slate-700 text-emerald-500 border border-emerald-500/30 px-3 md:px-4 py-2 rounded-xl text-[10px] md:text-xs font-bold flex items-center gap-1.5 transition"><FileSpreadsheet size={14}/> Export CSV</button>
                </div>

                <div className="overflow-x-auto rounded-xl md:rounded-2xl border border-slate-800">
                  <table className="w-full text-left min-w-[650px] text-[10px] md:text-xs">
                    <thead className="bg-slate-800 text-slate-400 uppercase tracking-wider">
                      <tr><th className="p-2.5 md:p-3.5">Roll & Name</th><th className="p-2.5 md:p-3.5 text-center">Class / Role</th><th className="p-2.5 md:p-3.5 text-center">Working Days</th><th className="p-2.5 md:p-3.5 text-center text-emerald-500">Presents</th><th className="p-2.5 md:p-3.5 text-center text-rose-500">Absents</th><th className="p-2.5 md:p-3.5 text-center">Attendance %</th><th className="p-2.5 md:p-3.5 text-center">75% Rule Compliance</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-950/40 text-slate-300">
                      {currentAttendanceTargetList.map(st => {
                        const stAtt = monthlyAttendanceData.filter(d => d.student_id === st.id);
                        const totalDays = stAtt.length;
                        const presents = stAtt.filter(d => d.status === 'Present' || d.status === 'Late').length;
                        const absents = stAtt.filter(d => d.status === 'Absent').length;
                        const pct = totalDays > 0 ? Math.round((presents / totalDays) * 100) : 0;
                        const isShortage = totalDays > 0 && pct < 75;

                        return (
                          <tr key={st.id} className="hover:bg-slate-800/60 transition">
                            <td className="p-2.5 md:p-3.5 font-bold text-slate-100"><span className="text-slate-500 mr-1.5 md:mr-2">#{st.roll_no || st.id}</span>{st.name}</td>
                            <td className="p-2.5 md:p-3.5 text-center text-slate-500">{st.student_class || st.role}</td>
                            <td className="p-2.5 md:p-3.5 text-center font-bold">{totalDays} Days</td>
                            <td className="p-2.5 md:p-3.5 text-center font-bold text-emerald-500">{presents}</td>
                            <td className="p-2.5 md:p-3.5 text-center font-bold text-rose-500">{absents}</td>
                            <td className="p-2.5 md:p-3.5 text-center font-black text-xs md:text-sm text-cyan-500">{pct}%</td>
                            <td className="p-2.5 md:p-3.5 text-center">
                              {totalDays === 0 ? (<span className="text-slate-600 font-semibold">No Record</span>) : isShortage ? (<span className="bg-rose-500/10 text-rose-500 border border-rose-500/30 px-2 py-0.5 rounded-md text-[9px] md:text-[10px] font-black inline-flex items-center gap-1"><AlertTriangle size={10}/> Shortage Alert</span>) : (<span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 px-2 py-0.5 rounded-md text-[9px] md:text-[10px] font-black inline-flex items-center gap-1"><CheckCircle size={10}/> Eligible</span>)}
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
            <h2 className="text-xl md:text-2xl font-bold border-b border-white/10 pb-3 md:pb-4 text-slate-100">Student Records</h2>
            
            <div className="flex bg-slate-950/80 border border-white/10 p-1 md:p-1.5 rounded-xl md:rounded-2xl w-full sm:w-fit backdrop-blur-md overflow-x-auto scrollbar-hide">
              <button onClick={() => setStudentStatusTab('Active')} className={`flex-none px-4 md:px-6 py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold transition ${studentStatusTab === 'Active' ? 'btn-glow-blue bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>Active Students</button>
              <button onClick={() => setStudentStatusTab('Passout')} className={`flex-none px-4 md:px-6 py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold transition flex items-center gap-1.5 ${studentStatusTab === 'Passout' ? 'btn-glow-emerald bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}><GraduationCap size={14}/> Alumni</button>
              <button onClick={() => setStudentStatusTab('Transferred')} className={`flex-none px-4 md:px-6 py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold transition flex items-center gap-1.5 ${studentStatusTab === 'Transferred' ? 'btn-glow-rose bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}><FileOutput size={14}/> Transferred</button>
            </div>

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 md:gap-4 w-full">
              <div className="relative w-full lg:flex-1">
                <Search className="absolute left-3.5 top-2.5 md:top-3.5 text-slate-500" size={16} />
                <input type="text" placeholder="Search by name, roll or ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-900/80 border border-slate-800 pl-9 md:pl-10 pr-3 md:pr-4 py-2 md:py-3 rounded-xl md:rounded-2xl text-xs md:text-sm text-slate-100 focus:outline-none focus:border-blue-500 backdrop-blur-md" />
              </div>
              
              <div className="flex gap-2 flex-wrap w-full lg:w-auto">
                <input type="file" accept=".csv" ref={fileInputRef} onChange={handleImportCSV} className="hidden" />
                <button onClick={() => fileInputRef.current.click()} className="flex-1 lg:flex-none bg-slate-800 hover:bg-slate-700 text-amber-500 px-3 md:px-4 py-2 md:py-2.5 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-bold flex justify-center items-center gap-1.5 whitespace-nowrap border border-slate-700 transition"><UploadCloud size={14} /> Import</button>
                <button onClick={handleExportCSV} className="flex-1 lg:flex-none bg-slate-800 hover:bg-slate-700 text-emerald-500 px-3 md:px-4 py-2 md:py-2.5 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-bold flex justify-center items-center gap-1.5 whitespace-nowrap border border-slate-700 transition"><FileSpreadsheet size={14} /> Export</button>
                
                <select onChange={(e) => setSelectedClassFilter(e.target.value)} value={selectedClassFilter} className="w-full sm:w-auto bg-slate-900 text-slate-100 border border-slate-700 px-3 md:px-4 py-2 md:py-2.5 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-bold outline-none">
                  <option value="All">All Classes</option>
                  {activeClasses.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                </select>

                {selectedClassFilter !== 'All' && studentStatusTab === 'Active' && (
                  <button onClick={() => handleUpgradeClass(selectedClassFilter)} className="w-full sm:w-auto btn-glow-emerald bg-emerald-600 hover:bg-emerald-500 px-3 md:px-4 py-2 md:py-2.5 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-bold flex justify-center items-center gap-1.5 text-white whitespace-nowrap"><ArrowUpCircle size={14} /> Upgrade</button>
                )}
              </div>
            </div>
            
            <div className="bg-slate-900/70 border border-white/10 rounded-2xl md:rounded-3xl overflow-x-auto shadow-xl backdrop-blur-2xl">
              {getFilteredStudents().length > 0 ? (
                <table className="w-full text-left min-w-[700px]">
                  <thead className="bg-slate-800/50 text-slate-500 text-[10px] md:text-xs uppercase tracking-wider border-b border-slate-700">
                    <tr><th className="p-3 md:p-4">ID & Roll</th><th className="p-3 md:p-4">Name & DOB</th><th className="p-3 md:p-4">Class</th>{studentStatusTab === 'Active' && <th className="p-3 md:p-4">Phone</th>}{studentStatusTab === 'Passout' && <th className="p-3 md:p-4">Passout Year</th>}{studentStatusTab === 'Transferred' && <th className="p-3 md:p-4">Transfer Details</th>}<th className="p-3 md:p-4 text-center">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-[11px] md:text-sm text-slate-300">
                    {getFilteredStudents().map((st) => (
                      <tr key={st.id} className="hover:bg-slate-800/60 transition">
                        <td className="p-3 md:p-4"><p className="font-bold text-blue-500">ID: {st.unique_id || 'N/A'}</p><p className="text-[10px] text-slate-500 font-bold mt-0.5">Roll: #{st.roll_no}</p></td>
                        <td className="p-3 md:p-4"><p className="font-bold text-slate-100">{st.name}</p><p className="text-[9px] md:text-[10px] text-slate-500 mt-0.5">DOB: {st.dob || 'N/A'}</p></td>
                        <td className="p-3 md:p-4"><span className="bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-md text-[10px] font-semibold">{st.student_class}</span></td>
                        
                        {studentStatusTab === 'Active' && <td className="p-3 md:p-4 font-mono">{st.phone || '-'}</td>}
                        {studentStatusTab === 'Passout' && (<td className="p-3 md:p-4"><span className="bg-emerald-500/10 text-emerald-500 font-black px-2.5 py-1 rounded-md text-[10px]">{st.passout_year}</span></td>)}
                        {studentStatusTab === 'Transferred' && (<td className="p-3 md:p-4"><p className="font-bold text-rose-500 text-[10px] md:text-xs">{new Date(st.transfer_date).toLocaleDateString()}</p><p className="text-[9px] text-slate-500 mt-0.5">{st.tc_reason || 'N/A'}</p></td>)}

                        <td className="p-3 md:p-4 flex gap-2 justify-center">
                          {studentStatusTab === 'Active' ? (
                            <>
                              <button title="Status/TC" onClick={() => setStatusModalStudent(st)} className="bg-slate-800 hover:bg-slate-700 text-slate-400 p-1.5 md:p-2 rounded-lg md:rounded-xl transition"><FileOutput size={14} /></button>
                              <button title="Edit" onClick={() => handleEditClick(st)} className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 p-1.5 md:p-2 rounded-lg md:rounded-xl transition"><Edit size={14} /></button>
                            </>
                          ) : (
                            <button onClick={() => setTcPrintData(st)} className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 border border-indigo-500/30 px-2.5 py-1 md:py-1.5 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold transition flex items-center gap-1 md:gap-1.5"><Printer size={12}/> View TC</button>
                          )}
                          {!teacherSession && (
                            <button title="Delete" onClick={() => handleDeleteStudent(st.id, st.student_class)} className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 p-1.5 md:p-2 rounded-lg md:rounded-xl transition"><Trash2 size={14} /></button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 md:p-12 text-slate-500">
                  <Users size={40} className="mb-3 opacity-20" />
                  <p className="text-xs font-semibold">কোনো ডাটা পাওয়া যায়নি!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STAFF TAB */}
        {!teacherSession && activeTab === 'staff' && (
          <div className="space-y-4 md:space-y-6 animate-fade-in w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-3 md:pb-4 gap-3 md:gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2"><Briefcase className="text-purple-500" size={20}/> Staff & Teachers</h2>
                <p className="text-[10px] md:text-xs text-slate-500 mt-1">শিক্ষক ও স্টাফদের অ্যাকাউন্ট ম্যানেজ করুন।</p>
              </div>
              <button onClick={() => { setStaffData({ id: null, name: '', role: 'Teacher', phone: '', password: '', salary: 0, status: 'Active' }); setIsStaffModalOpen(true); }} className="w-full sm:w-auto btn-glow-purple bg-gradient-to-r from-purple-600 to-fuchsia-600 px-4 md:px-5 py-2.5 md:py-2.5 rounded-xl md:rounded-2xl font-bold text-white flex justify-center items-center gap-1.5 md:gap-2 text-xs md:text-sm">
                <Plus size={16}/> Add Staff
              </button>
            </div>
            
            <div className="bg-slate-900/70 border border-white/10 rounded-2xl md:rounded-3xl overflow-x-auto shadow-xl backdrop-blur-2xl">
              <table className="w-full text-left min-w-[650px]">
                <thead className="bg-slate-800/50 text-slate-500 text-[10px] md:text-xs uppercase tracking-wider border-b border-slate-700">
                  <tr><th className="p-3 md:p-4">Name & Role</th><th className="p-3 md:p-4">Login Mobile No</th><th className="p-3 md:p-4">Assigned Password</th><th className="p-3 md:p-4">Salary (₹)</th><th className="p-3 md:p-4 text-center">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-[11px] md:text-sm text-slate-300">
                  {staffList.map((stf) => (
                    <tr key={stf.id} className="hover:bg-slate-800/60 transition">
                      <td className="p-3 md:p-4"><p className="font-bold text-slate-100">{stf.name}</p><p className="text-[9px] text-purple-500 font-black bg-purple-500/10 inline-block px-1.5 py-0.5 rounded mt-1 uppercase tracking-widest">{stf.role}</p></td>
                      <td className="p-3 md:p-4 font-mono font-medium">{stf.phone || '-'}</td>
                      <td className="p-3 md:p-4"><span className="font-mono text-[10px] md:text-xs bg-slate-950 border border-slate-700 px-2 py-0.5 md:px-2.5 md:py-1 rounded-md md:rounded-lg text-amber-500 font-bold">{stf.password || '******'}</span></td>
                      <td className="p-3 md:p-4 font-black text-emerald-500 text-sm md:text-base">₹{stf.salary || 0}</td>
                      <td className="p-3 md:p-4 flex gap-1.5 md:gap-2 justify-center">
                        <button onClick={() => { setStaffData(stf); setIsStaffModalOpen(true); }} className="text-blue-500 p-1.5 md:p-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg md:rounded-xl transition"><Edit size={14} /></button>
                        <button onClick={async () => { if(confirm('Are you sure you want to delete this staff member?')){ await supabase.from('staff').delete().eq('id', stf.id); fetchStaff(); } }} className="text-rose-500 p-1.5 md:p-2 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg md:rounded-xl transition"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CLASS CONFIG TAB */}
        {!teacherSession && activeTab === 'class_mgmt' && (
          <div className="space-y-4 md:space-y-6 animate-fade-in w-full">
            <h2 className="text-xl md:text-2xl font-bold border-b border-white/10 pb-3 md:pb-4 text-slate-100">Academic Configurations</h2>
            
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {classList.map(cls => (
                <button key={cls} onClick={() => fetchClassConfigDetails(cls)} className={`px-4 md:px-5 py-2 md:py-2.5 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-bold whitespace-nowrap transition ${selectedConfigClass === cls ? 'btn-glow-amber bg-amber-600 text-white border border-amber-500' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'}`}>{cls}</button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              <div className="bg-slate-900/70 border border-white/10 p-5 md:p-6 rounded-2xl md:rounded-3xl space-y-4 backdrop-blur-2xl">
                <h3 className="text-base md:text-lg font-bold text-amber-500 flex items-center gap-2"><Calendar size={16}/> Session Settings</h3>
                <div className="grid grid-cols-2 gap-3 md:gap-4 text-[10px] md:text-xs">
                  <div><label className="block text-slate-500 mb-1">Academic Year</label><input type="text" value={classConfig.academic_year || ''} onChange={(e) => setClassConfig({ ...classConfig, academic_year: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-2.5 md:p-3 rounded-xl text-slate-100 font-bold outline-none focus:border-amber-500" /></div>
                  <div>
                    <label className="block text-slate-500 mb-1">Class Start Month</label>
                    <select value={classConfig.start_month || 1} onChange={(e) => setClassConfig({ ...classConfig, start_month: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-2.5 md:p-3 rounded-xl text-slate-100 outline-none focus:border-amber-500">
                      {monthsName.map((m, idx) => (<option key={idx} value={idx + 1}>{m}</option>))}
                    </select>
                  </div>
                </div>
                <h3 className="text-base md:text-lg font-bold text-blue-500 pt-4 border-t border-slate-800 mt-4">Subject & Marks Schema</h3>
                {(classConfig.subjects || []).map((sub, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input type="text" placeholder="Subject Name" value={sub.name || ''} onChange={(e) => { const updated = [...(classConfig.subjects || [])]; updated[idx].name = e.target.value; setClassConfig({ ...classConfig, subjects: updated }); }} className="bg-slate-950 border border-slate-800 p-2 md:p-2.5 rounded-lg text-slate-100 flex-1 text-[10px] md:text-xs outline-none focus:border-blue-500" />
                    <input type="number" placeholder="Oral" title="Oral Max Marks" value={sub.oral || 0} onChange={(e) => { const updated = [...(classConfig.subjects || [])]; updated[idx].oral = parseInt(e.target.value) || 0; setClassConfig({ ...classConfig, subjects: updated }); }} className="bg-slate-950 border border-slate-800 p-2 md:p-2.5 rounded-lg text-slate-100 w-14 md:w-16 text-[10px] md:text-xs text-center outline-none focus:border-blue-500" />
                    <input type="number" placeholder="Theory" title="Theory Max Marks" value={sub.theory || 0} onChange={(e) => { const updated = [...(classConfig.subjects || [])]; updated[idx].theory = parseInt(e.target.value) || 0; setClassConfig({ ...classConfig, subjects: updated }); }} className="bg-slate-950 border border-slate-800 p-2 md:p-2.5 rounded-lg text-slate-100 w-14 md:w-16 text-[10px] md:text-xs text-center outline-none focus:border-blue-500" />
                  </div>
                ))}
                <button type="button" onClick={handleAddSubjectField} className="text-[10px] md:text-xs bg-slate-800 hover:bg-slate-700 text-blue-400 font-bold px-3 md:px-4 py-2 md:py-2.5 rounded-xl transition w-full">+ Add Subject</button>
              </div>
              <div className="bg-slate-900/70 border border-white/10 p-5 md:p-6 rounded-2xl md:rounded-3xl space-y-4 backdrop-blur-2xl">
                <h3 className="text-base md:text-lg font-bold text-emerald-500">Default Fee Structure (₹)</h3>
                <div className="grid grid-cols-2 gap-3 md:gap-4 text-[10px] md:text-xs">
                  <div><label className="block text-slate-500 mb-1">Admission Fee</label><input type="number" value={classConfig.admission_fee || 0} onChange={(e) => setClassConfig({ ...classConfig, admission_fee: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-100 font-bold outline-none focus:border-emerald-500" /></div>
                  <div><label className="block text-slate-500 mb-1">Monthly Tuition Fee</label><input type="number" value={classConfig.tuition_fee || 0} onChange={(e) => setClassConfig({ ...classConfig, tuition_fee: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-100 font-bold outline-none focus:border-emerald-500" /></div>
                  <div><label className="block text-slate-500 mb-1">Term 1 Exam Fee</label><input type="number" value={classConfig.exam1_fee || 0} onChange={(e) => setClassConfig({ ...classConfig, exam1_fee: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-100 outline-none focus:border-emerald-500" /></div>
                  <div><label className="block text-slate-500 mb-1">Term 2 Exam Fee</label><input type="number" value={classConfig.exam2_fee || 0} onChange={(e) => setClassConfig({ ...classConfig, exam2_fee: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-100 outline-none focus:border-emerald-500" /></div>
                  <div><label className="block text-slate-500 mb-1">Term 3 Exam Fee</label><input type="number" value={classConfig.exam3_fee || 0} onChange={(e) => setClassConfig({ ...classConfig, exam3_fee: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-100 outline-none focus:border-emerald-500" /></div>
                  <div><label className="block text-slate-500 mb-1">Custom / Other Fee</label><input type="number" value={classConfig.custom_fee || 0} onChange={(e) => setClassConfig({ ...classConfig, custom_fee: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-100 outline-none focus:border-emerald-500" /></div>
                </div>
              </div>
            </div>
            <button onClick={handleSaveClassConfig} disabled={isProcessing} className="w-full md:w-auto btn-glow-emerald bg-gradient-to-r from-emerald-600 to-teal-600 px-6 md:px-8 py-3 md:py-3.5 rounded-xl md:rounded-2xl text-[11px] md:text-sm font-black text-white transition flex justify-center items-center gap-2">
              {isProcessing ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} Save Configuration
            </button>
          </div>
        )}

        {/* ERP BILLING */}
        {!teacherSession && activeTab === 'erp' && (
          <div className="space-y-5 md:space-y-6 animate-fade-in w-full">
            <h2 className="text-xl md:text-2xl font-bold border-b border-white/10 pb-3 md:pb-4 text-slate-100">Financial Operations & Revenue</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="bg-slate-900/70 border border-white/10 p-5 md:p-6 rounded-2xl md:rounded-3xl flex items-center justify-between shadow-xl backdrop-blur-2xl">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="p-3 md:p-4 bg-emerald-500/15 text-emerald-500 rounded-xl md:rounded-2xl shadow-[0_0_15px_rgba(16,185,129,0.2)]"><DollarSign size={28} className="md:w-8 md:h-8" /></div>
                  <div><p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Revenue</p><h3 className="text-2xl md:text-3xl font-black text-emerald-500 mt-0.5">₹{totalCollectedRevenue}</h3></div>
                </div>
              </div>

              <div className="bg-slate-900/70 border border-white/10 p-5 md:p-6 rounded-2xl md:rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl backdrop-blur-2xl">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="p-3 md:p-4 bg-rose-500/15 text-rose-500 rounded-xl md:rounded-2xl shadow-[0_0_15px_rgba(244,63,94,0.2)]"><AlertCircle size={28} className="md:w-8 md:h-8" /></div>
                  <div><p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-wider">Pending Arrears (Due)</p><h3 className="text-2xl md:text-3xl font-black text-rose-500 mt-0.5">₹{totalPendingDue}</h3></div>
                </div>
                <button onClick={() => setShowOnlyPendingList(!showOnlyPendingList)} className="w-full sm:w-auto bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 px-3 md:px-4 py-2 md:py-2.5 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-bold transition whitespace-nowrap">
                  {showOnlyPendingList ? 'Back to Collection' : 'View Defaulters'}
                </button>
              </div>
            </div>

            {!showOnlyPendingList ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-8">
                <div className="lg:col-span-4 space-y-5 md:space-y-6">
                  <div className="bg-slate-900/70 border border-white/10 p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-xl backdrop-blur-2xl">
                    <div className="space-y-4 md:space-y-5">
                      <div>
                        <label className="text-[10px] md:text-xs text-slate-500 block mb-2 font-bold uppercase tracking-wider">Step 1: Select Class</label>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                          {activeClasses.length > 0 ? activeClasses.map(c => (
                            <button key={c} onClick={() => { setErpSelectedClass(c); setErpStudent(null); }} className={`px-3 md:px-4 py-2 rounded-xl text-[10px] md:text-xs font-bold whitespace-nowrap transition ${erpSelectedClass === c ? 'btn-glow-blue bg-blue-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800'}`}>
                              {c}
                            </button>
                          )) : <p className="text-[10px] md:text-xs text-slate-500">No active classes found.</p>}
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] md:text-xs text-slate-500 block mb-2 font-bold uppercase tracking-wider">Step 2: Select Student</label>
                        <select disabled={!erpSelectedClass} value={erpStudent?.id || ''} onChange={(e) => handleSelectErpStudent(students.find(s => s.id === e.target.value))} className="w-full bg-slate-950 border border-slate-800 p-3 md:p-3.5 rounded-xl md:rounded-2xl text-slate-100 text-[11px] md:text-sm disabled:opacity-50 disabled:cursor-not-allowed outline-none focus:border-blue-500 font-bold">
                          <option value="">Select Student...</option>
                          {students.filter(s => isSameClass(s.student_class, erpSelectedClass) && isStudentActive(s)).map(s => (
                            <option key={s.id} value={s.id}>{s.name} (Roll: #{s.roll_no})</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {erpStudent && (
                      <div className="mt-5 pt-5 border-t border-slate-800 space-y-3 md:space-y-4">
                        <h4 className="text-[11px] md:text-sm font-bold text-amber-500 flex items-center gap-2"><Settings size={14}/> Override Fees</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div><label className="text-[9px] md:text-[10px] text-slate-500 block mb-1">Monthly Fee (₹)</label><input type="number" value={agreedFees.monthly} onChange={e => setAgreedFees({...agreedFees, monthly: e.target.value})} className="w-full bg-slate-950 border border-slate-800 p-2 md:p-2.5 rounded-xl text-slate-100 text-[10px] md:text-xs outline-none focus:border-amber-500 font-bold" /></div>
                          <div><label className="text-[9px] md:text-[10px] text-slate-500 block mb-1">Admission Fee (₹)</label><input type="number" value={agreedFees.admission} onChange={e => setAgreedFees({...agreedFees, admission: e.target.value})} className="w-full bg-slate-950 border border-slate-800 p-2 md:p-2.5 rounded-xl text-slate-100 text-[10px] md:text-xs outline-none focus:border-amber-500 font-bold" /></div>
                        </div>
                        <button onClick={saveAgreedFeesToDB} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-2.5 rounded-xl text-[10px] md:text-xs font-bold transition">Update Fee Profile</button>
                      </div>
                    )}
                  </div>
                </div>

                {erpStudent && erpClassConfig && (
                  <div className="lg:col-span-8 space-y-5 md:space-y-6">
                    <div className="bg-slate-900/70 border border-white/10 p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-xl overflow-x-auto backdrop-blur-2xl">
                      <div className="flex flex-wrap justify-between items-center mb-3 md:mb-4 gap-2">
                        <h3 className="text-sm md:text-base font-bold text-blue-500 flex items-center gap-2"><Calendar size={16}/> Status Tracker ({erpClassConfig.academic_year})</h3>
                        {(() => {
                          const admFee = agreedFees.admission;
                          const admPaid = erpTransactions.filter(tx => tx.fee_type === 'Admission Fee').reduce((s,tx) => s+getPaidAmount(tx), 0);
                          const isPaid = admPaid >= admFee && admFee > 0;
                          return (
                            <div className={`px-2.5 py-1.5 md:px-3 md:py-2 rounded-xl md:rounded-2xl border text-[9px] md:text-[10px] font-bold ${isPaid ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-rose-500/10 text-rose-500 border-rose-500/30'}`}>
                              Admission: {isPaid ? 'PAID' : `DUE (₹${Math.max(0, admFee - admPaid)})`}
                            </div>
                          );
                        })()}
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 md:gap-3 min-w-[400px] md:min-w-0">
                        {monthsName.map((m, idx) => {
                          const statusObj = getMonthlyStatus(idx);
                          return (
                            <div key={idx} className={`p-2 md:p-3 rounded-xl text-center flex flex-col justify-center items-center h-14 md:h-16 border transition ${statusObj.bg} ${statusObj.border}`}>
                              <span className={`text-[9px] md:text-[10px] font-bold ${statusObj.text}`}>{m.substring(0,3)}</span>
                              <span className={`text-[8px] md:text-[9px] mt-0.5 md:mt-1 font-bold px-1.5 md:px-2 py-0.5 rounded-full ${statusObj.badgeBg}`}>{statusObj.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="bg-slate-900/70 border border-white/10 p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-xl space-y-4 md:space-y-6 backdrop-blur-2xl">
                      <h3 className="text-base md:text-lg font-bold text-emerald-500">Payment Collection</h3>
                      <div>
                        <label className="text-[10px] md:text-xs text-slate-500 block mb-2 font-semibold">Select Fees to Pay:</label>
                        <div className="flex flex-wrap gap-2">
                          {feeOptionsList.map(fee => (
                            <button type="button" key={fee} onClick={() => toggleFeeType(fee)} className={`px-3 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-bold border transition ${ erpSelectedFeeTypes.includes(fee) ? 'bg-blue-600 text-white border-blue-500 shadow-md' : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-600' }`}>{fee}</button>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/50 p-4 md:p-5 rounded-xl md:rounded-2xl border border-slate-800">
                        <div>
                          <label className="text-[9px] md:text-[10px] text-slate-500 block mb-1 uppercase tracking-wider font-bold">Total Arrears (Due)</label>
                          <p className="text-xl md:text-2xl font-black text-rose-500">₹{erpBaseAmount}</p>
                        </div>
                        <div>
                          <label className="text-[10px] md:text-xs text-slate-500 block mb-1">Manual Discount (₹)</label>
                          <input type="number" value={erpDiscount} onChange={(e) => setErpDiscount(e.target.value)} className="w-full bg-slate-900 border border-slate-700 p-2 md:p-2.5 rounded-xl text-slate-100 text-[11px] md:text-xs outline-none focus:border-blue-500" />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] md:text-xs text-emerald-500 block mb-1.5 font-bold uppercase tracking-wider">Amount Receiving Now (₹)</label>
                        <input type="number" value={erpPaidAmount} onChange={(e) => setErpPaidAmount(e.target.value)} className="w-full bg-slate-950 border-2 border-emerald-500/50 p-3 md:p-4 rounded-xl md:rounded-2xl text-emerald-500 font-black text-xl md:text-2xl outline-none focus:border-emerald-500 shadow-inner" />
                      </div>
                      <button onClick={handleCreateInvoice} disabled={isProcessing} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 md:py-3.5 rounded-xl md:rounded-2xl font-black text-[11px] md:text-sm transition flex justify-center items-center gap-2 shadow-lg shadow-emerald-600/20">
                        {isProcessing ? <Loader2 className="animate-spin" size={18}/> : <CreditCard size={18}/>} Generate Receipt
                      </button>
                    </div>

                    <div className="bg-slate-900/70 border border-white/10 p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-xl space-y-4 backdrop-blur-2xl">
                      <h3 className="text-base md:text-lg font-bold text-blue-500 flex items-center gap-2">Transaction History</h3>
                      {erpTransactions.length > 0 ? (
                        <div className="overflow-x-auto rounded-xl md:rounded-2xl border border-slate-800">
                          <table className="w-full text-left text-[10px] md:text-xs border-collapse min-w-[450px]">
                            <thead className="bg-slate-800 text-slate-400"><tr><th className="p-2.5 md:p-3">Date</th><th className="p-2.5 md:p-3">Particulars</th><th className="p-2.5 md:p-3 text-right">Paid</th><th className="p-2.5 md:p-3 text-right">Balance</th><th className="p-2.5 md:p-3 text-center">Actions</th></tr></thead>
                            <tbody className="divide-y divide-slate-800 bg-slate-900/40 text-slate-300">
                              {erpTransactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-slate-800/60">
                                  <td className="p-2.5 md:p-3 font-medium">{new Date(tx.created_at).toLocaleDateString()}</td>
                                  <td className="p-2.5 md:p-3 font-bold text-slate-100">{tx.fee_type}</td>
                                  <td className="p-2.5 md:p-3 text-right font-black text-emerald-500">₹{getPaidAmount(tx)}</td>
                                  <td className="p-2.5 md:p-3 text-right font-bold text-rose-500">{tx.pending_amount > 0 ? `₹${tx.pending_amount}` : '-'}</td>
                                  <td className="p-2.5 md:p-3 flex justify-center gap-1.5 md:gap-2">
                                    <button onClick={() => viewReceiptFromHistory(tx)} className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 p-1 md:p-1.5 rounded-lg transition"><Printer size={12} /></button>
                                    <button onClick={() => setEditingTx({ ...tx, paid_amount: getPaidAmount(tx) })} className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 p-1 md:p-1.5 rounded-lg transition"><Edit size={12} /></button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="p-6 md:p-8 border border-slate-700 border-dashed rounded-xl md:rounded-2xl flex flex-col items-center justify-center text-slate-500">
                          <FileText size={24} className="mb-2 opacity-30" />
                          <p className="text-[10px] md:text-xs font-semibold">No transactions recorded yet.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-900/70 border border-white/10 p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-xl backdrop-blur-2xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-5 gap-3">
                  <h3 className="text-base md:text-lg font-bold text-rose-500 border-b border-slate-700 pb-2 w-full sm:w-auto">Defaulters List (Due Fees)</h3>
                  <button onClick={() => setShowOnlyPendingList(false)} className="bg-slate-800 px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold hover:bg-slate-700 transition shadow-sm w-full sm:w-auto">Close List</button>
                </div>
                <div className="overflow-x-auto rounded-xl md:rounded-2xl border border-slate-800">
                  <table className="w-full text-left text-[10px] md:text-xs border-collapse min-w-[500px]">
                    <thead className="bg-slate-800 text-slate-400 uppercase tracking-wider"><tr><th className="p-3 md:p-4">Student Details</th><th className="p-3 md:p-4">Arrears Type</th><th className="p-3 md:p-4 text-right">Amount Due</th><th className="p-3 md:p-4 text-center">Action</th></tr></thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-900/40 text-slate-300">
                      {pendingTransactionsList.map((tx, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/60 transition">
                          <td className="p-3 md:p-4"><p className="font-bold text-slate-100 text-[11px] md:text-sm">{tx.students?.name || 'N/A'}</p><p className="text-[9px] md:text-[10px] text-slate-500 mt-1"><span className="bg-slate-800 px-1.5 py-0.5 rounded">{tx.students?.student_class}</span> Roll: #{tx.students?.roll_no}</p></td>
                          <td className="p-3 md:p-4 font-semibold">{tx.fee_type}</td>
                          <td className="p-3 md:p-4 text-right font-black text-rose-500 text-sm md:text-lg">₹{tx.pending_amount}</td>
                          <td className="p-3 md:p-4 text-center">
                            {tx.students?.phone ? (<a href={`tel:${tx.students.phone}`} className="bg-emerald-500/10 text-emerald-500 px-2.5 md:px-3 py-1.5 md:py-2 rounded-lg md:rounded-xl font-bold inline-flex items-center gap-1 md:gap-1.5 transition"><PhoneCall size={12} /> Call</a>) : <span className="text-slate-600 italic text-[10px]">No Phone</span>}
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

        {/* PVC ID CARD GENERATOR TAB */}
        {activeTab === 'idcard' && (
          <div className="space-y-4 md:space-y-6 animate-fade-in w-full">
            <h2 className="text-xl md:text-2xl font-bold border-b border-white/10 pb-3 md:pb-4 text-slate-100">PVC ID Card System</h2>
            
            <div className="bg-slate-900/70 border border-white/10 p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-xl space-y-5 md:space-y-6 backdrop-blur-2xl">
              <div>
                <label className="text-[10px] md:text-xs text-slate-500 block mb-2 font-bold uppercase tracking-wider">Step 1: Select Class</label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {activeClasses.length > 0 ? activeClasses.map(c => (
                    <button key={c} onClick={() => { setIdSelectedClass(c); setSelectedIdStudent(null); }} className={`px-4 md:px-5 py-2 md:py-2.5 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-bold whitespace-nowrap transition ${idSelectedClass === c ? 'bg-blue-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800'}`}>
                      {c}
                    </button>
                  )) : <p className="text-[10px] md:text-xs text-slate-500">No active students found.</p>}
                </div>
              </div>

              <div>
                <label className="text-[10px] md:text-xs text-slate-500 block mb-2 font-bold uppercase tracking-wider">Step 2: Select Student</label>
                <select disabled={!idSelectedClass} value={selectedIdStudent?.id || ''} onChange={(e) => setSelectedIdStudent(students.find(s => s.id === e.target.value))} className="w-full bg-slate-950 border border-slate-800 p-3 md:p-3.5 rounded-xl md:rounded-2xl text-slate-100 text-[11px] md:text-sm disabled:opacity-50 disabled:cursor-not-allowed outline-none focus:border-blue-500 font-bold">
                  <option value="">Select Student...</option>
                  {students.filter(s => isSameClass(s.student_class, idSelectedClass) && isStudentActive(s)).map(s => (
                    <option key={s.id} value={s.id}>{s.name} (Roll: #{s.roll_no})</option>
                  ))}
                </select>
              </div>

              {selectedIdStudent && (
                <div className="pt-6 md:pt-8 border-t border-slate-800 flex flex-col md:flex-row gap-6 md:gap-10 items-center md:items-start">
                  <div className="pvc-card w-[204px] h-[323px] bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 overflow-hidden relative flex flex-col text-white rounded-2xl border border-indigo-500/30 shadow-2xl shrink-0">
                     <div className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-2 pt-2.5 pb-2 text-center relative z-10 shadow-md">
                         <div className="flex items-center justify-between gap-1 px-1">
                             {school.logo_url ? <img src={school.logo_url} className="w-6 h-6 rounded-full border border-white bg-white object-contain" alt="Logo"/> : <School size={16} className="text-amber-300"/>}
                             <div className="flex-1 truncate">
                                <h2 className="font-black text-[10.5px] uppercase tracking-wide text-amber-300 truncate leading-tight drop-shadow-sm">{school.school_name || 'SCHOOL NAME'}</h2>
                                <p className="text-[5.5px] text-indigo-100 font-medium truncate leading-none mt-0.5">{school.address || 'Institution Address'}</p>
                             </div>
                             <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(portalUrl)}`} className="w-6 h-6 rounded bg-white p-0.5" alt="QR"/>
                         </div>
                     </div>

                     <div className="flex justify-center mt-2 z-10">
                         <div className="p-[2.5px] bg-gradient-to-tr from-amber-400 via-rose-500 to-cyan-400 rounded-full shadow-lg">
                            <img src={selectedIdStudent.photo_url || 'https://via.placeholder.com/150'} className="w-14 h-14 rounded-full object-cover bg-slate-900" alt="Student" />
                         </div>
                     </div>
                     
                     <div className="text-center w-full z-10 mt-1 px-2">
                         <h3 className="font-black text-[12px] leading-tight text-white tracking-wide">{selectedIdStudent.name}</h3>
                         <div className="inline-block mt-0.5">
                           <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-[8px] px-2.5 py-0.5 rounded-full shadow-sm tracking-wide">
                             {selectedIdStudent.student_class} | Roll: #{selectedIdStudent.roll_no}
                           </span>
                         </div>
                     </div>
                     
                     <div className="bg-slate-900/80 backdrop-blur-md mx-2 rounded-xl p-2 text-[7.5px] space-y-1 mt-1.5 z-10 border border-indigo-500/20 shadow-inner">
                         <div className="flex justify-between items-center"><span className="text-slate-400 font-semibold">Student ID:</span> <span className="font-black text-cyan-300">{selectedIdStudent.unique_id}</span></div>
                         <div className="flex justify-between items-center"><span className="text-slate-400 font-semibold">Birth Date:</span> <span className="font-bold text-amber-200">{selectedIdStudent.dob || 'N/A'}</span></div>
                         <div className="flex justify-between items-center"><span className="text-slate-400 font-semibold">Blood Group:</span> <span className="font-black text-rose-400 bg-rose-500/10 px-1 rounded">{selectedIdStudent.blood_group || 'N/A'}</span></div>
                         <div className="flex justify-between items-center"><span className="text-slate-400 font-semibold">Emergency No:</span> <span className="font-bold text-emerald-300 truncate max-w-[80px]">{selectedIdStudent.phone || 'N/A'}</span></div>
                     </div>
                     
                     {selectedIdStudent.unique_id && (
                       <div className="flex justify-center items-center mt-auto mb-2 z-10 bg-white px-2 py-0.5 mx-4 rounded h-6 shadow-sm">
                           <img src={`https://bwipjs-api.metafloor.com/?bcid=code128&text=${selectedIdStudent.unique_id}&scale=2&height=8&includetext=false`} alt="barcode" className="h-full w-full object-contain" />
                       </div>
                     )}
                     <div className="w-full h-1.5 bg-gradient-to-r from-cyan-400 via-blue-500 via-purple-500 to-pink-500"></div>
                  </div>

                  <div className="text-center md:text-left">
                    <h3 className="text-xl md:text-2xl font-black text-slate-100 mb-2 md:mb-3">PVC Print Ready (ISO CR80)</h3>
                    <p className="text-[11px] md:text-sm text-slate-400 mb-4 md:mb-6 max-w-sm leading-relaxed">The card is calibrated for standard ISO CR80 (54x85.6mm) PVC printing. It prints on a single page with vibrant clarity.</p>
                    <button onClick={() => setPrintIdCard(true)} className="w-full md:w-auto bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 px-5 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-white transition flex items-center justify-center gap-2 md:gap-3 shadow-lg shadow-blue-500/20">
                      <Printer size={18} /> Launch PVC Print Layout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SCHOOL PROFILE TAB */}
        {!teacherSession && activeTab === 'profile' && (
          <div className="space-y-4 md:space-y-6 animate-fade-in w-full pb-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-xl md:text-2xl font-bold text-slate-100">School Profile & Branding</h2>
              <button onClick={() => setEditSchool(!editSchool)} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 px-4 md:px-5 py-2 md:py-2.5 rounded-xl md:rounded-2xl text-[11px] md:text-xs font-bold text-white transition flex justify-center items-center gap-1.5 md:gap-2">
                {editSchool ? <><X size={14}/> Cancel</> : <><Edit size={14}/> Edit Profile</>}
              </button>
            </div>

            {editSchool ? (
              <div className="bg-slate-900/70 border border-white/10 p-5 md:p-8 rounded-2xl md:rounded-3xl shadow-xl backdrop-blur-2xl">
                <form onSubmit={handleUpdateSchool} className="space-y-6 md:space-y-8">
                  <div>
                    <h3 className="text-base md:text-lg font-bold text-blue-500 mb-3 md:mb-4 border-b border-slate-700 pb-2">Brand Identity</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div><label className="text-[10px] md:text-xs text-slate-500 block mb-1">School Name *</label><input type="text" value={school.school_name || ''} onChange={(e) => setSchool({ ...school, school_name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-2.5 md:p-3 rounded-xl text-slate-100 font-bold outline-none focus:border-blue-500" required /></div>
                      <div><label className="text-[10px] md:text-xs text-slate-500 block mb-1">Established Year</label><input type="text" value={school.estd_year || ''} onChange={(e) => setSchool({ ...school, estd_year: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-2.5 md:p-3 rounded-xl text-slate-100 outline-none focus:border-blue-500" placeholder="e.g. 2005" /></div>
                      <div><label className="text-[10px] md:text-xs text-slate-500 block mb-1">Logo URL (Direct Image Link)</label><input type="url" value={school.logo_url || ''} onChange={(e) => setSchool({ ...school, logo_url: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-2.5 md:p-3 rounded-xl text-slate-100 outline-none focus:border-blue-500" placeholder="https://...png" /></div>
                      <div><label className="text-[10px] md:text-xs text-slate-500 block mb-1">Cover Photo URL (Banner)</label><input type="url" value={school.cover_url || ''} onChange={(e) => setSchool({ ...school, cover_url: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-2.5 md:p-3 rounded-xl text-slate-100 outline-none focus:border-blue-500" placeholder="https://..." /></div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base md:text-lg font-bold text-amber-500 mb-3 md:mb-4 border-b border-slate-700 pb-2">Academic Info</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                      <div><label className="text-[10px] md:text-xs text-slate-500 block mb-1">Govt. Registration No</label><input type="text" value={school.reg_no || ''} onChange={(e) => setSchool({ ...school, reg_no: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-2.5 md:p-3 rounded-xl text-slate-100 outline-none focus:border-amber-500" /></div>
                      <div><label className="text-[10px] md:text-xs text-slate-500 block mb-1">Education Board</label><input type="text" value={school.board || ''} onChange={(e) => setSchool({ ...school, board: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-2.5 md:p-3 rounded-xl text-slate-100 outline-none focus:border-amber-500" placeholder="e.g. WBBSE, CBSE" /></div>
                      <div>
                        <label className="text-[10px] md:text-xs text-slate-500 block mb-1">Medium</label>
                        <select value={school.medium || ''} onChange={(e) => setSchool({ ...school, medium: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-2.5 md:p-3 rounded-xl text-slate-100 outline-none focus:border-amber-500">
                          <option value="">Select Medium</option><option value="Bengali">Bengali</option><option value="English">English</option><option value="Arabic">Arabic</option>
                        </select>
                      </div>
                      <div className="md:col-span-3"><label className="text-[10px] md:text-xs text-slate-500 block mb-1">Principal / Headmaster Name</label><input type="text" value={school.principal_name || ''} onChange={(e) => setSchool({ ...school, principal_name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-2.5 md:p-3 rounded-xl text-slate-100 outline-none focus:border-amber-500" /></div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base md:text-lg font-bold text-emerald-500 mb-3 md:mb-4 border-b border-slate-700 pb-2">Contact Configuration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div><label className="text-[10px] md:text-xs text-slate-500 block mb-1">Primary Phone</label><input type="text" value={school.phone || ''} onChange={(e) => setSchool({ ...school, phone: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-2.5 md:p-3 rounded-xl text-slate-100 outline-none focus:border-emerald-500" /></div>
                      <div><label className="text-[10px] md:text-xs text-slate-500 block mb-1">Alternate / WhatsApp Phone</label><input type="text" value={school.alternate_phone || ''} onChange={(e) => setSchool({ ...school, alternate_phone: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-2.5 md:p-3 rounded-xl text-slate-100 outline-none focus:border-emerald-500" /></div>
                      <div><label className="text-[10px] md:text-xs text-slate-500 block mb-1">Official Email</label><input type="email" value={school.email || ''} onChange={(e) => setSchool({ ...school, email: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-2.5 md:p-3 rounded-xl text-slate-100 outline-none focus:border-emerald-500" /></div>
                      <div><label className="text-[10px] md:text-xs text-slate-500 block mb-1">Website URL</label><input type="url" value={school.website || ''} onChange={(e) => setSchool({ ...school, website: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-2.5 md:p-3 rounded-xl text-slate-100 outline-none focus:border-emerald-500" /></div>
                      <div className="md:col-span-2"><label className="text-[10px] md:text-xs text-slate-500 block mb-1">Full Postal Address</label><textarea value={school.address || ''} onChange={(e) => setSchool({ ...school, address: e.target.value })} rows="3" className="w-full bg-slate-950 border border-slate-800 p-2.5 md:p-3 rounded-xl text-slate-100 resize-none outline-none focus:border-emerald-500" /></div>
                    </div>
                  </div>

                  <button type="submit" disabled={isProcessing} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 px-5 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-xs md:text-sm text-white transition flex justify-center items-center gap-2 shadow-lg shadow-emerald-500/20">
                    {isProcessing ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} Save Master Settings
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-slate-900/70 border border-white/10 rounded-2xl md:rounded-3xl shadow-xl overflow-hidden relative backdrop-blur-2xl">
                <div className="h-32 md:h-48 w-full bg-slate-800 relative" style={{ backgroundImage: `url(${school.cover_url || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop'})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-85"></div>
                  <div className="absolute top-3 right-3 md:top-4 md:right-4 bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 px-2.5 md:px-3 py-1 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-bold flex items-center gap-1 backdrop-blur-md">
                    <BadgeCheck size={12} /> Verified
                  </div>
                </div>

                <div className="px-5 md:px-10 pb-6 md:pb-8 relative -mt-12 md:-mt-16 flex flex-col md:flex-row gap-4 md:gap-6 items-center md:items-end border-b border-slate-800">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-slate-950 bg-slate-900 shadow-2xl flex items-center justify-center overflow-hidden shrink-0 z-10 relative">
                    {school.logo_url ? <img src={school.logo_url} alt="School Logo" className="w-full h-full object-cover bg-white" /> : <School className="text-slate-500" size={40} />}
                  </div>
                  <div className="text-center md:text-left flex-1 pb-2">
                    <h1 className="text-xl md:text-3xl font-black text-slate-100 tracking-tight">{school.school_name || 'School Name Not Set'}</h1>
                    <p className="text-[11px] md:text-sm text-slate-400 mt-1 font-medium flex items-center justify-center md:justify-start gap-1"><MapPin size={12} className="md:w-[14px] md:h-[14px]"/> {school.address || 'Address not added yet'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 p-5 md:p-10">
                  <div className="bg-slate-950/70 border border-slate-800 p-5 md:p-6 rounded-2xl transition">
                    <h3 className="text-[10px] md:text-xs uppercase tracking-widest font-bold text-slate-500 mb-4 md:mb-5 border-b border-slate-800 pb-2">Contact Details</h3>
                    <div className="space-y-3 md:space-y-4 text-[11px] md:text-sm text-slate-300">
                      <div className="flex items-center gap-2.5 md:gap-3"><PhoneCall size={16} className="text-blue-500" /> <div><p className="text-[9px] md:text-[10px] text-slate-500 font-semibold">Primary Phone</p><p className="font-bold text-slate-100">{school.phone || 'N/A'}</p></div></div>
                      <div className="flex items-center gap-2.5 md:gap-3"><Phone size={16} className="text-amber-500" /> <div><p className="text-[9px] md:text-[10px] text-slate-500 font-semibold">Alternate Phone</p><p className="font-bold text-slate-100">{school.alternate_phone || 'N/A'}</p></div></div>
                      <div className="flex items-center gap-2.5 md:gap-3"><Mail size={16} className="text-emerald-500" /> <div><p className="text-[9px] md:text-[10px] text-slate-500 font-semibold">Email Address</p><p className="font-medium text-slate-100 truncate max-w-[150px] md:max-w-[200px]">{school.email || 'N/A'}</p></div></div>
                      <div className="flex items-center gap-2.5 md:gap-3"><Globe size={16} className="text-indigo-500" /> <div><p className="text-[9px] md:text-[10px] text-slate-500 font-semibold">Website</p><a href={school.website} target="_blank" className="font-medium text-indigo-400 hover:underline truncate max-w-[150px] md:max-w-[200px]">{school.website || 'N/A'}</a></div></div>
                    </div>
                  </div>

                  <div className="bg-slate-950/70 border border-slate-800 p-5 md:p-6 rounded-2xl transition">
                    <h3 className="text-[10px] md:text-xs uppercase tracking-widest font-bold text-slate-500 mb-4 md:mb-5 border-b border-slate-800 pb-2">Academic Information</h3>
                    <div className="space-y-3 md:space-y-4 text-[11px] md:text-sm text-slate-300">
                      <div className="flex items-center gap-2.5 md:gap-3"><FileText size={16} className="text-rose-500" /> <div><p className="text-[9px] md:text-[10px] text-slate-500 font-semibold">Govt. Registration No</p><p className="font-bold text-slate-100">{school.reg_no || 'N/A'}</p></div></div>
                      <div className="flex items-center gap-2.5 md:gap-3"><BookOpen size={16} className="text-blue-500" /> <div><p className="text-[9px] md:text-[10px] text-slate-500 font-semibold">Education Board</p><p className="font-bold text-slate-100">{school.board || 'N/A'}</p></div></div>
                      <div className="flex items-center gap-2.5 md:gap-3"><Globe size={16} className="text-emerald-500" /> <div><p className="text-[9px] md:text-[10px] text-slate-500 font-semibold">Medium of Study</p><p className="font-bold text-slate-100">{school.medium || 'N/A'}</p></div></div>
                      <div className="flex items-center gap-2.5 md:gap-3"><Calendar size={16} className="text-amber-500" /> <div><p className="text-[9px] md:text-[10px] text-slate-500 font-semibold">Established Year</p><p className="font-bold text-slate-100">{school.estd_year || 'N/A'}</p></div></div>
                    </div>
                  </div>

                  <div className="bg-slate-950/70 border border-slate-800 p-5 md:p-6 rounded-2xl transition flex flex-col md:col-span-2 lg:col-span-1">
                    <h3 className="text-[10px] md:text-xs uppercase tracking-widest font-bold text-slate-500 mb-4 md:mb-5 border-b border-slate-800 pb-2">Administration</h3>
                    <div className="flex items-center gap-2.5 md:gap-3 text-slate-300"><UserCheck size={16} className="text-purple-500" /> <div><p className="text-[9px] md:text-[10px] text-slate-500 font-semibold">Principal / Headmaster</p><p className="font-bold text-slate-100">{school.principal_name || 'N/A'}</p></div></div>
                    
                    <div className="mt-auto pt-6">
                      <div className="p-4 bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border border-blue-500/20 rounded-xl relative overflow-hidden backdrop-blur-md">
                        <div className="absolute top-0 right-0 p-3 opacity-10"><School size={40}/></div>
                        <p className="text-[9px] text-blue-400 font-black mb-1 uppercase tracking-wider">System Snapshot</p>
                        <p className="text-[10px] md:text-xs text-slate-400">Total Admitted: <span className="font-bold text-slate-100">{activeStudentsList.length}</span></p>
                        <p className="text-[10px] md:text-xs text-slate-400 mt-0.5 md:mt-1">Active Classes: <span className="font-bold text-slate-100">{activeClasses.length}</span></p>
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
