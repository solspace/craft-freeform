import { borderRadius, colors } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const FileWrapper = styled.div`
  //
`;

export const FileInput = styled.input`
  cursor: pointer;

  width: 100%;
  padding: 0;
  margin: 5px 0 3px;

  border: 1px solid ${colors.inputBorder};
  border-radius: ${borderRadius.lg};

  color: rgb(156 163 175);
  background: rgb(55 65 81 / 5%);

  appearance: none;

  &::file-selector-button {
    cursor: pointer;

    padding: 5px 20px;

    border: none;
    border-right: 1px solid ${colors.inputBorder};
    border-radius: ${borderRadius.lg};
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;

    color: ${colors.gray700};
    font-weight: bold;
    background: ${colors.gray100};

    &:hover {
      text-decoration: underline;
    }
  }
`;

export const ErrorList = styled.ul`
  //
`;
