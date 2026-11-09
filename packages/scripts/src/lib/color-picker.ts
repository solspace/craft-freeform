import palette from "../../../plugin/src/Library/Helpers/color-palette.json";

export const colorPresets = palette;
export function normalizeHex(value?: string | null): string | null {
  if (!value) return null;
  const hex = value.trim().replace(/^#?/, "#");
  if (/^#[a-f\d]{3}$/i.test(hex))
    return `#${hex
      .slice(1)
      .split("")
      .map((c) => c + c)
      .join("")}`.toLowerCase();
  return /^#[a-f\d]{6}$/i.test(hex) ? hex.toLowerCase() : null;
}
const transparent = (value: string) =>
  /^transparent$/i.test(value.trim()) ||
  /^rgba\(\s*[^,]+,\s*[^,]+,\s*[^,]+,\s*0(?:\.0+)?%?\s*\)$/i.test(value.trim());
function fromHex(hex: string) {
  const [r, g, b] = [1, 3, 5].map(
    (i) => parseInt(hex.slice(i, i + 2), 16) / 255,
  );
  const v = Math.max(r, g, b),
    d = v - Math.min(r, g, b);
  let h = !d
    ? 0
    : v === r
      ? ((g - b) / d) % 6
      : v === g
        ? (b - r) / d + 2
        : (r - g) / d + 4;
  h = (h * 60 + 360) % 360;
  return { h, s: v ? d / v : 0, v };
}
function toHex({ h, s, v }: { h: number; s: number; v: number }) {
  const c = v * s,
    x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
    m = v - c;
  const rgb =
    h < 60
      ? [c, x, 0]
      : h < 120
        ? [x, c, 0]
        : h < 180
          ? [0, c, x]
          : h < 240
            ? [0, x, c]
            : h < 300
              ? [x, 0, c]
              : [c, 0, x];
  return `#${rgb
    .map((n) =>
      Math.round((n + m) * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}
export type ColorPickerOptions = {
  value?: string | null;
  disabled?: boolean;
  allowTransparent?: boolean;
  allowInherited?: boolean;
  transparentLabel?: string;
  ariaLabel?: string;
  ariaInvalid?: boolean;
  errorId?: string;
  translate?: (text: string) => string;
  onChange: (value: string) => void;
};
let nextPickerId = 0;
export function mountColorPicker(
  root: HTMLElement,
  options: ColorPickerOptions,
) {
  const t = options.translate ?? ((s) => s);
  let value = options.value ?? "",
    draft: string | null = null,
    solid = normalizeHex(value) ?? "#000000",
    hsv = fromHex(solid),
    disabled = !!options.disabled;
  const events = new AbortController(),
    signal = events.signal;
  root.classList.add("ff-color-picker");
  const presets = document.createElement("div");
  presets.className = "ff-color-presets";
  presets.setAttribute("role", "group");
  presets.setAttribute("aria-label", t("Preset colors"));
  const row = document.createElement("div");
  row.className = "ff-color-input-row";
  const preview = document.createElement("button");
  preview.type = "button";
  preview.className = "ff-color-preview";
  preview.dataset.colorPreview = "true";
  preview.setAttribute("aria-label", t("Choose color"));
  const text = document.createElement("input");
  text.type = "text";
  text.className = "ff-color-hex";
  text.maxLength = 64;
  text.spellcheck = false;
  text.autocomplete = "off";
  text.placeholder = "#RRGGBB";
  text.setAttribute("aria-label", options.ariaLabel ?? t("Color value"));
  const popup = document.createElement("div");
  popup.className = "ff-color-popover dropdown-rollout";
  popup.id = `ff-color-popover-${++nextPickerId}`;
  popup.setAttribute("role", "dialog");
  popup.setAttribute("aria-label", t("Custom color"));
  popup.hidden = true;
  for (const b of [preview]) {
    b.setAttribute("aria-controls", popup.id);
    b.setAttribute("aria-haspopup", "dialog");
    b.setAttribute("aria-expanded", "false");
  }
  const strip = document.createElement("div");
  strip.className =
    "ff-color-popover ff-color-picker ff-color-presets-popover dropdown-rollout";
  strip.setAttribute("role", "group");
  strip.setAttribute("aria-label", t("Preset colors"));
  strip.hidden = true;
  strip.id = `${popup.id}-presets`;
  let leaveTimer: ReturnType<typeof setTimeout> | undefined;
  let suppressPreviewFocus = false;
  let openingTimer: ReturnType<typeof setTimeout> | undefined;
  const header = document.createElement("div");
  header.className = "ff-color-popover-header";
  const title = document.createElement("span");
  title.textContent = t("Custom color");
  const done = document.createElement("button");
  done.type = "button";
  done.textContent = t("Done");
  header.append(title, done);
  const plane = document.createElement("div");
  plane.className = "ff-color-plane";
  plane.tabIndex = 0;
  plane.setAttribute("role", "slider");
  plane.setAttribute("aria-valuemin", "0");
  plane.setAttribute("aria-valuemax", "100");
  plane.setAttribute(
    "aria-description",
    t("Use Left/Right for saturation and Up/Down for brightness."),
  );
  plane.setAttribute("aria-label", t("Saturation and brightness"));
  const marker = document.createElement("span");
  marker.className = "ff-color-marker";
  plane.append(marker);
  const hue = document.createElement("input");
  hue.type = "range";
  hue.className = "ff-color-hue";
  hue.min = "0";
  hue.max = "359";
  hue.setAttribute("aria-label", t("Hue"));
  const hueLabel = document.createElement("label");
  hueLabel.className = "ff-color-hue-label";
  hueLabel.textContent = t("Hue");
  hueLabel.append(hue);
  popup.append(header, plane, hueLabel);
  const announcement = document.createElement("span");
  announcement.className = "ff-color-announcement";
  announcement.setAttribute("role", "status");
  announcement.setAttribute("aria-live", "polite");
  const choices = palette.map(({ label, value: hex }) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "ff-color-swatch";
    b.setAttribute("aria-label", t(label));
    b.title = t(label);
    b.style.setProperty("--ff-swatch-color", hex);
    b.addEventListener(
      "click",
      () => {
        emit(hex);
        if (!strip.hidden) closeStrip(true);
      },
      { signal },
    );
    presets.append(b);
    return { button: b, hex };
  });
  row.append(preview, text);
  let transparency: HTMLInputElement | undefined,
    inheritance: HTMLInputElement | undefined;
  function toggle(label: string, action: (checked: boolean) => void) {
    const holder = document.createElement("label");
    holder.className = "ff-color-toggle";
    const input = document.createElement("input");
    input.type = "checkbox";
    holder.append(input, document.createTextNode(t(label)));
    input.addEventListener("change", () => action(input.checked), { signal });
    row.append(holder);
    return input;
  }
  const transparentLabel = options.transparentLabel ?? "Transparent";
  if (options.allowTransparent)
    transparency = toggle(transparentLabel, (checked) =>
      emit(checked ? "rgba(0,0,0,0)" : solid),
    );
  if (options.allowInherited)
    inheritance = toggle("Inherit", (checked) =>
      emit(checked ? "currentColor" : solid),
    );
  root.append(row, announcement);
  function display() {
    return options.allowInherited &&
      (!value || value.toLowerCase() === "currentcolor")
      ? t("Inherited")
      : transparent(value)
        ? t(transparentLabel)
        : (normalizeHex(value) ?? value);
  }
  function render() {
    text.value = draft ?? display();
    preview.value = solid;
    preview.dataset.transparent = String(transparent(value));
    const inherited =
      !!options.allowInherited &&
      (!value || value.toLowerCase() === "currentcolor");
    preview.dataset.inherited = String(inherited);
    preview.style.backgroundColor =
      transparent(value) || inherited
        ? "transparent"
        : value && value.toLowerCase() !== "currentcolor"
          ? (normalizeHex(value) ?? value)
          : solid;
    const hex = normalizeHex(value);
    choices.forEach((c) => {
      c.button.setAttribute("aria-pressed", String(c.hex === hex));
    });
    if (transparency) transparency.checked = transparent(value);
    if (inheritance)
      inheritance.checked = !value || value.toLowerCase() === "currentcolor";
    popup.style.setProperty("--ff-picker-hue", String(hsv.h));
    marker.style.left = `${hsv.s * 100}%`;
    marker.style.top = `${(1 - hsv.v) * 100}%`;
    hue.value = String(Math.round(hsv.h));
    plane.setAttribute("aria-valuenow", String(Math.round(hsv.s * 100)));
    plane.setAttribute(
      "aria-valuetext",
      `${t("Saturation")} ${Math.round(hsv.s * 100)}%, ${t("Brightness")} ${Math.round(hsv.v * 100)}%`,
    );
  }
  function emit(next: string, preserveHue = false) {
    value = next;
    const hex = normalizeHex(next);
    if (hex) {
      solid = hex;
      if (!preserveHue) hsv = fromHex(hex);
    }
    render();
    options.onChange(next);
  }
  function fromControls() {
    emit(toHex(hsv), true);
  }
  function positionStrip() {
    if (strip.hidden) return;
    const r = preview.getBoundingClientRect();
    const vw = document.documentElement.clientWidth || 1024;
    const vh = window.innerHeight || 768;
    strip.style.left = `${Math.max(8, Math.min(r.left, vw - strip.offsetWidth - 8))}px`;
    strip.style.top = `${Math.max(8, Math.min(r.bottom + 6, vh - strip.offsetHeight - 8))}px`;
  }
  function cancelLeave() {
    clearTimeout(leaveTimer);
  }
  function closeStrip(focus = false) {
    cancelLeave();
    clearTimeout(openingTimer);
    openingTimer = undefined;
    if (strip.hidden) return;
    strip.classList.remove("is-closing");
    strip.hidden = true;
    strip.remove();
    preview.setAttribute("aria-controls", popup.id);
    preview.setAttribute("aria-expanded", "false");
    if (focus) {
      suppressPreviewFocus = true;
      preview.focus();
      suppressPreviewFocus = false;
    }
  }
  function showStrip() {
    cancelLeave();
    if (
      disabled ||
      !popup.hidden ||
      suppressPreviewFocus ||
      openingTimer !== undefined
    )
      return;
    strip.append(presets);
    document.body.append(strip);
    strip.hidden = false;
    preview.setAttribute("aria-controls", strip.id);
    preview.setAttribute("aria-expanded", "true");
    positionStrip();
  }
  function scheduleLeave() {
    if (openingTimer !== undefined) return;
    cancelLeave();
    leaveTimer = setTimeout(() => {
      if (
        document.activeElement !== preview &&
        !strip.contains(document.activeElement)
      )
        closeStrip();
    }, 180);
  }
  function position() {
    positionStrip();
    if (popup.hidden) return;
    const r = preview.getBoundingClientRect(),
      w = popup.offsetWidth || 268,
      h = popup.offsetHeight || 290;
    const vw = document.documentElement.clientWidth || 1024,
      vh = window.innerHeight || 768;
    popup.style.left = `${Math.max(8, Math.min(r.left, vw - w - 8))}px`;
    popup.style.top = `${Math.max(8, Math.min(r.bottom + 6, vh - h - 8))}px`;
  }
  function close(focus = false) {
    if (popup.hidden) return;
    popup.hidden = true;
    popup.remove();
    preview.setAttribute("aria-expanded", "false");
    if (focus) {
      suppressPreviewFocus = true;
      preview.focus();
      suppressPreviewFocus = false;
    }
  }
  function open() {
    if (disabled) return;
    if (!popup.hidden) {
      close();
      return;
    }
    closeStrip();
    document.body.append(popup);
    popup.hidden = false;
    preview.setAttribute("aria-expanded", "true");
    position();
    hue.focus();
  }
  preview.addEventListener(
    "click",
    () => {
      if (disabled || openingTimer !== undefined) return;
      if (strip.hidden) {
        open();
        return;
      }
      cancelLeave();
      strip.classList.add("is-closing");
      const reducedMotion = window.matchMedia?.(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      openingTimer = setTimeout(
        () => {
          openingTimer = undefined;
          closeStrip();
          open();
        },
        reducedMotion ? 0 : 180,
      );
    },
    { signal },
  );
  preview.addEventListener("pointerenter", showStrip, { signal });
  preview.addEventListener("pointerleave", scheduleLeave, { signal });
  preview.addEventListener("focus", showStrip, { signal });
  strip.addEventListener("pointerenter", cancelLeave, { signal });
  strip.addEventListener("pointerleave", scheduleLeave, { signal });
  preview.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        showStrip();
        choices[0].button.focus();
      }
    },
    { signal },
  );
  done.addEventListener("click", () => close(true), { signal });
  function onEscape(e: KeyboardEvent) {
    if (e.key === "Escape" && (!popup.hidden || !strip.hidden)) {
      e.preventDefault();
      e.stopPropagation();
      if (!strip.hidden) closeStrip(true);
      else close(true);
    }
  }
  strip.addEventListener("keydown", onEscape, { signal });
  root.addEventListener("keydown", onEscape, { signal });
  popup.addEventListener("keydown", onEscape, { signal });
  popup.addEventListener(
    "keydown",
    (e) => {
      if (e.key !== "Tab") return;
      const focusable = Array.from(
        popup.querySelectorAll<HTMLButtonElement | HTMLInputElement>(
          "button,input,[tabindex='0']",
        ),
      );
      const index = focusable.indexOf(
        document.activeElement as HTMLInputElement,
      );
      if (e.shiftKey && index === 0) {
        e.preventDefault();
        focusable.at(-1)?.focus();
      } else if (!e.shiftKey && index === focusable.length - 1) {
        e.preventDefault();
        focusable[0]?.focus();
      }
    },
    { signal },
  );
  document.addEventListener(
    "pointerdown",
    (e) => {
      if (
        !root.contains(e.target as Node) &&
        !popup.contains(e.target as Node) &&
        !strip.contains(e.target as Node)
      ) {
        close();
        closeStrip();
      }
    },
    { signal },
  );
  document.addEventListener(
    "focusin",
    (e) => {
      if (
        !root.contains(e.target as Node) &&
        !popup.contains(e.target as Node) &&
        !strip.contains(e.target as Node)
      ) {
        close();
        closeStrip();
      }
    },
    { signal },
  );
  document.addEventListener(
    "focusin",
    (e) => {
      if (e.target !== preview && !strip.contains(e.target as Node))
        closeStrip();
    },
    { signal },
  );
  window.addEventListener("resize", position, { signal });
  document.addEventListener("scroll", position, { signal, capture: true });
  hue.addEventListener(
    "input",
    () => {
      hsv.h = Number(hue.value);
      fromControls();
    },
    { signal },
  );
  plane.addEventListener(
    "keydown",
    (e) => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key))
        return;
      e.preventDefault();
      const step = e.shiftKey ? 0.1 : 0.01;
      if (e.key === "ArrowLeft") hsv.s = Math.max(0, hsv.s - step);
      if (e.key === "ArrowRight") hsv.s = Math.min(1, hsv.s + step);
      if (e.key === "ArrowDown") hsv.v = Math.max(0, hsv.v - step);
      if (e.key === "ArrowUp") hsv.v = Math.min(1, hsv.v + step);
      fromControls();
    },
    { signal },
  );
  function at(e: PointerEvent) {
    const r = plane.getBoundingClientRect();
    if (!r.width || !r.height) return;
    hsv.s = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    hsv.v = 1 - Math.max(0, Math.min(1, (e.clientY - r.top) / r.height));
    fromControls();
  }
  plane.addEventListener(
    "pointerdown",
    (e) => {
      plane.focus();
      plane.setPointerCapture?.(e.pointerId);
      at(e);
    },
    { signal },
  );
  plane.addEventListener(
    "pointermove",
    (e) => {
      if (plane.hasPointerCapture?.(e.pointerId)) at(e);
    },
    { signal },
  );
  function edit() {
    draft = text.value;
    const raw = text.value.trim(),
      lower = raw.toLowerCase();
    const next =
      options.allowInherited &&
      [
        "inherit",
        "inherited",
        "currentcolor",
        t("Inherited").toLowerCase(),
      ].includes(lower)
        ? "currentColor"
        : options.allowTransparent &&
            [
              "transparent",
              transparentLabel.toLowerCase(),
              t(transparentLabel).toLowerCase(),
            ].includes(lower)
          ? "rgba(0,0,0,0)"
          : normalizeHex(raw);
    if (next) emit(next);
  }
  text.addEventListener("input", edit, { signal });
  text.addEventListener(
    "blur",
    () => {
      draft = null;
      text.value = display();
    },
    { signal },
  );
  text.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        edit();
        draft = null;
        text.value = display();
      }
    },
    { signal },
  );
  function update(next: Partial<ColorPickerOptions>) {
    if (next.value !== undefined || next.value === null) {
      if ((next.value ?? "") !== value) draft = null;
      value = next.value ?? "";
      const hex = normalizeHex(value);
      if (hex) {
        solid = hex;
        hsv = fromHex(hex);
      }
      render();
    }
    if (next.disabled !== undefined) {
      disabled = next.disabled;
      if (disabled) {
        close();
        closeStrip();
      }
      root
        .querySelectorAll<HTMLButtonElement | HTMLInputElement>("button,input")
        .forEach((e) => {
          e.disabled = disabled;
        });
    }
    if (next.ariaInvalid) text.setAttribute("aria-invalid", "true");
    else text.removeAttribute("aria-invalid");
    if (next.errorId) text.setAttribute("aria-errormessage", next.errorId);
    else text.removeAttribute("aria-errormessage");
  }
  render();
  update(options);
  return {
    update,
    close() {
      close();
      closeStrip();
    },
    destroy() {
      events.abort();
      cancelLeave();
      clearTimeout(openingTimer);
      strip.remove();
      popup.remove();
      root.replaceChildren();
    },
  };
}
export function initColorPickers(root: ParentNode = document) {
  const mounted: ReturnType<typeof mountColorPicker>[] = [];
  root
    .querySelectorAll<HTMLElement>("[data-ff-color-picker]")
    .forEach((holder) => {
      if (holder.dataset.colorReady) return;
      const input = holder.querySelector<HTMLInputElement>(
        "input[data-color-value]",
      );
      if (!input) return;
      holder.dataset.colorReady = "true";
      input.hidden = true;
      const mount = document.createElement("div");
      holder.append(mount);
      mounted.push(
        mountColorPicker(mount, {
          value: input.value,
          ariaLabel: input.getAttribute("aria-label") ?? undefined,
          disabled: input.disabled,
          allowTransparent: holder.dataset.allowTransparent === "true",
          translate: (text) =>
            typeof window.Craft !== "undefined"
              ? window.Craft.t("freeform", text)
              : text,
          onChange: (value) => {
            input.value = value;
            input.dispatchEvent(new Event("change", { bubbles: true }));
          },
        }),
      );
    });
  return mounted;
}
