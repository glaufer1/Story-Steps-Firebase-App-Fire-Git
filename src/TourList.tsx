import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, FirestoreError } from 'firebase/firestore';
import './TourList.css';
import type { Tour, AppUser } from './interfaces';
import { db } from './firebaseConfig';
import ErrorMessage from './components/ErrorMessage';

interface TourListProps {
  onEdit: (tour: Tour) => void;
  user: AppUser | null;
}

const TourList: React.FC<TourListProps> = ({ onEdit, user }) => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTours = async () => {
    setLoading(true);
    // Clear previous errors when refetching
    setError('');
    try {
      const querySnapshot = await getDocs(collection(db, "tours"));
      const toursData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Tour));
      setTours(toursData);
    } catch (err: unknown) {
        const firestoreError = err as FirestoreError;
        const errorMessage = firestoreError.message || 'An unknown error occurred.';
        setError(`Failed to fetch tours: ${errorMessage}`);
        console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTours();
  }, []);

  const handleDelete = async (tourId: string) => {
    if (window.confirm("Are you sure you want to delete this tour?")) {
      try {
        await deleteDoc(doc(db, "tours", tourId));
        // Refresh the list after deleting
        fetchTours();
      } catch (err: unknown) {
        const firestoreError = err as FirestoreError;
        // Provide a more specific error message
        const errorMessage = firestoreError.message || 'Please try again.';
        setError(`Failed to delete tour. ${errorMessage}`);
        console.error(err);
      }
    }
  };
  
  const isPrivilegedUser = user?.role === 'Admin' || user?.role === 'Creator';

  if (loading) return <p>Loading tours...</p>;
  

  return (
    <div className="tour-list-container">
      <h2>Existing Tours</h2>
      {/* Display a prominent error message if something fails */}
      {error && <ErrorMessage message={error} />}
      
      {tours.length === 0 ? (
        <p>No tours found. {isPrivilegedUser && "Create one above!"}</p>
      ) : (
        <ul>
          {tours.map(tour => (
            <li key={tour.id}>
              <div>
                <strong>{tour.title}</strong> - ${tour.price}
                <p>{tour.description}</p>
              </div>
              {isPrivilegedUser && (
                <div className="actions">
                  <button className="edit" onClick={() => onEdit(tour)}>Edit</button>
                  <button className="delete" onClick={() => handleDelete(tour.id)}>Delete</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TourList;
