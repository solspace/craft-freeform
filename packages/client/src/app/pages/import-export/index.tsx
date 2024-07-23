import React from 'react';
import { Outlet } from 'react-router-dom';
import translate from '@ff-client/utils/translations';

import { Sidebar } from './common/sidebar/sidebar';
import { ImportExportWrapper } from './index.styles';

export const ImportExport: React.FC = () => {
  return (
    <div>
      <div id="header-container">
        <header id="header" style={{ paddingLeft: 0 }}>
          <div id="page-title" className="flex">
            <h1 className="screen-title">
              {translate('Import from Express Forms')}
            </h1>
          </div>
        </header>
      </div>
      <ImportExportWrapper>
        <Sidebar />
        <Outlet />
      </ImportExportWrapper>
    </div>
  );
};
