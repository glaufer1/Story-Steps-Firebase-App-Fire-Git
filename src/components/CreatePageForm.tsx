import React, { useState } from 'react';
import { PageType } from '../interfaces';
import ErrorMessage from './ErrorMessage';
import * as yup from 'yup';

interface CreatePageFormProps {
  onCreate: (title: string, type: PageType) => void;
}

const pageSchema = yup.object({
  title: yup.string().min(2, 'Page title must be at least 2 characters').required('Page title is required'),
});

const CreatePageForm: React.FC<CreatePageFormProps> = ({ onCreate }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<PageType>(PageType.CityPage);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors([]);
    try {
      await pageSchema.validate({ title }, { abortEarly: false });
    } catch (validationErr) {
      if (validationErr instanceof yup.ValidationError) {
        setValidationErrors(validationErr.errors);
        return;
      }
    }
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
      {validationErrors.map((msg, idx) => <ErrorMessage key={idx} message={msg} />)}
    </form>
  );
};

export default CreatePageForm;
