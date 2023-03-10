import styled from 'styled-components';

export const ControlWrapper = styled.div``;

type LabelProps = {
  regular?: boolean;
};

export const Label = styled.label<LabelProps>`
  display: block;
  font-weight: ${({ regular }) => (regular ? 'normal' : 'bold')};
`;

export const Instructions = styled.span`
  font-size: 90%;
  display: block;
  margin: 5px 0 10px;
  font-style: italic;
`;

export const FormField = styled.div`
  margin: 0;
  padding: 0;
  width: 100%;
  display: block;
`;
