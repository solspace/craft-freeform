/** Reuse Craft's pane and secondary navigation around the existing settings form. */
export function enhanceCraft6Settings(root: ParentNode = document): void {
  const pane = root.querySelector<HTMLElement>(
    "#freeform-settings-pane, #freeform-submission-pane",
  );
  const main =
    root.querySelector<HTMLElement>("#main-form") ??
    root.querySelector<HTMLElement>("#main");
  const content = main?.querySelector<HTMLElement>("#main-content");
  const header = main?.querySelector<HTMLElement>("#header-container");
  if (!pane || !main || !content || !header || pane.dataset.enhanced) return;

  main.insertBefore(pane, header);
  const layout = document.createElement("div");
  layout.className =
    pane.id === "freeform-submission-pane"
      ? "freeform-secondary-layout freeform-submission-layout"
      : "freeform-secondary-layout";
  layout.slot = "body";
  pane.append(layout);
  layout.append(header, content);
  for (const footer of main.querySelectorAll<HTMLElement>(
    ":scope > .freeform-footer-notices, :scope > #footer",
  )) {
    layout.append(footer);
  }
  // Craft alpha's tab strip removes its handlers on disconnect and does not
  // bind them again after reparenting. Reinitialize the page strip after this
  // initial layout move; its external panels and live controls stay intact.
  for (const tabs of layout.querySelectorAll<HTMLElement>(
    "craft-tabs[data-freeform-page-tabs]",
  )) {
    tabs.replaceWith(tabs.cloneNode(true));
  }
  if (pane.id === "freeform-submission-pane") {
    const rail = pane.querySelector<HTMLElement & { close?: () => void }>(
      "#freeform-info-tabs",
    );
    if (rail) {
      const liveRail = rail.cloneNode(true) as HTMLElement & {
        close?: () => void;
      };
      rail.remove();
      liveRail.classList.add("freeform-info-rail");
      main.append(liveRail);
      pane
        .querySelector("#freeform-info-close")
        ?.addEventListener("click", () => liveRail.close?.());
    }
  }
  pane.hidden = false;
  pane.dataset.enhanced = "true";
}
