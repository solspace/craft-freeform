import React from 'react';
import type { NotificationTemplate } from '@ff-client/types/notifications';
import { TemplateType } from '@ff-client/types/notifications';

import DatabaseIcon from '../icons/database.svg';
import FilesIcon from '../icons/files.svg';
import type { NotificationSelectHandler } from '../notification-template';

import { Item } from './item/Item';
import {
  TemplateCategoryWrapper,
  TemplateList,
  Title,
} from './category.styles';

type Props = {
  value: number | string;
  category: TemplateType;
  templates: NotificationTemplate[];
  onClick: NotificationSelectHandler;
};

export const Category: React.FC<Props> = ({
  value,
  category,
  templates,
  onClick,
}) => {
  if (!templates.length) {
    return null;
  }

  const title = category === TemplateType.Database ? 'Database' : 'Files';
  const Icon = category === TemplateType.Database ? DatabaseIcon : FilesIcon;

  return (
    <TemplateCategoryWrapper>
      <Title>
        <Icon /> {title}
      </Title>
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
    </TemplateCategoryWrapper>
  );
};
