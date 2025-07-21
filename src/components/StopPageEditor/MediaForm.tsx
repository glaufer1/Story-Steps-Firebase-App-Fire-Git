import React, { useState } from 'react';
import type { MediaBlock, MediaItem } from '../../interfaces';

interface MediaFormProps {
  block: MediaBlock;
  onUpdate: (block: MediaBlock) => void;
}

const MediaForm: React.FC<MediaFormProps> = ({ block, onUpdate }) => {
  const [items, setItems] = useState(block.items);

  const handleItemChange = (index: number, field: keyof MediaItem, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
    onUpdate({ ...block, items: newItems });
  };

  const addItem = () => {
    setItems([...items, { url: '', type: 'image' }]);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    onUpdate({ ...block, items: newItems });
  };

  return (
    <div>
      {items.map((item, index) => (
        <div key={index}>
          <input
            type="text"
            value={item.url}
            onChange={(e) => handleItemChange(index, 'url', e.target.value)}
            placeholder="URL"
          />
          <select value={item.type} onChange={(e) => handleItemChange(index, 'type', e.target.value as 'image' | 'video' | 'audio')}>
            <option value="image">Image</option>
            <option value="video">Video</option>
            <option value="audio">Audio</option>
          </select>
          <input
            type="text"
            value={item.caption}
            onChange={(e) => handleItemChange(index, 'caption', e.target.value)}
            placeholder="Caption"
          />
          <button onClick={() => removeItem(index)}>Remove</button>
        </div>
      ))}
      <button onClick={addItem}>Add Item</button>
    </div>
  );
};

export default MediaForm;
