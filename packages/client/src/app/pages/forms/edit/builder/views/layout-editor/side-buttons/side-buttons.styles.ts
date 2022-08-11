import { borderRadius, colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const List = styled.ul`
  flex-basis: 30px;

  margin: ${spacings.md};

  background: ${colors.gray050};
  box-shadow: 0 0 0 1px ${colors.gray200}, 0 2px 12px rgb(205 216 228 / 50%);
  border-radius: ${borderRadius.lg};
`;

export const ListItem = styled.li`
  margin: ${spacings.xs};
  padding: ${spacings.xs};
  border: 1px solid ${colors.gray200};
  border-radius: ${borderRadius.lg};

  svg {
    fill: ${colors.gray200};
    transition: fill 0.2s ease-out;
  }

  &:hover {
    svg {
      fill: black;
    }
  }
`;

const buttonSize = 28;
export const ButtonWrapper = styled.button`
  width: ${buttonSize}px;
  height: ${buttonSize}px;
`;
