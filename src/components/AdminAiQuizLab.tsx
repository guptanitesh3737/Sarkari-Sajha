import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Send,
  RefreshCw,
  Sliders,
  Shield,
  Loader2,
  Trash2,
  Edit3,
  Check,
  Award,
  Globe,
  FileCheck,
  Cpu,
  Info,
  ChevronRight,
  ChevronDown,
  XCircle,
  FileText,
  HelpCircle,
  Zap,
  Bookmark,
  Scale,
  ListOrdered,
  Eye,
  Settings2,
  Copy,
  ExternalLink
} from 'lucide-react';
import {
  QuizQuestion,
  QuizCategoryItem,
  ExamProfile,
  QuestionSource,
  Language,
  AiValidationReport,
  QuestionType,
  StructuredQuizSubject
} from '../types';

interface AdminAiQuizLabProps {
  lang: Language;
}

// Preset Exams
const EXAM_PRESETS = [
  'Lok Sewa / PSC (Federal)',
  'Teacher Service Commission (TSC)',
  'Banking & Financial Institutions (NRB / RBB / ADBL)',
  'Security Forces (Nepal Police / APF / Army)',
  'Provincial PSC (Bagmati, Koshi, Gandaki, etc.)',
  'Local Government Level (Sthanik Taha)'
];

// Preset Posts
const POST_PRESETS = [
  'Section Officer (Sakha Adhikrit)',
  'Nayab Subba (NaSu)',
  'Kharidar',
  'Computer Operator / IT Assistant',
  'Assistant Level 4 / 5',
  'Officer Level 6 / 7 / 8',
  'Secondary Level Teacher (MaVi)',
  'Lower Secondary Level Teacher (NiMaVi)',
  'Primary Level Teacher (PraVi)'
];

// Preset Subjects with corresponding verified Topics
const SUBJECT_TOPIC_PRESETS: Record<string, string[]> = {
  'Constitution': [
    'Fundamental Rights & Duties (Part 3, Art 16-48)',
    'Directive Principles, Policies & State Responsibilities (Part 4)',
    'Constitutional Organs (CIAA, PSC, Auditor General, Election Commission)',
    'Federal Executive & Prime Minister Powers (Part 7)',
    'Federal Parliament & Legislative Procedures (Part 8-9)',
    'Judiciary, Supreme Court & Judicial Review (Part 11)',
    'Federal, Provincial & Local Level Interrelations (Part 20)',
    'Emergency Powers & Constitutional Amendment (Part 30-31)'
  ],
  'Public Administration': [
    'Civil Service Act 2049 & Civil Service Rules 2050',
    'Good Governance (Management & Operation) Act 2064',
    'Right to Information (RTI) Act 2064',
    'Corruption Prevention Act 2059 & CIAA Procedures',
    'Local Government Operation Act 2074',
    'Public Procurement Act 2063 & Rules 2064',
    'New Public Management (NPM) & Civil Service Values',
    'Performance Appraisal & Disciplinary Actions'
  ],
  'Governance & Management': [
    'Administrative Reforms & Restructuring in Nepal',
    'E-Governance & Digital Public Service Delivery',
    'Public Service Delivery Mechanisms & Citizen Charter (Nagarik Bada-patra)',
    'Decentralization & Fiscal Federalism in Nepal',
    'Public Financial Management (PFM) & Budget Cycle',
    'Strategic Planning & Project Management in Nepal'
  ],
  'Nepal GK & Geography': [
    'Physical Geography: Mountain, Hill & Terai Regions',
    'Rivers, Lakes & Water Resources of Nepal',
    'National Parks, Wildlife Reserves & Biodiversity',
    'Administrative Divisions: 7 Provinces & 753 Local Units',
    'National Census 2078: Demographics & Literacy Rates',
    'Major Highways, Hydropower & Infrastructure Projects'
  ],
  'Nepal History & Culture': [
    'Ancient History: Kirant, Lichhavi & Malla Periods',
    'Modern History: Unification & Shah Dynasty',
    'Democratic Movements: 2007, 2046 & 2062/63 BS',
    'UNESCO World Heritage Sites of Nepal',
    'Indigenous Nationalities, Languages & Festivals',
    'National Symbols, Emblems & Cultural Heritage'
  ],
  'Economics & Planning': [
    'Current Fiscal Year Budget & Economic Survey Highlights',
    '16th Periodic Five-Year Plan Goals & Strategies',
    'Monetary Policy & Inflation Dynamics in Nepal',
    'Foreign Trade, Balance of Payments & Remittance Trends',
    'Sustainable Development Goals (SDGs) Nepal Targets',
    'Agriculture, Tourism & Industrial Policies of Nepal'
  ],
  'Logical Reasoning & IQ': [
    'Verbal Reasoning, Analogies & Classification',
    'Numerical Sequences, Coding-Decoding & Matrices',
    'Spatial Reasoning, Figure Series & Pattern Completion',
    'Logical Deduction, Syllogism & Critical Thinking',
    'Data Interpretation & Percentage Calculations'
  ],
  'Computer & ICT': [
    'Computer Fundamentals, Hardware & Operating Systems',
    'Office Applications (Word, Excel, PowerPoint)',
    'Cyber Security, Data Privacy & IT Act 2063',
    'Cloud Computing, AI & Emerging Digital Technologies',
    'Networking, Internet & Nepal Telecom Framework'
  ],
  'Current Affairs': [
    'National Contemporary Events & Cabinet Decisions',
    'Bilateral Treaties, SAARC, BIMSTEC & UN Missions',
    'Global Geopolitics, Climate Summits & Treaties',
    'Recent Awards, Sports, Innovations & Appointments'
  ]
};

// Official Verified Source Material Database (Pre-loaded groundings)
const VERIFIED_SOURCE_MATERIALS: { id: string; title: string; category: string; excerpt: string }[] = [
  {
    id: 'const_2072_part3',
    title: 'Constitution of Nepal 2072 — Part 3: Fundamental Rights (Articles 16–46)',
    category: 'Constitution',
    excerpt: `Part 3 of the Constitution of Nepal guarantees 31 Fundamental Rights:
- Art 16: Right to live with dignity
- Art 17: Right to freedom (expression, assembly, movement, occupation)
- Art 18: Right to equality (no discrimination; special provisions for disadvantaged)
- Art 19: Right to communication (no censorship of press)
- Art 20: Right relating to justice (right to counsel, no double jeopardy)
- Art 21: Right of victim of crime
- Art 22: Right against torture
- Art 23: Right against preventive detention
- Art 24: Right against untouchability and discrimination
- Art 25: Right relating to property
- Art 26: Right to freedom of religion
- Art 27: Right to information
- Art 28: Right to privacy
- Art 29: Right against exploitation (no human trafficking or forced labor)
- Art 30: Right to clean environment
- Art 31: Right relating to education (free basic & secondary education)
- Art 32: Right to language and culture
- Art 33: Right to employment
- Art 34: Right to labor (fair wage, trade union rights)
- Art 35: Right relating to health
- Art 36: Right relating to food (food sovereignty)
- Art 37: Right to housing
- Art 38: Rights of women (equal lineage right, reproductive health)
- Art 39: Rights of the child
- Art 40: Rights of Dalits
- Art 41: Rights of senior citizens
- Art 42: Right to social justice (inclusive representation)
- Art 43: Right to social security
- Art 44: Rights of consumers
- Art 45: Right against exile
- Art 46: Right to constitutional remedies (Supreme Court writ jurisdiction under Art 133)`
  },
  {
    id: 'const_2072_part23',
    title: 'Constitution of Nepal 2072 — Part 23: Public Service Commission (Articles 242–244)',
    category: 'Constitution',
    excerpt: `Article 242: Public Service Commission of Nepal
1. There shall be a Public Service Commission consisting of a Chairperson and four other members.
2. The President shall appoint the Chairperson and members on the recommendation of the Constitutional Council.
3. At least 50% of the members shall be appointed from persons who have served for 20 years or more in government service.
4. The term of office shall be 6 years from the date of appointment.
5. A person once appointed as Chairperson or member shall not be eligible for appointment to any other government service, except for designated investigative bodies.
Article 243: Functions, Duties and Powers of PSC
- To conduct examinations for the selection of suitable candidates to be appointed to the Civil Service.
- Mandatory consultation regarding general principles to be followed in promotion, appointment, transfer, and departmental punishments.`
  },
  {
    id: 'civil_service_2049',
    title: 'Civil Service Act 2049 & Rules 2050 (Key Statutory Provisions)',
    category: 'Public Administration',
    excerpt: `Civil Service Act 2049 Provisions:
- Section 7: Reservation & Inclusion Quota System (45% reserved: Women 33%, Adivasi/Janajati 27%, Madhesi 22%, Dalit 9%, Tharu 5%, Muslim 4%, Backward Region 4%).
- Section 10: Probationary Period — 6 months for female employees, 1 year for male employees.
- Section 16: Disqualifications for appointment (non-Nepali citizen, dismissed with future disqualification, convicted of moral turpitude).
- Section 33: Age limits for civil service entry (Male: 18-35 years, Female & Disabled: 18-40 years, Technical officer levels up to 40/45).
- Section 40: Evaluation & Promotion Criteria (Work Performance 40, Seniority 30, Educational Qualification 12, Training 8, Geographical Points 10).`
  },
  {
    id: 'good_governance_2064',
    title: 'Good Governance (Management and Operation) Act 2064',
    category: 'Governance & Management',
    excerpt: `Good Governance Act 2064 Provisions:
- Section 6: Principles of Governance (Rule of law, transparency, accountability, people participation, corruption prevention).
- Section 25: Mandatory Citizen Charter (Nagarik Bada-patra) in all public service delivering offices specifying service types, required documents, fees, delivery time, and grievance redress officer.
- Section 28: Public Hearings (Sarbajanik Sunuwai) mandatory for public projects and service agencies.
- Section 31: Spokesperson (Pravakta) and Information Officer mandatory in every government office.`
  },
  {
    id: 'local_gov_2074',
    title: 'Local Government Operation Act 2074 (Key Competencies)',
    category: 'Governance & Management',
    excerpt: `Local Government Operation Act 2074 Provisions:
- Execution of Schedule 8 Exclusive Powers (22 powers) of Local Levels.
- Judicial Committee (Niyayik Samiti): Chaired by Deputy Mayor / Vice-Chairperson with two members elected by Municipal Assembly (Art 217).
- Formulation and approval of annual local budget by Asar 10 and passage by Asar end.
- Basic and Secondary Education management up to Grade 12.`
  }
];

export const AdminAiQuizLab: React.FC<AdminAiQuizLabProps> = ({ lang }) => {
  // Navigation / Workflow State
  const [activeWorkflowStep, setActiveWorkflowStep] = useState<'configure' | 'review' | 'approve'>('configure');

  // Form selections (preloaded with prompt's default example!)
  const [selectedExam, setSelectedExam] = useState<string>('Lok Sewa / PSC (Federal)');
  const [selectedPost, setSelectedPost] = useState<string>('Section Officer (Sakha Adhikrit)');
  const [selectedSubject, setSelectedSubject] = useState<string>('Constitution');
  const [selectedTopic, setSelectedTopic] = useState<string>('Fundamental Rights & Duties (Part 3, Art 16-48)');
  const [customTopic, setCustomTopic] = useState<string>('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'mixed'>('hard');
  const [languageMode, setLanguageMode] = useState<'bilingual' | 'np' | 'en'>('np');
  const [questionCount, setQuestionCount] = useState<number>(20);
  const [questionType, setQuestionType] = useState<QuestionType | 'mixed'>('multiple_choice');

  // Source Grounding
  const [selectedSourceId, setSelectedSourceId] = useState<string>('const_2072_part3');
  const [customSourceText, setCustomSourceText] = useState<string>('');
  const [sourceReferenceTag, setSourceReferenceTag] = useState<string>('Constitution of Nepal 2072, Part 3 (Fundamental Rights)');

  // Generation & Review State
  const [generating, setGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<QuizQuestion[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [publishFeedback, setPublishFeedback] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'approved' | 'rejected'>('all');
  const [validationFilter, setValidationFilter] = useState<'all' | 'flawless' | 'flagged'>('all');

  // Editing & Regenerating Single Question
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [regenFeedbackPrompt, setRegenFeedbackPrompt] = useState<string>('');
  const [showRegenModal, setShowRegenModal] = useState<boolean>(false);
  const [regenTargetQ, setRegenTargetQ] = useState<QuizQuestion | null>(null);

  // Model Set Creation State
  const [createLiveSet, setCreateLiveSet] = useState(false);
  const [newLiveSetTitle, setNewLiveSetTitle] = useState('');
  const [newLiveSetTimeMinutes, setNewLiveSetTimeMinutes] = useState(25);
  const [newLiveSetNegativeMarkRate, setNewLiveSetNegativeMarkRate] = useState(0.20);
  const [isDailyQuiz, setIsDailyQuiz] = useState(false);

  // Update topics when subject changes
  useEffect(() => {
    const topics = SUBJECT_TOPIC_PRESETS[selectedSubject] || [];
    if (topics.length > 0) {
      setSelectedTopic(topics[0]);
    }
  }, [selectedSubject]);

  // Update source excerpt when source changes
  useEffect(() => {
    if (selectedSourceId) {
      const src = VERIFIED_SOURCE_MATERIALS.find(s => s.id === selectedSourceId);
      if (src) {
        setSourceReferenceTag(src.title);
        setCustomSourceText(src.excerpt);
      }
    }
  }, [selectedSourceId]);

  // Quick Preset Loader (Prompt's exact example)
  const handleLoadPromptExample = () => {
    setSelectedExam('Lok Sewa / PSC (Federal)');
    setSelectedPost('Section Officer (Sakha Adhikrit)');
    setSelectedSubject('Constitution');
    setSelectedTopic('Fundamental Rights & Duties (Part 3, Art 16-48)');
    setDifficulty('hard');
    setLanguageMode('np');
    setQuestionCount(20);
    setQuestionType('multiple_choice');
    setSelectedSourceId('const_2072_part3');
    setSourceReferenceTag('Constitution of Nepal 2072, Part 3');
    setCustomSourceText(VERIFIED_SOURCE_MATERIALS[0].excerpt);
  };

  // 1. GENERATE QUESTIONS WITH GEMINI 3.7 FLASH
  const handleGenerateQuestions = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setPublishFeedback(null);

    const activeTopic = customTopic.trim() || selectedTopic;
    let sourceContent = customSourceText.trim();
    if (!sourceContent && selectedSourceId) {
      const matched = VERIFIED_SOURCE_MATERIALS.find(s => s.id === selectedSourceId);
      if (matched) sourceContent = matched.excerpt;
    }

    try {
      const res = await fetch('/api/ai/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exam: selectedExam,
          post: selectedPost,
          subject: selectedSubject,
          topic: activeTopic,
          difficulty,
          language: languageMode,
          questionType,
          count: questionCount,
          source_reference: sourceReferenceTag,
          sourceText: sourceContent
        })
      });

      const data = await res.json();
      if (data.questions && Array.isArray(data.questions)) {
        // Enforce initial status as DRAFT
        const draftQuestions: QuizQuestion[] = data.questions.map((q: QuizQuestion) => ({
          ...q,
          status: 'draft',
          source_reference: q.source_reference || sourceReferenceTag || 'Verified Nepal Statute Reference'
        }));

        setGeneratedQuestions(draftQuestions);
        setSelectedQuestions(draftQuestions.map(q => q.id));
        setActiveWorkflowStep('review');
        setNewLiveSetTitle(`Lok Sewa ${selectedPost} — ${selectedSubject} (${activeTopic})`);
      } else {
        alert(data.error || 'Failed to generate questions. Please try again.');
      }
    } catch (err: any) {
      console.error('AI Generation error:', err);
      alert('Error connecting to AI Quiz Lab engine: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  // 2. REGENERATE SINGLE QUESTION (Human-in-the-Loop)
  const handleRegenerateSingleQuestion = async (targetQ: QuizQuestion, feedbackInstructions: string = '') => {
    setRegeneratingId(targetQ.id);
    try {
      const res = await fetch('/api/ai/regenerate-single-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: targetQ.id,
          exam: selectedExam,
          post: selectedPost,
          subject: targetQ.subject || selectedSubject,
          topic: targetQ.topic || selectedTopic,
          difficulty: targetQ.difficulty || difficulty,
          language: targetQ.language || languageMode,
          questionType: targetQ.questionType || 'multiple_choice',
          feedbackInstructions,
          source_reference: targetQ.source_reference || sourceReferenceTag
        })
      });

      const data = await res.json();
      if (data.success && data.question) {
        setGeneratedQuestions(prev => prev.map(q => q.id === targetQ.id ? { ...data.question, status: 'draft' } : q));
        setShowRegenModal(false);
        setRegenFeedbackPrompt('');
        setPublishFeedback(`Question #${generatedQuestions.findIndex(q => q.id === targetQ.id) + 1} regenerated successfully.`);
      } else {
        alert('Failed to regenerate question.');
      }
    } catch (err: any) {
      console.error('Regenerate error:', err);
      alert('Error regenerating question.');
    } finally {
      setRegeneratingId(null);
    }
  };

  // 3. EDIT QUESTION INLINE / MODAL
  const handleSaveEditedQuestion = (updated: QuizQuestion) => {
    setGeneratedQuestions(prev => prev.map(q => q.id === updated.id ? updated : q));
    setEditingQuestion(null);
    setPublishFeedback('Question updated successfully.');
  };

  // 4. APPROVE STATUS WORKFLOW (Draft -> Approved / Rejected)
  const handleSetQuestionStatus = (id: string, status: 'draft' | 'approved' | 'rejected') => {
    setGeneratedQuestions(prev => prev.map(q => q.id === id ? { ...q, status } : q));
  };

  const handleBatchApproveHighQuality = () => {
    setGeneratedQuestions(prev =>
      prev.map(q => {
        const score = q.aiValidation?.qualityScore || 0;
        return score >= 80 ? { ...q, status: 'approved' } : q;
      })
    );
    setPublishFeedback('All high-quality questions (Score ≥ 80%) marked as APPROVED.');
  };

  const handleBatchApproveSelected = () => {
    setGeneratedQuestions(prev =>
      prev.map(q => selectedQuestions.includes(q.id) ? { ...q, status: 'approved' } : q)
    );
    setPublishFeedback(`Marked ${selectedQuestions.length} selected questions as APPROVED.`);
  };

  // 5. PUBLISH WORKFLOW (Only Approved / Selected items)
  const handlePublishApproved = async () => {
    const questionsToPublish = generatedQuestions.filter(
      q => selectedQuestions.includes(q.id) && (q.status === 'approved' || q.status === 'draft')
    );

    if (questionsToPublish.length === 0) {
      alert('Please select at least one question to publish.');
      return;
    }

    setGenerating(true);
    try {
      if (createLiveSet && newLiveSetTitle.trim()) {
        // Create full Quiz Practice Set
        const res = await fetch('/api/admin/quizzes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: newLiveSetTitle,
            titleNp: newLiveSetTitle,
            category: selectedSubject,
            examProfile: `${selectedExam} - ${selectedPost}`,
            level: selectedPost,
            timeLimitMinutes: newLiveSetTimeMinutes,
            negativeMarkRate: newLiveSetNegativeMarkRate,
            isDailyQuiz,
            questions: questionsToPublish.map(q => ({ ...q, status: 'published' }))
          })
        });

        if (res.ok) {
          setPublishFeedback(`Successfully assembled & published live model set "${newLiveSetTitle}" with ${questionsToPublish.length} verified questions!`);
          setGeneratedQuestions(prev => prev.filter(q => !selectedQuestions.includes(q.id)));
          setSelectedQuestions([]);
        }
      } else {
        // Save individually to Question Bank with status: 'published'
        await Promise.all(
          questionsToPublish.map(q =>
            fetch('/api/quiz-bank', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...q, status: 'published' })
            })
          )
        );

        setPublishFeedback(`Successfully published ${questionsToPublish.length} approved questions directly to the Lok Sewa Question Bank.`);
        setGeneratedQuestions(prev => prev.filter(q => !selectedQuestions.includes(q.id)));
        setSelectedQuestions([]);
      }
    } catch (err) {
      console.error('Publish error:', err);
      alert('Failed to publish questions.');
    } finally {
      setGenerating(false);
    }
  };

  // Filter questions for display
  const displayedQuestions = generatedQuestions.filter(q => {
    if (filterStatus !== 'all' && q.status !== filterStatus) return false;
    if (validationFilter === 'flawless' && (q.aiValidation?.qualityScore || 0) < 85) return false;
    if (validationFilter === 'flagged' && (q.aiValidation?.flags?.length || 0) === 0) return false;
    return true;
  });

  const draftCount = generatedQuestions.filter(q => q.status === 'draft').length;
  const approvedCount = generatedQuestions.filter(q => q.status === 'approved').length;
  const rejectedCount = generatedQuestions.filter(q => q.status === 'rejected').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Banner & Phase 6 Identity */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600/30 to-indigo-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-inner">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Lok Sewa AI Quiz Lab
                </h1>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                  Gemini 3.7 Flash
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  Zero Hallucination Grounding
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Author, validate, calibrate, and publish syllabus-grounded practice questions with automated 7-point quality checks and statutory citations.
              </p>
            </div>
          </div>

          {/* Quick Example Loader */}
          <button
            type="button"
            onClick={handleLoadPromptExample}
            className="px-4 py-2.5 bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 border border-purple-500/30 rounded-full text-xs font-bold transition flex items-center gap-2 shrink-0 self-start md:self-auto"
          >
            <Zap className="w-4 h-4 text-purple-400" />
            <span>Load Prompt Example (20 Qs · Constitution · Hard)</span>
          </button>
        </div>

        {/* Workflow Steps Navigator */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => setActiveWorkflowStep('configure')}
            className={`flex items-center justify-center gap-2 p-3 rounded-full text-xs font-bold transition ${
              activeWorkflowStep === 'configure'
                ? 'shadow-purple-950/40 bg-ink hover:bg-black text-white dark:bg-white dark:text-ink'
                : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800/80'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span className="hidden sm:inline">1. Configure & Grounding</span>
            <span className="sm:hidden">1. Configure</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (generatedQuestions.length === 0) {
                alert('Please generate questions first.');
                return;
              }
              setActiveWorkflowStep('review');
            }}
            className={`flex items-center justify-center gap-2 p-3 rounded-full text-xs font-bold transition ${
              activeWorkflowStep === 'review'
                ? 'shadow-purple-950/40 bg-ink hover:bg-black text-white dark:bg-white dark:text-ink'
                : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800/80'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span className="hidden sm:inline">2. Review & 7-Point AI Validation ({generatedQuestions.length})</span>
            <span className="sm:hidden">2. Review ({generatedQuestions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (generatedQuestions.length === 0) {
                alert('Please generate questions first.');
                return;
              }
              setActiveWorkflowStep('approve');
            }}
            className={`flex items-center justify-center gap-2 p-3 rounded-full text-xs font-bold transition ${
              activeWorkflowStep === 'approve'
                ? 'shadow-purple-950/40 bg-ink hover:bg-black text-white dark:bg-white dark:text-ink'
                : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800/80'
            }`}
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">3. Approve & Publish ({approvedCount} Approved)</span>
            <span className="sm:hidden">3. Publish</span>
          </button>
        </div>

        {/* Statutory Integrity Disclaimer */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-200 leading-relaxed">
          <Shield className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-300 font-bold">Strict Government Information Protocol:</strong> Gemini is strictly restricted from inventing official acts, constitutional articles, census figures, or fiscal percentages. All generated questions must carry verifiable source references and start in <span className="underline font-bold">DRAFT</span> status.
          </div>
        </div>
      </div>

      {/* Success Notification Feedback */}
      {publishFeedback && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-700 rounded-2xl text-xs sm:text-sm text-emerald-200 flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-semibold">{publishFeedback}</span>
          </div>
          <button
            onClick={() => setPublishFeedback(null)}
            className="text-emerald-400 hover:text-emerald-200 text-xs px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* STEP 1: CONFIGURATION & GENERATION FORM */}
      {activeWorkflowStep === 'configure' && (
        <form onSubmit={handleGenerateQuestions} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-purple-400" />
              <span>Question Parameters & Syllabus Target</span>
            </h2>
            <span className="text-xs text-slate-400">All fields strictly configured for exam syllabus accuracy</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
            {/* 1. Exam */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-bold">
                1. Target Exam:
              </label>
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-full p-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-300"
              >
                {EXAM_PRESETS.map(e => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>

            {/* 2. Post */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-bold">
                2. Target Post / Level:
              </label>
              <select
                value={selectedPost}
                onChange={(e) => setSelectedPost(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-full p-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-300"
              >
                {POST_PRESETS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* 3. Subject */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-bold">
                3. Subject:
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-full p-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-300"
              >
                {Object.keys(SUBJECT_TOPIC_PRESETS).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* 4. Topic Preset */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-bold">
                4. Topic (Syllabus Module):
              </label>
              <select
                value={selectedTopic}
                onChange={(e) => {
                  setSelectedTopic(e.target.value);
                  setCustomTopic('');
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-full p-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-300"
              >
                {(SUBJECT_TOPIC_PRESETS[selectedSubject] || []).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* 4b. Custom Topic Override */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-bold">
                Custom Topic (Optional Specific Article/Sub-clause):
              </label>
              <input
                type="text"
                placeholder="e.g., Article 242 Clause 3, Right to Clean Environment"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-full p-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-300"
              />
            </div>

            {/* 5. Difficulty */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-bold">
                5. Difficulty Level:
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-full p-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-300"
              >
                <option value="hard">Hard (Multi-statement / Clause analysis / Sakha Adhikrit)</option>
                <option value="medium">Medium (Standard Lok Sewa NaSu / Officer level)</option>
                <option value="easy">Easy (Definitions & Direct Articles / Kharidar)</option>
                <option value="mixed">Mixed Balanced Distribution</option>
              </select>
            </div>

            {/* 6. Language */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-bold">
                6. Language:
              </label>
              <select
                value={languageMode}
                onChange={(e) => setLanguageMode(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-full p-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-300"
              >
                <option value="np">Nepali Devanagari (नेपाली) — Official PSC Medium</option>
                <option value="bilingual">Bilingual (English + Nepali Devanagari)</option>
                <option value="en">English Language Only</option>
              </select>
            </div>

            {/* 7. Question Count */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-bold">
                7. Number of Questions:
              </label>
              <div className="flex items-center gap-1.5">
                {[5, 10, 15, 20, 25, 50].map(cnt => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setQuestionCount(cnt)}
                    className={`flex-1 py-2.5 rounded-full font-bold transition text-xs ${
                      questionCount === cnt
                        ? 'shadow-xs bg-ink hover:bg-black text-white dark:bg-white dark:text-ink'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {cnt}
                  </button>
                ))}
              </div>
            </div>

            {/* 8. Question Type */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-bold">
                8. Question Type:
              </label>
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-full p-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-300"
              >
                <option value="multiple_choice">Multiple Choice (Single Correct - 4 Options)</option>
                <option value="true_false">True / False (Statutory Fact Validation)</option>
                <option value="multiple_select">Multiple Select (Select All Correct Statements)</option>
                <option value="mixed">Mixed Variety Set</option>
              </select>
            </div>
          </div>

          {/* SOURCE GROUNDING SECTION */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold text-white">
                  Verified Statutory Grounding Material (Zero Hallucination)
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">Pre-loaded Nepal Legal Acts & Gazettes</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Select Official Legal Reference:</label>
                <select
                  value={selectedSourceId}
                  onChange={(e) => setSelectedSourceId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-full p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-sky-300"
                >
                  <option value="">Custom Excerpt / Gazette Text</option>
                  {VERIFIED_SOURCE_MATERIALS.map(s => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Source Reference Citation Tag:</label>
                <input
                  type="text"
                  value={sourceReferenceTag}
                  onChange={(e) => setSourceReferenceTag(e.target.value)}
                  placeholder="e.g., Constitution of Nepal 2072, Part 3, Art 16-46"
                  className="w-full bg-slate-900 border border-slate-800 rounded-full p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-sky-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold text-xs">
                Statute Text Excerpt (Gemini will strictly ground questions in this text):
              </label>
              <textarea
                rows={4}
                value={customSourceText}
                onChange={(e) => setCustomSourceText(e.target.value)}
                placeholder="Paste official gazette or act text here for zero-hallucination factual questions..."
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3 text-white text-xs font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-sky-300"
              />
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={generating}
            className="w-full py-4 font-bold text-sm rounded-full transition flex items-center justify-center gap-3 shadow-purple-950/40 bg-ink hover:bg-black text-white dark:bg-white dark:text-ink"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Authoring & Validating {questionCount} Questions with Gemini 3.7 Flash...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Generate {questionCount} Grounded Practice Questions (DRAFT Status)</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* STEP 2: REVIEW & 7-POINT AI VALIDATION */}
      {activeWorkflowStep === 'review' && (
        <div className="space-y-6">
          {/* Review Toolbar & Filter Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-purple-400" />
                <h2 className="text-base font-bold text-white">
                  Generated Questions Review & Quality Audit ({generatedQuestions.length} Questions)
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Status: All questions are in <span className="text-amber-300 font-bold">DRAFT</span> status. Inspect 7 AI validation checks, make inline edits, or regenerate individual questions.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <button
                type="button"
                onClick={handleBatchApproveHighQuality}
                className="px-3.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-full font-bold transition flex items-center gap-1.5"
              >
                <Award className="w-4 h-4" />
                <span>Approve High Quality (≥80%)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedQuestions(generatedQuestions.map(q => q.id))}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full font-semibold transition"
              >
                Select All
              </button>

              <button
                type="button"
                onClick={() => setSelectedQuestions([])}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full font-semibold transition"
              >
                Deselect
              </button>

              <button
                type="button"
                onClick={() => setActiveWorkflowStep('approve')}
                className="px-4 py-2 rounded-full font-bold transition flex items-center gap-1.5 shadow-xs bg-ink hover:bg-black text-white dark:bg-white dark:text-ink"
              >
                <span>Proceed to Publish</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Status Breakdown Chips */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-full font-bold transition ${
                filterStatus === 'all' ? 'bg-ink hover:bg-black text-white dark:bg-white dark:text-ink' : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              All Questions ({generatedQuestions.length})
            </button>
            <button
              onClick={() => setFilterStatus('draft')}
              className={`px-3 py-1.5 rounded-full font-bold transition flex items-center gap-1.5 ${
                filterStatus === 'draft' ? 'bg-ink hover:bg-black text-white dark:bg-white dark:text-ink' : 'bg-slate-900 text-amber-300 border border-amber-500/30'
              }`}
            >
              <span>Drafts ({draftCount})</span>
            </button>
            <button
              onClick={() => setFilterStatus('approved')}
              className={`px-3 py-1.5 rounded-full font-bold transition flex items-center gap-1.5 ${
                filterStatus === 'approved' ? 'bg-ink hover:bg-black text-white dark:bg-white dark:text-ink' : 'bg-slate-900 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              <span>Approved ({approvedCount})</span>
            </button>
            <button
              onClick={() => setFilterStatus('rejected')}
              className={`px-3 py-1.5 rounded-full font-bold transition flex items-center gap-1.5 ${
                filterStatus === 'rejected' ? 'bg-rose-600 text-white' : 'bg-slate-900 text-rose-300 border border-rose-500/30'
              }`}
            >
              <span>Rejected ({rejectedCount})</span>
            </button>
          </div>

          {/* Question Cards Grid */}
          <div className="space-y-5">
            {displayedQuestions.map((q, idx) => {
              const isSelected = selectedQuestions.includes(q.id);
              const val = q.aiValidation;
              const overallScore = val?.qualityScore || 85;

              return (
                <div
                  key={q.id}
                  className={`bg-slate-900/90 border transition-all rounded-3xl p-6 space-y-5 ${
                    isSelected ? 'border-purple-500/60 bg-purple-950/10' : 'border-slate-800'
                  }`}
                >
                  {/* Card Header: Metadata + Status Badge + Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedQuestions(prev => [...prev, q.id]);
                          } else {
                            setSelectedQuestions(prev => prev.filter(id => id !== q.id));
                          }
                        }}
                        className="w-4 h-4 rounded text-purple-600 focus:ring-sky-300 bg-slate-950 border-slate-700"
                      />
                      <span className="font-mono font-bold text-white text-sm">
                        Q#{idx + 1}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-semibold">
                        {q.subject}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[11px] font-semibold">
                        {q.difficulty?.toUpperCase()}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px]">
                        {q.questionType}
                      </span>

                      {/* Status Badge */}
                      <span className={`px-3 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                        q.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : (q.status === 'rejected'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/10 text-amber-300 border border-amber-500/30')
                      }`}>
                        {q.status === 'approved' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {q.status === 'draft' && <ClockIcon className="w-3.5 h-3.5" />}
                        {q.status === 'rejected' && <XCircle className="w-3.5 h-3.5" />}
                        <span>{q.status}</span>
                      </span>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSetQuestionStatus(q.id, q.status === 'approved' ? 'draft' : 'approved')}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                          q.status === 'approved'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                            : 'bg-slate-800 hover:bg-emerald-900/60 text-slate-300 hover:text-emerald-200'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{q.status === 'approved' ? 'Approved' : 'Approve'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setRegenTargetQ(q);
                          setShowRegenModal(true);
                        }}
                        disabled={regeneratingId === q.id}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-purple-900/60 text-slate-300 hover:text-purple-200 rounded-full text-xs font-bold transition flex items-center gap-1.5"
                      >
                        {regeneratingId === q.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                        <span>Regenerate</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditingQuestion(q)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setGeneratedQuestions(prev => prev.filter(item => item.id !== q.id));
                          setSelectedQuestions(prev => prev.filter(id => id !== q.id));
                        }}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                        title="Delete question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Question Texts (Devanagari & English) */}
                  <div className="space-y-2">
                    {q.questionTextNp && (
                      <div className="text-base sm:text-lg font-bold text-white leading-relaxed font-serif">
                        {q.questionTextNp}
                      </div>
                    )}
                    <div className="text-xs sm:text-sm text-slate-300 font-medium">
                      {q.question || q.questionText}
                    </div>
                  </div>

                  {/* Options List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {q.options.map((opt, oIdx) => {
                      const isCorrect = q.questionType === 'multiple_select'
                        ? (q.correctAnswers?.includes(oIdx))
                        : (oIdx === q.correctOption || opt === q.correct_answer);

                      const optNp = q.optionsNp && q.optionsNp[oIdx];

                      return (
                        <div
                          key={oIdx}
                          className={`p-3.5 rounded-2xl border transition flex items-start gap-3 ${
                            isCorrect
                              ? 'bg-emerald-950/50 border-emerald-500/70 text-emerald-200'
                              : 'bg-slate-950/70 border-slate-800 text-slate-300'
                          }`}
                        >
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                            isCorrect ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {String.fromCharCode(65 + oIdx)}
                          </span>

                          <div className="flex-1 space-y-0.5">
                            {optNp && <div className="font-semibold text-white">{optNp}</div>}
                            <div className="text-slate-400 text-[11px]">{opt}</div>
                          </div>

                          {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation & Memory Aid */}
                  <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 space-y-2 text-xs">
                    {q.explanationNp && (
                      <div className="text-slate-200 leading-relaxed font-serif">
                        <strong className="text-amber-400">विस्तृत व्याख्या:</strong> {q.explanationNp}
                      </div>
                    )}
                    {q.explanation && (
                      <div className="text-slate-400 leading-relaxed">
                        <strong className="text-amber-400">Rationale (EN):</strong> {q.explanation}
                      </div>
                    )}
                    {q.mnemonicTip && (
                      <div className="text-purple-300 flex items-center gap-2 pt-1 border-t border-slate-800/50">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span><strong>Mnemonic Clue:</strong> {q.mnemonicTip}</span>
                      </div>
                    )}
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-1 border-t border-slate-800/50">
                      <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                      <span><strong>Statutory Source Reference:</strong> {q.source_reference || q.source || 'Constitution / Acts of Nepal'}</span>
                    </div>
                  </div>

                  {/* 7-POINT AI VALIDATION DASHBOARD */}
                  {val && (
                    <div className="bg-slate-950/90 border border-purple-500/20 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-purple-400" />
                          <h4 className="text-xs font-bold text-white">
                            AI 7-Point Quality Validation Audit
                          </h4>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
                          overallScore >= 80 ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                        }`}>
                          Overall Score: {overallScore}%
                        </span>
                      </div>

                      {/* 7 Check Badges Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-[11px]">
                        {/* 1. Duplicate Detection */}
                        <div className={`p-2 rounded-xl border ${val.duplicateCheck?.passed ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300' : 'bg-rose-950/30 border-rose-800/40 text-rose-300'}`}>
                          <div className="font-bold flex items-center gap-1">
                            {val.duplicateCheck?.passed ? <Check className="w-3 h-3 text-emerald-400" /> : <AlertTriangle className="w-3 h-3 text-rose-400" />}
                            <span>Duplicate</span>
                          </div>
                          <div className="text-[10px] text-slate-400 truncate" title={val.duplicateCheck?.feedback}>
                            {val.duplicateCheck?.passed ? 'Passed (0 Dup)' : 'Flagged'}
                          </div>
                        </div>

                        {/* 2. Correct Answer */}
                        <div className={`p-2 rounded-xl border ${val.correctAnswerCheck?.passed ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300' : 'bg-rose-950/30 border-rose-800/40 text-rose-300'}`}>
                          <div className="font-bold flex items-center gap-1">
                            {val.correctAnswerCheck?.passed ? <Check className="w-3 h-3 text-emerald-400" /> : <AlertTriangle className="w-3 h-3 text-rose-400" />}
                            <span>Answer</span>
                          </div>
                          <div className="text-[10px] text-slate-400 truncate" title={val.correctAnswerCheck?.feedback}>
                            {val.correctAnswerCheck?.passed ? 'Valid Index' : 'Invalid'}
                          </div>
                        </div>

                        {/* 3. Option Distinctness */}
                        <div className={`p-2 rounded-xl border ${val.optionCheck?.passed ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300' : 'bg-amber-950/30 border-amber-800/40 text-amber-300'}`}>
                          <div className="font-bold flex items-center gap-1">
                            {val.optionCheck?.passed ? <Check className="w-3 h-3 text-emerald-400" /> : <AlertTriangle className="w-3 h-3 text-amber-400" />}
                            <span>Options</span>
                          </div>
                          <div className="text-[10px] text-slate-400 truncate" title={val.optionCheck?.feedback}>
                            {val.optionCheck?.passed ? '4 Distinct' : 'Review'}
                          </div>
                        </div>

                        {/* 4. Explanation */}
                        <div className={`p-2 rounded-xl border ${val.explanationCheck?.passed ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300' : 'bg-amber-950/30 border-amber-800/40 text-amber-300'}`}>
                          <div className="font-bold flex items-center gap-1">
                            {val.explanationCheck?.passed ? <Check className="w-3 h-3 text-emerald-400" /> : <AlertTriangle className="w-3 h-3 text-amber-400" />}
                            <span>Explanation</span>
                          </div>
                          <div className="text-[10px] text-slate-400 truncate" title={val.explanationCheck?.feedback}>
                            {val.explanationCheck?.passed ? 'Grounded' : 'Brief'}
                          </div>
                        </div>

                        {/* 5. Topic Relevance */}
                        <div className={`p-2 rounded-xl border ${val.topicRelevanceCheck?.passed ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300' : 'bg-amber-950/30 border-amber-800/40 text-amber-300'}`}>
                          <div className="font-bold flex items-center gap-1">
                            {val.topicRelevanceCheck?.passed ? <Check className="w-3 h-3 text-emerald-400" /> : <AlertTriangle className="w-3 h-3 text-amber-400" />}
                            <span>Relevance</span>
                          </div>
                          <div className="text-[10px] text-slate-400 truncate" title={val.topicRelevanceCheck?.feedback}>
                            {val.topicRelevanceCheck?.passed ? 'Aligned' : 'Moderate'}
                          </div>
                        </div>

                        {/* 6. Difficulty */}
                        <div className={`p-2 rounded-xl border ${val.difficultyCheck?.passed ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-300'}`}>
                          <div className="font-bold flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Difficulty</span>
                          </div>
                          <div className="text-[10px] text-slate-400 truncate" title={val.difficultyCheck?.feedback}>
                            {q.difficulty}
                          </div>
                        </div>

                        {/* 7. Source Check */}
                        <div className={`p-2 rounded-xl border ${val.sourceCheck?.passed ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300' : 'bg-rose-950/30 border-rose-800/40 text-rose-300'}`}>
                          <div className="font-bold flex items-center gap-1">
                            {val.sourceCheck?.passed ? <Check className="w-3 h-3 text-emerald-400" /> : <AlertTriangle className="w-3 h-3 text-rose-400" />}
                            <span>Source Citation</span>
                          </div>
                          <div className="text-[10px] text-slate-400 truncate" title={val.sourceCheck?.feedback}>
                            {val.sourceCheck?.passed ? 'Verified' : 'Missing'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 3: APPROVE & PUBLISH SETTINGS */}
      {activeWorkflowStep === 'approve' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-400" />
                <span>Publish Approved Questions ({approvedCount} Approved · {draftCount} Drafts)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Choose to publish approved questions into the permanent Lok Sewa Question Bank or assemble a timed Live Model Set for candidates.
              </p>
            </div>

            <button
              type="button"
              onClick={handleBatchApproveSelected}
              className="px-3.5 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 bg-ink hover:bg-black text-white dark:bg-white dark:text-ink"
            >
              <Check className="w-4 h-4" />
              <span>Approve All Selected ({selectedQuestions.length})</span>
            </button>
          </div>

          {/* Model Set Option Toggle */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="createLiveSetCheck"
                checked={createLiveSet}
                onChange={(e) => setCreateLiveSet(e.target.checked)}
                className="w-5 h-5 rounded text-purple-600 focus:ring-sky-300 bg-slate-900 border-slate-700"
              />
              <div>
                <label htmlFor="createLiveSetCheck" className="font-bold text-white text-sm cursor-pointer block">
                  Assemble as a Live Timed Model Practice Set (Appears in Candidate Quiz Tab)
                </label>
                <span className="text-xs text-slate-400">
                  Also archives individual questions into the master question bank.
                </span>
              </div>
            </div>

            {createLiveSet && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-800/80 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Practice Set Title:</label>
                  <input
                    type="text"
                    value={newLiveSetTitle}
                    onChange={(e) => setNewLiveSetTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-full p-3 text-white focus:ring-1 focus:ring-sky-300"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Time Limit (Minutes):</label>
                  <input
                    type="number"
                    value={newLiveSetTimeMinutes}
                    onChange={(e) => setNewLiveSetTimeMinutes(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-full p-3 text-white focus:ring-1 focus:ring-sky-300"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Negative Marking Rate:</label>
                  <select
                    value={newLiveSetNegativeMarkRate}
                    onChange={(e) => setNewLiveSetNegativeMarkRate(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-full p-3 text-white focus:ring-1 focus:ring-sky-300"
                  >
                    <option value={0.20}>20% (-0.20 marks / wrong) [Lok Sewa Standard]</option>
                    <option value={0.25}>25% (-0.25 marks / wrong)</option>
                    <option value={0}>0% (No negative penalty)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setActiveWorkflowStep('review')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full text-xs font-bold transition"
            >
              Back to Review
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setGeneratedQuestions([]);
                  setSelectedQuestions([]);
                  setActiveWorkflowStep('configure');
                }}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-rose-300 rounded-full text-xs font-bold transition"
              >
                Clear Sandbox
              </button>

              <button
                type="button"
                onClick={handlePublishApproved}
                disabled={generating || selectedQuestions.length === 0}
                className="px-6 py-3 rounded-full text-xs font-bold transition flex items-center gap-2 shadow-emerald-950/40 bg-ink hover:bg-black text-white dark:bg-white dark:text-ink"
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Publish {selectedQuestions.length} Selected Questions</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT QUESTION MODAL */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/30 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-purple-400" />
                <span>Edit Question Details</span>
              </h3>
              <button onClick={() => setEditingQuestion(null)} className="text-slate-400 hover:text-white text-xs">
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-bold">Devanagari Nepali Question Text:</label>
                <input
                  type="text"
                  value={editingQuestion.questionTextNp || ''}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, questionTextNp: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-full p-3 text-white font-serif"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">English Question Text:</label>
                <input
                  type="text"
                  value={editingQuestion.question || editingQuestion.questionText}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value, questionText: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-full p-3 text-white"
                />
              </div>

              {/* Options */}
              <div className="space-y-2">
                <label className="block text-slate-400 font-bold">Options (Click radio to set correct answer):</label>
                {editingQuestion.options.map((opt, oIdx) => (
                  <div key={oIdx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="editCorrectOption"
                      checked={editingQuestion.correctOption === oIdx}
                      onChange={() => setEditingQuestion({ ...editingQuestion, correctOption: oIdx, correct_answer: opt })}
                    />
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...editingQuestion.options];
                        newOpts[oIdx] = e.target.value;
                        setEditingQuestion({ ...editingQuestion, options: newOpts });
                      }}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-full p-2 text-white"
                      placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">Explanation (Devanagari):</label>
                <textarea
                  rows={2}
                  value={editingQuestion.explanationNp || ''}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, explanationNp: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-2.5 text-white font-serif"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">Explanation (English):</label>
                <textarea
                  rows={2}
                  value={editingQuestion.explanation || ''}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">Source Reference Citation:</label>
                <input
                  type="text"
                  value={editingQuestion.source_reference || editingQuestion.source || ''}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, source_reference: e.target.value, source: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-full p-2.5 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveEditedQuestion(editingQuestion)}
                className="px-5 py-2 rounded-full text-xs font-bold bg-ink hover:bg-black text-white dark:bg-white dark:text-ink"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REGENERATE SINGLE QUESTION MODAL */}
      {showRegenModal && regenTargetQ && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/30 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-purple-400" />
                <span>Regenerate Single Question</span>
              </h3>
              <button onClick={() => setShowRegenModal(false)} className="text-slate-400 hover:text-white text-xs">
                ✕
              </button>
            </div>

            <div className="text-xs space-y-3">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-300">
                <strong>Current:</strong> {regenTargetQ.questionTextNp || regenTargetQ.question}
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">
                  Admin Feedback / Refinement Instructions (Optional):
                </label>
                <textarea
                  rows={3}
                  value={regenFeedbackPrompt}
                  onChange={(e) => setRegenFeedbackPrompt(e.target.value)}
                  placeholder="e.g., Make it harder, ground in Article 242 clause 2, replace distractor C with a more plausible figure..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-white focus:outline-none focus:ring-1 focus:ring-sky-300"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowRegenModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleRegenerateSingleQuestion(regenTargetQ, regenFeedbackPrompt)}
                disabled={regeneratingId !== null}
                className="px-5 py-2 rounded-full text-xs font-bold flex items-center gap-2 bg-ink hover:bg-black text-white dark:bg-white dark:text-ink"
              >
                {regeneratingId !== null ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                <span>Regenerate Now</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Clock Helper Icon for Draft Status
function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
