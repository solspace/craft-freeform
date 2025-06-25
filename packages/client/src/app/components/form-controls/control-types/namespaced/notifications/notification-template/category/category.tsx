import React, { useEffect, useRef, useState } from 'react';
import type { NotificationTemplate } from '@ff-client/types/notifications';
import classes from '@ff-client/utils/classes';

import type { NotificationSelectHandler } from '../notification-template';

import { CreateButton } from './item/CreateButton';
import { Item } from './item/Item';
import {
  TemplateCategoryWrapper,
  TemplateList,
  Title,
} from './category.styles';

type Props = {
  value: number | string;
  title: string;
  templates: NotificationTemplate[];
  canCreate?: boolean;
  onClick: NotificationSelectHandler;
  onCreate?: () => void;
};

export const Category: React.FC<Props> = ({
  value,
  title,
  templates,
  canCreate,
  onClick,
  onCreate,
}) => {
  const listRef = useRef<HTMLUListElement>(null);
  const [hasScroll, setHasScroll] = useState(false);

  useEffect(() => {
    const element = listRef.current;
    if (element) {
      setHasScroll(element.scrollHeight > element.clientHeight);
    }
  }, [templates]);

  if (templates === undefined) {
    return null;
  }

  if (!templates?.length && !canCreate) {
    return null;
  }

  return (
    <TemplateCategoryWrapper>
      <Title>
        <span>{title}</span>
      </Title>

      <TemplateList
        ref={listRef}
        className={classes(hasScroll && 'has-scroll')}
      >
        {templates.map((template) => (
          <Item
            active={value === template.id}
            key={template.id}
            template={template}
            onClick={onClick}
          />
        ))}

        {canCreate && <CreateButton onCreate={onCreate} />}
      </TemplateList>
    </TemplateCategoryWrapper>
  );
};
