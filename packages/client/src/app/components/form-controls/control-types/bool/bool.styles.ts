import type { RenderSize } from '@components/form-controls/context/render.context';
import { colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

type CheckboxWrapperProps = {
  $size?: RenderSize;
};

export const CheckboxWrapper = styled.div<CheckboxWrapperProps>`
  display: flex;
  justify-content: start;
  align-items: center;
  gap: ${spacings.sm};

  label {
    color: ${colors.gray550};
    font-weight: bold;
  }
`;

export const CheckboxItem = styled.div`
  padding: 0 !important;
`;
export const TextWrapper = styled.div``;
