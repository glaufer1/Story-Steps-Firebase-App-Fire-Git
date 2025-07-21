import React, { useState } from 'react';
import type { ImageSliderBlock } from '../../interfaces';

interface ImageSliderFormProps {
  block: ImageSliderBlock;
  onUpdate: (block: ImageSliderBlock) => void;
}

const ImageSliderForm: React.FC<ImageSliderFormProps> = ({ block, onUpdate }) => {
  const [images, setImages] = useState(block.images);

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
    onUpdate({ ...block, images: newImages });
  };

  const addImage = () => {
    setImages([...images, '']);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onUpdate({ ...block, images: newImages });
  };

  return (
    <div>
      {images.map((image, index) => (
        <div key={index}>
          <input
            type="text"
            value={image}
            onChange={(e) => handleImageChange(index, e.target.value)}
            placeholder="Image URL"
          />
          <button onClick={() => removeImage(index)}>Remove</button>
        </div>
      ))}
      <button onClick={addImage}>Add Image</button>
    </div>
  );
};

export default ImageSliderForm;
