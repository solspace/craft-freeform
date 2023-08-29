import React from 'react';
import { HelpText } from '@components/elements/help-text';
import type { UpdateValue } from '@components/form-controls';
import {
  Button,
  Cell,
  DeleteIcon,
  DragIcon,
  Input,
  Row,
  TableContainer,
  TableEditorWrapper,
  TabularOptions,
} from '@components/form-controls/control-types/table/table.editor.styles';
import { useCellNavigation } from '@components/form-controls/hooks/use-cell-navigation';
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
              <Row key={rowIndex}>
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
                      <Button
                        onClick={() =>
                          updateValue(moveRow(rowIndex, rowIndex, values))
                        }
                      >
                        <DragIcon />
                      </Button>
                    </Cell>
                    <Cell $tiny>
                      <Button
                        onClick={() => {
                          updateValue(deleteRow(rowIndex, values));
                          setActiveCell(Math.max(rowIndex - 1, 0), 0);
                        }}
                      >
                        <DeleteIcon />
                      </Button>
                    </Cell>
                  </>
                )}
              </Row>
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
