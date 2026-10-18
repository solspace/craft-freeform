export type LabelDiffPart = { text: string; changed: boolean; offset: number };

// Labels are usually short. Bound the comparison for unusually long labels so
// generating a preview never requires an unbounded matrix.
export const diffLabel = (before: string, after: string) => {
  const original = Array.from(before);
  const updated = Array.from(after);
  const current: LabelDiffPart[] = [];
  const next: LabelDiffPart[] = [];
  const append = (parts: LabelDiffPart[], text: string, changed: boolean) => {
    if (!text) return;
    const last = parts.at(-1);
    if (last?.changed === changed) last.text += text;
    else
      parts.push({
        text,
        changed,
        offset: last ? last.offset + last.text.length : 0,
      });
  };
  let start = 0;
  while (start < original.length && original[start] === updated[start]) start++;
  let end = 0;
  while (
    end < original.length - start &&
    end < updated.length - start &&
    original[original.length - end - 1] === updated[updated.length - end - 1]
  )
    end++;
  const left = original.slice(start, original.length - end);
  const right = updated.slice(start, updated.length - end);
  const prefix = original.slice(0, start).join("");
  append(current, prefix, false);
  append(next, prefix, false);
  if ((left.length + 1) * (right.length + 1) > 65536) {
    append(current, left.join(""), true);
    append(next, right.join(""), true);
  } else {
    const width = right.length + 1;
    const lengths = new Uint32Array((left.length + 1) * width);
    for (let i = left.length - 1; i >= 0; i--)
      for (let j = right.length - 1; j >= 0; j--)
        lengths[i * width + j] =
          left[i] === right[j]
            ? 1 + lengths[(i + 1) * width + j + 1]
            : Math.max(
                lengths[(i + 1) * width + j],
                lengths[i * width + j + 1],
              );
    let i = 0;
    let j = 0;
    while (i < left.length || j < right.length) {
      if (i < left.length && j < right.length && left[i] === right[j]) {
        append(current, left[i], false);
        append(next, right[j], false);
        i++;
        j++;
      } else if (
        i < left.length &&
        (j === right.length ||
          lengths[(i + 1) * width + j] >= lengths[i * width + j + 1])
      ) {
        append(current, left[i++], true);
      } else {
        append(next, right[j++], true);
      }
    }
  }
  const suffix = end ? original.slice(-end).join("") : "";
  append(current, suffix, false);
  append(next, suffix, false);
  return { current, next };
};
