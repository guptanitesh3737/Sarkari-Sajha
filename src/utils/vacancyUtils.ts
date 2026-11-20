import { Vacancy, VacancyStatus } from '../types';

export const NOT_SPECIFIED = 'Not specified in the available official notice.';

/**
 * Normalizes a vacancy object to guarantee all required fields and backwards-compatible aliases.
 */
export function normalizeVacancy(raw: any): Vacancy {
  const nowStr = new Date().toISOString().split('T')[0];
  const title = raw.title || 'Government Vacancy';
  const org = raw.organization || raw.org || 'Official Government Institution';
  const deadline = raw.application_deadline || raw.deadline || nowStr;
  const posts = Number(raw.number_of_posts ?? raw.posts ?? 1);
  const fee = Number(raw.application_fee ?? raw.fee ?? 0);
  const position = raw.position || title;
  const jobLevel = raw.job_level || raw.level || 'Official Grade';
  const qualification = raw.qualification || raw.minQualification || raw.qualifications?.minLevel || 'Bachelor Degree';
  const requiredField = raw.required_field || (raw.eligibleFields ? raw.eligibleFields.join(', ') : (raw.qualifications?.fields ? raw.qualifications.fields.join(', ') : NOT_SPECIFIED));

  // Determine status with dynamic date calculations if 'published' or legacy 'open'
  let rawStatus = (raw.status || 'published').toLowerCase() as string;
  if (rawStatus === 'open') rawStatus = 'published';
  if (rawStatus === 'closed') rawStatus = 'expired';
  if (rawStatus === 'closing') rawStatus = 'closing_soon';

  let status: VacancyStatus = rawStatus as VacancyStatus;
  if (!['draft', 'pending_review', 'published', 'closing_soon', 'expired', 'archived'].includes(status)) {
    status = 'published';
  }

  // If published, check if it has expired or is closing soon
  if (status === 'published' || status === 'closing_soon') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    if (!isNaN(deadlineDate.getTime())) {
      deadlineDate.setHours(23, 59, 59, 999);
      const diffDays = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) {
        status = 'expired';
      } else if (diffDays <= 5) {
        status = 'closing_soon';
      }
    }
  }

  const slug = raw.slug || generateVacancySlug(title, raw.id);

  const structuredQual = raw.qualifications || {
    minLevel: qualification,
    fields: raw.eligibleFields || (requiredField !== NOT_SPECIFIED ? [requiredField] : ['Any recognized discipline']),
    minAge: raw.age_requirement?.min ?? raw.ageLimits?.min ?? 18,
    maxAge: raw.age_requirement?.maxMale ?? raw.ageLimits?.maxMale ?? 35
  };

  return {
    id: raw.id || `vac_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    slug,
    title,
    titleNp: raw.titleNp || '',
    organization: org,
    org,
    shortOrg: raw.shortOrg || org.split(' ')[0] || 'Gov',
    department: raw.department || NOT_SPECIFIED,
    position,
    number_of_posts: posts,
    posts,
    province: raw.province || 'All Nepal',
    district: raw.district || NOT_SPECIFIED,
    job_level: jobLevel,
    level: jobLevel,
    employment_type: raw.employment_type || 'Permanent',
    qualification,
    minQualification: qualification,
    required_field: requiredField,
    eligibleFields: raw.eligibleFields || structuredQual.fields,
    experience: raw.experience || NOT_SPECIFIED,
    age_requirement: raw.age_requirement || {
      min: raw.ageLimits?.min ?? structuredQual.minAge ?? 18,
      maxMale: raw.ageLimits?.maxMale ?? structuredQual.maxAge ?? 35,
      maxFemale: raw.ageLimits?.maxFemale ?? 40,
      description: raw.age_requirement?.description || `${structuredQual.minAge ?? 18} - ${structuredQual.maxAge ?? 35} years (relaxation for female/special categories as per civil service law)`
    },
    ageLimits: raw.ageLimits || {
      min: structuredQual.minAge ?? 18,
      maxMale: structuredQual.maxAge ?? 35,
      maxFemale: 40
    },
    category_requirements: raw.category_requirements || raw.quotaBreakdown || {
      open: posts,
      female: 0,
      janajati: 0,
      madhesi: 0,
      dalit: 0,
      apanga: 0,
      pichhadiye: 0
    },
    quotaBreakdown: raw.quotaBreakdown || raw.category_requirements,
    category: raw.category || 'Lok Sewa (PSC)',
    application_fee: fee,
    fee,
    application_start_date: raw.application_start_date || NOT_SPECIFIED,
    application_deadline: deadline,
    deadline,
    singleFeeDeadline: raw.singleFeeDeadline || deadline,
    doubleFeeDeadline: raw.doubleFeeDeadline || NOT_SPECIFIED,
    exam_date: raw.exam_date || raw.examDate || NOT_SPECIFIED,
    examDate: raw.exam_date || raw.examDate,
    salary: raw.salary || NOT_SPECIFIED,
    required_documents: Array.isArray(raw.required_documents) && raw.required_documents.length > 0
      ? raw.required_documents
      : [
          'Citizenship Certificate (Nagarikta Pramanpatra)',
          'Academic Transcripts & Character Certificates',
          'Passport Size Photographs (digital copy)',
          'Equivalence Certificate (if foreign degree)',
          'Council / Professional Registration (if technical/health/engineering)'
        ],
    application_instructions: raw.application_instructions || 'Complete registration on the official designated portal, fill in candidate academic bio-data, select examination center, and pay application fee before the single-fee deadline.',
    official_source_name: raw.official_source_name || raw.shortOrg || 'Nepal Gazette / Official Notice Bulletin',
    official_source_url: raw.official_source_url || raw.applyUrl || raw.officialNoticeUrl || 'https://psc.gov.np',
    applyUrl: raw.applyUrl || raw.official_source_url || 'https://psc.gov.np',
    officialNoticeUrl: raw.officialNoticeUrl || raw.official_source_url,
    source_document: raw.source_document || NOT_SPECIFIED,
    published_at: raw.published_at || raw.createdAt || nowStr,
    verified_at: raw.verified_at || nowStr,
    verified_by: raw.verified_by || 'SarkariSajha Editorial Board',
    status,
    noticeNumber: raw.noticeNumber || NOT_SPECIFIED,
    description: raw.description || `${title} recruitment notice published by ${org}.`,
    qualifications: structuredQual,
    syllabusPoints: raw.syllabusPoints || raw.syllabusSummary || [
      'Paper 1: General Knowledge & Intelligence Test',
      'Paper 2: Service-Specific / Contemporary Governance'
    ],
    syllabusSummary: raw.syllabusSummary || raw.syllabusPoints,
    createdAt: raw.createdAt || nowStr,
    updatedAt: raw.updatedAt || nowStr
  };
}

export function generateVacancySlug(title: string, id: string): string {
  const cleanTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const idSuffix = id ? id.replace(/[^a-z0-9]/gi, '').slice(-6) : Math.random().toString(36).slice(-6);
  return `${cleanTitle || 'vacancy'}-${idSuffix}`;
}

export function isVacancyPubliclyVisible(v: Vacancy): boolean {
  if ((v as any).isDemo === true) return false;
  const s = (v.status || '').toLowerCase();
  return s === 'published' || s === 'closing_soon' || s === 'expired';
}
