import styled from 'styled-components';

export const Wrapper = styled.div`
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
`;

export const Row = styled.div`
  margin: 0;
  width: 100%;
  height: 100%;
  display: flex;
  padding: 0 0 20px 0;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-start;

  &:last-child {
    padding: 0;
  }
`;

export const Column = styled.div`
  padding: 0;
  width: 100%;
  height: 100%;
  display: flex;
  margin: 0 10px 0 0;
  align-items: center;
  flex-direction: column;
  justify-content: center;

  &:last-child {
    margin: 0;
  }
`;

export const ColumnNarrow = styled.div`
  padding: 0;
  width: 150px;
  height: 100%;
  display: flex;
  margin: 0 10px 0 0;
  align-items: center;
  flex-direction: column;
  justify-content: center;

  &:last-child {
    margin: 0;
  }
`;
