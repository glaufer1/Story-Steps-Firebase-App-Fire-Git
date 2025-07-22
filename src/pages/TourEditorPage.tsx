import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import type { Tour } from '../interfaces';
import './TourEditorPage.css';

const TourEditorPage: React.FC = () => {
  const { tourId } = useParams<{ tourId: string }>();
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading,setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!tourId) return;

    const fetchTour = async () => {
      try {
        const tourDocRef = doc(db, 'tours', tourId);
        const tourDocSnap = await getDoc(tourDocRef);

        if (tourDocSnap.exists()) {
          setTour({ id: tourDocSnap.id, ...tourDocSnap.data() } as Tour);
        } else {
          setError('Tour not found.');
        }
      } catch (err) {
        setError('Failed to fetch tour data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTour();
  }, [tourId, db]);

  if (loading) return <p>Loading tour details...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!tour) return <p>No tour data found.</p>;

  return (
    <div className="tour-editor-container">
      <h1>Editing Tour: {tour.title}</h1>
      <p>Tour ID: {tour.id}</p>
      
      <div className="editor-modules">
        <Link to={`/admin/tour-editor/${tourId}/info`} className="module-placeholder">
          Edit Tour Information
        </Link>
        <div className="module-placeholder">Audio Files Module</div>
        <div className="module-placeholder">Geofence Module</div>
        <div className="module-placeholder">Maps Module</div>
        <div className="module-placeholder">Photos Module</div>
        <div className="module-placeholder">Links Module</div>
      </div>
    </div>
  );
};

export default TourEditorPage;
