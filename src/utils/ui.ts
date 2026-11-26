// Shared helpers for the redesigned screens (design handoff tokens).
import type { Language } from '../types';

const NP_DIGITS = '०१२३४५६७८९';

/** Render digits as Devanagari numerals in Nepali mode. */
export const num = (v: string | number, lang: Language) =>
  lang === 'np' ? String(v).replace(/[0-9]/g, (d) => NP_DIGITS[Number(d)]) : String(v);

/** Pick EN or NP copy. */
export const L = (lang: Language) => (en: string, np: string) => (lang === 'np' ? np : en);

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const fmtDate = (d?: string) => {
  if (!d) return '—';
  const x = new Date(d);
  if (Number.isNaN(x.getTime())) return d;
  return `${x.getDate()} ${MON[x.getMonth()]}`;
};

/** Whole days from today until the date (negative when past). */
export const daysLeft = (d?: string) => {
  if (!d) return Infinity;
  const target = new Date(d);
  if (Number.isNaN(target.getTime())) return Infinity;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 864e5);
};

/** Urgency colours: rose ≤10 days, amber ≤18 days, sky otherwise. */
export const urgency = (days: number) => {
  if (days <= 10) return { bg: '#ffe4e6', fg: '#be123c', dot: '#f43f5e' };
  if (days <= 18) return { bg: '#fef3c7', fg: '#b45309', dot: '#f59e0b' };
  return { bg: '#e4f2fc', fg: '#0b1220', dot: '#5ea9e2' };
};

export const CARD = 'bg-white rounded-[24px] shadow-soft';
export const BTN_PRIMARY =
  'inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full bg-ink text-white text-sm font-medium shadow-pill hover:bg-black transition disabled:opacity-50';
export const BTN_SECONDARY =
  'inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full bg-white text-ink text-sm font-medium border border-[#d0d5dd] hover:bg-sky-50 transition';
export const H1 = 'font-display font-semibold tracking-[-0.025em] leading-[1.05] text-ink text-[34px] sm:text-[48px] lg:text-[56px] [text-wrap:balance]';
export const H2 = 'font-display font-semibold tracking-[-0.02em] text-ink text-[22px]';
export const MUTED = 'text-[#667085]';

const QUAL_ORDER = ['SEE/SLC', '+2 High School', 'Bachelor Degree', 'Master Degree', 'MPhil/PhD'];

export interface MatchInput {
  qualificationLevel?: string;
  age?: number;
  province?: string;
  fieldOfStudy?: string;
}

/**
 * Match score used across the feed, detail and matcher:
 * 20 base, +35 qualification, +20 age, +10 province, +14 field;
 * capped at 34 when qualification or age fails.
 */
export const matchScore = (
  v: { qualifications?: { minLevel?: string; minAge?: number; maxAge?: number; fields?: string[] }; qualification?: string; province?: string; required_field?: string },
  p: MatchInput
) => {
  const minLevel = v.qualifications?.minLevel || v.qualification || 'SEE/SLC';
  const qualOk = QUAL_ORDER.indexOf(p.qualificationLevel || '') >= QUAL_ORDER.indexOf(minLevel);
  const minAge = v.qualifications?.minAge ?? 18;
  const maxAge = v.qualifications?.maxAge ?? 40;
  const ageOk = typeof p.age !== 'number' || (p.age >= minAge && p.age <= maxAge);
  const provOk = !v.province || v.province === 'All Nepal' || v.province === p.province;
  const fields = [...(v.qualifications?.fields || []), v.required_field || ''].join(' ').toLowerCase();
  const field = (p.fieldOfStudy || '').toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 3);
  const fieldOk = !fields.trim() || /any|all|general/.test(fields) || field.some((w) => fields.includes(w));
  let score = 20 + (qualOk ? 35 : 0) + (ageOk ? 20 : 0) + (provOk ? 10 : 0) + (fieldOk ? 14 : 0);
  if (!qualOk || !ageOk) score = Math.min(score, 34);
  return { score: Math.min(99, score), qualOk, ageOk, provOk, fieldOk };
};
