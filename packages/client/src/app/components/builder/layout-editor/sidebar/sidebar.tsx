import React from 'react';
import { useSpring } from 'react-spring';

import { BaseFields } from './base-fields/base-fields';
import { Container, Wrapper } from './sidebar.styles';

type Props = {
  visible: boolean;
};

export const Sidebar: React.FC<Props> = ({ visible }) => {
  const style = useSpring({
    from: { opacity: 0, width: 0, x: -400 },
    to: { opacity: 1, width: 400, x: 0 },
    reverse: !visible,
  });

  return (
    <Wrapper style={style}>
      <Container>
        <BaseFields />
      </Container>
    </Wrapper>
  );
};
