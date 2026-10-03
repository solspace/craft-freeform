import { shadows } from "@ff-client/styles/variables";
import styled from "styled-components";

export const SelectAllWrapper = styled.div`
  position: relative;

  padding-bottom: 5px;
  margin-bottom: 5px;
  font-style: normal;
  display: flex;
  align-items: center;
  gap: var(--c-spacing-md);

  &:after {
    content: '';
    position: absolute;
    left: -5px;
    right: -5px;
    bottom: 0;

    display: block;
    height: 1px;

    box-shadow: ${shadows.bottom};
  }
`;

type CheckboxesWrapperProps = {
  $columns?: number;
};

export const CheckboxesWrapper = styled.div<CheckboxesWrapperProps>`
  columns: ${({ $columns }) => $columns || 1};

  > div {
    display: flex;
    align-items: center;
    gap: var(--c-spacing-md);
    break-inside: avoid;
    padding-block: var(--c-spacing-xs);
  }

  craft-checkbox {
    width: 100%;
    min-width: 0;
  }

  label {
    display: block;
    max-width: 100%;
    padding: 0;

    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
`;
