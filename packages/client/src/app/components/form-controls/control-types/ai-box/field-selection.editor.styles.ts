import { borderRadius, colors, spacings } from '@ff-client/styles/variables';
import styled, { css } from 'styled-components';

export const PreviewTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacings.md};

  mark {
    padding: 0 ${spacings.xs};
    border-radius: ${borderRadius.lg};
    background: ${colors.gray200};
  }
`;

export const FieldSelectionWrapper = styled.div`
  .tagify__input {
    min-height: 80px;
    background-color: #fff;
    line-height: 2.2;
  }

  .tagify {
    --tag-bg: ${colors.gray500};
    --tag-hover: ${colors.gray600};
    --tag-text-color: ${colors.white};
    --tags-border-color: ${colors.gray500};
    --tag-remove-bg: ${colors.red500};
    --tag-remove-btn-color: ${colors.white};
    --tag-pad: 0.2em 0.4em;
  }

  .sr-only-value {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
`;

export const TagMenu = styled.ul`
  min-width: 25%;
`;

export const FieldSelectionStyles = css`
  .field-selection {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .field-selection__input {
    position: relative;
  }

  .field-selection__input input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-size: 14px;
    line-height: 1.4;
    background: var(--input-bg);
    color: var(--text-color);
    transition: border-color 0.2s ease;

    &:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px var(--primary-color-alpha);
    }

    &::placeholder {
      color: var(--text-muted);
    }
  }

  .field-selection__suggestions {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    max-height: 200px;
    overflow-y: auto;
    background: var(--bg-color);
    border: 1px solid var(--border-color);
    border-top: none;
    border-radius: 0 0 4px 4px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    z-index: 1000;
  }

  .field-selection__suggestion {
    padding: 8px 12px;
    cursor: pointer;
    font-size: 14px;
    border-bottom: 1px solid var(--border-light);

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background: var(--hover-bg);
    }

    &.field-selection__suggestion--selected {
      background: var(--primary-color);
      color: white;
    }
  }

  .field-selection__suggestion-label {
    font-weight: 500;
  }

  .field-selection__suggestion-type {
    font-size: 12px;
    color: var(--text-muted);
    margin-left: 8px;
  }

  .field-selection__selected-fields {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 8px;
  }

  .field-selection__tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    background: var(--primary-color-alpha);
    color: var(--primary-color);
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
  }

  .field-selection__tag-remove {
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 1;
    }
  }

  .field-selection__help-text {
    font-size: 12px;
    color: var(--text-muted);
    margin-top: 4px;
  }

  .field-selection__error {
    color: var(--error-color);
    font-size: 12px;
    margin-top: 4px;
  }
`;
