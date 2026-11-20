import React, { useState, useEffect } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Briefcase,
  Target,
  Clock,
  Sparkles,
  X,
  AlertCircle,
  Layers,
  ChevronRight
} from 'lucide-react';
import { InAppNotification, Language } from '../types';

interface UserNotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onSelectVacancy?: (vacancyId: string) => void;
  onNavigateTab?: (tab: string) => void;
  onUnreadCountChange?: (count: number) => void;
}

export const UserNotificationCenterModal: React.FC<UserNotificationCenterModalProps> = ({
  isOpen,
  onClose,
  lang,
  onSelectVacancy,
  onNavigateTab,
  onUnreadCountChange
}) => {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'announcements' | 'job_match' | 'quiz_announcement' | 'deadline_reminder'>('all');
  const [unreadOnly, setUnreadOnly] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/notifications/in-app');
      if (res.ok) {
        const data = await res.json();
        const list: InAppNotification[] = data.notifications || [];
        setNotifications(list);
        const unread = list.filter(n => !n.isRead).length;
        if (onUnreadCountChange) onUnreadCountChange(unread);
      }
    } catch (err) {
      console.error('Failed to load user notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const markAsRead = async (id: string) => {
    try {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      const res = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id })
      });
      if (res.ok) {
        const data = await res.json();
        if (onUnreadCountChange && typeof data.unreadCount === 'number') {
          onUnreadCountChange(data.unreadCount);
        }
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      if (onUnreadCountChange) onUnreadCountChange(0);
      await fetch('/api/notifications/mark-all-read', { method: 'POST' });
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setNotifications(prev => prev.filter(n => n.id !== id));
      await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter(n => {
    if (unreadOnly && n.isRead) return false;
    if (activeFilter === 'all') return true;
    if (activeFilter === 'announcements') return n.type === 'platform_announcement' || n.type === 'system_alert';
    if (activeFilter === 'job_match') return n.type === 'job_match' || n.type === 'vacancy_alert';
    if (activeFilter === 'quiz_announcement') return n.type === 'quiz_announcement';
    if (activeFilter === 'deadline_reminder') return n.type === 'deadline_reminder';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/10 text-blue-400 rounded-2xl border border-blue-500/20 relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">
                  {lang === 'np' ? 'सूचना केन्द्र' : 'Candidate Notification Center'}
                </h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold bg-blue-950 text-blue-300 px-2 py-0.5 rounded-full border border-blue-800">
                    {unreadCount} Unread
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Official announcements, vacancy radar alerts, and model test notices.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-400 hover:text-blue-300 font-bold px-2.5 py-1.5 rounded-xl bg-blue-950/50 border border-blue-900/60 transition flex items-center gap-1.5"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mark all read</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="px-5 py-3 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between gap-3 overflow-x-auto">
          <div className="flex items-center gap-1.5 flex-nowrap">
            {[
              { id: 'all', label: 'All' },
              { id: 'job_match', label: 'Job Alerts' },
              { id: 'deadline_reminder', label: 'Deadlines' },
              { id: 'quiz_announcement', label: 'Model Tests' },
              { id: 'announcements', label: 'Platform News' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeFilter === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <label className="text-xs text-slate-400 flex items-center gap-1.5 shrink-0 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => setUnreadOnly(e.target.checked)}
              className="rounded bg-slate-800 text-blue-600"
            />
            <span>Unread only</span>
          </label>
        </div>

        {/* Notifications Scrollable List */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1 min-h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-xs">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
              Loading notifications...
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-950 text-slate-500 flex items-center justify-center mx-auto border border-slate-800">
                <Bell className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-300">No notifications found</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                You're completely caught up! New vacancy matches, quiz releases, and official PSC deadline alerts will appear here.
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const isJob = notif.type === 'job_match' || notif.type === 'vacancy_alert';
              const isDeadline = notif.type === 'deadline_reminder';
              const isQuiz = notif.type === 'quiz_announcement';

              return (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={`p-4 rounded-2xl border transition relative cursor-pointer ${
                    notif.isRead
                      ? 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700 opacity-80 hover:opacity-100'
                      : 'bg-slate-950 border-blue-500/40 hover:border-blue-500 shadow-md ring-1 ring-blue-500/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Icon */}
                      <div className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                        isDeadline
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : isJob
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : isQuiz
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {isDeadline ? <Clock className="w-4 h-4" /> : isJob ? <Briefcase className="w-4 h-4" /> : isQuiz ? <Target className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                      </div>

                      {/* Content */}
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-bold text-white leading-tight">
                            {lang === 'np' && notif.titleNp ? notif.titleNp : notif.title}
                          </h4>
                          {!notif.isRead && (
                            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                          )}
                          {notif.priority === 'urgent' && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                              Urgent
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {lang === 'np' && notif.messageNp ? notif.messageNp : notif.message}
                        </p>

                        {/* Action links / badges */}
                        <div className="pt-2 flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
                          <span className="font-mono text-[10px] text-slate-500">
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </span>

                          {notif.vacancyId && onSelectVacancy && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notif.id);
                                onClose();
                                onSelectVacancy(notif.vacancyId!);
                              }}
                              className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                            >
                              <span>View Vacancy</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}

                          {isQuiz && onNavigateTab && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notif.id);
                                onClose();
                                onNavigateTab('quizzes');
                              }}
                              className="text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1"
                            >
                              <span>Open Quiz Lab</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={(e) => deleteNotification(notif.id, e)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-900 transition shrink-0"
                      title="Dismiss notification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Anti-Duplicate & Privacy Guarantee */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 text-slate-400 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-[11px]">
              Anti-Duplicate Protected • Zero personal information shared • Career-relevant notifications only
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
