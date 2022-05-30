import React, { MouseEventHandler } from 'react';

import CloseIcon from '@ff-client/app/components/builder/assets/close-icon.svg';

import { Button } from './close-button.styles';

type Props = {
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

export const CloseButton: React.FC<Props> = ({ onClick }) => {
  return (
    <Button onClick={onClick}>
      <CloseIcon />
    </Button>
  );
};
