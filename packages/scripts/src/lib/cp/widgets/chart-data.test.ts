import { describe, expect, it } from "vitest";
import { prepareChartData } from "./chart-data";

describe("dashboard chart data", () => {
  it.each(["pie", "doughnut", "polarArea"])(
    "keeps labels, values and colors aligned when removing inactive %s slices",
    (type) => {
      const { config, radial, total } = prepareChartData({
        type,
        data: {
          labels: ["Empty", "Contact", "Empty again", "Orders"],
          datasets: [
            {
              data: [0, 7, 0, 3],
              backgroundColor: ["a", "b", "c", "d"],
              hoverBackgroundColor: ["A", "B", "C", "D"],
            },
          ],
        },
      });
      expect(radial).toBe(true);
      expect(total).toBe(10);
      expect(config.data.labels).toEqual(["Contact", "Orders"]);
      expect(config.data.datasets[0]).toEqual({
        data: [7, 3],
        backgroundColor: ["b", "d"],
        hoverBackgroundColor: ["B", "D"],
      });
    },
  );

  it.each(["line", "bar"])(
    "removes inactive %s series without removing dates or zero points in active series",
    (type) => {
      const { config, total } = prepareChartData({
        type,
        data: {
          labels: ["Oct 18", "Oct 19", "Oct 20"],
          datasets: [
            { label: "Empty", data: [0, 0, 0] },
            { label: "Contact", data: [2, 0, 3] },
          ],
        },
      });
      expect(total).toBe(5);
      expect(config.data.labels).toEqual(["Oct 18", "Oct 19", "Oct 20"]);
      expect(config.data.datasets).toEqual([
        { label: "Contact", data: [2, 0, 3] },
      ]);
    },
  );

  it("reports an empty range without inventing chart values", () => {
    const { total, config } = prepareChartData({
      type: "doughnut",
      data: { labels: ["Empty"], datasets: [{ data: [0] }] },
    });
    expect(total).toBe(0);
    expect(config.data.labels).toEqual([]);
    expect(config.data.datasets[0].data).toEqual([]);
  });
});
