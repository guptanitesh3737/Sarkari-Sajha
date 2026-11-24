import React, { useState, useEffect, useMemo } from 'react';
import {
  Bell,
  Mail,
  Smartphone,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Filter,
  Check,
  Zap,
  Sliders,
  Calendar,
  Send,
  Loader2,
  ShieldCheck,
  Eye,
  Trash2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Info,
  MapPin,
  Building2,
  GraduationCap,
  Briefcase,
  Layers,
  BookOpen
} from 'lucide-react';
import {
  UserProfile,
  Language,
  JobAlertPreferences,
  InAppNotification,
  Vacancy,
  QualificationLevel,
  Province
} from '../types';
import {
  NEPAL_PROVINCES,
  NEPAL_DISTRICTS,
  POPULAR_PSC_FIELDS,
  PSC_JOB_LEVELS,
  REPUTED_ORGANIZATIONS,
  POPULAR_PSC_SUBJECTS
} from '../data/nepalLocations';
import { t } from '../utils/translations';

interface JobAlertsCenterProps {
  userProfile: UserProfile;
  vacancies: Vacancy[];
  lang: Language;
  onUpdateProfile: (updatedProfile: UserProfile) => void;
  onSelectVacancy?: (vacancy: Vacancy) => void;
}

interface DeadlineRadarItem {
  vacancyId: string;
  title: string;
  titleNp?: string;
  organization: string;
  level?: string;
  deadline: string;
  daysLeft: number;
  isExpired: boolean;
  isUrgent: boolean;
  isSavedByUser: boolean;
  remindersSent: { id: string; daysRemaining: number; sentAt: string }[];
}

export const JobAlertsCenter: React.FC<JobAlertsCenterProps> = ({
  userProfile,
  vacancies,
  lang,
  onUpdateProfile,
  onSelectVacancy
}) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'preferences' | 'deadline_radar' | 'channels'>('feed');
  const [feedFilter, setFeedFilter] = useState<'all' | 'job_match' | 'deadline_reminder' | 'unread'>('all');

  // Notifications State
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loadingFeed, setLoadingFeed] = useState<boolean>(false);

  // Preference Draft State
  const initialPrefs: JobAlertPreferences = useMemo(() => {
    return (
      userProfile.jobAlertPreferences || {
        enabled: true,
        qualification: 'All',
        interestedFields: ['General Administration (सामान्य प्रशासन)', 'Computer Science / IT (कम्प्युटर / सूचना प्रविधि)'],
        province: userProfile.province || 'All Nepal',
        district: 'All Districts',
        jobLevel: 'All Levels (सबै तह)',
        organizations: ['Any Organization (कुनै पनि निकाय)'],
        subjects: ['General Knowledge (GK / सामान्य ज्ञान)', 'Public Administration & Governance (शासन प्रणाली)'],
        channels: {
          inApp: true,
          email: true,
          push: true
        },
        deadlineReminders: {
          remind7DaysBefore: true,
          remind2DaysBefore: true,
          remind1DayBefore: true,
          remindDeadlineDay: true
        }
      }
    );
  }, [userProfile]);

  const [prefs, setPrefs] = useState<JobAlertPreferences>(initialPrefs);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Radar State
  const [radarItems, setRadarItems] = useState<DeadlineRadarItem[]>([]);
  const [loadingRadar, setLoadingRadar] = useState<boolean>(false);

  // Scan & Test State
  const [isScanning, setIsScanning] = useState(false);
  const [scanResultSummary, setScanResultSummary] = useState<string | null>(null);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testingPush, setTestingPush] = useState(false);
  const [emailPreviewModal, setEmailPreviewModal] = useState<any | null>(null);

  // Filtered districts based on selected province
  const availableDistricts = useMemo(() => {
    if (!prefs.province || prefs.province === 'All Nepal') {
      return NEPAL_DISTRICTS;
    }
    return NEPAL_DISTRICTS.filter(d => d.province === prefs.province);
  }, [prefs.province]);

  // Fetch in-app notifications
  const fetchInAppNotifications = async () => {
    try {
      setLoadingFeed(true);
      const res = await fetch(`/api/notifications/in-app?userId=${userProfile.id || 'usr_default_01'}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to load in-app notifications:', err);
    } finally {
      setLoadingFeed(false);
    }
  };

  // Fetch deadline radar data
  const fetchDeadlineRadar = async () => {
    try {
      setLoadingRadar(true);
      const res = await fetch(`/api/notifications/deadline-radar?userId=${userProfile.id || 'usr_default_01'}`);
      if (res.ok) {
        const data = await res.json();
        setRadarItems(data.radar || []);
      }
    } catch (err) {
      console.error('Failed to load deadline radar:', err);
    } finally {
      setLoadingRadar(false);
    }
  };

  useEffect(() => {
    fetchInAppNotifications();
    fetchDeadlineRadar();
  }, [userProfile.id]);

  // Save Preferences
  const handleSavePreferences = async (updated: JobAlertPreferences) => {
    try {
      setIsSavingPrefs(true);
      setSaveSuccessMsg(null);
      const res = await fetch('/api/user/job-alerts/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      const data = await res.json();
      if (data.success) {
        setPrefs(updated);
        onUpdateProfile({
          ...userProfile,
          jobAlertPreferences: updated
        });
        setSaveSuccessMsg(
          lang === 'np'
            ? 'विज्ञापन प्राथमिकता सफलतापूर्वक सुरक्षित गरियो!'
            : 'Job alert preferences updated and securely synced!'
        );
        setTimeout(() => setSaveSuccessMsg(null), 4000);
      }
    } catch (err) {
      console.error('Failed to save preferences:', err);
    } finally {
      setIsSavingPrefs(false);
    }
  };

  // Mark notification read
  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/in-app/${id}/read`, { method: 'PATCH' });
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  // Mark all notifications read
  const handleMarkAllAsRead = async () => {
    try {
      await fetch('/api/notifications/in-app/mark-all-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userProfile.id || 'usr_default_01' })
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all read:', err);
    }
  };

  // Delete notification
  const handleDeleteNotification = async (id: string) => {
    try {
      await fetch(`/api/notifications/in-app/${id}`, { method: 'DELETE' });
      setNotifications(prev => prev.filter(n => n.id !== id));
      const deletedWasUnread = notifications.find(n => n.id === id && !n.isRead);
      if (deletedWasUnread) setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  // Run comprehensive matching and deadline scanner
  const handleRunScanner = async () => {
    try {
      setIsScanning(true);
      setScanResultSummary(null);
      const res = await fetch('/api/notifications/scan-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences: prefs,
          userId: userProfile.id || 'usr_default_01'
        })
      });
      const data = await res.json();
      if (data.success) {
        setScanResultSummary(data.message);
        fetchInAppNotifications();
        fetchDeadlineRadar();
      }
    } catch (err) {
      console.error('Error running scanner:', err);
    } finally {
      setIsScanning(false);
    }
  };

  // Test Email
  const handleTestEmail = async () => {
    try {
      setTestingEmail(true);
      const res = await fetch('/api/notifications/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toEmail: userProfile.email || 'candidate@sarkarisajha.com',
          subject: 'Sample Notice: Section Officer Vacancy Announcement',
          bodyHtml: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
              <h2 style="color: #0f172a; margin-top: 0;">SarkariSajha Alert</h2>
              <p>Hello <strong>${userProfile.name}</strong>,</p>
              <p>A new Lok Sewa vacancy matching your <strong>${prefs.qualification}</strong> qualification in <strong>${prefs.province}</strong> has been published.</p>
              <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb; margin: 15px 0;">
                <strong>Position:</strong> Section Officer (General Administration)<br/>
                <strong>Organization:</strong> Public Service Commission (Lok Sewa Aayog)<br/>
                <strong>Application Deadline:</strong> 2026-08-25 (7 days remaining)
              </div>
              <a href="#" style="background: #2563eb; color: #fff; padding: 10px 18px; border-radius: 6px; text-decoration: none; display: inline-block; font-weight: bold;">View Details & Apply</a>
            </div>
          `
        })
      });
      const data = await res.json();
      if (data.success) {
        setEmailPreviewModal(data.emailPreview);
        fetchInAppNotifications();
      }
    } catch (err) {
      console.error('Email test error:', err);
    } finally {
      setTestingEmail(false);
    }
  };

  // Test Push
  const handleTestPush = async () => {
    try {
      setTestingPush(true);
      const res = await fetch('/api/notifications/send-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Deadline Reminder (2 days remaining)',
          body: 'Computer Officer (PPSC Bagmati) application deadline is on 2026-08-20.'
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(lang === 'np' ? 'वेब पुश सूचना सफलतापूर्वक पठाइयो!' : 'Web Push simulated successfully via FCM!');
        fetchInAppNotifications();
      }
    } catch (err) {
      console.error('Push test error:', err);
    } finally {
      setTestingPush(false);
    }
  };

  // Filtered Notifications Feed
  const filteredFeed = useMemo(() => {
    return notifications.filter(n => {
      if (feedFilter === 'job_match') return n.type === 'job_match';
      if (feedFilter === 'deadline_reminder') return n.type === 'deadline_reminder';
      if (feedFilter === 'unread') return !n.isRead;
      return true;
    });
  }, [notifications, feedFilter]);

  // Handle toggling fields or subjects
  const toggleArrayItem = (field: 'interestedFields' | 'organizations' | 'subjects', value: string) => {
    const current = prefs[field] || [];
    let next: string[];
    if (current.includes(value)) {
      next = current.filter(item => item !== value);
    } else {
      next = [...current, value];
    }
    const updated = { ...prefs, [field]: next };
    setPrefs(updated);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ------------------------------------------------------------- */}
      {/* 1. HEADER HERO BANNER & QUICK CONTROLS */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-8 relative overflow-hidden shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300">
                <Zap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                {lang === 'np' ? 'स्वचालित विज्ञापन अलर्ट इन्जिन' : 'Smart Vacancy Match & Reminder Engine'}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                {lang === 'np' ? 'गोप्य तथा सुरक्षित' : 'Private & Anti-Spam'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {lang === 'np' ? 'व्यक्तिगत विज्ञापन अलर्ट तथा म्याद रिमाइन्डर' : 'Personalized Job Alerts & Deadline Reminders'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {lang === 'np'
                ? 'तपाईंको शैक्षिक योग्यता, रुचि भएको क्षेत्र, प्रदेश तथा जिल्ला अनुसार नयाँ विज्ञापन मिल्ने बित्तिकै अलर्ट पाउनुहोस्। फाराम भर्ने म्याद समाप्त हुनु अगावै (७, २, १ दिन र अन्तिम दिन) स्मरण सन्देश प्राप्त गर्नुहोस्।'
                : 'Receive real-time match alerts for civil service vacancies tailored to your qualification, field, province, district, and level. Never miss a submission with 7d, 2d, 1d & deadline day reminders.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={handleRunScanner}
              disabled={isScanning}
              className="px-5 py-3 rounded-full font-bold text-xs transition flex items-center justify-center gap-2 bg-ink hover:bg-black text-white dark:bg-white dark:text-ink"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{lang === 'np' ? 'जाँच हुँदैछ...' : 'Scanning Vacancies...'}</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>{lang === 'np' ? 'अहिले स्क्यान गर्नुहोस्' : 'Scan & Match Now'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Scan Feedback Box */}
        {scanResultSummary && (
          <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-xs text-emerald-900 dark:text-emerald-300 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span className="font-semibold">{scanResultSummary}</span>
            </div>
            <button
              onClick={() => setScanResultSummary(null)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 dark:text-emerald-400"
            >
              ✕
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* KEY STATS COUNTERS */}
        {/* ------------------------------------------------------------- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3.5 rounded-2xl bg-sky-50/70 dark:bg-white/5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
              <span>{lang === 'np' ? 'नपढिएका सूचना' : 'Unread Alerts'}</span>
              <Bell className="w-4 h-4 text-blue-600" />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{unreadCount}</span>
              <span className="text-[11px] text-slate-400 font-medium">{lang === 'np' ? 'नयाँ' : 'new'}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-sky-50/70 dark:bg-white/5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
              <span>{lang === 'np' ? 'अलर्ट स्थिति' : 'Alert Engine'}</span>
              <Sliders className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span
                className={`text-sm font-black uppercase px-2 py-0.5 rounded-md ${
                  prefs.enabled
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300'
                }`}
              >
                {prefs.enabled ? (lang === 'np' ? 'सक्रिय' : 'Active') : lang === 'np' ? 'रोकिएको' : 'Paused'}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-sky-50/70 dark:bg-white/5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
              <span>{lang === 'np' ? 'प्रवाह माध्यम' : 'Channels'}</span>
              <Send className="w-4 h-4 text-purple-600" />
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              {prefs.channels.inApp && <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded text-[10px]">In-App</span>}
              {prefs.channels.email && <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded text-[10px]">Email</span>}
              {prefs.channels.push && <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 rounded text-[10px]">Push</span>}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-sky-50/70 dark:bg-white/5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
              <span>{lang === 'np' ? 'म्याद राडार' : 'Closing Soon'}</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {radarItems.filter(r => r.daysLeft >= 0 && r.daysLeft <= 7).length}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">{lang === 'np' ? '७ दिनभित्र' : '< 7 days'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. SUB NAVIGATION TABS */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('feed')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'feed'
              ? 'shadow-xs bg-ink hover:bg-black text-white dark:bg-white dark:text-ink'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>{lang === 'np' ? 'अलर्ट तथा सूचना फिड' : 'In-App Notifications'}</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-white text-blue-600">
              {unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('preferences')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'preferences'
              ? 'shadow-xs bg-ink hover:bg-black text-white dark:bg-white dark:text-ink'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{lang === 'np' ? 'अलर्ट प्राथमिकता व्यवस्थापन' : 'Alert Criteria & Filters'}</span>
        </button>

        <button
          onClick={() => setActiveTab('deadline_radar')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'deadline_radar'
              ? 'shadow-xs bg-ink hover:bg-black text-white dark:bg-white dark:text-ink'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{lang === 'np' ? 'म्याद राडार तथा काउन्टडाउन' : 'Deadline Radar'}</span>
        </button>

        <button
          onClick={() => setActiveTab('channels')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'channels'
              ? 'shadow-xs bg-ink hover:bg-black text-white dark:bg-white dark:text-ink'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>{lang === 'np' ? 'च्यानल तथा नमुना सन्देश' : 'Channels & Previews'}</span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: NOTIFICATION FEED */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'feed' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
            {/* Filter Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setFeedFilter('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                  feedFilter === 'all'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {lang === 'np' ? 'सबै' : 'All'} ({notifications.length})
              </button>
              <button
                onClick={() => setFeedFilter('job_match')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                  feedFilter === 'job_match'
                    ? 'bg-ink hover:bg-black text-white dark:bg-white dark:text-ink'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {lang === 'np' ? 'विज्ञापन म्याच' : 'Job Matches'}
              </button>
              <button
                onClick={() => setFeedFilter('deadline_reminder')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                  feedFilter === 'deadline_reminder'
                    ? 'bg-ink hover:bg-black text-white dark:bg-white dark:text-ink'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {lang === 'np' ? 'म्याद रिमाइन्डर' : 'Deadline Reminders'}
              </button>
              <button
                onClick={() => setFeedFilter('unread')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                  feedFilter === 'unread'
                    ? 'bg-ink hover:bg-black text-white dark:bg-white dark:text-ink'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {lang === 'np' ? 'नपढिएका' : 'Unread'} ({unreadCount})
              </button>
            </div>

            {/* Quick Actions */}
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1.5 whitespace-nowrap self-end sm:self-center"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{lang === 'np' ? 'सबै पढेको चिन्ह लगाउनुहोस्' : 'Mark All Read'}</span>
              </button>
            )}
          </div>

          {/* List of Notification Cards */}
          {loadingFeed ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
              <p className="text-xs text-slate-500 mt-2">Loading notifications...</p>
            </div>
          ) : filteredFeed.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-12 text-center space-y-3 shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                {lang === 'np' ? 'कुनै सूचना छैन' : 'No notifications in this filter'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {lang === 'np'
                  ? 'तपाईंको प्राथमिकता अनुसार नयाँ विज्ञापन प्रकाशित भएपछि वा म्याद नजिकिएपछि यहाँ सूचना देखिनेछ।'
                  : 'Notifications will appear here when government vacancies match your preferences or deadlines approach.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFeed.map(notif => {
                const isMatch = notif.type === 'job_match';
                const isUrgent = notif.priority === 'urgent';
                const targetVac = vacancies.find(v => v.id === notif.vacancyId);

                return (
                  <div
                    key={notif.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all relative overflow-hidden ${
                      notif.isRead
                        ? 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                        : 'bg-blue-50/40 dark:bg-blue-950/20 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5 flex-1">
                        {/* Icon badge */}
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            isMatch
                              ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                              : isUrgent
                              ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400'
                              : 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {isMatch ? (
                            <Briefcase className="w-5 h-5" />
                          ) : isUrgent ? (
                            <AlertTriangle className="w-5 h-5" />
                          ) : (
                            <Clock className="w-5 h-5" />
                          )}
                        </div>

                        {/* Text details */}
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                isMatch
                                  ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                                  : 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                              }`}
                            >
                              {isMatch
                                ? lang === 'np'
                                  ? 'विज्ञापन म्याच'
                                  : 'Job Match'
                                : lang === 'np'
                                ? 'म्याद सूचना'
                                : 'Deadline Alert'}
                            </span>

                            {isUrgent && (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300">
                                {lang === 'np' ? 'अति जरुरी' : 'Urgent'}
                              </span>
                            )}

                            {notif.matchScore && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
                                {notif.matchScore}% Match
                              </span>
                            )}

                            <span className="text-[11px] text-slate-400 font-medium">
                              {new Date(notif.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                            {lang === 'np' && notif.titleNp ? notif.titleNp : notif.title}
                          </h4>

                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            {lang === 'np' && notif.messageNp ? notif.messageNp : notif.message}
                          </p>

                          {/* Channels Dispatched */}
                          <div className="flex items-center gap-2 pt-2 flex-wrap">
                            <span className="text-[10px] text-slate-400 font-semibold">Dispatched via:</span>
                            {notif.channelsDispatched.map(ch => (
                              <span
                                key={ch}
                                className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize"
                              >
                                {ch.replace('_', '-')}
                              </span>
                            ))}

                            {targetVac && onSelectVacancy && (
                              <button
                                onClick={() => onSelectVacancy(targetVac)}
                                className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                              >
                                <span>{lang === 'np' ? 'विज्ञापन हेर्नुहोस्' : 'View Vacancy Notice'}</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {!notif.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notif.id)}
                            title="Mark as read"
                            className="p-1.5 rounded-full text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteNotification(notif.id)}
                          title="Delete notification"
                          className="p-1.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: PREFERENCES CONFIGURATOR */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'preferences' && (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-8 space-y-8 shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {lang === 'np' ? 'विज्ञापन अलर्ट प्राथमिकताहरू' : 'Personalized Job Match Criteria'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {lang === 'np'
                  ? 'तपाईंको आवश्यकता अनुसार फिल्टरहरू छनौट गर्नुहोस्। प्रणालीले नयाँ सूचना आउने बित्तिकै तुलना गर्नेछ।'
                  : 'Configure qualifications, fields, locations, and organizations to receive targeted job match alerts.'}
              </p>
            </div>

            {/* Master Toggle */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {prefs.enabled ? (lang === 'np' ? 'अलर्ट चालु छ' : 'Alerts Enabled') : lang === 'np' ? 'अलर्ट रोकिएको छ' : 'Alerts Disabled'}
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={prefs.enabled}
                  onChange={e => setPrefs({ ...prefs, enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Minimum Qualification */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span>{lang === 'np' ? 'न्यूनतम शैक्षिक योग्यता' : 'Candidate Qualification'}</span>
              </label>
              <select
                value={prefs.qualification}
                onChange={e => setPrefs({ ...prefs, qualification: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-300 outline-hidden"
              >
                <option value="All">All Qualifications (कुनै पनि तह)</option>
                <option value="SEE/SLC">SEE / SLC (माध्यमिक तह)</option>
                <option value="+2 High School">+2 High School (प्रविणता प्रमाणपत्र)</option>
                <option value="Bachelor Degree">Bachelor Degree (स्नातक तह)</option>
                <option value="Master Degree">Master Degree (स्नातकोत्तर तह)</option>
                <option value="MPhil/PhD">MPhil / PhD (उच्च अनुसन्धान)</option>
              </select>
            </div>

            {/* 2. Job Level */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                <span>{lang === 'np' ? 'तह / पद स्तर' : 'Job Level'}</span>
              </label>
              <select
                value={prefs.jobLevel || 'All Levels (सबै तह)'}
                onChange={e => setPrefs({ ...prefs, jobLevel: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-300 outline-hidden"
              >
                {PSC_JOB_LEVELS.map(lvl => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Province */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>{lang === 'np' ? 'प्रदेश' : 'Province Preference'}</span>
              </label>
              <select
                value={prefs.province || 'All Nepal'}
                onChange={e => setPrefs({ ...prefs, province: e.target.value as Province, district: 'All Districts' })}
                className="w-full px-3.5 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-300 outline-hidden"
              >
                {NEPAL_PROVINCES.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nameEn} ({p.nameNp})
                  </option>
                ))}
              </select>
            </div>

            {/* 4. District */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>{lang === 'np' ? 'जिल्ला' : 'District Preference'}</span>
              </label>
              <select
                value={prefs.district || 'All Districts'}
                onChange={e => setPrefs({ ...prefs, district: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-300 outline-hidden"
              >
                <option value="All Districts">All Districts (सबै जिल्ला)</option>
                {availableDistricts.map(d => (
                  <option key={d.name} value={d.name}>
                    {d.name} ({d.nameNp}) - {d.province}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 5. Interested Fields (Multi-select Chips) */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-600" />
                {lang === 'np' ? 'रुचि भएको सेवा / समूह' : 'Interested Fields & Sectors'}
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                {prefs.interestedFields.length} selected
              </span>
            </label>
            <div className="flex flex-wrap gap-2">
              {POPULAR_PSC_FIELDS.map(f => {
                const selected = prefs.interestedFields.includes(f);
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => toggleArrayItem('interestedFields', f)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition border flex items-center gap-1.5 ${
                      selected
                        ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300'
                        : 'bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {selected && <Check className="w-3.5 h-3.5 text-purple-600" />}
                    <span>{f}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. Target Organizations */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-600" />
                {lang === 'np' ? 'लक्षित सरकारी निकायहरू' : 'Target Public Organizations'}
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                {prefs.organizations.length} selected
              </span>
            </label>
            <div className="flex flex-wrap gap-2">
              {REPUTED_ORGANIZATIONS.map(org => {
                const selected = prefs.organizations.includes(org);
                return (
                  <button
                    key={org}
                    type="button"
                    onClick={() => toggleArrayItem('organizations', org)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition border flex items-center gap-1.5 ${
                      selected
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                        : 'bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {selected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    <span>{org}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 7. Curriculum Subjects */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-amber-600" />
                {lang === 'np' ? 'पाठ्यक्रम सम्बन्धी विषयहरू' : 'Curriculum Subjects of Interest'}
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                {prefs.subjects.length} selected
              </span>
            </label>
            <div className="flex flex-wrap gap-2">
              {POPULAR_PSC_SUBJECTS.map(subj => {
                const selected = prefs.subjects.includes(subj);
                return (
                  <button
                    key={subj}
                    type="button"
                    onClick={() => toggleArrayItem('subjects', subj)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition border flex items-center gap-1.5 ${
                      selected
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                        : 'bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {selected && <Check className="w-3.5 h-3.5 text-amber-600" />}
                    <span>{subj}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Save Button & Feedback */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 flex-wrap">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{lang === 'np' ? 'तपाईंका प्राथमिकता सुरक्षित रूपमा भण्डारण गरिन्छन्।' : 'Your preferences are encrypted & never exposed publicly.'}</span>
            </div>

            <div className="flex items-center gap-3">
              {saveSuccessMsg && (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  {saveSuccessMsg}
                </span>
              )}
              <button
                onClick={() => handleSavePreferences(prefs)}
                disabled={isSavingPrefs}
                className="px-6 py-3 rounded-full font-bold text-xs transition flex items-center gap-2 bg-ink hover:bg-black text-white dark:bg-white dark:text-ink"
              >
                {isSavingPrefs ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{lang === 'np' ? 'प्राथमिकता सुरक्षित गर्नुहोस्' : 'Save Alert Criteria'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: DEADLINE RADAR & REMINDER MATRIX */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'deadline_radar' && (
        <div className="space-y-6">
          {/* Reminder Interval Switches Card */}
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-8 space-y-6 shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <span>{lang === 'np' ? 'दरखास्त म्याद रिमाइन्डर समयतालिका' : 'Deadline Reminder Schedule'}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {lang === 'np'
                    ? 'फाराम भर्ने अन्तिम म्याद समाप्त हुनु अगाडि तोकिएका दिनहरूमा स्वचालित अलर्ट पठाउने व्यवस्था:'
                    : 'Configure exact countdown reminder intervals. Automated safeguards prevent reminders after vacancy expiration.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 7 Days */}
              <div className="p-4 rounded-2xl bg-sky-50/70 dark:bg-white/5 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    {lang === 'np' ? '७ दिन अगाडि' : '7 Days Before'}
                  </span>
                  <span className="text-[11px] text-slate-500">First advance alert</span>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.deadlineReminders.remind7DaysBefore}
                  onChange={e => {
                    const updated = {
                      ...prefs,
                      deadlineReminders: { ...prefs.deadlineReminders, remind7DaysBefore: e.target.checked }
                    };
                    handleSavePreferences(updated);
                  }}
                  className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
              </div>

              {/* 2 Days */}
              <div className="p-4 rounded-2xl bg-sky-50/70 dark:bg-white/5 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    {lang === 'np' ? '२ दिन अगाडि' : '2 Days Before'}
                  </span>
                  <span className="text-[11px] text-slate-500">Urgent preparation</span>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.deadlineReminders.remind2DaysBefore}
                  onChange={e => {
                    const updated = {
                      ...prefs,
                      deadlineReminders: { ...prefs.deadlineReminders, remind2DaysBefore: e.target.checked }
                    };
                    handleSavePreferences(updated);
                  }}
                  className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
              </div>

              {/* 1 Day */}
              <div className="p-4 rounded-2xl bg-sky-50/70 dark:bg-white/5 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    {lang === 'np' ? '१ दिन अगाडि' : '1 Day Before'}
                  </span>
                  <span className="text-[11px] text-slate-500">Last normal fee day</span>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.deadlineReminders.remind1DayBefore}
                  onChange={e => {
                    const updated = {
                      ...prefs,
                      deadlineReminders: { ...prefs.deadlineReminders, remind1DayBefore: e.target.checked }
                    };
                    handleSavePreferences(updated);
                  }}
                  className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
              </div>

              {/* Deadline Day */}
              <div className="p-4 rounded-2xl bg-sky-50/70 dark:bg-white/5 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    {lang === 'np' ? 'अन्तिम दिन (० दिन)' : 'Deadline Day'}
                  </span>
                  <span className="text-[11px] text-slate-500">Final closing hours</span>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.deadlineReminders.remindDeadlineDay}
                  onChange={e => {
                    const updated = {
                      ...prefs,
                      deadlineReminders: { ...prefs.deadlineReminders, remindDeadlineDay: e.target.checked }
                    };
                    handleSavePreferences(updated);
                  }}
                  className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Live Deadline Radar List */}
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-8 space-y-4 shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {lang === 'np' ? 'सक्रिय विज्ञापन म्याद काउन्टडाउन राडार' : 'Active Vacancies Closing Radar'}
                </h3>
                <p className="text-xs text-slate-500">
                  {lang === 'np'
                    ? 'सबै खुल्ला विज्ञापनहरूको बाँकी दिन तथा रिमाइन्डर डेलिभरी ट्र्याकिङ:'
                    : 'Live countdowns for open government openings and reminder dispatch status.'}
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500">{radarItems.length} active notices</span>
            </div>

            {loadingRadar ? (
              <div className="p-10 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
              </div>
            ) : radarItems.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">No active vacancies found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-900 dark:text-slate-200">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-mono border-b">
                    <tr>
                      <th className="p-3.5">Position / Organization</th>
                      <th className="p-3.5">Level</th>
                      <th className="p-3.5">Official Deadline</th>
                      <th className="p-3.5">Days Remaining</th>
                      <th className="p-3.5">Reminder Logs</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {radarItems.map(item => {
                      const isUrgent = item.daysLeft <= 2;
                      const isWeek = item.daysLeft <= 7;
                      const targetVac = vacancies.find(v => v.id === item.vacancyId);

                      return (
                        <tr key={item.vacancyId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                          <td className="p-3.5 font-semibold text-slate-900 dark:text-white max-w-[240px]">
                            <div className="truncate">{item.title}</div>
                            <div className="text-[11px] text-slate-400 font-normal truncate">{item.organization}</div>
                          </td>
                          <td className="p-3.5 text-slate-600 dark:text-slate-400 text-xs">
                            {item.level || 'Officer Level'}
                          </td>
                          <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400">
                            {item.deadline}
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black ${
                                isUrgent
                                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                                  : isWeek
                                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                                  : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                              }`}
                            >
                              <Clock className="w-3 h-3" />
                              {item.daysLeft === 0
                                ? 'TODAY'
                                : item.daysLeft === 1
                                ? '1 day left'
                                : `${item.daysLeft} days left`}
                            </span>
                          </td>
                          <td className="p-3.5">
                            {item.remindersSent.length > 0 ? (
                              <div className="flex items-center gap-1">
                                {item.remindersSent.map(r => (
                                  <span
                                    key={r.id}
                                    title={`Sent on ${new Date(r.sentAt).toLocaleDateString()}`}
                                    className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-mono text-[10px]"
                                  >
                                    {r.daysRemaining}d
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[11px]">Scheduled</span>
                            )}
                          </td>
                          <td className="p-3.5 text-right">
                            {targetVac && onSelectVacancy && (
                              <button
                                onClick={() => onSelectVacancy(targetVac)}
                                className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-slate-700 dark:text-slate-300 hover:text-blue-600 text-xs font-bold transition inline-flex items-center gap-1"
                              >
                                <span>Apply</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: CHANNELS & PREVIEWS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'channels' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Channel Settings Card */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-[2rem] p-6 space-y-6 shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
            <h3 className="text-base font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              {lang === 'np' ? 'प्रवाह च्यानल सेटिङहरू' : 'Dispatch Channels'}
            </h3>

            {/* In-App */}
            <div className="p-4 rounded-2xl bg-sky-50/70 dark:bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white block">In-App Alerts</span>
                  <span className="text-[10px] text-slate-500">Direct dashboard feed</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={prefs.channels.inApp}
                onChange={e => {
                  const updated = { ...prefs, channels: { ...prefs.channels, inApp: e.target.checked } };
                  handleSavePreferences(updated);
                }}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
            </div>

            {/* Email */}
            <div className="p-4 rounded-2xl bg-sky-50/70 dark:bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white block">Email Alerts</span>
                  <span className="text-[10px] text-slate-500 truncate max-w-[140px] block">
                    {userProfile.email || 'candidate@sarkarisajha.com'}
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={prefs.channels.email}
                onChange={e => {
                  const updated = { ...prefs, channels: { ...prefs.channels, email: e.target.checked } };
                  handleSavePreferences(updated);
                }}
                className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
              />
            </div>

            {/* Push */}
            <div className="p-4 rounded-2xl bg-sky-50/70 dark:bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white block">Web / Mobile Push</span>
                  <span className="text-[10px] text-slate-500">Firebase Cloud Messaging</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={prefs.channels.push}
                onChange={e => {
                  const updated = { ...prefs, channels: { ...prefs.channels, push: e.target.checked } };
                  handleSavePreferences(updated);
                }}
                className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
              />
            </div>

            {/* Test Trigger Buttons */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 block">Dispatch Sample Alert:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleTestEmail}
                  disabled={testingEmail}
                  className="py-2 px-3 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 transition"
                >
                  {testingEmail ? 'Sending...' : 'Test Email'}
                </button>
                <button
                  onClick={handleTestPush}
                  disabled={testingPush}
                  className="py-2 px-3 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-800 dark:text-purple-300 text-xs font-bold hover:bg-purple-100 transition"
                >
                  {testingPush ? 'Sending...' : 'Test Push'}
                </button>
              </div>
            </div>
          </div>

          {/* Email Preview Frame */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-8 space-y-4 shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-600" />
                <span>{lang === 'np' ? 'इमेल सूचना ढाँचा (Live Preview)' : 'Official Email Notification Preview'}</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                HTML + CSS
              </span>
            </div>

            {/* Email Container Mockup */}
            <div className="rounded-2xl bg-sky-50/70 dark:bg-slate-950 p-6 text-slate-800 dark:text-slate-200 space-y-4 max-w-xl mx-auto shadow-inner">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-sm">
                    SS
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">SarkariSajha Notifications</h4>
                    <span className="text-[10px] text-slate-400">alerts@sarkarisajha.gov.np</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-400">10:30 AM</span>
              </div>

              <div className="space-y-3 text-xs leading-relaxed">
                <p>
                  Dear <strong>{userProfile.name || 'Candidate'}</strong>,
                </p>
                <p>
                  A new high-priority government vacancy notice matching your candidate profile has been announced:
                </p>

                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                      Level 7 Officer
                    </span>
                    <span className="text-[10px] font-bold text-rose-600">7 Days Remaining</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Section Officer (General Administration & Governance)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Public Service Commission (Lok Sewa Aayog) • Kathmandu / All Nepal
                  </p>
                  <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-[11px]">
                    <span className="text-slate-500">Deadline: 2026-08-25</span>
                    <span className="font-bold text-emerald-600">Fee: Rs. 1,000</span>
                  </div>
                </div>

                <div className="pt-2 text-center">
                  <button className="px-5 py-2.5 rounded-full font-bold text-xs transition bg-ink hover:bg-black text-white dark:bg-white dark:text-ink">
                    View Complete Syllabus & Apply
                  </button>
                </div>

                <p className="text-[10px] text-slate-400 text-center pt-2">
                  You are receiving this alert because you subscribed to Lok Sewa vacancy notifications on SarkariSajha.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
