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
  Select,
  TableContainer,
  TableEditorWrapper,
  TabularOptions,
} from '@components/form-controls/control-types/table/table.editor.styles';
import {
  addColumn,
  deleteColumn,
  moveColumn,
  updateColumn,
} from '@components/form-controls/control-types/table/table.operations';
import type { ColumnDescription } from '@components/form-controls/control-types/table/table.types';
import { useCellNavigation } from '@components/form-controls/hooks/use-cell-navigation';
import type { Option as PropertyOption } from '@ff-client/types/properties';
import translate from '@ff-client/utils/translations';

type Props = {
  columnTypes: PropertyOption[];
  columns: ColumnDescription[];
  updateValue: UpdateValue<ColumnDescription[]>;
};

export const TableEditor: React.FC<Props> = ({
  columnTypes,
  columns,
  updateValue,
}) => {
  const { activeCell, setActiveCell, setCellRef, keyPressHandler } =
    useCellNavigation(columns.length, 3);

  const appendAndFocus = (cellIndex: number, atIndex?: number): void => {
    setActiveCell(
      atIndex !== undefined ? atIndex + 1 : columns.length,
      cellIndex
    );
    updateValue(
      addColumn(columns, atIndex !== undefined ? atIndex : columns.length)
    );
  };

  return (
    <TableEditorWrapper>
      <TableContainer>
        <TabularOptions>
          <tbody>
            {columns.map((column, rowIndex) => (
              <Row key={rowIndex}>
                <Cell>
                  <Input
                    type="text"
                    value={column.label}
                    placeholder={translate('Label')}
                    autoFocus={activeCell === `${rowIndex}:0`}
                    ref={(element) => setCellRef(element, rowIndex, 0)}
                    onFocus={() => setActiveCell(rowIndex, 0)}
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
                        updateColumn(
                          rowIndex,
                          { ...column, label: event.target.value },
                          columns
                        )
                      )
                    }
                  />
                </Cell>
                <Cell $width={110}>
                  <Select
                    defaultValue={column.type}
                    title={translate('Type')}
                    ref={(element) => setCellRef(element, rowIndex, 1)}
                    onFocus={() => setActiveCell(rowIndex, 1)}
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
                        updateColumn(
                          rowIndex,
                          { ...column, type: event.target.value },
                          columns
                        )
                      )
                    }
                  >
                    {Object.values(columnTypes).map(({ value, label }) => (
                      <option key={value} value={value} label={label} />
                    ))}
                  </Select>
                </Cell>
                <Cell>
                  <Input
                    type="text"
                    value={column.value}
                    placeholder={translate('Value')}
                    autoFocus={activeCell === `${rowIndex}:2`}
                    ref={(element) => setCellRef(element, rowIndex, 2)}
                    onFocus={() => setActiveCell(rowIndex, 2)}
                    onKeyDown={keyPressHandler({
                      onEnter: (event) => {
                        appendAndFocus(
                          2,
                          event.shiftKey ? rowIndex : undefined
                        );
                      },
                    })}
                    onChange={(event) =>
                      updateValue(
                        updateColumn(
                          rowIndex,
                          { ...column, value: event.target.value },
                          columns
                        )
                      )
                    }
                  />
                </Cell>
                {columns.length > 1 && (
                  <>
                    <Cell $tiny>
                      <Button
                        onClick={() =>
                          updateValue(moveColumn(rowIndex, rowIndex, columns))
                        }
                      >
                        <DragIcon />
                      </Button>
                    </Cell>
                    <Cell $tiny>
                      <Button
                        onClick={() => {
                          updateValue(deleteColumn(rowIndex, columns));
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
