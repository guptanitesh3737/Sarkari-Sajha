export type Language = 'en' | 'np';
export type Theme = 'light' | 'dark';

export type QualificationLevel = 'SEE/SLC' | '+2 High School' | 'Bachelor Degree' | 'Master Degree' | 'MPhil/PhD';

export type Province = 'All Nepal' | 'Koshi' | 'Madhesh' | 'Bagmati' | 'Gandaki' | 'Lumbini' | 'Karnali' | 'Sudurpashchim';

export type VacancyCategory =
  | 'Lok Sewa (PSC)'
  | 'Teacher Service (TSC)'
  | 'Banking & Finance'
  | 'Security Forces'
  | 'Health Services'
  | 'Provincial Lok Sewa'
  | 'Local Level (Nagarpalika)'
  | 'Public Corporation'
  | 'IT & Engineering';

export const ALL_QUIZ_CATEGORIES = [
  'Lok Sewa / PSC',
  'Government Job Preparation',
  'General Knowledge',
  'Nepal GK',
  'Current Affairs',
  'Constitution',
  'Governance',
  'Public Administration',
  'Nepal History',
  'Nepal Geography',
  'Economics',
  'Science & Technology',
  'Computer',
  'Mathematics',
  'Logical Reasoning',
  'English',
  'Nepali',
  'Environment',
  'International Affairs'
] as const;

export type QuizCategoryType = typeof ALL_QUIZ_CATEGORIES[number] | string;

export interface QuizCategoryItem {
  id: string;
  name: string;
  nameNp: string;
  slug: string;
  description?: string;
  icon?: string;
  questionCount?: number;
  isCustom?: boolean;
}

export interface ExamProfile {
  id: string;
  name: string;
  nameNp: string;
  code: string;
  organization: string;
  level: string;
  defaultTimeMinutes: number;
  defaultNegativeMarkRate: number; // e.g. 0.20
  syllabusOutline: string[];
  description?: string;
}

export interface QuestionSource {
  id: string;
  title: string;
  type: 'act' | 'gazette' | 'syllabus' | 'current_affairs' | 'book_excerpt';
  sourceText: string;
  referenceCitation?: string;
  addedBy?: string;
  createdAt?: string;
}

export interface AiValidationDetail {
  passed: boolean;
  score: number; // 0 - 100
  feedback: string;
}

export interface AiValidationReport {
  qualityScore: number; // 0 - 100
  isSingleCorrect: boolean;
  noDuplicates: boolean;
  explanationMatches: boolean;
  duplicateCheck?: AiValidationDetail;
  correctAnswerCheck?: AiValidationDetail;
  optionCheck?: AiValidationDetail;
  explanationCheck?: AiValidationDetail;
  topicRelevanceCheck?: AiValidationDetail;
  difficultyCheck?: AiValidationDetail;
  sourceCheck?: AiValidationDetail;
  flags: string[];
  validatedAt?: string;
}

export type QuestionDifficulty = 'easy' | 'medium' | 'hard' | 'mixed';

export type VacancyStatus = 'draft' | 'pending_review' | 'published' | 'closing_soon' | 'expired' | 'archived';

export interface StructuredQualification {
  minLevel: QualificationLevel;
  fields: string[];
  minAge: number;
  maxAge: number;
}

export interface Vacancy {
  id: string;
  slug?: string;
  title: string;
  titleNp?: string;
  organization: string;
  org?: string; // backwards compatibility alias for organization
  shortOrg?: string;
  department?: string;
  position: string;
  number_of_posts: number;
  posts?: number; // backwards compatibility alias
  province: Province;
  district?: string;
  job_level: string;
  level?: string; // backwards compatibility alias
  employment_type: 'Permanent' | 'Contract' | 'Temporary' | 'Daily Wage' | 'Training / Apprenticeship' | string;
  qualification: QualificationLevel;
  minQualification?: QualificationLevel; // alias
  required_field: string;
  eligibleFields?: string[]; // alias
  experience?: string;
  age_requirement?: {
    min: number;
    maxMale: number;
    maxFemale: number;
    description?: string;
  };
  ageLimits?: { min: number; maxMale: number; maxFemale: number }; // alias
  category_requirements?: {
    open?: number;
    female?: number;
    janajati?: number;
    madhesi?: number;
    dalit?: number;
    apanga?: number;
    pichhadiye?: number;
    notes?: string;
  };
  quotaBreakdown?: {
    open?: number;
    female?: number;
    janajati?: number;
    madhesi?: number;
    dalit?: number;
    apanga?: number;
    pichhadiye?: number;
  };
  category: VacancyCategory;
  application_fee: number;
  fee?: number; // alias
  application_start_date?: string; // YYYY-MM-DD
  application_deadline: string; // YYYY-MM-DD
  deadline?: string; // alias
  singleFeeDeadline?: string;
  doubleFeeDeadline?: string;
  exam_date?: string; // YYYY-MM-DD
  examDate?: string; // alias
  salary?: string;
  required_documents: string[];
  application_instructions: string;
  official_source_name: string;
  official_source_url: string;
  applyUrl?: string; // alias
  officialNoticeUrl?: string;
  source_document?: string;
  published_at?: string;
  verified_at?: string;
  verified_by?: string;
  status: VacancyStatus;
  noticeNumber?: string;
  description?: string;
  qualifications: StructuredQualification;
  syllabusPoints?: string[];
  syllabusSummary?: string[];
  viewsCount?: number;
  savesCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type VacancySortOption = 'newest' | 'deadline_soonest' | 'most_viewed' | 'most_saved';

export type VacancyDeadlineFilter = 'all' | 'active' | 'week' | 'month' | 'expired';

export interface VacancySearchFilters {
  search?: string;
  province?: Province | 'All Nepal' | string;
  district?: string;
  organization?: string;
  category?: VacancyCategory | 'All' | string;
  qualification?: QualificationLevel | 'All' | string;
  subject?: string;
  job_level?: string;
  deadline?: VacancyDeadlineFilter;
  status?: VacancyStatus | 'All' | 'all';
  sortBy?: VacancySortOption;
  page?: number;
  limit?: number;
}

export interface PaginatedVacancyResponse {
  data: Vacancy[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  facets?: {
    districts: string[];
    organizations: string[];
    subjects: string[];
  };
}

export interface JobAlertDeadlineReminders {
  remind7DaysBefore: boolean;
  remind2DaysBefore: boolean;
  remind1DayBefore: boolean;
  remindDeadlineDay: boolean;
}

export interface JobAlertPreferences {
  enabled: boolean;
  qualification: QualificationLevel | 'All';
  interestedFields: string[];
  province: Province | 'All Nepal';
  district: string; // 'All Districts' or specific district name
  jobLevel: string; // 'All Levels' or specific level
  organizations: string[]; // e.g. ['Any Organization'] or specific orgs
  subjects: string[];
  channels: {
    inApp: boolean;
    email: boolean;
    push: boolean;
  };
  deadlineReminders: JobAlertDeadlineReminders;
  updatedAt?: string;
}

export type InAppNotificationType =
  | 'platform_announcement'
  | 'vacancy_alert'
  | 'quiz_announcement'
  | 'job_match'
  | 'deadline_reminder'
  | 'exam_routine'
  | 'syllabus_update'
  | 'system_alert';
export type InAppNotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface InAppNotification {
  id: string;
  userId: string;
  title: string;
  titleNp?: string;
  message: string;
  messageNp?: string;
  type: InAppNotificationType;
  priority: InAppNotificationPriority;
  vacancyId?: string;
  vacancyTitle?: string;
  quizSetId?: string;
  deadline?: string;
  daysRemaining?: number;
  matchScore?: number;
  channelsDispatched: ('in_app' | 'email' | 'push' | 'sms')[];
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  dedupKey?: string;
  actionUrl?: string;
  senderName?: string;
}

// ----------------------------------------------------
// Phase 10 — Analytics & Admin Logging Types
// ----------------------------------------------------
export type AdminActionCategory =
  | 'VACANCY_CHANGE'
  | 'QUESTION_CHANGE'
  | 'AI_GENERATION'
  | 'PUBLISHING'
  | 'USER_ROLE_CHANGE'
  | 'SETTINGS_CHANGE'
  | 'users'
  | 'USER_SUSPEND'
  | 'USER_REACTIVATE'
  | 'USER_DELETE'
  | 'USER_NOTIFICATION'
  | 'USER_DATA_VIEW';

export interface AdminActivityLog {
  id: string;
  adminUid: string;
  adminName: string;
  adminEmail?: string;
  category?: AdminActionCategory;
  action: string;
  details: string;
  targetId?: string;
  targetName?: string;
  severity?: 'info' | 'warning' | 'critical';
  diff?: { before?: any; after?: any };
  timestamp: string;
  ipAddress?: string;
}

export interface AdminBroadcastNotificationRequest {
  type: 'platform_announcement' | 'vacancy_alert' | 'quiz_announcement';
  title: string;
  titleNp?: string;
  message: string;
  messageNp?: string;
  targetAudience: {
    all: boolean;
    qualification?: string;
    province?: string;
    category?: string;
  };
  channels: ('in_app' | 'email' | 'push' | 'sms')[];
  vacancyId?: string;
  quizSetId?: string;
  priority: InAppNotificationPriority;
  actionUrl?: string;
  senderName?: string;
}

export interface PopularSearchItem {
  query: string;
  count: number;
  category: string;
  resultFound: boolean;
}

export interface PopularSubjectItem {
  subject: string;
  attempts: number;
  avgAccuracy: number;
  popularityIndex: number;
}

export interface AdminAnalyticsOverview {
  totalUsers: number;
  activeUsers: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  vacancyViews: {
    total: number;
    trend: { date: string; views: number }[];
    topVacancies: { id: string; title: string; views: number; org: string }[];
  };
  vacancySaves: {
    total: number;
    conversionRate: number;
    topSaved: { id: string; title: string; count: number }[];
  };
  officialApplicationClicks: {
    total: number;
    clickThroughRate: number;
    topDestinations: { portal: string; clicks: number }[];
  };
  quizAttempts: {
    total: number;
    dailyTrend: { date: string; attempts: number }[];
    topQuizzes: { id: string; title: string; attempts: number }[];
  };
  quizCompletionRate: {
    completionRate: number;
    avgScore: number;
    passRate: number;
    totalCompleted: number;
    totalAbandoned: number;
  };
  popularSubjects: PopularSubjectItem[];
  popularSearches: PopularSearchItem[];
  aiAssistantUsage: {
    totalQueries: number;
    promptBreakdown: { category: string; count: number }[];
    avgResponseTimeMs: number;
    tokenEstimate: number;
  };
  notificationEngagement: {
    sent: number;
    delivered: number;
    openRate: number;
    readRate: number;
    channelBreakdown: { channel: string; sent: number; opened: number }[];
    duplicatesPrevented: number;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth?: string; // Voluntary DOB (YYYY-MM-DD)
  photoUrl?: string; // Profile photo URL if provided
  
  // Location
  province: Province;
  district?: string;
  municipality?: string;
  ward?: number | string;

  // Education
  qualificationLevel: QualificationLevel;
  fieldOfStudy: string; // Course / stream of study
  institution?: string; // School / College / University
  graduationYear?: number | string;

  // Exam & Career Preferences
  preferredExam?: string; // e.g. Lok Sewa / PSC, Banking, TSC, Nepal Police
  preferredCategories: VacancyCategory[];
  preferredOrganization?: string; // e.g. Rastriya Banijya Bank, Nepal Electricity Authority
  preferredProvince?: Province;
  preferredDistrict?: string;

  // Account & Subscription Status
  status?: 'active' | 'suspended';
  suspensionReason?: string;
  isSubscriber?: boolean;
  subscriptionPlan?: string;
  subscriptionStatus?: string;
  subscriptionExpiry?: string;

  age: number;
  notificationPrefs: {
    email: boolean;
    sms: boolean;
    push: boolean;
    frequency: 'instant' | 'daily_digest' | 'weekly';
  };
  jobAlertPreferences?: JobAlertPreferences;
  resumeText?: string;
  createdAt?: string;
  updatedAt?: string;
  lastActiveAt?: string;
}

export interface MatchResult {
  vacancyId: string;
  matchScore: number; // 0 - 100
  qualificationMatch: boolean;
  provinceMatch: boolean;
  ageMatch: boolean;
  aiRecommendationRationale: string;
  strengths: string[];
  missingCriteria: string[];
}

export const STRUCTURED_QUIZ_SUBJECTS = [
  'Lok Sewa / PSC',
  'General Knowledge',
  'Nepal GK',
  'Constitution',
  'Governance',
  'Public Administration',
  'History',
  'Geography',
  'Economics',
  'Science & Technology',
  'Computer',
  'Mathematics',
  'Logical Reasoning',
  'English',
  'Nepali',
  'Current Affairs'
] as const;

export type StructuredQuizSubject = typeof STRUCTURED_QUIZ_SUBJECTS[number];

export type QuestionType = 'multiple_choice' | 'single' | 'true_false' | 'multiple_select';
export type QuestionStatus = 'draft' | 'pending_review' | 'approved' | 'rejected' | 'published';
export type QuestionLanguage = 'en' | 'np' | 'bilingual';

export interface QuizQuestion {
  id: string;
  quizSetId?: string;
  category?: string;
  subject?: StructuredQuizSubject | string;
  examProfile?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  language?: QuestionLanguage;
  questionType?: QuestionType;
  question?: string; // alias for questionText
  questionText: string;
  questionTextNp: string;
  options: string[];
  optionsNp: string[];
  correctOption?: number; // 0, 1, 2, or 3 (for single / multiple choice & true_false index)
  correctAnswers?: number[]; // array of indices for multiple select
  correct_answer?: number | number[] | boolean | string; // unified alias
  isTrue?: boolean; // for true_false
  explanation: string;
  explanationNp: string;
  mnemonicTip?: string;
  syllabusReference?: string;
  source?: string; // official source citation e.g. "PSC Section Officer 2080"
  source_reference?: string; // alias for source / syllabus reference
  sourceId?: string;
  topic: string;
  status?: QuestionStatus;
  aiValidation?: AiValidationReport;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuizSet {
  id: string;
  title: string;
  titleNp: string;
  category: string;
  subject?: StructuredQuizSubject | string;
  examProfile?: string;
  level: string;
  timeLimitMinutes: number;
  totalQuestions: number;
  negativeMarkRate?: number; // e.g. 0.20 (Lok Sewa standard)
  passingPercentage?: number; // e.g. 50%
  passThreshold?: number; // alias for passingPercentage (e.g. 50)
  randomQuestions?: boolean;
  randomOptions?: boolean;
  randomizeQuestions?: boolean;
  randomizeOptions?: boolean;
  isDailyQuiz?: boolean;
  dailyDate?: string;
  description: string;
  descriptionNp: string;
  status?: 'active' | 'draft' | 'archived';
  questions?: QuizQuestion[];
}

export interface QuizCategoryBreakdown {
  total: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  accuracy: number; // 0 - 100
  score: number;
}

export interface QuizAttempt {
  id: string;
  quizSetId: string;
  quizTitle?: string;
  category?: string;
  subject?: string;
  userId: string;
  userName: string;
  score: number; // Final net score
  rawScore?: number;
  correctCount?: number;
  incorrectCount?: number;
  unattemptedCount?: number;
  skippedCount?: number; // alias
  negativeMarksDeducted?: number;
  negativeMarkRate?: number;
  totalQuestions: number;
  percentage: number;
  accuracy?: number; // 0 - 100
  passed?: boolean;
  passThreshold?: number;
  timeTakenSeconds: number;
  answers: Record<string, any>; // questionId -> selected index | array of indices | boolean
  subjectBreakdown?: any;
  topicBreakdown?: any;
  recommendations?: { weakAreas?: string[]; nextSteps?: string };
  aiRecommendations?: string[];
  attemptedAt: string;
}

export interface NotificationLog {
  id: string;
  vacancyId?: string;
  vacancyTitle: string;
  channel: 'sms' | 'email' | 'push';
  recipientPhoneOrEmail: string;
  sentAt: string;
  status: 'sent' | 'queued' | 'failed';
  triggerType: 'Instant Match Alert' | 'Cron Match Job' | 'System Test';
}

export type ApplicationStatus = 'Bookmarked' | 'Applied' | 'Admit Card Issued' | 'Exam Attended' | 'Interview' | 'Selected';

export interface ApplicationTrack {
  id: string;
  vacancyId: string;
  status: ApplicationStatus;
  appliedAt: string;
  notes?: string;
  feePaid: boolean;
  deadlineReminderDate?: string;
  deadlineReminderSet?: boolean;
}

export interface SavedVacancyItem {
  id: string;
  userId: string;
  vacancyId: string;
  savedAt: string;
  notes?: string;
  status?: ApplicationStatus;
}

export interface RecentlyViewedItem {
  vacancyId: string;
  viewedAt: string;
}

export interface TopicAccuracyStat {
  topic: string;
  totalAnswered: number;
  correct: number;
  accuracy: number;
  missedCount: number;
}

export interface UserPreparationSummary {
  totalAttempts: number;
  totalQuestionsAnswered: number;
  totalCorrect: number;
  overallAccuracy: number;
  streakDays: number;
  lastPracticeDate?: string;
  weakTopics: TopicAccuracyStat[];
  strongTopics: TopicAccuracyStat[];
}

export type DashboardSubTab = 'overview' | 'saved' | 'closing_soon' | 'recommended' | 'preparation' | 'recent' | 'preferences' | 'alerts';

// ----------------------------------------------------
// Syllabus & Learning Path Types
// ----------------------------------------------------
export interface SyllabusTopic {
  id: string;
  title: string;
  titleNp: string;
  keyPoints: string[];
  keyPointsNp?: string[];
  statutoryCitations?: string[];
  linkedQuizTag?: string;
}

export interface SyllabusChapter {
  id: string;
  chapterNumber: number;
  title: string;
  titleNp: string;
  weightageMarks?: number;
  summaryNotesEn: string;
  summaryNotesNp: string;
  keyArticles?: string[];
  topics: SyllabusTopic[];
  practiceQuizSetId?: string;
  downloadablePdfNotesUrl?: string;
}

export interface SyllabusPaper {
  id: string;
  paperNumber: number;
  name: string;
  nameNp: string;
  paperType: 'objective_mcq' | 'subjective_written' | 'practical';
  fullMarks: number;
  passMarks: number;
  timeDurationMinutes: number;
  chapters: SyllabusChapter[];
}

export interface SyllabusPost {
  id: string;
  code: string;
  name: string;
  nameNp: string;
  service: string; // e.g. "Nepal Administration Service"
  level: string; // e.g. "Officer Level 3rd (Gazetted Class III)"
  organization: string; // e.g. "Public Service Commission (PSC)"
  description: string;
  descriptionNp: string;
  papers: SyllabusPaper[];
}

// ----------------------------------------------------
// Administrative Alerts (Exam Routines, Centers, Results)
// ----------------------------------------------------
export type AlertType = 'exam_routine' | 'seat_planning' | 'exam_center' | 'result_merit' | 'syllabus_update' | 'admit_card';

export interface AdministrativeAlert {
  id: string;
  title: string;
  titleNp: string;
  organization: string;
  category: VacancyCategory;
  alertType: AlertType;
  noticeNumber?: string;
  publishDate: string; // YYYY-MM-DD
  effectiveExamDate?: string;
  pdfDownloadUrl?: string;
  summary: string;
  summaryNp: string;
  urgent: boolean;
  relatedVacancyId?: string;
}

// ----------------------------------------------------
// AI Subjective / Phase 2 Written Paper Evaluator
// ----------------------------------------------------
export interface SubjectiveQuestion {
  id: string;
  examProfile: string; // e.g. "Section Officer Paper 2"
  subject: string; // "Governance", "Contemporary Issues", "Law & Constitution", "Economics"
  questionText: string;
  questionTextNp: string;
  marks: number; // 5, 10, or 15
  wordLimit: number; // e.g. 250 - 400
  timeLimitMinutes: number; // e.g. 15
  standardKeyPoints: string[];
  standardKeyPointsNp?: string[];
  statutoryReferences: string[];
  modelAnswerOutline?: string;
}

export interface SubjectiveEvaluationRubric {
  relevanceScore: number; // e.g. / 2.5
  relevanceFeedback: string;
  legalConstitutionalScore: number; // e.g. / 2.5
  legalConstitutionalFeedback: string;
  structurePresentationScore: number; // e.g. / 2.5
  structureFeedback: string;
  nepalContextExamplesScore: number; // e.g. / 2.5
  nepalContextFeedback: string;
}

export interface SubjectiveAnswerEvaluation {
  id: string;
  questionId: string;
  userId?: string;
  userName?: string;
  totalScore: number; // Out of total marks (e.g. 7.5 / 10)
  maxMarks: number;
  percentage: number;
  grade: 'A+ (Distinction)' | 'A (Very Good)' | 'B+ (Good)' | 'B (Average)' | 'C (Needs Revision)';
  rubric: SubjectiveEvaluationRubric;
  strengths: string[];
  strengthsNp?: string[];
  improvements: string[];
  improvementsNp?: string[];
  modelAnswer: string;
  evaluatedAt: string;
}

// ----------------------------------------------------
// Multi-Admin Permission & Role Delegation
// ----------------------------------------------------
export type AdminRoleType = 'super_admin' | 'admin' | 'notice_publisher' | 'quiz_reviewer' | 'content_creator' | 'candidate';

export interface AdminTeamMember {
  id: string;
  name: string;
  email: string;
  role: AdminRoleType;
  assignedCategories?: string[];
  status: 'active' | 'invited' | 'suspended';
  addedAt: string;
  lastActive?: string;
}

// ----------------------------------------------------
// Monetization & Subscription Tiers
// ----------------------------------------------------
export type SubscriptionTier = 'free' | 'pro' | 'yearly_pro';

export interface UserSubscription {
  tier: SubscriptionTier;
  status: 'active' | 'trial' | 'expired';
  validUntil?: string;
  features: {
    unlimitedQuizzes: boolean;
    subjectiveAiEvaluator: boolean;
    downloadPdfNotes: boolean;
    priorityAlerts: boolean;
    detailedAnalytics: boolean;
  };
}

// ----------------------------------------------------
// PDF Gazette / Notice AI Ingestion Result
// ----------------------------------------------------
export interface PdfParsedNoticeResult {
  title: string;
  titleNp: string;
  org: string;
  shortOrg: string;
  noticeNumber: string;
  category: VacancyCategory;
  level: string;
  totalPosts: number;
  quotaBreakdown: {
    open: number;
    female: number;
    janajati: number;
    madhesi: number;
    dalit: number;
    apanga: number;
    pichhadiye: number;
  };
  singleFeeDeadline: string;
  doubleFeeDeadline: string;
  examDate?: string;
  fee: number;
  minQualification: QualificationLevel;
  eligibleFields: string[];
  ageLimits: { min: number; maxMale: number; maxFemale: number };
  syllabusSummary: string[];
  applyUrl: string;
}

// ----------------------------------------------------
// Phase 7: AI Vacancy Document Extractor Types
// ----------------------------------------------------
export type ExtractorReviewStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'DRAFT' | 'PUBLISHED';

export interface ExtractedFieldCitation<T = any> {
  value: T;
  sourceReference?: string; // Citation snippet / section from source doc
  confidenceScore?: number; // 0 - 100
  isMissingInDoc?: boolean; // If not stated in doc, NEVER invented
}

export interface ExtractedVacancyValidationCheck {
  passed: boolean;
  score: number; // 0 - 100
  label: string;
  feedback: string;
  details?: string;
}

export interface ExtractedVacancyValidationReport {
  overallScore: number;
  quotaMathCheck: ExtractedVacancyValidationCheck;
  dateChronometryCheck: ExtractedVacancyValidationCheck;
  ageBoundsCheck: ExtractedVacancyValidationCheck;
  feeSanityCheck: ExtractedVacancyValidationCheck;
  groundingCitationCheck: ExtractedVacancyValidationCheck;
  completenessCheck: ExtractedVacancyValidationCheck;
  flags: string[];
}

export interface ExtractedVacancyDocument {
  id: string;
  fileName?: string;
  fileSize?: string;
  documentType?: 'pdf' | 'text' | 'image' | 'gazette';
  rawDocumentText?: string;
  extractedAt: string;
  status: ExtractorReviewStatus;
  rejectionReason?: string;
  adminNotes?: string;

  // 1. Organization
  organization: ExtractedFieldCitation<string>;
  shortOrg: ExtractedFieldCitation<string>;
  organizationNp?: ExtractedFieldCitation<string>;

  // 2. Position
  position: ExtractedFieldCitation<string>;
  positionNp?: ExtractedFieldCitation<string>;
  serviceGroup?: ExtractedFieldCitation<string>;
  level: ExtractedFieldCitation<string>;
  category: ExtractedFieldCitation<VacancyCategory>;
  province: ExtractedFieldCitation<Province>;

  // 3. Number of posts
  numberOfPosts: ExtractedFieldCitation<number>;
  quotaBreakdown: ExtractedFieldCitation<{
    open: number;
    female: number;
    janajati: number;
    madhesi: number;
    dalit: number;
    apanga: number;
    pichhadiye: number;
    other?: number;
  }>;

  // 4. Qualification
  qualification: ExtractedFieldCitation<string>;
  qualificationLevel: ExtractedFieldCitation<QualificationLevel>;

  // 5. Required field
  requiredField: ExtractedFieldCitation<string[]>;

  // 6. Experience
  experience: ExtractedFieldCitation<string>;
  minimumExperienceYears?: ExtractedFieldCitation<number>;

  // 7. Age
  age: ExtractedFieldCitation<{
    minAge: number;
    maxAgeMale: number;
    maxAgeFemaleDisabled: number;
  }>;

  // 8. Fee
  fee: ExtractedFieldCitation<{
    singleFee: number;
    doubleFee: number;
    inclusiveGroupExtraFee: number;
  }>;

  // 9. Application dates
  applicationDates: ExtractedFieldCitation<{
    startDate?: string;
    singleFeeDeadline: string;
    doubleFeeDeadline: string;
  }>;

  // 10. Deadline
  deadline: ExtractedFieldCitation<string>;

  // 11. Exam date
  examDate: ExtractedFieldCitation<string>;
  examCenter?: ExtractedFieldCitation<string>;

  // 12. Salary
  salary: ExtractedFieldCitation<string>;
  payScaleGrade?: ExtractedFieldCitation<string>;

  // 13. Required documents
  requiredDocuments: ExtractedFieldCitation<string[]>;

  // 14. Application procedure
  applicationProcedure: ExtractedFieldCitation<string>;
  applyUrl: ExtractedFieldCitation<string>;
  noticeNumber: ExtractedFieldCitation<string>;

  // Syllabus and Job overview
  description?: ExtractedFieldCitation<string>;
  syllabusPoints?: ExtractedFieldCitation<string[]>;

  // Validation Audit
  validationReport: ExtractedVacancyValidationReport;
}

// ----------------------------------------------------
// Phase 9 — AI Career Assistant Types
// ----------------------------------------------------
export type AiAssistantSourceType =
  | 'database_record'
  | 'official_source'
  | 'ai_recommendation'
  | 'general_guidance';

export interface AiAssistantDatabaseMatch {
  vacancyId: string;
  title: string;
  titleNp?: string;
  organization: string;
  deadline: string;
  daysRemaining?: number;
  posts: number;
  qualification: string;
  level?: string;
  matchReason: string;
  isClosingSoon?: boolean;
}

export interface AiAssistantOfficialSourceInfo {
  topic: string;
  rules: string[];
  officialReference: string; // e.g. "Civil Service Act 2049, Section 10" or "PSC Gazetted 3rd Class Syllabus 2083"
}

export interface AiAssistantRecommendation {
  title: string;
  points: string[];
  recommendedQuizId?: string;
  recommendedQuizTitle?: string;
  recommendedSyllabusPostId?: string;
}

export interface AiAssistantStudyPlanDay {
  dayRange: string; // e.g. "Day 1-7: Foundation & Constitution"
  focus: string;
  tasks: string[];
}

export interface AiAssistantGeneralGuidance {
  studyTips: string[];
  suggestedDailyHours?: string;
  preparationPlan?: AiAssistantStudyPlanDay[];
  weakAreaAdvice?: {
    topic: string;
    identifiedAccuracy: number;
    remedy: string;
  }[];
}

export interface AiAssistantStructuredResponse {
  replySummary: string;
  replySummaryNp?: string;
  queryIntent?: 'vacancy_lookup' | 'closing_soon' | 'qualification_match' | 'syllabus_guidance' | 'preparation_plan' | 'weak_topics' | 'general_advice';
  databaseMatches: AiAssistantDatabaseMatch[];
  officialSourceInfo: AiAssistantOfficialSourceInfo[];
  aiRecommendations: AiAssistantRecommendation[];
  generalGuidance: AiAssistantGeneralGuidance;
  suggestedNextQuestions: string[];
  disclaimer: string;
}

export interface AiAssistantMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  structuredData?: AiAssistantStructuredResponse;
  timestamp: string;
  isGroundingVerified?: boolean;
  isLoading?: boolean;
  feedbackRating?: 'helpful' | 'not_helpful' | 'incorrect';
}

// ----------------------------------------------------
// Phase 18 — Private Beta, Feedback & Observability Types
// ----------------------------------------------------
export type BetaFeedbackType =
  | 'bug_report'
  | 'feature_request'
  | 'wrong_vacancy_info'
  | 'incorrect_quiz_question'
  | 'incorrect_ai_response'
  | 'general_feedback';

export interface BetaFeedbackItem {
  id: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  type: BetaFeedbackType;
  title: string;
  description: string;
  contextUrl?: string;
  relatedId?: string;
  rating?: number; // 1-5
  status: 'new' | 'investigating' | 'resolved' | 'dismissed';
  adminNotes?: string;
  createdAt: string;
  resolvedAt?: string;
}

export type VacancyReportType =
  | 'incorrect_info'
  | 'expired_vacancy'
  | 'broken_official_link'
  | 'wrong_deadline'
  | 'wrong_qualification'
  | 'duplicate_vacancy'
  | 'other';

export interface VacancyReportItem {
  id: string;
  vacancyId: string;
  vacancyTitle: string;
  organization: string;
  userId?: string;
  userEmail?: string;
  reportType: VacancyReportType;
  description: string;
  status: 'pending' | 'verified' | 'resolved' | 'rejected';
  reportedAt: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

export type AiFeedbackRating = 'helpful' | 'not_helpful' | 'incorrect';

export interface AiFeedbackItem {
  id: string;
  messageId: string;
  userQuery: string;
  aiResponseSnippet: string;
  rating: AiFeedbackRating;
  feedbackText?: string;
  userId?: string;
  createdAt: string;
}

export interface BetaSurveyAnswer {
  q1_purpose: string;
  q2_most_useful_feature: string;
  q3_confusing_parts: string;
  q4_found_relevant_vacancy: string;
  q5_used_quiz: string;
  q6_ai_assistant_helpful: string;
  q7_weekly_return_reason: string;
  q8_biggest_problem: string;
  q9_recommend_rating: string;
  q10_improve_first: string;
}

export interface BetaSurveySubmission {
  id: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  answers: BetaSurveyAnswer;
  submittedAt: string;
}

export interface ErrorLogItem {
  id: string;
  source: 'frontend' | 'backend' | 'ai' | 'auth' | 'firebase' | 'android';
  message: string;
  stack?: string;
  route?: string;
  userId?: string;
  metadata?: Record<string, any>;
  timestamp: string;
  resolved?: boolean;
}

export interface BetaObservabilityMetrics {
  totalVisitors: number;
  totalRegistrations: number;
  activeUsers24h: number;
  activeUsers7d: number;
  profileCompletions: number;
  vacancyViews: number;
  vacancySaves: number;
  officialLinkClicks: number;
  quizStarts: number;
  quizCompletions: number;
  avgQuizScore: number;
  aiQueriesCount: number;
  aiTokensConsumed: number;
  aiAvgLatencyMs: number;
  apiAvgLatencyMs: number;
  errorRatePercent: number;
  totalErrorCount: number;
  feedbackCount: number;
  openVacancyReportsCount: number;
  surveySubmissionsCount: number;
}

// =================================================================
// PRODUCTION CMS, ANNOUNCEMENTS, SUBSCRIPTIONS & RBAC ARCHITECTURE
// =================================================================

export type AdminRbacRole = 'SUPER_ADMIN' | 'ADMIN' | 'CONTENT_EDITOR' | 'MODERATOR' | 'SUPPORT' | 'CANDIDATE';

export type AnnouncementStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'EXPIRED' | 'ARCHIVED';
export type AnnouncementPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Announcement {
  id: string;
  title: string;
  short_description: string;
  full_content: string;
  banner_url?: string;
  priority: AnnouncementPriority;
  target_audience: string; // 'all' | 'lok_sewa' | 'tsc' | 'banking' | 'security' | 'students'
  CTA_text?: string;
  CTA_url?: string;
  publish_at: string;
  expires_at?: string;
  status: AnnouncementStatus;
  popup_enabled: boolean;
  viewsCount?: number;
  clicksCount?: number;
  createdAt: string;
  updatedAt: string;
  created_by?: string;
}

export type VacancyWorkflowStatus = 'DRAFT' | 'REVIEW' | 'VERIFIED' | 'PUBLISHED' | 'EXPIRED' | 'ARCHIVED';
export type OfficialVerificationStatus = 'VERIFIED' | 'PENDING_REVIEW' | 'DISCREPANCY_FLAGGED' | 'OFFICIAL_CONFIRMED';

export interface AiKnowledgeItem {
  id: string;
  title: string;
  category: 'Syllabus' | 'Eligibility' | 'Exam Rules' | 'Acts & Regulations' | 'Reservation Policy' | 'Official FAQ';
  organization?: string;
  content: string;
  official_sources: string[];
  verification_status: 'verified' | 'unverified';
  verified_by?: string;
  verified_at?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SubscriptionPlanCode = 'FREE' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
export type SubscriptionState = 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'FAILED' | 'REFUNDED';

export interface SubscriptionPlan {
  id: string;
  code: SubscriptionPlanCode;
  name: string;
  price: number; // in NPR
  currency: string; // 'NPR'
  duration_days: number;
  features: string[];
  limits: {
    dailyQuizzes: number; // -1 for unlimited
    dailyAiQueries: number; // -1 for unlimited
    mockTests: number;
    adFree: boolean;
    priorityAlerts: boolean;
    offlineAccess: boolean;
  };
  active: boolean;
  trial_period_days: number;
  promotional_pricing?: {
    discountedPrice: number;
    badgeText?: string;
    expiresAt?: string;
  };
  updatedAt: string;
  createdAt: string;
}

export interface UserSubscriptionRecord {
  id: string;
  userId: string;
  userEmail: string;
  planId: string;
  planCode: SubscriptionPlanCode;
  planName: string;
  status: SubscriptionState;
  amountPaid: number;
  currency: string;
  paymentMethod: 'esewa' | 'khalti' | 'connect_ips' | 'card' | 'manual_admin';
  transactionReference?: string;
  couponCodeUsed?: string;
  discountAmount?: number;
  startDate: string;
  expiresAt: string;
  autoRenew: boolean;
  cancelledAt?: string;
  verifiedByServer: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionMetrics {
  totalSubscribers: number;
  activeSubscribers: number;
  expiredSubscribers: number;
  cancelledSubscriptions: number;
  totalRevenue: number;
  monthlyRevenue: number;
  planDistribution: Record<string, number>;
  recentTransactions: UserSubscriptionRecord[];
  paymentFailuresCount: number;
}

export interface Coupon {
  id: string;
  coupon_code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number; // e.g. 20 for 20% or 200 for Rs. 200
  maximum_uses: number;
  used_count: number;
  per_user_limit: number;
  start_date: string;
  expiry_date: string;
  applicable_plans: string[]; // plan codes e.g. ['MONTHLY', 'QUARTERLY', 'YEARLY'] or ['ALL']
  active: boolean;
  createdAt: string;
  createdBy?: string;
}

export interface AuditLogRecord {
  id: string;
  adminId: string;
  adminEmail: string;
  adminName: string;
  action: string;
  resource: string;
  resourceId?: string;
  previousState?: any;
  newState?: any;
  details: string;
  severity?: 'info' | 'warning' | 'critical';
  timestamp: string;
  ipAddress?: string;
}

export interface DataHygieneReport {
  totalVacancies: number;
  demoVacanciesCount: number;
  verifiedVacanciesCount: number;
  totalAnnouncements: number;
  demoAnnouncementsCount: number;
  totalQuestions: number;
  demoQuestionsCount: number;
  totalNotifications: number;
  demoNotificationsCount: number;
  demoItems: {
    type: 'vacancy' | 'announcement' | 'question' | 'notification' | 'test_user';
    id: string;
    title: string;
    reason: string;
  }[];
}



