import { MetricValue } from "./settings.usage.styles";

const compactFormatter = new Intl.NumberFormat(undefined, {
  notation: "compact",
  maximumFractionDigits: 1,
  maximumSignificantDigits: 3,
  roundingPriority: "lessPrecision",
  roundingMode: "trunc",
});

export const compactMetricValue = (value?: number) =>
  value === undefined
    ? "—"
    : value >= 1000
      ? compactFormatter.format(value)
      : value.toLocaleString();

export const UsageMetricValue = ({ value }: { value?: number }) => {
  const exact = value === undefined ? "—" : value.toLocaleString();
  const compact = compactMetricValue(value);

  return (
    <MetricValue
      className="metric-value"
      $length={compact.length}
      title={exact}
    >
      <span aria-hidden="true">{compact}</span>
      <span className="visually-hidden">{exact}</span>
    </MetricValue>
  );
};
