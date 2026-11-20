import {
  Vacancy,
  QuizSet,
  QuizQuestion,
  QuizAttempt,
  UserProfile,
  NotificationLog,
  ApplicationTrack,
  QuizCategoryItem,
  ExamProfile,
  QuestionSource,
  SyllabusPost,
  AdministrativeAlert,
  SubjectiveQuestion,
  AdminTeamMember
} from '../types';
import { normalizeVacancy } from '../utils/vacancyUtils';

export const INITIAL_QUIZ_CATEGORIES: QuizCategoryItem[] = [
  { id: 'cat_01', name: 'Lok Sewa / PSC', nameNp: 'लोक सेवा आयोग / सरकारी सेवा', slug: 'lok-sewa-psc', icon: 'Award', questionCount: 45, isCustom: false },
  { id: 'cat_02', name: 'General Knowledge', nameNp: 'सामान्य ज्ञान (General Knowledge)', slug: 'general-knowledge', icon: 'Globe', questionCount: 65, isCustom: false },
  { id: 'cat_03', name: 'Nepal GK', nameNp: 'नेपाल विशेष सामान्य ज्ञान', slug: 'nepal-gk', icon: 'MapPin', questionCount: 52, isCustom: false },
  { id: 'cat_04', name: 'Constitution', nameNp: 'नेपालको संविधान २०७२', slug: 'constitution', icon: 'Shield', questionCount: 35, isCustom: false },
  { id: 'cat_05', name: 'Governance', nameNp: 'सुशासन तथा शासकीय व्यवस्था', slug: 'governance', icon: 'CheckCircle', questionCount: 28, isCustom: false },
  { id: 'cat_06', name: 'Public Administration', nameNp: 'सार्वजनिक प्रशासन एवं व्यवस्थापन', slug: 'public-administration', icon: 'Building2', questionCount: 30, isCustom: false },
  { id: 'cat_07', name: 'History', nameNp: 'इतिहास (नेपाल र विश्व)', slug: 'history', icon: 'History', questionCount: 25, isCustom: false },
  { id: 'cat_08', name: 'Geography', nameNp: 'भूगोल (नेपाल र विश्व)', slug: 'geography', icon: 'Compass', questionCount: 32, isCustom: false },
  { id: 'cat_09', name: 'Economics', nameNp: 'अर्थतन्त्र, बजेट तथा योजना', slug: 'economics', icon: 'TrendingUp', questionCount: 26, isCustom: false },
  { id: 'cat_10', name: 'Science & Technology', nameNp: 'विज्ञान तथा प्रविधि', slug: 'science-technology', icon: 'Cpu', questionCount: 24, isCustom: false },
  { id: 'cat_11', name: 'Computer', nameNp: 'सूचना तथा सञ्चार प्रविधि (ICT)', slug: 'computer', icon: 'Laptop', questionCount: 30, isCustom: false },
  { id: 'cat_12', name: 'Mathematics', nameNp: 'गणित तथा अंकगणित', slug: 'mathematics', icon: 'Percent', questionCount: 22, isCustom: false },
  { id: 'cat_13', name: 'Logical Reasoning', nameNp: 'बौद्धिक परीक्षण (IQ / GMAT)', slug: 'logical-reasoning', icon: 'Brain', questionCount: 36, isCustom: false },
  { id: 'cat_14', name: 'English', nameNp: 'अंग्रेजी भाषा योग्यता', slug: 'english', icon: 'BookOpen', questionCount: 20, isCustom: false },
  { id: 'cat_15', name: 'Nepali', nameNp: 'नेपाली भाषा तथा व्याकरण', slug: 'nepali', icon: 'FileText', questionCount: 20, isCustom: false },
  { id: 'cat_16', name: 'Current Affairs', nameNp: 'समसामयिक घटनाक्रम', slug: 'current-affairs', icon: 'Sparkles', questionCount: 40, isCustom: false }
];

export const INITIAL_EXAM_PROFILES: ExamProfile[] = [
  {
    id: 'exam_officer',
    name: 'Section Officer (Sakha Adhikrit)',
    nameNp: 'शाखा अधिकृत (रा.प. तृतीय श्रेणी)',
    code: 'PSC-SO-7',
    organization: 'Public Service Commission (Lok Sewa Aayog)',
    level: 'Gazetted Class III (Officer Level 7)',
    defaultTimeMinutes: 45,
    defaultNegativeMarkRate: 0.20,
    syllabusOutline: [
      'Paper 1: General Knowledge (GK) - 50 Marks',
      'Paper 1: General Intelligence Test (IQ) - 30 Marks',
      'Paper 1: English Language Competence - 20 Marks',
      'Paper 2: Contemporary Governance & Public Administration',
      'Paper 3: Job-Specific Knowledge & Constitutional Law'
    ],
    description: 'Premier administrative & diplomatic cadre examination in Nepal with 20% negative marking on multiple-choice preliminary screening.'
  },
  {
    id: 'exam_nasu',
    name: 'Nayab Subba (NaSu)',
    nameNp: 'नायब सुब्बा (रा.प.अनं. प्रथम श्रेणी)',
    code: 'PSC-NASU-5',
    organization: 'Public Service Commission (Lok Sewa Aayog)',
    level: 'Non-Gazetted First Class (Level 5)',
    defaultTimeMinutes: 45,
    defaultNegativeMarkRate: 0.20,
    syllabusOutline: [
      'Paper 1: General Studies & Nepal GK (30 Qs)',
      'Paper 1: General Intelligence Test (IQ) (20 Qs)',
      'Paper 2: Service-related Subjective Paper (Administration/Revenue/Audit/Judicial)'
    ],
    description: 'Core administrative entry-level examination for intermediate/bachelor candidates across ministerial secretariats.'
  },
  {
    id: 'exam_kharidar',
    name: 'Kharidar (Khari)',
    nameNp: 'खरिदार (रा.प.अनं. द्वितीय श्रेणी)',
    code: 'PSC-KHARI-4',
    organization: 'Public Service Commission (Lok Sewa Aayog)',
    level: 'Non-Gazetted Second Class (Level 4)',
    defaultTimeMinutes: 45,
    defaultNegativeMarkRate: 0.20,
    syllabusOutline: [
      'Stage 1: Basic Knowledge Test (GK & Basic Math)',
      'Stage 2: Secondary Paper (Office Operation & Social Studies)'
    ],
    description: 'Foundational public service exam suitable for SEE/SLC and high school certificate holders.'
  },
  {
    id: 'exam_banking',
    name: 'Banking (NRB / NBL / RBB / ADBL)',
    nameNp: 'बैंकिङ सेवा (नेपाल राष्ट्र बैंक, राष्ट्रिय वाणिज्य बैंक, नेपाल बैंक, कृषि विकास बैंक)',
    code: 'BANK-ALL-45',
    organization: 'Public Financial Sector Recruitment Boards',
    level: 'Assistant Level 4 & Officer Level 6',
    defaultTimeMinutes: 45,
    defaultNegativeMarkRate: 0.20,
    syllabusOutline: [
      'Part 1: Banking Laws, BAFIA, NRB Act, AML/CFT',
      'Part 2: Economics, Accounting, Management & Computer Aptitude',
      'Part 3: Contemporary Financial Current Affairs'
    ],
    description: 'Competitive examinations for state-owned commercial and regulatory banking institutions in Nepal.'
  },
  {
    id: 'exam_police',
    name: 'Nepal Police / Armed Police Force (ASI / Inspector)',
    nameNp: 'नेपाल प्रहरी / सशस्त्र प्रहरी बल (स.इ. / निरीक्षक)',
    code: 'SECURITY-POLICE',
    organization: 'Nepal Police & Armed Police Force Headquarters',
    level: 'Sub-Inspector & Inspector',
    defaultTimeMinutes: 50,
    defaultNegativeMarkRate: 0.20,
    syllabusOutline: [
      'Paper 1: GK, Nepal Geography, Police Act, Human Rights',
      'Paper 2: English, Nepali Language & Professional Aptitude',
      'Physical & Medical Standard Verification'
    ],
    description: 'Security cadre examination covering legal procedures, criminal investigation basics, and fitness criteria.'
  },
  {
    id: 'exam_tsc',
    name: 'Teacher Service Commission (TSC)',
    nameNp: 'शिक्षक सेवा आयोग (प्रावि / निमावि / मावि)',
    code: 'TSC-ALL',
    organization: 'Teacher Service Commission (Shikshak Sewa Aayog)',
    level: 'Primary, Lower Secondary & Secondary Levels',
    defaultTimeMinutes: 60,
    defaultNegativeMarkRate: 0.20,
    syllabusOutline: [
      'General Paper: Education Acts, Child Psychology, ICT in Education, Nepal Constitution',
      'Subjective Paper: Specialized Subject Pedagogy'
    ],
    description: 'National licensing and permanent teacher appointment examination across all 7 provinces.'
  }
];

export const INITIAL_QUESTION_SOURCES: QuestionSource[] = [
  {
    id: 'src_01',
    title: 'Constitution of Nepal (2072) - Part 3 Fundamental Rights & Directive Principles',
    type: 'act',
    sourceText: 'Part 3 contains Articles 16 to 46 establishing 31 Fundamental Rights including Right to Live with Dignity (Art 16), Right to Freedom (Art 17), Right to Equality (Art 18), Right to Clean Environment (Art 30), and Right to Constitutional Remedies (Art 46). Article 242 establishes Public Service Commission.',
    referenceCitation: 'Nepal Gazette, Constitution of Nepal 2072 BS',
    addedBy: 'System Grounding Engine',
    createdAt: '2026-08-01'
  },
  {
    id: 'src_02',
    title: 'Civil Service Act (Nizamati Sewa Ain) 2049 & Regulation 2050',
    type: 'act',
    sourceText: 'The Civil Service Act regulates the recruitment, promotion, tenure, transfer, code of conduct, and disciplinary actions of government employees in Nepal. Civil Service Day is celebrated on Bhadra 22 every year in commemoration of Nizamati Sewa Ain 2013 BS.',
    referenceCitation: 'Nizamati Sewa Ain 2049, Law Commission of Nepal',
    addedBy: 'System Grounding Engine',
    createdAt: '2026-08-01'
  },
  {
    id: 'src_03',
    title: 'National Census 2078 (2021) Key Demographics & Economic Survey 2080/81',
    type: 'gazette',
    sourceText: 'National Population: 29,164,578. Population growth rate: 0.92% per annum. Sex ratio: 95.59 males per 100 females. Highest population density: Kathmandu (5,169/sq km). Lowest density: Manang (3/sq km). Province with highest population: Bagmati (20.97%).',
    referenceCitation: 'National Statistics Office (NSO) Census 2078 Report',
    addedBy: 'System Grounding Engine',
    createdAt: '2026-08-01'
  }
];

export const INITIAL_USER_PROFILE: UserProfile = {
  id: 'usr_default_01',
  name: 'Nitesh Gupta',
  email: 'guptanitesh3737@gmail.com',
  phone: '+977-9841234567',
  qualificationLevel: 'Bachelor Degree',
  fieldOfStudy: 'Computer Science & Engineering',
  province: 'Bagmati',
  age: 24,
  preferredCategories: ['Lok Sewa (PSC)', 'Banking & Finance', 'Teacher Service (TSC)'],
  notificationPrefs: {
    email: true,
    sms: true,
    push: true,
    frequency: 'instant'
  },
  resumeText: 'Graduated with Bachelor in Computer Engineering in 2024. Proficient in software development, database management, public administration basics, and data entry. Resident of Kathmandu, Bagmati Province. Age 24.'
};

export const INITIAL_VACANCIES: Vacancy[] = [
  normalizeVacancy({
    id: 'vac_psc_001',
    slug: 'section-officer-sakha-adhikrit-psc-001',
    title: 'Section Officer (Sakha Adhikrit) - Administrative & Foreign Service',
    titleNp: 'शाखा अधिकृत - प्रशासन तथा परराष्ट्र सेवा',
    organization: 'Public Service Commission (Lok Sewa Aayog Central Office)',
    org: 'Public Service Commission (Lok Sewa Aayog Central Office)',
    shortOrg: 'Lok Sewa Aayog',
    department: 'Ministry of Federal Affairs and General Administration',
    position: 'Section Officer (Sakha Adhikrit)',
    number_of_posts: 142,
    posts: 142,
    province: 'All Nepal',
    district: 'Kathmandu / All Examination Centers',
    job_level: 'Gazetted Class III (Officer Level 7)',
    level: 'Gazetted Class III (Officer Level 7)',
    employment_type: 'Permanent',
    qualification: 'Bachelor Degree',
    minQualification: 'Bachelor Degree',
    required_field: 'Bachelor Degree in any discipline recognized by Tribhuvan University / UGC Nepal',
    eligibleFields: ['Any Discipline', 'Public Administration', 'Law', 'Humanities', 'Management', 'Science'],
    experience: 'Not specified in the available official notice. Fresh graduates eligible.',
    age_requirement: { min: 21, maxMale: 35, maxFemale: 40, description: '21 to 35 years (up to 40 years for female and disabled candidates)' },
    category_requirements: { open: 78, female: 22, janajati: 18, madhesi: 14, dalit: 6, apanga: 2, pichhadiye: 2 },
    category: 'Lok Sewa (PSC)',
    application_fee: 1200,
    fee: 1200,
    application_start_date: '2026-08-01',
    application_deadline: '2026-08-28',
    deadline: '2026-08-28',
    singleFeeDeadline: '2026-08-28',
    doubleFeeDeadline: '2026-09-04',
    exam_date: '2026-09-25',
    examDate: '2026-09-25',
    salary: 'As per Nepal Civil Service Gazetted Class III Pay Scale (NPR 43,689 + allowances)',
    required_documents: [
      'Citizenship Certificate (Nagarikta Pramanpatra)',
      'Bachelor Degree Transcript and Character Certificate',
      'Recent Passport-sized Photograph',
      'Inclusion Group Recommendation Certificate (for Quota categories)'
    ],
    application_instructions: 'Submit online via the official PSC portal (pps.psc.gov.np), upload scanned copies of documents, and pay fees via ConnectIPS / eSewa / Bank voucher.',
    official_source_name: 'Lok Sewa Aayog Weekly Gazette Bulletin',
    official_source_url: 'https://pps.psc.gov.np',
    applyUrl: 'https://pps.psc.gov.np',
    source_document: 'Rajpatra Gazette Notice Vol. 74 No. 18',
    status: 'published',
    noticeNumber: '112/081-82',
    description: 'Recruitment for Gazetted Class III Section Officer positions across Administration, Revenue, Audit, and Foreign Affairs cadres.',
    qualifications: {
      minLevel: 'Bachelor Degree',
      fields: ['Any', 'Humanities', 'Management', 'Science', 'Law', 'Engineering'],
      minAge: 21,
      maxAge: 35
    },
    syllabusPoints: [
      'Paper 1: General Knowledge (GK) & General Intelligent Test (IQ)',
      'Paper 2: Contemporary Issues & Public Governance',
      'Paper 3: Job-related Knowledge (Administration/Foreign Service)',
      'Paper 4: Foreign Language / Policy Analytical Test'
    ],
    createdAt: '2026-08-01'
  }),
  normalizeVacancy({
    id: 'vac_psc_002',
    slug: 'computer-officer-it-specialist-psc-002',
    title: 'Computer Officer / IT Specialist',
    titleNp: 'कम्प्युटर अधिकृत / सूचना प्रविधि विज्ञ',
    organization: 'Ministry of Communication & Information Technology',
    org: 'Ministry of Communication & Information Technology',
    shortOrg: 'Lok Sewa Aayog (Engineering)',
    department: 'Department of Information Technology',
    position: 'Computer Officer (Engineering / IT)',
    number_of_posts: 28,
    posts: 28,
    province: 'Bagmati',
    district: 'Kathmandu',
    job_level: 'Gazetted Class III (Technical Level 7)',
    level: 'Gazetted Class III (Technical Level 7)',
    employment_type: 'Permanent',
    qualification: 'Bachelor Degree',
    minQualification: 'Bachelor Degree',
    required_field: 'Bachelor Degree in Computer Engineering, Computer Science, BIT, BCA, or Information Technology',
    eligibleFields: ['Computer Engineering', 'Computer Science', 'BIT', 'BCA', 'IT'],
    experience: 'Not specified in the available official notice. Fresh engineering graduates eligible.',
    age_requirement: { min: 21, maxMale: 35, maxFemale: 40, description: '21 to 35 years (up to 40 for women and persons with disabilities)' },
    category_requirements: { open: 16, female: 5, janajati: 4, madhesi: 2, dalit: 1 },
    category: 'Lok Sewa (PSC)',
    application_fee: 1200,
    fee: 1200,
    application_start_date: '2026-07-28',
    application_deadline: '2026-08-18',
    deadline: '2026-08-18',
    singleFeeDeadline: '2026-08-18',
    doubleFeeDeadline: '2026-08-25',
    exam_date: '2026-09-12',
    examDate: '2026-09-12',
    salary: 'Civil Service Gazetted Technical Level 7 Scale (NPR 43,689 + Tech Allowance)',
    required_documents: [
      'Citizenship Certificate',
      'Bachelor in Engineering/IT Degree & Transcript',
      'Nepal Engineering Council (NEC) Registration Certificate',
      'Digital Signature & Scanned Photo'
    ],
    application_instructions: 'Complete candidate registration at pps.psc.gov.np, choose Engineering / IT cadre, and pay fee before deadline.',
    official_source_name: 'Lok Sewa Aayog Technical Gazette',
    official_source_url: 'https://pps.psc.gov.np',
    applyUrl: 'https://pps.psc.gov.np',
    status: 'closing_soon',
    noticeNumber: '115/081-82',
    description: 'Technical recruitment for Computer Engineers, Computer Officers, and IT Analysts to modernize government digital services.',
    qualifications: {
      minLevel: 'Bachelor Degree',
      fields: ['Computer Engineering', 'Computer Science', 'BIT', 'BCA', 'IT'],
      minAge: 21,
      maxAge: 35
    },
    syllabusPoints: [
      'Part A: General Studies & Fundamental Computer Engineering Concepts',
      'Part B: Database Systems, Network Security, Software Engineering & Cloud Governance in Nepal',
      'Practical / Coding Evaluation & Cyber Law Interview'
    ],
    createdAt: '2026-07-28'
  }),
  normalizeVacancy({
    id: 'vac_nbl_003',
    slug: 'junior-assistant-it-assistant-nbl-003',
    title: 'Junior Assistant & IT Assistant (Prabidhik)',
    titleNp: 'कनिष्ठ सहायक तथा कम्प्युटर सहायक',
    organization: 'Nepal Bank Limited Central Office, Dharmapath',
    org: 'Nepal Bank Limited Central Office, Dharmapath',
    shortOrg: 'Nepal Bank Limited',
    department: 'Human Resources Management Department',
    position: 'Junior Assistant / IT Assistant Level 3 & 4',
    number_of_posts: 85,
    posts: 85,
    province: 'All Nepal',
    district: 'Branches Across All 7 Provinces',
    job_level: 'Level 3 / Level 4 Assistant',
    level: 'Level 3 / Level 4 Assistant',
    employment_type: 'Permanent',
    qualification: '+2 High School',
    minQualification: '+2 High School',
    required_field: '+2 or equivalent with minimum second division in Management, Commerce, Economics, or Science / IT',
    eligibleFields: ['Management', 'Commerce', 'Computer Science', 'Economics', 'Science'],
    experience: 'Not specified in the available official notice.',
    age_requirement: { min: 18, maxMale: 35, maxFemale: 40, description: '18 to 35 years (up to 40 for female candidates)' },
    category_requirements: { open: 46, female: 14, janajati: 11, madhesi: 8, dalit: 4, apanga: 1, pichhadiye: 1 },
    category: 'Banking & Finance',
    application_fee: 800,
    fee: 800,
    application_start_date: '2026-08-04',
    application_deadline: '2026-09-05',
    deadline: '2026-09-05',
    singleFeeDeadline: '2026-09-05',
    doubleFeeDeadline: '2026-09-12',
    exam_date: '2026-10-10',
    examDate: '2026-10-10',
    salary: 'Nepal Bank Staff Service Regulations Assistant Level (Grade 3/4)',
    required_documents: [
      'Citizenship Card Copy',
      '+2 / Intermediate Academic Transcript',
      'Passport Size Photo',
      'Quota Category Endorsement Letter'
    ],
    application_instructions: 'Apply online through Nepal Bank recruitment portal (apply.nepalbank.com.np) and deposit application fee online.',
    official_source_name: 'Gorkhapatra National Daily & Nepal Bank Portal',
    official_source_url: 'https://apply.nepalbank.com.np',
    applyUrl: 'https://apply.nepalbank.com.np',
    status: 'published',
    noticeNumber: 'NBL/REC/2081-82/04',
    description: 'Career opportunities in banking operations, loan processing, teller management, and IT branch operations across 7 provinces.',
    qualifications: {
      minLevel: '+2 High School',
      fields: ['Management', 'Commerce', 'Computer Science', 'Economics', 'Science'],
      minAge: 18,
      maxAge: 35
    },
    syllabusPoints: [
      'Written Phase 1: Banking, Accounting, Monetary Policy, Economics, Maths & Reasoning',
      'Written Phase 2: Computer & Office Automation / General Knowledge',
      'Interview & Group Discussion'
    ],
    createdAt: '2026-08-04'
  }),
  normalizeVacancy({
    id: 'vac_tsc_004',
    slug: 'secondary-level-teacher-tsc-004',
    title: 'Secondary Level Teacher (Madhyamik Shikshak - Science & Math)',
    titleNp: 'माध्यमिक तह शिक्षक (विज्ञान तथा गणित)',
    organization: 'Shikshak Sewa Aayog (TSC), Sanothimi Bhaktapur',
    org: 'Shikshak Sewa Aayog (TSC), Sanothimi Bhaktapur',
    shortOrg: 'Teachers Service Commission',
    department: 'Examination and Teacher Selection Division',
    position: 'Secondary Level Teacher (Class 9-12)',
    number_of_posts: 64,
    posts: 64,
    province: 'Gandaki',
    district: 'Pokhara & Gandaki Districts',
    job_level: 'Secondary Level (Class 9-12)',
    level: 'Secondary Level (Class 9-12)',
    employment_type: 'Permanent',
    qualification: 'Bachelor Degree',
    minQualification: 'Bachelor Degree',
    required_field: 'Bachelor Degree in Science / Mathematics / Education with valid Secondary Teaching License',
    eligibleFields: ['Science', 'Education (B.Ed)', 'Mathematics', 'Physics', 'Chemistry'],
    experience: 'Teaching License required; prior classroom experience preferred.',
    age_requirement: { min: 18, maxMale: 40, maxFemale: 40, description: '18 to 40 years as per Teachers Service Commission Regulations' },
    category_requirements: { open: 36, female: 10, janajati: 8, madhesi: 6, dalit: 3, apanga: 1 },
    category: 'Teacher Service (TSC)',
    application_fee: 1000,
    fee: 1000,
    application_start_date: '2026-08-02',
    application_deadline: '2026-08-30',
    deadline: '2026-08-30',
    singleFeeDeadline: '2026-08-30',
    doubleFeeDeadline: '2026-09-06',
    exam_date: '2026-10-02',
    examDate: '2026-10-02',
    salary: 'Secondary Teacher Government Grade Scale + Dearness Allowances',
    required_documents: [
      'Citizenship Certificate',
      'Bachelor Degree in relevant subject transcript',
      'Valid Permanent Secondary Teaching License from TSC',
      'Inclusive category certified documents'
    ],
    application_instructions: 'Register at online.tsc.gov.np, verify teaching license roll number, select Gandaki region, and submit application.',
    official_source_name: 'TSC Official Notice Sanothimi',
    official_source_url: 'https://online.tsc.gov.np',
    applyUrl: 'https://online.tsc.gov.np',
    status: 'published',
    noticeNumber: 'TSC/REC/81-02',
    description: 'Permanent teaching positions in community secondary schools across Gandaki Province for qualified subject teachers with teaching license.',
    qualifications: {
      minLevel: 'Bachelor Degree',
      fields: ['Science', 'Education (B.Ed)', 'Mathematics', 'Physics', 'Chemistry'],
      minAge: 18,
      maxAge: 40
    },
    syllabusPoints: [
      'General Exam: Educational Pedagogy, Science Pedagogy, ICT in Teaching, GK',
      'Subjective Exam: Advanced Curriculum, Pedagogy & Problem Solving',
      'Teaching Demonstration & Interview'
    ],
    createdAt: '2026-08-02'
  }),
  normalizeVacancy({
    id: 'vac_np_005',
    slug: 'assistant-sub-inspector-asi-police-inspector-np-005',
    title: 'Assistant Sub-Inspector (ASI) & Police Inspector',
    titleNp: 'प्रहरी सहायक निरीक्षक (ASI) तथा प्रहरी निरीक्षक',
    organization: 'Nepal Police Headquarters Recruitment Division, Naxal',
    org: 'Nepal Police Headquarters Recruitment Division, Naxal',
    shortOrg: 'Nepal Police Headquarter',
    department: 'Human Resource Department, Recruitment & Selection Section',
    position: 'Assistant Sub-Inspector (ASI)',
    number_of_posts: 210,
    posts: 210,
    province: 'All Nepal',
    district: 'Designated Police Training Centers across Nepal',
    job_level: 'Non-Gazetted Class I / Officers',
    level: 'Non-Gazetted Class I / Officers',
    employment_type: 'Permanent',
    qualification: '+2 High School',
    minQualification: '+2 High School',
    required_field: '+2 or equivalent in any stream with minimum physical health benchmarks',
    eligibleFields: ['Any'],
    experience: 'Not specified in the available official notice.',
    age_requirement: { min: 18, maxMale: 24, maxFemale: 24, description: '18 to 24 years on the date of vacancy announcement' },
    category_requirements: { open: 115, female: 32, janajati: 28, madhesi: 22, dalit: 10, pichhadiye: 3 },
    category: 'Security Forces',
    application_fee: 500,
    fee: 500,
    application_start_date: '2026-08-05',
    application_deadline: '2026-09-15',
    deadline: '2026-09-15',
    singleFeeDeadline: '2026-09-15',
    doubleFeeDeadline: '2026-09-22',
    exam_date: '2026-10-20',
    examDate: '2026-10-20',
    salary: 'Nepal Police Non-Gazetted 1st Class Uniformed Pay Scale with Ration & Risk Allowance',
    required_documents: [
      'Nepali Citizenship Document',
      '+2 Academic Certificate / Transcript',
      'Medical & Physical Fitness Certificate',
      'Passport Sized Photographs'
    ],
    application_instructions: 'Complete online registration at career.nepalpolice.gov.np and present hard copies during the initial physical evaluation date.',
    official_source_name: 'Nepal Police Headquarters Gazette',
    official_source_url: 'https://career.nepalpolice.gov.np',
    applyUrl: 'https://career.nepalpolice.gov.np',
    status: 'published',
    noticeNumber: 'NP/REC/2081-09',
    description: 'Enrolment for Assistant Sub-Inspector (ASI) and Inspector cadres with rigorous physical stamina evaluation, written tests, and medical screening.',
    qualifications: {
      minLevel: '+2 High School',
      fields: ['Any'],
      minAge: 18,
      maxAge: 24
    },
    syllabusPoints: [
      'Phase 1: Physical Bearings, Endurance & Physical Fitness Test',
      'Phase 2: Written Examination (English, Nepali, GK, IQ, Police Regulations & Criminal Law)',
      'Phase 3: Detailed Medical Inspection & Board Interview'
    ],
    createdAt: '2026-08-05'
  }),
  normalizeVacancy({
    id: 'vac_koshi_006',
    slug: 'koshi-pradesh-sub-engineer-civil-it-koshi-006',
    title: 'Koshi Pradesh Sub-Engineer (Civil & IT Assistant)',
    titleNp: 'कोशी प्रदेश सब-इन्जिनियर तथा सहायक पाँचौँ',
    organization: 'Koshi Pradesh Public Service Commission, Biratnagar',
    org: 'Koshi Pradesh Public Service Commission, Biratnagar',
    shortOrg: 'Koshi Pradesh PSC',
    department: 'Provincial Ministry of Physical Infrastructure & Development',
    position: 'Sub-Engineer (Civil / IT Assistant)',
    number_of_posts: 42,
    posts: 42,
    province: 'Koshi',
    district: 'Biratnagar / Koshi Districts',
    job_level: 'Non-Gazetted Class I (Level 5)',
    level: 'Non-Gazetted Class I (Level 5)',
    employment_type: 'Permanent',
    qualification: '+2 High School',
    minQualification: '+2 High School',
    required_field: 'Diploma in Civil Engineering or +2 in Computer Science / IT',
    eligibleFields: ['Diploma in Civil Engineering', 'Computer Science', 'Science', 'Management'],
    experience: 'Not specified in the available official notice.',
    age_requirement: { min: 18, maxMale: 35, maxFemale: 40, description: '18 to 35 years (up to 40 for female candidates)' },
    category_requirements: { open: 24, female: 7, janajati: 5, madhesi: 4, dalit: 2 },
    category: 'Provincial Lok Sewa',
    application_fee: 700,
    fee: 700,
    application_start_date: '2026-08-03',
    application_deadline: '2026-08-22',
    deadline: '2026-08-22',
    singleFeeDeadline: '2026-08-22',
    doubleFeeDeadline: '2026-08-29',
    exam_date: '2026-09-18',
    examDate: '2026-09-18',
    salary: 'Koshi Provincial Civil Service Level 5 Scale',
    required_documents: [
      'Citizenship Copy',
      'Diploma in Engineering Certificate / Transcript',
      'Koshi Province Permanent Resident proof if applying for local quotas'
    ],
    application_instructions: 'Apply online through psc.koshi.gov.np and pay via designated provincial revenue banks.',
    official_source_name: 'Koshi Pradesh Gazette Biratnagar',
    official_source_url: 'https://psc.koshi.gov.np',
    applyUrl: 'https://psc.koshi.gov.np',
    status: 'published',
    noticeNumber: 'KP-PSC-81/82-03',
    description: 'Provincial administrative and technical posts for infrastructure development, rural electrification, and local e-governance in Koshi Province.',
    qualifications: {
      minLevel: '+2 High School',
      fields: ['Diploma in Civil Engineering', 'Computer Science', 'Science', 'Management'],
      minAge: 18,
      maxAge: 35
    },
    syllabusPoints: [
      'Paper 1: General Knowledge, General Intelligence & Koshi Provincial Geography/Culture',
      'Paper 2: Technical Civil/IT Engineering Subjective Paper'
    ],
    createdAt: '2026-08-03'
  }),
  normalizeVacancy({
    id: 'vac_stat_007',
    slug: 'statistical-assistant-2026',
    title: 'Statistical Assistant (Tathyaank Sahayak - Level 5)',
    titleNp: 'तथ्याङ्क सहायक (रा.प.अनं. प्रथम श्रेणी - प्राविधिक)',
    organization: 'National Statistics Office (NSO) / Central Bureau of Statistics',
    org: 'National Statistics Office (NSO) / Central Bureau of Statistics',
    shortOrg: 'National Statistics Office',
    department: 'Economic Statistics & Census Division, Thapathali',
    position: 'Statistical Assistant (Non-Gazetted 1st Class)',
    number_of_posts: 34,
    posts: 34,
    province: 'All Nepal',
    district: 'Kathmandu / All 77 Districts',
    job_level: 'Non-Gazetted First Class (Level 5)',
    level: 'Non-Gazetted First Class (Level 5)',
    employment_type: 'Permanent',
    qualification: '+2 High School',
    minQualification: '+2 High School',
    required_field: '+2 or Intermediate with Statistics, Mathematics, Economics, or Computer Science as a major subject',
    eligibleFields: ['Statistics', 'Mathematics', 'Economics', 'Computer Science', 'Commerce'],
    experience: 'Not specified in the available official notice. Fresh candidates eligible.',
    age_requirement: { min: 18, maxMale: 35, maxFemale: 40, description: '18 to 35 years (up to 40 years for female and differently-abled applicants)' },
    category_requirements: { open: 19, female: 5, janajati: 4, madhesi: 3, dalit: 2, apanga: 1 },
    category: 'Lok Sewa (PSC)',
    application_fee: 700,
    fee: 700,
    application_start_date: '2026-08-10',
    application_deadline: '2026-09-08',
    deadline: '2026-09-08',
    singleFeeDeadline: '2026-09-08',
    doubleFeeDeadline: '2026-09-15',
    exam_date: '2026-10-15',
    examDate: '2026-10-15',
    salary: 'Civil Service Non-Gazetted 1st Class Grade Scale (NPR 32,902 + Field Allowances)',
    required_documents: [
      'Citizenship Certificate Copy',
      '+2 or Equivalent Transcript with Statistics/Math/Economics/CS',
      'Passport Size Photo',
      'Quota Category Recommendation (if applicable)'
    ],
    application_instructions: 'Submit online application through the Lok Sewa Aayog online application system (pps.psc.gov.np) selecting Statistical Cadre.',
    official_source_name: 'Lok Sewa Aayog Central Bulletin & NSO Nepal',
    official_source_url: 'https://pps.psc.gov.np',
    applyUrl: 'https://pps.psc.gov.np',
    status: 'published',
    noticeNumber: 'वि.नं. १४३२१-१४३२७/०८१-८२',
    description: 'Recruitment for Statistical Assistants across statistical directorates, national census verification units, and provincial planning commissions in Nepal.',
    qualifications: {
      minLevel: '+2 High School',
      fields: ['Statistics', 'Mathematics', 'Economics', 'Computer Science'],
      minAge: 18,
      maxAge: 35
    },
    syllabusPoints: [
      'Paper 1: General Knowledge, General Intelligence & Basic Mathematical Reasoning (50 Qs)',
      'Paper 2: Applied Statistics, Sampling Methods, Survey Design & National Accounts'
    ],
    createdAt: '2026-08-10'
  }),
  normalizeVacancy({
    id: 'vac_agr_008',
    slug: 'agriculture-officer-plant-protection-008',
    title: 'Agriculture Development Officer (Krishi Adhikrit)',
    titleNp: 'कृषि विकास अधिकृत (रा.प.तृतीय श्रेणी)',
    organization: 'Ministry of Agriculture & Livestock Development, Singha Durbar',
    org: 'Ministry of Agriculture & Livestock Development',
    shortOrg: 'MoALD Nepal',
    department: 'Department of Agriculture, Harihar Bhawan',
    position: 'Agriculture Officer (Technical Level 7)',
    number_of_posts: 18,
    posts: 18,
    province: 'Lumbini',
    district: 'Butwal & Lumbini Agricultural Hubs',
    job_level: 'Gazetted Class III (Technical Level 7)',
    level: 'Gazetted Class III (Technical Level 7)',
    employment_type: 'Permanent',
    qualification: 'Bachelor Degree',
    minQualification: 'Bachelor Degree',
    required_field: 'B.Sc. Agriculture (B.Sc. Ag) or equivalent from a recognized university',
    eligibleFields: ['B.Sc. Agriculture', 'Horticulture', 'Agronomy', 'Plant Protection', 'Soil Science'],
    experience: 'Not specified in the available official notice.',
    age_requirement: { min: 21, maxMale: 35, maxFemale: 40, description: '21 to 35 years (up to 40 for women)' },
    category_requirements: { open: 10, female: 3, janajati: 2, madhesi: 2, dalit: 1 },
    category: 'Lok Sewa (PSC)',
    application_fee: 1200,
    fee: 1200,
    application_start_date: '2026-08-01',
    application_deadline: '2026-08-29',
    deadline: '2026-08-29',
    singleFeeDeadline: '2026-08-29',
    doubleFeeDeadline: '2026-09-05',
    exam_date: '2026-09-28',
    examDate: '2026-09-28',
    salary: 'Gazetted Class III Technical Pay Scale',
    required_documents: [
      'Citizenship Certificate',
      'B.Sc. Ag Transcript and Character Certificate',
      'Nepal Agriculture Council Registration (if applicable)'
    ],
    application_instructions: 'Register at pps.psc.gov.np under Agriculture Engineering/Technical group.',
    official_source_name: 'Lok Sewa Aayog Bulletin',
    official_source_url: 'https://pps.psc.gov.np',
    applyUrl: 'https://pps.psc.gov.np',
    status: 'published',
    noticeNumber: '118/081-82',
    description: 'Technical officer positions for extension services, soil quality testing, seed certification, and modern agricultural mechanization.',
    qualifications: {
      minLevel: 'Bachelor Degree',
      fields: ['B.Sc. Agriculture', 'Horticulture', 'Agronomy', 'Plant Protection'],
      minAge: 21,
      maxAge: 35
    },
    syllabusPoints: [
      'Paper 1: General Knowledge, General Governance & Agriculture Sector Overview',
      'Paper 2: Agronomy, Horticulture, Soil Science, Entomology & Extension Methodologies'
    ],
    createdAt: '2026-08-01'
  }),
  normalizeVacancy({
    id: 'vac_nrb_009',
    slug: 'assistant-director-chartered-accountant-nrb-009',
    title: 'Assistant Director (Chartered Accountant / Officer Level 8)',
    titleNp: 'सहायक निर्देशक (चार्टर्ड एकाउन्टेन्ट - अधिकृत स्तर ८)',
    organization: 'Nepal Rastra Bank Central Office, Baluwatar',
    org: 'Nepal Rastra Bank Central Office, Baluwatar',
    shortOrg: 'Nepal Rastra Bank',
    department: 'Bank Supervision & Foreign Exchange Management Department',
    position: 'Assistant Director (Officer Level 8)',
    number_of_posts: 12,
    posts: 12,
    province: 'Bagmati',
    district: 'Kathmandu',
    job_level: 'Officer Level 8',
    level: 'Officer Level 8',
    employment_type: 'Permanent',
    qualification: 'Master Degree',
    minQualification: 'Master Degree',
    required_field: 'Chartered Accountancy (CA / ACCA) or Master Degree in Finance / Economics / Management',
    eligibleFields: ['Chartered Accountancy (CA)', 'ACCA', 'Master of Business Studies (MBS)', 'MBA (Finance)', 'Economics'],
    experience: 'Minimum 1 year post-qualification experience in banking or financial audit preferred.',
    age_requirement: { min: 21, maxMale: 35, maxFemale: 40, description: '21 to 35 years (up to 40 for female candidates)' },
    category_requirements: { open: 7, female: 2, janajati: 1, madhesi: 1, dalit: 1 },
    category: 'Banking & Finance',
    application_fee: 1500,
    fee: 1500,
    application_start_date: '2026-08-05',
    application_deadline: '2026-09-02',
    deadline: '2026-09-02',
    singleFeeDeadline: '2026-09-02',
    doubleFeeDeadline: '2026-09-09',
    exam_date: '2026-10-08',
    examDate: '2026-10-08',
    salary: 'Nepal Rastra Bank Officer Level 8 Scale (approx NPR 72,000 + Central Bank Allowances)',
    required_documents: [
      'Citizenship Certificate',
      'ICAN / ACCA Membership Certificate',
      'Master Degree Transcript',
      'Character Certificate'
    ],
    application_instructions: 'Complete application at jobs.nrb.org.np and upload certified CA/Master credentials.',
    official_source_name: 'Nepal Rastra Bank Gazette & Gorkhapatra',
    official_source_url: 'https://jobs.nrb.org.np',
    applyUrl: 'https://jobs.nrb.org.np',
    status: 'published',
    noticeNumber: 'NRB/HR/081-82/01',
    description: 'High-responsibility central banking role overseeing monetary surveillance, commercial bank inspections, AML/CFT compliance, and macro-financial stability.',
    qualifications: {
      minLevel: 'Master Degree',
      fields: ['Chartered Accountancy', 'Finance', 'Economics', 'Management'],
      minAge: 21,
      maxAge: 35
    },
    syllabusPoints: [
      'Phase 1: Central Banking, BAFIA, IFRS, NRB Directives, Macroeconomics & Financial Analysis',
      'Phase 2: Auditing, Forensic Accounting, Risk Management & Banking Law Case Studies',
      'Phase 3: Presentation & Interview'
    ],
    createdAt: '2026-08-05'
  }),
  normalizeVacancy({
    id: 'vac_hlth_010',
    slug: 'staff-nurse-health-assistant-madhesh-010',
    title: 'Staff Nurse & Health Assistant (HA - Level 5)',
    titleNp: 'स्टाफ नर्स तथा हेल्थ असिस्टेन्ट (तह ५)',
    organization: 'Madhesh Pradesh Public Service Commission, Janakpurdham',
    org: 'Madhesh Pradesh Public Service Commission, Janakpurdham',
    shortOrg: 'Madhesh Pradesh PSC',
    department: 'Provincial Ministry of Health and Population',
    position: 'Staff Nurse / Health Assistant',
    number_of_posts: 58,
    posts: 58,
    province: 'Madhesh',
    district: 'Janakpur, Birgunj, Sarlahi & Dhanusha District Hospitals',
    job_level: 'Non-Gazetted Class I (Level 5)',
    level: 'Non-Gazetted Class I (Level 5)',
    employment_type: 'Permanent',
    qualification: '+2 High School',
    minQualification: '+2 High School',
    required_field: 'PCL Nursing (Proficiency Certificate in Nursing) or General Medicine (HA) with valid NNC/NHPC registration',
    eligibleFields: ['PCL Nursing', 'General Medicine (HA)', 'Health Sciences', 'Pharmacy'],
    experience: 'Not specified in the available official notice.',
    age_requirement: { min: 18, maxMale: 35, maxFemale: 40, description: '18 to 35 years (up to 40 for women)' },
    category_requirements: { open: 30, female: 12, janajati: 6, madhesi: 6, dalit: 3, apanga: 1 },
    category: 'Health Services',
    application_fee: 700,
    fee: 700,
    application_start_date: '2026-08-07',
    application_deadline: '2026-09-04',
    deadline: '2026-09-04',
    singleFeeDeadline: '2026-09-04',
    doubleFeeDeadline: '2026-09-11',
    exam_date: '2026-10-12',
    examDate: '2026-10-12',
    salary: 'Madhesh Province Health Service Grade Level 5 Scale',
    required_documents: [
      'Citizenship Certificate',
      'PCL Nursing / HA Certificate & Academic Transcript',
      'Nepal Nursing Council (NNC) or Nepal Health Professional Council (NHPC) Registration',
      'Permanent Resident Proof for Madhesh Province quota'
    ],
    application_instructions: 'Register online at psc.madhesh.gov.np and submit council registration details.',
    official_source_name: 'Madhesh Pradesh Rajpatra Janakpur',
    official_source_url: 'https://psc.madhesh.gov.np',
    applyUrl: 'https://psc.madhesh.gov.np',
    status: 'published',
    noticeNumber: 'MP-PSC-HLTH-81/82-05',
    description: 'Clinical nursing and primary healthcare positions across provincial hospitals and community health centers in Madhesh Province.',
    qualifications: {
      minLevel: '+2 High School',
      fields: ['PCL Nursing', 'General Medicine (HA)', 'Health Sciences'],
      minAge: 18,
      maxAge: 35
    },
    syllabusPoints: [
      'Paper 1: Medical GK, Public Health Programs of Nepal, Constitution & Health Acts',
      'Paper 2: Clinical Nursing, Emergency Medicine, Pharmacology, Community Health & Maternal Care'
    ],
    createdAt: '2026-08-07'
  })
];

export const INITIAL_QUIZ_SETS: QuizSet[] = [
  {
    id: 'quiz_set_001',
    title: 'Lok Sewa Paper 1: General Knowledge & IQ Mock 1',
    titleNp: 'लोक सेवा प्रथम पत्र: सामान्य ज्ञान तथा बौद्धिक परीक्षण नमुना १',
    category: 'Lok Sewa / PSC',
    level: 'Officer & NaSu Level (Section Officer / Nayab Subba)',
    timeLimitMinutes: 20,
    totalQuestions: 12,
    passThreshold: 0.40,
    negativeMarkRate: 0.20,
    randomizeQuestions: true,
    randomizeOptions: true,
    description: 'Comprehensive GK & IQ mock exam based on Nepal geography, constitution, current affairs, and logical reasoning with negative marking.',
    descriptionNp: 'नेपालको भूगोल, संविधान, समसामयिक विषय र तर्कशास्त्रमा आधारित नमुना वस्तुगत परीक्षा।'
  },
  {
    id: 'quiz_set_002',
    title: 'Nepal Banking & Financial Practice Test',
    titleNp: 'नेपाल बैंकिङ तथा वित्तीय संस्था तयारी परीक्षा',
    category: 'Economics',
    level: 'Assistant & Junior Assistant Level',
    timeLimitMinutes: 15,
    totalQuestions: 8,
    passThreshold: 0.50,
    negativeMarkRate: 0.20,
    randomizeQuestions: false,
    randomizeOptions: false,
    description: 'Covers Nepal Rastra Bank Act, Banking Offence Act, Monetary Policy basics, and quantitative aptitude.',
    descriptionNp: 'नेपाल राष्ट्र बैंक ऐन, बैंकिङ कसूर, मौद्रिक नीति र गणितीय क्षमता सम्बन्धी प्रश्नहरू।'
  },
  {
    id: 'quiz_set_003',
    title: 'Computer Operator & ICT Specialist Skill Test',
    titleNp: 'कम्प्युटर अपरेटर तथा IT परीक्षा अभ्यास',
    category: 'Computer',
    level: 'Assistant Level 5 / Officer Level 7',
    timeLimitMinutes: 15,
    totalQuestions: 8,
    passThreshold: 0.50,
    negativeMarkRate: 0.20,
    randomizeQuestions: true,
    randomizeOptions: false,
    description: 'Covers Hardware, Operating Systems, Networking, Cyber Security, Nepal IT Policy & MS Office fundamentals.',
    descriptionNp: 'कम्प्युटर प्रणाली, सञ्जाल, साइबर सुरक्षा, नेपालको सुचना प्रविधि नीति र कार्यालय स्वचालित सम्बन्धी प्रश्नहरू।'
  },
  {
    id: 'quiz_set_004',
    title: 'Nepal Constitution & Good Governance Mastery',
    titleNp: 'नेपालको संविधान र सुशासन विशेष सेट',
    category: 'Constitution',
    level: 'Gazetted Officer Level',
    timeLimitMinutes: 15,
    totalQuestions: 6,
    passThreshold: 0.50,
    negativeMarkRate: 0.20,
    randomizeQuestions: true,
    randomizeOptions: true,
    description: 'Features Multiple Choice, True/False and Multi-select questions covering constitutional rights, directive principles and administrative law.',
    descriptionNp: 'संवैधानिक हक, राज्यका निर्देशक सिद्धान्त र प्रशासनिक कानुनमा आधारित बहुविकल्पीय तथा बहुउत्तर प्रश्नहरू।'
  }
];

export const INITIAL_QUIZ_QUESTIONS: QuizQuestion[] = [
  // Set 1 Questions
  {
    id: 'q_001',
    quizSetId: 'quiz_set_001',
    question: 'Which is the highest waterfall in Nepal according to the recent official survey?',
    questionText: 'Which is the highest waterfall in Nepal according to the recent official survey?',
    questionTextNp: 'हालैको आधिकारिक सर्वेक्षण अनुसार नेपालको सबैभन्दा अग्लो झरना कुन हो?',
    questionType: 'multiple_choice',
    options: ['Hyatung Waterfall', 'Pachal Waterfall', 'Thudam Waterfall', 'Davis Falls'],
    optionsNp: ['ह्यातुङ झरना', 'पचाल झरना', 'थुदाम झरना', 'डेभिस फल्स'],
    correctOption: 1, // Pachal Waterfall (Kalikot) - 381m
    correct_answer: 1,
    explanation: 'Pachal Waterfall in Kalikot district (381 meters high) is officially recognized as the tallest waterfall in Nepal, surpassing Hyatung Waterfall (365 meters).',
    explanationNp: 'कालिकोट जिल्लामा रहेको पचाल झरना (३८१ मिटर अग्लो) नेपालको सबैभन्दा अग्लो झरना मानिन्छ, जसले तेह्रथुमको ह्यातुङ झरना (३६५ मिटर) लाई पछाडि पारेको छ।',
    subject: 'Nepal GK',
    topic: 'Nepal Geography',
    difficulty: 'medium',
    language: 'bilingual',
    source: 'Survey Department & Karnali Province Profile',
    status: 'published'
  },
  {
    id: 'q_002',
    quizSetId: 'quiz_set_001',
    question: 'Under the Constitution of Nepal, how many Fundamental Rights are guaranteed to Nepali citizens?',
    questionText: 'Under the Constitution of Nepal, how many Fundamental Rights are guaranteed to Nepali citizens?',
    questionTextNp: 'नेपालको वर्तमान संविधान अनुसार नेपाली नागरिकहरूलाई कतिवटा मौलिक हकको व्यवस्था गरिएको छ?',
    questionType: 'multiple_choice',
    options: ['21 Fundamental Rights', '25 Fundamental Rights', '31 Fundamental Rights', '35 Fundamental Rights'],
    optionsNp: ['२१ वटा मौलिक हक', '२५ वटा मौलिक हक', '३१ वटा मौलिक हक', '३५ वटा मौलिक हक'],
    correctOption: 2, // 31
    correct_answer: 2,
    explanation: 'Part 3 (Articles 16 to 46) of the Constitution of Nepal guarantees 31 Fundamental Rights (मौलिक हक) ranging from Right to Freedom to Right to Constitutional Remedies.',
    explanationNp: 'नेपालको संविधानको भाग ३ (धारा १६ देखि ४६ सम्म) ३१ वटा मौलिक हकहरूको व्यवस्था गरिएको छ।',
    subject: 'Constitution',
    topic: 'Fundamental Rights',
    difficulty: 'easy',
    language: 'bilingual',
    source: 'Constitution of Nepal 2072 Part 3',
    status: 'published'
  },
  {
    id: 'q_003',
    quizSetId: 'quiz_set_001',
    question: 'Complete the IQ sequence: 3, 7, 15, 31, 63, ?',
    questionText: 'Complete the IQ sequence: 3, 7, 15, 31, 63, ?',
    questionTextNp: 'तार्किक क्रम पुरा गर्नुहोस्: ३, ७, १५, ३१, ६३, ?',
    questionType: 'multiple_choice',
    options: ['125', '127', '128', '129'],
    optionsNp: ['१२५', '१२७', '१२८', '१२९'],
    correctOption: 1, // 127 (x2 + 1)
    correct_answer: 1,
    explanation: 'The pattern is multiply by 2 and add 1 (x * 2 + 1). So 63 * 2 + 1 = 127.',
    explanationNp: 'प्रत्येक अङ्कलाई २ ले गुण गरी १ जोड्ने नियम छ (x * २ + १)। त्यसैले ६३ * २ + १ = १२७।',
    subject: 'Logical Reasoning',
    topic: 'Number Series',
    difficulty: 'medium',
    language: 'bilingual',
    source: 'Lok Sewa GMAT Curriculum',
    status: 'published'
  },
  {
    id: 'q_004',
    quizSetId: 'quiz_set_001',
    question: 'Which municipality in Nepal was declared the first "Smart Municipality"?',
    questionText: 'Which municipality in Nepal was declared the first "Smart Municipality"?',
    questionTextNp: 'नेपालको पहिलो स्मार्ट नगरपालिका कुन घोषित भएको थियो?',
    questionType: 'multiple_choice',
    options: ['Dhulikhel Municipality', 'Waling Municipality', 'Pokhara Metropolitan', 'Ratnanagar Municipality'],
    optionsNp: ['धुलिखेल नगरपालिका', 'वालिङ नगरपालिका', 'पोखरा महानगरपालिका', 'रत्ननगर नगरपालिका'],
    correctOption: 1, // Waling
    correct_answer: 1,
    explanation: 'Waling Municipality in Syangja district pioneered automated e-governance and digital public services, making it Nepal’s benchmark smart municipality.',
    explanationNp: 'स्याङ्जाको वालिङ नगरपालिकाले डिजिटल सुशासन र ई-सेवामा अग्रणी कदम चाल्दै स्मार्ट नगरपालिका अवधारणा कार्यान्वयन गरेको हो।',
    subject: 'Governance',
    topic: 'Local Governance & ICT',
    difficulty: 'medium',
    language: 'bilingual',
    source: 'Ministry of Federal Affairs and General Administration',
    status: 'published'
  },
  {
    id: 'q_005',
    quizSetId: 'quiz_set_001',
    question: 'When is National Civil Service Day (Nijamati Sewa Diwas) celebrated in Nepal?',
    questionText: 'When is National Civil Service Day (Nijamati Sewa Diwas) celebrated in Nepal?',
    questionTextNp: 'नेपालमा निजामती सेवा दिवस कहिले मनाइन्छ?',
    questionType: 'multiple_choice',
    options: ['Bhadra 22', 'Asoj 3', 'Mangsir 15', 'Chaitra 25'],
    optionsNp: ['भदौ २२', 'असोज ३', 'मंसिर १५', 'चैत २५'],
    correctOption: 0, // Bhadra 22
    correct_answer: 0,
    explanation: 'National Civil Service Day is celebrated annually on Bhadra 22 (around Sept 7) to mark the enactment of the Civil Service Act 2013 BS.',
    explanationNp: 'वि.सं. २०१३ साल भदौ २२ गते निजामती सेवा ऐन जारी भएको सम्झनामा हरेक वर्ष भदौ २२ गते निजामती सेवा दिवस मनाइन्छ।',
    subject: 'Public Administration',
    topic: 'Civil Service History',
    difficulty: 'easy',
    language: 'bilingual',
    source: 'Civil Service Act 2049 & MoFAGA',
    status: 'published'
  },
  {
    id: 'q_006',
    quizSetId: 'quiz_set_001',
    question: 'True or False: Karnali Province shares international borders with both India and China.',
    questionText: 'True or False: Karnali Province shares international borders with both India and China.',
    questionTextNp: 'सत्य वा असत्य: कर्णाली प्रदेशले भारत र चीन दुवै देशसँग अन्तर्राष्ट्रिय सीमा जोड्दछ।',
    questionType: 'true_false',
    options: ['True (सत्य)', 'False (असत्य)'],
    optionsNp: ['सत्य (True)', 'असत्य (False)'],
    correctOption: 1, // False (Karnali only touches China, not India)
    correct_answer: 1,
    isTrue: false,
    explanation: 'False. Karnali Province borders only China in the north (Tibet) and does not share any border with India. Koshi, Bagmati, and Gandaki share borders with both.',
    explanationNp: 'असत्य। कर्णाली प्रदेशले चीन (तिब्बत) सँग मात्र सीमा जोड्छ, भारतसँग कुनै सीमा जोड्दैन। कोशी, बागमती र गण्डकी प्रदेशले दुवै देशसँग सीमा जोड्छन्।',
    subject: 'Geography',
    topic: 'Provincial Geography',
    difficulty: 'hard',
    language: 'bilingual',
    source: 'Survey Department of Nepal',
    status: 'published'
  },
  {
    id: 'q_007',
    quizSetId: 'quiz_set_001',
    question: 'If 8 men can complete a public works project in 15 days, how many days will 12 men take at the same pace?',
    questionText: 'If 8 men can complete a public works project in 15 days, how many days will 12 men take at the same pace?',
    questionTextNp: 'यदि ८ जना मानिसले कुनै काम १५ दिनमा गर्न सक्छन् भने, सोही काम १२ जना मानिसले कति दिनमा सक्लान्?',
    questionType: 'multiple_choice',
    options: ['8 days', '10 days', '12 days', '14 days'],
    optionsNp: ['८ दिन', '१० दिन', '१२ दिन', '१४ दिन'],
    correctOption: 1, // 10 days (8 * 15 / 12 = 10)
    correct_answer: 1,
    explanation: 'Inversely proportional: Total man-days required = 8 * 15 = 120. Days for 12 men = 120 / 12 = 10 days.',
    explanationNp: 'उल्टो समानुपात: कुल श्रम दिन = ८ * १५ = १२०। १२ जनाका लागि = १२० / १२ = १० दिन।',
    subject: 'Mathematics',
    topic: 'Time and Work',
    difficulty: 'medium',
    language: 'bilingual',
    source: 'Standard Quantitative Aptitude',
    status: 'published'
  },
  {
    id: 'q_008',
    quizSetId: 'quiz_set_001',
    question: 'Select all UNESCO World Heritage Sites located within Kathmandu Valley: (Select all that apply)',
    questionText: 'Select all UNESCO World Heritage Sites located within Kathmandu Valley: (Select all that apply)',
    questionTextNp: 'काठमाडौँ उपत्यकाभित्र रहेका युनेस्को विश्व सम्पदा सूचीका स्थलहरू कुन-कुन हुन्? (सबै सही उत्तर छान्नुहोस्)',
    questionType: 'multiple_select',
    options: [
      'Pashupatinath Temple',
      'Lumbini Garden',
      'Boudhanath Stupa',
      'Swayambhunath Stupa',
      'Chitwan National Park'
    ],
    optionsNp: [
      'पशुपतिनाथ मन्दिर',
      'लुम्बिनी (मायादेवी परिसर)',
      'बौद्धनाथ स्तूप',
      'स्वयम्भूनाथ स्तूप',
      'चितवन राष्ट्रिय निकुञ्ज'
    ],
    correctOption: 0,
    correctAnswers: [0, 2, 3], // Pashupatinath, Boudhanath, Swayambhunath
    correct_answer: [0, 2, 3],
    explanation: 'Kathmandu Valley UNESCO World Heritage includes 7 monument zones: Pashupatinath, Swayambhunath, Boudhanath, Changunarayan, and Kathmandu/Patan/Bhaktapur Durbar Squares. Lumbini and Chitwan are outside the valley.',
    explanationNp: 'काठमाडौँ उपत्यका विश्व सम्पदा क्षेत्रमा पशुपतिनाथ, स्वयम्भूनाथ, बौद्धनाथ, चाँगुनारायण र तीनवटै दरवार स्क्वायर पर्दछन्। लुम्बिनी र चितवन उपत्यका बाहिरका सम्पदा हुन्।',
    subject: 'History',
    topic: 'Cultural Heritage',
    difficulty: 'hard',
    language: 'bilingual',
    source: 'Department of Archaeology (Nepal)',
    status: 'published'
  },
  {
    id: 'q_009',
    quizSetId: 'quiz_set_001',
    question: 'Choose the correct synonym for the word "PRAGMATIC":',
    questionText: 'Choose the correct synonym for the word "PRAGMATIC":',
    questionTextNp: 'अंग्रेजी शब्द "PRAGMATIC" को सही पर्यायवाची (Synonym) कुन हो?',
    questionType: 'multiple_choice',
    options: ['Theoretical', 'Practical & Realistic', 'Idealistic', 'Impulsive'],
    optionsNp: ['सैद्धान्तिक (Theoretical)', 'व्यावहारिक र यथार्थपरक (Practical)', 'काल्पनिक (Idealistic)', 'आवेगी (Impulsive)'],
    correctOption: 1, // Practical & Realistic
    correct_answer: 1,
    explanation: 'Pragmatic means dealing with things sensibly and realistically in a way that is based on practical rather than theoretical considerations.',
    explanationNp: '"Pragmatic" भन्नाले व्यावहारिक, यथार्थपरक वा वस्तुपरक निर्णय क्षमतालाई बुझाउँछ।',
    subject: 'English',
    topic: 'Vocabulary & Synonyms',
    difficulty: 'medium',
    language: 'en',
    source: 'Lok Sewa English Aptitude Model',
    status: 'published'
  },
  {
    id: 'q_010',
    quizSetId: 'quiz_set_001',
    question: 'नेपाली व्याकरण अनुसार "सत्कार" शब्दको विपरितार्थक (उल्टो अर्थ दिने) शब्द कुन हो?',
    questionText: 'नेपाली व्याकरण अनुसार "सत्कार" शब्दको विपरितार्थक (उल्टो अर्थ दिने) शब्द कुन हो?',
    questionTextNp: 'नेपाली व्याकरण अनुसार "सत्कार" शब्दको विपरितार्थक (उल्टो अर्थ दिने) शब्द कुन हो?',
    questionType: 'multiple_choice',
    options: ['पुरस्कार', 'तिरस्कार', 'उपकार', 'अपकार'],
    optionsNp: ['पुरस्कार', 'तिरस्कार', 'उपकार', 'अपकार'],
    correctOption: 1, // तिरस्कार
    correct_answer: 1,
    explanation: '"सत्कार" (आदर-सम्मान) को विपरितार्थक शब्द "तिरस्कार" (अपमान वा हेला) हो।',
    explanationNp: '"सत्कार" (आदर-सम्मान) को विपरितार्थक शब्द "तिरस्कार" (अपमान वा हेला) हो।',
    subject: 'Nepali',
    topic: 'नेपाली शब्दभण्डार र व्याकरण',
    difficulty: 'easy',
    language: 'np',
    source: 'नेपाल प्रज्ञा प्रतिष्ठान वृहत् शब्दकोश',
    status: 'published'
  },
  {
    id: 'q_011',
    quizSetId: 'quiz_set_001',
    question: 'What is the speed of light in vacuum approximately?',
    questionText: 'What is the speed of light in vacuum approximately?',
    questionTextNp: 'शून्य (Vacuum) मा प्रकाशको गति कति हुन्छ?',
    questionType: 'multiple_choice',
    options: ['3 x 10^8 m/s', '3 x 10^6 m/s', '3 x 10^5 km/h', '1.5 x 10^8 m/s'],
    optionsNp: ['३ × १०^८ मिटर/सेकेन्ड', '३ × १०^६ मिटर/सेकेन्ड', '३ × १०^५ कि.मी./घण्टा', '१.५ × १०^८ मिटर/सेकेन्ड'],
    correctOption: 0, // 3 x 10^8 m/s
    correct_answer: 0,
    explanation: 'The speed of light in vacuum is approximately 299,792,458 m/s (roughly 3 x 10^8 m/s or 300,000 km/s).',
    explanationNp: 'शून्य माध्यममा प्रकाशको गति करिब ३ लाख किलोमिटर प्रति सेकेन्ड (3 x 10^8 m/s) हुन्छ।',
    subject: 'Science & Technology',
    topic: 'Physics Fundamentals',
    difficulty: 'easy',
    language: 'bilingual',
    source: 'General Science Curriculum',
    status: 'published'
  },
  {
    id: 'q_012',
    quizSetId: 'quiz_set_001',
    question: 'Which country hosted the COP28 UN Climate Change Conference in 2023?',
    questionText: 'Which country hosted the COP28 UN Climate Change Conference in 2023?',
    questionTextNp: 'सन् २०२३ मा संयुक्त राष्ट्रसंघीय जलवायु परिवर्तन सम्मेलन (COP28) कुन देशमा आयोजना भएको थियो?',
    questionType: 'multiple_choice',
    options: ['United Arab Emirates (Dubai)', 'Egypt (Sharm El Sheikh)', 'Azerbaijan (Baku)', 'France (Paris)'],
    optionsNp: ['संयुक्त अरब इमिरेट्स (दुबई)', 'इजिप्ट (शर्म अल शेख)', 'अजरबैजान (बाकु)', 'फ्रान्स (पेरिस)'],
    correctOption: 0, // UAE
    correct_answer: 0,
    explanation: 'COP28 took place in Expo City, Dubai, United Arab Emirates, where the UAE Consensus on transitioning away from fossil fuels was reached.',
    explanationNp: 'COP28 सम्मेलन संयुक्त अरब इमिरेट्स (दुबई) मा सम्पन्न भएको थियो, जहाँ नेपालले जलवायु वित्त र पर्वतीय मुद्दामा सशक्त उपस्थिति जनाएको थियो।',
    subject: 'Current Affairs',
    topic: 'International Climate Summits',
    difficulty: 'medium',
    language: 'bilingual',
    source: 'UNFCCC Official Portal',
    status: 'published'
  },

  // Set 2 Banking & Economics Questions
  {
    id: 'q_020',
    quizSetId: 'quiz_set_002',
    question: 'Which regulatory body controls monetary policy and regulates commercial banks in Nepal?',
    questionText: 'Which regulatory body controls monetary policy and regulates commercial banks in Nepal?',
    questionTextNp: 'नेपालमा मौद्रिक नीति सञ्चालन र वाणिज्य बैंकहरूको नियमन कुन निकायले गर्दछ?',
    questionType: 'multiple_choice',
    options: ['Ministry of Finance', 'Nepal Rastra Bank (NRB)', 'Securities Board of Nepal (SEBON)', 'Nepal Bank Ltd'],
    optionsNp: ['अर्थ मन्त्रालय', 'नेपाल राष्ट्र बैंक (NRB)', 'नेपाल धितोपत्र बोर्ड', 'नेपाल बैंक लिमिटेड'],
    correctOption: 1, // NRB
    correct_answer: 1,
    explanation: 'Nepal Rastra Bank (established 2013 BS) is the central bank of Nepal responsible for monetary stability and bank supervision.',
    explanationNp: 'नेपाल राष्ट्र बैंक (स्थापना २०१३) नेपालको केन्द्रीय बैंक हो, जसले मौद्रिक नीति र बैंक तथा वित्तीय संस्थाको नियमन गर्दछ।',
    subject: 'Economics',
    topic: 'Banking Laws',
    difficulty: 'easy',
    language: 'bilingual',
    source: 'Nepal Rastra Bank Act 2058',
    status: 'published'
  },
  {
    id: 'q_021',
    quizSetId: 'quiz_set_002',
    question: 'Under Bank and Financial Institutions Act (BAFIA), Class "A" financial institutions are known as:',
    questionText: 'Under Bank and Financial Institutions Act (BAFIA), Class "A" financial institutions are known as:',
    questionTextNp: 'बैंक तथा वित्तीय संस्था सम्बन्धी ऐन (BAFIA) अनुसार "क" वर्गका वित्तीय संस्थालाई के भनिन्छ?',
    questionType: 'multiple_choice',
    options: ['Development Banks', 'Commercial Banks', 'Finance Companies', 'Microfinance Institutions'],
    optionsNp: ['विकास बैंक', 'वाणिज्य बैंक', 'वित्त कम्पनी', 'लघुवित्त वित्तीय संस्था'],
    correctOption: 1, // Commercial Banks
    correct_answer: 1,
    explanation: 'Class A = Commercial Banks, Class B = Development Banks, Class C = Finance Companies, Class D = Microfinance.',
    explanationNp: '"क" वर्ग = वाणिज्य बैंक, "ख" वर्ग = विकास बैंक, "ग" वर्ग = वित्त कम्पनी, र "घ" वर्ग = लघुवित्त संस्था।',
    subject: 'Economics',
    topic: 'Banking Regulations',
    difficulty: 'easy',
    language: 'bilingual',
    source: 'BAFIA 2073',
    status: 'published'
  },

  // Set 3 Computer Questions
  {
    id: 'q_030',
    quizSetId: 'quiz_set_003',
    question: 'Which of the following is considered volatile primary memory in a computer system?',
    questionText: 'Which of the following is considered volatile primary memory in a computer system?',
    questionTextNp: 'कम्प्युटर प्रणालीमा कुन चाहिँ अस्थायी (Volatile) मुख्य मेमोरी हो?',
    questionType: 'multiple_choice',
    options: ['ROM', 'RAM', 'Hard Disk Drive', 'Flash SSD'],
    optionsNp: ['ROM', 'RAM', 'हार्ड डिस्क ड्राइभ', 'फ्ल्यास SSD'],
    correctOption: 1, // RAM
    correct_answer: 1,
    explanation: 'RAM (Random Access Memory) loses its data immediately when electrical power is turned off, making it volatile memory.',
    explanationNp: 'RAM (Random Access Memory) मा विद्युत आपूर्ति बन्द हुनासाथ डाटा मेटिने भएकाले यसलाई भोलटाइल (अस्थायी) मेमोरी भनिन्छ।',
    subject: 'Computer',
    topic: 'Hardware & Memory Hierarchy',
    difficulty: 'easy',
    language: 'bilingual',
    source: 'Computer Operator Syllabus (PSC)',
    status: 'published'
  },
  {
    id: 'q_031',
    quizSetId: 'quiz_set_003',
    question: 'True or False: IPv6 addresses are 128-bit long, compared to 32-bit in IPv4.',
    questionText: 'True or False: IPv6 addresses are 128-bit long, compared to 32-bit in IPv4.',
    questionTextNp: 'सत्य वा असत्य: IPv4 मा ३२-बिट हुने भए तापनि IPv6 ठेगाना १२८-बिट लामो हुन्छ।',
    questionType: 'true_false',
    options: ['True (सत्य)', 'False (असत्य)'],
    optionsNp: ['सत्य (True)', 'असत्य (False)'],
    correctOption: 0, // True
    correct_answer: 0,
    isTrue: true,
    explanation: 'True. IPv6 utilizes 128-bit addressing providing 2^128 unique addresses, solving the address exhaustion of IPv4 (32-bit).',
    explanationNp: 'सत्य। IPv6 ले १२८-बिट ठेगाना प्रयोग गर्छ, जसले अरबौं नयाँ इन्टरनेट ठेगानाहरू उपलब्ध गराउँछ।',
    subject: 'Computer',
    topic: 'Computer Networks',
    difficulty: 'medium',
    language: 'bilingual',
    source: 'Networking Standards (IETF)',
    status: 'published'
  },

  // Set 4 Constitution and Governance
  {
    id: 'q_040',
    quizSetId: 'quiz_set_004',
    question: 'Which of the following are constitutional bodies mentioned in the Constitution of Nepal? (Select all that apply)',
    questionText: 'Which of the following are constitutional bodies mentioned in the Constitution of Nepal? (Select all that apply)',
    questionTextNp: 'नेपालको वर्तमान संविधानमा उल्लेख गरिएका संवैधानिक निकायहरू कुन-कुन हुन्? (सबै सही विकल्प छान्नुहोस्)',
    questionType: 'multiple_select',
    options: [
      'Commission for the Investigation of Abuse of Authority (CIAA)',
      'National Human Rights Commission (NHRC)',
      'Securities Board of Nepal (SEBON)',
      'Public Service Commission (Lok Sewa Aayog)',
      'Nepal Stock Exchange (NEPSE)'
    ],
    optionsNp: [
      'अख्तियार दुरुपयोग अनुसन्धान आयोग (CIAA)',
      'राष्ट्रिय मानव अधिकार आयोग (NHRC)',
      'नेपाल धितोपत्र बोर्ड (SEBON)',
      'लोक सेवा आयोग (PSC)',
      'नेपाल स्टक एक्सचेन्ज (NEPSE)'
    ],
    correctOption: 0,
    correctAnswers: [0, 1, 3], // CIAA, NHRC, PSC
    correct_answer: [0, 1, 3],
    explanation: 'CIAA (Part 21), NHRC (Part 25), and Lok Sewa Aayog (Part 23) are constitutional bodies. SEBON and NEPSE are statutory/corporate bodies under commercial acts.',
    explanationNp: 'अख्तियार (भाग २१), राष्ट्रिय मानव अधिकार आयोग (भाग २५) र लोक सेवा आयोग (भाग २३) संवैधानिक अङ्ग हुन्। धितोपत्र बोर्ड र नेप्से कानुनबमोजिम बनेका नियमनकारी/व्यापारिक संस्था हुन्।',
    subject: 'Constitution',
    topic: 'Constitutional Organs',
    difficulty: 'hard',
    language: 'bilingual',
    source: 'Constitution of Nepal 2072',
    status: 'published'
  },
  {
    id: 'q_041',
    quizSetId: 'quiz_set_004',
    question: 'True or False: Under Nepal Civil Service Act, female candidates receive a maximum age ceiling of 40 years for entry.',
    questionText: 'True or False: Under Nepal Civil Service Act, female candidates receive a maximum age ceiling of 40 years for entry.',
    questionTextNp: 'सत्य वा असत्य: नेपालको निजामती सेवा ऐन अनुसार खुला प्रतियोगितामा महिला उम्मेदवारका लागि अधिकतम उमेर हद ४० वर्ष हुन्छ।',
    questionType: 'true_false',
    options: ['True (सत्य)', 'False (असत्य)'],
    optionsNp: ['सत्य (True)', 'असत्य (False)'],
    correctOption: 0, // True (Male: 35, Female: 40)
    correct_answer: 0,
    isTrue: true,
    explanation: 'True. Under Civil Service Act 2049 Section 10, the upper age limit is 35 for male applicants and 40 for female and disabled applicants for non-technical posts.',
    explanationNp: 'सत्य। निजामती सेवा ऐन २०४९ अनुसार खुला पदमा पुरुषका लागि ३५ वर्ष र महिला तथा अपाङ्गता भएका व्यक्तिका लागि ४० वर्ष उमेर हद तोकिएको छ।',
    subject: 'Public Administration',
    topic: 'Civil Service Regulations',
    difficulty: 'medium',
    language: 'bilingual',
    source: 'Civil Service Act 2049 Section 10',
    status: 'published'
  }
];

export const INITIAL_NOTIFICATION_LOGS: NotificationLog[] = [
  {
    id: 'notif_101',
    vacancyId: 'vac_psc_001',
    vacancyTitle: 'Section Officer (Sakha Adhikrit) - Administrative & Foreign Service',
    channel: 'email',
    recipientPhoneOrEmail: 'guptanitesh3737@gmail.com',
    sentAt: '2026-08-07 09:30:15',
    status: 'sent',
    triggerType: 'Instant Match Alert'
  },
  {
    id: 'notif_102',
    vacancyId: 'vac_psc_002',
    vacancyTitle: 'Computer Officer / IT Specialist',
    channel: 'sms',
    recipientPhoneOrEmail: '+977-9841234567',
    sentAt: '2026-08-07 10:15:00',
    status: 'sent',
    triggerType: 'Cron Match Job'
  },
  {
    id: 'notif_103',
    vacancyId: 'vac_nbl_003',
    vacancyTitle: 'Junior Assistant & IT Assistant',
    channel: 'push',
    recipientPhoneOrEmail: 'FCM_Token_Nitesh_Device',
    sentAt: '2026-08-08 08:00:22',
    status: 'sent',
    triggerType: 'Instant Match Alert'
  }
];

export const INITIAL_APPLICATIONS: ApplicationTrack[] = [
  {
    id: 'app_01',
    vacancyId: 'vac_psc_001',
    status: 'Applied',
    appliedAt: '2026-08-02',
    notes: 'Voucher payment confirmed. Syllabus Paper 1 revision under way.',
    feePaid: true,
    deadlineReminderDate: '2026-08-15',
    deadlineReminderSet: true
  },
  {
    id: 'app_02',
    vacancyId: 'vac_psc_002',
    status: 'Bookmarked',
    appliedAt: '2026-08-06',
    notes: 'Deadline closing on Aug 18. Need to collect citizenship & degree transcripts.',
    feePaid: false,
    deadlineReminderDate: '2026-08-17',
    deadlineReminderSet: false
  }
];

// ----------------------------------------------------
// Official Syllabus Posts & Chapter Breakdown
// ----------------------------------------------------
export const INITIAL_SYLLABUS_POSTS: SyllabusPost[] = [
  {
    id: 'post_sakha_adhikrit',
    code: 'PSC-SO-01',
    name: 'Section Officer (Sakha Adhikrit)',
    nameNp: 'शाखा अधिकृत (रा.प.तृतीय श्रेणी - खुला तथा समावेशी)',
    service: 'Nepal Administration / Foreign / Revenue Service',
    level: 'Gazetted Class III (Officer Level 7)',
    organization: 'Public Service Commission (Lok Sewa Aayog)',
    description: 'Premier administrative entry post in Nepal Civil Service responsible for policy implementation, district coordination, and ministry governance.',
    descriptionNp: 'नेपाल निजामती सेवाको नीति कार्यान्वयन, शाखा व्यवस्थापन तथा सार्वजनिक सेवा प्रवाह सम्बन्धी राजपत्राङ्कित तृतीय श्रेणीको पद।',
    papers: [
      {
        id: 'paper_so_1',
        paperNumber: 1,
        name: 'General Knowledge & General Mental Ability Test (GK & GMAT)',
        nameNp: 'प्रथम पत्र: सामान्य ज्ञान तथा सामान्य बौद्धिक परीक्षण (MCQ)',
        paperType: 'objective_mcq',
        fullMarks: 100,
        passMarks: 40,
        timeDurationMinutes: 90,
        chapters: [
          {
            id: 'chap_so_1_1',
            chapterNumber: 1,
            title: 'Geography, Environment & Climate of Nepal',
            titleNp: 'खण्ड क: नेपालको भूगोल, हावापानी र वातावरण',
            weightageMarks: 20,
            summaryNotesEn: 'Nepal spans 147,516 sq. km across Himalayan, Hilly, and Terai ecological belts. It is drained by Sapta Koshi, Sapta Gandaki, and Karnali river systems. Key protected areas include 12 National Parks, 1 Wildlife Reserve, 1 Hunting Reserve (Dhorpatan), and 6 Conservation Areas. High-altitude passes, border points with China (Tatopani, Rasuwagadhi, Korala) and India (Birgunj, Biratnagar, Bhairahawa, Nepalgunj) form critical trade routes.',
            summaryNotesNp: 'नेपालको क्षेत्रफल १,४७,५१६ वर्ग कि.मी. रहेको छ। तीन प्रमुख नदी प्रणालीहरू: सप्तकोशी, सप्तगण्डकी र कर्णाली हुन्। नेपालमा १२ राष्ट्रिय निकुञ्ज, १ वन्यजन्तु आरक्ष, १ शिकार आरक्ष (ढोरपाटन) र ६ संरक्षण क्षेत्र रहेका छन्।',
            keyArticles: ['Article 51(g) Policies regarding protection of environment', 'National Parks and Wildlife Conservation Act 2029'],
            practiceQuizSetId: 'quiz_set_001',
            topics: [
              {
                id: 'top_so_1_1_1',
                title: 'Ecological & Administrative Divisions',
                titleNp: 'भौगोलिक तथा प्रशासनिक विभाजन',
                keyPoints: ['7 Provinces, 77 Districts, 753 Local Levels (6 Metros, 11 Sub-Metros, 276 Municipalities, 460 Rural Municipalities)', 'Mount Everest elevation: 8,848.86 m (jointly measured in 2020)'],
                statutoryCitations: ['Constitution of Nepal Schedule 4', 'Local Government Operation Act 2074']
              },
              {
                id: 'top_so_1_1_2',
                title: 'River Systems & Hydropower Resources',
                titleNp: 'नदी प्रणाली तथा जलस्रोत',
                keyPoints: ['Kosi River (Eastern, 7 tributaries), Gandaki River (Central), Karnali River (Western, longest river)', 'Lakes: Rara (biggest), Shey-Phoksundo (deepest, 145m), Tilicho (high altitude)'],
                statutoryCitations: ['Water Resources Act 2049']
              }
            ]
          },
          {
            id: 'chap_so_1_2',
            chapterNumber: 2,
            title: 'Constitution of Nepal & Federal Governance Structure',
            titleNp: 'खण्ड ख: नेपालको संविधान एवं संघीय शासन व्यवस्था',
            weightageMarks: 24,
            summaryNotesEn: 'Promulgated on 3rd Ashwin 2072 (September 20, 2015). Comprises 35 Parts, 308 Articles, and 9 Schedules. Defines Nepal as an independent, indivisible, sovereign, secular, inclusive, democratic, socialism-oriented federal democratic republican state. Contains 31 Fundamental Rights (Articles 16-46) with constitutional remedies under Article 46.',
            summaryNotesNp: '२०७२ असोज ३ गते जारी भएको नेपालको वर्तमान संविधानमा ३५ भाग, ३०८ धारा र ९ अनुसूचीहरू रहेका छन्। यसले नेपाललाई संघीय लोकतान्त्रिक गणतन्त्रात्मक राज्यको रूपमा स्थापित गरेको छ। भाग ३ अन्तर्गत ३१ वटा मौलिक हकहरूको व्यवस्था छ।',
            keyArticles: ['Article 4: State of Nepal', 'Articles 16-46: Fundamental Rights', 'Article 56: Structure of State (Federal, Provincial, Local)', 'Schedules 5, 6, 7, 8, 9: Legislative Lists of Competencies'],
            practiceQuizSetId: 'quiz_set_001',
            topics: [
              {
                id: 'top_so_1_2_1',
                title: 'Fundamental Rights & Duties of Citizens',
                titleNp: 'मौलिक हक तथा नागरिकका कर्तव्यहरू',
                keyPoints: ['31 Fundamental Rights including Right to Clean Environment (Art 30), Right to Information (Art 27), and Right to Employment (Art 33)', 'Article 48 outlines 4 fundamental duties of every citizen.'],
                statutoryCitations: ['Constitution of Nepal Part 3 (Articles 16-48)']
              },
              {
                id: 'top_so_1_2_2',
                title: 'Three Tiers of Government & Exclusive Powers',
                titleNp: 'तीन तहको सरकार र अधिकारका सूचीहरू',
                keyPoints: ['Federal exclusive powers (Schedule 5: 35 subjects)', 'Province exclusive powers (Schedule 6: 21 subjects)', 'Local level exclusive powers (Schedule 8: 22 subjects)', 'Concurrent lists (Schedules 7 and 9)'],
                statutoryCitations: ['Intergovernmental Fiscal Arrangement Act 2074']
              }
            ]
          },
          {
            id: 'chap_so_1_3',
            chapterNumber: 3,
            title: 'General Mental Ability (Verbal, Numerical & Spatial IQ)',
            titleNp: 'खण्ड ग: सामान्य बौद्धिक परीक्षण (GMAT)',
            weightageMarks: 30,
            summaryNotesEn: 'Evaluates logical aptitude across: (1) Verbal reasoning (analogies, classification, coding-decoding, logical syllogisms), (2) Numerical aptitude (arithmetic series, profit & loss, time & work, ratio & proportion, percentages), and (3) Non-verbal spatial reasoning (figure series, pattern completion, paper folding, matrix grids).',
            summaryNotesNp: 'शाब्दिक तर्क, संख्यात्मक क्षमता (अनुपात, नाफा-नोक्सान, काम र समय, प्रतिशत) तथा अशाब्दिक आकृति विश्लेषण परीक्षण।',
            practiceQuizSetId: 'quiz_set_002',
            topics: [
              {
                id: 'top_so_1_3_1',
                title: 'Number Series & Arithmetic Logic',
                titleNp: 'संख्या श्रेणी र गणितीय तर्क',
                keyPoints: ['Common patterns: Arithmetic progression, geometric ratio, prime series, square/cube offsets', 'Speed techniques for LCM, HCF, and unit digit calculation']
              }
            ]
          }
        ]
      },
      {
        id: 'paper_so_2',
        paperNumber: 2,
        name: 'Governance Systems, Public Policy & Contemporary Issues',
        nameNp: 'द्वितीय पत्र: सुशासन, सार्वजनिक नीति तथा समसामयिक विषय (Subjective)',
        paperType: 'subjective_written',
        fullMarks: 100,
        passMarks: 40,
        timeDurationMinutes: 180,
        chapters: [
          {
            id: 'chap_so_2_1',
            chapterNumber: 1,
            title: 'State, Public Governance & Administrative Accountability',
            titleNp: 'खण्ड क: राज्य व्यवस्था, सुशासन र प्रशासनिक जवाफदेहिता',
            weightageMarks: 35,
            summaryNotesEn: 'Explores core concepts of Good Governance (Rule of Law, Transparency, Accountability, Responsiveness, Inclusivity). Key statutes include the Good Governance (Management and Operation) Act 2064, Right to Information Act 2064, and Prevention of Corruption Act 2059. Examines the role of CIAA, Auditor General, Public Accounts Committee (PAC), and Citizen Charters.',
            summaryNotesNp: 'सुशासनका आधारस्तम्भहरू: विधिको शासन, पारदर्शिता, जवाफदेहिता, सहभागितामूलक निर्णय प्रक्रिया। सुशासन ऐन २०६४, सूचनाको हक सम्बन्धी ऐन २०६४, भ्रष्टाचार निवारण ऐन २०५९ का मुख्य व्यवस्थाहरू।',
            keyArticles: ['Article 51(b) Policies relating to political and governance system', 'Good Governance Act 2064 (सुशासन ऐन २०६४)', 'Civil Service Act 2049'],
            topics: [
              {
                id: 'top_so_2_1_1',
                title: 'Good Governance Mechanisms & Citizen Charters',
                titleNp: 'सुशासनका औजार र नागरिक बडापत्र',
                keyPoints: ['Public Hearing (सार्वजनिक सुनुवाई), Social Audit (सामाजिक परीक्षण), Citizen Charter with compensation clause', 'Grievance redressal mechanisms in public offices'],
                statutoryCitations: ['Good Governance Act 2064 Section 25 (Citizen Charter)']
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'post_nasu',
    code: 'PSC-NASU-02',
    name: 'Nayab Subba (NaSu)',
    nameNp: 'नायब सुब्बा (रा.प.अनं. प्रथम श्रेणी - प्रशासन/लेखा/राजस्व)',
    service: 'Nepal Administration Service',
    level: 'Non-Gazetted Class I (Level 5)',
    organization: 'Public Service Commission (Lok Sewa Aayog)',
    description: 'Supervisory technical and general administrative execution post across government offices, district administration, and land revenue registries.',
    descriptionNp: 'सरकारी कार्यालयहरूमा फाँट व्यवस्थापन, टिप्पणी लेखन, फाइल प्रमाणीकरण तथा सेवाग्राही व्यवस्थापन गर्ने राजपत्र अनंकित प्रथम श्रेणीको पद।',
    papers: [
      {
        id: 'paper_nasu_1',
        paperNumber: 1,
        name: 'General Knowledge & Basic IQ',
        nameNp: 'प्रथम पत्र: सामान्य ज्ञान तथा सामान्य बौद्धिक परीक्षण (MCQ)',
        paperType: 'objective_mcq',
        fullMarks: 100,
        passMarks: 40,
        timeDurationMinutes: 45,
        chapters: [
          {
            id: 'chap_nasu_1_1',
            chapterNumber: 1,
            title: 'Nepal Geography, History & Cultural Heritage',
            titleNp: 'नेपालको भूगोल, इतिहास र सांस्कृतिक सम्पदा',
            weightageMarks: 30,
            summaryNotesEn: 'History of Nepal from Kirat, Licchavi, Malla dynasties to Unification by Prithvi Narayan Shah, Rana regime, and Democratic movements (2007, 2046, 2062/63 BS). Major cultural festivals, UNESCO World Heritage Sites (Pashupatinath, Boudhanath, Swayambhunath, Bhaktapur/Kathmandu/Patan Durbar Squares, Changunarayan, Lumbini, Chitwan NP, Sagarmatha NP).',
            summaryNotesNp: 'किरात, लिच्छवि, मल्ल तथा शाहकालीन इतिहास। युनेस्को विश्व सम्पदा सूचीमा सूचीकृत नेपालका १० वटा सांस्कृतिक तथा प्राकृतिक सम्पदाहरू।',
            practiceQuizSetId: 'quiz_set_001',
            topics: [
              {
                id: 'top_nasu_1_1_1',
                title: 'UNESCO World Heritage Sites & National Heroes',
                titleNp: 'विश्व सम्पदा सूची र राष्ट्रिय विभूतिहरू',
                keyPoints: ['18 National Heroes (राष्ट्रिय विभूति) of Nepal including Janak, Sita, Gautam Buddha, Prithvi Narayan Shah, Bhanubhakta Acharya, and Pasang Lhamu Sherpa.']
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'post_kharidar',
    code: 'PSC-KHARIDAR-03',
    name: 'Kharidar',
    nameNp: 'खरिदार (रा.प.अनं. द्वितीय श्रेणी)',
    service: 'Nepal Administration Service',
    level: 'Non-Gazetted Class II (Level 4)',
    organization: 'Public Service Commission (Lok Sewa Aayog)',
    description: 'Foundational clerical and administrative support post responsible for public record keeping, registration (Darta/Chalani), and public desk operations.',
    descriptionNp: 'दैनिक कार्यालय संचालन, दर्ता-चलानी, अभिलेख संरक्षण तथा सेवाग्राही सहायता सम्बन्धी आधारभूत पद।',
    papers: [
      {
        id: 'paper_kharidar_1',
        paperNumber: 1,
        name: 'General Knowledge & Basic Science/Mathematics',
        nameNp: 'प्रथम पत्र: सामान्य ज्ञान तथा आधारभूत विज्ञान/गणित (MCQ)',
        paperType: 'objective_mcq',
        fullMarks: 100,
        passMarks: 40,
        timeDurationMinutes: 45,
        chapters: [
          {
            id: 'chap_kh_1',
            chapterNumber: 1,
            title: 'General Knowledge, Basic Science & Nepal Facts',
            titleNp: 'सामान्य ज्ञान तथा सामान्य विज्ञान',
            weightageMarks: 50,
            summaryNotesEn: 'Basic principles of physics, chemistry, biology, human health, environmental ecology, and Nepal national symbols (Coat of Arms, Flag, National Bird Danfe, Flower Rhododendron/Laligurans, Animal Cow, National Color Crimson/Simrik).',
            summaryNotesNp: 'दैनिक जीवनमा विज्ञान, मानव स्वास्थ्य, पोषण, नेपालका राष्ट्रिय प्रतीकहरू र प्रमुख सामान्य ज्ञान तथ्यहरू।',
            practiceQuizSetId: 'quiz_set_001',
            topics: [
              {
                id: 'top_kh_1_1',
                title: 'National Symbols & Geography Basics',
                titleNp: 'राष्ट्रिय प्रतीकहरू र भौगोलिक आधार',
                keyPoints: ['National Anthem: "Sayaun Thunga Phool Ka" written by Byakul Maila, music by Amber Gurung.', 'National Bird: Danfe (Lophophorus)', 'National Animal: Cow (Gai)']
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'post_nrb_bank',
    code: 'NRB-ASST-04',
    name: 'Nepal Rastra Bank Assistant (Level 4)',
    nameNp: 'नेपाल राष्ट्र बैंक सहायक (चौथो तह - प्रशासन/लेखा)',
    service: 'Central Banking & Financial Services',
    level: 'Assistant Level 4',
    organization: 'Nepal Rastra Bank (NRB)',
    description: 'Central banking clerical role handling currency management, commercial banking supervision data, and financial transactions.',
    descriptionNp: 'नेपालको केन्द्रीय बैंकमा वित्तीय अनुगमन, लेखा तथा बैंकिङ प्रणाली संचालन गर्ने पद।',
    papers: [
      {
        id: 'paper_nrb_1',
        paperNumber: 1,
        name: 'Banking, Economics, Accounting, IT & General Knowledge',
        nameNp: 'प्रथम चरण: पूर्वयोग्यता परीक्षा (Pre-Qualification MCQ)',
        paperType: 'objective_mcq',
        fullMarks: 100,
        passMarks: 40,
        timeDurationMinutes: 45,
        chapters: [
          {
            id: 'chap_nrb_1_1',
            chapterNumber: 1,
            title: 'Nepal Banking Acts, Monetary Policy & NRB Act 2058',
            titleNp: 'बैंकिङ ऐन-नियम, मौद्रिक नीति तथा नेपाल राष्ट्र बैंक ऐन २०५८',
            weightageMarks: 35,
            summaryNotesEn: 'Establishes NRB as autonomous central bank under NRB Act 2058. Key functions: Issuing bank notes, formulating monetary policy, foreign exchange reserves management, regulating banks and financial institutions (BFIs class A, B, C, D). Banking Offence and Punishment Act 2064 and Anti-Money Laundering Act (AMLA 2064).',
            summaryNotesNp: 'नेपाल राष्ट्र बैंक ऐन २०५८ अनुसार केन्द्रीय बैंकको काम, कर्तव्य र अधिकार। बैंक तथा वित्तीय संस्था सम्बन्धी ऐन (BAFIA २०७३), सम्पत्ति शुद्धीकरण निवारण ऐन २०६४।',
            keyArticles: ['Nepal Rastra Bank Act 2058', 'BAFIA 2073', 'Monetary Policy 2081/82'],
            practiceQuizSetId: 'quiz_set_003',
            topics: [
              {
                id: 'top_nrb_1_1_1',
                title: 'BFI Classification & Capital Requirements',
                titleNp: 'बैंक तथा वित्तीय संस्थाको वर्गिकरण (क, ख, ग, घ वर्ग)',
                keyPoints: ['Class A: Commercial Banks', 'Class B: Development Banks', 'Class C: Finance Companies', 'Class D: Microfinance Institutions (Laghubitta)']
              }
            ]
          }
        ]
      }
    ]
  }
];

// ----------------------------------------------------
// Official Administrative PSC Updates & Notices
// ----------------------------------------------------
export const INITIAL_ADMIN_ALERTS: AdministrativeAlert[] = [
  {
    id: 'alert_psc_001',
    title: 'Section Officer (Gazetted Class III) Exam Schedule & Shift Routine Published',
    titleNp: 'शाखा अधिकृत (रा.प.तृतीय श्रेणी - अप्राविधिक) प्रथम चरण लिखित परीक्षा तालिका प्रकाशन',
    organization: 'Public Service Commission (PSC Kamalpokhari)',
    category: 'Lok Sewa (PSC)',
    alertType: 'exam_routine',
    noticeNumber: 'सूचना नं. ६४८/०८१-८२',
    publishDate: '2026-08-14',
    effectiveExamDate: '2026-08-28 11:00 AM',
    pdfDownloadUrl: 'https://psc.gov.np/notices/exam-routine-so-2081.pdf',
    summary: 'The First Phase written examination for Section Officer (General Knowledge & GMAT) will be conducted nationwide on 2083-05-12 (Aug 28, 2026) across 14 PSC Examination Offices.',
    summaryNp: 'शाखा अधिकृत पदको प्रथम चरण (सामान्य ज्ञान तथा सामान्य बौद्धिक परीक्षण) परीक्षा आगामी २०८३ भदौ १२ गते बिहान ११:०० बजे देशभरका आयोग कार्यालयहरूमा एकैसाथ संचालन हुनेछ।',
    urgent: true
  },
  {
    id: 'alert_psc_002',
    title: 'Nayab Subba Written Exam Centers & Seat Planning Allocation',
    titleNp: 'नायब सुब्बा पदको लिखित परीक्षा भवन तथा सिट प्लानिङ सम्बन्धी सूचना',
    organization: 'PSC Kathmandu Office (Anamnagar)',
    category: 'Lok Sewa (PSC)',
    alertType: 'seat_planning',
    noticeNumber: 'सूचना नं. ७१२/०८१-८२',
    publishDate: '2026-08-12',
    effectiveExamDate: '2026-08-22',
    summary: 'Kathmandu district examination centers for NaSu General Administration stream have been designated across Padma Kanya Campus, Nepal Commerce Campus, and Ratna Rajya Campus.',
    summaryNp: 'काठमाडौँ उपत्यका केन्द्र तोकिएका नायब सुब्बा पदका उम्मेदवारहरूको सिट प्लानिङ र रोल नम्बर अनुसार परीक्षा केन्द्रहरू तोकिएको छ।',
    urgent: false
  },
  {
    id: 'alert_psc_003',
    title: 'Computer Officer & IT Specialist (Level 7) Final Interview Merit List',
    titleNp: 'कम्प्युटर अधिकृत (विविध सेवा - सातौँ तह) अन्तिम नतिजा तथा योग्यताक्रम सिफारिस सूची',
    organization: 'Public Service Commission (Central Office)',
    category: 'Lok Sewa (PSC)',
    alertType: 'result_merit',
    noticeNumber: 'सूचना नं. ५३३/०८१-८२',
    publishDate: '2026-08-10',
    summary: 'Final merit list published for Computer Officer advertisement. 14 candidates recommended for permanent appointment to the Ministry of Communication and Information Technology.',
    summaryNp: 'कम्प्युटर अधिकृत पदको लिखित, प्रयोगात्मक र अन्तर्वार्ताको कुल प्राप्ताङ्कका आधारमा १४ जना उम्मेदवारहरूको स्थायी नियुक्तिका लागि सिफारिस सूची प्रकाशन गरिएको छ।',
    urgent: false
  },
  {
    id: 'alert_nrb_004',
    title: 'Nepal Rastra Bank Assistant Level 4 Pre-Qualification Exam Admit Card Download',
    titleNp: 'नेपाल राष्ट्र बैंक सहायक (चौथो तह) पूर्वयोग्यता परीक्षाको प्रवेशपत्र डाउनलोड खुला',
    organization: 'Nepal Rastra Bank (Human Resources Department)',
    category: 'Banking & Finance',
    alertType: 'admit_card',
    noticeNumber: 'वि.नं. ०३/२०८१',
    publishDate: '2026-08-09',
    effectiveExamDate: '2026-08-25',
    summary: 'Candidates can now download their electronic Admit Cards with photograph and QR code verification via the NRB Online Recruitment Portal.',
    summaryNp: 'उम्मेदवारहरूले आफ्नो आवेदन लगइन मार्फत फोटो र क्युआर कोड सहितको अनलाइन प्रवेशपत्र डाउनलोड गर्न सक्नेछन्।',
    urgent: true
  }
];

// ----------------------------------------------------
// Subjective Written Questions for Phase 2 AI Evaluator
// ----------------------------------------------------
export const INITIAL_SUBJECTIVE_QUESTIONS: SubjectiveQuestion[] = [
  {
    id: 'subj_001',
    examProfile: 'Section Officer (Sakha Adhikrit) - Paper 2',
    subject: 'Governance & Federalism',
    questionText: 'Critically examine the major challenges encountered in the implementation of fiscal federalism in Nepal. Suggest actionable policy measures to strengthen sub-national revenue mobilization and intergovernmental coordination.',
    questionTextNp: 'नेपालमा वित्तीय संघीयता कार्यान्वयनमा देखिएका प्रमुख चुनौतीहरूको समीक्षा गर्दै प्रदेश र स्थानीय तहको आन्तरिक स्रोत परिचालन तथा अन्तरतह समन्वय सुदृढ गर्ने व्यावहारिक उपायहरू प्रस्तुत गर्नुहोस्। (१० अंक)',
    marks: 10,
    wordLimit: 350,
    timeLimitMinutes: 18,
    standardKeyPoints: [
      'Constitutional mandate: Article 59, 60 and Schedule 5-9 on fiscal revenue competencies',
      'High dependency of Local and Provincial governments on Federal fiscal equalization grants (समानीकरण अनुदान)',
      'Weak sub-national internal revenue mobilization (property tax, commercial tax base issues)',
      'Intergovernmental Fiscal Arrangement Act 2074 (अन्तरसरकारी वित्त व्यवस्थापन ऐन २०७४) provisions',
      'Role of National Natural Resources and Fiscal Commission (NNRFC - राष्ट्रिय प्राकृतिक स्रोत तथा वित्त आयोग)',
      'Overlap in revenue sharing on natural resources (mines, forests, riverbeds)',
      'Actionable solutions: Digital tax registry, capacity development, timely grant distribution, dispute settlement through Inter-Provincial Council (Art 234)'
    ],
    statutoryReferences: [
      'Constitution of Nepal Articles 59, 60, 234, 250, 251',
      'Intergovernmental Fiscal Arrangement Act 2074',
      'Local Government Operation Act 2074'
    ],
    modelAnswerOutline: 'Introduction: Conceptual definition of fiscal federalism under Art 60. Body Paragraph 1: Four pillars of fiscal transfers (Equalization, Conditional, Special, Matching grants). Body Paragraph 2: Core structural challenges (vertical fiscal imbalance, horizontal resource gap, limited sub-national fiscal capacity). Body Paragraph 3: Strategic reform measures with legislative and digital solutions. Conclusion: Synthesis linking fiscal autonomy with local public service delivery.'
  },
  {
    id: 'subj_002',
    examProfile: 'Section Officer (Sakha Adhikrit) - Paper 2',
    subject: 'Public Administration & Civil Service',
    questionText: 'Discuss the role of Public Service Delivery mechanisms in enhancing citizens trust in governance. How can Citizen Charters (नागरिक बडापत्र) and Social Audits be made more effective in local government offices in Nepal?',
    questionTextNp: 'सार्वजनिक सेवा प्रवाहले नागरिकको शासनप्रतिको विश्वास अभिवृद्धि गर्न खेल्ने भूमिकाबारे चर्चा गर्दै नेपालका स्थानीय कार्यालयहरूमा नागरिक बडापत्र र सामाजिक परीक्षणलाई कसरी प्रभावकारी बनाउन सकिन्छ? स्पष्ट गर्नुहोस्। (१० अंक)',
    marks: 10,
    wordLimit: 350,
    timeLimitMinutes: 18,
    standardKeyPoints: [
      'Definition of public service delivery: Timeliness, predictability, transparency, quality, and cost-effectiveness',
      'Citizen Charter statutory provisions: Good Governance Act 2064 Section 25 (includes compensation for delayed service)',
      'Current practical shortcomings: Static display boards without real accountability, lack of braille/audio accessibility',
      'Social Audit (सामाजिक परीक्षण) principles: Multi-stakeholder review of local budgets and project outcomes',
      'Practical reforms: Digital E-Citizen Charters, SMS tracking of application status, automated token systems, independent third-party monitoring'
    ],
    statutoryReferences: [
      'Good Governance (Management and Operation) Act 2064 Section 25',
      'Right to Information Act 2064',
      'Local Government Operation Act 2074 Chapter 12'
    ],
    modelAnswerOutline: 'Intro: Service delivery as interface between state and citizen. Analysis: Legal mandate of Citizen Charter in Good Governance Act. Assessment: Implementation deficiencies. Recommendations: 5 targeted reforms for municipal offices. Conclusion: Citizen-centric administrative culture.'
  },
  {
    id: 'subj_003',
    examProfile: 'Nayab Subba (NaSu) - Paper 2',
    subject: 'Office Management & File Procedures',
    questionText: 'What is a Government Note (टिप्पणी)? Outline the essential principles and sequence to be followed while drafting an administrative note for policy decision making in the Nepal Civil Service.',
    questionTextNp: 'सरकारी टिप्पणी (Note-Sheet) भनेको के हो? नेपालको निजामती प्रशासनमा नीतिगत वा कार्यगत निर्णयका लागि टिप्पणी उठाउँदा पालना गर्नुपर्ने आधारभूत सिद्धान्त र चरणहरू उल्लेख गर्नुहोस्। (५ अंक)',
    marks: 5,
    wordLimit: 200,
    timeLimitMinutes: 10,
    standardKeyPoints: [
      'Definition of Tippani: Formal written proposal initiated by desk officer submitted up the hierarchical ladder for decision by competent authority',
      'Structure of Tippani: (1) Background/Subject matter (विषय प्रवेश), (2) Facts and legal provisions/Rules applicable, (3) Merits and demerits analysis, (4) Specific recommendation/Proposed order (प्रस्तावित राय)',
      'Rules: Objective tone, conciseness, attachment of reference files/laws, signature and designation at each review level'
    ],
    statutoryReferences: [
      'Government Decisions (Procedural Rules)',
      'Office Management Code and Civil Service Guidelines'
    ]
  }
];

// ----------------------------------------------------
// Admin Team Members & Granular Role Delegation
// ----------------------------------------------------
export const INITIAL_TEAM_MEMBERS: AdminTeamMember[] = [
  {
    id: 'admin_team_001',
    name: 'Nitesh Gupta (Lead)',
    email: 'guptanitesh3737@gmail.com',
    role: 'super_admin',
    assignedCategories: ['All Nepal Services', 'PSC', 'TSC', 'Banking'],
    status: 'active',
    addedAt: '2026-08-01',
    lastActive: 'Just now'
  },
  {
    id: 'admin_team_002',
    name: 'Pradeep Sharma',
    email: 'pradeep.sharma.psc@gmail.com',
    role: 'notice_publisher',
    assignedCategories: ['Lok Sewa (PSC)', 'Provincial Lok Sewa'],
    status: 'active',
    addedAt: '2026-08-05',
    lastActive: '2026-08-15 09:12 AM'
  },
  {
    id: 'admin_team_003',
    name: 'Anita Shrestha (PSC Faculty)',
    email: 'anita.shrestha.educator@gmail.com',
    role: 'quiz_reviewer',
    assignedCategories: ['Constitution', 'Governance', 'General Knowledge', 'Economics'],
    status: 'active',
    addedAt: '2026-08-08',
    lastActive: '2026-08-14 04:30 PM'
  },
  {
    id: 'admin_team_004',
    name: 'Bikash Adhikari',
    email: 'bikash.content@sarkarisajha.np',
    role: 'content_creator',
    assignedCategories: ['Nepal Geography', 'History', 'IQ & Mathematics'],
    status: 'active',
    addedAt: '2026-08-10',
    lastActive: '2026-08-13 11:45 AM'
  }
];

export const INITIAL_QUIZ_ATTEMPTS: QuizAttempt[] = [
  {
    id: 'attempt_001',
    quizSetId: 'quiz_set_001',
    quizTitle: 'Section Officer General Knowledge & Governance Mock 2083',
    category: 'Lok Sewa (PSC)',
    userId: 'user_candidate_001',
    userName: 'Nitesh Gupta',
    score: 8.8,
    rawScore: 9,
    correctCount: 9,
    incorrectCount: 1,
    unattemptedCount: 0,
    negativeMarksDeducted: 0.2,
    totalQuestions: 10,
    percentage: 88,
    timeTakenSeconds: 340,
    answers: { 'q_001': 1, 'q_002': 0, 'q_003': 2, 'q_004': 0, 'q_005': 1 },
    topicBreakdown: {
      'Nepal Constitution': { total: 4, correct: 4, accuracy: 100 },
      'Nepal Geography': { total: 3, correct: 3, accuracy: 100 },
      'Governance & Public Administration': { total: 3, correct: 2, accuracy: 66 }
    },
    attemptedAt: '2026-08-14T09:30:00Z'
  },
  {
    id: 'attempt_002',
    quizSetId: 'quiz_set_002',
    quizTitle: 'Banking Laws, Economics & Financial Regulations Mock 2083',
    category: 'Banking & Finance',
    userId: 'user_candidate_001',
    userName: 'Nitesh Gupta',
    score: 6.4,
    rawScore: 7,
    correctCount: 7,
    incorrectCount: 3,
    unattemptedCount: 0,
    negativeMarksDeducted: 0.6,
    totalQuestions: 10,
    percentage: 64,
    timeTakenSeconds: 410,
    answers: { 'q_020': 1, 'q_021': 1 },
    topicBreakdown: {
      'Banking Laws': { total: 5, correct: 3, accuracy: 60 },
      'Banking Regulations': { total: 5, correct: 4, accuracy: 80 }
    },
    attemptedAt: '2026-08-15T14:20:00Z'
  },
  {
    id: 'attempt_003',
    quizSetId: 'quiz_set_001',
    quizTitle: 'Daily Lok Sewa MCQ Booster 2083',
    category: 'Lok Sewa (PSC)',
    userId: 'user_candidate_001',
    userName: 'Nitesh Gupta',
    score: 9.6,
    rawScore: 10,
    correctCount: 10,
    incorrectCount: 0,
    unattemptedCount: 0,
    negativeMarksDeducted: 0.0,
    totalQuestions: 10,
    percentage: 96,
    timeTakenSeconds: 290,
    answers: {},
    topicBreakdown: {
      'Nepal Geography': { total: 5, correct: 5, accuracy: 100 },
      'Nepal Demographics': { total: 5, correct: 5, accuracy: 100 }
    },
    attemptedAt: '2026-08-16T11:10:00Z'
  }
];

