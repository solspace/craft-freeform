import styled from 'styled-components';

export const ControlWrapper = styled.div``;

type LabelProps = {
  regular?: boolean;
};

export const Label = styled.label<LabelProps>`
  display: block;
  font-weight: ${({ regular }) => (regular ? 'normal' : 'bold')};
`;
