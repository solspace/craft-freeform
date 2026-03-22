import { colors } from "@ff-client/styles/variables";
import styled, { css } from "styled-components";

export const Wrapper = styled.div`
  position: relative;
  z-index: 1;
`;

export const SearchBlock = styled.div`
  position: relative;

  display: flex;
`;

export const SearchBar = styled.input`
  position: relative;

  padding: 6px 38px 6px 30px !important;

  border-radius: 5px;

  &::placeholder {
    font-style: italic;
    color: ${colors.gray200};
  }
`;

export const SearchKeyHelper = styled.div`
  position: absolute;
  top: 5px;
  right: 5px;
  z-index: 2;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 3px 6px;

  //background-color: ${colors.gray100};
  border: 1px solid ${colors.gray200};
  border-radius: 5px;

  color: ${colors.gray300};
  font-size: 12px;
  line-height: 16px;
`;

const buttonSize = "14px";

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

  color: ${colors.gray400};
`;
