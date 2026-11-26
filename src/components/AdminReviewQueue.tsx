import React, { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { ExtractedVacancyDocument, Language } from '../types';
import { num, L } from '../utils/ui';

interface AdminReviewQueueProps {
  lang: Language;
  publishedCount: number;
  onOpenExtractor?: () => void;
  onPublished?: () => void;
}

type FieldKey = 'organization' | 'position' | 'level' | 'posts' | 'fee' | 'deadline' | 'qualification' | 'age';

const LOW = 75;

const isPending = (d: ExtractedVacancyDocument) => d.status === 'PENDING_REVIEW' || d.status === 'DRAFT';

/** Flatten the fields the reviewer checks into display strings with confidence. */
const fieldsOf = (d: ExtractedVacancyDocument): Record<FieldKey, { value: string; conf: number }> => {
  const c = (x?: { confidenceScore?: number }) => Math.round(x?.confidenceScore ?? 0);
  const age = d.age?.value;
  const fee = d.fee?.value;
  return {
    organization: { value: d.organization?.value || '', conf: c(d.organization) },
    position: { value: d.position?.value || '', conf: c(d.position) },
    level: { value: d.level?.value || '', conf: c(d.level) },
    posts: { value: d.numberOfPosts?.value != null ? String(d.numberOfPosts.value) : '', conf: c(d.numberOfPosts) },
    fee: { value: fee ? `Rs ${fee.singleFee}` : '', conf: c(d.fee) },
    deadline: { value: d.deadline?.value || '', conf: c(d.deadline) },
    qualification: { value: d.qualification?.value || '', conf: c(d.qualification) },
    age: { value: age ? `${age.minAge}–${age.maxAgeMale}` : '', conf: c(d.age) }
  };
};

const overallConf = (d: ExtractedVacancyDocument) =>
  Math.round(d.validationReport?.overallScore ?? Object.values(fieldsOf(d)).reduce((s, f) => s + f.conf, 0) / 8);

export const AdminReviewQueue: React.FC<AdminReviewQueueProps> = ({ lang, publishedCount, onOpenExtractor, onPublished }) => {
  const tr = L(lang);
  const [docs, setDocs] = useState<ExtractedVacancyDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'overview' | 'split'>('overview');
  const [sel, setSel] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [edits, setEdits] = useState<Partial<Record<FieldKey, string>>>({});

  const load = () => {
    setLoading(true);
    fetch('/api/admin/extracted-vacancies')
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data) => {
        const list: ExtractedVacancyDocument[] = Array.isArray(data) ? data : data?.documents || [];
        setDocs(list);
      })
      .catch(() => setError(tr('Could not load the review queue.', 'जाँच सूची लोड हुन सकेन।')))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const pending = docs.filter(isPending);
  const selected = docs.find((d) => d.id === sel) || (view === 'split' ? pending[0] || docs[0] : undefined);
  useEffect(() => setEdits({}), [selected?.id]);

  const labels: Record<FieldKey, string> = {
    organization: tr('Organization', 'निकाय'),
    position: tr('Position', 'पद'),
    level: tr('Level', 'तह'),
    posts: tr('Posts', 'पद संख्या'),
    fee: tr('Fee', 'दस्तुर'),
    deadline: tr('Deadline', 'अन्तिम मिति'),
    qualification: tr('Qualification', 'योग्यता'),
    age: tr('Age limit', 'उमेर हद')
  };

  const statusChip = (d: ExtractedVacancyDocument) =>
    d.status === 'PUBLISHED' || d.status === 'APPROVED'
      ? { text: tr('Published', 'प्रकाशित'), bg: '#ecfdf5', fg: '#047857', dot: '#059669' }
      : d.status === 'REJECTED'
        ? { text: tr('Rejected', 'अस्वीकृत'), bg: '#fff1f2', fg: '#be123c', dot: '#f43f5e' }
        : { text: tr('Needs review', 'जाँच बाँकी'), bg: '#fef3c7', fg: '#92400e', dot: '#f59e0b' };

  const nextPendingAfter = (id: string) => {
    const idx = docs.findIndex((d) => d.id === id);
    return docs.find((d, i) => i > idx && isPending(d) && d.id !== id) || docs.find((d) => isPending(d) && d.id !== id);
  };

  // Write edited fields back onto the document before publishing.
  const applyEdits = (d: ExtractedVacancyDocument) => {
    const patch: any = {};
    const set = (k: keyof ExtractedVacancyDocument, value: any) => (patch[k] = { ...(d as any)[k], value, confidenceScore: 100 });
    if (edits.organization !== undefined) set('organization', edits.organization);
    if (edits.position !== undefined) set('position', edits.position);
    if (edits.level !== undefined) set('level', edits.level);
    if (edits.qualification !== undefined) set('qualification', edits.qualification);
    if (edits.deadline !== undefined) set('deadline', edits.deadline);
    if (edits.posts !== undefined && !Number.isNaN(Number(edits.posts))) set('numberOfPosts', Number(edits.posts));
    return patch;
  };

  const act = async (d: ExtractedVacancyDocument, action: 'publish' | 'reject') => {
    setBusy(true);
    setError(null);
    try {
      const patch = applyEdits(d);
      if (Object.keys(patch).length || action === 'reject') {
        const r = await fetch(`/api/admin/extracted-vacancies/${d.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action === 'reject' ? { ...patch, status: 'REJECTED' } : patch)
        });
        if (!r.ok) throw new Error(String(r.status));
      }
      if (action === 'publish') {
        const r = await fetch(`/api/admin/extracted-vacancies/${d.id}/publish`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ verified_by: 'Editorial review' })
        });
        if (!r.ok) throw new Error(String(r.status));
        onPublished?.();
      }
      setDocs((list) => list.map((x) => (x.id === d.id ? { ...x, status: action === 'publish' ? 'PUBLISHED' : 'REJECTED' } : x)));
      const nxt = nextPendingAfter(d.id);
      setSel(view === 'split' ? nxt?.id || d.id : null);
    } catch {
      setError(tr('That action failed. Check you are signed in as an admin and try again.', 'कार्य असफल भयो। प्रशासकको रूपमा लगइन छ कि जाँच्नुहोस्।'));
    } finally {
      setBusy(false);
    }
  };

  const avgConf = docs.length ? Math.round(docs.reduce((s, d) => s + overallConf(d), 0) / docs.length) : 0;
  const kpis = [
    [tr('Published notices', 'प्रकाशित सूचना'), num(publishedCount, lang), tr('Live on the site', 'साइटमा प्रकाशित'), '#047857'],
    [tr('Pending review', 'जाँच बाँकी'), num(pending.length, lang), tr(`${docs.length} extracted in total`, `जम्मा ${num(docs.length, lang)} निकालिएको`), '#b45309'],
    [tr('AI extraction accuracy', 'एआई शुद्धता'), `${num(avgConf, lang)}%`, tr('Average validation score', 'औसत प्रमाणीकरण अंक'), '#475467'],
    [tr('Low-confidence fields', 'कम विश्वसनीय विवरण'), num(pending.reduce((s, d) => s + Object.values(fieldsOf(d)).filter((f) => f.conf < LOW).length, 0), lang), tr('Across pending notices', 'बाँकी सूचनाहरूमा'), '#475467']
  ];

  const FieldGrid = ({ d, editable }: { d: ExtractedVacancyDocument; editable: boolean }) => {
    const f = fieldsOf(d);
    return (
      <>
        {(Object.keys(labels) as FieldKey[]).map((k) => {
          const low = f[k].conf < LOW;
          const readonly = !editable || k === 'fee' || k === 'age';
          return editable ? (
            <label key={k} className="flex flex-col gap-1">
              <span className="flex justify-between text-xs text-[#667085]">
                <span>{labels[k]}</span>
                <span className="font-semibold" style={{ color: low ? '#b45309' : '#047857' }}>{num(f[k].conf, lang)}%</span>
              </span>
              <input
                value={edits[k] ?? f[k].value}
                readOnly={readonly}
                onChange={(e) => setEdits((x) => ({ ...x, [k]: e.target.value }))}
                className="h-[42px] rounded-xl border-[1.5px] px-3 text-sm text-ink focus:outline-none focus:border-ink"
                style={{ borderColor: low ? '#fcd34d' : '#eef2f6', background: low ? '#fffbeb' : '#fff' }}
              />
            </label>
          ) : (
            <div key={k} className="bg-white rounded-[14px] px-3 py-2.5 border" style={{ borderColor: low ? '#fcd34d' : '#eef2f6' }}>
              <div className="flex justify-between text-[11.5px] text-[#667085]">
                <span>{labels[k]}</span>
                <span style={{ color: low ? '#b45309' : '#047857' }}>{num(f[k].conf, lang)}%</span>
              </div>
              <div className="text-[13.5px] font-semibold mt-[3px] text-ink">{f[k].value || '—'}</div>
            </div>
          );
        })}
      </>
    );
  };

  // Highlight extracted values inside the original notice text.
  const highlighted = useMemo(() => {
    if (!selected?.rawDocumentText) return null;
    const text = selected.rawDocumentText;
    const f = fieldsOf(selected);
    const marks: { start: number; end: number; low: boolean }[] = [];
    (Object.keys(f) as FieldKey[]).forEach((k) => {
      const v = f[k].value.replace(/^Rs /, '').trim();
      if (v.length < 2) return;
      const i = text.toLowerCase().indexOf(v.toLowerCase());
      if (i >= 0 && !marks.some((m) => i < m.end && i + v.length > m.start)) marks.push({ start: i, end: i + v.length, low: f[k].conf < LOW });
    });
    marks.sort((a, b) => a.start - b.start);
    const out: React.ReactNode[] = [];
    let pos = 0;
    marks.forEach((m, i) => {
      if (m.start > pos) out.push(text.slice(pos, m.start));
      out.push(
        <mark key={i} className="rounded px-1 font-semibold text-ink" style={{ background: m.low ? '#fde68a' : '#cfe8fa' }}>
          {text.slice(m.start, m.end)}
        </mark>
      );
      pos = m.end;
    });
    out.push(text.slice(pos));
    return out;
  }, [selected]);

  const titleOf = (d: ExtractedVacancyDocument) => [d.organization?.value, d.position?.value].filter(Boolean).join(': ') || d.fileName || d.id;
  const shortOf = (d: ExtractedVacancyDocument) => [d.shortOrg?.value || d.organization?.value, d.position?.value].filter(Boolean).join(' · ');

  return (
    <div className="rounded-[28px] sky-canvas p-4 sm:p-6 text-ink flex flex-col gap-5">
      <div className="flex flex-wrap justify-between items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <div className="text-[13px] text-ink-soft">{tr('Admin portal', 'प्रशासक प्यानल')}</div>
          <h1 className="font-display text-[30px] sm:text-[44px] font-semibold tracking-[-0.025em] leading-[1.05]">
            {view === 'overview' ? tr('Overview', 'सारांश') : tr('Review AI-extracted notice', 'एआईले निकालेको सूचना जाँच')}
          </h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[12.5px] px-3 py-1.5 rounded-full bg-white text-ink-soft">
            {tr(`${pending.length} pending review`, `${num(pending.length, lang)} जाँच बाँकी`)}
          </span>
          <div className="flex gap-1 p-1 bg-white rounded-full" role="tablist">
            {([
              ['overview', tr('Overview', 'सारांश')],
              ['split', tr('Split review', 'विभाजित जाँच')]
            ] as const).map(([id, label]) => (
              <button
                key={id}
                role="tab"
                aria-selected={view === id}
                onClick={() => {
                  setView(id);
                  setSel(id === 'split' ? pending[0]?.id || docs[0]?.id || null : null);
                }}
                className={`h-9 px-3.5 rounded-full text-[13px] transition ${view === id ? 'bg-ink text-white' : 'text-ink-soft hover:text-ink'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="text-[13px] text-[#be123c] bg-[#fff1f2] rounded-2xl px-4 py-2.5">
          {error}
        </p>
      )}

      {loading ? (
        <div className="bg-white rounded-[24px] h-40 animate-pulse" />
      ) : view === 'overview' ? (
        <>
          <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(min(180px,100%),1fr))]">
            {kpis.map(([k, v, d, c]) => (
              <div key={k} className="bg-white rounded-[20px] px-[18px] py-4 shadow-soft">
                <div className="text-[12.5px] text-[#667085]">{k}</div>
                <div className="font-display text-[30px] font-semibold mt-1">{v}</div>
                <div className="text-xs mt-0.5" style={{ color: c }}>{d}</div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-[24px] overflow-hidden shadow-soft">
            <div className="px-5 py-4 flex justify-between items-center gap-2.5 flex-wrap">
              <h2 className="font-semibold">{tr('Review queue', 'जाँच सूची')}</h2>
              {onOpenExtractor && (
                <button onClick={onOpenExtractor} className="h-[38px] px-4 rounded-full bg-ink text-white text-[13px] hover:bg-black transition">
                  + {tr('Ingest notice', 'सूचना थप्नुहोस्')}
                </button>
              )}
            </div>
            {docs.length === 0 && <p className="px-5 pb-6 text-sm text-[#667085]">{tr('Nothing in the queue.', 'सूचीमा केही छैन।')}</p>}
            {docs.map((d) => {
              const open = sel === d.id;
              const conf = overallConf(d);
              const st = statusChip(d);
              return (
                <div key={d.id} className="border-t border-[#eef2f6]">
                  <button
                    onClick={() => setSel(open ? null : d.id)}
                    aria-expanded={open}
                    className="w-full text-left flex flex-wrap items-center gap-x-[18px] gap-y-2.5 px-5 py-3.5 transition"
                    style={{ background: open ? '#f3f9fe' : '#fff' }}
                  >
                    <div className="flex-[1_1_280px] min-w-0">
                      <div className="font-semibold text-sm leading-[1.35]">{titleOf(d)}</div>
                      <div className="text-xs text-[#667085] mt-0.5">
                        {d.category?.value || '—'} · {d.fileName || d.documentType || tr('Notice', 'सूचना')}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-[130px]">
                      <div className="flex-1 h-1.5 rounded-full bg-[#eef2f6] overflow-hidden">
                        <div className="h-full" style={{ width: `${conf}%`, background: conf >= 85 ? '#059669' : '#f59e0b' }} />
                      </div>
                      <span className="text-xs font-semibold">{num(conf, lang)}%</span>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: st.bg, color: st.fg }}>
                      {st.text}
                    </span>
                  </button>
                  {open && (
                    <div className="px-5 pt-1.5 pb-5 bg-sky-50 flex flex-col gap-3">
                      <div className="grid gap-2 [grid-template-columns:repeat(auto-fill,minmax(min(200px,100%),1fr))]">
                        <FieldGrid d={d} editable={false} />
                      </div>
                      {isPending(d) && (
                        <div className="flex gap-2 flex-wrap">
                          <button disabled={busy} onClick={() => act(d, 'publish')} className="h-[42px] px-[18px] rounded-full bg-[#059669] text-white text-sm disabled:opacity-60 inline-flex items-center gap-2">
                            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : '✓'} {tr('Approve & publish', 'स्वीकृत गरी प्रकाशित')}
                          </button>
                          <button disabled={busy} onClick={() => act(d, 'reject')} className="h-[42px] px-[18px] rounded-full border border-[#fecdd3] bg-white text-[#be123c] text-sm disabled:opacity-60">
                            {tr('Reject', 'अस्वीकार')}
                          </button>
                          <button
                            onClick={() => {
                              setView('split');
                              setSel(d.id);
                            }}
                            className="h-[42px] px-[18px] rounded-full bg-white border border-[#d0d5dd] text-sm"
                          >
                            {tr('Review against notice', 'सूचनासँग भिडाउनुहोस्')}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {docs.map((d) => {
              const active = selected?.id === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => setSel(d.id)}
                  className={`flex-none flex items-center gap-2 h-10 px-3.5 rounded-full text-[13px] transition ${active ? 'bg-ink text-white' : 'bg-white text-ink'}`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: statusChip(d).dot }} />
                  {shortOf(d) || d.id}
                </button>
              );
            })}
          </div>
          {selected ? (
            <div className="flex flex-wrap gap-4 items-stretch">
              <div className="flex-[1_1_380px] min-w-0 bg-white rounded-[24px] p-[22px] shadow-soft flex flex-col gap-3">
                <div className="flex justify-between text-[12.5px] text-[#667085] gap-2">
                  <span>{tr('Original notice', 'मूल सूचना')}</span>
                  <span className="truncate">{selected.fileName || selected.documentType}</span>
                </div>
                <div className="text-[15px] leading-[1.75] text-[#344054] bg-[#fbfcfe] border border-[#eef2f6] rounded-2xl p-4 whitespace-pre-wrap max-h-[460px] overflow-y-auto">
                  {highlighted || <span className="text-[#98a2b3]">{tr('No source text stored for this notice.', 'यस सूचनाको मूल पाठ उपलब्ध छैन।')}</span>}
                </div>
                <div className="text-xs text-[#667085]">
                  {tr('Highlighted spans were read by Gemini. Amber = low confidence, check by hand.', 'पहेँलो = कम विश्वसनीयता, आफैं जाँच्नुहोस्।')}
                </div>
              </div>
              <div className="flex-[1_1_320px] bg-white rounded-[24px] p-[22px] shadow-soft flex flex-col gap-2.5">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-semibold">{tr('Extracted fields', 'निकालिएका विवरण')}</h2>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: statusChip(selected).bg, color: statusChip(selected).fg }}>
                    {statusChip(selected).text}
                  </span>
                </div>
                <FieldGrid d={selected} editable={isPending(selected)} />
                {isPending(selected) && (
                  <div className="flex gap-2 mt-1.5 flex-wrap">
                    <button
                      disabled={busy}
                      onClick={() => act(selected, 'publish')}
                      className="flex-[1_1_160px] h-[46px] rounded-full bg-ink text-white text-[14.5px] disabled:opacity-60 inline-flex items-center justify-center gap-2"
                    >
                      {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                      {tr('Publish & next →', 'प्रकाशित र अर्को →')}
                    </button>
                    <button disabled={busy} onClick={() => act(selected, 'reject')} className="h-[46px] px-[18px] rounded-full border border-[#fecdd3] bg-white text-[#be123c] text-sm disabled:opacity-60">
                      {tr('Reject', 'अस्वीकार')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-[#667085]">{tr('Nothing to review.', 'जाँच्न केही छैन।')}</p>
          )}
        </>
      )}
    </div>
  );
};
