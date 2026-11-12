import { spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

export const ItemWrapper = styled.a`
  cursor: pointer;

  display: block;

  padding: 0 ${spacings.xl} 3px;
  font-size: 14px;

  text-decoration: none;
  color: var(--c-text-default);

  &:hover {
    cursor: pointer;
    background-color: var(--c-color-neutral-fill-quiet);
  }

  &.active {
    background-color: var(--c-color-accent-fill-quiet);
    color: var(--c-color-accent-on-quiet);

    &:hover {
      background-color: var(--c-color-accent-fill-quiet);
    }
  }
`;
