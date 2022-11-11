import styled from 'styled-components';

export const FormTagAttributeInputWrapper = styled.div`
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
`;

export const FormTagAttributeInputRow = styled.div`
  margin: 0;
  width: 100%;
  height: 100%;
  display: flex;
  padding: 0 0 20px 0;
  flex-directions: row;
  align-items: flex-start;
  justify-content: flex-start;

  &:last-child {
    padding: 0;
  }
`;

export const FormTagAttributeInputColumn = styled.div`
  padding: 0;
  width: 100%;
  height: 100%;
  display: flex;
  margin: 0 10px 0 0;
  align-items: center;
  flex-directions: column;
  justify-content: center;

  &:last-child {
    margin: 0;
  }
`;
