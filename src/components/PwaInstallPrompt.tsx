import React, { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare, Smartphone, CheckCircle, Sparkles, ShieldCheck } from 'lucide-react';
import { BrandMark } from './Header';
import { Language } from '../types';
import { isPwaInstalled, isIosDevice } from '../lib/pwa';

interface PwaInstallPromptProps {
  lang: Language;
  isOpenModal?: boolean;
  onCloseModal?: () => void;
}

export const PwaInstallPrompt: React.FC<PwaInstallPromptProps> = ({
  lang,
  isOpenModal = false,
  onCloseModal
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [showIosGuide, setShowIosGuide] = useState<boolean>(false);
  const [isInstalling, setIsInstalling] = useState<boolean>(false);

  useEffect(() => {
    setIsInstalled(isPwaInstalled());

    try {
      const dismissed = localStorage.getItem('sarkarisajha_pwa_banner_dismissed');
      if (dismissed === 'true') {
        setIsDismissed(true);
      }
    } catch (e) {
      console.warn('LocalStorage access error:', e);
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      console.log('[SarkariSajha PWA] App successfully installed!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIosDevice()) {
      setShowIosGuide(true);
      return;
    }

    if (!deferredPrompt) {
      // Fallback for browsers where prompt isn't directly exposed or already prompted
      setShowIosGuide(true);
      return;
    }

    setIsInstalling(true);
    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('[SarkariSajha PWA] User accepted installation prompt');
        setIsInstalled(true);
      } else {
        console.log('[SarkariSajha PWA] User dismissed installation prompt');
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error('[SarkariSajha PWA] Installation error:', err);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismissBanner = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem('sarkarisajha_pwa_banner_dismissed', 'true');
    } catch (e) {
      console.warn('LocalStorage write error:', e);
    }
  };

  // Full Modal view (when user taps "Install App" from settings or menu)
  if (isOpenModal || showIosGuide) {
    const isIos = isIosDevice();

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 bg-ink/30 backdrop-blur-sm">
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 max-w-md w-full space-y-5 text-slate-900 dark:text-white relative shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
          <button
            onClick={() => {
              setShowIosGuide(false);
              if (onCloseModal) onCloseModal();
            }}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* App Header Emblem */}
          <div className="flex items-center gap-3.5 pt-1">
            <div className="w-12 h-12 rounded-full bg-sky-100 dark:bg-white/10 flex items-center justify-center shrink-0"><BrandMark className="w-3/5 h-3/5" /></div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight">SarkariSajha App</h3>
                <span className="bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                  PWA
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'np' ? 'अफिसियल मोबाइल तथा डेस्कटप एप' : 'Official Progressive Web Application'}
              </p>
            </div>
          </div>

          {/* Features Checklist */}
          <div className="bg-sky-50/70 dark:bg-white/5 p-4 rounded-2xl space-y-2.5 text-xs">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{lang === 'np' ? 'तत्काल १-क्लिक होमस्क्रिन पहुँच' : 'Instant 1-tap Home Screen access'}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{lang === 'np' ? 'अफलाइन पाठ्यक्रम तथा मोडल प्रश्न अभ्यास' : 'Offline syllabus & quiz practice'}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{lang === 'np' ? 'छिटो र डेटा बचत हुने अनुभव' : 'Ultra fast, data-saving caching engine'}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{lang === 'np' ? 'नयाँ विज्ञापनहरूको तुरुन्त अलर्ट' : 'Instant vacancy & exam deadline alerts'}</span>
            </div>
          </div>

          {/* Guide for iOS Safari vs Android Chrome */}
          {isIos ? (
            <div className="space-y-3 bg-blue-50/70 dark:bg-blue-950/40 p-4 rounded-2xl text-xs text-blue-950 dark:text-blue-200">
              <h4 className="font-bold flex items-center gap-1.5 text-blue-900 dark:text-blue-300">
                <Smartphone className="w-4 h-4" />
                <span>{lang === 'np' ? 'iPhone / Safari मा कसरी इन्स्टल गर्ने:' : 'How to install on iPhone & iPad (Safari):'}</span>
              </h4>
              <ol className="space-y-2 pl-4 list-decimal marker:font-bold marker:text-blue-600">
                <li>
                  {lang === 'np'
                    ? 'Safari को तल रहेको शेयर बटन (Share Icon '
                    : 'Tap the Safari Share button ('}
                  <Share className="w-3.5 h-3.5 inline mx-1 text-blue-600" />
                  {lang === 'np' ? ') मा थिच्नुहोस्।' : ') at the bottom toolbar.'}
                </li>
                <li>
                  {lang === 'np'
                    ? 'तल स्क्रोल गरी "Add to Home Screen" ('
                    : 'Scroll down and select "Add to Home Screen" ('}
                  <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-blue-600" />
                  {lang === 'np' ? ') मा ट्याप गर्नुहोस्।' : ').'}
                </li>
                <li>
                  {lang === 'np'
                    ? 'माथि दायाँको "Add" मा थिच्नुहोस्।'
                    : 'Tap "Add" in the top-right corner to finish.'}
                </li>
              </ol>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={handleInstallClick}
                disabled={isInstalling || isInstalled}
                className="w-full py-3.5 disabled:opacity-50 font-bold text-sm rounded-full transition flex items-center justify-center gap-2 cursor-pointer bg-ink hover:bg-black text-white dark:bg-white dark:text-ink"
              >
                <Download className="w-4 h-4" />
                <span>
                  {isInstalled
                    ? (lang === 'np' ? 'एप पहिले नै इन्स्टल भइसकेको छ' : 'App is already installed')
                    : isInstalling
                    ? (lang === 'np' ? 'इन्स्टल हुँदैछ...' : 'Installing...')
                    : (lang === 'np' ? 'मोबाइल / कम्प्युटरमा इन्स्टल गर्नुहोस्' : 'Install SarkariSajha Now')}
                </span>
              </button>

              <p className="text-[11px] text-center text-slate-500 dark:text-slate-400">
                {lang === 'np'
                  ? 'कुनै प्ले स्टोर डाउनलोड आवश्यक पर्दैन • सुरक्षित सिधा इन्स्टलेसन'
                  : 'Zero Play Store storage waste • Official Google Chrome / PWA verified'}
              </p>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => {
                setShowIosGuide(false);
                if (onCloseModal) onCloseModal();
              }}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-full transition"
            >
              {lang === 'np' ? 'बन्द गर्नुहोस्' : 'Dismiss'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If already installed or dismissed, do not render the floating banner
  if (isInstalled || isDismissed) {
    return null;
  }

  // Floating bottom pill for mobile and desktop
  return (
    <div className="fixed bottom-24 lg:bottom-5 left-3 right-3 sm:left-auto sm:right-5 z-40 sm:max-w-sm flex items-center gap-3 pl-2 pr-2 py-2 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-soft ring-1 ring-black/[0.05] dark:ring-white/10 text-ink dark:text-white">
      <span className="w-10 h-10 rounded-full bg-sky-100 dark:bg-white/10 inline-flex items-center justify-center shrink-0">
        <BrandMark className="w-6 h-6" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-tight truncate">
          {lang === 'np' ? 'एप इन्स्टल गर्नुहोस्' : 'Get the app'}
        </p>
        <p className="text-xs text-ink-soft dark:text-slate-400 truncate">
          {lang === 'np' ? 'अफलाइन क्विज र तुरुन्त सूचना' : 'Offline quizzes & instant alerts'}
        </p>
      </div>
      <button
        onClick={handleInstallClick}
        className="h-9 px-4 rounded-full bg-ink dark:bg-white text-white dark:text-ink text-[13px] font-medium shrink-0"
      >
        {lang === 'np' ? 'इन्स्टल' : 'Install'}
      </button>
      <button
        onClick={handleDismissBanner}
        className="w-9 h-9 inline-flex items-center justify-center rounded-full text-ink-soft hover:text-ink hover:bg-slate-100 dark:hover:bg-white/10 shrink-0"
        title={lang === 'np' ? 'पछि' : 'Later'}
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
