import { editorButton, sectionHeading } from "@ff-client/styles/craft6";
import { shadows, spacings } from "@ff-client/styles/variables";
import { animated } from "@react-spring/web";
import styled from "styled-components";

type PropertyEditorProps = {
  $active?: boolean;
};

export const PropertyEditorWrapper = styled.div<PropertyEditorProps>`
  position: absolute;

  left: 0;
  top: 0;
  right: 0;
  bottom: 0;

  z-index: 2;

  overflow: hidden;

  pointer-events: ${({ $active }) => ($active ? "auto" : "none")};
  background: ${({ $active }) => ($active ? "var(--background-color)" : "transparent")};

  transition: background-color 0.2s ease-in-out;
`;

export const AnimatedBlock = styled(animated.div)`
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;

  z-index: 2;
`;

export const CloseLink = styled.button.attrs({ type: "button" })`
  position: absolute;
  right: var(--c-spacing-md);
  top: var(--c-spacing-md);

  z-index: 5;

  ${editorButton}
  width: var(--c-size-control-md);
  height: var(--c-size-control-md);
  padding: 0;
  border-color: transparent;
  background: transparent;
`;

export const Title = styled.h3`
  position: relative;

  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: ${spacings.sm};

  margin: 0;
  min-height: 48px;
  box-sizing: border-box;
  padding: ${spacings.md} 88px ${spacings.md} ${spacings.lg};
  font-size: var(--c-text-base);

  ${sectionHeading}
  box-shadow: ${shadows.bottom};

  > span {
    display: block;
  }
`;

export const Icon = styled.div`
  fill: currentColor;
  display: flex;
  justify-content: center;
  align-items: center;

  width: 20px;
  height: 20px;

  svg {
    max-width: 20px;
    max-height: 20px;
  }
`;
