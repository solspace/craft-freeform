import type { PropsWithChildren } from 'react';
import React from 'react';
import { colors } from '@ff-client/styles/variables';
import styled from 'styled-components';

const HelpWrapper = styled.div`
  font-style: italic;
  font-size: 12px;
  line-height: 18px;
  padding-top: 6px;
  color: ${colors.gray300};
`;

export const HelpText: React.FC<PropsWithChildren> = ({ children }) => {
  return <HelpWrapper>{children}</HelpWrapper>;
};
