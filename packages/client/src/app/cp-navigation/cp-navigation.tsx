import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { NavLink } from 'react-router-dom';

import translate from '@ff-client/utils/translations';

const classNameHandler = ({ isActive }: { isActive: boolean }): string | undefined => (isActive ? 'sel' : undefined);

export const CpNavigation: React.FC = () => {
  useEffect(() => {
    document.querySelector('#nav-freeform > a.sel')?.classList.remove('sel');
  }, []);

  return createPortal(
    <ul className="subnav react">
      <li>
        <NavLink to="" className={classNameHandler}>
          {translate('Dashboard')}
        </NavLink>
      </li>
      <li>
        <NavLink to="forms" className={classNameHandler}>
          {translate('Forms')}
        </NavLink>
      </li>
      <li>
        <NavLink to="settings" className={classNameHandler}>
          {translate('Settings')}
        </NavLink>
      </li>
    </ul>,
    document.getElementById('nav-freeform')
  );
};
