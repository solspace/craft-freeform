import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { SurveyResults } from "./results";

const state = vi.hoisted(() => ({ highlightHighest: false, fetching: false }));
vi.mock("./results.queries", () => ({
  useQuerySurveyChart: () => ({ data: [], isFetching: false }),
  useQuerySurveyResults: () => ({ data: {}, isFetching: false }),
  useQuerySurveyPreferences: () => ({
    data: state.fetching
      ? undefined
      : { highlightHighest: state.highlightHighest },
    isFetching: state.fetching,
  }),
}));
vi.mock("@components/breadcrumbs/breadcrumbs", () => ({
  Breadcrumb: () => null,
}));
vi.mock("@ff-client/utils/translations", () => ({
  default: (text: string) => text,
}));
vi.mock("./chart/chart", () => ({ Chart: () => null }));
vi.mock("./result-list/result-list", () => ({
  ResultList: () => <div>Answers</div>,
}));
vi.mock("./results.loading", () => ({
  ResultsLoadingSkeleton: () => <div>Loading results</div>,
}));

let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  state.highlightHighest = false;
  state.fetching = false;
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});
const render = () => act(() => root.render(<SurveyResults />));
const highlight = () =>
  getComputedStyle(host.querySelector<HTMLElement>("#content > div")!)
    .getPropertyValue("--highlight")
    .trim();

it("uses the saved highlight preference and updates the bar-chart accent when it changes", () => {
  render();
  expect(highlight()).toBe("#33414d");

  state.highlightHighest = true;
  render();
  expect(highlight()).toBe("#e02e39");

  state.highlightHighest = false;
  render();
  expect(highlight()).toBe("#33414d");
});

it("waits for saved preferences before showing the result charts", () => {
  state.fetching = true;
  render();
  expect(host.textContent).toContain("Loading results");
  expect(host.textContent).not.toContain("Answers");

  state.fetching = false;
  render();
  expect(host.textContent).toContain("Answers");
  expect(highlight()).toBe("#33414d");
});
