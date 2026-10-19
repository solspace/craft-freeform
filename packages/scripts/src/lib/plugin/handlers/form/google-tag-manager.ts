import type Freeform from "@components/front-end/plugin/freeform";
import { mountGtmTracking } from "./gtm-tracking";

class GoogleTagManager {
  freeform: Freeform;
  form;

  constructor(freeform: Freeform) {
    window.dataLayer = window.dataLayer || [];

    this.freeform = freeform;
    this.form = freeform.form;

    if (!this.freeform.has("data-gtm")) {
      return;
    }

    this.form.dataset.gtmEventName ||= "form-submission";
    mountGtmTracking(this.form);
  }

  reload = () => {};
}

export default GoogleTagManager;
