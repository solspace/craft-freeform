import React, { useState } from 'react';

import DeleteIcon from './delete.svg';
import { useRemoveAnimation } from './remove.animations';
import { RemoveButtonWrapper } from './remove.styles';

type Props = {
  onClick: () => void;
};

export const Remove: React.FC<Props> = ({ onClick }) => {
  const [hovering, setHovering] = useState(false);
  const animation = useRemoveAnimation({ hovering });

  return (
    <RemoveButtonWrapper
      style={animation}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onClick={onClick}
    >
      <DeleteIcon />
    </RemoveButtonWrapper>
  );
};
