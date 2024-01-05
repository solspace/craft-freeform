import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Breadcrumb } from '@components/breadcrumbs/breadcrumbs';
import { BreadcrumbProvider } from '@components/breadcrumbs/breadcrumbs.context';
import { CpNavigation } from '@components/cp-navigation/cp-navigation';
import { queryClient } from '@config/react-query';
import { PortalProvider } from '@editor/builder/contexts/portal.context';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import '../config';
import './utils/prototypes';

import { Form, Forms } from './app/pages/forms';
import { SurveyResults } from './app/pages/surveys/results/results';
import { Welcome } from './app/pages/welcome/welcome';
import { EscapeStackProvider } from './contexts/escape/escape.context';
import ManualStyles from './styles/manual';
import { debug } from './utils/debug';
import { generateUrl } from './utils/urls';
import App from './App';

const container = document.getElementById('freeform-client');
const root = ReactDOM.createRoot(container);

debug.log(
  '%c\n' +
    '  ███████╗██████╗ ███████╗███████╗███████╗ ██████╗ ██████╗ ███╗   ███╗\n' +
    '  ██╔════╝██╔══██╗██╔════╝██╔════╝██╔════╝██╔═══██╗██╔══██╗████╗ ████║\n' +
    '  █████╗  ██████╔╝█████╗  █████╗  █████╗  ██║   ██║██████╔╝██╔████╔██║\n' +
    '  ██╔══╝  ██╔══██╗██╔══╝  ██╔══╝  ██╔══╝  ██║   ██║██╔══██╗██║╚██╔╝██║\n' +
    '  ██║     ██║  ██║███████╗███████╗██║     ╚██████╔╝██║  ██║██║ ╚═╝ ██║\n' +
    '  ╚═╝     ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝      ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝\n',
  debug.colors.blue
);

root.render(
  <DndProvider backend={HTML5Backend}>
    <BrowserRouter basename={generateUrl('/', false)}>
      <QueryClientProvider client={queryClient}>
        <EscapeStackProvider>
          <BreadcrumbProvider>
            <PortalProvider>
              <Breadcrumb label="Freeform" url="/forms" />
              <ManualStyles />
              <ReactQueryDevtools />
              <CpNavigation />
              <Routes>
                <Route path="/" element={<App />}>
                  <Route path="forms">
                    <Route path=":formId/*" element={<Form />} />
                    <Route index element={<Forms />} />
                  </Route>
                  <Route path="/surveys/:handle" element={<SurveyResults />} />
                  <Route path="welcome" element={<Welcome />} />
                </Route>
              </Routes>
            </PortalProvider>
          </BreadcrumbProvider>
        </EscapeStackProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </DndProvider>
);
