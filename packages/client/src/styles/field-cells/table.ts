import { css } from "styled-components";

export const TableCell = css`
  .table-cell-preview {
    width: 100%;

    margin: 0;
    border-spacing: 0;
    border-collapse: separate;

    & th,
    & td {
      width: auto;
    }

    & td {
      padding: 0 !important;

      &.string-cell,
      &.text-cell {
        padding: 6px 10px !important;
      }

      &.select-cell {
        padding: 4px 10px !important;
        text-align: center !important;

        & .select {
          width: 100% !important;
        }
      }

      &.checkbox-cell {
        padding: 6px 10px !important;
        text-align: center !important;

        & .checkbox-label {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1px 0 !important;

          & label {
            position: relative !important;
          }
        }
      }
    }

    &.columns-5 {
      & td,
      & th {
        width: 20% !important;
      }
    }

    &.columns-4 {
      & td,
      & th {
        width: 25% !important;
      }
    }

    &.columns-3 {
      & td,
      & th {
        width: 33.333333% !important;
      }
    }

    &.columns-2 {
      & td,
      & th {
        width: 50% !important;
      }
    }

    & thead {
      & tr {
        & th {
          border-left: 0 !important;
          border-right: 0 !important;
          color: #596673 !important;
          font-weight: 400 !important;
          padding: 6px 10px !important;
          background-color: #f3f7fc !important;
          border-top: 1px solid rgba(96, 125, 159, 0.25) !important;
          border-bottom: 1px solid rgba(51, 64, 77, 0.1) !important;
        }

        & th:first-child {
          border-top-left-radius: 5px !important;
          border-bottom-left-radius: 0 !important;
          border-left: 1px solid rgba(96, 125, 159, 0.25) !important;
        }

        & th:last-child {
          border-top-right-radius: 5px !important;
          border-bottom-right-radius: 0 !important;
          border-right: 1px solid rgba(96, 125, 159, 0.25) !important;
        }
      }
    }

    & tbody {
      & tr {
        & td {
          padding: 0 !important;
          border-top: 0 !important;
          border-left: 0 !important;
          border-radius: 0 !important;
          background-color: white !important;
          border-right: 1px solid rgba(51, 64, 77, 0.1) !important;
          border-bottom: 1px solid rgba(51, 64, 77, 0.1) !important;

          &:hover {
            background-color: white !important;
          }
        }

        & td:first-child {
          border-left: 1px solid rgba(96, 125, 159, 0.25) !important;
        }

        & td:last-child {
          border-right: 1px solid rgba(96, 125, 159, 0.25) !important;
        }
      }

      & tr:last-child {
        & td {
          border-bottom: 1px solid rgba(96, 125, 159, 0.25) !important;
        }

        & td:first-child {
          border-bottom-left-radius: 5px !important;
        }

        & td:last-child {
          border-bottom-right-radius: 5px !important;
        }
      }
    }
  }
`;
