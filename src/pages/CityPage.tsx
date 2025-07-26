import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { auth } from '../firebaseConfig';
import { City, Tour, AppUser } from '../interfaces';
import FileUpload from '../components/FileUpload';
import ErrorMessage from '../components/ErrorMessage';
import GlobalHeader from '../components/GlobalHeader';
import './CityPage.css';

interface CityPageProps {
  user: AppUser;
}

interface ExtendedCity extends City {
  title?: string;
  subtitle?: string;
  description?: string;
  widePhotoUrl?: string;
  squarePhotoUrl?: string;
}

const CityPage: React.FC<CityPageProps> = ({ user }) => {
  const { cityId } = useParams<{ cityId: string }>();
  const [city, setCity] = useState<ExtendedCity | null>(null);
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<ExtendedCity>>({});

  useEffect(() => {
    if (cityId) {
      fetchCityData();
    }
  }, [cityId]);

  const fetchCityData = async () => {
    if (!cityId) return;

    try {
      setLoading(true);
      
      // Fetch city data
      const cityDoc = await getDoc(doc(db, 'cities', cityId));
      if (cityDoc.exists()) {
        const cityData = { id: cityDoc.id, ...cityDoc.data() } as ExtendedCity;
        setCity(cityData);
        setEditData({
          title: cityData.title || '',
          subtitle: cityData.subtitle || '',
          description: cityData.description || ''
        });

        // Fetch tours for this city
        const toursQuery = query(
          collection(db, 'tours'),
          where('city', '==', cityData.name)
        );
        const toursSnapshot = await getDocs(toursQuery);
        const toursData = toursSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        } as Tour));
        setTours(toursData);
      } else {
        setError('City not found');
      }

    } catch (err) {
      console.error('Error fetching city data:', err);
      setError('Failed to load city data');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (photoType: 'widePhotoUrl' | 'squarePhotoUrl', photoUrl: string) => {
    if (!cityId) return;

    try {
      await updateDoc(doc(db, 'cities', cityId), {
        [photoType]: photoUrl,
        updatedAt: new Date()
      });

      setCity(prev => prev ? { ...prev, [photoType]: photoUrl } : null);
    } catch (err) {
      console.error('Failed to update city photo:', err);
      setError('Failed to update city photo');
    }
  };

  const handleSaveChanges = async () => {
    if (!cityId) return;

    try {
      await updateDoc(doc(db, 'cities', cityId), {
        ...editData,
        updatedAt: new Date()
      });

      setCity(prev => prev ? { ...prev, ...editData } : null);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update city:', err);
      setError('Failed to update city information');
    }
  };

  const handleCancelEdit = () => {
    setEditData({
      title: city?.title || '',
      subtitle: city?.subtitle || '',
      description: city?.description || ''
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="city-page">
        <GlobalHeader user={user} />
        <main className="city-content">
          <div className="loading">Loading city information...</div>
        </main>
      </div>
    );
  }

  if (error || !city) {
    return (
      <div className="city-page">
        <GlobalHeader user={user} />
        <main className="city-content">
          <ErrorMessage message={error || 'City not found'} />
        </main>
      </div>
    );
  }

  return (
    <div className="city-page">
      <GlobalHeader user={user} />
      
      <main className="city-content">
        <div className="city-header">
          <div className="city-header-content">
            <div className="city-info-section">
              {isEditing ? (
                <div className="edit-form">
                  <div className="form-group">
                    <label htmlFor="cityTitle">City Title</label>
                    <input
                      id="cityTitle"
                      type="text"
                      value={editData.title || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter city title"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="citySubtitle">City Subtitle</label>
                    <input
                      id="citySubtitle"
                      type="text"
                      value={editData.subtitle || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, subtitle: e.target.value }))}
                      placeholder="Enter city subtitle"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cityDescription">City Description</label>
                    <textarea
                      id="cityDescription"
                      value={editData.description || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter city description"
                      rows={4}
                    />
                  </div>
                  <div className="edit-actions">
                    <button onClick={handleSaveChanges} className="save-button">
                      Save Changes
                    </button>
                    <button onClick={handleCancelEdit} className="cancel-button">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="city-text-info">
                  <h1 className="city-title">{city.title || city.name}</h1>
                  {city.subtitle && <h2 className="city-subtitle">{city.subtitle}</h2>}
                  {city.description && <p className="city-description">{city.description}</p>}
                  {(user.role === 'Admin' || user.role === 'Creator') && (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="edit-button"
                    >
                      Edit City Info
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="city-photos-section">
              <div className="photo-container wide-photo">
                <h3>Wide City Photo</h3>
                {city.widePhotoUrl ? (
                  <div className="photo-display">
                    <img src={city.widePhotoUrl} alt={`${city.name} wide view`} />
                    <div className="photo-overlay">
                      <FileUpload
                        userId={auth.currentUser?.uid || 'anonymous'}
                        fileType="image"
                        context="city"
                        contextId={cityId}
                        maxSizeMB={5}
                        onUploadSuccess={(url) => handlePhotoUpload('widePhotoUrl', url)}
                        onUploadError={(error) => setError(error)}
                        buttonText="Change Photo"
                        acceptedFileTypes="image/*"
                        className="photo-upload-overlay"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="add-photo-box">
                    <FileUpload
                      userId={auth.currentUser?.uid || 'anonymous'}
                      fileType="image"
                      context="city"
                      contextId={cityId}
                      maxSizeMB={5}
                      onUploadSuccess={(url) => handlePhotoUpload('widePhotoUrl', url)}
                      onUploadError={(error) => setError(error)}
                      buttonText="ADD WIDE PHOTO"
                      acceptedFileTypes="image/*"
                      className="add-photo-upload"
                    />
                  </div>
                )}
              </div>

              <div className="photo-container square-photo">
                <h3>Square City Photo</h3>
                {city.squarePhotoUrl ? (
                  <div className="photo-display">
                    <img src={city.squarePhotoUrl} alt={`${city.name} square view`} />
                    <div className="photo-overlay">
                      <FileUpload
                        userId={auth.currentUser?.uid || 'anonymous'}
                        fileType="image"
                        context="city"
                        contextId={cityId}
                        maxSizeMB={5}
                        onUploadSuccess={(url) => handlePhotoUpload('squarePhotoUrl', url)}
                        onUploadError={(error) => setError(error)}
                        buttonText="Change Photo"
                        acceptedFileTypes="image/*"
                        className="photo-upload-overlay"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="add-photo-box">
                    <FileUpload
                      userId={auth.currentUser?.uid || 'anonymous'}
                      fileType="image"
                      context="city"
                      contextId={cityId}
                      maxSizeMB={5}
                      onUploadSuccess={(url) => handlePhotoUpload('squarePhotoUrl', url)}
                      onUploadError={(error) => setError(error)}
                      buttonText="ADD SQUARE PHOTO"
                      acceptedFileTypes="image/*"
                      className="add-photo-upload"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="tours-section">
          <h2>Tours in {city.name}</h2>
          {tours.length > 0 ? (
            <div className="tours-grid">
              {tours.map((tour) => (
                <div key={tour.id} className="tour-card">
                  <div className="tour-info">
                    <h3 className="tour-title">{tour.title}</h3>
                    {tour.subTitle && <p className="tour-subtitle">{tour.subTitle}</p>}
                    {tour.description && <p className="tour-description">{tour.description}</p>}
                    {tour.distance && <p className="tour-distance">Distance: {tour.distance}</p>}
                    {tour.time && <p className="tour-time">Duration: {tour.time}</p>}
                  </div>
                  <div className="tour-actions">
                    <Link to={`/admin/tour-editor/${tour.id}`} className="edit-tour-button">
                      Edit Tour
                    </Link>
                    <Link to={`/tour/${tour.id}`} className="view-tour-button">
                      View Tour
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-tours">
              <p>No tours found for {city.name}.</p>
              <Link to="/admin/tour-creator" className="create-tour-button">
                Create First Tour
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CityPage;
