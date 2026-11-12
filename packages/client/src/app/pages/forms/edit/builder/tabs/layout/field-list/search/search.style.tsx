import { colors, spacings } from "@ff-client/styles/variables";
import styled, { css } from "styled-components";

export const Wrapper = styled.div`
  position: relative;
  z-index: 1;

  margin-bottom: ${spacings.lg};
`;

export const SearchBlock = styled.div`
  display: flex;
`;

export const SearchBar = styled.input`
  padding-inline: 30px 8px !important;

  border-radius: var(--c-form-control-radius);

  &::placeholder {
    font-style: normal;
    color: var(--c-text-quiet);
  }
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
