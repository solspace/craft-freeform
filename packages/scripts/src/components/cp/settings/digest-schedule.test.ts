import { afterEach, describe, expect, it } from "vitest";
import { initDigestSchedules } from "./digest-schedule";

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const markup = (
  name: string,
  value: string,
  disabled = false,
) => `<div data-digest-schedule data-summary-daily="Every morning" data-summary-weekly="Every {day} morning">
  <div data-digest-controls hidden><button type="button" data-digest-mode="daily">Daily</button><button type="button" data-digest-mode="weekly">Weekly</button>
  <div data-digest-weekly>${days.map((day, index) => `<button type="button" data-digest-day="${index}" data-day-name="${day}">${day}</button>`).join("")}</div><p data-digest-summary></p></div>
  <div data-digest-legacy><select name="${name}" ${disabled ? "disabled" : ""}>${["-1", "0", "1", "2", "3", "4", "5", "6"].map((day) => `<option value="${day}" ${day === value ? "selected" : ""}>${day}</option>`).join("")}</select></div></div>`;
const mount = (value: string, disabled = false) => {
  document.body.innerHTML = `<form>${markup("settings[digestFrequency]", value, disabled)}</form>`;
  initDigestSchedules();
};
const submitted = () =>
  new FormData(document.querySelector("form")!).getAll(
    "settings[digestFrequency]",
  );
afterEach(() => {
  document.body.innerHTML = "";
});

describe("legacy digest schedule values", () => {
  it.each(["-1", "0", "1", "2", "3", "4", "5", "6"])(
    "keeps the existing %s value and submits it exactly once",
    (value) => {
      mount(value);
      expect(submitted()).toEqual([value]);
      expect(
        document.querySelector<HTMLElement>("[data-digest-weekly]")!.hidden,
      ).toBe(value === "-1");
      expect(document.querySelector("[data-digest-summary]")!.textContent).toBe(
        value === "-1"
          ? "Every morning"
          : `Every ${days[Number(value)]} morning`,
      );
    },
  );

  it("remembers the weekly day when switching to daily and back", () => {
    mount("3");
    document
      .querySelector<HTMLButtonElement>('[data-digest-mode="daily"]')!
      .click();
    expect(submitted()).toEqual(["-1"]);
    document
      .querySelector<HTMLButtonElement>('[data-digest-mode="weekly"]')!
      .click();
    expect(submitted()).toEqual(["3"]);
    document.querySelector<HTMLButtonElement>('[data-digest-day="0"]')!.click();
    expect(submitted()).toEqual(["0"]);
    expect(
      document
        .querySelector('[data-digest-day="0"]')!
        .getAttribute("aria-pressed"),
    ).toBe("true");
  });

  it("keeps developer and stats schedules independent", () => {
    document.body.innerHTML = `<form>${markup("settings[digestFrequency]", "1")}${markup("settings[clientDigestFrequency]", "5")}</form>`;
    initDigestSchedules();
    document
      .querySelector<HTMLButtonElement>('[data-digest-mode="daily"]')!
      .click();
    const data = new FormData(document.querySelector("form")!);
    expect(data.get("settings[digestFrequency]")).toBe("-1");
    expect(data.get("settings[clientDigestFrequency]")).toBe("5");
  });

  it("preserves read-only values without submitting disabled controls", () => {
    mount("2", true);
    document
      .querySelector<HTMLButtonElement>('[data-digest-mode="daily"]')!
      .click();
    expect(document.querySelector("select")!.value).toBe("2");
    expect(submitted()).toEqual([]);
    expect(
      Array.from(document.querySelectorAll("button")).every(
        (button) => button.disabled,
      ),
    ).toBe(true);
  });
});
