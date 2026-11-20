import React, { useState, useEffect } from 'react';
import {
  Database,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Sparkles,
  BookOpen,
  Layers,
  ChevronDown,
  ChevronRight,
  Shield,
  Loader2,
  RefreshCw,
  Award,
  Check,
  Send,
  Eye,
  ListFilter,
  CheckSquare,
  ToggleLeft
} from 'lucide-react';
import { QuizQuestion, QuizCategoryItem, ExamProfile, QuestionSource, Language, STRUCTURED_QUIZ_SUBJECTS, QuestionType } from '../types';

interface AdminQuestionBankProps {
  lang: Language;
}

export const AdminQuestionBank: React.FC<AdminQuestionBankProps> = ({ lang }) => {
  const [activeTab, setActiveTab] = useState<'bank' | 'sources' | 'categories'>('bank');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [categories, setCategories] = useState<QuizCategoryItem[]>([]);
  const [examProfiles, setExamProfiles] = useState<ExamProfile[]>([]);
  const [sources, setSources] = useState<QuestionSource[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedExam, setSelectedExam] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedQuestionType, setSelectedQuestionType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Edit / Add Modal
  const [editingQuestion, setEditingQuestion] = useState<Partial<QuizQuestion> | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Add Source Modal
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [newSourceTitle, setNewSourceTitle] = useState('');
  const [newSourceType, setNewSourceType] = useState<QuestionSource['type']>('act');
  const [newSourceText, setNewSourceText] = useState('');
  const [newSourceCitation, setNewSourceCitation] = useState('');

  // Add Category Modal
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryNameNp, setNewCategoryNameNp] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');

  // Load all initial data
  const loadData = async () => {
    setLoading(true);
    try {
      const [qRes, cRes, eRes, sRes] = await Promise.all([
        fetch('/api/quiz-bank'),
        fetch('/api/quiz-categories'),
        fetch('/api/exam-profiles'),
        fetch('/api/question-sources')
      ]);

      const [qData, cData, eData, sData] = await Promise.all([
        qRes.json(),
        cRes.json(),
        eRes.json(),
        sRes.json()
      ]);

      setQuestions(Array.isArray(qData) ? qData : []);
      setCategories(Array.isArray(cData) ? cData : []);
      setExamProfiles(Array.isArray(eData) ? eData : []);
      setSources(Array.isArray(sData) ? sData : []);
    } catch (err) {
      console.error('Failed to load question bank data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter questions
  const filteredQuestions = questions.filter(q => {
    const subj = q.subject || q.category;
    if (selectedSubject !== 'all' && subj !== selectedSubject && q.topic !== selectedSubject) return false;
    if (selectedExam !== 'all' && q.examProfile !== selectedExam) return false;
    if (selectedStatus !== 'all' && q.status !== selectedStatus) return false;
    if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false;
    if (selectedQuestionType !== 'all') {
      const qType = q.questionType || (Array.isArray(q.correctAnswers) ? 'multiple_select' : (q.isTrue !== undefined ? 'true_false' : 'multiple_choice'));
      if (qType !== selectedQuestionType) return false;
    }
    if (searchQuery.trim()) {
      const s = searchQuery.toLowerCase();
      const match =
        (q.questionText && q.questionText.toLowerCase().includes(s)) ||
        (q.question && q.question.toLowerCase().includes(s)) ||
        (q.questionTextNp && q.questionTextNp.toLowerCase().includes(s)) ||
        (q.topic && q.topic.toLowerCase().includes(s)) ||
        (q.subject && q.subject.toLowerCase().includes(s)) ||
        (q.source && q.source.toLowerCase().includes(s)) ||
        (q.explanation && q.explanation.toLowerCase().includes(s)) ||
        (q.syllabusReference && q.syllabusReference.toLowerCase().includes(s));
      if (!match) return false;
    }
    return true;
  });

  // Handle single question status change
  const handleUpdateStatus = async (id: string, newStatus: QuizQuestion['status']) => {
    try {
      const res = await fetch(`/api/quiz-bank/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setQuestions(prev => prev.map(q => q.id === id ? { ...q, status: newStatus } : q));
      }
    } catch (err) {
      console.error('Failed to update question status:', err);
    }
  };

  // Handle single question delete
  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      const res = await fetch(`/api/quiz-bank/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setQuestions(prev => prev.filter(q => q.id !== id));
        setSelectedIds(prev => prev.filter(i => i !== id));
      }
    } catch (err) {
      console.error('Failed to delete question:', err);
    }
  };

  // Bulk actions
  const handleBulkAction = async (action: 'approve' | 'publish' | 'reject' | 'delete') => {
    if (selectedIds.length === 0) return;
    setBulkActionLoading(true);
    try {
      const res = await fetch('/api/quiz-bank/bulk-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, questionIds: selectedIds })
      });
      if (res.ok) {
        if (action === 'delete') {
          setQuestions(prev => prev.filter(q => !selectedIds.includes(q.id)));
        } else {
          const statusMap: Record<string, QuizQuestion['status']> = {
            approve: 'approved',
            publish: 'published',
            reject: 'rejected'
          };
          setQuestions(prev => prev.map(q => selectedIds.includes(q.id) ? { ...q, status: statusMap[action] } : q));
        }
        setSelectedIds([]);
      }
    } catch (err) {
      console.error('Bulk action failed:', err);
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Save edited or newly created question
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion || (!editingQuestion.questionText && !editingQuestion.question)) return;

    const payload = {
      ...editingQuestion,
      question: editingQuestion.question || editingQuestion.questionText,
      questionText: editingQuestion.questionText || editingQuestion.question,
      subject: editingQuestion.subject || editingQuestion.category || 'General Knowledge',
      category: editingQuestion.category || editingQuestion.subject || 'General Knowledge'
    };

    try {
      if (editingQuestion.id) {
        // Update existing
        const res = await fetch(`/api/quiz-bank/${editingQuestion.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const updated = await res.json();
          setQuestions(prev => prev.map(q => q.id === updated.id ? updated : q));
          setShowEditModal(false);
          setEditingQuestion(null);
        }
      } else {
        // Create new
        const res = await fetch('/api/quiz-bank', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const created = await res.json();
          setQuestions(prev => [created, ...prev]);
          setShowEditModal(false);
          setEditingQuestion(null);
        }
      }
    } catch (err) {
      console.error('Failed to save question:', err);
    }
  };

  // Add Source
  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceTitle || !newSourceText) return;

    try {
      const res = await fetch('/api/question-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newSourceTitle,
          type: newSourceType,
          sourceText: newSourceText,
          referenceCitation: newSourceCitation
        })
      });
      if (res.ok) {
        const added = await res.json();
        setSources(prev => [added, ...prev]);
        setShowSourceModal(false);
        setNewSourceTitle('');
        setNewSourceText('');
        setNewSourceCitation('');
      }
    } catch (err) {
      console.error('Failed to add source:', err);
    }
  };

  // Delete Source
  const handleDeleteSource = async (id: string) => {
    if (!confirm('Remove this document reference source?')) return;
    try {
      const res = await fetch(`/api/question-sources/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSources(prev => prev.filter(s => s.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete source:', err);
    }
  };

  // Add Category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName) return;

    try {
      const res = await fetch('/api/quiz-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategoryName,
          nameNp: newCategoryNameNp || newCategoryName,
          description: newCategoryDesc
        })
      });
      if (res.ok) {
        const added = await res.json();
        setCategories(prev => [...prev, added]);
        setShowCategoryModal(false);
        setNewCategoryName('');
        setNewCategoryNameNp('');
        setNewCategoryDesc('');
      }
    } catch (err) {
      console.error('Failed to add category:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Navigation Tabs */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Lok Sewa Question Bank & Source Manager</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
                  {questions.length} Items
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage official syllabus-aligned practice questions, verify AI validations, and curate authentic grounding sources.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => {
                setEditingQuestion({
                  category: categories[0]?.name || 'Nepal GK',
                  examProfile: examProfiles[0]?.name || 'Section Officer (Sakha Adhikrit)',
                  difficulty: 'medium',
                  language: 'bilingual',
                  questionText: '',
                  questionTextNp: '',
                  options: ['', '', '', ''],
                  optionsNp: ['', '', '', ''],
                  correctOption: 0,
                  explanation: '',
                  explanationNp: '',
                  mnemonicTip: '',
                  syllabusReference: '',
                  topic: categories[0]?.name || 'Nepal GK',
                  status: 'published'
                });
                setShowEditModal(true);
              }}
              className="py-2 px-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>New Question</span>
            </button>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-2 mt-4 pt-1">
          <button
            onClick={() => setActiveTab('bank')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'bank'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Question Bank ({questions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('sources')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'sources'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Grounding Sources ({sources.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'categories'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Categories & Exam Profiles ({categories.length})</span>
          </button>
        </div>
      </div>

      {/* 1. QUESTION BANK TAB */}
      {activeTab === 'bank' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
              {/* Search */}
              <div className="relative md:col-span-2">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search questions, source, citations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Subject / Category Filter */}
              <div>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="all">All Subjects ({STRUCTURED_QUIZ_SUBJECTS.length})</option>
                  {STRUCTURED_QUIZ_SUBJECTS.map(subj => (
                    <option key={subj} value={subj}>{subj}</option>
                  ))}
                </select>
              </div>

              {/* Question Type Filter */}
              <div>
                <select
                  value={selectedQuestionType}
                  onChange={(e) => setSelectedQuestionType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="all">All Question Types</option>
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="true_false">True / False</option>
                  <option value="multiple_select">Multiple Select</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="published">Published</option>
                  <option value="approved">Approved</option>
                  <option value="pending_review">Pending Review</option>
                  <option value="draft">Draft</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Difficulty */}
              <div>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="all">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            {/* Bulk Actions Bar (if any selected) */}
            {selectedIds.length > 0 && (
              <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-200 animate-in fade-in">
                <span className="font-semibold">{selectedIds.length} questions selected</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleBulkAction('approve')}
                    disabled={bulkActionLoading}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => handleBulkAction('publish')}
                    disabled={bulkActionLoading}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" /> Publish
                  </button>
                  <button
                    onClick={() => handleBulkAction('reject')}
                    disabled={bulkActionLoading}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold transition flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                  <button
                    onClick={() => handleBulkAction('delete')}
                    disabled={bulkActionLoading}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-rose-300 rounded-lg font-bold transition flex items-center gap-1 border border-slate-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Question List */}
          <div className="space-y-3">
            {filteredQuestions.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-xs">
                No questions matching the selected filter criteria.
              </div>
            ) : (
              filteredQuestions.map((q, idx) => {
                const isSelected = selectedIds.includes(q.id);
                const qType = q.questionType || (Array.isArray(q.correctAnswers) ? 'multiple_select' : (q.isTrue !== undefined ? 'true_false' : 'multiple_choice'));

                return (
                  <div
                    key={q.id}
                    className={`bg-slate-900 border transition rounded-2xl p-5 ${
                      isSelected ? 'border-amber-500 bg-amber-500/5' : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Select checkbox and main info */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds(prev => [...prev, q.id]);
                            } else {
                              setSelectedIds(prev => prev.filter(i => i !== q.id));
                            }
                          }}
                          className="mt-1 rounded text-amber-500 focus:ring-amber-500 bg-slate-950 border-slate-700"
                        />

                        <div className="flex-1 min-w-0 space-y-2">
                          {/* Badges */}
                          <div className="flex items-center gap-2 flex-wrap text-[11px]">
                            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                              #{idx + 1}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-semibold border border-amber-500/20">
                              {q.subject || q.category || q.topic}
                            </span>
                            {q.topic && q.topic !== (q.subject || q.category) && (
                              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium border border-slate-700">
                                Topic: {q.topic}
                              </span>
                            )}
                            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 font-semibold border border-purple-500/20">
                              {qType === 'multiple_select' ? 'Multiple Select' : qType === 'true_false' ? 'True/False' : 'Multiple Choice'}
                            </span>
                            {q.language && (
                              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 font-semibold uppercase text-[10px] border border-blue-500/20">
                                {q.language}
                              </span>
                            )}
                            <span className={`px-2.5 py-0.5 rounded-full font-semibold capitalize ${
                              q.difficulty === 'hard' ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20' :
                              q.difficulty === 'easy' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' :
                              'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                            }`}>
                              {q.difficulty || 'medium'}
                            </span>

                            {/* Status badge */}
                            <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                              q.status === 'published' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                              q.status === 'approved' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                              q.status === 'rejected' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                              'bg-amber-950 text-amber-300 border border-amber-800'
                            }`}>
                              {q.status || 'draft'}
                            </span>
                          </div>

                          {/* Question Text in English & Nepali */}
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-white leading-relaxed">
                              {q.question || q.questionText}
                            </p>
                            {q.questionTextNp && q.questionTextNp !== (q.question || q.questionText) && (
                              <p className="text-xs text-slate-300 leading-relaxed font-serif">
                                {q.questionTextNp}
                              </p>
                            )}
                          </div>

                          {/* Options Display based on Question Type */}
                          {qType === 'true_false' ? (
                            <div className="flex items-center gap-3 pt-1 text-xs">
                              <span className={`px-3 py-1.5 rounded-xl border font-bold ${
                                (q.isTrue === true || q.correct_answer === 'True' || q.correctOption === 0)
                                  ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300'
                                  : 'bg-slate-950/60 border-slate-800 text-slate-400'
                              }`}>
                                True {(q.isTrue === true || q.correct_answer === 'True' || q.correctOption === 0) && '✓ (Correct)'}
                              </span>
                              <span className={`px-3 py-1.5 rounded-xl border font-bold ${
                                (q.isTrue === false || q.correct_answer === 'False' || q.correctOption === 1)
                                  ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300'
                                  : 'bg-slate-950/60 border-slate-800 text-slate-400'
                              }`}>
                                False {(q.isTrue === false || q.correct_answer === 'False' || q.correctOption === 1) && '✓ (Correct)'}
                              </span>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                              {q.options && q.options.map((opt, oIdx) => {
                                const isCorrect = qType === 'multiple_select'
                                  ? (q.correctAnswers?.includes(oIdx) || (Array.isArray(q.correct_answer) && (q.correct_answer as any[]).includes(opt)))
                                  : (oIdx === q.correctOption || q.correct_answer === opt);
                                const optNp = q.optionsNp?.[oIdx];

                                return (
                                  <div
                                    key={oIdx}
                                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                                      isCorrect
                                        ? 'bg-emerald-950/40 border-emerald-700/80 text-emerald-200 font-semibold'
                                        : 'bg-slate-950/60 border-slate-800/80 text-slate-400'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                        isCorrect ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                                      }`}>
                                        {String.fromCharCode(65 + oIdx)}
                                      </span>
                                      <span>{opt}</span>
                                      {optNp && optNp !== opt && (
                                        <span className="text-[11px] text-slate-400">({optNp})</span>
                                      )}
                                    </div>
                                    {isCorrect && (
                                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Explanation, Source, & Mnemonic Note */}
                          {(q.explanation || q.mnemonicTip || q.syllabusReference || q.source) && (
                            <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 text-xs space-y-1.5 mt-2">
                              {q.explanation && (
                                <p className="text-slate-300">
                                  <strong className="text-amber-400">Explanation:</strong> {q.explanation}
                                </p>
                              )}
                              {q.source && (
                                <p className="text-slate-400">
                                  <strong className="text-blue-400">Source:</strong> {q.source}
                                </p>
                              )}
                              {q.mnemonicTip && (
                                <p className="text-purple-300 flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                  <span><strong>Mnemonic Clue:</strong> {q.mnemonicTip}</span>
                                </p>
                              )}
                              {q.syllabusReference && (
                                <p className="text-[11px] text-slate-500">
                                  <strong>Citation:</strong> {q.syllabusReference}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-col gap-1.5 shrink-0">
                        {q.status !== 'approved' && q.status !== 'published' && (
                          <button
                            onClick={() => handleUpdateStatus(q.id, 'approved')}
                            title="Approve Question"
                            className="p-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-xl border border-blue-600/30 text-xs transition"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}

                        {q.status !== 'published' && (
                          <button
                            onClick={() => handleUpdateStatus(q.id, 'published')}
                            title="Publish Question"
                            className="p-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-xl border border-emerald-600/30 text-xs transition"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}

                        {q.status !== 'rejected' && (
                          <button
                            onClick={() => handleUpdateStatus(q.id, 'rejected')}
                            title="Reject Question"
                            className="p-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 rounded-xl border border-rose-600/30 text-xs transition"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setEditingQuestion({
                              ...q,
                              questionText: q.questionText || q.question,
                              subject: q.subject || q.category,
                              questionType: qType,
                              options: q.options || ['True', 'False']
                            });
                            setShowEditModal(true);
                          }}
                          title="Edit question details"
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 text-xs transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          title="Delete question"
                          className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/20 text-xs transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 2. GROUNDING SOURCES TAB */}
      {activeTab === 'sources' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Reference Acts, Gazettes & Syllabi Documents</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                AI Quiz generation is strictly grounded in these verified sources to eliminate factual hallucinations.
              </p>
            </div>

            <button
              onClick={() => setShowSourceModal(true)}
              className="py-2 px-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Document Source</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sources.map(s => (
              <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-bold uppercase border border-amber-500/20">
                      {s.type}
                    </span>
                    <h4 className="text-sm font-bold text-white">{s.title}</h4>
                    <p className="text-[11px] text-slate-400">{s.referenceCitation}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteSource(s.id)}
                    className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 max-h-32 overflow-y-auto leading-relaxed">
                  {s.sourceText}
                </div>

                <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1">
                  <span>Added by: {s.addedBy}</span>
                  <span>Date: {s.createdAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. CATEGORIES & EXAM PROFILES TAB */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          {/* Categories */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Structured Quiz Categories ({categories.length})</h3>
                <p className="text-xs text-slate-400">Nepal government examination categories. Admins can add customized categories.</p>
              </div>

              <button
                onClick={() => setShowCategoryModal(true)}
                className="py-1.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map(c => (
                <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-white">{c.name}</h4>
                    <p className="text-[11px] text-slate-400">{c.nameNp}</p>
                    <span className="text-[10px] text-amber-400 font-mono mt-1 block">
                      {c.questionCount || 0} Questions
                    </span>
                  </div>
                  {c.isCustom && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold">
                      Custom
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Exam Profiles */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Exam Profiles & Post Configurations ({examProfiles.length})</h3>
              <p className="text-xs text-slate-400">Preconfigured PSC, Banking, Security, and TSC exam formats with 20% standard negative marking.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {examProfiles.map(e => (
                <div key={e.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                      {e.code}
                    </span>
                    <span className="text-xs text-amber-400 font-semibold">
                      Negative Penalty: {(e.defaultNegativeMarkRate * 100).toFixed(0)}%
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white">{e.name}</h4>
                    <p className="text-xs text-slate-300">{e.nameNp}</p>
                    <p className="text-[11px] text-slate-400 mt-1">{e.organization} • {e.level}</p>
                  </div>

                  {e.syllabusOutline && (
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-[11px] text-slate-300 space-y-1">
                      <strong className="text-slate-400 block">Syllabus Outline:</strong>
                      {e.syllabusOutline.map((point, pIdx) => (
                        <p key={pIdx} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                          <span>{point}</span>
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT / CREATE QUESTION */}
      {showEditModal && editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-amber-400" />
                <span>{editingQuestion.id ? 'Edit Question' : 'Create Question'}</span>
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs">
              {/* Question Type, Subject, and Topic */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Question Type:</label>
                  <select
                    value={editingQuestion.questionType || (Array.isArray(editingQuestion.correctAnswers) ? 'multiple_select' : (editingQuestion.isTrue !== undefined ? 'true_false' : 'multiple_choice'))}
                    onChange={(e) => {
                      const newType = e.target.value as QuestionType;
                      setEditingQuestion({
                        ...editingQuestion,
                        questionType: newType,
                        options: newType === 'true_false' ? ['True', 'False'] : (editingQuestion.options && editingQuestion.options.length >= 4 ? editingQuestion.options : ['Option A', 'Option B', 'Option C', 'Option D']),
                        correctAnswers: newType === 'multiple_select' ? (editingQuestion.correctAnswers || [0]) : undefined,
                        isTrue: newType === 'true_false' ? (editingQuestion.isTrue ?? true) : undefined
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    <option value="multiple_choice">Multiple Choice (Single)</option>
                    <option value="true_false">True / False</option>
                    <option value="multiple_select">Multiple Select (Multi-choice)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Subject:</label>
                  <select
                    value={editingQuestion.subject || editingQuestion.category || STRUCTURED_QUIZ_SUBJECTS[0]}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, subject: e.target.value as any, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    {STRUCTURED_QUIZ_SUBJECTS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Topic:</label>
                  <input
                    type="text"
                    placeholder="e.g. Fundamental Rights, Census 2078"
                    value={editingQuestion.topic || ''}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, topic: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              {/* Difficulty, Language, Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Difficulty:</label>
                  <select
                    value={editingQuestion.difficulty || 'medium'}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, difficulty: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Language:</label>
                  <select
                    value={editingQuestion.language || 'bilingual'}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, language: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    <option value="bilingual">Bilingual (EN + NP)</option>
                    <option value="np">Nepali Only (नेपाली)</option>
                    <option value="en">English Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Publication Status:</label>
                  <select
                    value={editingQuestion.status || 'published'}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    <option value="published">Published</option>
                    <option value="approved">Approved</option>
                    <option value="pending_review">Pending Review</option>
                    <option value="draft">Draft</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Question Text EN & NP */}
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Question (English):</label>
                <textarea
                  rows={2}
                  required
                  value={editingQuestion.questionText || editingQuestion.question || ''}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, questionText: e.target.value, question: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Question (Nepali Devanagari):</label>
                <textarea
                  rows={2}
                  value={editingQuestion.questionTextNp || ''}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, questionTextNp: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-serif"
                />
              </div>

              {/* Options Section Based on Question Type */}
              {editingQuestion.questionType === 'true_false' ? (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <label className="block font-bold text-slate-300">True / False Correct Answer:</label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setEditingQuestion({
                        ...editingQuestion,
                        isTrue: true,
                        correctOption: 0,
                        correct_answer: 'True',
                        options: ['True', 'False']
                      })}
                      className={`px-4 py-2 rounded-xl font-bold border transition ${
                        (editingQuestion.isTrue === true || editingQuestion.correctOption === 0 || editingQuestion.correct_answer === 'True')
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      True
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingQuestion({
                        ...editingQuestion,
                        isTrue: false,
                        correctOption: 1,
                        correct_answer: 'False',
                        options: ['True', 'False']
                      })}
                      className={`px-4 py-2 rounded-xl font-bold border transition ${
                        (editingQuestion.isTrue === false || editingQuestion.correctOption === 1 || editingQuestion.correct_answer === 'False')
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      False
                    </button>
                  </div>
                </div>
              ) : editingQuestion.questionType === 'multiple_select' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-300">Options & Correct Choices (Select all that apply):</label>
                    <span className="text-[11px] text-amber-400 font-semibold">Multiple Select Mode</span>
                  </div>
                  {[0, 1, 2, 3].map(optIdx => {
                    const currentAnswers = editingQuestion.correctAnswers || [];
                    const isChecked = currentAnswers.includes(optIdx);

                    return (
                      <div key={optIdx} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const newAnswers = isChecked
                              ? currentAnswers.filter(idx => idx !== optIdx)
                              : [...currentAnswers, optIdx];
                            setEditingQuestion({ ...editingQuestion, correctAnswers: newAnswers });
                          }}
                          className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center shrink-0 border transition ${
                            isChecked
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                              : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                          }`}
                          title="Toggle correct option"
                        >
                          {isChecked ? '✓' : String.fromCharCode(65 + optIdx)}
                        </button>
                        <input
                          type="text"
                          required
                          placeholder={`Option ${String.fromCharCode(65 + optIdx)} (English)`}
                          value={editingQuestion.options?.[optIdx] || ''}
                          onChange={(e) => {
                            const newOpts = [...(editingQuestion.options || ['', '', '', ''])];
                            newOpts[optIdx] = e.target.value;
                            setEditingQuestion({ ...editingQuestion, options: newOpts });
                          }}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                        />
                        <input
                          type="text"
                          placeholder={`विकल्प ${String.fromCharCode(65 + optIdx)} (Nepali)`}
                          value={editingQuestion.optionsNp?.[optIdx] || ''}
                          onChange={(e) => {
                            const newOptsNp = [...(editingQuestion.optionsNp || ['', '', '', ''])];
                            newOptsNp[optIdx] = e.target.value;
                            setEditingQuestion({ ...editingQuestion, optionsNp: newOptsNp });
                          }}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2 text-white font-serif"
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-300">4 Multiple Choice Options (Click letter to set correct answer):</label>
                    <span className="text-[11px] text-emerald-400 font-semibold">Single Correct Option</span>
                  </div>
                  {[0, 1, 2, 3].map(optIdx => (
                    <div key={optIdx} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const opts = editingQuestion.options || ['', '', '', ''];
                          setEditingQuestion({
                            ...editingQuestion,
                            correctOption: optIdx,
                            correct_answer: opts[optIdx] || String.fromCharCode(65 + optIdx)
                          });
                        }}
                        className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center shrink-0 border transition ${
                          editingQuestion.correctOption === optIdx
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                        }`}
                        title="Click to set as correct answer"
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </button>
                      <input
                        type="text"
                        required
                        placeholder={`Option ${String.fromCharCode(65 + optIdx)} (English)`}
                        value={editingQuestion.options?.[optIdx] || ''}
                        onChange={(e) => {
                          const newOpts = [...(editingQuestion.options || ['', '', '', ''])];
                          newOpts[optIdx] = e.target.value;
                          setEditingQuestion({
                            ...editingQuestion,
                            options: newOpts,
                            correct_answer: editingQuestion.correctOption === optIdx ? e.target.value : editingQuestion.correct_answer
                          });
                        }}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                      />
                      <input
                        type="text"
                        placeholder={`विकल्प ${String.fromCharCode(65 + optIdx)} (Nepali)`}
                        value={editingQuestion.optionsNp?.[optIdx] || ''}
                        onChange={(e) => {
                          const newOptsNp = [...(editingQuestion.optionsNp || ['', '', '', ''])];
                          newOptsNp[optIdx] = e.target.value;
                          setEditingQuestion({ ...editingQuestion, optionsNp: newOptsNp });
                        }}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2 text-white font-serif"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Explanation, Source, Mnemonic & Citation */}
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Explanation (Detailed):</label>
                <textarea
                  rows={2}
                  value={editingQuestion.explanation || ''}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Source Document / Book:</label>
                  <input
                    type="text"
                    value={editingQuestion.source || ''}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, source: e.target.value })}
                    placeholder="e.g. Nepal Gazette 2080, Law Commission"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Mnemonic Memory Clue:</label>
                  <input
                    type="text"
                    value={editingQuestion.mnemonicTip || ''}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, mnemonicTip: e.target.value })}
                    placeholder="Short acronym or cue"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Syllabus / Act Citation:</label>
                  <input
                    type="text"
                    value={editingQuestion.syllabusReference || ''}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, syllabusReference: e.target.value })}
                    placeholder="e.g. Constitution Art 242"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold transition"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD GROUNDING SOURCE */}
      {showSourceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>Add Grounding Document Source</span>
              </h3>
              <button onClick={() => setShowSourceModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddSource} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Document Title:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Civil Service Act 2049 (Section 8)"
                  value={newSourceTitle}
                  onChange={(e) => setNewSourceTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Source Type:</label>
                  <select
                    value={newSourceType}
                    onChange={(e) => setNewSourceType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    <option value="act">Act / Law (Ain)</option>
                    <option value="gazette">Nepal Gazette (Rajpatra)</option>
                    <option value="syllabus">Official Syllabus</option>
                    <option value="past_paper">Past Question Paper</option>
                    <option value="curriculum">Curriculum / Policy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Citation Reference:</label>
                  <input
                    type="text"
                    placeholder="e.g. Law Commission of Nepal"
                    value={newSourceCitation}
                    onChange={(e) => setNewSourceCitation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Source Text / Excerpt (Grounding Basis):</label>
                <textarea
                  rows={6}
                  required
                  placeholder="Paste relevant statutory provisions, demographics data, or factual paragraphs here..."
                  value={newSourceText}
                  onChange={(e) => setNewSourceText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSourceModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold"
                >
                  Add Source
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD CATEGORY */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Add Quiz Category</span>
              </h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Category Name (English):</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Constitutional Law"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Category Name (Nepali):</label>
                <input
                  type="text"
                  placeholder="e.g. संवैधानिक कानुन"
                  value={newCategoryNameNp}
                  onChange={(e) => setNewCategoryNameNp(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-serif"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Description:</label>
                <textarea
                  rows={2}
                  placeholder="Brief overview of topic areas..."
                  value={newCategoryDesc}
                  onChange={(e) => setNewCategoryDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold"
                >
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
