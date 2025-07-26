import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { auth } from '../firebaseConfig';
import type { City } from '../interfaces';
import ErrorMessage from './ErrorMessage';
import FileUpload from './FileUpload';
import { Link } from 'react-router-dom';
import * as yup from 'yup';
import './CityManagement.css';

const citySchema = yup.object({
  name: yup.string().min(2, 'City name must be at least 2 characters').required('City name is required'),
  state: yup.string().length(2, 'State must be 2 letters').required('State is required'),
});

const CityManagement: React.FC = () => {
    const [cities, setCities] = useState<City[]>([]);
    const [newCity, setNewCity] = useState({ name: '', state: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);

    useEffect(() => {
        fetchCities();
    }, []);

    const fetchCities = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, 'cities'));
            const citiesData = querySnapshot.docs.map((doc) => ({ 
                id: doc.id, 
                ...doc.data() 
            } as City));
            setCities(citiesData);
        } catch (err) {
            setError('Failed to fetch cities.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCity = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setValidationErrors([]);
        
        try {
            await citySchema.validate(newCity, { abortEarly: false });
        } catch (validationErr) {
            if (validationErr instanceof yup.ValidationError) {
                setValidationErrors(validationErr.errors);
                return;
            }
        }
        
        try {
            const cityData = {
                name: newCity.name,
                state: newCity.state.toUpperCase(),
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            
            const docRef = await addDoc(collection(db, 'cities'), cityData);
            const newCityData: City = { 
                ...cityData, 
                id: docRef.id 
            };
            
            setCities([...cities, newCityData]);
            setNewCity({ name: '', state: '' });
            setShowAddForm(false);
            setError('');
        } catch (err) {
            setError('Failed to add city.');
            console.error(err);
        }
    };

    const handleDeleteCity = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this city?')) {
            return;
        }
        
        try {
            await deleteDoc(doc(db, 'cities', id));
            setCities(cities.filter((city) => city.id !== id));
        } catch (err) {
            setError('Failed to delete city.');
            console.error(err);
        }
    };

    const handlePhotoUpload = async (cityId: string, photoUrl: string) => {
        try {
            await updateDoc(doc(db, 'cities', cityId), {
                photoUrl,
                updatedAt: new Date()
            });
            
            setCities(cities.map(city => 
                city.id === cityId 
                    ? { ...city, photoUrl }
                    : city
            ));
        } catch (err) {
            console.error('Failed to update city photo:', err);
            setError('Failed to update city photo.');
        }
    };

    const handlePhotoUploadError = (error: string) => {
        setError(error);
    };

    if (loading) return (
        <div className="city-management">
            <div className="loading">Loading cities...</div>
        </div>
    );

    return (
        <div className="city-management">
            <div className="city-header">
                <h2>City Collections</h2>
                <button 
                    className="add-city-button"
                    onClick={() => setShowAddForm(!showAddForm)}
                >
                    {showAddForm ? 'Cancel' : '+ Add New City'}
                </button>
            </div>

            {error && <ErrorMessage message={error} />}
            {validationErrors.map((msg, idx) => <ErrorMessage key={idx} message={msg} />)}

            {/* Add City Form */}
            {showAddForm && (
                <div className="add-city-form">
                    <h3>Add New City</h3>
                    <form onSubmit={handleAddCity}>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="cityName">City Name *</label>
                                <input
                                    id="cityName"
                                    type="text"
                                    value={newCity.name}
                                    onChange={(e) => setNewCity(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Enter city name"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="cityState">State *</label>
                                <input
                                    id="cityState"
                                    type="text"
                                    value={newCity.state}
                                    onChange={(e) => setNewCity(prev => ({ ...prev, state: e.target.value }))}
                                    placeholder="CA"
                                    maxLength={2}
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="submit-button">
                                Add City
                            </button>
                            <button 
                                type="button" 
                                className="cancel-button"
                                onClick={() => {
                                    setShowAddForm(false);
                                    setNewCity({ name: '', state: '' });
                                    setValidationErrors([]);
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Cities Grid */}
            <div className="cities-grid">
                {cities.map((city) => (
                    <div key={city.id} className="city-card">
                        <div className="city-photo-section">
                            {city.photoUrl ? (
                                <div className="city-photo">
                                    <img src={city.photoUrl} alt={`${city.name}, ${city.state}`} />
                                    <div className="photo-overlay">
                                        <FileUpload
                                            userId={auth.currentUser?.uid || 'anonymous'}
                                            fileType="image"
                                            context="city"
                                            contextId={city.id}
                                            maxSizeMB={5}
                                            onUploadSuccess={(url) => handlePhotoUpload(city.id, url)}
                                            onUploadError={handlePhotoUploadError}
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
                                        contextId={city.id}
                                        maxSizeMB={5}
                                        onUploadSuccess={(url) => handlePhotoUpload(city.id, url)}
                                        onUploadError={handlePhotoUploadError}
                                        buttonText="ADD PHOTO"
                                        acceptedFileTypes="image/*"
                                        className="add-photo-upload"
                                    />
                                </div>
                            )}
                        </div>
                        
                        <div className="city-info">
                            <Link to={`/city/${city.id}`} className="city-link">
                                <h3 className="city-name">{city.name}, {city.state}</h3>
                            </Link>
                            
                            <div className="city-actions">
                                <Link to={`/city/${city.id}`} className="view-button">
                                    View City
                                </Link>
                                <button 
                                    className="delete-button"
                                    onClick={() => handleDeleteCity(city.id)}
                                    title="Delete city"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {cities.length === 0 && !loading && (
                <div className="no-cities">
                    <p>No cities found. Add your first city to get started!</p>
                </div>
            )}
        </div>
    );
};

export default CityManagement;
