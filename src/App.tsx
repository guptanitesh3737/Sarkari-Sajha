/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Suspense } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from './lib/firebase';
import { Header } from './components/Header';
import { VacancyList } from './components/VacancyList';
import { VacancyDetailModal } from './components/VacancyDetailModal';
import { VacancyDetailPage } from './components/VacancyDetailPage';
import { QuizEngine } from './components/QuizEngine';
import { NotificationHub } from './components/NotificationHub';
import { ApplicationTracker } from './components/ApplicationTracker';
import { SyllabusBrowser } from './components/SyllabusBrowser';
import { AiCareerAssistant } from './components/AiCareerAssistant';
import { SubscriptionModal } from './components/SubscriptionModal';
import { UserNotificationCenterModal } from './components/UserNotificationCenterModal';
import { AdminLayout } from './components/AdminLayout';
import { UnauthorizedAccess } from './components/UnauthorizedAccess';
import { ProfileModal } from './components/ProfileModal';
import { AuthModal } from './components/AuthModal';
import { UnverifiedEmailGuard } from './components/UnverifiedEmailGuard';
import { Dashboard } from './components/Dashboard';
import { OfflineStatusBar } from './components/OfflineStatusBar';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';
import { MobileNavigationBar } from './components/MobileNavigationBar';
import { MobileMoreDrawer } from './components/MobileMoreDrawer';
import { TabLoadingFallback, VacancyDetailSkeleton } from './components/Skeletons';
import { setPageSEO } from './utils/seo';
import { AboutPage } from './components/AboutPage';
import { PrivacyPage } from './components/PrivacyPage';
import { TermsPage } from './components/TermsPage';
import { DisclaimerPage } from './components/DisclaimerPage';
import { ContactPage } from './components/ContactPage';
import { NotFoundPage } from './components/NotFoundPage';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { BetaFeedbackModal } from './components/BetaFeedbackModal';
import { AdminPortal } from './components/AdminPortal';
import { AiSubjectiveEvaluator } from './components/AiSubjectiveEvaluator';
import { AiJobMatcher } from './components/AiJobMatcher';
import { EnhancedLeaderboard } from './components/EnhancedLeaderboard';
import { AdministrativeAlertsCenter } from './components/AdministrativeAlertsCenter';
import { GoogleSheetsSyncModal } from './components/GoogleSheetsSyncModal';
import { AnnouncementPopupModal } from './components/AnnouncementPopupModal';
import {
  syncUserProfileToFirestore,
  updateUserProfileInFirestore,
  fetchUserApplicationsFromFirestore,
  saveApplicationToFirestore,
  deleteApplicationFromFirestore,
  getUserRoleFromFirestore,
  fetchUserQuizAttemptsFromFirestore,
  saveQuizAttemptToFirestore,
  AdminRole
} from './lib/firestoreService';
import {
  Vacancy,
  UserProfile,
  QuizSet,
  QuizAttempt,
  NotificationLog,
  ApplicationTrack,
  Language,
  ApplicationStatus,
  Theme,
  UserSubscription
} from './types';
import { INITIAL_USER_PROFILE, INITIAL_APPLICATIONS, INITIAL_QUIZ_ATTEMPTS } from './data/seedData';
import { recordRecentlyViewed } from './utils/userDashboardUtils';

export default function App() {
  // The site is light-only by design. `theme`/`setTheme` stay so existing props keep compiling.
  const theme: Theme = 'light';
  const setTheme = (_newTheme: Theme) => {};

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    try {
      localStorage.removeItem('sarkarisajha_theme');
    } catch {
      // Storage can be unavailable (private mode); nothing to clean up then.
    }
  }, []);

  const [activeTab, setActiveTabState] = useState<string>(() => {
    const path = window.location.pathname.toLowerCase();
    if (path.startsWith('/admin')) return 'admin';
    if (path.startsWith('/dashboard') || path.startsWith('/user')) return 'dashboard';
    if (path.startsWith('/vacancies/') || path.startsWith('/vacancy/')) return 'vacancy_detail';
    if (path.startsWith('/ai-assistant') || path.startsWith('/assistant')) return 'ai_assistant';
    if (path.startsWith('/syllabus')) return 'syllabus';
    if (path.startsWith('/subjective') || path.startsWith('/written')) return 'subjective';
    if (path.startsWith('/leaderboard') || path.startsWith('/ranks')) return 'leaderboard';
    if (path.startsWith('/matcher')) return 'matcher';
    if (path.startsWith('/quizzes') || path.startsWith('/quiz')) return 'quizzes';
    if (path.startsWith('/alerts') || path.startsWith('/notifications')) return 'alerts';
    if (path.startsWith('/tracker') || path.startsWith('/saved-jobs')) return 'tracker';
    if (path.startsWith('/about')) return 'about';
    if (path.startsWith('/privacy')) return 'privacy';
    if (path.startsWith('/terms')) return 'terms';
    if (path.startsWith('/disclaimer')) return 'disclaimer';
    if (path.startsWith('/contact')) return 'contact';
    if (path === '/' || path === '') return 'vacancies';
    return 'not_found';
  });
  const [adminSubTab, setAdminSubTab] = useState<string>(() => {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('vacancy-extractor')) return 'ai_vacancy_extractor';
    if (path.includes('quiz-generator')) return 'ai_quiz_generator';
    if (path.includes('ai-tools')) return 'ai_tools';
    if (path.includes('quizzes')) return 'quizzes';
    if (path.includes('vacancies')) return 'vacancies';
    if (path.includes('users')) return 'users';
    if (path.includes('team')) return 'team';
    if (path.includes('notifications')) return 'notifications';
    if (path.includes('activity')) return 'activity_logs';
    if (path.includes('settings')) return 'settings';
    return 'dashboard';
  });
  const [lang, setLang] = useState<Language>('en');

  // Dedicated vacancy detail page state
  const [activeDetailVacancy, setActiveDetailVacancy] = useState<Vacancy | null>(null);

  // Firebase Auth & User Role State
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [, setAuthRefreshTick] = useState(0);
  const [userRole, setUserRole] = useState<AdminRole>('candidate');
  const [checkingRole, setCheckingRole] = useState<boolean>(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [subscription, setSubscription] = useState<UserSubscription | undefined>(undefined);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showNotificationCenterModal, setShowNotificationCenterModal] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showMobileMoreDrawer, setShowMobileMoreDrawer] = useState(false);
  const [showBetaFeedbackModal, setShowBetaFeedbackModal] = useState(false);
  const [inAppUnreadCount, setInAppUnreadCount] = useState(0);

  // Fetch initial unread in-app notification count
  useEffect(() => {
    let isMounted = true;
    fetch('/api/notifications/in-app')
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (isMounted && data && Array.isArray(data.notifications)) {
          const unread = data.notifications.filter((n: any) => !n.isRead).length;
          setInAppUnreadCount(unread);
        }
      })
      .catch(() => {
        // Quietly failover during initial network/server boot
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Quiz active launcher state
  const [activeQuizSetId, setActiveQuizSetId] = useState<string | undefined>(undefined);

  // Sync activeTab with URL pushState
  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    const newPath = tab === 'vacancies' ? '/' : (tab === 'ai_assistant' ? '/ai-assistant' : `/${tab}`);
    if (window.location.pathname !== newPath) {
      window.history.pushState({ tab }, '', newPath);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      if (path.startsWith('/admin')) {
        setActiveTabState('admin');
        if (path.includes('vacancy-extractor')) setAdminSubTab('ai_vacancy_extractor');
        else if (path.includes('quiz-generator')) setAdminSubTab('ai_quiz_generator');
        else if (path.includes('ai-tools')) setAdminSubTab('ai_tools');
        else if (path.includes('quizzes')) setAdminSubTab('quizzes');
        else if (path.includes('vacancies')) setAdminSubTab('vacancies');
        else if (path.includes('users')) setAdminSubTab('users');
        else if (path.includes('team')) setAdminSubTab('team');
        else if (path.includes('notifications')) setAdminSubTab('notifications');
        else if (path.includes('activity')) setAdminSubTab('activity_logs');
        else if (path.includes('settings')) setAdminSubTab('settings');
      }
      else if (path.startsWith('/dashboard') || path.startsWith('/user')) setActiveTabState('dashboard');
      else if (path.startsWith('/vacancies/') || path.startsWith('/vacancy/')) {
        // Back/forward onto a vacancy URL: reload that vacancy instead of falling through to 404.
        const slug = path.split('/')[2];
        setActiveTabState('vacancy_detail');
        if (slug) {
          fetch(`/api/vacancies/${encodeURIComponent(slug)}`)
            .then((r) => (r.ok ? r.json() : null))
            .then((v) => setActiveDetailVacancy(v || null))
            .catch(() => setActiveDetailVacancy(null));
        }
      }
      else if (path.startsWith('/ai-assistant') || path.startsWith('/assistant')) setActiveTabState('ai_assistant');
      else if (path.startsWith('/syllabus')) setActiveTabState('syllabus');
      else if (path.startsWith('/subjective') || path.startsWith('/written')) setActiveTabState('subjective');
      else if (path.startsWith('/leaderboard') || path.startsWith('/ranks')) setActiveTabState('leaderboard');
      else if (path.startsWith('/matcher')) setActiveTabState('matcher');
      else if (path.startsWith('/quizzes') || path.startsWith('/quiz')) setActiveTabState('quizzes');
      else if (path.startsWith('/alerts') || path.startsWith('/notifications')) setActiveTabState('alerts');
      else if (path.startsWith('/tracker') || path.startsWith('/saved-jobs')) setActiveTabState('tracker');
      else if (path.startsWith('/about')) setActiveTabState('about');
      else if (path.startsWith('/privacy')) setActiveTabState('privacy');
      else if (path.startsWith('/terms')) setActiveTabState('terms');
      else if (path.startsWith('/disclaimer')) setActiveTabState('disclaimer');
      else if (path.startsWith('/contact')) setActiveTabState('contact');
      else if (path === '/' || path === '') setActiveTabState('vacancies');
      else setActiveTabState('not_found');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Dynamic SEO meta tags per active view
  useEffect(() => {
    if (activeTab === 'vacancies') {
      setPageSEO({
        title: lang === 'np'
          ? 'नेपाल सरकारी विज्ञापनहरू तथा लोक सेवा परीक्षा तयारी – SarkariSajha'
          : 'Official Nepal Government Vacancies 2026 – Lok Sewa, Banking & Public Service | SarkariSajha',
        description: 'Search official Nepal Lok Sewa Aayog, TSC, banking, and provincial vacancy notices. Instant qualification filter, syllabus guides, and application alerts.',
        canonicalUrl: `${window.location.origin}/`,
        ogType: 'website'
      });
    } else if (activeTab === 'about') {
      setPageSEO({
        title: lang === 'np' ? 'हाम्रो बारेमा – SarkariSajha' : 'About Us – SarkariSajha Nepal Job Portal',
        description: 'Learn about SarkariSajha mission to empower Nepal public service aspirants with open vacancy data and AI mock tests.',
        canonicalUrl: `${window.location.origin}/about`,
        ogType: 'website'
      });
    } else if (activeTab === 'privacy') {
      setPageSEO({
        title: lang === 'np' ? 'गोपनीयता नीति – SarkariSajha' : 'Privacy Policy & Data Security – SarkariSajha',
        description: 'Read the SarkariSajha candidate data privacy policy and security protocols.',
        canonicalUrl: `${window.location.origin}/privacy`,
        ogType: 'website'
      });
    } else if (activeTab === 'terms') {
      setPageSEO({
        title: lang === 'np' ? 'सेवाका सर्तहरू – SarkariSajha' : 'Terms of Service – SarkariSajha',
        description: 'Terms and conditions governing the use of SarkariSajha examination and recruitment portal.',
        canonicalUrl: `${window.location.origin}/terms`,
        ogType: 'website'
      });
    } else if (activeTab === 'disclaimer') {
      setPageSEO({
        title: lang === 'np' ? 'आधिकारिक अस्वीकरण – SarkariSajha' : 'Public Disclaimer – SarkariSajha',
        description: 'SarkariSajha independent non-government status disclaimer and verification guidelines.',
        canonicalUrl: `${window.location.origin}/disclaimer`,
        ogType: 'website'
      });
    } else if (activeTab === 'contact') {
      setPageSEO({
        title: lang === 'np' ? 'सम्पर्क तथा सहयोग – SarkariSajha' : 'Contact & Support Desk – SarkariSajha',
        description: 'Reach our Kathmandu editorial team and candidate helpline for questions or notice clarifications.',
        canonicalUrl: `${window.location.origin}/contact`,
        ogType: 'website'
      });
    } else if (activeTab === 'not_found') {
      setPageSEO({
        title: '404 Page Not Found – SarkariSajha',
        description: 'The requested page could not be found. Search open vacancies or explore syllabus guides.',
        canonicalUrl: `${window.location.origin}/404`,
        noIndex: true
      });
    } else if (activeTab === 'syllabus') {
      setPageSEO({
        title: lang === 'np'
          ? 'लोक सेवा पाठ्यक्रम तथा अध्ययन सामग्रीहरू – SarkariSajha'
          : 'Lok Sewa Aayog Syllabus, Exam Papers & Study Notes – SarkariSajha',
        description: 'Official PSC examination syllabus for Section Officer, Nayab Subba, Kharidar, Computer Officer, and Banking positions with chapter notes.',
        canonicalUrl: `${window.location.origin}/syllabus`,
        ogType: 'website'
      });
    } else if (activeTab === 'quizzes') {
      setPageSEO({
        title: lang === 'np'
          ? 'दैनिक लोक सेवा नमुना प्रश्नहरू तथा अनलाइन क्विज – SarkariSajha'
          : 'Daily Lok Sewa Mock Tests, GK Practice & PSC Quiz Lab – SarkariSajha',
        description: 'Practice timed Lok Sewa model questions with negative marking, instant answer explanations, and national candidate rankings.',
        canonicalUrl: `${window.location.origin}/quiz`,
        ogType: 'website'
      });
    } else if (activeTab === 'leaderboard') {
      setPageSEO({
        title: 'National Candidate Leaderboard & PSC Performance Ranks – SarkariSajha',
        description: 'Live performance rankings across Nepal for Lok Sewa mock tests, subject proficiency, and practice test streaks.',
        canonicalUrl: `${window.location.origin}/leaderboard`,
        ogType: 'website'
      });
    } else if (activeTab === 'ai_assistant') {
      setPageSEO({
        title: 'AI Career Assistant & PSC Eligibility Counselor – SarkariSajha',
        description: 'AI-guided Lok Sewa career counselor. Analyze eligibility, generate 30-day study blueprints, and check official recruitment rules.',
        canonicalUrl: `${window.location.origin}/ai-assistant`,
        ogType: 'website'
      });
    } else if (activeTab === 'matcher') {
      setPageSEO({
        title: 'AI Job Matcher & Instant Qualification Analyzer – SarkariSajha',
        description: 'Instant job eligibility matching based on your degree, age, province, and study stream across all active government notices.',
        canonicalUrl: `${window.location.origin}/matcher`,
        ogType: 'website'
      });
    } else if (activeTab === 'subjective') {
      setPageSEO({
        title: 'AI Subjective Paper Evaluator & Written Exam Feedback – SarkariSajha',
        description: 'AI-powered subjective answer paper evaluation based on official Nepal PSC marking schemes and model answers.',
        canonicalUrl: `${window.location.origin}/subjective`,
        ogType: 'website'
      });
    } else if (activeTab === 'tracker') {
      setPageSEO({
        title: 'Application Tracker & Deadline Manager – SarkariSajha',
        description: 'Track government job application milestones, fee payment statuses, and syllabus progress privately and securely.',
        canonicalUrl: `${window.location.origin}/tracker`,
        ogType: 'website'
      });
    } else if (activeTab === 'alerts') {
      setPageSEO({
        title: 'Official PSC Notices & Administrative Alerts – SarkariSajha',
        description: 'Verified administrative notices, examination center publications, and results from Nepal Public Service Commissions.',
        canonicalUrl: `${window.location.origin}/alerts`,
        ogType: 'website'
      });
    } else if (activeTab === 'dashboard') {
      setPageSEO({
        title: 'Candidate Dashboard & Exam Preparation Hub – SarkariSajha',
        description: 'Personal candidate portal with saved vacancies, quiz performance analytics, and recent study materials.',
        canonicalUrl: `${window.location.origin}/dashboard`,
        ogType: 'website'
      });
    } else if (activeTab === 'admin') {
      setPageSEO({
        title: 'Editorial & Administration Portal – SarkariSajha',
        description: 'SarkariSajha editorial team portal for vacancy ingestion, AI question generation, and user management.',
        canonicalUrl: `${window.location.origin}/admin`,
        noIndex: true
      });
    }
  }, [activeTab, lang]);

  // Data Stores
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [quizSets, setQuizSets] = useState<QuizSet[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>(INITIAL_QUIZ_ATTEMPTS);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [applications, setApplications] = useState<ApplicationTrack[]>([]);

  // Modals state declaration & Escape key closing for keyboard accessibility
  const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSheetsModal, setShowSheetsModal] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedVacancy) setSelectedVacancy(null);
        if (showProfileModal) setShowProfileModal(false);
        if (showSheetsModal) setShowSheetsModal(false);
        if (showAuthModal) setShowAuthModal(false);
        if (showSubscriptionModal) setShowSubscriptionModal(false);
        if (showNotificationCenterModal) setShowNotificationCenterModal(false);
        if (showInstallModal) setShowInstallModal(false);
        if (showMobileMoreDrawer) setShowMobileMoreDrawer(false);
        if (showBetaFeedbackModal) setShowBetaFeedbackModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedVacancy,
    showProfileModal,
    showSheetsModal,
    showAuthModal,
    showSubscriptionModal,
    showNotificationCenterModal,
    showInstallModal,
    showMobileMoreDrawer,
    showBetaFeedbackModal
  ]);
  const [loading, setLoading] = useState(true);

  // Track recently viewed helper
  const handleSelectVacancyWithTracking = (v: Vacancy) => {
    setSelectedVacancy(v);
    recordRecentlyViewed(v.id);
  };

  const handleOpenDetailWithTracking = (v: Vacancy) => {
    setActiveDetailVacancy(v);
    recordRecentlyViewed(v.id);
    const slug = v.slug || v.id;
    window.history.pushState({ tab: 'vacancy_detail', slug }, '', `/vacancies/${slug}`);
    setActiveTabState('vacancy_detail');
  };

  // Import Handler for Google Sheets
  const handleImportApplications = async (importedApps: Partial<ApplicationTrack>[]) => {
    if (!firebaseUser) {
      setShowAuthModal(true);
      return;
    }
    for (const appData of importedApps) {
      if (appData.vacancyId) {
        try {
          const saved = await saveApplicationToFirestore(
            firebaseUser.uid,
            appData.vacancyId,
            appData.status || 'Bookmarked',
            appData.notes || 'Imported via Google Sheets',
            appData.feePaid || false
          );
          if (saved) {
            setApplications((prev) => [saved, ...prev.filter((a) => a.vacancyId !== saved.vacancyId)]);
          }
        } catch (e) {
          console.error('Import app error:', e);
        }
      }
    }
  };

  // Firebase Auth Listener & Firestore Profile / Role / Applications Sync
  useEffect(() => {
    setCheckingRole(true);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        // Fetch role from Firestore
        const role = await getUserRoleFromFirestore(user.uid);
        setUserRole(role);

        // Sync & fetch user profile from Firestore
        const firestoreProf = await syncUserProfileToFirestore(user.uid, {
          email: user.email,
          displayName: user.displayName,
          phoneNumber: user.phoneNumber
        });
        if (firestoreProf) {
          setUserProfile(firestoreProf);
        }

        // Fetch user's private applications from Firestore
        const userApps = await fetchUserApplicationsFromFirestore(user.uid);
        setApplications(userApps);

        // Fetch user's private quiz attempts from Firestore
        const userAttempts = await fetchUserQuizAttemptsFromFirestore(user.uid);
        if (userAttempts && userAttempts.length > 0) {
          setQuizAttempts(userAttempts);
        }
      } else {
        setUserRole('candidate');
        setUserProfile(INITIAL_USER_PROFILE);
        setApplications(INITIAL_APPLICATIONS);
        setQuizAttempts(INITIAL_QUIZ_ATTEMPTS);
      }
      setCheckingRole(false);
    });
    return () => unsubscribe();
  }, []);

  const handleQuizAttemptComplete = async (attempt: QuizAttempt) => {
    setQuizAttempts((prev) => [attempt, ...prev.filter((a) => a.id !== attempt.id)]);
    if (firebaseUser) {
      await saveQuizAttemptToFirestore({
        ...attempt,
        userId: firebaseUser.uid,
        userName: userProfile.name || firebaseUser.displayName || attempt.userName
      });
    }
  };

  // Fetch initial data from server API (vacancies, quizzes, notifications, subscription)
  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [vacRes, quizRes, notifRes, subRes] = await Promise.all([
        fetch('/api/vacancies').catch(() => null),
        fetch('/api/quizzes').catch(() => null),
        fetch('/api/notifications').catch(() => null),
        fetch('/api/user/subscription').catch(() => null)
      ]);

      const [vacData, quizData, notifData] = await Promise.all([
        vacRes && vacRes.ok ? vacRes.json().catch(() => []) : [],
        quizRes && quizRes.ok ? quizRes.json().catch(() => []) : [],
        notifRes && notifRes.ok ? notifRes.json().catch(() => []) : []
      ]);

      if (subRes && subRes.ok) {
        const subData = await subRes.json().catch(() => null);
        if (subData?.tier) {
          setSubscription(subData);
        }
      }

      const list: Vacancy[] = Array.isArray(vacData) ? vacData : (vacData?.data || []);
      setVacancies(list);

      // Check if initial path was a vacancy detail page
      const path = window.location.pathname.toLowerCase();
      if (path.startsWith('/vacancies/') || path.startsWith('/vacancy/')) {
        const rawSlug = path.split('/')[2];
        if (rawSlug) {
          const found = list.find(v => v.slug === rawSlug || v.id === rawSlug);
          if (found) {
            setActiveDetailVacancy(found);
            setActiveTabState('vacancy_detail');
          } else {
            // Fetch individual vacancy from server endpoint
            fetch(`/api/vacancies/${encodeURIComponent(rawSlug)}`)
              .then(r => r.ok ? r.json() : null)
              .then(singleVac => {
                if (singleVac) {
                  setActiveDetailVacancy(singleVac);
                  setActiveTabState('vacancy_detail');
                }
              })
              .catch(e => console.error('Error fetching deep linked vacancy:', e));
          }
        }
      }
      if (Array.isArray(quizData)) setQuizSets(quizData);
      if (Array.isArray(notifData)) setNotifications(notifData);
    } catch (err) {
      console.error('Error fetching initial app data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const bookmarkedIds = applications.map((a) => a.vacancyId);

  // Toggle Bookmark Handler (Requires Auth for persistent private save)
  const handleToggleBookmark = async (vacancy: Vacancy) => {
    if (!firebaseUser) {
      setShowAuthModal(true);
      return;
    }

    const existing = applications.find((a) => a.vacancyId === vacancy.id);
    if (existing) {
      // Delete from Firestore
      try {
        await deleteApplicationFromFirestore(firebaseUser.uid, existing.id);
        setApplications((prev) => prev.filter((a) => a.id !== existing.id));
      } catch (e) {
        console.error(e);
      }
    } else {
      // Save to Firestore
      try {
        const saved = await saveApplicationToFirestore(
          firebaseUser.uid,
          vacancy.id,
          'Bookmarked',
          '',
          false
        );
        if (saved) {
          setApplications((prev) => [saved, ...prev.filter((a) => a.vacancyId !== vacancy.id)]);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleUpdateApplicationStatus = async (
    appId: string,
    status: ApplicationStatus,
    notes?: string,
    feePaid?: boolean
  ) => {
    if (!firebaseUser) {
      setShowAuthModal(true);
      return;
    }

    const targetApp = applications.find((a) => a.id === appId);
    if (!targetApp) return;

    try {
      const saved = await saveApplicationToFirestore(
        firebaseUser.uid,
        targetApp.vacancyId,
        status,
        notes !== undefined ? notes : targetApp.notes || '',
        feePaid !== undefined ? feePaid : targetApp.feePaid
      );
      if (saved) {
        setApplications((prev) => prev.map((a) => (a.id === appId ? saved : a)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveApplication = async (appId: string) => {
    if (!firebaseUser) {
      setShowAuthModal(true);
      return;
    }

    try {
      await deleteApplicationFromFirestore(firebaseUser.uid, appId);
      setApplications((prev) => prev.filter((a) => a.id !== appId));
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateProfile = async (updated: UserProfile) => {
    setUserProfile(updated);
    if (firebaseUser) {
      await updateUserProfileInFirestore(firebaseUser.uid, updated);
    }
  };

  const handleRefreshVacancies = async () => {
    const res = await fetch('/api/vacancies');
    const data = await res.json();
    if (Array.isArray(data)) setVacancies(data);
  };

  const handleRefreshNotifications = async () => {
    const res = await fetch('/api/notifications');
    const data = await res.json();
    if (Array.isArray(data)) setNotifications(data);
  };

  const handleReloadUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setFirebaseUser(auth.currentUser);
      setAuthRefreshTick((t) => t + 1);
    }
  };

  const isUnverifiedEmail = !!(firebaseUser && firebaseUser.email && !firebaseUser.emailVerified);

  return (
    <div className="sky-canvas min-h-screen text-ink dark:text-slate-100 font-sans antialiased selection:bg-sky-200 selection:text-ink transition-colors duration-200">
      {/* Dynamic Offline / Connection Status Banner */}
      <OfflineStatusBar lang={lang} />

      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
        theme={theme}
        setTheme={setTheme}
        userProfile={userProfile}
        onOpenProfile={() => setShowProfileModal(true)}
        notifications={notifications}
        firebaseUser={firebaseUser}
        userRole={userRole}
        isAdmin={['editor', 'admin', 'super_admin'].includes(userRole)}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenSheetsModal={() => setShowSheetsModal(true)}
        onOpenSubscription={() => setShowSubscriptionModal(true)}
        onOpenNotificationCenter={() => setShowNotificationCenterModal(true)}
        onOpenInstallPrompt={() => setShowInstallModal(true)}
        onOpenBetaFeedback={() => setShowBetaFeedbackModal(true)}
        unreadInAppCount={inAppUnreadCount}
        subscription={subscription}
      />

      {/* Non-dismissible Global Email Verification Banner */}
      {isUnverifiedEmail && (
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-medium">
            <div className="flex items-center gap-2">
              <span className="p-1 bg-white/20 rounded-full">⚠️</span>
              <span>
                {lang === 'np'
                  ? `तपाईंको इमेल (${firebaseUser?.email}) अझै पुष्टी भएको छैन। संवेदनशील क्षेत्रहरू सुरक्षित गर्न कृपया इमेल पुष्टी गर्नुहोस्।`
                  : `Your email address (${firebaseUser?.email}) is unverified. Verification is required to access sensitive areas like the Application Tracker.`}
              </span>
            </div>
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-3 py-1 bg-white text-amber-900 font-bold rounded-lg shadow-xs hover:bg-amber-50 transition shrink-0"
            >
              {lang === 'np' ? 'इमेल पुष्टी गर्नुहोस्' : 'Verify Email Now'}
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-28 lg:pb-12">
        {loading ? (
          <div className="py-32 text-center space-y-3">
            <div className="w-7 h-7 border-2 border-ink/80 dark:border-white/80 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-ink-soft dark:text-slate-400">Loading…</p>
          </div>
        ) : (
          <>
            {activeTab === 'vacancy_detail' && (
              activeDetailVacancy ? (
                <VacancyDetailPage
                  vacancy={activeDetailVacancy}
                  userProfile={userProfile}
                  lang={lang}
                  onBack={() => setActiveTab('vacancies')}
                  onBookmark={handleToggleBookmark}
                  isBookmarked={bookmarkedIds.includes(activeDetailVacancy.id)}
                  onOpenMatchModal={() => setSelectedVacancy(activeDetailVacancy)}
                  onOpenSyllabus={() => setActiveTab('syllabus')}
                />
              ) : (
                <div className="py-16 text-center space-y-4">
                  <p className="text-slate-500 text-sm">Notice not found or currently under editorial review.</p>
                  <button
                    onClick={() => setActiveTab('vacancies')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
                  >
                    Back to All Vacancies
                  </button>
                </div>
              )
            )}

            {activeTab === 'vacancies' && (
              <VacancyList
                vacancies={vacancies}
                userProfile={userProfile}
                lang={lang}
                onSelectVacancy={(v) => {
                  handleOpenDetailWithTracking(v);
                }}
                onBookmark={handleToggleBookmark}
                bookmarkedIds={bookmarkedIds}
              />
            )}

            {activeTab === 'dashboard' && (
              <Dashboard
                vacancies={vacancies}
                userProfile={userProfile}
                applications={applications}
                quizSets={quizSets}
                quizAttempts={quizAttempts}
                notifications={notifications}
                lang={lang}
                firebaseUser={firebaseUser}
                onOpenAuth={() => setShowAuthModal(true)}
                onOpenProfile={() => setShowProfileModal(true)}
                onSelectVacancy={(v) => {
                  handleOpenDetailWithTracking(v);
                }}
                onToggleSaveVacancy={async (vacId) => {
                  const vac = vacancies.find((v) => v.id === vacId);
                  if (vac) {
                    await handleToggleBookmark(vac);
                    return true;
                  }
                  return false;
                }}
                onStartQuiz={(qSetId) => {
                  setActiveQuizSetId(qSetId);
                  setActiveTab('quizzes');
                }}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onOpenSheetsSync={() => setShowSheetsModal(true)}
                subscription={subscription}
                onOpenSubscription={() => setShowSubscriptionModal(true)}
                onUpdateProfile={handleUpdateProfile}
                onUpdateApplicationStatus={handleUpdateApplicationStatus}
                onRemoveApplication={handleRemoveApplication}
              />
            )}

            {activeTab === 'syllabus' && (
              <SyllabusBrowser
                lang={lang}
                onLaunchQuiz={(id) => {
                  setActiveQuizSetId(id || undefined);
                  setActiveTab('quizzes');
                }}
                subscription={subscription}
                onOpenUpgrade={() => setShowSubscriptionModal(true)}
              />
            )}

            {activeTab === 'ai_assistant' && (
              <AiCareerAssistant
                userProfile={userProfile}
                vacancies={vacancies}
                lang={lang}
                onSelectVacancy={(v) => handleSelectVacancyWithTracking(v)}
                onStartQuiz={(qSetId) => {
                  setActiveQuizSetId(qSetId);
                  setActiveTab('quizzes');
                }}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'subjective' && (
              <Suspense fallback={<TabLoadingFallback label="Loading AI Subjective Paper Evaluator..." />}>
                <AiSubjectiveEvaluator
                  lang={lang}
                  userProfile={userProfile}
                  subscription={subscription}
                  onOpenUpgrade={() => setShowSubscriptionModal(true)}
                />
              </Suspense>
            )}

            {activeTab === 'matcher' && (
              <Suspense fallback={<TabLoadingFallback label="Loading AI Job Matcher..." />}>
                <AiJobMatcher
                  userProfile={userProfile}
                  vacancies={vacancies}
                  lang={lang}
                  onUpdateProfile={handleUpdateProfile}
                  onSelectVacancy={(v) => handleSelectVacancyWithTracking(v)}
                />
              </Suspense>
            )}

            {activeTab === 'quizzes' && (
              <QuizEngine
                quizSets={quizSets}
                lang={lang}
                userProfile={userProfile}
                onAttemptComplete={handleQuizAttemptComplete}
                initialQuizSetId={activeQuizSetId}
              />
            )}

            {activeTab === 'leaderboard' && (
              <Suspense fallback={<TabLoadingFallback label="Loading National Candidate Leaderboard..." />}>
                <EnhancedLeaderboard
                  lang={lang}
                  userProfile={userProfile}
                  quizSets={quizSets}
                />
              </Suspense>
            )}

            {activeTab === 'alerts' && (
              <Suspense fallback={<TabLoadingFallback label="Loading Official Administrative Notices..." />}>
                <AdministrativeAlertsCenter lang={lang} />
              </Suspense>
            )}

            {activeTab === 'tracker' && (
              isUnverifiedEmail ? (
                <UnverifiedEmailGuard
                  firebaseUser={firebaseUser!}
                  lang={lang}
                  onReloadUser={handleReloadUser}
                  onSignOut={() => auth.signOut()}
                />
              ) : (
                <ApplicationTracker
                  applications={applications}
                  vacancies={vacancies}
                  lang={lang}
                  firebaseUser={firebaseUser}
                  onOpenAuth={() => setShowAuthModal(true)}
                  onUpdateStatus={handleUpdateApplicationStatus}
                  onRemoveApp={handleRemoveApplication}
                  onSelectVacancy={(v) => setSelectedVacancy(v)}
                  onOpenGoogleSheetsSync={() => setShowSheetsModal(true)}
                />
              )
            )}

            {activeTab === 'about' && (
              <AboutPage
                lang={lang}
                onNavigateHome={() => setActiveTab('vacancies')}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'privacy' && (
              <PrivacyPage
                lang={lang}
                onNavigateHome={() => setActiveTab('vacancies')}
              />
            )}

            {activeTab === 'terms' && (
              <TermsPage
                lang={lang}
                onNavigateHome={() => setActiveTab('vacancies')}
              />
            )}

            {activeTab === 'disclaimer' && (
              <DisclaimerPage
                lang={lang}
                onNavigateHome={() => setActiveTab('vacancies')}
              />
            )}

            {activeTab === 'contact' && (
              <ContactPage
                lang={lang}
                onNavigateHome={() => setActiveTab('vacancies')}
              />
            )}

            {activeTab === 'not_found' && (
              <NotFoundPage
                lang={lang}
                onNavigateHome={() => setActiveTab('vacancies')}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'admin' && (
              checkingRole ? (
                <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                  <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-slate-500 font-mono">Verifying Firebase Auth security credentials & role privileges...</p>
                </div>
              ) : !firebaseUser ? (
                <AdminLayout
                  user={null}
                  role="candidate"
                  lang={lang}
                  onExitAdmin={() => setActiveTab('vacancies')}
                  activeTab={adminSubTab}
                  setActiveTab={setAdminSubTab}
                >
                  <UnauthorizedAccess
                    user={null}
                    role="candidate"
                    lang={lang}
                    onNavigateHome={() => setActiveTab('vacancies')}
                    onOpenAuthModal={() => setShowAuthModal(true)}
                  />
                </AdminLayout>
              ) : !['editor', 'admin', 'super_admin'].includes(userRole) ? (
                <AdminLayout
                  user={firebaseUser}
                  role={userRole}
                  lang={lang}
                  onExitAdmin={() => setActiveTab('vacancies')}
                  activeTab={adminSubTab}
                  setActiveTab={setAdminSubTab}
                >
                  <UnauthorizedAccess
                    user={firebaseUser}
                    role={userRole}
                    lang={lang}
                    onNavigateHome={() => setActiveTab('vacancies')}
                    onOpenAuthModal={() => setShowAuthModal(true)}
                    onRoleUpdated={(newRole) => setUserRole(newRole)}
                  />
                </AdminLayout>
              ) : (
                <AdminLayout
                  user={firebaseUser}
                  role={userRole}
                  lang={lang}
                  onExitAdmin={() => setActiveTab('vacancies')}
                  activeTab={adminSubTab}
                  setActiveTab={setAdminSubTab}
                >
                  <Suspense fallback={<TabLoadingFallback label="Loading Editorial Management Console..." />}>
                    <AdminPortal
                      vacancies={vacancies}
                      lang={lang}
                      user={firebaseUser}
                      userRole={userRole}
                      activeTab={adminSubTab}
                      setActiveTab={setAdminSubTab}
                      onAddVacancy={(newV) => setVacancies((prev) => [newV, ...prev])}
                      onUpdateVacancy={(updatedV) => setVacancies((prev) => prev.map((v) => v.id === updatedV.id ? updatedV : v))}
                      onDeleteVacancy={(id) => setVacancies((prev) => prev.filter((v) => v.id !== id))}
                      onRefreshVacancies={handleRefreshVacancies}
                    />
                  </Suspense>
                </AdminLayout>
              )
            )}
          </>
        )}
      </main>

      {/* Footer (User facing) */}
      {activeTab !== 'admin' && (
        <Footer
          lang={lang}
          setLang={setLang}
          theme={theme}
          setTheme={setTheme}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenInstallPrompt={() => setShowInstallModal(true)}
        />
      )}

      {/* Modals */}
      {selectedVacancy && (
        <VacancyDetailModal
          vacancy={selectedVacancy}
          userProfile={userProfile}
          lang={lang}
          onClose={() => setSelectedVacancy(null)}
          onBookmark={handleToggleBookmark}
          isBookmarked={bookmarkedIds.includes(selectedVacancy.id)}
        />
      )}

      {showProfileModal && (
        <ProfileModal
          userProfile={userProfile}
          lang={lang}
          onClose={() => setShowProfileModal(false)}
          onSave={handleUpdateProfile}
        />
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        lang={lang}
        currentUser={firebaseUser}
      />

      {showSheetsModal && (
        <Suspense fallback={null}>
          <GoogleSheetsSyncModal
            isOpen={showSheetsModal}
            onClose={() => setShowSheetsModal(false)}
            lang={lang}
            applications={applications}
            vacancies={vacancies}
            quizSets={quizSets}
            currentUser={firebaseUser}
            onImportApplications={handleImportApplications}
          />
        </Suspense>
      )}

      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        lang={lang}
        currentSubscription={subscription}
        onSubscriptionUpdated={(sub) => setSubscription(sub)}
      />

      <UserNotificationCenterModal
        isOpen={showNotificationCenterModal}
        onClose={() => setShowNotificationCenterModal(false)}
        lang={lang}
        onUnreadCountChange={(cnt) => setInAppUnreadCount(cnt)}
        onSelectVacancy={(vId) => {
          const v = vacancies.find(item => item.id === vId);
          if (v) {
            handleOpenDetailWithTracking(v);
          }
        }}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      {/* PWA Install Prompt Banner & Modal */}
      <PwaInstallPrompt
        lang={lang}
        isOpenModal={showInstallModal}
        onCloseModal={() => setShowInstallModal(false)}
      />

      {/* Mobile Bottom Navigation Bar */}
      <MobileNavigationBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        onOpenMoreDrawer={() => setShowMobileMoreDrawer(true)}
        unreadCount={inAppUnreadCount}
      />

      {/* Mobile More Features Drawer */}
      <MobileMoreDrawer
        isOpen={showMobileMoreDrawer}
        onClose={() => setShowMobileMoreDrawer(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
        theme={theme}
        setTheme={setTheme}
        userProfile={userProfile}
        onOpenProfile={() => setShowProfileModal(true)}
        firebaseUser={firebaseUser}
        isAdmin={['editor', 'admin', 'super_admin'].includes(userRole)}
        userRole={userRole}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenSheetsModal={() => setShowSheetsModal(true)}
        onOpenSubscription={() => setShowSubscriptionModal(true)}
        onOpenInstallPrompt={() => setShowInstallModal(true)}
        onOpenBetaFeedback={() => setShowBetaFeedbackModal(true)}
        unreadInAppCount={inAppUnreadCount}
        subscription={subscription}
      />

      {/* Beta Feedback & Survey Modal */}
      <BetaFeedbackModal
        isOpen={showBetaFeedbackModal}
        onClose={() => setShowBetaFeedbackModal(false)}
        lang={lang}
        userEmail={userProfile.email}
        userId={userProfile.id}
      />

      {/* Production Announcement Interactive Popup Modal */}
      <AnnouncementPopupModal />
    </div>
  );
}
