import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Wrapper } from './builder.styles';

import { LayoutEditor } from './layout-editor/layout-editor';
import { Tabs } from './tabs/tabs';

export const Builder: React.FC = () => {
  return (
    <Wrapper>
      <Tabs />
      <Routes>
        <Route index element={<LayoutEditor />} />
        <Route path="notifications" element={<div>Notifications</div>} />
        <Route path="integrations" element={<div>Integrations</div>} />
        <Route path="rules" element={<div>Rules</div>} />
      </Routes>
    </Wrapper>
  );
};
