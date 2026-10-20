import "@ff-chart-styles";

import type { FormStats, FormStatsDays } from "@ff-client/queries/forms";
import translate from "@ff-client/utils/translations";
import { createChartTooltip } from "@ff-widgets/chart-tooltip";
import {
  CategoryScale,
  Chart,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { useEffect, useMemo, useRef, useState } from "react";

// This module is only imported by the lazy-loaded Usage & Stats page.
Chart.register(
  CategoryScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
);

const formatDate = (date: string) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

export const activityPeriodLabel = (days: FormStatsDays) =>
  translate(days === 365 ? "Last year" : `Last ${days} days`);

export const SubmissionActivityChart = ({
  daily,
  days,
  onDaysChange,
  loading = false,
}: {
  daily: FormStats["daily"];
  days: FormStatsDays;
  onDaysChange: (days: FormStatsDays) => void;
  loading?: boolean;
}) => {
  const hasActivity = daily.some((day) => day.submissions > 0 || day.spam > 0);
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const emptyRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Chart<"line", number[], string> | null>(null);
  const visibilityRef = useRef([true, true]);
  const [visibility, setVisibility] = useState(visibilityRef.current);
  const series = useMemo(
    () => [
      {
        label: translate("Submissions"),
        color: "#2585c6",
        values: daily.map((day) => day.submissions),
      },
      {
        label: translate("Stored spam"),
        color: "#ce8135",
        values: daily.map((day) => day.spam),
      },
    ],
    [daily],
  );

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const styles = getComputedStyle(root);
    const chart = new Chart<"line", number[], string>(canvas, {
      type: "line",
      plugins: [
        {
          id: "usage-empty-message",
          afterLayout(chart) {
            const empty = emptyRef.current;
            if (!empty) return;
            const { top, right, bottom, left } = chart.chartArea;
            empty.style.inset = `${top}px ${chart.width - right}px ${chart.height - bottom}px ${left}px`;
          },
        },
      ],
      data: {
        labels: daily.map((day) => formatDate(day.date)),
        datasets: series.map((item, index) => ({
          label: item.label,
          data: item.values,
          borderColor: item.color,
          backgroundColor: item.color,
          borderWidth: 2,
          borderDash: index === 1 ? [4, 3] : [],
          pointRadius: 0,
          pointHoverRadius: 4,
          tension: 0.2,
          hidden: !visibilityRef.current[index],
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 8, right: 8 } },
        animation: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? false
          : { duration: 250 },
        font: { family: styles.fontFamily },
        interaction: { mode: "index", intersect: false },
        scales: {
          x: {
            type: "category",
            grid: { display: false },
            ticks: { maxTicksLimit: 8, maxRotation: 0 },
          },
          y: {
            type: "linear",
            beginAtZero: true,
            suggestedMax: 1,
            grace: "10%",
            ticks: {
              maxTicksLimit: 6,
              precision: 0,
              format: { maximumFractionDigits: 0 },
            },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: false,
            filter: (item) => Number(item.raw) > 0,
            external: createChartTooltip(root, false),
          },
        },
      },
    });
    chartRef.current = chart;
    return () => {
      chart.destroy();
      chartRef.current = null;
      root.querySelector(".freeform-chart-tooltip")?.remove();
    };
  }, [daily, series]);

  const toggleSeries = (index: number) => {
    const chart = chartRef.current;
    if (!chart) return;
    const visible = !chart.isDatasetVisible(index);
    chart.setDatasetVisibility(index, visible);
    chart.update();
    const next = visibilityRef.current.map((value, item) =>
      item === index ? visible : value,
    );
    visibilityRef.current = next;
    setVisibility(next);
  };

  return (
    <div ref={rootRef} className="freeform-usage-chart">
      <div className="section-heading">
        <h2 id="submission-activity-title">
          {translate("Submission activity")}
        </h2>
        <div className="chart-controls">
          <div className="legend">
            {series.map((item, index) => (
              <button
                key={item.label}
                type="button"
                className="freeform-chart-legend-item"
                aria-pressed={visibility[index]}
                onClick={() => toggleSeries(index)}
              >
                <span
                  className="freeform-chart-swatch"
                  style={{ backgroundColor: item.color }}
                  aria-hidden="true"
                />
                <span className="freeform-chart-label">{item.label}</span>
                <span className="freeform-chart-count">
                  {item.values
                    .reduce((sum, value) => sum + value, 0)
                    .toLocaleString()}
                </span>
              </button>
            ))}
          </div>
          <div className="select small chart-period">
            <select
              aria-label={translate("Chart period")}
              value={days}
              title={
                daily.length > 0
                  ? `${formatDate(daily[0].date)} – ${formatDate(daily.at(-1).date)} (UTC)`
                  : undefined
              }
              onChange={(event) =>
                onDaysChange(Number(event.target.value) as FormStatsDays)
              }
            >
              {([7, 30, 90, 365] as const).map((period) => (
                <option key={period} value={period}>
                  {activityPeriodLabel(period)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div
        className="chart"
        data-chart-plot
        data-loading={loading}
        aria-busy={loading}
      >
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={translate(
            "Daily submissions and stored spam over the selected period",
          )}
        />
        <div
          ref={emptyRef}
          className="chart-empty muted"
          role="status"
          hidden={hasActivity && !loading}
        >
          <span>
            {translate(
              loading
                ? "Loading statistics…"
                : "No stored submissions or spam in this period.",
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
