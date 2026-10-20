import type { FreeformResponse, FreeformResponseEvent } from "types/events";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { mountGtmTracking } from "./gtm-tracking";

let form: HTMLFormElement;
let hook: ReturnType<typeof vi.fn>;
let cleanup: (() => void)[];
beforeEach(() => {
  delete window.__freeformGtmTracking;
  window.dataLayer = [];
  document.body.innerHTML =
    '<form data-gtm-event="generate_lead" data-handle="quote"><select name="insurance"><option value="home">Home</option><option value="boat">Boat</option></select></form>';
  form = document.querySelector("form")!;
  hook = vi.fn(() =>
    Object.assign(
      new Event("freeform-gtm-data-layer-push", { cancelable: true }),
      { payload: {} },
    ),
  );
  Object.assign(form, { freeform: { _dispatchEvent: hook } });
  cleanup = [mountGtmTracking(document), mountGtmTracking(form)];
});
afterEach(() => {
  cleanup.forEach((dispose) => {
    dispose();
  });
  document.body.innerHTML = "";
  delete window.__freeformGtmTracking;
});
function response(overrides: Partial<FreeformResponse> = {}): FreeformResponse {
  return {
    success: true,
    finished: true,
    submissionId: 42,
    submissionToken: "private-token",
    multipage: false,
    values: { email: "private@example.com", insurance: "boat" },
    gtm: {
      eligible: true,
      eventName: "generate_lead",
      parameters: {
        form_name: "Get a Quote",
        insurance_type: "boat",
        office_location: "victoria",
      },
    },
    ...overrides,
  } as FreeformResponse;
}
function success(data = response(), request = {}): FreeformResponseEvent {
  const event = Object.assign(new Event("freeform-ajax-success"), {
    form,
    response: data,
    request,
  }) as FreeformResponseEvent;
  // Freeform dispatches the same event on document and then the form.
  document.dispatchEvent(event);
  form.dispatchEvent(event);
  return event;
}
it("sends mapped submitted values after DOM reset and excludes other values and submission tokens", () => {
  const select = form.querySelector("select")!;
  select.value = "boat";
  form.reset();
  expect(select.value).toBe("home");
  success();
  expect(window.dataLayer).toEqual([
    {
      event: "generate_lead",
      form_name: "Get a Quote",
      insurance_type: "boat",
      office_location: "victoria",
      form: {
        handle: "quote",
        finished: true,
        multipage: false,
        success: true,
      },
      submission: { id: 42 },
    },
  ]);
  expect(JSON.stringify(window.dataLayer)).not.toMatch(/private|token|email/);
  expect(hook).toHaveBeenCalledOnce();
});
it.each([
  { success: false },
  { finished: false },
  { duplicate: true },
  { actions: ["payment"] },
  { gtm: { eligible: false, eventName: "generate_lead", parameters: {} } },
])(
  "does not track failed, intermediate, rejected, or duplicate submissions: %j",
  (overrides) => {
    success(response(overrides));
    expect(window.dataLayer).toEqual([]);
    expect(hook).not.toHaveBeenCalled();
  },
);
it("does not track visits, clicks, submit attempts, or AJAX errors", () => {
  for (const type of [
    "freeform-ready",
    "click",
    "submit",
    "freeform-ajax-before-submit",
    "freeform-ajax-error",
  ])
    form.dispatchEvent(new Event(type, { bubbles: true }));
  expect(window.dataLayer).toEqual([]);
});
it("deduplicates repeated responses, cloned responses, and repeated listener installation", () => {
  cleanup.push(mountGtmTracking(document), mountGtmTracking(form));
  const data = response();
  success(data);
  success(data);
  success(response());
  success(response({ submissionId: 43 }));
  expect(window.dataLayer).toHaveLength(2);
  expect(hook).toHaveBeenCalledTimes(2);
});
it("deduplicates by request when storage and submission tokens are unavailable", () => {
  const request = {};
  success(
    response({ submissionId: undefined, submissionToken: undefined }),
    request,
  );
  success(
    response({ submissionId: undefined, submissionToken: undefined }),
    request,
  );
  success(response({ submissionId: undefined, submissionToken: undefined }));
  expect(window.dataLayer).toHaveLength(2);
});
it("uses submission tokens only internally to deduplicate submissions without IDs", () => {
  success(response({ submissionId: undefined }));
  success(response({ submissionId: undefined }));
  expect(window.dataLayer).toHaveLength(1);
  expect(JSON.stringify(window.dataLayer)).not.toContain("private-token");
});
it("preserves the customization hook and lets it cancel tracking", () => {
  hook.mockImplementationOnce(() => ({ payload: { campaign: "summer" } }));
  success();
  expect(window.dataLayer[0]).toMatchObject({ campaign: "summer" });
  hook.mockImplementationOnce(() => ({ defaultPrevented: true, payload: {} }));
  success(response({ submissionId: 43 }));
  expect(window.dataLayer).toHaveLength(1);
});
it("ignores forms that have not enabled tracking", () => {
  delete form.dataset.gtmEvent;
  success();
  expect(window.dataLayer).toEqual([]);
});
it("supports existing legacy event-name attributes without duplicate tracking", () => {
  delete form.dataset.gtmEvent;
  form.dataset.gtmEventName = "generate_lead";
  success();
  expect(window.dataLayer).toHaveLength(1);
  expect(window.dataLayer[0].form).toBe("quote");
});

it("clears previously mapped values when a subsequent form omits them", () => {
  success();
  success(
    response({
      submissionId: 43,
      gtm: {
        eligible: true,
        eventName: "generate_lead",
        parameters: { form_name: "Another Form", office_location: "sidney" },
      },
    }),
  );
  expect(window.dataLayer[1]).toMatchObject({
    form_name: "Another Form",
    insurance_type: null,
    office_location: "sidney",
  });
});
