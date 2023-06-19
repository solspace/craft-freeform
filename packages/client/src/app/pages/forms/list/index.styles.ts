import styled from 'styled-components';

export const Wrapper = styled.ul`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--l);

  margin-top: var(--l);
`;

export const Card = styled.li<{ $disabled?: boolean }>`
  position: relative;

  padding: var(--xl);

  background: #fff;
  box-shadow: 0 0 0 1px #cdd8e4, 0 2px 12px rgb(205 216 228 / 50%);
  border-radius: var(--large-border-radius);

  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
  pointer-events: ${({ $disabled }) => ($disabled ? 'none' : 'auto')};
`;

export const Title = styled.h3`
  margin: 0;

  font-size: 22px;
  font-weight: normal;
  text-align: center;
`;

export const Subtitle = styled.small`
  display: block;

  color: grey;
  font-size: 12px;
  font-family: monospace;
  text-align: center;
`;

export const RemoveButton = styled.button`
  position: absolute;
  right: 0;
  top: 0;

  &:before {
    content: '×';
    display: block;

    padding: 10px;

    font-weight: bold;
  }
`;
