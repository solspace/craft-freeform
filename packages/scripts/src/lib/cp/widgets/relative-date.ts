export function formatRelativeDate(
  value: string,
  locale: string,
  timeZone: string,
  now = new Date(),
): string | null {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;
  try {
    const relative = new Intl.RelativeTimeFormat(locale.replace(/_/g, "-"), {
      numeric: "always",
      style: "narrow",
    });
    const seconds = (date.getTime() - now.getTime()) / 1000;
    const magnitude = Math.abs(seconds);
    if (magnitude < 60)
      return new Intl.RelativeTimeFormat(locale.replace(/_/g, "-"), {
        numeric: "auto",
        style: "narrow",
      }).format(0, "second");
    if (magnitude < 3600)
      return relative.format(Math.trunc(seconds / 60), "minute");
    const calendar = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
    const day = (value: Date) => {
      const parts = Object.fromEntries(
        calendar.formatToParts(value).map((part) => [part.type, part.value]),
      );
      return Date.UTC(
        Number(parts.year),
        Number(parts.month) - 1,
        Number(parts.day),
      );
    };
    const days = Math.round((day(date) - day(now)) / 86400000);
    if (days === 0) return relative.format(Math.trunc(seconds / 3600), "hour");
    if (Math.abs(days) < 7) return relative.format(days, "day");
    if (Math.abs(days) < 30)
      return relative.format(Math.trunc(days / 7), "week");
    if (Math.abs(days) < 365)
      return relative.format(Math.trunc(days / 30), "month");
    return relative.format(Math.trunc(days / 365), "year");
  } catch {
    // Preserve the server-rendered exact date if locale/time-zone support is unavailable.
    return null;
  }
}
