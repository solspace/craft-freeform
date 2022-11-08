import styled from 'styled-components';

export const FieldLayoutWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  position: relative;
  flex-directions: row;
  align-items: flex-start;
  background-color: #ffffff;
  justify-content: flex-start;
  border-left: 1px solid rgb(205 216 228);
`;

export const FieldLayoutGrid = styled.div`
  gap: 10px;
  margin: 0;
  padding: 0;
  width: 100%;
  display: grid;
  grid-template-columns: auto auto;
`;

export const FormTagAttributeWrapper = styled.div`
  padding: 0;
  width: 100%;
  height: 100%;
  display: flex;
  margin: 0 0 10px 0;
  flex-directions: row;
  align-items: flex-start;
  justify-content: flex-start;

  div {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-directions: column;
    align-items: flex-start;
    justify-content: flex-start;

    &.input-wrapper {
    }

    &.button-wrapper {
      margin: 0;
      padding: 0;
      height: 100%;
      width: 150px;
      text-align: center;
      align-items: center;
      justify-content: center;

      div {
        margin: 0;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;

        .btn {
          margin: 0;
          font-size: 10px;
          padding: 5px 9px;
        }
      }
    }

    div {
      margin: 0;
      width: 100%;
      height: 100%;
      display: flex;
      flex-wrap: wrap;
      padding: 0 10px 10px 0;
      flex-directions: column;
      align-items: flex-start;
      justify-content: flex-start;

      div {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        display: flex;
        flex-directions: row;
        align-items: flex-start;
        justify-content: flex-start;

        label {
          margin: 0;
          width: 100%;
          display: block;
          padding: 0 0 10px 0;
        }
      }

      input {
        margin: 0;
        padding: 5px;
        width: 100%;
        height: 100%;
        display: flex;
        flex-directions: row;
        align-items: flex-start;
        justify-content: flex-start;
      }
    }
  }
`;
