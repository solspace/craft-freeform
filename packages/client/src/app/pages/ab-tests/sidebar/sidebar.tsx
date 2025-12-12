import React from 'react';
import { NavLink } from 'react-router-dom';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';

import { useAbTestsList } from './sidebar.queries';
import {
  CategoryTitle,
  SidebarNavigation,
  Test,
  TestDescription,
  TestList,
  TestTitle,
} from './sidebar.styles';

export const Sidebar: React.FC = () => {
  const { data, isFetching } = useAbTestsList();

  if (isFetching && !data) {
    return <SidebarNavigation />;
  }

  return (
    <SidebarNavigation>
      <TestList>
        <CategoryTitle>{translate('A/B Test Groups')}</CategoryTitle>
        {data.map((test) => (
          <Test key={test.id}>
            <NavLink
              to={`${test.id}`}
              className={({ isActive }) => classes(isActive && 'active')}
            >
              <TestTitle>{test.name}</TestTitle>
              {!!test.description && (
                <TestDescription>{test.description}</TestDescription>
              )}
            </NavLink>
          </Test>
        ))}
      </TestList>
      <TestList>
        <CategoryTitle>{translate('Actions')}</CategoryTitle>
        <Test>
          <NavLink to="new">
            <TestTitle>Create New A/B Test</TestTitle>
          </NavLink>
        </Test>
      </TestList>
    </SidebarNavigation>
  );
};
