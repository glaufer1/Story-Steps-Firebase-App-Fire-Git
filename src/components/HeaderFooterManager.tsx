import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { SiteHeader, SiteFooter, Menu, MenuLocation } from '../interfaces';
import FileUpload from './FileUpload';
import './HeaderFooterManager.css';

interface HeaderFooterManagerProps {
  user: any;
  onBack: () => void;
}

const HeaderFooterManager: React.FC<HeaderFooterManagerProps> = ({ user, onBack }) => {
  const [headerConfig, setHeaderConfig] = useState<SiteHeader>({
    id: 'site-header',
    logoUrl: '',
    logoAlt: 'StorySteps Logo',
    menuId: '',
    isLocked: true,
    mobileBreakpoint: 768,
    styles: {
      backgroundColor: '#ffffff',
      textColor: '#000000',
      logoWidth: '150px',
      logoHeight: '50px',
      padding: '1rem'
    }
  });

  const [footerConfig, setFooterConfig] = useState<SiteFooter>({
    id: 'site-footer',
    menuId: '',
    copyrightText: '© 2024 StorySteps. All rights reserved.',
    socialLinks: [],
    isLocked: false,
    styles: {
      backgroundColor: '#f5f5f5',
      textColor: '#333333',
      padding: '2rem'
    }
  });

  // Separate states for different menu types
  const [customerMenuId, setCustomerMenuId] = useState('');
  const [backOfficeMenuId, setBackOfficeMenuId] = useState('');

  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Load existing configuration
  useEffect(() => {
    loadConfiguration();
    loadMenus();
  }, []);

  const loadConfiguration = async () => {
    try {
      const headerDoc = await getDoc(doc(db, 'siteConfig', 'header'));
      const footerDoc = await getDoc(doc(db, 'siteConfig', 'footer'));

      if (headerDoc.exists()) {
        const headerData = headerDoc.data() as SiteHeader;
        setHeaderConfig(headerData);
        // Set the menu selector values
        setCustomerMenuId(headerData.menuId || '');
        setBackOfficeMenuId(headerData.menuId || '');
      }
      if (footerDoc.exists()) {
        const footerData = footerDoc.data() as SiteFooter;
        setFooterConfig(footerData);
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
      setMessage('Error loading configuration');
    } finally {
      setLoading(false);
    }
  };

  const loadMenus = async () => {
    try {
      // For now, we'll use a simple approach - you can enhance this later
      // to load actual menus from Firestore
      const mockMenus: Menu[] = [
        {
          id: 'customer-menu',
          name: 'Customer Menu',
          location: MenuLocation.Header,
          items: [],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'back-office-menu',
          name: 'Back Office Menu',
          location: MenuLocation.Header,
          items: [],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'footer-menu',
          name: 'Footer Menu',
          location: MenuLocation.Footer,
          items: [],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      setMenus(mockMenus);
    } catch (error) {
      console.error('Error loading menus:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      // Update header config with selected menu
      const updatedHeaderConfig = {
        ...headerConfig,
        menuId: customerMenuId || backOfficeMenuId, // Use whichever is selected
        updatedAt: new Date().toISOString()
      };

      // Update footer config with current timestamp
      const updatedFooterConfig = {
        ...footerConfig,
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'siteConfig', 'header'), updatedHeaderConfig);
      await setDoc(doc(db, 'siteConfig', 'footer'), updatedFooterConfig);
      
      // Update local state
      setHeaderConfig(updatedHeaderConfig);
      setFooterConfig(updatedFooterConfig);
      
      setMessage('Header and Footer configuration saved successfully!');
      
      // Clear the message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving configuration:', error);
      setMessage('Error saving configuration');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    // For now, just show a preview message
    setMessage('Preview functionality will be implemented in the next update');
    setTimeout(() => setMessage(''), 3000);
  };

  const updateSocialLink = (index: number, field: 'platform' | 'url', value: string) => {
    const newSocialLinks = [...(footerConfig.socialLinks || [])];
    if (!newSocialLinks[index]) {
      newSocialLinks[index] = { platform: '', url: '' };
    }
    newSocialLinks[index] = { ...newSocialLinks[index], [field]: value };
    
    setFooterConfig(prev => ({
      ...prev,
      socialLinks: newSocialLinks
    }));
  };

  if (loading) {
    return <div className="loading">Loading configuration...</div>;
  }

  return (
    <div className="header-footer-manager">
      <div className="section-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Main
        </button>
        <h2>Header & Footer Management</h2>
      </div>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="header-footer-editor">
        <div className="editor-section">
          <h3>Header Configuration</h3>
          
          <div className="form-group">
            <label>Logo Upload:</label>
            {headerConfig.logoUrl && (
              <div className="current-logo">
                <img 
                  src={headerConfig.logoUrl} 
                  alt="Current Logo" 
                  style={{ maxWidth: '200px', maxHeight: '100px', marginBottom: '10px' }}
                />
                <p style={{ fontSize: '0.8rem', color: '#666' }}>Current Logo</p>
              </div>
            )}
            <FileUpload
              userId={user.uid}
              fileType="image"
              context="header"
              contextId="logo"
              onUploadSuccess={(url) => {
                setHeaderConfig(prev => ({ ...prev, logoUrl: url }));
                setMessage('Logo uploaded successfully!');
                setTimeout(() => setMessage(''), 3000);
              }}
              onUploadError={(error) => {
                console.error('Error uploading logo:', error);
                setMessage('Error uploading logo: ' + error);
              }}
              buttonText="Upload Logo"
            />
          </div>

          <div className="form-group">
            <label>Customer Menu Selector:</label>
            <select
              value={customerMenuId}
              onChange={(e) => setCustomerMenuId(e.target.value)}
            >
              <option value="">Select a customer menu...</option>
              {menus
                .filter(menu => menu.location === MenuLocation.Header && menu.name.includes('Customer'))
                .map(menu => (
                  <option key={menu.id} value={menu.id}>
                    {menu.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="form-group">
            <label>Back Office Menu Selector:</label>
            <select
              value={backOfficeMenuId}
              onChange={(e) => setBackOfficeMenuId(e.target.value)}
            >
              <option value="">Select a back office menu...</option>
              {menus
                .filter(menu => menu.location === MenuLocation.Header && menu.name.includes('Back Office'))
                .map(menu => (
                  <option key={menu.id} value={menu.id}>
                    {menu.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={headerConfig.isLocked}
                onChange={(e) => setHeaderConfig(prev => ({ ...prev, isLocked: e.target.checked }))}
              />
              Lock right-side login/user area
            </label>
          </div>

          <div className="form-group">
            <label>Mobile Breakpoint:</label>
            <input
              type="number"
              value={headerConfig.mobileBreakpoint}
              onChange={(e) => setHeaderConfig(prev => ({ ...prev, mobileBreakpoint: parseInt(e.target.value) || 768 }))}
              placeholder="768"
            />
            <small>px (collapse to hamburger below this width)</small>
          </div>
        </div>

        <div className="editor-section">
          <h3>Footer Configuration</h3>
          
          <div className="form-group">
            <label>Footer Menu:</label>
            <select
              value={footerConfig.menuId || ''}
              onChange={(e) => setFooterConfig(prev => ({ ...prev, menuId: e.target.value }))}
            >
              <option value="">Select a footer menu...</option>
              {menus
                .filter(menu => menu.location === MenuLocation.Footer)
                .map(menu => (
                  <option key={menu.id} value={menu.id}>
                    {menu.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="form-group">
            <label>Copyright Text:</label>
            <input
              type="text"
              value={footerConfig.copyrightText || ''}
              onChange={(e) => setFooterConfig(prev => ({ ...prev, copyrightText: e.target.value }))}
              placeholder="© 2024 StorySteps. All rights reserved."
            />
          </div>

          <div className="form-group">
            <label>Social Media Links:</label>
            <div className="social-links">
              {['Facebook', 'Twitter', 'Instagram'].map((platform, index) => (
                <div key={platform} className="social-link-input">
                  <input
                    type="url"
                    placeholder={`${platform} URL`}
                    value={footerConfig.socialLinks?.[index]?.url || ''}
                    onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="editor-actions">
          <button 
            className="save-button" 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Header/Footer'}
          </button>
          <button 
            className="preview-button" 
            onClick={handlePreview}
          >
            Preview Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeaderFooterManager; 