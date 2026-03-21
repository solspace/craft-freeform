import React from 'react';
import config from '@config/freeform/freeform.config';
import classes from '@ff-client/utils/classes';

import { SettingsSidebar } from './settings.sidebar';

type Props = {
  activeKey: string;
  children: React.ReactNode;
};

export const SettingsLayout: React.FC<Props> = ({ activeKey, children }) => {
  return (
    <div id="main-content" className="has-sidebar">
      <SettingsSidebar activeKey={activeKey} />
      <div
        id="content-container"
        className={classes(!config.metadata.craft.is5 && 'craft-4')}
      >
        <div id="content" className="content-pane">
          {children}
        </div>
      </div>
    </div>
  );
};
