// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAHL2zi4Lp48mlUg2V1Fq291uyd2c07K-8",
  authDomain: "story-steps-app-fire.firebaseapp.com",
  projectId: "story-steps-app-fire",
  storageBucket: "story-steps-app-fire.appspot.com",
  messagingSenderId: "760436635711",
  appId: "1:760436635711:web:0db01b99f62bee7378608a",
  measurementId: "G-TJBGGCSGB1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
