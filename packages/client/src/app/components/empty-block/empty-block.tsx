import type { PropsWithChildren } from 'react';
import React from 'react';

import { EmptyBlockWrapper, Icon, Subtitle, Title } from './empty-block.styles';

type Props = {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
};

export const EmptyBlock: React.FC<PropsWithChildren<Props>> = ({
  title,
  subtitle,
  icon,
  children,
}) => {
  return (
    <EmptyBlockWrapper>
      {icon && <Icon>{icon}</Icon>}

      {title && <Title>{title}</Title>}
      {subtitle && <Subtitle>{subtitle}</Subtitle>}

      {children}
    </EmptyBlockWrapper>
  );
};
