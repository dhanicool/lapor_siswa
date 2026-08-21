import React, { useState } from 'react';
import { 
  X, 
  User, 
  Calendar, 
  Clock, 
  MapPin, 
  Tag, 
  AlertTriangle, 
  Save, 
  CheckCircle2, 
  FileText, 
  Sparkles, 
  Printer, 
  ShieldCheck,
  Send,
  PhoneCall,
  Mail,
  UserCheck
} from 'lucide-react';
import { ReportItem, SchoolSettings, ReportStatus } from '../types';
import { updateReportStatus } from '../services/reportService';

interface ReportDetailModalProps {
  report: ReportItem | null;
  onClose: () => void;
  schoolSettings: SchoolSettings;
  onReportUpdated?: (updated: ReportItem) => void;
}

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  report,
  onClose,
  schoolSettings,
  onReportUpdated
}) => {
  if (!report) return null;

  const [currentStatus, setCurrentStatus] = useState<ReportStatus>(report.status);
  const [counselingNotes, setCounselingNotes] = useState(report.counselingNotes || '');
  const [assignedCounselor, setAssignedCounselor] = useState(report.assignedCounselor || schoolSettings.bkHeadTeacher);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveNotes = async () => {
    setIsSaving(true);
    try {
      await updateReportStatus(report.reportId, currentStatus, counselingNotes, assignedCounselor);
      setSavedSuccess(true);
      if (onReportUpdated) {
        onReportUpdated({
          ...report,
          status: currentStatus,
          counselingNotes,
          assignedCounselor
        });
      }
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold text-blue-300">{report.reportId}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  report.reporterStatus === 'Korban' ? 'bg-rose-500 text-white' : 'bg-indigo-500 text-white'
                }`}>
                  {report.reporterStatus}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Dibuat pada: {new Date(report.createdAt).toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              title="Cetak Kasus"
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-xs sm:text-sm">
          
          {savedSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Status dan Catatan Konseling berhasil disimpan ke database Firebase!</span>
            </div>
          )}

          {/* Quick Case Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] text-slate-400 font-medium block">Nama Pelapor:</span>
              <span className="font-bold text-slate-900 block truncate">
                {report.isAnonymous ? `${report.studentName} (Anonim)` : report.studentName}
              </span>
              <span className="text-[10px] text-slate-500">Kelas: {report.classGrade || '-'}</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] text-slate-400 font-medium block">Waktu Kejadian:</span>
              <span className="font-bold text-slate-900 block">
                {report.incidentDate}
              </span>
              <span className="text-[10px] text-slate-500">Pukul {report.incidentTime} WIB</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] text-slate-400 font-medium block">Lokasi:</span>
              <span className="font-bold text-slate-900 block truncate">
                {report.location}
              </span>
              <span className="text-[10px] text-slate-500">{report.timeSlotGroup || 'Luar jam'}</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] text-slate-400 font-medium block">Tingkat Urgensi:</span>
              <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                report.urgency === 'Darurat'
                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                  : report.urgency === 'Tinggi'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-blue-100 text-blue-800'
              }`}>
                {report.urgency}
              </span>
            </div>
          </div>

          {/* Contact info if provided */}
          {report.contactInfo && (
            <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between text-xs">
              <span className="text-blue-700 font-medium flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5" />
                Kontak Pelapor / Orang Tua:
              </span>
              <span className="font-mono font-bold text-blue-900">{report.contactInfo}</span>
            </div>
          )}

          {/* Category */}
          <div className="p-3.5 rounded-2xl bg-slate-100/70 border border-slate-200 flex items-center gap-2">
            <Tag className="w-4 h-4 text-blue-600 shrink-0" />
            <div className="flex-1">
              <span className="text-[11px] text-slate-500 block">Kategori Bentuk Bullying:</span>
              <span className="font-bold text-slate-900">{report.category}</span>
            </div>
          </div>

          {/* Chronology Body */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-500" />
              Kronologi Kejadian Asli (Pengakuan Pelapor):
            </h4>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-slate-800 leading-relaxed whitespace-pre-wrap">
              {report.chronology}
            </div>
          </div>

          {/* AI Case Insights */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Ringkasan & Analisis Asisten AI Guru BK
            </div>
            <p className="text-xs text-blue-800 leading-relaxed">
              {report.aiSummary || 'Analisis AI menyarankan Guru BK untuk menjadwalkan mediasi dan konseling individual secara terpisah demi menjaga kenyamanan siswa.'}
            </p>
            {report.aiRiskFlag && (
              <div className="text-[11px] text-blue-700 font-medium">
                Flag Risiko: <span className="font-bold text-rose-700">{report.aiRiskFlag}</span>
              </div>
            )}
          </div>

          {/* Counselor Follow-up & Notes Form */}
          <div className="p-5 rounded-3xl bg-slate-900 text-white space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-white">
                <UserCheck className="w-4 h-4 text-blue-400" />
                Penanganan & Catatan Konseling Guru BK
              </div>
              <span className="text-[11px] text-slate-400">Sinkron Firestore</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-300 font-medium">Ubah Status Kasus:</label>
                <select
                  value={currentStatus}
                  onChange={(e) => setCurrentStatus(e.target.value as ReportStatus)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-white focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="baru">1. Baru Diterima</option>
                  <option value="ditinjau">2. Sedang Ditinjau / Verifikasi</option>
                  <option value="ditindaklanjuti">3. Sedang Ditindaklanjuti / Mediasi</option>
                  <option value="selesai">4. Kasus Selesai Ditangani</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-300 font-medium">Guru BK Penanggung Jawab:</label>
                <input
                  type="text"
                  value={assignedCounselor}
                  onChange={(e) => setAssignedCounselor(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-300 font-medium">Catatan Perkembangan & Tindak Lanjut Konseling:</label>
              <textarea
                rows={3}
                value={counselingNotes}
                onChange={(e) => setCounselingNotes(e.target.value)}
                placeholder="Tuliskan hasil pemanggilan siswa, mediasi orang tua, surat pernyataan, atau program pembinaan karakter..."
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 leading-relaxed focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleSaveNotes}
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-all shadow-md shadow-blue-600/30"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Tindak Lanjut ke Firebase</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500">
            {schoolSettings.schoolName} • Layanan BK
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
