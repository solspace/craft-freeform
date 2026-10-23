import { afterEach, describe, expect, it, vi } from "vitest";
import { createChartTooltip } from "./chart-tooltip";

type TooltipState = Parameters<
  ReturnType<typeof createChartTooltip>
>[0]["tooltip"];

function point(label: string, count: number, color = "red") {
  return {
    label,
    raw: count,
    dataset: { label, borderColor: color, backgroundColor: [color] },
    dataIndex: 0,
    element: { x: 290, y: 10 },
  } as TooltipState["dataPoints"][number];
}

function fixture(radial = false) {
  const root = document.createElement("div");
  root.innerHTML = "<div data-chart-plot><canvas></canvas></div>";
  document.body.append(root);
  const plot = root.querySelector<HTMLElement>("[data-chart-plot]")!;
  const canvas = plot.querySelector("canvas")!;
  const rect = { left: 0, top: 0, width: 300, height: 200 } as DOMRect;
  vi.spyOn(plot, "getBoundingClientRect").mockReturnValue(rect);
  vi.spyOn(canvas, "getBoundingClientRect").mockReturnValue(rect);
  const render = createChartTooltip(root, radial);
  const element = root.querySelector<HTMLElement>('[role="tooltip"]')!;
  vi.spyOn(element, "offsetWidth", "get").mockReturnValue(180);
  vi.spyOn(element, "offsetHeight", "get").mockReturnValue(80);
  const show = (points: TooltipState["dataPoints"], opacity = 1) =>
    render({
      tooltip: {
        opacity,
        dataPoints: points,
        title: ["Oct 14"],
        caretX: 290,
        caretY: 190,
      },
    });
  return { root, element, show };
}

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

describe("dashboard tooltips", () => {
  it("omits zero rows, orders active forms by count, and treats labels as text", () => {
    const { element, show } = fixture();
    show([point("Empty", 0), point("<b>Contact</b>", 2), point("Orders", 5)]);
    expect(element.hidden).toBe(false);
    expect(element.textContent).toBe("Oct 14Orders5<b>Contact</b>2");
    expect(element.querySelector("b")).toBeNull();
    expect(
      element.querySelectorAll(".freeform-chart-tooltip-row"),
    ).toHaveLength(2);
  });

  it("gives radial counts an explicit translated label and matching slice color", () => {
    const { root, element, show } = fixture(true);
    root.dataset.chartSubmissionsLabel = "Soumissions";
    show([point("Product Review", 5, "#cc3377")]);
    expect(element.textContent).toBe("Product ReviewSoumissions5");
    expect(
      element.querySelector<HTMLElement>(".freeform-chart-tooltip-swatch")!
        .style.backgroundColor,
    ).toBe("rgb(204, 51, 119)");
  });

  it("hides the tooltip when leaving the chart or when all values are zero", () => {
    const { element, show } = fixture();
    show([point("Contact", 3)]);
    show([point("Contact", 3)], 0);
    expect(element.hidden).toBe(true);
    show([point("Contact", 0)]);
    expect(element.hidden).toBe(true);
  });

  it("bounds crowded tooltips and indicates where the remaining forms can be found", () => {
    const { root, element, show } = fixture();
    root.dataset.chartMoreFormsLabel = "{count} autres formulaires";
    show(
      Array.from({ length: 100 }, (_, index) =>
        point(`Form ${index}`, index + 1),
      ),
    );
    expect(
      element.querySelectorAll(".freeform-chart-tooltip-row"),
    ).toHaveLength(8);
    expect(
      element.querySelector(".freeform-chart-tooltip-footer")!.textContent,
    ).toBe("92 autres formulaires");
  });

  it("keeps the card in the chart and anchors it to a populated point rather than the zero baseline", () => {
    const { element, show } = fixture();
    show([point("Contact", 3)]);
    expect(element.style.left).toBe("96px");
    expect(element.style.top).toBe("8px");
    const heading = element.firstChild;
    show([point("Contact", 3)]);
    expect(element.firstChild).toBe(heading);
  });

  it("reduces the visible rows when a short chart cannot fit the full tooltip", () => {
    const { element, show } = fixture();
    vi.spyOn(element, "offsetHeight", "get").mockImplementation(
      () =>
        70 +
        element.querySelectorAll(".freeform-chart-tooltip-row").length * 26,
    );
    show(
      Array.from({ length: 20 }, (_, index) =>
        point(`Form ${index}`, index + 1),
      ),
    );
    expect(
      element.querySelectorAll(".freeform-chart-tooltip-row"),
    ).toHaveLength(4);
    expect(
      element.querySelector(".freeform-chart-tooltip-footer")!.textContent,
    ).toBe("16 more forms in the legend");
  });
});

function hostFixture() {
  const parentDoc = document.implementation.createHTMLDocument();
  const host = Object.assign(new EventTarget(), {
    location: { origin: window.location.origin },
    document: parentDoc,
    innerWidth: 800,
    innerHeight: 600,
    Craft: { cp: {} },
  });
  const frame = document.createElement("iframe");
  frame.setAttribute("data-freeform-widget-frame", "true");
  document.body.append(frame);
  vi.spyOn(frame, "getBoundingClientRect").mockReturnValue({
    left: 100,
    top: 200,
    width: 300,
    height: 100,
  } as DOMRect);
  vi.spyOn(frame, "clientWidth", "get").mockReturnValue(300);
  vi.spyOn(frame, "clientHeight", "get").mockReturnValue(100);
  vi.spyOn(window, "parent", "get").mockReturnValue(host as unknown as Window);
  vi.spyOn(window, "frameElement", "get").mockReturnValue(frame);
  const root = document.createElement("div");
  root.innerHTML = "<div data-chart-plot><canvas></canvas></div>";
  document.body.append(root);
  const plot = root.firstElementChild!;
  const canvas = plot.firstElementChild!;
  vi.spyOn(plot, "getBoundingClientRect").mockReturnValue({
    left: 0,
    top: 0,
    width: 100,
    height: 90,
  } as DOMRect);
  vi.spyOn(canvas, "getBoundingClientRect").mockReturnValue({
    left: 0,
    top: 0,
    width: 100,
    height: 90,
  } as DOMRect);
  const render = createChartTooltip(root, true);
  const element = parentDoc.querySelector<HTMLElement>('[role="tooltip"]')!;
  vi.spyOn(element, "offsetWidth", "get").mockReturnValue(240);
  vi.spyOn(element, "offsetHeight", "get").mockReturnValue(180);
  const show = () =>
    render({
      tooltip: {
        opacity: 1,
        dataPoints: [point("Project enquiry", 56)],
        title: [],
        caretX: 80,
        caretY: 60,
      },
    });
  return { host, parentDoc, frame, root, canvas, element, render, show };
}

it("renders iframe tooltips in the host page beyond the widget bounds", () => {
  const { parentDoc, root, element, show, render } = hostFixture();
  show();
  expect(root.querySelector('[role="tooltip"]')).toBeNull();
  expect(parentDoc.body.contains(element)).toBe(true);
  expect(element.style.position).toBe("fixed");
  expect(element.style.left).toBe("194px");
  expect(element.style.top).toBe("170px");
  expect(element.textContent).toBe("Project enquirySubmissions56");
  expect(element.hidden).toBe(false);
  render.destroy();
  expect(parentDoc.querySelector('[role="tooltip"]')).toBeNull();
});

it("hides portaled tooltips on host scroll, resize, and pointer exit", () => {
  const { host, canvas, element, show, render } = hostFixture();
  for (const event of ["scroll", "resize"]) {
    show();
    host.dispatchEvent(new Event(event));
    expect(element.hidden).toBe(true);
  }
  show();
  canvas.dispatchEvent(new Event("pointerleave"));
  expect(element.hidden).toBe(true);
  render.destroy();
});

it("bounds iframe tooltips to the host viewport and cleans up on iframe unload", () => {
  const { frame, parentDoc, element, show } = hostFixture();
  vi.spyOn(frame, "getBoundingClientRect").mockReturnValue({
    left: 760,
    top: 580,
    width: 300,
    height: 100,
  } as DOMRect);
  show();
  expect(Number.parseFloat(element.style.left) + 240).toBeLessThanOrEqual(792);
  expect(Number.parseFloat(element.style.top) + 180).toBeLessThanOrEqual(592);
  window.dispatchEvent(new Event("pagehide"));
  expect(parentDoc.querySelector('[role="tooltip"]')).toBeNull();
});
