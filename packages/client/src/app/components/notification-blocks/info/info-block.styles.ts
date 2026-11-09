import { colors } from "@ff-client/styles/variables";
import styled from "styled-components";
import { Wrapper as BannerWrapper } from "../error/error-block.styles";

export const Wrapper = styled(BannerWrapper)`
  color: var(--fg-notice, var(--notice-color, ${colors.blue900}));
  background-color: var(--bg-notice, var(--notice-background, #eef6ff));
  border-color: var(--border-notice, var(--notice-border-color, #bfd9f7));
  border-inline-start-color: ${colors.link};

  > svg {
    color: ${colors.link};
    fill: none;
  }
`;
