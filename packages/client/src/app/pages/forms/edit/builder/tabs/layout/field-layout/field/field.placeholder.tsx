import React from 'react';
import { animated, useSpring } from 'react-spring';
import { borderRadius } from '@ff-client/styles/variables';
import styled from 'styled-components';

type Props = {
  isActive: boolean;
  hoverPosition: number;
  fieldWidth: number;
};

const FieldDragPlaceholderContainer = styled(animated.div)`
  position: absolute;
  top: 0;
  bottom: 0;

  pointer-events: none;
  user-select: none;

  background-color: #e9effd;
  border: 1px dashed #c3c3c3;
  border-radius: ${borderRadius.md};
`;

export const FieldDragPlaceholder: React.FC<Props> = ({
  isActive,
  hoverPosition = 0,
  fieldWidth = 1000,
}) => {
  const style = useSpring({
    opacity: isActive ? 1 : 0,
    x: hoverPosition * fieldWidth,
    scale: isActive ? 1 : 0,
    width: fieldWidth,
    config: {
      tension: 700,
      mass: 0.5,
    },
  });

  return <FieldDragPlaceholderContainer style={style} />;
};
