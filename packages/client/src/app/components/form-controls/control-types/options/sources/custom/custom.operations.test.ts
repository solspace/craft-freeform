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
            { label: '', value: '', checked: false },
            { label: 'Some', value: '', checked: false },
            { label: '', value: 'Value', checked: false },
            { label: 'Some', value: 'Value', checked: false },
          ],
        })
      ).toEqual({
        source: Source.Custom,
        useCustomValues: true,
        options: [
          { label: 'Some', value: '', checked: false },
          { label: '', value: 'Value', checked: false },
          { label: 'Some', value: 'Value', checked: false },
        ],
      });
    });
  });
});
