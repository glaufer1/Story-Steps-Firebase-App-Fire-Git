import React from 'react';
import type { LinkButtonBlock } from '../../interfaces';

const LinkButtonSection: React.FC<{ block: LinkButtonBlock }> = ({ block }) => {
  return (
    <div className="link-button-section">
      <h4>{block.title}</h4>
      {block.buttons.map((button, index) => (
        <a key={index} href={button.url} className="link-button">
          {button.text}
        </a>
      ))}
    </div>
  );
};

export default LinkButtonSection;
