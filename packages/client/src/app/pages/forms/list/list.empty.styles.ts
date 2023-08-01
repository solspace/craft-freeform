import { spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

import { CardWrapper, LinkList, Subtitle, Title } from './card/card.styles';
import { Wrapper } from './list.styles';

export const MutedWrapper = styled(Wrapper)`
  position: relative;
  margin-top: ${spacings.xl};

  &:after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;

    z-index: 2;

    background: linear-gradient(
      to right,
      transparent 0%,
      transparent 40%,
      white 65%,
      white 100%
    );
  }

  &,
  * {
    pointer-events: none;
    user-select: none;
  }

  ${CardWrapper} {
    border-color: #fbfcfd;
    background: #fefeff;
  }

  ${Title}, ${LinkList} a {
    color: #cfd1d2;
  }

  ${Subtitle} {
    color: #e2e4e5;
  }
`;
