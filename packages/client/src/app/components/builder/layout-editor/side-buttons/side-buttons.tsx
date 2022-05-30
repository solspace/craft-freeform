import React from 'react';

import { ButtonWrapper, List, ListItem } from './side-buttons.styles';

type Props = {
  children: React.ReactNode[];
};

type ButtonProps = {
  onClick?: () => void;
  children?: React.ReactNode;
};

type SubComponents = {
  Button: React.FC<ButtonProps>;
};

const Button: React.FC<ButtonProps> = ({ onClick, children }) => {
  return <ButtonWrapper onClick={onClick}>{children}</ButtonWrapper>;
};

export const SideButtons: React.FC<Props> & SubComponents = ({ children }) => {
  return (
    <List>
      {children.map((child, index) => (
        <ListItem key={index}>{child}</ListItem>
      ))}
    </List>
  );
};

SideButtons.Button = Button;
