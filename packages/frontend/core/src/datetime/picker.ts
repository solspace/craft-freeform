import { formatDateTime, parseDateTime } from "./format.js";

export type DateTimePickerConfig = {
  appearance?: "frontend" | "control-panel";
  format?: string;
  enableDate?: boolean;
  enableTime?: boolean;
  clock24h?: boolean;
  locale?: string | null;
  minuteStep?: number;
  openOnFocus?: boolean;
  minDate?: string | null;
  maxDate?: string | null;
  referenceDate?: string | null;
  referenceTimestamp?: number | null;
  minDateOffset?: number | null;
  maxDateOffset?: number | null;
  labels?: Partial<
    Record<
      | "previous"
      | "next"
      | "month"
      | "year"
      | "searchMonths"
      | "searchYears"
      | "time"
      | "today"
      | "clear"
      | "noResults"
      | "chooseDate",
      string
    >
  >;
};
const instances = new WeakMap<
  HTMLInputElement,
  ReturnType<typeof createPicker>
>();
let sequence = 0;
export function mountDateTimePicker(
  input: HTMLInputElement,
  config: DateTimePickerConfig = {},
  onChange?: (value: string) => void,
) {
  const existing = instances.get(input);
  if (existing) return existing;
  const controller = createPicker(input, config, onChange);
  instances.set(input, controller);
  return controller;
}
function createPicker(
  input: HTMLInputElement,
  config: DateTimePickerConfig,
  onChange?: (value: string) => void,
) {
  const labels = {
    previous: "Previous month",
    next: "Next month",
    month: "Month",
    year: "Year",
    searchMonths: "Search months…",
    searchYears: "Search years…",
    time: "Time",
    today: "Today",
    clear: "Clear",
    noResults: "No matches found.",
    chooseDate: "Choose date and time",
    ...config.labels,
  };
  const doc = input.ownerDocument,
    win = doc.defaultView!;
  const id = `ff-datetime-${++sequence}`;
  const dateEnabled = config.enableDate !== false,
    timeEnabled = config.enableTime !== false;
  const format =
    config.format ||
    (dateEnabled ? `Y-m-d${timeEnabled ? " g:i A" : ""}` : "g:i A");
  const step = [1, 5, 10, 15, 30, 60].includes(config.minuteStep ?? 30)
    ? (config.minuteStep ?? 30)
    : 30;
  let locale = config.locale || doc.documentElement.lang || "en";
  try {
    new Intl.DateTimeFormat(locale);
  } catch {
    locale = "en";
  }
  const monthName = new Intl.DateTimeFormat(locale, { month: "long" });
  const weekdayName = new Intl.DateTimeFormat(locale, { weekday: "short" });
  const fullDate = new Intl.DateTimeFormat(locale, { dateStyle: "full" });
  const weekStart = (() => {
    try {
      const language = new Intl.Locale(locale) as Intl.Locale & {
        weekInfo?: { firstDay: number };
        getWeekInfo?: () => { firstDay: number };
      };
      return (
        (language.getWeekInfo?.().firstDay ??
          language.weekInfo?.firstDay ??
          1) % 7
      );
    } catch {
      return 1;
    }
  })();
  const referenceAt =
    typeof config.referenceTimestamp === "number" &&
    Number.isFinite(config.referenceTimestamp)
      ? config.referenceTimestamp * 1000
      : Date.now();
  const reference = config.referenceDate
    ? parseDateTime(config.referenceDate, "Y-m-d\\TH:i:s")
    : null;
  // Values are wall-clock dates in the form's timezone. Advance the server's
  // reference clock rather than interpreting relative limits in the visitor's zone.
  const now = () =>
    reference
      ? new Date(reference.getTime() + Date.now() - referenceAt)
      : new Date();
  const precision = format.replace(/\\./g, "").includes("s") ? 1000 : 60000;
  const boundary = (
    value: string | null | undefined,
    maximum: boolean,
    offset?: number | null,
  ) => {
    if (timeEnabled && typeof offset === "number" && Number.isFinite(offset)) {
      const date = now();
      date.setSeconds(date.getSeconds() + offset, 0);
      return date;
    }
    const date =
      value === "today"
        ? now()
        : value
          ? parseDateTime(value, "Y-m-d\\TH:i:s", now()) ||
            parseDateTime(value, "Y-m-d\\TH:i", now()) ||
            parseDateTime(value, "Y-m-d", now())
          : null;
    if (date && (!timeEnabled || !value?.includes("T"))) {
      date.setHours(maximum ? 23 : 0, maximum ? 59 : 0, maximum ? 59 : 0, 0);
    }
    return date;
  };
  const atMidnight = (date: Date) => {
    const copy = new Date(date);
    copy.setHours(0, 0, 0, 0);
    return copy;
  };
  let min = boundary(config.minDate, false, config.minDateOffset),
    max = boundary(config.maxDate, true, config.maxDateOffset);
  const refreshBounds = () => {
    min = boundary(config.minDate, false, config.minDateOffset);
    max = boundary(config.maxDate, true, config.maxDateOffset);
  };
  const firstValue = () =>
    min ? Math.ceil(min.getTime() / precision) * precision : -Infinity;
  const lastValue = () =>
    max ? Math.floor(max.getTime() / precision) * precision : Infinity;
  const allowed = (date: Date) =>
    (!min || date >= min) && (!max || date <= max);
  const allowedDay = (date: Date) => {
    const start = atMidnight(date).getTime();
    const end = new Date(date);
    end.setHours(23, 59, 59, 0);
    return (
      Math.max(start, firstValue()) <= Math.min(end.getTime(), lastValue())
    );
  };
  const clamp = (date: Date) => {
    const value =
      parseDateTime(formatDateTime(date, format), format, date) || date;
    return new Date(
      Math.max(firstValue(), Math.min(value.getTime(), lastValue())),
    );
  };
  const readValue = (value: string) => parseDateTime(value, format, now());
  let selected = readValue(input.value);
  let active = clamp(selected ? new Date(selected) : now());
  let view = new Date(active.getFullYear(), active.getMonth(), 1);
  let writing = false;
  let opened = false,
    skipFocus = false,
    destroyed = false;
  const original = new Map(
    [
      "role",
      "aria-haspopup",
      "aria-expanded",
      "aria-controls",
      "autocomplete",
    ].map((name) => [name, input.getAttribute(name)]),
  );
  const popup = doc.createElement("div");
  popup.id = id;
  popup.className = "ff-datetime-picker";
  popup.dataset.appearance =
    config.appearance === "control-panel" ? "control-panel" : "frontend";
  popup.hidden = true;
  popup.setAttribute("role", "dialog");
  popup.setAttribute(
    "aria-label",
    input.getAttribute("aria-label") ||
      input.labels?.[0]?.textContent?.trim() ||
      labels.chooseDate,
  );
  popup.dataset.hasDate = String(dateEnabled);
  popup.dataset.hasTime = String(timeEnabled);
  input.setAttribute("role", "combobox");
  input.setAttribute("aria-haspopup", "dialog");
  input.setAttribute("aria-controls", id);
  input.setAttribute("aria-expanded", "false");
  input.autocomplete = "off";
  doc.body.append(popup);
  const node = <T extends keyof HTMLElementTagNameMap>(
    tag: T,
    className: string,
    text?: string,
  ) => {
    const element = doc.createElement(tag);
    element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };
  const button = (text: string, className: string, action: () => void) => {
    const element = node("button", className, text);
    element.type = "button";
    element.addEventListener("click", action);
    return element;
  };
  const position = () => {
    if (!opened) return;
    const bounds = input.getBoundingClientRect(),
      box = popup.getBoundingClientRect();
    const width = doc.documentElement.clientWidth || win.innerWidth;
    const height = win.innerHeight;
    const below = height - bounds.bottom - 8,
      above = bounds.top - 8;
    popup.style.left = `${Math.max(8, Math.min(bounds.left, width - box.width - 8))}px`;
    const top =
      below < box.height && above > below
        ? Math.max(8, bounds.top - box.height - 6)
        : bounds.bottom + 6;
    popup.style.top = `${Math.max(8, Math.min(top, height - Math.min(box.height, height - 16) - 8))}px`;
    popup.style.maxHeight = `${Math.max(100, height - 16)}px`;
  };
  const theme = () => {
    const explicit = input
      .closest("[data-freeform-theme]")
      ?.getAttribute("data-freeform-theme");
    const dark =
      explicit === "dark" ||
      (explicit !== "light" &&
        !!input.closest(
          '[data-freeform-basic-dark],[data-freeform-conversational],[data-freeform-bootstrap-dark],[data-freeform-tailwind-dark],[data-theme="dark"],[data-bs-theme="dark"]',
        ));
    popup.dataset.theme = dark ? "dark" : "light";
    popup.style.fontFamily = win.getComputedStyle(input).fontFamily;
  };
  const close = (restoreFocus = false) => {
    if (!opened) return;
    opened = false;
    popup.hidden = true;
    input.setAttribute("aria-expanded", "false");
    if (restoreFocus) {
      skipFocus = true;
      input.focus();
      skipFocus = false;
    }
  };
  const commit = (date: Date | null, finish = false) => {
    if (input.disabled || input.readOnly || input.matches(":disabled"))
      return close();
    refreshBounds();
    const value = date
      ? parseDateTime(formatDateTime(date, format), format, date)
      : null;
    if (date && (!value || !allowed(value))) {
      active = clamp(active);
      render();
      return;
    }
    selected = value;
    if (value) active = new Date(value);
    input.value = value ? formatDateTime(value, format) : "";
    writing = true;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    writing = false;
    onChange?.(input.value);
    if (finish) close(true);
    else render();
  };
  let menu: HTMLElement | null = null;
  const chooseMenu = (trigger: HTMLButtonElement, kind: "month" | "year") => {
    if (menu) {
      const same = trigger.getAttribute("aria-expanded") === "true";
      menu.remove();
      menu = null;
      popup.querySelectorAll('[aria-haspopup="listbox"]').forEach((e) => {
        e.setAttribute("aria-expanded", "false");
      });
      if (same) return;
    }
    const container = node("div", "ff-datetime-menu");
    menu = container;
    const search = node("input", "ff-datetime-search");
    search.type = "search";
    search.placeholder =
      kind === "year" ? labels.searchYears : labels.searchMonths;
    search.setAttribute("role", "combobox");
    search.setAttribute("aria-label", search.placeholder);
    search.setAttribute("aria-expanded", "true");
    search.setAttribute("aria-autocomplete", "list");
    const list = node("div", "ff-datetime-options");
    list.id = `${id}-${kind}-options`;
    list.setAttribute("role", "listbox");
    list.setAttribute("aria-label", labels[kind]);
    search.setAttribute("aria-controls", list.id);
    trigger.setAttribute("aria-expanded", "true");
    const current = kind === "year" ? view.getFullYear() : view.getMonth();
    const firstYear =
      min?.getFullYear() ?? Math.min(1900, view.getFullYear() - 100);
    const lastYear =
      max?.getFullYear() ?? Math.max(2100, view.getFullYear() + 100);
    const options =
      kind === "year"
        ? Array.from(
            { length: Math.min(10000, Math.max(0, lastYear - firstYear + 1)) },
            (_, i) => ({ value: firstYear + i, label: String(firstYear + i) }),
          )
        : Array.from({ length: 12 }, (_, i) => ({
            value: i,
            label: monthName.format(new Date(2024, i, 1)),
          }));
    let optionIndex = 0,
      visible: HTMLButtonElement[] = [];
    const activate = (index: number, scroll = true) => {
      optionIndex = Math.max(0, Math.min(index, visible.length - 1));
      visible.forEach((e, i) => {
        e.dataset.active = String(i === optionIndex);
      });
      const item = visible[optionIndex];
      if (item) {
        search.setAttribute("aria-activedescendant", item.id);
        if (scroll) item.scrollIntoView?.({ block: "nearest" });
      } else search.removeAttribute("aria-activedescendant");
    };
    const fill = () => {
      list.replaceChildren();
      visible = [];
      const query = search.value.trim().toLocaleLowerCase();
      for (const option of options.filter((option) =>
        option.label.toLocaleLowerCase().includes(query),
      )) {
        const candidate =
          kind === "year"
            ? new Date(option.value, view.getMonth(), 1)
            : new Date(view.getFullYear(), option.value, 1);
        const last = new Date(
          candidate.getFullYear(),
          candidate.getMonth() + 1,
          0,
        );
        last.setHours(23, 59, 59, 0);
        // A year may still contain allowed months even when this month is excluded.
        const disabled =
          kind === "month" &&
          ((!min ? false : last < min) || (!max ? false : candidate > max));
        const item = button(option.label, "ff-datetime-option", () => {
          if (disabled) return;
          view = candidate;
          if (min && view < new Date(min.getFullYear(), min.getMonth(), 1))
            view = new Date(min.getFullYear(), min.getMonth(), 1);
          if (max && view > max)
            view = new Date(max.getFullYear(), max.getMonth(), 1);
          render();
          popup
            .querySelector<HTMLButtonElement>(`[data-picker-${kind}]`)
            ?.focus();
        });
        if (option.value === current) {
          const check = node("span", "ff-datetime-check", "✓");
          check.setAttribute("aria-hidden", "true");
          item.append(check);
        }
        item.id = `${id}-${kind}-${option.value}`;
        item.tabIndex = -1;
        item.disabled = disabled;
        item.setAttribute("role", "option");
        item.setAttribute("aria-selected", String(option.value === current));
        item.addEventListener("mousedown", (e) => e.preventDefault());
        list.append(item);
        if (!disabled) visible.push(item);
      }
      if (!list.children.length) {
        const empty = node("p", "ff-datetime-empty", labels.noResults);
        empty.setAttribute("role", "status");
        list.append(empty);
      }
      activate(
        Math.max(
          0,
          visible.findIndex((e) => e.getAttribute("aria-selected") === "true"),
        ),
        false,
      );
    };
    search.addEventListener("input", fill);
    search.addEventListener("keydown", (event) => {
      if (
        ["ArrowDown", "ArrowUp", "Home", "End", "Enter", "Escape"].includes(
          event.key,
        )
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
      if (event.key === "ArrowDown")
        activate((optionIndex + 1) % visible.length);
      if (event.key === "ArrowUp")
        activate((optionIndex + visible.length - 1) % visible.length);
      if (event.key === "Home") activate(0);
      if (event.key === "End") activate(visible.length - 1);
      if (event.key === "Enter") visible[optionIndex]?.click();
      if (event.key === "Escape") {
        container.remove();
        menu = null;
        trigger.setAttribute("aria-expanded", "false");
        trigger.focus();
      }
    });
    container.append(search, list);
    trigger.parentElement!.append(container);
    fill();
    position();
    search.focus();
    visible[optionIndex]?.scrollIntoView?.({ block: "nearest" });
  };
  const changeMonth = (amount: number) => {
    view = new Date(view.getFullYear(), view.getMonth() + amount, 1);
    render();
  };
  const focusDay = () =>
    popup.querySelector<HTMLButtonElement>('[data-day][tabindex="0"]')?.focus();
  const render = () => {
    refreshBounds();
    active = clamp(active);
    menu = null;
    popup.replaceChildren();
    if (dateEnabled) {
      const calendar = node("div", "ff-datetime-calendar");
      const header = node("div", "ff-datetime-header");
      const previous = button("‹", "ff-datetime-nav", () => changeMonth(-1));
      previous.setAttribute("aria-label", labels.previous);
      const previousEnd = new Date(
        view.getFullYear(),
        view.getMonth(),
        0,
        23,
        59,
        59,
      );
      previous.disabled = !!min && previousEnd < min;
      const monthBox = node("div", "ff-datetime-select ff-datetime-month");
      const month = button(monthName.format(view), "ff-datetime-trigger", () =>
        chooseMenu(month, "month"),
      );
      month.dataset.pickerMonth = "";
      month.setAttribute(
        "aria-label",
        `${labels.month}: ${monthName.format(view)}`,
      );
      const yearBox = node("div", "ff-datetime-select ff-datetime-year");
      const year = button(
        String(view.getFullYear()),
        "ff-datetime-trigger",
        () => chooseMenu(year, "year"),
      );
      year.dataset.pickerYear = "";
      year.setAttribute("aria-label", `${labels.year}: ${view.getFullYear()}`);
      for (const trigger of [month, year]) {
        trigger.setAttribute("aria-haspopup", "listbox");
        trigger.setAttribute("aria-expanded", "false");
      }
      monthBox.append(month);
      yearBox.append(year);
      const next = button("›", "ff-datetime-nav", () => changeMonth(1));
      next.setAttribute("aria-label", labels.next);
      next.disabled =
        !!max && new Date(view.getFullYear(), view.getMonth() + 1, 1) > max;
      header.append(previous, monthBox, yearBox, next);
      calendar.append(header);
      const days = node("div", "ff-datetime-days");
      days.setAttribute("role", "grid");
      days.setAttribute(
        "aria-label",
        `${monthName.format(view)} ${view.getFullYear()}`,
      );
      const names = node("div", "ff-datetime-week");
      names.setAttribute("role", "row");
      for (let i = 0; i < 7; i++) {
        const name = node(
          "span",
          "ff-datetime-weekday",
          weekdayName.format(new Date(2024, 0, 7 + ((i + weekStart) % 7))),
        );
        name.setAttribute("role", "columnheader");
        names.append(name);
      }
      days.append(names);
      const start = new Date(view);
      start.setDate(1 - ((start.getDay() - weekStart + 7) % 7));
      for (let week = 0; week < 6; week++) {
        const row = node("div", "ff-datetime-week");
        row.setAttribute("role", "row");
        for (let day = 0; day < 7; day++) {
          const date = new Date(start);
          date.setDate(start.getDate() + week * 7 + day);
          const cell = button(String(date.getDate()), "ff-datetime-day", () => {
            const picked = new Date(date);
            picked.setHours(active.getHours(), active.getMinutes(), 0, 0);
            commit(clamp(picked), !timeEnabled);
            if (timeEnabled)
              popup
                .querySelector<HTMLButtonElement>('[data-time][tabindex="0"]')
                ?.focus();
          });
          cell.dataset.day = formatDateTime(date, "Y-m-d");
          cell.setAttribute("role", "gridcell");
          cell.setAttribute("aria-label", fullDate.format(date));
          cell.disabled = !allowedDay(date);
          cell.dataset.outside = String(date.getMonth() !== view.getMonth());
          cell.dataset.today = String(
            atMidnight(date).getTime() === atMidnight(now()).getTime(),
          );
          cell.setAttribute(
            "aria-selected",
            String(
              !!selected && atMidnight(selected).getTime() === date.getTime(),
            ),
          );
          cell.tabIndex =
            atMidnight(active).getTime() === date.getTime() ? 0 : -1;
          cell.addEventListener("keydown", (event) => {
            const moves: Record<string, number> = {
              ArrowLeft: -1,
              ArrowRight: 1,
              ArrowUp: -7,
              ArrowDown: 7,
              Home: -(date.getDay() - weekStart + 7) % 7,
              End: 6 - ((date.getDay() - weekStart + 7) % 7),
            };
            if (
              event.key in moves ||
              event.key === "PageUp" ||
              event.key === "PageDown"
            ) {
              event.preventDefault();
              active = new Date(date);
              if (event.key === "PageUp" || event.key === "PageDown") {
                const desired =
                  date.getMonth() + (event.key === "PageUp" ? -1 : 1);
                active.setDate(1);
                active.setMonth(desired);
                active.setDate(
                  Math.min(
                    date.getDate(),
                    new Date(
                      active.getFullYear(),
                      active.getMonth() + 1,
                      0,
                    ).getDate(),
                  ),
                );
              } else active.setDate(active.getDate() + moves[event.key]);
              active = clamp(active);
              view = new Date(active.getFullYear(), active.getMonth(), 1);
              render();
              focusDay();
            }
          });
          row.append(cell);
        }
        days.append(row);
      }
      // Navigating months must retain an accessible tab stop without selecting a value.
      if (!days.querySelector('[tabindex="0"]'))
        days
          .querySelector<HTMLButtonElement>(
            '[data-outside="false"]:not(:disabled)',
          )
          ?.setAttribute("tabindex", "0");
      calendar.append(days);
      popup.append(calendar);
    }
    if (timeEnabled) {
      const time = node("div", "ff-datetime-time");
      const heading = node("div", "ff-datetime-time-heading", labels.time);
      const list = node("div", "ff-datetime-time-list");
      list.setAttribute("role", "listbox");
      list.setAttribute("aria-label", labels.time);
      const timeFormat = config.clock24h ? "H:i" : "g:i A";
      // Keep off-interval initial/manual times selectable rather than rounding saved values.
      const minutes = Array.from(
        { length: Math.ceil(1440 / step) },
        (_, i) => i * step,
      );
      const current = active.getHours() * 60 + active.getMinutes();
      if (!minutes.includes(current)) minutes.push(current);
      minutes.sort((a, b) => a - b);
      for (const minute of minutes) {
        const date = new Date(active);
        date.setHours(Math.floor(minute / 60), minute % 60, 0, 0);
        const item = button(
          formatDateTime(date, timeFormat),
          "ff-datetime-time-option",
          () => commit(date, true),
        );
        item.dataset.time = String(minute);
        item.disabled = !allowed(date);
        item.setAttribute("role", "option");
        item.setAttribute(
          "aria-selected",
          String(
            !!selected &&
              allowed(selected) &&
              atMidnight(selected).getTime() === atMidnight(active).getTime() &&
              selected.getHours() * 60 + selected.getMinutes() === minute,
          ),
        );
        item.tabIndex = current === minute && !item.disabled ? 0 : -1;
        item.addEventListener("keydown", (event) => {
          if (["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) {
            event.preventDefault();
            const options = Array.from(
              list.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"),
            );
            const index = options.indexOf(item);
            options[
              event.key === "Home"
                ? 0
                : event.key === "End"
                  ? options.length - 1
                  : (index +
                      (event.key === "ArrowDown" ? 1 : options.length - 1)) %
                    options.length
            ]?.focus();
          }
        });
        list.append(item);
      }
      time.append(heading, list);
      popup.append(time);
      queueMicrotask(() => {
        const selectedTime = list.querySelector<HTMLElement>('[tabindex="0"]');
        if (selectedTime)
          list.scrollTop = selectedTime.offsetTop - list.clientHeight / 2;
      });
    }
    const footer = node("div", "ff-datetime-footer");
    if (dateEnabled) {
      const today = button(labels.today, "ff-datetime-action", () =>
        commit(clamp(now()), !timeEnabled),
      );
      today.disabled = !allowedDay(now());
      footer.append(today);
    }
    footer.append(
      button(labels.clear, "ff-datetime-action", () => commit(null, true)),
    );
    popup.append(footer);
    position();
  };
  const open = () => {
    if (
      destroyed ||
      skipFocus ||
      input.disabled ||
      input.readOnly ||
      input.matches(":disabled")
    )
      return;
    refreshBounds();
    selected = readValue(input.value);
    active = clamp(selected ? new Date(selected) : now());
    view = new Date(active.getFullYear(), active.getMonth(), 1);
    opened = true;
    popup.hidden = false;
    input.setAttribute("aria-expanded", "true");
    theme();
    render();
    position();
  };
  const inputKey = (event: KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      event.stopPropagation();
      if (!opened) open();
      if (dateEnabled) focusDay();
      else
        popup
          .querySelector<HTMLButtonElement>('[data-time][tabindex="0"]')
          ?.focus();
    }
    if (event.key === "Escape" && opened) {
      event.preventDefault();
      event.stopPropagation();
      close();
    }
    if (event.key === "Enter" && opened) {
      event.preventDefault();
      event.stopPropagation();
      selected = readValue(input.value);
      if (selected) commit(selected, true);
    }
  };
  const popupKey = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      close(true);
    }
  };
  const outside = (event: Event) => {
    if (event.target !== input && !popup.contains(event.target as Node))
      close();
  };
  const focusOut = (event: FocusEvent) => {
    if (
      event.relatedTarget &&
      event.relatedTarget !== input &&
      !popup.contains(event.relatedTarget as Node)
    )
      close();
  };
  const reset = (event: Event) => {
    queueMicrotask(() => {
      if (!event.defaultPrevented) {
        close();
        selected = readValue(input.value);
      }
    });
  };
  const manualChange = () => {
    if (writing || !opened) return;
    const date = readValue(input.value);
    if (!date) return;
    selected = date;
    active = clamp(new Date(date));
    view = new Date(active.getFullYear(), active.getMonth(), 1);
    render();
  };
  input.addEventListener("input", manualChange);
  if (config.openOnFocus !== false) {
    input.addEventListener("focus", open);
    input.addEventListener("click", open);
  }
  input.addEventListener("keydown", inputKey);
  input.addEventListener("focusout", focusOut);
  popup.addEventListener("keydown", popupKey);
  popup.addEventListener("focusout", focusOut);
  doc.addEventListener("pointerdown", outside);
  win.addEventListener("resize", position);
  win.addEventListener("scroll", position, true);
  input.form?.addEventListener("reset", reset);
  const form = input.form;
  const observer =
    typeof MutationObserver === "undefined"
      ? undefined
      : new MutationObserver(() => {
          if (!input.isConnected) destroy();
          else if (
            input.disabled ||
            input.readOnly ||
            input.matches(":disabled")
          )
            close();
        });
  observer?.observe(doc.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["disabled", "readonly"],
  });
  function destroy() {
    if (destroyed) return;
    destroyed = true;
    opened = false;
    observer?.disconnect();
    popup.remove();
    instances.delete(input);
    input.removeEventListener("input", manualChange);
    input.removeEventListener("focus", open);
    input.removeEventListener("click", open);
    input.removeEventListener("keydown", inputKey);
    input.removeEventListener("focusout", focusOut);
    popup.removeEventListener("keydown", popupKey);
    popup.removeEventListener("focusout", focusOut);
    doc.removeEventListener("pointerdown", outside);
    win.removeEventListener("resize", position);
    win.removeEventListener("scroll", position, true);
    form?.removeEventListener("reset", reset);
    for (const [name, value] of original)
      if (value === null) input.removeAttribute(name);
      else input.setAttribute(name, value);
  }
  return {
    open,
    close,
    destroy,
    focus() {
      if (dateEnabled) focusDay();
      else
        popup
          .querySelector<HTMLButtonElement>('[data-time][tabindex="0"]')
          ?.focus();
    },
    update(value: string) {
      input.value = value;
      selected = readValue(value);
      if (opened) open();
    },
  };
}
