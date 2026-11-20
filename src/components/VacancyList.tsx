import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Users,
  Award,
  Sparkles,
  ExternalLink,
  Bookmark,
  CheckCircle,
  Clock,
  Building2,
  FileText,
  AlertCircle,
  DollarSign,
  Mic,
  MicOff,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RotateCcw,
  SlidersHorizontal,
  X,
  Eye,
  Check,
  TrendingUp,
  Briefcase,
  GraduationCap,
  BookOpen
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

const POPULAR_PRESETS = [
  { label: 'Lok Sewa (PSC)', category: 'Lok Sewa (PSC)', search: '' },
  { label: 'Banking Jobs', category: 'Banking & Finance', search: '' },
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

  return (
    <div className="space-y-6">
      {/* 1. HERO SEARCH & DISCOVERY ENGINE */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm transition-all">
        <div className="space-y-5">
          {/* Header Title & Counter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
                <span>{lang === 'np' ? 'सरकारी सूचना तथा दरखास्त आव्हान' : 'Government Vacancies & Official Notices'}</span>
                <span className="inline-flex items-center gap-1 text-xs font-mono font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {totalCount} {lang === 'np' ? 'विज्ञापन' : 'Notices'}
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {lang === 'np'
                  ? 'लोक सेवा आयोग, शिक्षक सेवा, बैंक तथा प्रादेशिक निकायका आधिकारिक विज्ञापनहरू छिटो र प्रभावकारी खोज्नुहोस्।'
                  : 'Fast vacancy discovery across Lok Sewa, Teachers Service, Banking institutions, and Provincial Services in Nepal.'}
              </p>
            </div>

            {/* Quick Actions (Reset & Filter Toggle) */}
            <div className="flex items-center gap-2 shrink-0">
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 rounded-xl transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{lang === 'np' ? 'सबै रिसेट' : 'Clear All'}</span>
                </button>
              )}

              <button
                onClick={() => setIsAdvancedFiltersOpen(!isAdvancedFiltersOpen)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition ${
                  isAdvancedFiltersOpen || activeFiltersCount > 0
                    ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{lang === 'np' ? 'फिल्टरहरू' : 'Filters'}</span>
                {activeFiltersCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search Input Bar with Speech-to-Text */}
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-slate-400 dark:text-slate-500 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                lang === 'np'
                  ? 'पद, कार्यालय, योग्यता, विषय, प्रदेश वा जिल्ला खोज्नुहोस्... (प्रेस /)'
                  : 'Search vacancy title, position, organization, qualification, subject, province, or district... (Press /)'
              }
              className="w-full pl-12 pr-28 py-3.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-inner"
            />
            <div className="absolute right-3 flex items-center gap-1.5">
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    searchInputRef.current?.focus();
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={toggleListening}
                title={lang === 'np' ? 'नेपाली/अंग्रेजीमा बोलेर खोज्नुहोस्' : 'Voice Search (Nepali/English)'}
                className={`p-2 rounded-xl text-xs font-semibold transition flex items-center justify-center ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse shadow-md'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
              </button>
            </div>
          </div>

          {isListening && (
            <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 p-2.5 rounded-xl flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300 font-medium animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>
                {lang === 'np'
                  ? 'सुन्दैछ... नेपाली वा अंग्रेजीमा पद वा कार्यालयको नाम बोल्नुहोस् (उदा. तथ्याङ्क सहायक, नेपाल राष्ट्र बैंक)'
                  : 'Listening... Speak vacancy or position name in Nepali or English (e.g. Statistical Assistant, Lok Sewa)'}
              </span>
            </div>
          )}

          {/* Quick Preset Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
            <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              {lang === 'np' ? 'लोकप्रिय:' : 'Quick:'}
            </span>
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
                  className={`px-3 py-1.5 rounded-full font-medium shrink-0 transition cursor-pointer border ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* 2. ADVANCED MULTI-FACETED FILTER MATRIX */}
          {isAdvancedFiltersOpen && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* Province Filter */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-blue-500" />
                    {lang === 'np' ? 'प्रदेश (Province)' : 'Province'}
                  </label>
                  <select
                    value={selectedProvince}
                    onChange={(e) => {
                      setSelectedProvince(e.target.value);
                      setPage(1);
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {PROVINCES.map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                </div>

                {/* District Filter */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-emerald-500" />
                    {lang === 'np' ? 'जिल्ला (District)' : 'District'}
                  </label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => {
                      setSelectedDistrict(e.target.value);
                      setPage(1);
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="All">{lang === 'np' ? 'सबै जिल्ला' : 'All Districts'}</option>
                    <option value="Kathmandu">Kathmandu</option>
                    <option value="Pokhara">Pokhara / Kaski</option>
                    <option value="Biratnagar">Biratnagar / Morang</option>
                    <option value="Lalitpur">Lalitpur</option>
                    <option value="Chitwan">Chitwan</option>
                    <option value="Butwal">Butwal / Rupandehi</option>
                    <option value="Janakpur">Janakpur / Dhanusha</option>
                    {availableDistricts.map((d, i) => (
                      <option key={i} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Qualification Filter */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <GraduationCap className="w-3 h-3 text-purple-500" />
                    {lang === 'np' ? 'न्यूनतम योग्यता (Qualification)' : 'Min Qualification'}
                  </label>
                  <select
                    value={selectedQualification}
                    onChange={(e) => {
                      setSelectedQualification(e.target.value);
                      setPage(1);
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {QUALIFICATIONS.map((q) => (
                      <option key={q} value={q}>
                        {q}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject / Study Field Filter */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-amber-500" />
                    {lang === 'np' ? 'विषय / संकाय (Subject)' : 'Subject / Discipline'}
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => {
                      setSelectedSubject(e.target.value);
                      setPage(1);
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {SUBJECT_OPTIONS.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {lang === 'np' ? sub.labelNp : sub.labelEn}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Job Level Filter */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Award className="w-3 h-3 text-indigo-500" />
                    {lang === 'np' ? 'तह / श्रेणी (Job Level)' : 'Job Level'}
                  </label>
                  <select
                    value={selectedJobLevel}
                    onChange={(e) => {
                      setSelectedJobLevel(e.target.value);
                      setPage(1);
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {JOB_LEVEL_OPTIONS.map((lvl) => (
                      <option key={lvl.id} value={lvl.id}>
                        {lang === 'np' ? lvl.labelNp : lvl.labelEn}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Deadline Filter */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-rose-500" />
                    {lang === 'np' ? 'दरखास्त म्याद (Deadline)' : 'Application Deadline'}
                  </label>
                  <select
                    value={selectedDeadline}
                    onChange={(e) => {
                      setSelectedDeadline(e.target.value as VacancyDeadlineFilter);
                      setPage(1);
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="all">{lang === 'np' ? 'सबै म्याद' : 'All Deadlines'}</option>
                    <option value="active">{lang === 'np' ? 'म्याद बाँकी रहेका (Active Only)' : 'Active (Not Expired)'}</option>
                    <option value="week">{lang === 'np' ? '७ दिनभित्र सकिने (Next 7 Days)' : 'Ending in 7 Days'}</option>
                    <option value="month">{lang === 'np' ? '३० दिनभित्र सकिने (Next 30 Days)' : 'Ending in 30 Days'}</option>
                    <option value="expired">{lang === 'np' ? 'म्याद समाप्त भएका (Expired)' : 'Expired Notices'}</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-teal-500" />
                    {lang === 'np' ? 'स्थिति (Status)' : 'Status'}
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => {
                      setSelectedStatus(e.target.value);
                      setPage(1);
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="all">{lang === 'np' ? 'सबै स्थिति' : 'All Statuses'}</option>
                    <option value="published">{lang === 'np' ? 'प्रकाशित (Published)' : 'Published'}</option>
                    <option value="closing_soon">{lang === 'np' ? 'अन्तिम म्याद (Closing Soon)' : 'Closing Soon'}</option>
                    <option value="expired">{lang === 'np' ? 'म्याद समाप्त (Expired)' : 'Expired'}</option>
                  </select>
                </div>

                {/* Organization Direct Filter */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Briefcase className="w-3 h-3 text-cyan-500" />
                    {lang === 'np' ? 'निकाय (Organization)' : 'Organization'}
                  </label>
                  <select
                    value={selectedOrg}
                    onChange={(e) => {
                      setSelectedOrg(e.target.value);
                      setPage(1);
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="All">{lang === 'np' ? 'सबै निकाय' : 'All Organizations'}</option>
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
            </div>
          )}

          {/* 3. SORTING AND VIEW CONTROLS */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            {/* Active Filter Tags */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-400 font-medium mr-1">
                {lang === 'np' ? 'क्रमबद्ध:' : 'Sort By:'}
              </span>
              {[
                { id: 'newest', labelEn: 'Newest', labelNp: 'नयाँ' },
                { id: 'deadline_soonest', labelEn: 'Deadline Soonest', labelNp: 'छिटो म्याद' },
                { id: 'most_viewed', labelEn: 'Most Viewed', labelNp: 'धेरै हेरिएका' },
                { id: 'most_saved', labelEn: 'Most Saved', labelNp: 'धेरै सुरक्षित' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setSortBy(opt.id as VacancySortOption);
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                    sortBy === opt.id
                      ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {lang === 'np' ? opt.labelNp : opt.labelEn}
                </button>
              ))}
            </div>

            {/* Pagination Size Selector */}
            <div className="flex items-center gap-2 self-end sm:self-auto text-slate-500 dark:text-slate-400">
              <span className="text-[11px] font-medium">Per page:</span>
              {[6, 12, 24].map((size) => (
                <button
                  key={size}
                  onClick={() => {
                    setLimit(size);
                    setPage(1);
                  }}
                  className={`px-2 py-0.5 rounded-md font-mono text-[11px] ${
                    limit === size
                      ? 'bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-white font-bold'
                      : 'hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. ERROR STATE BANNER */}
      {fetchError && (
        <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 p-4 rounded-2xl flex items-start justify-between gap-3 text-rose-800 dark:text-rose-200 text-xs">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Error loading live vacancy notices</p>
              <p className="text-[11px] text-rose-600 dark:text-rose-300 mt-0.5">{fetchError}</p>
            </div>
          </div>
          <button
            onClick={fetchVacancies}
            className="px-3 py-1.5 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 transition shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* 5. LOADING SKELETON STATE */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: limit > 6 ? 6 : limit }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs animate-pulse space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-24" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-16" />
              </div>
              <div className="space-y-2">
                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-4/5" />
                <div className="h-3.5 bg-slate-100 dark:bg-slate-800/60 rounded-md w-3/5" />
              </div>
              <div className="h-20 bg-slate-100 dark:bg-slate-800/40 rounded-2xl" />
              <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        /* 6. EMPTY SEARCH STATE */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 sm:p-14 text-center text-slate-500 dark:text-slate-400 space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto text-slate-400 dark:text-slate-500">
            <Search className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {lang === 'np' ? 'कुनै पनि विज्ञापन भेटिएन' : 'No government vacancies match your search'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {lang === 'np'
                ? 'कृपया फरक शब्दहरू, "All Nepal" वा न्यूनतम योग्यता परिवर्तन गरी पुनः प्रयास गर्नुहोस्।'
                : 'Try adjusting your search terms, removing filters, or selecting "All Nepal" to view active postings.'}
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{lang === 'np' ? 'सबै फिल्टर हटाउनुहोस्' : 'Reset All Filters'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* 7. VACANCY CARDS GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((vacancy) => {
            const isEligible = checkQuickEligibility(vacancy);
            const isBookmarked = bookmarkedIds.includes(vacancy.id);
            const isClosingSoon = vacancy.status === 'closing_soon' || vacancy.status === ('closing' as any);
            const isExpired = vacancy.status === 'expired';

            return (
              <div
                key={vacancy.id}
                onClick={() => onSelectVacancy(vacancy)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 hover:border-blue-400 dark:hover:border-blue-700 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between group relative overflow-hidden cursor-pointer"
              >
                {/* Top Accent Strip */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 ${
                    isExpired
                      ? 'bg-slate-300 dark:bg-slate-700'
                      : isClosingSoon
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                />

                <div className="space-y-3.5">
                  {/* Category, Notice Number & Save Button */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/90 px-2.5 py-0.5 rounded-lg text-[10px] font-bold font-mono">
                        {vacancy.category}
                      </span>
                      {vacancy.noticeNumber && (
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-lg text-[10px] font-mono border border-slate-200 dark:border-slate-700 truncate max-w-[130px]">
                          #{vacancy.noticeNumber}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onBookmark(vacancy);
                      }}
                      title="Save / Bookmark Vacancy"
                      className={`p-2 rounded-xl border transition cursor-pointer ${
                        isBookmarked
                          ? 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                          : 'bg-slate-50 dark:bg-slate-800/80 text-slate-400 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-700 dark:hover:text-slate-200'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
                    </button>
                  </div>

                  {/* Title & Organization */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition font-sans leading-snug line-clamp-2">
                      {lang === 'np' && vacancy.titleNp ? vacancy.titleNp : vacancy.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5 mt-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                      <span className="truncate">{vacancy.organization || vacancy.org}</span>
                    </p>
                  </div>

                  {/* Key Stats Pill Box */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-semibold block leading-none">
                          {t('posts', lang)}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                          {vacancy.number_of_posts || vacancy.posts || 1} Seats
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-semibold block leading-none">
                          {t('deadline', lang)}
                        </span>
                        <span className={`font-bold text-xs ${isClosingSoon ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>
                          {vacancy.application_deadline || vacancy.deadline || 'Ongoing'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-semibold block leading-none">
                          {lang === 'np' ? 'प्रदेश' : 'Province'}
                        </span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs truncate max-w-[90px] block">
                          {vacancy.province}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-semibold block leading-none">
                          {lang === 'np' ? 'तह/श्रेणी' : 'Level'}
                        </span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs truncate max-w-[90px] block">
                          {vacancy.job_level || vacancy.level || 'Assistant'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Qualification & Live Engagement Badges */}
                  <div className="space-y-2 pt-0.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400 text-[11px] flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <strong className="text-slate-800 dark:text-slate-200 font-semibold truncate max-w-[130px]">
                          {vacancy.qualification || vacancy.qualifications?.minLevel}
                        </strong>
                      </span>

                      {/* Eligibility Badge */}
                      {isEligible ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Eligible
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                          Check Fit
                        </span>
                      )}
                    </div>

                    {/* Engagement Metric Indicators */}
                    <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800/60 font-mono">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{vacancy.viewsCount || 120} views</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Bookmark className="w-3 h-3" />
                        <span>{vacancy.savesCount || 24} saved</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectVacancy(vacancy)}
                    className="flex-1 px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    <span>{t('viewDetails', lang)}</span>
                  </button>

                  <a
                    href={vacancy.official_source_url || vacancy.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 shadow-xs"
                  >
                    <span>{t('applyNow', lang)}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 8. PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Showing <strong className="text-slate-900 dark:text-white font-bold">{(page - 1) * limit + 1}</strong> to{' '}
            <strong className="text-slate-900 dark:text-white font-bold">
              {Math.min(page * limit, totalCount)}
            </strong>{' '}
            of <strong className="text-slate-900 dark:text-white font-bold">{totalCount}</strong> government notices
          </div>

          <div className="flex items-center gap-1">
            {/* First Page */}
            <button
              onClick={() => setPage(1)}
              disabled={page <= 1}
              className="p-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition"
              title="First Page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>

            {/* Previous Page */}
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Prev</span>
            </button>

            {/* Page Number Buttons */}
            {Array.from({ length: totalPages }, (_, idx) => idx + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .map((p, idx, arr) => {
                const prevP = arr[idx - 1];
                const showEllipsis = prevP && p - prevP > 1;

                return (
                  <React.Fragment key={p}>
                    {showEllipsis && <span className="px-1 text-slate-400 text-xs">...</span>}
                    <button
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition ${
                        page === p
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                );
              })}

            {/* Next Page */}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition flex items-center gap-1"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Last Page */}
            <button
              onClick={() => setPage(totalPages)}
              disabled={page >= totalPages}
              className="p-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition"
              title="Last Page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
