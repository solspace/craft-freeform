import { format, parseISO } from 'date-fns';

import type { AiUsageResponse } from './ai.types';

export type SummaryMode = 'trial' | 'plan' | 'blocked' | 'unknown' | undefined;

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

export const getSummaryModeLabel = (
  summary: AiUsageResponse | undefined
): string => {
  if (summary?.mode_label) {
    return summary.mode_label;
  }

  switch (summary?.mode) {
    case 'trial':
      return 'Free trial';
    case 'plan':
      return 'Active plan';
    case 'blocked':
      return 'Usage limit reached';
    case 'unknown':
    default:
      return 'Not configured';
  }
};
