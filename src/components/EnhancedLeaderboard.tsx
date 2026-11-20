import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Medal,
  Award,
  Filter,
  MapPin,
  Clock,
  CheckCircle2,
  TrendingUp,
  Flame,
  User,
  Sparkles,
  Search
} from 'lucide-react';
import { QuizAttempt, QuizSet, Province, Language, UserProfile } from '../types';

interface EnhancedLeaderboardProps {
  lang: Language;
  userProfile: UserProfile;
  quizSets: QuizSet[];
}

export function EnhancedLeaderboard({ lang, userProfile, quizSets }: EnhancedLeaderboardProps) {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>('all');
  const [selectedSetId, setSelectedSetId] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);

  const provinces: { id: string; nameEn: string; nameNp: string }[] = [
    { id: 'all', nameEn: 'All Nepal (राष्ट्रिय स्तर)', nameNp: 'सबै प्रदेश' },
    { id: 'Bagmati', nameEn: 'Bagmati Province', nameNp: 'बागमती प्रदेश' },
    { id: 'Koshi', nameEn: 'Koshi Province', nameNp: 'कोशी प्रदेश' },
    { id: 'Madhesh', nameEn: 'Madhesh Province', nameNp: 'मधेश प्रदेश' },
    { id: 'Gandaki', nameEn: 'Gandaki Province', nameNp: 'गण्डकी प्रदेश' },
    { id: 'Lumbini', nameEn: 'Lumbini Province', nameNp: 'लुम्बिनी प्रदेश' },
    { id: 'Karnali', nameEn: 'Karnali Province', nameNp: 'कर्णाली प्रदेश' },
    { id: 'Sudurpashchim', nameEn: 'Sudurpashchim Province', nameNp: 'सुदूरपश्चिम प्रदेश' }
  ];

  useEffect(() => {
    setLoading(true);
    const url = `/api/quizzes/enhanced-leaderboard?setId=${selectedSetId}&province=${selectedProvince}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAttempts(data);
      })
      .catch(err => console.error('Error fetching leaderboard:', err))
      .finally(() => setLoading(false));
  }, [selectedProvince, selectedSetId]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-yellow-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-amber-200 border border-white/10">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'np' ? 'प्रदेश तथा पदअनुसार राष्ट्रिय स्तरको वरीयता' : 'Statewide & Post-wise National Leaderboard'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {lang === 'np' ? 'मोक टेस्ट र्याङ्क एवं लिडरबोर्ड' : 'Mock Test Rank & Merit Leaderboard'}
            </h1>
            <p className="text-xs sm:text-sm text-amber-200/80">
              {lang === 'np'
                ? 'नेपालभरका हजारौँ परीक्षार्थीहरूका बीच आफ्नो स्थान, कुल प्राप्ताङ्क, नेगेटिभ मार्किङ र समय व्यवस्थापन तुलना गर्नुहोस्।'
                : 'Real-time percentile tracking, province-wise rankings, negative marking penalties, and top scorer leaderboards for all Lok Sewa mock tests.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-5 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-center">
              <span className="text-[10px] text-amber-300 uppercase font-mono block">Your Current Province</span>
              <span className="text-xs font-bold text-white">{userProfile.province || 'Bagmati Province'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Province Filter */}
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-amber-500" />
          <select
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-1.5 border border-slate-200 dark:border-slate-700 focus:outline-none"
          >
            {provinces.map(p => (
              <option key={p.id} value={p.id}>
                {lang === 'np' ? p.nameNp : p.nameEn}
              </option>
            ))}
          </select>
        </div>

        {/* Quiz Set Selector */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedSetId}
            onChange={(e) => setSelectedSetId(e.target.value)}
            className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-1.5 border border-slate-200 dark:border-slate-700 focus:outline-none"
          >
            <option value="all">{lang === 'np' ? 'सबै मोक टेस्टहरू' : 'All Mock Test Sets'}</option>
            {quizSets.map(qs => (
              <option key={qs.id} value={qs.id}>
                {lang === 'np' ? qs.titleNp : qs.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Leaderboard Table / Cards */}
      {loading ? (
        <div className="text-center py-16 space-y-3">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Compiling statewide rankings...</p>
        </div>
      ) : attempts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 p-8">
          <Trophy className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No attempts recorded for this filter yet</h3>
          <p className="text-xs text-slate-500">Be the first candidate to take this mock drill!</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>{lang === 'np' ? 'शीर्ष स्थान प्राप्त परीक्षार्थीहरू' : 'Top Ranking Candidates'}</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Total Attempts: {attempts.length}
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {attempts.map((attempt, index) => {
              const rank = index + 1;
              const isTop3 = rank <= 3;
              const rankColors =
                rank === 1
                  ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300'
                  : rank === 2
                  ? 'bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300'
                  : rank === 3
                  ? 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400'
                  : 'bg-slate-50 text-slate-600 dark:bg-slate-800/40 dark:text-slate-400';

              const matchedSet = quizSets.find(qs => qs.id === attempt.quizSetId);

              return (
                <div
                  key={attempt.id}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
                    rank === 1 ? 'bg-amber-50/30 dark:bg-amber-950/10' : ''
                  }`}
                >
                  {/* Rank & User Info */}
                  <div className="flex items-center gap-4">
                    <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 border ${rankColors}`}>
                      {rank === 1 ? <Trophy className="w-4 h-4 text-amber-600" /> : rank === 2 ? <Medal className="w-4 h-4 text-slate-600" /> : rank === 3 ? <Award className="w-4 h-4 text-amber-700" /> : `#${rank}`}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {attempt.userName}
                        </h4>
                        {isTop3 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200">
                            Merit Rank #{rank}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span>{matchedSet ? (lang === 'np' ? matchedSet.titleNp : matchedSet.title) : 'General Lok Sewa Mock Drill'}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {Math.floor(attempt.timeTakenSeconds / 60)}m {attempt.timeTakenSeconds % 60}s
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Score & Accuracy Badges */}
                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    <div className="text-right">
                      <div className="text-sm font-black text-slate-900 dark:text-slate-100">
                        {attempt.score} <span className="text-xs font-normal text-slate-400">/ {attempt.totalQuestions}</span>
                      </div>
                      <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {attempt.percentage}% Accuracy
                      </div>
                    </div>

                    <div className="w-16 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden shrink-0">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{ width: `${attempt.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
