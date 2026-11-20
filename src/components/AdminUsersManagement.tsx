import React, { useState, useEffect, useMemo } from 'react';
import {
  User,
  Users,
  Search,
  Filter,
  Download,
  Shield,
  ShieldAlert,
  UserCheck,
  UserX,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Bell,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  ExternalLink,
  MapPin,
  Award,
  BookOpen,
  Briefcase,
  Calendar,
  CreditCard,
  History,
  FileText,
  Activity,
  MessageSquare,
  Sparkles,
  Lock,
  X,
  Loader2,
  TrendingUp,
  Clock
} from 'lucide-react';
import {
  AdminRole,
  ManagedUser,
  ManagedUserDetails,
  fetchAllUsersFromFirestore,
  fetchCompleteUserDetailsFromFirestore,
  updateUserRoleInFirestore,
  suspendUserAccountInFirestore,
  reactivateUserAccountInFirestore,
  anonymizeOrDeleteUserInFirestore,
  sendAuthorizedUserNotification,
  updateUserProfileInFirestore
} from '../lib/firestoreService';
import { Language, Province, QualificationLevel, VacancyCategory, UserProfile } from '../types';
import { NEPAL_PROVINCES, NEPAL_DISTRICTS } from '../data/nepalLocations';

interface AdminUsersManagementProps {
  userRole: AdminRole;
  currentAdminUid: string;
  currentAdminEmail: string;
  currentAdminName: string;
  lang: Language;
}

export const AdminUsersManagement: React.FC<AdminUsersManagementProps> = ({
  userRole,
  currentAdminUid,
  currentAdminEmail,
  currentAdminName,
  lang
}) => {
  const isSuperAdmin =
    userRole === 'super_admin' ||
    currentAdminEmail.toLowerCase().trim() === 'guptanitesh3737@gmail.com' ||
    currentAdminEmail.toLowerCase().trim() === 'admin@sarkarisajha.gov.np';

  const isNormalAdmin = userRole === 'admin';
  const isEditor = userRole === 'editor';

  // User list state
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'subscribers' | 'suspended' | 'free'>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [provinceFilter, setProvinceFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name_asc' | 'name_desc' | 'last_active'>('newest');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Selected User for Detailed Profile Modal
  const [selectedUserUid, setSelectedUserUid] = useState<string | null>(null);
  const [selectedUserDetails, setSelectedUserDetails] = useState<ManagedUserDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState<
    | 'overview'
    | 'personal'
    | 'location'
    | 'education'
    | 'career'
    | 'saved_vacancies'
    | 'quizzes'
    | 'subscription'
    | 'feedback'
    | 'timeline'
    | 'audit'
  >('overview');

  // Action Modals State
  const [suspendModalUser, setSuspendModalUser] = useState<ManagedUser | null>(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  const [deleteModalUser, setDeleteModalUser] = useState<ManagedUser | null>(null);
  const [deleteConfirmationCode, setDeleteConfirmationCode] = useState('');

  const [notifyModalUser, setNotifyModalUser] = useState<ManagedUser | null>(null);
  const [notifyTitle, setNotifyTitle] = useState('');
  const [notifyMessage, setNotifyMessage] = useState('');

  const [editModalUser, setEditModalUser] = useState<ManagedUser | null>(null);
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({});

  const [notificationBanner, setNotificationBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedUid, setCopiedUid] = useState<string | null>(null);

  // Load users from Firestore
  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchAllUsersFromFirestore();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
      showBanner('error', 'Failed to retrieve production users from Firestore.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadUsers();
  };

  const showBanner = (type: 'success' | 'error', message: string) => {
    setNotificationBanner({ type, message });
    setTimeout(() => setNotificationBanner(null), 5000);
  };

  const handleCopyUid = (uid: string) => {
    navigator.clipboard.writeText(uid);
    setCopiedUid(uid);
    setTimeout(() => setCopiedUid(null), 2000);
  };

  // Aggregated Metric Counts
  const metrics = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status !== 'suspended').length;
    const suspended = users.filter((u) => u.status === 'suspended').length;
    const subscribers = users.filter((u) => u.isSubscriber).length;
    const free = total - subscribers;
    
    // New in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsers = users.filter((u) => {
      if (!u.createdAt || u.createdAt === 'N/A') return false;
      const d = new Date(u.createdAt);
      return !isNaN(d.getTime()) && d >= thirtyDaysAgo;
    }).length;

    return { total, active, suspended, subscribers, free, newUsers };
  }, [users]);

  // Filter and Sort Users
  const filteredUsers = useMemo(() => {
    let list = [...users];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (u) =>
          u.displayName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.phone.includes(q) ||
          u.uid.toLowerCase().includes(q) ||
          (u.province && u.province.toLowerCase().includes(q)) ||
          (u.district && u.district.toLowerCase().includes(q))
      );
    }

    // Filter tab
    if (filterTab === 'active') {
      list = list.filter((u) => u.status !== 'suspended');
    } else if (filterTab === 'suspended') {
      list = list.filter((u) => u.status === 'suspended');
    } else if (filterTab === 'subscribers') {
      list = list.filter((u) => u.isSubscriber);
    } else if (filterTab === 'free') {
      list = list.filter((u) => !u.isSubscriber);
    }

    // Role Filter
    if (roleFilter !== 'all') {
      list = list.filter((u) => u.role === roleFilter);
    }

    // Province Filter
    if (provinceFilter !== 'all') {
      list = list.filter((u) => u.province === provinceFilter);
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'newest') {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return db - da;
      }
      if (sortBy === 'oldest') {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return da - db;
      }
      if (sortBy === 'name_asc') {
        return a.displayName.localeCompare(b.displayName);
      }
      if (sortBy === 'name_desc') {
        return b.displayName.localeCompare(a.displayName);
      }
      if (sortBy === 'last_active') {
        const da = a.lastActiveAt ? new Date(a.lastActiveAt).getTime() : 0;
        const db = b.lastActiveAt ? new Date(b.lastActiveAt).getTime() : 0;
        return db - da;
      }
      return 0;
    });

    return list;
  }, [users, searchQuery, filterTab, roleFilter, provinceFilter, sortBy]);

  // Paginated records
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  // Load full user details for profile modal
  const handleOpenUserProfile = async (uid: string) => {
    setSelectedUserUid(uid);
    setProfileModalTab('overview');
    setLoadingDetails(true);
    try {
      const details = await fetchCompleteUserDetailsFromFirestore(
        uid,
        currentAdminUid,
        userRole,
        currentAdminName
      );
      setSelectedUserDetails(details);
    } catch (err) {
      console.error('Failed to load user details:', err);
      showBanner('error', 'Failed to retrieve full user profile from Firestore.');
    } finally {
      setLoadingDetails(false);
    }
  };

  // Role Change Handler
  const handleRoleElevation = async (targetUid: string, newRole: AdminRole) => {
    if (!isSuperAdmin) {
      showBanner('error', 'Only Super Administrators have authority to modify roles.');
      return;
    }
    const success = await updateUserRoleInFirestore(
      targetUid,
      newRole,
      currentAdminUid,
      currentAdminName
    );
    if (success) {
      setUsers((prev) =>
        prev.map((u) => (u.uid === targetUid ? { ...u, role: newRole } : u))
      );
      if (selectedUserDetails && selectedUserDetails.user.uid === targetUid) {
        setSelectedUserDetails({
          ...selectedUserDetails,
          user: { ...selectedUserDetails.user, role: newRole }
        });
      }
      showBanner('success', `User role successfully updated to ${newRole}.`);
    } else {
      showBanner('error', 'Failed to update user role in Firestore.');
    }
  };

  // Suspend User
  const handleConfirmSuspend = async () => {
    if (!suspendModalUser) return;
    setSubmittingAction(true);
    const res = await suspendUserAccountInFirestore(
      suspendModalUser.uid,
      suspendReason,
      currentAdminUid,
      currentAdminName,
      userRole
    );
    setSubmittingAction(false);
    if (res.success) {
      setUsers((prev) =>
        prev.map((u) =>
          u.uid === suspendModalUser.uid
            ? { ...u, status: 'suspended', suspensionReason: suspendReason }
            : u
        )
      );
      if (selectedUserDetails && selectedUserDetails.user.uid === suspendModalUser.uid) {
        setSelectedUserDetails({
          ...selectedUserDetails,
          user: { ...selectedUserDetails.user, status: 'suspended', suspensionReason: suspendReason }
        });
      }
      showBanner('success', res.message);
      setSuspendModalUser(null);
      setSuspendReason('');
    } else {
      showBanner('error', res.message);
    }
  };

  // Reactivate User
  const handleConfirmReactivate = async (targetUser: ManagedUser) => {
    const res = await reactivateUserAccountInFirestore(
      targetUser.uid,
      currentAdminUid,
      currentAdminName,
      userRole
    );
    if (res.success) {
      setUsers((prev) =>
        prev.map((u) =>
          u.uid === targetUser.uid ? { ...u, status: 'active', suspensionReason: undefined } : u
        )
      );
      if (selectedUserDetails && selectedUserDetails.user.uid === targetUser.uid) {
        setSelectedUserDetails({
          ...selectedUserDetails,
          user: { ...selectedUserDetails.user, status: 'active', suspensionReason: undefined }
        });
      }
      showBanner('success', res.message);
    } else {
      showBanner('error', res.message);
    }
  };

  // Delete / Anonymize User
  const handleConfirmDelete = async () => {
    if (!deleteModalUser) return;
    setSubmittingAction(true);
    const res = await anonymizeOrDeleteUserInFirestore(
      deleteModalUser.uid,
      deleteConfirmationCode,
      currentAdminUid,
      currentAdminName,
      userRole
    );
    setSubmittingAction(false);
    if (res.success) {
      setUsers((prev) =>
        prev.map((u) =>
          u.uid === deleteModalUser.uid
            ? {
                ...u,
                displayName: '[Anonymized User]',
                email: `anonymized@deleted.sarkarisajha.com`,
                status: 'suspended'
              }
            : u
        )
      );
      showBanner('success', res.message);
      setDeleteModalUser(null);
      setDeleteConfirmationCode('');
      if (selectedUserUid === deleteModalUser.uid) {
        setSelectedUserUid(null);
        setSelectedUserDetails(null);
      }
    } else {
      showBanner('error', res.message);
    }
  };

  // Send Direct Notification
  const handleSendNotification = async () => {
    if (!notifyModalUser || !notifyTitle.trim() || !notifyMessage.trim()) return;
    setSubmittingAction(true);
    const res = await sendAuthorizedUserNotification(
      notifyModalUser.uid,
      notifyTitle,
      notifyMessage,
      currentAdminUid,
      currentAdminName
    );
    setSubmittingAction(false);
    if (res.success) {
      showBanner('success', res.message);
      setNotifyModalUser(null);
      setNotifyTitle('');
      setNotifyMessage('');
    } else {
      showBanner('error', res.message);
    }
  };

  // Save Edited Profile Fields
  const handleSaveEditedProfile = async () => {
    if (!editModalUser) return;
    setSubmittingAction(true);
    const success = await updateUserProfileInFirestore(editModalUser.uid, editForm);
    setSubmittingAction(false);
    if (success) {
      showBanner('success', 'User profile successfully updated in Firestore.');
      setUsers((prev) =>
        prev.map((u) =>
          u.uid === editModalUser.uid
            ? {
                ...u,
                displayName: editForm.name || u.displayName,
                phone: editForm.phone || u.phone,
                province: editForm.province || u.province,
                district: editForm.district || u.district,
                qualificationLevel: editForm.qualificationLevel || u.qualificationLevel,
                fieldOfStudy: editForm.fieldOfStudy || u.fieldOfStudy
              }
            : u
        )
      );
      if (selectedUserDetails && selectedUserDetails.user.uid === editModalUser.uid) {
        setSelectedUserDetails({
          ...selectedUserDetails,
          user: {
            ...selectedUserDetails.user,
            displayName: editForm.name || selectedUserDetails.user.displayName,
            phone: editForm.phone || selectedUserDetails.user.phone,
            province: editForm.province || selectedUserDetails.user.province,
            district: editForm.district || selectedUserDetails.user.district,
            qualificationLevel: editForm.qualificationLevel || selectedUserDetails.user.qualificationLevel,
            fieldOfStudy: editForm.fieldOfStudy || selectedUserDetails.user.fieldOfStudy
          }
        });
      }
      setEditModalUser(null);
    } else {
      showBanner('error', 'Failed to update user profile in Firestore.');
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    if (!isSuperAdmin) {
      showBanner('error', '403 Forbidden: Only Super Administrators have permission to export user records.');
      return;
    }

    const headers = [
      'Firebase UID',
      'Display Name',
      'Email',
      'Phone',
      'Role',
      'Account Status',
      'Province',
      'District',
      'Municipality',
      'Qualification Level',
      'Field of Study',
      'Target Exam',
      'Is Subscriber',
      'Subscription Tier',
      'Registered Date',
      'Last Active'
    ];

    const rows = filteredUsers.map((u) => [
      `"${u.uid}"`,
      `"${(u.displayName || '').replace(/"/g, '""')}"`,
      `"${(u.email || '').replace(/"/g, '""')}"`,
      `"${(u.phone || '').replace(/"/g, '""')}"`,
      `"${u.role}"`,
      `"${u.status}"`,
      `"${u.province || ''}"`,
      `"${u.district || ''}"`,
      `"${u.municipality || ''}"`,
      `"${u.qualificationLevel || ''}"`,
      `"${(u.fieldOfStudy || '').replace(/"/g, '""')}"`,
      `"${(u.preferredExam || '').replace(/"/g, '""')}"`,
      `"${u.isSubscriber ? 'YES' : 'NO'}"`,
      `"${u.subscriptionPlan || 'Free'}"`,
      `"${u.createdAt || ''}"`,
      `"${u.lastActiveAt || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sarkarisajha_users_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showBanner('success', `Exported ${filteredUsers.length} user records to CSV.`);
  };

  // Strict RBAC Gate for Content Editor
  if (isEditor) {
    return (
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 text-center text-white space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-950/60 border border-amber-800 text-amber-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-white">Access Restricted: Role-Based Access Control</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          Content Editors are strictly restricted from accessing candidate personal information in compliance with
          production privacy standards. Editors are authorized to manage Vacancies, Quizzes, and Educational Materials
          only.
        </p>
        <div className="pt-2">
          <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
            Active Role: Content Editor ({currentAdminEmail})
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification Banner */}
      {notificationBanner && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between transition ${
            notificationBanner.type === 'success'
              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
              : 'bg-rose-950/80 text-rose-300 border border-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {notificationBanner.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{notificationBanner.message}</span>
          </div>
          <button onClick={() => setNotificationBanner(null)} className="p-1 hover:opacity-70">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. TOP METRICS DASHBOARD */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Users */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total Users</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{metrics.total}</div>
          <div className="text-[10px] text-slate-500 mt-1">Production Firestore</div>
        </div>

        {/* Active Users */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between text-emerald-400 text-xs mb-1">
            <span>Active Users</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">{metrics.active}</div>
          <div className="text-[10px] text-slate-500 mt-1">Normal standing</div>
        </div>

        {/* New Users (30d) */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between text-blue-400 text-xs mb-1">
            <span>New (30 Days)</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-blue-400">{metrics.newUsers}</div>
          <div className="text-[10px] text-slate-500 mt-1">Recent registrations</div>
        </div>

        {/* Subscribers */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between text-amber-400 text-xs mb-1">
            <span>Subscribers</span>
            <CreditCard className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">{metrics.subscribers}</div>
          <div className="text-[10px] text-slate-500 mt-1">Premium plan active</div>
        </div>

        {/* Free Users */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Free Users</span>
            <BookOpen className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-300">{metrics.free}</div>
          <div className="text-[10px] text-slate-500 mt-1">Candidate tier</div>
        </div>

        {/* Suspended */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between text-rose-400 text-xs mb-1">
            <span>Suspended</span>
            <UserX className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400">{metrics.suspended}</div>
          <div className="text-[10px] text-slate-500 mt-1">Restricted accounts</div>
        </div>
      </div>

      {/* 2. SEARCH, FILTER & ACTION BAR */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-rose-500" />
              <span>Registered Candidate & User Management</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Secure administrative access to voluntarily submitted user profiles, location, exam preferences, and account status.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 flex items-center gap-1.5 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            {isSuperAdmin && (
              <button
                onClick={handleExportCSV}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3 text-xs">
          {(
            [
              { id: 'all', label: 'All Users', count: metrics.total },
              { id: 'active', label: 'Active', count: metrics.active },
              { id: 'subscribers', label: 'Subscribers', count: metrics.subscribers },
              { id: 'free', label: 'Free Candidates', count: metrics.free },
              { id: 'suspended', label: 'Suspended', count: metrics.suspended }
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setFilterTab(tab.id);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                filterTab === tab.id
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/40 text-slate-300">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Dropdown Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search Name, Email, Phone, UID..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:ring-1 focus:ring-rose-500"
            >
              <option value="all">All Roles</option>
              <option value="candidate">Candidate</option>
              <option value="editor">Content Editor</option>
              <option value="admin">Administrator</option>
              <option value="super_admin">Super Administrator</option>
            </select>
          </div>

          {/* Province Filter */}
          <div>
            <select
              value={provinceFilter}
              onChange={(e) => {
                setProvinceFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:ring-1 focus:ring-rose-500"
            >
              <option value="all">All Provinces</option>
              {NEPAL_PROVINCES.filter((p) => p.id !== 'All Nepal').map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:ring-1 focus:ring-rose-500"
            >
              <option value="newest">Registered: Newest First</option>
              <option value="oldest">Registered: Oldest First</option>
              <option value="name_asc">Name: A to Z</option>
              <option value="name_desc">Name: Z to A</option>
              <option value="last_active">Last Active Date</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. USERS TABLE */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden text-white">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
            <Loader2 className="w-7 h-7 animate-spin text-rose-500" />
            <span>Loading user profiles from Firestore...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs space-y-2">
            <Users className="w-8 h-8 text-slate-600 mx-auto" />
            <div className="font-bold text-slate-300">No users found matching current filters</div>
            <p className="text-[11px] text-slate-500">
              Try adjusting search terms or clear province/role filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Candidate / User</th>
                  <th className="p-3.5">Contact & Location</th>
                  <th className="p-3.5">Education & Prep</th>
                  <th className="p-3.5">Subscription</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-900">
                {paginatedUsers.map((u) => (
                  <tr key={u.uid} className="hover:bg-slate-900/50 transition">
                    {/* Candidate / User */}
                    <td className="p-3.5 font-medium text-white">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300 shrink-0 text-xs">
                          {u.photoUrl ? (
                            <img
                              src={u.photoUrl}
                              alt={u.displayName}
                              className="w-full h-full object-cover rounded-xl"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            u.displayName.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{u.displayName}</span>
                            {u.isSubscriber && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                                PRO
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                            <span>{u.email || 'No email provided'}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                            <span>UID: {u.uid.slice(0, 10)}...</span>
                            <button
                              onClick={() => handleCopyUid(u.uid)}
                              title="Copy Firebase UID"
                              className="text-slate-500 hover:text-slate-300"
                            >
                              {copiedUid === u.uid ? (
                                <Check className="w-2.5 h-2.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-2.5 h-2.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact & Location */}
                    <td className="p-3.5 text-slate-300">
                      <div className="font-mono text-[11px]">{u.phone || 'N/A'}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>
                          {u.district ? `${u.district}, ` : ''}
                          {u.province || 'Bagmati'}
                        </span>
                      </div>
                    </td>

                    {/* Education & Prep */}
                    <td className="p-3.5 text-slate-300">
                      <div className="font-medium text-slate-200">{u.qualificationLevel || 'N/A'}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[160px]">
                        {u.fieldOfStudy || u.preferredExam || 'General Prep'}
                      </div>
                    </td>

                    {/* Subscription */}
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.isSubscriber
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                            : 'bg-slate-900 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {u.subscriptionPlan || 'Free Plan'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.status === 'suspended'
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                            : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {u.status === 'suspended' ? 'SUSPENDED' : 'ACTIVE'}
                      </span>
                    </td>

                    {/* Role */}
                    <td className="p-3.5">
                      {isSuperAdmin ? (
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleElevation(u.uid, e.target.value as AdminRole)}
                          className="bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-rose-500"
                        >
                          <option value="candidate">Candidate</option>
                          <option value="editor">Editor</option>
                          <option value="admin">Admin</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                      ) : (
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            u.role === 'super_admin'
                              ? 'bg-purple-950 text-purple-300 border border-purple-800'
                              : u.role === 'admin'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : u.role === 'editor'
                              ? 'bg-blue-950 text-blue-300 border border-blue-800'
                              : 'bg-slate-900 text-slate-400 border border-slate-800'
                          }`}
                        >
                          {u.role}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenUserProfile(u.uid)}
                          className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white rounded-lg text-xs font-bold border border-slate-800 flex items-center gap-1 transition"
                          title="View Complete User Profile"
                        >
                          <Eye className="w-3.5 h-3.5 text-rose-400" />
                          <span>View Profile</span>
                        </button>

                        {isSuperAdmin && (
                          <>
                            {u.status === 'suspended' ? (
                              <button
                                onClick={() => handleConfirmReactivate(u)}
                                className="p-1.5 bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 rounded-lg border border-emerald-800 transition"
                                title="Reactivate Account"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => setSuspendModalUser(u)}
                                className="p-1.5 bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded-lg border border-slate-800 hover:border-rose-800 transition"
                                title="Suspend Account"
                              >
                                <UserX className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-2 py-1 text-xs focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-slate-500 font-mono">
              Showing {(currentPage - 1) * pageSize + 1} -{' '}
              {Math.min(currentPage * pageSize, filteredUsers.length)} of {filteredUsers.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 text-slate-300 border border-slate-800 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono text-slate-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 text-slate-300 border border-slate-800 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. COMPLETE USER PROFILE MODAL */}
      {selectedUserUid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl text-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/70">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-rose-950 border border-rose-800 text-rose-400 flex items-center justify-center font-bold text-base">
                  {selectedUserDetails?.user.photoUrl ? (
                    <img
                      src={selectedUserDetails.user.photoUrl}
                      alt={selectedUserDetails.user.displayName}
                      className="w-full h-full object-cover rounded-2xl"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    selectedUserDetails?.user.displayName.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white font-sans">
                      {selectedUserDetails?.user.displayName || 'Candidate Profile'}
                    </h3>
                    {selectedUserDetails?.user.status === 'suspended' ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                        SUSPENDED
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                        ACTIVE CANDIDATE
                      </span>
                    )}
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 uppercase font-bold">
                      {selectedUserDetails?.user.role || 'candidate'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                    <span>{selectedUserDetails?.user.email}</span>
                    <span>•</span>
                    <span>UID: {selectedUserDetails?.user.uid}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedUserUid(null);
                  setSelectedUserDetails(null);
                }}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Tab Navigation */}
            <div className="px-5 pt-2.5 bg-slate-900 border-b border-slate-800 flex gap-1 overflow-x-auto text-xs font-semibold text-slate-400">
              {[
                { id: 'overview', label: 'Overview', icon: Eye },
                { id: 'personal', label: 'Personal Info', icon: User },
                { id: 'location', label: 'Location', icon: MapPin },
                { id: 'education', label: 'Education', icon: Award },
                { id: 'career', label: 'Exam & Career', icon: Briefcase },
                { id: 'saved_vacancies', label: 'Saved Vacancies', icon: BookmarkCheckIcon },
                { id: 'quizzes', label: 'Quiz Scores', icon: BookOpen },
                { id: 'subscription', label: 'Subscription', icon: CreditCard },
                { id: 'feedback', label: 'Feedback', icon: MessageSquare },
                { id: 'timeline', label: 'Timeline', icon: Activity },
                { id: 'audit', label: 'Audit Trail', icon: History }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setProfileModalTab(tab.id as any)}
                    className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
                      profileModalTab === tab.id
                        ? 'border-rose-500 text-rose-400 font-bold'
                        : 'border-transparent hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs text-slate-300">
              {loadingDetails ? (
                <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-2">
                  <Loader2 className="w-7 h-7 animate-spin text-rose-500" />
                  <span>Loading full candidate profile records...</span>
                </div>
              ) : !selectedUserDetails ? (
                <div className="py-12 text-center text-slate-400">Profile record could not be loaded.</div>
              ) : (
                <>
                  {/* OVERVIEW TAB */}
                  {profileModalTab === 'overview' && (
                    <div className="space-y-5">
                      {/* Super Admin Action Bar */}
                      {isSuperAdmin && (
                        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-purple-400" />
                            <span className="font-bold text-white text-xs">Super Admin Operations:</span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => {
                                setEditModalUser(selectedUserDetails.user);
                                setEditForm({
                                  name: selectedUserDetails.user.displayName,
                                  phone: selectedUserDetails.user.phone,
                                  province: (selectedUserDetails.user.province as Province) || 'Bagmati',
                                  district: selectedUserDetails.user.district,
                                  municipality: selectedUserDetails.user.municipality,
                                  qualificationLevel: (selectedUserDetails.user.qualificationLevel as QualificationLevel) || 'Bachelor Degree',
                                  fieldOfStudy: selectedUserDetails.user.fieldOfStudy
                                });
                              }}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition text-xs"
                            >
                              <Edit className="w-3.5 h-3.5 text-blue-400" />
                              <span>Edit Profile</span>
                            </button>

                            <button
                              onClick={() => setNotifyModalUser(selectedUserDetails.user)}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition text-xs"
                            >
                              <Bell className="w-3.5 h-3.5 text-amber-400" />
                              <span>Send Notice</span>
                            </button>

                            {selectedUserDetails.user.status === 'suspended' ? (
                              <button
                                onClick={() => handleConfirmReactivate(selectedUserDetails.user)}
                                className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 rounded-xl font-bold border border-emerald-800 flex items-center gap-1.5 transition text-xs"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Reactivate</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => setSuspendModalUser(selectedUserDetails.user)}
                                className="px-3 py-1.5 bg-rose-950 hover:bg-rose-900 text-rose-300 rounded-xl font-bold border border-rose-800 flex items-center gap-1.5 transition text-xs"
                              >
                                <UserX className="w-3.5 h-3.5" />
                                <span>Suspend Account</span>
                              </button>
                            )}

                            <button
                              onClick={() => setDeleteModalUser(selectedUserDetails.user)}
                              className="px-3 py-1.5 bg-red-950 hover:bg-red-900 text-red-300 rounded-xl font-bold border border-red-800 flex items-center gap-1.5 transition text-xs"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Anonymize</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Quick Stat Highlights */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
                          <div className="text-slate-400 text-[11px]">Saved Vacancies</div>
                          <div className="text-xl font-bold font-mono text-white mt-1">
                            {selectedUserDetails.savedVacancies.length}
                          </div>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
                          <div className="text-slate-400 text-[11px]">Applications Tracked</div>
                          <div className="text-xl font-bold font-mono text-white mt-1">
                            {selectedUserDetails.applications.length}
                          </div>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
                          <div className="text-slate-400 text-[11px]">Quizzes Attempted</div>
                          <div className="text-xl font-bold font-mono text-white mt-1">
                            {selectedUserDetails.quizAttempts.length}
                          </div>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
                          <div className="text-slate-400 text-[11px]">Subscription Standing</div>
                          <div className="text-sm font-bold font-mono text-amber-400 mt-1">
                            {selectedUserDetails.user.subscriptionPlan || 'Free Plan'}
                          </div>
                        </div>
                      </div>

                      {/* Summary Information Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                          <h4 className="text-xs font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                            <User className="w-3.5 h-3.5 text-rose-400" />
                            <span>Identity & Residence</span>
                          </h4>
                          <div className="space-y-1.5 text-[11px]">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Full Name:</span>
                              <span className="font-semibold text-white">{selectedUserDetails.user.displayName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Phone:</span>
                              <span className="font-mono text-slate-200">{selectedUserDetails.user.phone || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Province:</span>
                              <span className="text-slate-200">{selectedUserDetails.user.province || 'Bagmati'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">District:</span>
                              <span className="text-slate-200">{selectedUserDetails.user.district || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Date of Birth:</span>
                              <span className="text-slate-200">{selectedUserDetails.user.dateOfBirth || 'N/A'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                          <h4 className="text-xs font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                            <Award className="w-3.5 h-3.5 text-amber-400" />
                            <span>Academic & Exam Focus</span>
                          </h4>
                          <div className="space-y-1.5 text-[11px]">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Qualification:</span>
                              <span className="font-semibold text-white">{selectedUserDetails.user.qualificationLevel || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Field of Study:</span>
                              <span className="text-slate-200">{selectedUserDetails.user.fieldOfStudy || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Target Exam:</span>
                              <span className="text-slate-200">{selectedUserDetails.user.preferredExam || 'Lok Sewa (PSC)'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Target Org:</span>
                              <span className="text-slate-200">{selectedUserDetails.user.preferredOrganization || 'Public Service'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Registered:</span>
                              <span className="font-mono text-slate-200">{selectedUserDetails.user.createdAt || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PERSONAL INFORMATION TAB */}
                  {profileModalTab === 'personal' && (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                        <User className="w-4 h-4 text-rose-400" />
                        <span>Candidate Personal Identification Records</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-slate-500 block text-[10px] uppercase font-mono">Firebase Unique ID (UID)</label>
                          <div className="font-mono text-white bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs mt-1">
                            <span>{selectedUserDetails.user.uid}</span>
                            <button
                              onClick={() => handleCopyUid(selectedUserDetails.user.uid)}
                              className="text-slate-400 hover:text-white"
                            >
                              {copiedUid === selectedUserDetails.user.uid ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="text-slate-500 block text-[10px] uppercase font-mono">Registered Email Address</label>
                          <div className="font-mono text-white bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs mt-1">
                            {selectedUserDetails.user.email || 'N/A'}
                          </div>
                        </div>

                        <div>
                          <label className="text-slate-500 block text-[10px] uppercase font-mono">Full Name</label>
                          <div className="text-white bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs mt-1 font-semibold">
                            {selectedUserDetails.user.displayName}
                          </div>
                        </div>

                        <div>
                          <label className="text-slate-500 block text-[10px] uppercase font-mono">Contact Phone Number</label>
                          <div className="font-mono text-white bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs mt-1">
                            {selectedUserDetails.user.phone || 'N/A'}
                          </div>
                        </div>

                        <div>
                          <label className="text-slate-500 block text-[10px] uppercase font-mono">Date of Birth</label>
                          <div className="text-white bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs mt-1">
                            {selectedUserDetails.user.dateOfBirth || 'Not provided'}
                          </div>
                        </div>

                        <div>
                          <label className="text-slate-500 block text-[10px] uppercase font-mono">Age (Years)</label>
                          <div className="font-mono text-white bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs mt-1">
                            {selectedUserDetails.user.age ?? 'N/A'}
                          </div>
                        </div>

                        <div>
                          <label className="text-slate-500 block text-[10px] uppercase font-mono">Account Standing</label>
                          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs mt-1 flex items-center justify-between">
                            <span className={selectedUserDetails.user.status === 'suspended' ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                              {selectedUserDetails.user.status === 'suspended' ? 'SUSPENDED' : 'ACTIVE'}
                            </span>
                            {selectedUserDetails.user.suspensionReason && (
                              <span className="text-[10px] text-slate-400 italic truncate max-w-[200px]">
                                ({selectedUserDetails.user.suspensionReason})
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="text-slate-500 block text-[10px] uppercase font-mono">Registration Date</label>
                          <div className="font-mono text-white bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs mt-1">
                            {selectedUserDetails.user.createdAt || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* LOCATION TAB */}
                  {profileModalTab === 'location' && (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                        <MapPin className="w-4 h-4 text-emerald-400" />
                        <span>Geographic Residence & Electoral Location</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-slate-500 block text-[10px] uppercase font-mono">Province</label>
                          <div className="text-white bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs mt-1 font-semibold">
                            {selectedUserDetails.user.province || 'Bagmati'}
                          </div>
                        </div>

                        <div>
                          <label className="text-slate-500 block text-[10px] uppercase font-mono">District (77 Nepal Districts)</label>
                          <div className="text-white bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs mt-1 font-semibold">
                            {selectedUserDetails.user.district || 'Not specified'}
                          </div>
                        </div>

                        <div>
                          <label className="text-slate-500 block text-[10px] uppercase font-mono">Municipality / Rural Municipality</label>
                          <div className="text-white bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs mt-1">
                            {selectedUserDetails.user.municipality || 'Not specified'}
                          </div>
                        </div>

                        <div>
                          <label className="text-slate-500 block text-[10px] uppercase font-mono">Ward Number</label>
                          <div className="font-mono text-white bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs mt-1">
                            {selectedUserDetails.user.ward ? `Ward No. ${selectedUserDetails.user.ward}` : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* EDUCATION TAB */}
                  {profileModalTab === 'education' && (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                        <Award className="w-4 h-4 text-amber-400" />
                        <span>Academic Qualifications & Degrees</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-slate-500 block text-[10px] uppercase font-mono">Highest Qualification Level</label>
                          <div className="text-white bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs mt-1 font-bold">
                            {selectedUserDetails.user.qualificationLevel || 'N/A'}
                          </div>
                        </div>

                        <div>
                          <label className="text-slate-500 block text-[10px] uppercase font-mono">Field / Stream of Study</label>
                          <div className="text-white bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs mt-1 font-medium">
                            {selectedUserDetails.user.fieldOfStudy || 'N/A'}
                          </div>
                        </div>

                        <div>
                          <label className="text-slate-500 block text-[10px] uppercase font-mono">Institution / Board / University</label>
                          <div className="text-white bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs mt-1">
                            {selectedUserDetails.user.institution || 'Not specified'}
                          </div>
                        </div>

                        <div>
                          <label className="text-slate-500 block text-[10px] uppercase font-mono">Graduation Year</label>
                          <div className="font-mono text-white bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs mt-1">
                            {selectedUserDetails.user.graduationYear || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* EXAM & CAREER TAB */}
                  {profileModalTab === 'career' && (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                        <Briefcase className="w-4 h-4 text-blue-400" />
                        <span>Exam & Career Aspirations</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-slate-500 block text-[10px] uppercase font-mono">Target Exam Profile</label>
                          <div className="text-white bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs mt-1 font-semibold">
                            {selectedUserDetails.user.preferredExam || 'Lok Sewa (PSC)'}
                          </div>
                        </div>

                        <div>
                          <label className="text-slate-500 block text-[10px] uppercase font-mono">Target Organization</label>
                          <div className="text-white bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs mt-1">
                            {selectedUserDetails.user.preferredOrganization || 'Public Service'}
                          </div>
                        </div>
                      </div>

                      {selectedUserDetails.user.preferredCategories && selectedUserDetails.user.preferredCategories.length > 0 && (
                        <div>
                          <label className="text-slate-500 block text-[10px] uppercase font-mono mb-1.5">Preferred Government Sectors</label>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedUserDetails.user.preferredCategories.map((cat) => (
                              <span key={cat} className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-[11px] font-semibold">
                                {cat}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedUserDetails.user.resumeText && (
                        <div>
                          <label className="text-slate-500 block text-[10px] uppercase font-mono mb-1">Voluntary Bio / Resume Statement</label>
                          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-300 text-xs leading-relaxed">
                            {selectedUserDetails.user.resumeText}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* SAVED VACANCIES TAB */}
                  {profileModalTab === 'saved_vacancies' && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-white flex items-center justify-between border-b border-slate-800 pb-2">
                        <span>Bookmarked Vacancy Notices ({selectedUserDetails.savedVacancies.length})</span>
                      </h4>

                      {selectedUserDetails.savedVacancies.length === 0 ? (
                        <div className="py-8 text-center text-slate-500 text-xs bg-slate-900 rounded-xl border border-slate-800">
                          Candidate has not bookmarked any vacancy notices yet.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {selectedUserDetails.savedVacancies.map((sv) => (
                            <div key={sv.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                              <div>
                                <div className="font-bold text-white">{sv.title}</div>
                                <div className="text-[11px] text-slate-400">{sv.organization}</div>
                              </div>
                              <div className="text-right text-[11px] text-slate-500 font-mono">
                                <div>Saved: {sv.savedAt ? sv.savedAt.slice(0, 10) : 'N/A'}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* QUIZ SCORES TAB */}
                  {profileModalTab === 'quizzes' && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-white flex items-center justify-between border-b border-slate-800 pb-2">
                        <span>Practice Set Attempts ({selectedUserDetails.quizAttempts.length})</span>
                      </h4>

                      {selectedUserDetails.quizAttempts.length === 0 ? (
                        <div className="py-8 text-center text-slate-500 text-xs bg-slate-900 rounded-xl border border-slate-800">
                          Candidate has not completed any timed quiz sets yet.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {selectedUserDetails.quizAttempts.map((qa) => (
                            <div key={qa.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                              <div>
                                <div className="font-bold text-white">{qa.setTitle}</div>
                                <div className="text-[11px] text-slate-400">{qa.category || 'General Practice'}</div>
                              </div>
                              <div className="text-right">
                                <div className="font-mono font-bold text-white">
                                  {qa.score} / {qa.total} ({qa.percentage}%)
                                </div>
                                <span className={`text-[10px] font-bold ${qa.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                                  {qa.passed ? 'PASSED' : 'FAILED'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* SUBSCRIPTION TAB */}
                  {profileModalTab === 'subscription' && (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-amber-400" />
                          <span>Subscription Plan & Billing Status</span>
                        </h4>
                        <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase ${
                          selectedUserDetails.user.isSubscriber
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}>
                          {selectedUserDetails.user.subscriptionPlan || 'Free Candidate'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-slate-500 block text-[10px] uppercase font-mono">Plan Tier</label>
                          <div className="text-white bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs mt-1 font-bold">
                            {selectedUserDetails.user.subscriptionPlan || 'Free Tier (Zero Cost)'}
                          </div>
                        </div>

                        <div>
                          <label className="text-slate-500 block text-[10px] uppercase font-mono">Subscription Standing</label>
                          <div className="text-white bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs mt-1">
                            {selectedUserDetails.user.isSubscriber ? 'Active Premium' : 'Free User'}
                          </div>
                        </div>

                        <div>
                          <label className="text-slate-500 block text-[10px] uppercase font-mono">Payment Reference ID</label>
                          <div className="font-mono text-white bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs mt-1">
                            {selectedUserDetails.user.paymentRef || 'N/A (Free tier)'}
                          </div>
                        </div>

                        <div>
                          <label className="text-slate-500 block text-[10px] uppercase font-mono">Status</label>
                          <div className="text-white bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs mt-1">
                            {selectedUserDetails.user.paymentStatus || 'Completed'}
                          </div>
                        </div>
                      </div>

                      {/* Security Policy Notice */}
                      <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl flex items-start gap-2.5 text-emerald-300">
                        <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div className="text-[11px] leading-relaxed">
                          <span className="font-bold">Privacy & Payment Security Guarantee:</span> SarkariSajha strictly
                          never stores or exposes credit card numbers, CVVs, PINs, or bank passwords. All payments are
                          processed through authorized external gateways (eSewa / Khalti / Fonepay).
                        </div>
                      </div>
                    </div>
                  )}

                  {/* FEEDBACK TAB */}
                  {profileModalTab === 'feedback' && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
                        <span>Submitted Feedback & Reports ({selectedUserDetails.feedbacks.length})</span>
                      </h4>

                      {selectedUserDetails.feedbacks.length === 0 ? (
                        <div className="py-8 text-center text-slate-500 text-xs bg-slate-900 rounded-xl border border-slate-800">
                          No feedback submissions or error reports logged from this candidate.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {selectedUserDetails.feedbacks.map((fb) => (
                            <div key={fb.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-rose-400 text-xs uppercase font-mono">{fb.category}</span>
                                <span className="text-[10px] text-slate-500 font-mono">{fb.createdAt?.slice(0, 10)}</span>
                              </div>
                              <p className="text-slate-300 text-xs">{fb.comment}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TIMELINE TAB */}
                  {profileModalTab === 'timeline' && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
                        <span>Candidate Activity Timeline</span>
                      </h4>

                      {selectedUserDetails.activityTimeline.length === 0 ? (
                        <div className="py-8 text-center text-slate-500 text-xs bg-slate-900 rounded-xl border border-slate-800">
                          No activity events recorded yet.
                        </div>
                      ) : (
                        <div className="relative pl-6 border-l-2 border-slate-800 space-y-6">
                          {selectedUserDetails.activityTimeline.map((ev) => (
                            <div key={ev.id} className="relative">
                              <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-slate-950 border-2 border-rose-500" />
                              <div>
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-white text-xs">{ev.title}</span>
                                  <span className="text-[10px] text-slate-500 font-mono">{ev.timestamp?.slice(0, 16).replace('T', ' ')}</span>
                                </div>
                                <p className="text-slate-400 text-xs mt-0.5">{ev.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* AUDIT TRAIL TAB */}
                  {profileModalTab === 'audit' && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
                        <span>Administrator Audit History on this Account</span>
                      </h4>

                      {selectedUserDetails.auditHistory.length === 0 ? (
                        <div className="py-8 text-center text-slate-500 text-xs bg-slate-900 rounded-xl border border-slate-800">
                          No administrative actions recorded targeting this user account.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {selectedUserDetails.auditHistory.map((ah) => (
                            <div key={ah.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-mono font-bold text-purple-400">{ah.action}</span>
                                <span className="text-[10px] text-slate-500 font-mono">{ah.timestamp?.slice(0, 16).replace('T', ' ')}</span>
                              </div>
                              <div className="text-slate-300">{ah.details}</div>
                              <div className="text-[10px] text-slate-500 font-mono">By: {ah.adminName}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">
                Production Firebase Backend • Single Source of Truth
              </span>
              <button
                onClick={() => {
                  setSelectedUserUid(null);
                  setSelectedUserDetails(null);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUSPEND USER MODAL */}
      {suspendModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-md p-6 text-white space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-base">Suspend Candidate Account</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              You are placing account <span className="text-white font-bold">{suspendModalUser.displayName}</span> (
              {suspendModalUser.email}) under administrative suspension. The candidate will be prevented from accessing
              candidate services.
            </p>

            <div>
              <label className="block text-slate-300 text-xs mb-1 font-semibold">Reason for Suspension *</label>
              <textarea
                rows={3}
                required
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="e.g. Terms violation, multiple duplicate accounts, investigation..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2 text-xs font-bold">
              <button
                onClick={() => {
                  setSuspendModalUser(null);
                  setSuspendReason('');
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                disabled={submittingAction || !suspendReason.trim()}
                onClick={handleConfirmSuspend}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {submittingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4" />}
                <span>Confirm Suspension</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ANONYMIZE / DELETE MODAL */}
      {deleteModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-950 border border-red-900/80 rounded-2xl w-full max-w-md p-6 text-white space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="font-bold text-base">Super Admin: Anonymize Account</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              This will strip all personally identifiable data (name, email, phone, location, resume) from Firebase and
              permanently deactivate the profile for <span className="text-white font-bold">{deleteModalUser.displayName}</span>.
            </p>

            <div className="p-3 bg-red-950/40 border border-red-900 rounded-xl text-red-300 text-xs font-mono">
              Type to confirm:{' '}
              <span className="font-bold select-all">CONFIRM_DELETE_{deleteModalUser.uid.slice(-6).toUpperCase()}</span>
            </div>

            <input
              type="text"
              value={deleteConfirmationCode}
              onChange={(e) => setDeleteConfirmationCode(e.target.value)}
              placeholder={`CONFIRM_DELETE_${deleteModalUser.uid.slice(-6).toUpperCase()}`}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-red-500"
            />

            <div className="pt-2 flex justify-end gap-2 text-xs font-bold">
              <button
                onClick={() => {
                  setDeleteModalUser(null);
                  setDeleteConfirmationCode('');
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                disabled={
                  submittingAction ||
                  deleteConfirmationCode.trim() !== `CONFIRM_DELETE_${deleteModalUser.uid.slice(-6).toUpperCase()}`
                }
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {submittingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>Execute Deletion</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEND NOTIFICATION MODAL */}
      {notifyModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-md p-6 text-white space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <Bell className="w-5 h-5" />
              <h3 className="font-bold text-base">Direct In-App Notification</h3>
            </div>
            <p className="text-xs text-slate-400">
              Dispatches an official notice to candidate <span className="text-white font-bold">{notifyModalUser.displayName}</span>.
            </p>

            <div>
              <label className="block text-slate-300 text-xs mb-1 font-semibold">Notification Title</label>
              <input
                type="text"
                required
                value={notifyTitle}
                onChange={(e) => setNotifyTitle(e.target.value)}
                placeholder="e.g. Document Verification Required / Important Notice"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 text-xs mb-1 font-semibold">Message Content</label>
              <textarea
                rows={4}
                required
                value={notifyMessage}
                onChange={(e) => setNotifyMessage(e.target.value)}
                placeholder="Details of the announcement or query..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2 text-xs font-bold">
              <button
                onClick={() => {
                  setNotifyModalUser(null);
                  setNotifyTitle('');
                  setNotifyMessage('');
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                disabled={submittingAction || !notifyTitle.trim() || !notifyMessage.trim()}
                onClick={handleSendNotification}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {submittingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
                <span>Send Notification</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT USER PROFILE MODAL */}
      {editModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-lg p-6 text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold">
                <Edit className="w-4 h-4 text-blue-400" />
                <span>Edit User Profile ({editModalUser.displayName})</span>
              </div>
              <button onClick={() => setEditModalUser(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Phone</label>
                  <input
                    type="text"
                    value={editForm.phone || ''}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Province</label>
                  <select
                    value={editForm.province || 'Bagmati'}
                    onChange={(e) => setEditForm({ ...editForm, province: e.target.value as Province })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    {NEPAL_PROVINCES.filter((p) => p.id !== 'All Nepal').map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">District</label>
                  <input
                    type="text"
                    value={editForm.district || ''}
                    onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Municipality</label>
                  <input
                    type="text"
                    value={editForm.municipality || ''}
                    onChange={(e) => setEditForm({ ...editForm, municipality: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Qualification Level</label>
                  <select
                    value={editForm.qualificationLevel || 'Bachelor Degree'}
                    onChange={(e) => setEditForm({ ...editForm, qualificationLevel: e.target.value as QualificationLevel })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    <option value="SEE/SLC">SEE/SLC</option>
                    <option value="+2 High School">+2 High School</option>
                    <option value="Bachelor Degree">Bachelor Degree</option>
                    <option value="Master Degree">Master Degree</option>
                    <option value="MPhil/PhD">MPhil/PhD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Field of Study</label>
                  <input
                    type="text"
                    value={editForm.fieldOfStudy || ''}
                    onChange={(e) => setEditForm({ ...editForm, fieldOfStudy: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2 text-xs font-bold">
              <button
                onClick={() => setEditModalUser(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                disabled={submittingAction}
                onClick={handleSaveEditedProfile}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition flex items-center gap-1.5"
              >
                {submittingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>Save to Firestore</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Internal icon component for Bookmark
function BookmarkCheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z" />
      <path d="m9 10 2 2 4-4" />
    </svg>
  );
}
