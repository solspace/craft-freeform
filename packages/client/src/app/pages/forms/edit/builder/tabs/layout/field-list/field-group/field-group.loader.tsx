import React from 'react';
import Skeleton from 'react-loading-skeleton';
import { range } from '@ff-client/utils/arrays';

import { LoaderFieldItem } from './field/field.loader';
import { FieldGroupWrapper, GroupTitle, List } from './field-group.styles';

type Props = {
  words: number[];
  items: number;
};

export const LoaderFieldGroup: React.FC<Props> = ({ words, items }) => {
  return (
    <FieldGroupWrapper>
      <GroupTitle>
        {words.map((word, index) => (
          <Skeleton
            key={index}
            width={word}
            height={16}
            inline
            style={{ marginRight: 8 }}
          />
        ))}
      </GroupTitle>
      <List>
        {range(items).map((i) => (
          <LoaderFieldItem key={i} />
        ))}
      </List>
    </FieldGroupWrapper>
  );
};
