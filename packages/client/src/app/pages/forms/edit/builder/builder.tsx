import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Route, Routes } from 'react-router-dom';

import { Wrapper } from './builder.styles';
import { LayoutEditor } from './tabs/layout-editor/layout-editor';
import { Tabs } from './tabs';
import { Integrations } from './tabs/integrations/integrations';
import { Editor as IntegrationsEditor } from './tabs/integrations/editor/editor';
import { EmptyEditor as EmptyIntegrationsEditor } from './tabs/integrations/editor/empty-editor';

export const Builder: React.FC = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <Wrapper>
        <Tabs />
        <Routes>
          <Route index element={<LayoutEditor />} />
          <Route path="notifications" element={<div>Notifications</div>} />
          <Route path="integrations" element={<Integrations />}>
            <Route index element={<EmptyIntegrationsEditor />} />
            <Route path=":id/:handle" element={<IntegrationsEditor />} />
          </Route>
          <Route path="rules" element={<div>Rules</div>} />
        </Routes>
      </Wrapper>
    </DndProvider>
  );
};
