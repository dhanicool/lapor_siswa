import React from 'react';
import { 
  Menu, 
  ShieldCheck, 
  FileSpreadsheet, 
  FileText, 
  GraduationCap, 
  PlusCircle,
  Calendar,
  School,
  Clock
} from 'lucide-react';
import { ActiveTab, SchoolSettings, ReportItem } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  schoolSettings: SchoolSettings;
  isAdmin: boolean;
  onOpenSidebar: () => void;
  onOpenNewReport: () => void;
  onExportExcel: () => void;
  onExportPdf: () => void;
  onOpenLogin?: () => void;
  reports: ReportItem[];
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  schoolSettings,
  isAdmin,
  onOpenSidebar,
  onOpenNewReport,
  onExportExcel,
  onExportPdf,
  onOpenLogin,
  reports
}) => {
  const isStudentPortal = activeTab === 'student-portal';

  const getTabTitle = (tab: ActiveTab) => {
    switch (tab) {
      case 'dashboard':
        return 'Dashboard Pengaduan Bullying';
      case 'reports':
        return 'Manajemen & Rekap Laporan';
      case 'analytics':
        return 'Analisis Data & Statistik';
      case 'settings':
        return 'Pengaturan Sekolah & Akun Admin';
      case 'student-portal':
        return 'Portal Pengaduan Siswa';
      case 'prd-docs':
        return 'Dokumen PRD & SOP Guru BK';
      default:
        return 'Sistem Bimbingan Konseling';
    }
  };

  const todayStr = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-xs">
      <div className="px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Left: Mobile Menu & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            id="btn-open-sidebar"
            onClick={onOpenSidebar}
            className="p-2 -ml-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
            aria-label="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1">
                <School className="w-3.5 h-3.5 text-blue-600" />
                {schoolSettings.schoolName}
              </span>
              <span>/</span>
              <span className="text-slate-700 capitalize font-semibold">
                {isStudentPortal ? 'Portal Siswa' : activeTab.replace('-', ' ')}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              {getTabTitle(activeTab)}
            </h2>
          </div>
        </div>

        {/* Right: Actions & Badges */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Date Display */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 font-medium">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>{todayStr}</span>
          </div>

          {/* JIKA DI DASHBOARD BK: Tampilkan Tombol Buka Form Pengaduan & Export */}
          {!isStudentPortal && (
            <>
              <button
                id="btn-header-new-report"
                onClick={() => {
                  setActiveTab('student-portal');
                  onOpenNewReport();
                }}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md transition-all shrink-0"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Buka Form Pengaduan</span>
                <span className="sm:hidden">Lapor</span>
              </button>

              {isAdmin && (
                <div className="hidden md:flex items-center gap-1.5">
                  <button
                    id="btn-header-export-excel"
                    onClick={onExportExcel}
                    title="Unduh Rekapitulasi Excel (.xlsx)"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 transition-colors"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Excel</span>
                  </button>
                  <button
                    id="btn-header-export-pdf"
                    onClick={onExportPdf}
                    title="Unduh Laporan Resmi PDF (.pdf)"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-rose-600" />
                    <span>PDF</span>
                  </button>
                </div>
              )}

              <button
                id="btn-header-switch-student"
                onClick={() => setActiveTab('student-portal')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span className="hidden lg:inline">Portal Siswa</span>
              </button>
            </>
          )}

          {/* JIKA DI PORTAL SISWA: Tampilkan Tombol Masuk/Login ke Dashboard BK */}
          {isStudentPortal && (
            isAdmin ? (
              <button
                id="btn-header-switch-admin"
                onClick={() => setActiveTab('dashboard')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Masuk Dashboard BK</span>
              </button>
            ) : (
              <button
                id="btn-header-login-admin"
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Login Guru BK</span>
              </button>
            )
          )}
        </div>
      </div>
    </header>
  );
};
