import React from 'react';
import { Checkbox } from '@components/elements/checkbox/checkbox';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';

import {
  BlockItem,
  Blocks,
  Label,
  ListItem,
  SettingsIcon,
} from '../preview.styles';

type Props = {
  value: boolean;
  onUpdate: (value: boolean) => void;
};

export const PreviewSettings: React.FC<Props> = ({ value, onUpdate }) => {
  return (
    <ListItem>
      <ul>
        <ListItem className={classes('selectable', value && 'selected')}>
          <Blocks>
            <BlockItem>
              <Checkbox
                id={`export-settings`}
                checked={value}
                onChange={() => onUpdate(!value)}
              />
            </BlockItem>
            <SettingsIcon />
            <Label htmlFor={`export-settings`}>{translate('Settings')}</Label>
          </Blocks>
        </ListItem>
      </ul>
    </ListItem>
  );
};
