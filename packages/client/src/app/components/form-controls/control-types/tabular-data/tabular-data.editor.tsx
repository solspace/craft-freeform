import React, { useRef } from 'react';
import { HelpText } from '@components/elements/help-text';
import type { UpdateValue } from '@components/form-controls';
import {
  Button,
  Cell,
  Input,
  TableContainer,
  TableEditorWrapper,
  TabularOptions,
} from '@components/form-controls/control-types/table/table.editor.styles';
import { DraggableRow } from '@components/form-controls/draggable-row';
import { useCellNavigation } from '@components/form-controls/hooks/use-cell-navigation';
import CrossIcon from '@components/form-controls/icons/cross.svg';
import MoveIcon from '@components/form-controls/icons/move.svg';
import translate from '@ff-client/utils/translations';

import {
  addRow,
  deleteRow,
  moveRow,
  updateRow,
} from './tabular-data.operations';
import type { ColumnConfiguration, ColumnValue } from './tabular-data.types';

type Props = {
  configuration: ColumnConfiguration[];
  values: ColumnValue[];
  updateValue: UpdateValue<ColumnValue[]>;
};

export const TabularDataEditor: React.FC<Props> = ({
  configuration,
  values,
  updateValue,
}) => {
  const refs = useRef([]);
  refs.current = values.map(
    (value, index) =>
      refs.current[index] || React.createRef<HTMLButtonElement>()
  );

  const { activeCell, setActiveCell, setCellRef, keyPressHandler } =
    useCellNavigation(values.length, configuration.length);

  const appendAndFocus = (cellIndex: number, atIndex?: number): void => {
    setActiveCell(
      atIndex !== undefined ? atIndex + 1 : values.length,
      cellIndex
    );
    updateValue(
      addRow(
        values,
        configuration,
        atIndex !== undefined ? atIndex : values.length
      )
    );
  };

  return (
    <TableEditorWrapper>
      <TableContainer>
        <TabularOptions>
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
                      value={value[columnIndex]}
                      placeholder={translate(column.label)}
                      autoFocus={activeCell === `${rowIndex}:${columnIndex}`}
                      ref={(element) =>
                        setCellRef(element, rowIndex, columnIndex)
                      }
                      onFocus={() => setActiveCell(rowIndex, columnIndex)}
                      onKeyDown={keyPressHandler({
                        onEnter: (event) => {
                          appendAndFocus(
                            0,
                            event.shiftKey ? rowIndex : undefined
                          );
                        },
                      })}
                      onChange={(event) =>
                        updateValue(
                          updateRow(
                            rowIndex,
                            [
                              ...values[rowIndex].slice(0, columnIndex),
                              event.target.value,
                              ...values[rowIndex].slice(columnIndex + 1),
                            ],
                            values
                          )
                        )
                      }
                    />
                  </Cell>
                ))}

                {values.length > 1 && (
                  <>
                    <Cell $tiny>
                      <Button ref={refs.current[rowIndex]} className="handle">
                        <MoveIcon />
                      </Button>
                    </Cell>
                    <Cell $tiny>
                      <Button
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

      <HelpText>
        <span
          dangerouslySetInnerHTML={{
            __html: translate(
              'Press <b>enter</b> while editing a cell to add a new row.'
            ),
          }}
        />
      </HelpText>
    </TableEditorWrapper>
  );
};
