import React from 'react';
import { useFetchFieldPropertySections } from '@ff-client/queries/field-types';

import { FieldGroup } from './field-group/field-group';
import { Search } from './search/search';
import { FieldListWrapper } from './field-list.styles';

export const FieldList: React.FC = () => {
  useFetchFieldPropertySections();

  return (
    <FieldListWrapper>
      <Search />
      <FieldGroup title="Base Fields" />
    </FieldListWrapper>
  );
};
