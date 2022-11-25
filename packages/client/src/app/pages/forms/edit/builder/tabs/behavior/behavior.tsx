import React from 'react';
import { FieldLayout } from '@editor/builder/tabs/behavior/field-layout';
import { Sidebar } from '@editor/builder/tabs/behavior/sidebar';

import { BehaviorWrapper } from './behavior.styles';

export const Behavior: React.FC = () => (
  <BehaviorWrapper>
    <Sidebar />
    <FieldLayout />
  </BehaviorWrapper>
);
