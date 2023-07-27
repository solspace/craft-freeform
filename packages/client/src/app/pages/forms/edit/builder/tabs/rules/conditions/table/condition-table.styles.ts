import { borderRadius, colors } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const Table = styled.table`
  width: 100%;

  margin: 0;
  border-spacing: 0;
  border-collapse: separate;

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

  tbody {
    tr {
      td {
        padding: 0 !important;
        padding-top: 7px !important;
        padding-right: 7px !important;
        padding-bottom: 7px !important;
        border-bottom: 1px solid ${colors.inputBorder};
        background-color: ${colors.gray050};
      }

      td:first-child {
        padding-left: 7px !important;
        border-left: 1px solid ${colors.inputBorder};
      }

      td:last-child {
        border-right: 1px solid ${colors.inputBorder};
      }
    }

    tr:first-child {
      td {
        border-top: 1px solid ${colors.inputBorder};
      }

      td:first-child {
        border-top-left-radius: ${borderRadius.lg};
        border-top: 1px solid ${colors.inputBorder};
      }

      td:last-child {
        border-top: 1px solid ${colors.inputBorder};
        border-top-right-radius: ${borderRadius.lg};
      }
    }

    tr:last-child {
      td {
        padding: 0 !important;
        background-color: ${colors.white};

        .btn {
          border: 0 !important;
          border-radius: 0 !important;
          background-color: transparent !important;
        }
      }

      td:last-child {
        border-left: 1px dashed ${colors.inputBorder};
        border-right: 1px dashed ${colors.inputBorder};
        border-bottom: 1px dashed ${colors.inputBorder};
        border-bottom-left-radius: ${borderRadius.lg};
        border-bottom-right-radius: ${borderRadius.lg};
      }
    }

    tr:first-child:last-child {
      td {
        border-top: 1px dashed ${colors.inputBorder};
      }
    }
  }
`;

export const Action = styled.button`
  margin: 0;
  padding: 0;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 16px;
    height: 16px;
    stroke-width: 3px;
    fill: #e5e7eb;
  }
`;
