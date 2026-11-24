import React, { useState, useEffect } from 'react';
import {
  FileText,
  Sparkles,
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Edit3,
  RotateCcw,
  Save,
  Send,
  ExternalLink,
  ShieldCheck,
  Building,
  Briefcase,
  Users,
  GraduationCap,
  Calendar,
  DollarSign,
  FileCheck,
  Layers,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Copy,
  Info,
  Check,
  AlertCircle,
  Eye,
  Plus,
  Trash2,
  ArrowRight
} from 'lucide-react';
import {
  ExtractedVacancyDocument,
  ExtractorReviewStatus,
  Language,
  VacancyCategory,
  Province,
  QualificationLevel,
  Vacancy
} from '../types';
import { SAMPLE_VACANCY_DOCUMENTS, SampleVacancyDocumentItem } from '../data/sampleVacancyDocuments';

interface AdminAiVacancyExtractorProps {
  lang: Language;
  onViewLiveVacancy?: (vacancyId: string) => void;
}

export function AdminAiVacancyExtractor({ lang, onViewLiveVacancy }: AdminAiVacancyExtractorProps) {
  // Navigation: 'extractor' or 'queue'
  const [activeView, setActiveView] = useState<'extractor' | 'queue'>('extractor');

  // Extraction State
  const [documentText, setDocumentText] = useState<string>(SAMPLE_VACANCY_DOCUMENTS[0].rawText);
  const [fileName, setFileName] = useState<string>(SAMPLE_VACANCY_DOCUMENTS[0].fileName);
  const [fileSize, setFileSize] = useState<string>(SAMPLE_VACANCY_DOCUMENTS[0].fileSize);
  const [documentType, setDocumentType] = useState<'pdf' | 'text' | 'image' | 'gazette'>('pdf');
  const [refinementInstruction, setRefinementInstruction] = useState<string>('');
  
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [isReExtracting, setIsReExtracting] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);

  // Active extracted document for review
  const [currentDocument, setCurrentDocument] = useState<ExtractedVacancyDocument | null>(null);
  const [reviewQueue, setReviewQueue] = useState<ExtractedVacancyDocument[]>([]);
  const [queueStatusFilter, setQueueStatusFilter] = useState<string>('all');
  
  // Modals & Feedback
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [rejectionReasonInput, setRejectionReasonInput] = useState<string>('');
  const [showRefinementModal, setShowRefinementModal] = useState<boolean>(false);
  const [publishedVacancy, setPublishedVacancy] = useState<Vacancy | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  
  // UI Expandable Sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    org: true,
    position: true,
    quota: true,
    qualifications: true,
    dates: true,
    fees: true,
    documents: true,
    procedure: true,
    audit: true
  });

  const toggleSection = (sec: string) => {
    setExpandedSections(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load Review Queue on mount
  const loadReviewQueue = async () => {
    try {
      const res = await fetch('/api/admin/extracted-vacancies');
      if (res.ok) {
        const data = await res.json();
        setReviewQueue(data);
        if (!currentDocument && data.length > 0) {
          setCurrentDocument(data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load extracted vacancies queue:', err);
    }
  };

  useEffect(() => {
    loadReviewQueue();
  }, []);

  // Handle Sample Document Selection
  const handleSelectSample = (sample: SampleVacancyDocumentItem) => {
    setDocumentText(sample.rawText);
    setFileName(sample.fileName);
    setFileSize(sample.fileSize);
    setDocumentType('pdf');
    showToast(`Loaded sample document: "${sample.title}"`, 'info');
  };

  // Handle File Upload (Drag and Drop or Manual)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileSize(`${(file.size / (1024 * 1024)).toFixed(2)} MB`);
    const ext = file.name.split('.').pop()?.toLowerCase();
    setDocumentType(ext === 'pdf' ? 'pdf' : ext === 'png' || ext === 'jpg' ? 'image' : 'text');

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setDocumentText(text);
        showToast(`Document "${file.name}" uploaded successfully.`, 'success');
      }
    };
    reader.readAsText(file);
  };

  // Run AI Extraction via Gemini
  const handleExtractDocument = async () => {
    if (!documentText.trim() || documentText.trim().length < 30) {
      showToast('Please provide official vacancy document text or upload a document.', 'error');
      return;
    }

    setIsExtracting(true);
    try {
      const res = await fetch('/api/admin/extract-vacancy-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentText,
          fileName,
          fileSize,
          documentType,
          refinementInstruction: refinementInstruction.trim() || undefined
        })
      });

      const data = await res.json();
      if (res.ok && data.document) {
        setCurrentDocument(data.document);
        setReviewQueue(prev => [data.document, ...prev.filter(d => d.id !== data.document.id)]);
        showToast('Document extracted successfully! Status is PENDING_REVIEW.', 'success');
      } else {
        showToast(data.error || 'Failed to extract document.', 'error');
      }
    } catch (err: any) {
      console.error('Extraction error:', err);
      showToast('Network error while processing document extraction.', 'error');
    } finally {
      setIsExtracting(false);
    }
  };

  // Re-run extraction with custom refinement prompt
  const handleRegenerateExtraction = async () => {
    if (!currentDocument) return;
    setIsReExtracting(true);
    try {
      const res = await fetch(`/api/admin/extracted-vacancies/${currentDocument.id}/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refinementInstruction: refinementInstruction.trim() || undefined
        })
      });

      const data = await res.json();
      if (res.ok && data.document) {
        setCurrentDocument(data.document);
        setReviewQueue(prev => prev.map(d => d.id === data.document.id ? data.document : d));
        setShowRefinementModal(false);
        showToast('Document re-extracted with refinement criteria.', 'success');
      } else {
        showToast(data.error || 'Failed to re-extract document.', 'error');
      }
    } catch (err) {
      showToast('Network error during re-extraction.', 'error');
    } finally {
      setIsReExtracting(false);
    }
  };

  // Save current document changes (Edit / Save Draft / Approve)
  const handleUpdateDocumentStatus = async (newStatus?: ExtractorReviewStatus) => {
    if (!currentDocument) return;
    setIsSaving(true);

    const statusToSave = newStatus || currentDocument.status;
    const payload = {
      ...currentDocument,
      status: statusToSave,
      rejectionReason: statusToSave === 'REJECTED' ? rejectionReasonInput : currentDocument.rejectionReason
    };

    try {
      const res = await fetch(`/api/admin/extracted-vacancies/${currentDocument.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.document) {
        setCurrentDocument(data.document);
        setReviewQueue(prev => prev.map(d => d.id === data.document.id ? data.document : d));
        showToast(`Document updated successfully. Status: ${statusToSave}`, 'success');
        if (showRejectModal) setShowRejectModal(false);
      } else {
        showToast(data.error || 'Failed to update document.', 'error');
      }
    } catch (err) {
      showToast('Network error saving document updates.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Publish to Live Vacancies
  const handlePublishDocument = async () => {
    if (!currentDocument) return;
    setIsPublishing(true);

    try {
      const res = await fetch(`/api/admin/extracted-vacancies/${currentDocument.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified_by: 'Admin Panel Official' })
      });

      const data = await res.json();
      if (res.ok && data.vacancy) {
        setPublishedVacancy(data.vacancy);
        if (data.document) {
          setCurrentDocument(data.document);
          setReviewQueue(prev => prev.map(d => d.id === data.document.id ? data.document : d));
        }
        showToast('Vacancy published to candidate portal and directory successfully!', 'success');
      } else {
        showToast(data.error || 'Failed to publish vacancy.', 'error');
      }
    } catch (err) {
      showToast('Network error publishing vacancy.', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  // Field edit updater
  const updateField = (fieldPath: string, val: any) => {
    if (!currentDocument) return;
    const cloned: any = JSON.parse(JSON.stringify(currentDocument));
    
    // Support nested path updates like 'quotaBreakdown.value.open' or 'organization.value'
    const parts = fieldPath.split('.');
    let target = cloned;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!target[parts[i]]) target[parts[i]] = {};
      target = target[parts[i]];
    }
    target[parts[parts.length - 1]] = val;

    setCurrentDocument(cloned);
  };

  // Render Status Badge
  const renderStatusBadge = (status: ExtractorReviewStatus) => {
    switch (status) {
      case 'PENDING_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>PENDING REVIEW</span>
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>APPROVED</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" />
            <span>REJECTED</span>
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-700 text-slate-300 border border-slate-600">
            <Save className="w-3.5 h-3.5" />
            <span>DRAFT</span>
          </span>
        );
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <Send className="w-3.5 h-3.5" />
            <span>PUBLISHED</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Navigation */}
      <div className="hero-panel p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                PHASE 7
              </span>
              <span className="text-[10px] font-mono text-slate-400">/admin/ai-tools/vacancy-extractor</span>
            </div>
            <h2 className="text-xl font-black text-white flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-rose-500" />
              <span>AI Vacancy Document Extractor & Verification Lab</span>
            </h2>
            <p className="text-xs text-slate-400">
              Upload official government Gazette vacancy notices (PDF/Text) to extract structured recruitment parameters with strict zero-hallucination source grounding and admin review approval.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0">
            <button
              onClick={() => setActiveView('extractor')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                activeView === 'extractor' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Extraction Lab</span>
            </button>
            <button
              onClick={() => {
                setActiveView('queue');
                loadReviewQueue();
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                activeView === 'queue' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Review Queue ({reviewQueue.length})</span>
            </button>
          </div>
        </div>

        {/* Process Flow Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 pt-1 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
            <span className="w-4 h-4 rounded-full bg-slate-800 text-rose-400 flex items-center justify-center text-[10px] font-bold">1</span>
            <span className="truncate">Document</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
            <span className="w-4 h-4 rounded-full bg-slate-800 text-rose-400 flex items-center justify-center text-[10px] font-bold">2</span>
            <span className="truncate">Extract Text</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
            <span className="w-4 h-4 rounded-full bg-slate-800 text-rose-400 flex items-center justify-center text-[10px] font-bold">3</span>
            <span className="truncate">Gemini Parse</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
            <span className="w-4 h-4 rounded-full bg-slate-800 text-rose-400 flex items-center justify-center text-[10px] font-bold">4</span>
            <span className="truncate">Structured Data</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
            <span className="w-4 h-4 rounded-full bg-slate-800 text-rose-400 flex items-center justify-center text-[10px] font-bold">5</span>
            <span className="truncate">6-Point Audit</span>
          </div>
          <div className="flex items-center gap-1.5 bg-amber-950/40 p-2 rounded-lg border border-amber-800/40 text-amber-300">
            <span className="w-4 h-4 rounded-full bg-amber-800 text-amber-200 flex items-center justify-center text-[10px] font-bold">6</span>
            <span className="truncate">Admin Review</span>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-950/40 p-2 rounded-lg border border-emerald-800/40 text-emerald-300">
            <span className="w-4 h-4 rounded-full bg-emerald-800 text-emerald-200 flex items-center justify-center text-[10px] font-bold">7</span>
            <span className="truncate">Publish Live</span>
          </div>
        </div>
      </div>

      {/* Toast Feedback */}
      {toastMessage && (
        <div className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
          toastMessage.type === 'success' ? 'bg-emerald-950 border border-emerald-800 text-emerald-200' :
          toastMessage.type === 'error' ? 'bg-rose-950 border border-rose-800 text-rose-200' :
          'bg-blue-950 border border-blue-800 text-blue-200'
        }`}>
          <div className="flex items-center gap-2">
            {toastMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{toastMessage.text}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-xs opacity-70 hover:opacity-100">✕</button>
        </div>
      )}

      {/* VIEW 1: EXTRACTION LAB & SANDBOX */}
      {activeView === 'extractor' && (
        <div className="space-y-6">
          {/* Document Ingestion & Sample Picker Box */}
          <div className="hero-panel p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-rose-400" />
                <span>1. Document Ingestion & Official Test Samples</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                {fileName} ({fileSize})
              </span>
            </div>

            {/* 5 Real Test Sample Documents */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">
                Load Official Nepal Government Sample Gazette Document:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                {SAMPLE_VACANCY_DOCUMENTS.map((sample) => {
                  const isSelected = fileName === sample.fileName;
                  return (
                    <button
                      key={sample.id}
                      onClick={() => handleSelectSample(sample)}
                      className={`p-3 rounded-full border text-left text-xs transition space-y-1 ${
                        isSelected
                          ? 'bg-rose-950/50 border-rose-500 text-white shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          {sample.category}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-rose-400" />}
                      </div>
                      <p className="font-bold text-slate-200 line-clamp-2">{sample.title}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{sample.fileSize} • PDF</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Upload or Paste Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2">
              {/* File Upload Dropzone */}
              <div className="lg:col-span-1 border-2 border-dashed border-slate-800 rounded-xl p-5 text-center flex flex-col items-center justify-center space-y-3 hover:border-rose-500/50 transition bg-slate-900/30">
                <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-rose-400">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-200">Upload PDF or Text Notice</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Supports .pdf, .txt, .doc (Max 20MB)</p>
                </div>
                <label className="cursor-pointer py-1.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg transition">
                  <span>Select File</span>
                  <input type="file" onChange={handleFileUpload} accept=".pdf,.txt,.doc,.docx" className="hidden" />
                </label>
              </div>

              {/* Document Text Pasteboard */}
              <div className="lg:col-span-2 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-bold text-slate-300">Raw Official Document Content (Nepal Gazette / Notice):</span>
                  <span className="font-mono text-[10px]">
                    {documentText.trim().split(/\s+/).length} words • {documentText.length} chars
                  </span>
                </div>
                <textarea
                  rows={6}
                  value={documentText}
                  onChange={(e) => setDocumentText(e.target.value)}
                  placeholder="Paste official recruitment notice text here..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-sky-300 placeholder-slate-600"
                />
              </div>
            </div>

            {/* Run Extraction Trigger */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-800/80">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Strict anti-hallucination extraction enforced. Missing fields are never invented.</span>
              </div>
              <button
                onClick={handleExtractDocument}
                disabled={isExtracting || !documentText.trim()}
                className="py-2.5 px-6 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs rounded-full shadow-rose-900/30 transition flex items-center justify-center gap-2"
              >
                {isExtracting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Extracting via Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Extract Structured Vacancy Data</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* DUAL-PANE REVIEW SANDBOX (Extracted Document & Source Inspection) */}
          {currentDocument && (
            <div className="space-y-6">
              {/* Review & Status Action Bar */}
              <div className="hero-panel p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-slate-400">Document ID: {currentDocument.id}</span>
                    {renderStatusBadge(currentDocument.status)}
                  </div>
                  <h3 className="text-base font-bold text-white">
                    {currentDocument.position?.value || 'Extracted Vacancy'} — {currentDocument.organization?.value || 'Government Agency'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Extracted on {currentDocument.extractedAt} • {currentDocument.fileName}
                  </p>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowRefinementModal(true)}
                    className="py-2 px-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs rounded-full transition flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Regenerate</span>
                  </button>

                  <button
                    onClick={() => handleUpdateDocumentStatus('DRAFT')}
                    disabled={isSaving}
                    className="py-2 px-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs rounded-full transition flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5 text-slate-400" />
                    <span>Save Draft</span>
                  </button>

                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="py-2 px-3.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 font-bold text-xs rounded-full transition flex items-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Reject</span>
                  </button>

                  <button
                    onClick={() => handleUpdateDocumentStatus('APPROVED')}
                    disabled={isSaving}
                    className="py-2 px-4 bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-700/60 text-emerald-300 font-bold text-xs rounded-full transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Approve</span>
                  </button>

                  <button
                    onClick={handlePublishDocument}
                    disabled={isPublishing}
                    className="py-2 px-5 font-bold text-xs rounded-full transition flex items-center gap-1.5 bg-ink hover:bg-black text-white dark:bg-white dark:text-ink"
                  >
                    {isPublishing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Publishing...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Publish Live</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Published Success Alert */}
              {publishedVacancy && (
                <div className="bg-emerald-950 border border-emerald-800 rounded-2xl p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <h4 className="font-bold text-emerald-200 text-sm">Successfully Published to Candidate Directory!</h4>
                    </div>
                    <p className="text-xs text-emerald-300/80">
                      Vacancy <span className="font-bold text-white font-mono">{publishedVacancy.title}</span> (ID: {publishedVacancy.id}) is now live for all candidates.
                    </p>
                  </div>
                  {onViewLiveVacancy && (
                    <button
                      onClick={() => onViewLiveVacancy(publishedVacancy.id)}
                      className="py-2 px-4 font-bold text-xs rounded-full transition flex items-center gap-1.5 shrink-0 bg-ink hover:bg-black text-white dark:bg-white dark:text-ink"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View Live Vacancy Page</span>
                    </button>
                  )}
                </div>
              )}

              {/* MANDATORY WARNING BANNER: PENDING_REVIEW & ZERO-TRUST */}
              <div className="bg-amber-950/40 border border-amber-800/60 rounded-2xl p-4 text-amber-200 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <p className="font-bold text-amber-100">
                    Mandatory Policy: AI extraction is NOT automatically trusted.
                  </p>
                  <p className="text-amber-300/80">
                    Initial status is strictly <span className="font-mono font-bold text-amber-200">PENDING_REVIEW</span>. Verify each field below against the source document. No extracted vacancy is published publicly until explicitly approved by an administrator.
                  </p>
                </div>
              </div>

              {/* 6-POINT AI VALIDATION AUDIT SCORECARD */}
              {currentDocument.validationReport && (
                <div className="hero-panel p-6 space-y-4">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleSection('audit')}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-rose-400 font-bold text-xs">
                        {currentDocument.validationReport.overallScore}%
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <span>6-Point AI Validation & Grounding Audit Scorecard</span>
                        </h4>
                        <p className="text-[10px] text-slate-400">
                          Automated mathematical, chronological, and zero-hallucination verification
                        </p>
                      </div>
                    </div>
                    <button className="text-slate-400 hover:text-white">
                      {expandedSections.audit ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {expandedSections.audit && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                      {/* Check 1: Quota Math */}
                      <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-200">1. Quota Math</span>
                          {currentDocument.validationReport.quotaMathCheck.passed ? (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">PASS</span>
                          ) : (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30">DISCREPANCY</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">{currentDocument.validationReport.quotaMathCheck.feedback}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{currentDocument.validationReport.quotaMathCheck.details}</p>
                      </div>

                      {/* Check 2: Date Chronometry */}
                      <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-200">2. Date Chronology</span>
                          {currentDocument.validationReport.dateChronometryCheck.passed ? (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">PASS</span>
                          ) : (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30">WARN</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">{currentDocument.validationReport.dateChronometryCheck.feedback}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{currentDocument.validationReport.dateChronometryCheck.details}</p>
                      </div>

                      {/* Check 3: Age Bounds */}
                      <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-200">3. Age Eligibility</span>
                          {currentDocument.validationReport.ageBoundsCheck.passed ? (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">PASS</span>
                          ) : (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">CHECK</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">{currentDocument.validationReport.ageBoundsCheck.feedback}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{currentDocument.validationReport.ageBoundsCheck.details}</p>
                      </div>

                      {/* Check 4: Fee Sanity */}
                      <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-200">4. Fee Scale</span>
                          {currentDocument.validationReport.feeSanityCheck.passed ? (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">PASS</span>
                          ) : (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">CHECK</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">{currentDocument.validationReport.feeSanityCheck.feedback}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{currentDocument.validationReport.feeSanityCheck.details}</p>
                      </div>

                      {/* Check 5: Grounding Citations */}
                      <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-200">5. Source Grounding</span>
                          {currentDocument.validationReport.groundingCitationCheck.passed ? (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">CITED</span>
                          ) : (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">PARTIAL</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">{currentDocument.validationReport.groundingCitationCheck.feedback}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{currentDocument.validationReport.groundingCitationCheck.details}</p>
                      </div>

                      {/* Check 6: Field Completeness */}
                      <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-200">6. Completeness</span>
                          {currentDocument.validationReport.completenessCheck.passed ? (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">COMPLETE</span>
                          ) : (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30">MISSING</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">{currentDocument.validationReport.completenessCheck.feedback}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{currentDocument.validationReport.completenessCheck.details}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* DUAL PANE: (LEFT: Raw Document Text, RIGHT: 14 Extracted Fields with Citations) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* LEFT PANE: Source Document Inspector */}
                <div className="hero-panel lg:col-span-5 p-5 space-y-3 h-[850px] flex flex-col">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-rose-400" />
                      <span>Source Document Content</span>
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400">
                      {currentDocument.fileName}
                    </span>
                  </div>

                  <div className="flex-1 bg-slate-900/90 rounded-xl p-4 overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed border border-slate-800 whitespace-pre-wrap select-text">
                    {currentDocument.rawDocumentText || documentText}
                  </div>

                  <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 font-mono">
                    <span>Grounding Reference Engine</span>
                    <span>Gemini 3.7 Flash</span>
                  </div>
                </div>

                {/* RIGHT PANE: Extracted 14 Fields Accordions with Inline Editing & Source Badges */}
                <div className="lg:col-span-7 space-y-4 h-[850px] overflow-y-auto pr-1">
                  {/* 1. Organization Field */}
                  <div className="hero-panel p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                        <Building className="w-4 h-4 text-rose-400" />
                        <span>1. Organization & Authority</span>
                      </h4>
                      {currentDocument.organization?.sourceReference && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 truncate max-w-xs" title={currentDocument.organization.sourceReference}>
                          📜 {currentDocument.organization.sourceReference}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-[11px] text-slate-400">Full Official Organization Name:</label>
                        <input
                          type="text"
                          value={currentDocument.organization?.value || ''}
                          onChange={(e) => updateField('organization.value', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-full p-2 text-white font-bold mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400">Short Name / Code:</label>
                        <input
                          type="text"
                          value={currentDocument.shortOrg?.value || ''}
                          onChange={(e) => updateField('shortOrg.value', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-full p-2 text-white font-bold mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400">Organization (Nepali):</label>
                        <input
                          type="text"
                          value={currentDocument.organizationNp?.value || ''}
                          onChange={(e) => updateField('organizationNp.value', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-full p-2 text-white font-bold mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400">Province / Jurisdiction:</label>
                        <select
                          value={currentDocument.province?.value || 'All Nepal'}
                          onChange={(e) => updateField('province.value', e.target.value as Province)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-full p-2 text-white font-bold mt-1"
                        >
                          {['All Nepal', 'Koshi', 'Madhesh', 'Bagmati', 'Gandaki', 'Lumbini', 'Karnali', 'Sudurpashchim'].map(p => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* 2. Position & Category */}
                  <div className="hero-panel p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-amber-400" />
                        <span>2. Position, Level & Service Group</span>
                      </h4>
                      {currentDocument.position?.sourceReference && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 truncate max-w-xs" title={currentDocument.position.sourceReference}>
                          📜 {currentDocument.position.sourceReference}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-[11px] text-slate-400">Position Title (English):</label>
                        <input
                          type="text"
                          value={currentDocument.position?.value || ''}
                          onChange={(e) => updateField('position.value', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-full p-2 text-white font-bold mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400">Position Title (Nepali):</label>
                        <input
                          type="text"
                          value={currentDocument.positionNp?.value || ''}
                          onChange={(e) => updateField('positionNp.value', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-full p-2 text-white font-bold mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400">Level / Tier:</label>
                        <input
                          type="text"
                          value={currentDocument.level?.value || ''}
                          onChange={(e) => updateField('level.value', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-full p-2 text-white font-bold mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400">Recruitment Category:</label>
                        <select
                          value={currentDocument.category?.value || 'Lok Sewa (PSC)'}
                          onChange={(e) => updateField('category.value', e.target.value as VacancyCategory)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-full p-2 text-white font-bold mt-1"
                        >
                          {['Lok Sewa (PSC)', 'Teacher Service (TSC)', 'Banking & Finance', 'Security Forces', 'Health Services', 'Provincial Lok Sewa', 'Local Level (Nagarpalika)'].map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* 3. Number of Posts & Inclusive Quota Breakdown */}
                  <div className="hero-panel p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-400" />
                        <h4 className="text-xs font-bold text-slate-200">3. Number of Posts & Inclusive Quota Breakdown</h4>
                      </div>
                      {currentDocument.numberOfPosts?.sourceReference && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 truncate max-w-xs" title={currentDocument.numberOfPosts.sourceReference}>
                          📜 {currentDocument.numberOfPosts.sourceReference}
                        </span>
                      )}
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="text-[11px] text-slate-400">Total Number of Posts (कुल पद सङ्ख्या):</label>
                        <input
                          type="number"
                          value={currentDocument.numberOfPosts?.value || 0}
                          onChange={(e) => updateField('numberOfPosts.value', parseInt(e.target.value) || 0)}
                          className="w-32 bg-slate-900 border border-slate-800 rounded-full p-2 text-white font-bold mt-1"
                        />
                      </div>

                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                        <p className="text-[11px] font-bold text-slate-300">Detailed Quota Breakdown (समावेशी कोटा विभाजन):</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <div>
                            <label className="text-[10px] text-slate-400">Open (खुला):</label>
                            <input
                              type="number"
                              value={currentDocument.quotaBreakdown?.value?.open || 0}
                              onChange={(e) => updateField('quotaBreakdown.value.open', parseInt(e.target.value) || 0)}
                              className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400">Female (महिला):</label>
                            <input
                              type="number"
                              value={currentDocument.quotaBreakdown?.value?.female || 0}
                              onChange={(e) => updateField('quotaBreakdown.value.female', parseInt(e.target.value) || 0)}
                              className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400">Janajati (जनजाति):</label>
                            <input
                              type="number"
                              value={currentDocument.quotaBreakdown?.value?.janajati || 0}
                              onChange={(e) => updateField('quotaBreakdown.value.janajati', parseInt(e.target.value) || 0)}
                              className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400">Madhesi (मधेसी):</label>
                            <input
                              type="number"
                              value={currentDocument.quotaBreakdown?.value?.madhesi || 0}
                              onChange={(e) => updateField('quotaBreakdown.value.madhesi', parseInt(e.target.value) || 0)}
                              className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400">Dalit (दलित):</label>
                            <input
                              type="number"
                              value={currentDocument.quotaBreakdown?.value?.dalit || 0}
                              onChange={(e) => updateField('quotaBreakdown.value.dalit', parseInt(e.target.value) || 0)}
                              className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400">Disabled (अपाङ्ग):</label>
                            <input
                              type="number"
                              value={currentDocument.quotaBreakdown?.value?.apanga || 0}
                              onChange={(e) => updateField('quotaBreakdown.value.apanga', parseInt(e.target.value) || 0)}
                              className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400">Backward (पिछडिएको):</label>
                            <input
                              type="number"
                              value={currentDocument.quotaBreakdown?.value?.pichhadiye || 0}
                              onChange={(e) => updateField('quotaBreakdown.value.pichhadiye', parseInt(e.target.value) || 0)}
                              className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400">Other Quota:</label>
                            <input
                              type="number"
                              value={currentDocument.quotaBreakdown?.value?.other || 0}
                              onChange={(e) => updateField('quotaBreakdown.value.other', parseInt(e.target.value) || 0)}
                              className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-white"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4 & 5. Qualification, Streams & Experience */}
                  <div className="hero-panel p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-purple-400" />
                        <span>4 & 5. Academic Qualifications & Required Fields</span>
                      </h4>
                      {currentDocument.qualification?.sourceReference && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 truncate max-w-xs" title={currentDocument.qualification.sourceReference}>
                          📜 {currentDocument.qualification.sourceReference}
                        </span>
                      )}
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="text-[11px] text-slate-400">Minimum Academic Level:</label>
                        <select
                          value={currentDocument.qualificationLevel?.value || 'Bachelor Degree'}
                          onChange={(e) => updateField('qualificationLevel.value', e.target.value as QualificationLevel)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-full p-2 text-white font-bold mt-1"
                        >
                          {['SEE/SLC', '+2 High School', 'Bachelor Degree', 'Master Degree', 'MPhil/PhD'].map(l => (
                            <option key={l} value={l}>{l}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-400">Qualification Description:</label>
                        <textarea
                          rows={2}
                          value={currentDocument.qualification?.value || ''}
                          onChange={(e) => updateField('qualification.value', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-2 text-white mt-1 text-xs"
                        />
                      </div>

                      {/* 6. Experience */}
                      <div>
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] text-slate-400">6. Experience Requirement:</label>
                          {currentDocument.experience?.isMissingInDoc && (
                            <span className="text-[10px] text-amber-400 font-mono">Not Stated in Document (Never Invented)</span>
                          )}
                        </div>
                        <input
                          type="text"
                          value={currentDocument.experience?.value || ''}
                          onChange={(e) => updateField('experience.value', e.target.value)}
                          placeholder="e.g. No prior experience required for open entry"
                          className="w-full bg-slate-900 border border-slate-800 rounded-full p-2 text-white font-bold mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 7, 8, 9, 10. Age, Fees & Application Deadlines */}
                  <div className="hero-panel p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-rose-400" />
                        <span>7, 8, 9 & 10. Age, Fees & Deadlines</span>
                      </h4>
                      {currentDocument.deadline?.sourceReference && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 truncate max-w-xs" title={currentDocument.deadline.sourceReference}>
                          📜 {currentDocument.deadline.sourceReference}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="text-[11px] text-slate-400">Min Age (Years):</label>
                        <input
                          type="number"
                          value={currentDocument.age?.value?.minAge || 18}
                          onChange={(e) => updateField('age.value.minAge', parseInt(e.target.value) || 18)}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-white mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400">Max Age (Male):</label>
                        <input
                          type="number"
                          value={currentDocument.age?.value?.maxAgeMale || 35}
                          onChange={(e) => updateField('age.value.maxAgeMale', parseInt(e.target.value) || 35)}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-white mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400">Max Age (Female/Disabled):</label>
                        <input
                          type="number"
                          value={currentDocument.age?.value?.maxAgeFemaleDisabled || 40}
                          onChange={(e) => updateField('age.value.maxAgeFemaleDisabled', parseInt(e.target.value) || 40)}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-white mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
                      <div>
                        <label className="text-[11px] text-slate-400">Single Fee (NPR):</label>
                        <input
                          type="number"
                          value={currentDocument.fee?.value?.singleFee || 1000}
                          onChange={(e) => updateField('fee.value.singleFee', parseInt(e.target.value) || 0)}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-white mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400">Double Fee (NPR):</label>
                        <input
                          type="number"
                          value={currentDocument.fee?.value?.doubleFee || 2000}
                          onChange={(e) => updateField('fee.value.doubleFee', parseInt(e.target.value) || 0)}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-white mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400">Inclusive Extra Fee (NPR):</label>
                        <input
                          type="number"
                          value={currentDocument.fee?.value?.inclusiveGroupExtraFee || 300}
                          onChange={(e) => updateField('fee.value.inclusiveGroupExtraFee', parseInt(e.target.value) || 0)}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-white mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
                      <div>
                        <label className="text-[11px] text-slate-400">Single Fee Deadline (YYYY-MM-DD):</label>
                        <input
                          type="date"
                          value={currentDocument.deadline?.value || currentDocument.applicationDates?.value?.singleFeeDeadline || ''}
                          onChange={(e) => {
                            updateField('deadline.value', e.target.value);
                            updateField('applicationDates.value.singleFeeDeadline', e.target.value);
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-white mt-1 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400">Double Fee Deadline (YYYY-MM-DD):</label>
                        <input
                          type="date"
                          value={currentDocument.applicationDates?.value?.doubleFeeDeadline || ''}
                          onChange={(e) => updateField('applicationDates.value.doubleFeeDeadline', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-white mt-1 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400">11. Written Exam Date:</label>
                        <input
                          type="date"
                          value={currentDocument.examDate?.value || ''}
                          onChange={(e) => updateField('examDate.value', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-white mt-1 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 12, 13, 14. Salary, Required Documents & Application Procedure */}
                  <div className="hero-panel p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-emerald-400" />
                        <span>12, 13 & 14. Salary, Documents & Procedure</span>
                      </h4>
                      {currentDocument.applicationProcedure?.sourceReference && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 truncate max-w-xs" title={currentDocument.applicationProcedure.sourceReference}>
                          📜 {currentDocument.applicationProcedure.sourceReference}
                        </span>
                      )}
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="text-[11px] text-slate-400">12. Salary & Allowances:</label>
                        <input
                          type="text"
                          value={currentDocument.salary?.value || ''}
                          onChange={(e) => updateField('salary.value', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-full p-2 text-white font-bold mt-1"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-400">13. Required Documents List (Comma-separated or Bulleted):</label>
                        <textarea
                          rows={2}
                          value={Array.isArray(currentDocument.requiredDocuments?.value) ? currentDocument.requiredDocuments.value.join('\n') : (currentDocument.requiredDocuments?.value || '')}
                          onChange={(e) => updateField('requiredDocuments.value', e.target.value.split('\n').filter(Boolean))}
                          className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-2 text-white text-xs mt-1"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-400">14. Application Procedure & Online Portal:</label>
                        <textarea
                          rows={2}
                          value={currentDocument.applicationProcedure?.value || ''}
                          onChange={(e) => updateField('applicationProcedure.value', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-2 text-white text-xs mt-1"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-slate-400">Application Portal URL:</label>
                          <input
                            type="text"
                            value={currentDocument.applyUrl?.value || ''}
                            onChange={(e) => updateField('applyUrl.value', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-white font-mono mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-400">Notice Code / Gazette Number:</label>
                          <input
                            type="text"
                            value={currentDocument.noticeNumber?.value || ''}
                            onChange={(e) => updateField('noticeNumber.value', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-white font-mono mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: REVIEW QUEUE */}
      {activeView === 'queue' && (
        <div className="hero-panel p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-rose-400" />
                <span>Extracted Vacancy Documents Review Queue</span>
              </h3>
              <p className="text-xs text-slate-400">
                Track all incoming AI extracted documents through the review, validation, approval, and publication pipeline.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              {['all', 'PENDING_REVIEW', 'APPROVED', 'DRAFT', 'REJECTED', 'PUBLISHED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setQueueStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-full font-bold transition text-[11px] ${
                    queueStatusFilter === st ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {st === 'all' ? 'All Queue' : st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {reviewQueue.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <FileText className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs font-bold">No extracted documents in this queue yet.</p>
              <p className="text-[11px] text-slate-500">Go to the Extraction Lab to ingest and parse a new vacancy document.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviewQueue
                .filter(d => queueStatusFilter === 'all' || d.status.toUpperCase() === queueStatusFilter.toUpperCase())
                .map((doc) => {
                  return (
                    <div
                      key={doc.id}
                      className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-white">{doc.position?.value || 'Official Vacancy'}</span>
                          {renderStatusBadge(doc.status)}
                          {doc.validationReport && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-400">
                              Audit: {doc.validationReport.overallScore}%
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-300">
                          {doc.organization?.value} • <span className="font-bold text-rose-400">{doc.numberOfPosts?.value || 1} Posts</span> • {doc.category?.value}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          File: {doc.fileName} • Extracted on {doc.extractedAt}
                        </p>
                        {doc.rejectionReason && (
                          <p className="text-[11px] text-rose-400 font-mono">
                            Rejection Reason: {doc.rejectionReason}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setCurrentDocument(doc);
                            setActiveView('extractor');
                          }}
                          className="py-1.5 px-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-full transition flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Review & Edit</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* MODAL: Reject Document Reason */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/30 backdrop-blur-sm">
          <div className="hero-panel max-w-md w-full p-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                <XCircle className="w-4 h-4" /> Reject Extracted Vacancy Document
              </h3>
              <button onClick={() => setShowRejectModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-300">
              Please enter the administrative reason for rejecting this extraction (e.g. invalid signature, obsolete notice, or corrupted text).
            </p>

            <textarea
              rows={3}
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
              placeholder="e.g. Expired fiscal year notice or contradictory quota numbers."
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3 text-xs text-white placeholder-slate-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="py-2 px-4 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-full"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateDocumentStatus('REJECTED')}
                disabled={!rejectionReasonInput.trim()}
                className="py-2 px-5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs rounded-full"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Refine & Re-extract */}
      {showRefinementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/30 backdrop-blur-sm">
          <div className="hero-panel max-w-md w-full p-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <RotateCcw className="w-4 h-4" /> Re-extract with Custom Instructions
              </h3>
              <button onClick={() => setShowRefinementModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-300">
              Provide specific extraction directives to Gemini (e.g., focus on quota numbers, re-verify single fee vs double fee dates):
            </p>

            <textarea
              rows={3}
              value={refinementInstruction}
              onChange={(e) => setRefinementInstruction(e.target.value)}
              placeholder="e.g. Pay special attention to Section 2 for inclusive quota counts."
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3 text-xs text-white placeholder-slate-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRefinementModal(false)}
                className="py-2 px-4 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-full"
              >
                Cancel
              </button>
              <button
                onClick={handleRegenerateExtraction}
                disabled={isReExtracting}
                className="py-2 px-5 font-bold text-xs rounded-full flex items-center gap-1.5 bg-ink hover:bg-black text-white dark:bg-white dark:text-ink"
              >
                {isReExtracting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Start Re-extraction</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
