import React from 'react';
import FieldIcon, { hasFieldIcon } from './FieldIcons';

export const getIcon = (type) => {
  if (hasFieldIcon(type)) {
    return <FieldIcon type={type} />;
  }

  return null;
};
