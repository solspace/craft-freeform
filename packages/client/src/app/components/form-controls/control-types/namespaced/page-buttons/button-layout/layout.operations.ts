import type { LayoutElement } from "./layout.types";

export const extractElements = (layout: string): LayoutElement[] => {
  const groups = layout.split(" ");
  const layoutElements: LayoutElement[] = [];
  groups.forEach((group, idx) => {
    if (idx > 0) {
      layoutElements.push({ type: "space" });
    }
    group.split("|").forEach((element) => {
      const layoutElement: LayoutElement = {
        type: element,
      };
      layoutElements.push(layoutElement);
    });
  });

  return layoutElements;
};

export const layoutAlignment = (groups: string[][]) =>
  groups.length === 1
    ? "left"
    : groups.length === 3
      ? "center"
      : !groups[0].length
        ? "right"
        : !groups[1].length
          ? "left"
          : "split";

/** Resolve the stored layout before collapsing visually equivalent choices. */
export function pageButtonLayoutChoices(
  layouts: string[],
  value: string | undefined,
  page: { order: number; buttons?: { back?: boolean; save?: boolean } },
) {
  const currentLayout = value || "save back|submit";
  const parse = (layout: string) =>
    layout
      .split(" ")
      .map((group) =>
        group
          .split("|")
          .filter(
            (button) =>
              button === "submit" ||
              (button === "save" && page.buttons?.save) ||
              (button === "back" && page.order !== 0 && page.buttons?.back),
          ),
      );
  const key = (groups: string[][]) =>
    JSON.stringify([
      layoutAlignment(groups),
      groups.filter((group) => group.length),
    ]);
  const candidates = [...layouts];
  // Wizard and imported forms can use shorthand such as `submit`.
  if (!candidates.includes(currentLayout)) candidates.push(currentLayout);
  const items: { layout: string; groups: string[][] }[] = [];
  for (const layout of candidates) {
    const groups = parse(layout);
    const existing = items.findIndex(
      (item) => key(item.groups) === key(groups),
    );
    if (existing === -1) items.push({ layout, groups });
    else if (layout === currentLayout) items[existing] = { layout, groups };
  }
  const selected = items.find((item) => item.layout === currentLayout);
  return { items, selected, alignment: layoutAlignment(selected.groups) };
}
