import React, { useState } from 'react';
import {
  Sparkles,
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  MapPin,
  Building2,
  Users,
  Award,
  ArrowRight,
  RefreshCw,
  Zap,
  BarChart2,
  TrendingUp,
  Coins
} from 'lucide-react';
import { UserProfile, Vacancy, Language, MatchResult } from '../types';
import { t } from '../utils/translations';

interface AiJobMatcherProps {
  userProfile: UserProfile;
  vacancies: Vacancy[];
  lang: Language;
  onUpdateProfile: (updatedProfile: UserProfile) => void;
  onSelectVacancy: (vacancy: Vacancy) => void;
}

// Helper function to estimate monthly salary (NPR) based on government/banking pay grade
const getEstimatedSalary = (vac: Vacancy) => {
  const lvl = vac.level.toLowerCase();
  const cat = vac.category.toLowerCase();

  if (lvl.includes('officer') || lvl.includes('level 7') || lvl.includes('gazetted class iii')) {
    return { min: 48000, avg: 53000, max: 62000, scaleLabel: 'Gazetted Level 7' };
  } else if (lvl.includes('secondary') || lvl.includes('class 9-12')) {
    return { min: 43000, avg: 47000, max: 53000, scaleLabel: 'Secondary Teacher' };
  } else if (lvl.includes('level 5') || lvl.includes('sub-engineer') || lvl.includes('non-gazetted class i')) {
    return { min: 36000, avg: 40000, max: 45000, scaleLabel: 'Non-Gazetted Level 5' };
  } else if (cat.includes('banking')) {
    return { min: 34000, avg: 41000, max: 48000, scaleLabel: 'Banking Grade 3/4' };
  } else if (cat.includes('security')) {
    return { min: 35000, avg: 43000, max: 55000, scaleLabel: 'Police Inspector/ASI' };
  }
  return { min: 30000, avg: 36000, max: 42000, scaleLabel: 'Standard Assistant' };
};

export const AiJobMatcher: React.FC<AiJobMatcherProps> = ({
  userProfile,
  vacancies,
  lang,
  onUpdateProfile,
  onSelectVacancy
}) => {
  const [resumeText, setResumeText] = useState(userProfile.resumeText || '');
  const [parsing, setParsing] = useState(false);
  const [parseMessage, setParseMessage] = useState<string | null>(null);

  const [matchingAll, setMatchingAll] = useState(false);
  const [matchResults, setMatchResults] = useState<Record<string, MatchResult>>({});

  const handleParseResume = async () => {
    if (!resumeText || resumeText.trim().length < 15) {
      alert('Please enter or paste at least 15 characters of candidate CV / qualification text.');
      return;
    }

    try {
      setParsing(true);
      setParseMessage(null);

      const res = await fetch('/api/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText })
      });

      const data = await res.json();
      if (data.success && data.profile) {
        onUpdateProfile(data.profile);
        setParseMessage(data.parsedSummary || 'CV parsed successfully! Candidate qualifications updated.');
      } else {
        alert(data.error || 'Failed to parse resume.');
      }
    } catch (err) {
      console.error('Resume parse error:', err);
      alert('Error communicating with Gemini AI server.');
    } finally {
      setParsing(false);
    }
  };

  const handleRunBatchMatch = async () => {
    try {
      setMatchingAll(true);
      const results: Record<string, MatchResult> = {};

      for (const vac of vacancies) {
        try {
          const res = await fetch('/api/match', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vacancyId: vac.id })
          });
          const m = await res.json();
          results[vac.id] = m;
        } catch (e) {
          console.error(e);
        }
      }

      setMatchResults(results);
    } finally {
      setMatchingAll(false);
    }
  };

  // Sort vacancies by computed match score if available
  const sortedVacancies = [...vacancies].sort((a, b) => {
    const scoreA = matchResults[a.id]?.matchScore || 0;
    const scoreB = matchResults[b.id]?.matchScore || 0;
    return scoreB - scoreA;
  });

  // Prepare salary distribution chart data
  const salaryChartData = sortedVacancies.map((vac) => {
    const salary = getEstimatedSalary(vac);
    const match = matchResults[vac.id];
    const matchScore = match ? match.matchScore : 0;

    let shortTitle = vac.shortOrg || vac.title;
    if (vac.title.toLowerCase().includes('section officer')) shortTitle = 'Section Officer';
    else if (vac.title.toLowerCase().includes('computer officer') || vac.title.toLowerCase().includes('it specialist')) shortTitle = 'IT Officer';
    else if (vac.title.toLowerCase().includes('junior assistant')) shortTitle = 'Junior Asst';
    else if (vac.title.toLowerCase().includes('secondary level teacher')) shortTitle = 'Sec Teacher';
    else if (vac.title.toLowerCase().includes('assistant sub-inspector')) shortTitle = 'ASI & Inspector';
    else if (vac.title.toLowerCase().includes('sub-engineer')) shortTitle = 'Sub-Engineer';

    return {
      id: vac.id,
      title: shortTitle,
      fullTitle: vac.title,
      category: vac.category,
      minSalary: salary.min,
      avgSalary: salary.avg,
      maxSalary: salary.max,
      posts: vac.posts,
      matchScore: matchScore,
      scaleLabel: salary.scaleLabel,
      vacancyObj: vac
    };
  });

  // Overall stats for salary summary
  const maxSalaryValue = Math.max(...salaryChartData.map((d) => d.avgSalary), 0);
  const avgSalaryValue = salaryChartData.length
    ? Math.round(salaryChartData.reduce((acc, curr) => acc + curr.avgSalary, 0) / salaryChartData.length)
    : 0;

  // Selected bar for hover/click tooltip
  const [hoveredBarId, setHoveredBarId] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-white text-slate-900 p-6 rounded-2xl shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Gemini AI Job Matching Engine
            </span>
            <h2 className="text-2xl font-black font-sans text-slate-900">
              {lang === 'np' ? 'एआई योग्यता मिलान तथा सीभी विश्लेषण' : 'Resume Parser & AI Qualification Matcher'}
            </h2>
            <p className="text-xs text-slate-500 max-w-xl">
              Paste your CV, degree transcripts, or qualification bio. Gemini AI will analyze your eligibility, age, and subject stream against all active Lok Sewa, Banking, and Government openings in Nepal!
            </p>
          </div>

          <button
            onClick={handleRunBatchMatch}
            disabled={matchingAll}
            className="px-5 py-3 font-bold text-xs rounded-full shadow-xs transition flex items-center justify-center gap-2 whitespace-nowrap bg-ink hover:bg-black text-white dark:bg-white dark:text-ink"
          >
            {matchingAll ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Computing AI Scores...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-300" />
                <span>Compute AI Fit for All Jobs</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Interactive Salary Distribution Chart */}
      <div id="salary-distribution-chart" className="bg-white rounded-2xl p-6 space-y-4 shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <BarChart2 className="w-5 h-5 text-emerald-600" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 font-sans uppercase tracking-wide">
                  {lang === 'np' ? 'सिफारिस पदहरूको अनुमानित तलब वितरण' : 'Recommended Jobs Salary Distribution'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                  NPR / Month
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Estimated monthly base compensation based on Government & Banking pay scales in Nepal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono font-bold">
            <div className="bg-sky-50/70 px-3 py-1.5 rounded-xl">
              <span className="text-slate-500 block text-[10px] font-sans font-normal">Highest Scale</span>
              <span className="text-emerald-700 font-extrabold">रू {maxSalaryValue.toLocaleString()}/mo</span>
            </div>
            <div className="bg-sky-50/70 px-3 py-1.5 rounded-xl">
              <span className="text-slate-500 block text-[10px] font-sans font-normal">Average Scale</span>
              <span className="text-blue-700 font-extrabold">रू {avgSalaryValue.toLocaleString()}/mo</span>
            </div>
          </div>
        </div>

        {/* Visual Bar Chart Grid */}
        <div className="pt-4 pb-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 items-end h-56 border-b border-slate-200 pb-2">
            {salaryChartData.map((item) => {
              const maxScale = 70000;
              const heightPercent = Math.min(100, Math.max(20, Math.round((item.avgSalary / maxScale) * 100)));
              const isHovered = hoveredBarId === item.id;
              
              let barColor = 'bg-blue-500 hover:bg-blue-600';
              let badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
              if (item.matchScore >= 80) {
                barColor = 'bg-emerald-500 hover:bg-emerald-600';
                badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
              } else if (item.matchScore >= 50) {
                barColor = 'bg-amber-500 hover:bg-amber-600';
                badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
              }

              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setHoveredBarId(item.id)}
                  onMouseLeave={() => setHoveredBarId(null)}
                  className="flex flex-col items-center h-full justify-end group cursor-pointer relative"
                >
                  {/* Tooltip on hover */}
                  {isHovered && (
                    <div className="absolute bottom-full mb-2 z-30 bg-slate-900 text-white text-[11px] p-3 rounded-xl shadow-xl border border-slate-700 w-48 pointer-events-none space-y-1">
                      <p className="font-bold text-amber-300 leading-tight">{item.fullTitle}</p>
                      <p className="text-slate-300 text-[10px]">{item.category} • {item.scaleLabel}</p>
                      <div className="pt-1 flex items-center justify-between border-t border-slate-800 text-emerald-400 font-mono font-bold">
                        <span>Avg Salary:</span>
                        <span>रू {item.avgSalary.toLocaleString()}</span>
                      </div>
                      <p className="text-[9px] text-slate-400">Range: रू {item.minSalary.toLocaleString()} - {item.maxSalary.toLocaleString()}</p>
                    </div>
                  )}

                  {/* Top value badge */}
                  <span className="text-[10px] font-mono font-bold text-slate-600 group-hover:text-slate-900 mb-1">
                    रू {Math.round(item.avgSalary / 1000)}k
                  </span>

                  {/* Bar */}
                  <div className="w-full bg-slate-100 rounded-t-lg overflow-hidden flex items-end h-36">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full ${barColor} transition-all duration-300 rounded-t-md flex items-center justify-center`}
                    >
                      {item.matchScore > 0 && (
                        <span className="text-[9px] font-mono font-bold text-white opacity-90 px-1">
                          {item.matchScore}%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Label */}
                  <span className="text-[10px] font-semibold text-slate-700 truncate w-full text-center mt-2 group-hover:text-blue-600">
                    {item.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend / Color Explanation */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block"></span> High AI Match (≥80%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-amber-500 inline-block"></span> Moderate Match (50-79%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-blue-500 inline-block"></span> Standard Scale
            </span>
          </div>
          <span className="text-slate-400 text-[10px] italic">
            *Excludes provident fund, festival bonus & field allowances
          </span>
        </div>
      </div>

      {/* Two Column Layout: CV Input / Active Profile + Match Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Candidate Profile & CV Parser */}
        <div className="lg:col-span-1 space-y-6">
          {/* Active Candidate Card */}
          <div className="bg-white rounded-2xl p-5 text-slate-900 space-y-4 shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" /> Active Candidate Profile
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Name:</span>
                <span className="font-bold text-slate-900">{userProfile.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Qualification:</span>
                <span className="font-bold text-blue-700">{userProfile.qualificationLevel}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Stream / Field:</span>
                <span className="font-semibold text-slate-800 truncate max-w-[150px]">
                  {userProfile.fieldOfStudy}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Province:</span>
                <span className="font-bold text-emerald-700">{userProfile.province}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Age:</span>
                <span className="font-bold text-amber-800">{userProfile.age} Years</span>
              </div>
            </div>
          </div>

          {/* CV Text Area Parser */}
          <div className="bg-white rounded-2xl p-5 text-slate-900 space-y-3 shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Upload className="w-4 h-4 text-purple-600" /> Paste CV or Qualification Text
            </h3>
            <p className="text-[11px] text-slate-500">
              Paste your bio, graduation details, citizenship age, and skills. Gemini AI will structure it automatically.
            </p>

            <textarea
              rows={6}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="e.g. Graduated in Bachelor of Computer Engineering in 2024. Age 24, resident of Kathmandu, Bagmati Province. Interested in IT and Lok Sewa positions..."
              className="w-full bg-sky-50/70 rounded-2xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-sky-300"
            />

            <button
              onClick={handleParseResume}
              disabled={parsing}
              className="w-full py-2.5 font-bold text-xs rounded-full transition flex items-center justify-center gap-2 shadow-xs bg-ink hover:bg-black text-white dark:bg-white dark:text-ink"
            >
              {parsing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Parsing with Gemini AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{t('parseResumeBtn', lang)}</span>
                </>
              )}
            </button>

            {parseMessage && (
              <div className="bg-purple-50 p-3 rounded-xl text-xs text-purple-900 flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                <p className="leading-snug font-medium">{parseMessage}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Job Match Recommendations */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 font-sans flex items-center gap-2">
              <span>Matched Vacancies</span>
              <span className="text-xs font-mono bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded font-bold">
                {vacancies.length} Total
              </span>
            </h3>

            {Object.keys(matchResults).length > 0 && (
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> AI Scores Updated
              </span>
            )}
          </div>

          <div className="space-y-4">
            {sortedVacancies.map((vacancy) => {
              const match = matchResults[vacancy.id];
              const hasComputed = !!match;

              return (
                <div
                  key={vacancy.id}
                  className="bg-white hover:border-slate-300 rounded-2xl p-5 text-slate-900 transition space-y-3 shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                          {vacancy.category}
                        </span>
                        <span className="text-slate-500 text-[11px]">{vacancy.province}</span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 font-sans">{vacancy.title}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" /> {vacancy.org}
                      </p>
                    </div>

                    {/* Score Badge */}
                    {hasComputed && (
                      <div className="bg-sky-50/70 p-2.5 rounded-xl text-center flex-shrink-0 min-w-[100px]">
                        <span className="text-[10px] text-slate-500 block font-semibold">Match Score</span>
                        <span
                          className={`text-lg font-black font-mono ${
                            match.matchScore >= 80
                              ? 'text-emerald-700'
                              : match.matchScore >= 50
                              ? 'text-amber-700'
                              : 'text-rose-700'
                          }`}
                        >
                          {match.matchScore}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* AI Recommendation Rationale */}
                  {hasComputed && (
                    <div className="bg-sky-50/70 p-3 rounded-xl text-xs space-y-1.5">
                      <p className="text-slate-700 italic">"{match.aiRecommendationRationale}"</p>
                      <div className="flex items-center gap-3 text-[11px] pt-1 border-t border-slate-200">
                        <span className={match.qualificationMatch ? 'text-emerald-700 font-semibold' : 'text-rose-700'}>
                          Qual: {match.qualificationMatch ? '✓ Met' : '✗ Unmet'}
                        </span>
                        <span className={match.provinceMatch ? 'text-emerald-700 font-semibold' : 'text-rose-700'}>
                          Province: {match.provinceMatch ? '✓ Met' : '✗ Unmet'}
                        </span>
                        <span className={match.ageMatch ? 'text-emerald-700 font-semibold' : 'text-rose-700'}>
                          Age: {match.ageMatch ? '✓ Met' : '✗ Unmet'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-500">
                      Seats: <strong className="text-slate-900">{vacancy.posts}</strong> | Deadline:{' '}
                      <strong className="text-amber-700">{vacancy.deadline}</strong>
                    </span>

                    <button
                      onClick={() => onSelectVacancy(vacancy)}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-full border border-slate-200 transition flex items-center gap-1"
                    >
                      <span>View Full Spec</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
