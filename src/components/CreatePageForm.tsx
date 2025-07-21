import React, { useState } from 'react';
import { PageType } from '../interfaces';

interface CreatePageFormProps {
  onCreate: (title: string, type: PageType) => void;
}

const CreatePageForm: React.FC<CreatePageFormProps> = ({ onCreate }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<PageType>(PageType.CityPage);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(title, type);
    setTitle('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Page Title"
        required
      />
      <select value={type} onChange={(e) => setType(e.target.value as PageType)}>
        <option value={PageType.CityPage}>City Page</option>
        <option value={PageType.CollectionPage}>Collection Page</option>
        <option value={PageType.PrePurchaseTourPage}>Pre-Purchase Tour Page</option>
        <option value={PageType.PostPurchaseTourPage}>Post-Purchase Tour Page</option>
        <option value={PageType.StopPage}>Stop Page</option>
      </select>
      <button type="submit">Create Page</button>
    </form>
  );
};

export default CreatePageForm;
