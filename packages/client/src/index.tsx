import './config';

import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import App from './App';
import { Form, Forms } from './app/pages/forms';
import { Settings } from './app/pages/settings/settings';
import { queryClient } from './config/query-client';
import { generateUrl } from './utils/urls';

const container = document.getElementById('freeform-client');
const root = ReactDOM.createRoot(container);

root.render(
  <StrictMode>
    <BrowserRouter basename={generateUrl('/client', false)}>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools />
        <Routes>
          <Route path="/" element={<App />}>
            <Route path="forms">
              <Route path=":handle/*" element={<Form />} />
              <Route index element={<Forms />} />
            </Route>
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);
