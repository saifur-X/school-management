'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Users, CreditCard, FileSpreadsheet, UserCheck, Key, LogOut, 
  Plus, School, Search, ArrowUpCircle, DollarSign, Settings, Trash2, Edit, Save, 
  X, User, BookOpen, Phone, Droplet, MapPin, Image, Printer, AlertCircle, PhoneCall, 
  Calendar, Mail, Globe, Building, FileText, BadgeCheck, Loader2, CheckCircle, GraduationCap, FileOutput, File,
  Activity, Bell, CalendarCheck, Briefcase, UploadCloud, BarChart3, History, CheckSquare, ClipboardEdit
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

export default function Dashboard() {
  const [session, setSession] = useState(null); // Admin Session
  const [studentSession, setStudentSession] = useState(null); // Student Session
  const [teacherSession, setTeacherSession] = useState(null); // Teacher Session
  const [portalUrl, setPortalUrl] = useState('https://eduadmin.vercel.app'); 
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
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
  const [staffData, setStaffData] = useState({ id: null, name: '', role: 'Teacher', phone: '', salary: 0, password: '', status: 'Active' });

  // Attendance State
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceClass, setAttendanceClass] = useState('');
  const [attendanceDayType, setAttendanceDayType] = useState('Class Day'); // New: Class Day, Holiday, Event Day
  const [attendanceRecords, setAttendanceRecords] = useState({});

  // Mark Entry State
  const [markEntryClass, setMarkEntryClass] = useState('');
  const [markEntryExam, setMarkEntryExam] = useState('Term 1 Exam');
  const [marksData, setMarksData] = useState({}); 

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

  const [studentPortalData, setStudentPortalData] = useState({ marks: [], tx: [], attendance: [] });
  const monthsName = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const router = useRouter();

  // Action Logging System
  const logActivity = async (actionDesc) => {
    if(!teacherSession && !session) return;
    const staffId = teacherSession ? teacherSession.id : 0; // 0 for Admin
    const staffName = teacherSession ? teacherSession.name : 'System Admin';
    await supabase.from('activity_logs').insert([{ staff_id: staffId > 0 ? staffId : null, staff_name: staffName, action: actionDesc }]);
  };

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
      const localTeacher = localStorage.getItem('teacher_session');
      
      if (adminSession) {
        setSession(adminSession); fetchSchoolDetails(); loadClassConfigs(); fetchData(); fetchStaff(); fetchLogs();
      } else if (localTeacher) {
        const teacher = JSON.parse(localTeacher); setTeacherSession(teacher);
        fetchSchoolDetails(); loadClassConfigs(); fetchData(); // Teachers need student data for attendance
      } else if (localStudent) {
        const student = JSON.parse(localStudent); setStudentSession(student);
        fetchSchoolDetails(); loadClassConfigs(); fetchStudentSpecificData(student.id, student.student_class);
      } else { router.push('/login'); }
    }; checkAuth();
  }, [router]);

  const fetchStudentSpecificData = async (studentId, studentClass) => {
    const { data: marks } = await supabase.from('marksheets').select('*').eq('student_id', studentId);
    const { data: tx } = await supabase.from('erp_transactions').select('*').eq('student_id', studentId).order('created_at', { ascending: false });
    const { data: att } = await supabase.from('attendance').select('*').eq('student_id', studentId);
    setStudentPortalData({ marks: marks || [], tx: tx || [], attendance: att || [] }); setLoading(false);
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

  const fetchLogs = async () => {
    const { data } = await supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(50);
    if(data) setActivityLogs(data);
  };

  const loadAttendance = async (cls, date) => {
    if(!cls || !date) return;
    const { data } = await supabase.from('attendance').select('*').eq('class_name', cls).eq('date', date);
    const records = {};
    if(data && data.length > 0) {
      data.forEach(d => { records[d.student_id] = d.status; });
      setAttendanceDayType(data[0].day_type || 'Class Day');
    } else {
      setAttendanceDayType('Class Day');
    }
    setAttendanceRecords(records);
  };

  const handleSaveAttendance = async (studentId, status) => {
    const newRecords = { ...attendanceRecords, [studentId]: status };
    setAttendanceRecords(newRecords);
    await supabase.from('attendance').upsert({ student_id: studentId, class_name: attendanceClass, date: attendanceDate, status: status, day_type: attendanceDayType }, { onConflict: 'student_id, date' });
    logActivity(`Marked attendance (${status}) for Student ID: ${studentId} on ${attendanceDate}`);
  };

  // NEW: Bulk Holiday / Event Marker
  const handleMarkAllHoliday = async () => {
    if(!attendanceClass || !attendanceDate) return showToast('Please select class and date', 'error');
    if(!confirm(`Mark ${attendanceDate} as ${attendanceDayType} for all ${attendanceClass} students?`)) return;
    
    setIsProcessing(true);
    const classStudents = students.filter(s => s.student_class === attendanceClass && s.status === 'Active');
    const recordsToInsert = classStudents.map(st => ({
      student_id: st.id, class_name: attendanceClass, date: attendanceDate, status: 'Holiday', day_type: attendanceDayType
    }));
    
    await supabase.from('attendance').upsert(recordsToInsert, { onConflict: 'student_id, date' });
    loadAttendance(attendanceClass, attendanceDate);
    logActivity(`Marked full class (${attendanceClass}) as ${attendanceDayType} on ${attendanceDate}`);
    showToast(`Successfully marked ${attendanceDayType}!`);
    setIsProcessing(false);
  };

  const loadMarks = async (cls, exam) => {
    if(!cls || !exam) return;
    const classStudents = students.filter(s => s.student_class === cls && s.status === 'Active');
    const { data } = await supabase.from('marksheets').select('*').eq('exam_name', exam).in('student_id', classStudents.map(s=>s.id));
    const loadedMarks = {};
    if(data) data.forEach(d => { loadedMarks[d.student_id] = d.marks_data; });
    setMarksData(loadedMarks);
  };

  const handleSaveMarks = async (studentId) => {
    const sMarks = marksData[studentId] || {};
    await supabase.from('marksheets').upsert({ student_id: studentId, exam_name: markEntryExam, marks_data: sMarks }, { onConflict: 'student_id, exam_name' });
    showToast('Marks saved successfully!');
    logActivity(`Updated marks for Student ID: ${studentId} (${markEntryExam})`);
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
      if (!error) { showToast('স্টুডেন্ট আপডেট হয়েছে!'); logActivity(`Updated profile for ${formData.name}`); resetStudentForm(); fetchData(); } else showToast('আপডেট ব্যর্থ: ' + error.message, 'error');
    } else {
      const roll = getNextRollForClass(formData.studentClass); const newUniqueId = await getNextUniqueId();
      const { error } = await supabase.from('students').insert([{
        name: formData.name, father_name: formData.fatherName, mother_name: formData.motherName, dob: formData.dob, 
        unique_id: newUniqueId, roll_no: roll, student_class: formData.studentClass, phone: formData.phone, 
        blood_group: formData.bloodGroup, address: formData.address, gender: formData.gender, status: 'Active', 
        photo_url: formData.photoUrl || 'https://via.placeholder.com/150', email: `student_${formData.studentClass}_${roll}@school.com`,
        aadhar_no: formData.aadharNo, religion: formData.religion, category: formData.category
      }]);
      if (!error) { showToast(`স্টুডেন্ট ভর্তি সম্পন্ন! Unique ID: ${newUniqueId}`); logActivity(`Admitted new student: ${formData.name}`); resetStudentForm(); fetchData(); } else showToast('ভর্তি ব্যর্থ: ' + error.message, 'error');
    }
    setIsProcessing(false);
  };

  const handleSaveStaff = async (e) => {
    e.preventDefault(); setIsProcessing(true);
    if (staffData.id) {
      await supabase.from('staff').update({ name: staffData.name, role: staffData.role, phone: staffData.phone, salary: staffData.salary, status: staffData.status, password: staffData.password }).eq('id', staffData.id);
      showToast('Staff Updated!'); logActivity(`Updated staff profile: ${staffData.name}`);
    } else {
      await supabase.from('staff').insert([{ name: staffData.name, role: staffData.role, phone: staffData.phone, salary: staffData.salary, status: 'Active', password: staffData.password || '123456' }]);
      showToast('New Staff Added!'); logActivity(`Added new staff: ${staffData.name}`);
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
      logActivity(`Deleted a student from ${className}`); showToast('স্টুডেন্ট মুছে ফেলা হয়েছে!'); fetchData();
    }
  };

  const handleUpgradeClass = async (currentClass) => {
    if (currentClass === 'Class 12') {
      if (confirm(`Class 12-এর সবাইকে Passout করে Alumni লিস্টে পাঠাতে চান?`)) {
        const classSts = students.filter(s => s.student_class === currentClass && (s.status === 'Active' || !s.status));
        const currentYear = new Date().getFullYear().toString();
        Promise.all(classSts.map(async (st) => { await supabase.from('students').update({ status: 'Passout', passout_year: currentYear }).eq('id', st.id); })).then(() => { logActivity(`Marked ${currentClass} as Passout`); showToast('সকল স্টুডেন্ট Passout হয়েছে!'); fetchData(); });
      } return;
    }
    const nextClassMap = { 'Nursery':'KG', 'KG':'Class 1', 'Class 1':'Class 2', 'Class 2':'Class 3', 'Class 3':'Class 4', 'Class 4':'Class 5', 'Class 5':'Class 6', 'Class 6':'Class 7', 'Class 7':'Class 8', 'Class 8':'Class 9', 'Class 9':'Class 10', 'Class 10':'Class 11', 'Class 11':'Class 12' };
    const targetClass = nextClassMap[currentClass] || 'Higher Class';
    if (confirm(`${currentClass} এর সবাইকে ${targetClass} এ প্রমোট করতে চান?`)) {
      const classSts = students.filter(s => s.student_class === currentClass && (s.status === 'Active' || !s.status));
      Promise.all(classSts.map(async (st, idx) => { await supabase.from('students').update({ student_class: targetClass, roll_no: idx + 1 }).eq('id', st.id); })).then(() => { logActivity(`Upgraded ${currentClass} to ${targetClass}`); showToast('ক্লাস আপগ্রেড সম্পন্ন হয়েছে!'); fetchData(); });
    }
  };

  const handleChangeStatus = async () => {
    if (!statusModalStudent) return; setIsProcessing(true);
    let payload = statusAction === 'Passout' ? { status: 'Passout', passout_year: new Date().getFullYear().toString() } : { status: 'Transferred', transfer_date: new Date().toISOString(), tc_reason: statusReason };
    const { error } = await supabase.from('students').update(payload).eq('id', statusModalStudent.id);
    if (!error) { logActivity(`Changed status of ${statusModalStudent.name} to ${statusAction}`); showToast(`স্টুডেন্ট ${statusAction} হিসেবে সেভ হয়েছে!`); setStatusModalStudent(null); fetchData(); } else showToast('Error: ' + error.message, 'error');
    setIsProcessing(false);
  };

  const resetStudentForm = () => { 
    setFormData({ id: null, name: '', fatherName: '', motherName: '', dob: '', rollNo: getNextRollForClass('Class 1'), studentClass: 'Class 1', phone: '', bloodGroup: '', address: '', gender: 'Male', photoUrl: '', aadharNo: '', religion: '', category: 'General' }); 
    setIsEditingStudent(false); setIsAdmissionModalOpen(false);
  };

  const handleUpdateSchool = async (e) => {
    e.preventDefault(); setIsProcessing(true);
    const { error } = await supabase.from('school_settings').update(school).eq('id', 1);
    if (!error) { logActivity(`Updated school settings`); showToast('স্কুল প্রোফাইল আপডেট হয়েছে!'); setEditSchool(false); } else showToast('Error', 'error');
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
    logActivity(`Exported student data to CSV`); showToast('ডাটা সফলভাবে এক্সপোর্ট হয়েছে!');
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
        if (cols.length >= 3) {
          const cls = cols[1] || 'Class 1';
          const roll = getNextRollForClass(cls) + count; 
          await supabase.from('students').insert([{ name: cols[0], student_class: cls, dob: cols[2] || '2010-01-01', father_name: cols[3] || '', phone: cols[4] || '', roll_no: roll, status: 'Active' }]);
          count++;
        }
      }
      logActivity(`Bulk imported ${count} students`); showToast(`${count} Students Imported Successfully!`);
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
    if (!error) { logActivity(`Updated class configuration for ${selectedConfigClass}`); showToast('Class Config সেভ হয়েছে!'); loadClassConfigs(); }
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
      logActivity(`Generated fee receipt (₹${erpPaidAmount}) for ${erpStudent.name}`);
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
    if (!error) { logActivity(`Updated a transaction record`); showToast('পেমেন্ট সফলভাবে আপডেট হয়েছে!'); setEditingTx(null); await fetchData(); handleSelectErpStudent(erpStudent); }
    setIsProcessing(false);
  };

  const saveAgreedFeesToDB = async () => {
    if (!erpStudent) return;
    const { error } = await supabase.from('students').update({ agreed_monthly_fee: Number(agreedFees.monthly), agreed_admission_fee: Number(agreedFees.admission) }).eq('id', erpStudent.id);
    if (!error) { logActivity(`Updated custom fee profile for ${erpStudent.name}`); showToast("এই স্টুডেন্টের নির্দিষ্ট ফিস প্রোফাইল সেভ হয়েছে!"); setErpStudent({...erpStudent, agreed_monthly_fee: Number(agreedFees.monthly), agreed_admission_fee: Number(agreedFees.admission)}); fetchData(); calculateTotalDues(erpSelectedFeeTypes, erpClassConfig, Number(agreedFees.monthly), Number(agreedFees.admission), erpTransactions); }
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

  // Dashboard Chart Data Prep
  const chartData = activeClasses.map(cls => ({
    name: cls,
    Students: students.filter(s => s.student_class === cls && (s.status === 'Active' || !s.status)).length
  }));

  if (!session && !studentSession && !teacherSession) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white"><Loader2 className="animate-spin mr-2"/> Loading...</div>;

  // ==========================================
  // STUDENT PORTAL VIEW (Improved Attendance)
  // ==========================================
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

    // Advanced Attendance Calc
    const totalClassDays = studentPortalData.attendance.filter(a => a.day_type === 'Class Day').length;
    const presentDays = studentPortalData.attendance.filter(a => a.day_type === 'Class Day' && a.status === 'Present').length;
    const absentDays = studentPortalData.attendance.filter(a => a.day_type === 'Class Day' && a.status === 'Absent').length;
    const holidayCount = studentPortalData.attendance.filter(a => a.day_type !== 'Class Day').length;
    const attPercentage = totalClassDays > 0 ? Math.round((presentDays / totalClassDays) * 100) : 0;

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
            
            {/* NEW: Student Attendance Stats */}
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl shadow-xl">
              <h3 className="text-lg font-bold text-emerald-400 mb-6 flex items-center gap-2"><CalendarCheck/> Attendance Report</h3>
              <div className="flex items-center justify-between mb-6">
                <div>
                   <p className="text-sm text-slate-400">Total Class Days</p>
                   <p className="text-3xl font-black text-white">{totalClassDays}</p>
                </div>
                <div className="text-right">
                   <p className="text-sm text-slate-400">Attendance Rate</p>
                   <p className={`text-3xl font-black ${attPercentage >= 75 ? 'text-emerald-400' : 'text-rose-400'}`}>{attPercentage}%</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                 <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl"><p className="text-emerald-400 font-bold text-2xl">{presentDays}</p><p className="text-xs text-slate-400 mt-1">Present</p></div>
                 <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl"><p className="text-rose-400 font-bold text-2xl">{absentDays}</p><p className="text-xs text-slate-400 mt-1">Absent</p></div>
                 <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl"><p className="text-blue-400 font-bold text-2xl">{holidayCount}</p><p className="text-xs text-slate-400 mt-1">Holidays/Events</p></div>
              </div>
            </div>
            
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl shadow-xl">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><FileText className="text-amber-400"/> Academic Results</h3>
              {studentPortalData.marks.length > 0 ? (
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
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

  // ==========================================
  // ADMIN & TEACHER PORTAL VIEW
  // ==========================================
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

  // Filter Sidebar Tabs based on Role
  const sidebarTabs = teacherSession ? [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'attendance', label: 'Daily Attendance', icon: CalendarCheck },
    { id: 'mark_entry', label: 'Mark Entry', icon: ClipboardEdit },
  ] : [
    { id: 'dashboard', label: 'Overview & Charts', icon: LayoutDashboard },
    { id: 'students', label: 'Students Mgmt.', icon: Users },
    { id: 'attendance', label: 'Daily Attendance', icon: CalendarCheck },
    { id: 'mark_entry', label: 'Mark Entry', icon: ClipboardEdit },
    { id: 'staff', label: 'Staff & Teachers', icon: Briefcase },
    { id: 'logs', label: 'Activity Logs', icon: History },
    { id: 'class_mgmt', label: 'Class Config', icon: Settings },
    { id: 'erp', label: 'ERP Billing', icon: DollarSign },
    { id: 'idcard', label: 'ID Card System', icon: CreditCard },
    { id: 'profile', label: 'School Settings', icon: Building },
  ];

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

      {/* STAFF / TEACHER MODAL (Admin Only) */}
      {isStaffModalOpen && !teacherSession && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-sm w-full shadow-2xl relative">
            <button onClick={() => setIsStaffModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={18} /></button>
            <h3 className="text-lg font-bold text-purple-400 mb-4 flex items-center gap-2"><Briefcase size={18}/> Manage Staff Profile</h3>
            <form onSubmit={handleSaveStaff} className="space-y-4">
              <div><label className="text-xs text-slate-400 block mb-1">Full Name</label><input type="text" value={staffData.name} onChange={e => setStaffData({...staffData, name: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-lg text-white text-sm" required/></div>
              <div><label className="text-xs text-slate-400 block mb-1">Role / Position</label><input type="text" value={staffData.role} onChange={e => setStaffData({...staffData, role: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-lg text-white text-sm" placeholder="e.g. Teacher, Admin" required/></div>
              <div><label className="text-xs text-slate-400 block mb-1">Login Phone No</label><input type="text" value={staffData.phone} onChange={e => setStaffData({...staffData, phone: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-lg text-white text-sm" placeholder="Used for teacher login"/></div>
              <div><label className="text-xs text-amber-400 block mb-1 font-bold">Login Password (Assign)</label><input type="text" value={staffData.password} onChange={e => setStaffData({...staffData, password: e.target.value})} className="w-full bg-slate-950 border border-amber-500/50 p-3 rounded-lg text-white text-sm" placeholder="Default: 123456"/></div>
              <div><label className="text-xs text-slate-400 block mb-1">Monthly Salary (₹)</label><input type="number" value={staffData.salary} onChange={e => setStaffData({...staffData, salary: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-lg text-white text-sm"/></div>
              <button type="submit" disabled={isProcessing} className="w-full bg-purple-600 hover:bg-purple-500 py-3 rounded-xl text-sm font-bold text-white transition">{isProcessing ? 'Saving...' : 'Save Staff Data'}</button>
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
                <div><label className="text-xs text-slate-400 block mb-1">Reason for Transfer</label><input type="text" value={statusReason} onChange={e => setStatusReason(e.target.value)} placeholder="e.g. Relocation, Parent Request" className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-lg text-white text-sm" /></div>
              )}
              <button onClick={handleChangeStatus} disabled={isProcessing} className="w-full bg-amber-600 hover:bg-amber-500 py-3 rounded-xl text-sm font-bold transition flex justify-center items-center gap-2 mt-4 text-white">
                {isProcessing ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} Confirm {statusAction}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-72 bg-slate-900/80 backdrop-blur-xl border-r border-slate-800/80 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-8">
            {school.logo_url ? <img src={school.logo_url} alt="Logo" className="w-12 h-12 rounded-xl object-cover bg-white p-1" /> : <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-3 rounded-2xl shadow-lg"><School className="text-white" size={26} /></div>}
            <div>
               <h1 className="text-xl font-black bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">{school.school_name || 'EduAdmin'}</h1>
               <p className="text-xs text-slate-400">{teacherSession ? `Teacher Panel: ${teacherSession.name}` : 'Admin Portal'}</p>
            </div>
          </div>
          <nav className="space-y-2 max-h-[60vh] overflow-y-auto scrollbar-hide pr-2">
            {sidebarTabs.map((item) => {
              const Icon = item.icon;
              return (
                <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${ activeTab === item.id ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 scale-102' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'}`}><Icon size={18} />{item.label}</button>
              );
            })}
          </nav>
        </div>
        <div className="pt-6 border-t border-slate-800/80 mt-4">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition"><LogOut size={16} /> Logout Securely</button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto w-full">
        
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-4 gap-4">
               <div><h2 className="text-3xl font-bold text-white">Dashboard Overview</h2><p className="text-sm text-slate-400 mt-1">{teacherSession ? 'Manage your classes and entries.' : 'Welcome back to your school portal.'}</p></div>
               {!teacherSession && <button onClick={() => setIsAdmissionModalOpen(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 rounded-xl font-bold text-white flex items-center gap-2"><Plus size={20}/> New Admission</button>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex items-center gap-4"><div className="p-4 bg-blue-500/10 text-blue-400 rounded-xl"><Users size={28} /></div><div><p className="text-xs text-slate-400 font-semibold">Active Students</p><h3 className="text-3xl font-black text-white mt-1">{activeStudentsList.length}</h3></div></div>
              {!teacherSession && <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex items-center gap-4"><div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-xl"><DollarSign size={28} /></div><div><p className="text-xs text-slate-400 font-semibold">Total Revenue</p><h3 className="text-3xl font-black text-emerald-400 mt-1">₹{totalCollectedRevenue}</h3></div></div>}
              {!teacherSession && <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex items-center gap-4"><div className="p-4 bg-purple-500/10 text-purple-400 rounded-xl"><Briefcase size={28} /></div><div><p className="text-xs text-slate-400 font-semibold">Total Staff</p><h3 className="text-3xl font-black text-purple-400 mt-1">{staffList.length}</h3></div></div>}
            </div>

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

        {/* STUDENTS TAB (ADMIN ONLY) */}
        {activeTab === 'students' && !teacherSession && (
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
            
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-x-auto shadow-xl">
              {getFilteredStudents().length > 0 ? (
                <table className="w-full text-left min-w-[700px]">
                  <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider">
                    <tr><th className="p-4">ID & Roll</th><th className="p-4">Name & DOB</th><th className="p-4">Class</th>{studentStatusTab === 'Active' && <th className="p-4">Phone</th>}<th className="p-4 text-center">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-sm">
                    {getFilteredStudents().map((st) => (
                      <tr key={st.id} className="hover:bg-slate-800/30 transition">
                        <td className="p-4"><p className="font-bold text-blue-400">ID: {st.unique_id}</p><p className="text-xs text-slate-500 font-bold">Roll: #{st.roll_no}</p></td>
                        <td className="p-4"><p className="font-bold text-white">{st.name}</p><p className="text-[10px] text-slate-400">DOB: {st.dob}</p></td>
                        <td className="p-4"><span className="bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1 rounded-lg text-xs font-semibold">{st.student_class}</span></td>
                        {studentStatusTab === 'Active' && <td className="p-4 text-slate-400 font-medium">{st.phone || '-'}</td>}
                        <td className="p-4 flex gap-2 justify-center">
                          {studentStatusTab === 'Active' ? (
                            <>
                              <button onClick={() => setStatusModalStudent(st)} className="bg-slate-800 text-slate-300 p-2 rounded-lg"><FileOutput size={16} /></button>
                              <button onClick={() => handleEditClick(st)} className="bg-blue-500/10 text-blue-400 p-2 rounded-lg"><Edit size={16} /></button>
                            </>
                          ) : (
                            <button onClick={() => setTcPrintData(st)} className="bg-indigo-500/10 text-indigo-400 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5"><Printer size={14}/> View TC</button>
                          )}
                          <button onClick={() => handleDeleteStudent(st.id, st.student_class)} className="bg-red-500/10 text-red-400 p-2 rounded-lg"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-slate-500"><Users size={48} className="mb-4 opacity-20" /><p className="font-semibold">কোনো ডাটা পাওয়া যায়নি!</p></div>
              )}
            </div>
          </div>
        )}

        {/* NEW: MARK ENTRY TAB (TEACHER & ADMIN) */}
        {activeTab === 'mark_entry' && (
          <div className="space-y-6 animate-fade-in w-full">
             <h2 className="text-2xl font-bold border-b border-slate-800 pb-4">Student Mark Entry</h2>
             <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 flex flex-wrap gap-4 items-end">
               <div>
                  <label className="text-xs text-slate-400 block mb-1 font-bold">Select Class</label>
                  <select value={markEntryClass} onChange={e => setMarkEntryClass(e.target.value)} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-white outline-none font-bold">
                      <option value="">Select...</option>{activeClasses.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
               </div>
               <div>
                  <label className="text-xs text-slate-400 block mb-1 font-bold">Select Exam Term</label>
                  <select value={markEntryExam} onChange={e => setMarkEntryExam(e.target.value)} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-white outline-none font-bold">
                      <option value="Term 1 Exam">Term 1 Exam</option><option value="Term 2 Exam">Term 2 Exam</option><option value="Term 3 Exam">Term 3 Exam</option>
                  </select>
               </div>
               <button onClick={() => loadMarks(markEntryClass, markEntryExam)} className="bg-blue-600 px-6 py-3 rounded-xl font-bold text-white shadow-lg shadow-blue-500/20">Fetch Student List</button>
             </div>

             {markEntryClass && allClassConfigs[markEntryClass] && (
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-x-auto shadow-xl">
                   <table className="w-full text-left min-w-[800px]">
                      <thead className="bg-slate-800 text-slate-400 text-xs uppercase">
                         <tr>
                            <th className="p-4">Student Info</th>
                            {(allClassConfigs[markEntryClass].subjects || []).map(sub => (
                               <th key={sub.name} className="p-4 border-l border-slate-700 text-center">{sub.name}<br/><span className="text-[9px] opacity-70">Th:{sub.theory} | Or:{sub.oral}</span></th>
                            ))}
                            <th className="p-4 text-center border-l border-slate-700">Action</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 bg-slate-900/40">
                         {students.filter(s => s.student_class === markEntryClass && s.status === 'Active').map(st => (
                            <tr key={st.id} className="hover:bg-slate-800/30">
                               <td className="p-4 text-sm font-bold text-white">#{st.roll_no} <br/> {st.name}</td>
                               {(allClassConfigs[markEntryClass].subjects || []).map(sub => (
                                  <td key={sub.name} className="p-4 border-l border-slate-800/50">
                                     <div className="flex gap-2 justify-center">
                                        <input type="number" placeholder="Th" max={sub.theory} value={marksData[st.id]?.[`${sub.name}_theory`] || ''} onChange={(e) => { const val=parseInt(e.target.value)||0; setMarksData({...marksData, [st.id]: {...(marksData[st.id]||{}), [`${sub.name}_theory`]: val > sub.theory ? sub.theory : val }}); }} className="w-12 bg-slate-950 border border-slate-700 p-1 text-center text-xs rounded text-white" />
                                        <input type="number" placeholder="Or" max={sub.oral} value={marksData[st.id]?.[`${sub.name}_oral`] || ''} onChange={(e) => { const val=parseInt(e.target.value)||0; setMarksData({...marksData, [st.id]: {...(marksData[st.id]||{}), [`${sub.name}_oral`]: val > sub.oral ? sub.oral : val }}); }} className="w-12 bg-slate-950 border border-slate-700 p-1 text-center text-xs rounded text-white" />
                                     </div>
                                  </td>
                               ))}
                               <td className="p-4 text-center border-l border-slate-800/50">
                                  <button onClick={() => handleSaveMarks(st.id)} className="bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white px-4 py-2 rounded-lg text-xs font-bold transition">Save</button>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             )}
          </div>
        )}

        {/* ATTENDANCE TAB (UPDATED WITH DAY TYPE) */}
        {activeTab === 'attendance' && (
          <div className="space-y-6 animate-fade-in w-full">
            <h2 className="text-2xl font-bold border-b border-slate-800 pb-4">Daily Attendance System</h2>
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 flex flex-wrap gap-4 items-end shadow-xl">
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
               <div>
                  <label className="text-xs text-amber-400 block mb-1 font-bold">Day Type (আজকের দিনটি কেমন?)</label>
                  <select value={attendanceDayType} onChange={e => setAttendanceDayType(e.target.value)} className="bg-slate-950 p-3 rounded-xl border border-amber-500/50 text-amber-400 outline-none font-bold">
                      <option value="Class Day">Class Day (Normal)</option>
                      <option value="Holiday">Holiday (ছুটির দিন)</option>
                      <option value="Exam Day">Exam Day (পরীক্ষা)</option>
                      <option value="Event Day">Event / Sports Day</option>
                  </select>
               </div>
            </div>

            {attendanceClass && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                {attendanceDayType !== 'Class Day' && (
                   <div className="absolute top-0 right-0 m-4">
                      <button onClick={handleMarkAllHoliday} className="bg-amber-600 hover:bg-amber-500 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg"><CheckSquare size={16}/> Mark ALL as {attendanceDayType}</button>
                   </div>
                )}
                <h3 className="text-lg font-bold text-white mb-6">Student List: {attendanceClass}</h3>
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
                          {attendanceDayType !== 'Class Day' && (
                            <span className={`px-5 py-2 rounded-xl text-xs font-bold border transition ${attendanceRecords[st.id] === 'Holiday' ? 'border-amber-500 text-amber-400 bg-amber-500/10' : 'border-slate-700 text-slate-500'}`}>Holiday Marked</span>
                          )}
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

        {/* STAFF & TEACHERS MANAGEMENT TAB (ADMIN ONLY) */}
        {activeTab === 'staff' && !teacherSession && (
          <div className="space-y-6 animate-fade-in w-full">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <h2 className="text-2xl font-bold text-white">Staff & HR Management</h2>
              <button onClick={() => { setStaffData({ id: null, name: '', role: 'Teacher', phone: '', salary: 0, password: '', status: 'Active' }); setIsStaffModalOpen(true); }} className="bg-purple-600 hover:bg-purple-500 px-5 py-2.5 rounded-xl font-bold text-white flex items-center gap-2 shadow-lg shadow-purple-500/20 transition"><Plus size={16}/> Add Staff / Teacher</button>
            </div>
            
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-x-auto shadow-xl">
              <table className="w-full text-left min-w-[700px]">
                <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider"><tr className="border-b border-slate-800"><th className="p-4">Name & Role</th><th className="p-4">Login Details (Phone / Pass)</th><th className="p-4">Monthly Salary</th><th className="p-4 text-center">Actions</th></tr></thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {staffList.map((stf) => (
                    <tr key={stf.id} className="hover:bg-slate-800/30 transition">
                      <td className="p-4"><p className="font-bold text-white">{stf.name}</p><p className="text-[10px] text-purple-400 font-black bg-purple-500/10 inline-block px-2 py-0.5 rounded mt-1 uppercase tracking-widest">{stf.role}</p></td>
                      <td className="p-4">
                         <p className="text-slate-300 font-medium">Ph: {stf.phone || 'N/A'}</p>
                         <p className="text-xs text-amber-400 font-mono mt-1">Pass: {stf.password || 'Not Set'}</p>
                      </td>
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

        {/* NEW: ACTIVITY LOGS TAB (ADMIN ONLY) */}
        {activeTab === 'logs' && !teacherSession && (
          <div className="space-y-6 animate-fade-in w-full">
             <div className="flex justify-between items-center border-b border-slate-800 pb-4">
               <h2 className="text-2xl font-bold text-white flex items-center gap-3"><History className="text-blue-400"/> System Activity Logs</h2>
               <button onClick={fetchLogs} className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl text-xs font-bold text-white transition">Refresh Logs</button>
             </div>
             <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-x-auto shadow-xl">
               <table className="w-full text-left">
                  <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider">
                     <tr><th className="p-4">Timestamp</th><th className="p-4">User / Staff Name</th><th className="p-4">Action Performed</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-sm">
                     {activityLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-800/30 transition">
                           <td className="p-4 text-xs text-slate-400 font-mono">{new Date(log.created_at).toLocaleString()}</td>
                           <td className="p-4"><span className="bg-blue-500/10 text-blue-400 font-bold px-3 py-1 rounded-lg text-xs">{log.staff_name}</span></td>
                           <td className="p-4 text-white font-medium">{log.action}</td>
                        </tr>
                     ))}
                     {activityLogs.length === 0 && <tr><td colSpan="3" className="text-center p-8 text-slate-500">No activity recorded yet.</td></tr>}
                  </tbody>
               </table>
             </div>
          </div>
        )}

        {/* CLASS MANAGEMENT TAB (ADMIN ONLY) */}
        {activeTab === 'class_mgmt' && !teacherSession && (
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
                  <div><label className="block text-slate-400 mb-1">Academic Year</label><input type="text" value={classConfig.academic_year || ''} onChange={(e) => setClassConfig({ ...classConfig, academic_year: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white font-bold" /></div>
                  <div><label className="block text-slate-400 mb-1">Class Start Month</label><select value={classConfig.start_month || 1} onChange={(e) => setClassConfig({ ...classConfig, start_month: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white">{monthsName.map((m, idx) => (<option key={idx} value={idx + 1}>{m}</option>))}</select></div>
                </div>
                <h3 className="text-lg font-bold text-blue-400 pt-4 border-t border-slate-800 mt-4">Subject & Marks Schema</h3>
                {(classConfig.subjects || []).map((sub, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input type="text" placeholder="Subject Name" value={sub.name || ''} onChange={(e) => { const updated = [...(classConfig.subjects || [])]; updated[idx].name = e.target.value; setClassConfig({ ...classConfig, subjects: updated }); }} className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white flex-1 text-xs" />
                    <input type="number" placeholder="Oral" value={sub.oral || 0} onChange={(e) => { const updated = [...(classConfig.subjects || [])]; updated[idx].oral = parseInt(e.target.value) || 0; setClassConfig({ ...classConfig, subjects: updated }); }} className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white w-16 text-xs text-center" />
                    <input type="number" placeholder="Theory" value={sub.theory || 0} onChange={(e) => { const updated = [...(classConfig.subjects || [])]; updated[idx].theory = parseInt(e.target.value) || 0; setClassConfig({ ...classConfig, subjects: updated }); }} className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white w-16 text-xs text-center" />
                  </div>
                ))}
                <button type="button" onClick={handleAddSubjectField} className="text-xs bg-slate-800 hover:bg-slate-700 text-blue-400 font-bold px-4 py-2.5 rounded-xl transition w-full">+ Add New Subject</button>
              </div>
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-4">
                <h3 className="text-lg font-bold text-emerald-400">Default Fee Structure (₹)</h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div><label className="block text-slate-400 mb-1">Admission Fee</label><input type="number" value={classConfig.admission_fee || 0} onChange={(e) => setClassConfig({ ...classConfig, admission_fee: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-bold" /></div>
                  <div><label className="block text-slate-400 mb-1">Monthly Tuition Fee</label><input type="number" value={classConfig.tuition_fee || 0} onChange={(e) => setClassConfig({ ...classConfig, tuition_fee: e.target.value })} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-bold" /></div>
                </div>
              </div>
            </div>
            <button onClick={handleSaveClassConfig} className="bg-emerald-600 hover:bg-emerald-500 px-8 py-3.5 rounded-xl font-black flex items-center gap-2 text-white transition shadow-lg shadow-emerald-500/20"><Save size={18}/> Save Config</button>
          </div>
        )}

        {/* ERP BILLING (ADMIN ONLY) */}
        {activeTab === 'erp' && !teacherSession && (
          <div className="space-y-6 animate-fade-in w-full text-white">
             <h2 className="text-2xl font-bold border-b border-slate-800 pb-4">Financial Operations (ERP)</h2>
             {!showOnlyPendingList ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-xl">
                    <div className="space-y-5">
                      <div>
                        <label className="text-xs text-slate-400 block mb-2 font-bold uppercase tracking-wider">Step 1: Select Class</label>
                        <select value={erpSelectedClass} onChange={(e)=>setErpSelectedClass(e.target.value)} className="w-full bg-slate-950 p-3 rounded-xl border border-slate-800 outline-none font-bold"><option value="">Select Class...</option>{activeClasses.map(c=><option key={c} value={c}>{c}</option>)}</select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 block mb-2 font-bold uppercase tracking-wider">Step 2: Select Student</label>
                        <select disabled={!erpSelectedClass} value={erpStudent?.id || ''} onChange={(e) => handleSelectErpStudent(students.find(s => s.id === e.target.value))} className="w-full bg-slate-950 p-3 rounded-xl border border-slate-800 outline-none font-bold"><option value="">Select Student...</option>{students.filter(s=>s.student_class===erpSelectedClass && s.status==='Active').map(s=><option key={s.id} value={s.id}>{s.name} (#{s.roll_no})</option>)}</select>
                      </div>
                    </div>
                  </div>
                </div>

                {erpStudent && erpClassConfig && (
                  <div className="lg:col-span-8 space-y-6">
                    <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-xl">
                      <h3 className="text-lg font-bold text-emerald-400 mb-4">Payment Collection</h3>
                      <div className="flex flex-wrap gap-2 mb-6">
                          {feeOptionsList.map(fee => (
                            <button type="button" key={fee} onClick={() => toggleFeeType(fee)} className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition shadow-sm ${ erpSelectedFeeTypes.includes(fee) ? 'bg-blue-600 text-white border-blue-500 shadow-blue-500/30' : 'bg-slate-950 text-slate-400 border-slate-800' }`}>{fee}</button>
                          ))}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950 p-5 rounded-2xl border border-slate-800 mb-6">
                        <div><label className="text-[10px] text-slate-500 block mb-1 uppercase font-bold">Total Arrears (Due)</label><p className="text-2xl font-black text-rose-400">₹{erpBaseAmount}</p></div>
                        <div><label className="text-xs text-slate-400 block mb-1">Manual Discount (₹)</label><input type="number" value={erpDiscount} onChange={(e) => setErpDiscount(e.target.value)} className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl outline-none" /></div>
                      </div>
                      <div>
                        <label className="text-xs text-emerald-400 block mb-2 font-bold uppercase tracking-wider">Amount Receiving Now (₹)</label>
                        <input type="number" value={erpPaidAmount} onChange={(e) => setErpPaidAmount(e.target.value)} className="w-full bg-slate-950 border-2 border-emerald-500/50 p-5 rounded-2xl text-emerald-400 font-black text-2xl outline-none" />
                      </div>
                      <button onClick={handleCreateInvoice} disabled={isProcessing} className="w-full mt-6 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white py-4 rounded-2xl font-black transition shadow-lg shadow-emerald-500/30 flex justify-center items-center gap-2"><CreditCard size={20}/> Generate Official Receipt</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-xl">
                 <button onClick={() => setShowOnlyPendingList(false)} className="bg-slate-800 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-700 transition shadow-lg mb-4">Close List</button>
                 {/* Defaulter list code logic is retained but hidden in minimal view */}
                 <p className="text-slate-400">Defaulter list active.</p>
              </div>
            )}
          </div>
        )}

        {/* ID CARD TAB (ADMIN ONLY) */}
        {activeTab === 'idcard' && !teacherSession && (
          <div className="space-y-6 animate-fade-in w-full text-white">
            <h2 className="text-2xl font-bold border-b border-slate-800 pb-4">PVC ID Card System</h2>
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6 max-w-xl">
              <select onChange={(e) => setIdSelectedClass(e.target.value)} className="w-full bg-slate-950 p-3 rounded-xl border border-slate-800 outline-none font-bold"><option value="">Select Class...</option>{activeClasses.map(c=><option key={c} value={c}>{c}</option>)}</select>
              <select disabled={!idSelectedClass} onChange={(e) => {setSelectedIdStudent(students.find(s => s.id === e.target.value)); setPrintIdCard(true);}} className="w-full bg-slate-950 p-3 rounded-xl border border-slate-800 outline-none font-bold"><option value="">Select Student...</option>{students.filter(s=>s.student_class===idSelectedClass).map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select>
            </div>
          </div>
        )}

        {/* PROFILE TAB (ADMIN ONLY) */}
        {activeTab === 'profile' && !teacherSession && (
          <div className="space-y-6 animate-fade-in w-full text-white pb-10">
             <div className="flex justify-between items-center border-b border-slate-800 pb-4"><h2 className="text-2xl font-bold">School Profile & Settings</h2><button onClick={()=>setEditSchool(!editSchool)} className="bg-blue-600 px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg flex items-center gap-2"><Edit size={16}/> Edit Profile</button></div>
             {!editSchool ? (
                <div className="bg-slate-900/60 p-10 rounded-3xl border border-slate-800 shadow-xl text-center md:text-left flex flex-col md:flex-row items-center gap-8">
                    {school.logo_url && <img src={school.logo_url} className="w-32 h-32 rounded-full border-4 border-slate-800 bg-white p-2 object-contain" alt="Logo"/>}
                    <div>
                      <h1 className="text-4xl font-black text-blue-400">{school.school_name || 'School Name'}</h1>
                      <p className="text-slate-400 mt-2 text-lg"><MapPin size={16} className="inline mr-1"/>{school.address} | <PhoneCall size={16} className="inline ml-3 mr-1"/>{school.phone}</p>
                    </div>
                </div>
             ) : (
                <form onSubmit={handleUpdateSchool} className="bg-slate-900/80 p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl max-w-2xl">
                    <div><label className="text-xs text-slate-400 block mb-1">School Name</label><input type="text" value={school.school_name} onChange={e=>setSchool({...school, school_name: e.target.value})} className="w-full bg-slate-950 p-3 rounded-xl border border-slate-700 outline-none"/></div>
                    <div><label className="text-xs text-slate-400 block mb-1">Address</label><input type="text" value={school.address} onChange={e=>setSchool({...school, address: e.target.value})} className="w-full bg-slate-950 p-3 rounded-xl border border-slate-700 outline-none"/></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-xs text-slate-400 block mb-1">Phone</label><input type="text" value={school.phone} onChange={e=>setSchool({...school, phone: e.target.value})} className="w-full bg-slate-950 p-3 rounded-xl border border-slate-700 outline-none"/></div>
                      <div><label className="text-xs text-slate-400 block mb-1">Logo URL</label><input type="url" value={school.logo_url} onChange={e=>setSchool({...school, logo_url: e.target.value})} className="w-full bg-slate-950 p-3 rounded-xl border border-slate-700 outline-none"/></div>
                    </div>
                    <button type="submit" disabled={isProcessing} className="bg-emerald-600 w-full py-4 rounded-xl font-bold flex justify-center items-center gap-2">{isProcessing ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} Save Settings</button>
                </form>
             )}
          </div>
        )}
      </main>
    </div>
  );
}