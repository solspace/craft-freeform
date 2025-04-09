import type { PagesStore } from '.';
import reducer, { pageActions } from '.';

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

// Extracts [page uid, label, order] tuples from each page in the store
const narrowStore = (store: PagesStore): Array<[string, string, number]> =>
  store.map(({ uid, label, order }) => [uid, label, order]);

describe('pages reducer', () => {
  describe('adding a page', () => {
    let mockStore: PagesStore;

    it('add one page', () => {
      mockStore = mockStoreGenerator(0);

      const result = narrowStore(
        reducer(
          mockStore,
          pageActions.add({
            uid: 'new-page',
            label: 'New Page',
            layoutUid: `---`,
          })
        )
      );

      expect(result).toEqual([['new-page', 'New Page', 0]]);
    });

    it('add page to existing pages', () => {
      mockStore = mockStoreGenerator(2);

      const result = narrowStore(
        reducer(
          mockStore,
          pageActions.add({
            uid: 'new-page',
            label: 'New Page',
            layoutUid: `---`,
          })
        )
      );

      expect(result).toEqual([
        ['page-0', 'Page 0', 0],
        ['page-1', 'Page 1', 1],
        ['new-page', 'New Page', 2],
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
          pageActions.moveTo({
            uid: 'page-0',
            order: 2,
          })
        )
      );

      expect(result).toEqual([
        ['page-0', 'Page 0', 2],
        ['page-1', 'Page 1', 0],
        ['page-2', 'Page 2', 1],
        ['page-3', 'Page 3', 3],
        ['page-4', 'Page 4', 4],
      ]);
    });

    it('move page from 1 to 3', () => {
      const result = narrowStore(
        reducer(
          mockStore,
          pageActions.moveTo({
            uid: 'page-3',
            order: 1,
          })
        )
      );

      expect(result).toEqual([
        ['page-0', 'Page 0', 0],
        ['page-1', 'Page 1', 2],
        ['page-2', 'Page 2', 3],
        ['page-3', 'Page 3', 1],
        ['page-4', 'Page 4', 4],
      ]);
    });

    it('move page from 2 to 2', () => {
      const result = narrowStore(
        reducer(
          mockStore,
          pageActions.moveTo({
            uid: 'page-2',
            order: 2,
          })
        )
      );

      expect(result).toEqual([
        ['page-0', 'Page 0', 0],
        ['page-1', 'Page 1', 1],
        ['page-2', 'Page 2', 2],
        ['page-3', 'Page 3', 3],
        ['page-4', 'Page 4', 4],
      ]);
    });
  });

  describe('updating a page label', () => {
    let mockStore: PagesStore;
    beforeEach(() => {
      mockStore = mockStoreGenerator(5);
    });

    it('update first page label to One', () => {
      const result = narrowStore(
        reducer(
          mockStore,
          pageActions.updateLabel({
            uid: 'page-0',
            label: 'One',
          })
        )
      );

      expect(result).toEqual([
        ['page-0', 'One', 0],
        ['page-1', 'Page 1', 1],
        ['page-2', 'Page 2', 2],
        ['page-3', 'Page 3', 3],
        ['page-4', 'Page 4', 4],
      ]);
    });
  });
});
