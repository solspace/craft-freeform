import type { FieldType } from '@ff-client/types/properties';

import reducer from './index';
import { type FieldStore, fieldActions } from '.';

const testType: FieldType = {
  implements: [],
  name: 'Test',
  type: 'test',
  typeClass: 'test//test',
  properties: [],
};

/**
 * generates rows with cells in them based on the passed parameters
 * e.g. mockStoreGenerator(1, 2, 5) -> would yield 3 rows
 * row 1 - 1 cell
 * row 2 - 2 cells
 * row 3 - 5 cells
 */
const mockStoreGenerator = (...fieldsInRow: number[]): FieldStore => {
  const store: FieldStore = [];
  let fieldIndex = 0;
  for (let rowIndex = 0; rowIndex < fieldsInRow.length; rowIndex++) {
    const fieldCount = fieldsInRow[rowIndex];
    for (let i = 0; i < fieldCount; i++) {
      store.push({
        uid: `field-${fieldIndex}`,
        rowUid: `row-${rowIndex}`,
        typeClass: 'some//class',
        properties: {},
        order: i,
      });
      fieldIndex++;
    }
  }

  return store;
};

// Extracts [cell, row, order] tuples from each cell in the store
const narrowStore = (store: FieldStore): Array<[string, string, number]> =>
  store.map(({ uid, rowUid, order }) => [uid, rowUid, order]);

describe('fields reducer', () => {
  describe('adding a field', () => {
    let mockStore: FieldStore;

    it('add field to new row', () => {
      mockStore = mockStoreGenerator(0);

      const result = narrowStore(
        reducer(
          mockStore,
          fieldActions.add({
            uid: 'field-new',
            rowUid: 'row-0',
            fieldType: testType,
          })
        )
      );

      expect(result).toEqual([['field-new', 'row-0', 0]]);
    });

    it('add cell to existing row', () => {
      mockStore = mockStoreGenerator(1);

      const result = narrowStore(
        reducer(
          mockStore,
          fieldActions.add({
            uid: 'field-new',
            rowUid: 'row-0',
            fieldType: testType,
          })
        )
      );

      expect(result).toEqual([
        ['field-0', 'row-0', 0],
        ['field-new', 'row-0', 1],
      ]);
    });

    it('add cell to existing row in the middle', () => {
      mockStore = mockStoreGenerator(3);

      const result = narrowStore(
        reducer(
          mockStore,
          fieldActions.add({
            uid: 'field-new',
            rowUid: 'row-0',
            fieldType: testType,
            order: 1,
          })
        )
      );

      expect(result).toEqual([
        ['field-0', 'row-0', 0],
        ['field-1', 'row-0', 2],
        ['field-2', 'row-0', 3],
        ['field-new', 'row-0', 1],
      ]);
    });
  });

  describe('moving a cell', () => {
    let mockStore: FieldStore;
    beforeEach(() => {
      mockStore = mockStoreGenerator(4, 3);
    });

    it('move cell from 0 to 2 in same row', () => {
      const result = narrowStore(
        reducer(
          mockStore,
          fieldActions.moveTo({
            uid: 'field-0',
            rowUid: 'row-0',
            position: 2,
          })
        )
      );

      expect(result).toEqual([
        ['field-0', 'row-0', 2],
        ['field-1', 'row-0', 0],
        ['field-2', 'row-0', 1],
        ['field-3', 'row-0', 3],
        ['field-4', 'row-1', 0],
        ['field-5', 'row-1', 1],
        ['field-6', 'row-1', 2],
      ]);
    });

    it('move cell from 1 to 0 in same row', () => {
      const result = narrowStore(
        reducer(
          mockStore,
          fieldActions.moveTo({
            uid: 'field-1',
            rowUid: 'row-0',
            position: 0,
          })
        )
      );

      expect(result).toEqual([
        ['field-0', 'row-0', 1],
        ['field-1', 'row-0', 0],
        ['field-2', 'row-0', 2],
        ['field-3', 'row-0', 3],
        ['field-4', 'row-1', 0],
        ['field-5', 'row-1', 1],
        ['field-6', 'row-1', 2],
      ]);
    });

    it('move cell from row to other row', () => {
      const result = narrowStore(
        reducer(
          mockStore,
          fieldActions.moveTo({
            uid: 'field-1',
            rowUid: 'row-1',
            position: 1,
          })
        )
      );

      expect(result).toEqual([
        ['field-0', 'row-0', 0],
        ['field-1', 'row-1', 1],
        ['field-2', 'row-0', 1],
        ['field-3', 'row-0', 2],
        ['field-4', 'row-1', 0],
        ['field-5', 'row-1', 2],
        ['field-6', 'row-1', 3],
      ]);
    });
  });
});
