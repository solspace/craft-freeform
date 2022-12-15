import styled from 'styled-components';

export const Wrapper = styled.div`
  padding: 0;
  width: 100%;
  height: 100%;
  display: flex;
  margin: 0 0 10px 0;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
`;

export const H3 = styled.h3`
  padding: 0;
  width: 100%;
  height: 100%;
  display: flex;
  font-weight: bold;
  margin: 0 0 10px 0;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
`;

export const Row = styled.div`
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-start;
`;

export const Column = styled.div`
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
`;

export const Table = styled.table`
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  border-spacing: 0;
  box-sizing: border-box;

  thead,
  tbody {
    margin: 0;
    padding: 0;
    box-sizing: border-box;

    tr {
      margin: 0;
      padding: 0;
      box-sizing: border-box;

      td {
        height: 100%;
        margin: 0 !important;
        padding: 0 !important;
        box-sizing: border-box;
        vertical-align: middle;
      }
    }
  }
`;

export const TableOptions = styled(Table)`
  border-radius: 3px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  border-left: 1px solid rgba(0, 0, 0, 0.1);
  border-right: 1px solid rgba(0, 0, 0, 0.1);

  thead {
    tr {
      td {
        width: auto;
        border-left: 0;
        padding: 6px 9px !important;
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);

        &:nth-last-child(1),
        &:nth-last-child(2),
        &:nth-last-child(3) {
          text-align: center;
          width: 20px !important;
        }

        &:nth-last-child(3) {
          width: 25px !important;
        }
      }
    }
  }

  tbody {
    tr {
      td {
        width: auto;
        border-left: 0;
        border-radius: 0;
        border-right: 1px solid rgba(0, 0, 0, 0.1);
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);

        &:nth-last-child(1),
        &:nth-last-child(2),
        &:nth-last-child(3) {
          padding: 6px 9px;
          text-align: center;
          width: 20px !important;
          background-color: #ffffff;
        }

        &:nth-last-child(3) {
          width: 25px !important;
        }

        &:last-child {
          border-right: 0;
        }

        input[type='checkbox'] {
          padding: 0;
          margin: -2px 0 0 0;
          vertical-align: middle;
        }
      }

      &:last-of-type {
        td {
          &:first-child {
            border-bottom-left-radius: 3px;
          }

          &:last-child {
            border-bottom-right-radius: 3px;
          }
        }
      }
    }
  }
`;

export const TableAddOption = styled(Table)`
  border-bottom-left-radius: 3px;
  border-bottom-right-radius: 3px;
  border-left: 1px dashed rgba(0, 0, 0, 0.1);
  border-right: 1px dashed rgba(0, 0, 0, 0.1);
  border-bottom: 1px dashed rgba(0, 0, 0, 0.1);

  tbody {
    tr {
      td {
      }
    }
  }
`;

export const CheckboxWrapper = styled.div`
  padding: 0;
  width: 100%;
  height: 100%;
  display: flex;
  margin: 0 0 10px 0;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-start;
`;

export const Input = styled.input`
  margin: 0;
  border: 0;
  width: 100%;
  outline: none;
  --focus-ring: 0;
  border-radius: 0;
  line-height: normal;
  box-sizing: border-box;
  background-color: #ffffff;
`;

export const AddOptionButton = styled.button`
  margin: 0;
  border: 0;
  width: 100%;
  display: flex;
  outline: none;
  padding: 5px 0;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  &:focus {
    border: 0;
    outline: none;
  }
`;

export const DeleteButton = styled.button`
  margin: 0;
  border: 0;
  padding: 0;
  width: 100%;
  display: flex;
  outline: none;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  &:focus {
    border: 0;
    outline: none;
  }
`;

export const DragButton = styled.button`
  border: 0;
  padding: 0;
  width: 100%;
  display: flex;
  outline: none;
  margin: -1px 0 0 0;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  &:focus {
    border: 0;
    outline: none;
  }
`;

export const PlusIcon = styled.div`
  padding: 0;
  width: auto;
  display: flex;
  margin: 0 5px 0 0;
  vertical-align: middle;

  &::after {
    margin: 0;
    padding: 0;
    content: '\\271B';
    font-weight: 800;
  }
`;

export const DragIcon = styled.div`
  padding: 0;
  width: auto;
  display: flex;
  margin: 1px 0 0 0;
  vertical-align: middle;

  &::after {
    margin: 0;
    padding: 0;
    content: '\\2723';
    font-weight: 800;
  }
`;

export const DeleteIcon = styled.div`
  margin: 0;
  padding: 0;
  width: auto;
  display: flex;
  vertical-align: middle;

  &::after {
    margin: 0;
    padding: 0;
    content: '\\2715';
    font-weight: 800;
  }
`;
