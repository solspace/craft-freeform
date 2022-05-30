import React from 'react';

import { List } from './side-buttons.styles';

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
  return <button onClick={onClick}>{children}</button>;
};

export const SideButtons: React.FC<Props> & SubComponents = ({ children }) => {
  return (
    <List>
      {children.map((child, index) => (
        <li key={index}>{child}</li>
      ))}
    </List>
  );
};

SideButtons.Button = Button;
