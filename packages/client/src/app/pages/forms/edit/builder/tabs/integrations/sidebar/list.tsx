import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Sidebar } from '@ff-client/app/components/layout/sidebar/sidebar';
import { useQueryFormIntegrations } from '@ff-client/queries/integrations';
import type { IntegrationCategory } from '@ff-client/types/integrations';

import { Category } from './category/category';
import { CategorySkeleton } from './category/category.skeleton';
import { Wrapper } from './list.styles';

const categoryLabels: Record<string, string> = {
  crm: 'CRM',
  mailing_list: 'Email Marketing',
  payment: 'Payment',
};

export const List: React.FC = () => {
  const { formId, id } = useParams();
  const navigate = useNavigate();

  const { data, isFetching } = useQueryFormIntegrations(Number(formId));

  useEffect(() => {
    if (!id && data) {
      const first = data.find(Boolean);
      if (first) {
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

  const categories: Record<string, IntegrationCategory> = {};
  data.forEach((integration) => {
    const { type } = integration;
    if (!categories[type]) {
      categories[type] = {
        type,
        label: categoryLabels[type] ?? 'Other',
        children: [],
      };
    }

    categories[type].children.push(integration);
  });

  return (
    <Sidebar lean>
      <Wrapper>
        {Object.values(categories).map((category) => (
          <Category key={category.type} {...category} />
        ))}
      </Wrapper>
    </Sidebar>
  );
};
