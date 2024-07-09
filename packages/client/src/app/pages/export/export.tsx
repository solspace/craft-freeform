import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Breadcrumb } from '@components/breadcrumbs/breadcrumbs';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';
import { generateUrl } from '@ff-client/utils/urls';

import { ImportWrapper } from './export.styles';

export const Export: React.FC = () => {
  return (
    <div>
      <Breadcrumb id="export" label="Export" url="export/freeform" />
      <Breadcrumb id="export-freeform" label="Freeform" url="export/freeform" />
      <div id="header-container">
        <header id="header" style={{ paddingLeft: 0 }}>
          <div id="page-title" className="flex">
            <h1 className="screen-title">{translate('Export Freeform')}</h1>
          </div>
        </header>
      </div>
      <ImportWrapper>
        <div id="sidebar-container">
          <div id="sidebar" className="sidebar">
            <nav>
              <ul>
                <li className="heading">
                  <span>{translate('Export')}</span>
                </li>
                <li>
                  <a href={generateUrl('/export/profiles')}>
                    {translate('Profiles')}
                  </a>
                </li>
                <li>
                  <a href={generateUrl('/export/notifications')}>
                    {translate('Notifications')}
                  </a>
                </li>

                <li className="heading">
                  <span>{translate('Import')}</span>
                </li>
                <li>
                  <NavLink
                    to="express-forms"
                    className={({ isActive }) => classes(isActive && 'sel')}
                  >
                    {translate('Express Forms')}
                  </NavLink>
                </li>
              </ul>
            </nav>
          </div>
        </div>
        <Outlet />
      </ImportWrapper>
    </div>
  );
};
