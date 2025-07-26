import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Tour } from '../interfaces';
import * as yup from 'yup';

const schema = yup.object().shape({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  city: yup.string().required('City is required'),
  price: yup.number().min(0, 'Price must be positive').optional(),
});

const TourInformationEditor: React.FC = () => {
  const { tourId } = useParams<{ tourId: string }>();
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    const fetchTour = async () => {
      if (!tourId) return;

      try {
        const tourDoc = await getDoc(doc(db, 'tours', tourId));
        if (tourDoc.exists()) {
          setTour(tourDoc.data() as Tour);
        }
      } catch (err) {
        console.error('Error fetching tour:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTour();
  }, [tourId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tour || !tourId) return;

    try {
      await schema.validate(tour, { abortEarly: false });
      const { id, ...tourData } = tour;
      await updateDoc(doc(db, 'tours', tourId), tourData);
      setValidationErrors([]);
    } catch (validationErr: any) {
      setValidationErrors(validationErr.errors || ['Validation failed']);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!tour) return;

    const { name, value } = e.target;
    const newValue = name === 'price' ? parseFloat(value) : value;
    setTour({ ...tour, [name]: newValue });
  };

  if (loading) return <div>Loading...</div>;
  if (!tour) return <div>Tour not found</div>;

  return (
    <form onSubmit={handleSubmit} className="tour-information-editor">
      <div className="form-group">
        <label htmlFor="title">Title:</label>
        <input
          type="text"
          id="title"
          name="title"
          value={tour.title}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          name="description"
          value={tour.description}
          onChange={handleChange}
          rows={4}
        />
      </div>

      <div className="form-group">
        <label htmlFor="city">City:</label>
        <input
          type="text"
          id="city"
          name="city"
          value={tour.city}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="price">Price:</label>
        <input
          type="number"
          id="price"
          name="price"
          value={tour.price || ''}
          onChange={handleChange}
          step="0.01"
          min="0"
        />
      </div>

      {validationErrors.length > 0 && (
        <div className="validation-errors">
          {validationErrors.map((error, index) => (
            <p key={index} className="error">{error}</p>
          ))}
        </div>
      )}

      <div className="form-actions">
        <button type="submit">Save</button>
      </div>
    </form>
  );
};

export default TourInformationEditor;
