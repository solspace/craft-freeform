import styled from 'styled-components';

export const List = styled.ul`
  flex-basis: 30px;
  border-radius: var(--large-border-radius);

  margin: var(--m);

  background: #f3f7fc;
  box-shadow: 0 0 0 1px #cdd8e4, 0 2px 12px rgb(205 216 228 / 50%);
  border-radius: var(--large-border-radius);
`;

export const ListItem = styled.li`
  margin: 3px;
  padding: 3px;
  border: 1px solid #cbd5e0;
  border-radius: var(--large-border-radius);

  svg {
    fill: #cbd5e0;
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
