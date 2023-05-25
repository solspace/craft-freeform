import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import '../config';
import './utils/prototypes';

import { queryClient } from '../config/react-query';

import { CpNavigation } from './app/components/cp-navigation/cp-navigation';
import { Form, Forms } from './app/pages/forms';
import ManualStyles from './styles/manual';
import { generateUrl } from './utils/urls';
import App from './App';

const container = document.getElementById('freeform-client');
const root = ReactDOM.createRoot(container);

root.render(
  <BrowserRouter basename={generateUrl('/', false)}>
    <QueryClientProvider client={queryClient}>
      <ManualStyles />
      <ReactQueryDevtools />
      <CpNavigation />
      <Routes>
        <Route path="/" element={<App />}>
          <Route path="forms">
            <Route path="new/*" element={<Form />} />
            <Route path=":formId/*" element={<Form />} />
            <Route index element={<Forms />} />
          </Route>
        </Route>
      </Routes>
    </QueryClientProvider>
  </BrowserRouter>
);
