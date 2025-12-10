import React from 'react';
import { NavLink } from 'react-router-dom';

import { useAbTestsList } from './sidebar.queries';
import {
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
        {data.map((test) => (
          <Test key={test.id}>
            <NavLink
              to={`${test.id}`}
              className={({ isActive }) => isActive && 'active'}
            >
              <TestTitle>{test.name}</TestTitle>
              {!!test.description && (
                <TestDescription>{test.description}</TestDescription>
              )}
            </NavLink>
          </Test>
        ))}

        <Test>
          <NavLink to="new">
            <TestTitle>Create New A/B Test</TestTitle>
            <TestDescription>Click here to create a new test</TestDescription>
          </NavLink>
        </Test>
      </TestList>
    </SidebarNavigation>
  );
};
