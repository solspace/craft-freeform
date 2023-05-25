import React, { PropsWithChildren } from 'react';
import { ParagraphElement } from './Paragraph.styles';

const Paragraph: React.FC<PropsWithChildren> = ({ children }) => {
  return <ParagraphElement>{children}</ParagraphElement>;
};

export default Paragraph;
