import React from 'react';
import Skeleton from 'react-loading-skeleton';
import { range } from '@ff-client/utils/arrays';

import { LoaderFieldItem } from './field/field.loader';
import { FieldGroupWrapper, GroupTitle, List } from './field-group.styles';

export const LoaderFieldGroup: React.FC = () => {
  return (
    <FieldGroupWrapper>
      <GroupTitle>
        <Skeleton width={50} height={16} inline style={{ marginRight: 8 }} />
        <Skeleton width={70} height={16} inline />
      </GroupTitle>
      <List>
        {range(16).map((i) => (
          <LoaderFieldItem key={i} />
        ))}
      </List>
    </FieldGroupWrapper>
  );
};
