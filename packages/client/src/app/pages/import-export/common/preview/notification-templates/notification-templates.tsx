import React from 'react';
import { Checkbox } from '@components/elements/checkbox/checkbox';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';

import type { NotificationTemplate } from '../../../import/import.types';
import {
  BlockItem,
  Blocks,
  Directory,
  Label,
  ListItem,
  NotificationIcon,
  Spacer,
} from '../preview.styles';

type Props = {
  templates: NotificationTemplate[];
  options: Array<number | string>;
  onUpdate: (options: Array<number | string>) => void;
};

export const PreviewNotificationTemplates: React.FC<Props> = ({
  templates,
  options,
  onUpdate,
}) => {
  if (!Array.isArray(templates) || !templates.length) {
    return null;
  }

  return (
    <ListItem>
      <Blocks>
        <BlockItem>
          <Checkbox
            id="notification-templates-all"
            checked={options.length === templates.length}
            onChange={() =>
              options.length === templates.length
                ? onUpdate([])
                : onUpdate(templates.map((template) => template.originalId))
            }
          />
        </BlockItem>
        <Directory />
        <Label htmlFor="notification-templates-all">
          {translate('Notification Templates')}
        </Label>
      </Blocks>

      <ul>
        {templates.map((template) => (
          <ListItem
            key={template.originalId}
            className={classes(
              'selectable',
              options.includes(template.originalId) && 'selected'
            )}
          >
            <Blocks>
              <BlockItem>
                <Checkbox
                  id={`notification-template-${template.originalId}`}
                  checked={options.includes(template.originalId)}
                  onChange={() =>
                    onUpdate(
                      options.includes(template.originalId)
                        ? options.filter((id) => id !== template.originalId)
                        : [...options, template.originalId]
                    )
                  }
                />
              </BlockItem>
              <Spacer $dash />
              <NotificationIcon />
              <Label
                $light
                htmlFor={`notification-template-${template.originalId}`}
              >
                {typeof template.originalId === 'string'
                  ? template.originalId
                  : template.name}
              </Label>
            </Blocks>
          </ListItem>
        ))}
      </ul>
    </ListItem>
  );
};
