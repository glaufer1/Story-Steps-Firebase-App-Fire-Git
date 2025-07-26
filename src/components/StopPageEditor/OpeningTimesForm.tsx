import React, { useState } from 'react';
import { OpeningTimesBlock } from '../../interfaces';
import * as yup from 'yup';

interface OpeningTimesFormProps {
  block: OpeningTimesBlock;
  onUpdate: (block: OpeningTimesBlock) => void;
  onDelete: () => void;
}

const timeSchema = yup.object().shape({
  day: yup.string().required('Day is required'),
  open: yup.string().required('Opening time is required'),
  close: yup.string().required('Closing time is required'),
}).test('open-before-close', 'Open time must be before close time', function (value: any) {
  if (!value.open || !value.close) return true;
  return value.open < value.close;
});

const schema = yup.object().shape({
  times: yup.array().of(timeSchema),
});

const OpeningTimesForm: React.FC<OpeningTimesFormProps> = ({ block, onUpdate, onDelete }) => {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { times } = block;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await schema.validate(block, { abortEarly: false });
      onUpdate(block);
      setValidationErrors([]);
    } catch (validationErr: any) {
      if (validationErr?.inner) {
        const invalids = validationErr.inner
          .filter((e: any) => e.path && e.path.startsWith('times['))
          .map((e: any) => parseInt(e.path.replace(/[^0-9]/g, ''), 10));
        setValidationErrors(invalids.map((i: number) => `Invalid time at position ${i + 1}`));
      } else {
        setValidationErrors(validationErr.errors || ['Validation failed']);
      }
    }
  };

  const handleTimeChange = (index: number, field: keyof typeof times[0], value: string) => {
    const newTimes = [...times];
    newTimes[index] = { ...newTimes[index], [field]: value };
    onUpdate({ ...block, times: newTimes });
  };

  const removeTime = (index: number) => {
    const newTimes = times.filter((_: any, i: number) => i !== index);
    onUpdate({ ...block, times: newTimes });
  };

  const addTime = () => {
    onUpdate({
      ...block,
      times: [...times, { day: '', open: '', close: '' }],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="opening-times-form">
      {times.map((time: { day: string; open: string; close: string }, index: number) => (
        <div key={index} className="time-group">
          <div className="form-group">
            <label htmlFor={`day-${index}`}>Day:</label>
            <input
              type="text"
              id={`day-${index}`}
              value={time.day}
              onChange={(e) => handleTimeChange(index, 'day', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor={`open-${index}`}>Opening Time:</label>
            <input
              type="time"
              id={`open-${index}`}
              value={time.open}
              onChange={(e) => handleTimeChange(index, 'open', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor={`close-${index}`}>Closing Time:</label>
            <input
              type="time"
              id={`close-${index}`}
              value={time.close}
              onChange={(e) => handleTimeChange(index, 'close', e.target.value)}
            />
          </div>
          <button type="button" onClick={() => removeTime(index)}>Remove Time</button>
        </div>
      ))}

      <button type="button" onClick={addTime}>Add Time</button>

      {validationErrors.length > 0 && (
        <div className="validation-errors">
          {validationErrors.map((error, index) => (
            <p key={index} className="error">{error}</p>
          ))}
        </div>
      )}

      <div className="form-actions">
        <button type="submit">Save</button>
        <button type="button" onClick={onDelete}>Delete</button>
      </div>
    </form>
  );
};

export default OpeningTimesForm;
