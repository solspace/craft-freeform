/** PHP date tokens used by Freeform's configurable date/time field formats. */
const tokens: Record<string, string> = {
  Y: "(\\d{4})",
  y: "(\\d{2})",
  m: "(\\d{2})",
  n: "(\\d{1,2})",
  d: "(\\d{2})",
  j: "(\\d{1,2})",
  H: "(\\d{2})",
  G: "(\\d{1,2})",
  h: "(\\d{2})",
  g: "(\\d{1,2})",
  i: "(\\d{2})",
  s: "(\\d{2})",
  A: "(AM|PM)",
  a: "(am|pm)",
};
export function formatDateTime(date: Date, format: string): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  const hour = date.getHours();
  const values: Record<string, string> = {
    Y: String(date.getFullYear()).padStart(4, "0"),
    y: pad(date.getFullYear() % 100),
    m: pad(date.getMonth() + 1),
    n: String(date.getMonth() + 1),
    d: pad(date.getDate()),
    j: String(date.getDate()),
    H: pad(hour),
    G: String(hour),
    h: pad(hour % 12 || 12),
    g: String(hour % 12 || 12),
    i: pad(date.getMinutes()),
    s: pad(date.getSeconds()),
    A: hour < 12 ? "AM" : "PM",
    a: hour < 12 ? "am" : "pm",
  };
  let escaped = false;
  return Array.from(format)
    .map((char) => {
      if (escaped) {
        escaped = false;
        return char;
      }
      if (char === "\\") {
        escaped = true;
        return "";
      }
      return values[char] ?? char;
    })
    .join("");
}
export function parseDateTime(
  value: string,
  format: string,
  reference = new Date(),
): Date | null {
  let pattern = "^",
    escaped = false;
  const fields: string[] = [];
  for (const char of format) {
    if (!escaped && char === "\\") {
      escaped = true;
      continue;
    }
    if (!escaped && tokens[char]) {
      fields.push(char);
      pattern += tokens[char];
    } else pattern += char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    escaped = false;
  }
  const match = new RegExp(`${pattern}$`, "i").exec(value.trim());
  if (!match) return null;
  const parts = Object.fromEntries(
    fields.map((key, index) => [key, match[index + 1]]),
  );
  const year = parts.Y
    ? +parts.Y
    : parts.y
      ? +parts.y + (+parts.y < 70 ? 2000 : 1900)
      : reference.getFullYear();
  const month =
    parts.m || parts.n ? +(parts.m ?? parts.n) - 1 : reference.getMonth();
  const day = parts.d || parts.j ? +(parts.d ?? parts.j) : reference.getDate();
  let hour = +(parts.H ?? parts.G ?? parts.h ?? parts.g ?? 0);
  if (parts.A || parts.a) {
    if (hour < 1 || hour > 12) return null;
    hour = (hour % 12) + ((parts.A ?? parts.a).toLowerCase() === "pm" ? 12 : 0);
  }
  const minute = +(parts.i ?? 0),
    second = +(parts.s ?? 0);
  if (
    hour > 23 ||
    minute > 59 ||
    second > 59 ||
    month < 0 ||
    month > 11 ||
    day < 1 ||
    day > 31
  )
    return null;
  const date = new Date(reference);
  date.setHours(0, 0, 0, 0);
  date.setFullYear(year, month, day);
  date.setHours(hour, minute, second, 0);
  return date.getFullYear() === year &&
    date.getMonth() === month &&
    date.getDate() === day &&
    date.getHours() === hour &&
    date.getMinutes() === minute
    ? date
    : null;
}
