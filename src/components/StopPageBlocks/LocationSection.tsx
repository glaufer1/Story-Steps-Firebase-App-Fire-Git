import React from 'react';
import type { LocationBlock } from '../../interfaces';
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './BlockStyles.css';
import { MAPBOX_TOKEN } from '../../constants';

interface LocationSectionProps {
  block: LocationBlock;
}

const LocationSection: React.FC<LocationSectionProps> = ({ block }) => {
  const buttonLabel = `Get Directions to ${block.mapType}`;
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${block.latitude},${block.longitude}`;

  if (!MAPBOX_TOKEN) {
    return <div className="error-message">Mapbox token is not configured.</div>;
  }

  return (
    <div className="stop-page-block location-section">
      <div className="map-container">
        <Map
          initialViewState={{
            longitude: block.longitude,
            latitude: block.latitude,
            zoom: 14
          }}
          style={{ width: '100%', height: 250, borderRadius: '8px' }}
          mapStyle="mapbox://styles/mapbox/streets-v9"
          mapboxAccessToken={MAPBOX_TOKEN}
          interactive={false}
        >
          <Marker longitude={block.longitude} latitude={block.latitude} />
        </Map>
      </div>
      <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="link-btn directions-btn">
        {buttonLabel}
      </a>
    </div>
  );
};

export default LocationSection;
