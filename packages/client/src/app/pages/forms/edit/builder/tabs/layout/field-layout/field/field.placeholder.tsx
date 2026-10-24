import { borderRadius } from "@ff-client/styles/variables";
import { animated, useSpring } from "@react-spring/web";
import type React from "react";
import styled from "styled-components";

type Props = {
  isActive: boolean;
  hoverPosition: number;
  fieldWidth: number;
  sectionHeight?: number;
  sectionLabel?: string;
  sectionPreview?: string;
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
  display: flex; align-items: center; justify-content: center;
  color: #647d99; font-size: 12px;
  img { width: 240px; max-width: 85%; max-height: 85%; object-fit: contain; }
`;

export const FieldDragPlaceholder: React.FC<Props> = ({
  isActive,
  hoverPosition = 0,
  fieldWidth = 1000,
  sectionHeight = 0,
  sectionLabel,
  sectionPreview,
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

  return (
    <FieldDragPlaceholderContainer
      style={{ ...style, minHeight: isActive ? sectionHeight : undefined }}
      aria-hidden="true"
    >
      {sectionPreview ? <img src={sectionPreview} alt="" /> : sectionLabel}
    </FieldDragPlaceholderContainer>
  );
};
