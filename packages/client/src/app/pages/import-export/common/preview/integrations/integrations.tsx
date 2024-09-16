import React from 'react';
import { Checkbox } from '@components/elements/checkbox/checkbox';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';

import type { Integration } from '../../../import/import.types';
import {
  BlockItem,
  Blocks,
  Directory,
  Icon,
  Label,
  ListItem,
  Spacer,
} from '../preview.styles';

type Props = {
  integrations: Integration[];
  options: string[];
  onUpdate: (options: string[]) => void;
};

export const PreviewIntegrations: React.FC<Props> = ({
  integrations,
  options,
  onUpdate,
}) => {
  if (!Array.isArray(integrations) || !integrations.length) {
    return null;
  }

  return (
    <ListItem>
      <Blocks>
        <BlockItem>
          <Checkbox
            id="integrations-all"
            checked={options.length === integrations.length}
            onChange={() =>
              options.length === integrations.length
                ? onUpdate([])
                : onUpdate(integrations.map((template) => template.uid))
            }
          />
        </BlockItem>
        <Directory />
        <Label htmlFor="integrations-all">{translate('Integrations')}</Label>
      </Blocks>

      <ul>
        {integrations.map((integration) => (
          <ListItem
            key={integration.uid}
            className={classes(
              'selectable',
              options.includes(integration.uid) && 'selected'
            )}
          >
            <Blocks>
              <BlockItem>
                <Checkbox
                  id={`integration-${integration.uid}`}
                  checked={options.includes(integration.uid)}
                  onChange={() =>
                    onUpdate(
                      options.includes(integration.uid)
                        ? options.filter((uid) => uid !== integration.uid)
                        : [...options, integration.uid]
                    )
                  }
                />
              </BlockItem>
              <Spacer $dash />
              <Icon>
                <img src={integration.icon} />
              </Icon>
              <Label $light htmlFor={`integration-${integration.uid}`}>
                {integration.name}
              </Label>
            </Blocks>
          </ListItem>
        ))}
      </ul>
    </ListItem>
  );
};
