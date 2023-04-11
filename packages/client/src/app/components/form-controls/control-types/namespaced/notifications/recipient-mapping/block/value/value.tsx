import React from 'react';

type Props = {
  predefined: boolean;
  value: string;
};

export const Value: React.FC<Props> = ({ predefined, value }) => {
  return <input type="text" value={value} />;
};
