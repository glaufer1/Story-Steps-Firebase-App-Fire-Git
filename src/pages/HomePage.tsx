// src/pages/HomePage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import AdminNavbar from '../components/AdminNavbar';
import { AppUser } from '../interfaces';
import './HomePage.css';

interface HomePageProps {
  user: AppUser;
}

const HomePage: React.FC<HomePageProps> = ({ user }) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="home-page">
      <AdminNavbar user={user} />
      <div className="home-content">
        <h1>Welcome to Story Steps</h1>
        <p>You are logged in as: {user.email}</p>
        <p>Role: {user.role}</p>
        
        <div className="quick-actions">
          {(user.role === 'Admin' || user.role === 'Creator') && (
            <button 
              className="action-button"
              onClick={() => navigate('/admin/tour-creator')}
            >
              Create New Tour
            </button>
          )}
          
          {user.role === 'Customer' && (
            <button 
              className="action-button"
              onClick={() => navigate('/my-tours')}
            >
              View My Tours
            </button>
          )}
          
          <button 
            className="action-button secondary"
            onClick={handleSignOut}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
