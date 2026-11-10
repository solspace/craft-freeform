/** Refresh when results open so theme changes and initially hidden forms are respected. */
export function styleLocationSuggestions(
  input: HTMLInputElement,
  panel: HTMLElement,
  list: HTMLElement,
  attribution: HTMLElement,
): void {
  const style = getComputedStyle(input);
  let background = style.backgroundColor;
  let parent = input.parentElement;
  const transparent = (color: string) =>
    !color || color === "transparent" || /rgba\([^)]*,\s*0\s*\)$/.test(color);
  while (transparent(background) && parent) {
    background = getComputedStyle(parent).backgroundColor;
    parent = parent.parentElement;
  }
  if (transparent(background)) background = "Canvas";
  // A focused input may use a full-contrast border; keep the menu's frame subtle.
  const border =
    typeof CSS !== "undefined" &&
    CSS.supports?.("color", "color-mix(in srgb, white, transparent)")
      ? `color-mix(in srgb, ${style.color} 25%, transparent)`
      : "rgba(127,127,127,.4)";

  panel.style.cssText = `
    position:absolute;top:6px;inset-inline:0;z-index:1000;box-sizing:border-box;
    color:var(--ff-location-color,${style.color});
    background:var(--ff-location-background,${background});
    border:1px solid var(--ff-location-border,${border});
    border-radius:var(--ff-location-radius,${style.borderTopLeftRadius || "6px"});
    box-shadow:var(--ff-location-shadow,0 8px 24px #0003,0 2px 6px #0001);
    font-family:${style.fontFamily};font-size:${style.fontSize};
    font-weight:${style.fontWeight};letter-spacing:${style.letterSpacing};line-height:1.4;
    text-align:start;overflow:hidden;
  `;
  panel.style.setProperty(
    "--ff-location-row-height",
    `${Math.max(36, Math.min(48, input.getBoundingClientRect().height))}px`,
  );
  panel.style.setProperty(
    "--ff-location-row-radius",
    `${Math.max(0, (parseFloat(style.borderTopLeftRadius) || 0) - 2)}px`,
  );
  list.style.cssText =
    "padding:4px;max-height:18rem;max-height:min(18rem,50vh);overflow-y:auto;overscroll-behavior:contain;";
  attribution.className = "freeform-location-attribution";
  attribution.style.cssText = `
    padding:8px 12px;border-top:1px solid var(--ff-location-border,${border});
    text-align:right;white-space:nowrap;font:400 12px/16px sans-serif;
    color:inherit;letter-spacing:normal;
  `;
}

export function createLocationSuggestion(text: string): HTMLDivElement {
  const option = document.createElement("div");
  option.className = "freeform-location-suggestion";
  option.style.cssText = `
    display:flex;align-items:center;gap:10px;min-height:var(--ff-location-row-height,40px);
    padding:var(--ff-location-option-padding,8px 12px);box-sizing:border-box;
    border-radius:var(--ff-location-row-radius,4px);cursor:pointer;line-height:1.4;
  `;
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("aria-hidden", "true");
  icon.setAttribute("focusable", "false");
  icon.style.cssText = "flex:0 0 1em;width:1em;height:1em;opacity:.6;";
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute(
    "d",
    "M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  );
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", "currentColor");
  path.setAttribute("stroke-width", "1.75");
  path.setAttribute("stroke-linejoin", "round");
  icon.append(path);
  const label = document.createElement("span");
  label.style.cssText = "min-width:0;overflow-wrap:anywhere;";
  label.textContent = text;
  option.append(icon, label);
  return option;
}

/** Decorate the visible lookup without changing its label or keyboard behavior. */
export function mountLocationSearchIcon(input: HTMLInputElement) {
  const host = input.parentElement!;
  let icon = host.querySelector<HTMLElement>("[data-freeform-location-icon]");
  const generated = !icon;
  const style = getComputedStyle(input);
  const originalPadding = input.style.paddingInlineStart;
  const originalPosition = host.style.position;
  const positioned =
    getComputedStyle(host).position === "static" ||
    !getComputedStyle(host).position;
  if (positioned) host.style.position = "relative";
  host.style.setProperty(
    "--ff-location-input-padding",
    // Widget styles can finish loading after mount; keep an inset when the
    // browser still reports the input's unstyled zero padding.
    parseFloat(style.paddingInlineStart || style.paddingLeft) > 0
      ? style.paddingInlineStart || style.paddingLeft
      : "12px",
  );
  if (!icon) {
    icon = document.createElement("span");
    icon.className = "freeform-location-search-icon";
    icon.setAttribute("data-freeform-location-icon", "");
    icon.style.cssText =
      "position:absolute;inset-inline-start:var(--ff-location-input-padding,12px);top:var(--ff-location-input-top,0px);height:var(--ff-location-input-height,40px);display:inline-flex;align-items:center;pointer-events:none;color:var(--ff-location-icon-color,inherit);opacity:.65;";
    input.style.paddingInlineStart =
      "calc(var(--ff-location-input-padding,12px) + var(--ff-location-icon-space,26px))";
    host.append(icon);
  }
  icon.setAttribute("aria-hidden", "true");
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", "18");
  svg.setAttribute("height", "18");
  svg.setAttribute("focusable", "false");
  svg.style.display = "block";
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", "currentColor");
  path.setAttribute("stroke-width", "1.75");
  path.setAttribute("stroke-linecap", "round");
  path.setAttribute("stroke-linejoin", "round");
  svg.append(path);
  icon.append(svg);
  const measure = () => {
    host.style.setProperty("--ff-location-input-top", `${input.offsetTop}px`);
    host.style.setProperty(
      "--ff-location-input-height",
      `${input.getBoundingClientRect().height || 40}px`,
    );
  };
  measure();
  const observer =
    typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(measure)
      : undefined;
  observer?.observe(input);
  host.setAttribute("data-freeform-location-search-ready", "");
  return {
    setSelected(selected: boolean) {
      icon!.dataset.state = selected ? "selected" : "search";
      path.setAttribute(
        "d",
        selected
          ? "M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
          : "M18 10.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0ZM16 16l5 5",
      );
    },
    destroy() {
      observer?.disconnect();
      svg.remove();
      if (generated) {
        icon!.remove();
        input.style.paddingInlineStart = originalPadding;
      }
      if (positioned) host.style.position = originalPosition;
      host.removeAttribute("data-freeform-location-search-ready");
      host.style.removeProperty("--ff-location-input-padding");
      host.style.removeProperty("--ff-location-input-height");
      host.style.removeProperty("--ff-location-input-top");
    },
  };
}
