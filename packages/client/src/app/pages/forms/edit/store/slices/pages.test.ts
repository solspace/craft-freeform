import type { PagesStore } from './pages';
import { add } from './pages';
import reducer, { moveTo } from './pages';

/**
 * generates rows with cells in them based on the passed parameters
 * e.g. mockStoreGenerator(1, 2, 5) -> would yield 3 rows
 * row 1 - 1 cell
 * row 2 - 2 cells
 * row 3 - 5 cells
 */
const mockStoreGenerator = (count: number): PagesStore => {
  const store: PagesStore = [];

  for (let i = 0; i < count; i++) {
    store.push({
      uid: `page-${i}`,
      label: `Page ${i}`,
      layoutUid: '---',
      order: i,
    });
  }

  return store;
};

// Extracts [page uid, order] tuples from each page in the store
const narrowStore = (store: PagesStore): Array<[string, number]> =>
  store.map(({ uid, order }) => [uid, order]);

describe('pages reducer', () => {
  describe('adding a page', () => {
    let mockStore: PagesStore;

    it('add one page', () => {
      mockStore = mockStoreGenerator(0);

      const result = narrowStore(
        reducer(
          mockStore,
          add({
            uid: 'new-page',
            label: 'New Page',
            layoutUid: `---`,
          })
        )
      );

      expect(result).toEqual([['new-page', 0]]);
    });

    it('add page to existing pages', () => {
      mockStore = mockStoreGenerator(2);

      const result = narrowStore(
        reducer(
          mockStore,
          add({
            uid: 'new-page',
            label: 'New Page',
            layoutUid: `---`,
          })
        )
      );

      expect(result).toEqual([
        ['page-0', 0],
        ['page-1', 1],
        ['new-page', 2],
      ]);
    });
  });

  describe('moving a page', () => {
    let mockStore: PagesStore;
    beforeEach(() => {
      mockStore = mockStoreGenerator(5);
    });

    it('move page from 0 to 2', () => {
      const result = narrowStore(
        reducer(
          mockStore,
          moveTo({
            uid: 'page-0',
            order: 2,
          })
        )
      );

      expect(result).toEqual([
        ['page-0', 2],
        ['page-1', 0],
        ['page-2', 1],
        ['page-3', 3],
        ['page-4', 4],
      ]);
    });

    it('move page from 1 to 3', () => {
      const result = narrowStore(
        reducer(
          mockStore,
          moveTo({
            uid: 'page-3',
            order: 1,
          })
        )
      );

      expect(result).toEqual([
        ['page-0', 0],
        ['page-1', 2],
        ['page-2', 3],
        ['page-3', 1],
        ['page-4', 4],
      ]);
    });

    it('move page from 2 to 2', () => {
      const result = narrowStore(
        reducer(
          mockStore,
          moveTo({
            uid: 'page-2',
            order: 2,
          })
        )
      );

      expect(result).toEqual([
        ['page-0', 0],
        ['page-1', 1],
        ['page-2', 2],
        ['page-3', 3],
        ['page-4', 4],
      ]);
    });
  });
});
