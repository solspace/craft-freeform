import React from 'react';
import { useFetchFieldPropertySections } from '@ff-client/queries/field-types';

import { BaseFields } from './implementations/base-fields/base-fields';
import { FavoriteFields } from './implementations/favorite-fields/favorite-fields';
import { Search } from './search/search';
import { FieldListWrapper } from './field-list.styles';

export const FieldList: React.FC = () => {
  useFetchFieldPropertySections();

  return (
    <FieldListWrapper>
      <Search />
      <FavoriteFields />
      <BaseFields />
    </FieldListWrapper>
  );
};
