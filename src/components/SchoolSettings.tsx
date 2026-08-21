import React, { useState } from 'react';
import { 
  School, 
  KeyRound, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Database, 
  RotateCcw, 
  PhoneCall, 
  Mail, 
  User, 
  FileText,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { SchoolSettings } from '../types';
import { updateSchoolSettings } from '../services/schoolSettingsService';
import { seedSampleReports } from '../services/reportService';

interface SchoolSettingsProps {
  settings: SchoolSettings;
  onSettingsUpdated: (newSettings: SchoolSettings) => void;
  reportCount: number;
}

export const SchoolSettingsView: React.FC<SchoolSettingsProps> = ({
  settings,
  onSettingsUpdated,
  reportCount
}) => {
  // Form state for School Profile
  const [schoolName, setSchoolName] = useState(settings.schoolName);
  const [npsn, setNpsn] = useState(settings.npsn);
  const [address, setAddress] = useState(settings.address);
  const [city, setCity] = useState(settings.city);
  const [principalName, setPrincipalName] = useState(settings.principalName);
  const [bkHeadTeacher, setBkHeadTeacher] = useState(settings.bkHeadTeacher);
  const [bkPhone, setBkPhone] = useState(settings.bkPhone);
  const [bkEmail, setBkEmail] = useState(settings.bkEmail);
  const [emergencyHotline, setEmergencyHotline] = useState(settings.emergencyHotline);
  const [motto, setMotto] = useState(settings.motto);

  // Form state for Admin Account & Password
  const [adminUsername, setAdminUsername] = useState(settings.adminUsername);
  const [adminName, setAdminName] = useState(settings.adminName);
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status feedback
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSaveSchoolProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!schoolName.trim()) {
      setErrorMessage('Nama sekolah tidak boleh kosong.');
      return;
    }

    setIsSaving(true);
    try {
      const updated = await updateSchoolSettings({
        schoolName: schoolName.trim(),
        npsn: npsn.trim(),
        address: address.trim(),
        city: city.trim(),
        principalName: principalName.trim(),
        bkHeadTeacher: bkHeadTeacher.trim(),
        bkPhone: bkPhone.trim(),
        bkEmail: bkEmail.trim(),
        emergencyHotline: emergencyHotline.trim(),
        motto: motto.trim()
      });

      onSettingsUpdated(updated);
      setSuccessMessage('Pengaturan nama sekolah & profil berhasil disimpan ke database Firebase Firestore!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage('Gagal memperbarui pengaturan sekolah.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePasswordAndAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!adminUsername.trim()) {
      setErrorMessage('Username admin tidak boleh kosong.');
      return;
    }

    // If attempting to change password
    if (newPassword || confirmPassword) {
      if (currentPasswordInput !== settings.adminPassword) {
        setErrorMessage('Password saat ini salah. Mohon masukkan password lama yang valid.');
        return;
      }
      if (newPassword.length < 5) {
        setErrorMessage('Password baru minimal 5 karakter.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMessage('Konfirmasi password baru tidak cocok.');
        return;
      }
    }

    setIsSaving(true);
    try {
      const payload: Partial<SchoolSettings> = {
        adminUsername: adminUsername.trim(),
        adminName: adminName.trim()
      };

      if (newPassword) {
        payload.adminPassword = newPassword.trim();
      }

      const updated = await updateSchoolSettings(payload);
      onSettingsUpdated(updated);
      
      setCurrentPasswordInput('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccessMessage('Akun & password admin berhasil diperbarui dan disimpan di Firebase Firestore!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage('Gagal memperbarui akun admin.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSeedDatabase = async () => {
    if (window.confirm('Muat data simulasi perundungan (10 kasus realistis) ke database Firestore? Data ini akan melengkapi grafik statistik.')) {
      setIsSeeding(true);
      try {
        await seedSampleReports();
        setSuccessMessage('Data sampel berhasil disinkronkan ke Firebase Firestore!');
        setTimeout(() => setSuccessMessage(null), 4000);
      } catch (err) {
        setErrorMessage('Gagal memuat data sampel.');
      } finally {
        setIsSeeding(false);
      }
    }
  };

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header Banner */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Pengaturan Sekolah & Akun Admin
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Ubah nama sekolah, konfigurasi kontak BK, dan kelola password akun administrator pada database Firebase.
        </p>
      </div>

      {/* Success / Error Alerts */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-medium flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-medium flex items-center gap-2.5 animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: School Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Profil & Nama Sekolah */}
          <form onSubmit={handleSaveSchoolProfile} className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <School className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Perubahan Nama Sekolah & Identitas</h3>
                <p className="text-xs text-slate-500">Nama sekolah otomatis tampil pada kop surat PDF, export Excel, dan portal siswa.</p>
              </div>
            </div>

            {/* Nama Sekolah (Important Requirement) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Nama Sekolah <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="input-school-name"
                required
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="Contoh: SMP Negeri 1 Cerdas Bangsa"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm font-semibold bg-slate-50/50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Nomor Pokok Sekolah Nasional (NPSN)</label>
                <input
                  type="text"
                  value={npsn}
                  onChange={(e) => setNpsn(e.target.value)}
                  placeholder="Misal: 20104829"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Kota / Kabupaten</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Misal: Jakarta Selatan, DKI Jakarta"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Alamat Lengkap Sekolah</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Jl. Pendidikan Merdeka No. 45..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-xs sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Nama Kepala Sekolah</label>
                <input
                  type="text"
                  value={principalName}
                  onChange={(e) => setPrincipalName(e.target.value)}
                  placeholder="Dra. Hj. Sri Wahyuni, M.Pd."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Koordinator Bimbingan Konseling (BK)</label>
                <input
                  type="text"
                  value={bkHeadTeacher}
                  onChange={(e) => setBkHeadTeacher(e.target.value)}
                  placeholder="Ahmad Fauzi, S.Pd., M.Kons."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Hotline Darurat BK (24 Jam)</label>
                <input
                  type="text"
                  value={emergencyHotline}
                  onChange={(e) => setEmergencyHotline(e.target.value)}
                  placeholder="0811-9988-7766"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-xs sm:text-sm font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Email Resmi Layanan BK</label>
                <input
                  type="email"
                  value={bkEmail}
                  onChange={(e) => setBkEmail(e.target.value)}
                  placeholder="bk@sekolah.sch.id"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Slogan / Motto Anti-Bullying Sekolah</label>
              <input
                type="text"
                value={motto}
                onChange={(e) => setMotto(e.target.value)}
                placeholder="Berani Bicara, Ciptakan Sekolah Ramah..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-xs sm:text-sm"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                id="btn-save-school-profile"
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 shadow-sm transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan Nama & Profil</span>
              </button>
            </div>
          </form>

          {/* Section 2: Perubahan Password & Akun Admin */}
          <form onSubmit={handleSavePasswordAndAccount} className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Perubahan Password & Akses Administrator</h3>
                <p className="text-xs text-slate-500">Kelola kredensial login admin Guru BK yang tersimpan di Firebase Firestore.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Username Login Admin</label>
                <input
                  type="text"
                  id="input-admin-username"
                  required
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-xs sm:text-sm font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Nama Tampilan Admin</label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="Guru BK / Administrator"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
              <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-700" />
                Ganti Password Admin
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-700">Password Saat Ini</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={currentPasswordInput}
                    onChange={(e) => setCurrentPasswordInput(e.target.value)}
                    placeholder="Ketik password lama"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-700">Password Baru</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 5 karakter"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-700">Konfirmasi Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ketik ulang password"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPassword ? 'Sembunyikan' : 'Tampilkan'} Karakter Password</span>
                </button>
                <span>Password default awal: <code>admin123</code></span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                id="btn-save-admin-account"
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 shadow-sm transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan Password & Akun</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Database Status & Maintenance */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Database className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Status Database Firebase</h3>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Koneksi:</span>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Terhubung Realtime
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Project ID:</span>
                <span className="font-mono text-slate-700 font-medium">predictive-winter-88chg</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Collection:</span>
                <span className="font-mono text-slate-700">reports & settings</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Total Record:</span>
                <span className="font-bold text-blue-600">{reportCount} Laporan</span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleSeedDatabase}
                disabled={isSeeding}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
              >
                {isSeeding ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-blue-600" />}
                <span>Muat Ulang Data Sampel Simulasi</span>
              </button>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-blue-900 text-white space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-200">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Keamanan Data & Privasi SMP
            </div>
            <p className="text-xs text-blue-100 leading-relaxed">
              Seluruh data laporan perundungan dienkripsi dan hanya dapat diakses melalui portal admin terautentikasi Guru BK.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
