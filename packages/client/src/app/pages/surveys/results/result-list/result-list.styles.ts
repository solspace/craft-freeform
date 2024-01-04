import { spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const Wrapper = styled.ul`
  display: block;

  padding: ${spacings.xl};
`;

export const Heading = styled.div`
  position: relative;

  display: block;
  padding: 0 0 30px;

  color: #3f4d5a;
  font-size: 1.5rem;
  font-weight: normal;

  small {
    color: #bbbdbe;
    padding-left: ${spacings.md};
  }
`;
