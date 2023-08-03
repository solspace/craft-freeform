import React from 'react';
import { Outlet } from 'react-router-dom';

import { useFreeformNavigation } from './hooks/use-freeform-navigation';
import { AppWrapper } from './App.styles';

import 'react-tippy/dist/tippy.css';

const App: React.FC = () => {
  useFreeformNavigation();

  return (
    <AppWrapper id="freeform-client-app">
      <Outlet />
    </AppWrapper>
  );
};

export default App;
