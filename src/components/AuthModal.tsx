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
  Sparkles
} from 'lucide-react';
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
  onDemoLogin?: (name: string, emailOrPhone: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  lang,
  currentUser,
  onAuthSuccess,
  onDemoLogin
}) => {
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');
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
    setErrorMsg(null);
    setSuccessMsg(null);
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
          ? 'फायरबेस कन्सोलमा मोबाइल प्रमाणीकरण (Phone Auth) असक्षम (Disabled) छ। कृपया Firebase Console > Authentication > Sign-in method मा गई "Phone" अन गर्नुहोस्।'
          : 'Phone authentication is disabled in your Firebase console settings. Enable "Phone" under Firebase Console > Authentication > Sign-in method, or use Quick Demo Sign-In below.';
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

  // EMAIL LOGIN / SIGNUP / RESET
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !email.includes('@')) {
      setErrorMsg(lang === 'np' ? 'कृपया मान्य इमेल हाल्नुहोस्।' : 'Please enter a valid email address.');
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
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        await syncUserProfileToFirestore(userCred.user.uid, {
          email: userCred.user.email,
          displayName: userCred.user.displayName
        });
        setSuccessMsg(lang === 'np' ? 'इमेल लगइन सफल भयो!' : 'Successfully signed in!');
        if (onAuthSuccess) onAuthSuccess(userCred.user);
        setTimeout(() => onClose(), 1000);
      } else if (emailMode === 'signup') {
        if (!password || password.length < 6) {
          setErrorMsg(lang === 'np' ? 'पासवर्ड कम्तीमा ६ अक्षरको हुनुपर्छ।' : 'Password must be at least 6 characters.');
          setLoading(false);
          return;
        }
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
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
            : `Account created successfully! A verification email has been sent to ${email}. Please check your inbox to verify your account.`
        );
        if (onAuthSuccess) onAuthSuccess(userCred.user);
        setTimeout(() => onClose(), 2500);
      } else if (emailMode === 'reset') {
        await sendPasswordResetEmail(auth, email);
        setSuccessMsg(
          lang === 'np'
            ? `पासवर्ड रिसेट लिङ्क ${email} मा सफलतापूर्वक पठाइयो। कृपया आफ्नो इमेल र स्प्याम फोल्डर जाँच गर्नुहोस्।`
            : `Password reset email successfully sent to ${email}. Please check your inbox and spam folder.`
        );
      }
    } catch (err: any) {
      console.error('Email Auth Error:', err);
      let msg = err.message || 'Authentication failed.';
      if (err.code === 'auth/operation-not-allowed') {
        msg = lang === 'np'
          ? 'फायरबेस कन्सोलमा इमेल/पासवर्ड प्रमाणीकरण असक्षम छ। कृपया "Quick Demo Sign-In" प्रयोग गर्नुहोस् वा Firebase Console मा "Email/Password" अन गर्नुहोस्।'
          : 'Email/Password authentication is disabled in your Firebase console settings. Enable "Email/Password" under Firebase Console > Authentication > Sign-in method, or use Quick Demo Sign-In below.';
      } else if (err.code === 'auth/user-not-found') {
        msg = emailMode === 'reset'
          ? (lang === 'np' ? `यो इमेल (${email}) सँग सम्बन्धित कुनै दर्ता भएको खाता भेटिएन।` : `No registered account found with email address ${email}.`)
          : (lang === 'np' ? 'गलत इमेल वा पासवर्ड!' : 'Invalid email or password.');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = lang === 'np' ? 'गलत इमेल वा पासवर्ड!' : 'Invalid email or password.';
      } else if (err.code === 'auth/email-already-in-use') {
        setEmailMode('login');
        msg = lang === 'np'
          ? 'यो इमेल पहिले नै दर्ता भइसकेको छ। लगइन मोडमा परिवर्तन गरियो, कृपया पासवर्ड हाल्नुहोस्।'
          : 'An account already exists with this email address. Switched to Login mode — please enter your password.';
      } else if (err.code === 'auth/invalid-email') {
        msg = lang === 'np' ? 'कृपया मान्य इमेल ठेगाना प्रविष्ट गर्नुहोस्।' : 'Please enter a valid email address.';
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
      const userCred = await signInWithPopup(auth, googleProvider);
      if (userCred.user) {
        await syncUserProfileToFirestore(userCred.user.uid, {
          email: userCred.user.email,
          displayName: userCred.user.displayName,
          phoneNumber: userCred.user.phoneNumber
        });
        setSuccessMsg(lang === 'np' ? 'गूगलबाट लगइन सफल भयो!' : 'Successfully signed in with Google!');
        if (onAuthSuccess) onAuthSuccess(userCred.user);
        setTimeout(() => onClose(), 1000);
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
        // Normal user cancellation — log info and don't raise as console error
        console.info('Google sign-in popup was dismissed by user.');
        setErrorMsg(
          lang === 'np'
            ? 'गूगल लगइन विन्डो बन्द गरियो। पुन: प्रयास गर्नुहोस् वा इमेल / त्वरित डेमो प्रयोग गर्नुहोस्।'
            : 'Google sign-in popup was closed. You can retry or use Email / Quick Demo access.'
        );
      } else if (isPopupBlocked) {
        console.warn('Google sign-in popup was blocked by browser.');
        setErrorMsg(
          lang === 'np'
            ? 'ब्राउजरले पपअप ब्लक गर्यो। कृपया पपअप अनुमति दिनुहोस् वा इमेल लगइन प्रयोग गर्नुहोस्।'
            : 'Sign-in popup was blocked by browser. Please allow popups or use Email / Quick Demo login.'
        );
      } else {
        console.error('Google Sign In Error:', err);
        let msg = err?.message || 'Google sign in failed.';
        if (err?.code === 'auth/operation-not-allowed') {
          msg =
            lang === 'np'
              ? 'फायरबेस कन्सोलमा गूगल प्रमाणीकरण असक्षम छ। कृपया Firebase Console मा "Google" अन गर्नुहोस् वा Quick Demo Sign-In प्रयोग गर्नुहोस्।'
              : 'Google sign-in is disabled in your Firebase console settings. Enable "Google" under Firebase Console > Authentication > Sign-in method, or use Quick Demo Sign-In below.';
        } else if (err?.code === 'auth/unauthorized-domain') {
          msg =
            lang === 'np'
              ? 'यो डोमेन Firebase Auth अधिकृत सूचीमा छैन।'
              : 'This domain is not authorized for OAuth operations in Firebase Console.';
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
      setSuccessMsg(lang === 'np' ? 'साइन आउट गरियो।' : 'Signed out successfully.');
      setTimeout(() => onClose(), 1000);
    } catch (err: any) {
      console.error('Sign Out Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Invisible Recaptcha Container */}
      <div id="recaptcha-container"></div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden relative">
        {/* Header bar */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Shield className="w-4 h-4" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 font-mono">
              Firebase Auth Security
            </span>
          </div>

          <h3 className="text-xl font-black font-sans">
            {currentUser
              ? lang === 'np' ? 'प्रयोगकर्ता खाता विवरण' : 'User Auth Profile'
              : lang === 'np' ? 'सरकारी साझा लगइन / साइन अप' : 'SarkariSajha Portal Account'}
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            {currentUser
              ? lang === 'np' ? 'तपाईं फायरबेस सुरक्षा प्रणालीमा लगइन हुनुहुन्छ।' : 'Authenticated securely via Firebase Authentication.'
              : lang === 'np' ? 'नेपाल लोक सेवा तथा बैंकिङ दरखास्त ट्रयाकिङको लागि लगइन गर्नुहोस्।' : 'Access personalized vacancy matchers, application tracker, and quiz leaderboards.'}
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* Messages */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* IF ALREADY LOGGED IN */}
          {currentUser ? (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-base shadow-xs">
                    {currentUser.displayName ? currentUser.displayName.charAt(0) : currentUser.email ? currentUser.email.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {currentUser.displayName || (lang === 'np' ? 'सरकारी साझा प्रयोगकर्ता' : 'SarkariSajha User')}
                    </h4>
                    <p className="text-xs text-slate-500 font-mono">
                      {currentUser.phoneNumber || currentUser.email || 'Firebase Auth User'}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-500 space-y-1 font-mono">
                  <div className="flex justify-between items-center">
                    <span>Email Verification:</span>
                    {currentUser.email ? (
                      currentUser.emailVerified ? (
                        <span className="text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded font-bold text-[10px]">
                          ✓ Verified
                        </span>
                      ) : (
                        <span className="text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded font-bold text-[10px]">
                          ⚠ Unverified
                        </span>
                      )
                    ) : (
                      <span className="text-slate-500">N/A</span>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span>UID:</span>
                    <span className="text-slate-700 font-bold truncate max-w-[180px]">{currentUser.uid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Auth Provider:</span>
                    <span className="text-slate-700 font-bold uppercase">
                      {currentUser.providerData[0]?.providerId || 'Firebase'}
                    </span>
                  </div>
                </div>
              </div>

              {currentUser.email && !currentUser.emailVerified && (
                <button
                  onClick={async () => {
                    try {
                      setLoading(true);
                      await sendEmailVerification(currentUser);
                      setSuccessMsg(
                        lang === 'np'
                          ? `इमेल पुष्टीकरण लिङ्क ${currentUser.email} मा पुनः पठाइयो।`
                          : `Verification email sent to ${currentUser.email}. Please check your inbox.`
                      );
                    } catch (err: any) {
                      setErrorMsg(err.message || 'Failed to send verification email.');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>
                    {lang === 'np' ? 'इमेल पुष्टीकरण लिङ्क पुनः पठाउनुहोस्' : 'Resend Email Verification Link'}
                  </span>
                </button>
              )}

              <button
                onClick={handleSignOut}
                disabled={loading}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>{lang === 'np' ? 'साइन आउट गर्नुहोस्' : 'Sign Out Account'}</span>
              </button>
            </div>
          ) : (
            <>
              {/* AUTH METHOD SELECTOR TABS */}
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
                <button
                  onClick={() => setAuthMethod('phone')}
                  className={`py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
                    authMethod === 'phone'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  <span>{lang === 'np' ? 'फोन / OTP' : 'Phone / OTP'}</span>
                </button>

                <button
                  onClick={() => setAuthMethod('email')}
                  className={`py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
                    authMethod === 'email'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5 text-amber-600" />
                  <span>{lang === 'np' ? 'इमेल / पासवर्ड' : 'Email Login'}</span>
                </button>
              </div>

              {/* PHONE AUTH TAB */}
              {authMethod === 'phone' && (
                <div className="space-y-4">
                  {otpStep === 'phone' ? (
                    <form onSubmit={handleSendOTP} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          {lang === 'np' ? 'मोबाइल नम्बर (Mobile Number)' : 'Phone Number'}
                        </label>
                        <div className="flex gap-2">
                          <select
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="+977">🇳🇵 +977 (Nepal)</option>
                            <option value="+91">🇮🇳 +91 (India)</option>
                            <option value="+1">🇺🇸 +1 (US)</option>
                            <option value="+44">🇬🇧 +44 (UK)</option>
                          </select>

                          <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="98XXXXXXXX"
                            required
                            className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {lang === 'np' ? 'तपाईंको फोनमा ६-अङ्कको ओटीपी सुरक्षा कोड पठाइनेछ।' : 'A 6-digit verification code will be sent via SMS.'}
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <span>{lang === 'np' ? 'ओटीपी कोड पठाउनुहोस्' : 'Send OTP Verification Code'}</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOTP} className="space-y-4 animate-in fade-in">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-slate-700">
                            {lang === 'np' ? '६-अङ्कको ओटीपी प्रविष्ट गर्नुहोस्' : 'Enter 6-Digit OTP Code'}
                          </label>
                          <button
                            type="button"
                            onClick={() => setOtpStep('phone')}
                            className="text-[11px] text-blue-600 hover:underline font-bold"
                          >
                            {lang === 'np' ? 'नम्बर फेर्नुहोस्' : 'Change Phone'}
                          </button>
                        </div>

                        <input
                          type="text"
                          maxLength={6}
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="123456"
                          required
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-lg font-mono font-black tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">
                          {resendTimer > 0
                            ? `Resend in ${resendTimer}s`
                            : lang === 'np' ? 'कोड प्राप्त भएन?' : "Didn't receive code?"}
                        </span>
                        {resendTimer === 0 && (
                          <button
                            type="button"
                            onClick={handleSendOTP}
                            className="text-blue-600 hover:underline font-bold"
                          >
                            {lang === 'np' ? 'पुन: पठाउनुहोस्' : 'Resend OTP'}
                          </button>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{lang === 'np' ? 'ओटीपी पुष्टि गर्नुहोस्' : 'Verify & Complete Sign In'}</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* EMAIL AUTH TAB */}
              {authMethod === 'email' && (
                <form onSubmit={handleEmailAuth} className="space-y-3.5">
                  {emailMode === 'reset' && (
                    <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-xs text-amber-900 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-amber-900">
                        <KeyRound className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>{lang === 'np' ? 'पासवर्ड रिसेट गर्नुहोस्' : 'Forgot Password / Reset'}</span>
                      </div>
                      <p className="text-[11px] text-amber-800 leading-normal">
                        {lang === 'np'
                          ? 'तपाईंको दर्ता भएको इमेल ठेगाना प्रविष्ट गर्नुहोस्। हामी तपाईंलाई पासवर्ड रिसेट गर्ने लिङ्क पठाउनेछौं।'
                          : 'Enter your registered email address below. Firebase will send you a secure link to reset your password.'}
                      </p>
                    </div>
                  )}

                  {emailMode === 'signup' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {lang === 'np' ? 'पूरा नाम (Full Name)' : 'Full Name'}
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Ramesh Sharma"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {lang === 'np' ? 'इमेल ठेगाना (Email Address)' : 'Email Address'}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ramesh@example.com"
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {emailMode !== 'reset' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {lang === 'np' ? 'पासवर्ड (Password)' : 'Password'}
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  )}

                  {emailMode === 'login' && (
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="rememberMe"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 text-amber-600 border-slate-300 rounded focus:ring-amber-500 cursor-pointer"
                      />
                      <label htmlFor="rememberMe" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
                        {lang === 'np' ? 'मलाई सम्झनुहोस् (Remember Me)' : 'Remember Me (Persistent Session)'}
                      </label>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs pt-1">
                    {emailMode === 'login' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setEmailMode('reset');
                            setErrorMsg(null);
                            setSuccessMsg(null);
                          }}
                          className="text-slate-500 hover:text-amber-700 underline flex items-center gap-1 font-medium"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>{lang === 'np' ? 'पासवर्ड बिर्सनुभयो?' : 'Forgot password?'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEmailMode('signup');
                            setErrorMsg(null);
                            setSuccessMsg(null);
                          }}
                          className="text-amber-700 font-bold hover:underline"
                        >
                          {lang === 'np' ? 'नयाँ खाता खोल्नुहोस्' : 'Create new account'}
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEmailMode('login');
                          setErrorMsg(null);
                          setSuccessMsg(null);
                        }}
                        className="text-amber-700 font-bold hover:underline ml-auto flex items-center gap-1"
                      >
                        <span>{lang === 'np' ? '← लगइनमा फर्कनुहोस्' : '← Back to Login'}</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 mt-2"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <span className="flex items-center gap-1.5">
                        {emailMode === 'reset' && <KeyRound className="w-4 h-4 shrink-0" />}
                        {emailMode === 'login'
                          ? lang === 'np' ? 'लगइन गर्नुहोस्' : 'Sign In with Email'
                          : emailMode === 'signup'
                          ? lang === 'np' ? 'खाता सिर्जना गर्नुहोस्' : 'Create Account'
                          : lang === 'np' ? 'पासवर्ड रिसेट लिङ्क पठाउनुहोस्' : 'Send Password Reset Link'}
                      </span>
                    )}
                  </button>
                </form>
              )}

              {/* DIVIDER & GOOGLE SIGN IN */}
              <div className="relative pt-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-mono font-bold text-slate-400">
                  <span className="bg-white px-2">OR</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs rounded-xl transition shadow-2xs flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{lang === 'np' ? 'गूगल खाताबाट लगइन गर्नुहोस्' : 'Sign in with Google'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const demoName = authMethod === 'email' && fullName.trim() ? fullName.trim() : 'Sarkari Candidate';
                  const demoId = authMethod === 'phone' ? (phoneNumber ? `${countryCode}${phoneNumber}` : '+977-9800000000') : (email || 'candidate@sarkarisajha.gov.np');
                  if (onDemoLogin) {
                    onDemoLogin(demoName, demoId);
                  }
                  setSuccessMsg(lang === 'np' ? 'डेमो खातामा सफलतापुर्वक प्रवेश गरियो!' : 'Quick Demo Signed In successfully!');
                  setTimeout(() => onClose(), 800);
                }}
                className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>{lang === 'np' ? 'त्वरित डेमो लगइन (Quick Demo Sign-In)' : 'Quick Demo Sign-In (Instant Access)'}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
