import { spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.lg};
`;

export const Cards = styled.ul`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${spacings.lg};
`;

export const Header = styled.header`
  display: grid;
  grid-template-areas: 'title sites button';
  grid-template-columns: min-content 1fr auto;
  justify-content: space-between;
  align-items: center;
  gap: ${spacings.md};
`;

export const Title = styled.h1`
  grid-area: title;

  padding: ${spacings.sm} 0;
  margin: 0;

  font-size: 18px;
  font-weight: 700;
  line-height: 34px;
`;

export const Button = styled.button`
  grid-area: button;
`;

export const ContentContainer = styled.div`
  width: 100%;
  max-width: 100%;
`;
