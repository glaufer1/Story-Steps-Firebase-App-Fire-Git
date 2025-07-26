import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import GlobalHeader from '../components/GlobalHeader';
import { AppUser } from '../interfaces';
import './EditTourPage.css';

interface EditTourPageProps {
  user: AppUser;
}

interface TourData {
  id?: string;
  title: string;
  subtitle?: string;
  description: string;
  city: string;
  distance?: string;
  time?: string;
  updatedAt?: Date;
  createdAt?: Date;
  createdBy?: string;
  // Additional fields to be added:
  // mapData: MapData;
  // stops: TourStop[];
  // additionalDetails: AdditionalDetails;
}

const EditTourPage: React.FC<EditTourPageProps> = ({ user }) => {
  const { tourId } = useParams<{ tourId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [tour, setTour] = useState<TourData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [activeTab, setActiveTab] = useState('basic'); // basic, stops, details, map
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    // Show success message from navigation state
    if (location.state?.showSuccess) {
      setSuccess(location.state.message);
      // Clear the success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
      // Clean up the location state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    const fetchTour = async () => {
      if (!tourId) return;

      try {
        const tourDoc = await getDoc(doc(db, 'tours', tourId));
        if (tourDoc.exists()) {
          setTour({ ...tourDoc.data() as TourData, id: tourDoc.id });
        } else {
          setError('Tour not found');
        }
      } catch (err) {
        console.error('Error fetching tour:', err);
        setError('Failed to load tour data');
      } finally {
        setLoading(false);
      }
    };

    fetchTour();
  }, [tourId]);

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

  const handleInputChange = (field: keyof TourData, value: string) => {
    if (!tour) return;
    setTour({ ...tour, [field]: value });
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!tour || !tourId) return;

    try {
      const { id, ...tourData } = tour;
      await updateDoc(doc(db, 'tours', tourId), {
        ...tourData,
        updatedAt: new Date(),
      });
      setHasUnsavedChanges(false);
      setSuccess('Tour updated successfully!');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Error updating tour:', err);
      setError('Failed to save tour changes');
    }
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      const confirm = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirm) return;
    }
    navigate('/admin/tour-selector');
  };

  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (!tour) return <div className="error-message">Tour not found</div>;

  return (
    <div className="edit-tour-page">
      <GlobalHeader user={user} />
      
      <main className="edit-tour-content">
        <div className="edit-tour-header">
          <h1>Edit Tour</h1>
          <div className="header-actions">
            <button 
              className="save-button"
              onClick={handleSave}
              disabled={!hasUnsavedChanges}
            >
              Save Changes
            </button>
            <button 
              className="back-button"
              onClick={handleBack}
            >
              Back to Tour List
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

        <div className="edit-tour-tabs">
          <button 
            className={`tab-button ${activeTab === 'basic' ? 'active' : ''}`}
            onClick={() => setActiveTab('basic')}
          >
            Basic Information
          </button>
          <button 
            className={`tab-button ${activeTab === 'stops' ? 'active' : ''}`}
            onClick={() => setActiveTab('stops')}
          >
            Tour Stops
          </button>
          <button 
            className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Additional Details
          </button>
          <button 
            className={`tab-button ${activeTab === 'map' ? 'active' : ''}`}
            onClick={() => setActiveTab('map')}
          >
            Map Settings
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'basic' && (
            <div className="basic-info-form">
              <div className="form-group">
                <label htmlFor="title">Tour Title</label>
                <input
                  id="title"
                  type="text"
                  value={tour.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter tour title"
                />
              </div>

              <div className="form-group">
                <label htmlFor="subtitle">Tour Subtitle</label>
                <input
                  id="subtitle"
                  type="text"
                  value={tour.subtitle || ''}
                  onChange={(e) => handleInputChange('subtitle', e.target.value)}
                  placeholder="Enter tour subtitle (optional)"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Tour Description</label>
                <textarea
                  id="description"
                  value={tour.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter tour description"
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label htmlFor="city">Tour City</label>
                <input
                  id="city"
                  type="text"
                  value={tour.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Enter tour city"
                />
              </div>

              <div className="form-group">
                <label htmlFor="distance">Tour Distance</label>
                <input
                  id="distance"
                  type="text"
                  value={tour.distance || ''}
                  onChange={(e) => handleInputChange('distance', e.target.value)}
                  placeholder="Enter tour distance (optional)"
                />
              </div>

              <div className="form-group">
                <label htmlFor="time">Tour Time</label>
                <input
                  id="time"
                  type="text"
                  value={tour.time || ''}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  placeholder="Enter tour duration (optional)"
                />
              </div>
            </div>
          )}

          {activeTab === 'stops' && (
            <div className="tour-stops-section">
              <h2>Tour Stops</h2>
              <p>Tour stops section coming soon...</p>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="additional-details-section">
              <h2>Additional Details</h2>
              <p>Additional details section coming soon...</p>
            </div>
          )}

          {activeTab === 'map' && (
            <div className="map-settings-section">
              <h2>Map Settings</h2>
              <p>Map settings section coming soon...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EditTourPage; 