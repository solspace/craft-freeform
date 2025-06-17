import { labelText } from '@ff-client/styles/mixins';
import { spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const CategoryWrapper = styled.div`
  //
`;

export const Label = styled.label`
  display: block;

  padding: 0 ${spacings.md};

  ${labelText};
  font-size: 11px;
`;
