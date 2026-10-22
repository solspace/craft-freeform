import type { FreeformResponseEvent } from "types/events";

type TrackingState = {
  bindings: WeakMap<EventTarget, EventListener>;
  responses: WeakSet<object>;
  requests: WeakSet<object>;
  submissions: Set<string>;
  parameters: Set<string>;
};

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
    __freeformGtmTracking?: TrackingState;
  }
}

const state = (): TrackingState => {
  window.dataLayer = window.dataLayer || [];
  window.__freeformGtmTracking ??= {
    bindings: new WeakMap(),
    responses: new WeakSet(),
    requests: new WeakSet(),
    submissions: new Set(),
    parameters: new Set(),
  };
  return window.__freeformGtmTracking;
};

export const trackGtmSubmission = (event: FreeformResponseEvent): void => {
  const { form, response } = event;
  const eventName = form?.dataset.gtmEvent || form?.dataset.gtmEventName;
  if (
    !eventName ||
    response?.success !== true ||
    response.finished !== true ||
    response.duplicate === true ||
    response.actions?.length ||
    response.gtm?.eligible === false
  ) {
    return;
  }

  const tracking = state();
  const request = (event as FreeformResponseEvent & { request?: object })
    .request;
  const identity = response.submissionId || response.submissionToken;
  const key = identity
    ? `${form.dataset.handle || response.hash}:${eventName}:${identity}`
    : undefined;
  if (
    tracking.responses.has(response) ||
    (request && tracking.requests.has(request)) ||
    (key && tracking.submissions.has(key))
  ) {
    return;
  }
  tracking.responses.add(response);
  if (request) tracking.requests.add(request);
  if (key) tracking.submissions.add(key);

  const pushEvent = form.freeform._dispatchEvent(
    "freeform-gtm-data-layer-push",
    { payload: {}, response },
  );
  if (pushEvent.defaultPrevented) return;

  const parameters = response.gtm?.parameters ?? {};
  const cleared = Object.fromEntries(
    [...tracking.parameters]
      .filter((name) => !(name in parameters))
      .map((name) => [name, null]),
  );
  tracking.parameters = new Set(Object.keys(parameters));

  window.dataLayer.push({
    event: response.gtm?.eventName || eventName,
    form: form.dataset.gtmEvent
      ? {
          handle: form.dataset.handle,
          finished: true,
          multipage: response.multipage,
          success: true,
        }
      : form.dataset.handle,
    submission: { id: response.submissionId },
    ...cleared,
    ...parameters,
    ...pushEvent.payload,
  });
};

export const mountGtmTracking = (target: EventTarget): (() => void) => {
  const tracking = state();
  if (tracking.bindings.has(target)) return () => {};
  const listener: EventListener = (event) =>
    trackGtmSubmission(event as FreeformResponseEvent);
  target.addEventListener("freeform-ajax-success", listener);
  tracking.bindings.set(target, listener);
  return () => {
    target.removeEventListener("freeform-ajax-success", listener);
    tracking.bindings.delete(target);
  };
};
