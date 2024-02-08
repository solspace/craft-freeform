type NumericValueParser = (
  input: string | number,
  config?: {
    min?: number;
    max?: number;
    unsigned?: boolean;
  }
) => number | undefined;

const NumericRegex = /^-?\d*\.?\d*$/;

export const parseNumericValue: NumericValueParser = (input, config = {}) => {
  const { min, max, unsigned } = config;

  if (typeof input === 'string') {
    if (input === '-') {
      return 0;
    }

    if (!NumericRegex.test(input)) {
      input = input.replaceAll(/[^0-9.-]/g, '');
    }

    if (input === '') {
      return;
    }

    input = Number(input);
  }

  if (Number.isNaN(input)) {
    return;
  }

  if (typeof unsigned === 'boolean' && unsigned && input < 0) {
    input = Math.abs(input);
  }

  if (min !== undefined && min !== null && input < min) {
    return min;
  }

  if (max !== undefined && max !== null && input > max) {
    return max;
  }

  return input;
};

export const inRange = (
  current: number,
  min: number,
  max: number,
  inclusive: boolean = true
): boolean => {
  const minimum = Math.min(min, max);
  const maximum = Math.max(min, max);

  if (inclusive) {
    return current >= minimum && current <= maximum;
  }

  return current > minimum && current < maximum;
};
