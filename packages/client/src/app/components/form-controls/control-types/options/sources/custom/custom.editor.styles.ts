import { spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const ChoiceWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const BulkWrapper = styled.div`
  flex: 0 1 auto;
`;

export const BulkButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${spacings.sm};

  &:focus {
    outline: none;
    box-shadow: none;
  }

  span {
    white-space: nowrap;
  }

  &:hover {
    span {
      text-decoration: underline;
    }
  }
`;
