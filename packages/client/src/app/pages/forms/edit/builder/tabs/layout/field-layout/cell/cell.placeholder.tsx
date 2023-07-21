import React from 'react';
import { animated, useSpring } from 'react-spring';
import { borderRadius } from '@ff-client/styles/variables';
import styled from 'styled-components';

type Props = {
  isActive: boolean;
  hoverPosition: number;
  cellWidth: number;
};

const CellDragPlaceholderContainer = styled(animated.div)`
  position: absolute;
  top: 0;
  bottom: 0;

  pointer-events: none;
  user-select: none;

  background-color: #e9effd;
  border: 1px dashed #c3c3c3;
  border-radius: ${borderRadius.md};
`;

export const CellDragPlaceholder: React.FC<Props> = ({
  isActive,
  hoverPosition,
  cellWidth,
}) => {
  const style = useSpring({
    opacity: isActive ? 1 : 0,
    x: hoverPosition * cellWidth,
    scale: isActive ? 1 : 0,
    width: cellWidth,
    config: {
      tension: 700,
      mass: 0.5,
    },
  });

  return <CellDragPlaceholderContainer style={style} />;
};
