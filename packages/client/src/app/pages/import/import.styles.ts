import { animated } from 'react-spring';
import { spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const ImportWrapper = styled.div`
  display: flex;
`;

export const ProgressWrapper = styled(animated.div)`
  transform-origin: center top;
`;

export const DoneWrapper = styled(animated.div)`
  transform-origin: left center;
`;

export const Done = styled.div`
  display: flex;
  align-items: center;
  justify-content: start;
  gap: ${spacings.sm};

  width: 100%;
  padding: ${spacings.sm} ${spacings.md};

  border: 1px solid #1fa07a;
  border-radius: 5px;

  color: #1fa07a;
  font-size: 16px;
  font-weight: bold;

  i {
    font-size: 18px;
  }
`;
