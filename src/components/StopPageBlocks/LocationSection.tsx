import React from 'react';
import type { LocationBlock } from '../../interfaces';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const LocationSection: React.FC<{ block: LocationBlock }> = ({ block }) => {
  const position = { lat: block.latitude, lng: block.longitude };

  return (
    <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={position}
        zoom={15}
        mapTypeId={block.mapType || 'roadmap'}
      >
        <Marker position={position} />
      </GoogleMap>
    </LoadScript>
  );
};

export default LocationSection;
