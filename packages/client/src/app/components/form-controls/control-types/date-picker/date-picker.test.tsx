import type { DateTimeProperty } from "@ff-client/types/properties";
import { PropertyType } from "@ff-client/types/properties";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import DatePickerControl from "./date-picker";

const { picker } = vi.hoisted(() => ({
  picker: { props: null as { onChange: (date: Date | null) => void } | null },
}));

vi.mock("@config/freeform/freeform.config", () => ({
  default: { metadata: { craft: { locale: "en-US" } } },
}));
vi.mock("@ff-client/utils/translations", () => ({
  default: (text: string) => text,
}));
vi.mock("@ff-client/utils/locales", () => ({
  loadLocale: () => Promise.resolve(undefined),
}));
vi.mock("../../control", () => ({
  Control: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock("react-datepicker", () => ({
  default: (props: { onChange: (date: Date | null) => void }) => {
    picker.props = props;
    return <input aria-label="Date" />;
  },
}));

let root: Root;
let container: HTMLDivElement;

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
});

const mount = async (
  value: string | null = null,
  property: Partial<DateTimeProperty> = {},
) => {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  const updateValue = vi.fn();
  await act(async () =>
    root.render(
      <DatePickerControl
        value={value}
        updateValue={updateValue}
        property={{
          type: PropertyType.DateTime,
          handle: "scheduleDate",
          label: "Schedule Start Date",
          includeTime: true,
          ...property,
        }}
      />,
    ),
  );
  return updateValue;
};

describe("schedule date/time controls", () => {
  it("uses midnight for a new start date", async () => {
    const update = await mount();
    act(() => picker.props.onChange(new Date(2026, 9, 14, 16)));
    const value = new Date(update.mock.calls[0][0]);
    expect(value.getHours()).toBe(0);
    expect(value.getMinutes()).toBe(0);
  });

  it("uses the configured default time for a new end date", async () => {
    const update = await mount(null, { defaultTime: "23:59" });
    act(() => picker.props.onChange(new Date(2026, 9, 14)));
    const value = new Date(update.mock.calls[0][0]);
    expect(value.getHours()).toBe(23);
    expect(value.getMinutes()).toBe(59);
  });

  it("preserves a chosen time when changing the date", async () => {
    const update = await mount(new Date(2026, 9, 14, 9, 30).toISOString());
    act(() => picker.props.onChange(new Date(2026, 9, 20)));
    const value = new Date(update.mock.calls[0][0]);
    expect(value.getDate()).toBe(20);
    expect(value.getHours()).toBe(9);
    expect(value.getMinutes()).toBe(30);
  });

  it("clears the optional schedule date", async () => {
    const update = await mount(new Date().toISOString());
    act(() => picker.props.onChange(null));
    expect(update).toHaveBeenCalledWith(null);
  });

  it("disables time entry until a date is selected", async () => {
    await mount();
    expect(
      container.querySelector<HTMLInputElement>('input[type="time"]').disabled,
    ).toBe(true);
  });

  it("keeps existing date-only controls date-only", async () => {
    await mount(null, { includeTime: false });
    expect(container.querySelector('input[type="time"]')).toBeNull();
  });
});
