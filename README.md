# 🚀 Panduan Lengkap: Export AI Studio → GitHub → Vercel + Firebase Firestore

Panduan ini menjelaskan langkah demi langkah cara mengambil kode aplikasi dari **Google AI Studio**, menyimpannya di **GitHub**, lalu melakukan **Deployment ke Vercel** dengan database **Firebase Firestore**.

---

## 📋 Ikhtisar Arsitektur

- **Frontend**: React 19 + Vite + Tailwind CSS (Single Page Application)
- **Database**: Firebase Firestore (`predictive-winter-88chg` / `ai-studio-e08d2f36-5deb-4a75-9f53-ba44008a5af2`)
- **Version Control**: GitHub Repository
- **Hosting & CI/CD**: Vercel

---

## 1️⃣ Langkah 1: Export Kode dari Google AI Studio ke GitHub

Ada 2 cara mudah untuk mengekspor proyek Anda ke GitHub:

### Opsi A: Export Langsung dari Menu AI Studio (Paling Cepat)
1. Di layar Google AI Studio, klik ikon **Settings (⚙️)** atau tombol **Export/Share** di pojok kanan atas.
2. Pilih **Export to GitHub** (atau **Download ZIP** jika ingin mengunggah secara manual).
3. Sambungkan akun GitHub Anda dan tentukan nama repository baru (contoh: `lapor-bullying-smp`).
4. AI Studio akan secara otomatis membuat repository dan melakukan commit seluruh file kode.

### Opsi B: Menggunakan Git Manual dari ZIP
1. Download file ZIP dari AI Studio.
2. Ekstrak file ZIP di komputer Anda.
3. Buka terminal di folder hasil ekstrak dan jalankan:
   ```bash
   git init
   git add .
   git commit -m "Initial commit from Google AI Studio"
   git branch -M main
   git remote add origin https://github.com/USERNAME_ANDA/lapor-bullying-smp.git
   git push -u origin main
   ```

---

## 2️⃣ Langkah 2: Hubungkan Repository GitHub ke Vercel

1. Kunjungi [https://vercel.com](https://vercel.com) dan login/daftar menggunakan akun **GitHub** Anda.
2. Di halaman Dashboard Vercel, klik tombol **"Add New..."** lalu pilih **"Project"**.
3. Cari dan pilih repository `lapor-bullying-smp` dari daftar akun GitHub Anda, lalu klik **"Import"**.

---

## 3️⃣ Langkah 3: Konfigurasi Build & Environment Variables di Vercel

Di halaman **Configure Project** pada Vercel:

### A. Konfigurasi Standar Proyek
- **Framework Preset**: `Vite` (Vercel biasanya mendeteksi ini secara otomatis)
- **Root Directory**: `./` (default)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### B. Environment Variables (Opsional tapi Direkomendasikan)
Buka bagian **Environment Variables** di Vercel dan tambahkan variabel berikut (bisa disalin dari `.env.example`):

| Variable Name | Value |
|---|---|
| `VITE_FIREBASE_PROJECT_ID` | `predictive-winter-88chg` |
| `VITE_FIREBASE_APP_ID` | `1:685925558373:web:8efce3ad9656758e773e8c` |
| `VITE_FIREBASE_API_KEY` | `AIzaSyCt_ksyLidUoCR6hj5fkTR8jAqe1hzjnyQ` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `predictive-winter-88chg.firebaseapp.com` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `predictive-winter-88chg.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `685925558373` |
| `VITE_FIREBASE_DATABASE_ID` | `ai-studio-e08d2f36-5deb-4a75-9f53-ba44008a5af2` |

> *Catatan: Kode aplikasi di `src/firebase.ts` sudah dilengkapi nilai default fallback, sehingga aplikasi tetap dapat berjalan langsung meskipun Anda belum memasukkan variabel lingkungan di atas.*

4. Klik tombol **"Deploy"**.
5. Tunggu proses build selesai (~1 menit). Vercel akan memberikan domain publik (contoh: `https://lapor-bullying-smp.vercel.app`).

---

## 4️⃣ Langkah 4: Tambahkan Domain Vercel ke Firebase Console (Authorized Domains)

Agar Firebase Authentication dan Firestore dapat diakses tanpa hambatan dari domain Vercel Anda:

1. Buka [Firebase Console](https://console.firebase.google.com/).
2. Pilih project `predictive-winter-88chg`.
3. Masuk ke menu **Build** > **Authentication** > Tab **Settings** > **Authorized domains**.
4. Klik **Add domain** dan masukkan nama domain Vercel Anda (contoh: `lapor-bullying-smp.vercel.app`).
5. Simpan pengaturan.

---

## 5️⃣ Fitur Otomatisasi CI/CD di Vercel

Setelah langkah di atas selesai:
- Setiap kali Anda melakukan `git push` perubahan baru ke branch `main` di GitHub, **Vercel akan otomatis melakukan rebuild dan deploy versi terbaru**.
- Data laporan dan pengaturan sekolah tetap tersimpan aman dan tersinkronisasi secara real-time di **Firebase Firestore**.

---

## 📱 Verifikasi Aplikasi

Setelah deployment aktif di Vercel:
1. Buka URL domain Vercel Anda.
2. Coba kirim laporan pengaduan baru melalui **Portal Pengaduan Siswa**.
3. Masuk ke **Login Guru BK** (default: `admin` / `admin123`).
4. Verifikasi bahwa laporan baru langsung muncul di **Dashboard** dan **Daftar Laporan**.
5. Uji fitur **Export Excel** dan **Cetak PDF**.
