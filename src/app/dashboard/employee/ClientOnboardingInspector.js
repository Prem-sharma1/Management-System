'use client';

import { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  CheckCircle2, 
  FileText, 
  Globe, 
  Camera, 
  Target, 
  Palette, 
  FolderPlus, 
  Key, 
  Layout, 
  Video, 
  User, 
  Clock, 
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export default function ClientOnboardingInspector({ currentUser, allClientTasks, isAdminView = false }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedExecFilter, setSelectedExecFilter] = useState('ALL');
  const [onboardingDetails, setOnboardingDetails] = useState(null);
  const [fetchingDetails, setFetchingDetails] = useState(false);

  // Helper to find assigned executive per client
  const getAssignedExecutive = (c) => {
    if (!c) return 'Unassigned';
    // 1. Check c.ClientTask or allClientTasks
    const tasks = (c.ClientTask && c.ClientTask.length > 0) ? c.ClientTask : (allClientTasks || []).filter(t => t.clientId === c.clientId);
    const dmTask = tasks.find(t => {
      const a = (t.assignTo || '').toLowerCase();
      return (a.includes('digital marketing') || a.includes('social media') || a.includes('posting') || a.includes('report') || a.includes('ads manager')) && t.workingOn && t.workingOn !== 'AUTO';
    });
    if (dmTask) return dmTask.workingOn;

    const anyTask = tasks.find(t => t.workingOn && t.workingOn !== 'AUTO');
    if (anyTask) return anyTask.workingOn;

    return 'Unassigned Staff';
  };

  useEffect(() => {
    async function fetchClients() {
      setLoading(true);
      try {
        const res = await fetch('/api/clients');
        const data = await res.json();
        if (res.ok && data.clients) {
          setClients(data.clients);
          
          // Set initial default executive filter if employee view
          if (currentUser?.name && !isAdminView) {
            setSelectedExecFilter(currentUser.name);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchClients();
  }, [currentUser, isAdminView]);

  // Extract list of all assigned executives
  const availableExecutives = Array.from(new Set(clients.map(c => getAssignedExecutive(c)).filter(name => name && name !== 'Unassigned Staff')));

  // Filter clients based on selected Executive Filter
  const filteredClients = selectedExecFilter === 'ALL'
    ? clients 
    : clients.filter(c => getAssignedExecutive(c).toLowerCase() === selectedExecFilter.toLowerCase());

  // Keep selectedClientId in sync with filtered list
  useEffect(() => {
    if (filteredClients.length > 0) {
      const exists = filteredClients.some(c => c.clientId === selectedClientId);
      if (!exists) {
        setSelectedClientId(filteredClients[0].clientId);
      }
    }
  }, [filteredClients, selectedExecFilter]);

  useEffect(() => {
    async function loadOnboarding() {
      if (!selectedClientId) return;
      setFetchingDetails(true);
      try {
        const res = await fetch(`/api/client/onboarding?clientId=${selectedClientId}`);
        const data = await res.json();
        if (res.ok) {
          setOnboardingDetails(data);
        } else {
          setOnboardingDetails(null);
        }
      } catch (err) {
        console.error(err);
        setOnboardingDetails(null);
      } finally {
        setFetchingDetails(false);
      }
    }

    loadOnboarding();
  }, [selectedClientId]);

  const selectedClient = clients.find(c => c.clientId === selectedClientId) || onboardingDetails?.client;
  const onboardingData = onboardingDetails?.onboardingData;

  const services = (selectedClient?.services || '').toLowerCase();
  const packageName = (selectedClient?.packageName || '').toLowerCase();

  // Filter flags according to Pack
  const isCombine = services.includes('combine') || packageName.includes('combine') || services.includes('combo') || packageName.includes('combo') || (services.includes('meta') && services.includes('google'));
  const isMeta = services.includes('meta') || packageName.includes('meta') || isCombine;
  const isGoogle = services.includes('google') || packageName.includes('google') || isCombine;
  const isWebsite = services.includes('website') || packageName.includes('website') || packageName.includes('static') || packageName.includes('dynamic');
  const isCreative = services.includes('creative') || packageName.includes('creative') || packageName.includes('starter') || packageName.includes('growth');
  const isAiVideo = services.includes('ai video') || packageName.includes('ai video');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl text-white">
      {/* Header Banner & Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-white">Client Brand Onboarding & Form Data</h4>
            <p className="text-xs text-slate-400">View customer-submitted logins & guidelines filtered per assigned executive.</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Executive Filter Dropdown */}
          <div className="flex items-center gap-1.5">
            <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider shrink-0">Executive:</label>
            <select
              value={selectedExecFilter}
              onChange={(e) => setSelectedExecFilter(e.target.value)}
              className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-blue-400 font-bold focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Executives ({clients.length})</option>
              {currentUser?.name && (
                <option value={currentUser.name}>★ My Assigned Clients ({currentUser.name})</option>
              )}
              {availableExecutives.filter(e => e !== currentUser?.name).map((exec) => (
                <option key={exec} value={exec}>
                  👤 {exec}
                </option>
              ))}
            </select>
          </div>

          {/* Company Selector */}
          <div className="flex items-center gap-1.5">
            <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider shrink-0">Company:</label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-medium focus:outline-none focus:border-blue-500 max-w-xs"
            >
              {filteredClients.length > 0 ? (
                filteredClients.map((c) => (
                  <option key={c.clientId} value={c.clientId}>
                    {c.businessName} [{getAssignedExecutive(c)}]
                  </option>
                ))
              ) : (
                <option value="">No clients found for this executive</option>
              )}
            </select>
          </div>
        </div>
      </div>

      {fetchingDetails ? (
        <div className="p-8 text-center text-slate-400">
          <Clock className="w-6 h-6 animate-spin mx-auto text-blue-500 mb-2" />
          <p className="text-xs">Fetching onboarding form data for {selectedClient?.businessName}...</p>
        </div>
      ) : selectedClient ? (
        <div className="space-y-6">
          {/* Client Overview Badge Header */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-white">{selectedClient.businessName}</h3>
                <span className="px-2.5 py-0.5 bg-blue-950 border border-blue-900/60 text-blue-400 rounded-md text-[10px] font-extrabold flex items-center gap-1">
                  <User className="w-3 h-3" /> Executive: {getAssignedExecutive(selectedClient)}
                </span>
                <span className="px-2.5 py-0.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-md text-[10px] font-extrabold">
                  {selectedClient.packageName}
                </span>
                <span className="px-2.5 py-0.5 bg-emerald-950 border border-emerald-900/60 text-emerald-400 rounded-md text-[10px] font-extrabold">
                  {selectedClient.services}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Client ID: <strong className="text-slate-200">{selectedClient.clientId}</strong> | Contact: {selectedClient.contact || selectedClient.email || 'N/A'}
              </p>
            </div>

            <div className="text-right text-xs">
              <span className={`px-2.5 py-1 rounded-lg font-extrabold text-[10px] ${selectedClient.accountReady ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'}`}>
                {selectedClient.accountReady ? '✓ Onboarding Form Submitted' : '⏳ Pending Form Completion'}
              </span>
            </div>
          </div>

          {/* Form Data Content Filtered By Pack */}
          {onboardingData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* 1. General Info */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <h5 className="font-extrabold text-blue-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <Building2 className="w-4 h-4" /> General Company & Brand Profile
                </h5>
                <p><strong className="text-slate-400">Business Name:</strong> <span className="text-white font-semibold">{onboardingData.businessName || selectedClient.businessName}</span></p>
                <p><strong className="text-slate-400">Owner / Client Name:</strong> <span className="text-slate-200">{onboardingData.clientName || selectedClient.clientName || '-'}</span></p>
                <p><strong className="text-slate-400">Industry Sector:</strong> <span className="text-slate-200">{onboardingData.sector || selectedClient.sector || '-'}</span></p>
                <p><strong className="text-slate-400">Website URL:</strong> <a href={onboardingData.websiteUrl} target="_blank" rel="noreferrer" className="text-blue-400 underline">{onboardingData.websiteUrl || selectedClient.website || '-'}</a></p>
                <p><strong className="text-slate-400">Tagline / Slogan:</strong> <span className="text-slate-200">{onboardingData.tagline || '-'}</span></p>
                <p><strong className="text-slate-400">Main Goal:</strong> <span className="text-blue-400 font-extrabold">{onboardingData.mainLeadGoal || 'Lead'}</span></p>
                <p><strong className="text-slate-400">Where you want leads:</strong> <span className="text-emerald-400 font-bold">{onboardingData.leadDestination || 'Instant Form'}</span></p>
                <p><strong className="text-slate-400">Monthly Ad Budget:</strong> <span className="text-amber-400 font-bold">{onboardingData.monthlyAdBudget || '6k to 10k'}</span></p>
                <p><strong className="text-slate-400">Budget Schedule:</strong> <span className="text-purple-400 font-bold">{onboardingData.budgetFrequency || 'Monthly'}</span></p>
                <p><strong className="text-slate-400">Target Audience:</strong> <span className="text-slate-200">{onboardingData.targetAudience || '-'}</span></p>
                <p><strong className="text-slate-400">Brand Colors & Fonts:</strong> <span className="text-slate-200">{onboardingData.brandColors || '-'} ({onboardingData.brandStyle})</span></p>
                <p><strong className="text-slate-400">Asset Drive Link:</strong> {onboardingData.assetDriveLink ? <a href={onboardingData.assetDriveLink} target="_blank" rel="noreferrer" className="text-blue-400 underline flex items-center gap-1 inline-flex"><FolderPlus className="w-3 h-3" /> Open Drive Folder</a> : <span className="text-slate-500">None Provided</span>}</p>
              </div>

              {/* 2. Meta Ads / Social Setup (Shown ONLY for Meta & Combine Plans) */}
              {(isMeta || isCombine) && (
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <h5 className="font-extrabold text-pink-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-slate-800 pb-2">
                    <Camera className="w-4 h-4" /> Meta Ads & Social Media Setup
                  </h5>
                  <p><strong className="text-slate-400">Facebook ID / Email:</strong> <span className="text-white font-semibold">{onboardingData.facebookId || '-'}</span></p>
                  <p><strong className="text-slate-400">Facebook Password:</strong> <span className="text-slate-200 font-mono bg-slate-900 px-2 py-0.5 rounded">{onboardingData.facebookPassword || '-'}</span></p>
                  <p><strong className="text-slate-400">URL for Access:</strong> <a href={onboardingData.accessUrl || onboardingData.fbPageUrl} target="_blank" rel="noreferrer" className="text-blue-400 underline">{onboardingData.accessUrl || onboardingData.fbPageUrl || '-'}</a></p>
                </div>
              )}

              {/* 3. Google Ads Setup (Filtered for Google/Combine) */}
              {(isGoogle || isCombine) && (
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <h5 className="font-extrabold text-emerald-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-slate-800 pb-2">
                    <Globe className="w-4 h-4" /> Google Ads Configuration
                  </h5>
                  <p><strong className="text-slate-400">Google Customer ID:</strong> <span className="text-emerald-300 font-mono font-bold bg-slate-900 px-2 py-0.5 rounded">{onboardingData.googleCustomerId || '-'}</span></p>
                  <p><strong className="text-slate-400">Target Keywords:</strong> <span className="text-slate-200">{onboardingData.googleKeywords || '-'}</span></p>
                  <p><strong className="text-slate-400">Target Locations:</strong> <span className="text-slate-200">{onboardingData.targetLocations || '-'}</span></p>
                  <p><strong className="text-slate-400">Landing Page URL:</strong> <a href={onboardingData.googleLandingPage} target="_blank" rel="noreferrer" className="text-blue-400 underline">{onboardingData.googleLandingPage || '-'}</a></p>
                  <p><strong className="text-slate-400">Primary Goal:</strong> <span className="text-slate-200">{onboardingData.adBudgetGoals || '-'}</span></p>
                </div>
              )}

              {/* 4. Website Development Details (Filtered for Website Plans) */}
              {(isWebsite) && (
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <h5 className="font-extrabold text-purple-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-slate-800 pb-2">
                    <Layout className="w-4 h-4" /> Website Development Requirements
                  </h5>
                  <p><strong className="text-slate-400">Required Pages:</strong> <span className="text-slate-200">{onboardingData.websitePagesRequired || '-'}</span></p>
                  <p><strong className="text-slate-400">Domain & Hosting Access:</strong> <span className="text-slate-200">{onboardingData.domainHostingDetails || '-'}</span></p>
                  <p><strong className="text-slate-400">Reference Websites:</strong> <span className="text-blue-400">{onboardingData.referenceWebsites || '-'}</span></p>
                  <p><strong className="text-slate-400">Key Features Required:</strong> <span className="text-slate-200">{onboardingData.websiteKeyFeatures || '-'}</span></p>
                </div>
              )}

              {/* 5. Creative & AI Video Details (Filtered for Creative/AI Video) */}
              {(isCreative || isAiVideo) && (
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <h5 className="font-extrabold text-amber-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-slate-800 pb-2">
                    <Video className="w-4 h-4" /> Creative & AI Video Preferences
                  </h5>
                  <p><strong className="text-slate-400">Content Languages:</strong> <span className="text-slate-200">{onboardingData.contentLanguages || '-'}</span></p>
                  <p><strong className="text-slate-400">AI Voice & Style:</strong> <span className="text-slate-200">{onboardingData.aiVoiceStyle || '-'}</span></p>
                  <p><strong className="text-slate-400">Dimensions Preferred:</strong> <span className="text-slate-200">{onboardingData.preferredDimensions || '-'}</span></p>
                  <p><strong className="text-slate-400">Reels Inspiration Links:</strong> <span className="text-blue-400">{onboardingData.reelsInspirationLinks || '-'}</span></p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-800 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
              <h5 className="text-sm font-bold text-white">No Customer Form Submission Yet</h5>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                The client for <strong>{selectedClient.businessName}</strong> has not filled out the brand onboarding form in their portal yet.
              </p>
              {selectedClient.requirement && (
                <div className="mt-4 p-3 bg-slate-900 rounded-lg text-xs text-slate-300 text-left border border-slate-800">
                  <span className="font-bold text-slate-400 block mb-1">Initial Account Setup Requirement Notes:</span>
                  {selectedClient.requirement}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-slate-400 text-center py-6">No client selected.</p>
      )}
    </div>
  );
}
