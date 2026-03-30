import { colors } from "@ff-client/styles/variables";
import translate from "@ff-client/utils/translations";
import type React from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import {
  Section,
  SectionDescription,
  SectionTitle,
  UsageChart,
} from "./ai.dashboard.styles";
import type { DailyMetric } from "./ai.types";

type Props = {
  metrics: DailyMetric[];
};

const AiUsageChart: React.FC<Props> = ({ metrics }) => {
  if (!metrics.length) return null;

  const hasDuration = metrics.some(
    (m) => typeof m.duration_seconds === "number" && m.duration_seconds > 0,
  );

  return (
    <Section>
      <SectionTitle>{translate("Recent AI Usage")}</SectionTitle>
      <SectionDescription>
        {translate("Daily credits and total AI time for the last 30 days.")}
      </SectionDescription>
      <UsageChart>
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart
            data={metrics}
            margin={{
              top: 28,
              right: hasDuration ? 28 : 12,
              bottom: 0,
              left: 6,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tickMargin={8}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })
              }
            />
            <YAxis
              yAxisId="left"
              axisLine={{ stroke: colors.blue400, strokeWidth: 2 }}
              tickLine={{ stroke: colors.blue400, strokeWidth: 2 }}
              tickMargin={8}
              tickFormatter={(value: number) => value.toLocaleString()}
            />
            {hasDuration && (
              <YAxis
                yAxisId="right"
                orientation="right"
                axisLine={{ stroke: colors.pink500, strokeWidth: 2 }}
                tickLine={{ stroke: colors.pink500, strokeWidth: 2 }}
                tickMargin={8}
                tickFormatter={(value: number) => `${value.toFixed(0)}s`}
              />
            )}
            <RechartsTooltip
              cursor={{ fill: colors.gray050 ?? "rgba(0,0,0,0.04)" }}
              labelFormatter={(label: string) =>
                new Date(label).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              }
              formatter={(value: number, name: string) => {
                if (name === "credits") {
                  return [value.toLocaleString(), translate("Credits")];
                }
                if (name === "api_requests") {
                  return [value.toString(), translate("Requests")];
                }
                if (name === "duration_seconds") {
                  return [`${value.toFixed(1)}s`, translate("Duration")];
                }
                return [value.toString(), name];
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              height={20}
              wrapperStyle={{ top: 0 }}
              formatter={(value: string) => {
                if (value === "credits") return translate("Credits");
                if (value === "duration_seconds") return translate("Duration");
                return value;
              }}
            />
            <Bar
              dataKey="credits"
              yAxisId="left"
              fill={colors.blue400}
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
            {hasDuration && (
              <Line
                type="monotone"
                dataKey="duration_seconds"
                yAxisId="right"
                stroke={colors.pink500}
                strokeWidth={2}
                dot={{ r: 2.5, strokeWidth: 0, fill: colors.pink500 }}
                activeDot={{ r: 4 }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </UsageChart>
    </Section>
  );
};

export default AiUsageChart;
