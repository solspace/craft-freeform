import { toolbarIcons } from "../../../lib/tinymce-toolbar-icons";

type ToolbarButton = { value: string; label: string; symbol: string };
const buttons: ToolbarButton[] = [
  { value: "blocks", label: "Text style", symbol: "¶" },
  { value: "bold", label: "Bold", symbol: "B" },
  { value: "italic", label: "Italic", symbol: "I" },
  { value: "underline", label: "Underline", symbol: "U" },
  { value: "strikethrough", label: "Strikethrough", symbol: "S" },
  { value: "forecolor", label: "Text color", symbol: "A" },
  { value: "backcolor", label: "Background color", symbol: "▣" },
  { value: "align", label: "Alignment", symbol: "≡" },
  { value: "numlist", label: "Numbered list", symbol: "1." },
  { value: "bullist", label: "Bullet list", symbol: "•" },
  { value: "link", label: "Link", symbol: "↗" },
  { value: "image", label: "Image", symbol: "▧" },
  { value: "table", label: "Table", symbol: "▦" },
  { value: "removeformat", label: "Clear formatting", symbol: "Tx" },
  { value: "code", label: "Source code", symbol: "‹›" },
  { value: "undo", label: "Undo", symbol: "↶" },
  { value: "redo", label: "Redo", symbol: "↷" },
  { value: "superscript", label: "Superscript", symbol: "x²" },
  { value: "subscript", label: "Subscript", symbol: "x₂" },
  { value: "outdent", label: "Decrease indent", symbol: "⇤" },
  { value: "indent", label: "Increase indent", symbol: "⇥" },
];

const tr = (message: string, params: Record<string, string> = {}): string => {
  const craft = (
    window as typeof window & {
      Craft?: {
        t(
          category: string,
          text: string,
          params: Record<string, string>,
        ): string;
      };
    }
  ).Craft;
  return (
    craft?.t("freeform", message, params) ||
    message.replace(/\{(\w+)\}/g, (_, key) => params[key] || `{${key}}`)
  );
};

/** Complex syntax and environment references remain editable in their original form. */
export function parseToolbar(value: string): string[] | null {
  if (/\$|\|\|/.test(value)) return null;
  const tokens = value.match(/\||[^\s|]+/g) || [];
  return tokens.every(
    (token) => token === "|" || /^[a-z][a-z0-9_-]*$/i.test(token),
  )
    ? tokens
    : null;
}

export function moveToolbarItem(
  tokens: string[],
  from: number,
  to: number,
): string[] {
  if (from < 0 || to < 0 || from >= tokens.length || to >= tokens.length)
    return tokens;
  const result = [...tokens];
  const [item] = result.splice(from, 1);
  result.splice(to, 0, item);
  return result;
}

const element = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className = "",
  text = "",
): HTMLElementTagNameMap[K] => {
  const node = document.createElement(tag);
  node.className = className;
  node.textContent = text;
  return node;
};
const button = (label: string, className = "btn small") => {
  const node = element("button", className, label);
  node.type = "button";
  return node;
};

let toolbarMenuId = 0;

const toolbarIcon = (command: string, fallback: string, className: string) => {
  const icon = element("span", className);
  icon.dataset.command = command;
  icon.setAttribute("aria-hidden", "true");
  // Only bundled TinyMCE SVG markup is inserted. Custom command names stay plain text.
  if (toolbarIcons[command]) icon.innerHTML = toolbarIcons[command];
  else icon.textContent = fallback;
  return icon;
};

export function initToolbarEditors(root: ParentNode = document): void {
  root
    .querySelectorAll<HTMLElement>("[data-toolbar-editor]")
    .forEach((holder) => {
      if (holder.dataset.toolbarReady) return;
      const input =
        holder.querySelector<HTMLInputElement>('input[type="text"]');
      const raw = input?.closest<HTMLElement>(".input");
      const environmentTip = holder.querySelector<HTMLElement>('[id$="-tip"]');
      if (!input || !raw) return;
      holder.dataset.toolbarReady = "true";
      const readonly = input.disabled || input.readOnly;
      let tokens = parseToolbar(input.value);
      let rawMode = tokens === null;
      let writing = false;
      let dragged: number | null = null;
      const panel = element("div", "ff-toolbar-editor");
      const toggle = button(tr("Raw configuration"), "btn small chromeless");
      toggle.dataset.toolbarToggle = "true";
      const notice = element("p", "instructions ff-toolbar-editor-notice");
      const visual = element("div", "ff-toolbar-visual");
      const items = element("div", "ff-toolbar-items");
      items.setAttribute("role", "list");
      items.setAttribute("aria-label", tr("Toolbar preview"));
      let removalPoint: { x: number; y: number } | null = null;
      const resumePreview = () => {
        removalPoint = null;
        delete items.dataset.previewPaused;
      };
      items.addEventListener("pointermove", (event) => {
        if (
          removalPoint &&
          Math.hypot(
            event.clientX - removalPoint.x,
            event.clientY - removalPoint.y,
          ) > 3
        )
          resumePreview();
      });
      items.addEventListener("pointerleave", resumePreview);
      items.addEventListener("focusin", resumePreview);
      const menuWrapper = element("div", "ff-toolbar-add-menu");
      const add = button(tr("Add…"), "btn small menubtn");
      add.setAttribute("aria-label", tr("Add toolbar button"));
      add.setAttribute("aria-haspopup", "menu");
      add.setAttribute("aria-expanded", "false");
      add.dataset.toolbarAdd = "true";
      add.disabled = readonly;
      const choices = element("div", "menu ff-toolbar-add-options");
      choices.id = `ff-toolbar-add-menu-${++toolbarMenuId}`;
      choices.setAttribute("role", "menu");
      choices.setAttribute("aria-label", tr("Add toolbar button"));
      choices.hidden = true;
      add.setAttribute("aria-controls", choices.id);
      menuWrapper.append(add, choices);
      const closeChoices = (restoreFocus = false) => {
        choices.hidden = true;
        add.setAttribute("aria-expanded", "false");
        if (restoreFocus) add.focus();
      };
      const openChoices = (focusLast = false) => {
        if (add.disabled) return;
        choices.hidden = false;
        add.setAttribute("aria-expanded", "true");
        const rect = add.getBoundingClientRect();
        const below = window.innerHeight - rect.bottom;
        const above = rect.top;
        const opensUp =
          below < Math.min(320, choices.scrollHeight) + 12 && above > below;
        choices.classList.toggle("opens-up", opensUp);
        choices.style.maxHeight = `${Math.max(100, Math.min(320, (opensUp ? above : below) - 12))}px`;
        const options =
          choices.querySelectorAll<HTMLButtonElement>("[role=menuitem]");
        options[focusLast ? options.length - 1 : 0]?.focus();
      };
      const toolbarRow = element("div", "ff-toolbar-row");
      toolbarRow.append(items, menuWrapper);
      visual.append(toolbarRow);
      panel.append(notice, visual);
      raw.before(panel);
      panel.append(raw);
      const modeSwitch = element("span", "ff-toolbar-mode-switch");
      modeSwitch.append(toggle);
      const instructions = holder.querySelector<HTMLElement>(
        ".field > .instructions",
      );
      if (instructions)
        (instructions.querySelector("p") || instructions).prepend(modeSwitch);
      else panel.before(modeSwitch);

      const commit = (next: string[], focusIndex?: number) => {
        if (readonly) return;
        tokens = next;
        // Keep the original named field. Only deliberate visual edits normalize spacing.
        input.value = next.join(" ");
        writing = true;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
        writing = false;
        render();
        if (focusIndex !== undefined)
          items
            .querySelectorAll<HTMLButtonElement>("[data-toolbar-handle]")
            [focusIndex]?.focus();
      };
      const render = () => {
        items.replaceChildren();
        closeChoices();
        choices.replaceChildren();
        const available = [
          { value: "|", label: "Divider", symbol: "│" },
          ...buttons.filter((choice) => !tokens?.includes(choice.value)),
        ];
        add.disabled = readonly;
        available.forEach((choice) => {
          const label = tr(choice.label);
          const option = button("", "ff-toolbar-add-option");
          option.dataset.toolbarOption = choice.value;
          option.setAttribute("role", "menuitem");
          option.setAttribute("aria-label", label);
          option.tabIndex = -1;
          option.disabled = readonly;
          const icon = toolbarIcon(
            choice.value,
            choice.symbol,
            "ff-toolbar-choice-icon",
          );
          const preview = element("span", "ff-toolbar-example-sample", label);
          preview.dataset.example = choice.value;
          preview.setAttribute("aria-hidden", "true");
          if (choice.value === "superscript") preview.append(" x²");
          if (choice.value === "subscript") preview.append(" H₂O");
          option.append(icon, preview);
          option.addEventListener("click", () => {
            if (
              readonly ||
              !tokens ||
              (choice.value !== "|" && tokens.includes(choice.value))
            )
              return;
            commit([...tokens, choice.value], tokens.length);
          });
          choices.append(option);
        });
        toggle.textContent = tr(
          rawMode ? "Visual editor" : "Raw configuration",
        );
        toggle.disabled = tokens === null;
        toggle.setAttribute("aria-expanded", String(rawMode));
        panel.classList.toggle("is-raw", rawMode);
        if (environmentTip) environmentTip.hidden = !rawMode;
        visual.hidden = rawMode;
        menuWrapper.hidden = rawMode;
        raw.classList.toggle("hidden", !rawMode);
        notice.hidden = tokens !== null;
        notice.textContent = tr(
          input.value.trim().startsWith("$")
            ? "This toolbar is managed by an environment variable. Edit its raw value below."
            : "This configuration uses advanced syntax. Use the raw editor to preserve it.",
        );
        (tokens || []).forEach((token, index) => {
          const definition = buttons.find((choice) => choice.value === token);
          const isSeparator = token === "|";
          const label = isSeparator
            ? tr("Divider")
            : definition
              ? tr(definition.label)
              : token;
          const symbol = isSeparator ? "│" : definition?.symbol || token;
          const chip = element("div", "ff-toolbar-chip");
          chip.dataset.command = token;
          chip.setAttribute("role", "listitem");
          chip.draggable = !readonly;
          const handle = button("", "ff-toolbar-handle");
          handle.dataset.toolbarHandle = "true";
          handle.disabled = readonly;
          handle.setAttribute(
            "aria-label",
            tr("Reorder {button}", { button: label }),
          );
          const icon =
            token === "blocks"
              ? element("span", "ff-toolbar-block-label", tr("Paragraph"))
              : toolbarIcon(token, symbol, "ff-toolbar-chip-symbol");
          if (token === "blocks") chip.classList.add("is-text-select");
          handle.append(icon);
          handle.setAttribute(
            "aria-keyshortcuts",
            "Alt+ArrowLeft Alt+ArrowRight",
          );
          const example = element("span", "ff-toolbar-example");
          example.setAttribute("aria-hidden", "true");
          const sample = element("span", "ff-toolbar-example-sample");
          sample.dataset.example = token;
          sample.textContent =
            token === "code"
              ? "<p>…</p>"
              : token === "superscript"
                ? `${label} x²`
                : token === "subscript"
                  ? `${label} H₂O`
                  : label;
          example.append(sample);
          handle.append(example);
          if (
            ["blocks", "forecolor", "backcolor", "align", "table"].includes(
              token,
            )
          ) {
            handle.append(
              toolbarIcon("chevron", "⌄", "ff-toolbar-chip-chevron"),
            );
          }
          const remove = button("", "ff-toolbar-remove");
          const closeIcon = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg",
          );
          closeIcon.setAttribute("viewBox", "0 0 12 12");
          closeIcon.setAttribute("aria-hidden", "true");
          closeIcon.setAttribute("focusable", "false");
          const closePath = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path",
          );
          closePath.setAttribute("d", "M2 2l8 8M10 2l-8 8");
          closePath.setAttribute("fill", "none");
          closePath.setAttribute("stroke", "currentColor");
          closePath.setAttribute("stroke-width", "1.8");
          closePath.setAttribute("stroke-linecap", "round");
          closeIcon.append(closePath);
          remove.append(closeIcon);
          remove.disabled = readonly;
          remove.setAttribute(
            "aria-label",
            tr("Remove {button}", { button: label }),
          );
          remove.addEventListener("click", (event) => {
            // Let the deleted slot close without focusing or hovering its replacement.
            removalPoint = { x: event.clientX, y: event.clientY };
            items.dataset.previewPaused = "true";
            commit(tokens!.filter((_, item) => item !== index));
            add.focus({ preventScroll: true });
          });
          chip.addEventListener(
            "mouseleave",
            () => delete chip.dataset.previewDismissed,
          );
          chip.addEventListener("focusout", (event) => {
            if (!chip.contains(event.relatedTarget as Node | null))
              delete chip.dataset.previewDismissed;
          });
          chip.addEventListener("keydown", (event) => {
            if (event.key === "Escape") chip.dataset.previewDismissed = "true";
          });
          handle.addEventListener("keydown", (event) => {
            if (
              !event.altKey ||
              !["ArrowLeft", "ArrowRight"].includes(event.key) ||
              readonly
            )
              return;
            event.preventDefault();
            const to = index + (event.key === "ArrowLeft" ? -1 : 1);
            if (to >= 0 && to < tokens!.length)
              commit(moveToolbarItem(tokens!, index, to), to);
          });
          chip.addEventListener("dragstart", (event) => {
            if (readonly) {
              event.preventDefault();
              return;
            }
            dragged = index;
            chip.classList.add("is-dragging");
            event.dataTransfer?.setData("text/plain", token);
            if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
          });
          chip.addEventListener("dragover", (event) => {
            if (dragged !== null && !readonly) {
              event.preventDefault();
              chip.classList.add("is-drop-target");
            }
          });
          chip.addEventListener("dragleave", () =>
            chip.classList.remove("is-drop-target"),
          );
          chip.addEventListener("drop", (event) => {
            event.preventDefault();
            if (dragged !== null && tokens && !readonly)
              commit(moveToolbarItem(tokens, dragged, index), index);
            dragged = null;
          });
          chip.addEventListener("dragend", () => {
            dragged = null;
            items
              .querySelectorAll(".is-dragging, .is-drop-target")
              .forEach((item) => {
                item.classList.remove("is-dragging", "is-drop-target");
              });
          });
          chip.append(handle, remove);
          items.append(chip);
        });
        if (!tokens?.length)
          items.append(
            element("span", "light", tr("No toolbar buttons selected.")),
          );
      };
      toggle.addEventListener("click", () => {
        rawMode = !rawMode;
        render();
        if (rawMode) input.focus();
      });
      add.addEventListener("click", () => {
        if (choices.hidden) openChoices();
        else closeChoices();
      });
      add.addEventListener("keydown", (event) => {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          openChoices(event.key === "ArrowUp");
        }
      });
      choices.addEventListener("keydown", (event) => {
        const options = Array.from(
          choices.querySelectorAll<HTMLButtonElement>("[role=menuitem]"),
        );
        const index = options.indexOf(
          document.activeElement as HTMLButtonElement,
        );
        if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
          event.preventDefault();
          const next =
            event.key === "Home"
              ? 0
              : event.key === "End"
                ? options.length - 1
                : (index +
                    (event.key === "ArrowDown" ? 1 : -1) +
                    options.length) %
                  options.length;
          options[next]?.focus();
        } else if (event.key === "Escape") {
          event.preventDefault();
          closeChoices(true);
        } else if (event.key === "Tab") closeChoices(true);
      });
      menuWrapper.addEventListener("focusout", (event) => {
        if (!menuWrapper.contains(event.relatedTarget as Node | null))
          closeChoices();
      });
      document.addEventListener("click", (event) => {
        if (!menuWrapper.contains(event.target as Node | null)) closeChoices();
      });
      const updateFromRaw = () => {
        if (writing) return;
        tokens = parseToolbar(input.value);
        if (tokens === null) rawMode = true;
        render();
      };
      input.addEventListener("input", updateFromRaw);
      input.addEventListener("change", updateFromRaw);
      render();
    });
}
