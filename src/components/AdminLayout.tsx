import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Briefcase,
  Award,
  Users,
  Bell,
  Sparkles,
  History,
  Settings,
  LogOut,
  ArrowLeft,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Crown,
  Lock,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Activity,
  Megaphone,
  CreditCard,
  Tag,
  BookOpen,
  Database,
  FileCheck
} from 'lucide-react';
import { BrandMark } from './Header';
import { User as FirebaseUser } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Language, Vacancy, QuizSet, NotificationLog } from '../types';
import { AdminRole, ManagedUser, AdminActivityLog } from '../lib/firestoreService';

interface AdminLayoutProps {
  user: FirebaseUser | null;
  role: AdminRole;
  lang: Language;
  onExitAdmin: () => void;
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  metrics?: {
    totalUsers: number;
    totalVacancies: number;
    publishedVacancies: number;
    draftVacancies: number;
    expiredVacancies: number;
    quizAttemptsCount: number;
    recentActivityCount: number;
  } | null;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  user,
  role,
  lang,
  onExitAdmin,
  children,
  activeTab,
  setActiveTab,
  metrics
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const getRoleBadge = (r: AdminRole) => {
    switch (r) {
      case 'super_admin':
        return {
          label: 'Super Admin',
          color: 'bg-purple-100 text-purple-900 border-purple-300',
          icon: Crown
        };
      case 'admin':
        return {
          label: 'Administrator',
          color: 'bg-rose-100 text-rose-900 border-rose-300',
          icon: ShieldCheck
        };
      case 'editor':
        return {
          label: 'Content Editor',
          color: 'bg-blue-100 text-blue-900 border-blue-300',
          icon: Shield
        };
      default:
        return {
          label: 'User',
          color: 'bg-slate-100 text-slate-700 border-slate-300',
          icon: Lock
        };
    }
  };

  const badgeInfo = getRoleBadge(role);
  const BadgeIcon = badgeInfo.icon;

  // Sidebar navigation items with role gating
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, minRole: 'editor' },
    { id: 'vacancies', label: 'Vacancies CMS', icon: Briefcase, minRole: 'editor' },
    { id: 'announcements', label: 'Announcements', icon: Megaphone, minRole: 'editor', badge: 'CMS' },
    { id: 'quizzes', label: 'Quizzes & Questions', icon: Award, minRole: 'editor' },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard, minRole: 'admin', badge: 'Freemium' },
    { id: 'coupons', label: 'Coupons & Vouchers', icon: Tag, minRole: 'admin' },
    { id: 'ai_knowledge', label: 'AI Knowledge Layer', icon: BookOpen, minRole: 'editor', badge: 'Verified' },
    { id: 'notifications', label: 'Notifications CMS', icon: Bell, minRole: 'editor' },
    { id: 'users', label: 'Users & Candidates', icon: Users, minRole: 'admin', badge: role === 'editor' ? 'Restricted' : undefined },
    { id: 'team', label: 'Admin Team & Roles', icon: ShieldCheck, minRole: 'admin' },
    { id: 'audit_logs', label: 'Audit Trail', icon: History, minRole: 'admin' },
    { id: 'maintenance', label: 'Production Maintenance', icon: Database, minRole: 'super_admin', badge: 'Data Clean' },
    { id: 'beta_observability', label: 'Observability & Telemetry', icon: Activity, minRole: 'editor' },
    { id: 'settings', label: 'System Settings', icon: Settings, minRole: 'admin' }
  ];

  const handleNavClick = (itemId: string, itemMinRole: string) => {
    if (role === 'editor' && (itemMinRole === 'admin' || itemMinRole === 'super_admin')) {
      alert(`Access Restricted: The '${itemId}' section requires Administrator or Super Admin permissions.`);
      return;
    }
    setActiveTab(itemId);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex font-sans antialiased">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={onExitAdmin}>
              <div className="w-9 h-9 rounded-full bg-sky-100 dark:bg-white/10 flex items-center justify-center shrink-0"><BrandMark className="w-3/5 h-3/5" /></div>
              <div>
                <h1 className="text-sm font-black tracking-wider text-white">SarkariSajha</h1>
                <p className="text-[10px] text-rose-400 font-mono font-bold tracking-tight">ADMIN CONTROL PANEL</p>
              </div>
            </div>
          </div>

          {/* User Role Card */}
          <div className="p-4 mx-3 my-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-rose-400">
                {user?.email?.[0]?.toUpperCase() || user?.displayName?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-200 truncate">
                  {user?.displayName || user?.email?.split('@')[0] || 'Administrator'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>

            <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md border text-[10px] font-bold ${badgeInfo.color}`}>
              <BadgeIcon className="w-3 h-3" />
              <span>{badgeInfo.label}</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isRestricted = role === 'editor' && (item.minRole === 'admin' || item.minRole === 'super_admin');

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id, item.minRole)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-rose-600 text-white'
                      : isRestricted
                      ? 'text-slate-600 hover:text-slate-500 cursor-not-allowed opacity-60'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isRestricted && (
                    <Lock className="w-3.5 h-3.5 text-slate-600" />
                  )}
                  {item.badge && !isRestricted && (
                    <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Return to Public Site */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            onClick={onExitAdmin}
            className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs rounded-full border border-slate-800 transition flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4 text-rose-500" />
            <span>Public Directory</span>
          </button>

          <button
            onClick={() => auth.signOut()}
            className="w-full py-2 px-3 text-slate-500 hover:text-rose-400 text-xs font-semibold transition flex items-center justify-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xs text-slate-400 font-mono">
              SarkariSajha / <span className="text-rose-400 font-bold capitalize">{activeTab}</span>
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[11px] font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Firestore Sync: Active</span>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-300 font-bold">{user?.displayName || 'Admin'}</span>
              <button
                onClick={() => auth.signOut()}
                className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-full border border-rose-500/20 transition"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* BODY */}
        <main className="p-6 space-y-6 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};
