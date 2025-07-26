import React, { useState } from 'react';
import { ImageSliderBlock } from '../../interfaces';
import * as yup from 'yup';

interface ImageSliderFormProps {
  block: ImageSliderBlock;
  onUpdate: (block: ImageSliderBlock) => void;
  onDelete: () => void;
}

const schema = yup.object().shape({
  images: yup.array().of(yup.string().required('Image URL is required')),
});

const ImageSliderForm: React.FC<ImageSliderFormProps> = ({ block, onUpdate, onDelete }) => {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { images } = block;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await schema.validate(block, { abortEarly: false });
      onUpdate(block);
      setValidationErrors([]);
    } catch (validationErr: any) {
      if (validationErr?.inner) {
        const invalids = validationErr.inner
          .filter((e: any) => e.path && e.path.startsWith('images['))
          .map((e: any) => parseInt(e.path.replace(/[^0-9]/g, ''), 10));
        setValidationErrors(invalids.map((i: number) => `Invalid image URL at position ${i + 1}`));
      } else {
        setValidationErrors(validationErr.errors || ['Validation failed']);
      }
    }
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    onUpdate({ ...block, images: newImages });
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_: string, i: number) => i !== index);
    onUpdate({ ...block, images: newImages });
  };

  const addImage = () => {
    onUpdate({ ...block, images: [...images, ''] });
  };

  return (
    <form onSubmit={handleSubmit} className="image-slider-form">
      {images.map((image: string, index: number) => (
        <div key={index} className="image-group">
          <div className="form-group">
            <label htmlFor={`image-${index}`}>Image URL:</label>
            <input
              type="text"
              id={`image-${index}`}
              value={image}
              onChange={(e) => handleImageChange(index, e.target.value)}
            />
          </div>
          <button type="button" onClick={() => removeImage(index)}>Remove Image</button>
        </div>
      ))}

      <button type="button" onClick={addImage}>Add Image</button>

      {validationErrors.length > 0 && (
        <div className="validation-errors">
          {validationErrors.map((error, index) => (
            <p key={index} className="error">{error}</p>
          ))}
        </div>
      )}

      <div className="form-actions">
        <button type="submit">Save</button>
        <button type="button" onClick={onDelete}>Delete</button>
      </div>
    </form>
  );
};

export default ImageSliderForm;
