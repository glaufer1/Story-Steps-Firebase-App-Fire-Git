import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import '../TourCreator.css';

const TourCreatorPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCreateTour = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title || !description || !city) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      const docRef = await addDoc(collection(db, 'tours'), {
        title,
        description,
        city,
        createdAt: new Date(),
      });
      // Redirect to the new tour editor page with the new tour's ID
      navigate(`/admin/tour-editor/${docRef.id}`);
    } catch (err) {
      setError('Failed to create tour. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="tour-creator-container">
      <form onSubmit={handleCreateTour}>
        <h2>Create a New Tour</h2>
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
          type="text"
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button type="submit">Create and Edit Tour</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
};

export default TourCreatorPage;
