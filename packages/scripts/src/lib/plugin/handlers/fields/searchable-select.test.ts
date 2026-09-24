import type Freeform from "@components/front-end/plugin/freeform";
import { describe, expect, it } from "vitest";
import SearchableSelectHandler from "./searchable-select";

describe("classic searchable select lifecycle", () => {
  it("enhances once, supports AJAX replacement, and leaves unconfigured selects native", () => {
    document.body.innerHTML =
      '<form><select><option>Native</option></select><select data-freeform-searchable="{bad"><option>Invalid config</option></select><select data-freeform-searchable=\'{"enabled":true}\'><option>First page</option></select></form>';
    const form = document.querySelector("form")!;
    const handler = new SearchableSelectHandler({ form } as Freeform);
    handler.reload();
    expect(form.querySelectorAll(".ff-searchable")).toHaveLength(1);
    const previous = form.querySelector<HTMLInputElement>('[role="combobox"]')!;
    form.innerHTML =
      "<select data-freeform-searchable='{\"enabled\":true}'><option>Second page</option></select>";
    handler.reload();
    expect(form.querySelectorAll(".ff-searchable")).toHaveLength(1);
    expect(
      form.querySelector<HTMLInputElement>('[role="combobox"]')?.value,
    ).toBe("Second page");
    expect(previous.isConnected).toBe(false);
    form.replaceChildren();
    handler.reload();
    document.body.replaceChildren();
  });
});
