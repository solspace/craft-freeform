import React from 'react';

import { useImportPreviewQuery } from '../../import.queries';
import { CommonImportView } from '../common/common';

export const ImportFormie: React.FC = () => {
  const { data, isFetching } = useImportPreviewQuery('/import/formie/preview');

  return <CommonImportView data={data} isFetching={isFetching} />;
};
