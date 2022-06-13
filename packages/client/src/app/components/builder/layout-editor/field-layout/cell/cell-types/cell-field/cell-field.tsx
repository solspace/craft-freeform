import React from 'react';

type Props = {
  fieldUid: string;
};

export const CellField: React.FC<Props> = ({ fieldUid }) => {
  return <div>{fieldUid}</div>;
};
