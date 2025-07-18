import React from 'react';
import { HowToGetFromBlock } from '../../interfaces';
import Map, { Marker, Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './BlockStyles.css';

interface HowToGetFromSectionProps {
  block: HowToGetFromBlock;
  userLocation?: { latitude: number; longitude: number };
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN;

const HowToGetFromSection: React.FC<HowToGetFromSectionProps> = ({ block, userLocation }) => {

  const routeLayer: any = {
    id: 'route',
    type: 'line',
    source: 'route',
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: { 'line-color': '#007bff', 'line-width': 5 }
  };
  
  if (!MAPBOX_TOKEN) {
    return <div className="error-message">Mapbox token is not configured.</div>;
  }

  return (
    <div className="stop-page-block">
      <div className="map-container">
        <Map
          initialViewState={{
            longitude: block.pins[0]?.longitude || -74.0060,
            latitude: block.pins[0]?.latitude || 40.7128,
            zoom: 13
          }}
          style={{ width: '100%', height: 400, borderRadius: '8px' }}
          mapStyle="mapbox://styles/mapbox/streets-v9"
          mapboxAccessToken={MAPBOX_TOKEN}
        >
          <Source id="route" type="geojson" data={block.routeData}>
            <Layer {...routeLayer} />
          </Source>

          {block.pins.map(pin => (
            <Marker key={pin.id} longitude={pin.longitude} latitude={pin.latitude} color={pin.color.toLowerCase()} />
          ))}

          {userLocation && (
            <Marker longitude={userLocation.longitude} latitude={userLocation.latitude} color="blue" />
          )}
        </Map>
      </div>
    </div>
  );
};

export default HowToGetFromSection;
