import React from 'react';
import { Checkbox } from '@components/elements/checkbox/checkbox';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';

import type { Form } from '../../import.types';
import {
  BlockItem,
  Blocks,
  Directory,
  File,
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
              <Directory />
              <Label htmlFor={`form-${form.uid}`}>{form.name}</Label>
            </Blocks>

            <ul>
              {form.pages.map((page) => {
                const fields = page.layout.rows.reduce(
                  (count, row) => count + row.fields.length,
                  0
                );

                const fieldString = translate('{fields} fields', { fields });

                return (
                  <ListItem key={page.uid}>
                    <Blocks>
                      <Spacer $width={3} />
                      <File />
                      <Label $light htmlFor={`form-${form.uid}`}>
                        {page.label} ({fieldString})
                      </Label>
                    </Blocks>
                  </ListItem>
                );
              })}
            </ul>
          </ListItem>
        ))}
      </ul>
    </ListItem>
  );
};
