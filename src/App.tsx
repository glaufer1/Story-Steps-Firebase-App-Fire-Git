import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { User } from 'firebase/auth';
import './App.css';
import TourList from './TourList';
import AdminPage from './AdminPage';
import Login from './Login';
import { auth } from './firebaseConfig';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Dummy prop for TourList to satisfy type checking
  const dummyOnEdit = (tour: any) => { console.log('Dummy onEdit called', tour); };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<TourList onEdit={dummyOnEdit} user={user} />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
