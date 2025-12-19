import React from 'react';
import { NavLink } from 'react-router-dom';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';

import { useAbTestsStatistics } from '../ab-tests.queries';
import type { ABTestStatistics } from '../ab-tests.types';

import { useAbTestsList } from './sidebar.queries';
import {
  CategoryTitle,
  SidebarNavigation,
  StatLabel,
  Stats,
  StatValue,
  Test,
  TestDescription,
  TestList,
  TestTitle,
} from './sidebar.styles';

export const Sidebar: React.FC = () => {
  const { data, isFetching } = useAbTestsList();
  const { data: statistics } = useAbTestsStatistics();

  if (isFetching && !data) {
    return <SidebarNavigation />;
  }

  return (
    <SidebarNavigation>
      <TestList>
        {data?.length > 0 && (
          <CategoryTitle>{translate('A/B Test Groups')}</CategoryTitle>
        )}

        {data.map((test) => {
          const variantIds = test.variants
            .map((variant) => variant.id)
            .filter(Boolean);

          const stats: ABTestStatistics = {
            completed: 0,
            interacted: 0,
            served: 0,
            failed: 0,
          };

          variantIds.forEach((variantId) => {
            const variantStats = statistics?.[variantId];
            if (variantStats) {
              stats.completed += variantStats.completed;
              stats.interacted += variantStats.interacted;
              stats.served += variantStats.served;
              stats.failed += variantStats.failed;
            }
          });

          return (
            <Test key={test.id}>
              <NavLink
                to={`${test.id}`}
                className={({ isActive }) => classes(isActive && 'active')}
              >
                <TestTitle>{test.name}</TestTitle>
                {!!test.description && (
                  <TestDescription>{test.description}</TestDescription>
                )}
                <Stats>
                  <li>
                    <StatValue>{stats.served}</StatValue>
                    <StatLabel>{translate('impressions')}</StatLabel>
                  </li>
                  <li>
                    <StatValue>{stats.completed}</StatValue>
                    <StatLabel>{translate('conversions')}</StatLabel>
                  </li>
                </Stats>
              </NavLink>
            </Test>
          );
        })}
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
