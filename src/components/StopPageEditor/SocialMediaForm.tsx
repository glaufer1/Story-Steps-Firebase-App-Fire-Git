import React from 'react';
import { SocialMediaBlock } from '../../interfaces';
import './EditorStyles.css';

interface SocialMediaFormProps {
  block: SocialMediaBlock;
  onChange: (updatedBlock: SocialMediaBlock) => void;
}

const SocialMediaForm: React.FC<SocialMediaFormProps> = ({ block, onChange }) => {
    const handleLinkChange = (index: number, field: string, value: string) => {
        const newLinks = [...block.links];
        newLinks[index] = { ...newLinks[index], [field]: value };
        onChange({ ...block, links: newLinks });
    };

    const handleAddLink = () => {
        onChange({ ...block, links: [...block.links, { platform: 'Website', url: '' }] });
    };

    const handleRemoveLink = (index: number) => {
        onChange({ ...block, links: block.links.filter((_, i) => i !== index) });
    };

    return (
        <div className="block-form">
            <h4>Social Media Block</h4>
            {block.links.map((link, index) => (
                <div key={index} className="form-group-box">
                    <label>Link #{index + 1}</label>
                    <div className="form-grid">
                        <select value={link.platform} onChange={(e) => handleLinkChange(index, 'platform', e.target.value)}>
                            <option value="Website">Website</option>
                            <option value="Facebook">Facebook</option>
                            <option value="Twitter">Twitter</option>
                            <option value="Instagram">Instagram</option>
                        </select>
                        <input
                            type="text"
                            placeholder="URL"
                            value={link.url}
                            onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                        />
                    </div>
                    <button className="remove-btn" onClick={() => handleRemoveLink(index)}>Remove</button>
                </div>
            ))}
            <button className="add-btn" onClick={handleAddLink}>Add Social Link</button>
        </div>
    );
};

export default SocialMediaForm;
