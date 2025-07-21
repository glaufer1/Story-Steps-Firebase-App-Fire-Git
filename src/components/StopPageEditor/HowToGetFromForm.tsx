import React, { useState } from 'react';
import type { HowToGetFromBlock, Pin } from '../../interfaces';

interface HowToGetFromFormProps {
  block: HowToGetFromBlock;
  onUpdate: (block: HowToGetFromBlock) => void;
}

const HowToGetFromForm: React.FC<HowToGetFromFormProps> = ({ block, onUpdate }) => {
  const [pins, setPins] = useState(block.pins);

  const handlePinChange = (index: number, field: keyof Pin, value: any) => {
    const newPins = [...pins];
    (newPins[index] as any)[field] = value;
    setPins(newPins);
    onUpdate({ ...block, pins: newPins });
  };

  const addPin = () => {
    const newPin: Pin = {
      id: `pin-${Date.now()}`,
      label: '',
      latitude: 0,
      longitude: 0,
      color: '#FF0000'
    };
    setPins([...pins, newPin]);
  };

  const removePin = (index: number) => {
    const newPins = pins.filter((_, i) => i !== index);
    setPins(newPins);
    onUpdate({ ...block, pins: newPins });
  };

  return (
    <div>
      {pins.map((pin, index) => (
        <div key={pin.id}>
          <input
            type="text"
            value={pin.label}
            onChange={(e) => handlePinChange(index, 'label', e.target.value)}
            placeholder="Pin Label"
          />
          <input
            type="number"
            value={pin.latitude}
            onChange={(e) => handlePinChange(index, 'latitude', parseFloat(e.target.value))}
            placeholder="Latitude"
          />
          <input
            type="number"
            value={pin.longitude}
            onChange={(e) => handlePinChange(index, 'longitude', parseFloat(e.target.value))}
            placeholder="Longitude"
          />
          <input
            type="color"
            value={pin.color}
            onChange={(e) => handlePinChange(index, 'color', e.target.value)}
          />
          <button onClick={() => removePin(index)}>Remove</button>
        </div>
      ))}
      <button onClick={addPin}>Add Pin</button>
    </div>
  );
};

export default HowToGetFromForm;
