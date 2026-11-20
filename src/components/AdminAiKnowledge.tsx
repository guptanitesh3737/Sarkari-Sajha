import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit2,
  ExternalLink,
  Sparkles,
  Search,
  Filter,
  FileText
} from 'lucide-react';
import { AiKnowledgeItem } from '../types';
import {
  fetchAiKnowledgeFromFirestore,
  saveAiKnowledgeToFirestore,
  deleteAiKnowledgeFromFirestore
} from '../lib/firestoreService';
import { User as FirebaseUser } from 'firebase/auth';

interface AdminAiKnowledgeProps {
  user: FirebaseUser | null;
  adminRole: string;
}

export const AdminAiKnowledge: React.FC<AdminAiKnowledgeProps> = ({ user, adminRole }) => {
  const [items, setItems] = useState<AiKnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [editingItem, setEditingItem] = useState<Partial<AiKnowledgeItem> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const loadKnowledge = async () => {
    setLoading(true);
    try {
      const data = await fetchAiKnowledgeFromFirestore();
      setItems(data);
    } catch (err) {
      console.error('Error loading AI knowledge base:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKnowledge();
  }, []);

  const handleOpenCreate = () => {
    setEditingItem({
      id: `k_${Date.now()}`,
      title: '',
      category: 'Exam Rules',
      organization: 'Public Service Commission (Lok Sewa Aayog)',
      content: '',
      official_sources: ['Nepal Gazette / Official Act'],
      verification_status: 'verified',
      verified_by: user?.email || 'Authorized Administrator',
      verified_at: new Date().toISOString().split('T')[0],
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: AiKnowledgeItem) => {
    setEditingItem({ ...item });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.title || !editingItem?.content) {
      alert('Title and Content are mandatory.');
      return;
    }

    setSaving(true);
    try {
      const payload: AiKnowledgeItem = {
        id: editingItem.id || `k_${Date.now()}`,
        title: editingItem.title.trim(),
        category: (editingItem.category as any) || 'Exam Rules',
        organization: editingItem.organization?.trim() || 'Government of Nepal',
        content: editingItem.content.trim(),
        official_sources: Array.isArray(editingItem.official_sources)
          ? editingItem.official_sources
          : (editingItem.official_sources as string || '').split(',').map((s) => s.trim()).filter(Boolean),
        verification_status: editingItem.verification_status || 'verified',
        verified_by: editingItem.verified_by || user?.email || 'Authorized Administrator',
        verified_at: editingItem.verified_at || new Date().toISOString().split('T')[0],
        isActive: Boolean(editingItem.isActive),
        createdAt: editingItem.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const ok = await saveAiKnowledgeToFirestore(
        payload,
        user?.uid || 'admin',
        user?.email || 'admin@sarkarisajha.gov.np'
      );

      if (ok) {
        setIsModalOpen(false);
        setEditingItem(null);
        setStatusMsg(`Knowledge record "${payload.title}" saved.`);
        setTimeout(() => setStatusMsg(null), 3500);
        await loadKnowledge();
      } else {
        alert('Failed to save knowledge record.');
      }
    } catch (err: any) {
      alert(err?.message || 'Error saving AI knowledge');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete AI knowledge entry "${title}"?`)) return;
    const ok = await deleteAiKnowledgeFromFirestore(
      id,
      user?.uid || 'admin',
      user?.email || 'admin@sarkarisajha.gov.np'
    );
    if (ok) {
      setStatusMsg(`Record deleted.`);
      setTimeout(() => setStatusMsg(null), 3000);
      await loadKnowledge();
    }
  };

  const filteredItems = items.filter((item) => {
    if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.content.toLowerCase().includes(q) ||
        (item.organization && item.organization.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide">Controlled AI Knowledge Layer</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Ground candidate study guidance, negative marking rules, quotas, and syllabus explanations strictly in verified public sector records.
          </p>
        </div>
        <button
          id="btn-create-knowledge"
          onClick={handleOpenCreate}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Verified Rule / Syllabus</span>
        </button>
      </div>

      {statusMsg && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-700/80 text-emerald-300 text-sm rounded-xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Mandatory Guardrail Banner */}
      <div className="bg-amber-950/30 border border-amber-800/60 p-4 rounded-xl flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold text-amber-200">Strict Human Verification Guardrail (Prompt Rule #7)</p>
          <p className="text-slate-300 leading-relaxed">
            AI is strictly prohibited from autonomously publishing vacancies or fabricating government requirements. AI guidance must cite these verified records. If official data is unavailable, AI is commanded to return: <span className="font-mono text-amber-300">"Official information not available. Please verify with official notice."</span>
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search verified syllabus, acts, rules, age ceilings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700 text-slate-200 text-sm pl-9 pr-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700 text-slate-200 text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Categories</option>
            <option value="Syllabus">Syllabus</option>
            <option value="Eligibility">Eligibility</option>
            <option value="Exam Rules">Exam Rules & Marking</option>
            <option value="Acts & Regulations">Acts & Regulations</option>
            <option value="Reservation Policy">Reservation Policy</option>
            <option value="Official FAQ">Official FAQ</option>
          </select>
        </div>
      </div>

      {/* Knowledge Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 p-10 text-center text-slate-400">Loading AI Knowledge items...</div>
        ) : filteredItems.length === 0 ? (
          <div className="col-span-2 p-10 text-center text-slate-400">No knowledge items match your search.</div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              id={`knowledge-card-${item.id}`}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all shadow-md"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-indigo-950/80 text-indigo-300 border border-indigo-700/60">
                    {item.category}
                  </span>
                  <div className="flex items-center space-x-1 text-xs text-emerald-400 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified ({item.verified_by || 'Admin'})</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white leading-snug">{item.title}</h3>
                {item.organization && (
                  <p className="text-[11px] text-slate-400 font-medium">{item.organization}</p>
                )}

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-850 p-3 rounded-xl border border-slate-800/80">
                  {item.content}
                </p>

                {item.official_sources && item.official_sources.length > 0 && (
                  <div className="pt-1">
                    <p className="text-[11px] text-slate-400 font-semibold mb-1">Official Sources:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {item.official_sources.map((src, i) => (
                        <span key={i} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                          {src}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <span className="text-[10px] text-slate-500">Updated: {new Date(item.updatedAt).toLocaleDateString()}</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title="Edit Record"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.title)}
                    className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40"
                    title="Delete Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">
              {editingItem.createdAt ? 'Edit Knowledge Record' : 'Add Official Rule / Syllabus Record'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Record Title</label>
                <input
                  type="text"
                  required
                  value={editingItem.title || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  placeholder="e.g. Lok Sewa Aayog 20% Negative Marking Deduction Rule"
                  className="w-full bg-slate-800 border border-slate-700 text-white text-sm px-3.5 py-2.5 rounded-xl focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={editingItem.category || 'Exam Rules'}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value as any })}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-sm px-3.5 py-2 rounded-xl"
                  >
                    <option value="Syllabus">Syllabus</option>
                    <option value="Eligibility">Eligibility</option>
                    <option value="Exam Rules">Exam Rules</option>
                    <option value="Acts & Regulations">Acts & Regulations</option>
                    <option value="Reservation Policy">Reservation Policy</option>
                    <option value="Official FAQ">Official FAQ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Responsible Authority</label>
                  <input
                    type="text"
                    value={editingItem.organization || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, organization: e.target.value })}
                    placeholder="e.g. Public Service Commission / MoFAGA"
                    className="w-full bg-slate-800 border border-slate-700 text-white text-sm px-3.5 py-2 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Authoritative Guidance & Full Text <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={editingItem.content || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })}
                  placeholder="Official formulation, calculation rules, statutory provisions, or syllabus outlines..."
                  className="w-full bg-slate-800 border border-slate-700 text-white text-sm px-3.5 py-2.5 rounded-xl focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Official Sources & Gazette References (Comma separated)
                </label>
                <input
                  type="text"
                  value={Array.isArray(editingItem.official_sources) ? editingItem.official_sources.join(', ') : (editingItem.official_sources || '')}
                  onChange={(e) => setEditingItem({ ...editingItem, official_sources: e.target.value.split(',').map(s => s.trim()) })}
                  placeholder="e.g. Civil Service Act 2049 Rule 18, Nepal Gazette Vol 74"
                  className="w-full bg-slate-800 border border-slate-700 text-white text-sm px-3.5 py-2 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-300 hover:text-white rounded-xl bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold"
                >
                  {saving ? 'Saving...' : 'Save Knowledge Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
