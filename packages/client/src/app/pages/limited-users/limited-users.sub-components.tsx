import type { ReactNode } from 'react';
import React from 'react';
import { LightSwitch } from '@components/form-controls/control-types/bool/bool.styles';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';

import {
  Actions,
  Block,
  Control,
  ControlArea,
  Heading,
  Label,
  List,
  ListItem,
  TitleBlock,
  ToggleList,
  ToggleListItem,
} from './limited-users.styles';
import type {
  BooleanItem,
  Item,
  RecursiveUpdate,
  SelectItem,
  TogglesItem,
} from './limited-users.types';

type Props<I extends Item, T> = {
  item: I;
  updateValue: (value: T) => void;
};

const Boolean: React.FC<Props<BooleanItem, boolean>> = ({
  item,
  updateValue,
}) => {
  return (
    <Block>
      <Control>
        <LightSwitch
          className={classes(item.enabled && 'on')}
          onClick={() => updateValue(!item.enabled)}
        />
      </Control>
      <TitleBlock>
        <Label onClick={() => updateValue(!item.enabled)}>{item.name}</Label>
      </TitleBlock>
    </Block>
  );
};

const Select: React.FC<Props<SelectItem, string>> = ({ item, updateValue }) => {
  return (
    <Block>
      <Control>
        <div className="select">
          <select
            value={item.value}
            onChange={(event) => updateValue(event.target.value)}
          >
            {item.options.map((option) => (
              <option
                key={option.value}
                label={option.label}
                value={option.value}
              />
            ))}
          </select>
        </div>
      </Control>
      <TitleBlock>
        <Label>{item.name}</Label>
      </TitleBlock>
    </Block>
  );
};

const Toggles: React.FC<Props<TogglesItem, string[]>> = ({
  item,
  updateValue,
}) => {
  const update = (value: string) => () => {
    updateValue(
      item.values.includes(value)
        ? item.values.filter((v) => v !== value)
        : [...item.values, value]
    );
  };

  return (
    <Block className="triage">
      <Control />
      <TitleBlock>
        <Label>{item.name}</Label>
        <Actions>
          <a
            className={classes(
              item.values.length === item.options.length && 'disabled'
            )}
            onClick={() =>
              updateValue(item.options.map((option) => option.value))
            }
          >
            {translate('Enable All')}
          </a>
          <a
            className={classes(item.values.length === 0 && 'disabled')}
            onClick={() => updateValue([])}
          >
            {translate('Disable All')}
          </a>
        </Actions>
      </TitleBlock>
      <ControlArea>
        <ToggleList>
          {item.options.map((option) => (
            <ToggleListItem
              key={option.value}
              onClick={update(option.value)}
              className={classes(
                item.values.includes(option.value) && 'selected'
              )}
            >
              {item.values.includes(option.value) && (
                <i className="fa-sharp fa-solid fa-check" />
              )}
              {option.label}
            </ToggleListItem>
          ))}
        </ToggleList>
      </ControlArea>
    </Block>
  );
};

export const Group: React.FC<{
  item: Item;
  nesting: number;
  updateValue: (list: Array<[string, boolean]>) => void;
}> = ({ item, nesting, updateValue }) => {
  const update = (state: boolean) => () => {
    const traverse = (item: Item, path?: string): Array<[string, boolean]> => {
      const id = path ? `${path}.${item.id}` : item.id;
      const list: Array<[string, boolean]> = [];

      if (item.type === 'boolean') {
        list.push([id, state]);
      }

      if (item.children) {
        const childItems = item.children.map((child) => traverse(child, id));

        list.push(...childItems.flat());
      }

      return list;
    };

    updateValue(traverse(item));
  };

  return (
    <Block className="solo">
      <TitleBlock>
        <Heading>{item.name}</Heading>
        {nesting === 0 && (
          <Actions>
            <a onClick={update(true)}>{translate('Enable All')}</a>
            <a onClick={update(false)}>{translate('Disable All')}</a>
          </Actions>
        )}
      </TitleBlock>
    </Block>
  );
};

export const ItemBlock: React.FC<{
  item: Item;
  parentId?: string;
  nesting?: number;
  updateValue: RecursiveUpdate;
}> = ({ item, parentId, nesting = 0, updateValue }) => {
  const id = parentId ? `${parentId}.${item.id}` : item.id;
  let controls: ReactNode;

  switch (item.type) {
    case 'boolean':
      controls = (
        <Boolean
          item={item}
          updateValue={(enabled) => updateValue(id, { enabled })}
        />
      );
      break;
    case 'select':
      controls = (
        <Select
          item={item}
          updateValue={(value) => updateValue(id, { value })}
        />
      );
      break;
    case 'toggles':
      controls = (
        <Toggles
          item={item}
          updateValue={(values) => updateValue(id, { values })}
        />
      );
      break;
    case 'group':
      controls = (
        <Group
          item={item}
          nesting={nesting}
          updateValue={(list) => {
            list.forEach(([subId, enabled]) => {
              updateValue(subId, { enabled });
            });
          }}
        />
      );
      break;
  }

  return (
    <ListItem data-type={item.type} data-nesting={nesting}>
      {controls}

      {item.children && (
        <List>
          {item.children.map((item) => (
            <ItemBlock
              key={item.id}
              item={item}
              parentId={id}
              nesting={nesting + 1}
              updateValue={updateValue}
            />
          ))}
        </List>
      )}
    </ListItem>
  );
};
