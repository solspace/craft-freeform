import React from 'react';

import { LoaderFieldLayout } from './field-layout/field-layout.loader';
import { LoaderFieldList } from './field-list/field-list.loader';

export const LoaderFormLayout: React.FC = () => {
  return (
    <>
      <LoaderFieldList />
      <LoaderFieldLayout />
    </>
  );
};
