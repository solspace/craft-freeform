import type { FormWithStats } from "@ff-client/types/forms";
import { expect, it } from "vitest";
import {
  type DashboardWidget,
  getExtraWidgetSizes,
  mergeWidgetCards,
  placementsFromLists,
} from "./grid.widgets";

const widget = (uid: string, beforeId: number | null): DashboardWidget => ({
  uid,
  type: "linear",
  title: uid,
  size: "2x2",
  groupUid: "a",
  beforeId,
});
it("interleaves multiple widgets at the same anchor and retains widgets whose anchor was removed", () => {
  const forms = [1, 2].map((id) => ({ id }) as FormWithStats);
  const result = mergeWidgetCards(forms, [
    widget("first", 2),
    widget("second", 2),
    widget("stale", 99),
    widget("end", null),
  ]);
  expect(
    result.map((item) => ("beforeId" in item ? item.uid : item.id)),
  ).toEqual([1, "first", "second", 2, "stale", "end"]);
});
it("captures exact widget order, destination groups, and the next form when cards are mixed", () => {
  expect(
    placementsFromLists(
      [
        { groupUid: "b", ids: ["widget-second", "widget-first", "2", "3"] },
        { groupUid: null, ids: ["widget-end"] },
      ],
      [widget("first", null), widget("second", null), widget("end", null)],
    ),
  ).toEqual([
    { uid: "second", size: "2x2", groupUid: "b", beforeId: 2 },
    { uid: "first", size: "2x2", groupUid: "b", beforeId: 2 },
    { uid: "end", size: "2x2", groupUid: null, beforeId: null },
  ]);
});

it("limits extra sizes to their supported widget types", () => {
  expect(getExtraWidgetSizes("recent").map((choice) => choice.size)).toEqual([
    "3x2",
    "2x3",
    "3x3",
  ]);
  expect(getExtraWidgetSizes("linear").map((choice) => choice.size)).toEqual([
    "3x2",
    "3x3",
  ]);
  expect(getExtraWidgetSizes("radial").map((choice) => choice.size)).toEqual([
    "2x3",
    "3x3",
  ]);
  expect(
    getExtraWidgetSizes("quick-form").map((choice) => choice.size),
  ).toEqual(["2x3", "3x3"]);
  expect(getExtraWidgetSizes("unknown")).toEqual([]);
});
it("preserves extra sizes while moving widgets between groups", () => {
  const wide = { ...widget("wide", null), size: "3x2" as const };
  const tall = { ...widget("tall", null), size: "2x3" as const };
  expect(
    placementsFromLists(
      [{ groupUid: "b", ids: ["widget-tall", "widget-wide", "2"] }],
      [wide, tall],
    ),
  ).toEqual([
    { uid: "tall", size: "2x3", groupUid: "b", beforeId: 2 },
    { uid: "wide", size: "3x2", groupUid: "b", beforeId: 2 },
  ]);
});
