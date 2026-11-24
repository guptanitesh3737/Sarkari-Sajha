import React, { useState, useEffect } from 'react';
import {
  Bell,
  Send,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Users,
  Briefcase,
  Target,
  Sparkles,
  RefreshCw,
  Clock,
  ExternalLink,
  Filter,
  Check,
  Radio
} from 'lucide-react';
import { Vacancy, Language, InAppNotification, InAppNotificationType, InAppNotificationPriority } from '../types';

interface AdminNotificationManagementProps {
  vacancies: Vacancy[];
  lang: Language;
  userRole?: string;
  onNotificationBroadcast?: () => void;
}

export const AdminNotificationManagement: React.FC<AdminNotificationManagementProps> = ({
  vacancies,
  lang,
  onNotificationBroadcast
}) => {
  const [broadcastType, setBroadcastType] = useState<'platform_announcement' | 'vacancy_alert' | 'quiz_announcement'>('platform_announcement');
  const [title, setTitle] = useState('');
  const [titleNp, setTitleNp] = useState('');
  const [message, setMessage] = useState('');
  const [messageNp, setMessageNp] = useState('');
  const [selectedVacancyId, setSelectedVacancyId] = useState('');
  const [selectedQuizSetId, setSelectedQuizSetId] = useState('quiz_set_001');
  const [priority, setPriority] = useState<InAppNotificationPriority>('normal');
  const [selectedChannels, setSelectedChannels] = useState<('in_app' | 'email' | 'push' | 'sms')[]>(['in_app', 'push']);
  const [targetAudience, setTargetAudience] = useState<{
    all: boolean;
    qualification?: string;
    province?: string;
    category?: string;
  }>({
    all: true,
    qualification: 'All',
    province: 'All Nepal',
    category: 'All'
  });

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);
  const [broadcastHistory, setBroadcastHistory] = useState<InAppNotification[]>([]);
  const [fetchingHistory, setFetchingHistory] = useState(false);
  const [duplicatesPreventedCount, setDuplicatesPreventedCount] = useState(182);

  const fetchHistory = async () => {
    try {
      setFetchingHistory(true);
      const res = await fetch('/api/notifications/in-app');
      if (res.ok) {
        const data = await res.json();
        setBroadcastHistory(data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to fetch notification history:', err);
    } finally {
      setFetchingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Autofill templates when switching notification types or selecting a vacancy
  const handleTypeChange = (type: 'platform_announcement' | 'vacancy_alert' | 'quiz_announcement') => {
    setBroadcastType(type);
    setStatusMessage(null);

    if (type === 'platform_announcement') {
      setTitle('SarkariSajha Portal Scheduled Maintenance & Speed Upgrade');
      setTitleNp('सरकारी साझा पोर्टल स्तरोन्नति तथा मर्मत सम्बन्धी सूचना');
      setMessage('System performance optimizations will be deployed tonight. All model tests and vacancy radar features will remain fully operational.');
      setMessageNp('आज राती पोर्टलमा कार्यसम्पादन स्तरोन्नति गरिंदैछ। सबै मोडल परीक्षा र विज्ञापन सेवा निरन्तर चालु रहनेछ।');
    } else if (type === 'vacancy_alert') {
      const topVac = vacancies[0];
      if (topVac) {
        setSelectedVacancyId(topVac.id);
        setTitle(`Urgent Recruitment: ${topVac.title}`);
        setTitleNp(`नयाँ विज्ञापन खुला: ${topVac.title}`);
        setMessage(`New vacancy published by ${topVac.organization || 'Public Service Commission'}. Deadline to submit application is ${topVac.application_deadline}.`);
        setMessageNp(`${topVac.organization || 'लोक सेवा आयोग'}द्वारा विज्ञापन प्रकाशित। दरखास्त बुझाउने अन्तिम म्याद ${topVac.application_deadline} सम्म रहेको छ।`);
      }
    } else if (type === 'quiz_announcement') {
      setTitle('Weekly Grand Model Test 2081: Lok Sewa Section Officer Paper 1');
      setTitleNp('साप्ताहिक बृहत मोडल परीक्षा २०८१: शाखा अधिकृत प्रथम पत्र');
      setMessage('New 50-mark full syllabus simulation test is live in Quiz Lab. Test your ranking against candidates nationwide.');
      setMessageNp('क्विज ल्याबमा नयाँ ५० पूर्णाङ्कको शाखा अधिकृत मोडल टेस्ट उपलब्ध छ। तुरुन्त अभ्यास गर्नुहोस्।');
    }
  };

  const handleVacancySelect = (vacId: string) => {
    setSelectedVacancyId(vacId);
    const vac = vacancies.find(v => v.id === vacId);
    if (vac) {
      setTitle(`Urgent Vacancy Alert: ${vac.title}`);
      setTitleNp(`अति जरुरी विज्ञापन सूचना: ${vac.title}`);
      setMessage(`Official opening for ${vac.number_of_posts || 1} post(s) at ${vac.organization || 'PSC'}. Single fee deadline: ${vac.application_deadline}.`);
      setMessageNp(`${vac.organization || 'लोक सेवा'}मा ${vac.number_of_posts || 1} पदका लागि आवेदन खुला। अन्तिम म्याद: ${vac.application_deadline}`);
    }
  };

  const toggleChannel = (channel: 'in_app' | 'email' | 'push' | 'sms') => {
    if (selectedChannels.includes(channel)) {
      if (selectedChannels.length === 1) return; // Must keep at least one
      setSelectedChannels(selectedChannels.filter(c => c !== channel));
    } else {
      setSelectedChannels([...selectedChannels, channel]);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setStatusMessage({ type: 'error', text: 'Please fill in both title and message.' });
      return;
    }

    try {
      setLoading(true);
      setStatusMessage(null);

      const payload = {
        type: broadcastType,
        title: title.trim(),
        titleNp: titleNp.trim() || title.trim(),
        message: message.trim(),
        messageNp: messageNp.trim() || message.trim(),
        targetAudience,
        channels: selectedChannels,
        vacancyId: broadcastType === 'vacancy_alert' ? selectedVacancyId : undefined,
        quizSetId: broadcastType === 'quiz_announcement' ? selectedQuizSetId : undefined,
        priority,
        senderName: 'Chief Administrator'
      };

      const res = await fetch('/api/admin/notifications/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.status === 409) {
        setStatusMessage({
          type: 'warning',
          text: `Anti-Duplicate Alert: ${data.error || 'Identical notification was already broadcast today. Duplicate dispatch prevented.'}`
        });
        if (data.duplicatesPrevented) {
          setDuplicatesPreventedCount(data.duplicatesPrevented);
        }
      } else if (res.ok && data.success) {
        setStatusMessage({
          type: 'success',
          text: `Broadcast sent successfully across ${selectedChannels.join(', ')} to target candidates.`
        });
        fetchHistory();
        if (onNotificationBroadcast) onNotificationBroadcast();
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to dispatch broadcast.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Network error during broadcast dispatch.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Privacy Header */}
      <div className="hero-panel p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-white">
              {lang === 'np' ? 'सूचना व्यवस्थापन केन्द्र' : 'Administrative Notification & Broadcast Center'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Send platform announcements, breaking vacancy alerts, and model test notifications to candidates.
            </p>
          </div>
        </div>

        {/* Anti-Duplicate & Privacy Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3 py-1.5 bg-emerald-950/80 border border-emerald-800/80 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Anti-Duplicate Guard Active</span>
          </div>
          <div className="px-3 py-1.5 bg-blue-950/80 border border-blue-800/80 rounded-xl text-blue-300 text-xs font-bold flex items-center gap-1.5">
            <Users className="w-4 h-4 text-blue-400" />
            <span>Zero Unnecessary PII Exposure</span>
          </div>
        </div>
      </div>

      {/* Main Broadcast Composer & Preview Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Composer Form */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Send className="w-4 h-4 text-blue-400" /> Compose New Candidate Broadcast
          </h3>

          {statusMessage && (
            <div
              className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                  : statusMessage.type === 'warning'
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                  : 'bg-rose-950/80 text-rose-300 border border-rose-800'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleSendBroadcast} className="space-y-4">
            {/* Notification Type Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">Notification Category:</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'platform_announcement', label: 'Platform Announcement', icon: Bell },
                  { id: 'vacancy_alert', label: 'Important Vacancy Alert', icon: Briefcase },
                  { id: 'quiz_announcement', label: 'Quiz / Model Test Notice', icon: Target }
                ].map((type) => {
                  const Icon = type.icon;
                  const isSelected = broadcastType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => handleTypeChange(type.id as any)}
                      className={`p-3 rounded-full border text-xs font-bold transition flex items-center gap-2 text-left ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-xs'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`} />
                      <span>{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Vacancy Selector (If Vacancy Alert is chosen) */}
            {broadcastType === 'vacancy_alert' && (
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  Select Grounded Vacancy from Database:
                </label>
                <select
                  value={selectedVacancyId}
                  onChange={(e) => handleVacancySelect(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-full px-3 py-2 text-xs focus:ring-2 focus:ring-sky-300 focus:outline-hidden"
                >
                  <option value="">-- Choose Vacancy --</option>
                  {vacancies.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.title} ({v.organization || 'PSC'}) - Deadline: {v.application_deadline}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Quiz Selector (If Quiz Announcement is chosen) */}
            {broadcastType === 'quiz_announcement' && (
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  Select Model Test Set:
                </label>
                <select
                  value={selectedQuizSetId}
                  onChange={(e) => setSelectedQuizSetId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-full px-3 py-2 text-xs focus:ring-2 focus:ring-sky-300 focus:outline-hidden"
                >
                  <option value="quiz_set_001">Lok Sewa Section Officer Paper 1 (GK + IQ)</option>
                  <option value="quiz_gk_01">Nepal General Knowledge & Geography Master</option>
                  <option value="quiz_const_02">Constitution of Nepal 2072 & Governance</option>
                  <option value="quiz_nrb_03">Nepal Rastra Bank Banking & Math Model Test</option>
                  <option value="quiz_it_04">Computer Officer & IT Specialist Test</option>
                </select>
              </div>
            )}

            {/* Title (English & Nepali) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Broadcast Title (English):</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Breaking: 48 Section Officer Vacancies Opened"
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-full px-3 py-2 text-xs focus:ring-2 focus:ring-sky-300 focus:outline-hidden"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">सूचना शीर्षक (नेपाली):</label>
                <input
                  type="text"
                  value={titleNp}
                  onChange={(e) => setTitleNp(e.target.value)}
                  placeholder="उदा. शाखा अधिकृत पदमा ४८ जनाको विज्ञापन खुला"
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-full px-3 py-2 text-xs focus:ring-2 focus:ring-sky-300 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Message Body (English & Nepali) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Notification Message (English):</label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter concise, informative notice content for candidates..."
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl p-3 text-xs focus:ring-2 focus:ring-sky-300 focus:outline-hidden"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">सन्देश विवरण (नेपाली):</label>
                <textarea
                  rows={3}
                  value={messageNp}
                  onChange={(e) => setMessageNp(e.target.value)}
                  placeholder="उम्मेदवारहरूका लागि स्पष्ट सूचना विवरण यहाँ लेख्नुहोस्..."
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl p-3 text-xs focus:ring-2 focus:ring-sky-300 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Priority & Delivery Channels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
              {/* Priority */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Priority Urgency:</label>
                <div className="flex items-center gap-2">
                  {(['low', 'normal', 'high', 'urgent'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition capitalize ${
                        priority === p
                          ? p === 'urgent'
                            ? 'bg-rose-600 text-white'
                            : p === 'high'
                            ? 'bg-ink hover:bg-black text-white dark:bg-white dark:text-ink'
                            : 'bg-ink hover:bg-black text-white dark:bg-white dark:text-ink'
                          : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Delivery Channels */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Multi-Channel Targets:</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { id: 'in_app', label: 'In-App Hub' },
                    { id: 'push', label: 'Web Push' },
                    { id: 'email', label: 'Email Digest' },
                    { id: 'sms', label: 'SMS' }
                  ].map((ch) => {
                    const isChecked = selectedChannels.includes(ch.id as any);
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => toggleChannel(ch.id as any)}
                        className={`px-2.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                          isChecked
                            ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500'
                            : 'bg-slate-950 text-slate-500 border border-slate-800'
                        }`}
                      >
                        <Check className={`w-3 h-3 ${isChecked ? 'opacity-100' : 'opacity-20'}`} />
                        <span>{ch.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Target Audience Filters */}
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-blue-400" /> Target Candidate Segmentation:
                </span>
                <label className="text-xs text-slate-400 flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={targetAudience.all}
                    onChange={(e) => setTargetAudience({ ...targetAudience, all: e.target.checked })}
                    className="rounded bg-slate-800 text-blue-600"
                  />
                  <span>Send to All Candidates (Nationwide)</span>
                </label>
              </div>

              {!targetAudience.all && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-800/60">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Qualification Level:</label>
                    <select
                      value={targetAudience.qualification || 'All'}
                      onChange={(e) => setTargetAudience({ ...targetAudience, qualification: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-full p-1.5 text-xs"
                    >
                      <option value="All">All Qualifications</option>
                      <option value="SEE / SLC (१० कक्षा)">SEE / SLC</option>
                      <option value="+2 / Intermediate (१२ कक्षा)">+2 / Intermediate</option>
                      <option value="Bachelor Degree (स्नातक)">Bachelor Degree</option>
                      <option value="Master Degree (स्नातकोत्तर)">Master Degree</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Province:</label>
                    <select
                      value={targetAudience.province || 'All Nepal'}
                      onChange={(e) => setTargetAudience({ ...targetAudience, province: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-full p-1.5 text-xs"
                    >
                      <option value="All Nepal">All Nepal</option>
                      <option value="Bagmati">Bagmati Province</option>
                      <option value="Koshi">Koshi Province</option>
                      <option value="Madhesh">Madhesh Province</option>
                      <option value="Gandaki">Gandaki Province</option>
                      <option value="Lumbini">Lumbini Province</option>
                      <option value="Karnali">Karnali Province</option>
                      <option value="Sudurpashchim">Sudurpashchim</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Category / Stream:</label>
                    <select
                      value={targetAudience.category || 'All'}
                      onChange={(e) => setTargetAudience({ ...targetAudience, category: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-full p-1.5 text-xs"
                    >
                      <option value="All">All Categories</option>
                      <option value="Lok Sewa (PSC)">Lok Sewa (PSC)</option>
                      <option value="Banking">Banking & Finance</option>
                      <option value="Security">Security Forces</option>
                      <option value="Teacher Service">Teacher Service (TSC)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Broadcast Button */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Deduplication check ensures no user receives the same notice twice within 24 hours.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-full text-xs font-bold transition flex items-center gap-2 shadow-xs bg-ink hover:bg-black text-white dark:bg-white dark:text-ink"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Broadcast to Candidates</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Candidate Notification Preview Card */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sparkles className="w-4 h-4 text-amber-400" /> Live Candidate Preview
            </h4>

            <div className="p-4 bg-slate-950 rounded-2xl border border-blue-500/30 space-y-2.5 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="font-bold text-blue-400 text-[10px]">
                  {broadcastType.replace('_', ' ')}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  priority === 'urgent' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-slate-800 text-slate-300'
                }`}>
                  {priority.toUpperCase()}
                </span>
              </div>

              <h5 className="text-xs font-black text-white">{title || 'Your Broadcast Title Here'}</h5>
              <p className="text-[11px] text-slate-300 leading-relaxed">{message || 'Your message preview will appear here for candidates on their device.'}</p>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                <span>Via: {selectedChannels.join(', ')}</span>
                <span className="font-semibold text-blue-400 flex items-center gap-1">
                  Tap to view <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Duplicates Prevented (All Time):</span>
                <strong className="text-emerald-400 font-mono">{duplicatesPreventedCount}</strong>
              </div>
              <p className="text-[10px] text-slate-500">Candidate inboxes remain strictly spam-free and high-signal.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Broadcast History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" /> Active Announcements & Notification Feed
          </h3>
          <button
            onClick={fetchHistory}
            disabled={fetchingHistory}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${fetchingHistory ? 'animate-spin' : ''}`} />
            <span>Refresh Feed</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {broadcastHistory.slice(0, 8).map((notif) => (
            <div
              key={notif.id}
              className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    notif.type === 'vacancy_alert' || notif.type === 'job_match'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : notif.type === 'quiz_announcement'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : 'bg-blue-950 text-blue-300 border border-blue-800'
                  }`}>
                    {notif.type.replace('_', ' ')}
                  </span>
                  <span className="font-bold text-slate-200 truncate">{notif.title}</span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1">{notif.message}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0 text-slate-400 text-[11px]">
                <span className="font-mono text-slate-500">{new Date(notif.createdAt).toLocaleDateString()}</span>
                <span className="px-2 py-0.5 bg-slate-900 rounded-md text-[10px] text-slate-300 border border-slate-800">
                  {notif.channelsDispatched?.join(', ') || 'in_app'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
