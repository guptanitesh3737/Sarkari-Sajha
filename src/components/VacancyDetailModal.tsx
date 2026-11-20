import React, { useState } from 'react';
import {
  X,
  Building2,
  Calendar,
  Users,
  Award,
  MapPin,
  CheckCircle2,
  XCircle,
  Sparkles,
  ExternalLink,
  Bookmark,
  FileText,
  DollarSign,
  AlertTriangle,
  Loader2,
  CalendarPlus,
  FileWarning
} from 'lucide-react';
import { Vacancy, UserProfile, Language, MatchResult } from '../types';
import { t } from '../utils/translations';
import { VacancyReportModal } from './VacancyReportModal';

interface VacancyDetailModalProps {
  vacancy: Vacancy;
  userProfile: UserProfile;
  lang: Language;
  onClose: () => void;
  onBookmark: (vacancy: Vacancy) => void;
  isBookmarked: boolean;
}

export const VacancyDetailModal: React.FC<VacancyDetailModalProps> = ({
  vacancy,
  userProfile,
  lang,
  onClose,
  onBookmark,
  isBookmarked
}) => {
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [loadingMatch, setLoadingMatch] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const handleComputeMatch = async () => {
    try {
      setLoadingMatch(true);
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vacancyId: vacancy.id })
      });
      const data = await res.json();
      setMatchResult(data);
    } catch (err) {
      console.error('Failed to compute match:', err);
    } finally {
      setLoadingMatch(false);
    }
  };

  // Pre-calculated criteria check
  const levelMap: Record<string, number> = {
    'SEE/SLC': 1,
    '+2 High School': 2,
    'Bachelor Degree': 3,
    'Master Degree': 4,
    'MPhil/PhD': 5
  };

  const userLevelNum = levelMap[userProfile.qualificationLevel] || 1;
  const reqLevelNum = levelMap[vacancy.qualifications.minLevel] || 1;
  const isQualMet = userLevelNum >= reqLevelNum;
  const isProvMet = vacancy.province === 'All Nepal' || vacancy.province === userProfile.province;
  const isAgeMet = userProfile.age >= vacancy.qualifications.minAge && userProfile.age <= vacancy.qualifications.maxAge;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl text-slate-900 relative flex flex-col">
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-200 p-5 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                {vacancy.category}
              </span>
              <span className="text-slate-500 text-xs font-mono">Notice #{vacancy.noticeNumber}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-sans">
              {lang === 'np' ? vacancy.titleNp : vacancy.title}
            </h2>
            <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{vacancy.org}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 space-y-6">
          {/* Key Vacancy Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 text-[10px] uppercase block font-semibold">Total Openings</span>
              <span className="font-bold text-emerald-700 text-sm flex items-center gap-1 mt-0.5">
                <Users className="w-4 h-4 text-emerald-600" /> {vacancy.posts} Seats
              </span>
            </div>

            <div>
              <span className="text-slate-500 text-[10px] uppercase block font-semibold">Application Fee</span>
              <span className="font-bold text-amber-700 text-sm flex items-center gap-1 mt-0.5">
                <DollarSign className="w-4 h-4 text-amber-600" /> NPR {vacancy.fee}
              </span>
            </div>

            <div>
              <span className="text-slate-500 text-[10px] uppercase block font-semibold">Deadline</span>
              <span className="font-bold text-rose-700 text-xs flex items-center gap-1 mt-0.5">
                <Calendar className="w-4 h-4 text-rose-600" /> {vacancy.deadline}
              </span>
            </div>

            <div>
              <span className="text-slate-500 text-[10px] uppercase block font-semibold">Province / Region</span>
              <span className="font-bold text-blue-700 text-xs flex items-center gap-1 mt-0.5">
                <MapPin className="w-4 h-4 text-blue-600" /> {vacancy.province}
              </span>
            </div>
          </div>

          {/* Role Overview */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-600" /> Overview & Description
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              {vacancy.description}
            </p>
          </div>

          {/* Structured Eligibility Requirements Checklist */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-purple-600" /> Structured Qualification Requirements
            </h3>

            <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600">Min Qualification Level:</span>
                <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                  {vacancy.qualifications.minLevel}
                  {isQualMet ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600" />
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600">Eligible Fields:</span>
                <span className="font-semibold text-slate-800">
                  {vacancy.qualifications.fields.join(', ')}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600">Age Bracket:</span>
                <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                  {vacancy.qualifications.minAge} - {vacancy.qualifications.maxAge} Years
                  {isAgeMet ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600" />
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-600">Province Eligibility:</span>
                <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                  {vacancy.province}
                  {isProvMet ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600" />
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* AI Matcher Recommendation Section */}
          <div className="bg-blue-50/60 p-5 rounded-2xl border border-blue-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-xl text-blue-700 border border-blue-200">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Gemini AI Career Match Score</h4>
                  <p className="text-[11px] text-slate-500">Analyze candidate fit against official criteria</p>
                </div>
              </div>

              {!matchResult && (
                <button
                  onClick={handleComputeMatch}
                  disabled={loadingMatch}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-xs"
                >
                  {loadingMatch ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Matching...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Run AI Match</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {matchResult && (
              <div className="mt-3 space-y-3 pt-3 border-t border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-700 font-semibold">Match Compatibility:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-slate-200 h-2.5 rounded-full overflow-hidden border border-slate-300">
                      <div
                        className={`h-full transition-all duration-500 ${
                          matchResult.matchScore >= 80
                            ? 'bg-emerald-500'
                            : matchResult.matchScore >= 50
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${matchResult.matchScore}%` }}
                      />
                    </div>
                    <span className="text-sm font-black text-slate-900 font-mono">{matchResult.matchScore}%</span>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs text-slate-800">
                  <p className="font-medium leading-relaxed italic text-blue-900">
                    "{matchResult.aiRecommendationRationale}"
                  </p>
                </div>

                {matchResult.strengths.length > 0 && (
                  <div className="text-xs">
                    <span className="text-emerald-700 font-bold block mb-1">Key Advantages:</span>
                    <ul className="list-disc list-inside text-slate-700 space-y-0.5">
                      {matchResult.strengths.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Syllabus Breakdown */}
          {vacancy.syllabusPoints.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-600" /> Examination Syllabus Structure
              </h3>

              <div className="space-y-1.5">
                {vacancy.syllabusPoints.map((pt, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-800">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 font-mono font-bold flex items-center justify-center text-[10px] flex-shrink-0">
                      {i + 1}
                    </span>
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onBookmark(vacancy)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold border flex items-center gap-2 transition ${
                isBookmarked
                  ? 'bg-amber-50 text-amber-700 border-amber-300'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
              <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
            </button>

            <button
              onClick={() => {
                const icsContent = [
                  'BEGIN:VCALENDAR',
                  'VERSION:2.0',
                  'PRODID:-//SarkariSajha//Vacancy Deadline//EN',
                  'BEGIN:VEVENT',
                  `SUMMARY:Application Deadline: ${vacancy.title} (${vacancy.shortOrg})`,
                  `DESCRIPTION:Apply for ${vacancy.title}. Notice No: ${vacancy.noticeNumber}. URL: ${vacancy.applyUrl}`,
                  `DTSTART:${vacancy.deadline.replace(/-/g, '')}T090000Z`,
                  `DTEND:${vacancy.deadline.replace(/-/g, '')}T180000Z`,
                  'STATUS:CONFIRMED',
                  'END:VEVENT',
                  'END:VCALENDAR'
                ].join('\r\n');

                const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `SarkariSajha_Deadline_${vacancy.noticeNumber || vacancy.id}.ics`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              title="Add deadline to Apple/Google/Outlook Calendar"
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 flex items-center gap-1.5 transition"
            >
              <CalendarPlus className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">Add to Calendar</span>
            </button>

            <button
              onClick={() => setShowReportModal(true)}
              title="Report an inaccuracy or broken link in this vacancy notice"
              className="p-2.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 flex items-center gap-1.5 transition"
            >
              <FileWarning className="w-4 h-4 text-rose-600" />
              <span className="hidden sm:inline">Report Issue</span>
            </button>
          </div>

          <a
            href={vacancy.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-xs"
          >
            <span>Proceed to Official Portal ({vacancy.shortOrg})</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Vacancy Verification Report Modal */}
      <VacancyReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        lang={lang}
        vacancy={vacancy}
        userEmail={userProfile.email}
        userId={userProfile.id}
      />
    </div>
  );
};
