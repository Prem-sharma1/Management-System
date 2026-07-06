'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  CheckSquare,
  Clock,
  Calendar,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  Building,
  UserCheck,
  Search,
  CheckCircle,
  FileText,
  AlertCircle,
  Briefcase,
  ThumbsUp,
  ThumbsDown,
  Moon,
  Sun
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, directory, tasks, leaves, attendance
  const [loading, setLoading] = useState(true);

  // Data states
  const [usersList, setUsersList] = useState([]);
  const [tasksList, setTasksList] = useState([]);
  const [leavesList, setLeavesList] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [metrics, setMetrics] = useState({
    totalStaff: 0,
    activeTasks: 0,
    pendingLeaves: 0,
    presentToday: 0
  });

  // Modal States
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form Fields - User
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formDept, setFormDept] = useState('Engineering');
  const [formAvatar, setFormAvatar] = useState('👤');
  const [formStatus, setFormStatus] = useState('ACTIVE');

  // Form Fields - Task
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');

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

  // Auth check
  useEffect(() => {
    async function initDashboard() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();

        if (!res.ok || !data.user || data.user.role !== 'ADMIN') {
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
      // Fetch users
      const usersRes = await fetch('/api/users');
      const usersData = await usersRes.json();
      const fetchedUsers = usersData.users || [];
      setUsersList(fetchedUsers);

      // Fetch tasks
      const tasksRes = await fetch('/api/tasks');
      const tasksData = await tasksRes.json();
      const fetchedTasks = tasksData.tasks || [];
      setTasksList(fetchedTasks);

      // Fetch leaves
      const leavesRes = await fetch('/api/leaves');
      const leavesData = await leavesRes.json();
      const fetchedLeaves = leavesData.leaves || [];
      setLeavesList(fetchedLeaves);

      // Fetch attendance
      const attRes = await fetch('/api/attendance');
      const attData = await attRes.json();
      const fetchedAttendance = attData.logs || [];
      setAttendanceLogs(fetchedAttendance);

      // Calculate Metrics
      const totalStaff = fetchedUsers.filter(u => u.role === 'EMPLOYEE').length;
      const activeTasks = fetchedTasks.filter(t => t.status !== 'DONE').length;
      const pendingLeaves = fetchedLeaves.filter(l => l.status === 'PENDING').length;
      
      const todayStr = new Date().toISOString().split('T')[0];
      const presentToday = fetchedAttendance.filter(a => a.date === todayStr).length;

      setMetrics({
        totalStaff,
        activeTasks,
        pendingLeaves,
        presentToday
      });

      // Default assignee to first employee
      const employees = fetchedUsers.filter(u => u.role === 'EMPLOYEE');
      if (employees.length > 0 && !taskAssignee) {
        setTaskAssignee(employees[0].id.toString());
      }
    } catch (err) {
      console.error('Error refreshing admin dashboard:', err);
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

  const resetUserForm = () => {
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setFormDept('Engineering');
    setFormAvatar('👤');
    setFormStatus('ACTIVE');
    setFormError('');
  };

  const openAddUserModal = () => {
    resetUserForm();
    setShowAddUserModal(true);
  };

  const openEditUserModal = (user) => {
    setSelectedUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPassword('');
    setFormDept(user.department);
    setFormAvatar(user.avatar || '👤');
    setFormStatus(user.status);
    setFormError('');
    setShowEditUserModal(true);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!formName || !formEmail || !formPassword) {
      setFormError('Please fill out all required fields.');
      return;
    }
    setFormError('');
    setFormLoading(true);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          password: formPassword,
          role: 'EMPLOYEE', // Admins can ONLY create employees
          department: formDept,
          salary: 0, // Admin cannot set salary
          avatar: formAvatar
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to create employee.');
        setFormLoading(false);
        return;
      }

      showToast(`Employee ${formName} successfully added!`);
      setShowAddUserModal(false);
      resetUserForm();
      await refreshData();
    } catch (err) {
      setFormError('Internal server error.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    if (!formName || !formEmail) {
      setFormError('Please fill out all required fields.');
      return;
    }
    setFormError('');
    setFormLoading(true);

    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          password: formPassword || undefined,
          department: formDept,
          avatar: formAvatar,
          status: formStatus
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to update user.');
        setFormLoading(false);
        return;
      }

      showToast(`Employee ${formName} profile updated!`);
      setShowEditUserModal(false);
      await refreshData();
    } catch (err) {
      setFormError('Internal server error.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!confirm(`Are you sure you want to delete the employee account for ${name}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'Failed to delete user.', 'error');
        return;
      }

      showToast(`Employee ${name} successfully deleted.`);
      await refreshData();
    } catch (err) {
      showToast('Connection error.', 'error');
    }
  };

  // Task Actions
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskTitle || !taskAssignee) {
      setFormError('Title and Assignee are required.');
      return;
    }
    setFormError('');
    setFormLoading(true);

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskTitle,
          description: taskDesc,
          assignedToId: parseInt(taskAssignee),
          dueDate: taskDueDate || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to create task.');
        setFormLoading(false);
        return;
      }

      showToast(`Task successfully assigned!`);
      setShowAddTaskModal(false);
      setTaskTitle('');
      setTaskDesc('');
      setTaskDueDate('');
      await refreshData();
    } catch (err) {
      setFormError('Internal server error.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId, currentStatus) => {
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

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Task deleted.');
        await refreshData();
      }
    } catch (err) {
      showToast('Failed to delete task.', 'error');
    }
  };

  // Leave approval actions
  const handleLeaveDecision = async (leaveId, decision) => {
    try {
      const res = await fetch(`/api/leaves/${leaveId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: decision }) // APPROVED or REJECTED
      });

      if (!res.ok) {
        const data = await res.json();
        showToast(data.error || 'Failed to process leave request.', 'error');
        return;
      }

      showToast(`Leave request marked as ${decision}!`);
      await refreshData();
    } catch (err) {
      showToast('Connection error.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm">Loading Manager Console...</p>
        </div>
      </div>
    );
  }

  // Filters for directories
  const employeesList = usersList.filter(u => u.role === 'EMPLOYEE');
  const filteredEmployees = employeesList.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      
      {/* Toast Alert */}
      {toast.message && (
        <div className={`fixed bottom-5 right-5 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 border text-sm font-semibold animate-slide-in
          ${toast.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300' 
            : 'bg-red-50 dark:bg-red-950/80 border-red-200 dark:border-red-900 text-red-800 dark:text-red-300'
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Sidebar Panel */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Header Brand */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <Building className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              WorkForce OS
            </span>
          </div>

          {/* User Sidebar Summary */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-800/20">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-lg font-bold shadow-md">
              {currentUser.avatar || '👩‍💼'}
            </div>
            <div className="overflow-hidden">
              <div className="font-bold text-sm text-slate-900 dark:text-white truncate">{currentUser.name}</div>
              <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-extrabold tracking-widest uppercase">
                ADMIN / MANAGER
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 flex flex-col gap-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === 'overview'
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Overview
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
              Employee Records
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
              Department Tasks
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
              Leave Requests
              {metrics.pendingLeaves > 0 && (
                <span className="ml-auto w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                  {metrics.pendingLeaves}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('attendance')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === 'attendance'
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              Sign-in Register
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

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col min-w-0 overflow-y-auto h-screen">
        
        {/* Header */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-8 shrink-0">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white capitalize">
            {activeTab === 'overview' ? 'Administration Console' : activeTab.replace('-', ' ')}
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
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                  <div className="space-y-2">
                    <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-extrabold font-sans">Active Employees</span>
                    <h3 className="text-3xl font-extrabold dark:text-white">{metrics.totalStaff}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                  <div className="space-y-2">
                    <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-extrabold font-sans">Assigned Tasks</span>
                    <h3 className="text-3xl font-extrabold dark:text-white">{metrics.activeTasks}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <CheckSquare className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                  <div className="space-y-2">
                    <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-extrabold font-sans">Pending Leaves</span>
                    <h3 className="text-3xl font-extrabold dark:text-white">{metrics.pendingLeaves}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                    <Calendar className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                  <div className="space-y-2">
                    <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-extrabold font-sans">Present Today</span>
                    <h3 className="text-3xl font-extrabold dark:text-white">{metrics.presentToday}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Clock className="w-6 h-6" />
                  </div>
                </div>

              </div>

              {/* Department Overview and tasks summary */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Department Tasks summary */}
                <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white">Active Duties</h4>
                    <button 
                      onClick={() => setActiveTab('tasks')}
                      className="text-xs font-bold text-blue-700 hover:underline"
                    >
                      Open Taskboard
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {tasksList.length === 0 ? (
                      <p className="text-sm text-slate-400">No active tasks found.</p>
                    ) : (
                      tasksList.slice(0, 4).map((task) => (
                        <div key={task.id} className="p-4 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-xl flex items-center justify-between transition">
                          <div className="space-y-1 overflow-hidden pr-4">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{task.title}</p>
                            <p className="text-[10px] text-slate-400">Assigned: {task.assignedTo.name}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase
                            ${task.status === 'DONE' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600' : task.status === 'IN_PROGRESS' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
                          >
                            {task.status.replace('_', ' ')}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Immediate Leave Requests quick response panel */}
                <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white mb-6">Leave Requests Queue</h4>
                    
                    <div className="space-y-4">
                      {leavesList.filter(l => l.status === 'PENDING').length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400">
                          <CheckCircle className="w-8 h-8 text-emerald-500 mb-2" />
                          <p className="text-xs font-bold">Queue cleared!</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">No pending leaves.</p>
                        </div>
                      ) : (
                        leavesList.filter(l => l.status === 'PENDING').slice(0, 2).map((leave) => (
                          <div key={leave.id} className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
                            <div>
                              <p className="text-xs font-bold text-slate-900 dark:text-white">{leave.user.name}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{leave.startDate} to {leave.endDate}</p>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleLeaveDecision(leave.id, 'APPROVED')}
                                className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1"
                              >
                                <ThumbsUp className="w-3 h-3" /> Approve
                              </button>
                              <button 
                                onClick={() => handleLeaveDecision(leave.id, 'REJECTED')}
                                className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1"
                              >
                                <ThumbsDown className="w-3 h-3" /> Reject
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <button 
                    onClick={() => setActiveTab('leaves')}
                    className="w-full mt-6 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition"
                  >
                    Manage Leave Requests
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: DIRECTORY */}
          {activeTab === 'directory' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-fade-in">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
                
                {/* Search Bar */}
                <div className="relative flex items-center w-full max-w-sm">
                  <Search className="absolute left-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name, email, department..."
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100 text-xs transition"
                  />
                </div>

                <button
                  onClick={openAddUserModal}
                  className="bg-blue-850 hover:bg-blue-900 text-white py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10 shrink-0 transition"
                >
                  <Plus className="w-4 h-4" />
                  Onboard Employee
                </button>
              </div>

              {/* Employees Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                      <th className="p-4 uppercase tracking-wider">Staff</th>
                      <th className="p-4 uppercase tracking-wider">Email</th>
                      <th className="p-4 uppercase tracking-wider">Department</th>
                      <th className="p-4 uppercase tracking-wider">Status</th>
                      <th className="p-4 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-slate-400">No employees registered.</td>
                      </tr>
                    ) : (
                      filteredEmployees.map((user) => (
                        <tr key={user.id} className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-850/40 transition">
                          <td className="p-4 font-bold flex items-center gap-2">
                            <span className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-850 border border-slate-200/50 dark:border-slate-700 flex items-center justify-center text-sm">{user.avatar || '👤'}</span>
                            <span className="text-slate-900 dark:text-white">{user.name}</span>
                          </td>
                          <td className="p-4 text-slate-500">{user.email}</td>
                          <td className="p-4 text-slate-500 font-semibold">{user.department}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase
                              ${user.status === 'ACTIVE' ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600' : 'bg-red-50 dark:bg-red-950/50 text-red-600'}`}
                            >
                              {user.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex gap-2 justify-end">
                              <button 
                                onClick={() => openEditUserModal(user)}
                                className="p-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleDeleteUser(user.id, user.name)}
                                className="p-1.5 border border-slate-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-red-600 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: TASKS BOARD */}
          {activeTab === 'tasks' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Department Duties Allocation</h4>
                  <p className="text-xs text-slate-400 mt-1">Assign deliverables and log progression checkpoints.</p>
                </div>
                <button
                  onClick={() => { setFormError(''); setShowAddTaskModal(true); }}
                  className="bg-blue-800 hover:bg-blue-900 text-white py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4" />
                  Assign New Task
                </button>
              </div>

              {/* Kanban columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Column 1: TODO */}
                <div className="bg-slate-100 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 min-h-[400px] flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-350">To Do</span>
                    <span className="w-5 h-5 bg-slate-200 dark:bg-slate-800 text-[10px] font-bold rounded-full flex items-center justify-center">
                      {tasksList.filter(t => t.status === 'TODO').length}
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    {tasksList.filter(t => t.status === 'TODO').map(task => (
                      <div key={task.id} className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">{task.title}</p>
                          <button onClick={() => handleDeleteTask(task.id)} className="text-slate-300 hover:text-red-600 transition">✕</button>
                        </div>
                        <p className="text-[10px] text-slate-500 line-clamp-2">{task.description}</p>
                        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2 mt-1">
                          <span className="text-[9px] font-bold text-slate-400">Due: {task.dueDate || 'No Limit'}</span>
                          <button 
                            onClick={() => handleUpdateTaskStatus(task.id, 'TODO')}
                            className="py-1 px-2.5 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 rounded-md text-[9px] font-bold hover:bg-blue-100 transition"
                          >
                            Start Work →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 2: IN PROGRESS */}
                <div className="bg-slate-100 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 min-h-[400px] flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-350">In Progress</span>
                    <span className="w-5 h-5 bg-slate-200 dark:bg-slate-800 text-[10px] font-bold rounded-full flex items-center justify-center">
                      {tasksList.filter(t => t.status === 'IN_PROGRESS').length}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    {tasksList.filter(t => t.status === 'IN_PROGRESS').map(task => (
                      <div key={task.id} className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">{task.title}</p>
                          <button onClick={() => handleDeleteTask(task.id)} className="text-slate-300 hover:text-red-600 transition">✕</button>
                        </div>
                        <p className="text-[10px] text-slate-500 line-clamp-2">{task.description}</p>
                        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2 mt-1">
                          <span className="text-[9px] font-bold text-slate-400">Due: {task.dueDate || 'No Limit'}</span>
                          <button 
                            onClick={() => handleUpdateTaskStatus(task.id, 'IN_PROGRESS')}
                            className="py-1 px-2.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 rounded-md text-[9px] font-bold hover:bg-indigo-100 transition"
                          >
                            Mark Completed →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 3: DONE */}
                <div className="bg-slate-100 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 min-h-[400px] flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-350">Completed</span>
                    <span className="w-5 h-5 bg-slate-200 dark:bg-slate-800 text-[10px] font-bold rounded-full flex items-center justify-center">
                      {tasksList.filter(t => t.status === 'DONE').length}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    {tasksList.filter(t => t.status === 'DONE').map(task => (
                      <div key={task.id} className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col gap-2 opacity-75">
                        <div className="flex justify-between items-start">
                          <p className="text-xs font-bold text-slate-950 dark:text-slate-200 line-through leading-snug">{task.title}</p>
                          <button onClick={() => handleDeleteTask(task.id)} className="text-slate-300 hover:text-red-600 transition">✕</button>
                        </div>
                        <p className="text-[10px] text-slate-500">{task.description}</p>
                        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2 mt-1">
                          <span className="text-[9px] font-bold text-slate-400">Completed Task</span>
                          <span className="w-4 h-4 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-full flex items-center justify-center font-bold text-[9px]">✓</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: LEAVE REQUESTS */}
          {activeTab === 'leaves' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-fade-in">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Leave Approvals & Absences</h4>
                <p className="text-xs text-slate-400 mt-1">Review and process staff time-off request forms.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                      <th className="p-4 uppercase tracking-wider">Employee</th>
                      <th className="p-4 uppercase tracking-wider">Reason / Description</th>
                      <th className="p-4 uppercase tracking-wider">Interval</th>
                      <th className="p-4 uppercase tracking-wider">Status</th>
                      <th className="p-4 uppercase tracking-wider text-right">Approvals</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leavesList.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-slate-400">No requests filed.</td>
                      </tr>
                    ) : (
                      leavesList.map((leave) => (
                        <tr key={leave.id} className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50/30 transition">
                          <td className="p-4 font-bold text-slate-900 dark:text-white">{leave.user.name}</td>
                          <td className="p-4 text-slate-500 font-medium italic">"{leave.reason}"</td>
                          <td className="p-4 text-slate-500 font-semibold">{leave.startDate} to {leave.endDate}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase
                              ${leave.status === 'APPROVED' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600' : leave.status === 'REJECTED' ? 'bg-red-50 dark:bg-red-950/40 text-red-600' : 'bg-orange-50 dark:bg-orange-950/40 text-orange-600'}`}
                            >
                              {leave.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            {leave.status === 'PENDING' ? (
                              <div className="flex gap-2 justify-end">
                                <button 
                                  onClick={() => handleLeaveDecision(leave.id, 'APPROVED')}
                                  className="py-1 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition"
                                >
                                  Approve
                                </button>
                                <button 
                                  onClick={() => handleLeaveDecision(leave.id, 'REJECTED')}
                                  className="py-1 px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold transition"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-bold uppercase">Processed</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: ATTENDANCE */}
          {activeTab === 'attendance' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-fade-in">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Daily Sign-in Register</h4>
                <p className="text-xs text-slate-400 mt-1">Review clock-in, clock-out timestamps, and punctuality flags.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                      <th className="p-4 uppercase tracking-wider">Date</th>
                      <th className="p-4 uppercase tracking-wider">Employee</th>
                      <th className="p-4 uppercase tracking-wider">Clock In</th>
                      <th className="p-4 uppercase tracking-wider">Clock Out</th>
                      <th className="p-4 uppercase tracking-wider">Punctuality</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceLogs.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-slate-400">No sign-ins recorded.</td>
                      </tr>
                    ) : (
                      attendanceLogs.map((log) => (
                        <tr key={log.id} className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50/30 transition">
                          <td className="p-4 text-slate-500 font-semibold">{log.date}</td>
                          <td className="p-4 font-bold text-slate-900 dark:text-white">{log.user.name}</td>
                          <td className="p-4 text-slate-500 font-semibold">{new Date(log.clockIn).toLocaleTimeString()}</td>
                          <td className="p-4 text-slate-500 font-semibold">
                            {log.clockOut ? new Date(log.clockOut).toLocaleTimeString() : <span className="text-orange-500 italic font-bold">On Duty</span>}
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase
                              ${log.status === 'PRESENT' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600' : 'bg-red-50 dark:bg-red-950/40 text-red-650'}`}
                            >
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* --- ADD USER MODAL --- */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900">
              <h3 className="font-extrabold text-sm text-slate-950 dark:text-white">Onboard Employee</h3>
              <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-slate-600 transition text-sm">✕</button>
            </div>
            
            <form onSubmit={handleAddUser}>
              <div className="p-6 space-y-4 text-xs">
                {formError && (
                  <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-705 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Name</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Charlie Brown"
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="e.g. charlie@company.com"
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Password</label>
                    <input
                      type="password"
                      required
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder="e.g. EmpPass123"
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Department</label>
                    <select
                      value={formDept}
                      onChange={(e) => setFormDept(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="HR">HR</option>
                      <option value="Sales">Sales</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Design">Design</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Profile Emoji Avatar</label>
                    <input
                      type="text"
                      value={formAvatar}
                      onChange={(e) => setFormAvatar(e.target.value)}
                      placeholder="e.g. 👨‍💻"
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white text-center focus:outline-none"
                    />
                  </div>
                </div>

              </div>

              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="py-2 px-4 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="py-2 px-4 bg-blue-800 hover:bg-blue-900 text-white rounded-lg transition disabled:opacity-50"
                >
                  {formLoading ? 'Creating...' : 'Onboard Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT USER MODAL --- */}
      {showEditUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900">
              <h3 className="font-extrabold text-sm text-slate-950 dark:text-white">Modify Employee Records</h3>
              <button onClick={() => setShowEditUserModal(false)} className="text-slate-400 hover:text-slate-600 transition text-sm">✕</button>
            </div>
            
            <form onSubmit={handleEditUser}>
              <div className="p-6 space-y-4 text-xs">
                {formError && (
                  <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-700 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Name</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Update Password (Leave blank to keep)</label>
                    <input
                      type="password"
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder="New password (optional)"
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Department</label>
                    <select
                      value={formDept}
                      onChange={(e) => setFormDept(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="HR">HR</option>
                      <option value="Sales">Sales</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Design">Design</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Account Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Profile Emoji Avatar</label>
                    <input
                      type="text"
                      value={formAvatar}
                      onChange={(e) => setFormAvatar(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white text-center focus:outline-none"
                    />
                  </div>
                </div>

              </div>

              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowEditUserModal(false)}
                  className="py-2 px-4 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="py-2 px-4 bg-blue-800 hover:bg-blue-900 text-white rounded-lg transition disabled:opacity-50"
                >
                  {formLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD TASK MODAL --- */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900">
              <h3 className="font-extrabold text-sm text-slate-950 dark:text-white">Assign Task</h3>
              <button onClick={() => setShowAddTaskModal(false)} className="text-slate-400 hover:text-slate-600 transition text-sm">✕</button>
            </div>
            
            <form onSubmit={handleAddTask}>
              <div className="p-6 space-y-4 text-xs">
                {formError && (
                  <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-700 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Task Title</label>
                  <input
                    type="text"
                    required
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="e.g. Compile code assets"
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Task Description</label>
                  <textarea
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                    placeholder="e.g. Ensure all dynamic bundle dependencies are imported correctly."
                    rows="3"
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Assign To</label>
                    <select
                      value={taskAssignee}
                      onChange={(e) => setTaskAssignee(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    >
                      {employeesList.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name} ({emp.department})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Due Date</label>
                    <input
                      type="date"
                      value={taskDueDate}
                      onChange={(e) => setTaskDueDate(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

              </div>

              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="py-2 px-4 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="py-2 px-4 bg-blue-800 hover:bg-blue-900 text-white rounded-lg transition disabled:opacity-50"
                >
                  {formLoading ? 'Assigning...' : 'Assign Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
