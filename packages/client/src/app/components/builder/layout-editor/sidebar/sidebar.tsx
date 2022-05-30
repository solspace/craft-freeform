import React from 'react';
import { useSpring } from 'react-spring';

import { BaseFields } from './base-fields/base-fields';
import { Container, Wrapper } from './sidebar.styles';

type Props = {
  visible: boolean;
};

const show = { opacity: 0, width: 0, x: -400 };
const hide = { opacity: 1, width: 400, x: 0 };

export const Sidebar: React.FC<Props> = ({ visible }) => {
  const style = useSpring({
    to: visible ? hide : show,
  });

  return (
    <Wrapper style={style}>
      <Container>
        <BaseFields />
      </Container>
    </Wrapper>
  );
};
