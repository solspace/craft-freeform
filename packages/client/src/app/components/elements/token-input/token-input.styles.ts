import styled, { css } from "styled-components";

export const TokenPillStyles = css`
  .tagify + input, .tagify + textarea { display: none !important; }
  .tagify {
    --tag-bg: #e8f0fc;
    --tag-hover: #d8e7fb;
    --tag-text-color: #30689f;
    --tag-remove-bg: #cfdef1;
    --tag-remove-btn-color: #30689f;
    --tag-remove-btn-bg--hover: #cfdef1;
    --tag-border-radius: 12px;
    --tag-pad: 2px 6px;
    --tags-border-color: var(--input-border-color, rgba(96, 125, 159, 0.4));
    --tags-hover-border-color: var(--input-border-color, rgba(96, 125, 159, 0.4));
    --tags-focus-border-color: var(--input-border-color, rgba(96, 125, 159, 0.4));
    background: var(--input-bg, #fbfcfe);
    border: var(--input-border, 1px solid rgba(96, 125, 159, 0.4));
    border-radius: var(--input-border-radius, 3px);
  }
  .tagify__tag { font-size: 12px; }
  .tagify__tag > div::before {
    border-radius: 12px;
    background-color: var(--tag-bg);
    box-shadow: none;
  }
  .tagify__tag__removeBtn:hover + div,
  .tagify__tag__removeBtn:focus-visible + div,
  .tagify__tag__removeBtn:hover + div .tagify__tag-text,
  .tagify__tag__removeBtn:focus-visible + div .tagify__tag-text {
    text-decoration: none !important;
    opacity: 1;
  }
  .tagify__tag__removeBtn:hover { color: #30689f; }
  .tagify__tag__removeBtn:hover + div::before {
    box-shadow: none !important;
  }
  .tagify__input, .tagify__input:focus {
    border: 0 !important;
    outline: 0 !important;
    box-shadow: none !important;
    background: transparent;
  }
  .tagify.tagify--focus {
    border-color: var(--tags-border-color);
    outline: 1px solid transparent;
    box-shadow: var(--focus-ring, var(--medium-focus-ring, 0 0 0 3px #0284c7));
  }
  .tagify__tag:focus-visible, .tagify__tag__removeBtn:focus-visible {
    outline: 2px solid #3476b8;
    outline-offset: 1px;
    border-radius: 12px;
  }
`;

export const TokenInputWrapper = styled.div`
  ${TokenPillStyles}
  .tagify {
    width: 100%;
    min-height: 2.125rem;
    padding: 5px 5px;

    box-sizing: border-box;
    gap: 5px;

    &__tag {
      margin-inline: 0;
      margin-block: 0;
    }

    &__input {
      margin: 0;
      min-width: 1px !important;
    }
  }
`;
