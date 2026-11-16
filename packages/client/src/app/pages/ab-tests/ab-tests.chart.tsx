import config from "@config/freeform/freeform.config";
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
import {
  ChartArea,
  ChartEmpty,
  ChartLegend,
  ChartToolbar,
  Tab,
  Tabs,
} from "./ab-tests.styles";
import type { ABTestDashboardItem, MetricTab } from "./ab-tests.types";

type Props = {
  test: ABTestDashboardItem;
  activeTab: MetricTab;
  setTab: (test: ABTestDashboardItem, tabId: MetricTab) => void;
};

export const ABTestChart: FC<Props> = ({ test, activeTab, setTab }) => {
  const chartData = mergeChartData(test.variants, activeTab);
  const isRate = activeTab === "conversionRate";
  const locale =
    config.metadata.craft.locale?.replaceAll("_", "-") || undefined;

  return (
    <ChartArea>
      <ChartToolbar>
        <div>
          <h3>{translate("Performance over time")}</h3>
          <ChartLegend>
            {test.variants.map((variant, index) => (
              <span key={variant.id}>
                <i
                  aria-hidden="true"
                  style={{ backgroundColor: getVariantColor(variant, index) }}
                />
                {variant.formName ||
                  translate("Variant {number}", { number: index + 1 })}
              </span>
            ))}
          </ChartLegend>
        </div>
        <Tabs role="group" aria-label={translate("Chart metric")}>
          {metricTabs.map((tab) => (
            <Tab
              type="button"
              aria-pressed={activeTab === tab.id}
              key={tab.id}
              $active={activeTab === tab.id}
              onClick={() => setTab(test, tab.id)}
            >
              {translate(tab.label)}
            </Tab>
          ))}
        </Tabs>
      </ChartToolbar>

      {test.totalImpressions === 0 ? (
        <ChartEmpty>
          <strong>{translate("No impressions yet")}</strong>
          <span>
            {translate(
              "Performance data will appear as visitors view your test forms.",
            )}
          </span>
        </ChartEmpty>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart
            data={chartData}
            margin={{ top: 12, right: 12, left: 0, bottom: 0 }}
          >
            <CartesianGrid stroke={colors.hairline} vertical={false} />

            <XAxis
              dataKey="date"
              tick={{ fill: colors.muted, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              minTickGap={40}
              tickFormatter={(value) =>
                new Date(`${value}T00:00:00`).toLocaleDateString(locale, {
                  month: "short",
                  day: "numeric",
                })
              }
            />

            <YAxis
              tick={{ fill: colors.muted, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={44}
              allowDecimals={isRate}
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
                new Date(`${value}T00:00:00`).toLocaleDateString(locale, {
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
                name={
                  variant.formName ||
                  translate("Variant {number}", { number: index + 1 })
                }
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </ChartArea>
  );
};
