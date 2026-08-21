import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Send, 
  AlertCircle, 
  Clock, 
  Calendar, 
  MapPin, 
  User, 
  FileText, 
  HeartHandshake, 
  CheckCircle2, 
  Sparkles,
  PhoneCall,
  Lock,
  EyeOff,
  Info,
  ChevronRight,
  RefreshCw,
  Copy,
  Check,
  Search,
  MessageSquare,
  AlertTriangle,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ReportItem, SchoolSettings, ReporterStatus, ReportCategory, UrgencyLevel, ReportStatus } from '../types';
import { createReport, getReportById } from '../services/reportService';

interface StudentPortalProps {
  schoolSettings: SchoolSettings;
  onReportSubmitted?: (report: ReportItem) => void;
  onGoToDashboard?: () => void;
  isAdmin?: boolean;
}

const LOCATION_OPTIONS = [
  'Kelas',
  'Lapangan',
  'Kantin',
  'Toilet',
  'Koridor',
  'Perpustakaan',
  'Halaman sekolah',
  'Tempat parkir',
  'Dalam perjalanan sekolah',
  'Media sosial',
  'Grup chat',
  'Lainnya'
];

const CATEGORY_OPTIONS: ReportCategory[] = [
  'Bullying Verbal (Ejekan, Hinaan, Ancaman)',
  'Bullying Fisik (Pukulan, Dorongan, Kekerasan)',
  'Bullying Sosial / Relasional (Pengucilan, Fitnah, Gosip)',
  'Cyberbullying (Media Sosial, Grup Chat)',
  'Pemalakan / Pemerasan',
  'Lainnya'
];

const STATUS_STEPS: { key: ReportStatus; label: string; desc: string }[] = [
  { key: 'baru', label: '1. Laporan Diterima', desc: 'Tersimpan aman di database BK' },
  { key: 'ditinjau', label: '2. Ditinjau Guru BK', desc: 'Dianalisis & diverifikasi tim BK' },
  { key: 'ditindaklanjuti', label: '3. Ditindaklanjuti', desc: 'Mediasi & pendampingan aktif' },
  { key: 'selesai', label: '4. Kasus Selesai', desc: 'Tuntas & pemantauan berkala' }
];

export const StudentPortal: React.FC<StudentPortalProps> = ({
  schoolSettings,
  onReportSubmitted,
  onGoToDashboard,
  isAdmin
}) => {
  // Mode: Form Baru vs Cek Progres
  const [activePortalTab, setActivePortalTab] = useState<'create' | 'track'>('create');

  // Form States
  const [studentName, setStudentName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [classGrade, setClassGrade] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [incidentDate, setIncidentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [incidentTime, setIncidentTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });
  const [location, setLocation] = useState('Kantin');
  const [customLocation, setCustomLocation] = useState('');
  const [reporterStatus, setReporterStatus] = useState<ReporterStatus>('Korban');
  const [category, setCategory] = useState<ReportCategory>('Bullying Verbal (Ejekan, Hinaan, Ancaman)');
  const [chronology, setChronology] = useState('');
  const [urgency, setUrgency] = useState<UrgencyLevel>('Sedang');

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedReport, setSubmittedReport] = useState<ReportItem | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Tracking Ticket States
  const [searchTicketId, setSearchTicketId] = useState('');
  const [isSearchingTicket, setIsSearchingTicket] = useState(false);
  const [trackedReport, setTrackedReport] = useState<ReportItem | null>(null);
  const [ticketSearchError, setTicketSearchError] = useState<string | null>(null);
  const [copiedTrackedId, setCopiedTrackedId] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Form Validations
    if (!isAnonymous && !studentName.trim()) {
      setErrorMessage('Mohon isi nama siswa atau centang opsi "Laporkan Secara Anonim".');
      return;
    }
    if (!incidentDate) {
      setErrorMessage('Mohon tentukan tanggal kejadian.');
      return;
    }
    if (!incidentTime) {
      setErrorMessage('Mohon tentukan waktu kejadian.');
      return;
    }
    if (location === 'Lainnya' && !customLocation.trim()) {
      setErrorMessage('Mohon sebutkan lokasi kejadian spesifik.');
      return;
    }
    if (!chronology.trim() || chronology.trim().length < 20) {
      setErrorMessage('Mohon tulis kronologi kejadian minimal 20 karakter agar Guru BK memahami situasinya.');
      return;
    }

    setIsSubmitting(true);
    try {
      const finalLocation = location === 'Lainnya' ? `Lainnya: ${customLocation.trim()}` : location;
      const finalStudentName = isAnonymous ? 'Siswa (Anonim)' : studentName.trim();

      const newReport = await createReport({
        studentName: finalStudentName,
        isAnonymous,
        classGrade: classGrade.trim(),
        contactInfo: contactInfo.trim(),
        incidentDate,
        incidentTime,
        location: finalLocation,
        customLocation: location === 'Lainnya' ? customLocation.trim() : undefined,
        reporterStatus,
        category,
        chronology: chronology.trim(),
        urgency,
        status: 'baru'
      });

      setSubmittedReport(newReport);
      if (onReportSubmitted) onReportSubmitted(newReport);

      // Trigger Confetti Effect
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // Safe fallback
      }
    } catch (err: any) {
      setErrorMessage('Gagal mengirim laporan. Silakan coba kembali atau hubungi Guru BK langsung.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyId = (idToCopy: string, isTrackCard: boolean = false) => {
    if (idToCopy) {
      navigator.clipboard.writeText(idToCopy);
      if (isTrackCard) {
        setCopiedTrackedId(true);
        setTimeout(() => setCopiedTrackedId(false), 2000);
      } else {
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
      }
    }
  };

  const handleSearchTicket = async (e?: React.FormEvent, customId?: string) => {
    if (e) e.preventDefault();
    const queryId = (customId || searchTicketId).trim();

    if (!queryId) {
      setTicketSearchError('Silakan masukkan Nomor Registrasi Laporan (ID tiket).');
      return;
    }

    setTicketSearchError(null);
    setIsSearchingTicket(true);
    try {
      const result = await getReportById(queryId);
      if (result) {
        setTrackedReport(result);
        setSearchTicketId(result.reportId);
      } else {
        setTrackedReport(null);
        setTicketSearchError(`Laporan dengan ID "${queryId}" tidak ditemukan. Pastikan format ID sudah benar (contoh: BL-20260821-1288).`);
      }
    } catch (err) {
      console.error('Error tracking report:', err);
      setTicketSearchError('Gagal memuat status laporan dari Firestore. Silakan periksa koneksi internet Anda.');
    } finally {
      setIsSearchingTicket(false);
    }
  };

  const handleResetForm = () => {
    setSubmittedReport(null);
    setStudentName('');
    setIsAnonymous(false);
    setClassGrade('');
    setContactInfo('');
    setChronology('');
    setLocation('Kantin');
    setCustomLocation('');
    setReporterStatus('Korban');
    setCategory('Bullying Verbal (Ejekan, Hinaan, Ancaman)');
    setUrgency('Sedang');
    setErrorMessage(null);
  };

  const getStepProgressIndex = (status: ReportStatus): number => {
    switch (status) {
      case 'baru': return 0;
      case 'ditinjau': return 1;
      case 'ditindaklanjuti': return 2;
      case 'selesai': return 3;
      default: return 0;
    }
  };

  // SUCCESS SUBMISSION SCREEN
  if (submittedReport) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-lg shadow-blue-500/5 text-center space-y-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-emerald-100 border-4 border-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Laporan Berhasil Disimpan ke Database Firebase
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Terima Kasih Telah Berani Melapor!
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
              Laporanmu telah diterima secara rahasia oleh Tim Bimbingan dan Konseling (BK) {schoolSettings.schoolName}. Kamu tidak sendirian, kami siap mendampingi dan melindungimu.
            </p>
          </div>

          {/* Receipt ID Box - Exact design matching screenshot */}
          <div className="max-w-md mx-auto p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-3 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
              <span>Nomor Registrasi Laporan (ID):</span>
              <span className="text-emerald-600 font-semibold">Tersimpan Aman</span>
            </div>
            
            <div className="flex items-center justify-between gap-2 p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="font-mono text-base sm:text-lg font-bold text-blue-700">
                {submittedReport.reportId}
              </span>
              <button
                type="button"
                onClick={() => handleCopyId(submittedReport.reportId)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                {copiedId ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-600" />
                    <span>Salin ID</span>
                  </>
                )}
              </button>
            </div>

            <div className="text-[11px] text-slate-500 flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
              <span>Simpan nomor ID di atas jika ingin menanyakan perkembangan penanganan kepada Guru BK.</span>
            </div>
          </div>

          {/* Quick Check Progress Action */}
          <div className="max-w-md mx-auto">
            <button
              onClick={() => {
                setSearchTicketId(submittedReport.reportId);
                setTrackedReport(submittedReport);
                setActivePortalTab('track');
                setSubmittedReport(null);
              }}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs sm:text-sm font-bold border border-blue-200 transition-colors"
            >
              <Search className="w-4 h-4" />
              <span>Lacak Progres Tiket Ini Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Emergency Hotline Contact Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/70 border border-blue-100 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                <PhoneCall className="w-4 h-4 text-blue-600" />
                Butuh Bantuan Segera / Darurat?
              </div>
              <p className="text-xs text-blue-700 leading-normal">
                Jika kamu merasa dalam bahaya langsung, silakan hubungi kontak darurat BK sekarang:
              </p>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <div className="text-sm font-bold text-blue-900 font-mono">
                {schoolSettings.emergencyHotline}
              </div>
              <div className="text-[11px] text-blue-600">
                Guru BK: {schoolSettings.bkHeadTeacher}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleResetForm}
              className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Buat Laporan Lainnya
            </button>
            {isAdmin && onGoToDashboard && (
              <button
                onClick={onGoToDashboard}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all"
              >
                <span>Lihat di Dashboard BK</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      {/* Student Banner */}
      <div className="bg-gradient-to-br from-blue-700 via-indigo-700 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-900/10 relative overflow-hidden">
        {/* Subtle Decorative Circle */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-blue-100 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Layanan Bimbingan Konseling (BK) {schoolSettings.schoolName}
          </div>
          
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Berani Bicara, Sekolah Lebih Aman.
          </h1>
          
          <p className="text-sm sm:text-base text-blue-100 leading-relaxed">
            Apakah kamu mengalami atau melihat perlakuan tidak menyenangkan (bullying)? Ceritakan kepada Guru BK di sini atau lacak perkembangan laporan yang sudah pernah dikirim.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-blue-200">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              100% Rahasia & Aman
            </span>
            <span className="flex items-center gap-1.5">
              <EyeOff className="w-3.5 h-3.5 text-amber-300" />
              Bisa Laporkan Tanpa Nama
            </span>
            <span className="flex items-center gap-1.5">
              <HeartHandshake className="w-3.5 h-3.5 text-blue-300" />
              Didampingi Guru BK
            </span>
          </div>
        </div>
      </div>

      {/* Segmented Top Mode Switcher: Form vs Cek Progres */}
      <div className="bg-slate-200/80 p-1.5 rounded-2xl flex items-center gap-1 max-w-md mx-auto shadow-inner">
        <button
          type="button"
          id="tab-btn-create-report"
          onClick={() => setActivePortalTab('create')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activePortalTab === 'create'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Form Pengaduan Baru</span>
        </button>

        <button
          type="button"
          id="tab-btn-track-report"
          onClick={() => setActivePortalTab('track')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activePortalTab === 'track'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Cek Progres Laporan</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: CEK PROGRES LAPORAN DENGAN INPUT SESUAI GAMBAR TIKET */}
      {/* ========================================================================= */}
      {activePortalTab === 'track' && (
        <div className="space-y-6">
          {/* Ticket Input Card (matching the exact screenshot structure) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
            <div className="text-center sm:text-left space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Lacak Status & Progres Penanganan
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Masukkan nomor tiket registrasi yang kamu peroleh saat mengirim laporan untuk melihat perkembangan tindakan Guru BK.
              </p>
            </div>

            {/* The Ticket Card UI Component matching screenshot */}
            <form onSubmit={handleSearchTicket} className="max-w-2xl mx-auto">
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4 shadow-xs">
                {/* Header row */}
                <div className="flex items-center justify-between text-xs sm:text-sm font-medium text-slate-600">
                  <span className="font-semibold text-slate-700">Nomor Registrasi Laporan (ID):</span>
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Tersimpan Aman
                  </span>
                </div>

                {/* Input & Action Box matching the image */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 sm:p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex-1 relative flex items-center">
                    <input
                      type="text"
                      id="input-ticket-id"
                      value={searchTicketId}
                      onChange={(e) => setSearchTicketId(e.target.value.toUpperCase())}
                      placeholder="BL-20260821-1288"
                      className="w-full pl-3 pr-4 py-2 font-mono text-base sm:text-lg font-bold text-blue-700 tracking-wider bg-transparent border-0 focus:ring-0 focus:outline-hidden placeholder:text-slate-300 placeholder:font-normal"
                    />
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {searchTicketId && (
                      <button
                        type="button"
                        onClick={() => handleCopyId(searchTicketId, true)}
                        title="Salin ID"
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                      >
                        {copiedTrackedId ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-600" />
                            <span>Salin ID</span>
                          </>
                        )}
                      </button>
                    )}

                    <button
                      type="submit"
                      id="btn-search-ticket"
                      disabled={isSearchingTicket || !searchTicketId.trim()}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs"
                    >
                      {isSearchingTicket ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Mencari...</span>
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4" />
                          <span>Cek Status</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Footnote matching screenshot */}
                <div className="text-[11px] sm:text-xs text-slate-500 flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <span>
                    Simpan nomor ID di atas jika ingin menanyakan perkembangan penanganan kepada Guru BK.
                  </span>
                </div>
              </div>
            </form>

            {/* Quick Demo ID Suggestion Chips */}
            <div className="max-w-2xl mx-auto flex flex-wrap items-center gap-2 text-xs text-slate-500 pt-1">
              <span className="font-medium">💡 Contoh ID Simulasi:</span>
              {['BL-20260821-1288', 'BL-20260820-1011', 'BL-20260819-2042'].map((sampleId) => (
                <button
                  key={sampleId}
                  type="button"
                  onClick={() => {
                    setSearchTicketId(sampleId);
                    handleSearchTicket(undefined, sampleId);
                  }}
                  className="px-2.5 py-1 rounded-md font-mono text-[11px] bg-slate-100 hover:bg-blue-50 text-blue-700 border border-slate-200 transition-colors"
                >
                  {sampleId}
                </button>
              ))}
            </div>

            {/* Search Error Alert */}
            {ticketSearchError && (
              <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-bold">Laporan Tidak Ditemukan</div>
                  <div className="text-xs sm:text-sm mt-0.5">{ticketSearchError}</div>
                </div>
              </div>
            )}
          </div>

          {/* TRACKED REPORT RESULT DETAILS */}
          {trackedReport && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6 animate-fadeIn">
              
              {/* Header Status Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <span>Tiket Pengaduan Siswa</span>
                    <span>•</span>
                    <span className="font-mono text-blue-600">{trackedReport.reportId}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                    {trackedReport.category}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold capitalize flex items-center gap-1.5 shadow-xs ${
                    trackedReport.status === 'baru'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : trackedReport.status === 'ditinjau'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : trackedReport.status === 'ditindaklanjuti'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    <span className="w-2 h-2 rounded-full bg-current"></span>
                    Status: {trackedReport.status === 'baru' ? 'Baru Diterima' : trackedReport.status}
                  </span>
                </div>
              </div>

              {/* Progress Step Timeline */}
              <div className="p-4 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Alur Tahapan Penanganan Kasus
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {STATUS_STEPS.map((step, idx) => {
                    const currentIdx = getStepProgressIndex(trackedReport.status);
                    const isCompleted = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;

                    return (
                      <div
                        key={step.key}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isCurrent
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                            : isCompleted
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                              : 'bg-white text-slate-400 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isCompleted ? (
                            <CheckCircle2 className={`w-4 h-4 shrink-0 ${isCurrent ? 'text-white' : 'text-emerald-600'}`} />
                          ) : (
                            <Clock className="w-4 h-4 shrink-0 text-slate-300" />
                          )}
                          <span className={`text-xs font-bold truncate ${isCurrent ? 'text-white' : isCompleted ? 'text-emerald-900' : 'text-slate-600'}`}>
                            {step.label}
                          </span>
                        </div>
                        <div className={`text-[11px] mt-1 line-clamp-2 ${isCurrent ? 'text-blue-100' : isCompleted ? 'text-emerald-700' : 'text-slate-400'}`}>
                          {step.desc}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Counselor Feedback & Action Notes */}
              <div className="p-4 sm:p-6 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 uppercase tracking-wider">
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                  Catatan Tindak Lanjut dari Guru BK
                </div>
                
                {trackedReport.counselingNotes ? (
                  <p className="text-sm text-indigo-950 font-medium leading-relaxed bg-white/80 p-3.5 rounded-xl border border-indigo-100">
                    "{trackedReport.counselingNotes}"
                  </p>
                ) : (
                  <p className="text-xs text-indigo-700 italic bg-white/60 p-3 rounded-xl">
                    Laporan sedang dalam antrean telaah awal oleh Guru BK. Catatan penanganan akan diperbarui segera setelah konselor melakukan verifikasi.
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-indigo-800">
                  <span className="font-semibold">
                    Guru BK Penanggung Jawab: {trackedReport.assignedCounselor || schoolSettings.bkHeadTeacher}
                  </span>
                  <span className="text-[11px] text-indigo-600">
                    Terakhir diperbarui: {new Date(trackedReport.updatedAt || trackedReport.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* General Incident Info Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[11px] text-slate-500 font-semibold uppercase">Waktu & Tanggal</span>
                  <p className="text-xs sm:text-sm font-bold text-slate-800">
                    {trackedReport.incidentDate} ({trackedReport.incidentTime})
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[11px] text-slate-500 font-semibold uppercase">Lokasi Kejadian</span>
                  <p className="text-xs sm:text-sm font-bold text-slate-800">
                    {trackedReport.location}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[11px] text-slate-500 font-semibold uppercase">Status Pelapor</span>
                  <p className="text-xs sm:text-sm font-bold text-slate-800">
                    {trackedReport.reporterStatus} {trackedReport.isAnonymous ? '(Anonim)' : ''}
                  </p>
                </div>
              </div>

              {/* Refresh Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleSearchTicket(undefined, trackedReport.reportId)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                  <span>Segarkan Status</span>
                </button>
              </div>

            </div>
          )}

          {/* Emergency Hotline Contact Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/70 border border-blue-100 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                <PhoneCall className="w-4 h-4 text-blue-600" />
                Butuh Bantuan Segera / Darurat?
              </div>
              <p className="text-xs text-blue-700 leading-normal">
                Hubungi hotline Guru BK jika Anda membutuhkan pendampingan langsung hari ini:
              </p>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <div className="text-sm font-bold text-blue-900 font-mono">
                {schoolSettings.emergencyHotline}
              </div>
              <div className="text-[11px] text-blue-600">
                Koord: {schoolSettings.bkHeadTeacher}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: FORM PENGADUAN BARU SISWA */}
      {/* ========================================================================= */}
      {activePortalTab === 'create' && (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-8">
          
          {/* Error Alert */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold">Mohon Periksa Kembali:</div>
                <div>{errorMessage}</div>
              </div>
            </div>
          )}

          {/* Section 1: Identitas Pelapor */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h3 className="text-base font-bold text-slate-900">Identitas Pelapor</h3>
            </div>

            {/* Anonymous Toggle Option */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
              <input
                type="checkbox"
                id="checkbox-anonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
              />
              <label htmlFor="checkbox-anonymous" className="text-xs sm:text-sm text-slate-700 cursor-pointer select-none">
                <span className="font-bold text-slate-900 block">Laporkan Secara Anonim (Rahasiakan Nama Saya)</span>
                <span className="text-slate-500 text-xs block">
                  Jika dicentang, nama pelapor akan disamarkan menjadi Anonim demi kenyamananmu.
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Nama Siswa {isAnonymous ? '(Opsional / Anonim)' : <span className="text-rose-500">*</span>}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    id="input-student-name"
                    disabled={isAnonymous}
                    value={isAnonymous ? 'Siswa (Anonim)' : studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Masukkan nama lengkap siswa..."
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all ${
                      isAnonymous 
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                        : 'bg-white text-slate-900 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Kelas <span className="text-slate-400 font-normal">(Contoh: VII-A, VIII-C)</span>
                </label>
                <input
                  type="text"
                  id="input-class-grade"
                  value={classGrade}
                  onChange={(e) => setClassGrade(e.target.value)}
                  placeholder="Misal: VIII-B"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                No. WhatsApp / HP Siswa / Orang Tua <span className="text-slate-400 font-normal">(Opsional, untuk dihubungi Guru BK)</span>
              </label>
              <input
                type="text"
                id="input-contact-info"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="Misal: 0812-XXXX-XXXX"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm"
              />
            </div>
          </div>

          {/* Section 2: Waktu & Lokasi Kejadian */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h3 className="text-base font-bold text-slate-900">Waktu & Lokasi Kejadian</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Tanggal Kejadian <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    id="input-incident-date"
                    required
                    value={incidentDate}
                    onChange={(e) => setIncidentDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Waktu / Jam Kejadian <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="time"
                    id="input-incident-time"
                    required
                    value={incidentTime}
                    onChange={(e) => setIncidentTime(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Lokasi Kejadian <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  id="select-incident-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm bg-white cursor-pointer"
                >
                  {LOCATION_OPTIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {location === 'Lainnya' && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Sebutkan Lokasi Lainnya <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="input-custom-location"
                  required
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  placeholder="Contoh: Belakang gedung aula, halte bus dekat sekolah..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm"
                />
              </div>
            )}
          </div>

          {/* Section 3: Status Pelapor & Kategori */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                3
              </span>
              <h3 className="text-base font-bold text-slate-900">Status & Kategori Perundungan</h3>
            </div>

            {/* Status Pelapor Radio Cards */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Apakah kamu melapor sebagai Korban atau Saksi? <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className={`
                  p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3.5
                  ${reporterStatus === 'Korban'
                    ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                  }
                `}>
                  <input
                    type="radio"
                    name="reporterStatus"
                    value="Korban"
                    checked={reporterStatus === 'Korban'}
                    onChange={() => setReporterStatus('Korban')}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <div>
                    <div className="text-sm font-bold text-slate-900">Saya Adalah Korban</div>
                    <div className="text-xs text-slate-500">Saya sendiri yang mengalami perlakuan tidak menyenangkan tersebut.</div>
                  </div>
                </label>

                <label className={`
                  p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3.5
                  ${reporterStatus === 'Saksi'
                    ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                  }
                `}>
                  <input
                    type="radio"
                    name="reporterStatus"
                    value="Saksi"
                    checked={reporterStatus === 'Saksi'}
                    onChange={() => setReporterStatus('Saksi')}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <div>
                    <div className="text-sm font-bold text-slate-900">Saya Adalah Saksi Mata</div>
                    <div className="text-xs text-slate-500">Saya melihat atau mengetahui kejadian bullying terhadap teman lain.</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Kategori Bullying */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Bentuk / Kategori Perundungan <span className="text-rose-500">*</span>
              </label>
              <select
                id="select-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ReportCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm bg-white cursor-pointer"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 4: Kronologi Kejadian */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                4
              </span>
              <h3 className="text-base font-bold text-slate-900">Kronologi Kejadian Lengkap</h3>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Ceritakan Kejadian <span className="text-rose-500">*</span></span>
                <span className={`font-mono text-[11px] ${chronology.length < 20 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {chronology.length} karakter (minimal 20)
                </span>
              </div>
              <textarea
                id="textarea-chronology"
                rows={4}
                required
                value={chronology}
                onChange={(e) => setChronology(e.target.value)}
                placeholder="Jelaskan kejadian yang Anda alami atau saksikan. Tuliskan informasi penting seperti siapa yang terlibat, apa yang terjadi, bagaimana kronologinya, dan apakah ada ancaman..."
                className="w-full p-3.5 rounded-2xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm leading-relaxed"
              />
              <p className="text-xs text-slate-500">
                💡 Guru BK tidak akan membagikan ceritamu ke siapapun tanpa persetujuanmu. Jangan ragu menulis sejujurnya.
              </p>
            </div>

            {/* Urgensi Level */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Tingkat Kebutuhan Pendampingan Segera:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(['Rendah', 'Sedang', 'Tinggi', 'Darurat'] as UrgencyLevel[]).map((lvl) => {
                  const isSelected = urgency === lvl;
                  return (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => setUrgency(lvl)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                        isSelected
                          ? lvl === 'Darurat'
                            ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                            : lvl === 'Tinggi'
                              ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                              : 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {lvl}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Dilindungi enkripsi sistem dan Firebase Firestore.</span>
            </div>

            <button
              type="submit"
              id="btn-submit-report"
              disabled={isSubmitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 shadow-md shadow-blue-600/30 transition-all hover:scale-[1.01]"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Menyimpan ke Firebase...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Kirim Laporan ke Guru BK</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
