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
  Sun,
  Send,
  CheckSquare
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
  const [clientsList, setClientsList] = useState([]);
  const [allClientTasks, setAllClientTasks] = useState([]);
  const [allClientDeliveries, setAllClientDeliveries] = useState([]);
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

  // Form Fields - Client CRM
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showEditClientModal, setShowEditClientModal] = useState(false);
  const [showClientDetailModal, setShowClientDetailModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const [clientFormId, setClientFormId] = useState('');
  const [clientFormBiz, setClientFormBiz] = useState('');
  const [clientFormName, setClientFormName] = useState('');
  const [clientFormDate, setClientFormDate] = useState('');
  const [clientFormServices, setClientFormServices] = useState('Meta Ads');
  const [clientFormPkg, setClientFormPkg] = useState('');
  const [clientFormAmt, setClientFormAmt] = useState('');
  const [clientFormContact, setClientFormContact] = useState('');
  const [clientFormEmail, setClientFormEmail] = useState('');
  const [clientFormWebsite, setClientFormWebsite] = useState('');
  const [clientFormSector, setClientFormSector] = useState('');
  const [clientFormReq, setClientFormReq] = useState('');
  const [clientFormReady, setClientFormReady] = useState(true);
  const [clientFormActive, setClientFormActive] = useState(true);
  const [clientFormNotes, setClientFormNotes] = useState('');

  // Client Tasks states
  const [selectedClientTasks, setSelectedClientTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [clientTaskFormId, setClientTaskFormId] = useState('');
  const [clientTaskFormTitle, setClientTaskFormTitle] = useState('');
  const [clientTaskFormDate, setClientTaskFormDate] = useState('');
  const [clientTaskFormAssignTo, setClientTaskFormAssignTo] = useState('Graphic Designer');
  const [clientTaskFormWorkingOn, setClientTaskFormWorkingOn] = useState('');
  const [clientTaskFormStatus, setClientTaskFormStatus] = useState('Not Started');
  const [clientTaskFormPostType, setClientTaskFormPostType] = useState('Graphic');
  const [clientTaskFormNotes, setClientTaskFormNotes] = useState('');
  const [clientTaskEditMode, setClientTaskEditMode] = useState(false);
  const [selectedClientTask, setSelectedClientTask] = useState(null);

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

      // Fetch clients
      const clientsRes = await fetch('/api/clients');
      const clientsData = await clientsRes.json();
      setClientsList(clientsData.clients || []);

      // Fetch global client tasks
      const ctRes = await fetch('/api/client-tasks');
      const ctData = await ctRes.json();
      setAllClientTasks(ctData.tasks || []);

      // Fetch global client deliveries
      const cdRes = await fetch('/api/client-deliveries');
      const cdData = await cdRes.json();
      setAllClientDeliveries(cdData.deliveries || []);

      // Calculate Metrics
      const totalEmp = fetchedUsers.filter(u => u.role === 'EMPLOYEE').length;
      const activeAdm = fetchedUsers.filter(u => u.role === 'ADMIN').length;
      const payroll = fetchedUsers.reduce((sum, u) => sum + u.salary, 0);
      
      const doneTasks = fetchedTasks.filter(t => t.status === 'DONE').length;
      const rate = fetchedTasks.length > 0 ? Math.round((doneTasks / fetchedTasks.length) * 100) : 0;

      // Active Clients Calculation
      const activeClientsCount = (clientsData.clients || []).filter(c => c.active).length;
      const totalClientsCount = (clientsData.clients || []).length;
      
      // Revenue Calculation
      const totalRevenue = (clientsData.clients || []).filter(c => c.active).reduce((sum, c) => sum + (c.packageAmount || 0), 0);
      const estRevenue = (clientsData.clients || []).reduce((sum, c) => sum + (c.packageAmount || 0), 0);
      
      // Tasks Pipeline Calculation
      const ctArray = ctData.tasks || [];
      const completedTasksCount = ctArray.filter(t => t.status === 'Completed' || t.status === 'Done').length;
      const pendingTasksCount = ctArray.length - completedTasksCount;

      // Deliveries Calculation
      const cdArray = cdData.deliveries || [];
      const completedDeliveries = cdArray.filter(d => d.status === 'Completed' || d.status === 'Done' || d.status === 'Sent').length;
      const pendingDeliveries = cdArray.length - completedDeliveries;

      setMetrics({
        totalEmployees: totalEmp,
        activeAdmins: activeAdm,
        totalPayroll: payroll,
        taskCompletionRate: rate,
        activeClients: activeClientsCount,
        totalClients: totalClientsCount,
        totalRevenue: totalRevenue,
        estRevenue: estRevenue,
        pendingTasks: pendingTasksCount,
        completedTasks: completedTasksCount,
        pendingDeliveries: pendingDeliveries,
        completedDeliveries: completedDeliveries
      });
    } catch (err) {
      console.error('Error refreshing dashboard data:', err);
    }
  };

  const resetClientForm = (client = null) => {
    setFormError('');
    if (client) {
      setSelectedClient(client);
      setClientFormId(client.clientId);
      setClientFormBiz(client.businessName);
      setClientFormName(client.clientName || '');
      setClientFormDate(client.joiningDate);
      setClientFormServices(client.services);
      setClientFormPkg(client.packageName);
      setClientFormAmt(client.packageAmount.toString());
      setClientFormContact(client.contact || '');
      setClientFormEmail(client.email || '');
      setClientFormWebsite(client.website || '');
      setClientFormSector(client.sector || '');
      setClientFormReq(client.requirement || '');
      setClientFormReady(client.accountReady);
      setClientFormActive(client.active);
      setClientFormNotes(client.notes || '');
    } else {
      setSelectedClient(null);
      let nextId = 'AID-0001';
      if (clientsList.length > 0) {
        const ids = clientsList.map(c => {
          const num = parseInt(c.clientId.replace('AID-', ''));
          return isNaN(num) ? 0 : num;
        });
        const maxId = Math.max(...ids);
        nextId = `AID-${String(maxId + 1).padStart(4, '0')}`;
      }
      setClientFormId(nextId);
      setClientFormBiz('');
      setClientFormName('');
      setClientFormDate(new Date().toISOString().split('T')[0]);
      setClientFormServices('Meta Ads');
      setClientFormPkg('Standard(Meta Ads)');
      setClientFormAmt('2000');
      setClientFormContact('');
      setClientFormEmail('');
      setClientFormWebsite('');
      setClientFormSector('');
      setClientFormReq('');
      setClientFormReady(true);
      setClientFormActive(true);
      setClientFormNotes('');
    }
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: clientFormId,
          businessName: clientFormBiz,
          clientName: clientFormName,
          joiningDate: clientFormDate,
          services: clientFormServices,
          packageName: clientFormPkg,
          packageAmount: parseFloat(clientFormAmt) || 0,
          contact: clientFormContact,
          email: clientFormEmail,
          website: clientFormWebsite,
          sector: clientFormSector,
          requirement: clientFormReq,
          accountReady: clientFormReady,
          active: clientFormActive,
          notes: clientFormNotes
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add client');
      showToast(`Client ${clientFormBiz} onboarded successfully!`);
      setShowAddClientModal(false);
      await refreshData();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditClient = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    try {
      const res = await fetch(`/api/clients/${selectedClient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: clientFormId,
          businessName: clientFormBiz,
          clientName: clientFormName,
          joiningDate: clientFormDate,
          services: clientFormServices,
          packageName: clientFormPkg,
          packageAmount: parseFloat(clientFormAmt) || 0,
          contact: clientFormContact,
          email: clientFormEmail,
          website: clientFormWebsite,
          sector: clientFormSector,
          requirement: clientFormReq,
          accountReady: clientFormReady,
          active: clientFormActive,
          notes: clientFormNotes
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update client');
      showToast(`Client profile updated successfully!`);
      setShowEditClientModal(false);
      await refreshData();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteClient = async (id, name) => {
    if (!confirm(`Are you sure you want to delete client account "${name}"?`)) return;
    try {
      const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete client');
      showToast(`Deleted client: ${name}`);
      await refreshData();
    } catch (err) {
      alert(err.message);
    }
  };

  const refreshClientTasks = async (clientIdVal) => {
    setLoadingTasks(true);
    try {
      const res = await fetch(`/api/clients/${clientIdVal}/tasks`);
      const data = await res.json();
      setSelectedClientTasks(data.tasks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTasks(false);
    }
  };

  const resetClientTaskForm = (task = null) => {
    setFormError('');
    if (task) {
      setSelectedClientTask(task);
      setClientTaskFormId(task.taskId);
      setClientTaskFormTitle(task.taskTitle);
      setClientTaskFormDate(task.date);
      setClientTaskFormAssignTo(task.assignTo || 'Graphic Designer');
      setClientTaskFormWorkingOn(task.workingOn || '');
      setClientTaskFormStatus(task.status || 'Not Started');
      setClientTaskFormPostType(task.postType || 'Graphic');
      setClientTaskFormNotes(task.notes || '');
      setClientTaskEditMode(true);
    } else {
      setSelectedClientTask(null);
      let nextId = '';
      if (selectedClient) {
        nextId = `${selectedClient.clientId}-TASK-01`;
        if (selectedClientTasks.length > 0) {
          const nums = selectedClientTasks.map(t => {
            const parts = t.taskId.split('-TASK-');
            const num = parts.length > 1 ? parseInt(parts[1]) : 0;
            return isNaN(num) ? 0 : num;
          });
          const maxNum = Math.max(...nums, 0);
          nextId = `${selectedClient.clientId}-TASK-${String(maxNum + 1).padStart(2, '0')}`;
        }
      }
      setClientTaskFormId(nextId);
      setClientTaskFormTitle('');
      setClientTaskFormDate(new Date().toISOString().split('T')[0]);
      setClientTaskFormAssignTo('Graphic Designer');
      setClientTaskFormWorkingOn('');
      setClientTaskFormStatus('Not Started');
      setClientTaskFormPostType('Graphic');
      setClientTaskFormNotes('');
      setClientTaskEditMode(false);
    }
  };

  const handleAddOrEditClientTask = async (e) => {
    e.preventDefault();
    if (!clientTaskFormId || !clientTaskFormTitle || !clientTaskFormDate) {
      setFormError('Please fill out all required task fields.');
      return;
    }
    setFormLoading(true);
    setFormError('');
    try {
      const url = clientTaskEditMode 
        ? `/api/client-tasks/${selectedClientTask.id}` 
        : `/api/clients/${selectedClient.id}/tasks`;
      const method = clientTaskEditMode ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: clientTaskFormId,
          taskTitle: clientTaskFormTitle,
          date: clientTaskFormDate,
          assignTo: clientTaskFormAssignTo,
          workingOn: clientTaskFormWorkingOn,
          status: clientTaskFormStatus,
          postType: clientTaskFormPostType,
          notes: clientTaskFormNotes
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save client task');
      showToast(clientTaskEditMode ? 'Task deliverables updated!' : 'New task deliverable created!');
      resetClientTaskForm();
      await refreshClientTasks(selectedClient.id);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteClientTask = async (taskDbId, title) => {
    if (!confirm(`Are you sure you want to delete task deliverable "${title}"?`)) return;
    try {
      const res = await fetch(`/api/client-tasks/${taskDbId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete task');
      showToast(`Deleted task: ${title}`);
      await refreshClientTasks(selectedClient.id);
    } catch (err) {
      alert(err.message);
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
              onClick={() => setActiveTab('clients')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === 'clients'
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Building className="w-4 h-4" />
              Client CRM
            </button>

            <button
              onClick={() => setActiveTab('deliverables')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === 'deliverables'
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              CRM Deliverables
            </button>

            <button
              onClick={() => setActiveTab('campaign-deliveries')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === 'campaign-deliveries'
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Send className="w-4 h-4" />
              Campaign Deliveries
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
                
                {/* Active Clients Card */}
                <div className="relative bg-white dark:bg-slate-900 p-5 xl:p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden flex items-center justify-between hover:translate-y-[-2px] transition duration-200 animate-slide-up group" style={{ animationDelay: '100ms' }}>
                  <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-50 dark:bg-blue-900/20 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-24 h-24 bg-blue-50/80 dark:bg-blue-900/40 rounded-full pointer-events-none group-hover:scale-150 transition-transform duration-500"></div>
                  
                  <div className="space-y-1 relative z-10 min-w-0 pr-2">
                    <div className="text-[10px] xl:text-xs text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider truncate">Active Clients</div>
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <h3 className="text-2xl xl:text-3xl font-black text-slate-900 dark:text-white truncate">{metrics.activeClients}</h3>
                      <span className="text-xs font-bold text-slate-500 whitespace-nowrap">/ {metrics.totalClients} Total</span>
                    </div>
                  </div>
                  <div className="shrink-0 relative z-10 w-10 h-10 xl:w-12 xl:h-12 rounded-xl bg-white/90 dark:bg-slate-800 backdrop-blur-sm shadow-md border border-white dark:border-slate-700 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Users className="w-5 h-5 xl:w-6 xl:h-6" />
                  </div>
                </div>

                {/* Total Revenue Card */}
                <div className="relative bg-white dark:bg-slate-900 p-5 xl:p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden flex items-center justify-between hover:translate-y-[-2px] transition duration-200 animate-slide-up group" style={{ animationDelay: '200ms' }}>
                  <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-50 dark:bg-emerald-900/20 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-24 h-24 bg-emerald-50/80 dark:bg-emerald-900/40 rounded-full pointer-events-none group-hover:scale-150 transition-transform duration-500"></div>
                  
                  <div className="space-y-2 relative z-10 min-w-0 pr-2 flex-grow">
                    <div className="text-[10px] xl:text-xs text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider truncate">Total Revenue</div>
                    <div>
                      <h3 className="text-2xl xl:text-3xl font-black text-slate-900 dark:text-white truncate">₹{metrics.totalRevenue.toLocaleString()}</h3>
                    </div>
                    <div className="inline-block mt-1">
                      <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[9px] xl:text-[10px] font-bold rounded-full whitespace-nowrap">
                        Est: ₹{metrics.estRevenue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 relative z-10 w-10 h-10 xl:w-12 xl:h-12 rounded-xl bg-white/90 dark:bg-slate-800 backdrop-blur-sm shadow-md border border-white dark:border-slate-700 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <DollarSign className="w-5 h-5 xl:w-6 xl:h-6" />
                  </div>
                </div>

                {/* Tasks Pipeline Card */}
                <div className="relative bg-white dark:bg-slate-900 p-5 xl:p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden flex items-center justify-between hover:translate-y-[-2px] transition duration-200 animate-slide-up group" style={{ animationDelay: '300ms' }}>
                  <div className="absolute -right-6 -top-6 w-32 h-32 bg-purple-50 dark:bg-purple-900/20 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-24 h-24 bg-purple-50/80 dark:bg-purple-900/40 rounded-full pointer-events-none group-hover:scale-150 transition-transform duration-500"></div>
                  
                  <div className="space-y-2 relative z-10 min-w-0 pr-2 flex-grow">
                    <div className="text-[10px] xl:text-xs text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider truncate">Tasks Pipeline</div>
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <h3 className="text-2xl xl:text-3xl font-black text-slate-900 dark:text-white truncate">{metrics.pendingTasks}</h3>
                      <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Pending</span>
                    </div>
                    <div className="inline-block mt-1">
                      <span className="px-2 py-0.5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-[9px] xl:text-[10px] font-bold rounded-full whitespace-nowrap">
                        Completed: {metrics.completedTasks}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 relative z-10 w-10 h-10 xl:w-12 xl:h-12 rounded-xl bg-white/90 dark:bg-slate-800 backdrop-blur-sm shadow-md border border-white dark:border-slate-700 flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <Activity className="w-5 h-5 xl:w-6 xl:h-6" />
                  </div>
                </div>

                {/* Deliveries Card */}
                <div className="relative bg-white dark:bg-slate-900 p-5 xl:p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden flex items-center justify-between hover:translate-y-[-2px] transition duration-200 animate-slide-up group" style={{ animationDelay: '400ms' }}>
                  <div className="absolute -right-6 -top-6 w-32 h-32 bg-orange-50 dark:bg-orange-900/20 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-24 h-24 bg-orange-50/80 dark:bg-orange-900/40 rounded-full pointer-events-none group-hover:scale-150 transition-transform duration-500"></div>
                  
                  <div className="space-y-2 relative z-10 min-w-0 pr-2 flex-grow">
                    <div className="text-[10px] xl:text-xs text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider truncate">Deliveries</div>
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <h3 className="text-2xl xl:text-3xl font-black text-slate-900 dark:text-white truncate">{metrics.pendingDeliveries}</h3>
                      <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Pending</span>
                    </div>
                    <div className="inline-block mt-1">
                      <span className="px-2 py-0.5 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-[9px] xl:text-[10px] font-bold rounded-full whitespace-nowrap">
                        Completed: {metrics.completedDeliveries}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 relative z-10 w-10 h-10 xl:w-12 xl:h-12 rounded-xl bg-white/90 dark:bg-slate-800 backdrop-blur-sm shadow-md border border-white dark:border-slate-700 flex items-center justify-center text-orange-600 dark:text-orange-400">
                    <CheckCircle className="w-5 h-5 xl:w-6 xl:h-6" />
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

          {/* TAB 7: GLOBAL DELIVERABLES BOARD */}
          {activeTab === 'deliverables' && (
            <div className="space-y-6 animate-fade-in text-xs">
              
              {/* Deliverables Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Total Deliverables</span>
                  <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">{allClientTasks.length}</div>
                  <span className="text-[9px] text-slate-400 font-medium">All campaigns deliverables</span>
                </div>
                
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Completed Tasks</span>
                  <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    {allClientTasks.filter(t => t.status === 'Complete Task').length}
                  </div>
                  <span className="text-[9px] text-slate-400 font-medium">Successfully completed</span>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">In Progress</span>
                  <div className="text-xl font-bold text-orange-500 mt-1">
                    {allClientTasks.filter(t => t.status === 'Working On It').length}
                  </div>
                  <span className="text-[9px] text-slate-400 font-medium">Under active production</span>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Pending Release</span>
                  <div className="text-xl font-bold text-slate-500 mt-1">
                    {allClientTasks.filter(t => t.status === 'Not Started').length}
                  </div>
                  <span className="text-[9px] text-slate-400 font-medium">Queued or not started</span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
                <div className="relative flex items-center w-full max-w-md">
                  <Search className="absolute left-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search client, business name, task, ID..."
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl focus:outline-none focus:border-blue-600 text-xs transition"
                  />
                </div>
              </div>

              {/* Global Deliverables Table */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase tracking-wider">
                        <th className="p-4">Date & ID</th>
                        <th className="p-4">Business / Client Name</th>
                        <th className="p-4">Deliverable Task</th>
                        <th className="p-4">Assigned Department</th>
                        <th className="p-4">Staff Assigned</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {allClientTasks
                        .filter(t => {
                          const query = searchQuery.toLowerCase();
                          return (
                            t.businessName.toLowerCase().includes(query) ||
                            t.taskId.toLowerCase().includes(query) ||
                            t.taskTitle.toLowerCase().includes(query) ||
                            (t.workingOn && t.workingOn.toLowerCase().includes(query)) ||
                            (t.assignTo && t.assignTo.toLowerCase().includes(query))
                          );
                        })
                        .map((task) => (
                          <tr key={task.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40 transition">
                            <td className="p-4 font-bold text-slate-450">
                              <div>{task.date}</div>
                              <div className="text-[8px] text-slate-400 mt-0.5 font-bold uppercase">{task.taskId}</div>
                            </td>
                            <td className="p-4">
                              <div className="font-bold text-slate-900 dark:text-white">{task.businessName}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">ID: {task.clientId}</div>
                            </td>
                            <td className="p-4">
                              <div className="font-semibold text-slate-800 dark:text-slate-250">{task.taskTitle}</div>
                              {task.notes && <div className="text-[9px] text-slate-400 mt-0.5 italic">"{task.notes}"</div>}
                            </td>
                            <td className="p-4 font-medium text-slate-600 dark:text-slate-400">{task.assignTo}</td>
                            <td className="p-4 font-semibold text-slate-900 dark:text-white">{task.workingOn || 'Unassigned'}</td>
                            <td className="p-4">
                              <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase
                                ${task.status === 'Complete Task' 
                                  ? 'bg-emerald-500 text-white' 
                                  : task.status === 'Working On It' 
                                  ? 'bg-orange-500 text-white' 
                                  : 'bg-slate-200 dark:bg-slate-800 text-slate-650 dark:text-slate-400'}`}
                              >
                                {task.status}
                              </span>
                              {task.postType && task.postType !== 'None' && (
                                <div className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">Type: {task.postType}</div>
                              )}
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => {
                                  const client = clientsList.find(c => c.clientId === task.clientId);
                                  if (client) {
                                    setSelectedClient(client);
                                    setShowClientDetailModal(true);
                                    refreshClientTasks(client.id);
                                    resetClientTaskForm(task);
                                  } else {
                                    alert('Client details not found.');
                                  }
                                }}
                                className="py-1 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-855 dark:hover:bg-slate-800 border border-slate-205 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-lg transition"
                              >
                                Manage
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: GLOBAL CAMPAIGN DELIVERIES */}
          {activeTab === 'campaign-deliveries' && (
            <div className="space-y-6 animate-fade-in text-xs">
              
              {/* Campaign Deliveries Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Scheduled Deliveries</span>
                  <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">{allClientDeliveries.length}</div>
                  <span className="text-[9px] text-slate-400 font-medium">All campaigns scheduled posts</span>
                </div>
                
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Pending Release</span>
                  <div className="text-xl font-bold text-orange-500 mt-1">
                    {allClientDeliveries.filter(d => d.status === 'Pending').length}
                  </div>
                  <span className="text-[9px] text-slate-400 font-medium">Awaiting publication</span>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Posted / Completed</span>
                  <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    {allClientDeliveries.filter(d => d.status === 'Posted' || d.status === 'Completed').length}
                  </div>
                  <span className="text-[9px] text-slate-400 font-medium">Successfully published online</span>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Under Review</span>
                  <div className="text-xl font-bold text-slate-500 mt-1">
                    {allClientDeliveries.filter(d => d.status !== 'Pending' && d.status !== 'Posted' && d.status !== 'Completed').length}
                  </div>
                  <span className="text-[9px] text-slate-400 font-medium">Drafts and approvals</span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
                <div className="relative flex items-center w-full max-w-md">
                  <Search className="absolute left-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search client name, delivery ID, post type, assignee..."
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl focus:outline-none focus:border-blue-600 text-xs transition"
                  />
                </div>
              </div>

              {/* Global Deliveries Table */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase tracking-wider">
                        <th className="p-4">Date & ID</th>
                        <th className="p-4">Client Name</th>
                        <th className="p-4">Post Type</th>
                        <th className="p-4">Staff Member</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Linked Task</th>
                        <th className="p-4">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {allClientDeliveries
                        .filter(d => {
                          const query = searchQuery.toLowerCase();
                          return (
                            d.clientName.toLowerCase().includes(query) ||
                            d.deliveryId.toLowerCase().includes(query) ||
                            d.postType.toLowerCase().includes(query) ||
                            (d.workingOn && d.workingOn.toLowerCase().includes(query)) ||
                            (d.notes && d.notes.toLowerCase().includes(query))
                          );
                        })
                        .map((delivery) => (
                          <tr key={delivery.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40 transition">
                            <td className="p-4 font-bold text-slate-455">
                              <div>{delivery.postDate}</div>
                              <div className="text-[8px] text-slate-400 mt-0.5 font-bold uppercase">{delivery.deliveryId}</div>
                            </td>
                            <td className="p-4">
                              <button
                                onClick={() => {
                                  const client = clientsList.find(c => c.clientId === delivery.clientId);
                                  if (client) {
                                    setSelectedClient(client);
                                    setShowClientDetailModal(true);
                                    refreshClientTasks(client.id);
                                  } else {
                                    alert('Client CRM details not found.');
                                  }
                                }}
                                className="font-bold text-slate-900 dark:text-white hover:underline text-left"
                              >
                                {delivery.clientName}
                              </button>
                              <div className="text-[9px] text-slate-400 mt-0.5 font-semibold">ID: {delivery.clientId}</div>
                            </td>
                            <td className="p-4">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{delivery.postType}</span>
                            </td>
                            <td className="p-4 font-semibold text-slate-900 dark:text-white">{delivery.workingOn || 'Unassigned'}</td>
                            <td className="p-4">
                              <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase
                                ${delivery.status === 'Posted' || delivery.status === 'Completed'
                                  ? 'bg-emerald-500 text-white' 
                                  : delivery.status === 'Pending' 
                                  ? 'bg-orange-500 text-white' 
                                  : 'bg-slate-200 dark:bg-slate-800 text-slate-655 dark:text-slate-400'}`}
                              >
                                {delivery.status}
                              </span>
                            </td>
                            <td className="p-4">
                              {delivery.linkedTaskId ? (
                                <button
                                  onClick={() => {
                                    const client = clientsList.find(c => c.clientId === delivery.clientId);
                                    if (client) {
                                      setSelectedClient(client);
                                      setShowClientDetailModal(true);
                                      refreshClientTasks(client.id);
                                    }
                                  }}
                                  className="text-[9px] text-blue-600 dark:text-blue-400 font-bold hover:underline"
                                >
                                  {delivery.linkedTaskId}
                                </button>
                              ) : (
                                <span className="text-slate-400 italic">None</span>
                              )}
                            </td>
                            <td className="p-4 text-slate-500 font-medium max-w-xs truncate" title={delivery.notes}>
                              {delivery.notes || '-'}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CLIENT CRM */}
          {activeTab === 'clients' && (
            <div className="space-y-6 animate-fade-in text-xs">
              
              {/* Client Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Total Clients</span>
                  <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">{clientsList.length}</div>
                  <span className="text-[9px] text-slate-400 font-medium">Onboarded CRM accounts</span>
                </div>
                
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Active Services</span>
                  <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    {clientsList.filter(c => c.active).length}
                  </div>
                  <span className="text-[9px] text-slate-400 font-medium">Currently in contract</span>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Monthly Revenue (MRR)</span>
                  <div className="text-xl font-bold text-blue-700 dark:text-blue-400 mt-1">
                    ₹{clientsList.filter(c => c.active).reduce((sum, c) => sum + c.packageAmount, 0).toLocaleString()}
                  </div>
                  <span className="text-[9px] text-slate-400 font-medium">Active packages volume</span>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Average Ticket</span>
                  <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                    ₹{Math.round(
                      clientsList.filter(c => c.active).reduce((sum, c) => sum + c.packageAmount, 0) / 
                      (clientsList.filter(c => c.active).length || 1)
                    ).toLocaleString()}
                  </div>
                  <span className="text-[9px] text-slate-400 font-medium">Per active account</span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
                <div className="relative flex items-center w-full max-w-md">
                  <Search className="absolute left-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search business, name, ID, sector, services..."
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl focus:outline-none focus:border-blue-600 text-xs transition"
                  />
                </div>
                
                <button
                  onClick={() => { resetClientForm(); setShowAddClientModal(true); }}
                  className="bg-blue-800 hover:bg-blue-900 text-white py-2.5 px-4 rounded-xl font-bold flex items-center justify-center gap-1.5 transition text-xs shadow-md shadow-blue-500/10 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Onboard New Client
                </button>
              </div>

              {/* Table List */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase tracking-wider">
                        <th className="p-4">ID</th>
                        <th className="p-4">Business / Client Name</th>
                        <th className="p-4">Service Details</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Joined Date</th>
                        <th className="p-4 text-center">Page Ready?</th>
                        <th className="p-4 text-center">Active?</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {clientsList
                        .filter(c => {
                          const query = searchQuery.toLowerCase();
                          return (
                            c.businessName.toLowerCase().includes(query) ||
                            c.clientId.toLowerCase().includes(query) ||
                            (c.clientName && c.clientName.toLowerCase().includes(query)) ||
                            c.services.toLowerCase().includes(query) ||
                            (c.sector && c.sector.toLowerCase().includes(query)) ||
                            (c.email && c.email.toLowerCase().includes(query))
                          );
                        })
                        .map((client) => (
                          <tr key={client.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40 transition">
                            <td className="p-4 font-bold text-slate-450">{client.clientId}</td>
                            <td className="p-4">
                              <div className="font-bold text-slate-900 dark:text-white">{client.businessName}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">{client.clientName || 'No Contact Person'}</div>
                            </td>
                            <td className="p-4">
                              <span className="font-semibold text-slate-800 dark:text-slate-250">{client.services}</span>
                              <div className="text-[9px] text-slate-400 mt-0.5">{client.packageName}</div>
                            </td>
                            <td className="p-4 font-extrabold text-slate-900 dark:text-white">
                              ₹{client.packageAmount.toLocaleString()}
                            </td>
                            <td className="p-4 text-slate-500 font-medium">{client.joiningDate}</td>
                            <td className="p-4 text-center">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${client.accountReady ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600' : 'bg-red-50 dark:bg-red-950/40 text-red-600'}`}>
                                {client.accountReady ? 'Yes' : 'No'}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${client.active ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                                {client.active ? 'ACTIVE' : 'INACTIVE'}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => {
                                    setSelectedClient(client);
                                    setShowClientDetailModal(true);
                                    refreshClientTasks(client.id);
                                    setClientTaskFormId(`${client.clientId}-TASK-01`);
                                    setClientTaskFormTitle('');
                                    setClientTaskFormDate(new Date().toISOString().split('T')[0]);
                                    setClientTaskFormAssignTo('Graphic Designer');
                                    setClientTaskFormWorkingOn('');
                                    setClientTaskFormStatus('Not Started');
                                    setClientTaskFormPostType('Graphic');
                                    setClientTaskFormNotes('');
                                    setClientTaskEditMode(false);
                                  }}
                                  className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-lg transition"
                                >
                                  Details
                                </button>
                                <button
                                  onClick={() => { resetClientForm(client); setShowEditClientModal(true); }}
                                  className="p-1.5 border border-slate-200 dark:border-slate-855 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition"
                                  title="Edit"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteClient(client.id, client.businessName)}
                                  className="p-1.5 border border-slate-200 dark:border-slate-855 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-red-650 transition"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
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
            
            <form onSubmit={handleAddUser} autoComplete="off">
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
                      autoComplete="off"
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
                      autoComplete="new-password"
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
            
            <form onSubmit={handleEditUser} autoComplete="off">
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
                      autoComplete="off"
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
                      autoComplete="new-password"
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

      {/* --- ADD CLIENT MODAL --- */}
      {showAddClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-fade-in text-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-855 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900">
              <h3 className="font-extrabold text-sm text-slate-950 dark:text-white">Onboard New Client Account</h3>
              <button onClick={() => setShowAddClientModal(false)} className="text-slate-400 hover:text-slate-650 transition text-sm">✕</button>
            </div>
            
            <form onSubmit={handleAddClient}>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {formError && (
                  <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-700 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-350">Client ID (Auto Generated)</label>
                    <input
                      type="text"
                      required
                      value={clientFormId}
                      onChange={(e) => setClientFormId(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-350">Business Name</label>
                    <input
                      type="text"
                      required
                      value={clientFormBiz}
                      onChange={(e) => setClientFormBiz(e.target.value)}
                      placeholder="e.g. Acme Corp"
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-350">Client Contact Person Name</label>
                    <input
                      type="text"
                      value={clientFormName}
                      onChange={(e) => setClientFormName(e.target.value)}
                      placeholder="e.g. John Miller"
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-350">Joining Date</label>
                    <input
                      type="text"
                      required
                      value={clientFormDate}
                      onChange={(e) => setClientFormDate(e.target.value)}
                      placeholder="e.g. 02-May-2026"
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-350">Services Category</label>
                    <select
                      value={clientFormServices}
                      onChange={(e) => setClientFormServices(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="Meta Ads">Meta Ads</option>
                      <option value="Google Ads">Google Ads</option>
                      <option value="Social media Posts">Social media Posts</option>
                      <option value="AI Videos">AI Videos</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-350">Package Description</label>
                    <input
                      type="text"
                      required
                      value={clientFormPkg}
                      onChange={(e) => setClientFormPkg(e.target.value)}
                      placeholder="e.g. Premium(Google Ads)"
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-355">Package Amount (₹)</label>
                    <input
                      type="number"
                      required
                      value={clientFormAmt}
                      onChange={(e) => setClientFormAmt(e.target.value)}
                      placeholder="e.g. 5000"
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-350">Contact Number</label>
                    <input
                      type="text"
                      value={clientFormContact}
                      onChange={(e) => setClientFormContact(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-350">Email Address</label>
                    <input
                      type="email"
                      value={clientFormEmail}
                      onChange={(e) => setClientFormEmail(e.target.value)}
                      placeholder="e.g. client@domain.com"
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-350">Website</label>
                    <input
                      type="text"
                      value={clientFormWebsite}
                      onChange={(e) => setClientFormWebsite(e.target.value)}
                      placeholder="e.g. www.domain.com"
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-355">Business Sector</label>
                    <input
                      type="text"
                      value={clientFormSector}
                      onChange={(e) => setClientFormSector(e.target.value)}
                      placeholder="e.g. E-Commerce"
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-6 items-center pt-5">
                    <label className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={clientFormReady}
                        onChange={(e) => setClientFormReady(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span>Account / Page Ready?</span>
                    </label>
                    <label className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={clientFormActive}
                        onChange={(e) => setClientFormActive(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span>Active Client?</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-355">Service Deliverables / Requirement</label>
                  <textarea
                    value={clientFormReq}
                    onChange={(e) => setClientFormReq(e.target.value)}
                    placeholder="e.g. Daily Activity: 5 Creatives, 3 Reels, 2 Ai Videos"
                    rows="2"
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-355">Execution Notes / Payments Details</label>
                  <textarea
                    value={clientFormNotes}
                    onChange={(e) => setClientFormNotes(e.target.value)}
                    placeholder="Notes regarding client onboarding, custom package adjustments..."
                    rows="2"
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddClientModal(false)}
                  className="py-2 px-4 border border-slate-200 dark:border-slate-755 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="py-2 px-4 bg-blue-800 hover:bg-blue-900 text-white rounded-lg transition disabled:opacity-50"
                >
                  {formLoading ? 'Onboarding...' : 'Onboard Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT CLIENT MODAL --- */}
      {showEditClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-fade-in text-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-855 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900">
              <h3 className="font-extrabold text-sm text-slate-950 dark:text-white">Modify Client Profile</h3>
              <button onClick={() => setShowEditClientModal(false)} className="text-slate-400 hover:text-slate-655 transition text-sm">✕</button>
            </div>
            
            <form onSubmit={handleEditClient}>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {formError && (
                  <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-700 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-355">Client ID</label>
                    <input
                      type="text"
                      required
                      value={clientFormId}
                      onChange={(e) => setClientFormId(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none font-semibold text-slate-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-355">Business Name</label>
                    <input
                      type="text"
                      required
                      value={clientFormBiz}
                      onChange={(e) => setClientFormBiz(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-355">Client Contact Person Name</label>
                    <input
                      type="text"
                      value={clientFormName}
                      onChange={(e) => setClientFormName(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-355">Joining Date</label>
                    <input
                      type="text"
                      required
                      value={clientFormDate}
                      onChange={(e) => setClientFormDate(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-355">Services Category</label>
                    <select
                      value={clientFormServices}
                      onChange={(e) => setClientFormServices(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="Meta Ads">Meta Ads</option>
                      <option value="Google Ads">Google Ads</option>
                      <option value="Social media Posts">Social media Posts</option>
                      <option value="AI Videos">AI Videos</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-355">Package Description</label>
                    <input
                      type="text"
                      required
                      value={clientFormPkg}
                      onChange={(e) => setClientFormPkg(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-355">Package Amount (₹)</label>
                    <input
                      type="number"
                      required
                      value={clientFormAmt}
                      onChange={(e) => setClientFormAmt(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-355">Contact Number</label>
                    <input
                      type="text"
                      value={clientFormContact}
                      onChange={(e) => setClientFormContact(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-355">Email Address</label>
                    <input
                      type="email"
                      value={clientFormEmail}
                      onChange={(e) => setClientFormEmail(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-355">Website</label>
                    <input
                      type="text"
                      value={clientFormWebsite}
                      onChange={(e) => setClientFormWebsite(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-355">Business Sector</label>
                    <input
                      type="text"
                      value={clientFormSector}
                      onChange={(e) => setClientFormSector(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-6 items-center pt-5">
                    <label className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={clientFormReady}
                        onChange={(e) => setClientFormReady(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span>Account / Page Ready?</span>
                    </label>
                    <label className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={clientFormActive}
                        onChange={(e) => setClientFormActive(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span>Active Client?</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-355">Service Deliverables / Requirement</label>
                  <textarea
                    value={clientFormReq}
                    onChange={(e) => setClientFormReq(e.target.value)}
                    rows="2"
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-355">Execution Notes / Payments Details</label>
                  <textarea
                    value={clientFormNotes}
                    onChange={(e) => setClientFormNotes(e.target.value)}
                    rows="2"
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditClientModal(false)}
                  className="py-2 px-4 border border-slate-200 dark:border-slate-755 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
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

      {/* --- CLIENT DETAIL VIEW MODAL --- */}
      {showClientDetailModal && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-fade-in text-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-855 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden animate-scale-up text-slate-800 dark:text-slate-200">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900">
              <div>
                <h3 className="font-extrabold text-sm text-slate-950 dark:text-white">{selectedClient.businessName}</h3>
                <span className="text-[9px] text-slate-400 font-extrabold uppercase mt-0.5 tracking-wider">Client ID: {selectedClient.clientId}</span>
              </div>
              <button onClick={() => setShowClientDetailModal(false)} className="text-slate-400 hover:text-slate-655 transition text-sm">✕</button>
            </div>
            
            <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-h-[80vh] overflow-y-auto">
              
              {/* Left Column: Client Details */}
              <div className="lg:col-span-5 space-y-4 border-r border-slate-100 dark:border-slate-800/60 pr-0 lg:pr-6">
                <div className="grid grid-cols-2 gap-4 border-b border-slate-100 dark:border-slate-800/60 pb-3">
                  <div>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase">Contact Person</span>
                    <p className="font-bold text-slate-900 dark:text-white text-[11px] mt-0.5">{selectedClient.clientName || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase">Joining Date</span>
                    <p className="font-bold text-slate-900 dark:text-white text-[11px] mt-0.5">{selectedClient.joiningDate}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-b border-slate-100 dark:border-slate-800/60 pb-3">
                  <div>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase">Services Category</span>
                    <p className="font-bold text-slate-900 dark:text-white text-[11px] mt-0.5">{selectedClient.services}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase">Monthly Package Cost</span>
                    <p className="font-extrabold text-blue-750 dark:text-blue-400 text-[11px] mt-0.5">₹{selectedClient.packageAmount.toLocaleString()}/mo</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 border-b border-slate-100 dark:border-slate-800/60 pb-3">
                  <div>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase">Contact Number</span>
                    <p className="font-semibold text-slate-700 dark:text-slate-350 mt-0.5 truncate" title={selectedClient.contact}>{selectedClient.contact || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase">Email Address</span>
                    <p className="font-semibold text-slate-700 dark:text-slate-355 mt-0.5 truncate" title={selectedClient.email}>{selectedClient.email || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase">Website</span>
                    <p className="font-semibold text-slate-700 dark:text-slate-355 mt-0.5 truncate" title={selectedClient.website}>{selectedClient.website || 'N/A'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-b border-slate-100 dark:border-slate-800/60 pb-3">
                  <div>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase">Sector</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-300 mt-0.5">{selectedClient.sector || 'N/A'}</p>
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase block font-semibold">Page Ready</span>
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold mt-1 ${selectedClient.accountReady ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-655 border border-red-200'}`}>
                        {selectedClient.accountReady ? 'READY' : 'PENDING'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase block font-semibold">Contract</span>
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold mt-1 ${selectedClient.active ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                        {selectedClient.active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase">Execution Requirement</span>
                  <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-lg border border-slate-200/50 dark:border-slate-800 text-[11px] font-medium leading-relaxed">
                    {selectedClient.requirement || <span className="text-slate-400 italic">No specific instructions specified.</span>}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase">Audit & Execution Notes</span>
                  <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-lg border border-slate-200/50 dark:border-slate-800 text-[11px] font-medium leading-relaxed">
                    {selectedClient.notes || <span className="text-slate-400 italic">No additional notes added.</span>}
                  </div>
                </div>
              </div>

              {/* Right Column: CRM Tasks Deliverables board */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">CRM Tasks Deliverables</h4>
                  <button
                    type="button"
                    onClick={() => resetClientTaskForm()}
                    className="text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline"
                  >
                    + Reset Form
                  </button>
                </div>

                {/* Client Task Form */}
                <form onSubmit={handleAddOrEditClientTask} className="bg-slate-50 dark:bg-slate-850/50 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800 space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase">Task ID</label>
                      <input
                        type="text"
                        required
                        value={clientTaskFormId}
                        onChange={(e) => setClientTaskFormId(e.target.value)}
                        className="w-full mt-1 p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[9px] font-bold text-slate-400 uppercase">Task Deliverable</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. SM Reels 1"
                        value={clientTaskFormTitle}
                        onChange={(e) => setClientTaskFormTitle(e.target.value)}
                        className="w-full mt-1 p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2.5">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase">Date</label>
                      <input
                        type="text"
                        required
                        value={clientTaskFormDate}
                        onChange={(e) => setClientTaskFormDate(e.target.value)}
                        className="w-full mt-1 p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase">Assign To</label>
                      <select
                        value={clientTaskFormAssignTo}
                        onChange={(e) => setClientTaskFormAssignTo(e.target.value)}
                        className="w-full mt-1 p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded text-slate-900 dark:text-white focus:outline-none"
                      >
                        <option value="Graphic Designer">Graphic Designer</option>
                        <option value="Ads Campaign Manager">Ads Campaign Manager</option>
                        <option value="AI Video Lead">AI Video Lead</option>
                        <option value="AI Video Editor">AI Video Editor</option>
                        <option value="Social Media Executive">Social Media Executive</option>
                        <option value="Video Editor">Video Editor</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase">Working On</label>
                      <input
                        type="text"
                        placeholder="Staff name"
                        value={clientTaskFormWorkingOn}
                        onChange={(e) => setClientTaskFormWorkingOn(e.target.value)}
                        className="w-full mt-1 p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase">Status</label>
                      <select
                        value={clientTaskFormStatus}
                        onChange={(e) => setClientTaskFormStatus(e.target.value)}
                        className="w-full mt-1 p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded text-slate-900 dark:text-white focus:outline-none"
                      >
                        <option value="Not Started">Not Started</option>
                        <option value="Working On It">Working On It</option>
                        <option value="Complete Task">Complete Task</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3 items-end">
                    <div className="col-span-1">
                      <label className="block text-[9px] font-bold text-slate-400 uppercase">Post Type</label>
                      <select
                        value={clientTaskFormPostType}
                        onChange={(e) => setClientTaskFormPostType(e.target.value)}
                        className="w-full mt-1 p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded text-slate-900 dark:text-white focus:outline-none"
                      >
                        <option value="Graphic">Graphic</option>
                        <option value="Reel">Reel</option>
                        <option value="AI Video">AI Video</option>
                        <option value="None">None</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[9px] font-bold text-slate-400 uppercase">Task Notes</label>
                      <input
                        type="text"
                        placeholder="e.g. Graphic approved by client"
                        value={clientTaskFormNotes}
                        onChange={(e) => setClientTaskFormNotes(e.target.value)}
                        className="w-full mt-1 p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                    <div className="col-span-1">
                      <button
                        type="submit"
                        disabled={formLoading}
                        className="w-full py-2 bg-blue-850 hover:bg-blue-900 text-white rounded font-bold transition disabled:opacity-50"
                      >
                        {clientTaskEditMode ? 'Save' : 'Add Task'}
                      </button>
                    </div>
                  </div>
                </form>

                {/* Tasks Table */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                  <div className="max-h-60 overflow-y-auto">
                    {loadingTasks ? (
                      <div className="p-8 text-center text-slate-400">Loading deliverables...</div>
                    ) : selectedClientTasks.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 italic">No task deliverables created.</div>
                    ) : (
                      <table className="w-full text-left text-[11px] border-collapse">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                            <th className="p-2.5">Date & ID</th>
                            <th className="p-2.5">Deliverable</th>
                            <th className="p-2.5">Owner / Dept</th>
                            <th className="p-2.5">Status</th>
                            <th className="p-2.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                          {selectedClientTasks.map((task) => (
                            <tr key={task.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition">
                              <td className="p-2.5 font-semibold">
                                <div className="text-slate-800 dark:text-slate-200">{task.date}</div>
                                <div className="text-[8px] text-slate-400 mt-0.5 font-bold uppercase">{task.taskId}</div>
                              </td>
                              <td className="p-2.5">
                                <div className="font-bold text-slate-900 dark:text-white">{task.taskTitle}</div>
                                {task.notes && <div className="text-[9px] text-slate-400 mt-0.5 font-medium italic">"{task.notes}"</div>}
                              </td>
                              <td className="p-2.5">
                                <div className="font-semibold text-slate-700 dark:text-slate-350">{task.workingOn || 'Unassigned'}</div>
                                <div className="text-[8px] text-slate-450 mt-0.5 uppercase tracking-wide font-bold">{task.assignTo}</div>
                              </td>
                              <td className="p-2.5">
                                <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase
                                  ${task.status === 'Complete Task' 
                                    ? 'bg-emerald-500 text-white' 
                                    : task.status === 'Working On It' 
                                    ? 'bg-orange-500 text-white' 
                                    : 'bg-slate-200 dark:bg-slate-800 text-slate-650 dark:text-slate-400'}`}
                                >
                                  {task.status}
                                </span>
                                {task.postType && task.postType !== 'None' && (
                                  <div className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">Type: {task.postType}</div>
                                )}
                              </td>
                              <td className="p-2.5 text-right">
                                <div className="flex gap-1.5 justify-end">
                                  <button
                                    type="button"
                                    onClick={() => resetClientTaskForm(task)}
                                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-250 dark:border-slate-700 text-slate-500 rounded transition"
                                    title="Edit"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteClientTask(task.id, task.taskTitle)}
                                    className="p-1 hover:bg-red-50 dark:hover:bg-red-955/20 border border-slate-250 dark:border-slate-700 text-red-550 rounded transition"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>

            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end">
              <button
                onClick={() => setShowClientDetailModal(false)}
                className="py-2 px-5 bg-blue-800 hover:bg-blue-900 text-white font-bold rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
