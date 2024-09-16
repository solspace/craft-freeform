import styled from 'styled-components';

export const CheckboxElement = styled.input`
  position: relative;

  appearance: none;
  display: grid;
  place-content: center;

  width: 1.15em;
  height: 1.15em;
  margin: 0;

  background-color: #fbfcfe;
  border: 1px solid #b9c6d7;
  border-radius: 3px;

  font: inherit;
  color: currentColor;
  transform: translateY(-0.075em);

  &:focus {
    outline: none;
  }

  &:hover {
    cursor: pointer;
  }

  &:before {
    content: 'check';

    position: absolute;
    top: -1px;
    left: 1px;

    font-family: Craft;
    transform: scale(0);
    transition: 80ms transform ease-in-out;
  }

  &:checked {
    &:before {
      transform: scale(1);
    }
  }
`;
