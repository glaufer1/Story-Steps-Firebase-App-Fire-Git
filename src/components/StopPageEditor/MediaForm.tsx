import React, { useState } from 'react';
import { MediaBlock } from '../../interfaces';
import * as yup from 'yup';

interface MediaFormProps {
  block: MediaBlock;
  onUpdate: (block: MediaBlock) => void;
  onDelete: () => void;
}

const schema = yup.object().shape({
  items: yup.array().of(
    yup.object().shape({
      url: yup.string().url('Must be a valid URL').required('URL is required'),
      caption: yup.string().optional(),
      type: yup.string().oneOf(['image', 'video', 'audio']).required('Media type is required'),
    })
  ),
});

const MediaForm: React.FC<MediaFormProps> = ({ block, onUpdate, onDelete }) => {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { items } = block;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await schema.validate(block, { abortEarly: false });
      onUpdate(block);
      setValidationErrors([]);
    } catch (validationErr: any) {
      setValidationErrors(validationErr.errors || ['Validation failed']);
    }
  };

  const handleItemChange = (index: number, field: keyof typeof items[0], value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onUpdate({ ...block, items: newItems });
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_: any, i: number) => i !== index);
    onUpdate({ ...block, items: newItems });
  };

  const addItem = () => {
    onUpdate({
      ...block,
      items: [...items, { url: '', caption: '', type: 'image' }],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="media-form">
      {items.map((item, index) => (
        <div key={index} className="media-item">
          <div className="form-group">
            <label htmlFor={`type-${index}`}>Type:</label>
            <select
              id={`type-${index}`}
              value={item.type}
              onChange={(e) => handleItemChange(index, 'type', e.target.value)}
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="audio">Audio</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor={`url-${index}`}>URL:</label>
            <input
              type="url"
              id={`url-${index}`}
              value={item.url}
              onChange={(e) => handleItemChange(index, 'url', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor={`caption-${index}`}>Caption:</label>
            <input
              type="text"
              id={`caption-${index}`}
              value={item.caption}
              onChange={(e) => handleItemChange(index, 'caption', e.target.value)}
            />
          </div>
          <button type="button" onClick={() => removeItem(index)}>Remove Item</button>
        </div>
      ))}

      <button type="button" onClick={addItem}>Add Media Item</button>

      {validationErrors.length > 0 && (
        <div className="validation-errors">
          {validationErrors.map((error, index) => (
            <p key={index} className="error">{error}</p>
          ))}
        </div>
      )}

      <div className="form-actions">
        <button type="submit">Save</button>
        <button type="button" onClick={onDelete}>Delete</button>
      </div>
    </form>
  );
};

export default MediaForm;
