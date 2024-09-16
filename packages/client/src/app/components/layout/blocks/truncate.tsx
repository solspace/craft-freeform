import type { PropsWithChildren } from 'react';
import React from 'react';
import { useCheckOverflow } from '@ff-client/hooks/use-check-overflow';
import styled from 'styled-components';

type Props = {
  size?: number;
};

export const TruncateBox = styled.span`
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const Truncate: React.FC<PropsWithChildren<Props>> = ({
  children,
  size,
}) => {
  const [ref] = useCheckOverflow<HTMLSpanElement>();

  return (
    <TruncateBox ref={ref} style={{ maxWidth: size }} title={String(children)}>
      {children}
    </TruncateBox>
  );
};
