import React, { useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import classes from '@ff-client/utils/classes';
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
      <div id="header-container">
        <header id="header">
          <div id="page-title" className="flex">
            <h1 className="screen-title">Freeform Data</h1>
          </div>
        </header>
      </div>
      <ImportWrapper>
        <div id="sidebar-container">
          <div id="sidebar" className="sidebar">
            <nav>
              <ul>
                <li className="heading">
                  <span>Export</span>
                </li>
                <li>
                  <a href={generateUrl('/export/profiles')}>Profiles</a>
                </li>
                <li>
                  <a href={generateUrl('/export/notifications')}>
                    Notifications
                  </a>
                </li>

                <li className="heading">
                  <span>Import</span>
                </li>
                <li>
                  <NavLink
                    to="express-forms"
                    className={({ isActive }) => classes(isActive && 'sel')}
                  >
                    Express Forms
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
