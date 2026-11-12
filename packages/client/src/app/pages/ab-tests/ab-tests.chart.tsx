import { colors } from "@ff-client/styles/variables";
import translate from "@ff-client/utils/translations";
import type { FC } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  formatRate,
  getVariantColor,
  mergeChartData,
  metricTabs,
} from "./ab-tests.operations";
import { ChartArea, Tab, Tabs } from "./ab-tests.styles";
import type { ABTestDashboardItem, MetricTab } from "./ab-tests.types";

type Props = {
  test: ABTestDashboardItem;
  activeTab: MetricTab;
  setTab: (test: ABTestDashboardItem, tabId: MetricTab) => void;
};

export const ABTestChart: FC<Props> = ({ test, activeTab, setTab }) => {
  const chartData = mergeChartData(test.variants, activeTab);
  const isRate = activeTab === "conversionRate";

  return (
    <ChartArea>
      <Tabs>
        {metricTabs.map((tab) => (
          <Tab
            key={tab.id}
            $active={activeTab === tab.id}
            onClick={() => setTab(test, tab.id)}
          >
            {translate(tab.label)}
          </Tab>
        ))}
      </Tabs>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart
          data={chartData}
          margin={{ top: 12, right: 12, left: 0, bottom: 0 }}
        >
          <CartesianGrid stroke={colors.hairline} vertical={false} />

          <XAxis
            dataKey="date"
            tick={{ fill: colors.muted }}
            axisLine={false}
            tickLine={false}
            interval={2}
            tickFormatter={(value) =>
              new Date(String(value)).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            }
          />

          <YAxis
            tick={{ fill: colors.muted }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `${value}${isRate ? "%" : ""}`}
          />

          <Tooltip
            contentStyle={{
              background: colors.overlay,
              border: `1px solid ${colors.border}`,
              borderRadius: 4,
              boxShadow: "var(--menu-shadow)",
            }}
            labelStyle={{ color: colors.text }}
            cursor={{ stroke: colors.muted }}
            formatter={(value: number) =>
              isRate ? formatRate(Number(value)) : Number(value)
            }
            labelFormatter={(value) =>
              new Date(String(value)).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            }
          />

          {test.variants.map((variant, index) => (
            <Line
              key={variant.id}
              type="linear"
              dataKey={`variant-${variant.id}`}
              stroke={getVariantColor(variant, index)}
              strokeWidth={2}
              dot={false}
              name={variant.formName || `Variant ${index + 1}`}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartArea>
  );
};
