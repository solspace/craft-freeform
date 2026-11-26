import type React from "react";

import { SettingsSidebar } from "./settings.sidebar";

type Props = {
  activeKey: string;
  children: React.ReactNode;
};

export const SettingsLayout: React.FC<Props> = ({ activeKey, children }) => {
  return (
    <div id="main-content" className="has-sidebar">
      <SettingsSidebar activeKey={activeKey} />
      <div id="content-container">
        <div id="content" className="content-pane">
          {children}
        </div>
      </div>
    </div>
  );
};
