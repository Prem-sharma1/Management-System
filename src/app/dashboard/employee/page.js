'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Clock,
  CheckSquare,
  Calendar,
  LogOut,
  Plus,
  Building,
  UserCheck,
  CheckCircle,
  FileText,
  AlertCircle,
  Briefcase,
  Play,
  Check,
  Moon,
  Sun,
  DollarSign,
  TrendingUp,
  Download,
  Users,
  FileDown
} from 'lucide-react';

const convertDbDateToIso = (dateStr) => {
  if (!dateStr) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const day = parts[0];
    const monthName = parts[1];
    const year = parts[2];
    
    const months = {
      jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
      jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
    };
    const month = months[monthName.toLowerCase()];
    if (month && day && year) {
      return `${year}-${month}-${day.padStart(2, '0')}`;
    }
  }
  
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split('T')[0];
  }
  return '';
};

const getFilterFormats = (isoDateStr) => {
  if (!isoDateStr) return { dbFormat: '', isoFormat: '' };
  const d = new Date(isoDateStr);
  if (isNaN(d.getTime())) return { dbFormat: '', isoFormat: '' };
  
  const dbFormat = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');
  const isoFormat = isoDateStr;
  return { dbFormat, isoFormat };
};

export default function EmployeeDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, tasks, leaves, payroll
  const [loading, setLoading] = useState(true);

  // Data states
  const [tasksList, setTasksList] = useState([]);
  const [leavesList, setLeavesList] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [todayLog, setTodayLog] = useState(null);
  const [clientsList, setClientsList] = useState([]);
  const [allClientTasks, setAllClientTasks] = useState([]);
  const [allClientDeliveries, setAllClientDeliveries] = useState([]);
  const [usersList, setUsersList] = useState([]);
  
  // Timer States
  const [timeStr, setTimeStr] = useState('');
  const [workDuration, setWorkDuration] = useState('00:00:00');

  // Modal State
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Status Modal States
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedTaskForStatus, setSelectedTaskForStatus] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [workSampleFile, setWorkSampleFile] = useState(null);

  // Form Fields
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });

  // Dark Mode State
  const [darkMode, setDarkMode] = useState(false);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (localStorage.getItem('theme') === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 4000);
  };

  // Clock ticks
  useEffect(() => {
    const clock = setInterval(() => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString());
    }, 1000);
    return () => clearInterval(clock);
  }, []);

  // Work timer tick when clocked in
  useEffect(() => {
    let timer;
    if (todayLog && !todayLog.clockOut) {
      timer = setInterval(() => {
        const start = new Date(todayLog.clockIn).getTime();
        const now = new Date().getTime();
        const diff = now - start;

        const hrs = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);

        setWorkDuration(
          `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
        );
      }, 1000);
    } else {
      setWorkDuration('00:00:00');
    }
    return () => clearInterval(timer);
  }, [todayLog]);

  // Auth fetch
  useEffect(() => {
    async function initDashboard() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();

        if (!res.ok || !data.user || data.user.role !== 'EMPLOYEE') {
          router.push('/');
          return;
        }

        setCurrentUser(data.user);
        await refreshData();
        setLoading(false);
      } catch (err) {
        console.error(err);
        router.push('/');
      }
    }
    initDashboard();
  }, [router]);

  const refreshData = async () => {
    try {
      // Fetch tasks
      const tasksRes = await fetch('/api/tasks');
      const tasksData = await tasksRes.json();
      setTasksList(tasksData.tasks || []);

      // Fetch leaves
      const leavesRes = await fetch('/api/leaves');
      const leavesData = await leavesRes.json();
      setLeavesList(leavesData.leaves || []);

      // Fetch attendance clock info
      const attRes = await fetch('/api/attendance');
      const attData = await attRes.json();
      setTodayLog(attData.todayLog);
      setAttendanceLogs(attData.logs || []);

      // Fetch clients
      const clientsRes = await fetch('/api/clients');
      const clientsData = await clientsRes.json();
      setClientsList(clientsData.clients || []);

      // Fetch client tasks
      const ctRes = await fetch('/api/client-tasks');
      const ctData = await ctRes.json();
      setAllClientTasks(ctData.tasks || []);

      // Fetch client deliveries
      const cdRes = await fetch('/api/client-deliveries');
      const cdData = await cdRes.json();
      setAllClientDeliveries(cdData.deliveries || []);

      // Fetch users
      const usersRes = await fetch('/api/users');
      const usersData = await usersRes.json();
      setUsersList(usersData.users || []);
    } catch (err) {
      console.error('Error refreshing employee dashboard:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (err) {
      console.error(err);
    }
  };

  // Clock operations
  const handleClockToggle = async () => {
    try {
      let locationLink = null;
      
      // If it's a clock-in (todayLog doesn't exist or clockOut exists), try to get location
      if (!todayLog || todayLog.clockOut) {
        if (navigator.geolocation) {
          try {
            const position = await new Promise((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
            });
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            locationLink = `https://www.google.com/maps?q=${lat},${lng}`;
          } catch (geoErr) {
            console.warn('Geolocation failed or blocked', geoErr);
            locationLink = 'Location Blocked/Unavailable';
          }
        } else {
          locationLink = 'Geolocation not supported by browser';
        }
      }

      const res = await fetch('/api/attendance', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: locationLink })
      });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'Clocking action failed.', 'error');
        return;
      }

      showToast(data.message);
      await refreshData();
    } catch (err) {
      showToast('Connection error.', 'error');
    }
  };

  // Task operation Modal Trigger
  const openStatusModal = (task, type = 'INTERNAL') => {
    setSelectedTaskForStatus({ ...task, type });
    setNewStatus(task.status);
    setStatusReason(task.reason || '');
    setWorkSampleFile(null);
    setShowStatusModal(true);
  };

  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    if (!newStatus) return;
    if ((newStatus === 'PENDING' || newStatus === 'OVERDUE' || newStatus === 'Pending' || newStatus === 'Overdue') && !statusReason) {
      setFormError('Reason is required for pending or overdue tasks.');
      return;
    }

    const isCompleted = ['DONE', 'Completed', 'Client Review', 'Completion'].includes(newStatus);
    const isExempt = currentUser && ['pujan', 'preet', 'rama'].includes(currentUser.name.toLowerCase());
    
    if (isCompleted && !isExempt && !workSampleFile && (!selectedTaskForStatus?.workSampleUrl)) {
      setFormError('A work sample file is required to submit work for client review / completion.');
      return;
    }

    setFormError('');
    setFormLoading(true);

    try {
      let finalWorkSampleUrl = selectedTaskForStatus?.workSampleUrl || undefined;

      if (workSampleFile) {
        const formData = new FormData();
        formData.append('file', workSampleFile);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          finalWorkSampleUrl = uploadData.fileUrl;
        } else {
          setFormError('Failed to upload work sample.');
          setFormLoading(false);
          return;
        }
      }

      if (selectedTaskForStatus.type === 'INTERNAL') {
        const res = await fetch(`/api/tasks/${selectedTaskForStatus.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus, reason: statusReason, workSampleUrl: finalWorkSampleUrl })
        });
        if (res.ok) {
          showToast('Task updated.');
          setShowStatusModal(false);
          await refreshData();
        } else {
          setFormError('Failed to update task.');
        }
      } else {
        const res = await fetch(`/api/client-tasks/${selectedTaskForStatus.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus, reason: statusReason, workSampleUrl: finalWorkSampleUrl })
        });
        if (res.ok) {
          showToast('Client task updated.');
          setShowStatusModal(false);
          await refreshData();
        } else {
          setFormError('Failed to update client task.');
        }
      }
    } catch (err) {
      setFormError('Connection error.');
    } finally {
      setFormLoading(false);
    }
  };

  // Leave request submission
  const handleRequestLeave = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason) {
      setFormError('Please fill out all required fields.');
      return;
    }
    setFormError('');
    setFormLoading(true);

    try {
      const res = await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate, endDate, reason })
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to submit leave.');
        setFormLoading(false);
        return;
      }

      showToast('Leave request submitted successfully.');
      setShowRequestModal(false);
      setStartDate('');
      setEndDate('');
      setReason('');
      await refreshData();
    } catch (err) {
      setFormError('Connection error.');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm">Loading Employee Console...</p>
        </div>
      </div>
    );
  }

  const todayIso = new Date().toISOString().split('T')[0];

  const employeeTasksList = tasksList;

  const employeeMyClientTasks = allClientTasks.filter(task => {
    if (!task.workingOn || !currentUser?.name) return false;
    return task.workingOn.toLowerCase().includes(currentUser.name.toLowerCase());
  });

  const completedTasks = employeeTasksList.filter(t => t.status === 'DONE').length;
  const pendingTasks = employeeTasksList.filter(t => t.status !== 'DONE').length;

  const formats = getFilterFormats(filterDate);

  const filteredTasksList = employeeTasksList.filter(task => {
    if (!filterDate) return true;
    return task.dueDate === formats.isoFormat;
  });

  const filteredClientTasks = employeeMyClientTasks.filter(ct => {
    if (!filterDate) return true;
    return convertDbDateToIso(ct.date) === formats.isoFormat;
  });

  const isWeeklyReportStaff = currentUser && ['pujan', 'preet', 'rama'].includes(currentUser.name.toLowerCase());

  const myDepartmentClientTasks = allClientTasks.filter(t => {
    if (t.workingOn === currentUser?.name) return true;
    
    if (isWeeklyReportStaff) {
      if (t.status === 'Completion') return true;
      if (t.status === 'Client Review') {
        const changedTime = t.statusChangedAt ? new Date(t.statusChangedAt).getTime() : new Date(t.createdAt).getTime();
        const timeDiffMinutes = (new Date().getTime() - changedTime) / (1000 * 60);
        if (timeDiffMinutes >= 10) return true;
      }
    }
    
    if (!t.workingOn && t.assignTo === currentUser?.department) return true;
    return false;
  });

  const filteredDeptClientTasks = myDepartmentClientTasks.filter(ct => {
    if (!filterDate) return true;
    return convertDbDateToIso(ct.date) === formats.isoFormat;
  });

  const todaysTasksCount = [
    ...employeeTasksList.filter(t => t.status !== 'DONE' && t.dueDate === todayIso),
    ...employeeMyClientTasks.filter(ct => ct.status !== 'Completion' && convertDbDateToIso(ct.date) === todayIso)
  ].length;

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      
      {/* Toast Alert */}
      {toast.message && (
        <div className={`fixed bottom-5 right-5 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 border text-sm font-semibold animate-slide-in
          ${toast.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300' 
            : 'bg-red-50 dark:bg-red-950/80 border-red-200 dark:border-red-900 text-red-850 dark:text-red-300'
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <Building className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              WorkForce OS
            </span>
          </div>

          {/* User profile details */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-800/20">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white text-lg font-bold shadow-md">
              {currentUser.avatar || '👤'}
            </div>
            <div className="overflow-hidden">
              <div className="font-bold text-sm text-slate-900 dark:text-white truncate">{currentUser.name}</div>
              <div className="text-[10px] text-blue-600 dark:text-blue-400 font-extrabold tracking-widest uppercase">
                {currentUser.department} STAFF
              </div>
            </div>
          </div>

          {/* Sidebar Navigation */}
          <nav className="p-4 flex flex-col gap-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === 'overview'
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              Overview & Clock
            </button>
            
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === 'tasks'
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              My Assigned Tasks
              {pendingTasks > 0 && (
                <span className="ml-auto w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                  {pendingTasks}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('directory')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === 'directory'
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              Employee Directory
            </button>


            <button
              onClick={() => setActiveTab('client-tasks')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === 'client-tasks'
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Client Deliverables
            </button>

            <button
              onClick={() => setActiveTab('leaves')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === 'leaves'
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Time-Off Requests
            </button>

            <button
              onClick={() => setActiveTab('payroll')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === 'payroll'
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              Payslips & Info
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-200 dark:border-slate-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 font-bold rounded-xl text-sm transition"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-grow flex flex-col min-w-0 overflow-y-auto h-screen">
        
        {/* Header */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-8 shrink-0">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white capitalize">
            {activeTab === 'overview' ? 'Personal workspace' : activeTab.replace('-', ' ')}
          </h2>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleDarkMode}
              className="w-9 h-9 border border-slate-200 dark:border-slate-800 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              {darkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
              <Calendar className="w-4 h-4" />
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            </div>
          </div>
        </header>

        {/* Tab Content Container */}
        <div className="p-8 flex-grow">
          
          {/* TAB 1: OVERVIEW & CLOCK */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
              
              {/* Left Column: Clock and Attendance info */}
              <div className="lg:col-span-7 space-y-8">
                
                {/* Clock Card Panel */}
                <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center text-center gap-6 overflow-hidden animate-slide-up" style={{ animationDelay: '100ms' }}>
                  <div className="absolute inset-0 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl animate-pulse-soft pointer-events-none"></div>
                  <div className="absolute -left-12 -top-12 w-40 h-40 bg-blue-100/50 dark:bg-blue-800/20 rounded-full blur-3xl pointer-events-none animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
                  <div className="absolute -right-12 -bottom-12 w-40 h-40 bg-cyan-100/50 dark:bg-cyan-800/20 rounded-full blur-3xl pointer-events-none animate-pulse-soft" style={{ animationDelay: '2s' }}></div>
                  
                  <div className="relative z-10 w-full flex flex-col items-center justify-center gap-6">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest mb-1">Punctuality Clock</h3>
                      <div className="text-4xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                        {timeStr || '00:00:00'}
                      </div>
                    </div>

                    {todayLog && !todayLog.clockOut ? (
                      <div className="space-y-1">
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Shift Duration (Today)</div>
                        <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">{workDuration}</div>
                      </div>
                    ) : null}

                    <div className="flex flex-col items-center gap-2">
                      <button 
                        onClick={handleClockToggle}
                        className={`h-12 px-8 font-extrabold text-sm tracking-wider uppercase rounded-full shadow-lg transition flex items-center gap-2 text-white hover:scale-105 active:scale-95
                          ${todayLog && !todayLog.clockOut
                            ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20' 
                            : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'}`}
                      >
                        <Clock className="w-4 h-4 animate-pulse" />
                        <span>{todayLog && !todayLog.clockOut ? 'Clock Out' : 'Clock In'}</span>
                      </button>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {todayLog && !todayLog.clockOut 
                          ? `Clocked in today at ${new Date(todayLog.clockIn).toLocaleTimeString()}`
                          : todayLog
                          ? `Shift completed today at ${new Date(todayLog.clockOut).toLocaleTimeString()}`
                          : 'No session active for today.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Today's Tasks List Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm mt-6">
                  <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Today's Tasks Checklist</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Assigned deliverables and checklist duties for today.</p>
                    </div>
                    <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[9px] font-bold rounded-lg uppercase">Today ({todaysTasksCount})</span>
                  </div>

                  <div className="space-y-3">
                    {[
                      ...employeeTasksList
                        .filter(t => t.dueDate === todayIso)
                        .map(t => ({ ...t, type: 'internal' })),
                      ...employeeMyClientTasks
                        .filter(ct => convertDbDateToIso(ct.date) === todayIso)
                        .map(ct => ({ ...ct, type: 'client' }))
                    ].length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-6 italic font-medium">No tasks scheduled for today.</p>
                    ) : (
                      [
                        ...employeeTasksList
                          .filter(t => t.dueDate === todayIso)
                          .map(t => ({ ...t, type: 'internal' })),
                        ...employeeMyClientTasks
                          .filter(ct => convertDbDateToIso(ct.date) === todayIso)
                          .map(ct => ({ ...ct, type: 'client' }))
                      ].map((item) => (
                        <div 
                          key={item.type === 'internal' ? `today-int-${item.id}` : `today-cli-${item.id}`}
                          className="p-3.5 border border-slate-200/60 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/10 flex items-center justify-between gap-3 text-xs shadow-sm hover:shadow transition duration-200"
                        >
                          <div className="space-y-1 overflow-hidden pr-2">
                            <p className="font-bold text-slate-900 dark:text-white truncate">
                              {item.type === 'internal' ? item.title : item.taskTitle}
                            </p>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[9px] font-semibold text-slate-500">
                              <span className={`px-1 rounded text-[8px] uppercase ${item.type === 'internal' ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/25 dark:text-blue-400'}`}>
                                {item.type === 'internal' ? 'Internal' : 'Client Task'}
                              </span>
                              <span>•</span>
                              <span className="truncate">{item.type === 'internal' ? `Assigned by: ${item.createdBy.name}` : `Client: ${item.businessName}`}</span>
                              {item.priority && (
                                <>
                                  <span>•</span>
                                  <span className={`uppercase text-[8px] font-bold ${item.priority === 'Urgent' ? 'text-red-500' : item.priority === 'High' ? 'text-orange-500' : 'text-slate-400'}`}>
                                    {item.priority}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          
                          <div className="shrink-0 flex items-center gap-2">
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider
                              ${item.status === 'Completion' || item.status === 'DONE' 
                                ? 'bg-emerald-100 text-emerald-850 dark:bg-emerald-950/40 dark:text-emerald-400' 
                                : item.status === 'Processing' 
                                ? 'bg-blue-100 text-blue-850 dark:bg-blue-950/40 dark:text-blue-400' 
                                : item.status === 'Client Review'
                                ? 'bg-amber-100 text-amber-850 dark:bg-amber-950/40 dark:text-amber-400'
                                : item.status === 'Revision'
                                ? 'bg-red-100 text-red-850 dark:bg-red-955/40 dark:text-red-400'
                                : 'bg-slate-100 text-slate-755 dark:bg-slate-800 dark:text-slate-400'}`}
                            >
                              {item.status === 'DONE' || item.status === 'Completion' ? 'Done' : item.status}
                            </span>
                            <button 
                              onClick={() => {
                                setSelectedTaskForStatus(item);
                                setNewStatus(item.status);
                                setStatusReason(item.reason || '');
                                setShowStatusModal(true);
                              }}
                              className="py-1 px-2.5 bg-blue-55 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg text-[9px] font-bold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition flex items-center gap-0.5 cursor-pointer"
                            >
                              Update
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Clock Logs history */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mb-4">My Sign-in Sheet (Recent)</h4>
                  
                  <div className="space-y-3">
                    {attendanceLogs.length === 0 ? (
                      <p className="text-xs text-slate-400">No shift hours logged.</p>
                    ) : (
                      attendanceLogs.slice(0, 3).map((log) => (
                        <div key={log.id} className="flex justify-between items-center text-xs p-3 bg-slate-50 dark:bg-slate-800/30 border border-slate-200/50 dark:border-slate-800 rounded-xl">
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{log.date}</span>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              In: {new Date(log.clockIn).toLocaleTimeString()} 
                              {log.clockOut ? ` | Out: ${new Date(log.clockOut).toLocaleTimeString()}` : ' | Active'}
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase
                            ${log.status === 'PRESENT' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600' : 'bg-red-50 dark:bg-red-950/40 text-red-600'}`}
                          >
                            {log.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* Right Column: Brief summary cards */}
              <div className="lg:col-span-5 space-y-6">
                
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border-l-4 border-l-blue-600 flex items-center justify-between transition hover:shadow-md animate-slide-up" style={{ animationDelay: '150ms' }}>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-455 font-extrabold uppercase tracking-widest block">Today's Assigned Tasks</span>
                    <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400">{todaysTasksCount}</h3>
                    <p className="text-[9px] text-slate-400 font-medium">Scheduled for today</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Active Deliverables</span>
                    <h3 className="text-2xl font-black dark:text-white">{pendingTasks}</h3>
                  </div>
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
                    <CheckSquare className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Approved Absences</span>
                    <h3 className="text-2xl font-black dark:text-white">
                      {leavesList.filter(l => l.status === 'APPROVED').length}
                    </h3>
                  </div>
                  <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Completed Actions</span>
                    <h3 className="text-2xl font-black dark:text-white">{completedTasks}</h3>
                  </div>
                  <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mt-6">
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mb-4">Today's Priorities</h4>
                  <div className="space-y-3">
                    {(() => {
                      const todayIso = new Date().toISOString().split('T')[0];
                      const todayTasks = [
                        ...employeeTasksList
                          .filter(t => t.status !== 'DONE' && (t.dueDate === todayIso))
                          .map(t => ({ ...t, type: 'internal' })),
                        ...employeeMyClientTasks
                          .filter(ct => ct.status !== 'Completed' && ct.status !== 'Done' && (convertDbDateToIso(ct.date) === todayIso))
                          .map(ct => ({ ...ct, type: 'client' }))
                      ];
                      
                      if (todayTasks.length === 0) {
                        return <p className="text-[10px] text-slate-400 text-center py-4 font-semibold">No pending tasks for today!</p>;
                      }
                      
                      return todayTasks
                        .sort((a, b) => {
                          const p = { Urgent: 3, High: 2, Normal: 1 };
                          return (p[b.priority] || 1) - (p[a.priority] || 1);
                        })
                        .slice(0, 3)
                        .map(item => (
                          item.type === 'internal' ? (
                            <div key={`int-${item.id}`} className="p-3 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/30">
                              <div className="flex justify-between items-start gap-2">
                                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.title}</p>
                                <span className={`shrink-0 inline-block px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase
                                  ${item.priority === 'Urgent' ? 'bg-red-500 text-white' 
                                    : item.priority === 'High' ? 'bg-orange-400 text-white' 
                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                  {item.priority || 'Normal'}
                                </span>
                              </div>
                              <p className="text-[9px] text-slate-400 mt-1.5 font-bold">Due: {item.dueDate || 'No limit'}</p>
                            </div>
                          ) : (
                            <div key={`cli-${item.id}`} className="p-3 border border-blue-100 dark:border-blue-900/30 rounded-xl bg-blue-50/50 dark:bg-blue-900/10">
                              <div className="flex justify-between items-start gap-2">
                                <p className="text-xs font-bold text-blue-900 dark:text-blue-100 truncate">{item.taskTitle}</p>
                                <span className={`shrink-0 inline-block px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase
                                  ${item.priority === 'Urgent' ? 'bg-red-500 text-white' 
                                    : item.priority === 'High' ? 'bg-orange-400 text-white' 
                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                  {item.priority || 'Normal'}
                                </span>
                              </div>
                              <p className="text-[9px] text-blue-600/70 dark:text-blue-400/70 mt-1.5 font-bold">Client: {item.businessName} | Date: {item.date}</p>
                            </div>
                          )
                        ));
                    })()}
                  </div>
                  <button onClick={() => setActiveTab('tasks')} className="mt-4 w-full py-2 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition uppercase tracking-wider">
                    View All Tasks →
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: MY TASKS */}
          {activeTab === 'tasks' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-fade-in">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Assigned Duties checklist</h4>
                  <p className="text-xs text-slate-400 mt-1">Review task details and report updates by clicking status transitions.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Date:</span>
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="p-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                  {filterDate && (
                    <button 
                      onClick={() => setFilterDate('')}
                      className="py-1 px-2.5 bg-red-55 hover:bg-red-100 dark:hover:bg-red-950/20 text-red-600 rounded-lg text-[10px] font-bold transition"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-4">
                {filteredTasksList.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No tasks assigned yet for this date.</p>
                ) : (
                  filteredTasksList.map((task) => (
                    <div 
                      key={task.id} 
                      className={`p-4 border rounded-xl flex items-center justify-between transition duration-300
                        ${task.status === 'DONE' 
                          ? 'border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/40 opacity-75' 
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 hover:-translate-y-1 cursor-default'}`}
                    >
                      <div className="space-y-1 pr-6 overflow-hidden">
                        <p className={`text-xs font-bold leading-tight flex items-center gap-2 ${task.status === 'DONE' ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                          {task.title}
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase w-max no-underline
                            ${task.priority === 'Urgent' ? 'bg-red-500 text-white' 
                              : task.priority === 'High' ? 'bg-orange-400 text-white' 
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                            {task.priority || 'Normal'}
                          </span>
                        </p>
                        {task.description && (task.description.startsWith('http') || task.description.startsWith('/uploads/')) ? (
                          <a 
                            href={task.description} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md"
                          >
                            <FileDown className="w-3.5 h-3.5" /> View Script PDF
                          </a>
                        ) : (
                          <p className="text-[10px] text-slate-450 truncate mt-1">{task.description}</p>
                        )}
                        <p className="text-[9px] text-slate-400 font-medium mt-1.5">Assigned by: {task.createdBy.name} ({task.createdBy.role}) | Due: {task.dueDate || 'No Limit'}</p>
                        {task.reason && (
                           <p className="text-[10px] text-red-500 font-medium italic mt-1.5 bg-red-50 dark:bg-red-950/20 p-1.5 rounded-md border border-red-100 dark:border-red-900/30">Reason: {task.reason}</p>
                        )}
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {task.status !== 'DONE' && (
                          <button 
                            onClick={() => openStatusModal(task, 'INTERNAL')}
                            className="py-1 px-3 border border-blue-200 text-blue-600 dark:border-blue-800 dark:text-blue-400 rounded-lg text-[9px] font-bold hover:bg-blue-50 dark:hover:bg-blue-950/20 transition flex items-center gap-1"
                          >
                            <Play className="w-2.5 h-2.5" /> Update Status
                          </button>
                        )}
                        {task.status === 'DONE' && (
                          <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 text-[9px] font-bold rounded-lg uppercase tracking-wider">
                            Completed
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}

                {/* Client Tasks Section */}
                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mb-4">Client Deliverables</h4>
                  <div className="space-y-4">
                    {filteredClientTasks.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-6">No client tasks assigned yet for this date.</p>
                    ) : (
                      filteredClientTasks.map((ct) => (
                        <div 
                          key={ct.id} 
                          className="p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition duration-300 hover:shadow-md"
                        >
                          <div className="space-y-1 pr-6 overflow-hidden">
                            <p className="text-xs font-bold leading-tight text-slate-900 dark:text-white flex items-center gap-2">
                              {ct.taskTitle} 
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase
                                ${ct.priority === 'Urgent' ? 'bg-red-500 text-white' 
                                  : ct.priority === 'High' ? 'bg-orange-400 text-white' 
                                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                {ct.priority || 'Normal'}
                              </span>
                              <span className="text-[10px] text-slate-400 ml-1 font-normal">({ct.taskId})</span>
                            </p>
                            <p className="text-[10px] text-slate-500 font-medium mt-1">
                              <Building className="w-3 h-3 inline-block mr-1 text-slate-400" /> Client: <span className="font-bold">{ct.businessName}</span> | Post Type: {ct.postType || 'N/A'}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium mt-1">
                              Date: {ct.date} | Status: <span className={`font-bold ${['Completed', 'DONE', 'Completion'].includes(ct.status) ? 'text-emerald-500' : ['Overdue', 'OVERDUE'].includes(ct.status) ? 'text-red-500' : ['Pending', 'PENDING'].includes(ct.status) ? 'text-yellow-500' : 'text-blue-500'}`}>{ct.status}</span>
                            </p>
                            {/* Display script link for AI Video tasks */}
                            {ct.postType === 'AI Video' && (() => {
                              const scriptTitle = `${ct.taskTitle} Script`;
                              const scriptTask = allClientTasks.find(t => t.clientId === ct.clientId && t.taskTitle === scriptTitle);
                              if (scriptTask && scriptTask.workSampleUrl) {
                                return (
                                  <a 
                                    href={scriptTask.workSampleUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-md w-fit"
                                  >
                                    <FileText className="w-3.5 h-3.5" /> View Script from Harshit
                                  </a>
                                );
                              }
                              return null;
                            })()}
                            {/* Display own work sample if uploaded */}
                            {ct.workSampleUrl && (
                              <div className="mt-1.5">
                                <a 
                                  href={ct.workSampleUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-md w-fit"
                                >
                                  <FileDown className="w-3.5 h-3.5" /> View Work Sample
                                </a>
                              </div>
                            )}
                            {ct.reason && (
                              <p className="text-[10px] text-red-500 font-medium italic mt-1.5 bg-red-50 dark:bg-red-950/20 p-1.5 rounded-md border border-red-100 dark:border-red-900/30">Reason: {ct.reason}</p>
                            )}
                          </div>
                          
                          <div className="shrink-0 flex items-center gap-2">
                             {ct.status !== 'Completion' && (
                               <button onClick={() => openStatusModal(ct, 'CLIENT')} className="py-1 px-3 border border-blue-200 text-blue-600 dark:border-blue-800 dark:text-blue-400 rounded-lg text-[9px] font-bold hover:bg-blue-50 dark:hover:bg-blue-950/20 transition flex items-center gap-1 shrink-0">
                                 <Play className="w-2.5 h-2.5" /> Update Status
                               </button>
                             )}
                             {ct.status === 'Completion' && (
                               <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 text-[9px] font-bold rounded-lg uppercase tracking-wider">
                                 Completed
                               </span>
                             )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LEAVE REQUESTS */}
          {activeTab === 'leaves' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Absence & Leave tracker</h4>
                  <p className="text-xs text-slate-400 mt-1">Submit new leave requests and track pending approvals.</p>
                </div>
                <button
                  onClick={() => { setFormError(''); setShowRequestModal(true); }}
                  className="bg-blue-800 hover:bg-blue-900 text-white py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4" />
                  Submit Request
                </button>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                        <th className="p-4 uppercase tracking-wider">Reason / Details</th>
                        <th className="p-4 uppercase tracking-wider">Date Interval</th>
                        <th className="p-4 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leavesList.length === 0 ? (
                        <tr>
                          <td colSpan="3" className="p-8 text-center text-slate-400">No leave history found.</td>
                        </tr>
                      ) : (
                        leavesList.map((leave) => (
                          <tr key={leave.id} className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50/30 transition">
                            <td className="p-4 font-bold text-slate-900 dark:text-white">"{leave.reason}"</td>
                            <td className="p-4 text-slate-550 font-semibold">{leave.startDate} to {leave.endDate}</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase
                                ${leave.status === 'APPROVED' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600' : leave.status === 'REJECTED' ? 'bg-red-50 dark:bg-red-950/40 text-red-650' : 'bg-orange-50 dark:bg-orange-950/40 text-orange-600'}`}
                              >
                                {leave.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PAYSLIPS */}
          {activeTab === 'payroll' && (
            <div className="space-y-8 animate-fade-in">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white">Active Compensation Details</h4>
                    <p className="text-xs text-slate-400 mt-1">Estimations and detailed structures of your corporate payroll.</p>
                  </div>
                  <button 
                    onClick={() => alert("Payroll statement PDF print request triggers mock download.")}
                    className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 transition flex items-center gap-1.5 text-xs font-bold"
                  >
                    <Download className="w-4.5 h-4.5" />
                    Download Pay Stub
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold">Monthly Base Salary</span>
                    <h3 className="text-xl font-bold dark:text-white">${currentUser.salary.toLocaleString()}</h3>
                    <p className="text-[10px] text-emerald-500 font-semibold">Verified Ledger Record</p>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold">Estimated Net Pay (After Tax)</span>
                    <h3 className="text-xl font-bold dark:text-white">${(currentUser.salary * 0.78).toLocaleString()}</h3>
                    <p className="text-[10px] text-slate-400">Assumes 22% overall tax deductions</p>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold">Annual Salary Equivalent</span>
                    <h3 className="text-xl font-bold dark:text-white">${(currentUser.salary * 12).toLocaleString()}</h3>
                    <p className="text-[10px] text-slate-400">Based on active corporate contract</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: EMPLOYEE DIRECTORY */}
          {activeTab === 'directory' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-fade-in">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Employee Directory</h4>
                <p className="text-xs text-slate-400 mt-1">View your colleagues and their departments.</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {usersList.map((u) => (
                    <div key={u.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-3 bg-slate-50 dark:bg-slate-800/20">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                        {u.avatar || '👤'}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{u.name}</p>
                        <p className="text-[10px] text-slate-500">{u.department} - {u.role}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{u.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}


          {/* TAB: CLIENT TASKS */}
          {activeTab === 'client-tasks' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-fade-in">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">CRM Deliverables</h4>
                  <p className="text-xs text-slate-400 mt-1">View and manage client tasks assigned to you or your department.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Date:</span>
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="p-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                  {filterDate && (
                    <button 
                      onClick={() => setFilterDate('')}
                      className="py-1 px-2.5 bg-red-55 hover:bg-red-100 dark:hover:bg-red-950/20 text-red-600 rounded-lg text-[10px] font-bold transition"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
              <div className="p-6 space-y-8">
                
                {/* Client Tasks Section */}
                <div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Client Tasks</h5>
                  <div className="space-y-4">
                    {filteredDeptClientTasks.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-6">No client tasks found for this date.</p>
                    ) : (
                      filteredDeptClientTasks
                        .map((task) => (
                          <div key={task.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/20">
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                              <div className="space-y-1">
                                <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                  {task.taskTitle} 
                                  <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase
                                    ${task.priority === 'Urgent' ? 'bg-red-500 text-white' 
                                      : task.priority === 'High' ? 'bg-orange-400 text-white' 
                                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                    {task.priority || 'Normal'}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-normal ml-1">({task.taskId})</span>
                                  {(() => {
                                      const changedTime = task.statusChangedAt ? new Date(task.statusChangedAt).getTime() : new Date(task.createdAt).getTime();
                                      const timeDiffMinutes = (new Date().getTime() - changedTime) / (1000 * 60);
                                      const isApproved = task.status === 'Completion';
                                      const isAutoApproved = task.status === 'Client Review' && timeDiffMinutes >= 10;
                                      
                                      if (isApproved) {
                                        return (
                                          <span className="ml-2 inline-block px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
                                            Approved - Ready to Post
                                          </span>
                                        );
                                      } else if (isAutoApproved) {
                                        return (
                                          <span className="ml-2 inline-block px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase bg-amber-100 text-amber-855 dark:bg-amber-955/40 dark:text-amber-400 animate-pulse">
                                            Auto-Approved (10m) - Ready to Post
                                          </span>
                                        );
                                      }
                                      return null;
                                    })()}
                                </p>
                                <p className="text-xs text-slate-500">
                                  Client: <span className="font-semibold text-slate-700 dark:text-slate-300">{task.businessName}</span> | 
                                  Type: {task.postType} | 
                                  Date: <input 
                                    type="date" 
                                    className="bg-transparent border-b border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500 mx-1 px-1"
                                    value={convertDbDateToIso(task.date)}
                                    onChange={async (e) => {
                                      await fetch(`/api/client-tasks/${task.id}`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ date: e.target.value })
                                      });
                                      refreshData();
                                    }}
                                  />
                                </p>
                                <div className="text-xs text-slate-500 flex items-center gap-2 mt-2">
                                  <span>Assigned to:</span>
                                  <span className={`px-2 py-0.5 rounded-full font-semibold ${task.workingOn ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300'}`}>
                                    {task.workingOn || 'Unclaimed'}
                                  </span>
                                  {!task.workingOn && (
                                    <button 
                                      onClick={async () => {
                                        await fetch(`/api/client-tasks/${task.id}`, {
                                          method: 'PUT',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ workingOn: currentUser.name })
                                        });
                                        refreshData();
                                      }}
                                      className="text-blue-600 hover:underline cursor-pointer font-bold"
                                    >
                                      Claim Task
                                    </button>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col items-end justify-between gap-2">
                                <select 
                                  className="text-[10px] font-bold uppercase px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500"
                                  value={task.status}
                                  onChange={async (e) => {
                                    await fetch(`/api/client-tasks/${task.id}`, {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ status: e.target.value })
                                    });
                                    refreshData();
                                  }}
                                >
                                  <option value="Not Started">Not Started</option>
                                  <option value="Processing">Processing</option>
                                  <option value="Client Review">Client Review</option>
                                  <option value="Revision">Revision</option>
                                  <option value="Completion">Completion</option>
                                  <option value="Pending">Pending</option>
                                  <option value="Overdue">Overdue</option>
                                </select>
                                <textarea
                                  className="text-xs p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 w-48 resize-none"
                                  placeholder="Add notes..."
                                  defaultValue={task.notes || ''}
                                  onBlur={async (e) => {
                                    if (e.target.value !== task.notes) {
                                      await fetch(`/api/client-tasks/${task.id}`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ notes: e.target.value })
                                      });
                                      refreshData();
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>

                <hr className="border-slate-200 dark:border-slate-800" />

                {/* Client Deliverables Section */}
                <div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Client Deliveries</h5>
                  <div className="space-y-4">
                    {allClientDeliveries.filter(d => d.workingOn === currentUser?.name).length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-6">No active deliveries assigned to you.</p>
                    ) : (
                      allClientDeliveries
                        .filter(d => d.workingOn === currentUser?.name)
                        .map((delivery) => (
                          <div key={delivery.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/20">
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                              <div className="space-y-1">
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{delivery.clientName} <span className="text-[10px] text-slate-400 font-normal ml-2">({delivery.deliveryId})</span></p>
                                <p className="text-xs text-slate-500">
                                  Type: {delivery.postType} | 
                                  Post Date: <input 
                                    type="date" 
                                    className="bg-transparent border-b border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500 mx-1 px-1"
                                    defaultValue={delivery.postDate || ''}
                                    onChange={async (e) => {
                                      await fetch(`/api/client-deliveries/${delivery.id}`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ postDate: e.target.value })
                                      });
                                      refreshData();
                                    }}
                                  />
                                </p>
                              </div>
                              <div className="flex flex-col items-end justify-between gap-2">
                                <select 
                                  className="text-[10px] font-bold uppercase px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500"
                                  value={delivery.status}
                                  onChange={async (e) => {
                                    await fetch(`/api/client-deliveries/${delivery.id}`, {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ status: e.target.value })
                                    });
                                    refreshData();
                                  }}
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="In Progress">In Progress</option>
                                  <option value="Delivered">Delivered</option>
                                </select>
                                <textarea
                                  className="text-xs p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 w-48 resize-none"
                                  placeholder="Add notes..."
                                  defaultValue={delivery.notes || ''}
                                  onBlur={async (e) => {
                                    if (e.target.value !== delivery.notes) {
                                      await fetch(`/api/client-deliveries/${delivery.id}`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ notes: e.target.value })
                                      });
                                      refreshData();
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </main>

      {/* --- STATUS UPDATE MODAL --- */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900">
              <h3 className="font-extrabold text-sm text-slate-950 dark:text-white">Update Task Status</h3>
              <button onClick={() => setShowStatusModal(false)} className="text-slate-400 hover:text-slate-600 transition text-sm">✕</button>
            </div>
            
            <form onSubmit={handleUpdateStatusSubmit}>
              <div className="p-6 space-y-4 text-xs">
                {formError && (
                  <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-700 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">New Status</label>
                  <select
                    required
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none uppercase tracking-wider font-bold"
                  >
                    {selectedTaskForStatus?.type === 'INTERNAL' ? (
                       <>
                         <option value="TODO">To Do</option>
                         <option value="DONE">Done / Completed</option>
                         <option value="PENDING">Pending (Blocked)</option>
                         <option value="OVERDUE">Overdue</option>
                       </>
                    ) : (
                       <>
                         <option value="Not Started">Not Started</option>
                         <option value="Processing">Processing</option>
                         <option value="Client Review">Client Review</option>
                         <option value="Revision">Revision</option>
                         <option value="Completion">Completion</option>
                         <option value="Pending">Pending (Blocked)</option>
                         <option value="Overdue">Overdue</option>
                       </>
                    )}
                  </select>
                </div>

                {(newStatus === 'PENDING' || newStatus === 'OVERDUE' || newStatus === 'Pending' || newStatus === 'Overdue') && (
                  <div className="space-y-1">
                    <label className="font-bold text-red-600 dark:text-red-400">Reason for Delay <span className="text-red-500">*</span></label>
                    <textarea
                      value={statusReason}
                      required
                      onChange={(e) => setStatusReason(e.target.value)}
                      placeholder="Explain why this task is pending or overdue..."
                      rows="3"
                      className="w-full p-2.5 border border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-950/10 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-red-500 transition"
                    />
                  </div>
                )}

                {['DONE', 'Completed', 'Client Review', 'Completion'].includes(newStatus) && currentUser && !['pujan', 'preet', 'rama'].includes(currentUser.name.toLowerCase()) && (
                  <div className="space-y-1 mt-2">
                    <label className="font-bold text-blue-600 dark:text-blue-400">Upload Work Sample <span className="text-red-500">*</span></label>
                    <p className="text-[10px] text-slate-500 mb-1">Creative team members must attach today's work sample to submit for client review / completion.</p>
                    <input
                      type="file"
                      required={!selectedTaskForStatus?.workSampleUrl}
                      onChange={(e) => setWorkSampleFile(e.target.files[0])}
                      className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {selectedTaskForStatus?.workSampleUrl && (
                      <p className="text-[9px] text-emerald-600 font-bold mt-1">✓ Work sample already uploaded.</p>
                    )}
                  </div>
                )}

              </div>
              <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center justify-center min-w-[120px] transition disabled:opacity-70"
                >
                  {formLoading ? 'Saving...' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- LEAVE REQUEST MODAL --- */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900">
              <h3 className="font-extrabold text-sm text-slate-950 dark:text-white">Submit Leave Request</h3>
              <button onClick={() => setShowRequestModal(false)} className="text-slate-400 hover:text-slate-600 transition text-sm">✕</button>
            </div>
            
            <form onSubmit={handleRequestLeave}>
              <div className="p-6 space-y-4 text-xs">
                {formError && (
                  <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-700 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Start Date</label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">End Date</label>
                    <input
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Reason / Details</label>
                  <textarea
                    value={reason}
                    required
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Medical appointment, family event..."
                    rows="3"
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

              </div>

              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="py-2 px-4 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="py-2 px-4 bg-blue-800 hover:bg-blue-900 text-white rounded-lg transition disabled:opacity-50"
                >
                  {formLoading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
