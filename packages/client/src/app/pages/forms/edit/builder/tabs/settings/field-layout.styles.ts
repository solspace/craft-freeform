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
