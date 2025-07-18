import React, { useState, useEffect } from 'react';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { GoogleMap, useJsApiLoader, Marker, Polyline } from '@react-google-maps/api';
import './TourCreator.css';
import type { Tour } from './interfaces';
import { db } from './firebaseConfig';

interface TourCreatorProps {
  tourToEdit: Tour | null;
  onFinishEditing: () => void;
}

const containerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: 40.7128, // Centered on New York City for a better default
  lng: -74.0060
};

const polylineOptions = {
  strokeColor: '#FF0000',
  strokeOpacity: 0.8,
  strokeWeight: 2,
  clickable: false,
  draggable: false,
  editable: false,
  visible: true,
  zIndex: 1
};

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const TourCreator: React.FC<TourCreatorProps> = ({ tourToEdit, onFinishEditing }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY
  });

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [markers, setMarkers] = useState<google.maps.LatLngLiteral[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (tourToEdit) {
      setIsEditing(true);
      setTitle(tourToEdit.title);
      setDescription(tourToEdit.description);
      setPrice(tourToEdit.price.toString());
      setMarkers(tourToEdit.stops || []);
    } else {
      setIsEditing(false);
      // Clear form when not editing
      setTitle('');
      setDescription('');
      setPrice('');
      setMarkers([]);
    }
  }, [tourToEdit]);

  const onMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setMarkers(current => [...current, { lat: e.latLng.lat(), lng: e.latLng.lng() }]);
    }
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');

    if (!title || !description || !price || markers.length === 0) {
      setError('Please fill in all fields and add at least one stop to the map.');
      return;
    }

    const tourData = {
      title,
      description,
      price: parseFloat(price),
      stops: markers
    };

    try {
      if (isEditing && tourToEdit) {
        // Update existing tour
        const tourRef = doc(db, "tours", tourToEdit.id);
        await updateDoc(tourRef, tourData);
        setSuccess('Tour updated successfully!');
        onFinishEditing(); // Clear the form and exit editing mode
      } else {
        // Create new tour
        await addDoc(collection(db, 'tours'), tourData);
        setSuccess('Tour created successfully!');
        // Clear the form fields
        setTitle('');
        setDescription('');
        setPrice('');
        setMarkers([]);
      }
    } catch (e) {
      setError('An error occurred: ' + e);
    }
  };
  
  const handleCancel = () => {
    onFinishEditing();
  }
  
  if (!GOOGLE_MAPS_API_KEY) {
    return <div className="error-message">Google Maps API key is not configured.</div>;
  }

  return (
    <div className="tour-creator-container">
      <h2>{isEditing ? 'Edit Tour' : 'Create a New Tour'}</h2>
      <input
        type="text"
        placeholder="Tour Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Tour Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="number"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={10}
          onClick={onMapClick}
        >
          {markers.map((marker, index) => (
            <Marker key={index} position={marker} />
          ))}

          {markers.length > 1 && (
            <Polyline
              path={markers}
              options={polylineOptions}
            />
          )}
        </GoogleMap>
      ) : <div>Loading Map...</div>}

      <div className="actions">
        <button onClick={handleSave}>{isEditing ? 'Update Tour' : 'Create Tour'}</button>
        {isEditing && <button onClick={handleCancel} className="cancel">Cancel Edit</button>}
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
  );
};

export default TourCreator;
