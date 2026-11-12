import { sectionHeading } from "@ff-client/styles/craft6";
import { borderRadius, colors, spacings } from "@ff-client/styles/variables";
import { animated } from "@react-spring/web";
import styled from "styled-components";

export const ModalHub = styled.div``;

export const ModalOverlay = styled(animated.div)`
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 1000;

  background-color: var(--c-surface-shade);

  &.inactive {
    pointer-events: none;
  }
`;

export const ModalWrapper = styled(animated.div)`
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 1001;

  display: flex;
  justify-content: center;
  align-items: center;
`;

export const ModalContainer = styled.div`

  width: 100%;
  max-width: 500px;

  background-color: light-dark(#fff, var(--modal-bg, #fff));
  border-radius: ${borderRadius.lg};
  box-shadow: var(--modal-shadow, 0 25px 100px rgba(31, 41, 51, .5));
`;

export const ModalHeader = styled.header`
  padding: ${spacings.lg} ${spacings.xl};

  background-color: var(--c-modal-fill);
  box-shadow: inset 0 -1px 0 ${colors.hairline};

  border-radius: ${borderRadius.lg} ${borderRadius.lg} 0 0;
  h1 { ${sectionHeading}; margin: 0; }
`;

export const ModalFooter = styled.footer`
  display: flex;
  justify-content: end;
  align-items: center;
  gap: ${spacings.sm};

  padding: ${spacings.sm} ${spacings.xl};

  background-color: var(--c-modal-fill);
  box-shadow: inset 0 1px 0 ${colors.hairline};

  border-radius: 0 0 ${borderRadius.lg} ${borderRadius.lg};
`;
