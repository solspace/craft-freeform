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
                : onUpdate(templates.map((template) => template.uid))
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
            key={template.uid}
            className={classes(
              'selectable',
              options.includes(template.uid) && 'selected'
            )}
          >
            <Blocks>
              <BlockItem>
                <Checkbox
                  id={`notification-template-${template.uid}`}
                  checked={options.includes(template.uid)}
                  onChange={() =>
                    onUpdate(
                      options.includes(template.uid)
                        ? options.filter((id) => id !== template.uid)
                        : [...options, template.uid]
                    )
                  }
                />
              </BlockItem>
              <Spacer $dash />
              <NotificationIcon />
              <Label $light htmlFor={`notification-template-${template.uid}`}>
                {template.name}
              </Label>
            </Blocks>
          </ListItem>
        ))}
      </ul>
    </ListItem>
  );
};
