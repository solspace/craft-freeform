import React, { useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Breadcrumb } from '@components/breadcrumbs/breadcrumbs';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';
import { generateUrl } from '@ff-client/utils/urls';

import { ImportWrapper } from './import.styles';

export const Import: React.FC = () => {
  useEffect(() => {
    const navItems = document.querySelectorAll(
      '#nav-freeform .subnav > li > a'
    );

    navItems.forEach((item) => {
      const href = item.attributes.getNamedItem('href').value;
      if (/\/freeform\/forms/.test(href)) {
        item.classList.remove('sel');
      }

      if (/\/freeform\/export/.test(href)) {
        item.classList.add('sel');
      }
    });

    return () => {
      navItems.forEach((item) => {
        const href = item.attributes.getNamedItem('href').value;
        if (/\/freeform\/forms/.test(href)) {
          item.classList.add('sel');
        }

        if (/\/freeform\/export/.test(href)) {
          item.classList.remove('sel');
        }
      });
    };
  }, []);

  return (
    <div>
      <Breadcrumb id="import" label="Import" url="import/express-forms" />
      <Breadcrumb
        id="import-express"
        label="Express Forms"
        url="import/express-forms"
      />
      <div id="header-container">
        <header id="header" style={{ paddingLeft: 0 }}>
          <div id="page-title" className="flex">
            <h1 className="screen-title">
              {translate('Import from Express Forms')}
            </h1>
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
