import { colors, spacings } from '@ff-client/styles/variables';
import styled, { css } from 'styled-components';

export const Wrapper = styled.div`
  position: relative;
  z-index: 1;

  margin-bottom: ${spacings.lg};
`;

export const SearchBlock = styled.div`
  display: flex;
`;

export const SearchBar = styled.input`
  padding: 6px 38px 6px 30px !important;

  &::placeholder {
    font-style: italic;
    color: ${colors.gray200};
  }
`;

const buttonSize = '18px';

export const IconStyle = css`
  position: absolute;
  top: 1px;
  bottom: 1px;
  z-index: 2;

  display: flex;
  flex-direction: column;
  justify-content: center;

  padding: 0 8px;

  box-sizing: border-box;
  user-select: none;

  > svg {
    width: ${buttonSize};
    height: ${buttonSize};
  }
`;

export const SearchIcon = styled.div`
  left: 1px;

  ${IconStyle}

  color: ${colors.gray100};
`;
