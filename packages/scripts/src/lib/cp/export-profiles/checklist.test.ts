import { afterEach, expect, it } from "vitest";
import { attachExportChecklist } from "./checklist";

afterEach(() => document.body.replaceChildren());

function mount(statuses = false) {
  const root = document.createElement("div");
  root.innerHTML = `<form><div data-export-checklist data-all-label="${statuses ? "All statuses" : "All formats"}" data-empty-label="Choose options" data-count-label="{count} selected"><button type="button" data-checklist-toggle aria-expanded="false"><span data-checklist-summary></span></button><div data-checklist-options hidden><fieldset>${statuses ? '<input class="all" type="checkbox" name="statuses" value="*" checked>' : ""}${["Excel", "CSV", "JSON", "XML", "Text"].map((name, index) => `<input id="option-${index}-${statuses}" type="checkbox" name="options[]" value="${name}" ${index === 0 ? "checked" : ""} ${statuses ? "disabled" : ""}><label for="option-${index}-${statuses}"><span class="ff-export-option-label"><span class="${statuses ? "status" : "ff-export-file-icon"}" aria-hidden="true"></span><span>${name}</span></span></label>`).join("")}</fieldset></div></div></form><button>Outside</button>`;
  document.body.append(root);
  const details = root.querySelector<HTMLElement>("[data-export-checklist]")!;
  const panel = root.querySelector<HTMLElement>("[data-checklist-options]")!;
  const summary = root.querySelector<HTMLButtonElement>(
    "[data-checklist-toggle]",
  )!;
  const content = root.querySelector<HTMLElement>("[data-checklist-summary]")!;
  const inputs = Array.from(
    root.querySelectorAll<HTMLInputElement>('input[name="options[]"]'),
  );
  attachExportChecklist(details);
  return {
    root,
    panel,
    details,
    summary,
    content,
    inputs,
    async change() {
      inputs[0].dispatchEvent(new Event("change", { bubbles: true }));
      await Promise.resolve();
    },
    open() {
      summary.click();
    },
  };
}

it("shows selected names and decorative icons without duplicating form inputs", () => {
  const f = mount();
  expect(f.content.textContent).toBe("Excel");
  expect(f.content.querySelector(".ff-export-file-icon")).not.toBeNull();
  expect(
    new FormData(f.root.querySelector("form")!).getAll("options[]"),
  ).toEqual(["Excel"]);
});

it("summarizes small, large, all, and empty selections after changes", async () => {
  const f = mount();
  f.inputs[1].checked = true;
  await f.change();
  expect(f.content.textContent).toBe("Excel, CSV");
  f.inputs[2].checked = true;
  await f.change();
  expect(f.content.textContent).toBe("Excel, CSV, JSON");
  f.inputs[3].checked = true;
  await f.change();
  expect(f.content.textContent).toBe("Excel, CSV, JSON, XML");
  expect(f.content.querySelectorAll(".ff-export-file-icon")).toHaveLength(4);
  f.inputs.forEach((input) => {
    input.checked = true;
  });
  await f.change();
  expect(f.content.textContent).toBe("All formats");
  f.inputs.forEach((input) => {
    input.checked = false;
  });
  await f.change();
  expect(f.content.textContent).toBe("Choose options");
});

it("uses a count for more than four individually selected statuses", async () => {
  const f = mount(true);
  f.root.querySelector<HTMLInputElement>(".all")!.checked = false;
  f.inputs.forEach((input) => {
    input.checked = true;
  });
  await f.change();
  expect(f.content.textContent).toBe("5 selected");
});

it("falls back to a count when names do not fit and restores them when space is available", async () => {
  const f = mount();
  Object.defineProperty(f.content, "clientWidth", {
    value: 100,
    configurable: true,
  });
  Object.defineProperty(f.content, "scrollWidth", { value: 300 });
  f.inputs[1].checked = true;
  f.inputs[2].checked = true;
  await f.change();
  expect(f.content.textContent).toBe("3 selected");
  Object.defineProperty(f.content, "clientWidth", { value: 500 });
  await f.change();
  expect(f.content.textContent).toBe("Excel, CSV, JSON");
});

it("preserves Craft's All status value and includes dots for specific selections", async () => {
  const f = mount(true);
  expect(f.content.textContent).toBe("All statuses");
  expect(new FormData(f.root.querySelector("form")!).get("statuses")).toBe("*");
  expect(
    new FormData(f.root.querySelector("form")!).getAll("options[]"),
  ).toEqual([]);
  f.root.querySelector<HTMLInputElement>(".all")!.checked = false;
  f.inputs.forEach((input) => {
    input.disabled = false;
  });
  await f.change();
  expect(f.content.querySelector(".status")).not.toBeNull();
});

it("closes on Escape and restores keyboard focus to the summary", () => {
  const f = mount();
  f.open();
  f.inputs[0].focus();
  f.inputs[0].dispatchEvent(
    new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
  );
  expect(f.panel.hidden).toBe(true);
  expect(f.summary.getAttribute("aria-expanded")).toBe("false");
  expect(document.activeElement).toBe(f.summary);
});

it.each([".ff-export-option-label span:last-child", ".ff-export-file-icon"])(
  "opens when clicking the summary's %s even after its content is replaced",
  (selector) => {
    const f = mount();
    f.content.querySelector<HTMLElement>(selector)!.click();
    expect(f.panel.hidden).toBe(false);
    expect(f.summary.getAttribute("aria-expanded")).toBe("true");
    f.content.querySelector<HTMLElement>(selector)!.click();
    expect(f.panel.hidden).toBe(true);
  },
);

it("only opens one checklist and closes on outside clicks", () => {
  const first = mount();
  const second = mount(true);
  first.open();
  second.open();
  expect(first.panel.hidden).toBe(true);
  expect(second.panel.hidden).toBe(false);
  second.root.querySelector<HTMLButtonElement>("button:last-child")!.click();
  expect(second.panel.hidden).toBe(true);
});

it("closes when keyboard focus moves outside without discarding selections", () => {
  const f = mount();
  f.open();
  f.summary.dispatchEvent(
    new FocusEvent("focusout", {
      relatedTarget: f.root.querySelector("button:last-child"),
      bubbles: true,
    }),
  );
  expect(f.panel.hidden).toBe(true);
  expect(f.inputs[0].checked).toBe(true);
});

it.each([false, true])(
  "keeps label clicks open through Craft's pointer focus change (statuses: %s)",
  async (statuses) => {
    const f = mount(statuses);
    if (statuses) {
      f.root.querySelector<HTMLInputElement>(".all")!.checked = false;
      f.inputs.forEach((input) => {
        input.disabled = false;
      });
    }
    f.open();
    const label = f.inputs[1].labels![0];
    label.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true }));
    f.summary.dispatchEvent(
      new FocusEvent("focusout", {
        relatedTarget: f.root,
        bubbles: true,
      }),
    );
    // The panel must remain visible before the label's default activation.
    expect(f.panel.hidden).toBe(false);
    label.dispatchEvent(new MouseEvent("pointerup", { bubbles: true }));
    label.click();
    await Promise.resolve();
    expect(f.inputs[1].checked).toBe(true);
    expect(f.panel.hidden).toBe(false);
    expect(f.summary.getAttribute("aria-expanded")).toBe("true");
    expect(f.content.textContent).toBe("Excel, CSV");
  },
);
