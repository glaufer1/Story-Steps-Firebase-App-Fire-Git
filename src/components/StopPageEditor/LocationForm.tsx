import React, { useState } from 'react';
import type { LocationBlock } from '../../interfaces';

interface LocationFormProps {
  block: LocationBlock;
  onUpdate: (block: LocationBlock) => void;
}

const LocationForm: React.FC<LocationFormProps> = ({ block, onUpdate }) => {
  const [latitude, setLatitude] = useState(block.latitude);
  const [longitude, setLongitude] = useState(block.longitude);
  const [address, setAddress] = useState(block.address);
  const [mapType, setMapType] = useState(block.mapType);

  const handleUpdate = () => {
    onUpdate({ ...block, latitude, longitude, address, mapType });
  };

  return (
    <div>
      <input
        type="number"
        value={latitude}
        onChange={(e) => setLatitude(parseFloat(e.target.value))}
        placeholder="Latitude"
      />
      <input
        type="number"
        value={longitude}
        onChange={(e) => setLongitude(parseFloat(e.target.value))}
        placeholder="Longitude"
      />
      <input
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Address"
      />
      <input
        type="text"
        value={mapType}
        onChange={(e) => setMapType(e.target.value)}
        placeholder="Map Type (e.g. roadmap, satellite)"
      />
      <button onClick={handleUpdate}>Update</button>
    </div>
  );
};

export default LocationForm;
