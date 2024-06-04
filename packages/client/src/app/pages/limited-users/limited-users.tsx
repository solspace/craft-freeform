/* eslint-disable react/display-name */
import React, { useEffect, useState } from 'react';
import { Breadcrumb } from '@components/breadcrumbs/breadcrumbs';
import translate from '@ff-client/utils/translations';

import { useLimitedUsersQuery } from './limited-users.queries';
import { GroupWrapper, List } from './limited-users.styles';
import { ItemBlock } from './limited-users.sub-components';
import type { Item, RecursiveUpdate } from './limited-users.types';

export const LimitedUsers: React.FC = () => {
  const { data, isFetching } = useLimitedUsersQuery();
  const [state, setState] = useState([]);

  useEffect(() => {
    if (data) {
      setState(data);
    }
  }, [data]);

  const updateValue: RecursiveUpdate = (id, updates): void => {
    const updateItem = (items: Item[], path?: string): Item[] => {
      return items.map((item) => {
        const currentPath = path ? `${path}.${item.id}` : item.id;
        if (currentPath === id) {
          return { ...item, ...updates };
        }

        if (item.children) {
          return {
            ...item,
            children: updateItem(item.children, currentPath),
          };
        }

        return item;
      });
    };

    setState((prev) => updateItem(prev));
  };

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

      <GroupWrapper>
        <List>
          {state.map((item) => (
            <ItemBlock key={item.id} item={item} updateValue={updateValue} />
          ))}
        </List>
      </GroupWrapper>
    </div>
  );
};
