import React from 'react';
import type { APIError } from '@ff-client/types/api';

type Props = {
  category: string;
  handle: string;
  error: APIError;
};

export const ApiErrorsBlock: React.FC<Props> = ({
  category,
  handle,
  error,
}) => {
  const list = error.errors?.[category]?.[handle];

  if (!list) {
    return null;
  }

  return (
    <ul className="errors">
      {list.map((error, idx) => (
        <li key={idx}>
          <span className="visually-hidden">Error:</span>
          {error}
        </li>
      ))}
    </ul>
  );
};
