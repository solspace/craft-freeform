import { afterEach, describe, expect, it, vi } from "vitest";
import { SearchableSelect } from "../../../../../frontend/core/src/select/searchable-select";
import { initQuickForm } from "./quick-form";

function fixture() {
  const root = document.createElement("div");
  root.dataset.widgetId = "9";
  root.innerHTML = `<div data-quick-form-success hidden tabindex="-1"><h3>Submission received</h3><button data-quick-form-another>Submit another</button></div><p data-widget-feedback hidden></p><div data-quick-form-content><form><input class="freeform-input" type="email"><input class="freeform-input" type="hidden"><input class="freeform-input" type="radio"><textarea class="freeform-input"></textarea><select class="freeform-input"><option>One</option></select><button class="freeform-button-submit">Continue</button><button class="freeform-button-back">Back</button></form></div>`;
  document.body.append(root);
  initQuickForm(root);
  return root;
}
afterEach(async () => {
  vi.unstubAllGlobals();
  document.body.replaceChildren();
  await Promise.resolve();
});
describe("Craft Quick Form controls", () => {
  it("keeps rich checkbox labels together and preserves their links on AJAX pages", async () => {
    const root = fixture();
    root.querySelector("form")!.innerHTML =
      `<div class="freeform-fieldtype-checkbox"><label><input type="checkbox" name="terms">Accept the <a href="#terms">terms and conditions</a> of this website.</label></div>`;
    await vi.waitFor(() =>
      expect(
        root.querySelector("[data-quick-form-choice-label]"),
      ).not.toBeNull(),
    );
    const text = root.querySelector("[data-quick-form-choice-label]")!;
    expect(text.textContent).toBe(
      "Accept the terms and conditions of this website.",
    );
    expect(text.querySelector("a")?.getAttribute("href")).toBe("#terms");
    expect(text.querySelector("input")).toBeNull();
    root.querySelector("form")!.append(document.createElement("div"));
    await Promise.resolve();
    expect(
      root.querySelectorAll("[data-quick-form-choice-label]"),
    ).toHaveLength(1);
  });

  it.each([true, false])(
    "keeps searchable dropdowns usable without a native arrow wrapper (widget initializes first: %s)",
    async (widgetFirst) => {
      const root = document.createElement("div");
      root.innerHTML =
        '<form><label for="reason">Reason</label><select id="reason" name="reason" class="freeform-input"><option value="general">General question</option><option value="billing">Billing question</option></select></form>';
      document.body.append(root);
      const select = root.querySelector("select")!;
      if (widgetFirst) initQuickForm(root);
      const control = new SearchableSelect(select);
      if (!widgetFirst) initQuickForm(root);
      await vi.waitFor(() => expect(root.querySelector(".select")).toBeNull());
      expect(root.querySelectorAll(".ff-searchable__toggle")).toHaveLength(1);
      control.input.value = "billing";
      control.input.dispatchEvent(new Event("input", { bubbles: true }));
      const option = Array.from(
        root.querySelectorAll<HTMLElement>('[role="option"]'),
      ).find((option) => option.textContent === "Billing question")!;
      option.click();
      expect(select.value).toBe("billing");
      expect(new FormData(root.querySelector("form")!).get("reason")).toBe(
        "billing",
      );
      control.destroy();
    },
  );

  it("uses native controls without altering radio or hidden fields and preserves button hierarchy", () => {
    const root = fixture();
    initQuickForm(root);
    expect(
      root.querySelector('[type="email"]')!.classList.contains("text"),
    ).toBe(true);
    expect(
      root.querySelector('[type="hidden"]')!.classList.contains("text"),
    ).toBe(false);
    expect(
      root.querySelector('[type="radio"]')!.classList.contains("text"),
    ).toBe(false);
    expect(root.querySelector("textarea")!.classList.contains("text")).toBe(
      true,
    );
    expect(root.querySelectorAll(".select")).toHaveLength(1);
    expect(
      root
        .querySelector(".freeform-button-submit")!
        .classList.contains("submit"),
    ).toBe(true);
    expect(
      root.querySelector(".freeform-button-back")!.classList.contains("btn"),
    ).toBe(true);
    expect(
      root.querySelector(".freeform-button-back")!.classList.contains("submit"),
    ).toBe(false);
  });
  it("styles replacement fields on AJAX pages without nesting wrappers", async () => {
    const root = fixture();
    root.querySelector("form")!.innerHTML =
      '<input class="freeform-input"><select class="freeform-input"></select>';
    await Promise.resolve();
    await Promise.resolve();
    expect(root.querySelector("input")!.classList.contains("text")).toBe(true);
    expect(root.querySelectorAll(".select")).toHaveLength(1);
    expect(root.querySelector(".select .select")).toBeNull();
  });

  it("only shows confirmation after a completed successful submission, including non-bubbling events", () => {
    const root = fixture();
    const other = fixture();
    const form = root.querySelector("form")!;
    const event = (response: Record<string, unknown>) =>
      form.dispatchEvent(
        Object.assign(new Event("freeform-ajax-success"), { response }),
      );
    event({ success: true, finished: false });
    expect(
      root.querySelector<HTMLElement>("[data-quick-form-success]")!.hidden,
    ).toBe(true);
    event({ success: false, finished: true });
    event({ success: true, finished: true, actions: ["payment"] });
    expect(
      root.querySelector<HTMLElement>("[data-quick-form-success]")!.hidden,
    ).toBe(true);
    event({ success: true, finished: true });
    expect(
      root.querySelector<HTMLElement>("[data-quick-form-success]")!.hidden,
    ).toBe(false);
    expect(
      root.querySelector<HTMLElement>("[data-quick-form-content]")!.hidden,
    ).toBe(true);
    expect(
      other.querySelector<HTMLElement>("[data-quick-form-success]")!.hidden,
    ).toBe(true);
  });
  it("keeps final confirmation in the widget without changing integration actions or intermediate pages", () => {
    const root = fixture();
    const form = root.querySelector("form")!;
    const response = {
      success: true,
      finished: true,
      onSuccess: "redirect-return-url",
      html: "Thanks",
    };
    form.dispatchEvent(
      Object.assign(new Event("freeform-before-ajax-success"), { response }),
    );
    expect(response.onSuccess).toBe("reload");
    expect(response.html).toBeNull();
    const pending = {
      ...response,
      actions: ["payment"],
      onSuccess: "redirect-return-url",
    };
    form.dispatchEvent(
      Object.assign(new Event("freeform-before-ajax-success"), {
        response: pending,
      }),
    );
    expect(pending.onSuccess).toBe("redirect-return-url");
  });
  it("loads fresh fields and tokens when submitting another and preserves confirmation on a failed restart", async () => {
    const root = fixture();
    const another = root.querySelector<HTMLButtonElement>(
      "[data-quick-form-another]",
    )!;
    const request = vi
      .fn()
      .mockRejectedValueOnce(new Error("Offline"))
      .mockResolvedValueOnce({
        data: {
          html: '<div data-widget-id="9"><div data-quick-form-success hidden></div><div data-quick-form-content><form><input class="freeform-input" name="name" value=""><input type="hidden" name="token" value="new-token"></form></div></div>',
          headHtml: "",
          bodyHtml: "",
        },
      });
    vi.stubGlobal("Craft", {
      sendActionRequest: request,
      appendHeadHtml: vi.fn().mockResolvedValue(undefined),
      appendBodyHtml: vi.fn().mockResolvedValue(undefined),
    });
    root.querySelector("form")!.dispatchEvent(
      Object.assign(new Event("freeform-ajax-success"), {
        response: { success: true, finished: true },
      }),
    );
    another.click();
    await vi.waitFor(() =>
      expect(
        root.querySelector("[data-widget-feedback]")!.textContent,
      ).toContain("Could not load"),
    );
    expect(
      root.querySelector<HTMLElement>("[data-quick-form-success]")!.hidden,
    ).toBe(false);
    expect(another.disabled).toBe(false);
    another.click();
    await vi.waitFor(() => expect(root.isConnected).toBe(false));
    const next = document.querySelector<HTMLElement>("[data-widget-id='9']")!;
    expect(next.querySelector<HTMLInputElement>('[name="token"]')!.value).toBe(
      "new-token",
    );
    expect(next.querySelector<HTMLInputElement>('[name="name"]')!.value).toBe(
      "",
    );
    expect(
      next.querySelector<HTMLElement>("[data-quick-form-success]")!.hidden,
    ).toBe(true);
    expect(next.querySelector("input")!.classList.contains("text")).toBe(true);
  });

  it("overrides dark Stripe defaults with a light Craft appearance", () => {
    const root = fixture();
    const event = Object.assign(
      new Event("freeform-stripe-appearance", { bubbles: true }),
      {
        elementOptions: {
          appearance: { theme: "night" } as Record<string, unknown>,
        },
      },
    );
    root.querySelector("form")!.dispatchEvent(event);
    expect(event.elementOptions.appearance.theme).toBe("stripe");
    expect(event.elementOptions.appearance.variables).toMatchObject({
      colorBackground: "#ffffff",
      fontSizeBase: "14px",
    });
  });
});
