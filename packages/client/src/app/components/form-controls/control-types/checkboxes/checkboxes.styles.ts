import { shadows } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const SelectAllWrapper = styled.div`
  position: relative;

  padding-bottom: 5px;
  margin-bottom: 5px;
  font-style: italic;

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

export const CheckboxesWrapper = styled.div`
  columns: ${({ $columns }: CheckboxesWrapperProps) => $columns || 1};

  label {
    display: block;
    max-width: 100%;
    padding: 0 10px;

    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
`;
