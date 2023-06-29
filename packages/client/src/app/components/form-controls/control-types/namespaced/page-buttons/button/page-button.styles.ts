import { CheckboxWrapper } from '@components/form-controls/control-types/bool/bool.styles';
import styled from 'styled-components';

export const PageButtonWrapper = styled.label`
  display: flex;
  justify-content: start;

  ${CheckboxWrapper} {
    margin-bottom: 2px;
  }
`;
