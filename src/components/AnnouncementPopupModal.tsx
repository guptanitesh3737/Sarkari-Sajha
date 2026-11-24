import React, { useState, useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { Announcement } from '../types';
import { fetchAnnouncementsFromFirestore } from '../lib/firestoreService';

export const AnnouncementPopupModal: React.FC = () => {
  const [activePopup, setActivePopup] = useState<Announcement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkPopups = async () => {
      try {
        const announcements = await fetchAnnouncementsFromFirestore();
        const popup = announcements.find((a) => {
          if (a.status !== 'PUBLISHED' || !a.popup_enabled) return false;
          if (a.expires_at && new Date(a.expires_at).getTime() < Date.now()) return false;
          // Check if dismissed in this session or today
          const dismissed = localStorage.getItem(`dismissed_ann_${a.id}`);
          if (dismissed) return false;
          return true;
        });

        if (popup) {
          setActivePopup(popup);
          setIsOpen(true);
        }
      } catch (err) {
        console.error('Error checking announcement popups:', err);
      }
    };

    checkPopups();
  }, []);

  const handleDismiss = () => {
    if (activePopup) {
      localStorage.setItem(`dismissed_ann_${activePopup.id}`, 'true');
    }
    setIsOpen(false);
  };

  if (!isOpen || !activePopup) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-ink/30 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-[2rem] bg-white dark:bg-slate-900 shadow-soft ring-1 ring-black/5 dark:ring-white/10 overflow-hidden">
        <div className="px-7 pt-7 pb-6 bg-gradient-to-b from-sky-100 to-white dark:from-[#0f2236] dark:to-slate-900">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 dark:bg-white/10 text-xs text-ink dark:text-slate-200">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  activePopup.priority === 'urgent' ? 'bg-rose-500' : activePopup.priority === 'high' ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
              />
              Notice
            </span>
            <button
              onClick={handleDismiss}
              className="w-9 h-9 inline-flex items-center justify-center rounded-full text-ink-soft hover:text-ink hover:bg-white/80 dark:text-slate-400 dark:hover:bg-white/10 transition"
              aria-label="Close Announcement"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <h3 className="mt-5 font-display text-2xl font-semibold leading-tight text-ink dark:text-white">{activePopup.title}</h3>
          <p className="mt-2 text-sm text-ink-soft dark:text-slate-400 leading-relaxed">{activePopup.short_description}</p>
        </div>

        <div className="px-7 pb-7">
          {activePopup.full_content && activePopup.full_content !== activePopup.short_description && (
            <p className="text-[13px] text-ink-soft dark:text-slate-400 leading-relaxed">{activePopup.full_content}</p>
          )}
          <div className="mt-6 flex items-center justify-end gap-2">
            <button onClick={handleDismiss} className="h-11 px-4 rounded-full text-sm text-ink-soft hover:text-ink dark:text-slate-400 dark:hover:text-white transition">
              Dismiss
            </button>
            {activePopup.CTA_url ? (
              <a
                href={activePopup.CTA_url}
                target="_blank"
                rel="noreferrer"
                onClick={handleDismiss}
                className="h-11 px-5 inline-flex items-center gap-1.5 rounded-full bg-ink dark:bg-white text-white dark:text-ink text-sm font-medium shadow-pill"
              >
                {activePopup.CTA_text || 'View notice'}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <button onClick={handleDismiss} className="h-11 px-5 rounded-full bg-ink dark:bg-white text-white dark:text-ink text-sm font-medium shadow-pill">
                Got it
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
