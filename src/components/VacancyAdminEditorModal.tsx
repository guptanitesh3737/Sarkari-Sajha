import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Send,
  Globe,
  Archive,
  Eye,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Building2,
  DollarSign,
  Users,
  MapPin,
  GraduationCap,
  FileText,
  Clock,
  Briefcase,
  Layers,
  Sparkles,
  Loader2
} from 'lucide-react';
import { Vacancy, VacancyStatus, VacancyCategory, Province, QualificationLevel } from '../types';
import { NOT_SPECIFIED, generateVacancySlug, normalizeVacancy } from '../utils/vacancyUtils';

interface VacancyAdminEditorModalProps {
  vacancy?: Vacancy | null; // null means create mode
  onClose: () => void;
  onSaveSuccess: (updatedVacancy: Vacancy, action: string) => void;
  userRole?: string;
  adminName?: string;
}

export const VacancyAdminEditorModal: React.FC<VacancyAdminEditorModalProps> = ({
  vacancy,
  onClose,
  onSaveSuccess,
  userRole = 'admin',
  adminName = 'Editorial Admin'
}) => {
  const isEditing = !!vacancy?.id;

  // Form fields state
  const [title, setTitle] = useState(vacancy?.title || '');
  const [titleNp, setTitleNp] = useState(vacancy?.titleNp || '');
  const [organization, setOrganization] = useState(vacancy?.organization || vacancy?.org || '');
  const [shortOrg, setShortOrg] = useState(vacancy?.shortOrg || '');
  const [department, setDepartment] = useState(vacancy?.department || '');
  const [position, setPosition] = useState(vacancy?.position || vacancy?.title || '');
  const [numberOfPosts, setNumberOfPosts] = useState<number>(vacancy?.number_of_posts ?? vacancy?.posts ?? 1);
  const [province, setProvince] = useState<Province>(vacancy?.province || 'All Nepal');
  const [district, setDistrict] = useState(vacancy?.district || '');
  const [jobLevel, setJobLevel] = useState(vacancy?.job_level || vacancy?.level || 'Gazetted Class III');
  const [employmentType, setEmploymentType] = useState(vacancy?.employment_type || 'Permanent');
  const [qualification, setQualification] = useState<QualificationLevel>(vacancy?.qualification || vacancy?.minQualification || 'Bachelor Degree');
  const [requiredField, setRequiredField] = useState(vacancy?.required_field || (vacancy?.eligibleFields?.join(', ') || ''));
  const [experience, setExperience] = useState(vacancy?.experience || '');
  const [minAge, setMinAge] = useState<number>(vacancy?.age_requirement?.min ?? vacancy?.ageLimits?.min ?? 18);
  const [maxAgeMale, setMaxAgeMale] = useState<number>(vacancy?.age_requirement?.maxMale ?? vacancy?.ageLimits?.maxMale ?? 35);
  const [maxAgeFemale, setMaxAgeFemale] = useState<number>(vacancy?.age_requirement?.maxFemale ?? vacancy?.ageLimits?.maxFemale ?? 40);
  const [ageDescription, setAgeDescription] = useState(vacancy?.age_requirement?.description || '');
  
  // Quota breakdown
  const [quotaOpen, setQuotaOpen] = useState<number>(vacancy?.category_requirements?.open ?? 1);
  const [quotaFemale, setQuotaFemale] = useState<number>(vacancy?.category_requirements?.female ?? 0);
  const [quotaJanajati, setQuotaJanajati] = useState<number>(vacancy?.category_requirements?.janajati ?? 0);
  const [quotaMadhesi, setQuotaMadhesi] = useState<number>(vacancy?.category_requirements?.madhesi ?? 0);
  const [quotaDalit, setQuotaDalit] = useState<number>(vacancy?.category_requirements?.dalit ?? 0);
  const [quotaApanga, setQuotaApanga] = useState<number>(vacancy?.category_requirements?.apanga ?? 0);
  const [quotaPichhadiye, setQuotaPichhadiye] = useState<number>(vacancy?.category_requirements?.pichhadiye ?? 0);

  const [category, setCategory] = useState<VacancyCategory>(vacancy?.category || 'Lok Sewa (PSC)');
  const [applicationFee, setApplicationFee] = useState<number>(vacancy?.application_fee ?? vacancy?.fee ?? 1000);
  const [applicationStartDate, setApplicationStartDate] = useState(vacancy?.application_start_date || new Date().toISOString().split('T')[0]);
  const [applicationDeadline, setApplicationDeadline] = useState(vacancy?.application_deadline || vacancy?.deadline || '');
  const [singleFeeDeadline, setSingleFeeDeadline] = useState(vacancy?.singleFeeDeadline || vacancy?.application_deadline || '');
  const [doubleFeeDeadline, setDoubleFeeDeadline] = useState(vacancy?.doubleFeeDeadline || '');
  const [examDate, setExamDate] = useState(vacancy?.exam_date || vacancy?.examDate || '');
  const [salary, setSalary] = useState(vacancy?.salary || '');
  const [requiredDocuments, setRequiredDocuments] = useState(vacancy?.required_documents?.join('\n') || 'Citizenship Certificate\nAcademic Transcripts\nPassport size photo');
  const [applicationInstructions, setApplicationInstructions] = useState(vacancy?.application_instructions || 'Apply online via official portal and pay designated fee before the deadline.');
  const [officialSourceName, setOfficialSourceName] = useState(vacancy?.official_source_name || '');
  const [officialSourceUrl, setOfficialSourceUrl] = useState(vacancy?.official_source_url || vacancy?.applyUrl || '');
  const [sourceDocument, setSourceDocument] = useState(vacancy?.source_document || '');
  const [noticeNumber, setNoticeNumber] = useState(vacancy?.noticeNumber || '');
  const [description, setDescription] = useState(vacancy?.description || '');
  const [syllabusText, setSyllabusText] = useState(vacancy?.syllabusPoints?.join('\n') || 'Paper 1: General Knowledge & Intelligence Test\nPaper 2: Service-Specific Paper');
  const [status, setStatus] = useState<VacancyStatus>(vacancy?.status || 'draft');

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const validateForm = () => {
    const errors: string[] = [];
    if (!title.trim()) errors.push('Title (English) is required.');
    if (!organization.trim()) errors.push('Official organization name is required.');
    if (!applicationDeadline) errors.push('Application deadline date is required.');
    if (numberOfPosts < 1) errors.push('Number of posts must be at least 1.');
    if (minAge < 16) errors.push('Minimum age cannot be less than 16.');
    if (maxAgeMale < minAge) errors.push('Maximum age cannot be less than minimum age.');

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSaveWithStatus = async (targetStatus: VacancyStatus, actionLabel: string) => {
    if (!validateForm()) return;
    setSaving(true);
    setValidationErrors([]);

    const todayStr = new Date().toISOString().split('T')[0];
    const docsArray = requiredDocuments.split('\n').map(s => s.trim()).filter(Boolean);
    const syllabusArray = syllabusText.split('\n').map(s => s.trim()).filter(Boolean);
    const fieldsArray = requiredField ? requiredField.split(',').map(s => s.trim()).filter(Boolean) : ['Any recognized discipline'];

    const constructedVacancy: Partial<Vacancy> = {
      id: vacancy?.id || `vac_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      slug: vacancy?.slug || generateVacancySlug(title, vacancy?.id || 'new'),
      title: title.trim(),
      titleNp: titleNp.trim() || undefined,
      organization: organization.trim(),
      org: organization.trim(),
      shortOrg: shortOrg.trim() || organization.split(' ')[0] || 'Gov',
      department: department.trim() || NOT_SPECIFIED,
      position: position.trim() || title.trim(),
      number_of_posts: Number(numberOfPosts),
      posts: Number(numberOfPosts),
      province,
      district: district.trim() || NOT_SPECIFIED,
      job_level: jobLevel.trim() || 'Officer Level',
      level: jobLevel.trim() || 'Officer Level',
      employment_type: employmentType.trim() || 'Permanent',
      qualification,
      minQualification: qualification,
      required_field: requiredField.trim() || NOT_SPECIFIED,
      eligibleFields: fieldsArray,
      experience: experience.trim() || NOT_SPECIFIED,
      age_requirement: {
        min: Number(minAge),
        maxMale: Number(maxAgeMale),
        maxFemale: Number(maxAgeFemale),
        description: ageDescription.trim() || `${minAge} - ${maxAgeMale} years (up to ${maxAgeFemale} for female/special categories)`
      },
      ageLimits: {
        min: Number(minAge),
        maxMale: Number(maxAgeMale),
        maxFemale: Number(maxAgeFemale)
      },
      category_requirements: {
        open: Number(quotaOpen),
        female: Number(quotaFemale),
        janajati: Number(quotaJanajati),
        madhesi: Number(quotaMadhesi),
        dalit: Number(quotaDalit),
        apanga: Number(quotaApanga),
        pichhadiye: Number(quotaPichhadiye)
      },
      quotaBreakdown: {
        open: Number(quotaOpen),
        female: Number(quotaFemale),
        janajati: Number(quotaJanajati),
        madhesi: Number(quotaMadhesi),
        dalit: Number(quotaDalit),
        apanga: Number(quotaApanga),
        pichhadiye: Number(quotaPichhadiye)
      },
      category,
      application_fee: Number(applicationFee),
      fee: Number(applicationFee),
      application_start_date: applicationStartDate || NOT_SPECIFIED,
      application_deadline: applicationDeadline,
      deadline: applicationDeadline,
      singleFeeDeadline: singleFeeDeadline || applicationDeadline,
      doubleFeeDeadline: doubleFeeDeadline || NOT_SPECIFIED,
      exam_date: examDate || NOT_SPECIFIED,
      examDate: examDate || undefined,
      salary: salary.trim() || NOT_SPECIFIED,
      required_documents: docsArray.length > 0 ? docsArray : ['Citizenship Certificate', 'Academic Transcript'],
      application_instructions: applicationInstructions.trim() || NOT_SPECIFIED,
      official_source_name: officialSourceName.trim() || shortOrg || organization,
      official_source_url: officialSourceUrl.trim() || 'https://psc.gov.np',
      applyUrl: officialSourceUrl.trim() || 'https://psc.gov.np',
      officialNoticeUrl: officialSourceUrl.trim() || undefined,
      source_document: sourceDocument.trim() || NOT_SPECIFIED,
      status: targetStatus,
      noticeNumber: noticeNumber.trim() || NOT_SPECIFIED,
      description: description.trim() || `${title} recruitment notice published by ${organization}.`,
      qualifications: {
        minLevel: qualification,
        fields: fieldsArray,
        minAge: Number(minAge),
        maxAge: Number(maxAgeMale)
      },
      syllabusPoints: syllabusArray,
      syllabusSummary: syllabusArray,
      published_at: targetStatus === 'published' ? (vacancy?.published_at || todayStr) : undefined,
      verified_at: todayStr,
      verified_by: adminName,
      createdAt: vacancy?.createdAt || todayStr,
      updatedAt: todayStr
    };

    try {
      const url = isEditing ? `/api/vacancies/${vacancy.id}` : '/api/vacancies';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(constructedVacancy)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save vacancy');
      }

      const savedResult = await res.json();
      onSaveSuccess(savedResult, actionLabel);
    } catch (err: any) {
      setValidationErrors([err.message || 'An unexpected server error occurred']);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-ink/30 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 sticky top-0 z-20">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800">
                {isEditing ? 'Editing Vacancy' : 'New Vacancy Notice'}
              </span>
              <span className="text-xs text-slate-400 font-mono">Current Status: {status}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white mt-1 truncate">
              {title || (isEditing ? 'Edit Vacancy' : 'Create Government Vacancy')}
            </h2>
          </div>

          <button
            onClick={onClose}
            disabled={saving}
            className="p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Validation Errors Box */}
        {validationErrors.length > 0 && (
          <div className="bg-rose-950/80 border-b border-rose-800 p-3 sm:px-6 text-xs text-rose-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Please resolve the following before saving:</span>
              <ul className="list-disc pl-4 space-y-0.5 mt-1">
                {validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Scrollable Form Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          {/* Section 1: Identification & Organization */}
          <div className="space-y-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
            <h3 className="font-bold text-white text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
              <Building2 className="w-4 h-4 text-blue-400" />
              1. Title & Organization Info
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">Job Title (English) *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Section Officer (Sakha Adhikrit) - Administration"
                  className="w-full bg-slate-800 border border-slate-700 rounded-full p-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Job Title in Nepali (Devanagari)</label>
                <input
                  type="text"
                  value={titleNp}
                  onChange={(e) => setTitleNp(e.target.value)}
                  placeholder="e.g. शाखा अधिकृत - सामान्य प्रशासन"
                  className="w-full bg-slate-800 border border-slate-700 rounded-full p-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none font-sans"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Notice / Advertisement Number</label>
                <input
                  type="text"
                  value={noticeNumber}
                  onChange={(e) => setNoticeNumber(e.target.value)}
                  placeholder="e.g. 112/081-82"
                  className="w-full bg-slate-800 border border-slate-700 rounded-full p-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Organization Name *</label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="e.g. Public Service Commission (Lok Sewa Aayog Central Office)"
                  className="w-full bg-slate-800 border border-slate-700 rounded-full p-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Abbreviated Organization Name</label>
                <input
                  type="text"
                  value={shortOrg}
                  onChange={(e) => setShortOrg(e.target.value)}
                  placeholder="e.g. Lok Sewa Aayog"
                  className="w-full bg-slate-800 border border-slate-700 rounded-full p-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Department / Division</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Ministry of Federal Affairs or Leave blank"
                  className="w-full bg-slate-800 border border-slate-700 rounded-full p-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Position / Designation</label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="e.g. Section Officer Level 7"
                  className="w-full bg-slate-800 border border-slate-700 rounded-full p-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Classification, Location & Posts */}
          <div className="space-y-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
            <h3 className="font-bold text-white text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              2. Classification, Quota & Location
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as VacancyCategory)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-full p-2.5 text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="Lok Sewa (PSC)">Lok Sewa (PSC)</option>
                  <option value="Teacher Service (TSC)">Teacher Service (TSC)</option>
                  <option value="Banking & Finance">Banking & Finance</option>
                  <option value="Security Forces">Security Forces</option>
                  <option value="Health Services">Health Services</option>
                  <option value="Provincial Lok Sewa">Provincial Lok Sewa</option>
                  <option value="Local Level (Nagarpalika)">Local Level (Nagarpalika)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Province</label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value as Province)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-full p-2.5 text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="All Nepal">All Nepal</option>
                  <option value="Koshi">Koshi</option>
                  <option value="Madhesh">Madhesh</option>
                  <option value="Bagmati">Bagmati</option>
                  <option value="Gandaki">Gandaki</option>
                  <option value="Lumbini">Lumbini</option>
                  <option value="Karnali">Karnali</option>
                  <option value="Sudurpashchim">Sudurpashchim</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">District / Work Location</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. Kathmandu or All Districts"
                  className="w-full bg-slate-800 border border-slate-700 rounded-full p-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Job Level / Cadre</label>
                <input
                  type="text"
                  value={jobLevel}
                  onChange={(e) => setJobLevel(e.target.value)}
                  placeholder="e.g. Gazetted Class III / Officer Level 7"
                  className="w-full bg-slate-800 border border-slate-700 rounded-full p-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Employment Type</label>
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-full p-2.5 text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="Permanent">Permanent</option>
                  <option value="Contract">Contract</option>
                  <option value="Temporary">Temporary</option>
                  <option value="Daily Wage">Daily Wage</option>
                  <option value="Training / Apprenticeship">Training / Apprenticeship</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Total Number of Posts *</label>
                <input
                  type="number"
                  min={1}
                  value={numberOfPosts}
                  onChange={(e) => setNumberOfPosts(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-full p-2.5 text-white focus:border-blue-500 focus:outline-none font-bold text-emerald-400"
                />
              </div>
            </div>

            {/* Quota breakdown inputs */}
            <div className="pt-2 border-t border-slate-800">
              <span className="block text-slate-400 font-semibold text-xs mb-2">Inclusion / Category Quota Breakdown (Seats)</span>
              <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block font-mono">Open</label>
                  <input
                    type="number"
                    min={0}
                    value={quotaOpen}
                    onChange={(e) => setQuotaOpen(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white text-center"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block font-mono">Female</label>
                  <input
                    type="number"
                    min={0}
                    value={quotaFemale}
                    onChange={(e) => setQuotaFemale(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white text-center"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block font-mono">Janajati</label>
                  <input
                    type="number"
                    min={0}
                    value={quotaJanajati}
                    onChange={(e) => setQuotaJanajati(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white text-center"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block font-mono">Madhesi</label>
                  <input
                    type="number"
                    min={0}
                    value={quotaMadhesi}
                    onChange={(e) => setQuotaMadhesi(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white text-center"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block font-mono">Dalit</label>
                  <input
                    type="number"
                    min={0}
                    value={quotaDalit}
                    onChange={(e) => setQuotaDalit(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white text-center"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block font-mono">Apanga</label>
                  <input
                    type="number"
                    min={0}
                    value={quotaApanga}
                    onChange={(e) => setQuotaApanga(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white text-center"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block font-mono">Pichhadiye</label>
                  <input
                    type="number"
                    min={0}
                    value={quotaPichhadiye}
                    onChange={(e) => setQuotaPichhadiye(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white text-center"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Qualifications, Age & Eligibility */}
          <div className="space-y-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
            <h3 className="font-bold text-white text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
              <GraduationCap className="w-4 h-4 text-purple-400" />
              3. Qualifications & Eligibility
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Minimum Qualification</label>
                <select
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value as QualificationLevel)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-full p-2.5 text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="SEE/SLC">SEE / SLC (Class 10)</option>
                  <option value="+2 High School">+2 High School / Intermediate</option>
                  <option value="Bachelor Degree">Bachelor Degree</option>
                  <option value="Master Degree">Master Degree</option>
                  <option value="MPhil/PhD">MPhil / PhD</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">Required Academic Field / Major</label>
                <input
                  type="text"
                  value={requiredField}
                  onChange={(e) => setRequiredField(e.target.value)}
                  placeholder="e.g. Computer Science, Public Administration, Law, Commerce"
                  className="w-full bg-slate-800 border border-slate-700 rounded-full p-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Min Age</label>
                <input
                  type="number"
                  min={16}
                  value={minAge}
                  onChange={(e) => setMinAge(parseInt(e.target.value) || 18)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-full p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Max Age (Male)</label>
                <input
                  type="number"
                  min={18}
                  value={maxAgeMale}
                  onChange={(e) => setMaxAgeMale(parseInt(e.target.value) || 35)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-full p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Max Age (Female / Quota)</label>
                <input
                  type="number"
                  min={18}
                  value={maxAgeFemale}
                  onChange={(e) => setMaxAgeFemale(parseInt(e.target.value) || 40)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-full p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Prior Experience Requirement</label>
                <input
                  type="text"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="e.g. Freshers eligible or 2 years experience in accounting"
                  className="w-full bg-slate-800 border border-slate-700 rounded-full p-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">Salary / Remuneration Details</label>
                <input
                  type="text"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="e.g. As per Nepal Civil Service Gazetted Class III Scale (NPR 43,689)"
                  className="w-full bg-slate-800 border border-slate-700 rounded-full p-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Fees, Important Dates & Deadlines */}
          <div className="space-y-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
            <h3 className="font-bold text-white text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              4. Fees & Important Dates
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Application Fee (NPR)</label>
                <input
                  type="number"
                  min={0}
                  value={applicationFee}
                  onChange={(e) => setApplicationFee(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-full p-2.5 text-white font-bold text-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Application Start Date</label>
                <input
                  type="date"
                  value={applicationStartDate}
                  onChange={(e) => setApplicationStartDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-full p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Application Deadline *</label>
                <input
                  type="date"
                  value={applicationDeadline}
                  onChange={(e) => {
                    setApplicationDeadline(e.target.value);
                    if (!singleFeeDeadline) setSingleFeeDeadline(e.target.value);
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-full p-2.5 text-white font-bold text-rose-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Single-Fee Deadline</label>
                <input
                  type="date"
                  value={singleFeeDeadline}
                  onChange={(e) => setSingleFeeDeadline(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-full p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Double-Fee (Late) Deadline</label>
                <input
                  type="date"
                  value={doubleFeeDeadline}
                  onChange={(e) => setDoubleFeeDeadline(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-full p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Scheduled Examination Date</label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-full p-2.5 text-white"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Official Verification & Citations */}
          <div className="space-y-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
            <h3 className="font-bold text-white text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              5. Official Verification Source & Citations
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Official Source Name</label>
                <input
                  type="text"
                  value={officialSourceName}
                  onChange={(e) => setOfficialSourceName(e.target.value)}
                  placeholder="e.g. Lok Sewa Aayog Gazette Bulletin"
                  className="w-full bg-slate-800 border border-slate-700 rounded-full p-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Official Portal URL / Link</label>
                <input
                  type="url"
                  value={officialSourceUrl}
                  onChange={(e) => setOfficialSourceUrl(e.target.value)}
                  placeholder="https://pps.psc.gov.np"
                  className="w-full bg-slate-800 border border-slate-700 rounded-full p-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Source Document / Gazette Code</label>
                <input
                  type="text"
                  value={sourceDocument}
                  onChange={(e) => setSourceDocument(e.target.value)}
                  placeholder="e.g. Nepal Rajpatra Vol 74 No 18"
                  className="w-full bg-slate-800 border border-slate-700 rounded-full p-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Application Instructions</label>
                <input
                  type="text"
                  value={applicationInstructions}
                  onChange={(e) => setApplicationInstructions(e.target.value)}
                  placeholder="e.g. Register online at official portal, upload certificates"
                  className="w-full bg-slate-800 border border-slate-700 rounded-full p-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">Required Documents (One per line)</label>
                <textarea
                  rows={3}
                  value={requiredDocuments}
                  onChange={(e) => setRequiredDocuments(e.target.value)}
                  placeholder="Citizenship Certificate&#10;Academic Transcripts&#10;Passport Sized Photograph"
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none font-mono text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">Syllabus Outline Points (One per line)</label>
                <textarea
                  rows={3}
                  value={syllabusText}
                  onChange={(e) => setSyllabusText(e.target.value)}
                  placeholder="Paper 1: General Knowledge & IQ&#10;Paper 2: Contemporary Public Governance"
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none font-mono text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/90 flex flex-wrap items-center justify-between gap-3 sticky bottom-0 z-20">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Save Action:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Draft */}
            <button
              onClick={() => handleSaveWithStatus('draft', 'Saved Draft')}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <Save className="w-4 h-4" />
              <span>Save Draft</span>
            </button>

            {/* Submit for Review */}
            <button
              onClick={() => handleSaveWithStatus('pending_review', 'Submitted for Review')}
              disabled={saving}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-blue-950/80 hover:bg-blue-900 text-blue-300 border border-blue-800 transition"
            >
              <Send className="w-4 h-4" />
              <span>Submit for Review</span>
            </button>

            {/* Publish (Authorized role check) */}
            <button
              onClick={() => handleSaveWithStatus('published', 'Published Publicly')}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold shadow-sm transition bg-ink hover:bg-black text-white dark:bg-white dark:text-ink"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
              <span>{isEditing && status === 'published' ? 'Update & Keep Published' : 'Approve & Publish'}</span>
            </button>

            {/* Unpublish to Draft if currently published */}
            {isEditing && status === 'published' && (
              <button
                onClick={() => handleSaveWithStatus('draft', 'Unpublished to Draft')}
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-800 transition"
              >
                <Eye className="w-4 h-4" />
                <span>Unpublish</span>
              </button>
            )}

            {/* Archive */}
            {isEditing && (
              <button
                onClick={() => handleSaveWithStatus('archived', 'Archived Notice')}
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
              >
                <Archive className="w-4 h-4" />
                <span>Archive</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
