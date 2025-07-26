import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { AppUser } from '../interfaces';
import GlobalHeader from '../components/GlobalHeader';
import './CollectionsEditor.css';

interface CollectionsEditorProps {
  user: AppUser;
}

const CollectionsEditor: React.FC<CollectionsEditorProps> = ({ user }) => {
  const navigate = useNavigate();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Add confirmation before leaving page if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleNavigateBack = () => {
    if (hasUnsavedChanges) {
      const confirm = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirm) return;
    }
    navigate('/admin/home');
  };

  // Example of how to use setHasUnsavedChanges
  const handleContentChange = () => {
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    // Save changes here
    setHasUnsavedChanges(false);
  };

  return (
    <div className="collections-editor-page">
      <GlobalHeader user={user} />
      
      <main className="collections-editor-content">
        <div className="editor-header">
          <h1>Collections Editor</h1>
          <div className="editor-actions">
            <button 
              className="save-button"
              onClick={handleSave}
              disabled={!hasUnsavedChanges}
            >
              Save Changes
            </button>
            <button 
              className="back-button"
              onClick={handleNavigateBack}
            >
              Back to Back Office
            </button>
          </div>
        </div>

        <div className="collections-selector">
          <button 
            className="collection-button"
            onClick={() => navigate('city-collections')}
          >
            City Collections
          </button>
          <button 
            className="collection-button"
            onClick={() => navigate('tour-collections')}
          >
            Tour Collections
          </button>
          <button 
            className="collection-button"
            onClick={() => navigate('stop-collections')}
          >
            Stop Collections
          </button>
        </div>

        <div className="editor-content">
          <Routes>
            <Route 
              path="city-collections" 
              element={
                <div className="editor-section">
                  <h2>City Collections</h2>
                  <textarea 
                    onChange={handleContentChange}
                    placeholder="Edit city collections content..."
                  />
                </div>
              } 
            />
            <Route 
              path="tour-collections" 
              element={
                <div className="editor-section">
                  <h2>Tour Collections</h2>
                  <textarea 
                    onChange={handleContentChange}
                    placeholder="Edit tour collections content..."
                  />
                </div>
              } 
            />
            <Route 
              path="stop-collections" 
              element={
                <div className="editor-section">
                  <h2>Stop Collections</h2>
                  <textarea 
                    onChange={handleContentChange}
                    placeholder="Edit stop collections content..."
                  />
                </div>
              } 
            />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default CollectionsEditor; 