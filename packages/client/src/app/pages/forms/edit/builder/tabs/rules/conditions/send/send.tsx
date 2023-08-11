import React from 'react';
import translate from '@ff-client/utils/translations';

type Props = {
  value: boolean;
  onChange?: (value: boolean) => void;
};

enum DisplaySendValue {
  Send = 'send',
  NotSend = 'not-send',
}

export const DisplaySend: React.FC<Props> = ({ value, onChange }) => {
  return (
    <div className="select">
      <select
        value={value ? DisplaySendValue.Send : DisplaySendValue.NotSend}
        onChange={(event) =>
          onChange && onChange(event.target.value === DisplaySendValue.Send)
        }
      >
        <option value={DisplaySendValue.Send}>{translate('Send')}</option>
        <option value={DisplaySendValue.NotSend}>
          {translate(`Don't send`)}
        </option>
      </select>
    </div>
  );
};
