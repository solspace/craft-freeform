import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Route, Routes } from 'react-router-dom';

import { FormSettings } from './tabs/form-settings/form-settings';
import { Integrations } from './tabs/integrations/integrations';
import { EmptyEditor as EmptyIntegrationsEditor } from './tabs/integrations/property-editor/empty-editor';
import { PropertyEditor as IntegrationsEditor } from './tabs/integrations/property-editor/property-editor';
import { LayoutEditor } from './tabs/layout/layout';
import { Notifications } from './tabs/notifications/notifications';
import { EmptyEditor as EmptyNotificationsEditor } from './tabs/notifications/property-editor/empty-editor';
import { PropertyEditor as NotificationsEditor } from './tabs/notifications/property-editor/property-editor';
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
            <Route path="notifications" element={<Notifications />}>
              <Route index element={<EmptyNotificationsEditor />} />
              <Route path=":id/:handle" element={<NotificationsEditor />} />
            </Route>
            <Route path="integrations" element={<Integrations />}>
              <Route index element={<EmptyIntegrationsEditor />} />
              <Route path=":id/:handle" element={<IntegrationsEditor />} />
            </Route>
            <Route path="rules" element={<div>Rules</div>} />
            <Route path=":namespace" element={<FormSettings />} />
          </Routes>
        </BuilderContent>
      </BuilderWrapper>
    </DndProvider>
  );
};
