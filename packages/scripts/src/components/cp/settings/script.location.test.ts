import { afterEach, describe, expect, it } from "vitest";
import { initScriptInsertLocation } from "./script.location";

const mount = (selected = "footer", disabled = false) => {
  document.body.innerHTML = `<form><fieldset id="script-insert-location-field">
    ${["footer", "header", "form", "manual"].map((value) => `<input type="radio" name="settings[scriptInsertLocation]" value="${value}" ${selected === value ? "checked" : ""} ${disabled ? "disabled" : ""}>`).join("")}
    <p data-script-insert-warning hidden>Load Freeform’s scripts manually.</p>
  </fieldset></form>`;
  initScriptInsertLocation();
  return document.querySelector<HTMLElement>("[data-script-insert-warning]")!;
};
const choose = (value: string) => {
  const radio = document.querySelector<HTMLInputElement>(
    `input[value="${value}"]`,
  )!;
  radio.checked = true;
  radio.dispatchEvent(new Event("change", { bubbles: true }));
};
const submittedLocation = () =>
  new FormData(document.querySelector("form")!).get(
    "settings[scriptInsertLocation]",
  );

afterEach(() => {
  document.body.innerHTML = "";
});

describe("script insert location cards", () => {
  it("shows a single warning for manual insertion and submits its existing value", () => {
    const warning = mount();
    expect(warning.hidden).toBe(true);
    choose("manual");
    choose("manual");
    expect(warning.hidden).toBe(false);
    expect(
      document.querySelectorAll("[data-script-insert-warning]"),
    ).toHaveLength(1);
    expect(submittedLocation()).toBe("manual");
  });

  it.each(["footer", "header", "form"])(
    "hides the manual warning when %s is selected and submits that value",
    (location) => {
      const warning = mount("manual");
      expect(warning.hidden).toBe(false);
      choose(location);
      expect(warning.hidden).toBe(true);
      expect(submittedLocation()).toBe(location);
    },
  );

  it("preserves a read-only selection without submitting disabled controls", () => {
    const warning = mount("manual", true);
    expect(warning.hidden).toBe(false);
    expect(document.querySelectorAll("input:disabled")).toHaveLength(4);
    expect(submittedLocation()).toBeNull();
  });

  it("does nothing on other settings pages", () => {
    expect(() => initScriptInsertLocation()).not.toThrow();
  });
});
