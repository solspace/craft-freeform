import styled from 'styled-components';

export const VariantsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex-wrap: nowrap;
  gap: 16px;

  padding: 16px;
`;

export const Card = styled.div`
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 16px;
  width: 200px;
`;

export const WeightSlider = styled.input`
  width: 100%;
  margin-top: 8px;
`;

export const CardFooter = styled.div`
  margin-top: 12px;
  font-size: 14px;
  color: #666;
`;
