import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Sidebar } from '@ff-client/app/components/layout/sidebar/sidebar';
import { useForceUpdate } from '@ff-client/hooks/use-force-update';
import { useQueryFormIntegrations } from '@ff-client/queries/integrations';
import type { IntegrationCategory } from '@ff-client/types/integrations';
import translate from '@ff-client/utils/translations';

import { useLastTab } from '../../tabs.hooks';

import { Category } from './category/category';
import { CategorySkeleton } from './category/category.skeleton';
import { Wrapper } from './list.styles';

export const List: React.FC = () => {
  const { formId, id } = useParams();
  const navigate = useNavigate();

  const { data, isFetching } = useQueryFormIntegrations(
    formId && Number(formId)
  );

  // Due to issues with react-query race conditions, we need to force a re-render
  useForceUpdate();

  const { lastTab, setLastTab } = useLastTab('integrations');

  useEffect(() => {
    if (lastTab) {
      navigate(lastTab);
    }
  }, []);

  useEffect(() => {
    if (!id && !lastTab && data) {
      const first = data.find(Boolean);
      if (first) {
        setLastTab(`${first.id}/${first.handle}`);
        navigate(`${first.id}/${first.handle}`);
      }
    }
  }, [id, data]);

  if (!data && isFetching) {
    return (
      <Sidebar>
        <Wrapper>
          <CategorySkeleton />
        </Wrapper>
      </Sidebar>
    );
  }

  if (!data && !isFetching) {
    return (
      <Sidebar>
        <Wrapper />
      </Sidebar>
    );
  }

  const categories: Record<string, IntegrationCategory> = {};
  data.forEach((integration) => {
    const { type } = integration;
    if (!categories[type]) {
      categories[type] = {
        type,
        label: translate(type.replace('-', ' ')),
        children: [],
      };
    }

    categories[type].children.push(integration);
  });

  return (
    <Sidebar $lean>
      <Wrapper>
        {Object.values(categories).map((category) => (
          <Category key={category.type} {...category} />
        ))}
      </Wrapper>
    </Sidebar>
  );
};
