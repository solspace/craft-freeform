import { describe, expect, it, vi } from "vitest";
import { locationMappingOptions } from "./fields.mapping";

vi.mock("@ff-client/utils/translations", () => ({
  default: (value: string) => value,
}));

describe("Location integration mapping choices", () => {
  it("preserves the existing field choice and offers address components and code variants", () => {
    const options = locationMappingOptions("location-uid", "Office");
    expect(options).toContainEqual({ value: "location-uid", label: "Office" });
    expect(options).toContainEqual({
      value: "location-uid.city",
      label: "Office — City",
    });
    expect(options).toContainEqual({
      value: "location-uid.countryCode",
      label: "Office — Country Code",
    });
    expect(options).toContainEqual({
      value: "location-uid.stateCode",
      label: "Office — State / Province Code",
    });
    expect(options).toContainEqual({
      value: "location-uid.fullAddress",
      label: "Office — Full Address",
    });
  });

  it("limits choices to included components and removes their code variants when excluded", () => {
    const options = locationMappingOptions("office", "Bureau", [
      "line1",
      "city",
      "country",
      "unknown",
    ]);
    expect(options.map((option) => "value" in option && option.value)).toEqual([
      "office",
      "office.fullAddress",
      "office.line1",
      "office.city",
      "office.country",
      "office.countryCode",
    ]);
    expect(options).toContainEqual({
      value: "office.city",
      label: "Bureau — City",
    });
  });

  it("does not treat an explicitly empty included list as all components", () => {
    expect(locationMappingOptions("office", "Office", [])).toHaveLength(2);
  });
});
