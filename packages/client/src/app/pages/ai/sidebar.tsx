import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SidebarContainer } from '@components/layout/blocks/sidebar-container';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';

export const AiSidebar: React.FC = () => {
  const { pathname } = useLocation();
  const isDashboard = pathname === '/ai' || pathname === '/ai/';
  const isPlans = pathname === '/ai/plans' || pathname.startsWith('/ai/plans/');

  return (
    <SidebarContainer>
      <nav>
        <ul>
          <li>
            <Link to="/ai" className={classes(isDashboard && 'sel')}>
              {translate('Dashboard')}
            </Link>
          </li>
          <li>
            <Link to="/ai/plans" className={classes(isPlans && 'sel')}>
              {translate('Plans')}
            </Link>
          </li>
        </ul>
      </nav>
    </SidebarContainer>
  );
};
