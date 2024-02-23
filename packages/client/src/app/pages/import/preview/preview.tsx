import React from 'react';
import { Checkbox } from '@components/elements/checkbox/checkbox';
import { PreviewWrapper } from '@components/form-controls/preview/previewable-component.styles';

import type { FormImportData, ImportOptions } from '../import.types';

import {
  BlockItem,
  Blocks,
  Directory,
  File,
  FileList,
  Label,
  ListItem,
  Spacer,
} from './preview.styles';

type Props = {
  data?: FormImportData;
  options: ImportOptions;
  onUpdate: (options: ImportOptions) => void;
};

export const Preview: React.FC<Props> = ({ data, options, onUpdate }) => {
  return (
    <PreviewWrapper>
      <FileList>
        <ul>
          <ListItem>
            <Blocks>
              <BlockItem>
                <Checkbox
                  checked={options.forms.length === data.forms.length}
                  onChange={() =>
                    options.forms.length === data.forms.length
                      ? onUpdate({ ...options, forms: [] })
                      : onUpdate({
                          ...options,
                          forms: data.forms.map((form) => form.uid),
                        })
                  }
                />
              </BlockItem>
              <Directory />
              <Label>Forms</Label>
            </Blocks>

            <ul>
              {data.forms.map((form) => (
                <ListItem key={form.uid}>
                  <Blocks>
                    <BlockItem>
                      <Checkbox
                        checked={options.forms.includes(form.uid)}
                        onChange={() =>
                          onUpdate({
                            ...options,
                            forms: options.forms.includes(form.uid)
                              ? options.forms.filter((uid) => uid !== form.uid)
                              : [...options.forms, form.uid],
                          })
                        }
                      />
                    </BlockItem>
                    <Spacer $dash />
                    <Directory />
                    <Label>{form.name}</Label>
                  </Blocks>

                  <ul>
                    {form.pages.map((page, idx) => {
                      const fields = page.layout.rows.reduce(
                        (count, row) => count + row.fields.length,
                        0
                      );

                      return (
                        <ListItem key={page.uid}>
                          <Blocks>
                            <Spacer $width={3} />
                            <File />
                            <Label $light>
                              Page {idx + 1}: {page.label} ({fields} fields)
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
        </ul>
      </FileList>
    </PreviewWrapper>
  );
};
