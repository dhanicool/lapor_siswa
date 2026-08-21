/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { ReportList } from './components/ReportList';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { SchoolSettingsView } from './components/SchoolSettings';
import { StudentPortal } from './components/StudentPortal';
import { PrdViewer } from './components/PrdViewer';
import { ReportDetailModal } from './components/ReportDetailModal';
import { AdminLogin } from './components/AdminLogin';

import { ActiveTab, ReportItem, SchoolSettings } from './types';
import { 
  fetchSchoolSettings, 
  subscribeSchoolSettings, 
  DEFAULT_SCHOOL_SETTINGS, 
  getLocalSettings 
} from './services/schoolSettingsService';
import { 
  subscribeReports, 
  getLocalReports, 
  seedSampleReports, 
  SAMPLE_REPORTS 
} from './services/reportService';
import { exportToExcel, exportToPdf } from './services/exportService';

const AUTH_STORAGE_KEY = 'lapor_bullying_is_admin';

export default function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Authentication State
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
    } catch {
      return true; // Default admin mode for immediate interactive preview
    }
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Data States
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings>(() => getLocalSettings());
  const [reports, setReports] = useState<ReportItem[]>(() => {
    const cached = getLocalReports();
    return cached.length > 0 ? cached : SAMPLE_REPORTS;
  });

  // Active Report for Detail Modal
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);

  // Toast / Status
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Subscribe to School Settings (Firestore + LocalStorage)
  useEffect(() => {
    fetchSchoolSettings().then((data) => {
      setSchoolSettings(data);
    });

    const unsubscribeSettings = subscribeSchoolSettings((newSettings) => {
      setSchoolSettings(newSettings);
    });

    return () => unsubscribeSettings();
  }, []);

  // 2. Subscribe to Reports (Firestore + LocalStorage)
  useEffect(() => {
    const unsubscribeReports = subscribeReports((updatedReports) => {
      if (updatedReports && updatedReports.length > 0) {
        setReports(updatedReports);
      } else {
        // If empty on first boot, initialize sample reports
        seedSampleReports().then(() => {
          setReports(SAMPLE_REPORTS);
        });
      }
    });

    return () => unsubscribeReports();
  }, []);

  // Handle Authentication
  const handleLoginSuccess = () => {
    setIsAdmin(true);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
    } catch (e) {
      console.error(e);
    }
    showToast(`Selamat datang, ${schoolSettings.adminName || 'Admin Guru BK'}!`);
  };

  const handleLogout = () => {
    setIsAdmin(false);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, 'false');
    } catch (e) {
      console.error(e);
    }
    setActiveTab('student-portal');
    showToast('Anda telah keluar dari sesi Admin.');
  };

  // Handle Exports
  const handleExportExcel = (customList?: ReportItem[]) => {
    const dataToExport = customList || reports;
    exportToExcel(dataToExport, schoolSettings);
    showToast(`Export Excel berhasil dibuat (${dataToExport.length} data)!`);
  };

  const handleExportPdf = (customList?: ReportItem[]) => {
    const dataToExport = customList || reports;
    exportToPdf(dataToExport, schoolSettings);
    showToast(`Laporan PDF resmi berhasil diunduh (${dataToExport.length} data)!`);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex font-sans antialiased">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-800 text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        schoolSettings={schoolSettings}
        isAdmin={isAdmin}
        onLogout={handleLogout}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        reportCount={reports.length}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          schoolSettings={schoolSettings}
          isAdmin={isAdmin}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenNewReport={() => setActiveTab('student-portal')}
          onExportExcel={() => handleExportExcel()}
          onExportPdf={() => handleExportPdf()}
          reports={reports}
        />

        {/* Tab View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardOverview
              reports={reports}
              schoolSettings={schoolSettings}
              setActiveTab={setActiveTab}
              onSelectReport={(r) => setSelectedReport(r)}
              onExportExcel={() => handleExportExcel()}
              onExportPdf={() => handleExportPdf()}
            />
          )}

          {activeTab === 'reports' && (
            <ReportList
              reports={reports}
              schoolSettings={schoolSettings}
              onSelectReport={(r) => setSelectedReport(r)}
              onOpenNewReport={() => setActiveTab('student-portal')}
              onExportExcel={(list) => handleExportExcel(list)}
              onExportPdf={(list) => handleExportPdf(list)}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsCharts
              reports={reports}
              schoolSettings={schoolSettings}
              onExportExcel={() => handleExportExcel()}
              onExportPdf={() => handleExportPdf()}
            />
          )}

          {activeTab === 'settings' && (
            <SchoolSettingsView
              settings={schoolSettings}
              onSettingsUpdated={(newSettings) => {
                setSchoolSettings(newSettings);
                showToast('Pengaturan sekolah & password berhasil disimpan ke Firebase!');
              }}
              reportCount={reports.length}
            />
          )}

          {activeTab === 'student-portal' && (
            <StudentPortal
              schoolSettings={schoolSettings}
              onReportSubmitted={(newReport) => {
                setReports((prev) => [newReport, ...prev]);
                showToast(`Laporan ${newReport.reportId} berhasil dikirim ke Guru BK!`);
              }}
              onGoToDashboard={() => setActiveTab('dashboard')}
            />
          )}

          {activeTab === 'prd-docs' && (
            <PrdViewer schoolSettings={schoolSettings} />
          )}
        </main>
      </div>

      {/* Report Detail & Counseling Modal */}
      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          schoolSettings={schoolSettings}
          onReportUpdated={(updated) => {
            setReports((prev) => prev.map(r => r.reportId === updated.reportId ? updated : r));
            setSelectedReport(updated);
            showToast(`Laporan ${updated.reportId} berhasil diperbarui!`);
          }}
        />
      )}

      {/* Admin Login Modal */}
      <AdminLogin
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        schoolSettings={schoolSettings}
      />
    </div>
  );
}
