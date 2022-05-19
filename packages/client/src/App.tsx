import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const App: React.FC = () => {
  return (
    <div id="freeform-client-app">
      App
      <nav>
        <Link to="/forms">Forms</Link>
        <Link to="/forms/2">One Form</Link>
        <Link to="/settings">Settings</Link>
      </nav>
      <Outlet />
    </div>
  );
};

export default App;
