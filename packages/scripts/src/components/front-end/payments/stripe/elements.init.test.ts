import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  updateAmount: vi.fn(),
  mount: vi.fn(),
  on: vi.fn(),
  elements: vi.fn(),
  amountFields: ["amount"] as string[],
  storageOptInField: null as string | null,
}));

vi.mock("./elements.config", () => ({
  default: () => ({
    site: "default",
    integration: "integration",
    amountFields: mocks.amountFields,
    storageOptInField: mocks.storageOptInField,
    fieldMapping: [],
    loadStripe: async () => ({ elements: mocks.elements }),
  }),
}));
vi.mock("./elements.queries", () => ({
  default: {
    paymentIntents: { create: mocks.create, updateAmount: mocks.updateAmount },
  },
}));
vi.mock("./elements.appearance", () => ({
  generateElementOptions: () => ({ elementOptions: {}, paymentOptions: {} }),
}));
vi.mock("./elements.selectors", () => ({ isHidden: () => false }));

import { initStripe } from "./elements.init";
import type { StripeFunctionConstructorProps } from "./elements.types";

beforeEach(() => {
  vi.resetAllMocks();
  mocks.amountFields = ["amount"];
  mocks.storageOptInField = null;
  mocks.elements.mockReturnValue({
    create: () => ({ mount: mocks.mount, on: mocks.on }),
  });
});

afterEach(() => {
  document.body.replaceChildren();
});

describe("Stripe dynamic payment initialization", () => {
  it("shows storage validation errors when an existing payment amount changes", async () => {
    const { form, container, props, renderErrors } = fixture(
      '<input name="amount" value="10">',
    );
    mocks.create.mockResolvedValue({
      data: { id: "pi_valid", secret: "secret" },
    });
    mocks.updateAmount.mockRejectedValue({
      response: {
        data: { errors: ["Stripe payments require stored submissions."] },
      },
    });
    await initStripe(props)(container);
    await vi.waitFor(() => expect(mocks.mount).toHaveBeenCalledOnce());
    form
      .querySelector<HTMLInputElement>('input[name="amount"]')!
      .dispatchEvent(new Event("change"));
    await vi.waitFor(() =>
      expect(renderErrors).toHaveBeenCalledWith({
        amount: ["Stripe payments require stored submissions."],
      }),
    );
    await vi.waitFor(() => expect(form.freeform.enableForm).toHaveBeenCalled());
  });

  it.each([
    ['<input name="amount" value="">', "input"],
    [
      '<input type="radio" name="amount" value="25"><input type="radio" name="amount" value="50">',
      "input",
    ],
    [
      '<input type="checkbox" name="amount[]" value="25"><input type="checkbox" name="amount[]" value="50">',
      "input",
    ],
  ])(
    "retries after invalid initial values are corrected: %s",
    async (inputs, selector) => {
      const { form, container, props, field, renderErrors } = fixture(inputs);
      mocks.create
        .mockRejectedValueOnce({
          response: { data: { errors: ["Invalid payment amount."] } },
        })
        .mockResolvedValueOnce({ data: { id: "pi_valid", secret: "secret" } });

      await initStripe(props)(container);
      await vi.waitFor(() =>
        expect(renderErrors).toHaveBeenCalledWith({
          amount: ["Invalid payment amount."],
        }),
      );
      expect(props.elementMap.has(field)).toBe(false);

      const input = form.querySelector<HTMLInputElement>(selector)!;
      input.value = "25";
      input.checked = true;
      input.dispatchEvent(new Event("change"));

      await vi.waitFor(() => expect(mocks.mount).toHaveBeenCalledOnce());
      expect(form.freeform._removeMessageFrom).toHaveBeenCalledWith(
        input,
        true,
      );
      expect(mocks.create).toHaveBeenCalledTimes(2);
      expect(props.elementMap.get(field)?.paymentIntent.id).toBe("pi_valid");
      expect(
        form.querySelector<HTMLInputElement>("[data-freeform-stripe-intent]")
          ?.value,
      ).toBe("pi_valid");
      await initStripe(props)(container);
      expect(mocks.create).toHaveBeenCalledTimes(2);
    },
  );

  it("retries a fixed payment when storage opt-in is checked", async () => {
    mocks.amountFields = [];
    mocks.storageOptInField = "consent";
    const { form, container, props, field } = fixture(
      '<input type="hidden" name="consent" value=""><input type="checkbox" name="consent" value="yes">',
    );
    mocks.create
      .mockRejectedValueOnce({
        response: {
          data: { errors: ["Stripe payments require stored submissions."] },
        },
      })
      .mockResolvedValueOnce({ data: { id: "pi_valid", secret: "secret" } });

    await initStripe(props)(container);
    await vi.waitFor(() =>
      expect(field.textContent).toBe(
        "Stripe payments require stored submissions.",
      ),
    );
    const checkbox = form.querySelector<HTMLInputElement>(
      'input[type="checkbox"]',
    )!;
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event("change"));
    await vi.waitFor(() => expect(mocks.mount).toHaveBeenCalledOnce());
    expect(mocks.create).toHaveBeenCalledTimes(2);
    expect(props.elementMap.get(field)?.paymentIntent.id).toBe("pi_valid");
  });

  it("keeps recovery available after repeated validation failures", async () => {
    const { form, container, props, renderErrors } = fixture(
      '<input name="amount">',
    );
    mocks.create
      .mockRejectedValueOnce({
        response: { data: { errors: ["Invalid amount."] } },
      })
      .mockRejectedValueOnce({
        response: { data: { errors: ["Still invalid."] } },
      })
      .mockResolvedValueOnce({ data: { id: "pi_valid", secret: "secret" } });

    await initStripe(props)(container);
    await vi.waitFor(() => expect(renderErrors).toHaveBeenCalledTimes(1));
    const input = form.querySelector<HTMLInputElement>("input[name=amount]")!;
    input.dispatchEvent(new Event("change"));
    await vi.waitFor(() => expect(renderErrors).toHaveBeenCalledTimes(2));
    input.value = "25";
    input.dispatchEvent(new Event("change"));
    await vi.waitFor(() => expect(mocks.mount).toHaveBeenCalledOnce());
    expect(mocks.create).toHaveBeenCalledTimes(3);
  });
});

function fixture(inputs: string) {
  document.body.innerHTML = `<form>${inputs}<div data-payment><div data-freeform-stripe-card></div><input data-freeform-stripe-intent></div></form>`;
  const form = document.querySelector<HTMLFormElement>("form")!;
  const container = form.querySelector<HTMLDivElement>("[data-payment]")!;
  const field = form.querySelector<HTMLDivElement>(
    "[data-freeform-stripe-card]",
  )!;
  const renderErrors = vi.fn();
  Object.assign(form, {
    freeform: {
      disableSubmit: vi.fn(),
      disableForm: vi.fn(),
      enableSubmit: vi.fn(),
      enableForm: vi.fn(),
      _renderFieldErrors: renderErrors,
      _removeMessageFrom: vi.fn(),
    },
  });
  const props: StripeFunctionConstructorProps = {
    form,
    elementMap: new WeakMap(),
  };
  return { form, container, field, props, renderErrors };
}
