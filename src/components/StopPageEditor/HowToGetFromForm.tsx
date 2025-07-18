import React, { useRef, useEffect, useCallback } from 'react';
import type { HowToGetFromBlock } from '../../interfaces';
import Map, { Marker } from 'react-map-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import './EditorStyles.css';
import { v4 as uuidv4 } from 'uuid';

interface HowToGetFromFormProps {
  block: HowToGetFromBlock;
  onChange: (updatedBlock: HowToGetFromBlock) => void;
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN;
const PinColors = ['Blue', 'Yellow', 'Green', 'Red', 'Purple', 'Orange'];

const HowToGetFromForm: React.FC<HowToGetFromFormProps> = ({ block, onChange }) => {
  const mapRef = useRef<any>();
  
  const onMapLoad = useCallback(() => {
    if (mapRef.current) {
        const map = mapRef.current.getMap();
        const draw = new MapboxDraw({
            displayControlsDefault: false,
            controls: { line_string: true, trash: true },
        });
        map.addControl(draw, 'top-left');

        const updateRouteData = () => {
            const data = draw.getAll();
            onChange({ ...block, routeData: data });
        };

        map.on('draw.create', updateRouteData);
        map.on('draw.delete', updateRouteData);
        map.on('draw.update', updateRouteData);

        if (block.routeData && block.routeData.features.length > 0) {
            draw.add(block.routeData);
        }
    }
  }, [block, onChange]);
  
  const handleAddPin = () => {
    const map = mapRef.current.getMap();
    const center = map.getCenter();
    const newPin = {
      id: uuidv4(),
      latitude: center.lat,
      longitude: center.lng,
      color: 'Blue'
    };
    onChange({ ...block, pins: [...block.pins, newPin] });
  };
  
  const handlePinDragEnd = (index: number, e: any) => {
    const { lng, lat } = e.lngLat;
    const newPins = [...block.pins];
    newPins[index] = { ...newPins[index], longitude: lng, latitude: lat };
    onChange({ ...block, pins: newPins });
  };

  const handlePinColorChange = (index: number, color: string) => {
    const newPins = [...block.pins];
    newPins[index] = { ...newPins[index], color: color };
    onChange({ ...block, pins: newPins });
  }

  const handleRemovePin = (index: number) => {
      const newPins = block.pins.filter((_, i) => i !== index);
      onChange({ ...block, pins: newPins });
  }

  return (
    <div className="block-form">
      <h4>'How To Get From' Block</h4>
      <p>Use the tools in the top-left to draw/edit the route. Add and drag pins as needed.</p>
      
      <div className="pin-controls">
          <button onClick={handleAddPin} className="add-btn">Add Pin</button>
      </div>

      <div className="map-container-form" style={{ height: 500 }}>
        <Map
          ref={mapRef}
          initialViewState={{ longitude: -98.5795, latitude: 39.8283, zoom: 3 }}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/streets-v9"
          mapboxAccessToken={MAPBOX_TOKEN}
          onLoad={onMapLoad}
        >
          {block.pins.map((pin, index) => (
            <Marker
              key={pin.id}
              longitude={pin.longitude}
              latitude={pin.latitude}
              draggable
              onDragEnd={(e) => handlePinDragEnd(index, e)}
            >
                <div className="map-pin" style={{backgroundColor: pin.color.toLowerCase()}} />
            </Marker>
          ))}
        </Map>
      </div>

      <div className="pin-list">
          {block.pins.map((pin, index) => (
              <div key={pin.id} className="pin-editor">
                  <span>Pin #{index + 1}</span>
                  <select value={pin.color} onChange={(e) => handlePinColorChange(index, e.target.value)}>
                      {PinColors.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <button className="remove-btn" onClick={() => handleRemovePin(index)}>Remove</button>
              </div>
          ))}
      </div>
    </div>
  );
};

export default HowToGetFromForm;
