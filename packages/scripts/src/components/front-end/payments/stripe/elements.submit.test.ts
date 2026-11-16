import type { FreeformEvent } from "types/events";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./elements.config", () => ({
  default: () => ({
    required: true,
    integration: "integration",
    site: "default",
  }),
}));
vi.mock("./elements.init", () => ({ initStripe: vi.fn() }));
vi.mock("./elements.selectors", () => ({
  selectVisibleContainers: (form: HTMLFormElement) =>
    Array.from(form.querySelectorAll("[data-payment]")),
}));

import { submitStripe } from "./elements.submit";
import type { StripeFunctionConstructorProps } from "./elements.types";

afterEach(() => document.body.replaceChildren());

describe("Stripe confirmation after Freeform validation", () => {
  it("does not confirm payment when quick-save rejects storage validation", async () => {
    const { callback, quickSave, confirmPayment, submit } = fixture(undefined);
    expect(await callback()).toBe(false);
    expect(submit).toHaveBeenCalledOnce();
    expect(quickSave).toHaveBeenCalledWith("secret", "pi_test");
    expect(confirmPayment).not.toHaveBeenCalled();
  });

  it("confirms payment after quick-save accepts the current storage permission", async () => {
    const { callback, confirmPayment } = fixture("saved-token");
    await callback();
    expect(confirmPayment).toHaveBeenCalledOnce();
    expect(confirmPayment.mock.calls[0][0].confirmParams.return_url).toContain(
      "stripe_token=saved-token",
    );
  });
});

function fixture(token: string | undefined) {
  document.body.innerHTML =
    "<form><div data-payment><div data-freeform-stripe-card></div></div></form>";
  const form = document.querySelector<HTMLFormElement>("form")!;
  const field = form.querySelector<HTMLDivElement>(
    "[data-freeform-stripe-card]",
  )!;
  const quickSave = vi.fn().mockResolvedValue(token);
  const submit = vi.fn().mockResolvedValue({});
  const confirmPayment = vi.fn().mockResolvedValue({});
  const freeform = { quickSave };
  let callback: () => Promise<boolean>;
  const event = {
    freeform,
    addCallback: (value: typeof callback) => {
      callback = value;
    },
  } as unknown as FreeformEvent;
  const props = {
    form,
    elementMap: new WeakMap([
      [
        field,
        {
          empty: false,
          stripe: { confirmPayment },
          elements: { submit },
          paymentIntent: { id: "pi_test", secret: "secret" },
        },
      ],
    ]),
  } as unknown as StripeFunctionConstructorProps;
  submitStripe(props)(event);
  return { callback: callback!, quickSave, confirmPayment, submit };
}
