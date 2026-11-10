import type { FormCardDays } from "@ff-client/types/forms";
import translate from "@ff-client/utils/translations";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
import type { CardStats } from "./card.queries";
import {
  ChangeArrow,
  ChartLabel,
  ChartWrapper,
  ComparisonValue,
  PaddedChartFooter,
} from "./card.styles";

export const comparisonLabel = (stats?: CardStats) =>
  !stats
    ? "—"
    : stats.changePercent === null
      ? translate("No earlier data")
      : stats.changePercent === 0
        ? translate("No change")
        : `${stats.changePercent > 0 ? "↑" : "↓"} ${Math.abs(stats.changePercent).toLocaleString(undefined, { maximumFractionDigits: 1 })}%`;
export const comparisonDescription = (stats?: CardStats) => {
  if (!stats) return undefined;
  const period = stats.period;
  const dates = period
    ? ` ${period.from}–${period.to} (${translate("today so far")}) ${translate("vs.")} ${period.previousFrom}–${period.previousTo} (UTC).`
    : "";
  return `${stats.total.toLocaleString()} ${translate("vs.")} ${stats.previousTotal.toLocaleString()} ${translate("submissions")}.${dates}`;
};
export const StatChange = ({ stats }: { stats?: CardStats }) => (
  <ComparisonValue
    $muted={!stats || stats.changePercent === null || stats.changePercent === 0}
    title={comparisonDescription(stats)}
  >
    {!stats ? (
      <span
        className="stat-placeholder"
        role="status"
        aria-label={translate("Loading comparison…")}
      />
    ) : stats.changePercent ? (
      <>
        <span className="visually-hidden">
          {stats.changePercent > 0
            ? translate("Increase")
            : translate("Decrease")}{" "}
        </span>
        <ChangeArrow $up={stats.changePercent > 0} aria-hidden="true">
          {stats.changePercent > 0 ? "↑" : "↓"}
        </ChangeArrow>{" "}
        {Math.abs(stats.changePercent).toLocaleString(undefined, {
          maximumFractionDigits: 1,
        })}
        %
      </>
    ) : (
      comparisonLabel(stats)
    )}
    <span className="visually-hidden">{comparisonDescription(stats)}</span>
  </ComparisonValue>
);
export const CardChart = ({
  id,
  name,
  color,
  days,
  stats,
  expanded,
  tall,
  previewData,
  hasPeriodSummary = false,
}: {
  id: number;
  name: string;
  color: string;
  days: FormCardDays;
  stats?: CardStats;
  expanded: boolean;
  tall: boolean;
  previewData?: { uv: number }[];
  hasPeriodSummary?: boolean;
}) => (
  <ChartWrapper
    data-no-drag
    aria-label={translate("{name}: last {days} days (UTC)", { name, days })}
  >
    {expanded && (
      <ChartLabel>
        <span>
          {!tall && (
            <>
              {stats?.total.toLocaleString() ?? "—"} ·{" "}
              <StatChange stats={stats} /> ·{" "}
            </>
          )}
          {hasPeriodSummary
            ? translate("Submission trend")
            : translate("Last {days} days", { days })}
        </span>
        <span>{translate("Today")}</span>
      </ChartLabel>
    )}
    <ResponsiveContainer width="100%" height={40}>
      <AreaChart
        data={stats?.daily ?? previewData ?? []}
        accessibilityLayer
        aria-label={translate("Daily submissions. Use arrow keys to explore.")}
        margin={{ top: 10, bottom: 3, left: 0, right: 0 }}
      >
        <defs>
          <linearGradient id={`color${id}`} x1={0} y1={0} x2={0} y2={1}>
            <stop offset="5%" stopColor={color} stopOpacity={0.4} />
            <stop offset="95%" stopColor={color} stopOpacity={0.3} />
          </linearGradient>
        </defs>
        <Tooltip
          active={previewData ? false : undefined}
          isAnimationActive={false}
          position={{ y: -45 }}
          formatter={(value) => [
            Number(value).toLocaleString(),
            translate("Submissions"),
          ]}
          labelFormatter={(_, payload) => {
            const date = payload?.[0]?.payload?.date;
            return date
              ? `${new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`))} (UTC)`
              : "";
          }}
          contentStyle={{
            fontSize: 12,
            padding: "6px 10px",
            border: "1px solid #cdd8e4",
            borderRadius: 4,
          }}
          wrapperStyle={{ zIndex: 3 }}
        />
        <Area
          type="monotone"
          dataKey="uv"
          stroke={color}
          strokeWidth={1}
          fill={`url(#color${id})`}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
    <PaddedChartFooter $color={color} />
  </ChartWrapper>
);
