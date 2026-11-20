import React, { useState, useEffect } from 'react';
import {
  Bell,
  Calendar,
  MapPin,
  Award,
  FileCheck,
  AlertTriangle,
  Download,
  Filter,
  Search,
  ExternalLink,
  Clock,
  Building,
  CheckCircle2,
  CalendarPlus,
  RefreshCw,
  Mic,
  MicOff
} from 'lucide-react';
import { AdministrativeAlert, AlertType, VacancyCategory, Language } from '../types';
import { INITIAL_ADMIN_ALERTS } from '../data/seedData';
import { useSpeechToText } from '../hooks/useSpeechToText';

interface AdministrativeAlertsCenterProps {
  lang: Language;
  onRefresh?: () => void;
}

export function AdministrativeAlertsCenter({ lang, onRefresh }: AdministrativeAlertsCenterProps) {
  const [alerts, setAlerts] = useState<AdministrativeAlert[]>(INITIAL_ADMIN_ALERTS);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeAlertDetail, setActiveAlertDetail] = useState<AdministrativeAlert | null>(null);

  const { isListening, toggleListening, transcript } = useSpeechToText({
    lang: lang === 'np' ? 'ne-NP' : 'en-US',
    onTranscript: (t) => setSearchQuery(t)
  });

  useEffect(() => {
    if (transcript) {
      setSearchQuery(transcript);
    }
  }, [transcript]);

  const loadAlerts = () => {
    setLoading(true);
    fetch('/api/admin-alerts')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAlerts(data);
      })
      .catch(err => console.error('Error fetching admin alerts:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const alertTypeLabels: Record<AlertType, { labelEn: string; labelNp: string; icon: any; color: string }> = {
    exam_routine: { labelEn: 'Exam Routine', labelNp: 'परीक्षा तालिका', icon: Calendar, color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200' },
    seat_planning: { labelEn: 'Seat Planning', labelNp: 'सिट प्लानिङ', icon: MapPin, color: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200' },
    exam_center: { labelEn: 'Exam Center', labelNp: 'परीक्षा केन्द्र', icon: Building, color: 'bg-purple-50 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200' },
    result_merit: { labelEn: 'Result & Merit', labelNp: 'नतिजा तथा सिफारिस', icon: Award, color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200' },
    admit_card: { labelEn: 'Admit Card', labelNp: 'प्रवेशपत्र सूचना', icon: FileCheck, color: 'bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200' },
    syllabus_update: { labelEn: 'Syllabus Update', labelNp: 'पाठ्यक्रम परिमार्जन', icon: RefreshCw, color: 'bg-teal-50 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 border-teal-200' }
  };

  const filteredAlerts = alerts.filter(a => {
    if (selectedType !== 'all' && a.alertType !== selectedType) return false;
    if (selectedCategory !== 'all' && a.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.titleNp.includes(q) ||
        a.organization.toLowerCase().includes(q) ||
        (a.noticeNumber && a.noticeNumber.includes(q))
      );
    }
    return true;
  });

  const handleDownloadCalendarIcs = (alert: AdministrativeAlert) => {
    const examDate = alert.effectiveExamDate || alert.publishDate;
    const cleanDate = examDate.split(' ')[0].replace(/-/g, '');
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SarkariSajha//Nepal PSC Exam Alerts//EN
BEGIN:VEVENT
SUMMARY:${alert.title}
DESCRIPTION:${alert.summary.replace(/\n/g, ' ')} (${alert.organization})
DTSTART;VALUE=DATE:${cleanDate}
DTEND;VALUE=DATE:${cleanDate}
STATUS:CONFIRMED
LOCATION:${alert.organization}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SarkariSajha_${alert.id}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-indigo-200 border border-white/10">
              <Bell className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
              <span>{lang === 'np' ? 'लोक सेवा आयोग आधिकारिक सूचना केन्द्र' : 'Official Administrative PSC Alert Hub'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {lang === 'np' ? 'परीक्षा तालिका, सिट प्लानिङ र नतिजा सूचनाहरू' : 'Exam Routines, Centers & Result Alerts'}
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200/80 max-w-2xl">
              {lang === 'np'
                ? 'लोक सेवा आयोग, शिक्षक सेवा, बैंक तथा सुरक्षा निकायका आधिकारिक परीक्षा रुटिन, भवन सिट प्लानिङ र नतिजा प्रकाशनहरूको प्रत्यक्ष सूचना।'
                : 'Real-time verified administrative notifications for PSC exam timetables, admit cards, seat allocations, and merit recommendations.'}
            </p>
          </div>

          {/* Search & Refresh */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'np' ? 'सूचना खोज्नुहोस्...' : 'Search notice...'}
                className="pl-9 pr-10 py-2 bg-white/10 text-white placeholder:text-slate-300 text-xs rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400 w-48 sm:w-64"
              />
              <button
                type="button"
                onClick={toggleListening}
                className={`absolute right-1.5 top-1.5 p-1 rounded-lg transition ${
                  isListening ? 'bg-rose-500 text-white animate-pulse' : 'text-slate-300 hover:text-white'
                }`}
              >
                {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </button>
            </div>
            <button
              onClick={loadAlerts}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition"
              title="Refresh alerts"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Type Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedType === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            {lang === 'np' ? 'सबै सूचनाहरू' : 'All Updates'} ({alerts.length})
          </button>
          {(Object.keys(alertTypeLabels) as AlertType[]).map((type) => {
            const config = alertTypeLabels[type];
            const Icon = config.icon;
            const count = alerts.filter(a => a.alertType === type).length;
            if (count === 0 && selectedType !== type) return null;
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  selectedType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{lang === 'np' ? config.labelNp : config.labelEn}</span>
                <span className="text-[10px] opacity-80">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Category Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl px-3 py-1.5 border border-slate-200 dark:border-slate-700 focus:outline-none"
          >
            <option value="all">{lang === 'np' ? 'सबै निकायहरू' : 'All Organizations'}</option>
            <option value="Lok Sewa (PSC)">Lok Sewa (PSC)</option>
            <option value="Teacher Service (TSC)">Teacher Service (TSC)</option>
            <option value="Banking & Finance">Banking & Finance</option>
            <option value="Security Forces">Security Forces</option>
            <option value="Provincial Lok Sewa">Provincial Lok Sewa</option>
          </select>
        </div>
      </div>

      {/* Alert Feed */}
      {loading ? (
        <div className="text-center py-16 space-y-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading official administrative alerts...</p>
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 p-8">
          <Bell className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No alerts match current filter</h3>
          <p className="text-xs text-slate-500">Try changing the category or clearing the search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAlerts.map((alert) => {
            const typeConfig = alertTypeLabels[alert.alertType] || alertTypeLabels.exam_routine;
            const Icon = typeConfig.icon;

            return (
              <div
                key={alert.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 shadow-xs transition hover:shadow-md flex flex-col justify-between ${
                  alert.urgent
                    ? 'border-amber-400 dark:border-amber-600/80 bg-amber-50/10'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${typeConfig.color}`}>
                        <Icon className="w-3 h-3" />
                        {lang === 'np' ? typeConfig.labelNp : typeConfig.labelEn}
                      </span>
                      {alert.urgent && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white uppercase tracking-wider animate-pulse">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          Urgent
                        </span>
                      )}
                      {alert.noticeNumber && (
                        <span className="text-[11px] text-slate-400 font-mono">
                          {alert.noticeNumber}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" />
                      {alert.publishDate}
                    </span>
                  </div>

                  {/* Title & Organization */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 transition leading-snug">
                      {lang === 'np' ? alert.titleNp : alert.title}
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
                      {alert.organization} • <span className="text-blue-600 dark:text-blue-400">{alert.category}</span>
                    </p>
                  </div>

                  {/* Summary */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                    {lang === 'np' ? alert.summaryNp : alert.summary}
                  </p>

                  {/* Effective Exam Date if any */}
                  {alert.effectiveExamDate && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 rounded-xl text-xs text-blue-900 dark:text-blue-200">
                      <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="font-semibold">
                        {lang === 'np' ? 'परीक्षा मिति:' : 'Exam Date:'} {alert.effectiveExamDate}
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer Action Buttons */}
                <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleDownloadCalendarIcs(alert)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 font-semibold transition"
                    title="Add to Google/Apple Calendar"
                  >
                    <CalendarPlus className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{lang === 'np' ? 'क्यालेन्डरमा जोड्नुहोस्' : 'Add to Calendar'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveAlertDetail(alert)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition shadow-xs"
                  >
                    <span>{lang === 'np' ? 'विस्तृत विवरण' : 'View Details'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Alert Detail Modal */}
      {activeAlertDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-scale-up">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {activeAlertDetail.category}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-2">
                  {lang === 'np' ? activeAlertDetail.titleNp : activeAlertDetail.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeAlertDetail.organization} • {activeAlertDetail.noticeNumber}
                </p>
              </div>
              <button
                onClick={() => setActiveAlertDetail(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                {lang === 'np' ? 'आधिकारिक सूचना विवरण:' : 'Official Notice Summary:'}
              </p>
              <p>{lang === 'np' ? activeAlertDetail.summaryNp : activeAlertDetail.summary}</p>

              {activeAlertDetail.effectiveExamDate && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2 text-blue-600 font-bold">
                  <Calendar className="w-4 h-4" />
                  <span>Scheduled Exam Date: {activeAlertDetail.effectiveExamDate}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={() => handleDownloadCalendarIcs(activeAlertDetail)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-2 hover:bg-slate-200"
              >
                <CalendarPlus className="w-4 h-4 text-indigo-600" />
                <span>Save to Calendar (.ics)</span>
              </button>
              <button
                onClick={() => setActiveAlertDetail(null)}
                className="px-5 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
