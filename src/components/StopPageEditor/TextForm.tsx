import React from 'react';
import type { TextBlock } from '../../interfaces';
import './EditorStyles.css';

interface TextFormProps {
  block: TextBlock;
  onChange: (updatedBlock: TextBlock) => void;
}

const TextForm: React.FC<TextFormProps> = ({ block, onChange }) => {
  return (
    <div className="block-form">
      <h4>Text Block</h4>
      <textarea
        value={block.content}
        onChange={(e) => onChange({ ...block, content: e.target.value })}
        placeholder="Enter your formatted text (HTML)"
      />
    </div>
  );
};

export default TextForm;
