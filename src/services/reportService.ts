import { 
  collection, 
  doc, 
  getDoc,
  setDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { ReportItem, ReportStatus, UrgencyLevel, ReportCategory, ReporterStatus } from '../types';

const REPORTS_COLLECTION = 'reports';
const LOCAL_STORAGE_REPORTS = 'lapor_bullying_reports_cache';

export const getTimeSlotGroup = (timeStr: string): '06.00-09.00' | '09.00-12.00' | '12.00-15.00' | '15.00-18.00' | 'Di luar jam sekolah' => {
  if (!timeStr) return '09.00-12.00';
  const parts = timeStr.split(':');
  const hour = parseInt(parts[0], 10);
  if (isNaN(hour)) return '09.00-12.00';

  if (hour >= 6 && hour < 9) return '06.00-09.00';
  if (hour >= 9 && hour < 12) return '09.00-12.00';
  if (hour >= 12 && hour < 15) return '12.00-15.00';
  if (hour >= 15 && hour < 18) return '15.00-18.00';
  return 'Di luar jam sekolah';
};

export const generateReportId = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const date = String(now.getDate()).padStart(2, '0');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `BL-${year}${month}${date}-${randomSuffix}`;
};

// Smart AI Assistant Helper for Counselor
export const analyzeReportText = (text: string, category: ReportCategory, status: ReporterStatus) => {
  const lower = text.toLowerCase();
  let urgency: UrgencyLevel = 'Sedang';
  let riskFlag: 'Perlu perhatian segera' | 'Perlu ditinjau' | 'Informasi belum cukup' = 'Perlu ditinjau';
  
  if (
    lower.includes('pukul') || 
    lower.includes('tendang') || 
    lower.includes('ancam bunuh') || 
    lower.includes('senjata') || 
    lower.includes('luka') ||
    lower.includes('darah') ||
    lower.includes('bakar') ||
    lower.includes('keroyok') ||
    lower.includes('takut ke sekolah')
  ) {
    urgency = 'Darurat';
    riskFlag = 'Perlu perhatian segera';
  } else if (
    lower.includes('peras') || 
    lower.includes('uang') || 
    lower.includes('telanjang') || 
    lower.includes('sebar foto') ||
    lower.includes('setiap hari')
  ) {
    urgency = 'Tinggi';
    riskFlag = 'Perlu perhatian segera';
  } else if (text.length < 35) {
    riskFlag = 'Informasi belum cukup';
    urgency = 'Rendah';
  }

  // Summary generation
  let summary = `Laporan dari ${status.toLowerCase()} mengenai dugaan ${category.split('(')[0].trim().toLowerCase()}. `;
  if (lower.includes('kantin')) summary += 'Terjadi di area kantin sekolah. ';
  if (lower.includes('kelas')) summary += 'Terjadi di ruang kelas. ';
  if (lower.includes('medsos') || lower.includes('wa') || lower.includes('whatsapp') || lower.includes('ig')) {
    summary += 'Melibatkan platform komunikasi digital/media sosial. ';
  }
  summary += 'Disarankan Guru BK segera melakukan pemanggilan terpisah dan pendampingan psikologis.';

  return { urgency, riskFlag, summary };
};

export const cleanFirestorePayload = <T extends Record<string, any>>(obj: T): Partial<T> => {
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned as Partial<T>;
};

export const getLocalReports = (): ReportItem[] => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_REPORTS);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading reports from cache', e);
  }
  return [];
};

export const saveLocalReports = (reports: ReportItem[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_REPORTS, JSON.stringify(reports));
  } catch (e) {
    console.error('Error saving reports to cache', e);
  }
};

export const createReport = async (data: Omit<ReportItem, 'reportId' | 'createdAt' | 'updatedAt' | 'timeSlotGroup'> & { reportId?: string }): Promise<ReportItem> => {
  const reportId = data.reportId || generateReportId();
  const timeSlotGroup = getTimeSlotGroup(data.incidentTime);
  const nowIso = new Date().toISOString();

  const analysis = analyzeReportText(data.chronology, data.category, data.reporterStatus);

  const newReport: ReportItem = {
    ...data,
    reportId,
    timeSlotGroup,
    urgency: data.urgency || analysis.urgency,
    aiRiskFlag: analysis.riskFlag,
    aiSummary: analysis.summary,
    createdAt: nowIso,
    updatedAt: nowIso,
    status: data.status || 'baru',
  };

  // 1. Save to Local Cache first
  const current = getLocalReports();
  const updated = [newReport, ...current];
  saveLocalReports(updated);

  // 2. Save to Firestore
  try {
    const docRef = doc(db, REPORTS_COLLECTION, reportId);
    const firestoreData = cleanFirestorePayload({
      ...newReport,
      timestamp: serverTimestamp()
    });
    await setDoc(docRef, firestoreData);
    console.log(`✅ Laporan ${reportId} berhasil disimpan ke Firestore!`);
  } catch (error) {
    console.warn('Could not save to Firestore directly, saved to local cache:', error);
  }

  return newReport;
};

export const updateReportStatus = async (reportId: string, status: ReportStatus, counselingNotes?: string, assignedCounselor?: string): Promise<void> => {
  const nowIso = new Date().toISOString();
  
  // Local update
  const current = getLocalReports();
  const updated = current.map(item => {
    if (item.reportId === reportId || item.id === reportId) {
      return {
        ...item,
        status,
        counselingNotes: counselingNotes !== undefined ? counselingNotes : item.counselingNotes,
        assignedCounselor: assignedCounselor !== undefined ? assignedCounselor : item.assignedCounselor,
        updatedAt: nowIso
      };
    }
    return item;
  });
  saveLocalReports(updated);

  // Firestore update
  try {
    const docRef = doc(db, REPORTS_COLLECTION, reportId);
    const updatePayload: any = {
      status,
      updatedAt: nowIso
    };
    if (counselingNotes !== undefined) updatePayload.counselingNotes = counselingNotes;
    if (assignedCounselor !== undefined) updatePayload.assignedCounselor = assignedCounselor;

    await updateDoc(docRef, cleanFirestorePayload(updatePayload));
  } catch (e) {
    console.warn('Firestore updateDoc failed, updated locally:', e);
  }
};

export const deleteReport = async (reportId: string): Promise<void> => {
  // Local delete
  const current = getLocalReports();
  const updated = current.filter(r => r.reportId !== reportId && r.id !== reportId);
  saveLocalReports(updated);

  // Firestore delete
  try {
    const docRef = doc(db, REPORTS_COLLECTION, reportId);
    await deleteDoc(docRef);
  } catch (e) {
    console.warn('Firestore delete failed:', e);
  }
};

export const getReportById = async (searchId: string): Promise<ReportItem | null> => {
  const normalizedId = searchId.trim().toUpperCase();
  if (!normalizedId) return null;

  // 1. Try local cache first
  const localList = getLocalReports();
  const foundLocal = localList.find(
    r => r.reportId.toUpperCase() === normalizedId || (r.id && r.id.toUpperCase() === normalizedId)
  );

  // 2. Fetch directly from Firestore for latest status
  try {
    const docRef = doc(db, REPORTS_COLLECTION, normalizedId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as ReportItem;
      const report = {
        ...data,
        id: snap.id,
        reportId: data.reportId || snap.id
      };
      return report;
    }
  } catch (err) {
    console.info('Firestore getReportById fallback to local list:', err);
  }

  return foundLocal || null;
};

export const subscribeReports = (callback: (reports: ReportItem[]) => void) => {
  try {
    const q = query(collection(db, REPORTS_COLLECTION), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      async (snapshot) => {
        if (!snapshot.empty) {
          const list: ReportItem[] = [];
          snapshot.forEach((d) => {
            const data = d.data() as ReportItem;
            list.push({ ...data, id: d.id, reportId: data.reportId || d.id });
          });
          saveLocalReports(list);
          callback(list);
        } else {
          // If empty in Firestore, automatically populate with SAMPLE_REPORTS to initialize the collection in Firebase!
          console.log('Firebase reports collection is empty, initializing seed data...');
          await seedSampleReports();
          const local = getLocalReports();
          callback(local.length > 0 ? local : SAMPLE_REPORTS);
        }
      },
      (error) => {
        console.warn('Snapshot listener error on reports:', error);
        callback(getLocalReports());
      }
    );
  } catch (err) {
    console.warn('Failed to attach firestore listener:', err);
    callback(getLocalReports());
    return () => {};
  }
};

// Seed Sample Data for initial presentation & rich charts demonstration
export const SAMPLE_REPORTS: ReportItem[] = [
  {
    reportId: 'BL-20260820-1011',
    studentName: 'Rian Pratama',
    isAnonymous: false,
    classGrade: 'VIII-B',
    contactInfo: '0813-1122-3344',
    incidentDate: '2026-08-20',
    incidentTime: '10:15',
    timeSlotGroup: '09.00-12.00',
    location: 'Kantin',
    reporterStatus: 'Korban',
    category: 'Bullying Verbal (Ejekan, Hinaan, Ancaman)',
    chronology: 'Setiap jam istirahat di kantin, saya selalu diejek mengenai kondisi fisik dan diancam jika mengadu ke wali kelas. Tadi uang jajan saya juga dipaksa untuk dibelikan mie instan oleh kakak kelas.',
    urgency: 'Tinggi',
    status: 'ditindaklanjuti',
    counselingNotes: 'Sudah dilakukan pemanggilan terhadap siswa bersangkutan dan wali kelas VIII-B. Menunggu pertemuan mediasi orang tua pada hari Senin.',
    assignedCounselor: 'Ahmad Fauzi, S.Pd., M.Kons.',
    aiRiskFlag: 'Perlu perhatian segera',
    aiSummary: 'Laporan korban bullying verbal dan pemalakan uang jajan di area kantin oleh kakak kelas. Sudah masuk tahap mediasi BK.',
    createdAt: '2026-08-20T03:15:00.000Z',
    updatedAt: '2026-08-20T05:20:00.000Z'
  },
  {
    reportId: 'BL-20260819-2042',
    studentName: 'Siti Annisa Rahma',
    isAnonymous: false,
    classGrade: 'IX-C',
    contactInfo: 'siti.annisa@siswa.sch.id',
    incidentDate: '2026-08-19',
    incidentTime: '13:45',
    timeSlotGroup: '12.00-15.00',
    location: 'Media sosial',
    reporterStatus: 'Korban',
    category: 'Cyberbullying (Media Sosial, Grup Chat)',
    chronology: 'Ada akun anonim di Instagram yang membuat story berisi fitnah tentang saya dan menyebarkan nomor telepon pribadi saya ke grup WhatsApp umum sekolah.',
    urgency: 'Tinggi',
    status: 'ditinjau',
    counselingNotes: 'Telah mengumpulkan bukti screenshot story IG dan chat grup WhatsApp. Guru BK sedang berkoordinasi dengan Tim IT sekolah.',
    assignedCounselor: 'Nurul Hidayati, S.Psi.',
    aiRiskFlag: 'Perlu perhatian segera',
    aiSummary: 'Doxxing dan pencemaran nama baik melalui akun anonim Instagram dan grup chat WhatsApp.',
    createdAt: '2026-08-19T06:45:00.000Z',
    updatedAt: '2026-08-19T08:00:00.000Z'
  },
  {
    reportId: 'BL-20260818-3190',
    studentName: 'Siswa / Saksi Mata',
    isAnonymous: true,
    classGrade: 'VII-A',
    incidentDate: '2026-08-18',
    incidentTime: '15:30',
    timeSlotGroup: '15.00-18.00',
    location: 'Tempat parkir',
    reporterStatus: 'Saksi',
    category: 'Bullying Fisik (Pukulan, Dorongan, Kekerasan)',
    chronology: 'Saya melihat teman kelas 7 di pojok tempat parkir sepeda didorong-dorong sampai jatuh dan tasnya dilempar ke atas genteng tempat wudhu oleh 3 anak kelas 9.',
    urgency: 'Darurat',
    status: 'baru',
    counselingNotes: '',
    assignedCounselor: '',
    aiRiskFlag: 'Perlu perhatian segera',
    aiSummary: 'Saksi melaporkan kekerasan fisik berupa dorongan dan pelemparan tas di area parkir sepeda oleh 3 siswa kelas 9.',
    createdAt: '2026-08-18T08:30:00.000Z',
    updatedAt: '2026-08-18T08:30:00.000Z'
  },
  {
    reportId: 'BL-20260815-4122',
    studentName: 'Dimas Aditya',
    isAnonymous: false,
    classGrade: 'VII-D',
    incidentDate: '2026-08-15',
    incidentTime: '08:10',
    timeSlotGroup: '06.00-09.00',
    location: 'Kelas',
    reporterStatus: 'Korban',
    category: 'Bullying Sosial / Relasional (Pengucilan, Fitnah, Gosip)',
    chronology: 'Saya dikucilkan satu kelas karena ada yang menyebarkan gosip bohong bahwa saya mencontek saat ujian. Tidak ada teman yang mau satu kelompok tugas dengan saya.',
    urgency: 'Sedang',
    status: 'selesai',
    counselingNotes: 'Konseling kelompok telah dilaksanakan bersama wali kelas VII-D. Siswa sudah berdamai dan suasana kelas kembali kondusif.',
    assignedCounselor: 'Ahmad Fauzi, S.Pd., M.Kons.',
    aiRiskFlag: 'Perlu ditinjau',
    aiSummary: 'Kasus pengucilan sosial di kelas akibat rumor tidak benar. Telah diselesaikan melalui bimbingan kelompok.',
    createdAt: '2026-08-15T01:10:00.000Z',
    updatedAt: '2026-08-17T04:00:00.000Z'
  },
  {
    reportId: 'BL-20260812-5881',
    studentName: 'Fajar Nugraha',
    isAnonymous: false,
    classGrade: 'VIII-A',
    incidentDate: '2026-08-12',
    incidentTime: '11:30',
    timeSlotGroup: '09.00-12.00',
    location: 'Toilet',
    reporterStatus: 'Saksi',
    category: 'Bullying Verbal (Ejekan, Hinaan, Ancaman)',
    chronology: 'Waktu saya mau cuci tangan di toilet laki-laki lantai 2, saya mendengar ada anak dikunci di dalam bilik toilet sambil disiram air dari atas.',
    urgency: 'Darurat',
    status: 'selesai',
    counselingNotes: 'Pelaku telah diberikan surat peringatan dan pembinaan intensif karakter oleh Guru BK dan Kesiswaan.',
    assignedCounselor: 'Ahmad Fauzi, S.Pd., M.Kons.',
    aiRiskFlag: 'Perlu perhatian segera',
    aiSummary: 'Tindakan penguncian siswa di toilet dan penyiraman air. Ditindaklanjuti dengan sanksi pembinaan kesiswaan.',
    createdAt: '2026-08-12T04:30:00.000Z',
    updatedAt: '2026-08-14T06:00:00.000Z'
  },
  {
    reportId: 'BL-20260808-6219',
    studentName: 'Dewi Lestari',
    isAnonymous: false,
    classGrade: 'IX-A',
    incidentDate: '2026-08-08',
    incidentTime: '14:15',
    timeSlotGroup: '12.00-15.00',
    location: 'Koridor',
    reporterStatus: 'Korban',
    category: 'Bullying Verbal (Ejekan, Hinaan, Ancaman)',
    chronology: 'Setiap melewati koridor depan kelas IX-F, saya selalu disoraki dan dipanggil dengan sebutan nama hewan oleh sekelompok siswa yang nongkrong.',
    urgency: 'Sedang',
    status: 'ditindaklanjuti',
    counselingNotes: 'Guru piket dan satpam telah memperketat pengawasan di koridor lantai 2.',
    assignedCounselor: 'Nurul Hidayati, S.Psi.',
    aiRiskFlag: 'Perlu ditinjau',
    aiSummary: 'Catcalling dan hinaan verbal berulang di koridor sekolah.',
    createdAt: '2026-08-08T07:15:00.000Z',
    updatedAt: '2026-08-10T02:00:00.000Z'
  },
  {
    reportId: 'BL-20260802-7901',
    studentName: 'Anonim Siswa',
    isAnonymous: true,
    classGrade: 'VIII-E',
    incidentDate: '2026-08-02',
    incidentTime: '16:10',
    timeSlotGroup: '15.00-18.00',
    location: 'Dalam perjalanan sekolah',
    reporterStatus: 'Saksi',
    category: 'Pemalakan / Pemerasan',
    chronology: 'Ada geng motor kecil dekat gang samping halte bus yang sering menghadang siswa yang jalan kaki pulang untuk meminta uang rokok.',
    urgency: 'Tinggi',
    status: 'ditindaklanjuti',
    counselingNotes: 'Sekolah telah berkoordinasi dengan Babinsa dan Polsek setempat untuk patroli jam pulang sekolah.',
    assignedCounselor: 'Ahmad Fauzi, S.Pd., M.Kons.',
    aiRiskFlag: 'Perlu perhatian segera',
    aiSummary: 'Pemalakan oleh pihak luar di jalur pulang sekolah. Koordinasi keamanan bersama kepolisian sektor.',
    createdAt: '2026-08-02T09:10:00.000Z',
    updatedAt: '2026-08-03T01:30:00.000Z'
  },
  {
    reportId: 'BL-20260728-8422',
    studentName: 'Bayu Saputra',
    isAnonymous: false,
    classGrade: 'VII-C',
    incidentDate: '2026-07-28',
    incidentTime: '09:40',
    timeSlotGroup: '09.00-12.00',
    location: 'Lapangan',
    reporterStatus: 'Korban',
    category: 'Bullying Fisik (Pukulan, Dorongan, Kekerasan)',
    chronology: 'Saat pelajaran olahraga sepak bola, kaki saya sengaja ditekel dari belakang dengan keras dan ketika saya mengaduh, saya malah ditertawakan dan diinjak sepatunya.',
    urgency: 'Sedang',
    status: 'selesai',
    counselingNotes: 'Guru Penjasorkes dan Guru BK telah memediasi dan memberikan pengarahan sportivitas.',
    assignedCounselor: 'Nurul Hidayati, S.Psi.',
    aiRiskFlag: 'Perlu ditinjau',
    aiSummary: 'Kekerasan fisik terselubung saat jam olahraga. Sudah selesai dimediasi.',
    createdAt: '2026-07-28T02:40:00.000Z',
    updatedAt: '2026-07-30T05:00:00.000Z'
  }
];

export const seedSampleReports = async (): Promise<void> => {
  saveLocalReports(SAMPLE_REPORTS);
  try {
    const promises = SAMPLE_REPORTS.map((report) => {
      const docRef = doc(db, REPORTS_COLLECTION, report.reportId);
      const firestoreData = cleanFirestorePayload({
        ...report,
        timestamp: serverTimestamp()
      });
      return setDoc(docRef, firestoreData);
    });
    await Promise.all(promises);
    console.log(`✅ Sukses menyinkronkan ${SAMPLE_REPORTS.length} data pengaduan ke Firestore collection '${REPORTS_COLLECTION}'!`);
  } catch (e) {
    console.warn('Could not write seed directly to Firestore, cached locally:', e);
  }
};

// Check and push sample data if Firestore is empty upon module boot
export const ensureFirestoreReports = async (): Promise<void> => {
  try {
    const snapshot = await getDocs(collection(db, REPORTS_COLLECTION));
    if (snapshot.empty) {
      console.log('Firebase reports collection is empty, creating documents in Firestore...');
      await seedSampleReports();
    } else {
      console.log(`Firebase reports collection already has ${snapshot.size} documents.`);
    }
  } catch (err) {
    console.info('Auto-check Firestore reports info:', err);
  }
};

// Trigger boot check
ensureFirestoreReports();
