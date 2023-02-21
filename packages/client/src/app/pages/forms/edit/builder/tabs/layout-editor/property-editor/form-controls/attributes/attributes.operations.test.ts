import { attributesToString, cleanAttributes } from './attributes.operations';

describe('attributes -> operations', () => {
  describe('attributesToString()', () => {
    it('converts filled string attributes', () => {
      expect(
        attributesToString([
          ['data-test', 'one'],
          ['some-attr', 'value'],
        ])
      ).toBe('data-test="one" some-attr="value"');
    });

    it('converts truthy boolean values or empty values to empty data attributes', () => {
      expect(
        attributesToString([
          ['data-test', true],
          ['some-attr', ''],
          ['with-null', null],
        ])
      ).toBe('data-test some-attr with-null');
    });

    it('does not render falsy boolean attributes', () => {
      expect(
        attributesToString([
          ['data-not-rendered', false],
          ['data-should-render', true],
          ['data-visible', ''],
          ['data-invisible', false],
        ])
      ).toBe('data-should-render data-visible');
    });

    it('converts numbers to string value', () => {
      expect(attributesToString([['data-test', 55]])).toBe('data-test="55"');
    });

    it('converts only entered value to attribute', () => {
      expect(
        attributesToString([
          [null, 'data-test'],
          ['', 'data-test-2'],
          [false, 'data-test-3'],
        ])
      ).toBe('data-test data-test-2 data-test-3');
    });

    it('skips empty key, value pairs', () => {
      expect(
        attributesToString([
          [null, null],
          ['', ''],
          ['', null],
          [null, ''],
        ])
      ).toBe('');
    });
  });

  describe('cleanAttributes()', () => {
    it('clears all values with null', () => {
      expect(
        cleanAttributes({
          container: [
            [null, null],
            ['one', 'two'],
            [null, null],
            [null, null],
            [null, 'two'],
            ['one', null],
          ],
        })
      ).toEqual({
        container: [
          ['one', 'two'],
          [null, 'two'],
          ['one', null],
        ],
      });
    });

    it('clears all values with false', () => {
      expect(
        cleanAttributes({
          container: [
            [false, false],
            ['one', 'two'],
          ],
        })
      ).toEqual({
        container: [['one', 'two']],
      });
    });

    it('clears all values with empty string', () => {
      expect(
        cleanAttributes({
          container: [
            ['', ''],
            ['one', 'two'],
          ],
        })
      ).toEqual({
        container: [['one', 'two']],
      });
    });
  });
});
