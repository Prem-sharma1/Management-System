'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AgencyDashboard from './AgencyDashboard';
import CampaignDeliveriesTable from './CampaignDeliveriesTable';
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
  Sun,
  Send
} from 'lucide-react';

const SERVICES_PRICING = {
  "Meta Ads Plans": [
    { name: "Basic", price: 2499, req: "Meta Ads, Creative - 3, AI Video - 1, Reels/Shorts - 1, Weekly Report" },
    { name: "Standard (Monthly)", price: 3999, req: "Meta Ads, Creative - 5, AI Video - 2, Reels/Shorts - 3, Weekly Report" },
    { name: "Premium (3-Month)", price: 6899, req: "Meta Ads, Creative - 9, AI Video - 3, Reels/Shorts - 3, Weekly Report" },
    { name: "Platinum", price: 12599, req: "Meta Ads, Creative - 18, AI Video - 6, Reels/Shorts - 6, Weekly Report" }
  ],
  "Google Ads Plans": [
    { name: "Basic Plan", price: 4995, req: "Google Ads, Creative - 3, AI Video - 1, Reels/Shorts - 1, Weekly Report" },
    { name: "Standard Plan", price: 13499, req: "Google Ads, Creative - 9, AI Video - 3, Reels/Shorts - 3, Weekly Report" },
    { name: "Premium Plan", price: 23999, req: "Google Ads, Creative - 18, AI Video - 6, Reels/Shorts - 6, Weekly Report" }
  ],
  "Combine Plans (Meta + Google Ads)": [
    { name: "Basic", price: 6999, req: "Meta Ads + Google Ads, Creative - 7, AI Video - 2, Reels/Shorts - 5, Weekly Report" },
    { name: "Standard", price: 19499, req: "Meta Ads + Google Ads, Creative - 21, AI Video - 6, Reels/Shorts - 15, Weekly Report" },
    { name: "Premium", price: 35999, req: "Meta Ads + Google Ads, Creative - 42, AI Video - 6, Reels/Shorts - 30, Weekly Report" }
  ],
  "Website Design & Development": [
    { name: "Static", price: 7499, req: "Domain Name, Hosting, 1 Page Design, Maintenance for 1 year" },
    { name: "Dynamic", price: 14999, req: "Domain Name, Hosting, 10 Page Design, Maintenance for 1 year" }
  ],
  "Creative Design Packs": [
    { name: "Starter", price: 599, req: "5 Creatives, Social Media Sizes, PNG & JPG Formats, 3-5 Days Delivery" },
    { name: "Growth", price: 1099, req: "10 Creatives, Ad Banner Formats, PNG & JPG Formats, 4-6 Days Delivery" },
    { name: "Value", price: 1499, req: "15 Creatives, Brand Style Match, Source Files Included, 5-7 Days Delivery" },
    { name: "Standard", price: 1899, req: "20 Creatives, Multi-Platform Sizes, Source Files Included, 5-7 Days Delivery" },
    { name: "Pro", price: 2699, req: "30 Creatives, Complete Ad Sets, Source Files Included, 7-10 Days Delivery" }
  ],
  "AI Video Plans": [
    { name: "Starter Plan", price: 4500, req: "5 AI Videos, Perfect for getting started" },
    { name: "Growth Plan", price: 5950, req: "7 AI Videos, Ideal for growing brands" },
    { name: "Pro Plan", price: 8000, req: "10 AI Videos, Best for maximum impact" }
  ],
  "Other / Custom": []
};

export default function AdminDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('agency-dashboard'); // agency-dashboard, overview, directory, tasks, leaves, attendance
  const [loading, setLoading] = useState(true);

  // Data states
  const [usersList, setUsersList] = useState([]);
  const [tasksList, setTasksList] = useState([]);
  const [leavesList, setLeavesList] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [clientsList, setClientsList] = useState([]);
  const [allClientTasks, setAllClientTasks] = useState([]);
  const [allClientDeliveries, setAllClientDeliveries] = useState([]);
  const [showEditDeliveryModal, setShowEditDeliveryModal] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [deliveryFormStatus, setDeliveryFormStatus] = useState('Pending');
  const [deliveryFormWorkingOn, setDeliveryFormWorkingOn] = useState('');
  const [deliveryFormNotes, setDeliveryFormNotes] = useState('');
  const [deliveryFormPostDate, setDeliveryFormPostDate] = useState('');
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
  const [taskPriority, setTaskPriority] = useState('Normal');

  // Form Fields - Client
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
  const [reqBuilder, setReqBuilder] = useState({ c: 7, r: 5, a: 3 });
  const [clientFormReady, setClientFormReady] = useState(true);
  const [clientFormActive, setClientFormActive] = useState(true);
  const [clientFormNotes, setClientFormNotes] = useState('');

  // Deliverable Assignment States
  const [showDeliverableAssignmentModal, setShowDeliverableAssignmentModal] = useState(false);
  const [pendingClientSave, setPendingClientSave] = useState(null); // 'ADD' or 'EDIT'
  const [assignedStaff, setAssignedStaff] = useState({ c: '', r: '', a: '', sm: '' });

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
  const [clientTaskFormPriority, setClientTaskFormPriority] = useState('Normal');
  const [clientTaskEditMode, setClientTaskEditMode] = useState(false);
  const [selectedClientTask, setSelectedClientTask] = useState(null);

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

  // Real-time Clock-in Polling
  useEffect(() => {
    let lastCheckTime = new Date().toISOString();

    const checkRecentClockIns = async () => {
      try {
        const res = await fetch(`/api/attendance/recent?since=${lastCheckTime}`);
        if (!res.ok) return;
        
        const data = await res.json();
        
        if (data.logs && data.logs.length > 0) {
          // Update lastCheckTime to the most recent log's createdAt
          const latestLog = data.logs[data.logs.length - 1];
          lastCheckTime = latestLog.createdAt;
          
          // Show toast for each new clock-in
          data.logs.forEach(log => {
            showToast(`🔔 ${log.user?.name || 'An employee'} just clocked in!`);
          });
          
          // Refresh the attendance table silently
          refreshData();
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    };

    const interval = setInterval(checkRecentClockIns, 10000);
    return () => clearInterval(interval);
  }, []);

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

      // Fetch clients
      const clientsRes = await fetch('/api/clients');
      const clientsData = await clientsRes.json();
      const fetchedClients = clientsData.clients || [];
      setClientsList(fetchedClients);

      // Fetch global client tasks
      const ctRes = await fetch('/api/client-tasks');
      const ctData = await ctRes.json();
      setAllClientTasks(ctData.tasks || []);

      // Fetch global client deliveries
      const cdRes = await fetch('/api/client-deliveries');
      const cdData = await cdRes.json();
      setAllClientDeliveries(cdData.deliveries || []);

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
    if (parseInt(reqBuilder.c) > 0 || parseInt(reqBuilder.r) > 0 || parseInt(reqBuilder.a) > 0) {
      setPendingClientSave('ADD');
      setShowDeliverableAssignmentModal(true);
      return;
    }
    await executeSaveClient('ADD');
  };

  const handleEditClient = async (e) => {
    e.preventDefault();
    if (parseInt(reqBuilder.c) > 0 || parseInt(reqBuilder.r) > 0 || parseInt(reqBuilder.a) > 0) {
      setPendingClientSave('EDIT');
      setShowDeliverableAssignmentModal(true);
      return;
    }
    await executeSaveClient('EDIT');
  };

  const executeSaveClient = async (mode) => {
    setFormLoading(true);
    setFormError('');
    try {
      const url = mode === 'EDIT' ? `/api/clients/${selectedClient.id}` : '/api/clients';
      const method = mode === 'EDIT' ? 'PUT' : 'POST';
      const payload = {
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
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to ${mode === 'EDIT' ? 'update' : 'add'} client`);
      
      showToast(`Client ${clientFormBiz} ${mode === 'EDIT' ? 'updated' : 'onboarded'} successfully!`);
      
      if (mode === 'EDIT') setShowEditClientModal(false);
      else setShowAddClientModal(false);
      
      await refreshData();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const confirmAndGenerateTasks = async () => {
    try {
      setFormLoading(true);

      // First, save the client so the clientId exists in the database
      setShowDeliverableAssignmentModal(false);
      await executeSaveClient(pendingClientSave);

      // Then, create the tasks via the bulk API
      const tasksToCreate = [];
      const items = [];
      
      const cCount = parseInt(reqBuilder.c);
      const rCount = parseInt(reqBuilder.r);
      const aCount = parseInt(reqBuilder.a);

      const resolveStaff = (staffId) => {
        const staff = employeesList.find(e => e.id.toString() === staffId);
        return staff ? { assignTo: staff.department, workingOn: staff.name } : { assignTo: 'Unknown', workingOn: '' };
      };

      const cStaff = assignedStaff.c ? resolveStaff(assignedStaff.c) : null;
      const rStaff = assignedStaff.r ? resolveStaff(assignedStaff.r) : null;
      const aStaff = assignedStaff.a ? resolveStaff(assignedStaff.a) : null;
      const smStaff = assignedStaff.sm ? resolveStaff(assignedStaff.sm) : null;

      for (let i = 1; i <= cCount; i++) items.push(['SM Graphic', i, cStaff, 'Graphic']);
      for (let i = 1; i <= rCount; i++) items.push(['SM Reels', i, rStaff, 'Reel']);
      for (let i = 1; i <= aCount; i++) items.push(['SM AI Videos', i, aStaff, 'AI Video']);

      const pools = {
        'SM Graphic': items.filter(x => x[0] === 'SM Graphic'),
        'SM Reels': items.filter(x => x[0] === 'SM Reels'),
        'SM AI Videos': items.filter(x => x[0] === 'SM AI Videos')
      };

      const balanced = [];
      while (pools['SM Graphic'].length || pools['SM Reels'].length || pools['SM AI Videos'].length) {
        ['SM Graphic', 'SM Reels', 'SM Graphic', 'SM AI Videos'].forEach(k => {
          if (pools[k].length) balanced.push(pools[k].shift());
        });
      }

      const joiningDate = new Date(clientFormDate || new Date());
      const getFormattedDate = (offsetDays) => {
        const d = new Date(joiningDate);
        d.setDate(d.getDate() + offsetDays);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');
      };

      const getOrdinal = (n) => {
        const s = ["th", "st", "nd", "rd"], v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
      };

      if (clientFormServices === 'AI Video Plans') {
        const count = aCount || 5;
        for (let i = 1; i <= count; i++) {
          const base = 1 + (i - 1) * 4;
          
          tasksToCreate.push({ taskTitle: `Prepare ${getOrdinal(i)} AI Video Script`, assignTo: 'AI Video Lead', workingOn: aStaff ? aStaff.workingOn : '', postType: 'Script', date: getFormattedDate(base) });
          tasksToCreate.push({ taskTitle: `Get Client Approval on ${getOrdinal(i)} Script`, assignTo: 'AI Video Lead', workingOn: aStaff ? aStaff.workingOn : '', postType: 'Script', date: getFormattedDate(base) });
          tasksToCreate.push({ taskTitle: `Work on ${getOrdinal(i)} AI Video`, assignTo: 'AI Video Editor', workingOn: aStaff ? aStaff.workingOn : '', postType: 'AI Video', date: getFormattedDate(base + 1) });
          tasksToCreate.push({ taskTitle: `Share ${getOrdinal(i)} AI Video with client and get changes`, assignTo: 'AI Video Lead', workingOn: aStaff ? aStaff.workingOn : '', postType: 'AI Video', date: getFormattedDate(base + 2) });
          tasksToCreate.push({ taskTitle: `Posting ${getOrdinal(i)} AI Video on Social Media Platforms`, assignTo: 'Social Media Executive', workingOn: smStaff ? smStaff.workingOn : '', postType: 'AI Video', date: getFormattedDate(base + 3) });
        }
      } else {
        const onboardingTasks = [
          { title: 'Client Login / Access Collection', day: 0, staff: smStaff, type: 'Onboarding' },
          { title: 'Create Accounts', day: 1, staff: smStaff, type: 'Onboarding' },
          { title: 'Ads Graphic', day: 2, staff: cStaff, type: 'Graphic' },
          { title: 'Prepare 1st Ads AI Video Script', day: 3, staff: aStaff, type: 'Script' },
          { title: 'Work on 1st Ads AI Video', day: 4, staff: aStaff, type: 'AI Video' },
          { title: 'Create Page', day: 5, staff: smStaff, type: 'Onboarding' },
          { title: 'Ads Run', day: 6, staff: smStaff, type: 'Ads' }
        ];

        onboardingTasks.forEach(ot => {
          if (ot.staff) {
            tasksToCreate.push({
              taskTitle: ot.title,
              assignTo: ot.staff.assignTo,
              workingOn: ot.staff.workingOn,
              postType: ot.type,
              date: getFormattedDate(ot.day)
            });
          }
        });

        balanced.forEach((item, index) => {
          const offset = 7 + index * 1;
          if (item[2]) {
            tasksToCreate.push({
              taskTitle: `${item[0]} ${item[1]}`,
              assignTo: item[2].assignTo,
              workingOn: item[2].workingOn,
              postType: item[3],
              date: getFormattedDate(offset)
            });
          }
        });

        [7, 14, 21, 28].forEach((offset, index) => {
          tasksToCreate.push({
            taskTitle: `Weekly Report ${index + 1}`,
            assignTo: 'Ads Campaign Manager',
            workingOn: smStaff ? smStaff.workingOn : '',
            postType: 'Report',
            date: getFormattedDate(offset)
          });
        });
      }

      if (tasksToCreate.length > 0) {
        const tasksRes = await fetch('/api/clients/deliverables', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId: clientFormId,
            businessName: clientFormBiz,
            tasks: tasksToCreate
          })
        });

        if (!tasksRes.ok) {
          console.error("Failed to generate tasks");
        }
      }
      
      // Refresh to fetch the newly created tasks
      await refreshData();
      
    } catch (err) {
      setFormError("Error generating tasks.");
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
      setClientTaskFormPriority(task.priority || 'Normal');
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
      setClientTaskFormPriority('Normal');
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
          notes: clientTaskFormNotes,
          priority: clientTaskFormPriority
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

  const handleEditDelivery = async (e) => {
    e.preventDefault();
    if (!selectedDelivery) return;
    setFormLoading(true);
    setFormError('');
    try {
      const res = await fetch(`/api/client-deliveries/${selectedDelivery.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: deliveryFormStatus,
          workingOn: deliveryFormWorkingOn,
          notes: deliveryFormNotes,
          postDate: deliveryFormPostDate
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update delivery');
      showToast('Campaign delivery updated successfully!');
      setShowEditDeliveryModal(false);
      await refreshData();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteDelivery = async (id, deliveryIdVal) => {
    if (!confirm(`Are you sure you want to delete delivery record "${deliveryIdVal}"?`)) return;
    try {
      const res = await fetch(`/api/client-deliveries/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete delivery');
      showToast(`Deleted delivery: ${deliveryIdVal}`);
      await refreshData();
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
          dueDate: taskDueDate || undefined,
          priority: taskPriority
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
              onClick={() => setActiveTab('agency-dashboard')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === 'agency-dashboard'
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              Agency Dashboard
            </button>
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
          
          {/* TAB 0: AGENCY DASHBOARD */}
          {activeTab === 'agency-dashboard' && (
            <AgencyDashboard deliveries={allClientDeliveries} clients={clientsList} tasks={allClientTasks} />
          )}

          {/* TAB: CAMPAIGN DELIVERIES */}
          {activeTab === 'campaign-deliveries' && (
            <CampaignDeliveriesTable deliveries={allClientDeliveries} />
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Total Staff Card */}
                <div className="relative bg-white dark:bg-slate-900 p-5 xl:p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden flex items-center justify-between hover:translate-y-[-2px] transition duration-200 animate-slide-up group" style={{ animationDelay: '100ms' }}>
                  <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-50 dark:bg-blue-900/20 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-24 h-24 bg-blue-50/80 dark:bg-blue-900/40 rounded-full pointer-events-none group-hover:scale-150 transition-transform duration-500"></div>
                  
                  <div className="space-y-1 relative z-10 min-w-0 pr-2">
                    <div className="text-[10px] xl:text-xs text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider truncate">Active Employees</div>
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <h3 className="text-2xl xl:text-3xl font-black text-slate-900 dark:text-white truncate">{metrics.totalStaff}</h3>
                      <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Staff</span>
                    </div>
                  </div>
                  <div className="shrink-0 relative z-10 w-10 h-10 xl:w-12 xl:h-12 rounded-xl bg-white/90 dark:bg-slate-800 backdrop-blur-sm shadow-md border border-white dark:border-slate-700 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Users className="w-5 h-5 xl:w-6 xl:h-6" />
                  </div>
                </div>

                {/* Assigned Tasks Card */}
                <div className="relative bg-white dark:bg-slate-900 p-5 xl:p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden flex items-center justify-between hover:translate-y-[-2px] transition duration-200 animate-slide-up group" style={{ animationDelay: '200ms' }}>
                  <div className="absolute -right-6 -top-6 w-32 h-32 bg-purple-50 dark:bg-purple-900/20 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-24 h-24 bg-purple-50/80 dark:bg-purple-900/40 rounded-full pointer-events-none group-hover:scale-150 transition-transform duration-500"></div>
                  
                  <div className="space-y-1 relative z-10 min-w-0 pr-2">
                    <div className="text-[10px] xl:text-xs text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider truncate">Assigned Tasks</div>
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <h3 className="text-2xl xl:text-3xl font-black text-slate-900 dark:text-white truncate">{metrics.activeTasks}</h3>
                      <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Active</span>
                    </div>
                  </div>
                  <div className="shrink-0 relative z-10 w-10 h-10 xl:w-12 xl:h-12 rounded-xl bg-white/90 dark:bg-slate-800 backdrop-blur-sm shadow-md border border-white dark:border-slate-700 flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <CheckSquare className="w-5 h-5 xl:w-6 xl:h-6" />
                  </div>
                </div>

                {/* Pending Leaves Card */}
                <div className="relative bg-white dark:bg-slate-900 p-5 xl:p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden flex items-center justify-between hover:translate-y-[-2px] transition duration-200 animate-slide-up group" style={{ animationDelay: '300ms' }}>
                  <div className="absolute -right-6 -top-6 w-32 h-32 bg-orange-50 dark:bg-orange-900/20 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-24 h-24 bg-orange-50/80 dark:bg-orange-900/40 rounded-full pointer-events-none group-hover:scale-150 transition-transform duration-500"></div>
                  
                  <div className="space-y-1 relative z-10 min-w-0 pr-2">
                    <div className="text-[10px] xl:text-xs text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider truncate">Pending Leaves</div>
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <h3 className="text-2xl xl:text-3xl font-black text-slate-900 dark:text-white truncate">{metrics.pendingLeaves}</h3>
                      <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Requests</span>
                    </div>
                  </div>
                  <div className="shrink-0 relative z-10 w-10 h-10 xl:w-12 xl:h-12 rounded-xl bg-white/90 dark:bg-slate-800 backdrop-blur-sm shadow-md border border-white dark:border-slate-700 flex items-center justify-center text-orange-600 dark:text-orange-400">
                    <Calendar className="w-5 h-5 xl:w-6 xl:h-6" />
                  </div>
                </div>

                {/* Present Today Card */}
                <div className="relative bg-white dark:bg-slate-900 p-5 xl:p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden flex items-center justify-between hover:translate-y-[-2px] transition duration-200 animate-slide-up group" style={{ animationDelay: '400ms' }}>
                  <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-50 dark:bg-emerald-900/20 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-24 h-24 bg-emerald-50/80 dark:bg-emerald-900/40 rounded-full pointer-events-none group-hover:scale-150 transition-transform duration-500"></div>
                  
                  <div className="space-y-1 relative z-10 min-w-0 pr-2">
                    <div className="text-[10px] xl:text-xs text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider truncate">Present Today</div>
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <h3 className="text-2xl xl:text-3xl font-black text-slate-900 dark:text-white truncate">{metrics.presentToday}</h3>
                      <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Online</span>
                    </div>
                  </div>
                  <div className="shrink-0 relative z-10 w-10 h-10 xl:w-12 xl:h-12 rounded-xl bg-white/90 dark:bg-slate-800 backdrop-blur-sm shadow-md border border-white dark:border-slate-700 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Clock className="w-5 h-5 xl:w-6 xl:h-6" />
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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                
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
                          <div className="flex flex-col gap-1">
                            <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">{task.title}</p>
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase w-max
                              ${task.priority === 'Urgent' ? 'bg-red-500 text-white' 
                                : task.priority === 'High' ? 'bg-orange-400 text-white' 
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                              {task.priority || 'Normal'}
                            </span>
                          </div>
                          <button onClick={() => handleDeleteTask(task.id)} className="text-slate-300 hover:text-red-600 transition">✕</button>
                        </div>
                        <p className="text-[10px] text-slate-500 line-clamp-2">{task.description}</p>
                        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2 mt-1">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-slate-400">Due: {task.dueDate || 'No Limit'}</span>
                            <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 mt-0.5">👤 {task.assignedTo?.name || 'Unassigned'}</span>
                          </div>
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
                          <div className="flex flex-col gap-1">
                            <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">{task.title}</p>
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase w-max
                              ${task.priority === 'Urgent' ? 'bg-red-500 text-white' 
                                : task.priority === 'High' ? 'bg-orange-400 text-white' 
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                              {task.priority || 'Normal'}
                            </span>
                          </div>
                          <button onClick={() => handleDeleteTask(task.id)} className="text-slate-300 hover:text-red-600 transition">✕</button>
                        </div>
                        <p className="text-[10px] text-slate-500 line-clamp-2">{task.description}</p>
                        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2 mt-1">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-slate-400">Due: {task.dueDate || 'No Limit'}</span>
                            <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">👤 {task.assignedTo?.name || 'Unassigned'}</span>
                          </div>
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

                {/* Column 3: BLOCKED / DELAYED */}
                <div className="bg-red-50/50 dark:bg-red-950/20 p-4 rounded-2xl border border-red-100 dark:border-red-900/30 min-h-[400px] flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b border-red-200 dark:border-red-900/50 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400">Pending / Overdue</span>
                    <span className="w-5 h-5 bg-red-100 dark:bg-red-900 text-[10px] font-bold text-red-700 dark:text-red-400 rounded-full flex items-center justify-center">
                      {tasksList.filter(t => t.status === 'PENDING' || t.status === 'OVERDUE').length}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    {tasksList.filter(t => t.status === 'PENDING' || t.status === 'OVERDUE').map(task => (
                      <div key={task.id} className="bg-white dark:bg-slate-900 p-4 border border-red-200 dark:border-red-900 rounded-xl shadow-sm flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col gap-1">
                            <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">{task.title}</p>
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase w-max
                              ${task.priority === 'Urgent' ? 'bg-red-500 text-white' 
                                : task.priority === 'High' ? 'bg-orange-400 text-white' 
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                              {task.priority || 'Normal'}
                            </span>
                          </div>
                          <button onClick={() => handleDeleteTask(task.id)} className="text-slate-300 hover:text-red-600 transition">✕</button>
                        </div>
                        <p className="text-[10px] text-slate-500 line-clamp-2">{task.description}</p>
                        {task.reason && (
                          <div className="bg-red-50 dark:bg-red-950/30 p-2 rounded-lg border border-red-100 dark:border-red-900/30 mt-1">
                            <span className="text-[9px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider block mb-0.5">Reason:</span>
                            <p className="text-[10px] text-red-700 dark:text-red-300 italic">{task.reason}</p>
                          </div>
                        )}
                        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2 mt-1">
                          <span className="text-[9px] font-bold text-slate-400">Assigned: {task.assignedTo?.name || 'Unknown'}</span>
                          <span className="py-1 px-2.5 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 rounded-md text-[9px] font-bold">{task.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 4: DONE */}
                <div className="bg-slate-100 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 min-h-[400px] flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-350">Completed</span>
                    <span className="w-5 h-5 bg-slate-200 dark:bg-slate-800 text-[10px] font-bold rounded-full flex items-center justify-center">
                      {tasksList.filter(t => t.status === 'DONE').length}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    {tasksList.filter(t => t.status === 'DONE').map(task => (
                      <div key={task.id} className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col gap-2 opacity-90">
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col gap-1">
                            <p className="text-xs font-bold text-slate-950 dark:text-slate-200 leading-snug">{task.title}</p>
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase w-max
                              ${task.priority === 'Urgent' ? 'bg-red-500 text-white' 
                                : task.priority === 'High' ? 'bg-orange-400 text-white' 
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                              {task.priority || 'Normal'}
                            </span>
                          </div>
                          <button onClick={() => handleDeleteTask(task.id)} className="text-slate-300 hover:text-red-600 transition">✕</button>
                        </div>
                        <p className="text-[10px] text-slate-500">{task.description}</p>
                        {task.workSampleUrl && (
                          <div className="bg-emerald-50 dark:bg-emerald-950/20 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900/30 mt-1">
                            <a 
                              href={task.workSampleUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline"
                            >
                              📁 View Work Sample
                            </a>
                          </div>
                        )}
                        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2 mt-1">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-slate-400">Completed Task</span>
                            <span className="text-[9px] font-bold text-slate-500 mt-0.5">👤 By: {task.assignedTo?.name || 'Unassigned'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleUpdateTaskStatus(task.id, 'IN_PROGRESS')}
                              className="text-[9px] font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 px-2 py-1 rounded-md hover:bg-orange-100 transition"
                            >
                              Undo
                            </button>
                            <span className="w-5 h-5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-full flex items-center justify-center font-bold text-[10px]">✓</span>
                          </div>
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
                      <th className="p-4 uppercase tracking-wider">Location</th>
                      <th className="p-4 uppercase tracking-wider">Punctuality</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceLogs.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-slate-400">No sign-ins recorded.</td>
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
                            {log.location && log.location.startsWith('http') ? (
                              <a href={log.location} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-1 font-semibold">
                                <span className="text-sm">📍</span> View Map
                              </a>
                            ) : (
                              <span className="text-slate-400 italic text-[10px]">{log.location || 'Not Tracked'}</span>
                            )}
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
                              {task.Client && (
                                <div className="text-[9px] text-blue-500 font-bold mt-1 leading-tight">
                                  {task.Client.services}<br/>
                                  <span className="text-slate-500">{task.Client.packageName}</span>
                                </div>
                              )}
                            </td>
                            <td className="p-4">
                              <div className="font-semibold text-slate-800 dark:text-slate-250">{task.taskTitle}</div>
                              {task.postType && (
                                <div className="inline-block px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[8px] font-bold text-slate-500 uppercase mt-1">
                                  Type: {task.postType}
                                </div>
                              )}
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
                        <th className="p-4 text-right">Actions</th>
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
                            <td className="p-4 font-bold text-slate-450">
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
                                      const matchingTask = allClientTasks.find(t => t.taskId === delivery.linkedTaskId);
                                      if (matchingTask) {
                                        resetClientTaskForm(matchingTask);
                                      }
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
                            <td className="p-4 text-right">
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => {
                                    setSelectedDelivery(delivery);
                                    setDeliveryFormStatus(delivery.status || 'Pending');
                                    setDeliveryFormWorkingOn(delivery.workingOn || '');
                                    setDeliveryFormNotes(delivery.notes || '');
                                    setDeliveryFormPostDate(delivery.postDate || '');
                                    setShowEditDeliveryModal(true);
                                  }}
                                  className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-855 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-lg transition"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteDelivery(delivery.id, delivery.deliveryId)}
                                  className="p-1 border border-slate-200 dark:border-slate-850 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-red-550 transition"
                                >
                                  ✕
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
          
          {/* TAB 6: CLIENT CRM */}
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
                                  className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-855 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-lg transition"
                                >
                                  Details
                                </button>
                                <button
                                  onClick={() => { resetClientForm(client); setShowEditClientModal(true); }}
                                  className="p-1.5 border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition"
                                  title="Edit"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteClient(client.id, client.businessName)}
                                  className="p-1.5 border border-slate-200 dark:border-slate-850 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-red-650 transition"
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

                <div className="grid grid-cols-3 gap-4">
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
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Priority</label>
                    <select
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="Normal">Normal</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
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

      {/* --- ADD CLIENT MODAL --- */}
      {showAddClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-fade-in text-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-scale-up">
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
                      onChange={(e) => {
                        const newCategory = e.target.value;
                        setClientFormServices(newCategory);
                        setClientFormPkg('');
                        setClientFormAmt('');
                        setClientFormReq('');
                      }}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="" disabled>Select Category</option>
                      {Object.keys(SERVICES_PRICING).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-350">Package Description</label>
                    {SERVICES_PRICING[clientFormServices] && SERVICES_PRICING[clientFormServices].length > 0 ? (
                      <select
                        required
                        value={clientFormPkg}
                        onChange={(e) => {
                          const pkgName = e.target.value;
                          setClientFormPkg(pkgName);
                          const pkgData = SERVICES_PRICING[clientFormServices].find(p => p.name === pkgName);
                          if (pkgData) {
                            setClientFormAmt(pkgData.price.toString());
                            setClientFormReq(pkgData.req);
                          }
                        }}
                        className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                      >
                        <option value="" disabled>Select a Plan</option>
                        {SERVICES_PRICING[clientFormServices].map(pkg => (
                          <option key={pkg.name} value={pkg.name}>{pkg.name}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        required
                        value={clientFormPkg}
                        onChange={(e) => setClientFormPkg(e.target.value)}
                        placeholder="e.g. Custom Plan Name"
                        className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                      />
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-350">Package Amount (₹)</label>
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
                    <label className="font-bold text-slate-700 dark:text-slate-350">Business Sector</label>
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
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-slate-700 dark:text-slate-350">Service Deliverables / Requirement</label>
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-md">
                      <span className="text-[10px] text-slate-500 font-bold ml-1 uppercase tracking-wider">Plan Builder:</span>
                      <div className="flex items-center gap-1">
                        <input type="number" min="0" value={reqBuilder.c} onChange={e=>setReqBuilder({...reqBuilder, c: e.target.value})} className="w-10 text-center text-xs p-0.5 rounded border border-slate-300 dark:border-slate-700 dark:bg-slate-900 focus:outline-none" title="Creatives" /> <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">C</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <input type="number" min="0" value={reqBuilder.r} onChange={e=>setReqBuilder({...reqBuilder, r: e.target.value})} className="w-10 text-center text-xs p-0.5 rounded border border-slate-300 dark:border-slate-700 dark:bg-slate-900 focus:outline-none" title="Reels" /> <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">R</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <input type="number" min="0" value={reqBuilder.a} onChange={e=>setReqBuilder({...reqBuilder, a: e.target.value})} className="w-10 text-center text-xs p-0.5 rounded border border-slate-300 dark:border-slate-700 dark:bg-slate-900 focus:outline-none" title="AI Videos" /> <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">AI</span>
                      </div>
                      <button type="button" onClick={() => setClientFormReq(`Daily Activity: ${reqBuilder.c} Creatives, ${reqBuilder.r} Reels, ${reqBuilder.a} Ai Videos`)} className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold transition ml-1">Generate</button>
                    </div>
                  </div>
                  <textarea
                    value={clientFormReq}
                    onChange={(e) => setClientFormReq(e.target.value)}
                    placeholder="e.g. Daily Activity: 5 Creatives, 3 Reels, 2 Ai Videos"
                    rows="2"
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-350">Execution Notes / Payments Details</label>
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

      {/* --- SMART DELIVERABLE ASSIGNMENT MODAL --- */}
      {showDeliverableAssignmentModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in text-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" /> Auto-Assign Deliverables
              </h3>
              <p className="text-[10px] text-slate-500 mt-1">Assign these required deliverables to your creators.</p>
            </div>
            
            <div className="p-6 space-y-5">
              {parseInt(reqBuilder.c) > 0 && (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800 dark:text-slate-200">Graphic Creatives ({reqBuilder.c})</span>
                    <span className="text-[9px] font-extrabold uppercase bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded">Graphic Designer</span>
                  </div>
                  <select 
                    value={assignedStaff.c} 
                    onChange={e => setAssignedStaff({...assignedStaff, c: e.target.value})}
                    className="w-full p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="" disabled>Select Staff to Assign</option>
                    {employeesList
                      .filter(e => ['swapnil', 'danish'].some(name => e.name.toLowerCase().includes(name.toLowerCase())))
                      .map(e => <option key={e.id} value={e.id}>{e.name} ({e.department})</option>)}
                  </select>
                </div>
              )}
              
              {parseInt(reqBuilder.r) > 0 && (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800 dark:text-slate-200">Reels / Shorts ({reqBuilder.r})</span>
                    <span className="text-[9px] font-extrabold uppercase bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-400 px-2 py-0.5 rounded">Video Editor</span>
                  </div>
                  <select 
                    value={assignedStaff.r} 
                    onChange={e => setAssignedStaff({...assignedStaff, r: e.target.value})}
                    className="w-full p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="" disabled>Select Staff to Assign</option>
                    {employeesList
                      .filter(e => ['sanmeet'].some(name => e.name.toLowerCase().includes(name.toLowerCase())))
                      .map(e => <option key={e.id} value={e.id}>{e.name} ({e.department})</option>)}
                  </select>
                </div>
              )}

              {parseInt(reqBuilder.a) > 0 && (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800 dark:text-slate-200">AI Videos ({reqBuilder.a})</span>
                    <span className="text-[9px] font-extrabold uppercase bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded">AI Lead</span>
                  </div>
                  <select 
                    value={assignedStaff.a} 
                    onChange={e => setAssignedStaff({...assignedStaff, a: e.target.value})}
                    className="w-full p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="" disabled>Select Staff to Assign</option>
                    {employeesList
                      .filter(e => ['masoom', 'nouman', 'divyansh'].some(name => e.name.toLowerCase().includes(name.toLowerCase())))
                      .map(e => <option key={e.id} value={e.id}>{e.name} ({e.department})</option>)}
                  </select>
                </div>
              )}

              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Weekly Reports (4)</span>
                  <span className="text-[9px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded">Social Media Exec</span>
                </div>
                <select 
                  value={assignedStaff.sm} 
                  onChange={e => setAssignedStaff({...assignedStaff, sm: e.target.value})}
                  className="w-full p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="" disabled>Select Staff to Assign</option>
                  {employeesList
                    .filter(e => ['pujan', 'preet', 'rama'].some(name => e.name.toLowerCase().includes(name.toLowerCase())))
                    .map(e => <option key={e.id} value={e.id}>{e.name} ({e.department})</option>)}
                </select>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeliverableAssignmentModal(false);
                  executeSaveClient(pendingClientSave);
                }}
                className="py-2 px-4 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-lg transition"
              >
                Skip Assignment
              </button>
              <button
                type="button"
                onClick={confirmAndGenerateTasks}
                disabled={formLoading}
                className="py-2 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg transition disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-500/20"
              >
                {formLoading ? 'Generating...' : 'Confirm & Generate Tasks'}
              </button>
            </div>
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
                      onChange={(e) => {
                        const newCategory = e.target.value;
                        setClientFormServices(newCategory);
                        setClientFormPkg('');
                        setClientFormAmt('');
                        setClientFormReq('');
                      }}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="" disabled>Select Category</option>
                      {Object.keys(SERVICES_PRICING).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-355">Package Description</label>
                    {SERVICES_PRICING[clientFormServices] && SERVICES_PRICING[clientFormServices].length > 0 ? (
                      <select
                        required
                        value={clientFormPkg}
                        onChange={(e) => {
                          const pkgName = e.target.value;
                          setClientFormPkg(pkgName);
                          const pkgData = SERVICES_PRICING[clientFormServices].find(p => p.name === pkgName);
                          if (pkgData) {
                            setClientFormAmt(pkgData.price.toString());
                            setClientFormReq(pkgData.req);
                          }
                        }}
                        className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                      >
                        <option value="" disabled>Select a Plan</option>
                        {SERVICES_PRICING[clientFormServices].map(pkg => (
                          <option key={pkg.name} value={pkg.name}>{pkg.name}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        required
                        value={clientFormPkg}
                        onChange={(e) => setClientFormPkg(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                      />
                    )}
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
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-slate-700 dark:text-slate-355">Service Deliverables / Requirement</label>
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-md">
                      <span className="text-[10px] text-slate-500 font-bold ml-1 uppercase tracking-wider">Plan Builder:</span>
                      <div className="flex items-center gap-1">
                        <input type="number" min="0" value={reqBuilder.c} onChange={e=>setReqBuilder({...reqBuilder, c: e.target.value})} className="w-10 text-center text-xs p-0.5 rounded border border-slate-300 dark:border-slate-700 dark:bg-slate-900 focus:outline-none" title="Creatives" /> <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">C</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <input type="number" min="0" value={reqBuilder.r} onChange={e=>setReqBuilder({...reqBuilder, r: e.target.value})} className="w-10 text-center text-xs p-0.5 rounded border border-slate-300 dark:border-slate-700 dark:bg-slate-900 focus:outline-none" title="Reels" /> <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">R</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <input type="number" min="0" value={reqBuilder.a} onChange={e=>setReqBuilder({...reqBuilder, a: e.target.value})} className="w-10 text-center text-xs p-0.5 rounded border border-slate-300 dark:border-slate-700 dark:bg-slate-900 focus:outline-none" title="AI Videos" /> <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">AI</span>
                      </div>
                      <button type="button" onClick={() => setClientFormReq(`Daily Activity: ${reqBuilder.c} Creatives, ${reqBuilder.r} Reels, ${reqBuilder.a} Ai Videos`)} className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold transition ml-1">Generate</button>
                    </div>
                  </div>
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
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Page Ready</span>
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold mt-1 ${selectedClient.accountReady ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-650 border border-red-200'}`}>
                        {selectedClient.accountReady ? 'READY' : 'PENDING'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Contract</span>
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

                  <div className="grid grid-cols-5 gap-2.5">
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
                      <select
                        value={clientTaskFormWorkingOn}
                        onChange={(e) => setClientTaskFormWorkingOn(e.target.value)}
                        className="w-full mt-1 p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded text-slate-900 dark:text-white focus:outline-none"
                      >
                        <option value="">Select Staff</option>
                        {employeesList.filter(e => {
                          if (clientTaskFormAssignTo === 'Graphic Designer') {
                            return ['swapnil', 'danish'].some(name => e.name.toLowerCase().includes(name.toLowerCase()));
                          } else if (clientTaskFormAssignTo === 'Video Editor') {
                            return ['sanmeet'].some(name => e.name.toLowerCase().includes(name.toLowerCase()));
                          } else if (clientTaskFormAssignTo === 'AI Video Lead' || clientTaskFormAssignTo === 'AI Video Editor') {
                            return ['masoom', 'nouman', 'divyansh'].some(name => e.name.toLowerCase().includes(name.toLowerCase()));
                          }
                          return e.department === clientTaskFormAssignTo;
                        }).map(e => (
                          <option key={e.id} value={e.name}>{e.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase">Priority</label>
                      <select
                        value={clientTaskFormPriority}
                        onChange={(e) => setClientTaskFormPriority(e.target.value)}
                        className="w-full mt-1 p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded text-slate-900 dark:text-white focus:outline-none"
                      >
                        <option value="Normal">Normal</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
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
                            <th className="p-2.5">Status & Priority</th>
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
                                <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase mb-1
                                  ${task.status === 'Complete Task' 
                                    ? 'bg-emerald-500 text-white' 
                                    : task.status === 'Working On It' 
                                    ? 'bg-orange-500 text-white' 
                                    : 'bg-slate-200 dark:bg-slate-800 text-slate-650 dark:text-slate-400'}`}
                                >
                                  {task.status}
                                </span>
                                <div className="flex gap-1 items-center">
                                  <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase
                                    ${task.priority === 'Urgent' ? 'bg-red-500 text-white' 
                                      : task.priority === 'High' ? 'bg-orange-400 text-white' 
                                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                    {task.priority || 'Normal'}
                                  </span>
                                  {task.postType && task.postType !== 'None' && (
                                    <div className="text-[8px] font-bold text-slate-400 uppercase">Type: {task.postType}</div>
                                  )}
                                </div>
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

      {/* Edit Campaign Delivery Modal */}
      {showEditDeliveryModal && selectedDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm text-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Edit Campaign Delivery</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">ID: {selectedDelivery.deliveryId}</p>
              </div>
              <button
                onClick={() => setShowEditDeliveryModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition text-slate-450"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditDelivery} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-650 rounded-xl font-semibold border border-red-200 dark:border-red-900">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase">Client Name</label>
                <div className="mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-600 dark:text-slate-400 font-semibold">
                  {selectedDelivery.clientName}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase">Post Type</label>
                  <div className="mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-600 dark:text-slate-400 font-semibold">
                    {selectedDelivery.postType}
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase">Target Post Date</label>
                  <input
                    type="text"
                    value={deliveryFormPostDate}
                    onChange={(e) => setDeliveryFormPostDate(e.target.value)}
                    className="w-full mt-1 p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded text-slate-900 dark:text-white focus:outline-none"
                    placeholder="e.g. 04-Feb-2026"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase">Staff Assigned (Working On)</label>
                  <input
                    type="text"
                    value={deliveryFormWorkingOn}
                    onChange={(e) => setDeliveryFormWorkingOn(e.target.value)}
                    className="w-full mt-1 p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded text-slate-900 dark:text-white focus:outline-none"
                    placeholder="Staff member name"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase">Delivery Status</label>
                  <select
                    value={deliveryFormStatus}
                    onChange={(e) => setDeliveryFormStatus(e.target.value)}
                    className="w-full mt-1 p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Posted">Posted</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase">Notes</label>
                <textarea
                  value={deliveryFormNotes}
                  onChange={(e) => setDeliveryFormNotes(e.target.value)}
                  className="w-full mt-1 p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded text-slate-900 dark:text-white focus:outline-none h-20 resize-none"
                  placeholder="Additional observations, feedback, or delivery remarks..."
                />
              </div>

              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 -mx-6 -mb-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditDeliveryModal(false)}
                  className="py-2 px-5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-855 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-350 font-bold rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="py-2 px-5 bg-blue-800 hover:bg-blue-900 text-white font-bold rounded-lg transition disabled:opacity-50"
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
