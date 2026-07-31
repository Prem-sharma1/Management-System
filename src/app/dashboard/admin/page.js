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
  Send,
  AlertTriangle,
  RefreshCw,
  MessageSquare,
  CreditCard,
  DollarSign
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

const parseReqStringToCounts = (reqStr) => {
  let c = 5, r = 3, a = 2; // defaults
  if (!reqStr) return { c, r, a };

  const cMatch = reqStr.match(/Creative\s*-\s*(\d+)/i) || reqStr.match(/(\d+)\s*Creative/i);
  const rMatch = reqStr.match(/Reel[s\/Shorts]*\s*-\s*(\d+)/i) || reqStr.match(/(\d+)\s*Reel/i);
  const aMatch = reqStr.match(/AI\s*Video[s]?\s*-\s*(\d+)/i) || reqStr.match(/(\d+)\s*AI\s*Video/i);

  if (cMatch) c = parseInt(cMatch[1]);
  if (rMatch) r = parseInt(rMatch[1]);
  if (aMatch) a = parseInt(aMatch[1]);

  return { c, r, a };
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
  // Track IDs of clients that are active (status true)
  const [activeClientIds, setActiveClientIds] = useState(new Set());

  // Modal States
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showViewUserModal, setShowViewUserModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form Fields - User
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formDept, setFormDept] = useState('Social Media Marketing');
  const [formAvatar, setFormAvatar] = useState('👤');
  const [formStatus, setFormStatus] = useState('ACTIVE');
  
  // Form Fields - User Extra
  const [formAddress, setFormAddress] = useState('');
  const [formDob, setFormDob] = useState('');
  const [formExp, setFormExp] = useState('');
  const [formDesignation, setFormDesignation] = useState('');
  const [formMobile, setFormMobile] = useState('');
  const [formLastSalary, setFormLastSalary] = useState('');
  const [formDateOfJoining, setFormDateOfJoining] = useState('');

  // Form Fields - User Documents
  const [passportPhoto, setPassportPhoto] = useState('');
  const [aadharCard, setAadharCard] = useState('');
  const [panCard, setPanCard] = useState('');
  const [marksheet10, setMarksheet10] = useState('');
  const [marksheet12, setMarksheet12] = useState('');
  const [graduation, setGraduation] = useState('');
  const [otherDoc, setOtherDoc] = useState('');

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
  const [pageCreationRequired, setPageCreationRequired] = useState(false);
  const [clientFormActive, setClientFormActive] = useState(true);
  const [clientFormNotes, setClientFormNotes] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('Full');
  const [paidAmount, setPaidAmount] = useState('19499');
  const [actualNotes, setActualNotes] = useState('');

  // Deliverable Assignment States
  const [showDeliverableAssignmentModal, setShowDeliverableAssignmentModal] = useState(false);
  const [pendingClientSave, setPendingClientSave] = useState(null); // 'ADD' or 'EDIT'
  const [assignedStaff, setAssignedStaff] = useState({ c: 'AUTO', r: 'AUTO', a: 'AUTO', sm: 'AUTO', poster: '' });
  const [generateOptions, setGenerateOptions] = useState({
    onboarding: true,
    creatives: true,
    reels: true,
    aiVideos: true,
    weeklyReports: true,
    postingTasks: true,
  });
  const allSelected = Object.values(generateOptions).every(Boolean);
  const toggleAll = (checked) => setGenerateOptions({ onboarding: checked, creatives: checked, reels: checked, aiVideos: checked, weeklyReports: checked, postingTasks: checked });
  const toggleOption = (key, checked) => setGenerateOptions(prev => ({ ...prev, [key]: checked }));

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

  // Renewal Filters State
  const [renewalFilter, setRenewalFilter] = useState('All');
  const [renewalSearch, setRenewalSearch] = useState('');

  // Client Feedbacks & Concerns states
  const [feedbacksList, setFeedbacksList] = useState([]);
  const [feedbackAdminFilter, setFeedbackAdminFilter] = useState('All'); // 'All', 'Feedback', 'Concern', 'Pending', 'Reviewed'
  const [feedbackAdminSearch, setFeedbackAdminSearch] = useState('');

  // Pending Payments tab states
  const [paymentTabFilter, setPaymentTabFilter] = useState('All'); // 'All', 'Overdue7', 'Within7'
  const [paymentTabSearch, setPaymentTabSearch] = useState('');

  const getClientPaymentInfo = (client) => {
    if (!client) return { pStatus: 'Full', paidAmount: 0, totalAmount: 0, pendingBalance: 0, isPartial: false, daysPassed: 0, isOverdue7Days: false, actualNotes: '' };
    
    const totalAmount = client.packageAmount || 0;
    let pStatus = 'Full';
    let paidAmount = totalAmount;
    let actualNotes = '';

    try {
      if (client.notes) {
        const parsed = JSON.parse(client.notes);
        if (parsed && typeof parsed === 'object') {
          pStatus = parsed.paymentStatus || 'Full';
          paidAmount = parsed.paidAmount !== undefined ? parseFloat(parsed.paidAmount) || 0 : totalAmount;
          actualNotes = parsed.actualNotes || '';
        } else {
          actualNotes = client.notes;
        }
      }
    } catch (e) {
      actualNotes = client.notes || '';
    }

    const pendingBalance = Math.max(0, totalAmount - paidAmount);
    const isPartial = pStatus === 'Half' || pendingBalance > 0;

    let daysPassed = 0;
    if (client.joiningDate) {
      const parseToISO = (dateStr) => {
        if (!dateStr || typeof dateStr !== 'string') return null;
        if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) return dateStr.slice(0, 10);
        const monthMap = { jan:'01',feb:'02',mar:'03',apr:'04',may:'05',jun:'06',jul:'07',aug:'08',sep:'09',oct:'10',nov:'11',dec:'12' };
        const parts = dateStr.split('-');
        if (parts.length === 3) {
          const [dd, mon, yyyy] = parts;
          const mm = monthMap[mon.toLowerCase()];
          if (mm && dd && yyyy) return `${yyyy}-${mm}-${dd.padStart(2, '0')}`;
        }
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
      };

      const isoDate = parseToISO(client.joiningDate);
      if (isoDate) {
        const start = new Date(isoDate);
        const now = new Date();
        const diffMs = now.getTime() - start.getTime();
        daysPassed = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      }
    }

    const isOverdue7Days = isPartial && daysPassed >= 7;

    return {
      pStatus,
      paidAmount,
      totalAmount,
      pendingBalance,
      isPartial,
      daysPassed,
      isOverdue7Days,
      actualNotes
    };
  };

  const handleMarkFullyPaid = async (client) => {
    if (!confirm(`Mark remaining payment (₹${(client.packageAmount - (getClientPaymentInfo(client).paidAmount)).toLocaleString()}) as FULLY PAID for ${client.businessName}?`)) return;
    setFormLoading(true);
    try {
      let currentActualNotes = '';
      try {
        if (client.notes) {
          const parsed = JSON.parse(client.notes);
          if (parsed && typeof parsed === 'object') {
            currentActualNotes = parsed.actualNotes || '';
          } else {
            currentActualNotes = client.notes;
          }
        }
      } catch (e) {
        currentActualNotes = client.notes || '';
      }

      const updatedNotesObj = {
        paymentStatus: 'Full',
        paidAmount: client.packageAmount,
        actualNotes: currentActualNotes
      };

      const res = await fetch(`/api/clients/${client.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: JSON.stringify(updatedNotesObj) })
      });

      if (res.ok) {
        showToast(`Payment marked as FULLY PAID for ${client.businessName}!`, 'success');
        await fetchClients();
      } else {
        showToast('Failed to update payment status.', 'error');
      }
    } catch (err) {
      showToast('Error updating payment status.', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // Dark Mode State
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 4000);
  };

  const fetchJson = async (url, options = {}) => {
    try {
      const res = await fetch(url, options);
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        return { ok: res.ok, status: res.status, data };
      }
      return { ok: res.ok, status: res.status, data: {} };
    } catch (err) {
      console.warn(`Fetch error for ${url}:`, err);
      return { ok: false, status: 500, data: {} };
    }
  };

  // Auth check
  useEffect(() => {
    async function initDashboard() {
      try {
        const { ok, data } = await fetchJson('/api/auth/me');

        if (!ok || !data.user || data.user.role !== 'ADMIN') {
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
        const { ok, data } = await fetchJson(`/api/attendance/recent?since=${encodeURIComponent(lastCheckTime)}`);
        if (!ok || !data.logs || data.logs.length === 0) return;
        
        // Update lastCheckTime to the most recent log's createdAt
        const latestLog = data.logs[data.logs.length - 1];
        lastCheckTime = latestLog.createdAt;
        
        // Show toast for each new clock-in
        data.logs.forEach(log => {
          showToast(`🔔 ${log.user?.name || 'An employee'} just clocked in!`);
        });
        
        // Refresh the attendance table silently
        refreshData();
      } catch (err) {
        // Avoid triggering the Next.js Dev overlay for transient network fetch errors
        if (err instanceof TypeError && err.message === 'Failed to fetch') {
          console.warn('Polling network offline or server restarting:', err);
        } else {
          console.error('Polling error:', err);
        }
      }
    };

    const interval = setInterval(checkRecentClockIns, 10000);
    return () => clearInterval(interval);
  }, []);

  const refreshData = async () => {
    try {
      // Fetch users
      const usersRes = await fetchJson('/api/users');
      const fetchedUsers = usersRes.data.users || [];
      setUsersList(fetchedUsers);

      // Fetch tasks
      const tasksRes = await fetchJson('/api/tasks');
      const fetchedTasks = tasksRes.data.tasks || [];
      setTasksList(fetchedTasks);

      // Fetch leaves
      const leavesRes = await fetchJson('/api/leaves');
      const fetchedLeaves = leavesRes.data.leaves || [];
      setLeavesList(fetchedLeaves);

      // Fetch attendance
      const attRes = await fetchJson('/api/attendance');
      const fetchedAttendance = attRes.data.logs || [];
      setAttendanceLogs(fetchedAttendance);

      // Fetch clients
      const clientsRes = await fetchJson('/api/clients');
      const fetchedClients = clientsRes.data.clients || [];
      setClientsList(fetchedClients);
      // Update active client IDs set based on client.active flag
      const activeIds = fetchedClients.filter(c => c.active).map(c => c.clientId);
      setActiveClientIds(new Set(activeIds));

      // Fetch global client tasks
      const ctRes = await fetchJson('/api/client-tasks');
      setAllClientTasks(ctRes.data.tasks || []);

      // Fetch global client deliveries
      const cdRes = await fetchJson('/api/client-deliveries');
      setAllClientDeliveries(cdRes.data.deliveries || []);

      // Fetch client feedbacks/concerns
      const fbRes = await fetchJson('/api/client/feedback');
      setFeedbacksList(fbRes.data.feedbacks || []);

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

  const handleMarkFeedbackReviewed = async (id) => {
    setFormLoading(true);
    try {
      const res = await fetch(`/api/client/feedback/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Reviewed' })
      });
      if (res.ok) {
        showToast('Feedback marked as reviewed successfully!');
        await refreshData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update feedback status.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error updating feedback status.');
    } finally {
      setFormLoading(false);
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
      setReqBuilder(parseReqStringToCounts(client.requirement || ''));
      const isAccountReady = client.accountReady !== false;
      setClientFormReady(isAccountReady);
      setPageCreationRequired(!isAccountReady);
      setClientFormActive(client.active);
      setClientFormNotes(client.notes || '');
      
      let pStatus = 'Full';
      let pAmt = client.packageAmount.toString();
      let aNotes = '';
      try {
        if (client.notes) {
          const parsed = JSON.parse(client.notes);
          if (parsed && typeof parsed === 'object') {
            pStatus = parsed.paymentStatus || 'Full';
            pAmt = parsed.paidAmount !== undefined ? parsed.paidAmount.toString() : client.packageAmount.toString();
            aNotes = parsed.actualNotes || '';
          } else {
            aNotes = client.notes;
          }
        }
      } catch (e) {
        aNotes = client.notes || '';
      }
      setPaymentStatus(pStatus);
      setPaidAmount(pAmt);
      setActualNotes(aNotes);
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
      setClientFormAmt('19499');
      setClientFormContact('');
      setClientFormEmail('');
      setClientFormWebsite('');
      setClientFormSector('');
      setClientFormReq('');
      setReqBuilder({ c: 5, r: 3, a: 2 });
      setClientFormReady(true);
      setPageCreationRequired(false);
      setClientFormActive(true);
      setClientFormNotes('');
      setPaymentStatus('Full');
      setPaidAmount('19499');
      setActualNotes('');
    }
    setAssignedStaff({ c: 'AUTO', r: 'AUTO', a: 'AUTO', sm: 'AUTO', poster: '' });
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
        notes: JSON.stringify({
          paymentStatus,
          paidAmount: parseFloat(paidAmount) || 0,
          actualNotes
        })
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
      return true;
    } catch (err) {
      setFormError(err.message);
      return false;
    } finally {
      setFormLoading(false);
    }
  };

  const confirmAndGenerateTasks = async () => {
    try {
      setFormLoading(true);

      // First, save the client so the clientId exists in the database
      const saveSuccess = await executeSaveClient(pendingClientSave);
      setShowDeliverableAssignmentModal(false);

      if (!saveSuccess) {
        return;
      }

      // Then, create the tasks via the bulk API
      const tasksToCreate = [];
      const items = [];
      
      const parsedCounts = parseReqStringToCounts(clientFormReq || '');
      const cCount = parsedCounts.c;
      const rCount = parsedCounts.r;
      const aCount = parsedCounts.a;

      const resolveStaff = (staffId, defaultDept) => {
        if (staffId !== 'AUTO' && staffId !== '' && staffId !== null && staffId !== undefined) {
          const staff = employeesList.find(e => e.id.toString() === staffId.toString());
          if (staff) {
            return { assignTo: staff.department || defaultDept, workingOn: staff.name };
          }
        }

        // AUTO mode: Find all active employees matching department/role
        const candidates = employeesList.filter(e => {
          if (e.status === 'INACTIVE') return false;
          const deptLower = (e.department || '').toLowerCase();
          const desigLower = (e.designation || '').toLowerCase();
          const fullRole = `${deptLower} ${desigLower}`;
          const targetLower = defaultDept.toLowerCase();

          if (targetLower.includes('ai video editor') || targetLower.includes('ai video')) {
            return fullRole.includes('ai video editor') || fullRole.includes('ai video') || fullRole.includes('video editor');
          }
          if (targetLower.includes('graphic')) {
            return fullRole.includes('graphic');
          }
          if (targetLower.includes('digital marketing') || targetLower.includes('social media')) {
            return fullRole.includes('marketing') || fullRole.includes('social') || fullRole.includes('digital');
          }
          if (targetLower.includes('video editor')) {
            return fullRole.includes('video editor');
          }
          return fullRole.includes(targetLower) || targetLower.includes(deptLower);
        });

        if (candidates.length === 0) {
          return { assignTo: defaultDept, workingOn: 'AUTO' };
        }

        if (candidates.length === 1) {
          return { assignTo: defaultDept, workingOn: candidates[0].name };
        }

        // Pure Round-Robin (First Come, First Served rotation: 1st -> 2nd -> 3rd -> 1st)
        const totalAssignedClients = clientsList.length;
        const chosenEmp = candidates[totalAssignedClients % candidates.length];

        return { assignTo: defaultDept, workingOn: chosenEmp.name };
      };

      const cStaff = resolveStaff(assignedStaff.c || 'AUTO', 'Graphic Designer');
      const rStaff = resolveStaff(assignedStaff.r || 'AUTO', 'Video Editor');
      const aStaff = resolveStaff(assignedStaff.a || 'AUTO', 'Ai Video Editor');
      const smStaff = resolveStaff(assignedStaff.sm || 'AUTO', 'Digital Marketing Executive');
      const posterStaff = assignedStaff.poster && assignedStaff.poster !== 'AUTO' && assignedStaff.poster !== ''
        ? (() => {
            const emp = employeesList.find(e => e.id.toString() === assignedStaff.poster.toString());
            return emp ? { assignTo: emp.department || 'Content Posting', workingOn: emp.name } : { assignTo: 'Content Posting', workingOn: '' };
          })()
        : { assignTo: 'Content Posting', workingOn: '' };
      const scriptLead = employeesList.find(e => {
        const fullRole = ((e.department || '') + ' ' + (e.designation || '')).toLowerCase();
        return fullRole.includes('ai video lead');
      });
      const scriptStaff = { assignTo: 'AI Video Lead', workingOn: scriptLead ? scriptLead.name : 'Harshit' };

      const onboardingActive = clientFormServices !== 'AI Video Plans' && generateOptions.onboarding;

      const startGraphicIndex = onboardingActive ? 2 : 1;
      const startAIVideoIndex = onboardingActive ? 2 : 1;

      for (let i = startGraphicIndex; i <= cCount; i++) items.push(['Graphic', i, cStaff, 'Graphic']);
      for (let i = 1; i <= rCount; i++) items.push(['Reel', i, rStaff, 'Reel']);
      for (let i = startAIVideoIndex; i <= aCount; i++) items.push(['AI Video', i, aStaff, 'AI Video']);

      const pools = {
        'Graphic': items.filter(x => x[0] === 'Graphic'),
        'Reel': items.filter(x => x[0] === 'Reel'),
        'AI Video': items.filter(x => x[0] === 'AI Video')
      };

      const balanced = [];
      while (pools['Graphic'].length || pools['Reel'].length || pools['AI Video'].length) {
        ['Graphic', 'Reel', 'Graphic', 'AI Video'].forEach(k => {
          if (pools[k].length) balanced.push(pools[k].shift());
        });
      }

      const joiningDate = new Date(clientFormDate || new Date());
      const getFormattedDate = (offsetDays) => {
        const d = new Date(joiningDate);
        if (d.getDay() === 0) {
          d.setDate(d.getDate() + 1);
        }
        
        let count = 0;
        while (count < offsetDays) {
          d.setDate(d.getDate() + 1);
          if (d.getDay() !== 0) {
            count++;
          }
        }
        
        if (d.getDay() === 0) {
          d.setDate(d.getDate() + 1);
        }
        
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');
      };

      if (clientFormServices === 'AI Video Plans') {
        const count = aCount || 5;
        for (let i = 1; i <= count; i++) {
          const base = 1 + (i - 1) * 4;
          tasksToCreate.push({
            taskTitle: `AI Video Script ${i}`,
            assignTo: 'AI Video Lead',
            workingOn: 'Harshit',
            postType: 'Script',
            date: getFormattedDate(base)
          });
          tasksToCreate.push({
            taskTitle: `AI Video ${i}`,
            assignTo: 'AI Video Editor',
            workingOn: aStaff ? aStaff.workingOn : '',
            postType: 'AI Video',
            date: getFormattedDate(base + 1)
          });
        }
      } else {
        const onboardingTasks = [];
        let startOffset = 7;

        if (pageCreationRequired) {
          onboardingTasks.push(
            { title: 'Create Accounts', day: 0, staff: smStaff, type: 'Onboarding' },
            { title: 'Graphic 1', day: 1, staff: cStaff, type: 'Graphic' },
            { title: 'Create Page', day: 2, staff: smStaff, type: 'Onboarding' },
            { title: 'AI Video Script 1', day: 3, staff: scriptStaff, type: 'Script' },
            { title: 'AI Video 1', day: 4, staff: aStaff, type: 'AI Video' },
            { title: 'Ads Run', day: 5, staff: smStaff, type: 'Ads' }
          );
          startOffset = 6;
        } else {
          onboardingTasks.push(
            { title: 'Client Login / Access Collection', day: 0, staff: smStaff, type: 'Onboarding' },
            { title: 'Graphic 1', day: 1, staff: cStaff, type: 'Graphic' },
            { title: 'AI Video Script 1', day: 1, staff: scriptStaff, type: 'Script' },
            { title: 'AI Video 1', day: 2, staff: aStaff, type: 'AI Video' },
            { title: 'Ads Run', day: 2, staff: smStaff, type: 'Ads' }
          );
          startOffset = 3;
        }

        if (generateOptions.onboarding) {
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
        }

        const pkgLower = (clientFormPkg || '').toLowerCase();
        let contentDays = 21; // 1-month plan content completion target = 21 days
        if (pkgLower.includes('3-month') || pkgLower.includes('3 month') || pkgLower.includes('3m')) {
          contentDays = 61; // 3-month plan content completion target = 61 days
        } else if (pkgLower.includes('6-month') || pkgLower.includes('6 month') || pkgLower.includes('6m')) {
          contentDays = 122; // 6-month plan content completion target = 122 days
        } else if (pkgLower.includes('yearly') || pkgLower.includes('1-year') || pkgLower.includes('annual')) {
          contentDays = 244; // 1-year plan content completion target = 244 days
        }

        const totalDeliverables = balanced.length;
        const availableDays = Math.max(1, contentDays - startOffset);
        const stepDays = totalDeliverables > 0 ? Math.max(1, Math.floor(availableDays / totalDeliverables)) : 1;

        balanced.forEach((item, index) => {
          const offset = startOffset + index * stepDays;
          const isGraphic = item[0] === 'Graphic';
          const isReel = item[0] === 'Reel';
          const isAIVideo = item[0] === 'AI Video';

          if (isGraphic && !generateOptions.creatives) return;
          if (isReel && !generateOptions.reels) return;
          if (isAIVideo && !generateOptions.aiVideos) return;

          if (item[2]) {
            if (isAIVideo) {
              tasksToCreate.push({
                taskTitle: `AI Video Script ${item[1]}`,
                assignTo: 'AI Video Lead',
                workingOn: 'Harshit',
                postType: 'Script',
                date: getFormattedDate(offset)
              });
              tasksToCreate.push({
                taskTitle: `AI Video ${item[1]}`,
                assignTo: item[2].assignTo,
                workingOn: item[2].workingOn,
                postType: item[3],
                date: getFormattedDate(offset + 1)
              });
              if (generateOptions.postingTasks) {
                tasksToCreate.push({
                  taskTitle: `Post AI Video ${item[1]}`,
                  assignTo: 'Content Posting',
                  workingOn: posterStaff ? posterStaff.workingOn : '',
                  postType: 'Posting',
                  date: 'Trigger on Approval'
                });
              }
            } else {
              tasksToCreate.push({
                taskTitle: `${item[0]} ${item[1]}`,
                assignTo: item[2].assignTo,
                workingOn: item[2].workingOn,
                postType: item[3],
                date: getFormattedDate(offset)
              });
              if (generateOptions.postingTasks) {
                tasksToCreate.push({
                  taskTitle: `Post ${item[0]} ${item[1]}`,
                  assignTo: 'Content Posting',
                  workingOn: posterStaff ? posterStaff.workingOn : '',
                  postType: 'Posting',
                  date: 'Trigger on Approval'
                });
              }
            }
          }
        });

        if (generateOptions.weeklyReports) {
          const pkgLower = (clientFormPkg || '').toLowerCase();
          let reportWeeks = 4;
          if (pkgLower.includes('3-month') || pkgLower.includes('3 month') || pkgLower.includes('3m')) {
            reportWeeks = 12;
          } else if (pkgLower.includes('6-month') || pkgLower.includes('6 month') || pkgLower.includes('6m')) {
            reportWeeks = 24;
          } else if (pkgLower.includes('yearly') || pkgLower.includes('1-year') || pkgLower.includes('annual')) {
            reportWeeks = 52;
          }

          const reportOffsets = Array.from({ length: reportWeeks }, (_, i) => (i + 1) * 7);
          reportOffsets.forEach((offset, index) => {
            tasksToCreate.push({
              taskTitle: `Weekly Report ${index + 1}`,
              assignTo: smStaff.assignTo,
              workingOn: smStaff.workingOn,
              postType: 'Report',
              date: getFormattedDate(offset)
            });
          });
        }
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

        const contentType = tasksRes.headers.get('content-type') || '';
        let tasksData = {};
        if (contentType.includes('application/json')) {
          tasksData = await tasksRes.json();
        }

        if (!tasksRes.ok) {
          showToast(tasksData.error || "Failed to generate tasks", "error");
          console.error("Failed to generate tasks:", tasksData.error || tasksRes.statusText);
        } else {
          showToast(`Generated ${tasksData.count || tasksToCreate.length} deliverable tasks!`);
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

  const parseDbDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return null;
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const monthName = parts[1];
      const year = parseInt(parts[2]);
      const months = {
        jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
        jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
      };
      const month = months[monthName.toLowerCase()];
      if (month !== undefined && !isNaN(day) && !isNaN(year)) {
        return new Date(year, month, day);
      }
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  };

  const getClientPlanStatus = (client) => {
    const start = parseDbDate(client.joiningDate);
    if (!start) return { status: 'Unknown', daysLeft: 0, expiringSoonDay: 0, overdueDays: 0, displayText: 'Unknown', expiryDateStr: '' };
    
    const expiry = new Date(start);
    expiry.setDate(expiry.getDate() + 30); // 30-day cycle
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);
    
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const daysPassed = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const expiryDateStr = expiry.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');
    
    if (diffDays <= 0) {
      const overdueDays = Math.abs(diffDays) + 1;
      return { 
        status: 'Expired', 
        daysLeft: diffDays, 
        expiringSoonDay: 0,
        overdueDays: overdueDays,
        displayText: `Overdue (${overdueDays})`,
        expiryDateStr 
      };
    } else if (daysPassed >= 22) {
      const expiringSoonDay = daysPassed - 21;
      return { 
        status: 'Expiring Soon', 
        daysLeft: diffDays, 
        expiringSoonDay: expiringSoonDay,
        overdueDays: 0,
        displayText: `Expiring Soon (${expiringSoonDay})`,
        expiryDateStr 
      };
    }
    return { status: 'Active', daysLeft: diffDays, expiringSoonDay: 0, overdueDays: 0, displayText: 'Active', expiryDateStr };
  };

  const handleRenewClientPlan = async (clientDbId, bizName) => {
    if (!confirm(`Are you sure you want to renew the plan for "${bizName}"? Setup/onboarding tasks will be skipped; only content deliverables (Creatives, Reels, AI Videos, Weekly Reports) will be generated for the new 30-day cycle.`)) return;
    
    setFormLoading(true);
    try {
      const res = await fetch(`/api/clients/${clientDbId}/renew`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to renew plan');
      
      showToast(`Plan successfully renewed for ${bizName}! ${data.taskCount} content tasks generated starting from ${data.newJoiningDate}.`);
      await refreshData();
    } catch (err) {
      alert(err.message);
    } finally {
      setFormLoading(false);
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

  const handleClearAllDeliveries = async () => {
    if (!confirm('Are you sure you want to delete ALL campaign delivery records from the database? This action cannot be undone.')) return;
    setFormLoading(true);
    try {
      const res = await fetch('/api/client-deliveries', { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to clear deliveries');
      showToast(data.message || 'All campaign deliveries cleared successfully!');
      await refreshData();
    } catch (err) {
      alert(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleFileUpload = async (e, setter) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setFormLoading(true);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setter(data.fileUrl);
        showToast('File uploaded successfully!');
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (err) {
      alert('Upload failed');
    } finally {
      setFormLoading(false);
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
    setFormDept('Social Media Marketing');
    setFormAvatar('👤');
    setFormStatus('ACTIVE');
    setFormError('');
    setFormAddress('');
    setFormDob('');
    setFormExp('');
    setFormDesignation('');
    setFormMobile('');
    setFormLastSalary('');
    setFormDateOfJoining('');
    setPassportPhoto('');
    setAadharCard('');
    setPanCard('');
    setMarksheet10('');
    setMarksheet12('');
    setGraduation('');
    setOtherDoc('');
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
    setFormAddress(user.address || '');
    setFormDob(user.dob || '');
    setFormExp(user.exp || '');
    setFormDesignation(user.designation || '');
    setFormMobile(user.mobile || '');
    setFormLastSalary(user.lastSalary || '');
    setFormDateOfJoining(user.dateOfJoining || '');
    setPassportPhoto(user.passportPhoto || '');
    setAadharCard(user.aadharCard || '');
    setPanCard(user.panCard || '');
    setMarksheet10(user.marksheet10 || '');
    setMarksheet12(user.marksheet12 || '');
    setGraduation(user.graduation || '');
    setOtherDoc(user.otherDoc || '');
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
          avatar: formAvatar,
          address: formAddress,
          dob: formDob,
          exp: formExp,
          designation: formDesignation,
          mobile: formMobile,
          lastSalary: formLastSalary,
          dateOfJoining: formDateOfJoining,
          passportPhoto,
          aadharCard,
          panCard,
          marksheet10,
          marksheet12,
          graduation,
          otherDoc
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
          status: formStatus,
          address: formAddress,
          dob: formDob,
          exp: formExp,
          designation: formDesignation,
          mobile: formMobile,
          lastSalary: formLastSalary,
          dateOfJoining: formDateOfJoining,
          passportPhoto,
          aadharCard,
          panCard,
          marksheet10,
          marksheet12,
          graduation,
          otherDoc
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

  const expiringClientsList = clientsList.filter(client => {
    if (!client.active) return false;
    const { status } = getClientPlanStatus(client);
    return status === 'Expired' || status === 'Expiring Soon';
  });
  const expiringCount = expiringClientsList.length;

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
              Task Manager
            </button>

            <button
              onClick={() => setActiveTab('feedback')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === 'feedback'
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Client Feedback
              {feedbacksList.filter(f => f.status === 'Pending').length > 0 && (
                <span className="ml-auto w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold animate-pulse">
                  {feedbacksList.filter(f => f.status === 'Pending').length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('pending-payments')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === 'pending-payments'
                  ? 'bg-amber-50 dark:bg-amber-955/40 text-amber-700 dark:text-amber-400 font-extrabold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4 text-amber-500" />
              <span>Pending Payments</span>
              {(() => {
                const overdueCount = clientsList.filter(c => getClientPaymentInfo(c).isOverdue7Days).length;
                const totalPendingCount = clientsList.filter(c => getClientPaymentInfo(c).isPartial).length;
                if (overdueCount > 0) {
                  return (
                    <span className="ml-auto px-1.5 py-0.5 bg-red-600 text-white rounded-full text-[10px] font-black animate-pulse">
                      {overdueCount} Due
                    </span>
                  );
                }
                if (totalPendingCount > 0) {
                  return (
                    <span className="ml-auto px-1.5 py-0.5 bg-amber-500 text-white rounded-full text-[10px] font-bold">
                      {totalPendingCount}
                    </span>
                  );
                }
                return null;
              })()}
            </button>

            <button
              onClick={() => setActiveTab('renewals')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === 'renewals'
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${expiringCount > 0 ? 'animate-spin-slow text-orange-500' : ''}`} />
              Renew Plan
              {expiringCount > 0 && (
                <span className="ml-auto w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold animate-pulse">
                  {expiringCount}
                </span>
              )}
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
              className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-md rounded-xl flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs hover:shadow-md transition-all duration-300 transform active:scale-95 cursor-pointer"
              title="Toggle Dark / Light Mode"
            >
              {darkMode ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                  <span className="text-[11px] font-semibold text-amber-300">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-600 fill-slate-600/20" />
                  <span className="text-[11px] font-semibold text-slate-600">Dark Mode</span>
                </>
              )}
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
              {expiringCount > 0 && (
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-amber-955/20 dark:to-orange-955/20 border border-orange-200 dark:border-orange-900/60 p-4 rounded-2xl flex items-center justify-between gap-4 shadow-sm animate-pulse-soft">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Plan Renewals Required!</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {expiringCount} client plan(s) have expired or are expiring soon.
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveTab('renewals')}
                    className="py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-orange-500/20 whitespace-nowrap shrink-0"
                  >
                    View Renewals
                  </button>
                </div>
              )}

              {/* 7-Day Partial Payment Overdue Alert Banner */}
              {(() => {
                const overdue7DayClients = clientsList.filter(c => getClientPaymentInfo(c).isOverdue7Days);
                if (overdue7DayClients.length === 0) return null;
                return (
                  <div className="bg-gradient-to-r from-red-50 to-amber-50 dark:from-red-955/30 dark:to-amber-955/20 border border-red-200 dark:border-red-900/60 p-4 rounded-2xl flex items-center justify-between gap-4 shadow-sm animate-pulse-soft">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                          Remaining Payment Follow-up Required! (7-Day Window Elapsed)
                          <span className="px-2 py-0.5 bg-red-600 text-white text-[9px] font-black rounded-full uppercase">
                            {overdue7DayClients.length} Action Needed
                          </span>
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                          7 days have passed since half payment. Please contact {overdue7DayClients.map(c => c.businessName).join(', ')} to collect remaining rupees.
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setActiveTab('pending-payments')}
                      className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-red-500/20 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Collect Remaining Payment →
                    </button>
                  </div>
                );
              })()}
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
                    {tasksList.filter(task => activeClientIds.has(task.clientId)).length === 0 ? (
                      <p className="text-sm text-slate-400">No active tasks found.</p>
                    ) : (
                      tasksList.filter(task => activeClientIds.has(task.clientId)).slice(0, 4).map((task) => (
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
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10 shrink-0 transition"
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
                            <button 
                              onClick={() => { setSelectedUser(user); setShowViewUserModal(true); }} 
                              className="text-blue-600 dark:text-blue-400 font-extrabold hover:underline text-left text-xs"
                            >
                              {user.name}
                            </button>
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
                              <div>
                                {task.postType === 'Posting' || (task.taskTitle && task.taskTitle.toLowerCase().startsWith('post ')) ? (
                                  <span className="text-amber-600 dark:text-amber-400 font-extrabold text-[10px]">Trigger on Approval (24h)</span>
                                ) : (
                                  task.date
                                )}
                              </div>
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

          {/* TAB: CLIENT FEEDBACK & CONCERNS */}
          {activeTab === 'feedback' && (
            <div className="space-y-6 animate-fade-in text-xs">
              
              {/* Stats Summary cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">Total Submissions</span>
                  <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">{feedbacksList.length}</div>
                  <span className="text-[9px] text-slate-400 font-medium">All reviews and concerns received</span>
                </div>
                
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col gap-1 border-l-4 border-l-red-500">
                  <span className="text-[10px] text-red-500 font-extrabold uppercase tracking-wider">Pending Work Concerns</span>
                  <div className="text-xl font-bold text-red-655 dark:text-red-400 mt-1">
                    {feedbacksList.filter(f => f.type === 'Concern' && f.status === 'Pending').length}
                  </div>
                  <span className="text-[9px] text-slate-400 font-medium">Urgent issues needing response</span>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col gap-1 border-l-4 border-l-emerald-500">
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-500 font-extrabold uppercase tracking-wider">Client Feedback Reviews</span>
                  <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    {feedbacksList.filter(f => f.type === 'Feedback').length}
                  </div>
                  <span className="text-[9px] text-slate-400 font-medium">Average Rating: {(
                    feedbacksList.filter(f => f.type === 'Feedback' && f.rating).reduce((acc, curr) => acc + curr.rating, 0) / 
                    (feedbacksList.filter(f => f.type === 'Feedback' && f.rating).length || 1)
                  ).toFixed(1)} ★</span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex items-center w-full max-w-md">
                  <Search className="absolute left-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={feedbackAdminSearch}
                    onChange={(e) => setFeedbackAdminSearch(e.target.value)}
                    placeholder="Search by client name, client ID, or message..."
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl focus:outline-none focus:border-blue-600 text-xs transition"
                  />
                </div>

                <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                  {[
                    { key: 'All', label: 'All Submissions' },
                    { key: 'Concern', label: 'Work Concerns' },
                    { key: 'Feedback', label: 'Reviews / Feedbacks' },
                    { key: 'Pending', label: 'Pending Action' },
                    { key: 'Reviewed', label: 'Reviewed' }
                  ].map(f => (
                    <button
                      key={f.key}
                      onClick={() => setFeedbackAdminFilter(f.key)}
                      className={`px-3.5 py-1.5 rounded-lg text-[9px] font-bold uppercase transition cursor-pointer ${
                        feedbackAdminFilter === f.key
                          ? 'bg-blue-650 text-white shadow-sm shadow-blue-500/10'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-slate-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main List */}
              <div className="grid grid-cols-1 gap-6">
                {feedbacksList
                  .filter(fb => {
                    const q = feedbackAdminSearch.toLowerCase();
                    const matchesSearch = 
                      fb.businessName.toLowerCase().includes(q) ||
                      fb.clientId.toLowerCase().includes(q) ||
                      fb.message.toLowerCase().includes(q);
                    
                    if (!matchesSearch) return false;
                    
                    if (feedbackAdminFilter === 'All') return true;
                    if (feedbackAdminFilter === 'Concern') return fb.type === 'Concern';
                    if (feedbackAdminFilter === 'Feedback') return fb.type === 'Feedback';
                    if (feedbackAdminFilter === 'Pending') return fb.status === 'Pending';
                    if (feedbackAdminFilter === 'Reviewed') return fb.status === 'Reviewed';
                    return true;
                  }).length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center text-slate-400 border border-slate-200 dark:border-slate-800 italic">
                      No client feedbacks or concerns match the active filter criteria.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {feedbacksList
                        .filter(fb => {
                          const q = feedbackAdminSearch.toLowerCase();
                          const matchesSearch = 
                            fb.businessName.toLowerCase().includes(q) ||
                            fb.clientId.toLowerCase().includes(q) ||
                            fb.message.toLowerCase().includes(q);
                          
                          if (!matchesSearch) return false;
                          
                          if (feedbackAdminFilter === 'All') return true;
                          if (feedbackAdminFilter === 'Concern') return fb.type === 'Concern';
                          if (feedbackAdminFilter === 'Feedback') return fb.type === 'Feedback';
                          if (feedbackAdminFilter === 'Pending') return fb.status === 'Pending';
                          if (feedbackAdminFilter === 'Reviewed') return fb.status === 'Reviewed';
                          return true;
                        })
                        .map(fb => {
                          const isConcern = fb.type === 'Concern';
                          const isPending = fb.status === 'Pending';
                          const dateObj = new Date(fb.createdAt);
                          
                          return (
                            <div 
                              key={fb.id} 
                              className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border shadow-sm flex flex-col justify-between gap-4 transition-all hover:shadow-md ${
                                isConcern 
                                  ? isPending 
                                    ? 'border-red-200 dark:border-red-900/60 bg-red-50/5 dark:bg-red-955/5' 
                                    : 'border-slate-200 dark:border-slate-800'
                                  : 'border-slate-200 dark:border-slate-800'
                              }`}
                            >
                              <div className="space-y-3">
                                <div className="flex justify-between items-start gap-2">
                                  <div>
                                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{fb.businessName}</h4>
                                    <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">ID: {fb.clientId} | Rep: {fb.clientName || 'N/A'}</p>
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                      isConcern 
                                        ? 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-450 border border-red-205 dark:border-red-900/50' 
                                        : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-450 border border-emerald-205 dark:border-emerald-900/40'
                                    }`}>
                                      {fb.type}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${
                                      isPending 
                                        ? 'bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-450 border border-orange-205 dark:border-orange-900/40 animate-pulse' 
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                    }`}>
                                      {fb.status}
                                    </span>
                                  </div>
                                </div>

                                {/* Stars for feedback */}
                                {!isConcern && fb.rating && (
                                  <div className="flex items-center text-amber-500 text-xs">
                                    {Array.from({ length: 5 }).map((_, idx) => (
                                      <span key={idx}>{idx < fb.rating ? '★' : '☆'}</span>
                                    ))}
                                  </div>
                                )}

                                <p className="text-slate-700 dark:text-slate-350 font-medium whitespace-pre-wrap leading-relaxed text-[10.5px]">
                                  {fb.message}
                                </p>
                              </div>

                              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 mt-2 flex items-center justify-between">
                                <span className="text-[9px] text-slate-400 font-semibold">
                                  Submitted: {dateObj.toLocaleDateString()} {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                
                                {isPending && (
                                  <button
                                    onClick={() => handleMarkFeedbackReviewed(fb.id)}
                                    disabled={formLoading}
                                    className="py-1 px-3 bg-blue-50 hover:bg-blue-100 dark:bg-blue-955/40 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-900/50 text-blue-700 dark:text-blue-400 font-bold rounded-lg transition text-[9px] cursor-pointer disabled:opacity-50"
                                  >
                                    Mark Reviewed
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      }
                    </div>
                  )
                }
              </div>

            </div>
          )}

          {/* TAB: PENDING PAYMENTS */}
          {activeTab === 'pending-payments' && (
            <div className="space-y-6 animate-fade-in text-xs">
              
              {/* Top Metrics Cards */}
              {(() => {
                const pendingClients = clientsList.filter(c => getClientPaymentInfo(c).isPartial);
                const overdue7Clients = pendingClients.filter(c => getClientPaymentInfo(c).isOverdue7Days);
                const totalPendingBalance = pendingClients.reduce((sum, c) => sum + getClientPaymentInfo(c).pendingBalance, 0);
                const totalReceived = clientsList.reduce((sum, c) => sum + getClientPaymentInfo(c).paidAmount, 0);

                return (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col gap-1">
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Clients with Pending Balance</span>
                      <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">{pendingClients.length}</div>
                      <span className="text-[9px] text-slate-400 font-medium">Partial / Half payment accounts</span>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 p-5 rounded-2xl shadow-sm flex flex-col gap-1 bg-amber-50/30 dark:bg-amber-955/10">
                      <span className="text-[10px] text-amber-700 dark:text-amber-400 font-extrabold uppercase tracking-wider">Total Remaining Rupees Due</span>
                      <div className="text-xl font-black text-amber-700 dark:text-amber-400 mt-1">₹{totalPendingBalance.toLocaleString()}</div>
                      <span className="text-[9px] text-amber-600/80 dark:text-amber-400/80 font-medium">Uncollected package balance</span>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 p-5 rounded-2xl shadow-sm flex flex-col gap-1 bg-red-50/30 dark:bg-red-955/10">
                      <span className="text-[10px] text-red-600 dark:text-red-400 font-extrabold uppercase tracking-wider">7-Day Overdue Follow-ups</span>
                      <div className="text-xl font-black text-red-600 dark:text-red-400 mt-1">{overdue7Clients.length}</div>
                      <span className="text-[9px] text-red-600/80 dark:text-red-400/80 font-medium">7 days elapsed since payment</span>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col gap-1">
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Total Received Revenue</span>
                      <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">₹{totalReceived.toLocaleString()}</div>
                      <span className="text-[9px] text-slate-400 font-medium">Total payments collected</span>
                    </div>
                  </div>
                );
              })()}

              {/* Toolbar */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
                <div className="relative flex items-center w-full max-w-md">
                  <Search className="absolute left-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={paymentTabSearch}
                    onChange={(e) => setPaymentTabSearch(e.target.value)}
                    placeholder="Search business, name, ID, contact..."
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl focus:outline-none focus:border-blue-600 text-xs transition"
                  />
                </div>

                <div className="flex items-center gap-2">
                  {['All', 'Overdue7', 'Within7'].map(mode => (
                    <button
                      key={mode}
                      onClick={() => setPaymentTabFilter(mode)}
                      className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] transition ${
                        paymentTabFilter === mode
                          ? mode === 'Overdue7' ? 'bg-red-600 text-white shadow' : 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {mode === 'All' ? 'All Pending' : mode === 'Overdue7' ? '⚠️ 7-Day Overdue' : '⏳ Within 7 Days'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pending Payments Table */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase tracking-wider">
                        <th className="p-4">Client / Business</th>
                        <th className="p-4">Contact Info</th>
                        <th className="p-4">Package & Services</th>
                        <th className="p-4">Total Price</th>
                        <th className="p-4">Paid (Received)</th>
                        <th className="p-4">Remaining Rupees Due</th>
                        <th className="p-4">Joining / Payment Date</th>
                        <th className="p-4">7-Day Alert Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {(() => {
                        const list = clientsList
                          .filter(c => getClientPaymentInfo(c).isPartial)
                          .filter(c => {
                            const info = getClientPaymentInfo(c);
                            if (paymentTabFilter === 'Overdue7') return info.isOverdue7Days;
                            if (paymentTabFilter === 'Within7') return !info.isOverdue7Days;
                            return true;
                          })
                          .filter(c => {
                            if (!paymentTabSearch) return true;
                            const q = paymentTabSearch.toLowerCase();
                            return (
                              c.businessName.toLowerCase().includes(q) ||
                              c.clientId.toLowerCase().includes(q) ||
                              (c.clientName && c.clientName.toLowerCase().includes(q)) ||
                              (c.contact && c.contact.toLowerCase().includes(q))
                            );
                          });

                        if (list.length === 0) {
                          return (
                            <tr>
                              <td colSpan="9" className="p-8 text-center text-slate-400 italic">No pending payment accounts match the current filter.</td>
                            </tr>
                          );
                        }

                        return list.map(client => {
                          const info = getClientPaymentInfo(client);
                          return (
                            <tr key={`pay-${client.id}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40 transition text-slate-700 dark:text-slate-300">
                              <td className="p-4 font-bold">
                                <div className="text-slate-900 dark:text-white">{client.businessName}</div>
                                <div className="text-[9px] text-slate-400 font-semibold mt-0.5">ID: {client.clientId} | Person: {client.clientName || 'N/A'}</div>
                              </td>
                              <td className="p-4">
                                <div className="font-semibold">{client.contact || 'No Phone'}</div>
                                <div className="text-[9px] text-slate-400">{client.email || 'No Email'}</div>
                              </td>
                              <td className="p-4">
                                <div className="font-bold text-blue-650 dark:text-blue-400">{client.packageName}</div>
                                <div className="text-[9px] text-slate-400">{client.services}</div>
                              </td>
                              <td className="p-4 font-bold text-slate-900 dark:text-white">
                                ₹{info.totalAmount.toLocaleString()}
                              </td>
                              <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">
                                ₹{info.paidAmount.toLocaleString()}
                              </td>
                              <td className="p-4 font-black text-red-600 dark:text-red-400 text-sm">
                                ₹{info.pendingBalance.toLocaleString()}
                              </td>
                              <td className="p-4 font-semibold text-slate-600 dark:text-slate-400">
                                {client.joiningDate}
                              </td>
                              <td className="p-4">
                                {info.isOverdue7Days ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black bg-red-100 text-red-700 dark:bg-red-955/50 dark:text-red-400 border border-red-300 dark:border-red-900/60 animate-pulse">
                                    ⚠️ 7-Day Overdue ({info.daysPassed} days)
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-955/40 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/50">
                                    ⏳ Day {info.daysPassed} of 7
                                  </span>
                                )}
                              </td>
                              <td className="p-4 text-right space-x-2">
                                <button
                                  onClick={() => handleMarkFullyPaid(client)}
                                  disabled={formLoading}
                                  className="py-1.5 px-3 rounded-xl text-[10px] font-bold transition inline-flex items-center gap-1 shadow-sm disabled:opacity-50 bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/10 cursor-pointer"
                                >
                                  <span>Mark Fully Paid</span>
                                </button>
                              </td>
                            </tr>
                          );
                        });
                      })()}
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
                <button
                  onClick={handleClearAllDeliveries}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 font-bold rounded-xl text-xs transition"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All Deliveries
                </button>
              </div>

              {/* Global Deliveries Table */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase tracking-wider">
                        <th className="p-4">Date & Task ID</th>
                        <th className="p-4">Client Name</th>
                        <th className="p-4">Post Type</th>
                        <th className="p-4">Staff Member</th>
                        <th className="p-4">Status</th>
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
                            <td className="p-4 font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                              <div className="flex items-center gap-1.5 text-xs">
                                <span>{delivery.postDate}</span>
                                {delivery.linkedTaskId || delivery.deliveryId ? (
                                  <button
                                    onClick={() => {
                                      const client = clientsList.find(c => c.clientId === delivery.clientId);
                                      if (client) {
                                        setSelectedClient(client);
                                        setShowClientDetailModal(true);
                                        refreshClientTasks(client.id);
                                        const taskIdToFind = delivery.linkedTaskId || delivery.deliveryId;
                                        const matchingTask = allClientTasks.find(t => t.taskId === taskIdToFind);
                                        if (matchingTask) {
                                          resetClientTaskForm(matchingTask);
                                        }
                                      }
                                    }}
                                    className="text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline"
                                    title={delivery.linkedTaskId || delivery.deliveryId}
                                  >
                                    ({delivery.linkedTaskId || delivery.deliveryId})
                                  </button>
                                ) : null}
                              </div>
                            </td>
                            <td className="p-4 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
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
                                <span className="text-[9px] text-slate-400 font-semibold">({delivery.clientId})</span>
                              </div>
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
                            <td className="p-4 text-slate-500 font-medium max-w-xs truncate" title={delivery.notes}>
                              {(delivery.notes && delivery.notes !== delivery.deliveryId && delivery.notes !== delivery.linkedTaskId && !delivery.notes.startsWith('AID-T-')) ? delivery.notes : '-'}
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
          
          {/* TAB: PLAN RENEWALS */}
          {activeTab === 'renewals' && (
            <div className="space-y-6 animate-fade-in text-xs">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Renew Plan</h4>
                  <p className="text-xs text-slate-400 mt-1">Review active plan cycles, view expiring contracts, and renew subscription plans for clients.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-355 text-[10px] font-bold rounded-lg border border-slate-200/60 dark:border-slate-700">
                    Expired/Expiring: <span className="text-orange-500 font-extrabold">{expiringCount}</span>
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                
                {/* Search and Filters Bar */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  {/* Status Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: 'All', label: 'All Contracts', count: clientsList.filter(c => c.active).length },
                      { key: 'Expired', label: 'Expired (Renewal Due)', count: clientsList.filter(c => c.active && getClientPlanStatus(c).status === 'Expired').length, color: 'text-red-500 bg-red-50 dark:bg-red-950/20' },
                      { key: 'Expiring Soon', label: 'Expiring Soon (Days 23–30)', count: clientsList.filter(c => c.active && getClientPlanStatus(c).status === 'Expiring Soon').length, color: 'text-orange-500 bg-orange-50 dark:bg-orange-955/20' },
                      { key: 'Active', label: 'Active (Days 1–22)', count: clientsList.filter(c => c.active && getClientPlanStatus(c).status === 'Active').length, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-955/20' }
                    ].map(btn => (
                      <button
                        key={btn.key}
                        onClick={() => setRenewalFilter(btn.key)}
                        className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                          renewalFilter === btn.key
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                        }`}
                      >
                        <span>{btn.label}</span>
                        <span className={`px-1.5 py-0.5 text-[8px] rounded-md font-black
                          ${renewalFilter === btn.key 
                            ? 'bg-white/20 text-white' 
                            : btn.color || 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
                        >
                          {btn.count}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Search input field */}
                  <div className="relative w-full md:w-72 shrink-0">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Search className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      placeholder="Search business or client name..."
                      value={renewalSearch}
                      onChange={(e) => setRenewalSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                    {renewalSearch && (
                      <button
                        onClick={() => setRenewalSearch('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-655"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  
                </div>

                <div className="overflow-x-auto p-4 space-y-6">
                  {/* Expired / Overdue Contracts Table (Renewal Required) */}
                  {(renewalFilter === 'All' || renewalFilter === 'Expired') && (
                    <div className="border border-red-200 dark:border-red-900/50 rounded-xl overflow-hidden shadow-sm">
                      <div className="p-3 bg-red-50/70 dark:bg-red-950/30 border-b border-red-200 dark:border-red-900/50 flex justify-between items-center">
                        <div>
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-red-700 dark:text-red-400 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            Expired Contracts — Renewal Required (Post 30-Day Cycle)
                          </span>
                          <p className="text-[10px] text-red-600/80 dark:text-red-300/70 font-medium mt-0.5">30-day cycle completed. Renewal starts on Day 31 (next day after Day 30).</p>
                        </div>
                        <span className="px-2 py-0.5 bg-red-600 text-white text-[8px] font-bold rounded uppercase tracking-wider shadow-sm">
                          Renewal Required
                        </span>
                      </div>
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50/50 dark:bg-slate-800/20 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800 text-[9px] uppercase tracking-wider">
                            <th className="p-4">Business / Client Name</th>
                            <th className="p-4">Current Cycle Date</th>
                            <th className="p-4">Expiry Date (30 Days Completed)</th>
                            <th className="p-4">Overdue Days</th>
                            <th className="p-4">Active Plan Services</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {(() => {
                            const list = clientsList
                              .filter(c => c.active)
                              .filter(c => getClientPlanStatus(c).status === 'Expired')
                              .filter(c => {
                                if (!renewalSearch) return true;
                                const q = renewalSearch.toLowerCase();
                                return c.businessName.toLowerCase().includes(q) || c.clientId.toLowerCase().includes(q);
                              });

                            if (list.length === 0) {
                              return (
                                <tr>
                                  <td colSpan="7" className="p-8 text-center text-slate-400 italic">No expired contracts currently.</td>
                                </tr>
                              );
                            }

                            return list.map(client => {
                              const planStatus = getClientPlanStatus(client);
                              const { expiryDateStr, overdueDays, displayText } = planStatus;
                              return (
                                <tr key={`renew-${client.id}`} className="hover:bg-red-50/30 dark:hover:bg-red-950/20 transition text-slate-700 dark:text-slate-300">
                                  <td className="p-4">
                                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                      {client.businessName}
                                      <span className="px-1.5 py-0.5 bg-red-600 text-white text-[7px] font-black rounded uppercase tracking-widest shrink-0">
                                        EXPIRED
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-slate-400 mt-0.5">ID: {client.clientId} | Person: {client.clientName || 'N/A'}</div>
                                  </td>
                                  <td className="p-4 font-semibold">{client.joiningDate}</td>
                                  <td className="p-4 font-semibold">{expiryDateStr || 'N/A'}</td>
                                  <td className="p-4 font-bold">
                                    <span className="text-red-500 font-extrabold">Overdue ({overdueDays})</span>
                                  </td>
                                  <td className="p-4">
                                    <div className="font-bold text-blue-650 dark:text-blue-400">{client.services}</div>
                                    <div className="text-[9px] text-slate-450 mt-0.5">{client.packageName}</div>
                                  </td>
                                  <td className="p-4">
                                    <span className="inline-block px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-red-100 text-red-800 dark:bg-red-955/40 dark:text-red-400 border border-red-200 dark:border-red-900/45">
                                      {displayText}
                                    </span>
                                  </td>
                                  <td className="p-4 text-right">
                                    <button
                                      onClick={() => handleRenewClientPlan(client.id, client.businessName)}
                                      disabled={formLoading}
                                      className="py-1.5 px-3 rounded-lg text-[10px] font-bold transition flex items-center gap-1 shadow-sm disabled:opacity-50 ml-auto bg-red-600 hover:bg-red-700 text-white shadow-red-500/10 cursor-pointer"
                                    >
                                      <RefreshCw className={`w-3 h-3 ${formLoading ? 'animate-spin' : ''}`} />
                                      <span>Renew Plan Now</span>
                                    </button>
                                  </td>
                                </tr>
                              );
                            });
                          })()}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Expiring Soon Notice Table (Active Contracts Days 23 to 30) */}
                  {(renewalFilter === 'All' || renewalFilter === 'Expiring Soon') && (
                    <div className="border border-orange-200 dark:border-orange-900/50 rounded-xl overflow-hidden shadow-sm">
                      <div className="p-3 bg-orange-50/70 dark:bg-orange-955/30 border-b border-orange-200 dark:border-orange-900/50 flex justify-between items-center">
                        <div>
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-orange-700 dark:text-orange-400 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                            Expiring Soon Notice — Active Contracts (Days 23–30 of 30)
                          </span>
                          <p className="text-[10px] text-orange-600/80 dark:text-orange-300/70 font-medium mt-0.5">Plan remains active through Day 30. Renewal starts on Day 31 (next day after Day 30).</p>
                        </div>
                        <span className="px-2 py-0.5 bg-orange-500 text-white text-[8px] font-bold rounded uppercase tracking-wider">
                          Final Week Notice
                        </span>
                      </div>
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50/50 dark:bg-slate-800/20 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800 text-[9px] uppercase tracking-wider">
                            <th className="p-4">Business / Client Name</th>
                            <th className="p-4">Current Cycle Date</th>
                            <th className="p-4">Expected End Date (Day 30)</th>
                            <th className="p-4">Expiring Soon Countdown</th>
                            <th className="p-4">Active Plan Services</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {(() => {
                            const list = clientsList
                              .filter(c => c.active)
                              .filter(c => getClientPlanStatus(c).status === 'Expiring Soon')
                              .filter(c => {
                                if (!renewalSearch) return true;
                                const q = renewalSearch.toLowerCase();
                                return c.businessName.toLowerCase().includes(q) || c.clientId.toLowerCase().includes(q);
                              });

                            if (list.length === 0) {
                              return (
                                <tr>
                                  <td colSpan="7" className="p-8 text-center text-slate-400 italic">No contracts currently in expiring soon notice (Days 23–30).</td>
                                </tr>
                              );
                            }

                            return list.map(client => {
                              const planStatus = getClientPlanStatus(client);
                              const { expiryDateStr, expiringSoonDay, displayText } = planStatus;
                              return (
                                <tr key={`expiring-${client.id}`} className="hover:bg-orange-50/30 dark:hover:bg-orange-955/20 transition text-slate-700 dark:text-slate-300">
                                  <td className="p-4">
                                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                      {client.businessName}
                                      <span className="px-1.5 py-0.5 bg-orange-500 text-white text-[7px] font-black rounded uppercase tracking-widest shrink-0">
                                        EXPIRING SOON
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-slate-400 mt-0.5">ID: {client.clientId} | Person: {client.clientName || 'N/A'}</div>
                                  </td>
                                  <td className="p-4 font-semibold">{client.joiningDate}</td>
                                  <td className="p-4 font-semibold">{expiryDateStr || 'N/A'}</td>
                                  <td className="p-4 font-bold">
                                    <span className="text-orange-500 font-extrabold">Expiring Soon ({expiringSoonDay})</span>
                                  </td>
                                  <td className="p-4">
                                    <div className="font-bold text-blue-650 dark:text-blue-400">{client.services}</div>
                                    <div className="text-[9px] text-slate-450 mt-0.5">{client.packageName}</div>
                                  </td>
                                  <td className="p-4">
                                    <span className="inline-block px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-orange-100 text-orange-850 dark:bg-orange-955/40 dark:text-orange-400 border border-orange-200 dark:border-orange-900/45">
                                      {displayText}
                                    </span>
                                  </td>
                                  <td className="p-4 text-right">
                                    <span className="inline-block px-2.5 py-1 rounded-lg text-[9px] font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/40">
                                      Active (Renewal on Day 31)
                                    </span>
                                  </td>
                                </tr>
                              );
                            });
                          })()}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Active Contracts Table (Days 1 to 22) */}
                  {(renewalFilter === 'All' || renewalFilter === 'Active') && (
                    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                      <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-655">
                          Active Client Contracts (Ongoing)
                        </span>
                      </div>
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50/50 dark:bg-slate-800/20 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800 text-[9px] uppercase tracking-wider">
                            <th className="p-4">Business / Client Name</th>
                            <th className="p-4">Current Cycle Date</th>
                            <th className="p-4">Calculated Expiry Date</th>
                            <th className="p-4">Days Remaining</th>
                            <th className="p-4">Active Plan Services</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {(() => {
                            const list = clientsList
                              .filter(c => c.active)
                              .filter(c => getClientPlanStatus(c).status === 'Active')
                              .filter(c => {
                                if (!renewalSearch) return true;
                                const q = renewalSearch.toLowerCase();
                                return c.businessName.toLowerCase().includes(q) || c.clientId.toLowerCase().includes(q);
                              });

                            if (list.length === 0) {
                              return (
                                <tr>
                                  <td colSpan="7" className="p-8 text-center text-slate-400 italic">No active contracts found.</td>
                                </tr>
                              );
                            }

                            return list.map(client => {
                              const { status, daysLeft, expiryDateStr } = getClientPlanStatus(client);
                              return (
                                <tr key={`active-${client.id}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40 transition text-slate-700 dark:text-slate-300">
                                  <td className="p-4">
                                    <div className="font-bold text-slate-900 dark:text-white">{client.businessName}</div>
                                    <div className="text-[10px] text-slate-400 mt-0.5">ID: {client.clientId} | Person: {client.clientName || 'N/A'}</div>
                                  </td>
                                  <td className="p-4 font-semibold">{client.joiningDate}</td>
                                  <td className="p-4 font-semibold">{expiryDateStr || 'N/A'}</td>
                                  <td className="p-4 font-bold">
                                    <span className="text-slate-600 dark:text-slate-400">{daysLeft} day(s) left</span>
                                  </td>
                                  <td className="p-4">
                                    <div className="font-bold text-blue-650 dark:text-blue-400">{client.services}</div>
                                    <div className="text-[9px] text-slate-455 mt-0.5">{client.packageName}</div>
                                  </td>
                                  <td className="p-4">
                                    <span className="inline-block px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-955/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/45">
                                      Active Plan
                                    </span>
                                  </td>
                                  <td className="p-4 text-right">
                                    <span className="inline-block px-2.5 py-1 rounded-lg text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-955/30 border border-emerald-200 dark:border-emerald-900/40">
                                      Plan Active
                                    </span>
                                  </td>
                                </tr>
                              );
                            });
                          })()}
                        </tbody>
                      </table>
                    </div>
                  )}
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

      {/* --- VIEW USER MODAL --- */}
      {showViewUserModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden animate-scale-up max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900 shrink-0">
              <h3 className="font-extrabold text-sm text-slate-950 dark:text-white flex items-center gap-2">
                <span>{selectedUser.avatar || '👤'}</span>
                {selectedUser.name}'s Profile
              </h3>
              <button onClick={() => setShowViewUserModal(false)} className="text-slate-400 hover:text-slate-600 transition text-sm">✕</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
              
              <div>
                <h4 className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">Basic & Account Info</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div><span className="text-slate-400 font-bold">Email:</span> <p className="font-semibold text-slate-900 dark:text-white">{selectedUser.email}</p></div>
                  <div><span className="text-slate-400 font-bold">Mobile:</span> <p className="font-semibold text-slate-900 dark:text-white">{selectedUser.mobile || 'N/A'}</p></div>
                  <div><span className="text-slate-400 font-bold">DOB:</span> <p className="font-semibold text-slate-900 dark:text-white">{selectedUser.dob || 'N/A'}</p></div>
                  <div className="col-span-full"><span className="text-slate-400 font-bold">Address:</span> <p className="font-semibold text-slate-900 dark:text-white">{selectedUser.address || 'N/A'}</p></div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">Employment Details</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div><span className="text-slate-400 font-bold">Department:</span> <p className="font-semibold text-slate-900 dark:text-white">{selectedUser.department}</p></div>
                  <div><span className="text-slate-400 font-bold">Designation:</span> <p className="font-semibold text-slate-900 dark:text-white">{selectedUser.designation || 'N/A'}</p></div>
                  <div><span className="text-slate-400 font-bold">Status:</span> <p className="font-semibold text-slate-900 dark:text-white">{selectedUser.status}</p></div>
                  <div><span className="text-slate-400 font-bold">Experience:</span> <p className="font-semibold text-slate-900 dark:text-white">{selectedUser.exp || 'N/A'}</p></div>
                  <div><span className="text-slate-400 font-bold">Last Salary:</span> <p className="font-semibold text-slate-900 dark:text-white">₹{selectedUser.lastSalary || 0}</p></div>
                  <div><span className="text-slate-400 font-bold">Date of Joining:</span> <p className="font-semibold text-slate-900 dark:text-white">{selectedUser.dateOfJoining || 'N/A'}</p></div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">Documents</h4>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Passport Photo', url: selectedUser.passportPhoto },
                    { label: 'Aadhar Card', url: selectedUser.aadharCard },
                    { label: 'PAN Card', url: selectedUser.panCard },
                    { label: '10th Marksheet', url: selectedUser.marksheet10 },
                    { label: '12th Marksheet', url: selectedUser.marksheet12 },
                    { label: 'Graduation / Degree', url: selectedUser.graduation },
                    { label: 'Other Document', url: selectedUser.otherDoc },
                  ].map((doc, idx) => (
                    <div key={idx} className="flex justify-between items-center border border-slate-200 dark:border-slate-800 p-3 rounded-lg">
                      <span className="font-bold text-slate-700 dark:text-slate-300">{doc.label}</span>
                      {doc.url ? (
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-800/40 dark:text-blue-400 px-3 py-1.5 rounded text-[10px] font-bold transition">
                          View Document
                        </a>
                      ) : (
                        <span className="text-slate-400 italic text-[10px]">Not provided</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* --- ADD USER MODAL --- */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden animate-scale-up max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900 shrink-0">
              <h3 className="font-extrabold text-sm text-slate-950 dark:text-white">Onboard Employee</h3>
              <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-slate-600 transition text-sm">✕</button>
            </div>
            
            <form onSubmit={handleAddUser} autoComplete="off" className="overflow-y-auto flex-1">
              <div className="p-6 space-y-6 text-xs">
                {formError && (
                  <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-705 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">Basic & Account Info</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Name *</label>
                      <input type="text" required value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. Charlie Brown" className="w-full p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Email Address *</label>
                      <input type="email" required value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="e.g. charlie@company.com" className="w-full p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Password *</label>
                      <input type="password" required value={formPassword} onChange={(e) => setFormPassword(e.target.value)} placeholder="e.g. EmpPass123" className="w-full p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Mobile No</label>
                      <input type="text" value={formMobile} onChange={(e) => setFormMobile(e.target.value)} placeholder="e.g. +91 9876543210" className="w-full p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Date of Birth</label>
                      <input type="date" value={formDob} onChange={(e) => setFormDob(e.target.value)} className="w-full p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Profile Emoji</label>
                      <input type="text" value={formAvatar} onChange={(e) => setFormAvatar(e.target.value)} placeholder="e.g. 👨‍💻" className="w-full p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white text-center focus:outline-none" />
                    </div>
                  </div>
                  <div className="space-y-1 mt-4">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Address</label>
                    <textarea value={formAddress} onChange={(e) => setFormAddress(e.target.value)} placeholder="Full address..." rows="2" className="w-full p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"></textarea>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">Employment Details</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Department</label>
                      <select value={formDept} onChange={(e) => setFormDept(e.target.value)} className="w-full p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none">
                        <option value="Social Media Marketing">Social Media Marketing</option>
                        <option value="Video Editing / Content Creator">Video Editing / Content Creator</option>
                        <option value="Graphics">Graphics</option>
                        <option value="Software Development">Software Development</option>
                        <option value="Sales">Sales</option>
                        <option value="HR">HR</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Designation</label>
                      <input type="text" value={formDesignation} onChange={(e) => setFormDesignation(e.target.value)} placeholder="e.g. Frontend Dev" className="w-full p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Experience</label>
                      <input type="text" value={formExp} onChange={(e) => setFormExp(e.target.value)} placeholder="e.g. 3 Years" className="w-full p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Last Salary</label>
                      <input type="number" value={formLastSalary} onChange={(e) => setFormLastSalary(e.target.value)} placeholder="e.g. 50000" className="w-full p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Date of Joining</label>
                      <input type="date" value={formDateOfJoining} onChange={(e) => setFormDateOfJoining(e.target.value)} className="w-full p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none" />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">Documents (Upload)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Passport Size Photo</label>
                      <input type="file" onChange={(e) => handleFileUpload(e, setPassportPhoto)} className="w-full text-slate-500" />
                      {passportPhoto && <span className="text-green-600 font-bold block mt-1">✓ Uploaded</span>}
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Aadhar Card</label>
                      <input type="file" onChange={(e) => handleFileUpload(e, setAadharCard)} className="w-full text-slate-500" />
                      {aadharCard && <span className="text-green-600 font-bold block mt-1">✓ Uploaded</span>}
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">PAN Card</label>
                      <input type="file" onChange={(e) => handleFileUpload(e, setPanCard)} className="w-full text-slate-500" />
                      {panCard && <span className="text-green-600 font-bold block mt-1">✓ Uploaded</span>}
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">10th Marksheet</label>
                      <input type="file" onChange={(e) => handleFileUpload(e, setMarksheet10)} className="w-full text-slate-500" />
                      {marksheet10 && <span className="text-green-600 font-bold block mt-1">✓ Uploaded</span>}
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">12th Marksheet</label>
                      <input type="file" onChange={(e) => handleFileUpload(e, setMarksheet12)} className="w-full text-slate-500" />
                      {marksheet12 && <span className="text-green-600 font-bold block mt-1">✓ Uploaded</span>}
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Graduation / Degree</label>
                      <input type="file" onChange={(e) => handleFileUpload(e, setGraduation)} className="w-full text-slate-500" />
                      {graduation && <span className="text-green-600 font-bold block mt-1">✓ Uploaded</span>}
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Other Docs (Rent Agreement etc.)</label>
                      <input type="file" onChange={(e) => handleFileUpload(e, setOtherDoc)} className="w-full text-slate-500" />
                      {otherDoc && <span className="text-green-600 font-bold block mt-1">✓ Uploaded</span>}
                    </div>
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
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden animate-scale-up max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900 shrink-0">
              <h3 className="font-extrabold text-sm text-slate-950 dark:text-white">Modify Employee Records</h3>
              <button onClick={() => setShowEditUserModal(false)} className="text-slate-400 hover:text-slate-600 transition text-sm">✕</button>
            </div>
            
            <form onSubmit={handleEditUser} autoComplete="off" className="overflow-y-auto flex-1">
              <div className="p-6 space-y-6 text-xs">
                {formError && (
                  <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-705 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">Basic & Account Info</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Name *</label>
                      <input type="text" required value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. Charlie Brown" className="w-full p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Email Address *</label>
                      <input type="email" required value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="e.g. charlie@company.com" className="w-full p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Update Password</label>
                      <input type="password" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} placeholder="(Leave blank to keep)" className="w-full p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none" autoComplete="new-password" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Mobile No</label>
                      <input type="text" value={formMobile} onChange={(e) => setFormMobile(e.target.value)} placeholder="e.g. +91 9876543210" className="w-full p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Date of Birth</label>
                      <input type="date" value={formDob} onChange={(e) => setFormDob(e.target.value)} className="w-full p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none" />
                    </div>
                    <div className="space-y-1 flex gap-2">
                      <div className="flex-1">
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Status</label>
                        <select value={formStatus} onChange={(e) => setFormStatus(e.target.value)} className="w-full p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none">
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="INACTIVE">INACTIVE</option>
                        </select>
                      </div>
                      <div className="w-16">
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Emoji</label>
                        <input type="text" value={formAvatar} onChange={(e) => setFormAvatar(e.target.value)} placeholder="👨‍💻" className="w-full p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white text-center focus:outline-none" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1 mt-4">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Address</label>
                    <textarea value={formAddress} onChange={(e) => setFormAddress(e.target.value)} placeholder="Full address..." rows="2" className="w-full p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"></textarea>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">Employment Details</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Department</label>
                      <select value={formDept} onChange={(e) => setFormDept(e.target.value)} className="w-full p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none">
                        <option value="Social Media Marketing">Social Media Marketing</option>
                        <option value="Video Editing / Content Creator">Video Editing / Content Creator</option>
                        <option value="Graphics">Graphics</option>
                        <option value="Software Development">Software Development</option>
                        <option value="Sales">Sales</option>
                        <option value="HR">HR</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Designation</label>
                      <input type="text" value={formDesignation} onChange={(e) => setFormDesignation(e.target.value)} placeholder="e.g. Frontend Dev" className="w-full p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Experience</label>
                      <input type="text" value={formExp} onChange={(e) => setFormExp(e.target.value)} placeholder="e.g. 3 Years" className="w-full p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Last Salary</label>
                      <input type="number" value={formLastSalary} onChange={(e) => setFormLastSalary(e.target.value)} placeholder="e.g. 50000" className="w-full p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Date of Joining</label>
                      <input type="date" value={formDateOfJoining} onChange={(e) => setFormDateOfJoining(e.target.value)} className="w-full p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none" />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">Documents (Upload / Update)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Passport Size Photo</label>
                      <input type="file" onChange={(e) => handleFileUpload(e, setPassportPhoto)} className="w-full text-slate-500" />
                      {passportPhoto && <span className="text-green-600 font-bold block mt-1">✓ Uploaded</span>}
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Aadhar Card</label>
                      <input type="file" onChange={(e) => handleFileUpload(e, setAadharCard)} className="w-full text-slate-500" />
                      {aadharCard && <span className="text-green-600 font-bold block mt-1">✓ Uploaded</span>}
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">PAN Card</label>
                      <input type="file" onChange={(e) => handleFileUpload(e, setPanCard)} className="w-full text-slate-500" />
                      {panCard && <span className="text-green-600 font-bold block mt-1">✓ Uploaded</span>}
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">10th Marksheet</label>
                      <input type="file" onChange={(e) => handleFileUpload(e, setMarksheet10)} className="w-full text-slate-500" />
                      {marksheet10 && <span className="text-green-600 font-bold block mt-1">✓ Uploaded</span>}
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">12th Marksheet</label>
                      <input type="file" onChange={(e) => handleFileUpload(e, setMarksheet12)} className="w-full text-slate-500" />
                      {marksheet12 && <span className="text-green-600 font-bold block mt-1">✓ Uploaded</span>}
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Graduation / Degree</label>
                      <input type="file" onChange={(e) => handleFileUpload(e, setGraduation)} className="w-full text-slate-500" />
                      {graduation && <span className="text-green-600 font-bold block mt-1">✓ Uploaded</span>}
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Other Docs (Rent Agreement etc.)</label>
                      <input type="file" onChange={(e) => handleFileUpload(e, setOtherDoc)} className="w-full text-slate-500" />
                      {otherDoc && <span className="text-green-600 font-bold block mt-1">✓ Uploaded</span>}
                    </div>
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
                            const priceStr = pkgData.price.toString();
                            setClientFormAmt(priceStr);
                            setClientFormReq(pkgData.req);
                            setReqBuilder(parseReqStringToCounts(pkgData.req));
                            if (paymentStatus === 'Full') {
                              setPaidAmount(priceStr);
                            }
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
                    <label className="font-bold text-slate-700 dark:text-slate-355">Package Amount (₹)</label>
                    <input
                      type="number"
                      required
                      value={clientFormAmt}
                      onChange={(e) => {
                        const val = e.target.value;
                        setClientFormAmt(val);
                        if (paymentStatus === 'Full') {
                          setPaidAmount(val);
                        }
                      }}
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
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Page Created / Account Ready?</label>
                      <select
                        value={clientFormReady ? "Yes" : "No"}
                        onChange={(e) => {
                          const isReady = e.target.value === "Yes";
                          setClientFormReady(isReady);
                          setPageCreationRequired(!isReady);
                        }}
                        className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                      >
                        <option value="Yes">Yes (Page Created & Ready)</option>
                        <option value="No">No (Page Creation Required)</option>
                      </select>
                    </div>
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-350">Payment Type</label>
                    <select
                      value={paymentStatus}
                      onChange={(e) => {
                        const status = e.target.value;
                        setPaymentStatus(status);
                        if (status === 'Full') {
                          setPaidAmount(clientFormAmt);
                        } else if (status === 'Partial') {
                          const pkg = parseFloat(clientFormAmt) || 0;
                          const rec = parseFloat(paidAmount) || 0;
                          if (rec >= pkg) {
                            setPaidAmount((pkg / 2).toString());
                          }
                        }
                      }}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="Full">Full Payment</option>
                      <option value="Partial">Partial Payment</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-355">Received Amount (₹)</label>
                    <input
                      type="number"
                      value={paidAmount}
                      disabled={paymentStatus === 'Full'}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPaidAmount(val);
                        const rec = parseFloat(val) || 0;
                        const pkg = parseFloat(clientFormAmt) || 0;
                        if (rec >= pkg) {
                          setPaymentStatus('Full');
                        } else {
                          setPaymentStatus('Partial');
                        }
                      }}
                      placeholder="e.g. 5000"
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none disabled:opacity-60 disabled:bg-slate-100 dark:disabled:bg-slate-900"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-semibold flex justify-between items-center">
                  <div>
                    <span className="text-[9px] text-slate-450 uppercase block">Calculated Payment Status</span>
                    {(() => {
                      const pkg = parseFloat(clientFormAmt) || 0;
                      const rec = parseFloat(paidAmount) || 0;
                      const bal = pkg - rec;
                      if (rec === 0) return <span className="text-red-655 dark:text-red-400 font-bold">UNPAID</span>;
                      if (bal > 0) return <span className="text-amber-600 dark:text-amber-400 font-bold">PARTIALLY PAID</span>;
                      if (bal === 0) return <span className="text-emerald-650 dark:text-emerald-450 font-bold">FULLY PAID</span>;
                      return <span className="text-blue-600 dark:text-blue-400 font-bold">OVERPAID</span>;
                    })()}
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-slate-450 uppercase block">Pending Balance</span>
                    {(() => {
                      const pkg = parseFloat(clientFormAmt) || 0;
                      const rec = parseFloat(paidAmount) || 0;
                      const bal = pkg - rec;
                      if (bal > 0) return <span className="text-red-655 dark:text-red-400 font-extrabold">₹{bal.toLocaleString()}</span>;
                      if (bal < 0) return <span className="text-blue-600 dark:text-blue-455 font-extrabold">₹{Math.abs(bal).toLocaleString()} (Refund/Credit)</span>;
                      return <span className="text-emerald-600 dark:text-emerald-455 font-extrabold">₹0 (Clear)</span>;
                    })()}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-350">Execution Notes / Additional Info</label>
                  <textarea
                    value={actualNotes}
                    onChange={(e) => setActualNotes(e.target.value)}
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
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-up max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 shrink-0">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" /> Auto-Assign Deliverables
              </h3>
              <p className="text-[10px] text-slate-500 mt-1">Assign these required deliverables to your creators.</p>
            </div>
            
            <div className="p-4 space-y-3 overflow-y-auto flex-1">

              {/* Content Type Checkboxes */}
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold text-blue-800 dark:text-blue-300 uppercase tracking-wider">Select Content to Generate</span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={e => toggleAll(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-[11px] font-black text-blue-700 dark:text-blue-400">All Content</span>
                  </label>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { key: 'onboarding',    label: 'Onboarding Tasks',  icon: '🚀', desc: 'Access, setup & ads run tasks' },
                    { key: 'creatives',     label: 'Creatives (C)',     icon: '🎨', desc: `${reqBuilder.c} graphic posts` },
                    { key: 'reels',         label: 'Reels / Shorts (R)',icon: '🎬', desc: `${reqBuilder.r} video reels` },
                    { key: 'aiVideos',      label: 'AI Videos (AI)',    icon: '🤖', desc: `${reqBuilder.a} AI videos` },
                    { key: 'weeklyReports', label: 'Weekly Reports',    icon: '📊', desc: '4 weekly report tasks' },
                    { key: 'postingTasks',  label: 'Posting Tasks',     icon: '📲', desc: 'Posting upon client approval' },
                  ].map(opt => (
                    <label
                      key={opt.key}
                      className={`flex items-start gap-1.5 p-2 rounded-lg border cursor-pointer transition ${
                        generateOptions[opt.key]
                          ? 'bg-white dark:bg-slate-800 border-blue-300 dark:border-blue-700 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 opacity-60'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={generateOptions[opt.key]}
                        onChange={e => toggleOption(opt.key, e.target.checked)}
                        className="w-3 h-3 rounded mt-0.5 border-slate-300 text-blue-600 focus:ring-blue-500 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-slate-800 dark:text-slate-200 text-[10px] flex items-center gap-1">
                          <span>{opt.icon}</span> {opt.label}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Staff Assignments — compact grid */}
              <div className="space-y-2">
              {parseInt(reqBuilder.c) > 0 && generateOptions.creatives && (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700/50 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">Graphic Creatives ({reqBuilder.c})</span>
                      <span className="text-[8px] font-extrabold uppercase bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 px-1.5 py-0.5 rounded">Graphic Designer</span>
                    </div>
                    <select 
                      value={assignedStaff.c} 
                      onChange={e => setAssignedStaff({...assignedStaff, c: e.target.value})}
                      className="w-full p-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded text-slate-900 dark:text-white focus:outline-none text-[11px]"
                    >
                      <option value="" disabled>Select Staff to Assign</option>
                      <option value="AUTO">Auto Assign (First-In Round Robin)</option>
                      {employeesList
                        .filter(e => ((e.department || '') + ' ' + (e.designation || '')).toLowerCase().includes('graphic'))
                        .map(e => <option key={e.id} value={e.id}>{e.name} ({e.designation || e.department})</option>)}
                    </select>
                  </div>
                </div>
              )}
              
              {parseInt(reqBuilder.r) > 0 && generateOptions.reels && (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700/50 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">Reels / Shorts ({reqBuilder.r})</span>
                      <span className="text-[8px] font-extrabold uppercase bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-400 px-1.5 py-0.5 rounded">Video Editor</span>
                    </div>
                    <select 
                      value={assignedStaff.r} 
                      onChange={e => setAssignedStaff({...assignedStaff, r: e.target.value})}
                      className="w-full p-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded text-slate-900 dark:text-white focus:outline-none text-[11px]"
                    >
                      <option value="" disabled>Select Staff to Assign</option>
                      <option value="AUTO">Auto Assign (First-In Round Robin)</option>
                      {employeesList
                        .filter(e => {
                          const role = ((e.department || '') + ' ' + (e.designation || '')).toLowerCase();
                          return role.includes('video editor') && !role.includes('ai');
                        })
                        .map(e => <option key={e.id} value={e.id}>{e.name} ({e.designation || e.department})</option>)}
                    </select>
                  </div>
                </div>
              )}

              {parseInt(reqBuilder.a) > 0 && generateOptions.aiVideos && (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700/50 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">AI Videos ({reqBuilder.a})</span>
                      <span className="text-[8px] font-extrabold uppercase bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-400 px-1.5 py-0.5 rounded">AI Lead</span>
                    </div>
                    <select 
                      value={assignedStaff.a} 
                      onChange={e => setAssignedStaff({...assignedStaff, a: e.target.value})}
                      className="w-full p-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded text-slate-900 dark:text-white focus:outline-none text-[11px]"
                    >
                      <option value="" disabled>Select Staff to Assign</option>
                      <option value="AUTO">Auto Assign (First-In Round Robin)</option>
                      {employeesList
                        .filter(e => ((e.department || '') + ' ' + (e.designation || '')).toLowerCase().includes('ai video'))
                        .map(e => <option key={e.id} value={e.id}>{e.name} ({e.designation || e.department})</option>)}
                    </select>
                  </div>
                </div>
              )}

              {generateOptions.weeklyReports && (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700/50 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">Weekly Reports (4)</span>
                      <span className="text-[8px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded">Social Media Exec</span>
                    </div>
                    <select 
                      value={assignedStaff.sm} 
                      onChange={e => setAssignedStaff({...assignedStaff, sm: e.target.value})}
                      className="w-full p-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded text-slate-900 dark:text-white focus:outline-none text-[11px]"
                    >
                      <option value="" disabled>Select Staff to Assign</option>
                      <option value="AUTO">Auto Assign (First-In Round Robin)</option>
                      {employeesList
                        .filter(e => {
                          const role = ((e.department || '') + ' ' + (e.designation || '')).toLowerCase();
                          return role.includes('marketing') || role.includes('social') || role.includes('digital');
                        })
                        .map(e => <option key={e.id} value={e.id}>{e.name} ({e.designation || e.department})</option>)}
                    </select>
                  </div>
                </div>
              )}

              {generateOptions.postingTasks && (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700/50 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">Content Poster</span>
                      <span className="text-[8px] font-extrabold uppercase bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded">Content Posting</span>
                    </div>
                    <select 
                      value={assignedStaff.poster} 
                      onChange={e => setAssignedStaff({...assignedStaff, poster: e.target.value})}
                      className="w-full p-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded text-slate-900 dark:text-white focus:outline-none text-[11px]"
                    >
                      <option value="">-- Select Specific Content Poster --</option>
                      {employeesList
                        .map(e => <option key={e.id} value={e.id}>{e.name} ({e.department})</option>)}
                    </select>
                  </div>
                </div>
              )}
              </div>
            </div>

            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end gap-2 shrink-0">
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
                            const priceStr = pkgData.price.toString();
                            setClientFormAmt(priceStr);
                            setClientFormReq(pkgData.req);
                            setReqBuilder(parseReqStringToCounts(pkgData.req));
                            if (paymentStatus === 'Full') {
                              setPaidAmount(priceStr);
                            }
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
                      onChange={(e) => {
                        const val = e.target.value;
                        setClientFormAmt(val);
                        if (paymentStatus === 'Full') {
                          setPaidAmount(val);
                        }
                      }}
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
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Page Created / Account Ready?</label>
                      <select
                        value={clientFormReady ? "Yes" : "No"}
                        onChange={(e) => {
                          const isReady = e.target.value === "Yes";
                          setClientFormReady(isReady);
                          setPageCreationRequired(!isReady);
                        }}
                        className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                      >
                        <option value="Yes">Yes (Page Created & Ready)</option>
                        <option value="No">No (Page Creation Required)</option>
                      </select>
                    </div>
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-355">Payment Type</label>
                    <select
                      value={paymentStatus}
                      onChange={(e) => {
                        const status = e.target.value;
                        setPaymentStatus(status);
                        if (status === 'Full') {
                          setPaidAmount(clientFormAmt);
                        } else if (status === 'Partial') {
                          const pkg = parseFloat(clientFormAmt) || 0;
                          const rec = parseFloat(paidAmount) || 0;
                          if (rec >= pkg) {
                            setPaidAmount((pkg / 2).toString());
                          }
                        }
                      }}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="Full">Full Payment</option>
                      <option value="Partial">Partial Payment</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-355">Received Amount (₹)</label>
                    <input
                      type="number"
                      value={paidAmount}
                      disabled={paymentStatus === 'Full'}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPaidAmount(val);
                        const rec = parseFloat(val) || 0;
                        const pkg = parseFloat(clientFormAmt) || 0;
                        if (rec >= pkg) {
                          setPaymentStatus('Full');
                        } else {
                          setPaymentStatus('Partial');
                        }
                      }}
                      placeholder="e.g. 5000"
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none disabled:opacity-60 disabled:bg-slate-100 dark:disabled:bg-slate-900"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-semibold flex justify-between items-center">
                  <div>
                    <span className="text-[9px] text-slate-450 uppercase block">Calculated Payment Status</span>
                    {(() => {
                      const pkg = parseFloat(clientFormAmt) || 0;
                      const rec = parseFloat(paidAmount) || 0;
                      const bal = pkg - rec;
                      if (rec === 0) return <span className="text-red-655 dark:text-red-400 font-bold">UNPAID</span>;
                      if (bal > 0) return <span className="text-amber-600 dark:text-amber-400 font-bold">PARTIALLY PAID</span>;
                      if (bal === 0) return <span className="text-emerald-650 dark:text-emerald-450 font-bold">FULLY PAID</span>;
                      return <span className="text-blue-600 dark:text-blue-400 font-bold">OVERPAID</span>;
                    })()}
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-slate-450 uppercase block">Pending Balance</span>
                    {(() => {
                      const pkg = parseFloat(clientFormAmt) || 0;
                      const rec = parseFloat(paidAmount) || 0;
                      const bal = pkg - rec;
                      if (bal > 0) return <span className="text-red-655 dark:text-red-400 font-extrabold">₹{bal.toLocaleString()}</span>;
                      if (bal < 0) return <span className="text-blue-600 dark:text-blue-455 font-extrabold">₹{Math.abs(bal).toLocaleString()} (Refund/Credit)</span>;
                      return <span className="text-emerald-600 dark:text-emerald-455 font-extrabold">₹0 (Clear)</span>;
                    })()}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-355">Execution Notes / Additional Info</label>
                  <textarea
                    value={actualNotes}
                    onChange={(e) => setActualNotes(e.target.value)}
                    placeholder="Notes regarding client onboarding, custom package adjustments..."
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

                {(() => {
                  let pStatus = 'Full';
                  let pAmt = selectedClient.packageAmount.toString();
                  let aNotes = '';
                  let isJson = false;
                  try {
                    if (selectedClient.notes) {
                      const parsed = JSON.parse(selectedClient.notes);
                      if (parsed && typeof parsed === 'object') {
                        pStatus = parsed.paymentStatus || 'Full';
                        pAmt = parsed.paidAmount !== undefined ? parsed.paidAmount.toString() : selectedClient.packageAmount.toString();
                        aNotes = parsed.actualNotes || '';
                        isJson = true;
                      }
                    }
                  } catch (e) {
                    aNotes = selectedClient.notes || '';
                  }

                  if (isJson) {
                    const pkgAmt = selectedClient.packageAmount || 0;
                    const recAmt = parseFloat(pAmt) || 0;
                    const pendingBalance = pkgAmt - recAmt;

                    return (
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-850 p-3 rounded-lg border border-slate-200/50 dark:border-slate-800 text-[10px] font-semibold">
                          <div>
                            <span className="text-[8px] text-slate-400 font-extrabold uppercase block">Status</span>
                            {(() => {
                              if (recAmt === 0) return <span className="inline-block px-1.5 py-0.5 rounded text-[8px] font-bold mt-1 bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">UNPAID</span>;
                              if (pendingBalance > 0) return <span className="inline-block px-1.5 py-0.5 rounded text-[8px] font-bold mt-1 bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">PARTIAL</span>;
                              if (pendingBalance === 0) return <span className="inline-block px-1.5 py-0.5 rounded text-[8px] font-bold mt-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">FULLY PAID</span>;
                              return <span className="inline-block px-1.5 py-0.5 rounded text-[8px] font-bold mt-1 bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">OVERPAID</span>;
                            })()}
                          </div>
                          <div>
                            <span className="text-[8px] text-slate-400 font-extrabold uppercase block">Received</span>
                            <p className="font-extrabold text-slate-800 dark:text-slate-200 mt-1">₹{recAmt.toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-[8px] text-slate-400 font-extrabold uppercase block">Pending</span>
                            <p className={`font-extrabold mt-1 ${pendingBalance > 0 ? 'text-red-650 dark:text-red-400' : pendingBalance < 0 ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600 dark:text-emerald-450'}`}>
                              {pendingBalance > 0 ? `₹${pendingBalance.toLocaleString()}` : pendingBalance < 0 ? `₹${Math.abs(pendingBalance).toLocaleString()} Cr` : '₹0'}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex justify-between text-[9px] text-slate-450 px-1 font-bold">
                            <span>Package Cost: ₹{pkgAmt.toLocaleString()}</span>
                            <span>Payment Type: {pStatus === 'Full' ? 'Full' : 'Partial'}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase">Audit & Execution Notes</span>
                          <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-lg border border-slate-200/50 dark:border-slate-800 text-[11px] font-medium leading-relaxed">
                            {aNotes || <span className="text-slate-400 italic">No execution notes added.</span>}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase">Audit & Execution Notes</span>
                      <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-lg border border-slate-200/50 dark:border-slate-800 text-[11px] font-medium leading-relaxed">
                        {selectedClient.notes || <span className="text-slate-400 italic">No additional notes added.</span>}
                      </div>
                    </div>
                  );
                })()}
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
                        className="w-full mt-1 p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded text-slate-900 dark:text-white focus:outline-none font-medium"
                      >
                        <option value="">Select Staff / Unassigned</option>
                        <option value="AUTO">Auto Assign (First-In Round Robin)</option>
                        <optgroup label="Matching Department / Designation">
                          {usersList.filter(e => (e.role === 'EMPLOYEE' || e.role === 'TL')).filter(e => {
                            const role = ((e.department || '') + ' ' + (e.designation || '')).toLowerCase();
                            const target = (clientTaskFormAssignTo || '').toLowerCase();
                            if (target.includes('graphic')) return role.includes('graphic');
                            if (target.includes('video editor')) return role.includes('video editor');
                            if (target.includes('ai video lead') || target.includes('ai video editor') || target.includes('ai video')) return role.includes('ai video') || role.includes('video editor');
                            if (target.includes('digital marketing') || target.includes('social media')) return role.includes('marketing') || role.includes('social') || role.includes('digital');
                            return role.includes(target) || target.includes((e.department || '').toLowerCase());
                          }).map(e => (
                            <option key={e.id} value={e.name}>{e.name} ({e.designation || e.department || e.role})</option>
                          ))}
                        </optgroup>
                        <optgroup label="All Other Staff">
                          {usersList.filter(e => (e.role === 'EMPLOYEE' || e.role === 'TL')).filter(e => {
                            const role = ((e.department || '') + ' ' + (e.designation || '')).toLowerCase();
                            const target = (clientTaskFormAssignTo || '').toLowerCase();
                            let isMatched = false;
                            if (target.includes('graphic')) isMatched = role.includes('graphic');
                            else if (target.includes('video editor')) isMatched = role.includes('video editor');
                            else if (target.includes('ai video lead') || target.includes('ai video editor') || target.includes('ai video')) isMatched = role.includes('ai video') || role.includes('video editor');
                            else if (target.includes('digital marketing') || target.includes('social media')) isMatched = role.includes('marketing') || role.includes('social') || role.includes('digital');
                            else isMatched = role.includes(target) || target.includes((e.department || '').toLowerCase());
                            return !isMatched;
                          }).map(e => (
                            <option key={e.id} value={e.name}>{e.name} ({e.designation || e.department || 'No Dept'} - {e.role})</option>
                          ))}
                        </optgroup>
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
                        <option value="Processing">Processing</option>
                        <option value="Client Review">Client Review</option>
                        <option value="Revision">Revision</option>
                        <option value="Completion">Completion</option>
                        <option value="Pending">Pending</option>
                        <option value="Overdue">Overdue</option>
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
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold transition disabled:opacity-50"
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
                                <div className="text-slate-800 dark:text-slate-200">
                                  {task.postType === 'Posting' || (task.taskTitle && task.taskTitle.toLowerCase().startsWith('post ')) ? (
                                    <span className="text-amber-600 dark:text-amber-400 font-extrabold text-[9px] uppercase tracking-wider">Trigger on Approval (24h)</span>
                                  ) : (
                                    task.date
                                  )}
                                </div>
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
