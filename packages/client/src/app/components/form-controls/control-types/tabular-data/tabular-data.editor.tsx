import { AddButtonArea } from "@components/elements/add-button-area/add-button-area";
import { HelpText } from "@components/elements/help-text";
import type { UpdateValue } from "@components/form-controls";
import {
  Button,
  Cell,
  Input,
  TableContainer,
  TableEditorWrapper,
  TabularOptions,
} from "@components/form-controls/control-types/table/table.editor.styles";
import { DraggableRow } from "@components/form-controls/draggable-row";
import { useCellNavigation } from "@components/form-controls/hooks/use-cell-navigation";
import CrossIcon from "@components/form-controls/icons/cross";
import MoveIcon from "@components/form-controls/icons/move";
import { useTranslations } from "@editor/store/slices/translations/translations.hooks";
import type {
  GenericValue,
  TabularDataProperty,
} from "@ff-client/types/properties";
import translate from "@ff-client/utils/translations";
import DOMPurify from "dompurify";
import React, { useRef } from "react";

import { CompactEditor } from "./tabular-data.editor.styles";

import {
  addRow,
  deleteRow,
  moveRow,
  updateRow,
} from "./tabular-data.operations";
import type { ColumnConfiguration, ColumnValue } from "./tabular-data.types";

type Props = {
  configuration: ColumnConfiguration[];
  values: ColumnValue[];
  updateValue: UpdateValue<ColumnValue[]>;
  property: TabularDataProperty;
  context: unknown;
  compact?: boolean;
  addLabel?: string;
  deleteLabel?: string;
  emptyMessage?: string;
  showHelp?: boolean;
};

export const TabularDataEditor: React.FC<Props> = ({
  configuration,
  values,
  updateValue,
  property,
  context,
  compact = false,
  addLabel = "Add a row",
  deleteLabel = "Delete",
  emptyMessage,
  showHelp = true,
}) => {
  const { getTranslation, updateTranslation, willTranslate } = useTranslations(
    // biome-ignore lint/suspicious/noExplicitAny: This context is typed as unknown, but we know it will be the correct type for the translation functions.
    context as any,
  );

  const { handle } = property;

  const isTranslating = willTranslate(handle);
  const translation = getTranslation<Array<GenericValue>>(handle, values);

  const addButtonRef = useRef<HTMLButtonElement>(null);
  const refs = useRef([]);
  refs.current = values.map(
    (_, index) => refs.current[index] || React.createRef<HTMLButtonElement>(),
  );

  const { activeCell, setActiveCell, setCellRef, keyPressHandler } =
    useCellNavigation(values.length, configuration.length);

  const appendAndFocus = (cellIndex: number, atIndex?: number): void => {
    if (isTranslating) {
      return;
    }

    setActiveCell(
      atIndex !== undefined ? atIndex + 1 : values.length,
      cellIndex,
    );

    updateValue(
      addRow(
        values,
        configuration,
        atIndex !== undefined ? atIndex : values.length,
      ),
    );
  };

  const Wrapper = compact ? CompactEditor : TableEditorWrapper;
  const showActions = compact
    ? values.length > 0 && !isTranslating
    : values.length > 1;

  return (
    <Wrapper>
      <TableContainer>
        <TabularOptions>
          {compact && (
            <thead>
              <tr>
                {configuration.map((column) => (
                  <th
                    scope="col"
                    key={column.key}
                    style={
                      column.key === "value" ? { width: "28%" } : undefined
                    }
                  >
                    {translate(column.label)}
                  </th>
                ))}
                {showActions && (
                  <th
                    colSpan={2}
                    style={{ width: 76 }}
                    aria-label={translate("Actions")}
                  />
                )}
              </tr>
            </thead>
          )}
          <tbody>
            {compact && !values.length && emptyMessage && (
              <tr>
                <td className="empty-state" colSpan={configuration.length}>
                  {translate(emptyMessage)}
                </td>
              </tr>
            )}
            {values.map((value, rowIndex) => (
              <DraggableRow
                key={rowIndex}
                index={rowIndex}
                dragRef={refs.current[rowIndex]}
                onDrop={(fromIndex, toIndex) =>
                  updateValue(moveRow(fromIndex, toIndex, values))
                }
              >
                {configuration.map((column, columnIndex) => (
                  <Cell key={columnIndex}>
                    <Input
                      type="text"
                      value={
                        compact && isTranslating
                          ? (translation[rowIndex]?.[columnIndex] ??
                            value[columnIndex])
                          : value[columnIndex]
                      }
                      aria-label={translate(column.label)}
                      placeholder={translate(column.label)}
                      autoFocus={activeCell === `${rowIndex}:${columnIndex}`}
                      disabled={isTranslating && !column.translatable}
                      ref={(element) =>
                        setCellRef(element, rowIndex, columnIndex)
                      }
                      onFocus={() => setActiveCell(rowIndex, columnIndex)}
                      onKeyDown={keyPressHandler({
                        onEnter: (event) => {
                          appendAndFocus(
                            0,
                            event.shiftKey ? rowIndex : undefined,
                          );
                        },
                      })}
                      onChange={(event) => {
                        if (isTranslating) {
                          if (!column.translatable) {
                            return;
                          }

                          updateTranslation(
                            property.handle,
                            updateRow(
                              rowIndex,
                              [
                                ...translation[rowIndex].slice(0, columnIndex),
                                event.target.value,
                                ...translation[rowIndex].slice(columnIndex + 1),
                              ],
                              translation,
                            ),
                          );

                          return;
                        }

                        updateValue(
                          updateRow(
                            rowIndex,
                            [
                              ...values[rowIndex].slice(0, columnIndex),
                              event.target.value,
                              ...values[rowIndex].slice(columnIndex + 1),
                            ],
                            values,
                          ),
                        );
                      }}
                    />
                  </Cell>
                ))}

                {showActions && (
                  <>
                    <Cell $tiny>
                      <Button
                        type="button"
                        aria-label={translate("Reorder")}
                        title={translate("Reorder")}
                        disabled={compact && values.length < 2}
                        ref={refs.current[rowIndex]}
                        className="handle"
                      >
                        <MoveIcon />
                      </Button>
                    </Cell>
                    <Cell $tiny>
                      <Button
                        type="button"
                        aria-label={translate(deleteLabel)}
                        title={translate(deleteLabel)}
                        onClick={() => {
                          updateValue(deleteRow(rowIndex, values));
                          setActiveCell(Math.max(rowIndex - 1, 0), 0);
                          if (compact && values.length === 1)
                            addButtonRef.current?.focus();
                        }}
                      >
                        <CrossIcon />
                      </Button>
                    </Cell>
                  </>
                )}
              </DraggableRow>
            ))}
          </tbody>
        </TabularOptions>
      </TableContainer>

      {compact ? (
        <button
          type="button"
          ref={addButtonRef}
          className="btn add icon"
          disabled={isTranslating}
          onClick={() => appendAndFocus(0)}
        >
          {translate(addLabel)}
        </button>
      ) : (
        <AddButtonArea
          label="Add a row"
          onClick={() => appendAndFocus(0)}
          disabled={isTranslating}
        />
      )}

      {showHelp && (
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
      )}
    </Wrapper>
  );
};
