import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Provider } from 'react-redux';
import { Route, Routes } from 'react-router-dom';

import { Wrapper } from './builder.styles';
import { LayoutEditor } from './layout-editor/layout-editor';
import { store } from './store/store';
import { Tabs } from './tabs/tabs';

export const Builder: React.FC = () => {
  return (
    <Provider store={store}>
      <DndProvider backend={HTML5Backend}>
        <Wrapper>
          <Tabs />
          <Routes>
            <Route index element={<LayoutEditor />} />
            <Route path="notifications" element={<div>Notifications</div>} />
            <Route path="integrations" element={<div>Integrations</div>} />
            <Route path="rules" element={<div>Rules</div>} />
          </Routes>
        </Wrapper>
      </DndProvider>
    </Provider>
  );
};
