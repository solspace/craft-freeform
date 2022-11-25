import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Route, Routes } from 'react-router-dom';

import { Behavior } from './tabs/behavior/behavior';
import { Editor as IntegrationsEditor } from './tabs/integrations/editor/editor';
import { EmptyEditor as EmptyIntegrationsEditor } from './tabs/integrations/editor/empty-editor';
import { Integrations } from './tabs/integrations/integrations';
import { LayoutEditor } from './tabs/layout-editor/layout-editor';
import { Settings } from './tabs/settings/settings';
import { BuilderContent, BuilderWrapper } from './builder.styles';
import { Tabs } from './tabs';

export const Builder: React.FC = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <BuilderWrapper>
        <Tabs />
        <BuilderContent>
          <Routes>
            <Route index element={<LayoutEditor />} />
            <Route path="behavior" element={<Behavior />} />
            <Route path="notifications" element={<div>Notifications</div>} />
            <Route path="integrations" element={<Integrations />}>
              <Route index element={<EmptyIntegrationsEditor />} />
              <Route path=":id/:handle" element={<IntegrationsEditor />} />
            </Route>
            <Route path="rules" element={<div>Rules</div>} />
            <Route path="settings" element={<Settings />} />
          </Routes>
        </BuilderContent>
      </BuilderWrapper>
    </DndProvider>
  );
};
