import type Freeform from "@components/front-end/plugin/freeform";
import { beforeEach, expect, it, vi } from "vitest";
import { mountDateTimePicker } from "../../../../../../frontend/core/src/datetime/picker";
import DatePicker from "./datepicker";

vi.mock("../../../../../../frontend/core/src/datetime/picker", () => ({
  mountDateTimePicker: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  document.head.replaceChildren();
  document.body.innerHTML = `<form data-scripts-datepicker>
    <input data-datepicker-kind="freeform" data-datepicker-enabled data-datepicker-php-format="d/m/Y" data-datepicker-language="fr" data-datepicker-enabledate data-datepicker-minute-step="15" data-datepicker-labels='{"today":"Aujourd’hui"}'>
    <input data-datepicker-kind="browser" type="date">
    <input data-datepicker-kind="none">
    <input data-datepicker-kind="freeform" data-datepicker-enabled="false">
  </form>`;
});

function setup() {
  const form = document.querySelector("form")!;
  return new DatePicker({
    form,
    has: (name: string) => form.hasAttribute(name),
  } as Freeform);
}

it("mounts the bundled picker with field settings and localized labels, without external assets", () => {
  setup();
  expect(mountDateTimePicker).toHaveBeenCalledExactlyOnceWith(
    document.querySelector("input"),
    expect.objectContaining({
      format: "d/m/Y",
      locale: "fr",
      enableDate: true,
      enableTime: false,
      minuteStep: 15,
      labels: { today: "Aujourd’hui" },
    }),
  );
  expect(document.querySelector("script,link")).toBeNull();
});

it("initializes fields arriving on later pages without loading external scripts", () => {
  const handler = setup();
  const input = document.createElement("input");
  input.setAttribute("data-datepicker-kind", "freeform");
  input.setAttribute("data-datepicker-enabled", "");
  handler.freeform.form.append(input);
  handler.reload();
  expect(mountDateTimePicker).toHaveBeenLastCalledWith(
    input,
    expect.any(Object),
  );
  expect(document.querySelector("script,link")).toBeNull();
});

it("leaves browser, plain text, and disabled pickers alone", () => {
  document.querySelector('input[data-datepicker-enabled=""]')!.remove();
  setup();
  expect(mountDateTimePicker).not.toHaveBeenCalled();
});
