import React, { useState } from 'react';
import { HowToGetFromBlock, Pin } from '../../interfaces';
import * as yup from 'yup';

interface HowToGetFromFormProps {
  block: HowToGetFromBlock;
  onUpdate: (block: HowToGetFromBlock) => void;
  onDelete: () => void;
}

const pinSchema = yup.object().shape({
  id: yup.string().required('Pin ID is required'),
  label: yup.string().required('Label is required'),
  latitude: yup.number().required('Latitude is required'),
  longitude: yup.number().required('Longitude is required'),
  color: yup.string().optional(),
});

const schema = yup.object().shape({
  pins: yup.array().of(pinSchema),
  routeData: yup.mixed().optional(),
});

const HowToGetFromForm: React.FC<HowToGetFromFormProps> = ({ block, onUpdate, onDelete }) => {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { pins } = block;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await schema.validate(block, { abortEarly: false });
      onUpdate(block);
      setValidationErrors([]);
    } catch (validationErr: any) {
      setValidationErrors(validationErr.errors || ['Validation failed']);
    }
  };

  const handlePinChange = (index: number, field: keyof Pin, value: string | number) => {
    const newPins = [...pins];
    newPins[index] = { ...newPins[index], [field]: value };
    onUpdate({ ...block, pins: newPins });
  };

  const removePin = (index: number) => {
    const newPins = pins.filter((_: Pin, i: number) => i !== index);
    onUpdate({ ...block, pins: newPins });
  };

  const addPin = () => {
    const newPin: Pin = {
      id: `pin-${Date.now()}`,
      label: '',
      latitude: 0,
      longitude: 0,
    };
    onUpdate({
      ...block,
      pins: [...pins, newPin],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="how-to-get-from-form">
      {pins.map((pin, index) => (
        <div key={pin.id} className="pin-group">
          <div className="form-group">
            <label htmlFor={`label-${index}`}>Label:</label>
            <input
              type="text"
              id={`label-${index}`}
              value={pin.label}
              onChange={(e) => handlePinChange(index, 'label', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor={`latitude-${index}`}>Latitude:</label>
            <input
              type="number"
              id={`latitude-${index}`}
              value={pin.latitude}
              onChange={(e) => handlePinChange(index, 'latitude', parseFloat(e.target.value))}
              step="any"
            />
          </div>
          <div className="form-group">
            <label htmlFor={`longitude-${index}`}>Longitude:</label>
            <input
              type="number"
              id={`longitude-${index}`}
              value={pin.longitude}
              onChange={(e) => handlePinChange(index, 'longitude', parseFloat(e.target.value))}
              step="any"
            />
          </div>
          <div className="form-group">
            <label htmlFor={`color-${index}`}>Color:</label>
            <input
              type="text"
              id={`color-${index}`}
              value={pin.color || ''}
              onChange={(e) => handlePinChange(index, 'color', e.target.value)}
            />
          </div>
          <button type="button" onClick={() => removePin(index)}>Remove Pin</button>
        </div>
      ))}

      <button type="button" onClick={addPin}>Add Pin</button>

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

export default HowToGetFromForm;
