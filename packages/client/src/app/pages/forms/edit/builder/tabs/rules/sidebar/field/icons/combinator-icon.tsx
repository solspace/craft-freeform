import React from 'react';
import { Combinator } from '@ff-client/types/rules';

import AllIcon from './all.svg';
import AnyIcon from './any.svg';

type Props = {
  combinator?: Combinator;
};

export const CombinatorIcon: React.FC<Props> = ({ combinator }) => {
  switch (combinator) {
    case Combinator.And:
      return <AllIcon />;

    case Combinator.Or:
      return <AnyIcon />;
  }

  return null;
};
