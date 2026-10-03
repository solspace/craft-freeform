import styled from "styled-components";

export const Message = styled.p`
  margin: 0;
  color: var(--c-text-default);
  line-height: var(--c-leading-normal);
  overflow-wrap: anywhere;
`;

export const Actions = styled.div.attrs({ slot: "footer" })`
  display: flex;
  gap: var(--c-spacing-sm);
  justify-content: flex-end;
  flex-wrap: wrap;
`;

export const DeleteButton = styled.button.attrs({
  type: "button",
  className: "btn",
})`
  && {
    background: var(--c-color-danger-fill-loud);
    border: 1px solid transparent;
    color: var(--c-color-danger-on-loud);
  }

  &&:hover {
    background: hsl(from var(--c-color-danger-fill-loud) h s calc(l - 5));
  }

  &&:focus-visible {
    outline: var(--c-focus-outline-width) solid var(--c-color-focus-outline);
    outline-offset: var(--c-focus-outline-offset);
  }
`;
