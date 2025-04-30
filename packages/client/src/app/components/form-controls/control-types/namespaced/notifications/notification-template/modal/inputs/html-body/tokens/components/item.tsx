import React from 'react';
import classes from '@ff-client/utils/classes';

import type { Suggestion } from '../operations/suggestions';

import { ItemWrapper } from './item.styles';

type Props = {
  item: Suggestion;
};

export const Item: React.FC<Props> = ({ item }) => {
  return (
    <ItemWrapper className={classes(item?.active && 'active')}>
      <label>{item.label}</label>
    </ItemWrapper>
  );
};
