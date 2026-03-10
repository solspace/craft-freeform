import { AddButtonArea } from "@components/elements/add-button-area/add-button-area";
import { HelpText } from "@components/elements/help-text";
import { DraggableRow } from "@components/form-controls/draggable-row";
import { useCellNavigation } from "@components/form-controls/hooks/use-cell-navigation";
import CrossIcon from "@components/form-controls/icons/cross.svg";
import MoveIcon from "@components/form-controls/icons/move.svg";
import { useDebounce } from "@ff-client/hooks/use-debounce";
import { PropertyType } from "@ff-client/types/properties";
import translate from "@ff-client/utils/translations";
import DOMPurify from "dompurify";
import update from "immutability-helper";
import React, { useEffect, useRef, useState } from "react";

import Bool from "../../bool/bool";
import { TableWithButtonWrapper } from "../../options/sources/custom/custom.editor.styles";
import {
  Button,
  Cell,
  CenterPoint,
  Input,
  TableContainer,
  TabularOptions,
} from "../table.editor.styles";

import type { TableEditorProps } from "./table.editor.types";

const addOption = (options: string[], atIndex: number): string[] => [
  ...options.slice(0, atIndex),
  "",
  ...options.slice(atIndex),
];

const updateOption = (
  index: number,
  option: string,
  options: string[],
): string[] => {
  const updated = [...options];
  updated[index] = option;

  return updated;
};

const deleteOption = (index: number, options: string[]): string[] =>
  options.filter((_, optionIndex) => optionIndex !== index);

const moveOption = (
  options: string[],
  fromIndex: number,
  toIndex: number,
): string[] =>
  update(options, {
    $splice: [
      [fromIndex, 1],
      [toIndex, 0, options[fromIndex]],
    ],
  });

const areOptionsEqual = (left: string[] = [], right: string[] = []): boolean =>
  left.length === right.length &&
  left.every((option, index) => option === right[index]);

export const TableDropdownEditor: React.FC<TableEditorProps> = ({
  column,
  onUpdate,
}) => {
  const [localOptions, setLocalOptions] = useState<string[]>(
    column.options?.length ? column.options : [""],
  );
  const debouncedOptions = useDebounce(localOptions, 500);

  const columnRef = useRef(column);
  useEffect(() => {
    columnRef.current = column;
  }, [column]);

  const onUpdateRef = useRef(onUpdate);
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    const nextOptions = column.options?.length ? column.options : [""];
    setLocalOptions((prevOptions) =>
      areOptionsEqual(prevOptions, nextOptions) ? prevOptions : nextOptions,
    );
  }, [column.options]);

  useEffect(() => {
    const currentColumn = columnRef.current;
    const currentValue = currentColumn.value;
    const nextValue = debouncedOptions.includes(currentValue)
      ? currentValue
      : "";

    if (
      areOptionsEqual(currentColumn.options ?? [], debouncedOptions) &&
      currentColumn.value === nextValue
    ) {
      return;
    }

    onUpdateRef.current({
      ...currentColumn,
      options: debouncedOptions,
      value: nextValue,
    });
  }, [debouncedOptions]);

  const refs = useRef<Array<React.RefObject<HTMLButtonElement>>>([]);
  refs.current = localOptions.map(
    (_, index) => refs.current[index] || React.createRef<HTMLButtonElement>(),
  );

  const { activeCell, setActiveCell, setCellRef, keyPressHandler } =
    useCellNavigation(localOptions.length, 1);

  const addCell = (cellIndex: number, atIndex?: number): void => {
    setActiveCell(
      atIndex !== undefined ? atIndex + 1 : localOptions.length,
      cellIndex,
    );
    setLocalOptions(
      addOption(
        localOptions,
        atIndex === undefined ? localOptions.length : atIndex + 1,
      ),
    );
  };

  const setSelectedOption = (option: string): void => {
    const currentColumn = columnRef.current;
    const nextValue = currentColumn.value === option ? "" : option;
    const nextColumn = {
      ...currentColumn,
      options: localOptions,
      value: nextValue,
    };

    columnRef.current = nextColumn;
    onUpdateRef.current(nextColumn);
  };

  return (
    <>
      <TableWithButtonWrapper>
        <TableContainer>
          <TabularOptions>
            <thead>
              <tr>
                <th>{translate("Label")}</th>
                {localOptions.length > 1 && (
                  <>
                    <th>{translate("Selected")}</th>
                    <th colSpan={2}>{translate("Actions")}</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {localOptions.map((option, index) => (
                <DraggableRow
                  key={index}
                  index={index}
                  dragRef={refs.current[index]}
                  onDrop={(fromIndex, toIndex) =>
                    setLocalOptions(
                      moveOption(localOptions, fromIndex, toIndex),
                    )
                  }
                >
                  <Cell>
                    <Input
                      type="text"
                      value={option}
                      placeholder={translate("Label")}
                      autoFocus={activeCell === `${index}:0`}
                      ref={(element) => setCellRef(element, index, 0)}
                      onFocus={() => setActiveCell(index, 0)}
                      onKeyDown={keyPressHandler({
                        onEnter: ({ shiftKey }) => {
                          addCell(0, shiftKey ? index : undefined);
                        },
                        onDelete: () => {
                          if (localOptions.length > 1) {
                            const nextOptions = deleteOption(
                              index,
                              localOptions,
                            );
                            const currentColumn = columnRef.current;
                            const nextColumn = {
                              ...currentColumn,
                              options: nextOptions,
                              value:
                                currentColumn.value === option
                                  ? ""
                                  : currentColumn.value,
                            };

                            columnRef.current = nextColumn;
                            onUpdateRef.current(nextColumn);
                            setLocalOptions(nextOptions);
                            setActiveCell(Math.max(index - 1, 0), 0);
                          }
                        },
                      })}
                      onChange={(event) => {
                        const nextOptions = updateOption(
                          index,
                          event.target.value,
                          localOptions,
                        );
                        const currentColumn = columnRef.current;

                        if (currentColumn.value === option) {
                          const nextColumn = {
                            ...currentColumn,
                            value: event.target.value,
                            options: nextOptions,
                          };

                          columnRef.current = nextColumn;
                          onUpdateRef.current(nextColumn);
                        }

                        setLocalOptions(nextOptions);
                      }}
                    />
                  </Cell>

                  {localOptions.length > 1 && (
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
                            value={column.value === option}
                            updateValue={() => setSelectedOption(option)}
                          />
                        </CenterPoint>
                      </Cell>
                      <Cell $tiny>
                        <CenterPoint>
                          <Button ref={refs.current[index]} className="handle">
                            <MoveIcon />
                          </Button>
                        </CenterPoint>
                      </Cell>
                      <Cell $tiny>
                        <CenterPoint>
                          <Button
                            onClick={() => {
                              const nextOptions = deleteOption(
                                index,
                                localOptions,
                              );
                              const currentColumn = columnRef.current;
                              const nextColumn = {
                                ...currentColumn,
                                options: nextOptions,
                                value:
                                  currentColumn.value === option
                                    ? ""
                                    : currentColumn.value,
                              };

                              columnRef.current = nextColumn;
                              onUpdateRef.current(nextColumn);
                              setLocalOptions(nextOptions);
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
        <AddButtonArea
          label={translate("Add an option")}
          onClick={() => addCell(0)}
        />
      </TableWithButtonWrapper>

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
    </>
  );
};
