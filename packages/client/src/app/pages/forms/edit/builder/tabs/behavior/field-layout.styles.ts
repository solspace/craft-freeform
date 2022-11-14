import styled from 'styled-components';

export const FieldLayoutWrapper = styled.div`
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  border-left: 1px solid rgb(205 216 228);
`;

export const FieldLayoutRow = styled.div`
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

export const FieldLayoutColumn = styled.div`
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
`;

export const FieldLayoutHeading = styled.h2`
  margin: 0;
  padding: 20px;
  font-weight: 700;
  line-height: 1.2;
`;

export const FieldLayoutGrid = styled.div`
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 50% 50%;
`;

export const FieldLayoutGridItem = styled.div`
  margin: 0;
  width: 100%;
  height: 100%;
  display: flex;
  padding: 20px;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
`;
