'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Clock,
  CheckSquare,
  Building,
  Calendar,
  LogOut,
  PhoneCall,
  Search,
  Plus,
  Edit,
  Phone,
  Mail,
  MessageCircle,
  FileText,
  MessageSquare
} from 'lucide-react';

export default function SalesDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Data states
  const [tasksList, setTasksList] = useState([]);
  const [todayLog, setTodayLog] = useState(null);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [callsList, setCallsList] = useState([]);
  const [otherOption, setOtherOption] = useState('Switch Off');

  // Timer States
  const [timeStr, setTimeStr] = useState('');
  const [workDuration, setWorkDuration] = useState('00:00:00');
  const [toast, setToast] = useState({ message: '', type: '' });
  const [darkMode, setDarkMode] = useState(false);

  // New Call Modal State
  const [showCallModal, setShowCallModal] = useState(false);
  const [newCallData, setNewCallData] = useState({
    clientName: '',
    phoneNumber: '',
    status: 'PENDING',
    campaign: 'Facebook Campaign',
    notes: ''
  });

  const [selectedCampaign, setSelectedCampaign] = useState('All Campaigns');
  const [selectedLeadId, setSelectedLeadId] = useState(null);

  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 4000);
  };

  useEffect(() => {
    const clock = setInterval(() => {
      setTimeStr(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(clock);
  }, []);

  useEffect(() => {
    let timer;
    if (todayLog && !todayLog.clockOut) {
      timer = setInterval(() => {
        const start = new Date(todayLog.clockIn).getTime();
        const diff = new Date().getTime() - start;
        const hrs = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setWorkDuration(`${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      }, 1000);
    } else {
      setWorkDuration('00:00:00');
    }
    return () => clearInterval(timer);
  }, [todayLog]);

  useEffect(() => {
    async function initDashboard() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (!res.ok || !data.user || data.user.role !== 'SALES') {
          router.push('/');
          return;
        }
        setCurrentUser(data.user);
        await refreshData(data.user.id);
        setLoading(false);
      } catch (err) {
        console.error(err);
        router.push('/');
      }
    }
    initDashboard();
  }, [router]);

  const refreshData = async (userId) => {
    try {
      const [tasksRes, attRes, callsRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/attendance'),
        fetch(`/api/calls?salesPersonId=${userId || currentUser?.id}`)
      ]);
      const [tasksData, attData, callsData] = await Promise.all([
        tasksRes.json(), attRes.json(), callsRes.json()
      ]);
      setTasksList(tasksData.tasks || []);
      setTodayLog(attData.todayLog);
      setAttendanceLogs(attData.logs || []);
      setCallsList(callsData.calls || []);
    } catch (err) {
      console.error('Error refreshing data:', err);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const handleClockToggle = async () => {
    try {
      let locationLink = null;
      if (!todayLog || todayLog.clockOut) {
        if (navigator.geolocation) {
          try {
            const position = await new Promise((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
            });
            locationLink = `https://www.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`;
          } catch (e) {
            locationLink = 'Location Blocked';
          }
        }
      }
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: locationLink })
      });
      const data = await res.json();
      if (!res.ok) return showToast(data.error || 'Action failed', 'error');
      showToast(data.message);
      await refreshData();
    } catch (err) {
      showToast('Connection error.', 'error');
    }
  };

  const handleAddCall = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newCallData,
        notes: `[Campaign: ${newCallData.campaign || 'Facebook Campaign'}] ${newCallData.notes || ''}`,
        salesPersonId: currentUser.id
      };

      const res = await fetch('/api/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast('Call logged successfully!');
        setShowCallModal(false);
        setNewCallData({ clientName: '', phoneNumber: '', status: 'PENDING', campaign: 'Facebook Campaign', notes: '' });
        await refreshData();
      } else {
        showToast('Failed to log call', 'error');
      }
    } catch (err) {
      showToast('Connection error', 'error');
    }
  };

  const handleUpdateCallStatus = async (callId, newStatus) => {
    try {
      const res = await fetch(`/api/calls/${callId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showToast('Status updated!');
        await refreshData();
      }
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const getCampaign = (call) => {
    if (call.notes && call.notes.includes('[Campaign: Facebook Campaign]')) return 'Facebook Campaign';
    if (call.notes && call.notes.includes('[Campaign: LinkedIn Campaign]')) return 'LinkedIn Campaign';
    if (call.notes && call.notes.includes('[Campaign: Google Campaign]')) return 'Google Campaign';
    const campaigns = ['Facebook Campaign', 'LinkedIn Campaign', 'Google Campaign'];
    return campaigns[call.id % 3];
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('DEFAULT');
  const [orderBy, setOrderBy] = useState('PRIORITY');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getStatusWeight = (status) => {
    switch (status) {
      case 'CALLBACK': return 1;
      case 'INTERESTED': return 2;
      case 'ANSWERED': return 3;
      case 'NOT_INTERESTED':
      case 'NOT_ANSWERED': return 4;
      case 'RINGING': return 5;
      default: return 6;
    }
  };

  const filteredCalls = callsList.filter(c => {
    const matchesCampaign = selectedCampaign === 'All Campaigns' || getCampaign(c) === selectedCampaign;
    const matchesSearch = c.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phoneNumber?.includes(searchQuery);
    return matchesCampaign && matchesSearch;
  });

  if (sortBy !== 'DEFAULT' || orderBy !== 'DEFAULT') {
    filteredCalls.sort((a, b) => {
      if (sortBy !== 'DEFAULT') {
        const getColorPriority = (status) => {
          if (sortBy === 'YELLOW' && (status === 'CALLBACK' || status === 'RINGING')) return 1;
          if (sortBy === 'BLUE' && status === 'INTERESTED') return 1;
          if (sortBy === 'GREEN' && status === 'ANSWERED') return 1;
          if (sortBy === 'RED' && (status === 'NOT_INTERESTED' || status === 'NOT_ANSWERED')) return 1;
          return 2;
        };
        const pA = getColorPriority(a.status);
        const pB = getColorPriority(b.status);
        if (pA !== pB) return pA - pB;
      }

      if (orderBy === 'PRIORITY') {
        const getPri = (status) => {
          switch (status) {
            case 'ANSWERED': return 1; 
            case 'INTERESTED': return 2; 
            case 'CALLBACK': 
            case 'RINGING': return 3; 
            case 'NOT_INTERESTED':
            case 'NOT_ANSWERED': return 4; 
            default: return 5;
          }
        };
        const priA = getPri(a.status);
        const priB = getPri(b.status);
        if (priA !== priB) return priA - priB;
      } else if (orderBy === 'DESCENDING') {
        return new Date(b.callDate) - new Date(a.callDate);
      } else if (orderBy === 'ASCENDING') {
        return new Date(a.callDate) - new Date(b.callDate);
      }
      return 0;
    });
  }

  const getStatusStyle = (status, isSelected) => {
    let base = "p-4 border-b border-r-0 border-t-0 border-slate-200 dark:border-slate-800 cursor-pointer transition-colors flex gap-4 border-l-4 ";
    if (isSelected) {
      return base + "bg-[#0f4ca8] text-white border-l-[#0f4ca8]";
    }
    switch (status) {
      case 'CALLBACK': 
      case 'RINGING': return base + 'bg-yellow-50/40 hover:bg-yellow-50 dark:bg-yellow-900/10 dark:hover:bg-yellow-900/20 text-slate-800 dark:text-slate-200 border-l-yellow-400';
      case 'INTERESTED': return base + 'bg-blue-50/40 hover:bg-blue-50 dark:bg-blue-900/10 dark:hover:bg-blue-900/20 text-slate-800 dark:text-slate-200 border-l-blue-400';
      case 'ANSWERED': return base + 'bg-emerald-50/40 hover:bg-emerald-50 dark:bg-emerald-900/10 dark:hover:bg-emerald-900/20 text-slate-800 dark:text-slate-200 border-l-emerald-400';
      case 'NOT_INTERESTED':
      case 'NOT_ANSWERED': return base + 'bg-red-50/40 hover:bg-red-50 dark:bg-red-900/10 dark:hover:bg-red-900/20 text-slate-800 dark:text-slate-200 border-l-red-400';
      default: return base + 'bg-slate-50/40 hover:bg-slate-50 dark:bg-slate-800/30 dark:hover:bg-slate-800/50 text-slate-800 dark:text-slate-200 border-l-slate-300 dark:border-l-slate-600';
    }
  };

  const getStatusDisplayText = (status) => {
    switch(status) {
      case 'CALLBACK': 
      case 'RINGING': return 'FOLLOW-UP';
      case 'INTERESTED': return 'HOT-LEAD';
      case 'ANSWERED': return 'DONE';
      case 'NOT_INTERESTED': 
      case 'NOT_ANSWERED': return 'UNUSUAL';
      default: return status.replace('_', ' ');
    }
  };

  const getStatusBadge = (status, isSelected, isLarge = false) => {
    let classes = `text-[10px] font-extrabold uppercase ${isLarge ? 'px-3 py-1.5 rounded-lg' : 'px-2 py-0.5 rounded'} `;
    if (isSelected) {
      return classes + "bg-white/20 text-white";
    }
    switch(status) {
      case 'CALLBACK': 
      case 'RINGING': return classes + 'bg-yellow-500 text-white border border-yellow-600 shadow-sm dark:bg-yellow-600 dark:border-yellow-700';
      case 'INTERESTED': return classes + 'bg-blue-600 text-white border border-blue-700 shadow-sm dark:bg-blue-700 dark:border-blue-800';
      case 'ANSWERED': return classes + 'bg-emerald-500 text-white border border-emerald-600 shadow-sm dark:bg-emerald-600 dark:border-emerald-700';
      case 'NOT_INTERESTED':
      case 'NOT_ANSWERED': return classes + 'bg-red-500 text-white border border-red-600 shadow-sm dark:bg-red-600 dark:border-red-700';
      default: return classes + 'bg-slate-500 text-white border border-slate-600 shadow-sm dark:bg-slate-600 dark:border-slate-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 overflow-hidden">
      {/* Toast Alert */}
      {toast.message && (
        <div className={`fixed bottom-5 right-5 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 border text-sm font-semibold 
          ${toast.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 text-emerald-800 dark:text-emerald-300' : 'bg-red-50 dark:bg-red-950/80 border-red-200 text-red-800 dark:text-red-300'}`}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-30 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
            <Building className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            WorkForce OS
          </span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600 dark:text-slate-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-64 bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 justify-between shrink-0 z-20 absolute md:static top-[73px] md:top-0 left-0 h-[calc(100vh-73px)] md:h-screen overflow-y-auto`}>
        <div>
          <div className="hidden md:flex p-6 border-b border-slate-200 dark:border-slate-800 items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <Building className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              WorkForce OS
            </span>
          </div>

          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-800/20">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white text-lg font-bold">
              {currentUser.avatar || '👤'}
            </div>
            <div className="overflow-hidden">
              <div className="font-bold text-sm truncate">{currentUser.name}</div>
              <div className="text-[10px] text-blue-600 dark:text-blue-400 font-extrabold uppercase">SALES STAFF</div>
            </div>
          </div>

          <nav className="p-4 flex flex-col gap-1">
            <button onClick={() => { setActiveTab('overview'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${activeTab === 'overview' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
              <Clock className="w-4 h-4" /> Clock
            </button>
            <button onClick={() => { setActiveTab('tasks'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${activeTab === 'tasks' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
              <CheckSquare className="w-4 h-4" /> Overview
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative h-[calc(100vh-73px)] md:h-screen w-full">
        <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between shrink-0">
          <h1 className="text-xl font-bold capitalize">
            {activeTab === 'tasks' ? 'Overview' : 'Clock'}
          </h1>
          <div className="font-mono text-base font-semibold bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
            {timeStr}
          </div>
        </header>

        <div className="p-4 md:p-6 min-h-[calc(100vh-4rem)]">
          {activeTab === 'overview' && (
            <div className="max-w-3xl mx-auto">
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

              {/* Clock Logs history */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm mt-6">
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
          )}

          {activeTab === 'tasks' && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between shrink-0 gap-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Sales Performance Overview</h3>
                  <p className="text-slate-500 text-xs mt-1">Analytics and metrics for your calling campaigns.</p>
                </div>
                <div className="w-full sm:w-auto">
                  <select
                    value={selectedCampaign}
                    onChange={(e) => setSelectedCampaign(e.target.value)}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg px-3 py-1.5 text-sm font-semibold shadow-sm outline-none focus:ring-2 focus:ring-blue-500 transition-shadow cursor-pointer"
                  >
                    <option value="All Campaigns">All Campaigns</option>
                    <option value="Facebook Campaign">Facebook Campaign</option>
                    <option value="LinkedIn Campaign">LinkedIn Campaign</option>
                    <option value="Google Campaign">Google Campaign</option>
                  </select>
                </div>
              </div>

              {/* 2 Main Boxes Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 shrink-0">
                {/* Box 1: Answer, Ringing, Other */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Call Status</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-emerald-500 dark:bg-emerald-600 p-3 rounded-xl border border-emerald-600 dark:border-emerald-700 flex flex-col justify-center text-white shadow-sm shadow-emerald-500/20">
                      <span className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider mb-1">Answer</span>
                      <div className="text-2xl font-black text-white">
                        {filteredCalls.filter(c => c.status === 'ANSWERED' || c.status === 'INTERESTED').length}
                      </div>
                    </div>
                    <div className="bg-yellow-500 dark:bg-yellow-600 p-3 rounded-xl border border-yellow-600 dark:border-yellow-700 flex flex-col justify-center text-white shadow-sm shadow-yellow-500/20">
                      <span className="text-[10px] font-bold text-yellow-100 uppercase tracking-wider mb-1">Ringing</span>
                      <div className="text-2xl font-black text-white">
                        {filteredCalls.filter(c => c.status === 'RINGING' || c.status === 'CALLBACK').length}
                      </div>
                    </div>
                    <div className="bg-slate-700 dark:bg-slate-800 p-3 rounded-xl border border-slate-800 dark:border-slate-900 flex flex-col justify-center relative text-white shadow-sm shadow-slate-700/20">
                      <div className="flex items-center justify-between mb-1">
                        <select
                          value={otherOption}
                          onChange={(e) => setOtherOption(e.target.value)}
                          className="text-[10px] font-bold text-slate-300 uppercase tracking-wider bg-transparent outline-none cursor-pointer appearance-none pr-3 w-full"
                        >
                          <option className="text-slate-800" value="Switch Off">Switch Off</option>
                          <option className="text-slate-800" value="Not Reachable">Not Reachable</option>
                          <option className="text-slate-800" value="Busy">Busy</option>
                          <option className="text-slate-800" value="Invalid Number">Invalid Number</option>
                        </select>
                        <div className="absolute right-3 top-3.5 pointer-events-none text-slate-400 text-[8px]">▼</div>
                      </div>
                      <div className="text-2xl font-black text-white">
                        {filteredCalls.filter(c => c.status === otherOption.toUpperCase().replace(' ', '_')).length}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Box 2: Follow-up, Hot-Lead, done, Unusual */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Lead Categories</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-yellow-500 dark:bg-yellow-600 p-3 rounded-xl border border-yellow-600 dark:border-yellow-700 flex flex-col justify-center text-white shadow-sm shadow-yellow-500/20">
                      <span className="text-[10px] font-bold text-yellow-100 uppercase tracking-wider mb-1">Follow-up</span>
                      <div className="text-2xl font-black text-white">
                        {filteredCalls.filter(c => c.status === 'CALLBACK' || c.status === 'RINGING').length}
                      </div>
                    </div>
                    <div className="bg-blue-600 dark:bg-blue-700 p-3 rounded-xl border border-blue-700 dark:border-blue-800 flex flex-col justify-center text-white shadow-sm shadow-blue-600/20">
                      <span className="text-[10px] font-bold text-blue-100 uppercase tracking-wider mb-1">Hot-Lead</span>
                      <div className="text-2xl font-black text-white">
                        {filteredCalls.filter(c => c.status === 'INTERESTED').length}
                      </div>
                    </div>
                    <div className="bg-emerald-500 dark:bg-emerald-600 p-3 rounded-xl border border-emerald-600 dark:border-emerald-700 flex flex-col justify-center text-white shadow-sm shadow-emerald-500/20">
                      <span className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider mb-1">Done</span>
                      <div className="text-2xl font-black text-white">
                        {filteredCalls.filter(c => c.status === 'ANSWERED').length}
                      </div>
                    </div>
                    <div className="bg-red-500 dark:bg-red-600 p-3 rounded-xl border border-red-600 dark:border-red-700 flex flex-col justify-center text-white shadow-sm shadow-red-500/20">
                      <span className="text-[10px] font-bold text-red-100 uppercase tracking-wider mb-1">Unusual</span>
                      <div className="text-2xl font-black text-white">
                        {filteredCalls.filter(c => c.status === 'NOT_INTERESTED' || c.status === 'NOT_ANSWERED').length}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Split-pane CRM Layout */}
              <div className="flex flex-col md:flex-row gap-4">
                {/* Left Pane: Leads List */}
                <div className={`w-full ${selectedLeadId ? 'hidden md:flex md:w-2/5 lg:w-[45%]' : 'flex'} flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm transition-all duration-300`}>
                  <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col gap-4 shrink-0">
                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">My Leads</h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-bold mt-1">Total Records: {filteredCalls.length}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 w-full xl:w-auto">
                        <div className="flex flex-wrap gap-2">
                          <div className="relative">
                            <select
                              value={sortBy}
                              onChange={(e) => setSortBy(e.target.value)}
                              className="appearance-none bg-[#0f4ca8] hover:bg-blue-800 text-white text-xs font-bold px-4 py-1.5 pr-8 rounded cursor-pointer transition outline-none"
                            >
                              <option value="DEFAULT">SORT: DEFAULT</option>
                              <option value="YELLOW">SORT: YELLOW FIRST</option>
                              <option value="BLUE">SORT: BLUE FIRST</option>
                              <option value="GREEN">SORT: GREEN FIRST</option>
                              <option value="RED">SORT: RED FIRST</option>
                            </select>
                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-white text-[8px]">▼</div>
                          </div>
                          <div className="relative">
                            <select
                              value={orderBy}
                              onChange={(e) => setOrderBy(e.target.value)}
                              className="appearance-none bg-[#0f4ca8] hover:bg-blue-800 text-white text-xs font-bold px-4 py-1.5 pr-8 rounded cursor-pointer transition outline-none"
                            >
                              <option value="PRIORITY">ORDER BY: PRIORITY</option>
                              <option value="DESCENDING">ORDER BY: DESCENDING (NEWEST)</option>
                              <option value="ASCENDING">ORDER BY: ASCENDING (OLDEST)</option>
                            </select>
                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-white text-[8px]">▼</div>
                          </div>
                        </div>
                        <button onClick={() => setShowCallModal(true)} className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-1.5 rounded flex items-center gap-1 justify-center transition">New <Plus className="w-3 h-3" /></button>
                      </div>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search by name or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-500 text-xs px-8 py-1.5 rounded outline-none border border-slate-200 dark:border-slate-700 focus:border-blue-400 transition"
                      />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900">
                    {filteredCalls.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 text-sm">No leads available.</div>
                    ) : (
                      filteredCalls.map(call => {
                        const isSelected = selectedLeadId === call.id;
                        const campaign = getCampaign(call);

                        // Format date like 08-Aug-2026
                        const dateObj = new Date(call.callDate);
                        const dateString = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');
                        const timeString = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                        return (
                          <div
                            key={call.id}
                            onClick={() => setSelectedLeadId(call.id)}
                            className={getStatusStyle(call.status, isSelected)}
                          >
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isSelected ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-700'}`}>
                              <svg className={`w-8 h-8 ${isSelected ? 'text-white' : 'text-slate-400'}`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                            </div>
                            <div className="flex-1 flex justify-between min-w-0">
                              <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                                <div className="flex items-center gap-2 min-w-0">
                                  <h4 className="font-bold text-sm truncate" title={call.clientName}>{call.clientName}</h4>
                                  <span className={getStatusBadge(call.status, isSelected) + " shrink-0"}>
                                    {getStatusDisplayText(call.status)}
                                  </span>
                                </div>
                                <p className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                  {call.phoneNumber}
                                </p>
                                <p className={`text-xs font-semibold flex items-center gap-1 ${isSelected ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                                  {currentUser?.name || 'Aidigital'}
                                </p>
                                <div className={`text-[11px] font-semibold flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5 ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-red-300' : 'text-red-600'}`} />
                                    {dateString} {timeString}
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                                    Follow-Up Scheduled
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1.5 shrink-0 ml-2">
                                <span className={`text-[10px] font-semibold ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                                  {dateString}
                                </span>
                                <span className={`text-[9px] px-3 py-0.5 rounded-full font-bold uppercase border ${isSelected ? 'border-blue-300 text-blue-100' : 'border-blue-500 text-blue-600 dark:text-blue-400'}`}>
                                  New
                                </span>
                                <span className={`text-[9px] px-2 py-0.5 rounded font-bold capitalize ${isSelected ? 'bg-slate-900 text-white' : 'bg-slate-800 text-white'}`}>
                                  {campaign.replace(' Campaign', '')}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Right Pane: Detail View */}
                {selectedLeadId && (
                  <div className="w-full md:w-3/5 lg:w-[55%] bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col relative shadow-sm animate-fade-in self-start sticky top-24">
                    <div onClick={() => setSelectedLeadId(null)} className="absolute top-4 right-4 text-slate-400 cursor-pointer hover:text-slate-600 z-10"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></div>
                    <div className="p-4 sm:p-6 flex flex-col items-center text-center mt-2">
                      {(() => {
                        const activeCall = filteredCalls.find(c => c.id === selectedLeadId);
                        if (!activeCall) return <div className="text-slate-400 mt-20">No lead selected.</div>;
                        const camp = getCampaign(activeCall);
                        return (
                          <>
                            <div className="w-24 h-24 bg-slate-300 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4 shadow-inner shrink-0">
                              <svg className="w-14 h-14 text-slate-500 dark:text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-1">{activeCall.clientName}</h2>
                            <p className="text-slate-600 dark:text-slate-400 font-mono text-lg mb-3">{activeCall.phoneNumber}</p>

                            <p className="text-sm font-semibold text-slate-500 mb-1.5 flex items-center gap-1 flex-wrap justify-center">
                              Last assigned was <span className="text-red-500 bg-red-50 dark:bg-red-950/30 px-1.5 py-0.5 rounded text-xs font-bold">2 days</span> ago, Total call duration <span className="text-red-500 bg-red-50 dark:bg-red-950/30 px-1.5 py-0.5 rounded text-xs font-bold">0 minutes</span>
                            </p>
                            <p className="text-xs font-bold text-slate-400 flex items-center gap-1 mb-5">
                              <Clock className="w-3 h-3" /> Next follow-up: {new Date(activeCall.callDate).toLocaleDateString()} by {currentUser?.name}
                            </p>

                            <div className="flex flex-wrap justify-center gap-2 mb-6">
                              <span className={getStatusBadge(activeCall.status, false, true)}>{getStatusDisplayText(activeCall.status)}</span>
                              <span className="bg-blue-600 text-white text-[10px] font-bold uppercase px-3 py-1.5 rounded-lg flex items-center gap-1">⚑ New</span>
                              <span className="bg-slate-700 text-white text-[10px] font-bold uppercase px-3 py-1.5 rounded-lg flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg> Customer</span>
                              <span className="bg-slate-700 text-white text-[10px] font-bold uppercase px-3 py-1.5 rounded-lg flex items-center gap-1">🔒 Private</span>
                              <span className="bg-slate-700 text-white text-[10px] font-bold uppercase px-3 py-1.5 rounded-lg flex items-center gap-1">🏷️ {camp.replace(' Campaign', '')}</span>
                            </div>

                            <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-md mt-2">
                              <button className="w-12 h-12 rounded-full border-2 border-blue-600 text-blue-600 flex items-center justify-center hover:bg-blue-50 transition"><PhoneCall className="w-5 h-5" /></button>
                              <button className="w-12 h-12 rounded-full border-2 border-blue-600 text-blue-600 flex items-center justify-center hover:bg-blue-50 transition"><Phone className="w-5 h-5" /></button>
                              <button className="w-12 h-12 rounded-full border-2 border-blue-600 text-blue-600 flex items-center justify-center hover:bg-blue-50 transition"><Mail className="w-5 h-5" /></button>
                              <button className="w-12 h-12 rounded-full border-2 border-blue-600 text-blue-600 flex items-center justify-center hover:bg-blue-50 transition"><MessageCircle className="w-5 h-5" /></button>
                              <button className="w-12 h-12 rounded-full border-2 border-blue-600 text-blue-600 flex items-center justify-center hover:bg-blue-50 transition"><Search className="w-5 h-5" /></button>
                              <button className="w-12 h-12 rounded-full border-2 border-blue-600 text-blue-600 flex items-center justify-center hover:bg-blue-50 transition"><Clock className="w-5 h-5" /></button>
                              <button className="w-12 h-12 rounded-full border-2 border-blue-600 text-blue-600 flex items-center justify-center hover:bg-blue-50 transition"><FileText className="w-5 h-5" /></button>
                              <button className="w-14 h-14 rounded-full bg-blue-700 text-white flex items-center justify-center shadow-lg hover:bg-blue-600 transition ml-2"><MessageSquare className="w-6 h-6" fill="currentColor" /></button>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* New Call Modal */}
      {showCallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md shadow-2xl flex flex-col max-h-full">
            <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold">Log New Call</h2>
              <button onClick={() => setShowCallModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1">
                ✕
              </button>
            </div>
            <form onSubmit={handleAddCall} className="p-4 sm:p-6 flex flex-col gap-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-semibold mb-1">Client Name</label>
                <input required type="text" className="w-full border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  value={newCallData.clientName} onChange={e => setNewCallData({ ...newCallData, clientName: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Phone Number</label>
                <input required type="text" className="w-full border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  value={newCallData.phoneNumber} onChange={e => setNewCallData({ ...newCallData, phoneNumber: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Status</label>
                <select className="w-full border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                  value={newCallData.status} onChange={e => setNewCallData({ ...newCallData, status: e.target.value })}>
                  <option value="PENDING">Pending</option>
                  <option value="INTERESTED">Interested</option>
                  <option value="NOT_INTERESTED">Not Interested</option>
                  <option value="CALLBACK">Callback</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Campaign</label>
                <select
                  className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                  value={newCallData.campaign || 'Facebook Campaign'}
                  onChange={e => setNewCallData({ ...newCallData, campaign: e.target.value })}
                >
                  <option value="Facebook Campaign">Facebook Campaign</option>
                  <option value="LinkedIn Campaign">LinkedIn Campaign</option>
                  <option value="Google Campaign">Google Campaign</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Notes</label>
                <textarea
                  className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  rows="3"
                  value={newCallData.notes}
                  onChange={e => setNewCallData({ ...newCallData, notes: e.target.value })}
                ></textarea>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row justify-end gap-3 shrink-0 mt-2">
                <button type="button" onClick={() => setShowCallModal(false)} className="w-full sm:w-auto px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition text-center">Cancel</button>
                <button type="submit" className="w-full sm:w-auto px-4 py-2 text-sm font-semibold bg-blue-600 text-white hover:bg-blue-500 rounded-lg transition shadow-md text-center">Save Call Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
