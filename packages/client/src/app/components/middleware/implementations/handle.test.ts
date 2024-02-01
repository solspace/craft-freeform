import { describe, expect, it } from '@jest/globals';

import { handle } from '.';

describe('handle middleware', () => {
  it('generates a proper handle value', () => {
    const string = 'ThisIs a RaNDoM_String 55 -=!?+_-"\'';

    const result = handle(string);

    expect(result).toEqual('ThisIsaRaNDoM_String55_');
  });

  it('does not escape underscores and dashes', () => {
    const string = 'this_is-underscored$!#@%^&*';

    const result = handle(string);

    expect(result).toEqual('this_isunderscored');
  });

  it('converts unicode characters to Latin characters', () => {
    const string =
      'Visi cilvēki piedzimst brīvi un vienlīdzīgi savā pašcieņā un tiesībās';

    const result = handle(string);

    expect(result).toEqual(
      'Visicilvekipiedzimstbriviunvienlidzigisavapascienauntiesibas'
    );
  });
});
