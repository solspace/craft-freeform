import React from 'react';

import { MaxInput, MinInput, Wrapper } from './min-max-values.styles';

type Props = {
  value: number[];
  allowNegative?: boolean;
  onChange: (value: number[]) => void;
};

const MinMaxValues: React.FC<Props> = ({ value, allowNegative, onChange }) => {
  const [min, max] = value;

  const map = new Map();
  map.set('min', min);
  map.set('max', max);

  const minInputValue = !allowNegative ? 0 : null;

  /**
   * @param key
   * @param value
   */
  const setValue = (key: string, value: string): void => {
    // TODO - Figure out if we validate values here or server side
    map.set(key, value.length > 0 ? Number(value) : null);

    onChange([map.get('min'), map.get('max')]);
  };

  return (
    <Wrapper>
      <div>
        <MinInput
          id="min"
          type="number"
          className="text"
          placeholder="Min"
          min={minInputValue}
          value={min}
          onChange={(event) => setValue('min', event.target.value)}
        />
      </div>
      <div>
        <MaxInput
          id="max"
          type="number"
          className="text"
          placeholder="Max"
          min={minInputValue}
          value={max}
          onChange={(event) => setValue('max', event.target.value)}
        />
      </div>
    </Wrapper>
  );
};

export default MinMaxValues;
