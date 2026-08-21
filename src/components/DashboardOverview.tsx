import React from 'react';
import { 
  FileText, 
  UserX, 
  Users, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight, 
  TrendingUp, 
  Clock, 
  ShieldAlert, 
  Sparkles,
  ChevronRight,
  PlusCircle,
  FileSpreadsheet,
  FileDown
} from 'lucide-react';
import { ReportItem, SchoolSettings, ActiveTab } from '../types';

interface DashboardOverviewProps {
  reports: ReportItem[];
  schoolSettings: SchoolSettings;
  setActiveTab: (tab: ActiveTab) => void;
  onSelectReport: (report: ReportItem) => void;
  onExportExcel: () => void;
  onExportPdf: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  reports,
  schoolSettings,
  setActiveTab,
  onSelectReport,
  onExportExcel,
  onExportPdf
}) => {
  // Compute Dynamic KPIs
  const totalReports = reports.length;
  const korbanReports = reports.filter(r => r.reporterStatus === 'Korban').length;
  const saksiReports = reports.filter(r => r.reporterStatus === 'Saksi').length;
  
  // This month calculation
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthReports = reports.filter(r => {
    const d = new Date(r.createdAt || r.incidentDate);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  const selesaiCount = reports.filter(r => r.status === 'selesai').length;
  const urgentCount = reports.filter(r => r.urgency === 'Darurat' || r.urgency === 'Tinggi').length;
  const baruCount = reports.filter(r => r.status === 'baru').length;
  const inProgressCount = reports.filter(r => r.status === 'ditinjau' || r.status === 'ditindaklanjuti').length;

  const recentReports = reports.slice(0, 5);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'baru':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 border border-rose-200">Baru</span>;
      case 'ditinjau':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">Ditinjau</span>;
      case 'ditindaklanjuti':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">Ditindaklanjuti</span>;
      case 'selesai':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">Selesai</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
              <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
              Sistem Pengawasan Bimbingan Konseling
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Dashboard Bimbingan & Konseling {schoolSettings.schoolName}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Pantau laporan masuk secara terpusat, lakukan mitigasi dini, serta kelola tindak lanjut kasus perundungan secara aman dan terstruktur.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('student-portal')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Input Pengaduan</span>
            </button>
            <button
              onClick={onExportExcel}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-700/50 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Export Excel</span>
            </button>
            <button
              onClick={onExportPdf}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-rose-300 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-700/50 transition-colors"
            >
              <FileDown className="w-4 h-4 text-rose-400" />
              <span>Cetak PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Laporan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Laporan</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalReports}</div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-semibold">{baruCount} kasus baru</span> menunggu tinjauan
            </div>
          </div>
        </div>

        {/* KPI 2: Korban */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Laporan Korban</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <UserX className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-600">{korbanReports}</div>
            <div className="text-xs text-slate-500 mt-1">
              {totalReports > 0 ? Math.round((korbanReports / totalReports) * 100) : 0}% dari seluruh pengaduan
            </div>
          </div>
        </div>

        {/* KPI 3: Saksi */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Laporan Saksi</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600">{saksiReports}</div>
            <div className="text-xs text-slate-500 mt-1">
              {totalReports > 0 ? Math.round((saksiReports / totalReports) * 100) : 0}% laporan dari rekan/saksi
            </div>
          </div>
        </div>

        {/* KPI 4: Bulan Ini */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Laporan Bulan Ini</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-600">{thisMonthReports}</div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
              Bulan berjalan ({new Date().toLocaleDateString('id-ID', { month: 'short' })})
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Row: Status Overview & Urgent Callout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Matrix */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Status Penanganan Kasus</h3>
              <p className="text-xs text-slate-500">Rekap alur kerja bimbingan konseling di {schoolSettings.schoolName}</p>
            </div>
            <button
              onClick={() => setActiveTab('reports')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Lihat Semua</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100">
              <span className="text-xs font-bold text-rose-700 block">1. Laporan Baru</span>
              <span className="text-2xl font-extrabold text-rose-900 mt-1 block">{baruCount}</span>
              <span className="text-[11px] text-rose-600 block">Belum dibuka</span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100">
              <span className="text-xs font-bold text-amber-700 block">2. Sedang Ditinjau</span>
              <span className="text-2xl font-extrabold text-amber-900 mt-1 block">
                {reports.filter(r => r.status === 'ditinjau').length}
              </span>
              <span className="text-[11px] text-amber-600 block">Verifikasi fakta</span>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100">
              <span className="text-xs font-bold text-blue-700 block">3. Ditindaklanjuti</span>
              <span className="text-2xl font-extrabold text-blue-900 mt-1 block">
                {reports.filter(r => r.status === 'ditindaklanjuti').length}
              </span>
              <span className="text-[11px] text-blue-600 block">Konseling & mediasi</span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
              <span className="text-xs font-bold text-emerald-700 block">4. Kasus Selesai</span>
              <span className="text-2xl font-extrabold text-emerald-900 mt-1 block">{selesaiCount}</span>
              <span className="text-[11px] text-emerald-600 block">Tuntas terdokumentasi</span>
            </div>
          </div>

          {/* Quick Analytics Teaser */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Analisis Visual Terpadu Tersedia</div>
                <div className="text-[11px] text-slate-500">Lihat grafik lokasi hotspot, pola jam rawan, dan perbandingan tren bulanan.</div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('analytics')}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors shrink-0"
            >
              Buka Halaman Statistik
            </button>
          </div>
        </div>

        {/* Urgent Attention / School Hotline Info */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                Kasus Prioritas ({urgentCount})
              </span>
            </div>

            <h3 className="text-sm font-bold text-slate-900">Perhatian Guru BK</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Terdapat <strong>{urgentCount} laporan</strong> dengan tingkat urgensi Tinggi/Darurat yang memerlukan pendampingan segera dari Guru BK.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="text-xs font-bold text-slate-700">Kontak Bimbingan Konseling:</div>
            <div className="text-xs text-slate-600">
              <span className="font-semibold text-slate-900 block">{schoolSettings.bkHeadTeacher}</span>
              <span className="text-[11px] text-slate-500 font-mono block">{schoolSettings.bkPhone}</span>
            </div>
            <div className="pt-1 text-[11px] text-slate-500 italic">
              "{schoolSettings.motto}"
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reports Stream Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Laporan Masuk Terbaru</h3>
            <p className="text-xs text-slate-500">5 pengaduan perundungan terakhir yang tercatat di sistem</p>
          </div>

          <button
            onClick={() => setActiveTab('reports')}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            <span>Buka Seluruh Laporan ({totalReports})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {recentReports.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <div className="text-sm font-semibold text-slate-700">Belum ada data laporan</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Laporan yang dikirimkan siswa akan otomatis muncul di sini secara realtime.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">ID Laporan</th>
                  <th className="py-3 px-4">Pelapor</th>
                  <th className="py-3 px-4">Waktu & Lokasi</th>
                  <th className="py-3 px-4">Status & Kategori</th>
                  <th className="py-3 px-4">Penanganan</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentReports.map((report) => (
                  <tr key={report.reportId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                      {report.reportId}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">
                        {report.isAnonymous ? `${report.studentName} (Anonim)` : report.studentName}
                      </div>
                      <div className="text-[11px] text-slate-400">Kelas: {report.classGrade || '-'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{report.location}</div>
                      <div className="text-[11px] text-slate-400">{report.incidentDate} • {report.incidentTime}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          report.reporterStatus === 'Korban' 
                            ? 'bg-rose-100 text-rose-700' 
                            : 'bg-indigo-100 text-indigo-700'
                        }`}>
                          {report.reporterStatus}
                        </span>
                        <span className="text-[11px] text-slate-600 truncate max-w-[150px]">
                          {report.category.split('(')[0].trim()}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(report.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onSelectReport(report)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
