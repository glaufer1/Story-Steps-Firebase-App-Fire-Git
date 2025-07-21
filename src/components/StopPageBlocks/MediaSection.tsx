import React from 'react';
import type { MediaBlock } from '../../interfaces';

const MediaSection: React.FC<{ block: MediaBlock }> = ({ block }) => {
  return (
    <div className="media-section">
      {block.items.map((item, index) => (
        <div key={index} className="media-item">
          {item.type === 'image' && <img src={item.url} alt={item.caption || ''} />}
          {item.type === 'video' && <video src={item.url} controls />}
          {item.type === 'audio' && <audio src={item.url} controls />}
          {item.caption && <p>{item.caption}</p>}
        </div>
      ))}
    </div>
  );
};

export default MediaSection;
