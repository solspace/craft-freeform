import { format, parseISO } from 'date-fns';

export const formatAiDate = (iso: string | null | undefined): string => {
  if (!iso) return '—';

  try {
    const date = parseISO(iso);
    if (Number.isNaN(date.getTime())) {
      return iso;
    }

    return format(date, 'PP');
  } catch {
    return iso;
  }
};
