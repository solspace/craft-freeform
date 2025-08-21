import styled from 'styled-components';

import { RefreshButton as BaseRefreshButton } from '../dynamic-select/dynamic-select.styles';

export const CheckboxesContainer = styled.div`
  position: relative;
`;

export const RefreshButton = styled(BaseRefreshButton)`
  position: absolute;
  top: -20px;
  right: 0;

  width: 40px;
`;
