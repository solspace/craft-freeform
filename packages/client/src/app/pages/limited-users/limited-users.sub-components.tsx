import { LightSwitch } from "@components/elements/lightswitch/lightswitch";
import translate from "@ff-client/utils/translations";
import type React from "react";
import type { ReactNode } from "react";

import {
  Actions,
  Block,
  ChildrenCollapse,
  ChildrenViewport,
  Control,
  ControlArea,
  Heading,
  Label,
  List,
  ListItem,
  TitleBlock,
  ToggleButton,
  ToggleIndicator,
  ToggleList,
  ToggleListItem,
} from "./limited-users.styles";
import type {
  BooleanItem,
  Item,
  RecursiveUpdate,
  SelectItem,
  TogglesItem,
} from "./limited-users.types";

type Props<I extends Item, T> = {
  item: I;
  updateValue: (value: T) => void;
};

const BooleanInput: React.FC<Props<BooleanItem, boolean>> = ({
  item,
  updateValue,
}) => {
  return (
    <Block>
      <Control>
        <LightSwitch
          enabled={item.enabled}
          onClick={(enabled) => updateValue(enabled)}
        />
      </Control>
      <TitleBlock>
        <Label onClick={() => updateValue(!item.enabled)}>
          {translate(item.name)}
        </Label>
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
                label={translate(option.label)}
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
        : [...item.values, value],
    );
  };

  return (
    <Block className="triage">
      <Control />
      <TitleBlock>
        <Label>{translate(item.name)}</Label>
        <Actions>
          <button
            type="button"
            disabled={item.values.length === item.options.length}
            onClick={() =>
              updateValue(item.options.map((option) => option.value))
            }
          >
            {translate("Enable All")}
          </button>
          <button
            type="button"
            disabled={item.values.length === 0}
            onClick={() => updateValue([])}
          >
            {translate("Disable All")}
          </button>
        </Actions>
      </TitleBlock>
      <ControlArea>
        <ToggleList>
          {item.options.map((option) => (
            <ToggleListItem key={option.value}>
              <ToggleButton
                type="button"
                role="switch"
                aria-checked={item.values.includes(option.value)}
                onClick={update(option.value)}
              >
                <span>{translate(option.label)}</span>
                <ToggleIndicator aria-hidden="true">
                  <LightSwitch enabled={item.values.includes(option.value)} />
                </ToggleIndicator>
              </ToggleButton>
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

      if (item.type === "boolean") {
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
        <Heading>{translate(item.name)}</Heading>
        {nesting === 0 && (
          <Actions>
            <button type="button" onClick={update(true)}>
              {translate("Enable All")}
            </button>
            <button type="button" onClick={update(false)}>
              {translate("Disable All")}
            </button>
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
  hiddenPropertyGroups?: ReadonlySet<string>;
}> = ({ item, parentId, nesting = 0, updateValue, hiddenPropertyGroups }) => {
  const id = parentId ? `${parentId}.${item.id}` : item.id;
  const isFieldProperty = parentId === "props";
  const propertyVisible = !hiddenPropertyGroups?.has(item.id);
  let controls: ReactNode;

  switch (item.type) {
    case "boolean":
      controls = (
        <BooleanInput
          item={item}
          updateValue={(enabled) => updateValue(id, { enabled })}
        />
      );
      break;
    case "select":
      controls = (
        <Select
          item={item}
          updateValue={(value) => updateValue(id, { value })}
        />
      );
      break;
    case "toggles":
      controls = (
        <Toggles
          item={item}
          updateValue={(values) => updateValue(id, { values })}
        />
      );
      break;
    case "group":
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

  const children = item.children && (
    <List>
      {item.children.map((child) => (
        <ItemBlock
          key={child.id}
          item={child}
          parentId={id}
          nesting={nesting + 1}
          updateValue={updateValue}
          hiddenPropertyGroups={hiddenPropertyGroups}
        />
      ))}
    </List>
  );

  return (
    <ListItem
      data-id={item.id}
      data-type={item.type}
      data-nesting={nesting}
      data-collapsed={isFieldProperty && !propertyVisible ? true : undefined}
    >
      {isFieldProperty ? (
        <ChildrenCollapse
          $expanded={propertyVisible}
          aria-hidden={!propertyVisible}
          inert={!propertyVisible}
        >
          <ChildrenViewport>{controls}</ChildrenViewport>
        </ChildrenCollapse>
      ) : (
        controls
      )}

      {children && item.type === "boolean" ? (
        <ChildrenCollapse
          $expanded={item.enabled}
          aria-hidden={!item.enabled}
          inert={!item.enabled}
        >
          <ChildrenViewport>{children}</ChildrenViewport>
        </ChildrenCollapse>
      ) : (
        children
      )}
    </ListItem>
  );
};
