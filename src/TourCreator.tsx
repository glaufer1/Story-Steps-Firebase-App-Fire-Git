import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { db } from './firebaseConfig';
import type { Tour, Stop } from './interfaces';
import './TourCreator.css';
import ErrorMessage from './components/ErrorMessage';
import * as yup from 'yup';

const stopSchema = yup.object({
  id: yup.string().required(),
  name: yup.string().min(2, 'Stop name is too short').required('Stop name is required'),
  location: yup.object({
    latitude: yup.number().required('Latitude required').min(-90).max(90),
    longitude: yup.number().required('Longitude required').min(-180).max(180),
  }),
});

const tourSchema = yup.object({
  title: yup.string().min(2, 'Tour title is too short').required('Tour title is required'),
  description: yup.string().min(10, 'Description is too short').required('Description is required'),
  price: yup.number().min(0, 'Price must be 0 or greater').required('Price is required'),
  stops: yup.array().of(stopSchema).min(1, 'At least one stop is required'),
});

const TourCreator = () => {
  const { tourId } = useParams<{ tourId: string }>();
  const navigate = useNavigate();

  const [tourTitle, setTourTitle] = useState('');
  const [tourDescription, setTourDescription] = useState('');
  const [tourPrice, setTourPrice] = useState(0);
  const [stops, setStops] = useState<Stop[]>([]);
  const [newStopName, setNewStopName] = useState('');
  const [newStopLat, setNewStopLat] = useState('');
  const [newStopLng, setNewStopLng] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (tourId) {
      setIsEditing(true);
      const fetchTour = async () => {
        const tourDoc = await getDoc(doc(db, 'tours', tourId));
        if (tourDoc.exists()) {
          const tourData = tourDoc.data() as Tour;
          setTourTitle(tourData.title);
          setTourDescription(tourData.description);
          setTourPrice(tourData.price || 0);
          setStops(tourData.stops || []);
        }
      };
      fetchTour();
    }
  }, [tourId]);

  const handleAddStop = () => {
    if (newStopName && newStopLat && newStopLng) {
      const newStop: Stop = {
        id: `stop-${Date.now()}`,
        name: newStopName,
        location: {
          latitude: parseFloat(newStopLat),
          longitude: parseFloat(newStopLng),
        },
      };
      setStops([...stops, newStop]);
      setNewStopName('');
      setNewStopLat('');
      setNewStopLng('');
    }
  };

  const handleSaveTour = async () => {
    setError('');
    setValidationErrors([]);
    const tourData = {
      title: tourTitle,
      description: tourDescription,
      price: tourPrice,
      stops: stops,
    };
    try {
      await tourSchema.validate(tourData, { abortEarly: false });
    } catch (validationErr) {
      if (validationErr instanceof yup.ValidationError) {
        setValidationErrors(validationErr.errors);
        return;
      }
    }
    try {
      if (isEditing && tourId) {
        await updateDoc(doc(db, 'tours', tourId), tourData);
        navigate(`/tours/${tourId}`);
      } else {
        const newTourRef = await addDoc(collection(db, 'tours'), tourData);
        navigate(`/tours/${newTourRef.id}`);
      }
    } catch (err) {
      setError('Failed to save tour. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="tour-creator">
      <h2>{isEditing ? 'Edit Tour' : 'Create a New Tour'}</h2>
      <input
        type="text"
        placeholder="Tour Title"
        value={tourTitle}
        onChange={(e) => setTourTitle(e.target.value)}
      />
      <textarea
        placeholder="Tour Description"
        value={tourDescription}
        onChange={(e) => setTourDescription(e.target.value)}
      />
      <input
        type="number"
        placeholder="Price"
        value={tourPrice}
        onChange={(e) => setTourPrice(parseFloat(e.target.value))}
      />

      <div className="stops-section">
        <h3>Stops</h3>
        {stops.map((stop, index) => (
          <div key={index} className="stop-item">
            {stop.name} ({stop.location.latitude}, {stop.location.longitude})
          </div>
        ))}
        <div className="add-stop-form">
          <input
            type="text"
            placeholder="Stop Name"
            value={newStopName}
            onChange={(e) => setNewStopName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Latitude"
            value={newStopLat}
            onChange={(e) => setNewStopLat(e.target.value)}
          />
          <input
            type="text"
            placeholder="Longitude"
            value={newStopLng}
            onChange={(e) => setNewStopLng(e.target.value)}
          />
          <button onClick={handleAddStop}>Add Stop</button>
        </div>
      </div>

      <button onClick={handleSaveTour}>
        {isEditing ? 'Save Changes' : 'Create Tour'}
      </button>
      {validationErrors.map((msg, idx) => <ErrorMessage key={idx} message={msg} />)}
      {error && <ErrorMessage message={error} />}
    </div>
  );
};

export default TourCreator;
