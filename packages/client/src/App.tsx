import React from 'react';
import { Outlet } from 'react-router-dom';

import { AppWrapper } from './App.styles';

import 'react-tippy/dist/tippy.css';

const App: React.FC = () => {
  return (
    <AppWrapper id="freeform-client-app">
      <Outlet />
    </AppWrapper>
  );
};

export default App;
