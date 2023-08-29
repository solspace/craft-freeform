import { css } from 'styled-components';

import { colors } from './variables';

const scrollBG = colors.gray100;
const scrollFG = colors.gray300;

export const scrollBar = css`
  scrollbar-width: thin;
  scrollbar-color: ${scrollFG} ${scrollBG};
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background-color: ${scrollBG};
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${scrollFG};
  }
`;

export const labelText = css`
  font-family:
    system-ui,
    BlinkMacSystemFont,
    -apple-system,
    Segoe UI,
    Roboto,
    Oxygen,
    Ubuntu,
    Cantarell,
    Fira Sans,
    Droid Sans,
    Helvetica Neue,
    sans-serif;
  font-weight: bold;
  text-transform: uppercase;
  color: rgb(154 165 177 / 75%);
`;

export const errorAlert = css`
  span:after {
    content: 'alert';

    position: relative;
    top: 1px;

    padding-left: 5px;

    -webkit-font-smoothing: antialiased;
    font-feature-settings: 'liga', 'dlig';
    font-family: Craft;
  }
`;
