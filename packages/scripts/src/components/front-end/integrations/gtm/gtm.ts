import { mountGtmTracking } from "@lib/plugin/handlers/form/gtm-tracking";

import { GTMManager } from "./manager";

(() => {
  const manager = GTMManager.getInstance();

  document
    .querySelectorAll<HTMLFormElement>("form[data-gtm-id]")
    .forEach((form) => {
      const gtmId = form.dataset.gtmId;
      if (gtmId) {
        manager.loadContainer(gtmId);
      }
    });

  mountGtmTracking(document);

  manager.observeNewForms();
})();
