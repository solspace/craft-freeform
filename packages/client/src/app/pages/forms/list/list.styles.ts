import { spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const Wrapper = styled.ul`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${spacings.lg};
`;

export const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const Title = styled.h1`
  padding: ${spacings.sm} 0;
  margin: 0;

  font-size: 18px;
  font-weight: 700;
  line-height: 34px;
`;

export const ContentContainer = styled.div`
  width: 100%;
  max-width: 100%;
`;
