import React, { useState } from 'react';
import { 
  BookOpen, 
  ShieldCheck, 
  Database, 
  CheckCircle2, 
  Sparkles, 
  Lock, 
  Users, 
  HelpCircle, 
  FileText,
  Workflow,
  Download,
  AlertTriangle
} from 'lucide-react';
import { SchoolSettings } from '../types';

interface PrdViewerProps {
  schoolSettings: SchoolSettings;
}

export const PrdViewer: React.FC<PrdViewerProps> = ({ schoolSettings }) => {
  const [activeSection, setActiveSection] = useState<'ringkasan' | 'siswa' | 'admin' | 'arsitektur' | 'ai' | 'sop'>('ringkasan');

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-sm">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            Product Requirement Document (PRD) v1.0
          </div>
          <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight">
            Dokumentasi Sistem & SOP Bimbingan Konseling
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Panduan arsitektur, kepatuhan privasi data siswa, SOP penanganan perundungan, dan pedoman operasional di {schoolSettings.schoolName}.
          </p>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex flex-wrap items-center gap-2 pb-2">
        {[
          { id: 'ringkasan', label: '1. Ringkasan Eksekutif & Tujuan' },
          { id: 'siswa', label: '2. Modul Pelaporan Siswa' },
          { id: 'admin', label: '3. Modul Admin & Guru BK' },
          { id: 'arsitektur', label: '4. Arsitektur Firebase & Keamanan' },
          { id: 'ai', label: '5. Prinsip AI Safety' },
          { id: 'sop', label: '6. SOP Tindak Lanjut Kasus' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSection === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 text-slate-700 text-xs sm:text-sm">
        {activeSection === 'ringkasan' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Ringkasan Eksekutif & Latar Belakang</h3>
            <p className="leading-relaxed">
              Aplikasi Pengaduan Bullying SMP adalah aplikasi berbasis web yang dirancang untuk membantu Guru Bimbingan dan Konseling (BK) dalam menerima, mencatat, memantau, dan menganalisis laporan kejadian bullying di lingkungan sekolah {schoolSettings.schoolName}.
            </p>

            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-blue-950 space-y-2">
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                Tujuan Utama:
              </div>
              <ul className="list-disc list-inside space-y-1 text-xs text-blue-900">
                <li>Mempermudah siswa melaporkan kejadian perundungan secara aman dan rahasia.</li>
                <li>Menghilangkan rasa takut siswa dengan opsi pelaporan anonim.</li>
                <li>Menyediakan dashboard pemantauan statistik dan tren hotspot lokasi bagi Guru BK.</li>
                <li>Menyediakan fitur export data ke Excel (.xlsx) dan PDF resmi (.pdf) dengan kop sekolah.</li>
              </ul>
            </div>
          </div>
        )}

        {activeSection === 'siswa' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Spesifikasi Modul Siswa</h3>
            <p className="leading-relaxed">
              Formulir pengaduan dirancang sederhana dan ramah usia remaja SMP agar pengisian dapat diselesaikan dalam waktu kurang dari 3 menit.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900 mb-1">Field Pengisian Wajib:</div>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-600">
                  <li>Nama Pelapor (atau Opsi Anonim)</li>
                  <li>Tanggal & Jam Kejadian</li>
                  <li>Lokasi Kejadian (Kantin, Kelas, Lapangan, dll)</li>
                  <li>Status Pelapor (Korban vs Saksi)</li>
                  <li>Kategori Bullying (Verbal, Fisik, Sosial, Cyber, dll)</li>
                  <li>Kronologi Kejadian (Minimal 20 karakter)</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900 mb-1">Receipt & Feedback:</div>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-600">
                  <li>ID Laporan format: <code>BL-YYYYMMDD-XXXX</code></li>
                  <li>Pesan terima kasih & apresiasi keberanian melapor</li>
                  <li>Akses kontak darurat hotline WhatsApp Guru BK</li>
                  <li>Jaminan kerahasiaan identitas siswa</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'admin' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Spesifikasi Modul Guru BK / Admin</h3>
            <p className="leading-relaxed">
              Modul ini dilindungi autentikasi khusus untuk menjaga privasi seluruh data siswa.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900 mb-1">1. Dashboard & KPI:</div>
                <p className="text-xs text-slate-600">
                  Perhitungan otomatis jumlah total laporan, rasio korban vs saksi, laporan bulan berjalan, dan kasus selesai.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900 mb-1">2. Filter & Pencarian:</div>
                <p className="text-xs text-slate-600">
                  Pencarian realtime berdasarkan kata kunci kronologi, lokasi, tanggal kejadian, atau status verifikasi.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900 mb-1">3. Export Terpadu:</div>
                <p className="text-xs text-slate-600">
                  Unduh data terfilter ke format Excel dan cetak PDF resmi lengkap dengan tanda tangan Guru BK & Kepala Sekolah.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'arsitektur' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Arsitektur Firebase Firestore & Security</h3>
            <div className="p-4 rounded-2xl bg-slate-900 text-white font-mono text-xs space-y-2">
              <div className="text-emerald-400">// Firestore Collections</div>
              <div>collection('reports') - Dokumen pengaduan perundungan</div>
              <div>collection('settings').doc('school_profile') - Nama sekolah & password admin</div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1.5">
              <div className="font-bold flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-emerald-700" />
                Perlindungan Hak Akses:
              </div>
              <p className="text-xs text-emerald-900">
                Siswa hanya memiliki hak CREATE laporan ke database, dan dibatasi untuk tidak dapat membaca data laporan siswa lainnya demi melindungi privasi.
              </p>
            </div>
          </div>
        )}

        {activeSection === 'ai' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Prinsip Keselamatan AI (AI Safety Guidelines)</h3>
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-2">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                Etika & Batasan Sistem:
              </div>
              <ul className="list-disc list-inside space-y-1 text-xs text-amber-900">
                <li>AI tidak boleh menggantikan keputusan profesional Guru BK.</li>
                <li>AI tidak boleh secara otomatis menetapkan vonis bersalah kepada siswa.</li>
                <li>AI hanya digunakan untuk merangkum kronologi panjang dan mengidentifikasi pola hotspot jam/lokasi rawan.</li>
                <li>Keputusan tindak lanjut, konseling, dan mediasi sepenuhnya tetap berada di tangan Guru BK dan Pihak Sekolah.</li>
              </ul>
            </div>
          </div>
        )}

        {activeSection === 'sop' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">SOP Alur Penanganan Kasus Perundungan SMP</h3>
            <div className="space-y-3">
              {[
                { step: '1', title: 'Penerimaan Laporan (Status: Baru)', desc: 'Guru BK menerima notifikasi laporan masuk pada dashboard, memverifikasi tingkat urgensi dan identitas pelapor.' },
                { step: '2', title: 'Tinjauan & Verifikasi Fakta (Status: Ditinjau)', desc: 'Guru BK memanggil pelapor secara terpisah dan privat untuk mendengarkan kronologi secara mendalam.' },
                { step: '3', title: 'Tindak Lanjut & Mediasi (Status: Ditindaklanjuti)', desc: 'Pelaksanaan konseling individual, pemanggilan terpisah pihak terkait, mediasi orang tua jika diperlukan, serta bimbingan karakter.' },
                { step: '4', title: 'Penyelesaian & Monitoring (Status: Selesai)', desc: 'Pembuatan berita acara konseling, penandatanganan komitmen bersama, dan pemantauan suasana kelas secara berkala.' },
              ].map((item) => (
                <div key={item.step} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    {item.step}
                  </span>
                  <div>
                    <div className="font-bold text-slate-900">{item.title}</div>
                    <div className="text-xs text-slate-600 mt-0.5">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
