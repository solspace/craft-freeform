import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Route, Routes } from 'react-router-dom';

import { PortalProvider } from './contexts/portal.context';
import { FormSettings } from './tabs/form-settings/form-settings';
import { Integrations } from './tabs/integrations/integrations';
import { EmptyEditor as EmptyIntegrationsEditor } from './tabs/integrations/property-editor/empty-editor';
import { PropertyEditor as IntegrationsEditor } from './tabs/integrations/property-editor/property-editor';
import { LayoutEditor } from './tabs/layout/layout';
import { Notifications } from './tabs/notifications/notifications';
import { EmptyEditor as EmptyNotificationsEditor } from './tabs/notifications/property-editor/empty-editor';
import { PropertyEditor as NotificationsEditor } from './tabs/notifications/property-editor/property-editor';
import { RulesEmpty } from './tabs/rules/editor/editor.empty';
import { FieldRulesEditor } from './tabs/rules/editor/field-editor';
import { PageRulesEditor } from './tabs/rules/editor/page-editor';
import { Rules } from './tabs/rules/rules';
import { Tabs } from './tabs/tabs';
import { BuilderContent, BuilderWrapper } from './builder.styles';

export const Builder: React.FC = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <BuilderWrapper>
        <PortalProvider>
          <Tabs />
          <BuilderContent>
            <Routes>
              <Route index element={<LayoutEditor />} />
              <Route path="notifications" element={<Notifications />}>
                <Route index element={<EmptyNotificationsEditor />} />
                <Route path=":uid" element={<NotificationsEditor />} />
              </Route>
              <Route path="integrations" element={<Integrations />}>
                <Route index element={<EmptyIntegrationsEditor />} />
                <Route path=":id/:handle" element={<IntegrationsEditor />} />
              </Route>
              <Route path="rules" element={<Rules />}>
                <Route index element={<RulesEmpty />} />
                <Route path="field/:uid" element={<FieldRulesEditor />} />
                <Route path="page/:uid" element={<PageRulesEditor />} />
              </Route>
              <Route path="settings" element={<FormSettings />} />
            </Routes>
          </BuilderContent>
        </PortalProvider>
      </BuilderWrapper>
    </DndProvider>
  );
};
