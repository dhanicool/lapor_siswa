import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  BarChart3, 
  Settings, 
  GraduationCap, 
  BookOpen, 
  LogOut, 
  ShieldAlert, 
  ChevronRight,
  School,
  Sparkles,
  PhoneCall,
  UserCheck
} from 'lucide-react';
import { ActiveTab, SchoolSettings } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  schoolSettings: SchoolSettings;
  isAdmin: boolean;
  onLogout: () => void;
  onOpenLogin: () => void;
  reportCount: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  schoolSettings,
  isAdmin,
  onLogout,
  onOpenLogin,
  reportCount,
  isOpen,
  setIsOpen
}) => {
  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard Utama',
      icon: LayoutDashboard,
      badge: null,
      adminOnly: true
    },
    {
      id: 'reports' as ActiveTab,
      label: 'Daftar Laporan',
      icon: FileText,
      badge: reportCount > 0 ? reportCount : null,
      adminOnly: true
    },
    {
      id: 'analytics' as ActiveTab,
      label: 'Statistik & Analisis',
      icon: BarChart3,
      badge: null,
      adminOnly: true
    },
    {
      id: 'settings' as ActiveTab,
      label: 'Pengaturan Sekolah & Akun',
      icon: Settings,
      badge: null,
      adminOnly: true,
      subLabel: 'Nama Sekolah & Password'
    },
    {
      id: 'student-portal' as ActiveTab,
      label: 'Form Pengaduan Siswa',
      icon: GraduationCap,
      badge: 'Portal Siswa',
      adminOnly: false
    },
    {
      id: 'prd-docs' as ActiveTab,
      label: 'Dokumentasi PRD & SOP',
      icon: BookOpen,
      badge: null,
      adminOnly: false
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:static top-0 bottom-0 left-0 z-50
        w-72 bg-slate-900 text-slate-100 flex flex-col
        transition-transform duration-300 ease-in-out border-r border-slate-800
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* School Branding Header */}
        <div className="p-5 border-b border-slate-800/80 bg-gradient-to-b from-slate-800/60 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="overflow-hidden">
              <h1 className="text-sm font-bold text-white tracking-wide truncate">
                {schoolSettings.schoolName}
              </h1>
              <p className="text-xs text-blue-400 font-medium flex items-center gap-1 truncate">
                <School className="w-3 h-3 shrink-0" />
                Layanan BK & Anti Bullying
              </p>
            </div>
          </div>

          <div className="mt-3.5 px-2.5 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700/60 flex items-center justify-between text-xs">
            <span className="text-slate-400">Database:</span>
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Firebase Firestore
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Menu Utama
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isRestricted = item.adminOnly && !isAdmin;

            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => {
                  if (isRestricted) {
                    onOpenLogin();
                  } else {
                    setActiveTab(item.id);
                    setIsOpen(false);
                  }
                }}
                className={`
                  w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left group
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold' 
                    : isRestricted
                      ? 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }
                `}
              >
                <Icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-105 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`} />
                <div className="flex-1 truncate">
                  <div className="flex items-center justify-between">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ml-1.5 ${
                        isActive 
                          ? 'bg-white/20 text-white' 
                          : item.badge === 'Portal Siswa'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  {item.subLabel && (
                    <div className={`text-[11px] font-normal truncate ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>
                      {item.subLabel}
                    </div>
                  )}
                </div>

                {isRestricted && (
                  <span className="text-[10px] text-amber-400/80 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20 shrink-0">
                    Kunci
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-4 px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Hotline Bimbingan Konseling
          </div>

          <div className="p-3 mx-1 rounded-xl bg-slate-800/70 border border-slate-700/60 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <PhoneCall className="w-3.5 h-3.5 text-blue-400" />
              Kontak Darurat BK
            </div>
            <div className="text-xs text-blue-300 font-mono font-medium">
              {schoolSettings.emergencyHotline}
            </div>
            <div className="text-[11px] text-slate-400 line-clamp-1">
              Koord: {schoolSettings.bkHeadTeacher}
            </div>
          </div>
        </div>

        {/* User / Authentication Status Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          {isAdmin ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold text-slate-200 truncate">{schoolSettings.adminName}</div>
                    <div className="text-[11px] text-emerald-400 font-medium truncate">Admin BK Terautentikasi</div>
                  </div>
                </div>
              </div>

              <button
                id="btn-logout"
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium text-rose-300 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Keluar (Logout)
              </button>
            </div>
          ) : (
            <button
              id="btn-login-trigger"
              onClick={onOpenLogin}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/20 transition-all"
            >
              <UserCheck className="w-4 h-4" />
              Login Admin / Guru BK
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
