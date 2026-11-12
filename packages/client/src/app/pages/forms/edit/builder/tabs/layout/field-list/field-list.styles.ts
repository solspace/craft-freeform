import { sidebarPadding } from "@components/layout/sidebar/sidebar";
import { scrollBar } from "@ff-client/styles/mixins";
import { animated } from "@react-spring/web";
import styled from "styled-components";

import { Wrapper } from "./field-group/field/field.styles";

export const FieldListWrapper = styled(animated.div)`
  position: relative;
  ${sidebarPadding};
  box-sizing: border-box;

  overflow-y: auto;
  overflow-x: hidden;

  height: 100%;
  background: var(--c-surface-default);
  ${scrollBar};

  &.fields-disabled {
    ${Wrapper} {
      opacity: 0.5;
      user-select: none;
      pointer-events: none;
    }
  }
`;
