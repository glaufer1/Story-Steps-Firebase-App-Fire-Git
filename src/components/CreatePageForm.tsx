import React, { useState } from 'react';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import './CreatePageForm.css';

const CreatePageForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [type, setType] = useState<'City' | 'PrePurchaseTour' | 'PostPurchaseTour' | 'Stop' | 'Collection'>('City');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title || !description) {
      setError('Title and description are required.');
      return;
    }

    const db = getFirestore();
    try {
      await addDoc(collection(db, 'pages'), {
        title,
        description,
        imageUrl,
        type,
      });
      setSuccess('Page created successfully!');
      setTitle('');
      setDescription('');
      setImageUrl('');
      setType('City');
    } catch (err) {
      setError('Failed to create page. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="create-page-form-container">
      <h2>Create New Page</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="imageUrl">Image URL (Optional)</label>
          <input
            type="text"
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="type">Page Type</label>
          <select id="type" value={type} onChange={(e) => setType(e.target.value as any)}>
            <option value="City">City</option>
            <option value="Collection">Collection</option>
            <option value="PrePurchaseTour">Pre-Purchase Tour</option>
            <option value="PostPurchaseTour">Post-Purchase Tour</option>
            <option value="Stop">Stop</option>
          </select>
        </div>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        <button type="submit" className="submit-btn">Create Page</button>
      </form>
    </div>
  );
};

export default CreatePageForm;
