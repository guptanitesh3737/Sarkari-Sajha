import React, { useState } from 'react';
import { User as FirebaseUser, sendEmailVerification } from 'firebase/auth';
import { ShieldAlert, Mail, RefreshCw, LogOut, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Language } from '../types';

interface UnverifiedEmailGuardProps {
  firebaseUser: FirebaseUser;
  lang: Language;
  onReloadUser: () => Promise<void>;
  onSignOut: () => Promise<void>;
}

export const UnverifiedEmailGuard: React.FC<UnverifiedEmailGuardProps> = ({
  firebaseUser,
  lang,
  onReloadUser,
  onSignOut
}) => {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleResendEmail = async () => {
    try {
      setLoading(true);
      setMsg(null);
      await sendEmailVerification(firebaseUser);
      setMsg({
        type: 'success',
        text:
          lang === 'np'
            ? `इमेल पुष्टीकरण लिङ्क ${firebaseUser.email} मा पुनः पठाइयो। कृपया आफ्नो इनबक्स जाँच गर्नुहोस्।`
            : `Verification email re-sent to ${firebaseUser.email}. Please check your inbox and spam folder.`
      });
    } catch (err: any) {
      setMsg({
        type: 'error',
        text: err.message || 'Failed to send verification email. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setMsg(null);
      await onReloadUser();
    } catch (err: any) {
      setMsg({
        type: 'error',
        text: 'Failed to refresh account status.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto my-8 p-6 sm:p-8 bg-white border-2 border-amber-300 rounded-3xl shadow-xl space-y-6">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl shrink-0">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-bold uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{lang === 'np' ? 'सुरक्षा प्रतिबन्ध' : 'Verification Required'}</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            {lang === 'np'
              ? 'इमेल पुष्टीकरण आवश्यक छ'
              : 'Email Address Verification Required'}
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            {lang === 'np'
              ? `तपाईंको खाता सुरक्षित राख्न र दरखास्त दर्ता विवरणहरू पहुँच गर्न इमेल पुष्टीकरण आवश्यक छ। हामीले ${firebaseUser.email} मा लिंक पठाएका छौं।`
              : `To protect sensitive job application data and candidate records, your email address (${firebaseUser.email}) must be verified before accessing the Application Tracker and protected profile features.`}
          </p>
        </div>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-2xl border text-xs font-medium flex items-center gap-3 ${
            msg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {msg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-600" />
          )}
          <span>{msg.text}</span>
        </div>
      )}

      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs text-slate-600">
        <div className="font-bold text-slate-800 flex items-center justify-between">
          <span>{lang === 'np' ? 'इमेल ठेगाना:' : 'Account Email:'}</span>
          <span className="font-mono text-slate-900 bg-white px-2 py-1 rounded border border-slate-200">
            {firebaseUser.email}
          </span>
        </div>
        <div className="font-bold text-slate-800 flex items-center justify-between">
          <span>{lang === 'np' ? 'पुष्टीकरण स्थिति:' : 'Verification Status:'}</span>
          <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-bold">
            ⚠ {lang === 'np' ? 'अपुष्ट (Unverified)' : 'Unverified'}
          </span>
        </div>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleResendEmail}
          disabled={loading}
          className="flex-1 py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-2xl shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Mail className="w-4 h-4" />
          <span>
            {lang === 'np'
              ? 'पुष्टीकरण लिङ्क पुनः पठाउनुहोस्'
              : 'Resend Verification Email'}
          </span>
        </button>

        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-2xl shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>
            {lang === 'np'
              ? 'पुष्टीकरण जाँच गर्नुहोस्'
              : "I've Verified, Check Status"}
          </span>
        </button>

        <button
          onClick={onSignOut}
          disabled={loading}
          className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition flex items-center justify-center gap-2 border border-slate-200"
        >
          <LogOut className="w-4 h-4" />
          <span>{lang === 'np' ? 'साइन आउट' : 'Sign Out'}</span>
        </button>
      </div>
    </div>
  );
};
