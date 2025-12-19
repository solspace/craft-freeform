import styled from 'styled-components';

export const VariantsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  flex-direction: row;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
`;

export const Card = styled.div`
  position: relative;
  flex: 1 0 400px;

  display: flex;
  flex-direction: column;
  gap: 16px;

  min-width: 250px;
  padding: 16px;

  border: 1px solid #ccc;
  border-radius: 4px;
`;

export const CreateButton = styled.button``;

export const WeightContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const WeightWrapper = styled.div`
  display: grid;
  grid-template-columns: 25px auto 40px;

  :last-child {
    text-align: right;
  }
`;

export const WeightInput = styled.input`
  align-self: center;

  width: 60px;
  padding: 3px 8px !important;

  border: var(--input-border) !important;
  border-radius: var(--input-border-radius) !important;

  text-align: center;
  text-indent: calc(100% - 20px);

  &:hover,
  &:focus {
  }
`;

export const WeightSlider = styled.input`
  width: 100%;
  margin-top: 8px;
`;
