import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Phone,
  Mail,
  Lock,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  Shield,
  KeyRound,
  ArrowRight,
  LogOut,
  RefreshCw,
  UserPlus
} from 'lucide-react';
import { BrandMark } from './Header';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signInWithPopup,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { syncUserProfileToFirestore } from '../lib/firestoreService';
import { Language } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  currentUser: FirebaseUser | null;
  onAuthSuccess?: (user: FirebaseUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  lang,
  currentUser,
  onAuthSuccess
}) => {
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [emailMode, setEmailMode] = useState<'login' | 'signup' | 'reset'>('login');

  // Phone Auth State
  const [countryCode, setCountryCode] = useState('+977');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [otpStep, setOtpStep] = useState<'phone' | 'code'>('phone');
  const [resendTimer, setResendTimer] = useState(0);

  // Email Auth State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Forgot Password / Reset State
  const [resetSent, setResetSent] = useState(false);
  const [resetEmailTarget, setResetEmailTarget] = useState('');
  const [resetCooldown, setResetCooldown] = useState(0);

  // Status & Error handling
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [resendTimer]);

  useEffect(() => {
    if (resetCooldown > 0) {
      const timer = setInterval(() => setResetCooldown((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [resetCooldown]);

  useEffect(() => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (emailMode !== 'reset') {
      setResetSent(false);
    }
    if (!isOpen) {
      setEmailMode('login');
      setResetSent(false);
    }
  }, [authMethod, emailMode, isOpen]);

  // Clean up reCAPTCHA on unmount
  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  if (!isOpen) return null;

  const initRecaptcha = () => {
    if (recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current.clear();
      } catch (e) {
        // ignore
      }
      recaptchaVerifierRef.current = null;
    }
    const container = document.getElementById('recaptcha-container');
    if (container) {
      container.innerHTML = '';
    }
    recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved
      },
      'expired-callback': () => {
        setErrorMsg(lang === 'np' ? 'reCAPTCHA म्याद सकियो। पुन: प्रयास गर्नुहोस्।' : 'reCAPTCHA expired. Please try again.');
      }
    });
    return recaptchaVerifierRef.current;
  };

  // SEND OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanPhone = phoneNumber.trim().replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 8) {
      setErrorMsg(
        lang === 'np'
          ? 'कृपया मान्य मोबाइल नम्बर प्रविष्ट गर्नुहोस्।'
          : 'Please enter a valid phone number.'
      );
      return;
    }

    const fullPhone = `${countryCode}${cleanPhone}`;

    try {
      setLoading(true);
      const appVerifier = initRecaptcha();
      const confirmation = await signInWithPhoneNumber(auth, fullPhone, appVerifier);
      setConfirmationResult(confirmation);
      setOtpStep('code');
      setResendTimer(60);
      setSuccessMsg(
        lang === 'np'
          ? `ओटीपी कोड ${fullPhone} मा पठाइयो।`
          : `OTP code sent to ${fullPhone}.`
      );
    } catch (err: any) {
      console.error('Phone Auth Error:', err);
      let msg = err.message || 'Failed to send OTP code.';
      if (err.code === 'auth/operation-not-allowed') {
        msg = lang === 'np'
          ? 'फायरबेस कन्सोलमा मोबाइल प्रमाणीकरण (Phone Auth) असक्षम छ। कृपया "Email Login" वा "Continue with Google" प्रयोग गर्नुहोस्।'
          : 'Phone authentication is not enabled in Firebase Console. Please use "Email Login" or "Continue with Google".';
      } else if (err.code === 'auth/invalid-phone-number') {
        msg = lang === 'np' ? 'अमान्य फोन नम्बर!' : 'Invalid phone number format.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = lang === 'np' ? 'धेरै प्रयासहरू। पछि प्रयास गर्नुहोस्।' : 'Too many requests. Please try again later.';
      }
      setErrorMsg(msg);
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
          recaptchaVerifierRef.current = null;
        } catch (e) {}
      }
    } finally {
      setLoading(false);
    }
  };

  // VERIFY OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!verificationCode || verificationCode.length < 6) {
      setErrorMsg(lang === 'np' ? 'कृपया ६-अङ्कको ओटीपी कोड हाल्नुहोस्।' : 'Please enter 6-digit OTP code.');
      return;
    }

    if (!confirmationResult) {
      setErrorMsg(lang === 'np' ? 'पुन: ओटीपी कोड पठाउनुहोस्।' : 'Please request a new OTP code.');
      return;
    }

    try {
      setLoading(true);
      const userCredential = await confirmationResult.confirm(verificationCode);
      if (userCredential.user) {
        await syncUserProfileToFirestore(userCredential.user.uid, {
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
          phoneNumber: userCredential.user.phoneNumber
        });
        setSuccessMsg(
          lang === 'np' ? 'मोबाइल नम्बरबाट सफलतापुर्वक लगइन भयो!' : 'Successfully signed in with Phone Number!'
        );
        if (onAuthSuccess) onAuthSuccess(userCredential.user);
        setTimeout(() => onClose(), 1000);
      }
    } catch (err: any) {
      console.error('Verify OTP Error:', err);
      setErrorMsg(
        lang === 'np'
          ? 'गलत ओटीपी कोड। कृपया पुन: जाँच गर्नुहोस्।'
          : 'Invalid OTP code. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // FORGOT PASSWORD / PASSWORD RESET
  const handlePasswordReset = async (targetEmail?: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanEmail = (targetEmail ?? email).trim();
    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      setErrorMsg(
        lang === 'np'
          ? 'कृपया पासवर्ड रिसेट गर्न मान्य इमेल ठेगाना प्रविष्ट गर्नुहोस्।'
          : 'Please enter a valid registered email address to reset your password.'
      );
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, cleanEmail);
      setResetEmailTarget(cleanEmail);
      setResetSent(true);
      setResetCooldown(60);
      setSuccessMsg(
        lang === 'np'
          ? `यदि ${cleanEmail} मा खाता दर्ता छ भने पासवर्ड रिसेट लिङ्क पठाइएको छ। कृपया इनबक्स र स्प्याम फोल्डर जाँच गर्नुहोस्।`
          : `If an account exists for ${cleanEmail}, a password reset link has been sent. Please check your inbox and spam folder.`
      );
    } catch (err: any) {
      console.error('Password Reset Error:', err);
      let msg = err.message || 'Failed to send password reset email.';
      if (err.code === 'auth/user-not-found') {
        msg =
          lang === 'np'
            ? `यो इमेल (${cleanEmail}) सँग सम्बन्धित कुनै दर्ता भएको खाता भेटिएन।`
            : `No registered account found with email address ${cleanEmail}.`;
      } else if (err.code === 'auth/invalid-email' || err.code === 'auth/missing-email') {
        msg =
          lang === 'np'
            ? 'कृपया मान्य इमेल ठेगाना प्रविष्ट गर्नुहोस्।'
            : 'Please enter a valid email address.';
      } else if (err.code === 'auth/too-many-requests') {
        msg =
          lang === 'np'
            ? 'धेरै पटक पासवर्ड रिसेट अनुरोध गरियो। कृपया केही समयपछि पुन: प्रयास गर्नुहोस्।'
            : 'Too many password reset requests. Please wait a few minutes and try again.';
      } else if (err.code === 'auth/operation-not-allowed') {
        msg =
          lang === 'np'
            ? 'फायरबेस कन्सोलमा इमेल/पासवर्ड सेवा असक्षम छ। यदि तपाईंले गूगल खाताबाट लगइन गर्नुभएको थियो भने तलको "Continue with Google" प्रयोग गर्नुहोस्।'
            : 'Email/Password sign-in is disabled in Firebase Console. If you signed up with Google, use "Continue with Google" below.';
      } else if (err.code === 'auth/network-request-failed') {
        msg =
          lang === 'np'
            ? 'नेटवर्क जडान समस्या देखियो। कृपया इन्टरनेट जाँच गर्नुहोस्।'
            : 'Network error. Please check your internet connection and try again.';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // EMAIL LOGIN / SIGNUP / RESET
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      setErrorMsg(lang === 'np' ? 'कृपया मान्य इमेल हाल्नुहोस्।' : 'Please enter a valid email address.');
      return;
    }

    if (emailMode === 'reset') {
      await handlePasswordReset(cleanEmail);
      return;
    }

    try {
      setLoading(true);
      try {
        await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      } catch (pErr) {
        console.warn('Persistence config warning:', pErr);
      }
      if (emailMode === 'login') {
        if (!password) {
          setErrorMsg(lang === 'np' ? 'कृपया पासवर्ड हाल्नुहोस्।' : 'Please enter your password.');
          setLoading(false);
          return;
        }
        const userCred = await signInWithEmailAndPassword(auth, cleanEmail, password);
        await syncUserProfileToFirestore(userCred.user.uid, {
          email: userCred.user.email,
          displayName: userCred.user.displayName,
          phoneNumber: userCred.user.phoneNumber
        });
        setSuccessMsg(lang === 'np' ? 'इमेल लगइन सफल भयो!' : 'Successfully signed in!');
        if (onAuthSuccess) onAuthSuccess(userCred.user);
        setTimeout(() => onClose(), 800);
      } else if (emailMode === 'signup') {
        if (!password || password.length < 6) {
          setErrorMsg(lang === 'np' ? 'पासवर्ड कम्तीमा ६ अक्षरको हुनुपर्छ।' : 'Password must be at least 6 characters.');
          setLoading(false);
          return;
        }
        const userCred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        if (fullName.trim()) {
          await updateProfile(userCred.user, { displayName: fullName.trim() });
        }
        try {
          await sendEmailVerification(userCred.user);
        } catch (verifErr) {
          console.error('Error sending email verification:', verifErr);
        }
        await syncUserProfileToFirestore(userCred.user.uid, {
          email: userCred.user.email,
          displayName: fullName.trim() || userCred.user.displayName
        });
        setSuccessMsg(
          lang === 'np'
            ? 'नयाँ खाता सिर्जना भयो! पुष्टीकरण लिङ्क तपाईंको इमेलमा पठाइएको छ।'
            : `Account created successfully! A verification email has been sent to ${cleanEmail}. Please check your inbox to verify your account.`
        );
        if (onAuthSuccess) onAuthSuccess(userCred.user);
        setTimeout(() => onClose(), 2200);
      }
    } catch (err: any) {
      console.error('Email Auth Error:', err);
      let msg = err.message || 'Authentication failed.';
      if (err.code === 'auth/operation-not-allowed') {
        msg = lang === 'np'
          ? 'फायरबेस कन्सोलमा इमेल/पासवर्ड लगइन हाल असक्षम छ। कृपया तलको "Sign in with Google" प्रयोग गर्नुहोस् वा Firebase Console > Authentication > Sign-in method मा "Email/Password" अन गर्नुहोस्।'
          : 'Email/Password sign-in is not yet enabled in Firebase Console. You can sign in immediately with any email using "Sign in with Google" below, or enable Email/Password in Firebase Console > Authentication > Sign-in method.';
      } else if (err.code === 'auth/user-not-found') {
        msg =
          lang === 'np'
            ? 'यो इमेलमा खाता भेटिएन। कृपया "Create new account" वा "Sign in with Google" प्रयोग गर्नुहोस्।'
            : 'No password account found for this email. Click "Create new account" or use "Sign in with Google".';
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = lang === 'np'
          ? 'गलत इमेल/पासवर्ड, वा यो इमेल गूगल खाताबाट मात्र दर्ता गरिएको छ। पासवर्ड रिसेट वा "Sign in with Google" प्रयास गर्नुहोस्।'
          : 'Invalid email or password. If you forgot your password, use "Forgot password?" below or try "Continue with Google".';
      } else if (err.code === 'auth/email-already-in-use') {
        setEmailMode('login');
        msg = lang === 'np'
          ? 'यो इमेल पहिले नै दर्ता भइसकेको छ। लगइन मोडमा परिवर्तन गरियो, कृपया पासवर्ड हाल्नुहोस्।'
          : 'An account already exists with this email address. Switched to Login mode — please enter your password.';
      } else if (err.code === 'auth/invalid-email') {
        msg = lang === 'np' ? 'कृपया मान्य इमेल ठेगाना प्रविष्ट गर्नुहोस्।' : 'Please enter a valid email address.';
      } else if (err.code === 'auth/weak-password') {
        msg = lang === 'np' ? 'पासवर्ड कम्तीमा ६ अक्षरको बलियो हुनुपर्छ।' : 'Password is too weak. Please use at least 6 characters.';
      } else if (err.code === 'auth/user-disabled') {
        msg = lang === 'np' ? 'यो खाता प्रशासनद्वारा निष्क्रिय गरिएको छ।' : 'This account has been disabled. Please contact support.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = lang === 'np' ? 'धेरै असफल प्रयासहरू भए। कृपया केही समयपछि पुन: प्रयास गर्नुहोस्।' : 'Too many failed attempts. Please wait a moment and try again.';
      } else if (err.code === 'auth/network-request-failed') {
        msg = lang === 'np' ? 'नेटवर्क जडान समस्या देखियो। कृपया इन्टरनेट जाँच गर्नुहोस्।' : 'Network error. Please check your internet connection and try again.';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // GOOGLE SIGN-IN
  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      setLoading(true);
      try {
        await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      } catch (pErr) {
        console.warn('Persistence config warning:', pErr);
      }
      const userCred = await signInWithPopup(auth, googleProvider);
      if (userCred.user) {
        await syncUserProfileToFirestore(userCred.user.uid, {
          email: userCred.user.email,
          displayName: userCred.user.displayName,
          phoneNumber: userCred.user.phoneNumber
        });
        setSuccessMsg(
          lang === 'np'
            ? `${userCred.user.email || 'गूगल खाता'} बाट लगइन सफल भयो!`
            : `Successfully signed in as ${userCred.user.email || 'Google user'}!`
        );
        if (onAuthSuccess) onAuthSuccess(userCred.user);
        setTimeout(() => onClose(), 800);
      }
    } catch (err: any) {
      const isUserCancellation =
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request' ||
        (err?.message && (err.message.includes('popup-closed-by-user') || err.message.includes('cancelled-popup-request')));

      const isPopupBlocked =
        err?.code === 'auth/popup-blocked' ||
        (err?.message && err.message.includes('popup-blocked'));

      if (isUserCancellation) {
        console.info('Google sign-in popup was dismissed by user.');
        setErrorMsg(
          lang === 'np'
            ? 'गूगल लगइन विन्डो बन्द गरियो। पुन: प्रयास गर्नुहोस् वा इमेल लगइन प्रयोग गर्नुहोस्।'
            : 'Google sign-in popup was closed. Please retry or use Email login.'
        );
      } else if (isPopupBlocked) {
        console.warn('Google sign-in popup was blocked by browser.');
        setErrorMsg(
          lang === 'np'
            ? 'ब्राउजरले पपअप ब्लक गर्यो। कृपया पपअप अनुमति दिनुहोस् वा इमेल लगइन प्रयोग गर्नुहोस्।'
            : 'Sign-in popup was blocked by browser. Please allow popups for this site or use Email login.'
        );
      } else {
        console.error('Google Sign In Error:', err);
        let msg = err?.message || 'Google sign in failed.';
        if (err?.code === 'auth/operation-not-allowed') {
          msg =
            lang === 'np'
              ? 'फायरबेस कन्सोलमा गूगल प्रमाणीकरण असक्षम छ। कृपया Firebase Console मा "Google" अन गर्नुहोस्।'
              : 'Google sign-in is disabled in Firebase Console. Enable "Google" under Authentication > Sign-in method.';
        } else if (err?.code === 'auth/unauthorized-domain') {
          msg =
            lang === 'np'
              ? 'यो डोमेन Firebase Auth अधिकृत सूचीमा छैन।'
              : 'This domain is not authorized for OAuth operations in Firebase Console.';
        } else if (err?.code === 'auth/account-exists-with-different-credential') {
          msg =
            lang === 'np'
              ? 'यो इमेल पहिले नै अर्को लगइन विधिबाट दर्ता छ। कृपया इमेल/पासवर्डबाट लगइन गर्नुहोस्।'
              : 'An account already exists with this email using another sign-in method. Please sign in with Email/Password.';
        }
        setErrorMsg(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // SIGN OUT
  const handleSignOut = async () => {
    try {
      setLoading(true);
      await auth.signOut();
      setPassword('');
      setSuccessMsg(lang === 'np' ? 'साइन आउट गरियो।' : 'Signed out successfully.');
      setTimeout(() => onClose(), 800);
    } catch (err: any) {
      console.error('Sign Out Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // SWITCH ACCOUNT (Sign out & stay open for logging in with another email)
  const handleSwitchAccount = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      await auth.signOut();
      setEmail('');
      setPassword('');
      setAuthMethod('email');
      setEmailMode('login');
      setSuccessMsg(
        lang === 'np'
          ? 'अघिल्लो खाताबाट बाहिरिनुभयो। अब अर्को इमेलबाट लगइन गर्नुहोस्।'
          : 'Signed out. Choose Google or enter another email to sign in.'
      );
    } catch (err: any) {
      console.error('Switch Account Error:', err);
      setErrorMsg(err?.message || 'Could not switch account.');
    } finally {
      setLoading(false);
    }
  };

  const tr = (en: string, npText: string) => (lang === 'np' ? npText : en);
  const field =
    'flex items-center h-[52px] rounded-2xl border-[1.5px] border-[#e4e7ec] px-3.5 gap-2.5 bg-white focus-within:border-ink transition';
  const input = 'flex-1 min-w-0 bg-transparent text-[15px] text-ink placeholder:text-[#98a2b3] focus:outline-none';
  const primary =
    'w-full h-[52px] rounded-full bg-ink text-white text-[15px] font-medium shadow-pill hover:bg-black disabled:opacity-50 transition flex items-center justify-center gap-2';
  const secondary =
    'w-full h-[52px] rounded-full border-[1.5px] border-[#e4e7ec] bg-white text-[15px] text-ink hover:bg-sky-50 disabled:opacity-50 transition flex items-center justify-center gap-2.5';
  const linkBtn = 'text-[13px] text-ink underline underline-offset-2 hover:text-black';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/30 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="auth-title">
      <div id="recaptcha-container"></div>

      <div className="relative w-full max-w-[440px] max-h-[92vh] overflow-y-auto bg-white rounded-[32px] px-7 py-8 shadow-[0_1px_2px_rgb(11_18_32/0.04),0_24px_48px_-20px_rgb(11_18_32/0.2)] flex flex-col gap-[18px]">
        <button
          type="button"
          onClick={onClose}
          aria-label={tr('Close', 'बन्द गर्नुहोस्')}
          className="absolute top-4 right-4 w-9 h-9 inline-flex items-center justify-center rounded-full bg-sky-50 text-ink hover:bg-sky-100 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center gap-2.5 text-center">
          <BrandMark className="w-10 h-10" />
          <h1 id="auth-title" className="font-display text-[28px] font-semibold tracking-[-0.02em] text-ink leading-tight">
            {currentUser
              ? tr('Your account', 'तपाईंको खाता')
              : emailMode === 'signup' && authMethod === 'email'
                ? tr('Create your account', 'खाता खोल्नुहोस्')
                : emailMode === 'reset' && authMethod === 'email'
                  ? tr('Reset your password', 'पासवर्ड रिसेट')
                  : tr('Sign in to SarkariSajha', 'सरकारी साझामा लगइन')}
          </h1>
          <p className="text-sm text-ink-soft leading-normal">
            {currentUser
              ? tr('You’re signed in securely.', 'तपाईं सुरक्षित रूपमा लगइन हुनुहुन्छ।')
              : tr('Save vacancies, track applications and get deadline alerts.', 'विज्ञापन सुरक्षित गर्नुहोस्, आवेदन ट्र्याक गर्नुहोस् र म्याद सूचना पाउनुहोस्।')}
          </p>
        </div>

        {errorMsg && (
          <div role="alert" className="p-3 bg-[#fff1f2] text-[#be123c] rounded-2xl text-[13px] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div role="status" className="p-3 bg-[#ecfdf5] text-[#047857] rounded-2xl text-[13px] flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {currentUser ? (
          <div className="flex flex-col gap-3.5">
            <div className="p-4 bg-sky-50 rounded-2xl flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-ink text-white font-semibold flex items-center justify-center shrink-0">
                {(currentUser.displayName || currentUser.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-ink truncate">{currentUser.displayName || tr('SarkariSajha user', 'सरकारी साझा प्रयोगकर्ता')}</div>
                <div className="text-xs text-[#667085] truncate">{currentUser.phoneNumber || currentUser.email}</div>
                {currentUser.email && (
                  <span
                    className="mt-1 inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    style={currentUser.emailVerified ? { background: '#d1fae5', color: '#047857' } : { background: '#fef3c7', color: '#92400e' }}
                  >
                    {currentUser.emailVerified ? tr('✓ Email verified', '✓ इमेल प्रमाणित') : tr('Email not verified', 'इमेल प्रमाणित छैन')}
                  </span>
                )}
              </div>
            </div>

            {currentUser.email && !currentUser.emailVerified && (
              <button
                onClick={async () => {
                  try {
                    setLoading(true);
                    await sendEmailVerification(currentUser);
                    setSuccessMsg(tr(`Verification email sent to ${currentUser.email}.`, `इमेल पुष्टीकरण लिङ्क ${currentUser.email} मा पठाइयो।`));
                  } catch (err: any) {
                    setErrorMsg(err.message || 'Failed to send verification email.');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className={secondary}
              >
                <Mail className="w-4 h-4" />
                {tr('Resend verification email', 'पुष्टीकरण इमेल पुनः पठाउनुहोस्')}
              </button>
            )}

            <button type="button" onClick={handleSwitchAccount} disabled={loading} className={secondary}>
              <UserPlus className="w-4 h-4" />
              {tr('Switch account', 'अर्को खाता')}
            </button>
            <button type="button" onClick={handleSignOut} disabled={loading} className={`${primary} !bg-[#be123c] hover:!bg-[#9f1239] !shadow-none`}>
              <LogOut className="w-4 h-4" />
              {tr('Sign out', 'साइन आउट')}
            </button>
          </div>
        ) : (
          <>
            {/* Mobile / Email segmented control */}
            <div className="flex gap-1 p-1 bg-sky-50 rounded-full" role="tablist">
              {([
                ['phone', tr('Mobile', 'मोबाइल')],
                ['email', tr('Email', 'इमेल')]
              ] as const).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={authMethod === id}
                  onClick={() => {
                    setAuthMethod(id);
                    setErrorMsg(null);
                  }}
                  className={`flex-1 h-10 rounded-full text-sm text-ink transition ${authMethod === id ? 'bg-white shadow-[0_1px_2px_rgb(11_18_32/0.08)]' : ''}`}
                >
                  {label}
                </button>
              ))}
            </div>

            {authMethod === 'phone' &&
              (otpStep === 'phone' ? (
                <form onSubmit={handleSendOTP} className="flex flex-col gap-[18px]">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[13px] font-medium text-ink">{tr('Mobile number', 'मोबाइल नम्बर')}</span>
                    <div className={field}>
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        aria-label={tr('Country code', 'देश कोड')}
                        className="text-[14.5px] text-ink-soft bg-transparent pr-2.5 border-r border-[#e4e7ec] focus:outline-none"
                      >
                        <option value="+977">+977</option>
                        <option value="+91">+91</option>
                        <option value="+1">+1</option>
                        <option value="+44">+44</option>
                      </select>
                      <input
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel-national"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="98XXXXXXXX"
                        required
                        className={input}
                      />
                    </div>
                    <span className="text-xs text-[#667085]">{tr('We’ll text you a 6-digit code.', 'तपाईंको फोनमा ६ अङ्कको कोड पठाइनेछ।')}</span>
                  </label>
                  <button type="submit" disabled={loading} className={primary}>
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : tr('Continue', 'अगाडि बढ्नुहोस्')}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="flex flex-col gap-[18px]">
                  <label className="flex flex-col gap-1.5">
                    <span className="flex items-center justify-between text-[13px] font-medium text-ink">
                      {tr('6-digit code', '६ अङ्कको कोड')}
                      <button type="button" onClick={() => setOtpStep('phone')} className={linkBtn}>
                        {tr('Change number', 'नम्बर फेर्नुहोस्')}
                      </button>
                    </span>
                    <div className={field}>
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••••"
                        required
                        className={`${input} text-center tracking-[0.5em] font-semibold`}
                      />
                    </div>
                  </label>
                  <div className="flex items-center justify-between text-[13px] text-ink-soft">
                    <span>{resendTimer > 0 ? tr(`Resend in ${resendTimer}s`, `${resendTimer}s पछि पुनः पठाउनुहोस्`) : tr("Didn't get it?", 'कोड आएन?')}</span>
                    {resendTimer === 0 && (
                      <button type="button" onClick={handleSendOTP} className={linkBtn}>
                        {tr('Resend code', 'पुनः पठाउनुहोस्')}
                      </button>
                    )}
                  </div>
                  <button type="submit" disabled={loading} className={primary}>
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : tr('Verify and sign in', 'पुष्टि गरी लगइन')}
                  </button>
                </form>
              ))}

            {authMethod === 'email' &&
              (emailMode === 'reset' && resetSent ? (
                <div className="flex flex-col gap-3.5">
                  <div className="p-4 bg-[#ecfdf5] rounded-2xl text-[13px] text-ink-soft leading-relaxed">
                    <div className="font-semibold text-[#047857] mb-1">{tr('Check your inbox', 'इनबक्स जाँच्नुहोस्')}</div>
                    {tr(
                      `We sent a reset link to ${resetEmailTarget}. Check Spam too, then come back to sign in.`,
                      `हामीले ${resetEmailTarget} मा रिसेट लिङ्क पठायौं। स्प्याम पनि जाँच्नुहोस्।`
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePasswordReset(resetEmailTarget)}
                    disabled={loading || resetCooldown > 0}
                    className={secondary}
                  >
                    {resetCooldown > 0 ? tr(`Resend link (${resetCooldown}s)`, `पुनः पठाउनुहोस् (${resetCooldown}s)`) : tr('Resend link', 'पुनः पठाउनुहोस्')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmailMode('login');
                      setResetSent(false);
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className={primary}
                  >
                    {tr('Back to sign in', 'लगइनमा फर्कनुहोस्')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleEmailAuth} className="flex flex-col gap-3.5">
                  {emailMode === 'signup' && (
                    <label className="flex flex-col gap-1.5">
                      <span className="text-[13px] font-medium text-ink">{tr('Full name', 'पूरा नाम')}</span>
                      <div className={field}>
                        <input type="text" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ramesh Sharma" className={input} />
                      </div>
                    </label>
                  )}
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[13px] font-medium text-ink">{tr('Email address', 'इमेल ठेगाना')}</span>
                    <div className={field}>
                      <input
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        autoFocus={emailMode === 'reset'}
                        className={input}
                      />
                    </div>
                  </label>
                  {emailMode !== 'reset' && (
                    <label className="flex flex-col gap-1.5">
                      <span className="flex items-center justify-between text-[13px] font-medium text-ink">
                        {tr('Password', 'पासवर्ड')}
                        {emailMode === 'login' && (
                          <button
                            type="button"
                            onClick={() => {
                              setEmailMode('reset');
                              setResetSent(false);
                              setErrorMsg(null);
                              setSuccessMsg(null);
                            }}
                            className={linkBtn}
                          >
                            {tr('Forgot?', 'बिर्सनुभयो?')}
                          </button>
                        )}
                      </span>
                      <div className={field}>
                        <input
                          type="password"
                          autoComplete={emailMode === 'signup' ? 'new-password' : 'current-password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className={input}
                        />
                      </div>
                    </label>
                  )}
                  {emailMode === 'login' && (
                    <label className="flex items-center gap-2 text-[13px] text-ink-soft cursor-pointer select-none">
                      <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 rounded-md accent-[#0b1220]" />
                      {tr('Keep me signed in', 'लगइन राखिराख्नुहोस्')}
                    </label>
                  )}
                  <button type="submit" disabled={loading} className={`${primary} mt-1`}>
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : emailMode === 'login' ? (
                      tr('Continue', 'अगाडि बढ्नुहोस्')
                    ) : emailMode === 'signup' ? (
                      tr('Create account', 'खाता सिर्जना गर्नुहोस्')
                    ) : (
                      tr('Send reset link', 'रिसेट लिङ्क पठाउनुहोस्')
                    )}
                  </button>
                  <p className="text-center text-[13px] text-ink-soft">
                    {emailMode === 'login' ? (
                      <>
                        {tr('New here?', 'नयाँ हुनुहुन्छ?')}{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setEmailMode('signup');
                            setErrorMsg(null);
                            setSuccessMsg(null);
                          }}
                          className={linkBtn}
                        >
                          {tr('Create an account', 'खाता खोल्नुहोस्')}
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEmailMode('login');
                          setResetSent(false);
                          setErrorMsg(null);
                          setSuccessMsg(null);
                        }}
                        className={linkBtn}
                      >
                        {tr('Back to sign in', 'लगइनमा फर्कनुहोस्')}
                      </button>
                    )}
                  </p>
                </form>
              ))}

            <div className="flex items-center gap-3 text-xs text-[#98a2b3]">
              <span className="flex-1 h-px bg-[#eef2f6]" />
              {tr('or', 'वा')}
              <span className="flex-1 h-px bg-[#eef2f6]" />
            </div>

            <button type="button" onClick={handleGoogleSignIn} disabled={loading} className={secondary}>
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              {tr('Continue with Google', 'गुगलबाट अगाडि बढ्नुहोस्')}
            </button>

            <p className="text-[11.5px] text-[#667085] text-center leading-normal">
              {tr(
                'By continuing you agree to our Terms and Privacy Policy. SarkariSajha is not a government website.',
                'अगाडि बढेर तपाईं हाम्रा सर्त र गोपनीयता नीतिमा सहमत हुनुहुन्छ। सरकारी साझा सरकारी वेबसाइट होइन।'
              )}
            </p>
          </>
        )}
      </div>
    </div>
  );
};
