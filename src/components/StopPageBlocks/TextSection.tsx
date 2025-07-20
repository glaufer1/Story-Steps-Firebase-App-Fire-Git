import React from 'react';
import type { TextBlock } from '../../interfaces';
import './BlockStyles.css';

interface TextSectionProps {
  block: TextBlock;
}

const TextSection: React.FC<TextSectionProps> = ({ block }) => {
  return (
    <div className="stop-page-block" dangerouslySetInnerHTML={{ __html: block.content }} />
  );
};

export default TextSection;
