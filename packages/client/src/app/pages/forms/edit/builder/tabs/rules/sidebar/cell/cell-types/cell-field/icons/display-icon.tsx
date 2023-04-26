import React from 'react';
import { Display } from '@ff-client/types/rules';

import HideIcon from './hide.svg';
import ShowIcon from './show.svg';

type Props = {
  display?: Display;
};

export const DisplayIcon: React.FC<Props> = ({ display }) => {
  switch (display) {
    case Display.Show:
      return <ShowIcon />;

    case Display.Hide:
      return <HideIcon />;
  }

  return null;
};
