import React from 'react';
import type { OpeningTimesBlock } from '../../interfaces';
import './EditorStyles.css';

interface OpeningTimesFormProps {
  block: OpeningTimesBlock;
  onChange: (updatedBlock: OpeningTimesBlock) => void;
}

const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const OpeningTimesForm: React.FC<OpeningTimesFormProps> = ({ block, onChange }) => {
    const handleTimeChange = (index: number, field: string, value: string) => {
        const newTimes = [...block.times];
        newTimes[index] = { ...newTimes[index], [field]: value };
        onChange({ ...block, times: newTimes });
    };

    const handleAddTime = () => {
        const nextDay = weekDays[block.times.length % weekDays.length];
        onChange({ ...block, times: [...block.times, { day: nextDay, opens: '', closes: '' }] });
    };

    const handleRemoveTime = (index: number) => {
        onChange({ ...block, times: block.times.filter((_, i) => i !== index) });
    };

    return (
        <div className="block-form">
            <h4>Opening Times Block</h4>
            {block.times.map((time, index) => (
                <div key={index} className="form-group-box">
                    <label>Entry #{index + 1}</label>
                    <div className="form-grid">
                        <select value={time.day} onChange={e => handleTimeChange(index, 'day', e.target.value)}>
                            {weekDays.map(day => <option key={day} value={day}>{day}</option>)}
                        </select>
                        <input type="text" placeholder="Opening Time" value={time.opens} onChange={e => handleTimeChange(index, 'opens', e.target.value)} />
                        <input type="text" placeholder="Closing Time" value={time.closes} onChange={e => handleTimeChange(index, 'closes', e.target.value)} />
                    </div>
                    <button className="remove-btn" onClick={() => handleRemoveTime(index)}>Remove</button>
                </div>
            ))}
            <button className="add-btn" onClick={handleAddTime}>Add Time Entry</button>
        </div>
    );
};

export default OpeningTimesForm;
