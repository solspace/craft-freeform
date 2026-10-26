import { describe, expect, it } from "vitest";
import {
  editableComponentDesign,
  updateComponentDesign,
} from "./component-design-settings";

describe("component design compatibility", () => {
  it("keeps previous custom themes local while new Custom starts with inherited values", () => {
    const saved = { designStyle: "custom", designAccentColor: "#15803d" };
    expect(editableComponentDesign(saved).designOverrides).toContain(
      "designAccentColor",
    );
    expect(editableComponentDesign(saved).designOverrides).not.toContain(
      "designSpacing",
    );
    expect(saved).toEqual({
      designStyle: "custom",
      designAccentColor: "#15803d",
    });
    const fresh = updateComponentDesign(
      { designStyle: "form", designOverrides: null },
      "designStyle",
      "custom",
    );
    expect(fresh.designOverrides).toEqual([]);
  });
  it("preserves saved individual appearance and converts it only when edited", () => {
    const saved = {
      designStyle: "manual",
      background: "image",
      backgroundImage: [12],
      backgroundColor: "#123456",
      textColor: "#ffffff",
      padding: "large",
      cardRadius: 17,
    };
    const edited = updateComponentDesign(
      saved,
      "cardBorderColor",
      "transparent",
    );
    expect(edited).toMatchObject({
      background: "image",
      backgroundImage: [12],
      padding: "large",
      cardRadius: 17,
      designStyle: "custom",
      textColor: "#ffffff",
      cardBorderColor: "transparent",
    });
    expect(edited.designOverrides).toContain("background");
    expect(saved.designStyle).toBe("manual");
  });
  it("retains local values when toggling Auto and groups detailed values for Reset", () => {
    let properties = updateComponentDesign(
      { designStyle: "form", designOverrides: [] },
      "cardRadius",
      17,
    );
    expect(properties.designOverrides).toEqual(["cardRadiusPreset"]);
    properties = updateComponentDesign(properties, "designStyle", "form");
    properties = updateComponentDesign(properties, "designStyle", "custom");
    expect(properties.cardRadius).toBe(17);
    expect(properties.designOverrides).toEqual(["cardRadiusPreset"]);
    properties = updateComponentDesign(
      properties,
      "cardRadiusPreset",
      null,
      true,
    );
    expect(properties.designOverrides).toEqual([]);
    expect(properties.cardRadius).toBe(17);
  });
});
