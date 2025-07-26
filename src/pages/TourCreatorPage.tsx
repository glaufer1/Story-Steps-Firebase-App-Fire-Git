import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import * as yup from 'yup';
import GlobalHeader from '../components/GlobalHeader';
import { AppUser, City } from '../interfaces';
import './TourCreatorPage.css';

interface TourCreatorPageProps {
  user: AppUser;
}

interface ExtendedCity extends City {
  state?: string;
}

const tourSchema = yup.object().shape({
  title: yup.string().required('Tour title is required'),
  subtitle: yup.string(),
  description: yup.string().required('Description is required'),
  city: yup.string().required('City is required'),
  distance: yup.string(),
  time: yup.string(),
});

const citySchema = yup.object().shape({
  name: yup.string().required('City name is required'),
  state: yup.string().length(2, 'State must be 2 letters').required('State is required'),
});

const TourCreatorPage: React.FC<TourCreatorPageProps> = ({ user }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    city: '',
    distance: '',
    time: '',
  });
  const [cities, setCities] = useState<ExtendedCity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddCity, setShowAddCity] = useState(false);
  const [newCity, setNewCity] = useState({ name: '', state: '' });
  const [cityError, setCityError] = useState('');

  // Fetch cities on component mount
  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'cities'));
      const citiesData = querySnapshot.docs.map((doc) => ({ 
        id: doc.id, 
        ...doc.data() 
      } as ExtendedCity));
      setCities(citiesData);
    } catch (err) {
      console.error('Error fetching cities:', err);
      setError('Failed to load cities');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCityChange = (value: string) => {
    if (value === 'add-new') {
      setShowAddCity(true);
      setFormData(prev => ({ ...prev, city: '' }));
    } else {
      setShowAddCity(false);
      setFormData(prev => ({ ...prev, city: value }));
    }
  };

  const handleAddCity = async () => {
    setCityError('');

    // Basic validation
    if (!newCity.name.trim() || !newCity.state.trim()) {
      setCityError('City name and state are required');
      return;
    }

    // Check user permissions
    if (user.role !== 'Admin' && user.role !== 'Creator') {
      setCityError('You do not have permission to add cities');
      return;
    }



    try {
      await citySchema.validate(newCity, { abortEarly: false });

      // Create new city in Firestore
      const cityData = {
        name: newCity.name.trim(),
        state: newCity.state.toUpperCase().trim(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      console.log('About to add city to Firestore...');
      
      // Try a simpler approach without timeout
      let cityRef;
      try {
        cityRef = await addDoc(collection(db, 'cities'), cityData);
        console.log('City added successfully with ID:', cityRef.id);
      } catch (writeErr) {
        console.error('Write error details:', writeErr);
        throw new Error(`Firestore write failed: ${writeErr instanceof Error ? writeErr.message : 'Unknown error'}`);
      }

      // Add to local state
      const newCityData: ExtendedCity = {
        id: cityRef.id,
        name: newCity.name.trim(),
        state: newCity.state.toUpperCase().trim(),
      };
      
      setCities(prevCities => [...prevCities, newCityData]);

      // Set as selected city
      const fullCityName = `${newCity.name.trim()}, ${newCity.state.toUpperCase().trim()}`;
      setFormData(prev => ({ ...prev, city: fullCityName }));
      setShowAddCity(false);
      setNewCity({ name: '', state: '' });
      
    } catch (err) {
      console.error('Error creating city:', err);
      console.error('Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        name: err instanceof Error ? err.name : 'Unknown',
        stack: err instanceof Error ? err.stack : 'No stack'
      });
      
      if (err instanceof yup.ValidationError) {
        setCityError(err.errors.join(', '));
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to add city';
        setCityError(`Failed to add city: ${errorMessage}`);
      }
    }
  };

  const handleCreateTour = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await tourSchema.validate(formData, { abortEarly: false });

      const tourRef = await addDoc(collection(db, 'tours'), {
        ...formData,
        createdAt: new Date(),
        createdBy: user.uid,
      });

      navigate(`/admin/tour-editor/${tourRef.id}`, {
        state: { showSuccess: true, message: 'Tour created successfully!' }
      });
    } catch (err) {
      console.error('Error creating tour:', err);
      if (err instanceof yup.ValidationError) {
        setError(err.errors.join(', '));
      } else {
        setError('Failed to create tour. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="tour-creator-page">
        <GlobalHeader user={user} />
        <main className="tour-creator-content">
          <div className="loading">Loading cities...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="tour-creator-page">
      <GlobalHeader user={user} />
      
      <main className="tour-creator-content">
        <div className="creator-header">
          <h1>Create a New Tour</h1>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleCreateTour} className="creator-form">
          {/* City Selection */}
          <div className="form-group">
            <label htmlFor="city">Tour City *</label>
            <select
              id="city"
              value={formData.city}
              onChange={(e) => handleCityChange(e.target.value)}
              required
            >
              <option value="">Select a city...</option>
              {cities.map((city) => (
                <option key={city.id} value={`${city.name}, ${city.state}`}>
                  {city.name}, {city.state}
                </option>
              ))}
              <option value="add-new">+ Add New City</option>
            </select>
          </div>

          {/* Add New City Form */}
          {showAddCity && (
            <div className="add-city-form">
              <h3>Add New City</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="newCityName">City Name *</label>
                  <input
                    id="newCityName"
                    type="text"
                    value={newCity.name}
                    onChange={(e) => setNewCity(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter city name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="newCityState">State *</label>
                  <input
                    id="newCityState"
                    type="text"
                    value={newCity.state}
                    onChange={(e) => setNewCity(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="CA"
                    maxLength={2}
                    required
                  />
                </div>
              </div>
              {cityError && (
                <div className="error-message">
                  {cityError}
                </div>
              )}
              <div className="form-actions">
                <button 
                  type="button" 
                  className="add-city-button"
                  onClick={handleAddCity}
                >
                  Add City
                </button>
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => {
                    setShowAddCity(false);
                    setNewCity({ name: '', state: '' });
                    setCityError('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="title">Tour Title *</label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter tour title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="subtitle">Tour Subtitle</label>
            <input
              id="subtitle"
              type="text"
              value={formData.subtitle}
              onChange={(e) => handleInputChange('subtitle', e.target.value)}
              placeholder="Enter tour subtitle (optional)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Tour Description *</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter tour description"
              rows={6}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="distance">Tour Distance</label>
            <input
              id="distance"
              type="text"
              value={formData.distance}
              onChange={(e) => handleInputChange('distance', e.target.value)}
              placeholder="Enter tour distance (optional)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="time">Tour Time</label>
            <input
              id="time"
              type="text"
              value={formData.time}
              onChange={(e) => handleInputChange('time', e.target.value)}
              placeholder="Enter tour duration (optional)"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="create-button">
              Create Tour
            </button>
            <button 
              type="button" 
              className="cancel-button"
              onClick={() => navigate('/admin/home')}
            >
              Cancel
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default TourCreatorPage;
