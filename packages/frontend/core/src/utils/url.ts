export function resolveUrl(baseUrl: string, path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const base = baseUrl.replace(/\/$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;

  return `${base}${normalized}`;
}

export function compareVersions(left: string, right: string): number {
  const parse = (value: string) =>
    value
      .replace(/^[^\d]*/, "")
      .split(".")
      .map((part) => Number.parseInt(part, 10) || 0);

  const a = parse(left);
  const b = parse(right);
  const length = Math.max(a.length, b.length);

  for (let i = 0; i < length; i += 1) {
    const diff = (a[i] ?? 0) - (b[i] ?? 0);
    if (diff !== 0) {
      return diff < 0 ? -1 : 1;
    }
  }

  return 0;
}
