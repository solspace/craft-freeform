import type Freeform from "@components/front-end/plugin/freeform";
import { afterEach, expect, it, vi } from "vitest";
import { registerAddButton } from "./button.add";

afterEach(() => document.body.replaceChildren());
it("keeps native CP labels connected to unique choices when cloning several rows", () => {
  const form = document.createElement("form");
  form.innerHTML = `<div data-freeform-table><div class="table-scroll"><table><tbody><tr>
    <td><input id="labeled-people-0-0-0" class="radio" type="radio" name="people[0][0]" value="m" data-default-value="m" checked>
      <label for="labeled-people-0-0-0">Male</label>
      <input id="labeled-people-0-0-1" class="radio" type="radio" name="people[0][0]" value="f" data-default-value="m">
      <label for="labeled-people-0-0-1">Female</label></td>
    <td><input id="labeled-people-0-1-0" class="checkbox" type="checkbox" name="people[0][1]" value="1">
      <label for="labeled-people-0-1-0">Needs bus</label></td>
  </tr></tbody></table></div><button type="button" data-freeform-table-add-row>Add a row</button></div>`;
  document.body.append(form);
  const instance = { form, _dispatchEvent: vi.fn() } as unknown as Freeform;
  registerAddButton(instance);
  const add = form.querySelector<HTMLButtonElement>(
    "[data-freeform-table-add-row]",
  )!;
  add.click();
  add.click();
  const inputs = [...form.querySelectorAll<HTMLInputElement>("input")];
  expect(form.querySelectorAll("tbody tr")).toHaveLength(3);
  expect(new Set(inputs.map((input) => input.id)).size).toBe(inputs.length);
  for (const input of inputs) {
    expect(input.nextElementSibling?.getAttribute("for")).toBe(input.id);
  }
  const originalMale = form.querySelector<HTMLInputElement>(
    '[name="people[0][0]"][value="m"]',
  )!;
  const newFemale = form.querySelector<HTMLInputElement>(
    '[name="people[2][0]"][value="f"]',
  )!;
  (newFemale.nextElementSibling as HTMLLabelElement).click();
  expect(newFemale.checked).toBe(true);
  expect(originalMale.checked).toBe(true);
  const newCheckbox = form.querySelector<HTMLInputElement>(
    '[name="people[2][1]"]',
  )!;
  (newCheckbox.nextElementSibling as HTMLLabelElement).click();
  expect(newCheckbox.checked).toBe(true);
  expect(
    form.querySelector<HTMLInputElement>('[name="people[0][1]"]')!.checked,
  ).toBe(false);
});
