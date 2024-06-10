/* eslint-disable react/display-name */
import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb } from '@components/breadcrumbs/breadcrumbs';
import translate from '@ff-client/utils/translations';

import { useLimitedUsersQuery } from './limited-users.queries';

export const LimitedUsers: React.FC = () => {
  const { data, isFetching } = useLimitedUsersQuery();

  if (!data && isFetching) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Breadcrumb id="settings" label="Settings" url="settings" />
      <Breadcrumb
        id="limited-users"
        label="Limited Users"
        url="settings/limited-users"
      />

      <div id="header-container">
        <header id="header" style={{ paddingLeft: 0 }}>
          <div id="page-title" className="flex">
            <h1 className="screen-title">{translate('Limited Users')}</h1>
          </div>
        </header>
      </div>

      <ul>
        {data.map((item) => (
          <li key={item.id}>
            <Link to={`${item.id}`}>{item.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
