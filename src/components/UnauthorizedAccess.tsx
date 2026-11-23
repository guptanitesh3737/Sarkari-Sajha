import React, { useState } from 'react';
import { ShieldAlert, ArrowLeft, LogOut, Lock, KeyRound, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Language } from '../types';
import { claimAdminPrivileges, isBootstrappedSuperAdminEmail, AdminRole } from '../lib/firestoreService';

interface UnauthorizedAccessProps {
  user: FirebaseUser | null;
  role: string;
  lang: Language;
  onNavigateHome: () => void;
  onOpenAuthModal?: () => void;
  onRoleUpdated?: (newRole: AdminRole) => void;
}

export const UnauthorizedAccess: React.FC<UnauthorizedAccessProps> = ({
  user,
  role,
  lang,
  onNavigateHome,
  onOpenAuthModal,
  onRoleUpdated
}) => {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const isOwnerEmail = user?.email && isBootstrappedSuperAdminEmail(user.email);

  const handleClaimAdmin = async () => {
    if (!user) {
      if (onOpenAuthModal) onOpenAuthModal();
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const res = await claimAdminPrivileges(user.uid);
      if (res.success && res.role) {
        setFeedback({
          type: 'success',
          message: lang === 'np' ? 'प्रशासक अधिकार सफलतापूर्वक सक्रिय गरियो!' : res.message
        });
        if (onRoleUpdated) {
          setTimeout(() => {
            onRoleUpdated(res.role || 'super_admin');
          }, 800);
        }
      } else {
        setFeedback({
          type: 'error',
          message: lang === 'np' ? 'प्रमाणीकरण असफल भयो वा अधिकार प्रदान गरिएको छैन।' : res.message
        });
      }
    } catch (e: any) {
      setFeedback({
        type: 'error',
        message: e?.message || 'Failed to activate administrator privileges.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden text-center">
        {/* Top Warning Banner */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 p-6 text-white flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 mb-3 shadow-inner">
            <ShieldAlert className="w-9 h-9 text-white animate-pulse" />
          </div>
          <h2 className="text-2xl font-black tracking-tight font-sans">
            403 - {lang === 'np' ? 'अनधिकृत पहुँच' : 'Access Restricted'}
          </h2>
          <p className="text-xs text-red-100 font-medium mt-1">
            {lang === 'np'
              ? 'प्रशासकीय नियन्त्रण कक्षमा पहुँच अधिकार आवश्यक छ'
              : 'SarkariSajha Admin Control Panel Authorization'}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-slate-700">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-left space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Logged-in Account:</span>
              <span className="font-bold text-slate-900 truncate max-w-[200px]">
                {user?.email || user?.phoneNumber || (lang === 'np' ? 'अतिथि (Guest)' : 'Guest / Not Signed In')}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Current Role:</span>
              <span className="inline-flex items-center gap-1 font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 uppercase text-[10px]">
                <Lock className="w-3 h-3 text-amber-600" />
                {role || 'candidate'}
              </span>
            </div>
          </div>

          {feedback && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 text-left ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Quick Activate for Verified Admin Email */}
          {user && isOwnerEmail && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-left space-y-2">
              <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Verified Super Administrator Account</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Your email ({user.email}) is recognized as the Project Owner. Click below to activate full Super Admin access.
              </p>
              <button
                onClick={() => handleClaimAdmin()}
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Activate Super Administrator Access</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Refresh Role Check for verified accounts */}
          {user && (
            <div className="pt-1">
              <button
                onClick={() => handleClaimAdmin()}
                disabled={loading}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 text-slate-600" />
                    <span>{lang === 'np' ? 'अनुमति पुनः जाँच गर्नुहोस्' : 'Check / Re-verify Admin Role Privileges'}</span>
                  </>
                )}
              </button>
            </div>
          )}

          <p className="text-xs leading-relaxed text-slate-600">
            {lang === 'np'
              ? 'प्रशासकीय क्षेत्र सम्पादक (Editor), प्रशासक (Admin), वा मुख्य प्रशासक (Super Admin) हरूका लागि मात्र सुरक्षित गरिएको छ।'
              : 'Admin panel is reserved for authorized Editors, Administrators, and Super Administrators to publish and edit vacancies.'}
          </p>

          <div className="pt-2 space-y-2">
            {!user ? (
              <button
                onClick={onOpenAuthModal}
                className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>{lang === 'np' ? 'प्रशासक खाता लगइन गर्नुहोस्' : 'Sign In with Administrator Account'}</span>
              </button>
            ) : null}

            <button
              onClick={onNavigateHome}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{lang === 'np' ? 'गृहपृष्ठमा फर्कनुहोस्' : 'Return to Public Vacancies Directory'}</span>
            </button>

            {user && (
              <button
                type="button"
                onClick={async () => {
                  await auth.signOut();
                  if (onOpenAuthModal) onOpenAuthModal();
                }}
                className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>{lang === 'np' ? 'साइन आउट गरी अर्को खाता लगइन गर्नुहोस्' : 'Sign Out & Switch Account'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 text-[10px] text-slate-500 font-mono flex items-center justify-between">
          <span>Security Enforced via Firestore ABAC</span>
          <span>SarkariSajha v2.5</span>
        </div>
      </div>
    </div>
  );
};
