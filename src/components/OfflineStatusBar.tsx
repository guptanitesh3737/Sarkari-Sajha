import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { Language } from '../types';

interface OfflineStatusBarProps {
  lang: Language;
}

export const OfflineStatusBar: React.FC<OfflineStatusBarProps> = ({ lang }) => {
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showRestoredToast, setShowRestoredToast] = useState<boolean>(false);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowRestoredToast(true);
      const timer = setTimeout(() => {
        setShowRestoredToast(false);
      }, 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowRestoredToast(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleManualCheck = () => {
    setIsRetrying(true);
    fetch('/favicon.svg', { method: 'HEAD', cache: 'no-store' })
      .then(() => {
        setIsOnline(true);
        setShowRestoredToast(true);
        setTimeout(() => setShowRestoredToast(false), 4000);
      })
      .catch(() => {
        setIsOnline(false);
      })
      .finally(() => {
        setIsRetrying(false);
      });
  };

  if (isOnline && !showRestoredToast) {
    return null;
  }

  if (showRestoredToast) {
    return (
      <aside aria-label="Internet Connection Restored" className="sticky top-0 z-50 bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all animate-in slide-in-from-top duration-300">
        <Wifi className="w-4 h-4 animate-bounce" />
        <span>
          {lang === 'np'
            ? 'तपाईं अनलाइन हुनुभयो! पछिल्लो विज्ञापन र सूचनाहरू सिंक हुँदैछन्।'
            : 'Back online! Reconnected and synchronized with live Lok Sewa servers.'}
        </span>
      </aside>
    );
  }

  return (
    <aside aria-label="Offline Mode Active" className="sticky top-0 z-50 bg-amber-600 dark:bg-amber-700 text-white px-4 py-2.5 text-xs font-semibold flex flex-wrap items-center justify-between gap-2 shadow-md">
      <div className="flex items-center gap-2">
        <span className="p-1 rounded-md bg-amber-700 dark:bg-amber-800 shrink-0">
          <WifiOff className="w-3.5 h-3.5" />
        </span>
        <span>
          <strong>{lang === 'np' ? 'अफलाइन मोड:' : 'Offline Mode:'}</strong>{' '}
          {lang === 'np'
            ? 'इन्टरनेट छैन। तपाईंले सेभ गरिएका विज्ञापन, पाठ्यक्रम र दैनिक प्रश्नहरू हेर्दै हुनुहुन्छ।'
            : 'No internet connection. Serving cached vacancies, syllabus outlines, and local quiz data.'}
        </span>
      </div>

      <button
        onClick={handleManualCheck}
        disabled={isRetrying}
        className="px-2.5 py-1 bg-amber-800 hover:bg-amber-900 active:bg-amber-950 text-white text-[11px] font-bold rounded-lg transition flex items-center gap-1 shrink-0 cursor-pointer shadow-xs disabled:opacity-50"
      >
        <RefreshCw className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} />
        <span>{lang === 'np' ? 'पुनः जाँच गर्नुहोस्' : 'Check Connection'}</span>
      </button>
    </aside>
  );
};
