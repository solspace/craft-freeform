// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { formatDateTime, parseDateTime } from "./format.js";
import { type DateTimePickerConfig, mountDateTimePicker } from "./picker.js";

let picker: ReturnType<typeof mountDateTimePicker> | undefined;
beforeEach(() => {
  document.body.innerHTML =
    '<form><label for="appointment">Appointment</label><input id="appointment" name="appointment" placeholder="Your date"><button>Submit</button></form>';
});
afterEach(() => {
  picker?.destroy();
  picker = undefined;
  document.body.replaceChildren();
  vi.restoreAllMocks();
  vi.useRealTimers();
});
function setup(
  config: DateTimePickerConfig = {},
  value = "2026-10-26 4:35 PM",
) {
  const input = document.querySelector("input")!;
  input.value = value;
  const change = vi.fn();
  picker = mountDateTimePicker(
    input,
    { format: "Y-m-d g:i A", locale: "en-US", ...config },
    change,
  );
  picker.open();
  return {
    input,
    change,
    popup: document.querySelector<HTMLElement>(".ff-datetime-picker")!,
  };
}
const click = (selector: string) =>
  document.querySelector<HTMLButtonElement>(selector)!.click();
const key = (element: Element, key: string) =>
  element.dispatchEvent(
    new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }),
  );
it.each(["frontend", "control-panel"] as const)(
  "keeps date/time behavior identical with the %s appearance",
  (appearance) => {
    const { input, popup, change } = setup({
      appearance,
      minuteStep: 15,
      minDate: "2026-10-25",
      maxDate: "2026-10-27",
    });
    expect(popup.dataset.appearance).toBe(appearance);
    expect(
      popup.querySelector<HTMLButtonElement>('[data-day="2026-10-24"]')!
        .disabled,
    ).toBe(true);
    click('[data-day="2026-10-27"]');
    click('[data-time="1020"]');
    expect(input.value).toBe("2026-10-27 5:00 PM");
    expect(change).toHaveBeenLastCalledWith("2026-10-27 5:00 PM");
    expect(popup.hidden).toBe(true);
  },
);
it.each([
  "Y-m-d g:i A",
  "d/m/Y H:i",
  "m.d.y h-i a",
  "j n Y g iA",
  "YmdHi",
  "Y-m-d\\TH:i",
])("round-trips configured PHP format %s", (format) => {
  const date = new Date(2026, 9, 26, 16, 35);
  const value = formatDateTime(date, format);
  expect(parseDateTime(value, format)?.getTime()).toBe(date.getTime());
});
it.each(["2026-02-29", "2026-04-31", "2026-13-10", "2026-10-00", "garbage"])(
  "does not normalize invalid manual dates: %s",
  (value) => expect(parseDateTime(value, "Y-m-d")).toBeNull(),
);
it("preserves manual text, placeholder, input identity and off-interval initial times", () => {
  const { input, popup } = setup({ minuteStep: 30 });
  expect(input.value).toBe("2026-10-26 4:35 PM");
  expect(input.name).toBe("appointment");
  expect(input.placeholder).toBe("Your date");
  expect(popup.querySelector('[data-time="995"]')?.textContent).toBe("4:35 PM");
  expect(popup.querySelector('[data-time="1020"]')?.textContent).toBe(
    "5:00 PM",
  );
  input.value = "invalid";
  picker!.open();
  expect(input.value).toBe("invalid");
});
it("disables dates outside inclusive minimum and maximum bounds", () => {
  const { input, change, popup } = setup(
    {
      minDate: "2026-10-25",
      maxDate: "2026-10-27",
      enableTime: false,
      format: "Y-m-d",
    },
    "2026-10-26",
  );
  for (const date of ["2026-10-24", "2026-10-28"])
    expect(
      popup.querySelector<HTMLButtonElement>(`[data-day="${date}"]`)?.disabled,
    ).toBe(true);
  click('[data-day="2026-10-27"]');
  expect(input.value).toBe("2026-10-27");
  expect(change).toHaveBeenCalledWith("2026-10-27");
  expect(popup.hidden).toBe(true);
});
it("keeps dates and times together without changing the configured format", () => {
  const { input } = setup({ minuteStep: 15 });
  click('[data-day="2026-10-27"]');
  expect(input.value).toBe("2026-10-27 4:35 PM");
  click('[data-time="1020"]');
  expect(input.value).toBe("2026-10-27 5:00 PM");
});
it("renders date-only and time-only variants with their own formats and clock settings", () => {
  const { input, popup } = setup(
    {
      enableDate: false,
      enableTime: true,
      clock24h: true,
      minuteStep: 5,
      format: "H:i",
    },
    "16:35",
  );
  expect(popup.querySelector('[role="grid"]')).toBeNull();
  expect(popup.querySelector('[data-time="1000"]')?.textContent).toBe("16:40");
  click('[data-time="1000"]');
  expect(input.value).toBe("16:40");
});
it("searches years, limits them to bounds and navigates without changing the saved value", () => {
  const { input, popup } = setup({
    minDate: "2025-03-01",
    maxDate: "2027-06-30",
  });
  click("[data-picker-year]");
  const search = popup.querySelector<HTMLInputElement>('input[type="search"]')!;
  search.value = "2027";
  search.dispatchEvent(new Event("input"));
  expect(popup.querySelectorAll(".ff-datetime-option")).toHaveLength(1);
  key(search, "Enter");
  expect(input.value).toBe("2026-10-26 4:35 PM");
  expect(popup.querySelector("[data-picker-month]")?.textContent).toBe("June");
  expect(popup.querySelector("[data-picker-year]")?.textContent).toBe("2027");
  expect(
    popup.querySelector<HTMLButtonElement>('[aria-label="Next month"]')
      ?.disabled,
  ).toBe(true);
});
it("uses the forced locale for month and weekday names", () => {
  const { popup } = setup({ locale: "fr-FR" });
  expect(popup.querySelector("[data-picker-month]")?.textContent).toBe(
    "octobre",
  );
  expect(popup.querySelector(".ff-datetime-weekday")?.textContent).toBe("lun.");
});
it("supports keyboard date navigation and Escape without submitting the form", () => {
  const { input, popup } = setup(
    { enableTime: false, format: "Y-m-d" },
    "2026-10-26",
  );
  expect(key(input, "ArrowDown")).toBe(false);
  expect(document.activeElement?.getAttribute("data-day")).toBe("2026-10-26");
  key(document.activeElement!, "ArrowRight");
  expect(document.activeElement?.getAttribute("data-day")).toBe("2026-10-27");
  key(document.activeElement!, "Escape");
  expect(popup.hidden).toBe(true);
  expect(document.activeElement).toBe(input);
});
it("clears through normal input/change events, restores on reset, and leaves invalid text alone", async () => {
  const { input, popup, change } = setup();
  const listener = vi.fn();
  input.addEventListener("change", listener);
  const clear = Array.from(popup.querySelectorAll("button")).find(
    (e) => e.textContent === "Clear",
  )!;
  clear.click();
  expect(input.value).toBe("");
  expect(change).toHaveBeenCalledWith("");
  expect(listener).toHaveBeenCalledTimes(1);
  input.defaultValue = "2026-10-26 4:35 PM";
  input.form!.reset();
  await Promise.resolve();
  expect(input.value).toBe("2026-10-26 4:35 PM");
  expect(popup.hidden).toBe(true);
});
it("does not open disabled or readonly inputs and cleans up removed fields", async () => {
  const { input, popup } = setup();
  picker!.close();
  input.readOnly = true;
  picker!.open();
  expect(popup.hidden).toBe(true);
  input.readOnly = false;
  input.disabled = true;
  picker!.open();
  expect(popup.hidden).toBe(true);
  input.disabled = false;
  input.remove();
  await Promise.resolve();
  expect(document.querySelector(".ff-datetime-picker")).toBeNull();
});
it("reuses its controller and restores original accessibility attributes on destroy", () => {
  const { input } = setup();
  expect(mountDateTimePicker(input)).toBe(picker);
  picker!.destroy();
  expect(input.getAttribute("role")).toBeNull();
  expect(input.getAttribute("aria-controls")).toBeNull();
  expect(document.querySelector(".ff-datetime-picker")).toBeNull();
});
it("follows explicit template themes and keeps two fields independent", () => {
  const { input, popup } = setup();
  input.form!.dataset.freeformTheme = "dark";
  picker!.open();
  expect(popup.dataset.theme).toBe("dark");
  input.form!.dataset.freeformTheme = "light";
  picker!.open();
  expect(popup.dataset.theme).toBe("light");
  const second = document.createElement("input");
  input.form!.append(second);
  const controller = mountDateTimePicker(second, {
    format: "Y-m-d",
    enableTime: false,
  });
  controller.open();
  expect(document.querySelectorAll(".ff-datetime-picker")).toHaveLength(2);
  expect(input.value).toBe("2026-10-26 4:35 PM");
  controller.destroy();
});

it("re-evaluates relative today bounds when the popup is reopened on another day", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 9, 26, 12));
  const { popup } = setup(
    { minDate: "today", maxDate: "today", enableTime: false, format: "Y-m-d" },
    "",
  );
  expect(
    popup.querySelector<HTMLButtonElement>('[data-day="2026-10-26"]')?.disabled,
  ).toBe(false);
  vi.setSystemTime(new Date(2026, 9, 27, 12));
  picker!.open();
  expect(
    popup.querySelector<HTMLButtonElement>('[data-day="2026-10-26"]')?.disabled,
  ).toBe(true);
  expect(
    popup.querySelector<HTMLButtonElement>('[data-day="2026-10-27"]')?.disabled,
  ).toBe(false);
});
it("updates the open calendar when a valid date is typed manually", () => {
  const { input, popup } = setup();
  input.value = "2027-02-12 9:15 AM";
  input.dispatchEvent(new Event("input", { bubbles: true }));
  expect(popup.querySelector("[data-picker-month]")?.textContent).toBe(
    "February",
  );
  expect(
    popup
      .querySelector('[data-day="2027-02-12"]')
      ?.getAttribute("aria-selected"),
  ).toBe("true");
});

it("disables times before a precise minimum without silently replacing invalid input", () => {
  const { input, popup, change } = setup(
    { minDate: "2026-10-26T07:00:00" },
    "2026-10-26 2:00 AM",
  );
  expect(
    popup.querySelector<HTMLButtonElement>('[data-time="120"]')?.disabled,
  ).toBe(true);
  expect(
    popup.querySelector<HTMLButtonElement>('[data-time="420"]')?.disabled,
  ).toBe(false);
  expect(
    popup.querySelector<HTMLButtonElement>('[data-day="2026-10-26"]')?.disabled,
  ).toBe(false);
  expect(
    popup.querySelector<HTMLButtonElement>('[data-day="2026-10-25"]')?.disabled,
  ).toBe(true);
  key(input, "Enter");
  expect(input.value).toBe("2026-10-26 2:00 AM");
  expect(change).not.toHaveBeenCalled();
  expect(popup.hidden).toBe(false);
  click('[data-time="420"]');
  expect(input.value).toBe("2026-10-26 7:00 AM");
});
it.each([
  ["2026-10-26T07:00:00", 420, false],
  ["2026-10-26T07:00:00", 450, true],
  ["2026-10-26", 1410, false],
  ["today", 1410, false],
] as const)("enforces maximum %s at minute %s", (maxDate, minute, disabled) => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 9, 26, 19));
  const { popup } = setup({ maxDate }, "2026-10-26 7:00 AM");
  expect(
    popup.querySelector<HTMLButtonElement>(`[data-time="${minute}"]`)?.disabled,
  ).toBe(disabled);
});
it("uses whole days for date-only fields even when the bound includes a time", () => {
  const { input } = setup(
    {
      minDate: "2026-10-26T07:00:00",
      maxDate: "2026-10-26T07:00:00",
      enableTime: false,
      format: "Y-m-d",
    },
    "2026-10-26",
  );
  click('[data-day="2026-10-26"]');
  expect(input.value).toBe("2026-10-26");
});
it("advances relative cutoffs using the site's reference clock across visitor timezones and page-load delays", () => {
  vi.useFakeTimers();
  const serverTimestamp = Date.UTC(2026, 9, 27, 0);
  vi.setSystemTime(serverTimestamp + 15 * 60000);
  const { popup } = setup(
    {
      minDate: "2026-10-26T07:00:00",
      minDateOffset: -43200,
      referenceDate: "2026-10-26T19:00:00",
      referenceTimestamp: serverTimestamp / 1000,
    },
    "2026-10-26 7:30 AM",
  );
  expect(
    popup.querySelector<HTMLButtonElement>('[data-time="420"]')?.disabled,
  ).toBe(true);
  expect(
    popup.querySelector<HTMLButtonElement>('[data-time="450"]')?.disabled,
  ).toBe(false);
  picker!.close();
  vi.setSystemTime(serverTimestamp + 75 * 60000);
  picker!.open();
  expect(
    popup.querySelector<HTMLButtonElement>('[data-time="480"]')?.disabled,
  ).toBe(true);
  expect(
    popup.querySelector<HTMLButtonElement>('[data-time="510"]')?.disabled,
  ).toBe(false);
});
it("rounds a minimum with seconds up to the first selectable minute", () => {
  const { popup, input } = setup(
    { minDate: "2026-10-26T07:00:30" },
    "2026-10-26 7:00 AM",
  );
  expect(
    popup.querySelector<HTMLButtonElement>('[data-time="420"]')?.disabled,
  ).toBe(true);
  expect(
    popup.querySelector<HTMLButtonElement>('[data-time="421"]')?.disabled,
  ).toBe(false);
  click('[data-time="421"]');
  expect(input.value).toBe("2026-10-26 7:01 AM");
});
it("allows navigating to a month whose last day has an afternoon minimum", () => {
  const { popup } = setup(
    { minDate: "2026-10-31T19:00:00" },
    "2026-11-01 7:00 PM",
  );
  const previous = popup.querySelector<HTMLButtonElement>(
    '[aria-label="Previous month"]',
  )!;
  expect(previous.disabled).toBe(false);
  previous.click();
  expect(
    popup.querySelector<HTMLButtonElement>('[data-day="2026-10-31"]')?.disabled,
  ).toBe(false);
});
it("keeps time keyboard navigation within the allowed interval", () => {
  const { popup, input } = setup(
    { minDate: "2026-10-26T07:00:00", maxDate: "2026-10-26T08:00:00" },
    "2026-10-26 7:30 AM",
  );
  const middle = popup.querySelector<HTMLButtonElement>('[data-time="450"]')!;
  key(middle, "Home");
  expect(document.activeElement?.getAttribute("data-time")).toBe("420");
  key(document.activeElement!, "ArrowUp");
  expect(document.activeElement?.getAttribute("data-time")).toBe("480");
  key(document.activeElement!, "End");
  expect(document.activeElement?.getAttribute("data-time")).toBe("480");
  expect(input.value).toBe("2026-10-26 7:30 AM");
});
