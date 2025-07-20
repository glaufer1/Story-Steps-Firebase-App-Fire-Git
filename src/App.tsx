import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import type { AppUser } from './interfaces';
import './App.css';
import TourList from './TourList';
import AdminPage from './AdminPage';
import Login from './Login';
import Navbar from './Navbar';
import { auth } from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

function App() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUser({ uid: currentUser.uid, ...userDocSnap.data() } as AppUser);
        } else {
          // Handle case where user exists in Auth but not in Firestore
          setUser({ uid: currentUser.uid, role: 'Customer' } as AppUser); 
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const dummyOnEdit = (tour: any) => { console.log('Dummy onEdit called', tour); };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Navbar user={user} />
      <Routes>
        <Route path="/" element={<TourList onEdit={dummyOnEdit} user={user} />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
