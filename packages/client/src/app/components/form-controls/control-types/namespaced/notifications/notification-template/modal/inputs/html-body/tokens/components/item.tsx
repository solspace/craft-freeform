import React, { useEffect, useRef } from 'react';
import classes from '@ff-client/utils/classes';

import type { Suggestion } from '../operations/suggestions';

import { ItemWrapper } from './item.styles';

type Props = {
  item: Suggestion;
  onClick?: (item: Suggestion) => void;
};

export const Item: React.FC<Props> = ({ item, onClick }) => {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (item.active && ref.current) {
      ref.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [item]);

  return (
    <ItemWrapper
      ref={ref}
      className={classes(item?.active && 'active')}
      onClick={() => onClick?.(item)}
    >
      {item.label}
    </ItemWrapper>
  );
};
