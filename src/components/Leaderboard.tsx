import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Crown,
  Medal,
  Clock,
  Search,
  Filter,
  User,
  Sparkles,
  ArrowUpDown,
  CheckCircle2,
  AlertCircle,
  Play
} from 'lucide-react';
import { QuizSet, QuizAttempt, Language } from '../types';
import { t } from '../utils/translations';

interface LeaderboardProps {
  quizSets: QuizSet[];
  lang: Language;
  currentUserName?: string;
  onStartQuiz?: (quizSet: QuizSet) => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  quizSets,
  lang,
  currentUserName,
  onStartQuiz
}) => {
  const [selectedSetId, setSelectedSetId] = useState<string>('all');
  const [leaderboardData, setLeaderboardData] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'score' | 'time' | 'recent'>('score');

  useEffect(() => {
    fetchLeaderboard(selectedSetId);
  }, [selectedSetId]);

  const fetchLeaderboard = async (setId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/quizzes/${setId}/leaderboard`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setLeaderboardData(data);
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter & Sort Logic
  const filteredData = leaderboardData
    .filter((item) => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        item.userName.toLowerCase().includes(query) ||
        (item.quizSetId && item.quizSetId.toLowerCase().includes(query))
      );
    })
    .sort((a, b) => {
      if (sortBy === 'score') {
        if (b.percentage !== a.percentage) return b.percentage - a.percentage;
        return a.timeTakenSeconds - b.timeTakenSeconds;
      }
      if (sortBy === 'time') {
        return a.timeTakenSeconds - b.timeTakenSeconds;
      }
      if (sortBy === 'recent') {
        return new Date(b.attemptedAt).getTime() - new Date(a.attemptedAt).getTime();
      }
      return 0;
    });

  // Calculate user's best attempt & rank
  const userAttempts = currentUserName
    ? leaderboardData.filter(
        (a) => a.userName.toLowerCase() === currentUserName.toLowerCase()
      )
    : [];

  const bestUserAttempt = userAttempts.sort(
    (a, b) => b.percentage - a.percentage || a.timeTakenSeconds - b.timeTakenSeconds
  )[0];

  const userRankIndex = bestUserAttempt
    ? leaderboardData.findIndex((a) => a.id === bestUserAttempt.id) + 1
    : null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  const getQuizTitle = (setId: string) => {
    const found = quizSets.find((q) => q.id === setId);
    if (!found) return 'Lok Sewa Quiz';
    return lang === 'np' ? found.titleNp : found.title;
  };

  const getDivisionBadge = (pct: number) => {
    if (pct >= 90) {
      return {
        label: lang === 'np' ? 'विशिष्टता (Distinction)' : 'Distinction',
        cls: 'bg-emerald-50 text-emerald-800 border-emerald-200'
      };
    }
    if (pct >= 80) {
      return {
        label: lang === 'np' ? 'प्रथम श्रेणी (1st Div)' : 'First Division',
        cls: 'bg-blue-50 text-blue-800 border-blue-200'
      };
    }
    if (pct >= 50) {
      return {
        label: lang === 'np' ? 'उत्तीर्ण (Passed)' : 'Passed',
        cls: 'bg-amber-50 text-amber-800 border-amber-200'
      };
    }
    return {
      label: lang === 'np' ? 'पुनः प्रयास (Retake)' : 'Needs Improvement',
      cls: 'bg-rose-50 text-rose-800 border-rose-200'
    };
  };

  // Top 3 Podium
  const top3 = filteredData.slice(0, 3);
  const restList = filteredData.slice(3);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 mb-2">
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
              {lang === 'np' ? 'शीर्ष प्रतिस्पर्धी नतिजा' : 'National Merit Leaderboard'}
            </span>
            <h2 className="text-2xl font-black font-sans text-slate-900">
              {lang === 'np' ? 'लोक सेवा परीक्षा शीर्ष र्याङ्किङ' : 'Lok Sewa Candidate Rankings'}
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Compare your test scores and accuracy speed against top candidates across Nepal. Practice regularly to climb up the merit rank!
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-center min-w-[110px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                {lang === 'np' ? 'कुल प्रतिस्पर्धी' : 'Total Entries'}
              </span>
              <span className="text-lg font-black text-slate-900 font-mono">
                {leaderboardData.length}
              </span>
            </div>
            {top3[0] && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-center min-w-[120px]">
                <span className="text-[10px] uppercase font-bold text-amber-600 block tracking-wider flex items-center justify-center gap-1">
                  <Crown className="w-3 h-3 text-amber-500" /> #1 Top Score
                </span>
                <span className="text-lg font-black text-amber-900 font-mono">
                  {top3[0].percentage}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Rank Spotlight Card (If candidate is logged in and attempted tests) */}
      {bestUserAttempt && userRankIndex && (
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-blue-500/10 pointer-events-none transform skew-x-12" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-2xl">
                <Crown className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  {lang === 'np' ? 'तपाईंको नतिजा स्थिति' : 'Your Ranking Standing'}
                </span>
                <h3 className="text-lg font-bold font-sans text-white mt-1">
                  {bestUserAttempt.userName}
                </h3>
                <p className="text-xs text-blue-200">
                  {getQuizTitle(bestUserAttempt.quizSetId)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
              <div className="bg-white/10 backdrop-blur-xs border border-white/15 px-3.5 py-2 rounded-xl text-center">
                <span className="text-[10px] text-blue-200 block uppercase font-mono">
                  {lang === 'np' ? 'स्थान (Rank)' : 'Merit Rank'}
                </span>
                <span className="text-xl font-black text-amber-300 font-mono">
                  #{userRankIndex} <span className="text-xs text-blue-200 font-normal">/ {leaderboardData.length}</span>
                </span>
              </div>

              <div className="bg-white/10 backdrop-blur-xs border border-white/15 px-3.5 py-2 rounded-xl text-center">
                <span className="text-[10px] text-blue-200 block uppercase font-mono">
                  {lang === 'np' ? 'प्राप्ताङ्क' : 'Best Score'}
                </span>
                <span className="text-xl font-black text-emerald-400 font-mono">
                  {bestUserAttempt.score} / {bestUserAttempt.totalQuestions} ({bestUserAttempt.percentage}%)
                </span>
              </div>

              <div className="bg-white/10 backdrop-blur-xs border border-white/15 px-3.5 py-2 rounded-xl text-center">
                <span className="text-[10px] text-blue-200 block uppercase font-mono">
                  {lang === 'np' ? 'समय' : 'Completion Time'}
                </span>
                <span className="text-sm font-bold text-slate-100 font-mono block mt-1">
                  {formatTime(bestUserAttempt.timeTakenSeconds)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Set Selector Tabs & Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-4">
        {/* Set Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-100 pb-3">
          <button
            onClick={() => setSelectedSetId('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
              selectedSetId === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {lang === 'np' ? 'सबै परीक्षा सेटहरू (All Sets)' : 'All Practice Sets'}
          </button>

          {quizSets.map((qs) => {
            const isActive = selectedSetId === qs.id;
            return (
              <button
                key={qs.id}
                onClick={() => setSelectedSetId(qs.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {lang === 'np' ? qs.titleNp : qs.title}
              </button>
            );
          })}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'np' ? 'परीक्षार्थीको नाम खोज्नुहोस्...' : 'Search candidate name...'}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3 text-slate-400" />
              {lang === 'np' ? 'क्रमबद्ध:' : 'Sort By:'}
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="score">{lang === 'np' ? 'उच्च प्राप्ताङ्क (Highest Score)' : 'Highest Score'}</option>
              <option value="time">{lang === 'np' ? 'छिटो नतिजा (Fastest Time)' : 'Fastest Time'}</option>
              <option value="recent">{lang === 'np' ? 'हालैको प्रयास (Recent)' : 'Most Recent'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="py-12 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-mono">Loading Merit Leaderboard...</p>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="py-12 px-4 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">
            {lang === 'np' ? 'कुनै नतिजा भेटिएन' : 'No Leaderboard Attempts Found'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchQuery
              ? `No candidate matching "${searchQuery}" was found for this filter.`
              : 'Be the first candidate to attempt this Lok Sewa test and secure Rank #1!'}
          </p>

          {selectedSetId !== 'all' && onStartQuiz && (
            <button
              onClick={() => {
                const found = quizSets.find((q) => q.id === selectedSetId);
                if (found) onStartQuiz(found);
              }}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition"
            >
              <Play className="w-4 h-4" />
              <span>{lang === 'np' ? 'यो परीक्षा सुरु गर्नुहोस्' : 'Attempt This Quiz Now'}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* TOP 3 PODIUM (Visible if no search query or in top results) */}
          {!searchQuery && top3.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {top3.map((item, idx) => {
                const rank = idx + 1;
                const isGold = rank === 1;
                const isSilver = rank === 2;
                const isBronze = rank === 3;

                const borderCls = isGold
                  ? 'border-amber-300 bg-amber-50/40 shadow-sm'
                  : isSilver
                  ? 'border-slate-300 bg-slate-50/50'
                  : 'border-orange-300 bg-orange-50/30';

                const badgeBg = isGold
                  ? 'bg-amber-500 text-slate-950'
                  : isSilver
                  ? 'bg-slate-400 text-white'
                  : 'bg-amber-700 text-white';

                const Icon = isGold ? Crown : Medal;

                return (
                  <div
                    key={item.id || idx}
                    className={`p-5 rounded-2xl border ${borderCls} relative flex flex-col justify-between space-y-4`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl ${badgeBg} flex items-center justify-center font-black font-mono shadow-xs text-sm`}>
                          #{rank}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 font-sans flex items-center gap-1.5">
                            {item.userName}
                            {isGold && <Crown className="w-4 h-4 text-amber-500 inline fill-amber-400" />}
                          </h4>
                          <span className="text-[11px] text-slate-500 truncate block max-w-[160px]">
                            {getQuizTitle(item.quizSetId)}
                          </span>
                        </div>
                      </div>

                      <Icon className={`w-6 h-6 ${isGold ? 'text-amber-500' : isSilver ? 'text-slate-400' : 'text-amber-700'}`} />
                    </div>

                    <div className="bg-white/80 p-3 rounded-xl border border-slate-200/60 flex items-center justify-between text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block font-sans">
                          {lang === 'np' ? 'अङ्क' : 'Score'}
                        </span>
                        <span className="font-bold text-slate-900 text-sm">
                          {item.score}/{item.totalQuestions} ({item.percentage}%)
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase block font-sans">
                          {lang === 'np' ? 'समय' : 'Time'}
                        </span>
                        <span className="font-bold text-slate-700">
                          {formatTime(item.timeTakenSeconds)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* FULL RANKINGS TABLE */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-600" />
                {lang === 'np' ? 'प्रतिस्पर्धी वरीयता सूची' : 'Complete Merit Standings'}
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                Showing {filteredData.length} entries
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4 w-16 text-center">Rank</th>
                    <th className="py-3 px-4">Candidate Name</th>
                    <th className="py-3 px-4">Quiz Paper</th>
                    <th className="py-3 px-4 text-center">Score</th>
                    <th className="py-3 px-4 text-center">Accuracy %</th>
                    <th className="py-3 px-4 text-center">Time</th>
                    <th className="py-3 px-4 text-center">Division</th>
                    <th className="py-3 px-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.map((item, index) => {
                    const rank = index + 1;
                    const isCurrentUser =
                      currentUserName &&
                      item.userName.toLowerCase() === currentUserName.toLowerCase();
                    const divInfo = getDivisionBadge(item.percentage);

                    return (
                      <tr
                        key={item.id || index}
                        className={`transition ${
                          isCurrentUser
                            ? 'bg-blue-50/70 font-semibold text-slate-900 border-l-4 border-blue-600'
                            : 'hover:bg-slate-50/80 text-slate-800'
                        }`}
                      >
                        {/* Rank Badge */}
                        <td className="py-3.5 px-4 text-center font-mono font-bold">
                          {rank === 1 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 font-black text-xs">
                              🥇 1
                            </span>
                          ) : rank === 2 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-800 border border-slate-300 font-black text-xs">
                              🥈 2
                            </span>
                          ) : rank === 3 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-orange-100 text-orange-900 border border-orange-300 font-black text-xs">
                              🥉 3
                            </span>
                          ) : (
                            <span className="text-slate-500">#{rank}</span>
                          )}
                        </td>

                        {/* Candidate Name */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                              {item.userName ? item.userName.charAt(0) : 'U'}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                                {item.userName}
                                {isCurrentUser && (
                                  <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-mono uppercase font-bold">
                                    You
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Quiz Title */}
                        <td className="py-3.5 px-4 text-slate-600 truncate max-w-[200px]">
                          {getQuizTitle(item.quizSetId)}
                        </td>

                        {/* Score */}
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900">
                          {item.score} / {item.totalQuestions}
                        </td>

                        {/* Percentage Bar */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className="font-mono font-bold text-slate-900">
                              {item.percentage}%
                            </span>
                            <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden hidden sm:block">
                              <div
                                className={`h-full rounded-full ${
                                  item.percentage >= 80
                                    ? 'bg-emerald-500'
                                    : item.percentage >= 50
                                    ? 'bg-blue-500'
                                    : 'bg-amber-500'
                                }`}
                                style={{ width: `${item.percentage}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Time Taken */}
                        <td className="py-3.5 px-4 text-center font-mono text-slate-600">
                          {formatTime(item.timeTakenSeconds)}
                        </td>

                        {/* Division Badge */}
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${divInfo.cls}`}
                          >
                            {divInfo.label}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-4 text-right text-slate-400 font-mono text-[11px]">
                          {item.attemptedAt ? item.attemptedAt.split(' ')[0] : 'Today'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
