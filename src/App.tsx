import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import './App.css';
import Login from './Login';
import TourCreator from './TourCreator';
import TourList from './TourList';
import AdminPage from './AdminPage';
import PageManagement from './pages/PageManagement'; // Corrected import path

export interface Tour {
  id: string;
  title: string;
  description: string;
  price: number;
  stops: google.maps.LatLngLiteral[];
}

export interface AppUser {
  uid: string;
  email: string | null;
  role: 'Admin' | 'Creator' | 'Customer';
}

type View = 'tours' | 'admin' | 'pages';

function App() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [tourToEdit, setTourToEdit] = useState<Tour | null>(null);
  const [currentView, setCurrentView] = useState<View>('tours');

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          setUser({ uid: firebaseUser.uid, email: firebaseUser.email, ...docSnap.data() } as AppUser);
        } else {
          const newUser: AppUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: 'Customer'
          };
          setUser(newUser);
        }
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleEdit = (tour: Tour) => {
    setTourToEdit(tour);
    setCurrentView('tours');
    window.scrollTo(0, 0);
  };

  const handleFinishEditing = () => {
    setTourToEdit(null);
  }

  const isPrivilegedUser = user?.role === 'Admin' || user?.role === 'Creator';
  const isAdmin = user?.role === 'Admin';

  const renderView = () => {
    switch (currentView) {
      case 'admin':
        return isAdmin ? <AdminPage /> : <h2>Access Denied</h2>;
      case 'pages':
        return isPrivilegedUser ? <PageManagement user={user!} /> : <h2>Access Denied</h2>;
      case 'tours':
      default:
        return (
          <div>
            {isPrivilegedUser && <TourCreator tourToEdit={tourToEdit} onFinishEditing={handleFinishEditing} />}
            <TourList onEdit={handleEdit} user={user} />
          </div>
        );
    }
  };

  return (
    <div className="App">
      {user ? (
        <div>
          <header className="app-header">
            <h1>Welcome, {user.email} ({user.role})</h1>
            <nav>
              <button onClick={() => setCurrentView('tours')}>Tours</button>
              {isPrivilegedUser && <button onClick={() => setCurrentView('pages')}>Page Management</button>}
              {isAdmin && <button onClick={() => setCurrentView('admin')}>User Management</button>}
            </nav>
          </header>
          <main>
            {renderView()}
          </main>
        </div>
      ) : (
        <Login />
      )}
    </div>
  );
}

export default App;
