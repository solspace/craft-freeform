import { PropertyType } from "@ff-client/types/properties";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import DateOrderControl from "./date-order";

vi.mock("@components/form-controls/control", () => ({
  Control: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock("@editor/store/slices/translations/translations.hooks", () => ({
  useTranslations: () => ({
    getTranslation: (_handle: string, value: unknown) => value,
  }),
}));

it("updates the format labels without changing saved date-order values", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const update = vi.fn();
  const render = (
    date4DigitYear: boolean,
    dateLeadingZero: boolean,
    dateSeparator: string,
  ) =>
    act(() =>
      root.render(
        <DateOrderControl
          value="dmy"
          updateValue={update}
          context={{
            uid: "date",
            typeClass: "datetime",
            properties: { date4DigitYear, dateLeadingZero, dateSeparator },
          }}
          property={{
            type: PropertyType.Select,
            handle: "dateOrder",
            label: "Date order",
            options: ["ymd", "mdy", "dmy"].map((value) => ({
              value,
              label: value,
            })),
          }}
        />,
      ),
    );
  try {
    render(true, true, "-");
    expect(
      Array.from(host.querySelectorAll("button")).map((e) => e.textContent),
    ).toEqual(["YYYY-MM-DD", "MM-DD-YYYY", "DD-MM-YYYY"]);
    render(false, false, "/");
    expect(host.querySelector('[aria-pressed="true"]')!.textContent).toBe(
      "D/M/YY",
    );
    render(true, false, "space");
    expect(host.querySelector('[aria-pressed="true"]')!.textContent).toBe(
      "D M YYYY",
    );
    render(false, true, "empty");
    expect(host.querySelector('[aria-pressed="true"]')!.textContent).toBe(
      "DDMMYY",
    );
    expect(update).not.toHaveBeenCalled();
    act(() => host.querySelectorAll("button")[1].click());
    expect(update).toHaveBeenCalledExactlyOnceWith("mdy");
  } finally {
    act(() => root.unmount());
    host.remove();
    vi.unstubAllGlobals();
  }
});
