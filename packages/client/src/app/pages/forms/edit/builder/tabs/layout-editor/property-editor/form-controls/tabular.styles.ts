import styled from 'styled-components';

export const TabularOptions = styled.div`
  display: flex;
  border-style: solid;
  flex-direction: column;
  border-left-width: 1px;
  border-bottom-width: 1px;
  border-color: rgba(0, 0, 0, 0.1);
`;

export const Row = styled.div`
  display: flex;
`;

export const Cell = styled.div`
  width: 100%;
  display: flex;
  border-left: 0;
  align-items: center;
  border-top-width: 1px;
  border-right-width: 1px;
  justify-content: center;

  &.check,
  &.drag-and-drop,
  &.delete {
    flex: 0 0 50px;
  }

  &.check {
    margin: 0;
    min-height: 100%;
    padding: 0 !important;

    &:before {
      display: none;
      position: relative;
    }

    .checkbox-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
`;

export const CheckboxWrapper = styled.div`
  margin: 0 0 10px 0;
`;

export const Input = styled.input`
  margin: 0;
  border: 0;
  width: 100%;
  outline: none;
  --focus-ring: 0;
  border-radius: 0;
  padding: 6px 9px;
  background-color: #ffffff;
`;

export const InputPreview = styled(Input)`
  min-width: 100%;
  cursor: pointer;

  &.with-border {
    border-width: 1px;
    border-style: solid;
    border-color: rgba(0, 0, 0, 0.1);
  }
`;

export const Select = styled.select`
  margin: 0;
  border: 0;
  width: 100%;
  height: 100%;
  outline: none;
  --focus-ring: 0;
  border-radius: 0;
  padding: 6px 9px;
  background-color: #ffffff;
`;

export const Button = styled.button`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  &:disabled {
    color: lightgray;
    cursor: not-allowed;
  }
`;

const Icon = styled.div`
  border: 0 !important;

  &::after {
    font-weight: 800;
  }
`;

export const DragIcon = styled(Icon)`
  &::after {
    content: '\\2723';
  }
`;

export const DeleteIcon = styled(Icon)`
  &::after {
    content: '\\2715';
  }
`;
