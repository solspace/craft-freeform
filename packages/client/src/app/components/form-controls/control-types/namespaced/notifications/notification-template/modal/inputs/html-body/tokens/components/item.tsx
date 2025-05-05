import React from 'react';
import classes from '@ff-client/utils/classes';

import type { Suggestion } from '../operations/suggestions';

import { ItemWrapper } from './item.styles';

type Props = {
  item: Suggestion;
  onClick?: (item: Suggestion) => void;
};

export const Item: React.FC<Props> = ({ item, onClick }) => {
  return (
    <ItemWrapper
      className={classes(item?.active && 'active')}
      onClick={() => onClick?.(item)}
    >
      {item.label}
    </ItemWrapper>
  );
};
