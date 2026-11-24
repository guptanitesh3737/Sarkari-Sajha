import React, { useState } from 'react';
import {
  X,
  MessageSquare,
  Bug,
  Sparkles,
  AlertTriangle,
  Award,
  Bot,
  Star,
  Send,
  CheckCircle2,
  Loader2,
  FileQuestion,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import { Language, BetaFeedbackType, BetaSurveyAnswer } from '../types';

interface BetaFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  userId?: string;
  userEmail?: string;
  userName?: string;
  initialType?: BetaFeedbackType;
  initialRelatedId?: string;
}

export const BetaFeedbackModal: React.FC<BetaFeedbackModalProps> = ({
  isOpen,
  onClose,
  lang,
  userId,
  userEmail = '',
  userName = '',
  initialType = 'general_feedback',
  initialRelatedId
}) => {
  const [activeTab, setActiveTab] = useState<'feedback' | 'survey'>('feedback');
  
  // Feedback Form State
  const [feedbackType, setFeedbackType] = useState<BetaFeedbackType>(initialType);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // 10-Question Survey State
  const [surveyAnswers, setSurveyAnswers] = useState<BetaSurveyAnswer>({
    q1_purpose: '',
    q2_most_useful_feature: '',
    q3_confusing_parts: '',
    q4_found_relevant_vacancy: 'Yes',
    q5_used_quiz: 'Yes',
    q6_ai_assistant_helpful: 'Yes',
    q7_weekly_return_reason: '',
    q8_biggest_problem: '',
    q9_recommend_rating: '9 - Extremely Likely',
    q10_improve_first: ''
  });
  const [submittingSurvey, setSubmittingSurvey] = useState(false);
  const [surveySuccess, setSurveySuccess] = useState(false);

  if (!isOpen) return null;

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setSubmittingFeedback(true);
    try {
      const res = await fetch('/api/beta/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: feedbackType,
          title,
          description,
          rating,
          relatedId: initialRelatedId,
          contextUrl: window.location.pathname,
          userEmail,
          userName
        })
      });
      if (res.ok) {
        setFeedbackSuccess(true);
        setTimeout(() => {
          setFeedbackSuccess(false);
          setTitle('');
          setDescription('');
          onClose();
        }, 2000);
      }
    } catch (err) {
      console.error('Feedback submit error:', err);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleSurveySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingSurvey(true);
    try {
      const res = await fetch('/api/beta/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: surveyAnswers,
          userEmail,
          userName
        })
      });
      if (res.ok) {
        setSurveySuccess(true);
        setTimeout(() => {
          setSurveySuccess(false);
          onClose();
        }, 2500);
      }
    } catch (err) {
      console.error('Survey submit error:', err);
    } finally {
      setSubmittingSurvey(false);
    }
  };

  const feedbackTypes: { type: BetaFeedbackType; labelEn: string; labelNp: string; icon: any }[] = [
    { type: 'general_feedback', labelEn: 'General Feedback', labelNp: 'सामान्य प्रतिक्रिया', icon: MessageSquare },
    { type: 'bug_report', labelEn: 'Bug Report', labelNp: 'समस्या / बग रिपोर्ट', icon: Bug },
    { type: 'feature_request', labelEn: 'Feature Request', labelNp: 'नयाँ सुविधा अनुरोध', icon: Sparkles },
    { type: 'wrong_vacancy_info', labelEn: 'Wrong Vacancy Info', labelNp: 'गलत विज्ञापन विवरण', icon: AlertTriangle },
    { type: 'incorrect_quiz_question', labelEn: 'Quiz Question Error', labelNp: 'प्रश्नोत्तर त्रुटी', icon: Award },
    { type: 'incorrect_ai_response', labelEn: 'AI Guidance Issue', labelNp: 'एआई सल्लाह त्रुटी', icon: Bot }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-ink/30 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-2xl overflow-hidden transition-all my-8 shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
        {/* Header */}
        <div className="p-5 border-b flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-sm">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {lang === 'np' ? 'निजी बिटा प्रतिक्रिया केन्द्र' : 'Private Beta Feedback Center'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                  Beta v1.0
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'np'
                  ? 'तपाईंको अनुभवले सरकारी साझालाई अझ परिपक्व बनाउन मद्दत गर्दछ।'
                  : 'Your direct candidate feedback shapes our verified platform roadmap.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b bg-slate-50 dark:bg-slate-950/80 px-5 pt-2">
          <button
            onClick={() => setActiveTab('feedback')}
            className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
              activeTab === 'feedback'
                ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{lang === 'np' ? 'प्रतिक्रिया / बग दर्ता' : 'Send Feedback / Bug Report'}</span>
          </button>

          <button
            onClick={() => setActiveTab('survey')}
            className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
              activeTab === 'survey'
                ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileQuestion className="w-3.5 h-3.5" />
            <span>{lang === 'np' ? '१०-प्रश्न बिटा सर्वेक्षण' : '10-Question Beta Survey'}</span>
          </button>
        </div>

        {/* Tab 1: Feedback Form */}
        {activeTab === 'feedback' && (
          <div className="p-6">
            {feedbackSuccess ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {lang === 'np' ? 'प्रतिक्रिया सफलतापूर्वक प्राप्त भयो!' : 'Feedback Successfully Recorded!'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  {lang === 'np'
                    ? 'हाम्रो सम्पादकीय तथा प्राविधिक टोलीले तपाईंको सुझावलाई ध्यानपूर्वक समीक्षा गर्नेछ।'
                    : 'Our editorial board and engineering team have logged this issue for active review.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                {/* Category Grid */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    {lang === 'np' ? 'प्रतिक्रियाको प्रकार छान्नुहोस्:' : 'Select Feedback Category:'}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {feedbackTypes.map((item) => {
                      const Icon = item.icon;
                      const isSelected = feedbackType === item.type;
                      return (
                        <button
                          key={item.type}
                          type="button"
                          onClick={() => setFeedbackType(item.type)}
                          className={`p-2.5 rounded-full border text-left flex items-center gap-2 transition text-xs font-semibold ${
                            isSelected
                              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 shadow-xs'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-rose-600' : 'text-slate-400'}`} />
                          <span className="truncate">{lang === 'np' ? item.labelNp : item.labelEn}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {lang === 'np' ? 'समग्र प्लेटफर्म अनुभव मूल्याङ्कन:' : 'Overall Platform Experience Rating:'}
                  </label>
                  <div className="flex items-center space-x-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 text-slate-300 hover:text-amber-400 transition"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300 dark:text-slate-700'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-2 font-mono">
                      {rating} / 5
                    </span>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'np' ? 'शीर्षक / विषय:' : 'Summary / Title:'}
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={
                      lang === 'np'
                        ? 'जस्तै: अधिकृत पाठ्यक्रम पिडिएफ डाउनलोडमा समस्या...'
                        : 'e.g. Broken link on Section Officer official notice or Mobile layout issue...'
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-full text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
                  />
                </div>

                {/* Detailed Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'np' ? 'विस्तृत विवरण:' : 'Detailed Description & Steps to Reproduce:'}
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={
                      lang === 'np'
                        ? 'कृपया के समस्या आयो वा के सुधार चाहनुहुन्छ स्पष्ट लेख्नुहोस्...'
                        : 'Please describe what happened, what was expected, and how we can improve this for all candidates...'
                    }
                    className="w-full px-3.5 py-2.5 bg-sky-50/70 dark:bg-slate-950 rounded-2xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
                  />
                </div>

                {/* Submit button */}
                <div className="pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Private & Secure Candidate Observation</span>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingFeedback || !title.trim() || !description.trim()}
                    className="py-2.5 px-5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold rounded-full transition flex items-center gap-2 shadow-sm"
                  >
                    {submittingFeedback ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>{lang === 'np' ? 'प्रतिक्रिया पठाउनुहोस्' : 'Submit Feedback'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Tab 2: 10-Question Beta Survey */}
        {activeTab === 'survey' && (
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {surveySuccess ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {lang === 'np' ? 'सर्वेक्षण पूरा गर्नुभएकोमा धन्यवाद!' : 'Thank You for Completing the Beta Survey!'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Your structured feedback ensures SarkariSajha meets the highest standards for all Lok Sewa & public service aspirants.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSurveySubmit} className="space-y-5">
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-xs text-blue-800 dark:text-blue-300">
                  <p className="font-semibold">
                    📋 SarkariSajha Candidate Launch Survey (10 Questions)
                  </p>
                  <p className="text-[11px] opacity-80 mt-0.5">
                    Takes approximately 2 minutes. Helps calibrate model sets, AI accuracy, and deadline alerts.
                  </p>
                </div>

                {/* Q1 */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    1. What did you use SarkariSajha for? (तपाईंले सरकारी साझा के प्रयोजनका लागि प्रयोग गर्नुभयो?)
                  </label>
                  <input
                    type="text"
                    required
                    value={surveyAnswers.q1_purpose}
                    onChange={(e) => setSurveyAnswers({ ...surveyAnswers, q1_purpose: e.target.value })}
                    placeholder="e.g. Lok Sewa Section Officer preparation, daily vacancy tracking, syllabus checking..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-full text-xs"
                  />
                </div>

                {/* Q2 */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    2. What feature did you find most useful? (सबैभन्दा उपयोगी सुविधा कुन लाग्यो?)
                  </label>
                  <input
                    type="text"
                    required
                    value={surveyAnswers.q2_most_useful_feature}
                    onChange={(e) => setSurveyAnswers({ ...surveyAnswers, q2_most_useful_feature: e.target.value })}
                    placeholder="e.g. AI Career Assistant, Timed Mock Exam with Negative Marking, Gazette Verification..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-full text-xs"
                  />
                </div>

                {/* Q3 */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    3. What was confusing? (कुन पक्ष बुझ्न वा चलाउन कठिन लाग्यो?)
                  </label>
                  <input
                    type="text"
                    value={surveyAnswers.q3_confusing_parts}
                    onChange={(e) => setSurveyAnswers({ ...surveyAnswers, q3_confusing_parts: e.target.value })}
                    placeholder="e.g. Navigating between provincial and federal notices, timer interface..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-full text-xs"
                  />
                </div>

                {/* Q4 */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    4. Did you find a vacancy relevant to your qualification? (आफ्नो योग्यता अनुसारको विज्ञापन भेट्नुभयो?)
                  </label>
                  <select
                    value={surveyAnswers.q4_found_relevant_vacancy}
                    onChange={(e) => setSurveyAnswers({ ...surveyAnswers, q4_found_relevant_vacancy: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-full text-xs"
                  >
                    <option value="Yes - Matched perfectly">Yes - Matched perfectly (हो, सजिलै भेटियो)</option>
                    <option value="Yes - But needed manual searching">Yes - But needed manual searching (भेटियो तर खोज्नुपर्‍यो)</option>
                    <option value="No - My field was not listed">No - My field was not listed (मेरो क्षेत्रको विज्ञापन थिएन)</option>
                  </select>
                </div>

                {/* Q5 */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    5. Did you use the mock quiz system? (अनलाइन परीक्षा / क्विज प्रणाली प्रयोग गर्नुभयो?)
                  </label>
                  <select
                    value={surveyAnswers.q5_used_quiz}
                    onChange={(e) => setSurveyAnswers({ ...surveyAnswers, q5_used_quiz: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-full text-xs"
                  >
                    <option value="Yes - Completed full timed sets">Yes - Completed full timed sets (हो, समयसीमासहित पूरा गरें)</option>
                    <option value="Yes - Tested a few questions">Yes - Tested a few questions (केही प्रश्न अभ्यास गरें)</option>
                    <option value="No - Not yet">No - Not yet (छैन)</option>
                  </select>
                </div>

                {/* Q6 */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    6. Did the AI career assistant help you? (एआई सहायकले उपयोगी मार्गदर्शन गर्‍यो?)
                  </label>
                  <select
                    value={surveyAnswers.q6_ai_assistant_helpful}
                    onChange={(e) => setSurveyAnswers({ ...surveyAnswers, q6_ai_assistant_helpful: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-full text-xs"
                  >
                    <option value="Very helpful - Accurate citations">Very helpful - Accurate citations (धेरै उपयोगी)</option>
                    <option value="Moderately helpful">Moderately helpful (ठीकै)</option>
                    <option value="Did not use AI assistant">Did not use AI assistant (प्रयोग गरिनँ)</option>
                  </select>
                </div>

                {/* Q7 */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    7. What would make you return every week? (तपाईंलाई हरेक हप्ता फर्किन के कुराले प्रेरित गर्छ?)
                  </label>
                  <input
                    type="text"
                    required
                    value={surveyAnswers.q7_weekly_return_reason}
                    onChange={(e) => setSurveyAnswers({ ...surveyAnswers, q7_weekly_return_reason: e.target.value })}
                    placeholder="e.g. Weekly updated model sets, instant deadline alerts, current affairs summary..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-full text-xs"
                  />
                </div>

                {/* Q8 */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    8. What is the biggest problem with SarkariSajha? (सबैभन्दा ठूलो समस्या के देख्नुभयो?)
                  </label>
                  <input
                    type="text"
                    required
                    value={surveyAnswers.q8_biggest_problem}
                    onChange={(e) => setSurveyAnswers({ ...surveyAnswers, q8_biggest_problem: e.target.value })}
                    placeholder="e.g. Need more provincial model sets, offline mode support..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-full text-xs"
                  />
                </div>

                {/* Q9 */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    9. Would you recommend SarkariSajha to another student? (साथीहरूलाई सिफारिस गर्नुहुन्छ?)
                  </label>
                  <select
                    value={surveyAnswers.q9_recommend_rating}
                    onChange={(e) => setSurveyAnswers({ ...surveyAnswers, q9_recommend_rating: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-full text-xs"
                  >
                    <option value="10 - Extremely Likely">10 / 10 - Extremely Likely (अवश्य गर्नेछु)</option>
                    <option value="8 - Likely">8 / 10 - Likely (सम्भवतः गर्नेछु)</option>
                    <option value="6 - Neutral">6 / 10 - Neutral</option>
                    <option value="4 - Unlikely">4 / 10 - Unlikely</option>
                  </select>
                </div>

                {/* Q10 */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    10. What should we improve first? (हामीले सर्वप्रथम के सुधार गर्नुपर्ला?)
                  </label>
                  <input
                    type="text"
                    required
                    value={surveyAnswers.q10_improve_first}
                    onChange={(e) => setSurveyAnswers({ ...surveyAnswers, q10_improve_first: e.target.value })}
                    placeholder="e.g. Add offline study notes, audio explanation for constitution, more banking mock tests..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-full text-xs"
                  />
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingSurvey}
                    className="py-2.5 px-6 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold rounded-full transition flex items-center gap-2 shadow-sm"
                  >
                    {submittingSurvey ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Submit 10-Question Survey</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
