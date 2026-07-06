'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  ShieldAlert,
  DollarSign,
  TrendingUp,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Building,
  UserCheck,
  Search,
  CheckCircle,
  FileText,
  AlertCircle,
  Activity,
  Layers,
  Moon,
  Sun
} from 'lucide-react';

export default function CeoDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, audits, payroll
  const [loading, setLoading] = useState(true);

  // Data states
  const [usersList, setUsersList] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [tasksList, setTasksList] = useState([]);
  const [metrics, setMetrics] = useState({
    totalEmployees: 0,
    activeAdmins: 0,
    totalPayroll: 0,
    taskCompletionRate: 0
  });

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState('EMPLOYEE');
  const [formDept, setFormDept] = useState('Engineering');
  const [formSalary, setFormSalary] = useState('');
  const [formAvatar, setFormAvatar] = useState('👤');

  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' }); // type: success, error

  // Dark Mode State
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check local storage for dark mode
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

  // Auth fetch
  useEffect(() => {
    async function initDashboard() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();

        if (!res.ok || !data.user || data.user.role !== 'CEO') {
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

      // Fetch audit logs
      const auditRes = await fetch('/api/audit-logs');
      const auditData = await auditRes.json();
      setAuditLogs(auditData.logs || []);

      // Fetch tasks to calculate performance metrics
      const tasksRes = await fetch('/api/tasks');
      const tasksData = await tasksRes.json();
      const fetchedTasks = tasksData.tasks || [];
      setTasksList(fetchedTasks);

      // Calculate Metrics
      const totalEmp = fetchedUsers.filter(u => u.role === 'EMPLOYEE').length;
      const activeAdm = fetchedUsers.filter(u => u.role === 'ADMIN').length;
      const payroll = fetchedUsers.reduce((sum, u) => sum + u.salary, 0);
      
      const doneTasks = fetchedTasks.filter(t => t.status === 'DONE').length;
      const rate = fetchedTasks.length > 0 ? Math.round((doneTasks / fetchedTasks.length) * 100) : 0;

      setMetrics({
        totalEmployees: totalEmp,
        activeAdmins: activeAdm,
        totalPayroll: payroll,
        taskCompletionRate: rate
      });
    } catch (err) {
      console.error('Error refreshing dashboard data:', err);
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

  const resetForm = () => {
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setFormRole('EMPLOYEE');
    setFormDept('Engineering');
    setFormSalary('');
    setFormAvatar('👤');
    setFormError('');
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPassword('');
    setFormRole(user.role);
    setFormDept(user.department);
    setFormSalary(user.salary.toString());
    setFormAvatar(user.avatar || '👤');
    setFormError('');
    setShowEditModal(true);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!formName || !formEmail || !formPassword || !formSalary) {
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
          role: formRole,
          department: formDept,
          salary: parseFloat(formSalary),
          avatar: formAvatar
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to create user.');
        setFormLoading(false);
        return;
      }

      showToast(`User ${formName} successfully created!`);
      setShowAddModal(false);
      resetForm();
      await refreshData();
    } catch (err) {
      setFormError('Internal server error.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    if (!formName || !formEmail || !formSalary) {
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
          role: formRole,
          department: formDept,
          salary: parseFloat(formSalary),
          avatar: formAvatar
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to update user.');
        setFormLoading(false);
        return;
      }

      showToast(`User ${formName} successfully updated!`);
      setShowEditModal(false);
      await refreshData();
    } catch (err) {
      setFormError('Internal server error.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!confirm(`Are you absolutely sure you want to delete ${name}? This action is irreversible.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'Failed to delete user.', 'error');
        return;
      }

      showToast(`User ${name} successfully deleted!`);
      await refreshData();
    } catch (err) {
      showToast('Connection error.', 'error');
    }
  };

  const handleApprovePayroll = async () => {
    try {
      // Simulate payroll batch processing
      showToast('Department payroll batch approved! All entries reconciled.');
      await refreshData();
    } catch (err) {
      showToast('Payroll approval failed.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm">Loading CEO Console...</p>
        </div>
      </div>
    );
  }

  // Filter users based on search
  const filteredUsers = usersList.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300`}>
      
      {/* Toast Alert */}
      {toast.message && (
        <div className={`fixed bottom-5 right-5 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-in border text-sm font-semibold
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
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-lg font-bold shadow-md">
              {currentUser.avatar || '👨‍💼'}
            </div>
            <div className="overflow-hidden">
              <div className="font-bold text-sm text-slate-900 dark:text-white truncate">{currentUser.name}</div>
              <div className="text-[10px] text-cyan-600 dark:text-cyan-400 font-extrabold tracking-widest uppercase">
                CEO / MAIN ADMIN
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
              <Activity className="w-4 h-4" />
              Overview
            </button>
            
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === 'users'
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              Manage Directory
            </button>

            <button
              onClick={() => setActiveTab('audits')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === 'audits'
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              System Audit Logs
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
              Financial Controls
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
        
        {/* Main Panel Header */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-8 shrink-0 transition-colors duration-300">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white capitalize">
            {activeTab === 'overview' ? 'Executive Dashboard' : activeTab.replace('-', ' ')}
          </h2>
          
          <div className="flex items-center gap-4">
            {/* Dark Mode toggle */}
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

        {/* Panel Main Content Container */}
        <div className="p-8 flex-grow">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in">
              {/* Metric grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between hover:translate-y-[-2px] transition duration-200">
                  <div className="space-y-2">
                    <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-extrabold">Active Employees</span>
                    <h3 className="text-3xl font-extrabold dark:text-white">{metrics.totalEmployees}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between hover:translate-y-[-2px] transition duration-200">
                  <div className="space-y-2">
                    <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-extrabold">Admins & Managers</span>
                    <h3 className="text-3xl font-extrabold dark:text-white">{metrics.activeAdmins}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                    <UserCheck className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between hover:translate-y-[-2px] transition duration-200">
                  <div className="space-y-2">
                    <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-extrabold">Monthly Payroll</span>
                    <h3 className="text-3xl font-extrabold dark:text-white">${metrics.totalPayroll.toLocaleString()}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between hover:translate-y-[-2px] transition duration-200">
                  <div className="space-y-2">
                    <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-extrabold">Tasks Completed</span>
                    <h3 className="text-3xl font-extrabold dark:text-white">{metrics.taskCompletionRate}%</h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>

              </div>

              {/* Graphics and lists panel */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Task and stats breakdown */}
                <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white mb-6">Staff Salary Breakdown</h4>
                  
                  <div className="space-y-5">
                    {usersList.length === 0 ? (
                      <p className="text-sm text-slate-400">No staff loaded.</p>
                    ) : (
                      usersList.slice(0, 5).map((user) => (
                        <div key={user.id} className="space-y-2">
                          <div className="flex justify-between items-center text-sm font-semibold">
                            <span className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs">{user.avatar || '👤'}</span>
                              <span>{user.name} ({user.role})</span>
                            </span>
                            <span className="text-slate-600 dark:text-slate-400">${user.salary.toLocaleString()}/mo</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-blue-600 h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.min((user.salary / 250000) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Quick Audits view */}
                <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white mb-6">Latest Security Audits</h4>
                    
                    <div className="space-y-4">
                      {auditLogs.slice(0, 4).map((log) => (
                        <div key={log.id} className="flex gap-3 text-xs">
                          <div className="w-2 h-2 mt-1 rounded-full bg-cyan-400 shrink-0"></div>
                          <div className="space-y-0.5 overflow-hidden">
                            <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{log.action}</p>
                            <p className="text-[10px] text-slate-400">{log.performedByName} ({log.performedByRole})</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={() => setActiveTab('audits')}
                    className="w-full mt-6 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition"
                  >
                    View All Logs
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: DIRECTORY */}
          {activeTab === 'users' && (
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
                  onClick={openAddModal}
                  className="bg-blue-800 hover:bg-blue-900 text-white py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10 shrink-0 transition"
                >
                  <Plus className="w-4 h-4" />
                  Add Staff Member
                </button>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                      <th className="p-4 uppercase tracking-wider">Staff</th>
                      <th className="p-4 uppercase tracking-wider">Email</th>
                      <th className="p-4 uppercase tracking-wider">Role</th>
                      <th className="p-4 uppercase tracking-wider">Department</th>
                      <th className="p-4 uppercase tracking-wider">Salary</th>
                      <th className="p-4 uppercase tracking-wider">Status</th>
                      <th className="p-4 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="p-8 text-center text-slate-400">No staff found.</td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user.id} className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-850/40 transition">
                          <td className="p-4 font-bold flex items-center gap-2">
                            <span className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-850 border border-slate-200/50 dark:border-slate-700 flex items-center justify-center text-sm">{user.avatar || '👤'}</span>
                            <span className="text-slate-900 dark:text-white">{user.name}</span>
                          </td>
                          <td className="p-4 text-slate-500">{user.email}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase
                              ${user.role === 'CEO' 
                                ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400' 
                                : user.role === 'ADMIN' 
                                ? 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400' 
                                : 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'}`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="p-4 text-slate-500 font-semibold">{user.department}</td>
                          <td className="p-4 font-bold text-slate-900 dark:text-white">${user.salary.toLocaleString()}/mo</td>
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
                                onClick={() => openEditModal(user)}
                                className="p-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition"
                                title="Edit user"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleDeleteUser(user.id, user.name)}
                                disabled={user.id === currentUser.id}
                                className="p-1.5 border border-slate-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition"
                                title="Delete user"
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

          {/* TAB 3: AUDITS */}
          {activeTab === 'audits' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-fade-in">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Security Trail & Database Mutations</h4>
                <p className="text-xs text-slate-400 mt-1">Live audit trail recording system mutations and administrative interventions.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                      <th className="p-4 uppercase tracking-wider">Timestamp</th>
                      <th className="p-4 uppercase tracking-wider">Action Event</th>
                      <th className="p-4 uppercase tracking-wider">Operator</th>
                      <th className="p-4 uppercase tracking-wider">Operator Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="p-8 text-center text-slate-400">No logs found.</td>
                      </tr>
                    ) : (
                      auditLogs.map((log) => (
                        <tr key={log.id} className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50/30 transition">
                          <td className="p-4 text-slate-500 font-medium">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="p-4 font-bold text-slate-900 dark:text-white">
                            {log.action}
                          </td>
                          <td className="p-4 text-slate-500 font-semibold">{log.performedByName}</td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-extrabold tracking-wide uppercase text-[9px]">
                              {log.performedByRole}
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

          {/* TAB 4: PAYROLL */}
          {activeTab === 'payroll' && (
            <div className="space-y-8 animate-fade-in">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white">Active Payroll Reconciliations</h4>
                    <p className="text-xs text-slate-400 mt-1">Review organizational salary budgets by department.</p>
                  </div>
                  <button 
                    onClick={handleApprovePayroll}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-md shadow-emerald-500/10 transition"
                  >
                    Batch Approve Monthly Salaries
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold">Executive Payroll</span>
                    <h3 className="text-xl font-bold dark:text-white">$250,000</h3>
                    <p className="text-[10px] text-emerald-500 font-semibold">Synced with Ledger</p>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold">Engineering Dept</span>
                    <h3 className="text-xl font-bold dark:text-white">
                      ${usersList.filter(u => u.department === 'Engineering').reduce((sum, u) => sum + u.salary, 0).toLocaleString()}
                    </h3>
                    <p className="text-[10px] text-emerald-500 font-semibold">Synced with Ledger</p>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold">Human Resources</span>
                    <h3 className="text-xl font-bold dark:text-white">
                      ${usersList.filter(u => u.department === 'HR').reduce((sum, u) => sum + u.salary, 0).toLocaleString()}
                    </h3>
                    <p className="text-[10px] text-emerald-500 font-semibold">Synced with Ledger</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* --- ADD USER MODAL --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900">
              <h3 className="font-extrabold text-sm text-slate-950 dark:text-white">Add New Staff Member</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 transition text-sm">✕</button>
            </div>
            
            <form onSubmit={handleAddUser}>
              <div className="p-6 space-y-4 text-xs">
                {formError && (
                  <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 rounded-xl flex items-center gap-2">
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
                      placeholder="e.g. Alice Cooper"
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="e.g. alice@company.com"
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
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
                      placeholder="e.g. SecurePass123"
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Monthly Salary ($)</label>
                    <input
                      type="number"
                      required
                      value={formSalary}
                      onChange={(e) => setFormSalary(e.target.value)}
                      placeholder="e.g. 6000"
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Role</label>
                    <select
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                    >
                      <option value="EMPLOYEE">Employee</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Department</label>
                    <select
                      value={formDept}
                      onChange={(e) => setFormDept(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="HR">HR</option>
                      <option value="Sales">Sales</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Design">Design</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Profile Emoji Avatar</label>
                    <input
                      type="text"
                      value={formAvatar}
                      onChange={(e) => setFormAvatar(e.target.value)}
                      placeholder="e.g. 👩‍💻"
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white text-center focus:outline-none"
                    />
                  </div>
                </div>

              </div>

              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-2 px-4 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="py-2 px-4 bg-blue-800 hover:bg-blue-900 text-white rounded-lg transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {formLoading ? 'Creating...' : 'Create Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT USER MODAL --- */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900">
              <h3 className="font-extrabold text-sm text-slate-950 dark:text-white">Modify Staff Profile</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 transition text-sm">✕</button>
            </div>
            
            <form onSubmit={handleEditUser}>
              <div className="p-6 space-y-4 text-xs">
                {formError && (
                  <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 rounded-xl flex items-center gap-2">
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
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Update Password (Leave blank to keep current)</label>
                    <input
                      type="password"
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder="New password (optional)"
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Monthly Salary ($)</label>
                    <input
                      type="number"
                      required
                      value={formSalary}
                      onChange={(e) => setFormSalary(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Role</label>
                    <select
                      value={formRole}
                      disabled={selectedUser && selectedUser.id === currentUser.id}
                      onChange={(e) => setFormRole(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 disabled:opacity-50"
                    >
                      <option value="EMPLOYEE">Employee</option>
                      <option value="ADMIN">Admin</option>
                      <option value="CEO">CEO</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Department</label>
                    <select
                      value={formDept}
                      onChange={(e) => setFormDept(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                    >
                      <option value="Executive">Executive</option>
                      <option value="Engineering">Engineering</option>
                      <option value="HR">HR</option>
                      <option value="Sales">Sales</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Design">Design</option>
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
                  onClick={() => setShowEditModal(false)}
                  className="py-2 px-4 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="py-2 px-4 bg-blue-800 hover:bg-blue-900 text-white rounded-lg transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {formLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
