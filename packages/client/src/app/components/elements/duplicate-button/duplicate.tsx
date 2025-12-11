import React, { useRef } from 'react';
import { useHover } from '@ff-client/hooks/use-hover';

import { useDuplicateAnimation } from './duplicate.animations';
import { DuplicateButtonWrapper } from './duplicate.styles';
import DuplicateIcon from './duplicate.svg';

type Props = {
  active: boolean;
  onClick?: () => void;
};

export const DuplicateButton: React.FC<
  Props & React.ComponentProps<typeof DuplicateButtonWrapper>
> = ({ active, onClick, ...rest }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const hovering = useHover(ref);

  const animation = useDuplicateAnimation({ active, hovering });
  const style = { ...animation, ...rest?.style };

  delete rest.style;

  return (
    <DuplicateButtonWrapper
      ref={ref}
      style={style}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
      {...rest}
    >
      <DuplicateIcon />
    </DuplicateButtonWrapper>
  );
};
