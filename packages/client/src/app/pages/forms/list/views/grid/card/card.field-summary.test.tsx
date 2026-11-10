import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { CardFieldSummary } from "./card.field-summary";
import type { FieldSummary } from "./card.queries";

const fixture = vi.hoisted(() => ({ data: {} as FieldSummary }));
vi.mock("./card.queries", () => ({
  useCardFieldSummary: () => ({
    data: fixture.data,
    isPending: false,
    isError: false,
  }),
}));
vi.mock("@ff-client/utils/translations", () => ({
  default: (text: string, params: Record<string, string> = {}) =>
    Object.entries(params).reduce(
      (result, [key, value]) => result.replace(`{${key}}`, value),
      text,
    ),
}));
let host: HTMLDivElement;
let root: Root;
const render = async (compact = false) =>
  act(async () =>
    root.render(
      <CardFieldSummary id={1} fieldId={5} days={30} compact={compact} />,
    ),
  );
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  fixture.data = {
    id: 5,
    label: "Reason for contacting us",
    kind: "options",
    count: 100,
    average: null,
    min: null,
    max: null,
    options: [
      { label: "Sales", count: 40, percent: 40 },
      { label: "Support", count: 30, percent: 30 },
      { label: "Other", count: 20, percent: 20 },
    ],
  };
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

it("charts all responses including choices outside the top three", async () => {
  await render();
  expect(host.querySelector('[role="img"]')?.getAttribute("aria-label")).toBe(
    "Reason for contacting us: 100 responses",
  );
  const segments = [...host.querySelectorAll("circle")];
  expect(segments).toHaveLength(4);
  expect(
    segments.map((segment) => segment.getAttribute("stroke-dasharray")),
  ).toEqual(["40 60", "30 70", "20 80", "10 90"]);
  expect(host.textContent).toContain("Other choices");
  expect(host.textContent).toContain("10% · 10");
});

it("does not invent a remainder when the top choices cover every response", async () => {
  fixture.data.count = 90;
  await render();
  expect(host.querySelectorAll("circle")).toHaveLength(3);
  expect(host.textContent).not.toContain("Other choices");
});

it("keeps compact and empty summaries readable without a chart", async () => {
  await render(true);
  expect(host.querySelector('[role="img"]')).toBeNull();
  expect(host.querySelectorAll("li")).toHaveLength(1);
  fixture.data.count = 0;
  fixture.data.options = [];
  await render();
  expect(host.querySelector('[role="img"]')).toBeNull();
  expect(host.textContent).toContain("No responses in this period.");
});

it("keeps the numeric average and range instead of showing a choice chart", async () => {
  fixture.data = {
    ...fixture.data,
    kind: "number",
    average: 3,
    min: 1,
    max: 5,
    options: [],
  };
  await render();
  expect(host.querySelector('[role="img"]')).toBeNull();
  expect(host.textContent).toContain("Range: 1–5");
  expect(host.querySelector("strong")?.textContent).toBe("3");
});
