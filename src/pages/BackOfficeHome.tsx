import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebaseConfig';
import { AppUser } from '../interfaces';
import GlobalHeader from '../components/GlobalHeader';
import CustomerPagesManager from '../components/CustomerPagesManager';
import MenuManager from '../components/MenuManager';
import HeaderFooterManager from '../components/HeaderFooterManager';
import './BackOfficeHome.css';

interface BackOfficeHomeProps {
  user: AppUser;
}

const BackOfficeHome: React.FC<BackOfficeHomeProps> = ({ user }) => {
  const navigate = useNavigate();
  const [headerImage, setHeaderImage] = useState<string>('/default-header.jpg');
  const [activeSection, setActiveSection] = useState<'main' | 'customer-pages' | 'menus' | 'header-footer'>('main');
  const [uploading, setUploading] = useState(false);

  // Only allow admin and creator roles
  if (user.role !== 'Admin' && user.role !== 'Creator') {
    navigate('/home');
    return null;
  }

  // Load header image on component mount
  useEffect(() => {
    loadHeaderImage();
  }, []);

  const loadHeaderImage = async () => {
    try {
      const headerDoc = await getDoc(doc(db, 'siteConfig', 'header'));
      if (headerDoc.exists()) {
        const data = headerDoc.data();
        if (data.headerImageUrl) {
          setHeaderImage(data.headerImageUrl);
        }
      }
    } catch (error) {
      console.error('Error loading header image:', error);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploading(true);
      try {
        // Upload to Firebase Storage with correct path structure
        const timestamp = Date.now();
        const fileName = `header-${timestamp}.${file.name.split('.').pop()}`;
        const imageRef = ref(storage, `images/headers/main/${fileName}`);
        const snapshot = await uploadBytes(imageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        // Save to Firestore
        await setDoc(doc(db, 'siteConfig', 'header'), {
          headerImageUrl: downloadURL,
          updatedAt: new Date().toISOString()
        }, { merge: true });

        setHeaderImage(downloadURL);
      } catch (error) {
        console.error('Error uploading header image:', error);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleDeleteHeaderImage = async () => {
    try {
      // Remove from Firestore
      await setDoc(doc(db, 'siteConfig', 'header'), {
        headerImageUrl: null,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setHeaderImage('/default-header.jpg');
    } catch (error) {
      console.error('Error deleting header image:', error);
    }
  };

  const renderMainContent = () => (
    <>
      <div 
        className="header-image-container"
        style={{ backgroundImage: `url(${headerImage})` }}
      >
        {user.role === 'Admin' && (
          <div className="header-image-controls">
            {headerImage === '/default-header.jpg' ? (
              <label className="image-upload-button">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                  disabled={uploading}
                />
                {uploading ? 'Uploading...' : 'Change Header Image'}
              </label>
            ) : (
              <button 
                className="delete-image-button"
                onClick={handleDeleteHeaderImage}
                title="Delete header image"
              >
                🗑️
              </button>
            )}
          </div>
        )}
        <div className="header-text">
          <h1 className="header-title-line-1">Welcome to StorySteps</h1>
          <h1 className="header-title-line-2">Back Office Homepage</h1>
        </div>
      </div>

      <div className="action-buttons">
        <button
          className="action-button"
          onClick={() => navigate('/admin/tour-creator')}
        >
          Create a New Tour
        </button>

        <button
          className="action-button"
          onClick={() => navigate('/admin/tour-selector')}
        >
          Edit an Existing Tour
        </button>

        <button
          className="action-button"
          onClick={() => navigate('/admin/collections')}
        >
          Edit a Collections Page
        </button>
      </div>

      {/* Second Row of Action Buttons */}
      <div className="action-buttons second-row">
        <button
          className="action-button"
          onClick={() => navigate('/admin/tour-stops')}
        >
          Tour Stops
        </button>

        <button
          className="action-button"
          onClick={() => navigate('/admin/tour-stop-editor')}
        >
          Tour Stop Editor
        </button>

        <button
          className="action-button"
          onClick={() => navigate('/admin/create-backend-page')}
        >
          Create New Backend Page
        </button>
      </div>

      {/* Customer Facing Pages Panel - Only visible to admins and creators */}
      <div className="customer-pages-panel">
        <div className="panel-header">
          <h2>Customer Facing Pages</h2>
          <button
            className="manage-pages-button"
            onClick={() => setActiveSection('customer-pages')}
          >
            Manage Pages
          </button>
        </div>
        <p>Create and manage customer-facing pages for your website.</p>
      </div>

      {/* Header/Footer Management Panel */}
      <div className="header-footer-panel">
        <div className="panel-header">
          <h2>Header & Footer Management</h2>
          <button
            className="manage-header-footer-button"
            onClick={() => setActiveSection('header-footer')}
          >
            Manage Header/Footer
          </button>
        </div>
        <p>Configure your site's header and footer layout.</p>
      </div>

      {/* Menu Management Panel */}
      <div className="menu-management-panel">
        <div className="panel-header">
          <h2>Menu Management</h2>
          <button
            className="manage-menus-button"
            onClick={() => setActiveSection('menus')}
          >
            Manage Menus
          </button>
        </div>
        <p>Create and manage navigation menus for your website.</p>
      </div>
    </>
  );

  const renderCustomerPages = () => (
    <div className="section-content">
      <div className="section-header">
        <button
          className="back-to-main"
          onClick={() => setActiveSection('main')}
        >
          ← Back to Main
        </button>
        <h2>Customer Facing Pages</h2>
      </div>
      <CustomerPagesManager user={user} />
    </div>
  );

  const renderMenuManagement = () => (
    <div className="section-content">
      <div className="section-header">
        <button
          className="back-to-main"
          onClick={() => setActiveSection('main')}
        >
          ← Back to Main
        </button>
        <h2>Menu Management</h2>
      </div>
      <MenuManager user={user} />
    </div>
  );

  const renderHeaderFooter = () => (
    <HeaderFooterManager 
      user={user} 
      onBack={() => setActiveSection('main')} 
    />
  );

  return (
    <div className="back-office-page">
      <GlobalHeader user={user} />
      
      <main className="back-office-content">
        {activeSection === 'main' && renderMainContent()}
        {activeSection === 'customer-pages' && renderCustomerPages()}
        {activeSection === 'menus' && renderMenuManagement()}
        {activeSection === 'header-footer' && renderHeaderFooter()}
      </main>
    </div>
  );
};

export default BackOfficeHome; 