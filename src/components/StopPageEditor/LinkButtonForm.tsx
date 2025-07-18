import React from 'react';
import { LinkButtonBlock } from '../../interfaces';
import './EditorStyles.css';

interface LinkButtonFormProps {
  block: LinkButtonBlock;
  onChange: (updatedBlock: LinkButtonBlock) => void;
}

const LinkButtonForm: React.FC<LinkButtonFormProps> = ({ block, onChange }) => {
  const handleButtonChange = (index: number, field: string, value: string) => {
    const newButtons = [...block.buttons];
    newButtons[index] = { ...newButtons[index], [field]: value };
    onChange({ ...block, buttons: newButtons });
  };

  const handleAddButton = () => {
    onChange({ ...block, buttons: [...block.buttons, { text: '', url: '' }] });
  };

  const handleRemoveButton = (index: number) => {
    onChange({ ...block, buttons: block.buttons.filter((_, i) => i !== index) });
  };

  return (
    <div className="block-form">
      <h4>Link Buttons Block</h4>
      <label>Title</label>
      <input
        type="text"
        value={block.title}
        onChange={(e) => onChange({ ...block, title: e.target.value })}
        placeholder="e.g., 'More Information'"
      />
      {block.buttons.map((button, index) => (
        <div key={index} className="form-group-box">
          <label>Button #{index + 1}</label>
          <input
            type="text"
            placeholder="Button Text"
            value={button.text}
            onChange={(e) => handleButtonChange(index, 'text', e.target.value)}
          />
          <input
            type="text"
            placeholder="URL"
            value={button.url}
            onChange={(e) => handleButtonChange(index, 'url', e.target.value)}
          />
          <button className="remove-btn" onClick={() => handleRemoveButton(index)}>Remove</button>
        </div>
      ))}
      <button className="add-btn" onClick={handleAddButton}>Add Button</button>
    </div>
  );
};

export default LinkButtonForm;
