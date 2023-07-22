import { colors } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const NewTabWrapper = styled.button`
  display: flex;
  align-items: center;

  padding: 0 10px;
  margin-left: auto;

  transition: all 0.2s ease-in-out;

  &:hover {
    transform: scale(1.2);
    color: ${colors.black};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;
