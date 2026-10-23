import { CardCell } from "@ff-client/styles/field-cells/cards";
import { RatingCell } from "@ff-client/styles/field-cells/rating";
import { SignatureCell } from "@ff-client/styles/field-cells/signature";
import { SquareCell } from "@ff-client/styles/field-cells/square";
import { StripeCell } from "@ff-client/styles/field-cells/stripe";
import { TableCell } from "@ff-client/styles/field-cells/table";
import { borderRadius, colors, spacings } from "@ff-client/styles/variables";
import { animated } from "@react-spring/web";
import styled from "styled-components";

export const Label = styled.label`
  display: flex;
  align-items: flex-start;
  gap: ${spacings.xs};

  min-height: 18px;
  margin-bottom: 6px;
  font-weight: 500;
  color: ${colors.gray600};

  overflow: hidden;

  .field-required {
    position: relative;
    top: -2px;
    margin-inline-start: 3px;
    font-size: 11px;
    font-weight: 600;
    color: ${colors.error};
    vertical-align: baseline;
  }
`;

export const LabelText = styled.div``;

const iconSize = 16;
export const LabelIcon = styled.div`
  flex: 0 0 ${iconSize}px;
  position: relative;
  top: 2px;

  width: ${iconSize}px;
  height: ${iconSize}px;
  font-size: ${iconSize}px;
  opacity: 0;
  transition: opacity 120ms ease-out;

  &[data-loading='true'] { opacity: 1; }

  @media (prefers-reduced-motion: reduce) { transition: none; }
`;

export const Icon = styled(animated.div)`
  position: absolute;
  left: 0;
  top: 0;

  &,
  svg {
    width: ${iconSize}px;
    height: ${iconSize}px;
    font-size: ${iconSize}px;
  }
`;

export const Instructions = styled.div`
  margin-top: -6px;
  margin-bottom: 6px;

  color: ${colors.gray300};
  font-style: italic;
  font-size: 12px;
`;

export const FieldCellWrapper = styled.div`
  display: flex;
  flex-direction: column;

  height: 100%;
  padding: 10px ${spacings.md};
  margin: 0;

  border: 1px solid transparent;
  border-radius: ${borderRadius.md};

  transition:
    border-color 0.2s ease-out,
    background-color 0.2s ease-out;

  &.input-only {
    flex-direction: row !important;
    gap: ${spacings.sm};
  }

  &.active {
    border: 1px dashed #5782ef;
  }

  &:hover {
    background: #f3f7fd;

    &:not(.active) {
      border: 1px solid #cdd8e4;
    }
  }

  &:hover > ${Label} > ${LabelIcon},
  &.active > ${Label} > ${LabelIcon},
  &:focus-within > ${Label} > ${LabelIcon} {
    opacity: 0.7;
  }

  &.section-heading {
    padding-top: 22px;
    padding-bottom: 8px;
  }

  &.content-only .content-preview {
    > :first-child { margin-block-start: 0; }
    > :last-child { margin-block-end: 0; }
  }

  .sample-preview {
    position: relative;
    input:not([type='checkbox']):not([type='radio']), textarea { padding-inline-end: 32px; }
    select:not([multiple]) { padding-inline-end: 50px; }
  }

  &.errors {
    &,
    label {
      color: ${colors.error};
    }

    input,
    textarea,
    div.select,
    select,
    .ff-signature-preview__pad {
      border-color: ${colors.error} !important;
    }

    div.select {
      border: 1px solid;
    }

    input.checkbox ~ label:before {
      border-color: ${colors.error};
    }
  }

  &[data-field-type='checkbox'] {
    input.checkbox + label > p {
      margin-block: 0;

      &:last-child { display: inline; }
    }

    input.checkbox + label.required::after {
      content: '*';
      position: relative;
      top: -2px;
      margin-inline-start: 3px;
      font-family: inherit;
      font-size: 11px;
      font-weight: 600;
      line-height: 1;
      color: ${colors.error};
      vertical-align: baseline;
    }
  }

  input:not([type='checkbox']):not([type='radio']),
  textarea,
  select {
    pointer-events: none;

    width: 100%;
    padding: 6px 9px;

    border: 1px solid rgba(96, 125, 159, 0.25);
    border-radius: 3px;
    color: ${colors.gray500};

    &::placeholder {
      color: ${colors.gray300};
      opacity: 1;
    }
  }

  input:not([type='checkbox']):not([type='radio']),
  select:not([multiple]),
  .select > select:not([multiple]) {
    box-sizing: border-box;
    height: 34px;
    min-height: 0;
    padding-block: 6px;
    line-height: 20px;
  }

  &[data-field-type='dropdown'],
  &[data-field-type='multiple-select'] {
    .select { background: transparent; border: 0; box-shadow: none; }
    select, .select > select {
      border: 1px solid ${colors.inputBorder};
      border-radius: 3px;
    }
    select, select:hover, select:focus {
      background-color: #fff;
      box-shadow: none;
      color: ${colors.gray500};
    }
    select:not([multiple]) { padding-inline-end: 30px; }
  }

  &[data-field-type='html'],
  &[data-field-type='rich-text'] {
    ul,
    ol {
      padding-inline-start: 40px;
      margin-block: 1em;
      list-style-position: outside;
    }

    ul {
      list-style-type: disc;
    }

    ol {
      list-style-type: decimal;
    }

    ul ul {
      list-style-type: circle;
    }

    ul ul ul {
      list-style-type: square;
    }

    li {
      display: list-item;
    }

    li > ul,
    li > ol {
      margin-block: 0.25em;
    }
  }

  &[data-field-type='rich-text'] {
    blockquote {
      border-left: 2px solid #d9d9d9;
      margin-left: 0;
      padding-left: 10px;
    }

    pre {
      border: 1px solid #d9d9d9;
      padding: 10px;
      white-space: pre-wrap;
      background-color: rgb(247, 247, 247);
    }

    table {
      border-collapse: collapse;
      width: 100%;

      border: 1px solid black;

      td {
        border: 1px solid black;
        padding: 5px;
      }
    }

    pre {
      margin: 1em 0;
    }
  }

  &[data-field-type='cards'] {
    .ff-cards {
      display: grid;
      grid-template-columns: repeat(var(--card-columns, 5), 1fr);
      gap: ${spacings.sm};

      &__empty {
        grid-column: 1 / -1;
        padding-top: 10px;

        color: ${colors.gray500};
        text-align: left;
        font-style: italic;
      }

      &__card {
        display: grid;
        grid-template-rows: min-content 20px auto;
        gap: 5px;

        background: ${colors.white};
        border: 1px solid ${colors.gray200};
        border-radius: 8px;

        &__image {
          border: none;
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;

          overflow: hidden;
          text-align: center;

          img {
            width: 100%;
          }

          svg {
            width: 100%;
            max-height: 80px;

            fill: ${colors.gray200};
          }
        }

        &__label {
          height: 20px;
          padding: 0 ${spacings.sm};

          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          font-weight: bold;
        }

        &__description {
          padding: 0 ${spacings.sm} ${spacings.sm};

          color: ${colors.gray500};
          font-size: 12px;
          font-style: italic;
        }

        &__label,
        &__description {
          text-align: center;
        }
      }
    }
  }

  ${StripeCell}
  ${SquareCell}
  ${CardCell}
  ${RatingCell}
  ${SignatureCell}
  ${TableCell}
`;

export const Row = styled.div`
  display: flex;
  flex-direction: row;
`;

export const SampleValueMarker = styled.div<{ $select?: boolean }>`
  position: absolute;
  right: ${({ $select }) => ($select ? "30px" : "8px")};
  top: 8px;
  display: flex;
  opacity: 0;
  pointer-events: none;
  transition: opacity 120ms ease-out;

  ${FieldCellWrapper}:hover > .sample-preview > &,
  ${FieldCellWrapper}.active > .sample-preview > &,
  ${FieldCellWrapper}:focus-within > .sample-preview > & {
    opacity: 1;
    pointer-events: auto;
  }

  @media (prefers-reduced-motion: reduce) { transition: none; }

  button {
    display: flex;
    padding: 0;
    border: 0;
    background: transparent;
    color: ${colors.gray300};
  }
  button:hover, button:focus { color: #3476b8; }
  button:focus-visible { outline: 2px solid #3476b8; outline-offset: 2px; border-radius: 3px; }
`;

export const HtmlPreviewElement = styled.div<{ $fullWidth?: boolean }>`
  ${({ $fullWidth }) => $fullWidth && "flex: 1; min-width: 0;"}

  a {
    pointer-events: none;
  }
`;
