import catalog from "../../../../../../../../plugin/src/Resources/sample-files/catalog.json";

export type SampleFile = (typeof catalog)[number] & { url: string };

const compatibleFiles = (kinds: string[], maxKB: number) => {
  const files = catalog.filter(
    (item) =>
      (!kinds.length || kinds.includes(item.kind)) &&
      item.size <= (maxKB || 2048) * 1000,
  );
  return files.filter((file) => file.kind === files[0]?.kind);
};
const withUrl = (file: (typeof catalog)[number]): SampleFile => ({
  ...file,
  url: `data:${file.mime};base64,${file.data}`,
});

export const selectSampleFile = (
  kinds: string[] = [],
  maxKB = 2048,
): SampleFile | undefined => {
  const files = compatibleFiles(kinds, maxKB);
  return files.length
    ? withUrl(files[Math.floor(Math.random() * files.length)])
    : undefined;
};

export const selectSampleFiles = (
  kinds: string[] = [],
  maxKB = 2048,
  maxFiles = 1,
): SampleFile[] => {
  const available = compatibleFiles(kinds, maxKB);
  if (!available.length) return [];
  const maximum = Math.max(1, Math.min(3, Math.floor(maxFiles || 1)));
  const count = 1 + Math.floor(Math.random() * maximum);
  const remaining = [...available];
  return Array.from({ length: count }, (_, index) => {
    if (!remaining.length) remaining.push(...available);
    const [file] = remaining.splice(
      Math.floor(Math.random() * remaining.length),
      1,
    );
    return withUrl({
      ...file,
      name:
        index >= available.length
          ? file.name.replace(/(\.[^.]+)$/, `-${index + 1}$1`)
          : file.name,
    });
  });
};
