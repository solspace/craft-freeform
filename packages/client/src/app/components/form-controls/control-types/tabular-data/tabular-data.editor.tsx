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
};

export const TabularDataEditor: React.FC<Props> = ({
  configuration,
  values,
  updateValue,
  property,
  context,
  compact = false,
}) => {
  const { getTranslation, updateTranslation, willTranslate } = useTranslations(
    // biome-ignore lint/suspicious/noExplicitAny: This context is typed as unknown, but we know it will be the correct type for the translation functions.
    context as any,
  );

  const { handle } = property;

  const isTranslating = willTranslate(handle);
  const translation = getTranslation<Array<GenericValue>>(handle, values);

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

  return (
    <Wrapper>
      <TableContainer>
        <TabularOptions>
          {compact && (
            <thead>
              <tr>
                {configuration.map((column) => (
                  <th scope="col" key={column.key}>
                    {translate(column.label)}
                  </th>
                ))}
                {values.length > 1 && !isTranslating && (
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

                {values.length > 1 && !(compact && isTranslating) && (
                  <>
                    <Cell $tiny>
                      <Button
                        type="button"
                        aria-label={translate("Reorder")}
                        ref={refs.current[rowIndex]}
                        className="handle"
                      >
                        <MoveIcon />
                      </Button>
                    </Cell>
                    <Cell $tiny>
                      <Button
                        type="button"
                        aria-label={translate("Delete")}
                        onClick={() => {
                          updateValue(deleteRow(rowIndex, values));
                          setActiveCell(Math.max(rowIndex - 1, 0), 0);
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
          className="btn add icon"
          disabled={isTranslating}
          onClick={() => appendAndFocus(0)}
        >
          {translate("Add a row")}
        </button>
      ) : (
        <AddButtonArea
          label="Add a row"
          onClick={() => appendAndFocus(0)}
          disabled={isTranslating}
        />
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
    </Wrapper>
  );
};
