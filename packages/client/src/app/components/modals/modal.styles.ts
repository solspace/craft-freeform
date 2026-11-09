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

  background-color: light-dark(rgba(123, 135, 147, 0), var(--shade-bg, rgba(31, 41, 51, .5)));

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
  :root[data-dark-mode="dark"] & .react-loading-skeleton {
    --base-color: var(--ui-control-bg-color) !important;
    --highlight-color: var(--ui-control-hover-bg-color) !important;
  }

  width: 100%;
  max-width: 500px;

  background-color: light-dark(#fff, var(--modal-bg, #fff));
  border-radius: ${borderRadius.lg};
  box-shadow: var(--modal-shadow, 0 25px 100px rgba(31, 41, 51, .5));
  :root:not([data-dark-mode="dark"]) & {
    box-shadow: 0 25px 100px rgba(31, 41, 51, 0.5);
  };
`;

export const ModalHeader = styled.header`
  padding: ${spacings.lg} ${spacings.xl};

  background-color: ${colors.gray100};
  box-shadow: inset 0 -1px 0 ${colors.hairline};

  border-radius: ${borderRadius.lg} ${borderRadius.lg} 0 0;
`;

export const ModalFooter = styled.footer`
  display: flex;
  justify-content: end;
  align-items: center;
  gap: ${spacings.sm};

  padding: ${spacings.sm} ${spacings.xl};

  background-color: ${colors.gray100};
  box-shadow: inset 0 1px 0 ${colors.hairline};

  border-radius: 0 0 ${borderRadius.lg} ${borderRadius.lg};
`;
