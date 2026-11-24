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

  const np = lang === 'np';
  const FILTERS = [
    { id: 'all', en: 'All', np: 'सबै' },
    { id: 'job_match', en: 'Jobs', np: 'जागिर' },
    { id: 'deadline_reminder', en: 'Deadlines', np: 'म्याद' },
    { id: 'quiz_announcement', en: 'Quizzes', np: 'क्विज' },
    { id: 'announcements', en: 'News', np: 'समाचार' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/30 backdrop-blur-sm" onClick={onClose}>
      <aside
        role="dialog"
        aria-label={np ? 'सूचनाहरू' : 'Notifications'}
        onClick={(e) => e.stopPropagation()}
        className="h-full w-full sm:max-w-md flex flex-col bg-white dark:bg-slate-900 sm:rounded-l-[2rem] shadow-soft"
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-2xl font-semibold text-ink dark:text-white">{np ? 'सूचनाहरू' : 'Notifications'}</h3>
            <p className="mt-0.5 text-sm text-ink-soft dark:text-slate-400">
              {unreadCount > 0 ? `${unreadCount} ${np ? 'नपढिएका' : 'unread'}` : np ? 'सबै पढिसकिएको' : 'You’re all caught up'}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="h-9 px-3 inline-flex items-center gap-1.5 rounded-full text-sm text-ink-soft hover:text-ink hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10 transition"
              >
                <CheckCheck className="w-4 h-4" />
                {np ? 'सबै पढियो' : 'Mark all read'}
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-9 h-9 inline-flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/10 text-ink dark:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 pb-4 flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id as any)}
                className={`h-8 px-3.5 rounded-full text-[13px] whitespace-nowrap transition ${
                  activeFilter === f.id
                    ? 'bg-ink text-white dark:bg-white dark:text-ink'
                    : 'text-ink-soft hover:text-ink bg-slate-100/70 dark:bg-white/5 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {np ? f.np : f.en}
              </button>
            ))}
          </div>
          <label className="text-xs text-ink-soft dark:text-slate-400 flex items-center gap-1.5 shrink-0 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => setUnreadOnly(e.target.checked)}
              className="rounded accent-ink"
            />
            {np ? 'नपढिएका' : 'Unread'}
          </label>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 border-t border-slate-100 dark:border-white/10">
          {loading ? (
            <div className="py-16 text-center text-sm text-ink-soft dark:text-slate-400">
              <div className="w-6 h-6 mx-auto mb-3 border-2 border-ink/70 dark:border-white/70 border-t-transparent rounded-full animate-spin" />
              {np ? 'लोड हुँदैछ…' : 'Loading…'}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-16 px-6 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-sky-100 dark:bg-white/10 flex items-center justify-center">
                <Bell className="w-6 h-6 text-ink dark:text-white" />
              </div>
              <p className="mt-4 font-display text-lg font-semibold text-ink dark:text-white">{np ? 'कुनै सूचना छैन' : 'Nothing here yet'}</p>
              <p className="mt-1 text-sm text-ink-soft dark:text-slate-400">
                {np ? 'नयाँ विज्ञापन, क्विज र म्यादका सूचना यहाँ देखिनेछन्।' : 'New vacancy matches, quizzes and deadline reminders will show up here.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const isJob = notif.type === 'job_match' || notif.type === 'vacancy_alert';
              const isDeadline = notif.type === 'deadline_reminder';
              const isQuiz = notif.type === 'quiz_announcement';
              const Icon = isDeadline ? Clock : isJob ? Briefcase : isQuiz ? Target : Bell;

              return (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={`group mt-1 px-3 py-4 flex gap-3 rounded-2xl cursor-pointer transition hover:bg-slate-50 dark:hover:bg-white/5 ${
                    notif.isRead ? '' : 'bg-sky-50/70 dark:bg-white/[0.03]'
                  }`}
                >
                  <span
                    className={`mt-0.5 w-9 h-9 shrink-0 rounded-full inline-flex items-center justify-center ${
                      isDeadline ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300' : 'bg-sky-100 text-ink dark:bg-white/10 dark:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`text-sm leading-snug text-ink dark:text-white ${notif.isRead ? '' : 'font-semibold'}`}>
                        {np && notif.titleNp ? notif.titleNp : notif.title}
                      </h4>
                      {!notif.isRead && <span className="mt-1.5 w-2 h-2 rounded-full bg-sky-500 shrink-0" aria-label="Unread" />}
                    </div>
                    <p className="mt-1 text-[13px] leading-relaxed text-ink-soft dark:text-slate-400">
                      {np && notif.messageNp ? notif.messageNp : notif.message}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-ink-soft dark:text-slate-500">
                      <span>{new Date(notif.createdAt).toLocaleDateString()}</span>
                      {notif.priority === 'urgent' && <span className="text-rose-600 dark:text-rose-400">{np ? 'जरुरी' : 'Urgent'}</span>}
                      {notif.vacancyId && onSelectVacancy && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notif.id);
                            onClose();
                            onSelectVacancy(notif.vacancyId!);
                          }}
                          className="inline-flex items-center gap-0.5 text-ink dark:text-white font-medium hover:underline underline-offset-4"
                        >
                          {np ? 'विज्ञापन हेर्नुहोस्' : 'View vacancy'}
                          <ChevronRight className="w-3.5 h-3.5" />
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
                          className="inline-flex items-center gap-0.5 text-ink dark:text-white font-medium hover:underline underline-offset-4"
                        >
                          {np ? 'क्विज खोल्नुहोस्' : 'Open quiz'}
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={(e) => deleteNotification(notif.id, e)}
                        className="ml-auto w-7 h-7 inline-flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 text-ink-soft hover:text-rose-600 hover:bg-white dark:hover:bg-white/10 transition"
                        title={np ? 'हटाउनुहोस्' : 'Dismiss'}
                        aria-label="Dismiss notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <p className="px-6 py-4 text-xs text-ink-soft dark:text-slate-500 border-t border-slate-100 dark:border-white/10">
          {np ? 'तपाईंको व्यक्तिगत जानकारी कसैलाई साझा गरिँदैन।' : 'Only career-relevant alerts. Your personal information is never shared.'}
        </p>
      </aside>
    </div>
  );
};
