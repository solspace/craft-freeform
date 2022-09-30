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

const IconStyle = css`
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

export const FilterIcon = styled.button`
  cursor: pointer;
  right: 1px;

  ${IconStyle}

  color: ${colors.gray300};
  transition: all 0.2s ease-out;

  background: white;

  &:before {
    content: '';

    position: absolute;
    left: 0;
    top: 6px;

    display: block;

    width: 1px;
    height: 22px;

    background: ${colors.gray200};
    transition: all 0.2s ease-out;
  }

  &:hover {
    background: ${colors.gray050};

    &:before {
      top: 0;
      height: 32px;
    }
  }
`;
