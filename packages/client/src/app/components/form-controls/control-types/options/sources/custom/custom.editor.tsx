import { AddButtonArea } from "@components/elements/add-button-area/add-button-area";
import { HelpText } from "@components/elements/help-text";
import { LightSwitch } from "@components/elements/lightswitch/lightswitch";
import Bool from "@components/form-controls/control-types/bool/bool";
import {
  Button,
  Cell,
  CenterPoint,
  Input,
  TableContainer,
  TabularOptions,
} from "@components/form-controls/control-types/table/table.editor.styles";
import { DraggableRow } from "@components/form-controls/draggable-row";
import { useCellNavigation } from "@components/form-controls/hooks/use-cell-navigation";
import CrossIcon from "@components/form-controls/icons/cross.svg";
import MoveIcon from "@components/form-controls/icons/move.svg";
import { PreviewableComponent } from "@components/form-controls/preview/previewable-component";
import { PreviewEditor } from "@components/form-controls/preview/previewable-component.styles";
import { useDebounce } from "@ff-client/hooks/use-debounce";
import { PropertyType } from "@ff-client/types/properties";
import translate from "@ff-client/utils/translations";
import DOMPurify from "dompurify";
import React, { useEffect, useRef, useState } from "react";

import type {
  ConfigurationProps,
  CustomOptionsConfiguration,
  Option,
} from "../../options.types";

import { Bulk } from "./custom.bulk";
import { CopyToClipboardButton } from "./custom.clipboard-button";
import {
  BulkButton,
  BulkWrapper,
  ChoiceWrapper,
  TableWithButtonWrapper,
} from "./custom.editor.styles";
import {
  addOption,
  deleteOption,
  moveOption,
  setOptions,
  toggleUseCustomValues,
  updateOption,
} from "./custom.operations";

export const CustomEditor: React.FC<
  ConfigurationProps<CustomOptionsConfiguration>
> = ({
  value,
  updateValue,
  defaultValue,
  updateDefaultValue,
  isMultiple,
  allowOptgroup,
  autoUpdateHandle,
}) => {
  const [localValue, setLocalValue] = useState(value);
  const debouncedValue = useDebounce(localValue, 500);

  useEffect(() => {
    updateValue(debouncedValue);
  }, [debouncedValue, updateValue]);

  useEffect(() => {
    if (!localValue.options.length) {
      setLocalValue(addOption(localValue, 0));
    }
  }, [localValue]);

  const { options = [], useCustomValues = false } = localValue;

  const refs = useRef([]);
  refs.current = options.map(
    (_option, index) =>
      refs.current[index] || React.createRef<HTMLButtonElement>(),
  );

  const { activeCell, setActiveCell, setCellRef, keyPressHandler } =
    useCellNavigation(options.length, useCustomValues ? 2 : 1);

  const addCell = (cellIndex: number, atIndex?: number): void => {
    setActiveCell(
      atIndex !== undefined ? atIndex + 1 : options.length,
      cellIndex,
    );
    setLocalValue(
      addOption(
        localValue,
        atIndex === undefined ? options.length : atIndex + 1,
      ),
    );
  };

  const bulkImport = (
    values: string,
    separator: string,
    append: boolean,
  ): void => {
    let currentOptions: Option[] = [];
    if (append) {
      if (options[0] && options[0].label === "" && options[0].value === "") {
        currentOptions = [];
      } else {
        currentOptions = [...options];
      }
    }

    values.split("\n").forEach((line) => {
      let [label, value] = line.split(separator);
      label = label.trim();
      value = value?.trim();
      let optgroup = false;

      if (label.startsWith("@@")) {
        optgroup = true;
        label = label.replace(/^@@/, "").trim();
      }

      if (!label && !value) {
        return;
      }

      currentOptions.push({
        label: label,
        value: useCustomValues && !!value ? value : label,
        optgroup,
      });
    });

    setLocalValue(setOptions(localValue, currentOptions));
  };

  return (
    <PreviewEditor>
      <ChoiceWrapper>
        <Bool
          property={{
            label: translate("Use custom values"),
            handle: "useCustomValues",
            type: PropertyType.Boolean,
          }}
          value={useCustomValues}
          updateValue={() =>
            setLocalValue(toggleUseCustomValues(localValue, !useCustomValues))
          }
        />

        <BulkWrapper>
          <PreviewableComponent
            preview={
              <BulkButton>
                <i className="fa-duotone fa-list" />
                <span>{translate("Add options in bulk")}</span>
              </BulkButton>
            }
          >
            {(isEditing, close) => (
              <Bulk open={isEditing} close={close} bulkImport={bulkImport} />
            )}
          </PreviewableComponent>

          <CopyToClipboardButton
            options={localValue.options}
            copyValues={useCustomValues}
          />
        </BulkWrapper>
      </ChoiceWrapper>

      {!!options.length && (
        <TableWithButtonWrapper>
          <TableContainer>
            <TabularOptions>
              <thead>
                <tr>
                  {allowOptgroup && <th>{translate("Optgroup")}</th>}
                  <th>{translate("Label")}</th>
                  {useCustomValues && <th>{translate("Value")}</th>}
                  {options.length > 1 && (
                    <>
                      <th>{translate("Selected")}</th>
                      <th colSpan={2}>{translate("Actions")}</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {options.map((option, index) => (
                  <DraggableRow
                    key={index}
                    index={index}
                    dragRef={refs.current[index]}
                    onDrop={(fromIndex, toIndex) =>
                      setLocalValue(moveOption(localValue, fromIndex, toIndex))
                    }
                  >
                    {allowOptgroup && (
                      <Cell $tiny>
                        <CenterPoint>
                          <LightSwitch
                            enabled={option.optgroup}
                            onClick={(enabled) =>
                              setLocalValue(
                                updateOption(
                                  index,
                                  {
                                    ...option,
                                    optgroup: enabled,
                                  },
                                  localValue,
                                ),
                              )
                            }
                          />
                        </CenterPoint>
                      </Cell>
                    )}
                    <Cell>
                      <Input
                        type="text"
                        value={option.label}
                        placeholder={translate("Label")}
                        autoFocus={activeCell === `${index}:0`}
                        ref={(element) => setCellRef(element, index, 0)}
                        onFocus={() => setActiveCell(index, 0)}
                        onKeyDown={keyPressHandler({
                          onEnter: ({ shiftKey }) => {
                            addCell(0, shiftKey ? index : undefined);
                          },
                        })}
                        onChange={(event) =>
                          setLocalValue(
                            updateOption(
                              index,
                              {
                                ...option,
                                label: event.target.value,
                                value:
                                  autoUpdateHandle || !useCustomValues
                                    ? event.target.value
                                    : option.value,
                              },
                              localValue,
                            ),
                          )
                        }
                      />
                    </Cell>

                    {useCustomValues && (
                      <Cell>
                        <Input
                          type="text"
                          className="code"
                          value={option.value}
                          placeholder={translate("Value")}
                          autoFocus={activeCell === `${index}:1`}
                          ref={(element) => setCellRef(element, index, 1)}
                          onFocus={() => setActiveCell(index, 1)}
                          onKeyDown={keyPressHandler({
                            onEnter: ({ shiftKey }) => {
                              addCell(1, shiftKey ? index : undefined);
                            },
                          })}
                          onChange={(event) =>
                            setLocalValue(
                              updateOption(
                                index,
                                {
                                  ...option,
                                  value: event.target.value,
                                },
                                localValue,
                              ),
                            )
                          }
                        />
                      </Cell>
                    )}

                    {options.length > 1 && (
                      <>
                        <Cell $tiny>
                          <CenterPoint>
                            <Bool
                              property={{
                                label: "",
                                handle: `${index}-check`,
                                type: PropertyType.Boolean,
                                width: 50,
                              }}
                              value={
                                isMultiple
                                  ? defaultValue.includes(option.value)
                                  : option.value === defaultValue
                              }
                              updateValue={() => {
                                if (isMultiple) {
                                  const val = defaultValue as string[];

                                  updateDefaultValue(
                                    val.includes(option.value)
                                      ? val.filter(
                                          (value) => value !== option.value,
                                        )
                                      : [...val, option.value],
                                  );
                                } else {
                                  updateDefaultValue(
                                    option.value === defaultValue
                                      ? ""
                                      : option.value,
                                  );
                                }
                              }}
                            />
                          </CenterPoint>
                        </Cell>
                        <Cell $tiny>
                          <CenterPoint>
                            <Button
                              ref={refs.current[index]}
                              className="handle"
                            >
                              <MoveIcon />
                            </Button>
                          </CenterPoint>
                        </Cell>
                        <Cell $tiny>
                          <CenterPoint>
                            <Button
                              onClick={() => {
                                setLocalValue(deleteOption(index, localValue));
                                setActiveCell(Math.max(index - 1, 0), 0);
                              }}
                            >
                              <CrossIcon />
                            </Button>
                          </CenterPoint>
                        </Cell>
                      </>
                    )}
                  </DraggableRow>
                ))}
              </tbody>
            </TabularOptions>
          </TableContainer>
          <AddButtonArea label="Add an option" onClick={() => addCell(0)} />
        </TableWithButtonWrapper>
      )}

      <HelpText>
        <span
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(
              translate(
                "Press <b>enter</b> while editing a cell to add a new row.",
              ),
            ),
          }}
        />
      </HelpText>
    </PreviewEditor>
  );
};
