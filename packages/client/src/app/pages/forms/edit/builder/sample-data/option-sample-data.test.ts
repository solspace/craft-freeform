import { expect, it } from "vitest";
import {
  optionSampleRange,
  selectableOptions,
  selectOptionSample,
} from "./option-sample-data";

const options = [
  { label: "Choose...", value: "" },
  { label: "Zero", value: "0" },
  {
    label: "Group",
    children: [
      { label: "A", value: "a" },
      { label: "B", value: "b" },
      { label: "Duplicate", value: "a" },
    ],
  },
  { label: "Group heading", value: "header", optgroup: true },
];

it("chooses actual nonempty unique values, including zero and nested options", () => {
  expect(selectableOptions(options).map((o) => o.value)).toEqual([
    "0",
    "a",
    "b",
  ]);
  for (const random of [() => 0, () => 0.999]) {
    expect(["0", "a", "b"]).toContain(
      selectOptionSample(options, false, undefined, random),
    );
    const sample = selectOptionSample(
      options,
      true,
      undefined,
      random,
    ) as string[];
    expect([2, 3]).toContain(sample.length);
    expect(new Set(sample).size).toBe(sample.length);
    expect(sample.every((value) => ["0", "a", "b"].includes(value))).toBe(true);
  }
});

it("handles empty lists, small lists, and checkbox selection limits", () => {
  expect(selectOptionSample([], false)).toBe("");
  expect(selectOptionSample([], true)).toEqual([]);
  expect(selectOptionSample([{ label: "A", value: "a" }], true)).toEqual(["a"]);
  expect(
    selectOptionSample(
      options,
      true,
      optionSampleRange({ limit: "max", limitMax: 1 }),
    ),
  ).toHaveLength(1);
  expect(
    selectOptionSample(
      options,
      true,
      optionSampleRange({ limit: "max", limitMax: 0 }),
    ),
  ).toEqual([]);
  expect(
    selectOptionSample(options, true, optionSampleRange({ limit: "all" })),
  ).toHaveLength(3);
  expect(
    selectOptionSample(
      options,
      true,
      optionSampleRange({ limit: "min", limitMin: 3 }),
    ),
  ).toHaveLength(3);
  expect(
    selectOptionSample(
      options,
      true,
      optionSampleRange({ limit: "range", limitRange: [1, 1] }),
    ),
  ).toHaveLength(1);
});
