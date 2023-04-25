import { colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const Table = styled.table`
  width: 100%;

  margin: 0;
  padding: 0;
  border-collapse: collapse;

  th,
  td {
    &:nth-child(1) {
      width: 25%;
    }

    &:nth-child(2) {
      width: 20%;
    }

    &:last-child {
      width: 20px;
    }
  }

  thead {
    th {
      background: ${colors.gray050};
      padding: ${spacings.sm} !important;
    }
  }

  tbody {
    td {
      padding: ${spacings.sm} ${spacings.sm} ${spacings.sm} 0 !important;

      &:last-child {
        padding-right: 0 !important;
      }
    }
  }
`;

export const Action = styled.button`
  margin: 0;
  padding: 0;
  border: none;

  svg {
    width: 20px;
    height: 20px;
  }
`;
