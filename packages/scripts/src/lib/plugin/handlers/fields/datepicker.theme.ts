import type { FlatpickrInstance } from "@lib/vendors/flatpickr";

const legacyDarkTemplates = [
  "[data-freeform-basic-dark]",
  "[data-freeform-conversational]",
  "[data-freeform-bootstrap-dark]",
  "[data-freeform-tailwind-dark]",
  '[data-freeform-daisyui][data-theme="dark"]',
].join(",");

export const applyDatepickerTheme = (
  picker: Element,
  instance: FlatpickrInstance,
): void => {
  const explicitTheme = picker
    .closest("[data-freeform-theme]")
    ?.getAttribute("data-freeform-theme");
  const dark =
    explicitTheme === "dark" ||
    (explicitTheme !== "light" && !!picker.closest(legacyDarkTemplates));

  // Flatpickr usually appends the popup to <body>, outside the form's styles.
  instance.calendarContainer?.classList.toggle(
    "freeform-datepicker-dark",
    dark,
  );
};
