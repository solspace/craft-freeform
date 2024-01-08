type ScalingFunction = (t: number) => string;

export const generateColor = (
  percentage: number,
  colorScale: ScalingFunction,
  alpha = 1
): string => {
  return colorScale(percentage).replace(
    /rgb\((\d+, \d+, \d+)\)/i,
    `rgba($1, ${alpha})`
  );
};
