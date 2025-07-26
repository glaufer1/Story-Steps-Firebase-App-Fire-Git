import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { AppUser, SiteHeader, Menu } from '../interfaces';
import './GlobalHeader.css';

interface GlobalHeaderProps {
  user: AppUser;
}

const GlobalHeader: React.FC<GlobalHeaderProps> = ({ user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [headerConfig, setHeaderConfig] = useState<SiteHeader | null>(null);
  const [currentMenu, setCurrentMenu] = useState<Menu | null>(null);
  const [userProfile, setUserProfile] = useState<AppUser>(user);
  const navigate = useNavigate();

  useEffect(() => {
    loadHeaderConfig();
    loadUserProfile();
  }, [user]);

  const loadHeaderConfig = async () => {
    try {
      const headerDoc = await getDoc(doc(db, 'siteConfig', 'header'));
      if (headerDoc.exists()) {
        setHeaderConfig(headerDoc.data() as SiteHeader);
        // Load the appropriate menu based on user role
        await loadMenu();
      }
    } catch (error) {
      console.error('Error loading header config:', error);
    }
  };

  const loadUserProfile = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserProfile({
          ...user,
          photoURL: userData.photoURL || user.photoURL || '',
          displayName: userData.displayName || user.displayName || user.email,
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const loadMenu = async () => {
    try {
      // Determine which menu to load based on user role

             // For now, create a simple menu structure based on user role
       if (user.role === 'Admin' || user.role === 'Creator') {
         setCurrentMenu({
           id: 'back-office-menu',
           name: 'Back Office Menu',
           location: 'Header' as any,
           items: [
             { id: '1', title: 'Dashboard', url: '/admin/home', order: 1, isExternal: false, isVisible: true },
             { id: '2', title: 'Create Tour', url: '/admin/tour-creator', order: 2, isExternal: false, isVisible: true },
             { id: '3', title: 'Edit Tours', url: '/admin/tour-selector', order: 3, isExternal: false, isVisible: true },
             { id: '4', title: 'Collections', url: '/admin/collections', order: 4, isExternal: false, isVisible: true },
             { id: '5', title: 'Pages', url: '/admin/customer-pages', order: 5, isExternal: false, isVisible: true },
             { id: '6', title: 'Menus', url: '/admin/menus', order: 6, isExternal: false, isVisible: true },
             { id: '7', title: 'Users', url: '/admin/user-management', order: 7, isExternal: false, isVisible: user.role === 'Admin' },
           ],
           isActive: true,
           createdAt: new Date(),
           updatedAt: new Date()
         });
       } else {
         setCurrentMenu({
           id: 'customer-menu',
           name: 'Customer Menu',
           location: 'Header' as any,
           items: [
             { id: '1', title: 'Home', url: '/home', order: 1, isExternal: false, isVisible: true },
             { id: '2', title: 'Tours', url: '/tours', order: 2, isExternal: false, isVisible: true },
             { id: '3', title: 'Cities', url: '/cities', order: 3, isExternal: false, isVisible: true },
             { id: '4', title: 'About', url: '/about', order: 4, isExternal: false, isVisible: true },
             { id: '5', title: 'Blog', url: '/blog', order: 5, isExternal: false, isVisible: true },
           ],
           isActive: true,
           createdAt: new Date(),
           updatedAt: new Date()
         });
       }
    } catch (error) {
      console.error('Error loading menu:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="global-header">
      <div className="header-content">
        <div className="header-brand">
          <Link to="/home">
            <img 
              src={headerConfig?.logoUrl || "/logo.svg"} 
              alt={headerConfig?.logoAlt || "StorySteps"} 
              className="header-logo" 
            />
          </Link>
        </div>

        {/* Main Navigation Menu */}
        <nav className="header-nav">
          <div className="nav-desktop">
            {currentMenu?.items
              .filter(item => item.isVisible && item.url)
              .sort((a, b) => a.order - b.order)
              .map(item => (
                <Link
                  key={item.id}
                  to={item.url!}
                  className="nav-item"
                  target={item.isExternal ? '_blank' : undefined}
                  rel={item.isExternal ? 'noopener noreferrer' : undefined}
                >
                  {item.title}
                </Link>
              ))}
          </div>
          
          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            ☰
          </button>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="mobile-nav">
            {currentMenu?.items
              .filter(item => item.isVisible && item.url)
              .sort((a, b) => a.order - b.order)
              .map(item => (
                <Link
                  key={item.id}
                  to={item.url!}
                  className="mobile-nav-item"
                  target={item.isExternal ? '_blank' : undefined}
                  rel={item.isExternal ? 'noopener noreferrer' : undefined}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.title}
                </Link>
              ))}
            
            {/* Mobile User Profile Section */}
            <div className="mobile-user-section">
              <div className="mobile-user-info">
                <img 
                  src={userProfile.photoURL || '/default-avatar.png'} 
                  alt={userProfile.email || ''} 
                  className="mobile-user-avatar"
                />
                <span className="mobile-user-name">{userProfile.displayName || userProfile.email}</span>
              </div>
              <div className="mobile-user-menu">
                <Link to="/my-account" className="mobile-menu-item" onClick={() => setIsMobileMenuOpen(false)}>
                  My Account
                </Link>
                <Link to="/my-tours" className="mobile-menu-item" onClick={() => setIsMobileMenuOpen(false)}>
                  My Tours
                </Link>
                <Link to="/my-profile" className="mobile-menu-item" onClick={() => setIsMobileMenuOpen(false)}>
                  My Profile
                </Link>
                
                {(user.role === 'Admin' || user.role === 'Creator') && (
                  <Link to="/admin/home" className="mobile-menu-item" onClick={() => setIsMobileMenuOpen(false)}>
                    Back Office Home
                  </Link>
                )}
                
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleSignOut();
                  }} 
                  className="mobile-menu-item sign-out-button"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="header-user">
          <div 
            className="user-menu-trigger" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <img 
              src={userProfile.photoURL || '/default-avatar.png'} 
              alt={userProfile.email || ''} 
              className="user-avatar"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/default-avatar.png';
              }}
            />
            <span className="user-name">{userProfile.displayName || userProfile.email}</span>
          </div>

          {isMenuOpen && (
            <div className="user-menu">
              <Link to="/my-account" className="menu-item">My Account</Link>
              <Link to="/my-tours" className="menu-item">My Tours</Link>
              <Link to="/my-profile" className="menu-item">My Profile</Link>
              
              {(user.role === 'Admin' || user.role === 'Creator') && (
                <Link to="/admin/home" className="menu-item">Back Office Home</Link>
              )}
              
              <button 
                onClick={handleSignOut} 
                className="menu-item sign-out-button"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default GlobalHeader; 