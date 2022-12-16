import type { RootState } from '@editor/store';

import { handle } from '.';

describe('handle middleware', () => {
  describe('autocamelize - off', () => {
    it('generates a proper handle value', () => {
      const string = 'ThisIs a RaNDoM_String 55 -=!?+_-"\'';

      const result = handle(string, undefined, () => ({} as RootState));

      expect(result).toEqual('ThisIsaRaNDoM_String55-_-');
    });

    it('does not escape underscores and dashes', () => {
      const string = 'this_is-underscored$!#@%^&*';

      const result = handle(string, [false], () => ({} as RootState));

      expect(result).toEqual('this_is-underscored');
    });
  });

  describe('autocamelize - on', () => {
    it('generates a proper handle value', () => {
      const string = 'ThisIs a RaNDoMString 55 -=!?+_-"\'';

      const result = handle(string, [true], () => ({} as RootState));

      expect(result).toEqual('thisIsARaNDoMString55');
    });

    it('escapes underscores and dashes and all other characters', () => {
      const string = 'this_is-underscored$!#@%^&*';

      const result = handle(string, [true], () => ({} as RootState));

      expect(result).toEqual('thisIsUnderscored');
    });
  });
});
