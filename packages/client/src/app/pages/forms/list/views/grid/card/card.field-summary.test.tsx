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
  const paths = [...host.querySelectorAll("svg path")].map((segment) =>
    segment.getAttribute("d")?.split(" "),
  );
  expect(paths).toHaveLength(4);
  expect(paths[0]?.slice(0, 3)).toEqual(["M", "60", "16"]);
  for (const [index, path] of paths.entries()) {
    expect(path?.slice(-2)).toEqual(paths[(index + 1) % 4]?.slice(1, 3));
  }
  expect(host.textContent).toContain("Other choices");
  expect(host.textContent).toContain("10% · 10");
});

it("does not invent a remainder when the top choices cover every response", async () => {
  fixture.data.count = 90;
  await render();
  expect(host.querySelectorAll("svg path")).toHaveLength(3);
  expect(host.textContent).not.toContain("Other choices");
});

it("draws a full ring when every response chose the same option", async () => {
  fixture.data.options = [{ label: "Sales", count: 100, percent: 100 }];
  await render();
  expect(host.querySelector("svg path")?.getAttribute("d")).toBe(
    "M 60 16 A 44 44 0 0 1 60 104 A 44 44 0 0 1 60 16",
  );
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
