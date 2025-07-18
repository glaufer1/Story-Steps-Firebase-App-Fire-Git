import React from 'react';
import { LocationBlock } from '../../interfaces';
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './EditorStyles.css';

interface LocationFormProps {
  block: LocationBlock;
  onChange: (updatedBlock: LocationBlock) => void;
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN;

const LocationForm: React.FC<LocationFormProps> = ({ block, onChange }) => {

  const handleMapClick = (e: any) => {
    const { lng, lat } = e.lngLat;
    onChange({ ...block, longitude: lng, latitude: lat });
  };

  return (
    <div className="block-form">
      <h4>Location Block</h4>
      <div className="form-grid">
        <div>
          <label>Latitude</label>
          <input
            type="number"
            value={block.latitude}
            onChange={(e) => onChange({ ...block, latitude: parseFloat(e.target.value) })}
          />
        </div>
        <div>
          <label>Longitude</label>
          <input
            type="number"
            value={block.longitude}
            onChange={(e) => onChange({ ...block, longitude: parseFloat(e.target.value) })}
          />
        </div>
      </div>
      <p>Click on the map to set the location pin.</p>
      <div className="map-container-form">
        <Map
          initialViewState={{
            longitude: block.longitude || -98.5795, // Default to center of US
            latitude: block.latitude || 39.8283,
            zoom: block.latitude ? 13 : 3 
          }}
          style={{ width: '100%', height: 300, borderRadius: '8px' }}
          mapStyle="mapbox://styles/mapbox/streets-v9"
          mapboxAccessToken={MAPBOX_TOKEN}
          onClick={handleMapClick}
        >
          {block.latitude && block.longitude && (
            <Marker longitude={block.longitude} latitude={block.latitude} />
          )}
        </Map>
      </div>
    </div>
  );
};

export default LocationForm;
