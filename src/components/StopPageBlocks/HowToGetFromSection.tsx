import React from 'react';
import type { HowToGetFromBlock } from '../../interfaces';
import { GoogleMap, LoadScript, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const HowToGetFromSection: React.FC<{ block: HowToGetFromBlock }> = ({ block }) => {
  const [directions, setDirections] = React.useState<google.maps.DirectionsResult | null>(null);

  const waypoints = block.pins.slice(1, -1).map(p => ({ location: { lat: p.latitude, lng: p.longitude }, stopover: true }));

  const directionsCallback = (response: google.maps.DirectionsResult | null, status: google.maps.DirectionsStatus) => {
    if (status === 'OK' && response) {
      setDirections(response);
    }
  };

  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={{ lat: block.pins[0].latitude, lng: block.pins[0].longitude }}
        zoom={10}
      >
        {block.pins.length > 1 && (
          <DirectionsService
            options={{
              origin: { lat: block.pins[0].latitude, lng: block.pins[0].longitude },
              destination: { lat: block.pins[block.pins.length - 1].latitude, lng: block.pins[block.pins.length - 1].longitude },
              waypoints: waypoints,
              travelMode: google.maps.TravelMode.DRIVING
            }}
            callback={directionsCallback}
          />
        )}
        {directions && <DirectionsRenderer options={{ directions }} />}
      </GoogleMap>
    </LoadScript>
  );
};

export default HowToGetFromSection;
