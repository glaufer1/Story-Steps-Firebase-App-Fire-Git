import React from 'react';
import type { TextBlock } from '../../interfaces';

const TextSection: React.FC<{ block: TextBlock }> = ({ block }) => {
  return (
    <div className="text-section" dangerouslySetInnerHTML={{ __html: block.content }} />
  );
};

export default TextSection;
