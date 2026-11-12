import styled from "styled-components";
import { Wrapper as BannerWrapper } from "../error/error-block.styles";

export const Wrapper = styled(BannerWrapper)`
  color: var(--c-color-info-on-quiet);
  background-color: var(--c-color-info-fill-quiet);
  border-color: var(--c-color-info-border-normal);
  border-inline-start-color: var(--c-color-info-border-loud);

  > svg {
    color: inherit;
    fill: none;
  }
`;
