import { generateHandle } from "../../../utils/strings";

import type {
  ABTestDashboardItem,
  ABTestDashboardSeriesPoint,
  ABTestDashboardVariant,
  ABTestWithVariants,
  MetricTab,
} from "./ab-tests.types";

export const lineColors = [
  "#1660c7",
  "#d92d20",
  "#7a3ec8",
  "#f58c00",
  "#008f8f",
  "#c200fb",
  "#2d6a4f",
];

export const getVariantColor = (
  variant: Pick<ABTestDashboardVariant, "formColor" | "id">,
  index: number,
): string => {
  return variant.formColor || lineColors[index % lineColors.length];
};

export const metricTabs: Array<{ id: MetricTab; label: string }> = [
  { id: "conversionRate", label: "Conversion Rate" },
  { id: "impressions", label: "Impressions" },
  { id: "interactions", label: "Interactions" },
  { id: "failures", label: "Failures" },
];

export const formatRate = (value: number): string => `${value.toFixed(1)}%`;

export const toEditorPayload = (
  test: ABTestDashboardItem,
): ABTestWithVariants => ({
  id: test.id,
  name: test.name,
  handle: test.handle,
  description: test.description,
  startDate: test.startDate,
  endDate: test.endDate,
  variants: test.variants.map((variant) => ({
    id: variant.id,
    formId: variant.formId,
    weight: variant.weight,
  })),
});

export const mergeChartData = (
  variants: ABTestDashboardVariant[],
  metric: MetricTab,
): Array<Record<string, string | number>> => {
  const firstVariant = variants[0];
  if (!firstVariant) {
    return [];
  }

  return firstVariant.series.map((point: ABTestDashboardSeriesPoint, index) => {
    const row: Record<string, string | number> = { date: point.date };
    variants.forEach((variant) => {
      const metricPoint = variant.series[index];
      row[`variant-${variant.id}`] = metricPoint?.[metric] ?? 0;
    });

    return row;
  });
};

export const generateABTestHandle = (name: string): string => {
  return generateHandle(name, {
    transliterate: true,
    camelize: true,
  });
};
