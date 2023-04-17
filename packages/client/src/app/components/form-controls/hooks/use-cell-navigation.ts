import type { KeyboardEvent } from 'react';
import { useCallback, useRef, useState } from 'react';

type SetCell = (row: number, cell: number) => void;

type InputRef = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

type InputRefList = Array<Array<InputRef>>;

type SetCellRef = (element: InputRef, row: number, cell: number) => void;

type KeyPressHandler = (options?: {
  onEnter?: (event: KeyboardEvent) => void;
  onDelete?: (event: KeyboardEvent) => void;
}) => (event: KeyboardEvent) => void;

type CellNavigation = (
  rowCount: number,
  cellCount: number
) => {
  activeCell: `${number}:${number}`;
  setActiveCell: SetCell;
  setCellRef: SetCellRef;
  keyPressHandler: KeyPressHandler;
};

export const useCellNavigation: CellNavigation = (rowCount, cellCount) => {
  const refs = useRef<InputRefList>([]);

  const [row, setRow] = useState(0);
  const [cell, setCell] = useState(0);

  const keyPressHandler = useCallback<KeyPressHandler>(
    (options) =>
      (event): void => {
        if (event.key === 'Enter' && options?.onEnter) {
          event.preventDefault();

          return options.onEnter(event);
        }

        if (event.key === 'Backspace' && options?.onDelete) {
          const value = (event.target as HTMLInputElement).value;
          if (value.length === 0) {
            event.preventDefault();

            return options.onDelete(event);
          }
        }

        let deltaRow = row;
        let deltaCell = cell;

        const currentElement = refs.current?.[row]?.[cell];
        const isInput =
          currentElement instanceof HTMLInputElement ||
          currentElement instanceof HTMLTextAreaElement;

        const caret = { start: true, end: true, position: 0 };
        if (isInput) {
          const caretPosition = currentElement.selectionStart;

          caret.start = caretPosition === 0;
          caret.end = caretPosition === currentElement.value.length;
          caret.position = caretPosition;
        }

        let movingLeft: boolean;
        if (event.key === 'ArrowUp' && row > 0) {
          deltaRow--;
        }

        if (event.key === 'ArrowDown' && row < rowCount - 1) {
          deltaRow++;
        }

        if (event.key === 'ArrowLeft' && cell > 0 && caret.start) {
          movingLeft = true;
          deltaCell--;
        }

        if (event.key === 'ArrowRight' && cell < cellCount - 1 && caret.end) {
          movingLeft = false;
          deltaCell++;
        }

        if (deltaRow === row && deltaCell === cell) {
          return;
        }

        if (deltaRow !== row) {
          setRow(deltaRow);
        }

        if (deltaCell !== cell) {
          setCell(deltaCell);
        }

        const nextElement = refs.current?.[deltaRow]?.[deltaCell];
        nextElement?.focus();

        if (
          nextElement instanceof HTMLInputElement ||
          nextElement instanceof HTMLTextAreaElement
        ) {
          event.preventDefault();
          if (movingLeft !== undefined) {
            nextElement.setSelectionRange(
              movingLeft ? nextElement.value.length : 0,
              movingLeft ? nextElement.value.length : 0
            );
          } else {
            nextElement.setSelectionRange(caret.position, caret.position);
          }
        }
      },
    [rowCount, cellCount, row, cell]
  );

  const setActiveCell: SetCell = (row, cell) => {
    setRow(row);
    setCell(cell);
    refs.current?.[row]?.[cell]?.focus();
  };

  const setCellRef: SetCellRef = (element, row, cell) => {
    if (!refs.current[row]) {
      refs.current[row] = [];
    }

    refs.current[row][cell] = element;
  };

  return {
    activeCell: `${row}:${cell}`,
    setActiveCell,
    setCellRef,
    keyPressHandler,
  };
};
