import React, { useState } from 'react';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  MessageSquare,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import { Language } from '../types';

interface ContactPageProps {
  lang: Language;
  onNavigateHome: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ lang, onNavigateHome }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<'Vacancy Query' | 'Quiz Correction' | 'Technical Support' | 'Feedback'>('Vacancy Query');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMsg(lang === 'np' ? 'कृपया सबै आवश्यक विवरणहरू भर्नुहोस्।' : 'Please fill in all required fields.');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setErrorMsg(lang === 'np' ? 'कृपया मान्य इमेल ठेगाना प्रविष्ट गर्नुहोस्।' : 'Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    }, 800);
  };

  const faqs = [
    {
      q: lang === 'np' ? 'के सरकारीसाझा आधिकारिक सरकारी वेबसाइट हो?' : 'Is SarkariSajha an official government website?',
      a: lang === 'np'
        ? 'होइन, सरकारीसाझा एक स्वतन्त्र सूचना तथा लोक सेवा परीक्षा तयारी प्लेटफर्म हो। हामी आधिकारिक राजपत्र र आयोगका सूचनाहरूलाई सङ्कलन गरी उम्मेदवारहरूका लागि सरल रूपमा प्रस्तुत गर्दछौं।'
        : 'No, SarkariSajha is an independent information and exam-preparation platform. We curate verified government notices to assist candidates in their preparation.'
    },
    {
      q: lang === 'np' ? 'अनलाइन दरखास्त फाराम कसरी भर्ने?' : 'How do I submit formal job applications?',
      a: lang === 'np'
        ? 'सरकारी विज्ञापनहरूको लागि सम्बन्धित आयोगको आधिकारिक अनलाइन पोर्टल (जस्तै Lok Sewa को pps.psc.gov.np वा TSC को online.tsc.gov.np) मा गएर दर्ता गर्नुपर्छ। सरकारीसाझामा प्रत्येक विज्ञापनको साथ आधिकारिक आवेदन लिङ्क दिइएको हुन्छ।'
        : 'Formal applications must be submitted directly on the official portal of the relevant commission (e.g. pps.psc.gov.np for PSC). Direct links to official portals are provided on each vacancy page.'
    },
    {
      q: lang === 'np' ? 'कुनै विज्ञापनको त्रुटि वा नयाँ सूचना कसरी जानकारी गराउने?' : 'How can I report a notice discrepancy or typo?',
      a: lang === 'np'
        ? 'तपाईंले तलको फाराम मार्फत "Vacancy Query" वा "Quiz Correction" चयन गरी सम्पादकीय टोलीलाई तुरुन्त सन्देश पठाउन सक्नुहुन्छ।'
        : 'You can submit feedback using the contact form below with category "Vacancy Query" or "Quiz Correction". Our editorial desk reviews submissions daily.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Back button */}
      <button
        onClick={onNavigateHome}
        className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline mb-6 group cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        {lang === 'np' ? 'गृहपृष्ठमा फर्कनुहोस्' : 'Back to Home'}
      </button>

      {/* Header */}
      <div className="hero-panel p-6 sm:p-10 mb-8">
        <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-400/30 rounded-full text-xs font-bold mb-3">
          {lang === 'np' ? 'सम्पर्क तथा सहायता' : 'Contact & Support Desk'}
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          {lang === 'np' ? 'हामीलाई सम्पर्क गर्नुहोस्' : 'Get in Touch with Our Team'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl">
          Have questions regarding vacancy publications, mock quizzes, or subscription features? Reach out to the SarkariSajha team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Contact Info Sidebar */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 space-y-2 shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-900 dark:text-white">
              <Mail className="w-4 h-4 text-blue-500" />
              <span>Email Support</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-mono">
              support@sarkarisajha.com
            </p>
            <p className="text-[11px] text-slate-400">Average response within 12 hours</p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 space-y-2 shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-900 dark:text-white">
              <Phone className="w-4 h-4 text-emerald-500" />
              <span>Helpline & Inquiries</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-mono">
              +977-1-4428900 / 9851000000
            </p>
            <p className="text-[11px] text-slate-400">Sun - Fri, 9:00 AM - 6:00 PM NPT</p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 space-y-2 shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-900 dark:text-white">
              <MapPin className="w-4 h-4 text-rose-500" />
              <span>Editorial Office</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Putalisadak - 28, Kathmandu, Bagmati Province, Nepal
            </p>
          </div>
        </div>

        {/* Interactive Form */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-[2rem] bg-white dark:bg-slate-900 shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-500" />
            {lang === 'np' ? 'सन्देश पठाउनुहोस्' : 'Send us a Message'}
          </h2>

          {isSubmitted ? (
            <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                {lang === 'np' ? 'सन्देश सफलतापूर्वक पठाइयो!' : 'Message Sent Successfully!'}
              </h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 max-w-md mx-auto">
                {lang === 'np'
                  ? 'तपाईंको सन्देश हाम्रो सम्पादकीय डेस्कमा प्राप्त भएको छ। हामी छिट्टै तपाईंको इमेलमा सम्पर्क गर्नेछौं।'
                  : 'Thank you for reaching out. Our support and editorial desk has received your ticket and will respond to your email shortly.'}
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="mt-2 px-4 py-2 text-xs font-bold rounded-full transition bg-ink hover:bg-black text-white dark:bg-white dark:text-ink"
              >
                {lang === 'np' ? 'अर्को सन्देश पठाउनुहोस्' : 'Send Another Message'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'np' ? 'तपाईंको पूरा नाम *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. Ramesh Thapa"
                    className="w-full px-3.5 py-2.5 rounded-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'np' ? 'इमेल ठेगाना *' : 'Email Address *'}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="e.g. ramesh@example.com"
                    className="w-full px-3.5 py-2.5 rounded-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'np' ? 'विषय प्रकार' : 'Inquiry Category'}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-300"
                  >
                    <option value="Vacancy Query">Vacancy Details & Notice Verification</option>
                    <option value="Quiz Correction">Quiz / Answer Key Feedback</option>
                    <option value="Technical Support">Technical & App Support</option>
                    <option value="Feedback">General Suggestion / Feedback</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'np' ? 'विषय (Subject)' : 'Subject'}
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief summary..."
                    className="w-full px-3.5 py-2.5 rounded-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'np' ? 'सन्देश विवरण *' : 'Detailed Message *'}
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  placeholder={lang === 'np' ? 'तपाईंको जिज्ञासा वा सुझाव यहाँ लेख्नुहोस्...' : 'Describe your query in detail...'}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-sky-50/70 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-300"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-full text-xs font-bold hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 bg-ink hover:bg-black text-white dark:bg-white dark:text-ink"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{lang === 'np' ? 'पठाउँदैछ...' : 'Submitting...'}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{lang === 'np' ? 'सन्देश पठाउनुहोस्' : 'Send Message to Support'}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="rounded-[2rem] bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-4 shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-500" />
          {lang === 'np' ? 'प्रायः सोधिने प्रश्नहरू (FAQs)' : 'Frequently Asked Questions'}
        </h3>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-800/40"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-4 py-3.5 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-slate-900 dark:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/80 transition cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
