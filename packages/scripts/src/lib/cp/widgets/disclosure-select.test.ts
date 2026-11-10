import { afterEach, expect, it } from "vitest";
import { DisclosureSelect } from "./disclosure-select";

let picker: DisclosureSelect;
function setup(circles = false) {
  document.body.innerHTML = `<form><label for="status">Status</label><div class="select"><select id="status" name="status"><option value="">All</option><option value="open" data-status-color="green">Open</option><option value="done" data-status-color="blue">Done</option></select></div></form>`;
  picker = new DisclosureSelect(document.querySelector("select")!, circles);
  return picker;
}
afterEach(() => {
  picker?.destroy();
  document.body.replaceChildren();
});

it("shows status circles, updates the native value, and returns focus", () => {
  setup(true);
  picker.button.click();
  const choices = picker.menu.querySelectorAll<HTMLButtonElement>("button");
  expect(choices[1].querySelector(".status.green")).not.toBeNull();
  expect(choices[0].querySelector(".status.all")).not.toBeNull();
  expect(picker.button.querySelector(".status.all")).not.toBeNull();
  choices[1].click();
  expect(picker.select.value).toBe("open");
  expect(new FormData(document.querySelector("form")!).get("status")).toBe(
    "open",
  );
  expect(picker.button.textContent).toBe("Open");
  expect(picker.button.querySelector(".status.green")).not.toBeNull();
  expect(picker.menu.isConnected).toBe(false);
  expect(document.activeElement).toBe(picker.button);
});

it("supports arrow keys, Home/End and Escape without changing a selection", () => {
  setup();
  picker.select.value = "open";
  picker.sync();
  picker.button.dispatchEvent(
    new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
  );
  expect(document.activeElement?.textContent).toBe("Open");
  document.activeElement?.dispatchEvent(
    new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
  );
  expect(document.activeElement?.textContent).toBe("Done");
  document.activeElement?.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Home", bubbles: true }),
  );
  expect(document.activeElement?.textContent).toBe("All");
  document.activeElement?.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
  );
  expect(picker.select.value).toBe("open");
  expect(picker.button.getAttribute("aria-expanded")).toBe("false");
  expect(document.activeElement).toBe(picker.button);
});

it("syncs programmatic changes, dismisses outside, and cleans up labels and popups", () => {
  setup();
  picker.select.value = "done";
  picker.select.dispatchEvent(new Event("change"));
  expect(picker.button.textContent).toBe("Done");
  picker.button.click();
  document.body.dispatchEvent(new Event("pointerdown", { bubbles: true }));
  expect(picker.menu.isConnected).toBe(false);
  picker.button.click();
  picker.destroy();
  expect(picker.menu.isConnected).toBe(false);
  expect(picker.select.hidden).toBe(false);
  expect(document.querySelector("label")!.htmlFor).toBe("status");
});

it("honors disabled options and controls", () => {
  setup();
  picker.select.options[1].disabled = true;
  picker.button.click();
  const disabled = picker.menu.querySelectorAll<HTMLButtonElement>("button")[1];
  disabled.click();
  expect(picker.select.value).toBe("");
  picker.select.disabled = true;
  picker.sync();
  picker.button.click();
  expect(picker.menu.isConnected).toBe(false);
});
