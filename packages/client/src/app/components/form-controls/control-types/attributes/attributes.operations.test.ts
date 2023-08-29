import { describe, expect, it } from '@jest/globals';

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
          ['some-attr', ''],
          ['with-null', null],
        ])
      ).toBe('some-attr with-null');
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
