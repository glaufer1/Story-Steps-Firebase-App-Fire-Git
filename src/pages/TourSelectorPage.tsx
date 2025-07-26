import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { AppUser } from '../interfaces';
import GlobalHeader from '../components/GlobalHeader';
import './TourSelectorPage.css';

interface TourSelectorPageProps {
  user: AppUser;
}

interface City {
  id: string;
  name: string;
}

interface Tour {
  id: string;
  title: string;
  city: string;
}

const TourSelectorPage: React.FC<TourSelectorPageProps> = ({ user }) => {
  const navigate = useNavigate();
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch cities on component mount
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const citiesSnapshot = await getDocs(collection(db, 'cities'));
        const citiesData = citiesSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
        }));
        setCities(citiesData.sort((a, b) => a.name.localeCompare(b.name)));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching cities:', error);
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  // Fetch tours when a city is selected
  useEffect(() => {
    const fetchTours = async () => {
      if (!selectedCity) {
        setTours([]);
        return;
      }

      try {
        setLoading(true);
        const toursQuery = query(
          collection(db, 'tours'),
          where('city', '==', selectedCity)
        );
        const toursSnapshot = await getDocs(toursQuery);
        const toursData = toursSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Tour[];
        setTours(toursData.sort((a, b) => a.title.localeCompare(b.title)));
      } catch (error) {
        console.error('Error fetching tours:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, [selectedCity]);

  return (
    <div className="tour-selector-page">
      <GlobalHeader user={user} />
      
      <main className="tour-selector-content">
        <div className="selector-header">
          <h1>Select a Tour to Edit</h1>
          <button 
            className="back-button"
            onClick={() => navigate('/admin/home')}
          >
            Back to Back Office
          </button>
        </div>

        <div className="selector-container">
          <div className="city-selector">
            <label htmlFor="city-select">Select a City:</label>
            <select
              id="city-select"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              <option value="">Choose a city...</option>
              {cities.map(city => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <div className="tours-list">
              {selectedCity && tours.length === 0 ? (
                <p>No tours found in this city.</p>
              ) : (
                tours.map(tour => (
                  <div 
                    key={tour.id} 
                    className="tour-item"
                    onClick={() => navigate(`/admin/tour-editor/${tour.id}`)}
                  >
                    <h3>{tour.title}</h3>
                    <button className="edit-button">Edit Tour</button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TourSelectorPage; 