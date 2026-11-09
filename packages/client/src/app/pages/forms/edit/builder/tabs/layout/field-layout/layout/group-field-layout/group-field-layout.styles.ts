import { borderRadius, colors } from "@ff-client/styles/variables";
import { animated } from "@react-spring/web";
import styled from "styled-components";

export const GroupFieldLayoutWrapper = styled.div`
  position: relative;
  flex-grow: 1;

  height: 100%;
  padding: 8px;

  border: 1px solid light-dark(#f2f4f7, ${colors.border});
  border-radius: ${borderRadius.lg};
  background-color: light-dark(#fcfdfe, ${colors.surface});

  &[data-form-section='true'] {
    height: auto;
    min-height: 64px;
    flex-grow: 0;
    border-color: transparent;
    background-color: transparent;
  }
`;

export const GroupDropZone = styled(animated.div)`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  overflow: hidden;

  background-color: ${colors.gray050};
  border: 1px solid transparent;
  border-radius: ${borderRadius.sm};

  font-size: 12px;
  line-height: 12px;

  text-align: center;
  font-family: monospace;
`;

export const EmptyLayout = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  min-height: 40px;
  height: 100%;

  color: light-dark(${colors.gray200}, ${colors.muted});
  font-size: 18px;
  text-align: center;
`;
