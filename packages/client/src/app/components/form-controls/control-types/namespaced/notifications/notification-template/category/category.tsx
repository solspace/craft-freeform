import React, { useState } from 'react';
import type { NotificationTemplate } from '@ff-client/types/notifications';
import { TemplateType } from '@ff-client/types/notifications';
import classes from '@ff-client/utils/classes';

import CollapserIcon from '../icons/collapser.svg';
import DatabaseIcon from '../icons/database.svg';
import FilesIcon from '../icons/files.svg';
import FormIcon from '../icons/form.svg';
import type { NotificationSelectHandler } from '../notification-template';

import { Item } from './item/Item';
import {
  Collapser,
  TemplateCategoryWrapper,
  TemplateList,
  Title,
} from './category.styles';

type Props = {
  value: number | string;
  category: TemplateType;
  templates: NotificationTemplate[];
  collapseByDefault?: boolean;
  onClick: NotificationSelectHandler;
};

export const Category: React.FC<Props> = ({
  value,
  category,
  templates,
  collapseByDefault,
  onClick,
}) => {
  const [collapsed, setCollapsed] = useState(collapseByDefault);

  if (!templates?.length) {
    return null;
  }

  let title: string, Icon: string;
  switch (category) {
    case TemplateType.Database:
      title = 'Database';
      Icon = DatabaseIcon;
      break;
    case TemplateType.Form:
      title = 'Form';
      Icon = FormIcon;
      break;
    case TemplateType.File:
    default:
      title = 'Files';
      Icon = FilesIcon;
      break;
  }

  return (
    <TemplateCategoryWrapper>
      <Title onClick={() => setCollapsed((prev) => !prev)}>
        <Icon /> {title}{' '}
        <Collapser className={classes(collapsed && 'collapsed')}>
          <CollapserIcon />
        </Collapser>
      </Title>
      {!collapsed && (
        <TemplateList>
          {templates.map((template) => (
            <Item
              active={value === template.id}
              key={template.id}
              template={template}
              onClick={onClick}
            />
          ))}
        </TemplateList>
      )}
    </TemplateCategoryWrapper>
  );
};
