import type React from "react";
import { Outlet } from "react-router-dom";
import { AppWrapper } from "./App.styles";
import { useFreeformNavigation } from "./hooks/use-freeform-navigation";

import "react-loading-skeleton/dist/skeleton.css";

const App: React.FC = () => {
  useFreeformNavigation();

  return (
    <AppWrapper id="freeform-client-app">
      <Outlet />
    </AppWrapper>
  );
};

export default App;
