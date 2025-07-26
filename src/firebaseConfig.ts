import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getDatabase } from 'firebase/database';
import { getAnalytics } from 'firebase/analytics';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBbJ-lKdpKH2lqvvfhN6It6KdE_tbM8IzY",
  authDomain: "story-steps-new-app-791bd.firebaseapp.com",
  databaseURL: "https://story-steps-new-app-791bd-default-rtdb.firebaseio.com",
  projectId: "story-steps-new-app-791bd",
  storageBucket: "story-steps-new-app-791bd.firebasestorage.app",
  messagingSenderId: "821990252940",
  appId: "1:821990252940:web:bc6f0dc46f4568a7e276a9",
  measurementId: "G-H04G02PVX0"
};

const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;