import { afterEach, describe, expect, it } from "vitest";
import { enhanceBooleanMenus } from "./boolean-menu";

afterEach(() => document.body.replaceChildren());

describe("Craft 6 boolean settings", () => {
  it("retains form submission and dependent-field updates", async () => {
    document.body.innerHTML = `<form><div class="freeform-boolean-menu"><select hidden name="settings[enabled]" data-boolean-menu data-target="dependent"><option value="1" selected>Enabled</option><option value="0">Disabled</option><option value="$FLAG">$FLAG</option></select><craft-combobox></craft-combobox><span class="freeform-boolean-menu-status"><craft-indicator></craft-indicator></span></div></form>`;
    const combobox = document.querySelector("craft-combobox") as HTMLElement & {
      value?: string;
    };
    combobox.value = "1";
    combobox.setAttribute(
      "options",
      JSON.stringify([
        { value: "1", data: { boolean: "1" } },
        { value: "0", data: { boolean: "0" } },
        { options: [{ value: "$FLAG", data: { boolean: "0" } }] },
      ]),
    );
    const select = document.querySelector("select")!;
    const optionIndicator = document.createElement("craft-indicator");
    optionIndicator.setAttribute("fill", "success");
    combobox.append(optionIndicator);
    const selectedIndicator = document.querySelector(
      ".freeform-boolean-menu-status craft-indicator",
    )!;
    let changes = 0;
    select.addEventListener("change", () => changes++);
    enhanceBooleanMenus();
    enhanceBooleanMenus();
    expect(selectedIndicator.getAttribute("fill")).toBe("success");
    combobox.value = "$FLAG";
    combobox.dispatchEvent(new CustomEvent("change", { bubbles: true }));
    await Promise.resolve();
    expect(select.value).toBe("$FLAG");
    expect(select.dataset.boolean).toBe("false");
    expect(selectedIndicator.getAttribute("appearance")).toBe("outline");
    expect(selectedIndicator.getAttribute("fill")).toBe("neutral");
    expect(optionIndicator.getAttribute("fill")).toBe("success");
    expect(
      new FormData(document.querySelector("form")!).getAll("settings[enabled]"),
    ).toEqual(["$FLAG"]);
    expect(changes).toBe(1);
    combobox.value = "1";
    combobox.dispatchEvent(new CustomEvent("change"));
    await Promise.resolve();
    expect(select.dataset.boolean).toBe("true");
    expect(changes).toBe(2);
    expect(selectedIndicator.getAttribute("fill")).toBe("success");
  });
});
