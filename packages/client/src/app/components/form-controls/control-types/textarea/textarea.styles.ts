import styled from "styled-components";

export const TextArea = styled.textarea`
  &.read-only {
    border: 1px solid var(--c-color-neutral-border-quiet);
    color: var(--c-text-quiet);

    user-select: none;
  }
`;
