import { spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const Label = styled.h1`
  padding: 0;
`;

export const ConfigurationDescription = styled.div`
  margin-bottom: ${spacings.xl};

  .select {
    margin: 0 5px;

    &:first-child {
      margin-left: 0;
    }
  }

  &.short {
    .select:first-child {
      margin-left: 5px;
    }
  }
`;
