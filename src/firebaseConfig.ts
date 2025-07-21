import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAHL2zi4Lp48mlUg2V1Fq291uyd2c07K-8",
  authDomain: "story-steps-app-fire.firebaseapp.com", // Using default Firebase auth domain
  projectId: "story-steps-app-fire",
  storageBucket: "story-steps-app-fire.appspot.com",
  messagingSenderId: "760436635711",
  appId: "1:760436635711:web:0db01b99f62bee7378608a",
  measurementId: "G-TJBGGCSGB1"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

// Initialize Analytics only in supported environments
isSupported().then(yes => yes && getAnalytics(app));

export { auth, db, app };
