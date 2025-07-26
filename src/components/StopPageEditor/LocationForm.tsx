import React, { useState } from 'react';
import { LocationBlock } from '../../interfaces';
import * as yup from 'yup';

interface LocationFormProps {
  block: LocationBlock;
  onUpdate: (block: LocationBlock) => void;
  onDelete: () => void;
}

const schema = yup.object().shape({
  latitude: yup.number().required('Latitude is required'),
  longitude: yup.number().required('Longitude is required'),
  address: yup.string().required('Address is required'),
  mapType: yup.string().required('Map type is required'),
});

const LocationForm: React.FC<LocationFormProps> = ({ block, onUpdate, onDelete }) => {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await schema.validate(block, { abortEarly: false });
      onUpdate(block);
      setValidationErrors([]);
    } catch (validationErr: any) {
      setValidationErrors(validationErr.errors);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newValue = name === 'latitude' || name === 'longitude' ? parseFloat(value) : value;
    onUpdate({ ...block, [name]: newValue });
  };

  return (
    <form onSubmit={handleSubmit} className="location-form">
      <div className="form-group">
        <label htmlFor="latitude">Latitude:</label>
        <input
          type="number"
          id="latitude"
          name="latitude"
          value={block.latitude}
          onChange={handleChange}
          step="any"
        />
      </div>
      <div className="form-group">
        <label htmlFor="longitude">Longitude:</label>
        <input
          type="number"
          id="longitude"
          name="longitude"
          value={block.longitude}
          onChange={handleChange}
          step="any"
        />
      </div>
      <div className="form-group">
        <label htmlFor="address">Address:</label>
        <input
          type="text"
          id="address"
          name="address"
          value={block.address}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label htmlFor="mapType">Map Type:</label>
        <input
          type="text"
          id="mapType"
          name="mapType"
          value={block.mapType}
          onChange={handleChange}
        />
      </div>
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

export default LocationForm;
