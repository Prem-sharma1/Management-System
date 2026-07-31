'use client';

import { useState, useEffect } from 'react';
import { 
  Building2, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  FileText, 
  Globe, 
  Camera, 
  Target, 
  Palette, 
  FolderPlus, 
  Key, 
  Layout, 
  Video, 
  Edit3, 
  Clock
} from 'lucide-react';

export default function BrandOnboardingForm({ clientInfo, assignedExecutive, onSaveSuccess }) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);

  const services = (clientInfo?.services || '').toLowerCase();
  const packageName = (clientInfo?.packageName || '').toLowerCase();

  // Pack detection flags
  const isCombine = services.includes('combine') || packageName.includes('combine') || services.includes('combo') || packageName.includes('combo') || (services.includes('meta') && services.includes('google'));
  const isMeta = services.includes('meta') || packageName.includes('meta') || isCombine;
  const isGoogle = services.includes('google') || packageName.includes('google') || isCombine;
  const isWebsite = services.includes('website') || packageName.includes('website') || packageName.includes('static') || packageName.includes('dynamic');
  const isCreative = services.includes('creative') || packageName.includes('creative') || packageName.includes('starter') || packageName.includes('growth');
  const isAiVideo = services.includes('ai video') || packageName.includes('ai video');

  // Form State
  const [formData, setFormData] = useState({
    businessName: clientInfo?.businessName || '',
    clientName: clientInfo?.clientName || '',
    contactEmail: clientInfo?.email || '',
    contactPhone: clientInfo?.contact || '',
    websiteUrl: clientInfo?.website || '',
    sector: clientInfo?.sector || '',
    tagline: '',
    mainLeadGoal: 'Lead',
    leadDestination: 'Instant Form',
    monthlyAdBudget: '6k to 10k',
    budgetFrequency: 'Monthly',
    targetAudience: '',
    brandColors: '',
    brandStyle: 'Modern & Clean',
    assetDriveLink: '',
    competitorLinks: '',
    specialInstructions: '',

    // Meta Ads & Social Media Fields
    metaAccessMethod: 'id_password', // 'id_password' or 'access_url'
    facebookId: '',
    facebookPassword: '',
    accessUrl: '',

    // Google Ads Fields
    googleCustomerId: '',
    googleKeywords: '',
    targetLocations: '',
    googleLandingPage: '',
    adBudgetGoals: 'Lead Generation',

    // Website Development Fields
    websitePagesRequired: 'Home, About Us, Services, Contact Us',
    domainHostingDetails: '',
    referenceWebsites: '',
    websiteKeyFeatures: 'Contact Form, WhatsApp Chat Button',

    // Creative & AI Video Fields
    contentLanguages: 'English & Hindi',
    aiVoiceStyle: 'Professional & Energetic',
    preferredDimensions: 'Story (9:16) & Feed (1:1)',
    reelsInspirationLinks: ''
  });

  useEffect(() => {
    async function loadExistingOnboarding() {
      setLoading(true);
      try {
        const res = await fetch(`/api/client/onboarding?clientId=${clientInfo?.clientId || ''}`);
        const data = await res.json();
        if (res.ok && data.onboardingData) {
          setFormData(prev => ({
            ...prev,
            ...data.onboardingData
          }));
          setIsEditMode(false);
        } else {
          setIsEditMode(true);
        }
      } catch (err) {
        console.error(err);
        setIsEditMode(true);
      } finally {
        setLoading(false);
      }
    }

    if (clientInfo?.clientId) {
      loadExistingOnboarding();
    } else {
      setLoading(false);
      setIsEditMode(true);
    }
  }, [clientInfo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await fetch('/api/client/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: clientInfo?.clientId,
          formData
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg('Your Brand Onboarding Details have been submitted successfully! Your assigned Executive will review them.');
        setIsEditMode(false);
        if (onSaveSuccess) onSaveSuccess();
      } else {
        setErrorMsg(data.error || 'Failed to submit onboarding form.');
      }
    } catch (err) {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
        <Clock className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-3" />
        <p className="text-sm font-semibold">Loading your brand onboarding form...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-blue-950 border border-blue-900/60 text-blue-400 rounded-md text-[10px] font-extrabold uppercase tracking-wider">
              Client Onboarding Portal
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-950 border border-emerald-900/60 text-emerald-400 rounded-md text-[10px] font-extrabold">
              Pack: {clientInfo?.packageName || 'Custom Package'}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white">Brand Onboarding & Information Form</h2>
          <p className="text-xs text-slate-400 max-w-2xl">
            This form is dynamically customized for your <strong>{clientInfo?.services || clientInfo?.packageName || 'Active Plan'}</strong>.
            Submit your brand guidelines, login credentials, target audience, and content requirements so your assigned team can begin work.
          </p>
          {assignedExecutive && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-950/80 border border-blue-900/60 rounded-xl text-xs text-blue-300 font-semibold mt-2">
              <span>Assigned Executive: <strong className="text-white">{assignedExecutive}</strong></span>
            </div>
          )}
        </div>

        {!isEditMode && (
          <button
            onClick={() => setIsEditMode(true)}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition shrink-0"
          >
            <Edit3 className="w-4 h-4 text-blue-400" />
            <span>Update / Edit Onboarding Form</span>
          </button>
        )}
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-950/50 border border-emerald-800 text-emerald-300 rounded-2xl text-xs font-semibold flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-950/50 border border-red-800 text-red-300 rounded-2xl text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* VIEW ONLY SUMMARY (When not editing) */}
      {!isEditMode ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Submitted Brand Onboarding Details
            </h3>
            <span className="text-[11px] text-slate-400">
              Submitted on: {formData.submittedAt ? new Date(formData.submittedAt).toLocaleDateString() : 'Active Record'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* General */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
              <h4 className="font-extrabold text-blue-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> General Brand Info
              </h4>
              <p><strong className="text-slate-400">Business Name:</strong> <span className="text-white font-semibold">{formData.businessName || '-'}</span></p>
              <p><strong className="text-slate-400">Contact Person:</strong> <span className="text-slate-200">{formData.clientName || '-'}</span></p>
              <p><strong className="text-slate-400">Industry Sector:</strong> <span className="text-slate-200">{formData.sector || '-'}</span></p>
              <p><strong className="text-slate-400">Website URL:</strong> <span className="text-blue-400">{formData.websiteUrl || '-'}</span></p>
              <p><strong className="text-slate-400">Tagline / Slogan:</strong> <span className="text-slate-200">{formData.tagline || '-'}</span></p>
              <p><strong className="text-slate-400">Main Goal:</strong> <span className="text-blue-400 font-extrabold">{formData.mainLeadGoal || 'Lead'}</span></p>
              <p><strong className="text-slate-400">Where you want leads:</strong> <span className="text-emerald-400 font-bold">{formData.leadDestination || 'Instant Form'}</span></p>
              <p><strong className="text-slate-400">Monthly Ad Budget:</strong> <span className="text-amber-400 font-bold">{formData.monthlyAdBudget || '6k to 10k'}</span></p>
              <p><strong className="text-slate-400">Budget Schedule:</strong> <span className="text-purple-400 font-bold">{formData.budgetFrequency || 'Monthly'}</span></p>
              <p><strong className="text-slate-400">Target Audience:</strong> <span className="text-slate-200">{formData.targetAudience || '-'}</span></p>
              <p><strong className="text-slate-400">Brand Colors & Style:</strong> <span className="text-slate-200">{formData.brandColors} ({formData.brandStyle})</span></p>
              <p><strong className="text-slate-400">Assets Drive Link:</strong> <a href={formData.assetDriveLink} target="_blank" rel="noreferrer" className="text-blue-400 underline">{formData.assetDriveLink || 'None'}</a></p>
            </div>

            {/* Meta Ads / Social (Shown ONLY for Meta & Combine Plans) */}
            {(isMeta || isCombine) && (
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                <h4 className="font-extrabold text-pink-400 uppercase tracking-wider text-[11px] flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="flex items-center gap-1.5"><Camera className="w-3.5 h-3.5" /> 2. Meta Ads & Social Media Accounts Setup</span>
                  <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-400 font-extrabold text-[10px] uppercase border border-blue-900/60">
                    {formData.metaAccessMethod === 'access_url' ? 'Send Access URL' : 'ID & Password'}
                  </span>
                </h4>
                {formData.metaAccessMethod === 'access_url' ? (
                  <p><strong className="text-slate-400">URL for Access:</strong> <a href={formData.accessUrl || formData.fbPageUrl} target="_blank" rel="noreferrer" className="text-blue-400 underline">{formData.accessUrl || formData.fbPageUrl || '-'}</a></p>
                ) : (
                  <>
                    <p><strong className="text-slate-400">Facebook ID / Email:</strong> <span className="text-white font-semibold">{formData.facebookId || '-'}</span></p>
                    <p><strong className="text-slate-400">Facebook Password:</strong> <span className="text-slate-200 font-mono bg-slate-900 px-2 py-0.5 rounded">{formData.facebookPassword || '-'}</span></p>
                  </>
                )}
              </div>
            )}

            {/* Google Ads */}
            {(isGoogle || isCombine) && (
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                <h4 className="font-extrabold text-emerald-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" /> Google Ads Configuration
                </h4>
                <p><strong className="text-slate-400">Google Customer ID:</strong> <span className="text-slate-200">{formData.googleCustomerId || '-'}</span></p>
                <p><strong className="text-slate-400">Target Keywords:</strong> <span className="text-slate-200">{formData.googleKeywords || '-'}</span></p>
                <p><strong className="text-slate-400">Target Locations:</strong> <span className="text-slate-200">{formData.targetLocations || '-'}</span></p>
                <p><strong className="text-slate-400">Landing Page URL:</strong> <span className="text-blue-400">{formData.googleLandingPage || '-'}</span></p>
                <p><strong className="text-slate-400">Primary Bidding Goal:</strong> <span className="text-slate-200">{formData.adBudgetGoals || '-'}</span></p>
              </div>
            )}

            {/* Website Dev */}
            {(isWebsite) && (
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                <h4 className="font-extrabold text-purple-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Layout className="w-3.5 h-3.5" /> Website Development Requirements
                </h4>
                <p><strong className="text-slate-400">Required Pages:</strong> <span className="text-slate-200">{formData.websitePagesRequired || '-'}</span></p>
                <p><strong className="text-slate-400">Domain & Hosting:</strong> <span className="text-slate-200">{formData.domainHostingDetails || '-'}</span></p>
                <p><strong className="text-slate-400">Reference Websites:</strong> <span className="text-blue-400">{formData.referenceWebsites || '-'}</span></p>
                <p><strong className="text-slate-400">Required Features:</strong> <span className="text-slate-200">{formData.websiteKeyFeatures || '-'}</span></p>
              </div>
            )}

            {/* Creative & AI Video */}
            {(isCreative || isAiVideo) && (
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                <h4 className="font-extrabold text-amber-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5" /> Creative & AI Video Preferences
                </h4>
                <p><strong className="text-slate-400">Languages:</strong> <span className="text-slate-200">{formData.contentLanguages || '-'}</span></p>
                <p><strong className="text-slate-400">AI Voice & Style:</strong> <span className="text-slate-200">{formData.aiVoiceStyle || '-'}</span></p>
                <p><strong className="text-slate-400">Dimensions Preferred:</strong> <span className="text-slate-200">{formData.preferredDimensions || '-'}</span></p>
                <p><strong className="text-slate-400">Reels Inspiration Links:</strong> <span className="text-blue-400">{formData.reelsInspirationLinks || '-'}</span></p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* EDIT FORM */
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-8 shadow-2xl">
          
          {/* SECTION 1: General Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Building2 className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-extrabold text-white">1. General Brand & Company Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 mb-1">Business Name *</label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 mb-1">Contact Person / Owner Name</label>
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 mb-1">Industry / Sector *</label>
                <input
                  type="text"
                  name="sector"
                  value={formData.sector}
                  onChange={handleChange}
                  placeholder="e.g. Healthcare, Real Estate, E-commerce, Restaurant"
                  required
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 mb-1">Website URL (if any)</label>
                <input
                  type="url"
                  name="websiteUrl"
                  value={formData.websiteUrl}
                  onChange={handleChange}
                  placeholder="https://yourwebsite.com"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 mb-1">Brand Tagline / Slogan</label>
                <input
                  type="text"
                  name="tagline"
                  value={formData.tagline}
                  onChange={handleChange}
                  placeholder="e.g. Quality You Can Trust"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 mb-1">What is your main goal *</label>
                <select
                  name="mainLeadGoal"
                  value={formData.mainLeadGoal || 'Lead'}
                  onChange={handleChange}
                  required
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Lead">Lead</option>
                  <option value="Appointments">Appointments</option>
                  <option value="Website traffic">Website traffic</option>
                  <option value="Brand awareness">Brand awareness</option>
                  <option value="Sales">Sales</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 mb-1">Where you want to get leads: *</label>
                <select
                  name="leadDestination"
                  value={formData.leadDestination || 'Instant Form'}
                  onChange={handleChange}
                  required
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Instant Form">Instant Form</option>
                  <option value="Call">Call</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Email">Email</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 mb-1">What is your Monthly ad budget *</label>
                <select
                  name="monthlyAdBudget"
                  value={formData.monthlyAdBudget || '6k to 10k'}
                  onChange={handleChange}
                  required
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="6k to 10k">6k to 10k</option>
                  <option value="10k to 15k">10k to 15k</option>
                  <option value="15k above">15k above</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 mb-1">How you include your budget: *</label>
                <select
                  name="budgetFrequency"
                  value={formData.budgetFrequency || 'Monthly'}
                  onChange={handleChange}
                  required
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="weekly">weekly</option>
                  <option value="Twice in month">Twice in month</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 mb-1">Target Audience Profile</label>
                <input
                  type="text"
                  name="targetAudience"
                  value={formData.targetAudience}
                  onChange={handleChange}
                  placeholder="e.g. Men & Women 25-45 yrs, Tech Professionals in Mumbai"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 mb-1">Brand Color Palette (Hex/Names)</label>
                <input
                  type="text"
                  name="brandColors"
                  value={formData.brandColors}
                  onChange={handleChange}
                  placeholder="e.g. Deep Blue (#0F172A), Gold (#F59E0B)"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 mb-1">Brand Assets Drive / Dropbox Link</label>
                <input
                  type="url"
                  name="assetDriveLink"
                  value={formData.assetDriveLink}
                  onChange={handleChange}
                  placeholder="Google Drive link for Logo, Product Photos, Brand Kit"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Meta Ads & Social Media Accounts Setup (Shown ONLY for Meta & Combine Plans) */}
          {(isMeta || isCombine) && (
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-pink-400" />
                <h3 className="text-sm font-extrabold text-white">2. Meta Ads & Social Media Accounts Setup</h3>
              </div>

              {/* Radio Selector */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider">
                  Select How You Want to Provide Meta/Facebook Access *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Radio 1: ID & Password */}
                  <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition ${formData.metaAccessMethod !== 'access_url' ? 'bg-blue-950/40 border-blue-600 text-white shadow-sm' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'}`}>
                    <input
                      type="radio"
                      name="metaAccessMethod"
                      value="id_password"
                      checked={formData.metaAccessMethod !== 'access_url'}
                      onChange={(e) => setFormData(prev => ({ ...prev, metaAccessMethod: e.target.value }))}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-xs font-bold block text-white">ID & Password</span>
                      <span className="text-[10px] text-slate-400">Share Facebook Account Login ID & Password</span>
                    </div>
                  </label>

                  {/* Radio 2: Send Access URL */}
                  <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition ${formData.metaAccessMethod === 'access_url' ? 'bg-blue-950/40 border-blue-600 text-white shadow-sm' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'}`}>
                    <input
                      type="radio"
                      name="metaAccessMethod"
                      value="access_url"
                      checked={formData.metaAccessMethod === 'access_url'}
                      onChange={(e) => setFormData(prev => ({ ...prev, metaAccessMethod: e.target.value }))}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-xs font-bold block text-white">Send Access URL</span>
                      <span className="text-[10px] text-slate-400">Provide Page or Business Manager Access Link</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Conditional Inputs Based on Radio Selection */}
              {formData.metaAccessMethod !== 'access_url' ? (
                /* Fields for Option 1: ID & Password */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-400 mb-1">Facebook ID / Email *</label>
                    <input
                      type="text"
                      name="facebookId"
                      value={formData.facebookId || ''}
                      onChange={handleChange}
                      placeholder="Enter Facebook Login ID or Email"
                      required
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-400 mb-1">Facebook Password *</label>
                    <input
                      type="text"
                      name="facebookPassword"
                      value={formData.facebookPassword || ''}
                      onChange={handleChange}
                      placeholder="Enter Facebook Account Password"
                      required
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              ) : (
                /* Fields for Option 2: Send Access URL */
                <div className="animate-fade-in">
                  <label className="block text-[11px] font-extrabold text-slate-400 mb-1">URL for Access (Page / Business Manager Link) *</label>
                  <input
                    type="url"
                    name="accessUrl"
                    value={formData.accessUrl || formData.fbPageUrl || ''}
                    onChange={handleChange}
                    placeholder="https://facebook.com/yourpage or Business Manager access link"
                    required
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}
            </div>
          )}

          {/* SECTION 3: Google Ads (Filtered for Google/Combine) */}
          {(isGoogle || isCombine) && (
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-extrabold text-white">3. Google Ads Campaign Configuration</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-400 mb-1">Google Ads 10-Digit Customer ID</label>
                  <input
                    type="text"
                    name="googleCustomerId"
                    value={formData.googleCustomerId}
                    onChange={handleChange}
                    placeholder="e.g. 123-456-7890"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-400 mb-1">Target Bidding Goal</label>
                  <select
                    name="adBudgetGoals"
                    value={formData.adBudgetGoals}
                    onChange={handleChange}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Lead Generation">Lead Generation (Form Submissions)</option>
                    <option value="Calls & Appointments">Direct Phone Calls & Appointments</option>
                    <option value="Website Traffic & Sales">Website Traffic & E-commerce Sales</option>
                    <option value="Brand Awareness">Maximum Impressions & Reach</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-400 mb-1">Target Keywords & Services</label>
                  <input
                    type="text"
                    name="googleKeywords"
                    value={formData.googleKeywords}
                    onChange={handleChange}
                    placeholder="e.g. Best Dental Clinic, Root Canal Specialist"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-400 mb-1">Geographic Target Locations</label>
                  <input
                    type="text"
                    name="targetLocations"
                    value={formData.targetLocations}
                    onChange={handleChange}
                    placeholder="e.g. Mumbai Metro Area, 10km radius from Clinic"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: Website Development (Filtered for Website Plans) */}
          {(isWebsite) && (
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <Layout className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-extrabold text-white">4. Website Design & Technical Requirements</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-400 mb-1">Required Website Pages</label>
                  <input
                    type="text"
                    name="websitePagesRequired"
                    value={formData.websitePagesRequired}
                    onChange={handleChange}
                    placeholder="Home, About Us, Services, Products, Contact"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-400 mb-1">Domain & Hosting Registrar Details</label>
                  <input
                    type="text"
                    name="domainHostingDetails"
                    value={formData.domainHostingDetails}
                    onChange={handleChange}
                    placeholder="GoDaddy / Hostinger / Cloudflare account details"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-400 mb-1">Reference Website Links (Style Inspiration)</label>
                  <input
                    type="text"
                    name="referenceWebsites"
                    value={formData.referenceWebsites}
                    onChange={handleChange}
                    placeholder="https://example1.com, https://example2.com"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-400 mb-1">Special Features Needed</label>
                  <input
                    type="text"
                    name="websiteKeyFeatures"
                    value={formData.websiteKeyFeatures}
                    onChange={handleChange}
                    placeholder="WhatsApp Widget, Online Payment, Booking System"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: Creative & AI Video Preferences (Filtered for Creative/AI Video) */}
          {(isCreative || isAiVideo) && (
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-extrabold text-white">5. Creative & AI Video Content Preferences</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-400 mb-1">Preferred Content Languages</label>
                  <input
                    type="text"
                    name="contentLanguages"
                    value={formData.contentLanguages}
                    onChange={handleChange}
                    placeholder="English, Hindi, Hinglish, Marathi, etc."
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-400 mb-1">AI Voice & Tone Style</label>
                  <input
                    type="text"
                    name="aiVoiceStyle"
                    value={formData.aiVoiceStyle}
                    onChange={handleChange}
                    placeholder="Energetic & Fast, Professional Corporate, Soft Narrative"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-extrabold text-slate-400 mb-1">Sample Reel / Video Style Reference Links</label>
                  <input
                    type="text"
                    name="reelsInspirationLinks"
                    value={formData.reelsInspirationLinks}
                    onChange={handleChange}
                    placeholder="Links to Instagram Reels or YouTube Shorts you like"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-lg transition"
            >
              {submitting ? <Clock className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>{submitting ? 'Submitting Onboarding Data...' : 'Submit Brand Onboarding Details'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
