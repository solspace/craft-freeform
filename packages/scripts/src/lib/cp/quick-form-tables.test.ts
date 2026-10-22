import type Freeform from "@components/front-end/plugin/freeform";
import { registerAddButton } from "@lib/plugin/handlers/fields/table/button.add";
import { registerRemoveButtons } from "@lib/plugin/handlers/fields/table/button.remove";
import { afterEach, describe, expect, it } from "vitest";
import { enhanceQuickFormTables } from "./quick-form-tables";

const labels = {
  add: "Add",
  addRow: "Add a row",
  removeRow: "Remove row",
  rowActions: "Row actions",
};
function fixture() {
  const root = document.createElement("div");
  root.innerHTML = `<form><div><label>People</label><table data-freeform-table data-max-rows="2"><thead><tr><th class="freeform-label freeform-required" data-column-required>Name</th><th>Age</th><th>Gender</th><th>Needs bus</th><th>Notes</th><th></th></tr></thead><tbody><tr>
    <td><input type="text" name="people[0][0]" value="Original" data-default-value="Default"></td>
    <td><select name="people[0][1]"><option value="5">5</option></select></td>
    <td><div><div><input id="labeled-people-0-2-0" type="radio" name="people[0][2]" value="m" checked><label for="labeled-people-0-2-0">Male</label></div><div><input id="labeled-people-0-2-1" type="radio" name="people[0][2]" value="f"><label for="labeled-people-0-2-1">Female</label></div></div></td>
    <td><input type="checkbox" name="people[0][3]" value="1"></td>
    <td><textarea name="people[0][4]">Keep this</textarea></td><td><button type="button" data-freeform-table-remove-row>Remove</button></td>
    </tr></tbody></table><div></div><button type="button" data-freeform-table-add-row>Add</button></div></form>`;
  document.body.append(root);
  return root;
}
afterEach(() => document.body.replaceChildren());

describe("Craft Quick Form tables", () => {
  it("adds the editable grid without replacing inputs or changing submitted values", () => {
    const root = fixture();
    const form = root.querySelector("form")!;
    const original = root.querySelector("input")!;
    const before = Array.from(new FormData(form));
    enhanceQuickFormTables(root, labels);
    enhanceQuickFormTables(root, labels);
    expect(root.querySelector("input")).toBe(original);
    expect(Array.from(new FormData(form))).toEqual(before);
    expect(root.querySelectorAll(".freeform-cp-table-scroll")).toHaveLength(1);
    expect(
      root.querySelector(
        ".freeform-cp-table-scroll [data-freeform-table-add-row]",
      ),
    ).toBeNull();
    expect(root.querySelector("table")!.classList.contains("editable")).toBe(
      true,
    );
    expect(root.querySelector("th")!.classList.contains("freeform-label")).toBe(
      false,
    );
    expect(root.querySelector("th")!.hasAttribute("data-column-required")).toBe(
      true,
    );
    expect(root.querySelectorAll(".select.small")).toHaveLength(1);
    expect(root.querySelectorAll(".checkbox-wrapper label")).toHaveLength(1);
    expect(
      root.querySelector("[data-freeform-table-add-row]")!.textContent,
    ).toBe("Add a row");
    expect(
      root
        .querySelector("[data-freeform-table-remove-row]")!
        .getAttribute("aria-label"),
    ).toBe("Remove");
  });

  it("preserves row handlers, limits, and independent labels after cloning and removing a row", () => {
    const root = fixture();
    const form = root.querySelector("form")!;
    const instance = {
      form,
      _dispatchEvent: (type: string, detail: object) =>
        form.dispatchEvent(Object.assign(new Event(type), detail)),
    } as unknown as Freeform;
    enhanceQuickFormTables(root, labels);
    registerAddButton(instance);
    registerRemoveButtons(instance);
    const add = root.querySelector<HTMLButtonElement>(
      "[data-freeform-table-add-row]",
    )!;
    add.click();
    enhanceQuickFormTables(root, labels);
    expect(root.querySelectorAll("tbody tr")).toHaveLength(2);
    expect(add.style.display).toBe("none");
    const checkbox = root.querySelector<HTMLInputElement>(
      '[name="people[1][3]"]',
    )!;
    (checkbox.nextElementSibling as HTMLLabelElement).click();
    expect(checkbox.checked).toBe(true);
    expect(
      root.querySelector<HTMLInputElement>('[name="people[0][3]"]')!.checked,
    ).toBe(false);
    const radio = root.querySelector<HTMLInputElement>(
      '[name="people[1][2]"][value="f"]',
    )!;
    (radio.nextElementSibling as HTMLLabelElement).click();
    expect(radio.checked).toBe(true);
    expect(
      root.querySelector<HTMLInputElement>('[name="people[0][2]"][value="m"]')!
        .checked,
    ).toBe(true);
    root
      .querySelectorAll<HTMLButtonElement>(
        "[data-freeform-table-remove-row]",
      )[1]
      .click();
    expect(root.querySelectorAll("tbody tr")).toHaveLength(1);
    expect(add.style.display).not.toBe("none");
    expect(
      root.querySelector<HTMLInputElement>('[name="people[0][0]"]')!.value,
    ).toBe("Original");
  });

  it("keeps configured button labels and separates choice IDs between widgets", () => {
    const first = fixture();
    const second = fixture();
    second.querySelector("[data-freeform-table-add-row]")!.textContent =
      "Add attendee";
    enhanceQuickFormTables(first, labels);
    enhanceQuickFormTables(second, labels);
    const ids = Array.from(
      document.querySelectorAll<HTMLInputElement>(
        'input[type="radio"],input[type="checkbox"]',
      ),
      (input) => input.id,
    );
    expect(new Set(ids).size).toBe(ids.length);
    expect(
      second.querySelector("[data-freeform-table-add-row]")!.textContent,
    ).toBe("Add attendee");
  });
});
