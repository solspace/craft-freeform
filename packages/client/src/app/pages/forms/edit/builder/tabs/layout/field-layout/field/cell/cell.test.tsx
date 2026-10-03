import type { Field } from "@editor/store/slices/layout/fields";
import { Fields } from "@ff-client/types/field.classes";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";

import { FieldCell } from "./cell";
import { HtmlPreviewElement } from "./cell.styles";

vi.mock("@editor/store", () => ({ useAppDispatch: () => vi.fn() }));
vi.mock("react-redux", () => ({ useSelector: () => ({ active: false }) }));
vi.mock("@ff-client/queries/field-types", () => ({
  useFieldType: () => ({ type: "rich-text", name: "Content", implements: [] }),
}));
vi.mock("@editor/store/slices/translations/translations.hooks", () => ({
  useTranslations: () => ({
    getTranslation: (_key: string, value: string) => value,
  }),
}));
vi.mock("./use-field-preview", () => ({
  useFieldPreview: () => [
    "<h2>Heading</h2><p>Content</p><ol><li>Item</li></ol>",
    false,
  ],
}));
vi.mock("./cell.animations", () => ({ useLoaderAnimation: () => [{}, {}] }));
vi.mock("./cell-badges", () => ({ FieldAssociationsBadges: () => null }));
vi.mock("../../layout/group-field-layout/group-field-layout", () => ({
  GroupFieldLayout: () => null,
}));

it.each([Fields.Html, Fields.RichText])(
  "uses content typography for a labeled %s layout preview",
  (typeClass) => {
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    try {
      const field = {
        uid: "content",
        typeClass,
        properties: { label: "Content" },
      } as Field;
      act(() => root.render(<FieldCell field={field} />));
      const content = container.querySelector("h2")!.parentElement!;
      expect(
        content.classList.contains(HtmlPreviewElement.styledComponentId),
      ).toBe(true);
      expect(container.querySelector("ol li")?.textContent).toBe("Item");
      expect(container.textContent).toContain("Content");
    } finally {
      act(() => root.unmount());
      container.remove();
    }
  },
);
