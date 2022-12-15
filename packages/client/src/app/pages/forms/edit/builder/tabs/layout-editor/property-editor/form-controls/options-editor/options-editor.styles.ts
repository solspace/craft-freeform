import styled from 'styled-components';

export const Wrapper = styled.div`
  padding: 0;
  width: 100%;
  height: 100%;
  display: flex;
  margin: 10px 0;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
`;

export const Heading = styled.div`
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
  padding: 0;
  width: 100%;
  height: 100%;
  display: flex;
  margin: 0 0 10px 0;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-start;

  &:last-child {
    margin: 0;
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
