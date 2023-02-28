import { useCallback, useRef, useState } from 'react';
import { useOnKeypress } from '@ff-client/hooks/use-on-keypress';

type SetCell = (row: number, cell: number) => void;

type InputRef = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

type InputRefList = Array<Array<InputRef>>;

type SetCellRef = (element: InputRef, row: number, cell: number) => void;

type CellNavigation = (
  rowCount: number,
  cellCount: number
) => {
  activeCell: `${number}:${number}`;
  setActiveCell: SetCell;
  setCellRef: SetCellRef;
};

export const useCellNavigation: CellNavigation = (rowCount, cellCount) => {
  const refs = useRef<InputRefList>([]);

  const [row, setRow] = useState(0);
  const [cell, setCell] = useState(0);

  const keyPressHandler = useCallback(
    (event: KeyboardEvent): void => {
      let deltaRow = row;
      let deltaCell = cell;

      const currentElement = refs.current?.[row]?.[cell];
      const isInput =
        currentElement instanceof HTMLInputElement ||
        currentElement instanceof HTMLTextAreaElement;

      const caret = { start: true, end: true };
      if (isInput) {
        const caretPosition = currentElement.selectionStart;

        caret.start = caretPosition === 0;
        caret.end = caretPosition === currentElement.value.length;
      }

      if (event.key === 'ArrowUp' && row > 0) {
        deltaRow--;
      }

      if (event.key === 'ArrowDown' && row < rowCount - 1) {
        deltaRow++;
      }

      if (event.key === 'ArrowLeft' && cell > 0 && caret.start) {
        deltaCell--;
      }

      if (event.key === 'ArrowRight' && cell < cellCount - 1 && caret.end) {
        deltaCell++;
      }

      setRow(deltaRow);
      setCell(deltaCell);

      const nextElement = refs.current?.[deltaRow]?.[deltaCell];
      nextElement?.focus();
    },
    [rowCount, cellCount, row, cell]
  );

  useOnKeypress({ callback: keyPressHandler, type: 'keydown' }, [
    keyPressHandler,
  ]);

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
  };
};
