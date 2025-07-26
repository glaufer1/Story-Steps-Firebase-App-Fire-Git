import React, { useState } from 'react';
import ErrorMessage from '../ErrorMessage';
import * as yup from 'yup';
import './EditorStyles.css';

interface GeoFenceFormProps {
  latitude: number;
  longitude: number;
  radius: number;
  onLatitudeChange: (value: number) => void;
  onLongitudeChange: (value: number) => void;
  onRadiusChange: (value: number) => void;
}

const geoFenceSchema = yup.object({
  latitude: yup.number().min(-90, 'Latitude must be >= -90').max(90, 'Latitude must be <= 90').required('Latitude is required'),
  longitude: yup.number().min(-180, 'Longitude must be >= -180').max(180, 'Longitude must be <= 180').required('Longitude is required'),
  radius: yup.number().min(1, 'Radius must be greater than 0').required('Radius is required'),
});

const GeoFenceForm: React.FC<GeoFenceFormProps> = ({ latitude, longitude, radius, onLatitudeChange, onLongitudeChange, onRadiusChange }) => {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [invalidFields, setInvalidFields] = useState<{lat?: boolean, lng?: boolean, radius?: boolean}>({});

  const handleUpdate = async () => {
    setValidationErrors([]);
    setInvalidFields({});
    try {
      await geoFenceSchema.validate({ latitude, longitude, radius }, { abortEarly: false });
    } catch (validationErr) {
      if (validationErr instanceof yup.ValidationError) {
        setValidationErrors(validationErr.errors);
        const fields: {lat?: boolean, lng?: boolean, radius?: boolean} = {};
        validationErr.inner.forEach(e => {
          if (e.path === 'latitude') fields.lat = true;
          if (e.path === 'longitude') fields.lng = true;
          if (e.path === 'radius') fields.radius = true;
        });
        setInvalidFields(fields);
        return;
      }
    }
    // If valid, you may want to call a parent update or just clear errors
  };

  return (
    <div className="top-level-form">
      <h3>GeoFence Settings</h3>
      <div className="form-grid">
        <div>
          <label>Latitude</label>
          <input
            type="number"
            value={latitude}
            onChange={(e) => onLatitudeChange(parseFloat(e.target.value))}
            style={invalidFields.lat ? { border: '1px solid #b00020' } : {}}
          />
        </div>
        <div>
          <label>Longitude</label>
          <input
            type="number"
            value={longitude}
            onChange={(e) => onLongitudeChange(parseFloat(e.target.value))}
            style={invalidFields.lng ? { border: '1px solid #b00020' } : {}}
          />
        </div>
        <div>
          <label>Radius (meters)</label>
          <input
            type="number"
            value={radius}
            onChange={(e) => onRadiusChange(parseInt(e.target.value, 10))}
            style={invalidFields.radius ? { border: '1px solid #b00020' } : {}}
          />
        </div>
      </div>
      <button onClick={handleUpdate}>Validate</button>
      {validationErrors.map((msg, idx) => <ErrorMessage key={idx} message={msg} />)}
      {/* We can add a map here later to visually select the location */}
    </div>
  );
};

export default GeoFenceForm;
