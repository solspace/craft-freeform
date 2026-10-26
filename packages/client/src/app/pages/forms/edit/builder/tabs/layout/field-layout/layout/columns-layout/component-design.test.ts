import {
  editableComponentDesign,
  updateComponentDesign,
} from "@ff-client/utils/component-design-settings";
import { describe, expect, it } from "vitest";
import {
  componentDesignAppearance,
  componentDesignTreatment,
  designedCardAppearance,
} from "./component-design";

describe("component design inheritance", () => {
  const form = {
    componentAccentColor: "#123456",
    componentAccentTextColor: "#ffffcc",
    componentSurfaceColor: "#f0f0f0",
    componentTextColor: "#222222",
    componentSpacing: "spacious",
    componentCorners: "rounded",
  };

  it("leaves legacy and manual layouts unchanged", () => {
    expect(componentDesignAppearance({}, form)).toEqual({});
    expect(componentDesignAppearance({ designStyle: "manual" }, form)).toEqual(
      {},
    );
  });

  it("inherits form design changes and supports a bold treatment", () => {
    const style = componentDesignAppearance(
      { designStyle: "form", designTreatment: "bold" },
      form,
    );
    expect(style["--freeform-background-color"]).toBe("#123456");
    expect(style["--freeform-text-color"]).toBe("#ffffcc");
    expect(style["--freeform-component-body-color"]).toBe("#222222");
    expect(style["--freeform-padding"]).toBe("56px");
    expect(style["--freeform-component-radius"]).toBe("24px");
  });

  it("uses local settings for just one component and rejects unsafe colors", () => {
    const style = componentDesignAppearance(
      {
        designStyle: "custom",
        designAccentColor: "red; position:fixed",
        designSurfaceColor: "#abc",
        designTextColor: "#111111",
        designSpacing: "compact",
        designCorners: "square",
      },
      form,
    );
    expect(style["--freeform-accent-color"]).toBe("#6d28d9");
    expect(style["--freeform-background-color"]).toBe("#abc");
    expect(style["--freeform-padding"]).toBe("16px");
    expect(style["--freeform-component-radius"]).toBe("0px");
    expect(style["--freeform-background-color"]).not.toContain("position");
  });

  it("keeps cards readable over a bold component surface", () => {
    const properties = {
      designStyle: "form",
      designTreatment: "bold",
      columnStyle: "cards",
    };
    const style = designedCardAppearance(
      properties,
      componentDesignAppearance(properties, form),
    );
    expect(style["--freeform-card-background"]).toBe("#ffffff");
    expect(style["--freeform-card-color"]).toBe("#222222");
  });

  it("uses custom colors directly even after switching from Auto with Bold selected", () => {
    const properties = {
      designStyle: "custom",
      designTreatment: "bold",
      designAccentColor: "#15803d",
      designAccentTextColor: "#ffffff",
      designSurfaceColor: "#dcfce7",
      designTextColor: "#14532d",
    };
    const style = componentDesignAppearance(properties, form);
    expect(style["--freeform-background-color"]).toBe("#dcfce7");
    expect(style["--freeform-text-color"]).toBe("#14532d");
    expect(style["--freeform-button-accent-color"]).toBe("#15803d");
    expect(style["--freeform-button-accent-text-color"]).toBe("#ffffff");
    expect(componentDesignTreatment(properties)).toBe("soft");
    expect(
      componentDesignTreatment({ ...properties, designStyle: "form" }),
    ).toBe("bold");
  });
  it("overrides one setting while global changes continue flowing through the others", () => {
    const properties = updateComponentDesign(
      { designStyle: "form", designOverrides: [] },
      "designAccentColor",
      "#15803d",
    );
    const style = componentDesignAppearance(properties, form);
    expect(style["--freeform-accent-color"]).toBe("#15803d");
    expect(style["--freeform-background-color"]).toBe("#f0f0f0");
    expect(style["--freeform-padding"]).toBe("56px");
    const changed = {
      ...form,
      componentAccentColor: "#aabbcc",
      componentSurfaceColor: "#abcdef",
      componentSpacing: "compact",
    };
    expect(componentDesignAppearance(properties, changed)).toMatchObject({
      "--freeform-accent-color": "#15803d",
      "--freeform-background-color": "#abcdef",
      "--freeform-padding": "16px",
    });
    const reset = updateComponentDesign(
      properties,
      "designAccentColor",
      null,
      true,
    );
    expect(reset.designOverrides).toEqual([]);
    expect(
      componentDesignAppearance(reset, changed)["--freeform-accent-color"],
    ).toBe("#aabbcc");
  });
  it("applies and resets detailed overrides independently of the shared palette", () => {
    let properties = updateComponentDesign(
      { designStyle: "custom", designOverrides: [], columnStyle: "cards" },
      "cardRadiusPreset",
      "twenty",
    );
    properties = updateComponentDesign(properties, "padding", "none");
    const design = componentDesignAppearance(properties, form);
    expect(design["--freeform-padding"]).toBe("0px");
    expect(
      designedCardAppearance(properties, design)["--freeform-card-radius"],
    ).toBe("20px");
    properties = updateComponentDesign(
      properties,
      "cardRadiusPreset",
      null,
      true,
    );
    expect(
      designedCardAppearance(properties, design)["--freeform-card-radius"],
    ).toBe("24px");
    expect(properties.designOverrides).toEqual(["padding"]);
  });
  it("keeps existing custom styles intact when replacing local theme presets with concrete controls", () => {
    const original = {
      designStyle: "custom",
      designAccentColor: "#15803d",
      designAccentTextColor: "#ffffff",
      designSurfaceColor: "#dcfce7",
      designTextColor: "#14532d",
      designSpacing: "spacious",
      designCorners: "rounded",
      columnStyle: "cards",
    };
    const converted = editableComponentDesign(original);
    const before = componentDesignAppearance(original, form);
    const after = componentDesignAppearance(converted, form);
    const renderedSection = (style: Record<string, string>) =>
      Object.fromEntries(
        Object.entries(style).filter(
          ([key]) =>
            ![
              "--freeform-component-body-color",
              "--freeform-component-card-padding",
              "--freeform-component-card-radius",
            ].includes(key),
        ),
      );
    expect(renderedSection(after)).toEqual(renderedSection(before));
    expect(designedCardAppearance(converted, after)).toEqual(
      designedCardAppearance(original, before),
    );
    const resetPadding = updateComponentDesign(
      converted,
      "padding",
      null,
      true,
    );
    const changedForm = {
      ...form,
      componentSpacing: "compact",
      componentCorners: "square",
    };
    const resetStyle = componentDesignAppearance(resetPadding, changedForm);
    expect(resetStyle["--freeform-padding"]).toBe("16px");
    expect(resetStyle["--freeform-component-gap"]).toBe("32px");
    expect(
      designedCardAppearance(resetPadding, resetStyle)[
        "--freeform-card-padding"
      ],
    ).toBe("36px");
  });
  it("keeps section text and corners independent of cards", () => {
    let properties = updateComponentDesign(
      { designStyle: "custom", designOverrides: [], columnStyle: "cards" },
      "sectionRadius",
      5,
    );
    properties = updateComponentDesign(
      properties,
      "sectionRadiusPreset",
      "custom",
    );
    properties = updateComponentDesign(properties, "textColor", "#ffffff");
    const design = componentDesignAppearance(properties, form);
    expect(design["--freeform-component-radius"]).toBe("5px");
    expect(design["--freeform-text-color"]).toBe("#ffffff");
    const cards = designedCardAppearance(properties, design);
    expect(cards["--freeform-card-radius"]).toBe("24px");
    expect(cards["--freeform-card-color"]).toBe("#222222");
  });
});
