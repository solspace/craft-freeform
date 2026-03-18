import { DuplicateButtonWrapper } from "@components/elements/duplicate-button/duplicate.styles";
import { RemoveButtonWrapper } from "@components/elements/remove-button/remove.styles";
import { animated } from "@react-spring/web";
import styled from "styled-components";

export const FieldWrapper = styled(animated.div)`
  position: relative;

  &,
  * {
    cursor: pointer;
  }

  ${RemoveButtonWrapper} {
    position: absolute;
    top: 4px;
    right: 4px;
    z-index: 2;
  }

  ${DuplicateButtonWrapper} {
    position: absolute;
    top: 4px;
    right: 28px;
    z-index: 2;
  }
`;
