import React, { useState } from 'react';
import { LinkButtonBlock } from '../../interfaces';
import * as yup from 'yup';

interface LinkButtonFormProps {
  block: LinkButtonBlock;
  onUpdate: (block: LinkButtonBlock) => void;
  onDelete: () => void;
}

const schema = yup.object().shape({
  title: yup.string().required('Title is required'),
  buttons: yup.array().of(
    yup.object().shape({
      text: yup.string().required('Button text is required'),
      url: yup.string().url('Must be a valid URL').required('URL is required'),
    })
  ),
});

const LinkButtonForm: React.FC<LinkButtonFormProps> = ({ block, onUpdate, onDelete }) => {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await schema.validate(block, { abortEarly: false });
      onUpdate(block);
      setValidationErrors([]);
    } catch (validationErr: any) {
      setValidationErrors(validationErr.errors);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...block, title: e.target.value });
  };

  const handleButtonChange = (index: number, field: 'text' | 'url', value: string) => {
    const newButtons = [...block.buttons];
    newButtons[index] = { ...newButtons[index], [field]: value };
    onUpdate({ ...block, buttons: newButtons });
  };

  const addButton = () => {
    onUpdate({
      ...block,
      buttons: [...block.buttons, { text: '', url: '' }],
    });
  };

  const removeButton = (index: number) => {
    const newButtons = block.buttons.filter((_, i) => i !== index);
    onUpdate({ ...block, buttons: newButtons });
  };

  return (
    <form onSubmit={handleSubmit} className="link-button-form">
      <div className="form-group">
        <label htmlFor="title">Title:</label>
        <input
          type="text"
          id="title"
          value={block.title}
          onChange={handleTitleChange}
        />
      </div>

      {block.buttons.map((button, index) => (
        <div key={index} className="button-group">
          <div className="form-group">
            <label htmlFor={`button-text-${index}`}>Button Text:</label>
            <input
              type="text"
              id={`button-text-${index}`}
              value={button.text}
              onChange={(e) => handleButtonChange(index, 'text', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor={`button-url-${index}`}>URL:</label>
            <input
              type="url"
              id={`button-url-${index}`}
              value={button.url}
              onChange={(e) => handleButtonChange(index, 'url', e.target.value)}
            />
          </div>
          <button type="button" onClick={() => removeButton(index)}>Remove Button</button>
        </div>
      ))}

      <button type="button" onClick={addButton}>Add Button</button>

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

export default LinkButtonForm;
