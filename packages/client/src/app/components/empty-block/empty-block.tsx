import type { PropsWithChildren } from 'react';
import React from 'react';

import {
  EmptyBlockWrapper,
  Icon,
  LiteTitle,
  Subtitle,
  Title,
} from './empty-block.styles';

type Props = {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  lite?: boolean;
};

export const EmptyBlock: React.FC<PropsWithChildren<Props>> = ({
  title,
  subtitle,
  icon,
  lite,
  children,
}) => {
  if (lite) {
    return (
      <EmptyBlockWrapper className="padded">
        <LiteTitle>{title}</LiteTitle>
      </EmptyBlockWrapper>
    );
  }

  return (
    <EmptyBlockWrapper>
      {icon && <Icon>{icon}</Icon>}

      {title && <Title>{title}</Title>}
      {subtitle && <Subtitle>{subtitle}</Subtitle>}

      {children}
    </EmptyBlockWrapper>
  );
};
