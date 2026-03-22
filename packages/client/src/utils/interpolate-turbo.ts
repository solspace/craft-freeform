export const interpolateTurbo = (t: number): string => {
  const clamped = Math.max(0, Math.min(1, t));

  const red = Math.max(
    0,
    Math.min(
      255,
      Math.round(
        34.61 +
          clamped *
            (1172.33 -
              clamped *
                (10793.56 -
                  clamped *
                    (33300.12 - clamped * (38394.49 - clamped * 14825.05)))),
      ),
    ),
  );

  const green = Math.max(
    0,
    Math.min(
      255,
      Math.round(
        23.31 +
          clamped *
            (557.33 +
              clamped *
                (1225.33 -
                  clamped *
                    (3574.96 - clamped * (1073.77 + clamped * 707.56)))),
      ),
    ),
  );

  const blue = Math.max(
    0,
    Math.min(
      255,
      Math.round(
        27.2 +
          clamped *
            (3211.1 -
              clamped *
                (15327.97 -
                  clamped *
                    (27814 - clamped * (22569.18 - clamped * 6838.66)))),
      ),
    ),
  );

  return `rgb(${red}, ${green}, ${blue})`;
};
