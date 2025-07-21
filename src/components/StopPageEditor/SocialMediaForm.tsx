import React, { useState } from 'react';
import type { SocialMediaBlock } from '../../interfaces';

interface SocialMediaFormProps {
  block: SocialMediaBlock;
  onUpdate: (block: SocialMediaBlock) => void;
}

const SocialMediaForm: React.FC<SocialMediaFormProps> = ({ block, onUpdate }) => {
  const [links, setLinks] = useState(block.links);

  const handleLinkChange = (index: number, field: 'platform' | 'url', value: string) => {
    const newLinks = [...links];
    newLinks[index][field] = value;
    setLinks(newLinks);
    onUpdate({ ...block, links: newLinks });
  };

  const addLink = () => {
    setLinks([...links, { platform: '', url: '' }]);
  };

  const removeLink = (index: number) => {
    const newLinks = links.filter((_, i) => i !== index);
    setLinks(newLinks);
    onUpdate({ ...block, links: newLinks });
  };

  return (
    <div>
      {links.map((link, index) => (
        <div key={index}>
          <input
            type="text"
            value={link.platform}
            onChange={(e) => handleLinkChange(index, 'platform', e.target.value)}
            placeholder="Platform"
          />
          <input
            type="text"
            value={link.url}
            onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
            placeholder="URL"
          />
          <button onClick={() => removeLink(index)}>Remove</button>
        </div>
      ))}
      <button onClick={addLink}>Add Link</button>
    </div>
  );
};

export default SocialMediaForm;
