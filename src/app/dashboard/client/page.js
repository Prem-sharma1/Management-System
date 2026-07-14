'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  LogOut,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  Info,
  DollarSign,
  TrendingUp,
  User,
  ShieldCheck,
  Check
} from 'lucide-react';

export default function ClientDashboard() {
  const router = useRouter();
  const [sessionLoading, setSessionLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [clientInfo, setClientInfo] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [taskFilter, setTaskFilter] = useState('All');
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Revisions Modal/State
  const [revisionTask, setRevisionTask] = useState(null);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [showRevisionModal, setShowRevisionModal] = useState(false);

  // Client Feedback & Support states
  const [activePortalTab, setActivePortalTab] = useState('deliverables');
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackType, setFeedbackType] = useState('Feedback');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState('');

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        
        if (!res.ok || !data.user || data.user.role !== 'CLIENT') {
          router.push('/');
          return;
        }
        setSessionLoading(false);
        fetchClientData();
      } catch (err) {
        console.error(err);
        router.push('/');
      }
    }
    checkAuth();
  }, [router]);

  const fetchClientData = async () => {
    setDataLoading(true);
    try {
      const res = await fetch('/api/client/tasks');
      const data = await res.json();
      if (res.ok) {
        setClientInfo(data.client);
        setTasks(data.tasks || []);
      } else {
        setError(data.error || 'Failed to retrieve deliverables data.');
      }

      // Fetch client submitted feedbacks/concerns
      const fbRes = await fetch('/api/client/feedback');
      const fbData = await fbRes.json();
      if (fbRes.ok) {
        setFeedbacks(fbData.feedbacks || []);
      }
    } catch (err) {
      setError('Could not establish connection to deliverables api.');
    } finally {
      setDataLoading(false);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) return;

    setActionLoading(true);
    setFeedbackSuccess('');
    setError('');
    try {
      const res = await fetch('/api/client/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: feedbackType,
          rating: feedbackType === 'Feedback' ? feedbackRating : null,
          message: feedbackMessage.trim()
        })
      });

      const data = await res.json();
      if (res.ok) {
        setFeedbackSuccess(`${feedbackType} submitted successfully!`);
        setFeedbackMessage('');
        setFeedbackRating(5);
        
        // Refresh feedback list
        const fbRes = await fetch('/api/client/feedback');
        const fbData = await fbRes.json();
        if (fbRes.ok) {
          setFeedbacks(fbData.feedbacks || []);
        }
      } else {
        setError(data.error || 'Failed to submit feedback.');
      }
    } catch (err) {
      setError('Error connecting to the server.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = async () => {
    setActionLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const submitRevisionRequest = async (e) => {
    e.preventDefault();
    if (!revisionNotes.trim()) return;

    setActionLoading(true);
    try {
      // In this system, requesting revision updates the task status to 'Revision'
      const res = await fetch(`/api/client-tasks/${revisionTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Revision',
          notes: revisionNotes.trim()
        })
      });

      if (res.ok) {
        setShowRevisionModal(false);
        setRevisionNotes('');
        setRevisionTask(null);
        fetchClientData();
      } else {
        alert('Failed to submit revision request. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting revision request.');
    } finally {
      setActionLoading(false);
    }
  };

  // Date Parsing helper
  const parseDbDate = (dStr) => {
    if (!dStr) return new Date();
    const parts = dStr.split('-');
    if (parts.length < 3) return new Date();
    const [day, mStr, year] = parts;
    const months = {
      Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
      Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
    };
    return new Date(parseInt(year), months[mStr] || 0, parseInt(day));
  };

  const formatDbDate = (date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const d = date.getDate().toString().padStart(2, '0');
    const m = months[date.getMonth()];
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
  };

  // Calculations for current cycle
  const getCycleStats = () => {
    if (!clientInfo) return { startStr: '', expiryStr: '', daysLeft: 0, progressPct: 0 };
    
    const cycleStart = parseDbDate(clientInfo.joiningDate);
    const cycleEnd = new Date(cycleStart.getTime() + 21 * 24 * 60 * 60 * 1000);
    const today = new Date();
    
    const totalDays = 21;
    const timeDiff = cycleEnd.getTime() - today.getTime();
    const daysLeft = Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
    
    const elapsedDays = Math.max(0, Math.min(totalDays, totalDays - daysLeft));
    const progressPct = Math.round((elapsedDays / totalDays) * 100);

    return {
      startStr: clientInfo.joiningDate,
      expiryStr: formatDbDate(cycleEnd),
      daysLeft,
      progressPct
    };
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium">Authorizing client session...</p>
        </div>
      </div>
    );
  }

  // Filter tasks belonging only to the current contract cycle
  const cycleStart = clientInfo ? parseDbDate(clientInfo.joiningDate) : new Date();
  const currentCycleTasks = tasks.filter(t => {
    const taskDate = parseDbDate(t.date);
    // Include tasks started on or after cycle start date
    return taskDate.getTime() >= (cycleStart.getTime() - 12 * 60 * 60 * 1000);
  });

  const totalDeliverables = currentCycleTasks.length;
  const completedDeliverables = currentCycleTasks.filter(t => 
    ['Done', 'Completed', 'Completed (Done)'].includes(t.status)
  ).length;
  const pendingDeliverables = totalDeliverables - completedDeliverables;
  const completionPct = totalDeliverables > 0 ? Math.round((completedDeliverables / totalDeliverables) * 100) : 0;

  // Filtered deliverables checklist list
  const filteredTasks = currentCycleTasks
    .filter(t => {
      if (taskFilter === 'All') return true;
      if (taskFilter === 'Graphics') return t.postType === 'Graphic';
      if (taskFilter === 'Reels') return t.postType === 'Reel';
      if (taskFilter === 'AI Videos') return t.postType === 'AI Video';
      if (taskFilter === 'Reports') return t.postType === 'Report';
      return true;
    })
    .filter(t => {
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      return t.taskTitle.toLowerCase().includes(q) || (t.workingOn && t.workingOn.toLowerCase().includes(q));
    });

  const cycle = getCycleStats();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none antialiased">
      
      {/* Header bar */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-tight text-white">{clientInfo?.businessName || 'Workspace'}</h1>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Customer Portal | ID: {clientInfo?.clientId}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          disabled={actionLoading}
          className="py-1.5 px-3 rounded-lg text-[10px] font-bold bg-slate-800/60 hover:bg-red-950/20 border border-slate-700/60 hover:border-red-900/40 text-slate-300 hover:text-red-400 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit Portal</span>
        </button>
      </header>

      {/* Subheader portal tab navigation */}
      <div className="bg-slate-900/40 border-b border-slate-800/60 px-6 flex items-center text-[10px] uppercase font-bold tracking-wider">
        <button
          onClick={() => setActivePortalTab('deliverables')}
          className={`py-3 px-4 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
            activePortalTab === 'deliverables'
              ? 'border-blue-500 text-white font-extrabold'
              : 'border-transparent text-slate-450 hover:text-slate-200'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Deliverables Checklist</span>
        </button>
        <button
          onClick={() => setActivePortalTab('feedback')}
          className={`py-3 px-4 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
            activePortalTab === 'feedback'
              ? 'border-blue-500 text-white font-extrabold'
              : 'border-transparent text-slate-450 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Submit Feedback & Concerns</span>
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        
        {error && (
          <div className="p-4 bg-red-950/40 border border-red-900/50 rounded-xl flex items-center gap-3 text-red-400 text-xs">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Dashboard Grid */}
        {dataLoading ? (
          <div className="h-96 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-slate-450 text-xs font-semibold">Generating your timeline checklist...</p>
          </div>
        ) : activePortalTab === 'deliverables' ? (
          <>
            {/* Top row: Client Details & Cycle Countdown Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Client Info Card */}
              <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between gap-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none"></div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="px-2 py-0.5 bg-blue-950 border border-blue-900/60 text-blue-400 rounded text-[9px] font-bold uppercase tracking-wider">
                        {clientInfo?.packageName || 'Plan Tier'}
                      </span>
                      <h2 className="text-xl font-bold text-white mt-1.5">{clientInfo?.clientName || clientInfo?.businessName}</h2>
                      <p className="text-[10px] text-slate-400 mt-0.5">Primary Portal Contact Email: {clientInfo?.email || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Monthly Volume</span>
                      <span className="text-xl font-black text-white mt-0.5">₹{clientInfo?.packageAmount?.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-t border-slate-800/80 pt-4">
                    <div>
                      <span className="text-[9px] text-slate-550 uppercase font-bold block">Business Sector</span>
                      <span className="text-[11px] font-semibold text-slate-200 mt-0.5 block">{clientInfo?.sector || 'General'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-550 uppercase font-bold block">Active Channels</span>
                      <span className="text-[11px] font-semibold text-slate-200 mt-0.5 block line-clamp-1">{clientInfo?.services}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-550 uppercase font-bold block">Setup Check</span>
                      <span className="text-[11px] font-semibold mt-0.5 flex items-center gap-1">
                        {clientInfo?.accountReady ? (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-400">Ready</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5 text-orange-400" />
                            <span className="text-orange-400">Pending</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {clientInfo?.notes && (
                  <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/60 text-[10px] text-slate-400 italic">
                    <strong>Business Requirements:</strong> {clientInfo.notes}
                  </div>
                )}
              </div>

              {/* Cycle Tracker Card */}
              <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between gap-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-indigo-400" />
                      Active 21-Day Contract Cycle
                    </span>
                    <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[9px] font-bold">
                      Cycle Countdowns
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-slate-950/40 border border-slate-800/60 p-3.5 rounded-xl">
                    <div>
                      <span className="text-[9px] text-slate-550 uppercase font-bold block">Cycle Start Date</span>
                      <span className="text-xs font-bold text-white mt-1 block">{cycle.startStr}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-550 uppercase font-bold block">Calculated Expiry Date</span>
                      <span className="text-xs font-bold text-white mt-1 block">{cycle.expiryStr}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-slate-450">Active Cycle Progress</span>
                      {cycle.daysLeft === 0 ? (
                        <span className="text-orange-500 uppercase tracking-wider">Ends Today</span>
                      ) : (
                        <span className="text-indigo-400">{cycle.daysLeft} days remaining</span>
                      )}
                    </div>
                    <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${cycle.progressPct}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-400 bg-slate-950/30 p-2.5 rounded-xl border border-slate-800/40">
                  <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <p>Upon plan expiry, subscription renewing will dynamically schedule your next 21-day deliverables schedule.</p>
                </div>
              </div>

            </div>

            {/* Middle row: Progress Metrics cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col gap-1 relative overflow-hidden">
                <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Total Scheduled Deliverables</span>
                <div className="text-3xl font-black text-white mt-1.5">{totalDeliverables}</div>
                <span className="text-[9px] text-slate-500 font-medium mt-1 block">Full deliverables volume in current cycle</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col gap-1 relative overflow-hidden">
                <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Completed / Approved</span>
                <div className="text-3xl font-black text-emerald-500 mt-1.5 flex items-baseline gap-1.5">
                  {completedDeliverables}
                  <span className="text-[10px] text-slate-500 font-bold">/ {totalDeliverables}</span>
                </div>
                <span className="text-[9px] text-slate-500 font-medium mt-1 block">Tasks ready for social publication</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col gap-1 relative overflow-hidden">
                <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Pending Work in Progress</span>
                <div className="text-3xl font-black text-blue-500 mt-1.5 flex items-baseline gap-1.5">
                  {pendingDeliverables}
                  <span className="text-[10px] text-slate-500 font-bold">/ {totalDeliverables}</span>
                </div>
                <span className="text-[9px] text-slate-500 font-medium mt-1 block">Ongoing creation and editing cycle</span>
              </div>

              {/* Progress Ring Card */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Completion Percentage</span>
                  <div className="text-3xl font-black text-white mt-1">{completionPct}%</div>
                  <span className="text-[9px] text-slate-500 font-medium block">Approved deliverables share</span>
                </div>
                
                {/* SVG Progress Ring */}
                <div className="relative w-16 h-16 shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-950"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-emerald-500"
                      strokeWidth="3.5"
                      strokeDasharray={`${completionPct}, 100`}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-slate-200">
                    {completionPct}%
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Row: Deliverables Timeline / Checklist */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
              
              {/* Filter controls */}
              <div className="p-5 border-b border-slate-800/80 bg-slate-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-extrabold text-sm text-white">Plan Deliverables Progress Checklist</h3>
                  <p className="text-[10px] text-slate-450 mt-0.5">Track live creation status, assigned departments, and request revisions directly.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Filter tabs */}
                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                    {['All', 'Graphics', 'Reels', 'AI Videos', 'Reports'].map(type => (
                      <button
                        key={type}
                        onClick={() => setTaskFilter(type)}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition ${
                          taskFilter === type
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-455 hover:text-slate-205'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  {/* Search box */}
                  <div className="relative w-full md:w-56 shrink-0 text-xs">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                      <Search className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="text"
                      placeholder="Search deliverables..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-4 py-1.5 border border-slate-850 bg-slate-950 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Checklist Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950/40 text-slate-400 font-bold border-b border-slate-800 text-[9px] uppercase tracking-wider">
                      <th className="p-4 pl-6">Estimated Scheduled Date</th>
                      <th className="p-4">Deliverable Title</th>
                      <th className="p-4">Deliverable Category</th>
                      <th className="p-4">Responsible Department</th>
                      <th className="p-4">Production Staff</th>
                      <th className="p-4">Creation Status</th>
                      <th className="p-4 text-right pr-6">Portal Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-855">
                    {filteredTasks.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="p-12 text-center text-slate-400 italic">
                          No deliverables match your search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredTasks.map((task) => {
                        const isDone = ['Done', 'Completed', 'Completed (Done)'].includes(task.status);
                        const isRev = task.status === 'Revision';
                        const isIP = task.status === 'In Progress';
                        
                        return (
                          <tr key={task.id} className="hover:bg-slate-955/10 transition text-slate-300">
                            
                            {/* Date */}
                            <td className="p-4 pl-6 font-semibold whitespace-nowrap text-slate-400">
                              {task.date}
                            </td>

                            {/* Title */}
                            <td className="p-4 font-bold text-white">
                              {task.taskTitle}
                            </td>

                            {/* Category */}
                            <td className="p-4 font-medium uppercase text-[10px]">
                              <span className={`px-2 py-0.5 rounded border ${
                                task.postType === 'Graphic' ? 'bg-indigo-950/30 text-indigo-400 border-indigo-900/40' :
                                task.postType === 'Reel' ? 'bg-pink-955/30 text-pink-400 border-pink-900/40' :
                                task.postType === 'AI Video' ? 'bg-purple-950/30 text-purple-400 border-purple-900/40' :
                                'bg-slate-800/40 text-slate-400 border-slate-700/40'
                              }`}>
                                {task.postType || 'Content'}
                              </span>
                            </td>

                            {/* Department */}
                            <td className="p-4 text-slate-400 font-semibold">
                              {task.assignTo}
                            </td>

                            {/* Production Staff */}
                            <td className="p-4 text-slate-300 font-bold">
                              {task.workingOn || 'Pending Pool Allocation'}
                            </td>

                            {/* Status */}
                            <td className="p-4 font-bold">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider ${
                                isDone ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/50' :
                                isRev ? 'bg-red-955 text-red-400 border border-red-900/50' :
                                isIP ? 'bg-blue-950 text-blue-400 border border-blue-900/50' :
                                'bg-slate-900 text-slate-400 border border-slate-800'
                              }`}>
                                {isDone ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span>Approved</span>
                                  </>
                                ) : isRev ? (
                                  <>
                                    <AlertCircle className="w-3 h-3 text-red-400" />
                                    <span>Revision</span>
                                  </>
                                ) : isIP ? (
                                  <>
                                    <Clock className="w-3 h-3 text-blue-400 animate-pulse" />
                                    <span>In Progress</span>
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-3 h-3 text-slate-400" />
                                    <span>Scheduled</span>
                                  </>
                                )}
                              </span>
                            </td>

                            {/* Revision request action */}
                            <td className="p-4 text-right pr-6 whitespace-nowrap">
                              {!isDone && (
                                <button
                                  onClick={() => {
                                    setRevisionTask(task);
                                    setShowRevisionModal(true);
                                  }}
                                  className="py-1 px-2.5 rounded-lg text-[9px] font-bold transition flex items-center gap-1.5 shadow-sm ml-auto bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                                >
                                  <MessageSquare className="w-3 h-3" />
                                  <span>Request Revision</span>
                                </button>
                              )}
                              {isDone && (
                                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 justify-end">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                  Ready
                                </span>
                              )}
                            </td>

                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          </>
        ) : (
          /* Feedback & Concerns Portal tab */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in text-xs">
            
            {/* Submit Form Card */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[480px]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    Submit Feedback & Concerns
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1">Provide your valuable review or raise issues regarding client account deliverables directly to managers.</p>
                </div>

                {feedbackSuccess && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-900/50 rounded-xl flex items-center gap-2 text-emerald-400 font-bold">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{feedbackSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleSubmitFeedback} className="space-y-4">
                  
                  {/* Type Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Submission Category</label>
                    <div className="flex gap-4">
                      {[
                        { key: 'Feedback', label: 'General Review / Feedback' },
                        { key: 'Concern', label: 'Work Concern / Issue' }
                      ].map(t => (
                        <button
                          key={t.key}
                          type="button"
                          onClick={() => {
                            setFeedbackType(t.key);
                            setFeedbackSuccess('');
                          }}
                          className={`flex-1 p-3 rounded-xl border text-[10px] font-bold text-left transition flex items-center justify-between cursor-pointer ${
                            feedbackType === t.key
                              ? t.key === 'Feedback'
                                ? 'bg-emerald-950/20 border-emerald-500 text-emerald-400 shadow-sm'
                                : 'bg-red-955/15 border-red-500 text-red-400 shadow-sm'
                              : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-950/85'
                          }`}
                        >
                          <span>{t.label}</span>
                          <span className={`w-2 h-2 rounded-full ${
                            feedbackType === t.key
                              ? t.key === 'Feedback' ? 'bg-emerald-500' : 'bg-red-500'
                              : 'bg-slate-800'
                          }`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Star Rating - Only visible if Type is Feedback */}
                  {feedbackType === 'Feedback' && (
                    <div className="space-y-2 animate-fade-in">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Select Rating</label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setFeedbackRating(star)}
                            className="p-1 cursor-pointer transition transform hover:scale-110"
                          >
                            <svg
                              className={`w-6 h-6 ${
                                star <= feedbackRating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                              }`}
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 h 14.14 2 9.27 8.91 8.26 12" />
                            </svg>
                          </button>
                        ))}
                        <span className="text-[10px] text-slate-400 font-bold ml-2">
                          ({feedbackRating === 5 ? 'Excellent' : feedbackRating === 4 ? 'Very Good' : feedbackRating === 3 ? 'Good' : feedbackRating === 2 ? 'Fair' : 'Poor'})
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Message Input */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                      {feedbackType === 'Feedback' ? 'Review Message' : 'Describe your Concern / Issue'}
                    </label>
                    <textarea
                      value={feedbackMessage}
                      onChange={(e) => {
                        setFeedbackMessage(e.target.value);
                        setFeedbackSuccess('');
                      }}
                      placeholder={
                        feedbackType === 'Feedback'
                          ? "Share your overall experience with our service, graphics, timing, or employee work..."
                          : "Provide specific details of the issue or concern. E.g., wrong logo used, tone adjustment needed, or schedule delays..."
                      }
                      rows={5}
                      required
                      className="w-full p-3 border border-slate-800 bg-slate-950 rounded-xl text-slate-200 placeholder-slate-650 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={actionLoading || !feedbackMessage.trim()}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold transition flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50 cursor-pointer text-[10px] uppercase tracking-wider
                      ${feedbackType === 'Feedback' 
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/10' 
                        : 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/10'
                      }`}
                  >
                    {actionLoading ? 'Submitting...' : `Submit Client ${feedbackType}`}
                  </button>

                </form>
              </div>

              <div className="mt-6 flex items-start gap-2 text-[10px] text-slate-450 bg-slate-950/30 p-2.5 rounded-xl border border-slate-800/40">
                <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <p>Concerns and reviews are directly routed to the Admin panel. If you need immediate direct help, please reach out to your campaign executive.</p>
              </div>

            </div>

            {/* Submissions Log History Card */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-4 max-h-[580px] overflow-hidden">
              <div>
                <h3 className="font-extrabold text-sm text-white">Submissions History</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Track reviews and issues previously raised for this contract.</p>
              </div>

              {/* History list */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {feedbacks.length === 0 ? (
                  <div className="h-40 flex flex-col items-center justify-center text-slate-400 italic text-[10px]">
                    No feedback or concerns submitted yet.
                  </div>
                ) : (
                  feedbacks.map((fb) => {
                    const isPending = fb.status === 'Pending';
                    const isConcern = fb.type === 'Concern';
                    const dateObj = new Date(fb.createdAt);
                    
                    return (
                      <div
                        key={fb.id}
                        className={`p-3.5 rounded-xl border flex flex-col gap-2.5 bg-slate-950/35 transition ${
                          isConcern 
                            ? 'border-red-950/60 hover:border-red-900/60' 
                            : 'border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                              isConcern ? 'bg-red-950/60 text-red-400 border border-red-900/50' : 'bg-emerald-950 text-emerald-400 border border-emerald-900/40'
                            }`}>
                              {fb.type}
                            </span>
                            
                            {/* Stars rating if feedback */}
                            {!isConcern && fb.rating && (
                              <div className="flex items-center text-amber-400">
                                {Array.from({ length: fb.rating }).map((_, idx) => (
                                  <span key={idx}>★</span>
                                ))}
                              </div>
                            )}
                          </div>

                          <span className={`px-2 py-0.5 rounded-full text-[7px] font-bold uppercase tracking-wider ${
                            isPending 
                              ? 'bg-slate-800 text-slate-350 border border-slate-700/60' 
                              : 'bg-emerald-955/80 text-emerald-400 border border-emerald-900/60'
                          }`}>
                            {fb.status}
                          </span>
                        </div>

                        <p className="text-slate-300 font-medium whitespace-pre-wrap leading-relaxed text-[10px]">
                          {fb.message}
                        </p>

                        <div className="text-[8px] text-slate-500 font-bold border-t border-slate-850/60 pt-2 flex justify-between">
                          <span>Submitted</span>
                          <span>{dateObj.toLocaleDateString()} {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Revision notes popup Modal */}
      {showRevisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl relative">
            
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-extrabold text-sm text-white">Submit Revision Request</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Task: {revisionTask?.taskTitle} | Assigned to {revisionTask?.workingOn}</p>
              </div>
              <button
                onClick={() => {
                  setShowRevisionModal(false);
                  setRevisionTask(null);
                }}
                className="text-slate-450 hover:text-slate-200 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={submitRevisionRequest} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Revision Instructions</label>
                <textarea
                  value={revisionNotes}
                  onChange={(e) => setRevisionNotes(e.target.value)}
                  placeholder="Provide precise details of what changes are required for this deliverable..."
                  rows={4}
                  required
                  className="w-full p-3 border border-slate-800 bg-slate-950 rounded-xl text-xs text-slate-200 placeholder-slate-650 focus:outline-none focus:ring-1 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowRevisionModal(false);
                    setRevisionTask(null);
                  }}
                  className="px-3.5 py-2 border border-slate-800 hover:bg-slate-800 text-[10px] font-bold rounded-lg text-slate-400 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-[10px] font-bold rounded-lg text-white shadow-sm shadow-blue-500/10 transition cursor-pointer"
                >
                  {actionLoading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
