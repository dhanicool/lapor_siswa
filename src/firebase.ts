import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';

// Configuration from Firebase project setup
const firebaseConfig = {
  projectId: "predictive-winter-88chg",
  appId: "1:685925558373:web:8efce3ad9656758e773e8c",
  apiKey: "AIzaSyCt_ksyLidUoCR6hj5fkTR8jAqe1hzjnyQ",
  authDomain: "predictive-winter-88chg.firebaseapp.com",
  storageBucket: "predictive-winter-88chg.firebasestorage.app",
  messagingSenderId: "685925558373",
  firestoreDatabaseId: "ai-studio-e08d2f36-5deb-4a75-9f53-ba44008a5af2"
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
