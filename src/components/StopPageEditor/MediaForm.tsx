import React from 'react';
import { MediaBlock } from '../../interfaces';
import './EditorStyles.css';

interface MediaFormProps {
  block: MediaBlock;
  onChange: (updatedBlock: MediaBlock) => void;
}

const MediaForm: React.FC<MediaFormProps> = ({ block, onChange }) => {
  const handleItemChange = (index: number, field: string, value: string) => {
    const newItems = [...block.items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange({ ...block, items: newItems });
  };

  const handleAddItem = () => {
    const newItem = { type: 'image', url: '', caption: '' };
    onChange({ ...block, items: [...block.items, newItem] });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = block.items.filter((_, i) => i !== index);
    onChange({ ...block, items: newItems });
  };

  return (
    <div className="block-form">
      <h4>Media Block</h4>
      {block.items.map((item, index) => (
        <div key={index} className="form-group-box">
          <label>Media Item #{index + 1}</label>
          <div className="form-grid">
            <select value={item.type} onChange={(e) => handleItemChange(index, 'type', e.target.value)}>
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="audio">Audio</option>
            </select>
            <input
              type="text"
              placeholder="URL"
              value={item.url}
              onChange={(e) => handleItemChange(index, 'url', e.target.value)}
            />
            <input
              type="text"
              placeholder="Caption"
              value={item.caption}
              onChange={(e) => handleItemChange(index, 'caption', e.target.value)}
            />
          </div>
          <button className="remove-btn" onClick={() => handleRemoveItem(index)}>Remove</button>
        </div>
      ))}
      <button className="add-btn" onClick={handleAddItem}>Add Media Item</button>
    </div>
  );
};

export default MediaForm;
