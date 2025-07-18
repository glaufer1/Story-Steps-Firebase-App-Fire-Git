import React from 'react';
import { LinkButtonBlock } from '../../interfaces';
import './BlockStyles.css';

interface LinkButtonSectionProps {
  block: LinkButtonBlock;
}

const LinkButtonSection: React.FC<LinkButtonSectionProps> = ({ block }) => {
  return (
    <div className="stop-page-block">
      <h3>{block.title}</h3>
      <div className="link-buttons">
        {block.buttons.map((button, index) => (
          <a key={index} href={button.url} target="_blank" rel="noopener noreferrer" className="link-btn">
            {button.text}
          </a>
        ))}
      </div>
    </div>
  );
};

export default LinkButtonSection;
