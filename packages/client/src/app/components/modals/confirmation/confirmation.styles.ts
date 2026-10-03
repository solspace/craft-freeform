import styled, { createGlobalStyle } from "styled-components";

export const DialogStyles = createGlobalStyle`
  craft-dialog.ff-delete-confirmation::part(surface) {
    background: var(--c-modal-fill);
    color: var(--c-modal-text);
    border-radius: var(--c-modal-radius);
    border: var(--c-modal-border-width) var(--c-modal-border-style) var(--c-modal-border-color);
    box-shadow: var(--c-modal-shadow);
  }

  craft-dialog.ff-delete-confirmation::part(header),
  craft-dialog.ff-delete-confirmation::part(footer) {
    padding: var(--c-spacing-md) var(--c-modal-padding);
    box-shadow: none;
  }

  craft-dialog.ff-delete-confirmation::part(body) {
    padding: var(--c-modal-padding);
  }

  craft-dialog.ff-delete-confirmation::part(dialog)::backdrop {
    background: rgb(0 0 0 / 0.5);
  }
`;

export const Message = styled.p`
  margin: 0;
  color: var(--c-text-default);
  line-height: var(--c-leading-normal);
  overflow-wrap: anywhere;
`;

export const Actions = styled.div.attrs({ slot: "footer" })`
  display: flex;
  gap: var(--c-spacing-md);
  justify-content: flex-end;
  flex-wrap: wrap;
`;

export const CancelButton = styled.button.attrs({
  type: "button",
  className: "btn",
})`
  && {
    background: var(--c-button-default-fill, transparent);
    border: var(--c-button-default-border, 1px solid transparent);
    color: var(--c-text-default);
  }

  &&:hover {
    background: var(--c-button-default-fill-hover, var(--c-color-neutral-fill-normal));
    border: var(--c-button-default-border-hover, 1px solid transparent);
  }

  &&:focus-visible {
    outline: var(--c-focus-outline-width) solid var(--c-color-focus-outline);
    outline-offset: var(--c-focus-outline-offset);
  }
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
