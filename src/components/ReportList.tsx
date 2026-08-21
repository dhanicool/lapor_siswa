import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  FileSpreadsheet, 
  FileDown, 
  Eye, 
  Trash2, 
  Sparkles, 
  RotateCcw, 
  PlusCircle, 
  AlertCircle,
  Calendar,
  MapPin,
  Clock,
  Tag,
  CheckCircle2,
  ChevronDown,
  Database
} from 'lucide-react';
import { ReportItem, SchoolSettings, FilterState, ReportStatus, ReporterStatus } from '../types';
import { updateReportStatus, deleteReport, seedSampleReports } from '../services/reportService';

interface ReportListProps {
  reports: ReportItem[];
  schoolSettings: SchoolSettings;
  onSelectReport: (report: ReportItem) => void;
  onOpenNewReport: () => void;
  onExportExcel: (filteredReports: ReportItem[]) => void;
  onExportPdf: (filteredReports: ReportItem[]) => void;
}

export const ReportList: React.FC<ReportListProps> = ({
  reports,
  schoolSettings,
  onSelectReport,
  onOpenNewReport,
  onExportExcel,
  onExportPdf
}) => {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reporterFilter, setReporterFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState<'all' | 'today' | 'this_week' | 'this_month' | 'this_year'>('all');
  
  // Quick status update loading
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showSeedSuccess, setShowSeedSuccess] = useState(false);

  // Extract unique locations and categories for filters
  const uniqueLocations = useMemo(() => {
    const set = new Set(reports.map(r => r.location));
    return Array.from(set);
  }, [reports]);

  // Filter logic
  const filteredReports = useMemo(() => {
    return reports.filter((item) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = item.reportId.toLowerCase().includes(q);
        const matchName = item.studentName.toLowerCase().includes(q);
        const matchLocation = item.location.toLowerCase().includes(q);
        const matchChronology = item.chronology.toLowerCase().includes(q);
        const matchCategory = item.category.toLowerCase().includes(q);
        if (!matchId && !matchName && !matchLocation && !matchChronology && !matchCategory) {
          return false;
        }
      }

      // 2. Status Penanganan
      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }

      // 3. Status Pelapor (Korban/Saksi)
      if (reporterFilter !== 'all' && item.reporterStatus !== reporterFilter) {
        return false;
      }

      // 4. Kategori
      if (categoryFilter !== 'all' && !item.category.includes(categoryFilter)) {
        return false;
      }

      // 5. Lokasi
      if (locationFilter !== 'all' && item.location !== locationFilter) {
        return false;
      }

      // 6. Periode
      if (periodFilter !== 'all') {
        const itemDate = new Date(item.incidentDate || item.createdAt);
        const now = new Date();

        if (periodFilter === 'today') {
          if (itemDate.toDateString() !== now.toDateString()) return false;
        } else if (periodFilter === 'this_week') {
          const weekAgo = new Date();
          weekAgo.setDate(now.getDate() - 7);
          if (itemDate < weekAgo) return false;
        } else if (periodFilter === 'this_month') {
          if (itemDate.getMonth() !== now.getMonth() || itemDate.getFullYear() !== now.getFullYear()) return false;
        } else if (periodFilter === 'this_year') {
          if (itemDate.getFullYear() !== now.getFullYear()) return false;
        }
      }

      return true;
    });
  }, [reports, searchQuery, statusFilter, reporterFilter, categoryFilter, locationFilter, periodFilter]);

  const handleQuickStatusChange = async (reportId: string, newStatus: ReportStatus) => {
    setUpdatingId(reportId);
    try {
      await updateReportStatus(reportId, newStatus);
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (reportId: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus laporan dengan ID ${reportId}? Tindakan ini tidak dapat dibatalkan.`)) {
      setDeletingId(reportId);
      try {
        await deleteReport(reportId);
      } catch (e) {
        console.error(e);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleSeedData = async () => {
    if (window.confirm('Muat data sampel simulasi (10 kasus perundungan realistis) ke database?')) {
      await seedSampleReports();
      setShowSeedSuccess(true);
      setTimeout(() => setShowSeedSuccess(false), 3000);
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setReporterFilter('all');
    setCategoryFilter('all');
    setLocationFilter('all');
    setPeriodFilter('all');
  };

  return (
    <div className="space-y-6">
      {/* Header with Title & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Daftar & Rekapitulasi Laporan Bullying
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Menampilkan <strong className="text-slate-900">{filteredReports.length}</strong> dari total {reports.length} laporan di database {schoolSettings.schoolName}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onExportExcel(filteredReports)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Excel ({filteredReports.length})</span>
          </button>
          
          <button
            onClick={() => onExportPdf(filteredReports)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
          >
            <FileDown className="w-4 h-4 text-rose-600" />
            <span>Cetak PDF</span>
          </button>

          <button
            onClick={onOpenNewReport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Buat Laporan</span>
          </button>
        </div>
      </div>

      {showSeedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Data sampel berhasil dimuat ke database!</span>
        </div>
      )}

      {/* Filter & Search Toolbar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="input-search-reports"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan ID Laporan, nama siswa, lokasi, atau kata kunci kronologi..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-xs sm:text-sm bg-slate-50/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
          {/* Status Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-500">Status Penanganan</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 rounded-lg border border-slate-300 text-xs bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="baru">1. Baru</option>
              <option value="ditinjau">2. Ditinjau</option>
              <option value="ditindaklanjuti">3. Ditindaklanjuti</option>
              <option value="selesai">4. Selesai</option>
            </select>
          </div>

          {/* Reporter Status Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-500">Status Pelapor</label>
            <select
              value={reporterFilter}
              onChange={(e) => setReporterFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 rounded-lg border border-slate-300 text-xs bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">Semua (Korban & Saksi)</option>
              <option value="Korban">Hanya Korban</option>
              <option value="Saksi">Hanya Saksi</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-500">Kategori Bullying</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 rounded-lg border border-slate-300 text-xs bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">Semua Kategori</option>
              <option value="Verbal">Bullying Verbal</option>
              <option value="Fisik">Bullying Fisik</option>
              <option value="Sosial">Bullying Sosial</option>
              <option value="Cyber">Cyberbullying</option>
              <option value="Pemalakan">Pemalakan</option>
            </select>
          </div>

          {/* Location Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-500">Lokasi Kejadian</label>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 rounded-lg border border-slate-300 text-xs bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">Semua Lokasi</option>
              {uniqueLocations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {/* Period Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-500">Periode Waktu</label>
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value as any)}
              className="w-full py-1.5 px-2.5 rounded-lg border border-slate-300 text-xs bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">Semua Waktu</option>
              <option value="today">Hari Ini</option>
              <option value="this_week">7 Hari Terakhir</option>
              <option value="this_month">Bulan Ini</option>
              <option value="this_year">Tahun Ini</option>
            </select>
          </div>
        </div>

        {/* Active filter reset */}
        {(searchQuery || statusFilter !== 'all' || reporterFilter !== 'all' || categoryFilter !== 'all' || locationFilter !== 'all' || periodFilter !== 'all') && (
          <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
            <span>Filter aktif diterapkan</span>
            <button
              onClick={resetFilters}
              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Semua Filter
            </button>
          </div>
        )}
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredReports.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Filter className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800">Tidak ada laporan yang sesuai</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Coba sesuaikan kata kunci pencarian atau ubah pengaturan filter di atas.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={resetFilters}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Reset Filter
              </button>
              {reports.length === 0 && (
                <button
                  onClick={handleSeedData}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Muat Data Sampel Simulasi</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">No</th>
                  <th className="py-3.5 px-4">ID & Tanggal</th>
                  <th className="py-3.5 px-4">Identitas Pelapor</th>
                  <th className="py-3.5 px-4">Lokasi & Jam</th>
                  <th className="py-3.5 px-4">Kategori & Urgensi</th>
                  <th className="py-3.5 px-4">Status Penanganan</th>
                  <th className="py-3.5 px-4">Kronologi Singkat</th>
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredReports.map((item, index) => (
                  <tr key={item.reportId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-slate-400 font-medium">
                      {index + 1}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-blue-700">
                        {item.reportId}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {item.incidentDate}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <span>{item.isAnonymous ? `${item.studentName} (Anonim)` : item.studentName}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2">
                        <span>Kelas: {item.classGrade || '-'}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          item.reporterStatus === 'Korban' 
                            ? 'bg-rose-100 text-rose-700' 
                            : 'bg-indigo-100 text-indigo-700'
                        }`}>
                          {item.reporterStatus}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {item.location}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {item.incidentTime} ({item.timeSlotGroup || 'Luar Jam'})
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 font-medium truncate max-w-[170px]" title={item.category}>
                        {item.category.split('(')[0].trim()}
                      </div>
                      <div className="mt-0.5">
                        <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                          item.urgency === 'Darurat'
                            ? 'bg-rose-600 text-white'
                            : item.urgency === 'Tinggi'
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-200 text-slate-700'
                        }`}>
                          Urgensi: {item.urgency}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={item.status}
                        disabled={updatingId === item.reportId}
                        onChange={(e) => handleQuickStatusChange(item.reportId, e.target.value as ReportStatus)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg border cursor-pointer transition-all ${
                          item.status === 'baru'
                            ? 'bg-rose-50 text-rose-700 border-rose-200 focus:ring-rose-400'
                            : item.status === 'ditinjau'
                              ? 'bg-amber-50 text-amber-700 border-amber-200 focus:ring-amber-400'
                              : item.status === 'ditindaklanjuti'
                                ? 'bg-blue-50 text-blue-700 border-blue-200 focus:ring-blue-400'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 focus:ring-emerald-400'
                        }`}
                      >
                        <option value="baru">1. Baru</option>
                        <option value="ditinjau">2. Ditinjau</option>
                        <option value="ditindaklanjuti">3. Ditindaklanjuti</option>
                        <option value="selesai">4. Selesai</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-slate-600 line-clamp-2 leading-relaxed" title={item.chronology}>
                        {item.chronology}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onSelectReport(item)}
                          title="Lihat Detail & Catatan Konseling"
                          className="p-1.5 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.reportId)}
                          disabled={deletingId === item.reportId}
                          title="Hapus Laporan"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
