import config from "@config/freeform/freeform.config";
import { parseISO } from "date-fns";

function getCraftLocale(): string | undefined {
  const locale = config.metadata?.craft?.locale;
  return typeof locale === "string" && locale.trim()
    ? locale.trim()
    : undefined;
}

export const formatAiDate = (iso: string | null | undefined): string => {
  if (!iso) return "—";

  try {
    const date = parseISO(iso);
    if (Number.isNaN(date.getTime())) {
      return iso;
    }

    const locale = getCraftLocale();
    return date.toLocaleDateString(locale, { dateStyle: "medium" });
  } catch {
    return iso;
  }
};

export const formatAiDateTime = (iso: string | null | undefined): string => {
  if (!iso) return "—";

  try {
    const date = parseISO(iso);
    if (Number.isNaN(date.getTime())) {
      return iso;
    }

    const locale = getCraftLocale();
    return date.toLocaleString(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
};
