import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { SchoolSettings } from '../types';

export const DEFAULT_SCHOOL_SETTINGS: SchoolSettings = {
  schoolName: 'SMP Negeri 1 Cerdas Bangsa',
  npsn: '20104829',
  address: 'Jl. Pendidikan Merdeka No. 45, Kebayoran Baru',
  city: 'Jakarta Selatan, DKI Jakarta',
  principalName: 'Dra. Hj. Sri Wahyuni, M.Pd.',
  bkHeadTeacher: 'Ahmad Fauzi, S.Pd., M.Kons.',
  bkPhone: '0812-3456-7890',
  bkEmail: 'bk.smpn1cerdas@sekolah.sch.id',
  emergencyHotline: '0811-9988-7766 (24 Jam)',
  motto: 'Berani Bicara, Ciptakan Sekolah Ramah, Aman, dan Bersahabat.',
  adminUsername: 'admin',
  adminPassword: 'admin123',
  adminName: 'Guru BK / Administrator',
  lastUpdated: new Date().toISOString()
};

const SETTINGS_DOC_ID = 'school_profile';
const SETTINGS_COLLECTION = 'settings';
const LOCAL_STORAGE_KEY = 'lapor_bullying_school_settings';

export const getLocalSettings = (): SchoolSettings => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_SCHOOL_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Error reading settings from localStorage', e);
  }
  return DEFAULT_SCHOOL_SETTINGS;
};

export const saveLocalSettings = (settings: SchoolSettings) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings to localStorage', e);
  }
};

export const fetchSchoolSettings = async (): Promise<SchoolSettings> => {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as SchoolSettings;
      saveLocalSettings(data);
      return data;
    } else {
      // Initialize with default settings in Firestore
      await setDoc(docRef, DEFAULT_SCHOOL_SETTINGS);
      saveLocalSettings(DEFAULT_SCHOOL_SETTINGS);
      return DEFAULT_SCHOOL_SETTINGS;
    }
  } catch (error) {
    console.warn('Could not fetch settings from Firestore, using local fallback:', error);
    return getLocalSettings();
  }
};

export const updateSchoolSettings = async (settings: Partial<SchoolSettings>): Promise<SchoolSettings> => {
  const current = getLocalSettings();
  const updated: SchoolSettings = {
    ...current,
    ...settings,
    lastUpdated: new Date().toISOString()
  };

  saveLocalSettings(updated);

  try {
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    await setDoc(docRef, updated, { merge: true });
  } catch (error) {
    console.warn('Firestore update failed, updated locally:', error);
  }

  return updated;
};

export const subscribeSchoolSettings = (callback: (settings: SchoolSettings) => void) => {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    return onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as SchoolSettings;
          saveLocalSettings(data);
          callback(data);
        } else {
          callback(getLocalSettings());
        }
      },
      (error) => {
        console.warn('Snapshot listener error for school settings:', error);
        callback(getLocalSettings());
      }
    );
  } catch (e) {
    console.warn('Could not attach snapshot for settings, using local:', e);
    callback(getLocalSettings());
    return () => {};
  }
};
