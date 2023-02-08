import React, { useCallback } from 'react';
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
} from '@editor/builder/tabs/layout-editor/property-editor/form-controls/table/table.editor.styles';
import {
  addColumn,
  deleteColumn,
  moveColumn,
  updateColumn,
} from '@editor/builder/tabs/layout-editor/property-editor/form-controls/table/table.operations';
import type { ColumnDescription } from '@editor/builder/tabs/layout-editor/property-editor/form-controls/table/table.types';
import { useOnKeypress } from '@ff-client/hooks/use-on-keypress';
import type { Option as PropertyOption } from '@ff-client/types/properties';
import translate from '@ff-client/utils/translations';

import type { UpdateValue } from '../../field/editable-component';
import { useCellNavigation } from '../hooks/use-cell-navigation';

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
  const { activeCell, setActiveCell, setCellRef } = useCellNavigation(
    columns.length,
    3
  );

  const appendAndFocus = (cellIndex: number): void => {
    setActiveCell(columns.length, cellIndex);
    updateValue(addColumn(columns));
  };

  const keyPressHandler = useCallback(
    (event: KeyboardEvent): void => {
      if (event.key === 'Enter') {
        appendAndFocus(0);
      }
    },
    [columns]
  );

  useOnKeypress({ callback: keyPressHandler }, [columns]);

  return (
    <TableEditorWrapper>
      {!!columns.length && (
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
                  <Cell width={110}>
                    <Select
                      defaultValue={column.type}
                      title={translate('Type')}
                      ref={(element) => setCellRef(element, rowIndex, 1)}
                      onFocus={() => setActiveCell(rowIndex, 1)}
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
                  <Cell tiny>
                    <Button
                      onClick={() =>
                        updateValue(moveColumn(rowIndex, rowIndex, columns))
                      }
                    >
                      <DragIcon />
                    </Button>
                  </Cell>
                  <Cell tiny>
                    <Button
                      onClick={() =>
                        updateValue(deleteColumn(rowIndex, columns))
                      }
                    >
                      <DeleteIcon />
                    </Button>
                  </Cell>
                </Row>
              ))}
            </tbody>
          </TabularOptions>
        </TableContainer>
      )}

      <button className="btn add icon dashed" onClick={() => appendAndFocus(0)}>
        {translate('Add a Row')}
      </button>
    </TableEditorWrapper>
  );
};
