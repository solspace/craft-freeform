import React from 'react';
import { Checkbox } from '@components/elements/checkbox/checkbox';
import classes from '@ff-client/utils/classes';
import { stripTags } from '@ff-client/utils/html-attributes';
import { kebabCase } from 'lodash';

import {
  BlockItem,
  Blocks,
  Directory,
  Label,
  ListItem,
  Spacer,
} from './preview.styles';

type Props<O> = {
  id?: string;
  label: string;
  icon?: JSX.Element;
  itemIcon?: (item: O) => JSX.Element | string;
  items: O[];
  labelKey: keyof O;
  selectionKey: keyof O;
  selection: string[];
  onUpdate: (selection: string[]) => void;
  labelExtras?: (item: O) => JSX.Element | string;
  nested?: boolean;
};

export const PreviewGenericList = <T,>(props: Props<T>): JSX.Element => {
  const { label, icon, itemIcon, labelExtras } = props;
  const { items, selection, onUpdate } = props;
  const { labelKey, selectionKey, nested } = props;

  const id = props.id || kebabCase(label);

  if (!Array.isArray(items) || !items.length) {
    return null;
  }

  return (
    <ListItem>
      <Blocks>
        <BlockItem>
          <Checkbox
            id={`${id}-all`}
            checked={selection.length === items.length}
            onChange={() =>
              selection.length === items.length
                ? onUpdate([])
                : onUpdate(items.map((item) => item[selectionKey] as string))
            }
          />
        </BlockItem>
        {nested && <Spacer $dash />}
        <Directory />
        <Label htmlFor={`${id}-all`}>{label}</Label>
      </Blocks>

      <ul>
        {items.map((item) => (
          <ListItem
            key={item[selectionKey] as string}
            className={classes(
              'selectable',
              selection.includes(item[selectionKey] as string) && 'selected'
            )}
          >
            <Blocks>
              <BlockItem>
                <Checkbox
                  id={`${id}-${item[selectionKey]}`}
                  checked={selection.includes(item[selectionKey] as string)}
                  onChange={() =>
                    onUpdate(
                      selection.includes(item[selectionKey] as string)
                        ? selection.filter((uid) => uid !== item[selectionKey])
                        : [...selection, item[selectionKey] as string]
                    )
                  }
                />
              </BlockItem>
              <Spacer $dash $width={nested ? 2 : undefined} />
              {icon}
              {itemIcon && itemIcon(item)}
              <Label htmlFor={`${id}-${item[selectionKey]}`}>
                {stripTags(item[labelKey] as string)}
                {labelExtras && labelExtras(item)}
              </Label>
            </Blocks>
          </ListItem>
        ))}
      </ul>
    </ListItem>
  );
};
