import { CellType } from '@editor/builder/types/layout';

import type { CellStore } from '.';
import { cellActions } from '.';
import reducer from '.';

/**
 * generates rows with cells in them based on the passed parameters
 * e.g. mockStoreGenerator(1, 2, 5) -> would yield 3 rows
 * row 1 - 1 cell
 * row 2 - 2 cells
 * row 3 - 5 cells
 */
const mockStoreGenerator = (...cellsInRow: number[]): CellStore => {
  const store: CellStore = [];
  let cellIndex = 0;
  for (let rowIndex = 0; rowIndex < cellsInRow.length; rowIndex++) {
    const cellCount = cellsInRow[rowIndex];
    for (let i = 0; i < cellCount; i++) {
      store.push({
        type: CellType.Field,
        uid: `cell-${cellIndex}`,
        rowUid: `row-${rowIndex}`,
        order: i,
        targetUid: '---',
      });
      cellIndex++;
    }
  }

  return store;
};

// Extracts [cell, row, order] tuples from each cell in the store
const narrowStore = (store: CellStore): Array<[string, string, number]> =>
  store.map(({ uid, rowUid, order }) => [uid, rowUid, order]);

describe('cells reducer', () => {
  describe('adding a cell', () => {
    let mockStore: CellStore;

    it('add cell to new row', () => {
      mockStore = mockStoreGenerator(0);

      const result = narrowStore(
        reducer(
          mockStore,
          cellActions.add({
            type: CellType.Field,
            uid: 'cell-new',
            rowUid: 'row-0',
            targetUid: '---',
          })
        )
      );

      expect(result).toEqual([['cell-new', 'row-0', 0]]);
    });

    it('add cell to existing row', () => {
      mockStore = mockStoreGenerator(1);

      const result = narrowStore(
        reducer(
          mockStore,
          cellActions.add({
            type: CellType.Field,
            uid: 'cell-new',
            rowUid: 'row-0',
            targetUid: '---',
          })
        )
      );

      expect(result).toEqual([
        ['cell-0', 'row-0', 0],
        ['cell-new', 'row-0', 1],
      ]);
    });

    it('add cell to existing row in the middle', () => {
      mockStore = mockStoreGenerator(3);

      const result = narrowStore(
        reducer(
          mockStore,
          cellActions.add({
            type: CellType.Field,
            uid: 'cell-new',
            rowUid: 'row-0',
            targetUid: '---',
            order: 1,
          })
        )
      );

      expect(result).toEqual([
        ['cell-0', 'row-0', 0],
        ['cell-1', 'row-0', 2],
        ['cell-2', 'row-0', 3],
        ['cell-new', 'row-0', 1],
      ]);
    });
  });

  describe('moving a cell', () => {
    let mockStore: CellStore;
    beforeEach(() => {
      mockStore = mockStoreGenerator(4, 3);
    });

    it('move cell from 0 to 2 in same row', () => {
      const result = narrowStore(
        reducer(
          mockStore,
          cellActions.moveTo({
            uid: 'cell-0',
            rowUid: 'row-0',
            position: 2,
          })
        )
      );

      expect(result).toEqual([
        ['cell-0', 'row-0', 2],
        ['cell-1', 'row-0', 0],
        ['cell-2', 'row-0', 1],
        ['cell-3', 'row-0', 3],
        ['cell-4', 'row-1', 0],
        ['cell-5', 'row-1', 1],
        ['cell-6', 'row-1', 2],
      ]);
    });

    it('move cell from 1 to 0 in same row', () => {
      const result = narrowStore(
        reducer(
          mockStore,
          cellActions.moveTo({
            uid: 'cell-1',
            rowUid: 'row-0',
            position: 0,
          })
        )
      );

      expect(result).toEqual([
        ['cell-0', 'row-0', 1],
        ['cell-1', 'row-0', 0],
        ['cell-2', 'row-0', 2],
        ['cell-3', 'row-0', 3],
        ['cell-4', 'row-1', 0],
        ['cell-5', 'row-1', 1],
        ['cell-6', 'row-1', 2],
      ]);
    });

    it('move cell from row to other row', () => {
      const result = narrowStore(
        reducer(
          mockStore,
          cellActions.moveTo({
            uid: 'cell-1',
            rowUid: 'row-1',
            position: 1,
          })
        )
      );

      expect(result).toEqual([
        ['cell-0', 'row-0', 0],
        ['cell-1', 'row-1', 1],
        ['cell-2', 'row-0', 1],
        ['cell-3', 'row-0', 2],
        ['cell-4', 'row-1', 0],
        ['cell-5', 'row-1', 2],
        ['cell-6', 'row-1', 3],
      ]);
    });
  });
});
