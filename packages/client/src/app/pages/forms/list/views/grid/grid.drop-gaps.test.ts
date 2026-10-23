import { describe, expect, it } from "vitest";
import { createGridDropTargets, findGridDropGaps } from "./grid.drop-gaps";

const card = (id: string, columns: number, rows: number) => ({
  id,
  span: { columns, rows },
});
const draggedSpan = { columns: 1, rows: 2 };

describe("grid gap drop positions", () => {
  it("targets the blank column before a wide card wraps, without hovering that card", () => {
    const gaps = findGridDropGaps(
      [
        card("chart", 3, 2),
        card("contact", 2, 2),
        card("appointments", 1, 2),
        card("recent", 1, 2),
      ],
      "recent",
      draggedSpan,
      4,
    );
    expect(gaps).toContainEqual({
      column: 3,
      row: 0,
      columns: 1,
      rows: 2,
      before: "contact",
    });
  });

  it("keeps the same target after the placeholder fills the hole", () => {
    const gaps = findGridDropGaps(
      [
        card("chart", 3, 2),
        card("recent", 1, 2),
        card("contact", 2, 2),
        card("appointments", 1, 2),
      ],
      "recent",
      draggedSpan,
      4,
    );
    expect(gaps).toContainEqual({
      column: 3,
      row: 0,
      columns: 1,
      rows: 2,
      before: "contact",
    });
  });

  it("does not offer a narrow gap to a wide card or cover an occupied tall card", () => {
    const cards = [
      card("chart", 3, 2),
      card("contact", 2, 2),
      card("wide", 2, 1),
    ];
    expect(findGridDropGaps(cards, "wide", { columns: 2, rows: 1 }, 4)).toEqual(
      [],
    );
    expect(
      findGridDropGaps(
        [
          card("tall", 1, 3),
          card("other", 2, 1),
          card("wrap", 2, 2),
          card("recent", 1, 2),
        ],
        "recent",
        draggedSpan,
        3,
      ).some((gap) => gap.column === 0 && gap.row < 3),
    ).toBe(false);
  });

  it("supports another group and does not create targets beyond the current grid", () => {
    expect(
      findGridDropGaps(
        [card("chart", 3, 2), card("contact", 2, 2)],
        "recent",
        draggedSpan,
        4,
      ),
    ).toEqual([{ column: 3, row: 0, columns: 1, rows: 2, before: "contact" }]);
    expect(
      findGridDropGaps([card("form", 1, 1)], "recent", draggedSpan, 1),
    ).toEqual([]);
  });

  it("creates transient absolute targets and removes them before persistence", () => {
    const list = document.createElement("ul");
    list.style.cssText =
      "display:grid;grid-template-columns:320px 320px 320px 320px;grid-auto-rows:164px;column-gap:20px;row-gap:20px";
    document.body.append(list);
    for (const item of [
      card("chart", 3, 2),
      card("contact", 2, 2),
      card("recent", 1, 2),
    ]) {
      const element = document.createElement("li");
      element.dataset.id = item.id;
      element.style.gridColumnStart = `span ${item.span.columns}`;
      element.style.gridRowStart = `span ${item.span.rows}`;
      list.append(element);
    }
    const dragged = list.querySelector<HTMLElement>('[data-id="recent"]')!;
    const targets = createGridDropTargets([list], dragged);
    const target = list.querySelector<HTMLElement>("[data-grid-gap]")!;
    expect(target.style.position).toBe("absolute");
    expect(target.style.left).toBe("1020px");
    expect(target.style.height).toBe("348px");
    expect(target.nextElementSibling?.getAttribute("data-id")).toBe("contact");
    expect(target.hasAttribute("data-id")).toBe(false);
    // Crossing the chart may preview an earlier position. The original gap must
    // remain reachable until the pointer finishes travelling toward it.
    list.insertBefore(dragged, list.firstChild);
    expect(target.nextElementSibling?.getAttribute("data-id")).toBe("contact");
    list.insertBefore(dragged, target);
    expect(list.querySelector("[data-grid-gap]")).toBe(target);
    targets.destroy();
    expect(list.querySelector("[data-grid-gap]")).toBeNull();
    expect(
      Array.from(list.children).map((el) => el.getAttribute("data-id")),
    ).toEqual(["chart", "recent", "contact"]);
    list.remove();
  });
});
