import React, { useState } from 'react';
import type { OpeningTimesBlock } from '../../interfaces';

interface OpeningTimesFormProps {
  block: OpeningTimesBlock;
  onUpdate: (block: OpeningTimesBlock) => void;
}

const OpeningTimesForm: React.FC<OpeningTimesFormProps> = ({ block, onUpdate }) => {
  const [times, setTimes] = useState(block.times);

  const handleTimeChange = (index: number, field: 'day' | 'open' | 'close', value: string) => {
    const newTimes = [...times];
    newTimes[index][field] = value;
    setTimes(newTimes);
    onUpdate({ ...block, times: newTimes });
  };

  const addTime = () => {
    const newTimes = [...times, { day: '', open: '', close: '' }];
    setTimes(newTimes);
    onUpdate({ ...block, times: newTimes });
  };

  const removeTime = (index: number) => {
    const newTimes = times.filter((_, i) => i !== index);
    setTimes(newTimes);
    onUpdate({ ...block, times: newTimes });
  };

  return (
    <div>
      {times.map((time, index) => (
        <div key={index}>
          <input
            type="text"
            value={time.day}
            onChange={(e) => handleTimeChange(index, 'day', e.target.value)}
            placeholder="Day"
          />
          <input
            type="text"
            value={time.open}
            onChange={(e) => handleTimeChange(index, 'open', e.target.value)}
            placeholder="Open"
          />
          <input
            type="text"
            value={time.close}
            onChange={(e) => handleTimeChange(index, 'close', e.target.value)}
            placeholder="Close"
          />
          <button onClick={() => removeTime(index)}>Remove</button>
        </div>
      ))}
      <button onClick={addTime}>Add Time</button>
    </div>
  );
};

export default OpeningTimesForm;
