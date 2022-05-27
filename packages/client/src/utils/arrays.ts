export const range = (min: number, max?: number): number[] => {
  if (max === undefined) {
    if (min > 1) {
      max = min;
      min = 1;
    } else {
      max = min;
      min = 0;
    }
  }

  const range: number[] = [];
  for (let i = min; i <= max; i++) {
    range.push(i);
  }

  return range;
};
