import styled from 'styled-components';

export const Wrapper = styled.div`
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

export const Row = styled.div`
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

export const Column = styled.div`
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
`;

export const Heading = styled.h2`
  margin: 0;
  padding: 20px;
  font-weight: 700;
  line-height: 1.2;
`;

export const Grid = styled.div`
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 50% 50%;
`;

export const GridItem = styled.div`
  margin: 0;
  width: 100%;
  height: 100%;
  display: flex;
  padding: 20px;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
`;
