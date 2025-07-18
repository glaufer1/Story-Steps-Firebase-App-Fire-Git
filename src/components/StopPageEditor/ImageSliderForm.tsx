import React from 'react';
import { ImageSliderBlock } from '../../interfaces';
import './EditorStyles.css';

interface ImageSliderFormProps {
  block: ImageSliderBlock;
  onChange: (updatedBlock: ImageSliderBlock) => void;
}

const ImageSliderForm: React.FC<ImageSliderFormProps> = ({ block, onChange }) => {
  return (
    <div className="block-form">
      <h4>Image Slider Block</h4>
      <div className="form-grid">
        <div>
            <label>Image 1 URL</label>
            <input
                type="text"
                value={block.imageUrl1}
                onChange={(e) => onChange({ ...block, imageUrl1: e.target.value })}
            />
        </div>
        <div>
            <label>Image 2 URL</label>
            <input
                type="text"
                value={block.imageUrl2}
                onChange={(e) => onChange({ ...block, imageUrl2: e.target.value })}
            />
        </div>
      </div>
    </div>
  );
};

export default ImageSliderForm;
