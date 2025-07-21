import React, { useState } from 'react';
import type { TextBlock } from '../../interfaces';

interface TextFormProps {
  block: TextBlock;
  onUpdate: (block: TextBlock) => void;
}

const TextForm: React.FC<TextFormProps> = ({ block, onUpdate }) => {
  const [content, setContent] = useState(block.content);

  const handleUpdate = () => {
    onUpdate({ ...block, content });
  };

  return (
    <div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Text Content"
      />
      <button onClick={handleUpdate}>Update</button>
    </div>
  );
};

export default TextForm;
