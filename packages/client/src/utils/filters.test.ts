import { filterTest } from './filters';

describe('filters', () => {
  describe('filterTest', () => {
    it('does not filter out anything if no filters provided', () => {
      const dataset = { foo: 'bar' };
      const filters: string[] = [];

      expect(filterTest(filters, dataset)).toBeTruthy();
    });

    it('filters out on single invalid filter test', () => {
      const dataset = { foo: 'bar' };
      const filters: string[] = ['foo === "baz"'];

      expect(filterTest(filters, dataset)).toBeFalsy();
    });

    it('filters out on multiple filter mixed match', () => {
      const dataset = { foo: 'bar', baz: 'qux' };
      const filters: string[] = ['foo === "bar"', 'baz === "quux"'];

      expect(filterTest(filters, dataset)).toBeFalsy();
    });

    it('does not filter on multiple filters which are valid', () => {
      const dataset = { foo: 'bar', baz: 'qux' };
      const filters: string[] = ['foo === "bar"', 'baz === "qux"'];

      expect(filterTest(filters, dataset)).toBeTruthy();
    });

    it('does not filter out with correct context', () => {
      const dataset = { foo: 'bin', baz: 'qux' };
      const filters: string[] = ['context.config.foo === "bar"'];

      expect(
        filterTest(filters, dataset, { config: { foo: 'bar' } })
      ).toBeTruthy();
    });
  });
});
