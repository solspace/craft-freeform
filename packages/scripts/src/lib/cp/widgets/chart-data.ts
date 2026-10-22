import type { ChartConfiguration } from "chart.js";

export type WidgetChartType = "line" | "bar" | "pie" | "doughnut" | "polarArea";
export type WidgetChartConfig = ChartConfiguration<
  WidgetChartType,
  number[],
  string
> & {
  data: {
    labels: string[];
  };
};

export function prepareChartData(config: WidgetChartConfig) {
  const radial = ["pie", "doughnut", "polarArea"].includes(config.type);
  const data = config.data;

  if (radial) {
    const dataset = data.datasets[0];
    const indices = dataset.data.flatMap((value, index) =>
      Number(value) > 0 ? [index] : [],
    );
    data.labels = indices.map((index) => data.labels[index]);
    dataset.data = indices.map((index) => dataset.data[index]);
    const background = dataset.backgroundColor;
    const hover = dataset.hoverBackgroundColor;
    if (Array.isArray(background)) {
      dataset.backgroundColor = indices.map((index) => background[index]);
    }
    if (Array.isArray(hover)) {
      dataset.hoverBackgroundColor = indices.map((index) => hover[index]);
    }
  } else {
    data.datasets = data.datasets.filter((dataset) =>
      dataset.data.some((value) => Number(value) > 0),
    );
  }

  const total = data.datasets.reduce(
    (sum, dataset) =>
      sum +
      dataset.data.reduce((subtotal, value) => subtotal + Number(value), 0),
    0,
  );
  return { config, radial, total };
}
