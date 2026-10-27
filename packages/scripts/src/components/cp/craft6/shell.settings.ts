/** Reuse Craft's pane and secondary navigation around the existing settings form. */
export function enhanceCraft6Settings(root: ParentNode = document): void {
  const pane = root.querySelector<HTMLElement>("#freeform-settings-pane");
  const main =
    root.querySelector<HTMLElement>("#main-form") ??
    root.querySelector<HTMLElement>("#main");
  const content = main?.querySelector<HTMLElement>("#main-content");
  const header = main?.querySelector<HTMLElement>("#header-container");
  if (!pane || !main || !content || !header || pane.dataset.enhanced) return;

  main.insertBefore(pane, header);
  const layout = document.createElement("div");
  layout.className = "freeform-secondary-layout";
  layout.slot = "body";
  pane.append(layout);
  layout.append(header, content);
  for (const footer of main.querySelectorAll<HTMLElement>(
    ":scope > .freeform-footer-notices, :scope > #footer",
  )) {
    layout.append(footer);
  }
  pane.hidden = false;
  pane.dataset.enhanced = "true";
}
