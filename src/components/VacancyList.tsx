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
  Cpu
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
import { tintFor } from '../utils/tints';
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
  const [sortBy, setSortBy] = useState<VacancySortOption>('newest');

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
    setSortBy('newest');
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
    'w-full h-11 px-4 rounded-full bg-slate-50 dark:bg-white/5 ring-1 ring-black/[0.06] dark:ring-white/10 text-sm text-ink dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-300';
  const labelClass = 'block text-xs text-ink-soft dark:text-slate-400 mb-1.5 pl-1';

  const SORTS = [
    { id: 'newest', labelEn: 'Newest', labelNp: 'नयाँ' },
    { id: 'deadline_soonest', labelEn: 'Closing soon', labelNp: 'छिटो म्याद' },
    { id: 'most_viewed', labelEn: 'Popular', labelNp: 'लोकप्रिय' },
    { id: 'most_saved', labelEn: 'Most saved', labelNp: 'धेरै सुरक्षित' }
  ];

  return (
    <div>
      {/* HERO */}
      <section className="pt-10 sm:pt-16 pb-12 sm:pb-16 text-center">
        <span className="inline-flex items-center gap-2 pl-2 pr-3.5 py-1.5 rounded-full bg-white/70 dark:bg-white/5 ring-1 ring-black/[0.04] dark:ring-white/10 text-xs text-ink-soft dark:text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          {totalCount} {np ? 'सक्रिय विज्ञापन · दैनिक अपडेट' : 'live notices · updated daily'}
        </span>

        <h1 className="mt-6 font-display font-semibold text-ink dark:text-white text-[2.4rem] leading-[1.05] sm:text-6xl sm:leading-[1.02] tracking-tight">
          {np ? (
            <>
              सरकारी जागिर खोज्नुहोस्।
              <br />
              तयारी गर्नुहोस्, सफल हुनुहोस्।
            </>
          ) : (
            <>
              Find your government job.
              <br />
              Prepare smarter. Get selected.
            </>
          )}
        </h1>

        <p className="mt-5 max-w-xl mx-auto text-[15px] sm:text-base text-ink-soft dark:text-slate-400 leading-relaxed">
          {np
            ? 'लोक सेवा, शिक्षक सेवा, बैंक र प्रदेशका प्रमाणित विज्ञापनहरू, पाठ्यक्रम र अभ्यास क्विजसहित एकै ठाउँमा।'
            : 'Verified vacancies from Lok Sewa, TSC, banks and provinces, with syllabus, practice quizzes and eligibility in one place.'}
        </p>

        {/* Search pill */}
        <div className="mt-9 max-w-2xl mx-auto">
          <div className="flex items-center gap-2 h-14 sm:h-16 pl-5 pr-2 rounded-full bg-white dark:bg-slate-900 shadow-soft ring-1 ring-black/[0.04] dark:ring-white/10 focus-within:ring-2 focus-within:ring-sky-300">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label={np ? 'विज्ञापन खोज्नुहोस्' : 'Search vacancies'}
              placeholder={np ? 'पद, कार्यालय वा जिल्ला खोज्नुहोस्…' : 'Search position, office or district…'}
              className="flex-1 min-w-0 bg-transparent text-[15px] text-ink dark:text-white placeholder:text-slate-400 focus:outline-none"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  searchInputRef.current?.focus();
                }}
                className="w-9 h-9 inline-flex items-center justify-center rounded-full text-slate-400 hover:text-ink hover:bg-slate-100 dark:hover:bg-white/10 transition"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={toggleListening}
              title={np ? 'बोलेर खोज्नुहोस्' : 'Voice search'}
              className={`w-10 h-10 inline-flex items-center justify-center rounded-full transition ${
                isListening ? 'bg-rose-500 text-white' : 'text-slate-500 hover:text-ink hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
            >
              {isListening ? <MicOff className="w-[18px] h-[18px]" /> : <Mic className="w-[18px] h-[18px]" />}
            </button>
            <button
              onClick={() => setIsAdvancedFiltersOpen(!isAdvancedFiltersOpen)}
              aria-expanded={isAdvancedFiltersOpen}
              className="h-10 sm:h-12 px-4 sm:px-5 inline-flex items-center gap-2 rounded-full bg-ink dark:bg-white text-white dark:text-ink text-sm font-medium shadow-pill hover:bg-black transition"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">{np ? 'फिल्टर' : 'Filters'}</span>
              {activeFiltersCount > 0 && (
                <span className="min-w-5 h-5 px-1 rounded-full bg-white text-ink dark:bg-ink dark:text-white text-[11px] inline-flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {isListening && (
            <p className="mt-3 text-xs text-rose-600 dark:text-rose-400">
              {np ? 'सुन्दैछ… पद वा कार्यालयको नाम भन्नुहोस्' : 'Listening… say a position or office name'}
            </p>
          )}

          {/* Quick presets */}
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {POPULAR_PRESETS.map((preset, idx) => {
              const isActive =
                (preset.search && debouncedSearch.includes(preset.search)) ||
                (preset.category && selectedCategory === preset.category) ||
                (preset.deadline && selectedDeadline === preset.deadline) ||
                (preset.province && selectedProvince === preset.province) ||
                (preset.qualification && selectedQualification === preset.qualification);
              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (preset.search) setSearchTerm(preset.search);
                    if (preset.category) setSelectedCategory(preset.category);
                    if (preset.deadline) setSelectedDeadline(preset.deadline);
                    if (preset.province) setSelectedProvince(preset.province);
                    if (preset.qualification) setSelectedQualification(preset.qualification);
                    setPage(1);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-[13px] transition ${
                    isActive
                      ? 'bg-ink text-white dark:bg-white dark:text-ink'
                      : 'bg-white/60 dark:bg-white/5 text-ink-soft dark:text-slate-300 ring-1 ring-black/[0.04] dark:ring-white/10 hover:bg-white dark:hover:bg-white/10'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* BROWSE BY TYPE */}
      <section className="mb-14" aria-labelledby="browse-types">
        <div className="text-center">
          <p className="text-sm text-ink-soft">{np ? 'विज्ञापनका प्रकार' : 'Browse by type'}</p>
          <h2 id="browse-types" className="mt-1 font-display text-3xl sm:text-4xl font-semibold text-ink">
            {np ? <>तपाईंको <span className="marker">क्षेत्र</span> छान्नुहोस्</> : <>Pick your <span className="marker">sector</span></>}
          </h2>
        </div>
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {VACANCY_TYPES.map((type) => {
            const Icon = type.icon;
            const count = typeCounts[type.id] || 0;
            const active = selectedCategory === type.id;
            return (
              <button
                key={type.id}
                onClick={() => pickType(type.id)}
                aria-pressed={active}
                className={`group relative overflow-hidden text-left rounded-[1.75rem] p-4 sm:p-5 bg-gradient-to-br ${tintFor(type.id)} transition hover:-translate-y-0.5 ${
                  active ? 'ring-2 ring-ink' : 'ring-1 ring-black/[0.03]'
                }`}
              >
                <span className="w-10 h-10 rounded-full bg-white/80 inline-flex items-center justify-center">
                  <Icon className="w-5 h-5 text-ink" strokeWidth={1.8} />
                </span>
                <span className="mt-6 sm:mt-8 block font-display text-lg sm:text-xl font-medium text-ink leading-tight">{np ? type.np : type.en}</span>
                <span className="mt-0.5 block text-xs sm:text-sm text-ink-soft">
                  {count} {np ? 'विज्ञापन' : count === 1 ? 'notice' : 'notices'}
                </span>
                <ArrowUpRight className="absolute top-4 right-4 w-4 h-4 text-ink opacity-40 group-hover:opacity-100 transition" />
              </button>
            );
          })}
        </div>
      </section>

      {/* FILTER PANEL */}
      {isAdvancedFiltersOpen && (
        <section className="mb-10 p-5 sm:p-7 rounded-[2rem] bg-white dark:bg-slate-900 shadow-soft ring-1 ring-black/[0.04] dark:ring-white/10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl font-semibold text-ink dark:text-white">{np ? 'फिल्टरहरू' : 'Filters'}</h2>
            <div className="flex items-center gap-2">
              {activeFiltersCount > 0 && (
                <button onClick={handleResetFilters} className="px-4 h-9 rounded-full text-sm text-ink-soft hover:text-ink dark:text-slate-400 dark:hover:text-white transition">
                  {np ? 'सबै हटाउनुहोस्' : 'Clear all'}
                </button>
              )}
              <button
                onClick={() => setIsAdvancedFiltersOpen(false)}
                className="w-9 h-9 inline-flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/10 text-ink dark:text-white"
                aria-label="Close filters"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className={labelClass}>{np ? 'प्रदेश' : 'Province'}</label>
              <select value={selectedProvince} onChange={(e) => { setSelectedProvince(e.target.value); setPage(1); }} className={selectClass}>
                {PROVINCES.map((prov) => (
                  <option key={prov} value={prov}>{prov}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>{np ? 'जिल्ला' : 'District'}</label>
              <select value={selectedDistrict} onChange={(e) => { setSelectedDistrict(e.target.value); setPage(1); }} className={selectClass}>
                <option value="All">{np ? 'सबै जिल्ला' : 'All districts'}</option>
                <option value="Kathmandu">Kathmandu</option>
                <option value="Pokhara">Pokhara / Kaski</option>
                <option value="Biratnagar">Biratnagar / Morang</option>
                <option value="Lalitpur">Lalitpur</option>
                <option value="Chitwan">Chitwan</option>
                <option value="Butwal">Butwal / Rupandehi</option>
                <option value="Janakpur">Janakpur / Dhanusha</option>
                {availableDistricts.map((d, i) => (
                  <option key={i} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>{np ? 'न्यूनतम योग्यता' : 'Qualification'}</label>
              <select value={selectedQualification} onChange={(e) => { setSelectedQualification(e.target.value); setPage(1); }} className={selectClass}>
                {QUALIFICATIONS.map((q) => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>{np ? 'विषय' : 'Subject'}</label>
              <select value={selectedSubject} onChange={(e) => { setSelectedSubject(e.target.value); setPage(1); }} className={selectClass}>
                {SUBJECT_OPTIONS.map((sub) => (
                  <option key={sub.id} value={sub.id}>{np ? sub.labelNp : sub.labelEn}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>{np ? 'तह / श्रेणी' : 'Job level'}</label>
              <select value={selectedJobLevel} onChange={(e) => { setSelectedJobLevel(e.target.value); setPage(1); }} className={selectClass}>
                {JOB_LEVEL_OPTIONS.map((lvl) => (
                  <option key={lvl.id} value={lvl.id}>{np ? lvl.labelNp : lvl.labelEn}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>{np ? 'म्याद' : 'Deadline'}</label>
              <select value={selectedDeadline} onChange={(e) => { setSelectedDeadline(e.target.value as VacancyDeadlineFilter); setPage(1); }} className={selectClass}>
                <option value="all">{np ? 'सबै म्याद' : 'Any deadline'}</option>
                <option value="active">{np ? 'म्याद बाँकी' : 'Still open'}</option>
                <option value="week">{np ? '७ दिनभित्र' : 'Closing in 7 days'}</option>
                <option value="month">{np ? '३० दिनभित्र' : 'Closing in 30 days'}</option>
                <option value="expired">{np ? 'म्याद समाप्त' : 'Expired'}</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>{np ? 'स्थिति' : 'Status'}</label>
              <select value={selectedStatus} onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }} className={selectClass}>
                <option value="all">{np ? 'सबै स्थिति' : 'Any status'}</option>
                <option value="published">{np ? 'प्रकाशित' : 'Published'}</option>
                <option value="closing_soon">{np ? 'अन्तिम म्याद' : 'Closing soon'}</option>
                <option value="expired">{np ? 'म्याद समाप्त' : 'Expired'}</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>{np ? 'निकाय' : 'Organization'}</label>
              <select value={selectedOrg} onChange={(e) => { setSelectedOrg(e.target.value); setPage(1); }} className={selectClass}>
                <option value="All">{np ? 'सबै निकाय' : 'All organizations'}</option>
                <option value="PSC">Lok Sewa Aayog (PSC)</option>
                <option value="TSC">Teachers Service Commission (TSC)</option>
                <option value="NRB">Nepal Rastra Bank</option>
                <option value="Nepal Bank">Nepal Bank Limited</option>
                <option value="Nepal Police">Nepal Police</option>
                <option value="Statistics">National Statistics Office</option>
                <option value="MoALD">Ministry of Agriculture</option>
                <option value="Koshi">Koshi Pradesh PSC</option>
                <option value="Madhesh">Madhesh Pradesh PSC</option>
              </select>
            </div>
          </div>
        </section>
      )}

      {/* SECTION HEADING + SORT */}
      <div ref={listTopRef} className="scroll-mt-28 flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-sm text-ink-soft dark:text-slate-400">{np ? 'नयाँ सूचनाहरू' : 'Latest notices'}</p>
          <h2 className="mt-1 font-display text-3xl sm:text-4xl font-semibold text-ink dark:text-white">
            {np ? (
              <>खुला <span className="marker">विज्ञापनहरू</span></>
            ) : (
              <>Open <span className="marker">vacancies</span></>
            )}
          </h2>
          {selectedCategory !== 'All' && (
            <button
              onClick={() => {
                setSelectedCategory('All');
                setPage(1);
              }}
              className="mt-3 h-8 pl-3.5 pr-2.5 inline-flex items-center gap-1.5 rounded-full bg-ink text-white text-[13px]"
              title={np ? 'फिल्टर हटाउनुहोस्' : 'Clear sector filter'}
            >
              {(() => {
                const type = VACANCY_TYPES.find((v) => v.id === selectedCategory);
                return type ? (np ? type.np : type.en) : selectedCategory;
              })()}
              <X className="w-3.5 h-3.5 opacity-70" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 p-1 rounded-full bg-white/70 dark:bg-white/5 ring-1 ring-black/[0.04] dark:ring-white/10 overflow-x-auto no-scrollbar max-w-full self-start sm:self-auto">
          {SORTS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                setSortBy(opt.id as VacancySortOption);
                setPage(1);
              }}
              className={`px-3.5 h-9 rounded-full text-[13px] whitespace-nowrap transition ${
                sortBy === opt.id
                  ? 'bg-ink text-white dark:bg-white dark:text-ink'
                  : 'text-ink-soft hover:text-ink dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {np ? opt.labelNp : opt.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* ERROR */}
      {fetchError && (
        <div className="mb-6 px-5 py-4 rounded-3xl bg-white dark:bg-slate-900 ring-1 ring-rose-200 dark:ring-rose-900 flex items-center justify-between gap-3 text-sm">
          <span className="flex items-center gap-2 text-ink-soft dark:text-slate-300">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            {np ? 'प्रत्यक्ष सूचना लोड हुन सकेन।' : 'Couldn’t load live notices. Showing saved data.'}
          </span>
          <button onClick={fetchVacancies} className="px-4 h-9 rounded-full bg-ink text-white text-sm shrink-0">
            {np ? 'पुनः प्रयास' : 'Retry'}
          </button>
        </div>
      )}

      {/* LIST */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: limit > 6 ? 6 : limit }).map((_, i) => (
            <div key={i} className="rounded-[1.75rem] bg-white dark:bg-slate-900 shadow-soft overflow-hidden animate-pulse">
              <div className="h-28 bg-slate-100 dark:bg-white/5" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-slate-100 dark:bg-white/5 rounded-full w-4/5" />
                <div className="h-4 bg-slate-100 dark:bg-white/5 rounded-full w-3/5" />
                <div className="h-10 bg-slate-100 dark:bg-white/5 rounded-full mt-6" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 px-6 text-center rounded-[2rem] bg-white dark:bg-slate-900 shadow-soft">
          <div className="w-14 h-14 mx-auto rounded-full bg-sky-100 dark:bg-white/10 flex items-center justify-center">
            <Search className="w-6 h-6 text-ink dark:text-white" />
          </div>
          <h3 className="mt-5 font-display text-2xl font-semibold text-ink dark:text-white">
            {np ? 'कुनै विज्ञापन भेटिएन' : 'No vacancies found'}
          </h3>
          <p className="mt-2 text-sm text-ink-soft dark:text-slate-400 max-w-sm mx-auto">
            {np ? 'फरक शब्द प्रयोग गर्नुहोस् वा फिल्टर हटाउनुहोस्।' : 'Try different words or clear your filters.'}
          </p>
          <button onClick={handleResetFilters} className="mt-6 px-5 h-11 rounded-full bg-ink dark:bg-white text-white dark:text-ink text-sm font-medium shadow-pill">
            {np ? 'फिल्टर हटाउनुहोस्' : 'Clear filters'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((vacancy) => {
            const isEligible = checkQuickEligibility(vacancy);
            const isBookmarked = bookmarkedIds.includes(vacancy.id);
            const isClosingSoon = vacancy.status === 'closing_soon' || vacancy.status === ('closing' as any);
            const isExpired = vacancy.status === 'expired';
            const posts = vacancy.number_of_posts || vacancy.posts || 1;
            const applyHref = vacancy.official_source_url || vacancy.applyUrl;

            return (
              <article
                key={vacancy.id}
                onClick={() => onSelectVacancy(vacancy)}
                className="group flex flex-col rounded-[1.75rem] bg-white dark:bg-slate-900 shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10 overflow-hidden cursor-pointer transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-20px_rgb(11_18_32/0.25)]"
              >
                {/* Pastel band */}
                <div className={`relative h-32 p-4 bg-gradient-to-b ${tintFor(vacancy.category || '')}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-3 py-1 rounded-full bg-white/80 dark:bg-white/10 text-xs text-ink dark:text-slate-100">
                        {vacancy.category}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-white/80 dark:bg-white/10 text-xs text-ink dark:text-slate-100">
                        {isExpired ? (np ? 'समाप्त' : 'Closed') : isClosingSoon ? (np ? 'छिट्टै बन्द' : 'Closing soon') : np ? 'खुला' : 'Open'}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onBookmark(vacancy);
                      }}
                      title={np ? 'सुरक्षित गर्नुहोस्' : 'Save vacancy'}
                      aria-pressed={isBookmarked}
                      className={`w-9 h-9 shrink-0 inline-flex items-center justify-center rounded-full transition ${
                        isBookmarked ? 'bg-ink text-white dark:bg-white dark:text-ink' : 'bg-white/80 dark:bg-white/10 text-ink dark:text-white hover:bg-white'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  <div className="absolute left-4 bottom-3 flex items-baseline gap-1.5 text-ink dark:text-white">
                    <span className="font-display text-4xl font-semibold leading-none">{posts}</span>
                    <span className="text-xs text-ink-soft dark:text-slate-300">{posts === 1 ? (np ? 'पद' : 'post') : np ? 'पदहरू' : 'posts'}</span>
                  </div>
                </div>

                {/* Body */}
                <div className="flex-1 flex flex-col p-5">
                  <h3 className="font-display text-[1.2rem] leading-snug font-medium text-ink dark:text-white line-clamp-2">
                    {np && vacancy.titleNp ? vacancy.titleNp : vacancy.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-ink-soft dark:text-slate-400 truncate">{vacancy.organization || vacancy.org}</p>

                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-ink dark:text-slate-200">
                    <span className={`inline-flex items-center gap-1.5 ${isClosingSoon ? 'text-rose-600 dark:text-rose-400' : ''}`}>
                      <Clock className="w-3.5 h-3.5 opacity-60" />
                      {vacancy.application_deadline || vacancy.deadline || (np ? 'चालु' : 'Ongoing')}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 opacity-60" />
                      {vacancy.province}
                    </span>
                    <span className="inline-flex items-center gap-1.5 min-w-0">
                      <GraduationCap className="w-3.5 h-3.5 opacity-60 shrink-0" />
                      <span className="truncate max-w-[9rem]">{vacancy.qualification || vacancy.qualifications?.minLevel}</span>
                    </span>
                  </div>

                  <div className="mt-auto pt-5">
                    <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between gap-3">
                      <span className={`text-xs whitespace-nowrap ${isEligible ? 'text-emerald-600 dark:text-emerald-400' : 'text-ink-soft dark:text-slate-400'} inline-flex items-center gap-1`}>
                        {isEligible ? <Check className="w-3.5 h-3.5" /> : null}
                        {isEligible ? (np ? 'योग्य' : 'Eligible') : np ? 'योग्यता जाँच' : 'Check fit'}
                      </span>
                      <div className="flex items-center gap-2">
                        {applyHref && (
                          <a
                            href={applyHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="h-9 px-3.5 inline-flex items-center gap-1 whitespace-nowrap rounded-full ring-1 ring-slate-200 dark:ring-white/15 text-[13px] text-ink dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition"
                          >
                            {np ? 'आवेदन' : 'Apply'}
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectVacancy(vacancy);
                          }}
                          className="h-9 px-4 rounded-full bg-ink dark:bg-white text-white dark:text-ink text-[13px] font-medium group-hover:shadow-pill transition"
                        >
                          {np ? 'हेर्नुहोस्' : 'View'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-ink-soft dark:text-slate-400">
            {(page - 1) * limit + 1}–{Math.min(page * limit, totalCount)} {np ? 'मध्ये' : 'of'} {totalCount}
          </p>

          <div className="flex items-center gap-1 p-1 rounded-full bg-white dark:bg-slate-900 shadow-soft ring-1 ring-black/[0.04] dark:ring-white/10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="w-9 h-9 inline-flex items-center justify-center rounded-full text-ink dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, idx) => idx + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .map((p, idx, arr) => {
                const prevP = arr[idx - 1];
                const showEllipsis = prevP && p - prevP > 1;
                return (
                  <React.Fragment key={p}>
                    {showEllipsis && <span className="px-1 text-slate-400 text-sm">…</span>}
                    <button
                      onClick={() => setPage(p)}
                      aria-current={page === p ? 'page' : undefined}
                      className={`w-9 h-9 rounded-full text-sm transition ${
                        page === p ? 'bg-ink text-white dark:bg-white dark:text-ink' : 'text-ink dark:text-white hover:bg-slate-100 dark:hover:bg-white/10'
                      }`}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                );
              })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="w-9 h-9 inline-flex items-center justify-center rounded-full text-ink dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none"
              aria-label="Next page"
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
            aria-label="Results per page"
            className="h-9 px-3 rounded-full bg-white/70 dark:bg-white/5 ring-1 ring-black/[0.04] dark:ring-white/10 text-sm text-ink-soft dark:text-slate-300 focus:outline-none"
          >
            {[6, 12, 24].map((size) => (
              <option key={size} value={size}>
                {size} {np ? 'प्रति पृष्ठ' : 'per page'}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};
