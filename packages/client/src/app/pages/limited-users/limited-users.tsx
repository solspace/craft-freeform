/* eslint-disable react/display-name */
import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb } from '@components/breadcrumbs/breadcrumbs';
import { EmptyBlock } from '@components/empty-block/empty-block';
import config, { Edition } from '@config/freeform/freeform.config';
import translate from '@ff-client/utils/translations';

import {
  useLimitedUsersDeleteMutation,
  useLimitedUsersQuery,
} from './limited-users.queries';
import { SettingsSidebar } from './limited-users.sidebar';

export const LimitedUsers: React.FC = () => {
  const { data, isFetching } = useLimitedUsersQuery();
  const mutation = useLimitedUsersDeleteMutation();
  const isPro = config.editions.isAtLeast(Edition.Pro);

  if (!data && isFetching) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Breadcrumb id="settings" label="Settings" url="." external />
      <Breadcrumb
        id="limited-users"
        label="Limited Users"
        url="settings/limited-users"
      />

      <div id="header-container">
        <header id="header" style={{ paddingLeft: 0, paddingRight: 0 }}>
          <div id="page-title" className="flex">
            <h1 className="screen-title">{translate('Limited Users')}</h1>
          </div>

          <Link to="new" className="btn submit add icon">
            {translate('New Group')}
          </Link>
        </header>
      </div>

      <div id="main-content" className="has-sidebar">
        <SettingsSidebar />

        <div id="content-container">
          <div id="content" className="content-pane">
            {isPro && (
              <div className="tablepane">
                {data.length > 0 && (
                  <table className="data fullwidth">
                    <thead>
                      <tr>
                        <th>{translate('Name')}</th>
                        <th>{translate('Description')}</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((item) => (
                        <tr key={item.id}>
                          <th>
                            <Link to={`${item.id}`}>{item.name}</Link>
                          </th>
                          <td>{item.description}</td>
                          <td className="thin">
                            <a
                              className="delete icon"
                              title="Delete"
                              onClick={() => {
                                if (
                                  confirm(
                                    translate(
                                      'Are you sure you want to delete this?'
                                    )
                                  )
                                ) {
                                  mutation.mutate(item.id);
                                }
                              }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {data.length === 0 && (
                  <div style={{ padding: '100px 0 100px' }}>
                    <EmptyBlock
                      title={translate('No groups exist yet')}
                      subtitle={`Click on the "New Group" button to set up your first Limited User permission group.`}
                    />
                  </div>
                )}
              </div>
            )}

            {!isPro && (
              <EmptyBlock
                lite
                title={translate(
                  'Upgrade to the Freeform Pro edition to get access to the Limited Users feature'
                )}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
