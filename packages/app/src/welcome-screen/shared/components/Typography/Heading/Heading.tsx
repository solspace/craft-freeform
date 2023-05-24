import React, { PropsWithChildren } from 'react';
import FreeformLogo from './freeform.svg';
import { HeadingElement, Logo } from './Heading.styles';

const Heading: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <>
      <Logo>
        <FreeformLogo />
      </Logo>
      <HeadingElement>{children}</HeadingElement>
    </>
  );
};

export default Heading;
