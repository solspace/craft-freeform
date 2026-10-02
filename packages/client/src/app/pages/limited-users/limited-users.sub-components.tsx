import classes from "@ff-client/utils/classes";
import translate from "@ff-client/utils/translations";
import CheckmarkIcon from "@ff-icons/actions/checkmark";
import type React from "react";
import { type ReactNode, useId } from "react";

import {
  Actions,
  Block,
  Control,
  ControlArea,
  Heading,
  Label,
  List,
  ListItem,
  PermissionSwitch,
  TitleBlock,
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
  disabled?: boolean;
};

const BooleanInput: React.FC<Props<BooleanItem, boolean>> = ({
  item,
  updateValue,
  disabled,
}) => {
  const controlId = useId();

  return (
    <Block>
      <Control>
        <PermissionSwitch
          id={controlId}
          type="button"
          role="switch"
          aria-checked={item.enabled}
          aria-label={translate(item.name)}
          disabled={disabled}
          onClick={() => updateValue(!item.enabled)}
        >
          {item.enabled && <CheckmarkIcon aria-hidden="true" />}
        </PermissionSwitch>
      </Control>
      <TitleBlock>
        <Label htmlFor={controlId}>{translate(item.name)}</Label>
      </TitleBlock>
    </Block>
  );
};

const Select: React.FC<Props<SelectItem, string>> = ({
  item,
  updateValue,
  disabled,
}) => {
  const controlId = useId();

  return (
    <Block className="select-control">
      <Control>
        <div className="select">
          <select
            id={controlId}
            disabled={disabled}
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
        <Label htmlFor={controlId}>{translate(item.name)}</Label>
      </TitleBlock>
    </Block>
  );
};

const Toggles: React.FC<Props<TogglesItem, string[]>> = ({
  item,
  updateValue,
  disabled,
}) => {
  const labelId = useId();
  const update = (value: string) => () => {
    updateValue(
      item.values.includes(value)
        ? item.values.filter((v) => v !== value)
        : [...item.values, value],
    );
  };

  return (
    <Block className="triage">
      <TitleBlock>
        <Label as="span" id={labelId}>
          {translate(item.name)}
        </Label>
        <Actions>
          <button
            type="button"
            disabled={
              disabled ||
              item.options.every((option) => item.values.includes(option.value))
            }
            onClick={() =>
              updateValue(item.options.map((option) => option.value))
            }
          >
            {translate("Enable All")}
          </button>
          <button
            type="button"
            disabled={disabled || item.values.length === 0}
            onClick={() => updateValue([])}
          >
            {translate("Disable All")}
          </button>
        </Actions>
      </TitleBlock>
      <ControlArea>
        <ToggleList aria-labelledby={labelId}>
          {item.options.map((option) => (
            <ToggleListItem
              key={option.value}
              className={classes(
                item.values.includes(option.value) && "selected",
              )}
            >
              <label>
                <input
                  type="checkbox"
                  checked={item.values.includes(option.value)}
                  disabled={disabled}
                  onChange={update(option.value)}
                />
                <span>{translate(option.label)}</span>
              </label>
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
  disabled?: boolean;
}> = ({ item, nesting, updateValue, disabled }) => {
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
            <button type="button" disabled={disabled} onClick={update(true)}>
              {translate("Enable All")}
            </button>
            <button type="button" disabled={disabled} onClick={update(false)}>
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
  disabled?: boolean;
}> = ({ item, parentId, nesting = 0, updateValue, disabled = false }) => {
  const id = parentId ? `${parentId}.${item.id}` : item.id;
  const childrenDisabled =
    disabled || (item.type === "boolean" && !item.enabled);
  let controls: ReactNode;

  switch (item.type) {
    case "boolean":
      controls = (
        <BooleanInput
          item={item}
          disabled={disabled}
          updateValue={(enabled) => updateValue(id, { enabled })}
        />
      );
      break;
    case "select":
      controls = (
        <Select
          item={item}
          disabled={disabled}
          updateValue={(value) => updateValue(id, { value })}
        />
      );
      break;
    case "toggles":
      controls = (
        <Toggles
          item={item}
          disabled={disabled}
          updateValue={(values) => updateValue(id, { values })}
        />
      );
      break;
    case "group":
      controls = (
        <Group
          item={item}
          disabled={disabled}
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
    <ListItem
      data-type={item.type}
      data-nesting={nesting}
      data-disabled={disabled || undefined}
    >
      {controls}

      {item.children && (
        <List>
          {item.children.map((item) => (
            <ItemBlock
              key={item.id}
              item={item}
              parentId={id}
              nesting={nesting + 1}
              disabled={childrenDisabled}
              updateValue={updateValue}
            />
          ))}
        </List>
      )}
    </ListItem>
  );
};
