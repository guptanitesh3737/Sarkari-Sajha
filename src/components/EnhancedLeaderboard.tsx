import React, { useEffect, useMemo, useState } from 'react';
import { QuizAttempt, QuizSet, Language, UserProfile } from '../types';
import { TINT_HEX } from '../utils/tints';
import { num, L, H1 } from '../utils/ui';

interface EnhancedLeaderboardProps {
  lang: Language;
  userProfile: UserProfile;
  quizSets: QuizSet[];
}

type Range = 'week' | 'all' | 'province';

interface Row {
  name: string;
  city: string;
  score: number;
  acc: number;
}

const initialOf = (name: string) => (name.trim().charAt(0) || '?').toUpperCase();

export function EnhancedLeaderboard({ lang, userProfile }: EnhancedLeaderboardProps) {
  const tr = L(lang);
  const [range, setRange] = useState<Range>('all');
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const province = range === 'province' ? userProfile.province || 'all' : 'all';
    fetch(`/api/quizzes/enhanced-leaderboard?setId=all&province=${encodeURIComponent(province)}`)
      .then((r) => r.json())
      .then((data) => setAttempts(Array.isArray(data) ? data : []))
      .catch(() => setAttempts([]))
      .finally(() => setLoading(false));
  }, [range, userProfile.province]);

  // One row per candidate: best score in the selected range.
  const rows: Row[] = useMemo(() => {
    const cutoff = Date.now() - 7 * 864e5;
    const best = new Map<string, Row>();
    attempts
      .filter((a) => range !== 'week' || new Date(a.attemptedAt).getTime() >= cutoff)
      .forEach((a: any) => {
        const name = a.userName || tr('Candidate', 'उम्मेदवार');
        const row: Row = {
          name,
          city: a.district || a.city || a.province || '',
          score: Number(a.score) || 0,
          acc: Math.round(a.percentage ?? a.accuracy ?? 0)
        };
        const prev = best.get(name);
        if (!prev || row.score > prev.score) best.set(name, row);
      });
    return [...best.values()].sort((a, b) => b.score - a.score || b.acc - a.acc);
  }, [attempts, range, lang]);

  const meIndex = rows.findIndex((r) => r.name === userProfile.name);
  const top3 = rows.slice(0, 3);
  // Podium order 2-1-3 with heights 100/140/80.
  const podium = [
    { r: top3[1], rank: 2, h: 100, av: 56 },
    { r: top3[0], rank: 1, h: 140, av: 68 },
    { r: top3[2], rank: 3, h: 80, av: 56 }
  ].filter((p) => p.r);
  const table = rows.slice(3, 10);
  const pts = (n: number) => `${num(Number.isInteger(n) ? n : n.toFixed(1), lang)} ${tr('pts', 'अंक')}`;

  const tabs: [Range, string][] = [
    ['week', tr('This week', 'यो हप्ता')],
    ['all', tr('All time', 'सबै समय')],
    ['province', tr('Province', 'प्रदेश')]
  ];

  const RowView = ({ r, rank, me }: { r: Row; rank: number; me?: boolean }) => (
    <div className="flex items-center gap-3.5 px-5 py-[13px] border-t border-[#eef2f6]" style={{ background: me ? '#e4f2fc' : undefined }}>
      <span className="w-10 font-semibold text-ink-soft">#{num(rank, lang)}</span>
      <span
        className="w-[34px] h-[34px] rounded-full flex-none flex items-center justify-center font-semibold text-[13px]"
        style={{ background: me ? '#0b1220' : TINT_HEX[rank % TINT_HEX.length], color: me ? '#fff' : '#0b1220' }}
      >
        {initialOf(r.name)}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block font-semibold text-sm text-ink truncate">
          {r.name}
          {me && <span className="font-normal text-ink-soft"> · {tr('You', 'तपाईं')}</span>}
        </span>
        {r.city && <span className="block text-xs text-[#667085] truncate">{r.city}</span>}
      </span>
      <span className="text-[13px] text-ink-soft w-[60px] text-right">{num(r.acc, lang)}%</span>
      <span className="font-semibold text-sm w-[70px] text-right text-ink">{pts(r.score)}</span>
    </div>
  );

  return (
    <div className="flex flex-col gap-5 pt-7 pb-6">
      <div className="flex flex-wrap justify-between items-end gap-3.5">
        <h1 className={H1.replace('lg:text-[56px]', 'lg:text-[48px]')}>{tr('Merit ranks', 'योग्यताक्रम')}</h1>
        <div className="flex gap-1 p-1 bg-white rounded-full shadow-[0_1px_2px_rgb(11_18_32/0.05)]" role="tablist">
          {tabs.map(([id, label]) => (
            <button
              key={id}
              role="tab"
              aria-selected={range === id}
              onClick={() => setRange(id)}
              className={`h-9 px-3.5 rounded-full text-[13px] transition ${range === id ? 'bg-ink text-white' : 'text-ink-soft hover:text-ink'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-[24px] h-64 animate-pulse shadow-soft" />
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-[24px] shadow-soft py-14 px-6 text-center">
          <h2 className="font-display text-2xl font-semibold text-ink">{tr('No scores yet', 'अहिलेसम्म कुनै अंक छैन')}</h2>
          <p className="mt-2 text-sm text-ink-soft">{tr('Finish a mock paper to appear on the board.', 'बोर्डमा देखिन एउटा नमुना परीक्षा पूरा गर्नुहोस्।')}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-[1fr_1.15fr_1fr] gap-3 items-end max-w-[720px] w-full mx-auto">
            {podium.map(({ r, rank, h, av }) => (
              <div key={rank} className="flex flex-col items-center gap-2 text-center min-w-0">
                <span
                  className="rounded-full flex items-center justify-center font-display font-semibold text-xl text-ink shadow-[0_0_0_4px_#fff]"
                  style={{ width: av, height: av, background: TINT_HEX[(rank + 3) % TINT_HEX.length] }}
                >
                  {initialOf(r!.name)}
                </span>
                <div className="font-semibold text-[13.5px] leading-tight text-ink truncate max-w-full">{r!.name}</div>
                <div className="text-xs text-[#667085]">{pts(r!.score)}</div>
                <div
                  className="w-full rounded-t-[20px] rounded-b-[6px] flex items-start justify-center pt-3 font-display text-[28px] font-semibold"
                  style={{ height: h, background: rank === 1 ? '#0b1220' : '#fff', color: rank === 1 ? '#fff' : '#0b1220' }}
                >
                  {num(rank, lang)}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-[24px] overflow-hidden shadow-soft [&>div:first-child]:border-t-0">
            {table.map((r, i) => (
              <RowView key={r.name} r={r} rank={i + 4} me={r.name === userProfile.name} />
            ))}
            {meIndex >= 10 && <RowView r={rows[meIndex]} rank={meIndex + 1} me />}
            {meIndex === -1 && (
              <div className="flex items-center justify-between gap-3 px-5 py-[13px] border-t border-[#eef2f6] bg-[#e4f2fc] text-sm text-ink-soft">
                {tr('You are not on this board yet — take a mock to get ranked.', 'तपाईं अझै बोर्डमा हुनुहुन्न — स्थान पाउन नमुना परीक्षा दिनुहोस्।')}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
