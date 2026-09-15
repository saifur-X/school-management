/* eslint-disable */
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
  Barcode, CheckCheck, MessageCircle, AlertTriangle, ChevronRight, PieChart, Sun, Moon, Coffee, BookMarked, ShieldAlert,
  Power, Send, Menu
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

  // থিম ও মোবাইল মেনু স্টেট
  const [themeMode, setThemeMode] = useState('dark');
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

  // থিম ইনিশিয়ালাইজ ও টগল
  useEffect(() => {
    const savedTheme = localStorage.getItem('app_portal_theme') || 'dark';
    setThemeMode(savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(newTheme);
    localStorage.setItem('app_portal_theme', newTheme);
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  // Attendance System States
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

  const handleToggleStaffLoginAccess = async (stf) => {
    const currentStatus = stf.status || 'Active';
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    setIsProcessing(true);

    const { error } = await supabase
      .from('staff')
      .update({ status: newStatus })
      .eq('id', stf.id);

    if (!error) {
      showToast(
        newStatus === 'Active' 
          ? `${stf.name} এর লগইন অ্যাক্সেস চালু করা হয়েছে!` 
          : `${stf.name} এর লগইন অ্যাক্সেস বন্ধ করা হয়েছে!`,
        newStatus === 'Active' ? 'success' : 'error'
      );
      fetchStaff();
    } else {
      showToast('Error: ' + error.message, 'error');
    }
    setIsProcessing(false);
  };

  const getStaffWhatsAppCredentialsLink = (stf) => {
    if (!stf.phone) return null;
    const cleanPhone = stf.phone.replace(/[^0-9]/g, '');
    const phoneWithCode = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    
    const message = `নমস্কার ${stf.name},\n${school.school_name || 'আমাদের বিদ্যালয়'}-এর শিক্ষক ও স্টাফ পোর্টালে আপনার লগইন একাউন্ট প্রস্তুত করা হয়েছে।\n\n📌 রোল/পদবী: ${stf.role}\n📱 লগইন মোবাইল: ${stf.phone}\n🔑 পাসওয়ার্ড: ${stf.password || 'অ্যাসাইন করা হয়নি'}\n🌐 পোর্টাল লিংক: ${portalUrl}/login\n\nলগইন পেজে গিয়ে "Teacher" সিলেক্ট করে আপনার মোবাইল ও পাসওয়ার্ড দিয়ে লগইন করুন।\nধন্যবাদান্তে,\n${school.school_name || 'স্কুল কর্তৃপক্ষ'}`;
    
    return `https://wa.me/${phoneWithCode}?text=${encodeURIComponent(message)}`;
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
    if (data) {
      data.forEach(d => { records[d.student_id] = d.status; });
    }
    setAttendanceRecords(records);
  };

  const handleSelectDayType = async (type) => {
    setDayType(type);
    localStorage.setItem(`day_type_${attendanceDate}`, type);
    showToast(`আজকের দিনটি "${type}" হিসেবে চিহ্নিত করা হয়েছে!`);
    try {
      await supabase.from('attendance_day_types').upsert({ date: attendanceDate, day_type: type }, { onConflict: 'date' });
    } catch (e) {
      console.log(e);
    }
  };

  const loadMonthlyAttendance = async () => {
    if (!attendanceMonth) return;
    setIsProcessing(true);
    const startDate = `${attendanceMonth}-01`;
    const endDate = `${attendanceMonth}-31`;
    
    let query = supabase.from('attendance').select('*').gte('date', startDate).lte('date', endDate);
    if (attendanceMode === 'students') {
      query = query.eq('class_name', attendanceClass);
    } else {
      query = query.eq('class_name', 'STAFF');
    }
    const { data } = await query;
    setMonthlyAttendanceData(data || []);
    setIsProcessing(false);
  };

  useEffect(() => {
    if (activeTab === 'attendance') {
      if (attendanceView === 'daily') {
        loadAttendance(attendanceClass, attendanceDate, attendanceMode);
      } else {
        loadMonthlyAttendance();
      }
    }
  }, [attendanceClass, attendanceDate, attendanceMonth, attendanceMode, attendanceView, activeTab]);

  const handleSaveAttendance = async (id, status, isStaff = false) => {
    const newRecords = { ...attendanceRecords, [id]: status };
    setAttendanceRecords(newRecords);
    await supabase.from('attendance').upsert({ 
      student_id: id, 
      class_name: isStaff ? 'STAFF' : attendanceClass, 
      date: attendanceDate, 
      status: status 
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
      payload.push({
        student_id: item.id,
        class_name: attendanceMode === 'students' ? attendanceClass : 'STAFF',
        date: attendanceDate,
        status: 'Present'
      });
    });

    setAttendanceRecords(updated);
    const { error } = await supabase.from('attendance').upsert(payload, { onConflict: 'student_id, date' });
    if (!error) {
      showToast('সবাইকে সফলভাবে Present মার্ক করা হয়েছে!');
    } else {
      showToast('ত্রুটি: ' + error.message, 'error');
    }
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
      payload.push({
        student_id: item.id,
        class_name: attendanceMode === 'students' ? attendanceClass : 'STAFF',
        date: attendanceDate,
        status: 'Leave'
      });
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
      const matched = students.find(s => 
        (s.unique_id && String(s.unique_id) === scannedVal) || 
        String(s.roll_no) === scannedVal
      );

      if (matched) {
        await handleSaveAttendance(matched.id, 'Present', false);
        showToast(`✅ ${matched.name} (Roll #${matched.roll_no}) - Present!`);
      } else {
        showToast('❌ কোনো স্টুডেন্ট খুঁজে পাওয়া যায়নি!', 'error');
      }
    } else {
      const matchedStaff = staffList.find(s => s.phone === scannedVal || String(s.id) === scannedVal);
      if (matchedStaff) {
        await handleSaveAttendance(matchedStaff.id, 'Present', true);
        showToast(`✅ ${matchedStaff.name} - Present!`);
      } else {
        showToast('❌ স্টাফ খুঁজে পাওয়া যায়নি!', 'error');
      }
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
    if (!staffData.name || !staffData.phone || !staffData.password) {
      return showToast('নাম, মোবাইল নম্বর ও পাসওয়ার্ড আবশ্যক!', 'error');
    }
    setIsProcessing(true);
    if (staffData.id) {
      const { error } = await supabase.from('staff').update({ 
        name: staffData.name, 
        role: staffData.role, 
        phone: staffData.phone, 
        password: staffData.password, 
        salary: Number(staffData.salary) || 0, 
        status: staffData.status || 'Active' 
      }).eq('id', staffData.id);
      if (!error) showToast('Staff Member Updated Successfully!');
      else showToast('Error: ' + error.message, 'error');
    } else {
      const { error } = await supabase.from('staff').insert([{ 
        name: staffData.name, 
        role: staffData.role, 
        phone: staffData.phone, 
        password: staffData.password, 
        salary: Number(staffData.salary) || 0, 
        status: staffData.status || 'Active' 
      }]);
      if (!error) showToast('New Staff / Teacher Added Successfully!');
      else showToast('Error: ' + error.message, 'error');
    }
    setIsStaffModalOpen(false); 
    fetchStaff(); 
    setIsProcessing(false);
  };

  const handleSaveNotice = async (e) => {
    e.preventDefault();
    if (!noticeFormData.title || !noticeFormData.content) return showToast('নোটিশের শিরোনাম ও বিস্তারিত আবশ্যক!', 'error');
    setIsProcessing(true);
    const { error } = await supabase.from('notices').insert([{
      title: noticeFormData.title,
      content: noticeFormData.content,
      target_class: noticeFormData.target_class || 'All',
      publish_date: noticeFormData.publish_date || new Date().toISOString().split('T')[0]
    }]);
    if (!error) {
      showToast('নতুন নোটিশ সফলভাবে পাবলিশ হয়েছে!');
      setIsNoticeModalOpen(false);
      setNoticeFormData({ title: '', content: '', target_class: 'All', publish_date: new Date().toISOString().split('T')[0] });
      fetchNotices();
    } else {
      showToast('নোটিশ পাবলিশ ব্যর্থ: ' + error.message, 'error');
    }
    setIsProcessing(false);
  };

  const handleDeleteNotice = async (id) => {
    if (confirm('আপনি কি এই নোটিশটি মুছে ফেলতে চান?')) {
      const { error } = await supabase.from('notices').delete().eq('id', id);
      if (!error) {
        showToast('নোটিশ মুছে ফেলা হয়েছে!');
        fetchNotices();
      } else {
        showToast('Error: ' + error.message, 'error');
      }
    }
  };

  const handleEditClick = (st) => {
    setFormData({ 
      id: st.id, name: st.name, fatherName: st.father_name || '', motherName: st.mother_name || '', 
      dob: st.dob || '', rollNo: st.roll_no, studentClass: st.student_class, phone: st.phone || '', 
      bloodGroup: st.blood_group || '', address: st.address || '', gender: st.gender || 'Male', 
      photoUrl: st.photo_url || '', aadharNo: st.aadhar_no || '', religion: st.religion || '', category: st.category || 'General' 
    });
    setIsEditingStudent(true); 
    setIsAdmissionModalOpen(true);
  };

  const handleDeleteStudent = async (id, className) => {
    if (confirm('স্টুডেন্টের সকল তথ্য পার্মানেন্ট ডিলিট করতে চান?')) {
      await supabase.from('students').delete().eq('id', id);
      const remaining = students.filter(s => isSameClass(s.student_class, className) && s.id !== id && isStudentActive(s));
      for (let i = 0; i < remaining.length; i++) { 
        await supabase.from('students').update({ roll_no: i + 1 }).eq('id', remaining[i].id); 
      }
      showToast('স্টুডেন্ট মুছে ফেলা হয়েছে!'); 
      fetchData();
    }
  };

  const handleUpgradeClass = async (currentClass) => {
    if (currentClass === 'Class 12') {
      if (confirm(`Class 12-এর সবাইকে Passout করে Alumni লিস্টে পাঠাতে চান?`)) {
        const classSts = students.filter(s => isSameClass(s.student_class, currentClass) && isStudentActive(s));
        const currentYear = new Date().getFullYear().toString();
        Promise.all(classSts.map(async (st) => { 
          await supabase.from('students').update({ status: 'Passout', passout_year: currentYear }).eq('id', st.id); 
        })).then(() => { 
          showToast('সকল স্টুডেন্ট Passout হয়েছে!'); 
          fetchData(); 
        });
      } return;
    }
    const nextClassMap = { 'Nursery':'KG', 'KG':'Class 1', 'Class 1':'Class 2', 'Class 2':'Class 3', 'Class 3':'Class 4', 'Class 4':'Class 5', 'Class 5':'Class 6', 'Class 6':'Class 7', 'Class 7':'Class 8', 'Class 8':'Class 9', 'Class 9':'Class 10', 'Class 10':'Class 11', 'Class 11':'Class 12' };
    const targetClass = nextClassMap[currentClass] || 'Higher Class';
    if (confirm(`${currentClass} এর সবাইকে ${targetClass} এ প্রমোট করতে চান?`)) {
      const classSts = students.filter(s => isSameClass(s.student_class, currentClass) && isStudentActive(s));
      Promise.all(classSts.map(async (st, idx) => { 
        await supabase.from('students').update({ student_class: targetClass, roll_no: idx + 1 }).eq('id', st.id); 
      })).then(() => { 
        showToast('ক্লাস আপগ্রেড সম্পন্ন হয়েছে!'); 
        fetchData(); 
      });
    }
  };

  const handleChangeStatus = async () => {
    if (!statusModalStudent) return; 
    setIsProcessing(true);
    let payload = statusAction === 'Passout' ? { status: 'Passout', passout_year: new Date().getFullYear().toString() } : { status: 'Transferred', transfer_date: new Date().toISOString(), tc_reason: statusReason };
    const { error } = await supabase.from('students').update(payload).eq('id', statusModalStudent.id);
    if (!error) { 
      showToast(`স্টুডেন্ট ${statusAction} হিসেবে সেভ হয়েছে!`); 
      setStatusModalStudent(null); 
      fetchData(); 
    } else showToast('Error: ' + error.message, 'error');
    setIsProcessing(false);
  };

  const resetStudentForm = () => { 
    setFormData({ 
      id: null, name: '', fatherName: '', motherName: '', dob: '', rollNo: getNextRollForClass('Class 1'), 
      studentClass: 'Class 1', phone: '', bloodGroup: '', address: '', gender: 'Male', photoUrl: '', aadharNo: '', religion: '', category: 'General' 
    }); 
    setIsEditingStudent(false); 
    setIsAdmissionModalOpen(false);
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
    const link = document.createElement("a"); 
    link.setAttribute("href", url); 
    link.setAttribute("download", `Students_Record_${new Date().toLocaleDateString('en-GB')}.csv`);
    document.body.appendChild(link); 
    link.click(); 
    document.body.removeChild(link);
    showToast('ডাটা সফলভাবে এক্সপোর্ট হয়েছে!');
  };

  const handleImportCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      setIsProcessing(true);
      const text = e.target.result;
      const rows = text.split('\n').slice(1);
      let count = 0;
      for (let row of rows) {
        if (!row.trim()) continue;
        const cols = row.split(',').map(col => col.replace(/(^"|"$)/g, '').trim());
        if (cols.length >= 3) {
          const cls = cols[1] || 'Class 1';
          const roll = getNextRollForClass(cls) + count; 
          await supabase.from('students').insert([{ name: cols[0], student_class: cls, dob: cols[2] || '2010-01-01', father_name: cols[3] || '', phone: cols[4] || '', roll_no: roll, status: 'Active' }]);
          count++;
        }
      }
      showToast(`${count} Students Imported Successfully!`);
      fetchData(); 
      setIsProcessing(false); 
      event.target.value = null;
    };
    reader.readAsText(file);
  };

  const fetchClassConfigDetails = async (cls) => {
    setSelectedConfigClass(cls); 
    const data = allClassConfigs[cls];
    if (data) { 
      setClassConfig({ ...data, academic_year: data.academic_year || '2026', start_month: data.start_month || 1, subjects: data.subjects || [] }); 
    } else { 
      setClassConfig({ academic_year: '2026', start_month: 1, subjects: [], admission_fee: 1000, tuition_fee: 500, exam1_fee: 200, exam2_fee: 200, exam3_fee: 200, custom_fee: 0 }); 
    }
  };
  
  const handleSaveClassConfig = async () => {
    setIsProcessing(true);
    const { error } = await supabase.from('class_configs').upsert({ 
      class_name: selectedConfigClass, academic_year: classConfig.academic_year, 
      start_month: parseInt(classConfig.start_month) || 1, subjects: classConfig.subjects || [], 
      admission_fee: Number(classConfig.admission_fee)||0, tuition_fee: Number(classConfig.tuition_fee)||0, 
      exam1_fee: Number(classConfig.exam1_fee)||0, exam2_fee: Number(classConfig.exam2_fee)||0, 
      exam3_fee: Number(classConfig.exam3_fee)||0, custom_fee: Number(classConfig.custom_fee)||0 
    }, { onConflict: 'class_name' });
    if (!error) { showToast('Class Config সেভ হয়েছে!'); loadClassConfigs(); }
    setIsProcessing(false);
  };

  const handleAddSubjectField = () => { 
    setClassConfig({ ...classConfig, subjects: [...(classConfig.subjects || []), { name: '', oral: 20, theory: 80 }] }); 
  };

  const handleSelectErpStudent = async (st) => {
    setErpStudent(st); 
    if (!st) return;
    const { data: txData } = await supabase.from('erp_transactions').select('*').eq('student_id', st.id).order('created_at', { ascending: false });
    setErpTransactions(txData || []);
    const cConfig = allClassConfigs[st.student_class] || {}; 
    setErpClassConfig(cConfig);
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
    setErpBaseAmount(totalDue); 
    setErpPaidAmount(totalDue); 
    setErpDiscount(0);
  };

  const toggleFeeType = (feeType) => {
    let updated = [...erpSelectedFeeTypes]; 
    if (updated.includes(feeType)) updated = updated.filter(t => t !== feeType); 
    else updated.push(feeType);
    if (updated.length === 0) updated = ['Tuition Fee']; 
    setErpSelectedFeeTypes(updated); 
    calculateTotalDues(updated, erpClassConfig, agreedFees.monthly, agreedFees.admission, erpTransactions);
  };

  const handleCreateInvoice = async () => {
    if (!erpStudent || erpSelectedFeeTypes.length === 0 || Number(erpPaidAmount) <= 0) return showToast('সঠিক তথ্য দিন!', 'error');
    setIsProcessing(true);
    const transactionsToInsert = []; 
    const receiptItems = []; 
    const globalDiscount = Number(erpDiscount); 
    let discountApplied = false; 
    let remainingPayment = Number(erpPaidAmount);

    for (let i = 0; i < erpSelectedFeeTypes.length; i++) {
      const feeType = erpSelectedFeeTypes[i];
      const payable = getExpectedAmountForFee(feeType, erpClassConfig, agreedFees.monthly, agreedFees.admission);
      const alreadyPaid = erpTransactions.filter(tx => tx.fee_type === feeType).reduce((s, tx) => s + getPaidAmount(tx), 0);
      const due = Math.max(0, payable - alreadyPaid);
      let allocateAmount = (feeType === 'Tuition Fee' || i === erpSelectedFeeTypes.length - 1) ? remainingPayment : Math.min(remainingPayment, due);
      if (allocateAmount > 0 || (!discountApplied && globalDiscount > 0)) {
        let appliedDisc = (!discountApplied && globalDiscount > 0) ? globalDiscount : 0; 
        discountApplied = appliedDisc > 0 ? true : discountApplied;
        const netPayable = payable - appliedDisc; 
        const newTotal = alreadyPaid + allocateAmount; 
        const pending = Math.max(0, netPayable - newTotal);
        transactionsToInsert.push({ student_id: erpStudent.id, fee_type: feeType, amount: payable, discount: appliedDisc, final_amount: netPayable, paid_amount: allocateAmount, pending_amount: pending, status: (newTotal >= netPayable) ? 'Paid' : 'Pending' });
        receiptItems.push({ feeType, base: payable, discount: appliedDisc, net: netPayable, paid: allocateAmount });
        remainingPayment -= allocateAmount;
      }
    }
    const { error } = await supabase.from('erp_transactions').insert(transactionsToInsert);
    if (!error) {
      setReceiptData({ invoiceNo: 'INV-' + Math.floor(100000 + Math.random() * 900000), date: new Date().toLocaleDateString('en-GB'), student: erpStudent, items: receiptItems, totalPaid: Number(erpPaidAmount) });
      showToast('রসিদ তৈরি হয়েছে!'); 
      handleSelectErpStudent(erpStudent); 
      fetchData(); 
      setErpPaidAmount(0); 
      setErpDiscount(0);
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
    if (!error) { 
      showToast('পেমেন্ট সফলভাবে আপডেট হয়েছে!'); 
      setEditingTx(null); 
      await fetchData(); 
      handleSelectErpStudent(erpStudent); 
    }
    setIsProcessing(false);
  };

  const saveAgreedFeesToDB = async () => {
    if (!erpStudent) return;
    const { error } = await supabase.from('students').update({ agreed_monthly_fee: Number(agreedFees.monthly), agreed_admission_fee: Number(agreedFees.admission) }).eq('id', erpStudent.id);
    if (!error) { 
      showToast("এই স্টুডেন্টের নির্দিষ্ট ফিস প্রোফাইল সেভ হয়েছে!"); 
      setErpStudent({...erpStudent, agreed_monthly_fee: Number(agreedFees.monthly), agreed_admission_fee: Number(agreedFees.admission)}); 
      fetchData(); 
      calculateTotalDues(erpSelectedFeeTypes, erpClassConfig, Number(agreedFees.monthly), Number(agreedFees.admission), erpTransactions); 
    }
  };

  const viewReceiptFromHistory = (tx) => {
    const paidAmt = getPaidAmount(tx);
    setReceiptData({ 
      invoiceNo: tx.id ? tx.id.substring(0, 8).toUpperCase() : 'INV-HIST', 
      date: new Date(tx.created_at).toLocaleDateString('en-GB'), 
      student: erpStudent, 
      items: [{ feeType: tx.fee_type, base: tx.amount, discount: tx.discount, net: tx.final_amount, paid: paidAmt }], 
      totalPaid: paidAmt 
    });
  };

  const getMonthlyStatus = (monthIndex, studentObj = null, txData = null, cConfig = null) => {
    const config = cConfig || erpClassConfig; 
    const tx = txData || erpTransactions; 
    const st = studentObj || erpStudent;
    const currentMonth = new Date().getMonth(); 
    const startM = (config?.start_month || 1) - 1; 
    if (monthIndex < startM) return { label: 'N/A', bg: 'bg-slate-900', text: 'text-slate-600', border: 'border-slate-800', badgeBg: 'bg-slate-800' };
    const totalTuitionPaid = tx.filter(t => t.fee_type === 'Tuition Fee').reduce((s, t) => s + getPaidAmount(t), 0);
    const feePerMonth = (st?.agreed_monthly_fee !== null && st?.agreed_monthly_fee !== "") ? Number(st.agreed_monthly_fee) : Number(config?.tuition_fee || 0);
    const availableForThisMonth = Math.max(0, totalTuitionPaid - ((monthIndex - startM) * feePerMonth));
    if (availableForThisMonth >= feePerMonth) return { label: 'Paid', subText: `₹${feePerMonth}`, bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', badgeBg: 'bg-emerald-500/20' };
    if (availableForThisMonth > 0) return { label: 'Partial', subText: `Paid: ₹${availableForThisMonth}`, bg: 'bg-lime-500/10', text: 'text-lime-400', border: 'border-lime-500/40', badgeBg: 'bg-lime-500/20' };
    if (monthIndex <= currentMonth) return { label: 'Due', subText: `Due: ₹${feePerMonth}`, bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30', badgeBg: 'bg-rose-500/20' };
    return { label: 'Upcoming', bg: 'bg-slate-800/50', text: 'text-slate-300', border: 'border-slate-700', badgeBg: 'bg-slate-700' };
  };

  const isDark = themeMode === 'dark';

  // ডাইনামিক থিম ও রেসপনসিভ সিএসএস
  const sharedGlobalStyle = (
    <style dangerouslySetInnerHTML={{ __html: `
      .scrollbar-hide::-webkit-scrollbar { display: none; }
      .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

      @keyframes dynamicMeshDark {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }

      @keyframes dynamicMeshLight {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }

      .animated-mesh-bg {
        ${isDark 
          ? `background: linear-gradient(-45deg, #090e1a, #161233, #0b1f3a, #1d102e, #071929, #140d28) !important;` 
          : `background: linear-gradient(-45deg, #f8fafc, #eef2ff, #f3e8ff, #ecfdf5, #f1f5f9) !important;`}
        background-size: 350% 350% !important;
        animation: dynamicMeshDark 16s ease infinite !important;
      }

      @keyframes floatGlowOrb {
        0%, 100% { transform: translateY(0px) scale(1) rotate(0deg); }
        50% { transform: translateY(-30px) scale(1.12) rotate(180deg); }
      }
      .orb-float-anim-1 { animation: floatGlowOrb 12s ease-in-out infinite; }
      .orb-float-anim-2 { animation: floatGlowOrb 16s ease-in-out infinite reverse; }
      .orb-float-anim-3 { animation: floatGlowOrb 14s ease-in-out infinite 3s; }

      .btn-glow-blue {
        box-shadow: 0 0 16px -1px rgba(59, 130, 246, 0.45);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .btn-glow-blue:hover {
        box-shadow: 0 0 28px 3px rgba(59, 130, 246, 0.75);
        transform: translateY(-2px);
      }
      .btn-glow-emerald {
        box-shadow: 0 0 16px -1px rgba(16, 185, 129, 0.45);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .btn-glow-emerald:hover {
        box-shadow: 0 0 28px 3px rgba(16, 185, 129, 0.75);
        transform: translateY(-2px);
      }
      .btn-glow-amber {
        box-shadow: 0 0 16px -1px rgba(245, 158, 11, 0.45);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .btn-glow-amber:hover {
        box-shadow: 0 0 28px 3px rgba(245, 158, 11, 0.75);
        transform: translateY(-2px);
      }
      .btn-glow-purple {
        box-shadow: 0 0 16px -1px rgba(168, 85, 247, 0.45);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .btn-glow-purple:hover {
        box-shadow: 0 0 28px 3px rgba(168, 85, 247, 0.75);
        transform: translateY(-2px);
      }
      .btn-glow-rose {
        box-shadow: 0 0 16px -1px rgba(244, 63, 94, 0.45);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .btn-glow-rose:hover {
        box-shadow: 0 0 28px 3px rgba(244, 63, 94, 0.75);
        transform: translateY(-2px);
      }

      .school-brand-title {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: linear-gradient(135deg, #0284c7 0%, #ec4899 50%, #f59e0b 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-shadow: 0 0 30px rgba(236, 72, 153, 0.25);
      }

      @media print {
        .no-print { display: none !important; }
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        ${receiptData || tcPrintData || selectedNoticeToPrint ? `
          @page { size: A4 portrait; margin: 12mm; } 
          body { background: white !important; color: black !important; } 
          aside, main, header, nav { display: none !important; }
        ` : ''}
        ${printIdCard ? `
          @page { size: 54mm 85.6mm; margin: 0mm !important; } 
          html, body { width: 54mm !important; height: 85.6mm !important; max-height: 85.6mm !important; margin: 0 !important; padding: 0 !important; overflow: hidden !important; background: #ffffff !important; } 
          aside, main, nav, header { display: none !important; } 
          .pvc-modal-overlay { position: fixed !important; top: 0 !important; left: 0 !important; width: 54mm !important; height: 85.6mm !important; max-height: 85.6mm !important; background: none !important; padding: 0 !important; margin: 0 !important; display: flex !important; align-items: center !important; justify-content: center !important; overflow: hidden !important; } 
          .pvc-card { width: 54mm !important; height: 85.6mm !important; max-height: 85.6mm !important; border: none !important; border-radius: 0 !important; margin: 0 !important; padding: 2.2mm !important; box-sizing: border-box !important; box-shadow: none !important; overflow: hidden !important; }
        ` : ''}
      }
    `}} />
  );

  // ডাইনামিক ক্লাস ভেরিয়েবল
  const cardBg = isDark ? 'bg-slate-900/75 border-white/10 text-white shadow-2xl' : 'bg-white/85 border-slate-200/90 text-slate-800 shadow-xl shadow-slate-200/50';
  const subCardBg = isDark ? 'bg-slate-950/80 border-white/10 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700';
  const inputBg = isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-500';
  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-600';
  const textMuted = isDark ? 'text-slate-500' : 'text-slate-400';
  const tableHeaderBg = isDark ? 'bg-slate-800/60 text-slate-300 border-white/10' : 'bg-slate-100/90 text-slate-700 border-slate-200';
  const tableRowHover = isDark ? 'hover:bg-white/5 divide-white/5' : 'hover:bg-slate-50/80 divide-slate-100';

  const currentAttendanceTargetList = attendanceMode === 'students' 
    ? students.filter(s => isSameClass(s.student_class, attendanceClass) && isStudentActive(s))
    : staffList.filter(s => !s.status || s.status.trim().toLowerCase() === 'active');

  const presentCount = Object.values(attendanceRecords).filter(v => v === 'Present').length;
  const absentCount = Object.values(attendanceRecords).filter(v => v === 'Absent').length;
  const lateCount = Object.values(attendanceRecords).filter(v => v === 'Late').length;
  const leaveCount = Object.values(attendanceRecords).filter(v => v === 'Leave').length;
  const attendanceRate = currentAttendanceTargetList.length > 0 
    ? Math.round(((presentCount + lateCount) / currentAttendanceTargetList.length) * 100) 
    : 0;

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
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'idcard', label: 'ID Card', icon: CreditCard },
  ] : [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'staff', label: 'Staff & Teachers', icon: Briefcase },
    { id: 'class_mgmt', label: 'Class Config', icon: Settings },
    { id: 'erp', label: 'ERP & Billing', icon: DollarSign },
    { id: 'idcard', label: 'PVC ID Card', icon: CreditCard },
    { id: 'profile', label: 'School Profile', icon: Building },
  ];

  if (!session && !studentSession && !teacherSession) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <Loader2 className="animate-spin mr-2 text-cyan-400"/> Loading Portal...
      </div>
    );
  }

  // ==============================================================
  // STUDENT PORTAL VIEW (THEMED & MOBILE RESPONSIVE)
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
      <div className={`min-h-screen animated-mesh-bg font-sans p-4 md:p-8 relative overflow-hidden ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
        {sharedGlobalStyle}
        
        <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 relative z-10">
          
          {/* টপ হেডার ও থিম সুইচার */}
          <div className={`${cardBg} p-5 md:p-7 rounded-3xl backdrop-blur-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>
            <div className="flex items-center gap-4">
              {school.logo_url ? (
                <img src={school.logo_url} alt="Logo" className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white object-contain p-1 border-2 border-indigo-500 shadow-md shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shrink-0">
                  <School size={28} className="text-white"/>
                </div>
              )}
              <div>
                <h1 className="text-xl md:text-3xl font-black school-brand-title leading-tight">
                  {school.school_name || 'My School Portal'}
                </h1>
                <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1 text-xs text-slate-400 font-medium">
                  {school.address && <span className="flex items-center gap-1"><MapPin size={12} className="text-cyan-500"/> {school.address}</span>}
                  {school.phone && <span className="flex items-center gap-1 font-mono text-emerald-500"><PhoneCall size={12}/> {school.phone}</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-white/10">
              <button 
                onClick={toggleTheme} 
                className={`p-2.5 rounded-2xl transition flex items-center gap-2 text-xs font-bold ${isDark ? 'bg-slate-800/80 hover:bg-slate-700 text-amber-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                title="Toggle Theme"
              >
                {isDark ? <Sun size={16}/> : <Moon size={16}/>}
                <span className="md:hidden">{isDark ? 'Light' : 'Dark'}</span>
              </button>
              <button onClick={handleLogout} className="btn-glow-rose bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 px-4 py-2.5 rounded-2xl font-bold flex items-center gap-1.5 text-xs transition"><LogOut size={15}/> Logout</button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-blue-600 to-indigo-700 p-5 rounded-3xl shadow-xl text-white flex items-center gap-4">
              <img src={studentSession.photo_url || 'https://via.placeholder.com/150'} className="w-16 h-16 rounded-full border-2 border-white/30 object-cover shadow" />
              <div>
                <h2 className="text-base font-black truncate">{studentSession.name}</h2>
                <p className="text-xs text-blue-200">{studentSession.student_class} | Roll: #{studentSession.roll_no}</p>
                <p className="text-[10px] font-bold bg-black/30 inline-block px-2.5 py-0.5 rounded-full mt-1.5">ID: {studentSession.unique_id}</p>
              </div>
            </div>
            
            <div className={`${cardBg} p-5 rounded-3xl flex flex-col justify-center backdrop-blur-2xl`}>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Attendance Rate</p>
              <h3 className={`text-3xl font-black mt-1 ${attendancePct >= 75 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {attendancePct}%
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">{presents} of {totalWorkingDays} days present</p>
            </div>

            <div className={`${cardBg} p-5 rounded-3xl flex flex-col justify-center backdrop-blur-2xl`}>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Fees Paid</p>
              <h3 className="text-3xl font-black text-emerald-500 mt-1">₹{totalPaid}</h3>
            </div>

            <div className={`${cardBg} p-5 rounded-3xl flex flex-col justify-center backdrop-blur-2xl`}>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Current Dues</p>
              <h3 className="text-3xl font-black text-rose-500 mt-1">₹{totalDue}</h3>
            </div>
          </div>

          {/* নোটিশ বোর্ড */}
          <div className={`${cardBg} p-5 md:p-6 rounded-3xl space-y-4 backdrop-blur-2xl`}>
            <h3 className="text-base font-bold text-amber-500 flex items-center gap-2"><Megaphone size={18}/> Published School Notices</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studentNotices.length > 0 ? studentNotices.map((n) => (
                <div key={n.id} className={`${subCardBg} p-4 rounded-2xl flex flex-col justify-between space-y-3`}>
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-sm leading-snug">{n.title}</h4>
                      <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap">{n.publish_date}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed whitespace-pre-line line-clamp-3">{n.content}</p>
                  </div>
                  <button onClick={() => setSelectedNoticeToPrint(n)} className="btn-glow-blue bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 w-fit">
                    <Download size={13}/> Download Official PDF
                  </button>
                </div>
              )) : (
                <p className="text-xs text-slate-400 col-span-2 text-center py-6">কোনো নোটিশ এখনো প্রকাশিত হয়নি।</p>
              )}
            </div>
          </div>

          {/* ফি ও রেজাল্ট */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${cardBg} p-5 md:p-6 rounded-3xl backdrop-blur-2xl`}>
              <h3 className="text-base font-bold text-blue-500 mb-4 flex items-center gap-2"><Calendar size={18}/> Month-wise Tuition Status</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {monthsName.map((m, idx) => {
                  const statusObj = getMonthlyStatus(idx, studentSession, studentPortalData.tx, config);
                  return (
                    <div key={idx} className={`p-2.5 rounded-2xl text-center flex flex-col justify-center items-center h-18 border transition ${statusObj.bg} ${statusObj.border}`}>
                      <span className={`text-xs font-bold ${statusObj.text}`}>{m.substring(0,3)}</span>
                      <span className={`text-[9px] mt-1 font-bold px-2 py-0.5 rounded-full ${statusObj.badgeBg}`}>{statusObj.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={`${cardBg} p-5 md:p-6 rounded-3xl backdrop-blur-2xl`}>
              <h3 className="text-base font-bold text-amber-500 mb-4 flex items-center gap-2"><FileText size={18}/> Academic Report Cards</h3>
              {studentPortalData.marks.length > 0 ? (
                <div className="space-y-3">
                  {studentPortalData.marks.map((mRecord, i) => (
                    <div key={i} className={`${subCardBg} p-3.5 rounded-2xl`}>
                      <p className="text-xs font-bold text-amber-400 mb-2">{mRecord.exam_name}</p>
                      <div className="space-y-1.5">
                        {Object.keys(mRecord.marks_data || {}).filter(k => k.includes('_theory')).map(key => {
                          const subName = key.split('_')[0];
                          const theory = mRecord.marks_data[`${subName}_theory`] || 0;
                          const oral = mRecord.marks_data[`${subName}_oral`] || 0;
                          return (
                            <div key={subName} className="flex justify-between items-center text-xs border-b border-white/5 pb-1">
                              <span className="font-medium text-slate-300">{subName}</span>
                              <span className="font-bold bg-white/10 px-2 py-0.5 rounded">Score: {theory + oral}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-6">কোনো পরীক্ষার রেজাল্ট এখনো প্রকাশিত হয়নি।</p>
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
  return (
    <div className={`flex flex-col md:flex-row min-h-screen animated-mesh-bg font-sans relative overflow-hidden pb-16 md:pb-0 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
      {sharedGlobalStyle}

      {/* মোবাইল টপ হেডার (PROFESSIONAL MOBILE APP HEADER) */}
      <header className={`md:hidden flex items-center justify-between p-4 ${isDark ? 'bg-slate-900/90 border-b border-white/10' : 'bg-white/90 border-b border-slate-200'} backdrop-blur-xl sticky top-0 z-30 shadow-md`}>
        <div className="flex items-center gap-3 overflow-hidden">
          {school.logo_url ? (
            <img src={school.logo_url} alt="Logo" className="w-9 h-9 rounded-xl object-contain bg-white p-0.5 border border-indigo-500 shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 text-white font-bold">
              <School size={18}/>
            </div>
          )}
          <div className="truncate">
            <h1 className="text-sm font-black school-brand-title truncate leading-tight">{school.school_name || 'Smart EduAdmin'}</h1>
            <p className="text-[10px] text-slate-400 truncate">{teacherSession ? `Teacher: ${teacherSession.name}` : 'Portal'}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button 
            onClick={toggleTheme} 
            className={`p-2 rounded-xl transition ${isDark ? 'bg-slate-800 text-amber-300' : 'bg-slate-100 text-slate-700'}`}
            title="Switch Theme"
          >
            {isDark ? <Sun size={17}/> : <Moon size={17}/>}
          </button>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className={`p-2 rounded-xl ${isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-800'}`}
          >
            {isMobileMenuOpen ? <X size={20}/> : <Menu size={20}/>}
          </button>
        </div>
      </header>

      {/* মোবাইল স্লাইড-ইন ড্রয়ার মেনু (MOBILE DRAWER) */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex">
          <div className={`w-4/5 max-w-xs ${isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'} h-full p-6 flex flex-col justify-between shadow-2xl overflow-y-auto`}>
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Navigation Menu</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-1.5 rounded-lg bg-slate-800 text-slate-400"><X size={16}/></button>
              </div>
              <nav className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button 
                      key={item.id} 
                      onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }} 
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${activeTab === item.id ? 'bg-blue-600 text-white' : 'hover:bg-slate-800/40 text-slate-400'}`}
                    >
                      <Icon size={16} />{item.label}
                    </button>
                  );
                })}
                <button 
                  onClick={() => { router.push('/mark-entry'); setIsMobileMenuOpen(false); }} 
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition mt-2"
                >
                  <FileSpreadsheet size={16} />Mark Entry & Report
                </button>
              </nav>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-2">
              <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10"><LogOut size={15}/> Logout</button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)}></div>
        </div>
      )}

      {/* ডেস্কটপ সাইডবার (DESKTOP SIDEBAR WITH THEME SWITCH) */}
      <aside className={`hidden md:flex w-72 lg:w-80 ${isDark ? 'bg-slate-900/80 border-white/10' : 'bg-white/85 border-slate-200 shadow-xl'} backdrop-blur-2xl border-r p-6 flex-col justify-between relative z-20 shrink-0`}>
        <div>
          {/* স্কুল কার্ড ও ব্র্যান্ডিং */}
          <div className={`p-4 rounded-3xl ${subCardBg} mb-5 shadow-inner backdrop-blur-md`}>
            <div className="flex items-center gap-3 mb-2.5">
              {school.logo_url ? (
                <img src={school.logo_url} alt="Logo" className="w-12 h-12 rounded-2xl object-cover bg-white p-1 shadow border border-indigo-500 shrink-0" />
              ) : (
                <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2.5 rounded-2xl shadow text-white shrink-0">
                  <School size={22} />
                </div>
              )}
              <div className="overflow-hidden">
                <h1 className="text-base font-black school-brand-title truncate leading-snug">
                  {school.school_name || 'EduAdmin'}
                </h1>
                <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
                  {teacherSession ? `Teacher: ${teacherSession.name}` : 'Admin Portal'}
                </p>
              </div>
            </div>

            <div className="space-y-1 pt-2 border-t border-white/10 text-[10.5px] text-slate-400">
              {school.address && <p className="truncate flex items-center gap-1.5"><MapPin size={11} className="text-cyan-400 shrink-0"/> {school.address}</p>}
              {school.phone && <p className="font-mono text-emerald-400 flex items-center gap-1.5"><PhoneCall size={11} className="shrink-0"/> {school.phone}</p>}
            </div>
          </div>
          
          <nav className="space-y-1.5 max-h-[50vh] overflow-y-auto scrollbar-hide pr-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button 
                  key={item.id} 
                  onClick={() => setActiveTab(item.id)} 
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${ activeTab === item.id ? 'btn-glow-blue bg-gradient-to-r from-blue-600 to-indigo-600 text-white scale-[1.02]' : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'}`}
                >
                  <Icon size={16} />{item.label}
                </button>
              );
            })}
            <button onClick={() => router.push('/mark-entry')} className="btn-glow-emerald w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition mt-2">
              <FileSpreadsheet size={16} />Mark Entry & Report
            </button>
          </nav>
        </div>

        {/* থিম সুইচার ও লগআউট বাটন */}
        <div className="pt-4 border-t border-white/10 space-y-2 mt-4">
          <button 
            onClick={toggleTheme} 
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition ${isDark ? 'bg-slate-800/80 hover:bg-slate-700 text-amber-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
          >
            <span className="flex items-center gap-2">{isDark ? <Sun size={15}/> : <Moon size={15}/>} {isDark ? 'Light Theme' : 'Dark Theme'}</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-black/10">Switch</span>
          </button>

          {!teacherSession && (
            <button onClick={() => router.push('/change-password')} className="w-full flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-white transition"><Key size={14} /> Change Password</button>
          )}
          <button onClick={handleLogout} className="btn-glow-rose w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold text-red-400 bg-rose-500/10 hover:bg-rose-500/20 transition"><LogOut size={15} /> Logout Securely</button>
        </div>
      </aside>

      {/* মূল কন্টেন্ট এরিয়া (MAIN RESPONSIVE CONTENT AREA) */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full relative z-10">
        
        {/* ডেস্কটপ টপ হেডার ব্যানার */}
        <div className={`hidden md:flex ${cardBg} p-5 lg:p-6 rounded-3xl mb-6 backdrop-blur-2xl justify-between items-center gap-4`}>
          <div className="space-y-1">
            <h1 className="text-2xl lg:text-3xl font-black school-brand-title tracking-tight">
              {school.school_name || 'Smart Educational Institution'}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1"><MapPin size={12} className="text-cyan-500"/> {school.address || 'Location Address'}</span>
              <span className="flex items-center gap-1 font-mono text-emerald-500"><PhoneCall size={12}/> {school.phone || 'Phone'}</span>
              <span className="flex items-center gap-1 text-amber-500"><Mail size={12}/> {school.email || 'Email'}</span>
            </div>
          </div>

          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl border border-purple-500/40 bg-purple-500/15 text-purple-200 text-xs font-mono font-bold shadow backdrop-blur-md shrink-0">
            <Calendar size={14} className="text-purple-400" />
            <span>{currentDateTime.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</span>
            <span className="text-white/30">|</span>
            <Clock size={14} className="text-amber-400" />
            <span className="text-amber-300 font-black tracking-wider text-sm">{currentDateTime.toLocaleTimeString()}</span>
          </div>
        </div>

        {/* ==============================================================
            DASHBOARD OVERVIEW TAB
            ============================================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-4 gap-3">
               <div>
                 <h2 className="text-xl md:text-2xl font-black">Live Overview</h2>
                 <p className="text-xs text-slate-400">Welcome to your school administration dashboard.</p>
               </div>
               <div className="flex gap-2.5 w-full sm:w-auto">
                 <button onClick={() => setIsNoticeModalOpen(true)} className="btn-glow-amber flex-1 sm:flex-initial bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-2.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 text-xs">
                   <Megaphone size={15}/> Notice
                 </button>
                 <button onClick={() => setIsAdmissionModalOpen(true)} className="btn-glow-blue flex-1 sm:flex-initial bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 text-xs">
                   <Plus size={16}/> Admission
                 </button>
               </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
              <div className={`${cardBg} p-5 rounded-3xl flex items-center gap-4`}>
                <div className="p-3.5 bg-blue-500/15 text-blue-400 rounded-2xl"><Users size={24} /></div>
                <div><p className="text-[10px] uppercase font-bold text-slate-400">Active Students</p><h3 className="text-2xl md:text-3xl font-black mt-0.5">{activeStudentsList.length}</h3></div>
              </div>

              <div className={`${cardBg} p-5 rounded-3xl flex items-center gap-4`}>
                <div className="p-3.5 bg-purple-500/15 text-purple-400 rounded-2xl"><Briefcase size={24} /></div>
                <div><p className="text-[10px] uppercase font-bold text-slate-400">{teacherSession ? 'My Role' : 'Staff Members'}</p><h3 className="text-xl md:text-2xl font-black text-purple-400 mt-0.5">{teacherSession ? teacherSession.role : staffList.length}</h3></div>
              </div>

              <div className={`${cardBg} p-5 rounded-3xl flex items-center gap-4`}>
                <div className="p-3.5 bg-amber-500/15 text-amber-400 rounded-2xl"><Megaphone size={24} /></div>
                <div><p className="text-[10px] uppercase font-bold text-slate-400">Published Notices</p><h3 className="text-2xl md:text-3xl font-black text-amber-400 mt-0.5">{notices.length}</h3></div>
              </div>
            </div>

            {/* নোটিশ বোর্ড */}
            <div className={`${cardBg} p-5 md:p-7 rounded-3xl space-y-4`}>
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h3 className="text-base font-bold text-amber-500 flex items-center gap-2"><Megaphone size={18}/> School Notice Board</h3>
                <button onClick={() => setIsNoticeModalOpen(true)} className="text-xs font-bold text-amber-500 hover:underline">+ New Notice</button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notices.length > 0 ? notices.map((n) => (
                  <div key={n.id} className={`${subCardBg} p-4 rounded-2xl flex flex-col justify-between space-y-3`}>
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-sm leading-snug">{n.title}</h4>
                        <span className="bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap">{n.publish_date}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed whitespace-pre-line line-clamp-3">{n.content}</p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <span className="text-[10px] text-slate-400">Target: <strong className="text-cyan-500">{n.target_class || 'All'}</strong></span>
                      <div className="flex gap-1.5">
                        <button onClick={() => setSelectedNoticeToPrint(n)} className="btn-glow-blue bg-blue-600/20 text-blue-400 px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1">
                          <Printer size={12}/> Print PDF
                        </button>
                        {!teacherSession && (
                          <button onClick={() => handleDeleteNotice(n.id)} className="bg-rose-500/10 text-rose-400 p-1.5 rounded-xl"><Trash2 size={13}/></button>
                        )}
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-2 text-center p-8 text-slate-400 border border-dashed border-white/10 rounded-2xl">
                    <p className="text-xs font-medium">কোনো নোটিশ এখনো পাবলিশ করা হয়নি।</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==============================================================
            ATTENDANCE TAB
            ============================================================== */}
        {activeTab === 'attendance' && (
          <div className="space-y-5 animate-fade-in w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-4 gap-3">
              <div>
                <h2 className="text-2xl font-black flex items-center gap-2.5 text-emerald-400">
                  <CalendarCheck size={26}/> Smart Attendance
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">ডেইলি অ্যাটেন্ডেন্স, বারকোড স্ক্যানার ও রেজিস্টার বুক।</p>
              </div>

              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <div className={`p-1 rounded-2xl flex gap-1 ${subCardBg} border border-white/10 w-full sm:w-auto justify-between`}>
                  <button onClick={() => setAttendanceMode('students')} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${attendanceMode === 'students' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>Students</button>
                  <button onClick={() => setAttendanceMode('staff')} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${attendanceMode === 'staff' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}>Staff</button>
                </div>
                <div className={`p-1 rounded-2xl flex gap-1 ${subCardBg} border border-white/10 w-full sm:w-auto justify-between`}>
                  <button onClick={() => setAttendanceView('daily')} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${attendanceView === 'daily' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Daily</button>
                  <button onClick={() => setAttendanceView('monthly')} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${attendanceView === 'monthly' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Monthly</button>
                </div>
              </div>
            </div>

            {/* ডে-টাইপ বাটন */}
            <div className={`${cardBg} p-4 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3`}>
              <div className="text-xs font-semibold">
                <span>Date: <strong>{attendanceDate}</strong></span>
                <span className="ml-2 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[10px] font-bold">{dayType}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 w-full md:w-auto">
                <button type="button" onClick={() => handleSelectDayType('Class Day')} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${dayType === 'Class Day' ? 'bg-emerald-600 text-white' : `${subCardBg}`}`}>Class Day</button>
                <button type="button" onClick={() => handleSelectDayType('Exam Day')} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${dayType === 'Exam Day' ? 'bg-amber-600 text-white' : `${subCardBg}`}`}>Exam Day</button>
                <button type="button" onClick={() => handleSelectDayType('Class Off')} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${dayType === 'Class Off' ? 'bg-orange-600 text-white' : `${subCardBg}`}`}>Class Off</button>
                <button type="button" onClick={() => handleSelectDayType('Holiday')} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${dayType === 'Holiday' ? 'bg-rose-600 text-white' : `${subCardBg}`}`}>Holiday</button>
              </div>
            </div>

            {(dayType === 'Holiday' || dayType === 'Class Off') && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex justify-between items-center text-xs">
                <span className="text-rose-400 font-medium">আজকের দিনটি {dayType} হিসেবে নির্ধারিত।</span>
                <button onClick={handleMarkAllAsLeave} className="px-3 py-1 bg-rose-600 text-white rounded-lg font-bold text-[11px]">Mark All Leave</button>
              </div>
            )}

            {attendanceView === 'daily' && (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                <div className={`${cardBg} p-3 rounded-2xl text-center`}><p className="text-[9px] uppercase text-slate-400 font-bold">Total</p><h4 className="text-lg font-black">{currentAttendanceTargetList.length}</h4></div>
                <div className={`${cardBg} p-3 rounded-2xl text-center`}><p className="text-[9px] uppercase text-emerald-400 font-bold">Present</p><h4 className="text-lg font-black text-emerald-400">{presentCount}</h4></div>
                <div className={`${cardBg} p-3 rounded-2xl text-center`}><p className="text-[9px] uppercase text-rose-400 font-bold">Absent</p><h4 className="text-lg font-black text-rose-400">{absentCount}</h4></div>
                <div className={`${cardBg} p-3 rounded-2xl text-center`}><p className="text-[9px] uppercase text-amber-400 font-bold">Late</p><h4 className="text-lg font-black text-amber-400">{lateCount}</h4></div>
                <div className={`${cardBg} p-3 rounded-2xl text-center`}><p className="text-[9px] uppercase text-blue-400 font-bold">Leave</p><h4 className="text-lg font-black text-blue-400">{leaveCount}</h4></div>
                <div className={`${cardBg} p-3 rounded-2xl text-center`}><p className="text-[9px] uppercase text-cyan-400 font-bold">Rate %</p><h4 className="text-lg font-black text-cyan-400">{attendanceRate}%</h4></div>
              </div>
            )}

            {/* কন্ট্রোল বার */}
            <div className={`${cardBg} p-4 rounded-3xl flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3`}>
              <div className="flex flex-wrap gap-2.5">
                {attendanceMode === 'students' && (
                  <select value={attendanceClass} onChange={e => setAttendanceClass(e.target.value)} className={`p-2.5 rounded-xl text-xs font-bold outline-none ${inputBg}`}>
                    {activeClasses.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                )}
                <input 
                  type={attendanceView === 'daily' ? 'date' : 'month'} 
                  value={attendanceView === 'daily' ? attendanceDate : attendanceMonth} 
                  onChange={e => attendanceView === 'daily' ? setAttendanceDate(e.target.value) : setAttendanceMonth(e.target.value)}
                  className={`p-2.5 rounded-xl text-xs font-bold outline-none ${inputBg}`}
                />
              </div>

              {attendanceView === 'daily' && (
                <div className="flex gap-2">
                  <form onSubmit={handleBarcodeSubmit} className="relative flex-1 sm:w-56">
                    <Barcode className="absolute left-3 top-2.5 text-cyan-400" size={16} />
                    <input 
                      ref={barcodeInputRef} 
                      type="text" 
                      placeholder="Scan ID / Roll..." 
                      value={barcodeScanInput} 
                      onChange={e => setBarcodeScanInput(e.target.value)} 
                      className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs font-mono font-bold outline-none ${inputBg}`}
                    />
                  </form>
                  <button onClick={handleMarkAllPresent} disabled={isProcessing} className="btn-glow-emerald bg-emerald-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap">
                    All Present
                  </button>
                </div>
              )}
            </div>

            {/* ডেইলি অ্যাটেন্ডেন্স টেবিল */}
            {attendanceView === 'daily' && (
              <div className={`${cardBg} rounded-3xl overflow-hidden shadow-xl`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[650px] text-xs">
                    <thead className={`${tableHeaderBg} uppercase tracking-wider`}>
                      <tr>
                        <th className="p-3.5">Name & Class</th>
                        <th className="p-3.5">Phone</th>
                        <th className="p-3.5 text-center">Status</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${tableRowHover}`}>
                      {currentAttendanceTargetList.map(person => {
                        const curStatus = attendanceRecords[person.id] || 'Pending';
                        const waLink = attendanceMode === 'students' ? getWhatsAppLink(person) : null;
                        return (
                          <tr key={person.id}>
                            <td className="p-3.5 font-bold">
                              <p className="leading-tight">{person.name}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{attendanceMode === 'students' ? `${person.student_class} | Roll: #${person.roll_no}` : person.role}</p>
                            </td>
                            <td className="p-3.5 font-mono text-slate-400">{person.phone || '-'}</td>
                            <td className="p-3.5 text-center">
                              <div className="inline-flex bg-black/10 p-1 rounded-xl gap-1">
                                {['Present', 'Absent', 'Late', 'Leave'].map((st) => (
                                  <button 
                                    key={st} 
                                    onClick={() => handleSaveAttendance(person.id, st, attendanceMode === 'staff')}
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${curStatus === st ? (st === 'Present' ? 'bg-emerald-600 text-white' : st === 'Absent' ? 'bg-rose-600 text-white' : st === 'Late' ? 'bg-amber-600 text-white' : 'bg-blue-600 text-white') : 'text-slate-400'}`}
                                  >
                                    {st}
                                  </button>
                                ))}
                              </div>
                            </td>
                            <td className="p-3.5 text-right">
                              {attendanceMode === 'students' && curStatus === 'Absent' && waLink && (
                                <a href={waLink} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white font-bold inline-flex items-center gap-1 text-[11px]">
                                  <MessageCircle size={12}/> WhatsApp
                                </a>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      {currentAttendanceTargetList.length === 0 && (
                        <tr><td colSpan="4" className="text-center py-8 text-slate-400">কোনো রেকর্ড পাওয়া যায়নি।</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* মান্থলি রেজিস্টার ভিউ */}
            {attendanceView === 'monthly' && (
              <div className={`${cardBg} p-5 rounded-3xl space-y-4`}>
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <h3 className="text-sm font-bold">Monthly Report ({attendanceMonth})</h3>
                  <button onClick={() => {
                    const headers = ['ID/Roll', 'Name', 'Total Days', 'Presents', 'Absents', 'Rate %'];
                    const rows = currentAttendanceTargetList.map(st => {
                      const stAtt = monthlyAttendanceData.filter(d => d.student_id === st.id);
                      const pres = stAtt.filter(d => d.status === 'Present' || d.status === 'Late').length;
                      const pct = stAtt.length > 0 ? Math.round((pres / stAtt.length) * 100) : 0;
                      return [st.unique_id || st.roll_no, `"${st.name}"`, stAtt.length, pres, stAtt.length - pres, `${pct}%`];
                    });
                    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a"); link.setAttribute("href", url); link.setAttribute("download", `Monthly_Attendance_${attendanceMonth}.csv`);
                    document.body.appendChild(link); link.click(); document.body.removeChild(link);
                  }} className="btn-glow-emerald bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1">
                    <FileSpreadsheet size={14}/> Export CSV
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[600px] text-xs">
                    <thead className={`${tableHeaderBg} uppercase`}>
                      <tr><th className="p-3">Name</th><th className="p-3 text-center">Days</th><th className="p-3 text-center text-emerald-400">Present</th><th className="p-3 text-center">Rate</th><th className="p-3 text-center">Status</th></tr>
                    </thead>
                    <tbody className={`divide-y ${tableRowHover}`}>
                      {currentAttendanceTargetList.map(st => {
                        const stAtt = monthlyAttendanceData.filter(d => d.student_id === st.id);
                        const pres = stAtt.filter(d => d.status === 'Present' || d.status === 'Late').length;
                        const pct = stAtt.length > 0 ? Math.round((pres / stAtt.length) * 100) : 0;
                        return (
                          <tr key={st.id}>
                            <td className="p-3 font-bold">{st.name}</td>
                            <td className="p-3 text-center font-bold">{stAtt.length}</td>
                            <td className="p-3 text-center font-bold text-emerald-400">{pres}</td>
                            <td className="p-3 text-center font-black">{pct}%</td>
                            <td className="p-3 text-center">
                              {pct >= 75 ? (
                                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full">Eligible</span>
                              ) : (
                                <span className="text-[10px] bg-rose-500/20 text-rose-400 font-bold px-2 py-0.5 rounded-full">Shortage</span>
                              )}
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
          <div className="space-y-5 animate-fade-in w-full">
            <h2 className="text-xl md:text-2xl font-black border-b border-white/10 pb-3">Student Records</h2>
            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
                <input type="text" placeholder="Search students..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs font-semibold outline-none ${inputBg}`} />
              </div>
              <div className="flex gap-2 overflow-x-auto">
                <button onClick={handleExportCSV} className="btn-glow-emerald bg-slate-800 text-emerald-400 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap"><FileSpreadsheet size={14} className="inline mr-1"/> Export</button>
                <select onChange={(e) => setSelectedClassFilter(e.target.value)} value={selectedClassFilter} className={`p-2 rounded-2xl text-xs font-bold outline-none ${inputBg}`}>
                  <option value="All">All Classes</option>
                  {activeClasses.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                </select>
              </div>
            </div>

            <div className={`${cardBg} rounded-3xl overflow-hidden shadow-xl`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[650px] text-xs">
                  <thead className={`${tableHeaderBg} uppercase`}>
                    <tr><th className="p-3.5">Roll & Name</th><th className="p-3.5">Class</th><th className="p-3.5">Phone</th><th className="p-3.5 text-center">Action</th></tr>
                  </thead>
                  <tbody className={`divide-y ${tableRowHover}`}>
                    {getFilteredStudents().map(st => (
                      <tr key={st.id}>
                        <td className="p-3.5 font-bold cursor-pointer" onClick={() => setContactModalStudent(st)}>
                          <p>{st.name}</p>
                          <p className="text-[10px] text-slate-400">ID: {st.unique_id || 'N/A'} | Roll: #{st.roll_no}</p>
                        </td>
                        <td className="p-3.5">{st.student_class}</td>
                        <td className="p-3.5 font-mono text-slate-400">{st.phone || '-'}</td>
                        <td className="p-3.5 flex justify-center gap-1.5">
                          <button onClick={() => setStatusModalStudent(st)} className="p-1.5 bg-slate-800 rounded-lg text-slate-300" title="Status"><FileOutput size={13}/></button>
                          <button onClick={() => handleEditClick(st)} className="p-1.5 bg-blue-600/20 text-blue-400 rounded-lg" title="Edit"><Edit size={13}/></button>
                          {!teacherSession && (
                            <button onClick={() => handleDeleteStudent(st.id, st.student_class)} className="p-1.5 bg-rose-600/20 text-rose-400 rounded-lg" title="Delete"><Trash2 size={13}/></button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* STAFF TAB */}
        {!teacherSession && activeTab === 'staff' && (
          <div className="space-y-5 animate-fade-in w-full">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h2 className="text-xl md:text-2xl font-black">Staff & Teachers</h2>
              <button onClick={() => { setStaffData({ id: null, name: '', role: 'Teacher', phone: '', password: '', salary: 0, status: 'Active' }); setIsStaffModalOpen(true); }} className="btn-glow-purple bg-purple-600 text-white px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5">
                <Plus size={15}/> Add Staff
              </button>
            </div>
            <div className={`${cardBg} rounded-3xl overflow-hidden shadow-xl`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[700px] text-xs">
                  <thead className={`${tableHeaderBg} uppercase`}>
                    <tr><th className="p-3.5">Name & Role</th><th className="p-3.5">Phone (Login)</th><th className="p-3.5">Password</th><th className="p-3.5 text-center">Login Access</th><th className="p-3.5 text-center">WhatsApp</th><th className="p-3.5 text-center">Action</th></tr>
                  </thead>
                  <tbody className={`divide-y ${tableRowHover}`}>
                    {staffList.map(stf => {
                      const isStaffActive = (stf.status || 'Active') === 'Active';
                      const waCredLink = getStaffWhatsAppCredentialsLink(stf);
                      return (
                        <tr key={stf.id}>
                          <td className="p-3.5 font-bold"><p>{stf.name}</p><p className="text-[10px] text-purple-400">{stf.role}</p></td>
                          <td className="p-3.5 font-mono">{stf.phone}</td>
                          <td className="p-3.5 font-mono text-amber-400">{stf.password || '*****'}</td>
                          <td className="p-3.5 text-center">
                            <button onClick={() => handleToggleStaffLoginAccess(stf)} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${isStaffActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                              {isStaffActive ? 'Active' : 'Blocked'}
                            </button>
                          </td>
                          <td className="p-3.5 text-center">
                            {waCredLink && <a href={waCredLink} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-400 font-bold inline-flex items-center gap-1"><MessageCircle size={12}/> Send</a>}
                          </td>
                          <td className="p-3.5 flex justify-center gap-1.5">
                            <button onClick={() => { setStaffData(stf); setIsStaffModalOpen(true); }} className="p-1.5 bg-blue-600/20 text-blue-400 rounded-lg"><Edit size={13}/></button>
                            <button onClick={async () => { if(confirm('Delete staff?')){ await supabase.from('staff').delete().eq('id', stf.id); fetchStaff(); }}} className="p-1.5 bg-rose-600/20 text-rose-400 rounded-lg"><Trash2 size={13}/></button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CLASS CONFIG TAB */}
        {!teacherSession && activeTab === 'class_mgmt' && (
          <div className="space-y-5 animate-fade-in w-full">
            <h2 className="text-xl md:text-2xl font-black border-b border-white/10 pb-3">Academic Configurations</h2>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {classList.map(cls => (
                <button key={cls} onClick={() => fetchClassConfigDetails(cls)} className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition ${selectedConfigClass === cls ? 'btn-glow-amber bg-amber-600 text-white' : `${subCardBg}`}`}>{cls}</button>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className={`${cardBg} p-5 rounded-3xl space-y-3`}>
                <h3 className="text-sm font-bold text-amber-400">Academic Year & Subjects</h3>
                <input type="text" value={classConfig.academic_year || ''} onChange={e => setClassConfig({...classConfig, academic_year: e.target.value})} className={`w-full p-2.5 rounded-xl text-xs font-bold outline-none ${inputBg}`} placeholder="Year"/>
                {(classConfig.subjects || []).map((sub, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input type="text" value={sub.name || ''} onChange={e => { const up = [...(classConfig.subjects||[])]; up[idx].name = e.target.value; setClassConfig({...classConfig, subjects: up}); }} className={`flex-1 p-2 rounded-xl text-xs outline-none ${inputBg}`} placeholder="Subject Name"/>
                    <input type="number" value={sub.theory || 0} onChange={e => { const up = [...(classConfig.subjects||[])]; up[idx].theory = parseInt(e.target.value)||0; setClassConfig({...classConfig, subjects: up}); }} className={`w-16 p-2 rounded-xl text-xs text-center outline-none ${inputBg}`} placeholder="Theory"/>
                  </div>
                ))}
                <button type="button" onClick={handleAddSubjectField} className="text-xs text-blue-400 font-bold">+ Add Subject</button>
              </div>
              <div className={`${cardBg} p-5 rounded-3xl space-y-3`}>
                <h3 className="text-sm font-bold text-emerald-400">Default Fees</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div><label className="block mb-1 text-slate-400">Admission Fee</label><input type="number" value={classConfig.admission_fee||0} onChange={e => setClassConfig({...classConfig, admission_fee: e.target.value})} className={`w-full p-2.5 rounded-xl outline-none ${inputBg}`}/></div>
                  <div><label className="block mb-1 text-slate-400">Tuition Fee</label><input type="number" value={classConfig.tuition_fee||0} onChange={e => setClassConfig({...classConfig, tuition_fee: e.target.value})} className={`w-full p-2.5 rounded-xl outline-none ${inputBg}`}/></div>
                </div>
              </div>
            </div>
            <button onClick={handleSaveClassConfig} disabled={isProcessing} className="btn-glow-emerald bg-emerald-600 text-white px-6 py-3 rounded-2xl text-xs font-bold">Save Configuration</button>
          </div>
        )}

        {/* ERP & BILLING TAB */}
        {!teacherSession && activeTab === 'erp' && (
          <div className="space-y-5 animate-fade-in w-full">
            <h2 className="text-xl md:text-2xl font-black border-b border-white/10 pb-3">ERP Billing & Finance</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={`${cardBg} p-5 rounded-3xl flex items-center justify-between`}>
                <div><p className="text-xs text-slate-400">Total Collected</p><h3 className="text-2xl font-black text-emerald-400 mt-1">₹{totalCollectedRevenue}</h3></div>
              </div>
              <div className={`${cardBg} p-5 rounded-3xl flex items-center justify-between`}>
                <div><p className="text-xs text-slate-400">Total Pending</p><h3 className="text-2xl font-black text-rose-400 mt-1">₹{totalPendingDue}</h3></div>
              </div>
            </div>
            
            {/* কালেকশন ফর্ম */}
            <div className={`${cardBg} p-5 rounded-3xl space-y-4`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Select Class</label>
                  <select value={erpSelectedClass} onChange={e => { setErpSelectedClass(e.target.value); setErpStudent(null); }} className={`w-full p-2.5 rounded-xl text-xs font-bold outline-none ${inputBg}`}>
                    <option value="">Select...</option>
                    {activeClasses.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Select Student</label>
                  <select disabled={!erpSelectedClass} value={erpStudent?.id || ''} onChange={e => handleSelectErpStudent(students.find(s => s.id === e.target.value))} className={`w-full p-2.5 rounded-xl text-xs font-bold outline-none ${inputBg}`}>
                    <option value="">Select...</option>
                    {students.filter(s => isSameClass(s.student_class, erpSelectedClass) && isStudentActive(s)).map(s => (
                      <option key={s.id} value={s.id}>{s.name} (#{s.roll_no})</option>
                    ))}
                  </select>
                </div>
              </div>

              {erpStudent && (
                <div className="pt-4 border-t border-white/10 space-y-3">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span>Due Amount: <strong className="text-rose-400">₹{erpBaseAmount}</strong></span>
                  </div>
                  <input type="number" placeholder="Enter Amount Receiving Now" value={erpPaidAmount} onChange={e => setErpPaidAmount(e.target.value)} className={`w-full p-3.5 rounded-2xl text-lg font-black text-emerald-400 outline-none ${inputBg}`} />
                  <button onClick={handleCreateInvoice} disabled={isProcessing} className="btn-glow-emerald w-full bg-emerald-600 text-white py-3 rounded-2xl text-xs font-bold">Generate Money Receipt</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PVC ID CARD TAB */}
        {activeTab === 'idcard' && (
          <div className="space-y-5 animate-fade-in w-full">
            <h2 className="text-xl md:text-2xl font-black border-b border-white/10 pb-3">PVC ID Card Generator</h2>
            <div className={`${cardBg} p-5 rounded-3xl space-y-4`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Select Class</label>
                  <select value={idSelectedClass} onChange={e => { setIdSelectedClass(e.target.value); setSelectedIdStudent(null); }} className={`w-full p-2.5 rounded-xl text-xs font-bold outline-none ${inputBg}`}>
                    <option value="">Select Class...</option>
                    {activeClasses.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Select Student</label>
                  <select disabled={!idSelectedClass} value={selectedIdStudent?.id || ''} onChange={e => setSelectedIdStudent(students.find(s => s.id === e.target.value))} className={`w-full p-2.5 rounded-xl text-xs font-bold outline-none ${inputBg}`}>
                    <option value="">Select Student...</option>
                    {students.filter(s => isSameClass(s.student_class, idSelectedClass) && isStudentActive(s)).map(s => (
                      <option key={s.id} value={s.id}>{s.name} (#{s.roll_no})</option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedIdStudent && (
                <div className="pt-6 border-t border-white/10 flex flex-col items-center gap-4">
                  <button onClick={() => setPrintIdCard(true)} className="btn-glow-blue bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold text-xs flex items-center gap-2">
                    <Printer size={16}/> Print 1-Page PVC Card
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {!teacherSession && activeTab === 'profile' && (
          <div className="space-y-5 animate-fade-in w-full">
            <h2 className="text-xl md:text-2xl font-black border-b border-white/10 pb-3">School Settings</h2>
            <div className={`${cardBg} p-5 rounded-3xl space-y-4`}>
              <form onSubmit={handleUpdateSchool} className="space-y-4">
                <div><label className="text-xs text-slate-400 block mb-1">School Name</label><input type="text" value={school.school_name||''} onChange={e => setSchool({...school, school_name: e.target.value})} className={`w-full p-2.5 rounded-xl text-xs font-bold outline-none ${inputBg}`}/></div>
                <div><label className="text-xs text-slate-400 block mb-1">Address</label><input type="text" value={school.address||''} onChange={e => setSchool({...school, address: e.target.value})} className={`w-full p-2.5 rounded-xl text-xs outline-none ${inputBg}`}/></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs text-slate-400 block mb-1">Phone</label><input type="text" value={school.phone||''} onChange={e => setSchool({...school, phone: e.target.value})} className={`w-full p-2.5 rounded-xl text-xs outline-none ${inputBg}`}/></div>
                  <div><label className="text-xs text-slate-400 block mb-1">Email</label><input type="email" value={school.email||''} onChange={e => setSchool({...school, email: e.target.value})} className={`w-full p-2.5 rounded-xl text-xs outline-none ${inputBg}`}/></div>
                </div>
                <button type="submit" disabled={isProcessing} className="btn-glow-emerald bg-emerald-600 text-white px-5 py-2.5 rounded-2xl text-xs font-bold">Save Settings</button>
              </form>
            </div>
          </div>
        )}

      </main>

      {/* মোবাইল বটম নেভিগেশন বার (MOBILE BOTTOM APP BAR) */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-40 ${isDark ? 'bg-slate-900/95 border-t border-white/10 text-slate-400' : 'bg-white/95 border-t border-slate-200 text-slate-600'} backdrop-blur-xl flex justify-around items-center py-2 px-1 shadow-2xl`}>
        {navItems.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id)} 
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${isActive ? 'text-blue-500 font-bold scale-105' : 'hover:text-slate-200'}`}
            >
              <Icon size={18} />
              <span className="text-[9px] mt-0.5">{item.label}</span>
            </button>
          );
        })}
        <button 
          onClick={() => setIsMobileMenuOpen(true)} 
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-slate-400 hover:text-slate-200"
        >
          <Menu size={18} />
          <span className="text-[9px] mt-0.5">More</span>
        </button>
      </nav>

      {/* ==============================================================
          ALL 10 ESSENTIAL MODALS (PRESERVED & FULLY RESTORED)
          ============================================================== */}

      {/* 1. ADMISSION MODAL */}
      {isAdmissionModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[60] flex items-center justify-center p-4 overflow-y-auto">
          <div className={`${cardBg} p-6 md:p-8 rounded-3xl w-full max-w-2xl relative my-8 max-h-[90vh] overflow-y-auto`}>
            <button onClick={resetStudentForm} className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400"><X size={18}/></button>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-400"><Plus size={18}/> {isEditingStudent ? 'Update Profile' : 'New Admission'}</h3>
            <form onSubmit={handleSaveStudent} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className="block mb-1 text-slate-400">Class</label><select value={formData.studentClass} onChange={e => setFormData({...formData, studentClass: e.target.value})} className={`w-full p-2.5 rounded-xl ${inputBg}`}>{classList.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div><label className="block mb-1 text-slate-400">Roll No</label><input type="text" value={`#${formData.rollNo || getNextRollForClass(formData.studentClass)}`} disabled className={`w-full p-2.5 rounded-xl opacity-60 ${inputBg}`} /></div>
                <div><label className="block mb-1 text-slate-400">Student Name *</label><input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={`w-full p-2.5 rounded-xl ${inputBg}`} required/></div>
                <div><label className="block mb-1 text-slate-400">Father's Name</label><input type="text" value={formData.fatherName} onChange={e => setFormData({...formData, fatherName: e.target.value})} className={`w-full p-2.5 rounded-xl ${inputBg}`}/></div>
                <div><label className="block mb-1 text-slate-400">Date of Birth *</label><input type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className={`w-full p-2.5 rounded-xl ${inputBg}`} required/></div>
                <div><label className="block mb-1 text-slate-400">Phone</label><input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className={`w-full p-2.5 rounded-xl ${inputBg}`}/></div>
                <div><label className="block mb-1 text-slate-400">National ID</label><input type="text" value={formData.aadharNo} onChange={e => setFormData({...formData, aadharNo: e.target.value})} className={`w-full p-2.5 rounded-xl ${inputBg}`}/></div>
                <div><label className="block mb-1 text-slate-400">Address</label><input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className={`w-full p-2.5 rounded-xl ${inputBg}`}/></div>
              </div>
              <button type="submit" disabled={isProcessing} className="btn-glow-blue w-full bg-blue-600 text-white py-3 rounded-2xl font-bold">Submit</button>
            </form>
          </div>
        </div>
      )}

      {/* 2. STAFF MODAL */}
      {!teacherSession && isStaffModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className={`${cardBg} p-6 rounded-3xl max-w-sm w-full relative`}>
            <button onClick={() => setIsStaffModalOpen(false)} className="absolute top-4 right-4 p-1.5 bg-slate-800 rounded-lg text-slate-400"><X size={16} /></button>
            <h3 className="text-base font-bold text-purple-400 mb-3 flex items-center gap-1.5"><Briefcase size={18}/> Manage Staff</h3>
            <form onSubmit={handleSaveStaff} className="space-y-3 text-xs">
              <div><label className="block mb-1 text-slate-400">Name</label><input type="text" value={staffData.name} onChange={e => setStaffData({...staffData, name: e.target.value})} className={`w-full p-2.5 rounded-xl ${inputBg}`} required/></div>
              <div><label className="block mb-1 text-slate-400">Role</label><input type="text" value={staffData.role} onChange={e => setStaffData({...staffData, role: e.target.value})} className={`w-full p-2.5 rounded-xl ${inputBg}`} required/></div>
              <div><label className="block mb-1 text-slate-400">Phone</label><input type="text" value={staffData.phone} onChange={e => setStaffData({...staffData, phone: e.target.value})} className={`w-full p-2.5 rounded-xl ${inputBg}`} required/></div>
              <div><label className="block mb-1 text-slate-400">Password</label><input type="text" value={staffData.password} onChange={e => setStaffData({...staffData, password: e.target.value})} className={`w-full p-2.5 rounded-xl ${inputBg}`} required/></div>
              <div>
                <label className="block mb-1 text-slate-400">Access Status</label>
                <select value={staffData.status || 'Active'} onChange={e => setStaffData({...staffData, status: e.target.value})} className={`w-full p-2.5 rounded-xl ${inputBg}`}>
                  <option value="Active">Active (Allowed)</option>
                  <option value="Inactive">Inactive (Blocked)</option>
                </select>
              </div>
              <button type="submit" disabled={isProcessing} className="btn-glow-purple w-full bg-purple-600 text-white py-2.5 rounded-xl font-bold mt-2">Save Staff</button>
            </form>
          </div>
        </div>
      )}

      {/* 3. NOTICE PUBLISH MODAL */}
      {isNoticeModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className={`${cardBg} p-6 rounded-3xl max-w-md w-full relative`}>
            <button onClick={() => setIsNoticeModalOpen(false)} className="absolute top-4 right-4 p-1.5 bg-slate-800 rounded-lg text-slate-400"><X size={16}/></button>
            <h3 className="text-base font-bold text-amber-400 mb-3 flex items-center gap-1.5"><Megaphone size={18}/> Publish Notice</h3>
            <form onSubmit={handleSaveNotice} className="space-y-3 text-xs">
              <div><label className="block mb-1 text-slate-400">Notice Title</label><input type="text" value={noticeFormData.title} onChange={e => setNoticeFormData({...noticeFormData, title: e.target.value})} className={`w-full p-2.5 rounded-xl ${inputBg}`} required/></div>
              <div><label className="block mb-1 text-slate-400">Target Class</label><select value={noticeFormData.target_class} onChange={e => setNoticeFormData({...noticeFormData, target_class: e.target.value})} className={`w-full p-2.5 rounded-xl ${inputBg}`}><option value="All">All Classes</option>{classList.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              <div><label className="block mb-1 text-slate-400">Content</label><textarea rows={4} value={noticeFormData.content} onChange={e => setNoticeFormData({...noticeFormData, content: e.target.value})} className={`w-full p-2.5 rounded-xl resize-none ${inputBg}`} required></textarea></div>
              <button type="submit" disabled={isProcessing} className="btn-glow-amber w-full bg-amber-600 text-white py-2.5 rounded-xl font-bold">Publish Notice</button>
            </form>
          </div>
        </div>
      )}

      {/* 4. NOTICE LETTERHEAD PRINT MODAL */}
      {selectedNoticeToPrint && (
        <div className="fixed inset-0 bg-white text-slate-900 z-50 p-6 overflow-y-auto print:p-0">
          <div className="max-w-3xl mx-auto flex justify-between items-center mb-6 no-print">
            <button onClick={() => setSelectedNoticeToPrint(null)} className="bg-slate-200 px-4 py-2 rounded-xl font-bold text-xs"><X size={15} className="inline mr-1"/> Close</button>
            <button onClick={() => window.print()} className="btn-glow-blue bg-blue-600 text-white px-5 py-2 rounded-xl font-bold text-xs"><Printer size={15} className="inline mr-1"/> Print Official PDF</button>
          </div>
          <div className="max-w-3xl mx-auto border-2 border-slate-800 p-10 bg-white min-h-[850px] flex flex-col justify-between">
            <div>
              <div className="text-center border-b-2 border-slate-900 pb-5 mb-5">
                {school.logo_url && <img src={school.logo_url} className="w-18 h-18 mx-auto mb-2 object-contain" alt="" />}
                <h1 className="text-3xl font-black uppercase tracking-wide text-blue-950">{school.school_name || 'SCHOOL NAME'}</h1>
                <p className="text-xs text-slate-600 mt-1">{school.address} | Phone: {school.phone}</p>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-dashed pb-2 mb-6">
                <span>Ref: NOT-{selectedNoticeToPrint.id || 'OFFICIAL'}</span>
                <span className="bg-slate-900 text-white font-black px-4 py-1 rounded-full text-xs uppercase">OFFICIAL NOTICE</span>
                <span>Date: {selectedNoticeToPrint.publish_date}</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">{selectedNoticeToPrint.title}</h2>
              <div className="text-sm leading-relaxed whitespace-pre-line text-slate-700">{selectedNoticeToPrint.content}</div>
            </div>
            <div className="flex justify-between items-end pt-16">
              <div className="text-center"><p className="text-xs font-bold">{selectedNoticeToPrint.publish_date}</p><div className="w-28 border-t border-slate-900 mt-1"></div><p className="text-[10px] text-slate-500">Date</p></div>
              <div className="text-center"><p className="text-xs font-bold italic">{school.principal_name || 'Principal'}</p><div className="w-36 border-t border-slate-900 mt-1"></div><p className="text-[10px] text-slate-500">Principal Signature & Seal</p></div>
            </div>
          </div>
        </div>
      )}

      {/* 5. STATUS CHANGE MODAL */}
      {statusModalStudent && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className={`${cardBg} p-6 rounded-3xl max-w-sm w-full relative`}>
            <button onClick={() => setStatusModalStudent(null)} className="absolute top-4 right-4 p-1.5 bg-slate-800 rounded-lg text-slate-400"><X size={16} /></button>
            <h3 className="text-base font-bold text-amber-400 mb-3">Manage Student Status</h3>
            <p className="text-xs text-slate-400 mb-3">{statusModalStudent.name} (#{statusModalStudent.roll_no})</p>
            <div className="space-y-3 text-xs">
              <select value={statusAction} onChange={e => setStatusAction(e.target.value)} className={`w-full p-2.5 rounded-xl ${inputBg}`}>
                <option value="Transferred">Transfer Out (Mid-Year)</option>
                <option value="Passout">Passout (Alumni)</option>
              </select>
              {statusAction === 'Transferred' && (
                <input type="text" value={statusReason} onChange={e => setStatusReason(e.target.value)} placeholder="Reason for transfer" className={`w-full p-2.5 rounded-xl ${inputBg}`} />
              )}
              <button onClick={handleChangeStatus} disabled={isProcessing} className="btn-glow-amber w-full bg-amber-600 text-white py-2.5 rounded-xl font-bold">Confirm {statusAction}</button>
            </div>
          </div>
        </div>
      )}

      {/* 6. TRANSFER CERTIFICATE (TC) PRINT MODAL */}
      {tcPrintData && (
        <div className="fixed inset-0 bg-white text-slate-900 z-50 p-6 overflow-y-auto print:p-0">
          <div className="max-w-2xl mx-auto flex justify-between items-center mb-4 no-print">
            <button onClick={() => setTcPrintData(null)} className="bg-slate-200 px-4 py-2 rounded-lg font-bold text-xs"><X size={15} className="inline mr-1"/> Close</button>
            <button onClick={() => window.print()} className="btn-glow-blue bg-blue-600 text-white px-5 py-2 rounded-lg font-bold text-xs"><Printer size={15} className="inline mr-1"/> Print TC</button>
          </div>
          <div className="max-w-2xl mx-auto border-4 border-double border-slate-900 p-8 bg-white text-xs space-y-4">
            <div className="text-center border-b pb-4">
              <h1 className="text-2xl font-black uppercase text-blue-950">{school.school_name || 'SCHOOL NAME'}</h1>
              <p className="text-[11px] text-slate-600">{school.address} | Phone: {school.phone}</p>
              <span className="inline-block bg-slate-900 text-white font-bold px-4 py-1 rounded-full mt-2">TRANSFER CERTIFICATE</span>
            </div>
            <p>This is to certify that <strong>{tcPrintData.name}</strong> was a student of this school.</p>
            <table className="w-full border-collapse text-xs">
              <tbody>
                <tr><td className="py-1.5 border-b text-slate-600">Roll No:</td><td className="py-1.5 border-b font-bold">#{tcPrintData.roll_no}</td></tr>
                <tr><td className="py-1.5 border-b text-slate-600">Class:</td><td className="py-1.5 border-b font-bold">{tcPrintData.student_class}</td></tr>
                <tr><td className="py-1.5 border-b text-slate-600">Status:</td><td className="py-1.5 border-b font-bold">{tcPrintData.status}</td></tr>
              </tbody>
            </table>
            <div className="flex justify-between items-end pt-12">
              <div><p className="font-bold">{new Date().toLocaleDateString()}</p><p className="text-[10px] text-slate-500">Date of Issue</p></div>
              <div><p className="font-bold italic">{school.principal_name || 'Principal'}</p><p className="text-[10px] text-slate-500">Principal Signature</p></div>
            </div>
          </div>
        </div>
      )}

      {/* 7. EDIT ERP TRANSACTION MODAL */}
      {editingTx && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className={`${cardBg} p-6 rounded-3xl max-w-sm w-full relative`}>
            <button onClick={() => setEditingTx(null)} className="absolute top-4 right-4 p-1.5 bg-slate-800 rounded-lg text-slate-400"><X size={16} /></button>
            <h3 className="text-base font-bold text-amber-400 mb-3">Edit Transaction</h3>
            <div className="space-y-3 text-xs">
              <div><label className="block mb-1 text-slate-400">Fee Type</label><input type="text" value={editingTx.fee_type} disabled className={`w-full p-2.5 rounded-xl opacity-60 ${inputBg}`} /></div>
              <div><label className="block mb-1 text-slate-400">Discount</label><input type="number" value={editingTx.discount} onChange={e => setEditingTx({...editingTx, discount: e.target.value})} className={`w-full p-2.5 rounded-xl ${inputBg}`} /></div>
              <div><label className="block mb-1 text-slate-400">Paid Amount</label><input type="number" value={editingTx.paid_amount} onChange={e => setEditingTx({...editingTx, paid_amount: e.target.value})} className={`w-full p-2.5 rounded-xl ${inputBg}`} /></div>
              <button onClick={handleUpdateTx} disabled={isProcessing} className="btn-glow-blue w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold mt-2">Save Update</button>
            </div>
          </div>
        </div>
      )}

      {/* 8. STUDENT CONTACT MODAL */}
      {contactModalStudent && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className={`${cardBg} p-6 rounded-3xl max-w-xs w-full text-center space-y-3 relative`}>
            <button onClick={() => setContactModalStudent(null)} className="absolute top-3.5 right-3.5 p-1.5 bg-slate-800 rounded-lg text-slate-400"><X size={15} /></button>
            <img src={contactModalStudent.photo_url || 'https://via.placeholder.com/150'} className="w-16 h-16 rounded-full mx-auto object-cover border-2 border-blue-500" alt="" />
            <h3 className="text-base font-bold">{contactModalStudent.name}</h3>
            <p className="text-xs text-blue-400">{contactModalStudent.student_class} | Roll #{contactModalStudent.roll_no}</p>
            <div className={`p-3 rounded-2xl ${subCardBg} text-left space-y-1.5 text-xs`}>
              <p>Father: <strong>{contactModalStudent.father_name || 'N/A'}</strong></p>
              <p>DOB: <strong>{contactModalStudent.dob || 'N/A'}</strong></p>
              <p>Phone: <strong>{contactModalStudent.phone || 'N/A'}</strong></p>
              <p>Address: <strong>{contactModalStudent.address || 'N/A'}</strong></p>
            </div>
            {contactModalStudent.phone && (
              <a href={`tel:${contactModalStudent.phone}`} className="btn-glow-emerald w-full bg-emerald-600 text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 text-xs"><PhoneCall size={14}/> Call Guardian</a>
            )}
          </div>
        </div>
      )}

      {/* 9. MONEY RECEIPT PRINT MODAL */}
      {receiptData && (
        <div className="fixed inset-0 bg-white text-slate-900 z-50 p-6 overflow-y-auto print:p-0">
          <div className="max-w-xl mx-auto flex justify-between items-center mb-4 no-print">
            <button onClick={() => setReceiptData(null)} className="bg-slate-200 px-4 py-2 rounded-lg font-bold text-xs"><X size={15} className="inline mr-1"/> Close</button>
            <button onClick={() => window.print()} className="btn-glow-blue bg-blue-600 text-white px-5 py-2 rounded-lg font-bold text-xs"><Printer size={15} className="inline mr-1"/> Print Receipt</button>
          </div>
          <div className="max-w-xl mx-auto border-2 border-slate-900 p-6 rounded-xl bg-white text-xs space-y-3">
            <div className="text-center border-b pb-3">
              <h1 className="text-xl font-black uppercase">{school.school_name || 'SCHOOL NAME'}</h1>
              <p className="text-[10px] text-slate-600">{school.address} | Phone: {school.phone}</p>
              <span className="inline-block bg-slate-900 text-white font-bold px-3 py-0.5 rounded text-[10px] mt-1">OFFICIAL RECEIPT</span>
            </div>
            <div className="flex justify-between text-xs"><span>Invoice: {receiptData.invoiceNo}</span><span>Date: {receiptData.date}</span></div>
            <p>Student: <strong>{receiptData.student.name}</strong> ({receiptData.student.student_class}, Roll #{receiptData.student.roll_no})</p>
            <table className="w-full border-collapse border border-slate-900 text-xs">
              <thead><tr className="bg-slate-200"><th className="p-2 border">Particulars</th><th className="p-2 border text-right">Amount</th></tr></thead>
              <tbody>
                {receiptData.items.map((it, i) => (
                  <tr key={i}><td className="p-2 border">{it.feeType}</td><td className="p-2 border text-right font-bold">₹{it.paid}</td></tr>
                ))}
                <tr className="bg-slate-100 font-black"><td className="p-2 border text-right">Total Paid:</td><td className="p-2 border text-right text-sm">₹{receiptData.totalPaid}</td></tr>
              </tbody>
            </table>
            <div className="flex justify-between items-end pt-8">
              <p className="text-[10px] text-slate-500">Thank you for your payment!</p>
              <div className="text-center"><div className="w-28 border-b border-slate-900 mb-1"></div><p className="text-[10px] text-slate-500">Authorized Accountant</p></div>
            </div>
          </div>
        </div>
      )}

      {/* 10. PVC ID CARD PRINT MODAL (1-PAGE ISO CR80 FORMAT) */}
      {printIdCard && selectedIdStudent && (
        <div className="fixed inset-0 bg-slate-950/95 z-50 flex items-center justify-center p-4 pvc-modal-overlay">
          <div className="absolute top-6 right-6 flex gap-3 no-print">
            <button onClick={() => setPrintIdCard(false)} className="bg-slate-800 px-4 py-2 rounded-xl font-bold text-white text-xs"><X size={15} className="inline mr-1"/> Cancel</button>
            <button onClick={() => window.print()} className="btn-glow-blue bg-blue-600 px-5 py-2 rounded-xl font-bold text-white text-xs"><Printer size={15} className="inline mr-1"/> Print PVC (1-Page)</button>
          </div>
          
          <div className="pvc-card w-[204px] h-[323px] bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 overflow-hidden relative flex flex-col text-white rounded-2xl border border-indigo-500/30 shadow-2xl shrink-0">
             <div className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-2 pt-2.5 pb-2 text-center relative z-10 shadow-md">
                 <div className="flex items-center justify-between gap-1 px-1">
                     {school.logo_url ? <img src={school.logo_url} className="w-6 h-6 rounded-full border border-white bg-white object-contain" alt="" /> : <School size={16} className="text-amber-300"/>}
                     <div className="flex-1 truncate">
                        <h2 className="font-black text-[10.5px] uppercase tracking-wide text-amber-300 truncate leading-tight drop-shadow-sm">{school.school_name || 'SCHOOL NAME'}</h2>
                        <p className="text-[5.5px] text-indigo-100 font-medium truncate leading-none mt-0.5">{school.address || 'Institution Address'}</p>
                     </div>
                     <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(portalUrl)}`} className="w-6 h-6 rounded bg-white p-0.5" alt="QR"/>
                 </div>
             </div>

             <div className="flex justify-center mt-2 z-10">
                 <div className="p-[2px] bg-gradient-to-tr from-amber-400 via-rose-500 to-cyan-400 rounded-full shadow-lg">
                    <img src={selectedIdStudent.photo_url || 'https://via.placeholder.com/150'} className="w-14 h-14 rounded-full object-cover bg-slate-900" alt="" />
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
        </div>
      )}

    </div>
  );
}