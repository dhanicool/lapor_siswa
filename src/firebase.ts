import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';

// Configuration from Firebase project setup with optional environment variables for Vercel deployment
const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "predictive-winter-88chg",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:685925558373:web:8efce3ad9656758e773e8c",
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCt_ksyLidUoCR6hj5fkTR8jAqe1hzjnyQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "predictive-winter-88chg.firebaseapp.com",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "predictive-winter-88chg.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "685925558373",
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || "ai-studio-e08d2f36-5deb-4a75-9f53-ba44008a5af2"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with standard persistence or default
let db: ReturnType<typeof getFirestore>;

try {
  // Use specific database ID if configured or default
  db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
} catch (e) {
  try {
    db = getFirestore(app);
  } catch (err) {
    console.warn('Firestore initialization fallback:', err);
    db = getFirestore(app);
  }
}

export { app, db, firebaseConfig };
