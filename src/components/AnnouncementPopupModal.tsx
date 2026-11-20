import React, { useState, useEffect } from 'react';
import { Megaphone, X, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative">
        {/* Top Decorative accent */}
        <div className={`h-2 w-full ${
          activePopup.priority === 'urgent'
            ? 'bg-rose-500'
            : activePopup.priority === 'high'
            ? 'bg-amber-500'
            : 'bg-emerald-500'
        }`} />

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Megaphone className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400 font-mono">
                Official SarkariSajha Notice
              </span>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Close Announcement"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white leading-snug">{activePopup.title}</h3>
            <p className="text-sm text-slate-300 leading-relaxed">{activePopup.short_description}</p>
            {activePopup.full_content && activePopup.full_content !== activePopup.short_description && (
              <p className="text-xs text-slate-400 bg-slate-850 p-3 rounded-xl border border-slate-800 leading-relaxed">
                {activePopup.full_content}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
            >
              Dismiss
            </button>
            {activePopup.CTA_url ? (
              <a
                href={activePopup.CTA_url}
                target="_blank"
                rel="noreferrer"
                onClick={handleDismiss}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all"
              >
                <span>{activePopup.CTA_text || 'View Notice'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <button
                onClick={handleDismiss}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                Got It
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
