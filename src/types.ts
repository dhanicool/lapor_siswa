export type ReporterStatus = 'Korban' | 'Saksi';

export type ReportCategory = 
  | 'Bullying Verbal (Ejekan, Hinaan, Ancaman)'
  | 'Bullying Fisik (Pukulan, Dorongan, Kekerasan)'
  | 'Bullying Sosial / Relasional (Pengucilan, Fitnah, Gosip)'
  | 'Cyberbullying (Media Sosial, Grup Chat)'
  | 'Pemalakan / Pemerasan'
  | 'Lainnya';

export type ReportStatus = 'baru' | 'ditinjau' | 'ditindaklanjuti' | 'selesai';

export type UrgencyLevel = 'Rendah' | 'Sedang' | 'Tinggi' | 'Darurat';

export interface ReportItem {
  id?: string;
  reportId: string;
  studentName: string;
  isAnonymous?: boolean;
  classGrade?: string;
  contactInfo?: string;
  incidentDate: string;
  incidentTime: string;
  timeSlotGroup?: '06.00-09.00' | '09.00-12.00' | '12.00-15.00' | '15.00-18.00' | 'Di luar jam sekolah';
  location: string;
  customLocation?: string;
  reporterStatus: ReporterStatus;
  category: ReportCategory;
  chronology: string;
  urgency: UrgencyLevel;
  status: ReportStatus;
  counselingNotes?: string;
  assignedCounselor?: string;
  aiSummary?: string;
  aiRiskFlag?: 'Perlu perhatian segera' | 'Perlu ditinjau' | 'Informasi belum cukup';
  aiCategoryRecommendation?: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface SchoolSettings {
  schoolName: string;
  npsn: string;
  address: string;
  city: string;
  principalName: string;
  bkHeadTeacher: string;
  bkPhone: string;
  bkEmail: string;
  emergencyHotline: string;
  motto: string;
  adminUsername: string;
  adminPassword: string; // Stored securely in Firestore settings document
  adminName: string;
  lastUpdated: string;
}

export interface FilterState {
  searchQuery: string;
  status: string; // 'all' | 'baru' | 'ditinjau' | 'ditindaklanjuti' | 'selesai'
  reporterStatus: string; // 'all' | 'Korban' | 'Saksi'
  category: string; // 'all' | category name
  location: string; // 'all' | location name
  period: 'all' | 'today' | 'this_week' | 'this_month' | 'this_year' | 'custom';
  startDate?: string;
  endDate?: string;
  urgency: string; // 'all' | 'Rendah' | 'Sedang' | 'Tinggi' | 'Darurat'
}

export type ActiveTab = 
  | 'dashboard'
  | 'reports'
  | 'analytics'
  | 'settings'
  | 'student-portal'
  | 'prd-docs';
