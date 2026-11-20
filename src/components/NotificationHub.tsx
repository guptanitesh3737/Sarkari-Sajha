import React, { useState } from 'react';
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Play,
  CheckCircle2,
  Clock,
  Send,
  Loader2,
  ShieldCheck,
  Zap,
  Filter,
  Layers,
  Sliders
} from 'lucide-react';
import { UserProfile, NotificationLog, Language, Vacancy } from '../types';
import { t } from '../utils/translations';
import { JobAlertsCenter } from './JobAlertsCenter';

interface NotificationHubProps {
  userProfile: UserProfile;
  notifications: NotificationLog[];
  vacancies?: Vacancy[];
  lang: Language;
  onUpdateProfile: (updatedProfile: UserProfile) => void;
  onRefreshNotifications: () => void;
  onSelectVacancy?: (vacancy: Vacancy) => void;
}

export const NotificationHub: React.FC<NotificationHubProps> = ({
  userProfile,
  notifications,
  vacancies = [],
  lang,
  onUpdateProfile,
  onRefreshNotifications,
  onSelectVacancy
}) => {
  const [activeView, setActiveView] = useState<'job_alerts' | 'dispatch_logs'>('job_alerts');
  const [runningCron, setRunningCron] = useState(false);
  const [cronMessage, setCronMessage] = useState<string | null>(null);
  const [testingSend, setTestingSend] = useState(false);

  const handleTogglePref = (channel: 'email' | 'sms' | 'push') => {
    const updated = {
      ...userProfile,
      notificationPrefs: {
        ...userProfile.notificationPrefs,
        [channel]: !userProfile.notificationPrefs[channel]
      }
    };
    onUpdateProfile(updated);
  };

  const handleRunCronPipeline = async () => {
    try {
      setRunningCron(true);
      setCronMessage(null);

      const res = await fetch('/api/notifications/trigger-cron', {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        setCronMessage(data.message);
        onRefreshNotifications();
      }
    } catch (err) {
      console.error('Failed to run matching pipeline:', err);
    } finally {
      setRunningCron(false);
    }
  };

  const handleSendTestAlert = async (channel: 'sms' | 'email' | 'push') => {
    try {
      setTestingSend(true);
      const res = await fetch('/api/notifications/test-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel, vacancyTitle: 'Test Alert: Lok Sewa Gazetted Officer Opening' })
      });
      const data = await res.json();
      if (data.success) {
        onRefreshNotifications();
      }
    } catch (err) {
      console.error('Test alert error:', err);
    } finally {
      setTestingSend(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top View Selector Switch */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('job_alerts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeView === 'job_alerts'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>{lang === 'np' ? 'व्यक्तिगत जब अलर्ट तथा म्याद राडार' : 'Job Alerts & Deadline Radar'}</span>
          </button>

          <button
            onClick={() => setActiveView('dispatch_logs')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeView === 'dispatch_logs'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{lang === 'np' ? 'डेलिभरी लग तथा एसएमएस पाइपलाइन' : 'Dispatch Logs & Cron Audit'}</span>
          </button>
        </div>

        {activeView === 'dispatch_logs' && (
          <button
            onClick={handleRunCronPipeline}
            disabled={runningCron}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            {runningCron ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{t('runCronJob', lang)}</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Main View Display */}
      {activeView === 'job_alerts' ? (
        <JobAlertsCenter
          userProfile={userProfile}
          vacancies={vacancies}
          lang={lang}
          onUpdateProfile={onUpdateProfile}
          onSelectVacancy={onSelectVacancy}
        />
      ) : (
        <div className="space-y-8">
          {/* Banner */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs text-slate-900 dark:text-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Multi-Gateway Dispatch Pipeline
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {lang === 'np' ? 'सरकारी सूचना तथा सन्देश प्रवाह प्रणाली' : 'AI Vacancy Alert & Dispatch Logs'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
                  Real-time notification delivery via Sparrow SMS (Nepal local numbers), Resend Email, and FCM App Push. The background job periodically matches new notices with your preferences.
                </p>
              </div>
            </div>

            {cronMessage && (
              <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{cronMessage}</span>
              </div>
            )}
          </div>

          {/* Quick Channels Toggle */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Sparrow SMS */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 rounded-xl">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Sparrow SMS</h3>
                    <p className="text-[11px] text-slate-400">Nepal Shortcode: 35001</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={userProfile.notificationPrefs.sms}
                  onChange={() => handleTogglePref('sms')}
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                />
              </div>
              <p className="text-xs text-slate-500">Instant SMS on new vacancies matching your target qualification.</p>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">{userProfile.phone || '+977-9841234567'}</span>
                <button
                  onClick={() => handleSendTestAlert('sms')}
                  disabled={testingSend}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
                >
                  Send Test SMS
                </button>
              </div>
            </div>

            {/* Resend Email */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 rounded-xl">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Official Email</h3>
                    <p className="text-[11px] text-slate-400">Instant / Daily Digest</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={userProfile.notificationPrefs.email}
                  onChange={() => handleTogglePref('email')}
                  className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
              </div>
              <p className="text-xs text-slate-500">Formatted summary reports with syllabus breakdown and direct links.</p>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 truncate max-w-[140px]">{userProfile.email}</span>
                <button
                  onClick={() => handleSendTestAlert('email')}
                  disabled={testingSend}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  Send Test Email
                </button>
              </div>
            </div>

            {/* Push Notifications */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 rounded-xl">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Push Alert</h3>
                    <p className="text-[11px] text-slate-400">Firebase Cloud Messaging</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={userProfile.notificationPrefs.push}
                  onChange={() => handleTogglePref('push')}
                  className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                />
              </div>
              <p className="text-xs text-slate-500">Live push badges and web notifications for deadline count-downs.</p>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Web App Device Token</span>
                <button
                  onClick={() => handleSendTestAlert('push')}
                  disabled={testingSend}
                  className="text-xs font-bold text-purple-600 hover:text-purple-700"
                >
                  Send Test Push
                </button>
              </div>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {lang === 'np' ? 'हालै पठाइएका सूचनाहरूको लग' : 'Recent Dispatch Audit Logs'}
                </h3>
              </div>
              <span className="text-xs text-slate-400">{notifications.length} Logs recorded</span>
            </div>

            {notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">No dispatch records found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-400 text-[10px] uppercase font-mono">
                    <tr>
                      <th className="p-3">Time</th>
                      <th className="p-3">Channel</th>
                      <th className="p-3">Trigger Type</th>
                      <th className="p-3">Vacancy Target</th>
                      <th className="p-3">Recipient</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {notifications.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                        <td className="p-3 font-mono text-slate-400 text-[11px]">{log.sentAt}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              log.channel === 'sms'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : log.channel === 'email'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                                : 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                            }`}
                          >
                            {log.channel}
                          </span>
                        </td>
                        <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{log.triggerType}</td>
                        <td className="p-3 font-semibold text-slate-900 dark:text-white max-w-[200px] truncate">
                          {log.vacancyTitle}
                        </td>
                        <td className="p-3 text-slate-500 font-mono text-[11px]">{log.recipientPhoneOrEmail}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
