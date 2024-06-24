import { spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.md};
`;

export const Button = styled.button`
  grid-area: button;

  outline: none;
  box-shadow: none;

  color: var(--link-color);

  font-size: 14px;
  text-align: left;

  transition: all 0.2s ease-out;

  &:focus {
    outline: none;
    box-shadow: none;
  }
`;

export const ArchivedItems = styled.ul`
  margin-left: 25px;
`;
