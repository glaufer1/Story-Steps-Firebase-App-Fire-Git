// src/pages/EditTourListPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import type { Tour } from '../interfaces';
import './PageStyles.css';
import ErrorMessage from '../components/ErrorMessage';

const EditTourListPage: React.FC = () => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'tours'));
        const toursData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Tour));
        setTours(toursData);
      } catch (err) {
        setError('Failed to fetch tours.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, []);

  if (loading) return <p>Loading tours...</p>;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="page-list-container">
      <h2>Edit an Existing Tour</h2>
      <table className="user-table">
        <thead>
          <tr>
            <th>Tour Title</th>
            <th>City</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tours.map(tour => (
            <tr key={tour.id}>
              <td>{tour.title}</td>
              <td>{tour.city}</td>
              <td>
                <Link to={`/admin/tour-editor/${tour.id}`}>
                  <button>Edit</button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EditTourListPage;
