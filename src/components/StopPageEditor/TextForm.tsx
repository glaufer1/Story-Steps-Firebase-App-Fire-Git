import React, { useState } from 'react';
import { TextBlock } from '../../interfaces';
import * as yup from 'yup';

interface TextFormProps {
  block: TextBlock;
  onUpdate: (block: TextBlock) => void;
  onDelete: () => void;
}

const schema = yup.object().shape({
  content: yup.string().required('Content is required'),
});

const TextForm: React.FC<TextFormProps> = ({ block, onUpdate, onDelete }) => {
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

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ ...block, content: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit} className="text-form">
      <div className="form-group">
        <label htmlFor="content">Content:</label>
        <textarea
          id="content"
          value={block.content}
          onChange={handleChange}
          rows={4}
        />
      </div>

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

export default TextForm;
