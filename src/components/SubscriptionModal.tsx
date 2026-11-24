import React, { useState } from 'react';
import {
  Crown,
  Check,
  Sparkles,
  Zap,
  ShieldCheck,
  Download,
  BookOpen,
  Bell,
  Clock,
  ArrowRight,
  CheckCircle2,
  X
} from 'lucide-react';
import { UserSubscription, SubscriptionTier, Language } from '../types';

interface SubscriptionModalProps {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
  currentSubscription?: UserSubscription;
  onSubscriptionUpdated: (sub: UserSubscription) => void;
}

export function SubscriptionModal({
  lang,
  isOpen,
  onClose,
  currentSubscription,
  onSubscriptionUpdated
}: SubscriptionModalProps) {
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>('pro');
  const [selectedPayment, setSelectedPayment] = useState<'esewa' | 'khalti' | 'connectips'>('esewa');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isCurrentPro = currentSubscription?.tier === 'pro' || currentSubscription?.tier === 'yearly_pro';

  const handleUpgrade = async () => {
    setIsProcessing(true);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/user/subscription/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: selectedTier,
          paymentMethod: selectedPayment
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(data.message || 'Subscription upgraded successfully!');
        if (data.subscription) {
          onSubscriptionUpdated(data.subscription);
        }
        setTimeout(() => {
          onClose();
        }, 1800);
      }
    } catch (err) {
      console.error('Subscription error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const featureList = [
    { title: 'Unlimited Full Lok Sewa Mock Tests (2000+ Questions)', free: false, pro: true },
    { title: 'Lok Sewa Phase 2 AI Subjective Answer Evaluator & Model Key', free: false, pro: true },
    { title: 'Chapter Revision Digest & PDF Notes Offline Downloads', free: false, pro: true },
    { title: 'Priority Real-time Exam Routine, Seat & Result Alerts', free: false, pro: true },
    { title: 'Statewide National Percentile & Negative Marking Analytics', free: true, pro: true },
    { title: 'Comprehensive Vacancy Search & Devanagari Voice Navigation', free: true, pro: true }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-ink/30 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] max-w-2xl w-full p-6 sm:p-8 space-y-6 my-8 animate-scale-up shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
              <Crown className="w-3.5 h-3.5 text-amber-500" />
              <span>SarkariSajha Pro Membership</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
              {lang === 'np' ? 'लोक सेवा परीक्षा प्रिमियम सदस्यता' : 'Upgrade to SarkariSajha Pro'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Unlock unlimited AI subjective evaluations, full official chapter PDF digests, and priority routine alerts.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {successMessage ? (
          <div className="p-8 text-center space-y-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-3xl animate-scale-up">
            <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-emerald-800 dark:text-emerald-200">
              {successMessage}
            </h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              All Pro features, AI subjective evaluators, and PDF notes are now fully unlocked.
            </p>
          </div>
        ) : (
          <>
            {/* Plan Tier Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Monthly Plan */}
              <div
                onClick={() => setSelectedTier('pro')}
                className={`p-5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                  selectedTier === 'pro'
                    ? 'bg-blue-50/40 dark:bg-blue-950/30 shadow-md'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div>
                  <span className="text-xs font-bold text-slate-500">Monthly Pass</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-slate-900 dark:text-slate-100">रु. ३५०</span>
                    <span className="text-xs text-slate-400">/ 30 days</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Ideal for fast revision before upcoming exams.</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center gap-2 text-xs font-bold text-blue-600">
                  <span>Select Monthly</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Annual Plan (Best Value) */}
              <div
                onClick={() => setSelectedTier('yearly_pro')}
                className={`p-5 rounded-2xl border-2 transition cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  selectedTier === 'yearly_pro'
                    ? 'bg-amber-50/40 dark:bg-amber-950/30 shadow-md'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-600 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl">
                  Save 40%
                </div>
                <div>
                  <span className="text-xs font-bold text-amber-600">Annual Super Pass</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-slate-900 dark:text-slate-100">रु. २,४९९</span>
                    <span className="text-xs text-slate-400">/ 1 year</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Complete year-round coverage for Officer, NaSu & Kharidar.</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center gap-2 text-xs font-bold text-amber-600">
                  <span>Select Annual Pass</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Feature Comparison List */}
            <div className="bg-sky-50/70 dark:bg-slate-800/40 p-4 rounded-2xl space-y-2.5 text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200 block text-[10px]">
                Included in Your Membership:
              </span>
              <div className="space-y-2">
                {featureList.map((feat, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3 text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{feat.title}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                      PRO UNLOCKED
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Digital Payment Provider Selection */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Select Nepal Digital Payment Method (सिम्युलेटेड भुक्तानी)
              </span>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedPayment('esewa')}
                  className={`p-3 rounded-full border text-xs font-bold transition flex items-center justify-center gap-2 ${
                    selectedPayment === 'esewa'
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>eSewa Wallet</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPayment('khalti')}
                  className={`p-3 rounded-full border text-xs font-bold transition flex items-center justify-center gap-2 ${
                    selectedPayment === 'khalti'
                      ? 'bg-purple-50 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <span>Khalti Digital</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPayment('connectips')}
                  className={`p-3 rounded-full border text-xs font-bold transition flex items-center justify-center gap-2 ${
                    selectedPayment === 'connectips'
                      ? 'bg-blue-50 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span>connectIPS / Bank</span>
                </button>
              </div>
            </div>

            {/* Upgrade CTA */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleUpgrade}
                disabled={isProcessing}
                className="w-full py-3.5 rounded-full font-black text-sm transition flex items-center justify-center gap-2 bg-ink hover:bg-black text-white dark:bg-white dark:text-ink"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Authorizing Payment via {selectedPayment.toUpperCase()}...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Complete Upgrade ({selectedTier === 'yearly_pro' ? 'रु. २,४९९ / Year' : 'रु. ३५० / Month'})</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
