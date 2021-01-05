import React from 'react';
import { ParagraphElement } from './Paragraph.styles';

const Paragraph: React.FC = ({ children }) => {
  return <ParagraphElement>{children}</ParagraphElement>;
};

export default Paragraph;
