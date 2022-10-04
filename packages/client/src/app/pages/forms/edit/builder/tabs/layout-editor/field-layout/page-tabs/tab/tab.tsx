import React from 'react';
import { Page } from '../../../../../types/layout';
import { TabWrapper } from './tab.styles';

export const Tab: React.FC<Page> = (page) => {
  return <TabWrapper>{page.label}</TabWrapper>;
};
