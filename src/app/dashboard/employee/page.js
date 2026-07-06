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
  Download
} from 'lucide-react';

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
  
  // Timer States
  const [timeStr, setTimeStr] = useState('');
  const [workDuration, setWorkDuration] = useState('00:00:00');

  // Modal State
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Form Fields
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });

  // Dark Mode State
  const [darkMode, setDarkMode] = useState(false);

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
      const res = await fetch('/api/attendance', { method: 'POST' });
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

  // Task operation
  const handleToggleTaskStatus = async (taskId, currentStatus) => {
    let nextStatus = 'TODO';
    if (currentStatus === 'TODO') nextStatus = 'IN_PROGRESS';
    else if (currentStatus === 'IN_PROGRESS') nextStatus = 'DONE';
    else return;

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });

      if (res.ok) {
        showToast('Task updated successfully.');
        await refreshData();
      }
    } catch (err) {
      showToast('Failed to update task.', 'error');
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

  const completedTasks = tasksList.filter(t => t.status === 'DONE').length;
  const pendingTasks = tasksList.filter(t => t.status !== 'DONE').length;

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
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm flex flex-col items-center justify-center text-center gap-6">
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
                      className={`h-12 px-8 font-extrabold text-sm tracking-wider uppercase rounded-full shadow-lg transition flex items-center gap-2 text-white
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

              </div>

            </div>
          )}

          {/* TAB 2: MY TASKS */}
          {activeTab === 'tasks' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-fade-in">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Assigned Duties checklist</h4>
                <p className="text-xs text-slate-400 mt-1">Review task details and report updates by clicking status transitions.</p>
              </div>

              <div className="p-6 space-y-4">
                {tasksList.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No tasks assigned yet. Check in with your Admin!</p>
                ) : (
                  tasksList.map((task) => (
                    <div 
                      key={task.id} 
                      className={`p-4 border rounded-xl flex items-center justify-between transition
                        ${task.status === 'DONE' 
                          ? 'border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/40 opacity-75' 
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'}`}
                    >
                      <div className="space-y-1 pr-6 overflow-hidden">
                        <p className={`text-xs font-bold leading-tight ${task.status === 'DONE' ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                          {task.title}
                        </p>
                        <p className="text-[10px] text-slate-450 truncate">{task.description}</p>
                        <p className="text-[9px] text-slate-400 font-medium">Assigned by: {task.createdBy.name} | Due: {task.dueDate || 'No Limit'}</p>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {task.status === 'TODO' && (
                          <button 
                            onClick={() => handleToggleTaskStatus(task.id, 'TODO')}
                            className="py-1 px-3 border border-blue-200 text-blue-600 dark:border-blue-800 dark:text-blue-400 rounded-lg text-[9px] font-bold hover:bg-blue-50 dark:hover:bg-blue-950/20 transition flex items-center gap-1"
                          >
                            <Play className="w-2.5 h-2.5" /> Start Work
                          </button>
                        )}
                        {task.status === 'IN_PROGRESS' && (
                          <button 
                            onClick={() => handleToggleTaskStatus(task.id, 'IN_PROGRESS')}
                            className="py-1 px-3 border border-indigo-200 text-indigo-600 dark:border-indigo-800 dark:text-indigo-400 rounded-lg text-[9px] font-bold hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" /> Mark Completed
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

        </div>
      </main>

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
