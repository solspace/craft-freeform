import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Sidebar } from '@components/layout/sidebar/sidebar';
import { Category } from '@editor/builder/tabs/notifications/sidebar/category/category';
import { CategorySkeleton } from '@editor/builder/tabs/notifications/sidebar/category/category.skeleton';
import { Wrapper } from '@editor/builder/tabs/notifications/sidebar/list.styles';
import { useQueryFormNotifications } from '@ff-client/queries/notifications';
import type { NotificationCategory } from '@ff-client/types/notifications';

const categoryLabels: Record<string, string> = {
  admin: 'Admin',
  conditional: 'Conditional',
};

export const List: React.FC = () => {
  const { formId, id } = useParams();
  const navigate = useNavigate();

  const { data, isFetching } = useQueryFormNotifications(Number(formId ?? 0));

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

  if (!data && !isFetching) {
    return (
      <Sidebar>
        <Wrapper />
      </Sidebar>
    );
  }

  const categories: Record<string, NotificationCategory> = {};
  data.forEach((notification) => {
    const { type } = notification;
    if (!categories[type]) {
      categories[type] = {
        type,
        label: categoryLabels[type] ?? 'Other',
        children: [],
      };
    }

    categories[type].children.push(notification);
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
