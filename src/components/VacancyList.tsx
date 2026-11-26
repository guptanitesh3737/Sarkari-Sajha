import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  MapPin,
  Clock,
  AlertCircle,
  Mic,
  MicOff,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  Check,
  Bookmark,
  GraduationCap,
  ArrowUpRight,
  Landmark,
  School,
  Banknote,
  Shield,
  HeartPulse,
  Map as MapIcon,
  Building2,
  Factory,
  Cpu,
  ShieldCheck
} from 'lucide-react';
import {
  Vacancy,
  Language,
  UserProfile,
  Province,
  VacancyCategory,
  QualificationLevel,
  VacancySortOption,
  VacancyDeadlineFilter,
  VacancyStatus,
  PaginatedVacancyResponse
} from '../types';
import { t } from '../utils/translations';
import { tintBand } from '../utils/tints';
import { num, L, daysLeft, urgency, fmtDate, matchScore, CARD, BTN_PRIMARY, H1, H2 } from '../utils/ui';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { setPageSEO, setWebSiteSearchSchema } from '../utils/seo';

interface VacancyListProps {
  vacancies: Vacancy[];
  userProfile: UserProfile;
  lang: Language;
  onSelectVacancy: (vacancy: Vacancy) => void;
  onBookmark: (vacancy: Vacancy) => void;
  bookmarkedIds: string[];
}

const PROVINCES: (Province | 'All Nepal')[] = [
  'All Nepal',
  'Koshi',
  'Madhesh',
  'Bagmati',
  'Gandaki',
  'Lumbini',
  'Karnali',
  'Sudurpashchim'
];

const QUALIFICATIONS: (QualificationLevel | 'All')[] = [
  'All',
  'SEE/SLC',
  '+2 High School',
  'Bachelor Degree',
  'Master Degree',
  'MPhil/PhD'
];

const SUBJECT_OPTIONS = [
  { id: 'All', labelEn: 'All Subjects', labelNp: 'सबै विषय' },
  { id: 'Administration', labelEn: 'General Administration & Public Affairs', labelNp: 'प्रशासन तथा सार्वजनिक मामिला' },
  { id: 'Computer', labelEn: 'Computer Science & Information Tech (IT)', labelNp: 'कम्प्युटर तथा सूचना प्रविधि' },
  { id: 'Engineering', labelEn: 'Civil & Technical Engineering', labelNp: 'इन्जिनियरिङ तथा प्राविधिक' },
  { id: 'Statistics', labelEn: 'Statistics, Math & Economics', labelNp: 'तथ्याङ्क, गणित तथा अर्थशास्त्र' },
  { id: 'Health', labelEn: 'Health, Nursing & Medicine', labelNp: 'स्वास्थ्य, नर्सिङ तथा चिकित्सा' },
  { id: 'Agriculture', labelEn: 'Agriculture, Forestry & Environment', labelNp: 'कृषि, वन तथा वातावरण' },
  { id: 'Banking', labelEn: 'Banking, Commerce & Accountancy', labelNp: 'बैंकिङ, वाणिज्य तथा लेखा' },
  { id: 'Law', labelEn: 'Law, Justice & Constitutional Affairs', labelNp: 'कानुन, न्याय तथा संविधान' },
  { id: 'Education', labelEn: 'Education & Pedagogy', labelNp: 'शिक्षा तथा अध्यापन' }
];

const JOB_LEVEL_OPTIONS = [
  { id: 'All', labelEn: 'All Levels', labelNp: 'सबै तह/श्रेणी' },
  { id: 'Officer', labelEn: 'Officer Level (Gazetted Class III / Level 7-8)', labelNp: 'अधिकृत स्तर (रा.प. तृतीय / तह ७-८)' },
  { id: 'Non-Gazetted', labelEn: 'Assistant / NaSu Level (Level 4-5)', labelNp: 'सहायक / नासु स्तर (रा.प.अनं. प्रथम / तह ५)' },
  { id: 'Khari', labelEn: 'Kharidar / Assistant Level 4', labelNp: 'खरिदार / सहायक स्तर ४' },
  { id: 'Technical', labelEn: 'Technical & Engineering Cadre', labelNp: 'प्राविधिक तथा इन्जिनियरिङ' },
  { id: 'Uniformed', labelEn: 'Security & Uniformed Forces (ASI/Inspector)', labelNp: 'सुरक्षा तथा प्रहरी निरीक्षक/असई' }
];

// Vacancy types shown as "Browse by type" tiles on the home page.
const VACANCY_TYPES: { id: VacancyCategory; en: string; np: string; icon: React.ElementType }[] = [
  { id: 'Lok Sewa (PSC)', en: 'Lok Sewa', np: 'लोक सेवा', icon: Landmark },
  { id: 'Teacher Service (TSC)', en: 'Teaching', np: 'शिक्षक सेवा', icon: School },
  { id: 'Banking & Finance', en: 'Banking', np: 'बैंकिङ', icon: Banknote },
  { id: 'Security Forces', en: 'Security forces', np: 'सुरक्षा निकाय', icon: Shield },
  { id: 'Health Services', en: 'Health', np: 'स्वास्थ्य', icon: HeartPulse },
  { id: 'Provincial Lok Sewa', en: 'Provincial', np: 'प्रदेश लोक सेवा', icon: MapIcon },
  { id: 'Local Level (Nagarpalika)', en: 'Local level', np: 'स्थानीय तह', icon: Building2 },
  { id: 'Public Corporation', en: 'Corporations', np: 'संस्थान', icon: Factory },
  { id: 'IT & Engineering', en: 'IT & Engineering', np: 'आईटी तथा इन्जिनियरिङ', icon: Cpu }
];

const POPULAR_PRESETS: {
  label: string;
  search?: string;
  category?: string;
  deadline?: VacancyDeadlineFilter;
  province?: string;
  qualification?: string;
}[] = [
  { label: 'Statistical Assistant', search: 'Statistical Assistant' },
  { label: 'Computer / IT Officer', search: 'Computer' },
  { label: 'Closing This Week', deadline: 'week' as VacancyDeadlineFilter },
  { label: 'Bagmati Province', province: 'Bagmati' },
  { label: '+2 High School', qualification: '+2 High School' }
];

export const VacancyList: React.FC<VacancyListProps> = ({
  vacancies: initialVacancies,
  userProfile,
  lang,
  onSelectVacancy,
  onBookmark,
  bookmarkedIds
}) => {
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedProvince, setSelectedProvince] = useState<string>('All Nepal');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [selectedOrg, setSelectedOrg] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedQualification, setSelectedQualification] = useState<string>('All');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedJobLevel, setSelectedJobLevel] = useState<string>('All');
  const [selectedDeadline, setSelectedDeadline] = useState<VacancyDeadlineFilter>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<VacancySortOption>('deadline_soonest');

  // Pagination State
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(12);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(initialVacancies.length);

  // Data & Loading State
  const [items, setItems] = useState<Vacancy[]>(initialVacancies);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState<boolean>(false);

  // Dynamic Facets from Server
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const [availableOrgs, setAvailableOrgs] = useState<string[]>([]);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Voice Search setup
  const { isListening, toggleListening, transcript } = useSpeechToText({
    lang: lang === 'np' ? 'ne-NP' : 'en-US',
    onTranscript: (t) => setSearchTerm(t)
  });

  useEffect(() => {
    if (transcript) {
      setSearchTerm(transcript);
    }
  }, [transcript]);

  // Keyboard shortcut "/" to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current && !['input', 'textarea', 'select'].includes((document.activeElement?.tagName || '').toLowerCase())) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounce search input (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 280);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Set Search SEO schema on mount
  useEffect(() => {
    setWebSiteSearchSchema();
    setPageSEO({
      title: debouncedSearch
        ? `Search: "${debouncedSearch}" – Government Vacancies | SarkariSajha`
        : 'Official Nepal Government Vacancies 2026 – SarkariSajha',
      description: 'Search official Nepal Lok Sewa, TSC, banking, and public service vacancy notices. Filter by qualification, subject, province, and application deadline.'
    });
  }, [debouncedSearch]);

  // Fetch paginated & filtered data from API
  const fetchVacancies = async () => {
    setLoading(true);
    setFetchError(null);

    const queryParams = new URLSearchParams();
    if (debouncedSearch.trim()) queryParams.set('search', debouncedSearch.trim());
    if (selectedProvince !== 'All' && selectedProvince !== 'All Nepal') queryParams.set('province', selectedProvince);
    if (selectedDistrict !== 'All' && selectedDistrict.trim()) queryParams.set('district', selectedDistrict);
    if (selectedOrg !== 'All' && selectedOrg.trim()) queryParams.set('organization', selectedOrg);
    if (selectedCategory !== 'All') queryParams.set('category', selectedCategory);
    if (selectedQualification !== 'All') queryParams.set('qualification', selectedQualification);
    if (selectedSubject !== 'All') queryParams.set('subject', selectedSubject);
    if (selectedJobLevel !== 'All') queryParams.set('job_level', selectedJobLevel);
    if (selectedDeadline !== 'all') queryParams.set('deadline', selectedDeadline);
    if (selectedStatus !== 'all' && selectedStatus !== 'All') queryParams.set('status', selectedStatus);
    queryParams.set('sortBy', sortBy);
    queryParams.set('page', page.toString());
    queryParams.set('limit', limit.toString());

    try {
      const res = await fetch(`/api/vacancies?${queryParams.toString()}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch vacancies (Status ${res.status})`);
      }
      const data: PaginatedVacancyResponse | Vacancy[] = await res.json();

      if (Array.isArray(data)) {
        setItems(data);
        setTotalCount(data.length);
        setTotalPages(Math.ceil(data.length / limit) || 1);
      } else if (data && Array.isArray(data.data)) {
        setItems(data.data);
        setTotalCount(data.total);
        setTotalPages(data.totalPages || 1);
        if (data.facets?.districts) setAvailableDistricts(data.facets.districts);
        if (data.facets?.organizations) setAvailableOrgs(data.facets.organizations);
      }
    } catch (err: any) {
      console.warn('API fetch error, falling back to local dataset:', err);
      setFetchError(err?.message || 'Network error fetching live notices.');
      // Local fallback filter
      let local = [...initialVacancies];
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        local = local.filter(v =>
          v.title.toLowerCase().includes(q) ||
          (v.titleNp && v.titleNp.includes(q)) ||
          v.organization.toLowerCase().includes(q) ||
          v.position.toLowerCase().includes(q) ||
          (v.district && v.district.toLowerCase().includes(q))
        );
      }
      if (selectedProvince !== 'All Nepal' && selectedProvince !== 'All') {
        local = local.filter(v => v.province === selectedProvince || v.province === 'All Nepal');
      }
      setItems(local.slice((page - 1) * limit, page * limit));
      setTotalCount(local.length);
      setTotalPages(Math.ceil(local.length / limit) || 1);
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch when any search, filter, sort, or pagination param changes
  useEffect(() => {
    fetchVacancies();
  }, [
    debouncedSearch,
    selectedProvince,
    selectedDistrict,
    selectedOrg,
    selectedCategory,
    selectedQualification,
    selectedSubject,
    selectedJobLevel,
    selectedDeadline,
    selectedStatus,
    sortBy,
    page,
    limit
  ]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedProvince !== 'All Nepal' && selectedProvince !== 'All') count++;
    if (selectedDistrict !== 'All') count++;
    if (selectedOrg !== 'All') count++;
    if (selectedCategory !== 'All') count++;
    if (selectedQualification !== 'All') count++;
    if (selectedSubject !== 'All') count++;
    if (selectedJobLevel !== 'All') count++;
    if (selectedDeadline !== 'all') count++;
    if (selectedStatus !== 'all' && selectedStatus !== 'All') count++;
    return count;
  }, [
    selectedProvince,
    selectedDistrict,
    selectedOrg,
    selectedCategory,
    selectedQualification,
    selectedSubject,
    selectedJobLevel,
    selectedDeadline,
    selectedStatus
  ]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setSelectedProvince('All Nepal');
    setSelectedDistrict('All');
    setSelectedOrg('All');
    setSelectedCategory('All');
    setSelectedQualification('All');
    setSelectedSubject('All');
    setSelectedJobLevel('All');
    setSelectedDeadline('all');
    setSelectedStatus('all');
    setSortBy('deadline_soonest');
    setPage(1);
  };

  // Calculate quick candidate eligibility
  const checkQuickEligibility = (v: Vacancy) => {
    const isQualMet =
      v.qualifications.minLevel === userProfile.qualificationLevel ||
      userProfile.qualificationLevel === 'Master Degree' ||
      userProfile.qualificationLevel === 'MPhil/PhD' ||
      (userProfile.qualificationLevel === 'Bachelor Degree' && v.qualifications.minLevel !== 'Master Degree' && v.qualifications.minLevel !== 'MPhil/PhD');
    const isProvMet = v.province === 'All Nepal' || v.province === userProfile.province;
    const isAgeMet = userProfile.age >= v.qualifications.minAge && userProfile.age <= v.qualifications.maxAge;

    return isQualMet && isProvMet && isAgeMet;
  };

  const np = lang === 'np';

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    initialVacancies.forEach((v) => {
      counts[v.category] = (counts[v.category] || 0) + 1;
    });
    return counts;
  }, [initialVacancies]);

  const listTopRef = useRef<HTMLDivElement>(null);
  const pickType = (id: string) => {
    setSelectedCategory((cur) => (cur === id ? 'All' : id));
    setPage(1);
    requestAnimationFrame(() => listTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const selectClass =
    'w-full h-11 px-4 rounded-full bg-sky-50 border border-[#e4e7ec] text-sm text-ink focus:outline-none focus:ring-2 focus:ring-sky-300';
  const labelClass = 'block text-xs text-[#667085] mb-1.5 pl-1';

  const SORTS = [
    { id: 'newest', labelEn: 'Newest', labelNp: 'नयाँ' },
    { id: 'deadline_soonest', labelEn: 'Closing soon', labelNp: 'छिटो म्याद' },
    { id: 'most_viewed', labelEn: 'Popular', labelNp: 'लोकप्रिय' },
    { id: 'most_saved', labelEn: 'Most saved', labelNp: 'धेरै सुरक्षित' }
  ];

  const tr = L(lang);
  const chipCats = ['All', ...VACANCY_TYPES.map((t) => t.id).filter((id) => (typeCounts[id] || 0) > 0)];

  return (
    <div className="flex flex-col gap-6 pt-8 pb-6">
      {/* HERO */}
      <section className="flex flex-col gap-3.5 pt-3">
        <h1 className={H1}>
          {tr('Every verified', 'हरेक प्रमाणित')} <span className="marker">{tr('sarkari vacancy', 'सरकारी विज्ञापन')}</span>
        </h1>
        <p className="m-0 max-w-[38rem] text-[15px] leading-relaxed text-ink-soft">
          {tr(
            'Lok Sewa, Shikshak Sewa, provincial PSCs, banks and security forces — checked against the official gazette before it reaches you.',
            'लोक सेवा, शिक्षक सेवा, प्रदेश लोक सेवा, बैंक र सुरक्षा निकाय — आधिकारिक राजपत्रसँग भिडाएर मात्र।'
          )}
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setDebouncedSearch(searchTerm);
            setPage(1);
          }}
          className="flex items-center gap-2 max-w-[640px] h-14 pl-5 pr-1.5 rounded-full bg-white shadow-soft focus-within:ring-2 focus-within:ring-sky-300"
        >
          <Search className="w-[18px] h-[18px] text-[#667085] shrink-0" strokeWidth={2} />
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label={tr('Search vacancies', 'विज्ञापन खोज्नुहोस्')}
            placeholder={tr('Search positions, notice no, or organization...', 'पद, विज्ञापन नम्बर वा निकाय खोज्नुहोस्...')}
            className="flex-1 min-w-0 bg-transparent text-[15px] text-ink placeholder:text-[#98a2b3] focus:outline-none"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                searchInputRef.current?.focus();
              }}
              className="w-9 h-9 shrink-0 inline-flex items-center justify-center rounded-full text-[#98a2b3] hover:text-ink hover:bg-sky-50 transition"
              aria-label={tr('Clear search', 'खोज हटाउनुहोस्')}
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={toggleListening}
            aria-label={tr('Voice search', 'बोलेर खोज्नुहोस्')}
            className={`hidden sm:inline-flex w-10 h-10 shrink-0 items-center justify-center rounded-full transition ${
              isListening ? 'bg-rose-500 text-white' : 'text-[#667085] hover:text-ink hover:bg-sky-50'
            }`}
          >
            {isListening ? <MicOff className="w-[18px] h-[18px]" /> : <Mic className="w-[18px] h-[18px]" />}
          </button>
          <button type="submit" className="h-11 px-5 shrink-0 rounded-full bg-ink text-white text-sm font-medium shadow-pill hover:bg-black transition">
            {tr('Search', 'खोज्नुहोस्')}
          </button>
        </form>
        {isListening && <p className="text-xs text-rose-600">{tr('Listening… say a position or office name', 'सुन्दैछ… पद वा कार्यालयको नाम भन्नुहोस्')}</p>}

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto py-1 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0" role="tablist" aria-label={tr('Vacancy type', 'विज्ञापनको प्रकार')}>
          {chipCats.map((c) => {
            const active = selectedCategory === c;
            const type = VACANCY_TYPES.find((t) => t.id === c);
            const label = c === 'All' ? tr('All', 'सबै') : np ? type?.np : c;
            const count = c === 'All' ? initialVacancies.length : typeCounts[c] || 0;
            return (
              <button
                key={c}
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setSelectedCategory(c);
                  setPage(1);
                }}
                className={`flex-none h-[38px] px-4 rounded-full text-[13.5px] whitespace-nowrap shadow-[0_1px_2px_rgb(11_18_32/0.05)] transition ${
                  active ? 'bg-ink text-white' : 'bg-white text-ink hover:bg-sky-50'
                }`}
              >
                {label} <span className="opacity-55 ml-1">{num(count, lang)}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* SECTION HEADING */}
      <div ref={listTopRef} className="scroll-mt-28 flex items-baseline justify-between gap-3 flex-wrap">
        <h2 className={H2}>
          {tr('Open notices', 'खुला विज्ञापनहरू')} <span className="text-[#667085] font-medium">{num(totalCount, lang)}</span>
        </h2>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-[13px] text-ink-soft">
            {sortBy === 'deadline_soonest' ? tr('Sorted by closing date', 'अन्तिम मितिअनुसार') : SORTS.find((s) => s.id === sortBy)?.[np ? 'labelNp' : 'labelEn']}
          </span>
          <button
            onClick={() => setIsAdvancedFiltersOpen(!isAdvancedFiltersOpen)}
            aria-expanded={isAdvancedFiltersOpen}
            className="h-9 px-3.5 inline-flex items-center gap-1.5 rounded-full bg-white border border-[#d0d5dd] text-[13px] text-ink hover:bg-sky-50 transition"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {tr('Filters', 'फिल्टर')}
            {activeFiltersCount > 0 && (
              <span className="min-w-5 h-5 px-1 rounded-full bg-ink text-white text-[11px] inline-flex items-center justify-center">{num(activeFiltersCount, lang)}</span>
            )}
          </button>
        </div>
      </div>

      {/* FILTER PANEL */}
      {isAdvancedFiltersOpen && (
        <section className={`${CARD} p-5 sm:p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold text-ink">{tr('Filters', 'फिल्टरहरू')}</h3>
            <div className="flex items-center gap-2">
              {activeFiltersCount > 0 && (
                <button onClick={handleResetFilters} className="px-3 h-9 rounded-full text-[13px] text-ink-soft hover:text-ink transition">
                  {tr('Clear all', 'सबै हटाउनुहोस्')}
                </button>
              )}
              <button onClick={() => setIsAdvancedFiltersOpen(false)} className="w-9 h-9 inline-flex items-center justify-center rounded-full bg-sky-50 text-ink" aria-label={tr('Close filters', 'फिल्टर बन्द')}>
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className={labelClass}>{tr('Sort by', 'क्रम')}</label>
              <select value={sortBy} onChange={(e) => { setSortBy(e.target.value as VacancySortOption); setPage(1); }} className={selectClass}>
                {SORTS.map((o) => (
                  <option key={o.id} value={o.id}>{np ? o.labelNp : o.labelEn}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>{tr('Province', 'प्रदेश')}</label>
              <select value={selectedProvince} onChange={(e) => { setSelectedProvince(e.target.value); setPage(1); }} className={selectClass}>
                {PROVINCES.map((prov) => (
                  <option key={prov} value={prov}>{prov}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>{tr('District', 'जिल्ला')}</label>
              <select value={selectedDistrict} onChange={(e) => { setSelectedDistrict(e.target.value); setPage(1); }} className={selectClass}>
                <option value="All">{tr('All districts', 'सबै जिल्ला')}</option>
                {['Kathmandu', 'Pokhara', 'Biratnagar', 'Lalitpur', 'Chitwan', 'Butwal', 'Janakpur', ...availableDistricts]
                  .filter((d, i, a) => a.indexOf(d) === i)
                  .map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>{tr('Qualification', 'न्यूनतम योग्यता')}</label>
              <select value={selectedQualification} onChange={(e) => { setSelectedQualification(e.target.value); setPage(1); }} className={selectClass}>
                {QUALIFICATIONS.map((q) => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>{tr('Subject', 'विषय')}</label>
              <select value={selectedSubject} onChange={(e) => { setSelectedSubject(e.target.value); setPage(1); }} className={selectClass}>
                {SUBJECT_OPTIONS.map((sub) => (
                  <option key={sub.id} value={sub.id}>{np ? sub.labelNp : sub.labelEn}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>{tr('Job level', 'तह / श्रेणी')}</label>
              <select value={selectedJobLevel} onChange={(e) => { setSelectedJobLevel(e.target.value); setPage(1); }} className={selectClass}>
                {JOB_LEVEL_OPTIONS.map((lvl) => (
                  <option key={lvl.id} value={lvl.id}>{np ? lvl.labelNp : lvl.labelEn}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>{tr('Deadline', 'म्याद')}</label>
              <select value={selectedDeadline} onChange={(e) => { setSelectedDeadline(e.target.value as VacancyDeadlineFilter); setPage(1); }} className={selectClass}>
                <option value="all">{tr('Any deadline', 'सबै म्याद')}</option>
                <option value="active">{tr('Still open', 'म्याद बाँकी')}</option>
                <option value="week">{tr('Closing in 7 days', '७ दिनभित्र')}</option>
                <option value="month">{tr('Closing in 30 days', '३० दिनभित्र')}</option>
                <option value="expired">{tr('Expired', 'म्याद समाप्त')}</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>{tr('Organization', 'निकाय')}</label>
              <select value={selectedOrg} onChange={(e) => { setSelectedOrg(e.target.value); setPage(1); }} className={selectClass}>
                <option value="All">{tr('All organizations', 'सबै निकाय')}</option>
                {['PSC', 'TSC', 'NRB', 'Nepal Bank', 'Nepal Police', 'Statistics', 'MoALD', 'Koshi', 'Madhesh', ...availableOrgs]
                  .filter((d, i, a) => a.indexOf(d) === i)
                  .map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
              </select>
            </div>
          </div>
        </section>
      )}

      {/* ERROR */}
      {fetchError && (
        <div className={`${CARD} px-5 py-4 flex items-center justify-between gap-3 text-sm`}>
          <span className="flex items-center gap-2 text-ink-soft">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            {tr('Couldn’t load live notices. Showing saved data.', 'प्रत्यक्ष सूचना लोड हुन सकेन।')}
          </span>
          <button onClick={fetchVacancies} className="px-4 h-9 rounded-full bg-ink text-white text-sm shrink-0">
            {tr('Retry', 'पुनः प्रयास')}
          </button>
        </div>
      )}

      {/* GRID */}
      {loading ? (
        <div className="grid gap-[18px] [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`${CARD} overflow-hidden animate-pulse`}>
              <div className="h-[58px] bg-sky-50" />
              <div className="p-[18px] space-y-3">
                <div className="h-5 bg-sky-50 rounded-full w-4/5" />
                <div className="h-4 bg-sky-50 rounded-full w-2/5" />
                <div className="grid grid-cols-3 gap-2"><div className="h-14 bg-sky-50 rounded-[14px]" /><div className="h-14 bg-sky-50 rounded-[14px]" /><div className="h-14 bg-sky-50 rounded-[14px]" /></div>
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className={`${CARD} py-16 px-6 text-center`}>
          <div className="w-14 h-14 mx-auto rounded-full bg-sky-100 flex items-center justify-center">
            <Search className="w-6 h-6 text-ink" />
          </div>
          <h3 className="mt-5 font-display text-2xl font-semibold text-ink">{tr('No vacancies found', 'कुनै विज्ञापन भेटिएन')}</h3>
          <p className="mt-2 text-sm text-ink-soft max-w-sm mx-auto">{tr('Try different words or clear your filters.', 'फरक शब्द प्रयोग गर्नुहोस् वा फिल्टर हटाउनुहोस्।')}</p>
          <button onClick={handleResetFilters} className={`mt-6 ${BTN_PRIMARY}`}>
            {tr('Clear filters', 'फिल्टर हटाउनुहोस्')}
          </button>
        </div>
      ) : (
        <div className="grid gap-[18px] [grid-template-columns:repeat(auto-fill,minmax(min(300px,100%),1fr))]">
          {items.map((vacancy) => {
            const isBookmarked = bookmarkedIds.includes(vacancy.id);
            const posts = vacancy.number_of_posts || vacancy.posts || 1;
            const fee = vacancy.application_fee ?? vacancy.fee ?? 0;
            const deadline = vacancy.application_deadline || vacancy.deadline;
            const dl = daysLeft(deadline);
            const u = urgency(dl);
            const closed = dl < 0 || vacancy.status === 'expired';
            const match = matchScore(vacancy, userProfile).score;
            const type = VACANCY_TYPES.find((t) => t.id === vacancy.category);
            const catLabel = np ? type?.np || vacancy.category : vacancy.category;
            const due = closed
              ? tr('Closed', 'बन्द')
              : !Number.isFinite(dl)
                ? tr('Ongoing', 'चालु')
                : dl <= 10
                  ? tr(`${dl} days left`, `${num(dl, lang)} दिन बाँकी`)
                  : tr(`${dl} days`, `${num(dl, lang)} दिन`);

            return (
              <article
                key={vacancy.id}
                onClick={() => onSelectVacancy(vacancy)}
                className={`${CARD} group cursor-pointer overflow-hidden flex flex-col transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgb(11_18_32/0.04),0_20px_40px_-16px_rgb(11_18_32/0.2)]`}
              >
                <div className="pt-4 px-[18px] pb-[30px] flex items-center justify-between gap-2" style={tintBand(vacancy.category || '')}>
                  <span className="text-xs font-semibold text-ink bg-white/75 px-2.5 py-[5px] rounded-full truncate">{catLabel}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className="text-xs font-semibold px-2.5 py-[5px] rounded-full"
                      style={closed ? { background: '#eef2f6', color: '#667085' } : { background: u.bg, color: u.fg }}
                    >
                      {due}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onBookmark(vacancy);
                      }}
                      aria-label={tr('Save vacancy', 'सुरक्षित गर्नुहोस्')}
                      aria-pressed={isBookmarked}
                      className={`w-7 h-7 inline-flex items-center justify-center rounded-full transition ${isBookmarked ? 'bg-ink text-white' : 'bg-white/75 text-ink hover:bg-white'}`}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>

                <div className="px-[18px] pb-[18px] -mt-3.5 flex flex-col gap-2.5 flex-1">
                  <h3 className="font-display text-[18px] font-semibold leading-[1.25] tracking-[-0.01em] text-ink [text-wrap:pretty] line-clamp-2">
                    {np && vacancy.titleNp ? vacancy.titleNp : vacancy.title}
                  </h3>
                  <p className="text-[13px] text-ink-soft flex items-center gap-1.5 min-w-0">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-[#059669]" aria-label={tr('Verified', 'प्रमाणित')} />
                    <span className="truncate">{vacancy.shortOrg || vacancy.organization || vacancy.org}</span>
                  </p>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {[
                      [tr('Posts', 'पद'), num(posts, lang)],
                      [tr('Fee', 'दस्तुर'), `${tr('Rs ', 'रु ')}${num(fee.toLocaleString(), lang)}`],
                      [tr('Closes', 'अन्तिम मिति'), num(fmtDate(deadline), lang)]
                    ].map(([k, val]) => (
                      <div key={k} className="bg-sky-50 rounded-[14px] p-2.5 min-w-0">
                        <div className="text-[11px] text-[#667085]">{k}</div>
                        <div className="font-semibold text-[15px] mt-0.5 text-ink truncate">{val}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-auto pt-2">
                    <div className="flex items-center gap-2 text-[12.5px] text-ink-soft">
                      <div className="w-14 h-1.5 rounded-full bg-sky-100 overflow-hidden">
                        <div className="h-full transition-[width] duration-300" style={{ width: `${match}%`, background: match >= 80 ? '#059669' : '#5ea9e2' }} />
                      </div>
                      {tr(`${match}% match`, `${num(match, lang)}% मिलान`)}
                    </div>
                    <span className="text-[13.5px] font-medium text-ink inline-flex items-center gap-1 group-hover:gap-1.5 transition-all">
                      {tr('Details', 'विवरण')} →
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-ink-soft">
            {num((page - 1) * limit + 1, lang)}–{num(Math.min(page * limit, totalCount), lang)} {tr('of', 'मध्ये')} {num(totalCount, lang)}
          </p>
          <div className="flex items-center gap-1 p-1 rounded-full bg-white shadow-soft">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="w-10 h-10 inline-flex items-center justify-center rounded-full text-ink hover:bg-sky-50 disabled:opacity-30 disabled:pointer-events-none"
              aria-label={tr('Previous page', 'अघिल्लो पृष्ठ')}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, idx) => idx + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .map((p, idx, arr) => {
                const prevP = arr[idx - 1];
                return (
                  <React.Fragment key={p}>
                    {prevP && p - prevP > 1 && <span className="px-1 text-[#98a2b3] text-sm">…</span>}
                    <button
                      onClick={() => setPage(p)}
                      aria-current={page === p ? 'page' : undefined}
                      className={`w-10 h-10 rounded-full text-sm transition ${page === p ? 'bg-ink text-white' : 'text-ink hover:bg-sky-50'}`}
                    >
                      {num(p, lang)}
                    </button>
                  </React.Fragment>
                );
              })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="w-10 h-10 inline-flex items-center justify-center rounded-full text-ink hover:bg-sky-50 disabled:opacity-30 disabled:pointer-events-none"
              aria-label={tr('Next page', 'अर्को पृष्ठ')}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            aria-label={tr('Results per page', 'प्रति पृष्ठ')}
            className="h-9 px-3 rounded-full bg-white border border-[#e4e7ec] text-sm text-ink-soft focus:outline-none"
          >
            {[6, 12, 24].map((size) => (
              <option key={size} value={size}>
                {num(size, lang)} {tr('per page', 'प्रति पृष्ठ')}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};
