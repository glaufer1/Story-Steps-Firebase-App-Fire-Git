import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebaseConfig';
import { AppUser } from './interfaces';
import AuthWrapper from './components/AuthWrapper';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

// Lazy load components for better performance
const LazyRoutes = {
  LandingPage: React.lazy(() => import('./pages/LandingPage')),
  Login: React.lazy(() => import('./Login')),
  HomePage: React.lazy(() => import('./pages/HomePage')),
  ToursPage: React.lazy(() => import('./pages/ToursPage')),
  CityToursPage: React.lazy(() => import('./pages/CityToursPage')),
  AboutUsPage: React.lazy(() => import('./pages/AboutUsPage')),
  BlogPage: React.lazy(() => import('./pages/BlogPage')),
  MyToursPage: React.lazy(() => import('./pages/MyToursPage')),
  MyProfilePage: React.lazy(() => import('./pages/MyProfilePage')),
  MyAccountPage: React.lazy(() => import('./pages/MyAccountPage')),
  BackOfficeHome: React.lazy(() => import('./pages/BackOfficeHome')),
  TourCreatorPage: React.lazy(() => import('./pages/TourCreatorPage')),
  TourSelectorPage: React.lazy(() => import('./pages/EditTourListPage')),
  TourEditorPage: React.lazy(() => import('./pages/TourEditorPage')),
  TourInformationEditor: React.lazy(() => import('./pages/TourInformationEditor')),
  CollectionsEditor: React.lazy(() => import('./pages/CollectionsEditor')),
  CityManagementPage: React.lazy(() => import('./pages/CityManagementPage')),
  UserManagementPage: React.lazy(() => import('./pages/UserManagementPage')),
  CityPage: React.lazy(() => import('./pages/CityPage')),
  // New Customer Facing Pages
  PublicHomePage: React.lazy(() => import('./pages/PublicHomePage')),
  CustomerPageEditor: React.lazy(() => import('./components/CustomerPageEditor')),
};

function App() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        try {
          // Force token refresh to get latest custom claims
          await firebaseUser.getIdToken(true);
          
          // Get custom claims to determine user role
          const token = await firebaseUser.getIdTokenResult();
          const role = token.claims?.role || 'Customer';
          
          console.log('🔍 User role from claims:', role);
          console.log('🔍 All claims:', token.claims);
          console.log('🔍 User email:', firebaseUser.email);
          console.log('🔍 User UID:', firebaseUser.uid);
          
          const appUser: AppUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: role as 'Admin' | 'Creator' | 'Customer',
            displayName: firebaseUser.displayName || undefined,
            photoURL: firebaseUser.photoURL || undefined,
          };
          
          console.log('🔍 App user object:', appUser);
          setUser(appUser);
        } catch (error) {
          console.error('❌ Error getting user claims:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="content-wrap">
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<AuthWrapper user={user} />} />
            <Route path="/landing" element={<LazyRoutes.LandingPage />} />
            <Route path="/login" element={<LazyRoutes.Login user={user} />} />

            {/* Public Customer Facing Pages */}
            <Route path="/page/:slug" element={<LazyRoutes.PublicHomePage />} />

            {/* Protected Application Routes */}
            <Route element={<ProtectedRoute user={user} />}>
              <Route 
                path="/home" 
                element={
                  user ? <LazyRoutes.HomePage user={user} /> : <Navigate to="/login" />
                } 
              />
              <Route path="/tours" element={<LazyRoutes.ToursPage />} />
              <Route path="/cities" element={<LazyRoutes.CityToursPage />} />
              <Route 
                path="/city/:cityId" 
                element={
                  user ? <LazyRoutes.CityPage user={user} /> : <Navigate to="/login" />
                }
              />
              <Route path="/about" element={<LazyRoutes.AboutUsPage />} />
              <Route path="/blog" element={<LazyRoutes.BlogPage />} />
              <Route 
                path="/my-tours" 
                element={
                  user ? <LazyRoutes.MyToursPage user={user} /> : <Navigate to="/login" />
                }
              />
              <Route 
                path="/my-profile" 
                element={
                  user ? <LazyRoutes.MyProfilePage user={user} /> : <Navigate to="/login" />
                }
              />
              <Route 
                path="/my-account" 
                element={
                  user ? <LazyRoutes.MyAccountPage user={user} /> : <Navigate to="/login" />
                }
              />

              {/* Admin and Creator Routes */}
              {user && (user.role === 'Admin' || user.role === 'Creator') && (
                <Route path="/admin">
                  <Route 
                    index 
                    element={<Navigate to="/admin/home" replace />} 
                  />
                  <Route 
                    path="home" 
                    element={<LazyRoutes.BackOfficeHome user={user} />} 
                  />
                  <Route 
                    path="tour-creator" 
                    element={<LazyRoutes.TourCreatorPage user={user} />} 
                  />
                  <Route 
                    path="tour-selector" 
                    element={<LazyRoutes.TourSelectorPage />} 
                  />
                  <Route 
                    path="tour-editor/:tourId" 
                    element={<LazyRoutes.TourEditorPage />} 
                  />
                  <Route 
                    path="tour-editor/:tourId/info" 
                    element={<LazyRoutes.TourInformationEditor />} 
                  />
                  <Route 
                    path="collections" 
                    element={<LazyRoutes.CollectionsEditor user={user} />} 
                  />
                  <Route 
                    path="city-management" 
                    element={<LazyRoutes.CityManagementPage />} 
                  />
                  <Route 
                    path="user-management" 
                    element={<LazyRoutes.UserManagementPage user={user} />} 
                  />
                  {/* New Customer Facing Pages Management */}
                  <Route 
                    path="customer-pages" 
                    element={<Navigate to="/admin/home" replace />} 
                  />
                  <Route 
                    path="customer-page-editor/:pageId" 
                    element={<LazyRoutes.CustomerPageEditor user={user} />} 
                  />
                </Route>
              )}

              {/* Admin-only Routes */}
              {user && user.role === 'Admin' && (
                <Route path="/admin">
                  <Route 
                    path="user-management" 
                    element={<LazyRoutes.UserManagementPage user={user} />} 
                  />
                </Route>
              )}
            </Route>

            {/* Catch-all route for 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
