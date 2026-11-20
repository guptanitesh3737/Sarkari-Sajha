import React, { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare, Smartphone, CheckCircle, Sparkles, ShieldCheck } from 'lucide-react';
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 text-slate-900 dark:text-white relative">
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
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-md shrink-0">
              SS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight">SarkariSajha App</h3>
                <span className="bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                  PWA
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'np' ? 'अफिसियल मोबाइल तथा डेस्कटप एप' : 'Official Progressive Web Application'}
              </p>
            </div>
          </div>

          {/* Features Checklist */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl space-y-2.5 text-xs">
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
            <div className="space-y-3 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 p-4 rounded-2xl text-xs text-blue-950 dark:text-blue-200">
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
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-bold text-sm rounded-2xl transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
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
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl transition"
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

  // Floating Bottom Banner for mobile and desktop
  return (
    <div className="fixed bottom-16 sm:bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-40 sm:max-w-md bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800/80 rounded-2xl p-3.5 sm:p-4 shadow-xl text-slate-900 dark:text-white transition-all animate-in slide-in-from-bottom duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-base shadow-sm shrink-0">
            SS
          </div>
          <div>
            <h4 className="text-xs font-black flex items-center gap-1.5">
              <span>{lang === 'np' ? 'सरकारी साझा एप इन्स्टल गर्नुहोस्' : 'Install SarkariSajha App'}</span>
              <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold px-1.5 py-0.2 rounded">
                FAST
              </span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
              {lang === 'np'
                ? '१-ट्याप पहुँच, अफलाइन प्रश्नोत्तर तथा सूचनाहरू'
                : '1-tap access, offline quizzes & instant notices'}
            </p>
          </div>
        </div>

        <button
          onClick={handleDismissBanner}
          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={handleInstallClick}
          className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{lang === 'np' ? 'इन्स्टल गर्नुहोस्' : 'Install App'}</span>
        </button>

        <button
          onClick={handleDismissBanner}
          className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
        >
          {lang === 'np' ? 'पछि' : 'Later'}
        </button>
      </div>
    </div>
  );
};
