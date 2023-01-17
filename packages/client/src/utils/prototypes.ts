interface Number {
  inRange(min: number, max: number, inclusive?: boolean): boolean;
}

Number.prototype.inRange = function (min, max, inclusive = true): boolean {
  const minimum = Math.min(min, max);
  const maximum = Math.max(min, max);

  if (inclusive) {
    return this >= minimum && this <= maximum;
  }

  return this > minimum && this < maximum;
};
