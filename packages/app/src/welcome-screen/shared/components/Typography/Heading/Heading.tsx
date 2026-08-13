import React from 'react';
import FreeformLogo from './FreeformLogo';
import { HeadingElement, Logo } from './Heading.styles';

const Heading: React.FC = ({ children }) => {
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
