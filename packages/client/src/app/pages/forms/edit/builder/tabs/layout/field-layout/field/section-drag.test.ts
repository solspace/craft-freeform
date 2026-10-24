import { Drag, type FieldDragItem } from "@editor/builder/types/drag";
import { Fields } from "@ff-client/types/field.classes";
import { expect, it } from "vitest";
import { createSectionPreview } from "./field.drag.preview";
import { sectionDragPresentation } from "./section-drag";

const section = {
  type: Drag.Field,
  index: 0,
  height: 250,
  preview: "thumbnail",
  data: { typeClass: Fields.Layout, properties: { label: "Hero" } },
} as FieldDragItem;
it("uses a section's measured height and thumbnail without creating oversized targets", () => {
  expect(sectionDragPresentation(section)).toEqual({
    sectionHeight: 250,
    sectionLabel: "Hero",
    sectionPreview: "thumbnail",
  });
  expect(
    sectionDragPresentation({ ...section, height: 2000 }).sectionHeight,
  ).toBe(320);
  expect(
    sectionDragPresentation({ ...section, height: 25 }).sectionHeight,
  ).toBe(96);
});
it("preserves ordinary field placeholders and clears presentation when dragging stops", () => {
  expect(
    sectionDragPresentation({
      ...section,
      data: { ...section.data, typeClass: Fields.Text },
    }).sectionHeight,
  ).toBe(0);
  expect(sectionDragPresentation(null)).toEqual({
    sectionHeight: 0,
    sectionLabel: "",
    sectionPreview: "",
  });
});
it("previews the actual unequal columns in a bounded thumbnail and safely renders its name", () => {
  const host = document.createElement("div");
  host.innerHTML =
    '<section data-layout-column="a"></section><section data-layout-column="b"></section>';
  const rect = (left: number, width: number) =>
    ({ left, top: 0, width, height: 300 }) as DOMRect;
  host.getBoundingClientRect = () => rect(0, 1200);
  host.children[0].getBoundingClientRect = () => rect(0, 800);
  host.children[1].getBoundingClientRect = () => rect(800, 400);
  const uri = createSectionPreview("Hero <script>", host);
  const svg = new DOMParser().parseFromString(
    decodeURIComponent(uri.split(",")[1]),
    "image/svg+xml",
  );
  expect(svg.querySelector("text")?.textContent).toBe("Hero <script>");
  expect(svg.querySelector("script")).toBeNull();
  expect(Number(svg.documentElement.getAttribute("width"))).toBe(280);
  const frames = Array.from(svg.querySelectorAll("rect")).slice(1);
  expect(
    Number(frames[0].getAttribute("width")) /
      Number(frames[1].getAttribute("width")),
  ).toBe(2);
});
