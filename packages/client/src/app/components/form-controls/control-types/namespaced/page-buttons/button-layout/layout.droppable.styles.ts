import { spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const LayoutContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const LayoutElement = styled.div`
  flex-grow: 0;

  border: 1px dashed #ccc;
  padding: ${spacings.xs} ${spacings.sm};

  text-align: center; ;
`;

export const SpaceLayoutElement = styled(LayoutElement)`
  flex-grow: 1;
`;
