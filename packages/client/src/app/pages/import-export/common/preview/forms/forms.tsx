import React from 'react';
import { Checkbox } from '@components/elements/checkbox/checkbox';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';

import type { Form } from '../../../import/import.types';
import {
  BlockItem,
  Blocks,
  Directory,
  FormIcon,
  Label,
  ListItem,
  Spacer,
} from '../preview.styles';

type Props = {
  forms: Form[];
  options: string[];
  onUpdate: (options: string[]) => void;
};

export const PreviewForms: React.FC<Props> = ({ forms, options, onUpdate }) => {
  if (!forms.length) {
    return null;
  }

  return (
    <ListItem>
      <Blocks>
        <BlockItem>
          <Checkbox
            id="forms-all"
            checked={options.length === forms.length}
            onChange={() =>
              options.length === forms.length
                ? onUpdate([])
                : onUpdate(forms.map((form) => form.uid))
            }
          />
        </BlockItem>
        <Directory />
        <Label htmlFor="forms-all">{translate('Forms')}</Label>
      </Blocks>

      <ul>
        {forms.map((form) => (
          <ListItem
            key={form.uid}
            className={classes(
              'selectable',
              options.includes(form.uid) && 'selected'
            )}
          >
            <Blocks>
              <BlockItem>
                <Checkbox
                  id={`form-${form.uid}`}
                  checked={options.includes(form.uid)}
                  onChange={() =>
                    onUpdate(
                      options.includes(form.uid)
                        ? options.filter((uid) => uid !== form.uid)
                        : [...options, form.uid]
                    )
                  }
                />
              </BlockItem>
              <Spacer $dash />
              <FormIcon />
              <Label htmlFor={`form-${form.uid}`}>
                {form.name}

                {form.pages.length > 1 && (
                  <small>
                    ({translate('{count} pages', { count: form.pages.length })})
                  </small>
                )}
              </Label>
            </Blocks>
          </ListItem>
        ))}
      </ul>
    </ListItem>
  );
};
