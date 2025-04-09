import { regex } from '.';

describe('regex middleware', () => {
  it('replaces via regex pattern', () => {
    const input = 'ThisIs a RaNDoM_String 55 -=!?+_-"\'';
    const result = regex(input, {
      pattern: '[^a-zA-Z0-9_]',
    });

    expect(result).toEqual('ThisIsaRaNDoM_String55_');
  });

  it('uses modifiers properly', () => {
    const input = 'ThisIs a RaNDoM_String 55 -=!?+_-"\'';
    const result = regex(input, {
      pattern: '[^a-z]',
      modifier: 'ig',
    });

    expect(result).toEqual('ThisIsaRaNDoMString');
  });

  it('uses replacement correctly', () => {
    const input = 'UpperCase';
    const result = regex(input, {
      pattern: '[^a-z]',
      replacement: '-=-',
    });

    expect(result).toEqual('-=-pper-=-ase');
  });
});
