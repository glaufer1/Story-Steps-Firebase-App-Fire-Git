import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import type { AppUser } from './interfaces';
import './App.css';

// Core Components & Pages
import Login from './Login';
import AdminPage from './AdminPage';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import AboutUsPage from './pages/AboutUsPage';
import BlogPage from './pages/BlogPage';
import CityToursPage from './pages/CityToursPage';
import ToursPage from './pages/ToursPage';
import TourCreatorPage from './pages/TourCreatorPage';
import TourEditorPage from './pages/TourEditorPage';
import EditTourListPage from './pages/EditTourListPage';
import UserManagementPage from './pages/UserManagementPage';
import CityManagementPage from './pages/CityManagementPage';

import { auth, db } from './firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';

import AuthWrapper from './components/AuthWrapper';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';

function App() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser: User | null) => {
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUser({ uid: currentUser.uid, ...userDocSnap.data() } as AppUser);
        } else {
          const newUser: AppUser = { uid: currentUser.uid, email: currentUser.email, role: 'Customer' };
          await setDoc(userDocRef, newUser);
          setUser(newUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthWrapper user={user} />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<Login user={user} />} />

        {/* Protected Application Routes */}
        <Route element={<ProtectedRoute user={user} />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/tours" element={<ToursPage />} />
          <Route path="/cities" element={<CityToursPage />} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/blog" element={<BlogPage />} />

          {/* Admin Routes with Navbar */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminPage />} />
            <Route path="tour-creator" element={<TourCreatorPage />} />
            <Route path="edit-tour" element={<EditTourListPage />} />
            <Route path="tour-editor/:tourId" element={<TourEditorPage />} />
            <Route path="user-management" element={<UserManagementPage />} />
            <Route path="city-management" element={<CityManagementPage />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
