import type { Locale } from "date-fns";

const cache = new Map<string, Locale>();

const importers: Record<string, () => Promise<Locale>> = {
  nl: async () => (await import("date-fns/locale/nl")).nl,
  de: async () => (await import("date-fns/locale/de")).de,
  fr: async () => (await import("date-fns/locale/fr")).fr,
  it: async () => (await import("date-fns/locale/it")).it,
  "en-US": async () => (await import("date-fns/locale/en-US")).enUS,
};

const normalizeLocale = (input: unknown): string => {
  const value = String(input ?? "")
    .trim()
    .replace("_", "-");

  if (!value) {
    return "en-US";
  }

  const [lang, region] = value.split("-");

  return region
    ? `${lang.toLowerCase()}-${region.toUpperCase()}`
    : lang.toLowerCase();
};

export async function loadLocale(locale: unknown): Promise<Locale | undefined> {
  const normalized = normalizeLocale(locale);

  const candidates = normalized.includes("-")
    ? [normalized, normalized.split("-")[0]]
    : [normalized];

  const expand = (key: string): string[] => {
    if (key === "en") {
      return ["en-US"];
    }

    return [key];
  };

  for (const key of candidates.flatMap(expand)) {
    const cached = cache.get(key);
    if (cached) {
      return cached;
    }

    const importer = importers[key];
    if (!importer) {
      continue;
    }

    const locale = await importer();
    cache.set(key, locale);

    return locale;
  }

  // final fallback
  const fallback = await importers["en-US"]();
  cache.set("en-US", fallback);

  return fallback;
}
