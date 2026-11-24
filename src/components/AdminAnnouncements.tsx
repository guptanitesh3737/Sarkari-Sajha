import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Archive,
  AlertTriangle,
  ExternalLink,
  Layers,
  X,
  Sparkles,
  Calendar
} from 'lucide-react';
import { Announcement, AnnouncementPriority, AnnouncementStatus } from '../types';
import {
  fetchAnnouncementsFromFirestore,
  saveAnnouncementToFirestore,
  deleteAnnouncementFromFirestore
} from '../lib/firestoreService';
import { User as FirebaseUser } from 'firebase/auth';

interface AdminAnnouncementsProps {
  user: FirebaseUser | null;
  adminRole: string;
}

export const AdminAnnouncements: React.FC<AdminAnnouncementsProps> = ({
  user,
  adminRole
}) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<Announcement | null>(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Partial<Announcement> | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await fetchAnnouncementsFromFirestore();
      setAnnouncements(data);
    } catch (err) {
      console.error('Failed to load announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleOpenCreate = () => {
    setEditingAnnouncement({
      id: `ann_${Date.now()}`,
      title: '',
      short_description: '',
      full_content: '',
      banner_url: '',
      priority: 'normal',
      target_audience: 'all',
      CTA_text: 'Learn More',
      CTA_url: '',
      publish_at: new Date().toISOString().slice(0, 16),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      status: 'DRAFT',
      popup_enabled: false
    });
    setIsEditModalOpen(true);
  };

  const handleOpenEdit = (item: Announcement) => {
    setEditingAnnouncement({
      ...item,
      publish_at: item.publish_at ? item.publish_at.slice(0, 16) : new Date().toISOString().slice(0, 16),
      expires_at: item.expires_at ? item.expires_at.slice(0, 16) : ''
    });
    setIsEditModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnnouncement?.title || !editingAnnouncement?.short_description) {
      alert('Title and Short Description are required.');
      return;
    }

    setSaving(true);
    try {
      const payload: Announcement = {
        id: editingAnnouncement.id || `ann_${Date.now()}`,
        title: editingAnnouncement.title.trim(),
        short_description: editingAnnouncement.short_description.trim(),
        full_content: editingAnnouncement.full_content || editingAnnouncement.short_description,
        banner_url: editingAnnouncement.banner_url?.trim() || '',
        priority: (editingAnnouncement.priority as AnnouncementPriority) || 'normal',
        target_audience: editingAnnouncement.target_audience || 'all',
        CTA_text: editingAnnouncement.CTA_text?.trim() || 'Learn More',
        CTA_url: editingAnnouncement.CTA_url?.trim() || '',
        publish_at: editingAnnouncement.publish_at ? new Date(editingAnnouncement.publish_at).toISOString() : new Date().toISOString(),
        expires_at: editingAnnouncement.expires_at ? new Date(editingAnnouncement.expires_at).toISOString() : undefined,
        status: (editingAnnouncement.status as AnnouncementStatus) || 'DRAFT',
        popup_enabled: Boolean(editingAnnouncement.popup_enabled),
        viewsCount: editingAnnouncement.viewsCount || 0,
        clicksCount: editingAnnouncement.clicksCount || 0,
        createdAt: editingAnnouncement.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        created_by: user?.email || 'Admin Staff'
      };

      const ok = await saveAnnouncementToFirestore(
        payload,
        user?.uid || 'admin',
        user?.email || 'admin@sarkarisajha.gov.np'
      );

      if (ok) {
        setIsEditModalOpen(false);
        setEditingAnnouncement(null);
        setActionMessage('Announcement saved and synchronized to Firestore successfully.');
        setTimeout(() => setActionMessage(null), 4000);
        await loadAnnouncements();
      } else {
        alert('Failed to save announcement. Please check server logs.');
      }
    } catch (err: any) {
      console.error('Error in handleSave:', err);
      alert(err?.message || 'Error saving announcement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete announcement "${title}"? This cannot be undone.`)) {
      return;
    }
    try {
      const ok = await deleteAnnouncementFromFirestore(
        id,
        user?.uid || 'admin',
        user?.email || 'admin@sarkarisajha.gov.np'
      );
      if (ok) {
        setActionMessage('Announcement deleted.');
        setTimeout(() => setActionMessage(null), 3000);
        await loadAnnouncements();
      }
    } catch (err) {
      console.error('Error deleting announcement:', err);
    }
  };

  const handleTogglePublish = async (item: Announcement) => {
    const nextStatus: AnnouncementStatus = item.status === 'PUBLISHED' ? 'ARCHIVED' : 'PUBLISHED';
    const updated: Announcement = {
      ...item,
      status: nextStatus,
      updatedAt: new Date().toISOString()
    };
    await saveAnnouncementToFirestore(
      updated,
      user?.uid || 'admin',
      user?.email || 'admin@sarkarisajha.gov.np'
    );
    await loadAnnouncements();
  };

  const filteredAnnouncements = announcements.filter((a) => {
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
    if (priorityFilter !== 'ALL' && a.priority !== priorityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.short_description.toLowerCase().includes(q) ||
        a.target_audience.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getPriorityBadge = (p: AnnouncementPriority) => {
    switch (p) {
      case 'urgent':
        return <span className="px-2 py-0.5 text-xs font-black rounded bg-red-900/60 text-red-200 border border-red-700">Urgent</span>;
      case 'high':
        return <span className="px-2 py-0.5 text-xs font-bold rounded bg-amber-900/60 text-amber-200 border border-amber-700">High</span>;
      case 'normal':
        return <span className="px-2 py-0.5 text-xs font-medium rounded bg-blue-900/40 text-blue-300 border border-blue-800">Normal</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-normal rounded bg-slate-800 text-slate-400">Low</span>;
    }
  };

  const getStatusBadge = (s: AnnouncementStatus) => {
    switch (s) {
      case 'PUBLISHED':
        return <span className="flex items-center space-x-1 px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-950/70 text-emerald-300 border border-emerald-700/60"><CheckCircle2 className="w-3.5 h-3.5" /><span>Published</span></span>;
      case 'SCHEDULED':
        return <span className="flex items-center space-x-1 px-2.5 py-1 text-xs font-bold rounded-full bg-indigo-950/70 text-indigo-300 border border-indigo-700/60"><Clock className="w-3.5 h-3.5" /><span>Scheduled</span></span>;
      case 'DRAFT':
        return <span className="flex items-center space-x-1 px-2.5 py-1 text-xs font-bold rounded-full bg-slate-800 text-slate-300 border border-slate-700"><Edit2 className="w-3.5 h-3.5" /><span>Draft</span></span>;
      case 'EXPIRED':
        return <span className="flex items-center space-x-1 px-2.5 py-1 text-xs font-bold rounded-full bg-amber-950/70 text-amber-300 border border-amber-700/60"><Clock className="w-3.5 h-3.5" /><span>Expired</span></span>;
      case 'ARCHIVED':
        return <span className="flex items-center space-x-1 px-2.5 py-1 text-xs font-bold rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700"><Archive className="w-3.5 h-3.5" /><span>Archived</span></span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg border border-rose-500/20">
              <Megaphone className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide">Announcements CMS</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Publish official routine releases, deadline bulletins, exam schedule banners, and interactive candidate popups.
          </p>
        </div>
        <button
          id="btn-create-announcement"
          onClick={handleOpenCreate}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Announcement</span>
        </button>
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-700/80 text-emerald-300 text-sm rounded-xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            id="input-search-announcements"
            type="text"
            placeholder="Search by title, description or audience..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700 text-slate-200 text-sm pl-9 pr-3 py-2 rounded-full focus:outline-none focus:border-rose-500"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            id="select-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700 text-slate-200 text-sm px-3 py-2 rounded-full focus:outline-none focus:border-rose-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="DRAFT">Draft</option>
            <option value="EXPIRED">Expired</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 shrink-0">Priority:</span>
          <select
            id="select-priority-filter"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700 text-slate-200 text-sm px-3 py-2 rounded-full focus:outline-none focus:border-rose-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Announcements Table / List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading announcements from Firestore...</div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Megaphone className="w-10 h-10 mx-auto text-slate-600 mb-3" />
            <p className="font-semibold text-slate-300">No announcements match your search criteria</p>
            <p className="text-xs text-slate-500 mt-1">Create an announcement or adjust the status and priority filters above.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filteredAnnouncements.map((item) => (
              <div
                key={item.id}
                id={`announcement-row-${item.id}`}
                className="p-4 sm:p-5 hover:bg-slate-850/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {getStatusBadge(item.status)}
                    {getPriorityBadge(item.priority)}
                    {item.popup_enabled && (
                      <span className="px-2 py-0.5 text-xs font-bold rounded bg-purple-900/50 text-purple-200 border border-purple-700 flex items-center space-x-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Popup Enabled</span>
                      </span>
                    )}
                    <span className="text-xs text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded">
                      Audience: {item.target_audience}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white tracking-wide truncate">{item.title}</h3>
                  <p className="text-xs text-slate-300 line-clamp-2">{item.short_description}</p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                    <span>Publish: {new Date(item.publish_at).toLocaleDateString()}</span>
                    {item.expires_at && <span>Expires: {new Date(item.expires_at).toLocaleDateString()}</span>}
                    {item.CTA_url && (
                      <a
                        href={item.CTA_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-rose-400 hover:underline flex items-center space-x-1"
                      >
                        <span>CTA: {item.CTA_text || 'Link'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                  <button
                    id={`btn-preview-${item.id}`}
                    onClick={() => setPreviewItem(item)}
                    title="Live Preview"
                    className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center space-x-1"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="hidden sm:inline">Preview</span>
                  </button>
                  <button
                    id={`btn-toggle-${item.id}`}
                    onClick={() => handleTogglePublish(item)}
                    title={item.status === 'PUBLISHED' ? 'Archive notice' : 'Publish notice'}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                      item.status === 'PUBLISHED'
                        ? 'bg-amber-900/40 text-amber-300 hover:bg-amber-900/70 border border-amber-800'
                        : 'bg-emerald-900/50 text-emerald-200 hover:bg-emerald-800 border border-emerald-700'
                    }`}
                  >
                    {item.status === 'PUBLISHED' ? 'Archive' : 'Publish'}
                  </button>
                  <button
                    id={`btn-edit-${item.id}`}
                    onClick={() => handleOpenEdit(item)}
                    title="Edit Announcement"
                    className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    id={`btn-delete-${item.id}`}
                    onClick={() => handleDelete(item.id, item.title)}
                    title="Delete Announcement"
                    className="p-2 rounded-full bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isEditModalOpen && editingAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-ink/30 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
              <div className="flex items-center space-x-2">
                <Megaphone className="w-5 h-5 text-rose-400" />
                <h3 className="text-lg font-bold text-white">
                  {editingAnnouncement.createdAt ? 'Edit Announcement' : 'Create New Announcement'}
                </h3>
              </div>
              <button
                id="btn-close-modal"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Announcement Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="input-announcement-title"
                    type="text"
                    required
                    value={editingAnnouncement.title || ''}
                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, title: e.target.value })}
                    placeholder="e.g. Lok Sewa Aayog Section Officer 2082 Examination Schedule Published"
                    className="w-full bg-slate-800 border border-slate-700 text-white text-sm px-3.5 py-2.5 rounded-full focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Short Description (Shown on cards & previews) <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    id="input-announcement-desc"
                    required
                    rows={2}
                    value={editingAnnouncement.short_description || ''}
                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, short_description: e.target.value })}
                    placeholder="Brief 1-2 sentence overview for candidate notifications and feeds..."
                    className="w-full bg-slate-800 border border-slate-700 text-white text-sm px-3.5 py-2.5 rounded-2xl focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Full Content (Optional extended notice / markdown details)
                  </label>
                  <textarea
                    id="input-announcement-content"
                    rows={4}
                    value={editingAnnouncement.full_content || ''}
                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, full_content: e.target.value })}
                    placeholder="Detailed explanation, instructions, official references, and syllabus notes..."
                    className="w-full bg-slate-800 border border-slate-700 text-white text-sm px-3.5 py-2.5 rounded-2xl focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Publication Status</label>
                  <select
                    id="select-announcement-status"
                    value={editingAnnouncement.status || 'DRAFT'}
                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, status: e.target.value as AnnouncementStatus })}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-sm px-3.5 py-2.5 rounded-full focus:border-rose-500 focus:outline-none"
                  >
                    <option value="DRAFT">DRAFT (Hidden from candidates)</option>
                    <option value="SCHEDULED">SCHEDULED (Auto-activates on publish date)</option>
                    <option value="PUBLISHED">PUBLISHED (Live immediately)</option>
                    <option value="EXPIRED">EXPIRED (Past deadline)</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Notice Priority</label>
                  <select
                    id="select-announcement-priority"
                    value={editingAnnouncement.priority || 'normal'}
                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, priority: e.target.value as AnnouncementPriority })}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-sm px-3.5 py-2.5 rounded-full focus:border-rose-500 focus:outline-none"
                  >
                    <option value="urgent">URGENT (Top Red Banner)</option>
                    <option value="high">HIGH (Highlighted)</option>
                    <option value="normal">NORMAL</option>
                    <option value="low">LOW</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Audience</label>
                  <select
                    id="select-announcement-audience"
                    value={editingAnnouncement.target_audience || 'all'}
                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, target_audience: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-sm px-3.5 py-2.5 rounded-full focus:border-rose-500 focus:outline-none"
                  >
                    <option value="all">All Candidates</option>
                    <option value="lok_sewa">Lok Sewa (PSC) Aspirants</option>
                    <option value="tsc">Teacher Service (TSC)</option>
                    <option value="banking">Banking Sector Candidates</option>
                    <option value="security">Nepal Police / Army / APF</option>
                    <option value="subscribers">Premium Subscribers Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Optional Banner Image URL</label>
                  <input
                    id="input-announcement-banner"
                    type="url"
                    value={editingAnnouncement.banner_url || ''}
                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, banner_url: e.target.value })}
                    placeholder="https://example.com/banner.jpg"
                    className="w-full bg-slate-800 border border-slate-700 text-white text-sm px-3.5 py-2.5 rounded-full focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Publish Date & Time</label>
                  <input
                    id="input-announcement-publish-at"
                    type="datetime-local"
                    value={editingAnnouncement.publish_at || ''}
                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, publish_at: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-sm px-3.5 py-2.5 rounded-full focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Expiry Date & Time (Optional)</label>
                  <input
                    id="input-announcement-expires-at"
                    type="datetime-local"
                    value={editingAnnouncement.expires_at || ''}
                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, expires_at: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-sm px-3.5 py-2.5 rounded-full focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Call-to-Action (CTA) Button Text</label>
                  <input
                    id="input-announcement-cta-text"
                    type="text"
                    value={editingAnnouncement.CTA_text || ''}
                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, CTA_text: e.target.value })}
                    placeholder="e.g. View Exam Centers"
                    className="w-full bg-slate-800 border border-slate-700 text-white text-sm px-3.5 py-2.5 rounded-full focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">CTA URL</label>
                  <input
                    id="input-announcement-cta-url"
                    type="text"
                    value={editingAnnouncement.CTA_url || ''}
                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, CTA_url: e.target.value })}
                    placeholder="https://... or /#vacancies"
                    className="w-full bg-slate-800 border border-slate-700 text-white text-sm px-3.5 py-2.5 rounded-full focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2 pt-2">
                  <label className="flex items-center space-x-3 cursor-pointer bg-slate-850 p-3 rounded-xl border border-slate-700">
                    <input
                      id="checkbox-popup-enabled"
                      type="checkbox"
                      checked={Boolean(editingAnnouncement.popup_enabled)}
                      onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, popup_enabled: e.target.checked })}
                      className="w-4 h-4 text-rose-600 rounded bg-slate-800 border-slate-600 focus:ring-sky-300"
                    />
                    <div>
                      <p className="text-sm font-bold text-white">Enable Candidate Welcome Popup</p>
                      <p className="text-xs text-slate-400">
                        When enabled and published, this announcement will render as an interactive priority popup dialog when candidates visit the app.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-300 hover:text-white rounded-full bg-slate-800 hover:bg-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  id="btn-save-announcement"
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-sm text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 rounded-full font-bold flex items-center space-x-2"
                >
                  {saving ? <span>Saving...</span> : <span>Save to Firestore</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIVE BANNER PREVIEW MODAL */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/30 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-rose-400" />
                <h4 className="text-xs font-mono text-slate-400">Candidate View Preview</h4>
              </div>
              <button onClick={() => setPreviewItem(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className={`p-5 rounded-2xl border ${
              previewItem.priority === 'urgent'
                ? 'bg-red-950/40 border-red-700/60'
                : 'bg-slate-800/80 border-slate-700'
            } space-y-3`}>
              <div className="flex items-center justify-between">
                {getPriorityBadge(previewItem.priority)}
                <span className="text-[11px] text-slate-400">Official Notice</span>
              </div>

              <h3 className="text-lg font-bold text-white">{previewItem.title}</h3>
              <p className="text-sm text-slate-300 leading-relaxed">{previewItem.short_description}</p>

              {previewItem.full_content && previewItem.full_content !== previewItem.short_description && (
                <p className="text-xs text-slate-400 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                  {previewItem.full_content}
                </p>
              )}

              {previewItem.CTA_text && (
                <div className="pt-2">
                  <a
                    href={previewItem.CTA_url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                  >
                    <span>{previewItem.CTA_text}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            <button
              onClick={() => setPreviewItem(null)}
              className="w-full py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
