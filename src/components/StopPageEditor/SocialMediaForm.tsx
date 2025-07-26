import React, { useState } from 'react';
import { SocialMediaBlock } from '../../interfaces';
import * as yup from 'yup';

interface SocialMediaFormProps {
  block: SocialMediaBlock;
  onUpdate: (block: SocialMediaBlock) => void;
  onDelete: () => void;
}

const schema = yup.object().shape({
  links: yup.array().of(
    yup.object().shape({
      platform: yup.string().required('Platform is required'),
      url: yup.string().url('Must be a valid URL').required('URL is required'),
    })
  ),
});

const SocialMediaForm: React.FC<SocialMediaFormProps> = ({ block, onUpdate, onDelete }) => {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { links } = block;

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

  const handleLinkChange = (index: number, field: keyof typeof links[0], value: string) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    onUpdate({ ...block, links: newLinks });
  };

  const removeLink = (index: number) => {
    const newLinks = links.filter((_: any, i: number) => i !== index);
    onUpdate({ ...block, links: newLinks });
  };

  const addLink = () => {
    onUpdate({
      ...block,
      links: [...links, { platform: '', url: '' }],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="social-media-form">
      {links.map((link: { platform: string; url: string }, index: number) => (
        <div key={index} className="link-group">
          <div className="form-group">
            <label htmlFor={`platform-${index}`}>Platform:</label>
            <input
              type="text"
              id={`platform-${index}`}
              value={link.platform}
              onChange={(e) => handleLinkChange(index, 'platform', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor={`url-${index}`}>URL:</label>
            <input
              type="url"
              id={`url-${index}`}
              value={link.url}
              onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
            />
          </div>
          <button type="button" onClick={() => removeLink(index)}>Remove Link</button>
        </div>
      ))}

      <button type="button" onClick={addLink}>Add Link</button>

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

export default SocialMediaForm;
