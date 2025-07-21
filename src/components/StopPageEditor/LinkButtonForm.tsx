import React, { useState } from 'react';
import type { LinkButtonBlock } from '../../interfaces';

interface LinkButtonFormProps {
  block: LinkButtonBlock;
  onUpdate: (block: LinkButtonBlock) => void;
}

const LinkButtonForm: React.FC<LinkButtonFormProps> = ({ block, onUpdate }) => {
  const [title, setTitle] = useState(block.title);
  const [buttons, setButtons] = useState(block.buttons);

  const handleButtonChange = (index: number, field: 'text' | 'url', value: string) => {
    const newButtons = [...buttons];
    newButtons[index][field] = value;
    setButtons(newButtons);
    onUpdate({ ...block, title, buttons: newButtons });
  };

  const addButton = () => {
    setButtons([...buttons, { text: '', url: '' }]);
  };

  const removeButton = (index: number) => {
    const newButtons = buttons.filter((_, i) => i !== index);
    setButtons(newButtons);
    onUpdate({ ...block, title, buttons: newButtons });
  };

  return (
    <div>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
      />
      {buttons.map((button, index) => (
        <div key={index}>
          <input
            type="text"
            value={button.text}
            onChange={(e) => handleButtonChange(index, 'text', e.target.value)}
            placeholder="Button Text"
          />
          <input
            type="text"
            value={button.url}
            onChange={(e) => handleButtonChange(index, 'url', e.target.value)}
            placeholder="Button URL"
          />
          <button onClick={() => removeButton(index)}>Remove</button>
        </div>
      ))}
      <button onClick={addButton}>Add Button</button>
    </div>
  );
};

export default LinkButtonForm;
