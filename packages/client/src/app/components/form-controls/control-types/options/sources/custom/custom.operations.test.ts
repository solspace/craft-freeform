import { describe, expect, it } from '@jest/globals';

import { Source } from '../../options.types';

import { cleanOptions } from './custom.operations';

describe('attributes -> options -> custom', () => {
  describe('cleanOptions()', () => {
    it('clears all values with empty label and value', () => {
      expect(
        cleanOptions({
          source: Source.Custom,
          useCustomValues: true,
          options: [
            { label: '', value: '' },
            { label: 'Some', value: '' },
            { label: '', value: 'Value' },
            { label: 'Some', value: 'Value' },
          ],
        })
      ).toEqual({
        source: Source.Custom,
        useCustomValues: true,
        options: [
          { label: 'Some', value: '' },
          { label: '', value: 'Value' },
          { label: 'Some', value: 'Value' },
        ],
      });
    });
  });
});
