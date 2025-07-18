import React from 'react';
import './EditorStyles.css';

interface GeoFenceFormProps {
  latitude: number;
  longitude: number;
  radius: number;
  onLatitudeChange: (value: number) => void;
  onLongitudeChange: (value: number) => void;
  onRadiusChange: (value: number) => void;
}

const GeoFenceForm: React.FC<GeoFenceFormProps> = ({
  latitude,
  longitude,
  radius,
  onLatitudeChange,
  onLongitudeChange,
  onRadiusChange
}) => {
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
          />
        </div>
        <div>
          <label>Longitude</label>
          <input
            type="number"
            value={longitude}
            onChange={(e) => onLongitudeChange(parseFloat(e.target.value))}
          />
        </div>
        <div>
          <label>Radius (meters)</label>
          <input
            type="number"
            value={radius}
            onChange={(e) => onRadiusChange(parseInt(e.target.value, 10))}
          />
        </div>
      </div>
      {/* We can add a map here later to visually select the location */}
    </div>
  );
};

export default GeoFenceForm;
