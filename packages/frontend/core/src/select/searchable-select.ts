export type SearchableSelectConfig = {
  enabled?: boolean;
  label?: string;
  placeholder?: string;
  noResults?: string;
  removeLabel?: string;
  toggleLabel?: string;
  resultsLabel?: string;
};

let nextId = 0;
const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase();

/** Enhances a native select; the select remains the sole submitted value. */
export class SearchableSelect {
  readonly element: HTMLDivElement;
  readonly input: HTMLInputElement;
  private readonly list: HTMLDivElement;
  private readonly pills: HTMLDivElement;
  private readonly status: HTMLDivElement;
  private readonly toggle: HTMLButtonElement;
  private readonly observer: MutationObserver;
  private readonly listeners: Array<() => void> = [];
  private readonly originalTabIndex: string | null;
  private readonly originalAriaHidden: string | null;
  private readonly field: Element | null;
  private readonly hadFieldClass: boolean;
  private config: Required<SearchableSelectConfig>;
  private choices: HTMLOptionElement[] = [];
  private active = -1;
  private open = false;
  private query = "";
  private destroyed = false;
  private resetTimer?: ReturnType<typeof setTimeout>;

  constructor(
    readonly select: HTMLSelectElement,
    config: SearchableSelectConfig = {},
  ) {
    this.config = {
      enabled: true,
      label: "",
      placeholder: "Search options...",
      noResults: "No results found.",
      removeLabel: "Remove {label}",
      toggleLabel: "Show options",
      resultsLabel: "{count} results available.",
      ...config,
    };
    const doc = select.ownerDocument;
    const id = `ff-searchable-${++nextId}`;
    this.element = doc.createElement("div");
    this.element.className = "ff-searchable";
    this.pills = doc.createElement("div");
    this.pills.className = "ff-searchable__pills";
    const control = doc.createElement("div");
    control.className = "ff-searchable__control";
    this.input = doc.createElement("input");
    this.input.type = "text";
    this.input.id = id;
    this.input.autocomplete = "off";
    this.input.setAttribute("role", "combobox");
    this.input.setAttribute("aria-autocomplete", "list");
    this.input.setAttribute("aria-controls", `${id}-list`);
    this.input.setAttribute("aria-expanded", "false");
    this.toggle = doc.createElement("button");
    this.toggle.type = "button";
    this.toggle.className = "ff-searchable__toggle";
    this.toggle.tabIndex = -1;
    this.toggle.textContent = "▾";
    this.list = doc.createElement("div");
    this.list.id = `${id}-list`;
    this.list.className = "ff-searchable__list";
    this.list.setAttribute("role", "listbox");
    this.list.hidden = true;
    this.status = doc.createElement("div");
    this.status.className = "ff-searchable__status";
    this.status.setAttribute("role", "status");
    this.status.setAttribute("aria-live", "polite");
    control.append(this.input, this.toggle);
    this.element.append(this.pills, control, this.list, this.status);
    select.after(this.element);
    this.originalTabIndex = select.getAttribute("tabindex");
    this.originalAriaHidden = select.getAttribute("aria-hidden");
    select.tabIndex = -1;
    select.setAttribute("aria-hidden", "true");
    select.classList.add("ff-searchable-native");
    this.field = select.closest(".floating, .form-floating");
    this.hadFieldClass =
      this.field?.classList.contains("ff-searchable-field") ?? false;
    this.field?.classList.add("ff-searchable-field");

    this.listen(this.input, "focus", () => {
      this.show();
      if (!select.multiple) this.input.select();
    });
    this.listen(this.input, "click", () => {
      if (!this.open) {
        this.show();
        if (!select.multiple) this.input.select();
      }
    });
    this.listen(select, "focus", () => this.input.focus());
    this.listen(this.input, "input", () => {
      this.query = this.input.value;
      this.active = -1;
      this.show();
    });
    this.listen(this.input, "keydown", (event) =>
      this.keydown(event as KeyboardEvent),
    );
    this.listen(this.element, "focusout", (event) => {
      if (
        this.element.contains(
          (event as FocusEvent).relatedTarget as Node | null,
        )
      )
        return;
      this.close();
      select.dispatchEvent(new FocusEvent("blur"));
      select.dispatchEvent(new FocusEvent("focusout", { bubbles: true }));
    });
    this.listen(this.toggle, "mousedown", (event) => event.preventDefault());
    this.listen(this.toggle, "click", () => {
      if (this.open) this.close();
      else {
        this.input.focus();
        this.show();
      }
    });
    this.listen(this.list, "mousedown", (event) => event.preventDefault());
    this.listen(doc, "pointerdown", (event) => {
      if (!this.element.contains(event.target as Node)) this.close();
    });
    this.listen(select, "change", () => this.sync());
    this.listen(select, "invalid", (event) => {
      event.preventDefault();
      this.input.setAttribute("aria-invalid", "true");
      this.input.setCustomValidity(select.validationMessage);
      this.input.focus();
      this.input.reportValidity();
    });
    if (select.form)
      this.listen(select.form, "reset", (event) => {
        clearTimeout(this.resetTimer);
        this.resetTimer = setTimeout(() => {
          if (event.defaultPrevented || this.destroyed) return;
          this.close();
          this.input.setCustomValidity("");
          this.sync();
        }, 0);
      });
    this.observer = new MutationObserver(() => this.sync());
    this.observer.observe(select, {
      attributes: true,
      childList: true,
      subtree: true,
      characterData: true,
      attributeFilter: [
        "disabled",
        "required",
        "multiple",
        "label",
        "value",
        "selected",
        "hidden",
        "class",
        "style",
        "aria-label",
        "aria-labelledby",
        "aria-describedby",
        "aria-invalid",
      ],
    });
    for (
      let ancestor = select.parentElement;
      ancestor;
      ancestor = ancestor.parentElement
    ) {
      if (ancestor.tagName === "FIELDSET")
        this.observer.observe(ancestor, {
          attributes: true,
          attributeFilter: ["disabled"],
        });
    }
    this.sync();
  }

  private listen(target: EventTarget, type: string, listener: EventListener) {
    target.addEventListener(type, listener);
    this.listeners.push(() => target.removeEventListener(type, listener));
  }

  private disabled(option?: HTMLOptionElement): boolean {
    return (
      this.select.matches(":disabled") ||
      !!option?.disabled ||
      (option?.parentElement?.tagName === "OPTGROUP" &&
        (option.parentElement as HTMLOptGroupElement).disabled)
    );
  }

  private selectedOptions(): HTMLOptionElement[] {
    return Array.from(this.select.options).filter((option) => option.selected);
  }

  /** Call after a programmatic value assignment without a change event. */
  sync(config?: SearchableSelectConfig) {
    if (this.destroyed) return;
    if (!this.select.classList.contains("ff-searchable-native"))
      this.select.classList.add("ff-searchable-native");
    if (config) this.config = { ...this.config, ...config };
    this.input.className = `${this.select.className.replace(/\bff-searchable-native\b/g, "")} ff-searchable__input`;
    this.input.disabled = this.disabled();
    this.toggle.disabled = this.input.disabled;
    this.toggle.setAttribute("aria-label", this.config.toggleLabel);
    this.input.placeholder = this.config.placeholder;
    const label =
      this.select.getAttribute("aria-label") ||
      Array.from(this.select.labels ?? [])
        .map((item) => {
          const copy = item.cloneNode(true) as HTMLElement;
          copy.querySelectorAll("select, .ff-searchable").forEach((child) => {
            child.remove();
          });
          return copy.textContent?.trim();
        })
        .filter(Boolean)
        .join(" ") ||
      this.config.label ||
      this.config.placeholder;
    this.input.setAttribute("aria-label", label);
    this.list.setAttribute("aria-label", label);
    for (const name of [
      "aria-labelledby",
      "aria-describedby",
      "aria-invalid",
    ]) {
      const value = this.select.getAttribute(name);
      if (value !== null) this.input.setAttribute(name, value);
      else this.input.removeAttribute(name);
    }
    this.input.setAttribute("aria-required", String(this.select.required));
    if (this.select.multiple)
      this.list.setAttribute("aria-multiselectable", "true");
    else this.list.removeAttribute("aria-multiselectable");
    if (this.select.validity.valid || this.disabled())
      this.input.setCustomValidity("");
    if (this.disabled()) this.open = false;
    this.paintTheme();
    this.paintPills();
    if (!this.open)
      this.input.value = this.select.multiple
        ? ""
        : (this.selectedOptions()[0]?.label ?? "");
    this.paintList();
  }

  private paintTheme() {
    const view = this.select.ownerDocument.defaultView;
    if (!view) return;
    const style = view.getComputedStyle(this.select);
    let background = style.backgroundColor;
    for (
      let parent = this.select.parentElement;
      parent &&
      (!background ||
        background === "transparent" ||
        background === "rgba(0, 0, 0, 0)");
      parent = parent.parentElement
    ) {
      background = view.getComputedStyle(parent).backgroundColor;
    }
    if (
      !background ||
      background === "transparent" ||
      background === "rgba(0, 0, 0, 0)"
    )
      background = "#ffffff";
    this.element.style.setProperty("--ff-searchable-bg", background);
    // Composite translucent template backgrounds over their ancestor surfaces.
    // The popup must be opaque when it overlaps other form fields.
    const layers: string[] = [];
    for (
      let node: Element | null = this.select;
      node;
      node = node.parentElement
    ) {
      const color = view.getComputedStyle(node).backgroundColor;
      if (color && color !== "transparent" && color !== "rgba(0, 0, 0, 0)")
        layers.push(`linear-gradient(${color}, ${color})`);
    }
    this.element.style.setProperty(
      "--ff-searchable-menu-bg",
      [...layers, "#ffffff"].join(", "),
    );
    this.element.style.setProperty("--ff-searchable-color", style.color);
    // Tailwind 4 uses an outline for select borders. A zero-width border's
    // computed color is still currentColor, which is white on dark templates.
    const hasBorder =
      parseFloat(style.borderTopWidth) > 0 && style.borderTopStyle !== "none";
    const hasOutline =
      parseFloat(style.outlineWidth) > 0 && style.outlineStyle !== "none";
    this.element.style.setProperty(
      "--ff-searchable-border",
      (hasBorder
        ? style.borderTopColor
        : hasOutline
          ? style.outlineColor
          : style.borderTopColor) || "#b8c2cc",
    );
    this.element.style.setProperty(
      "--ff-searchable-radius",
      style.borderTopLeftRadius || "4px",
    );
    this.element.style.font = style.font;
  }

  private paintPills() {
    this.pills.replaceChildren();
    this.pills.hidden = !this.select.multiple;
    if (!this.select.multiple) return;
    for (const option of this.selectedOptions()) {
      const button = this.select.ownerDocument.createElement("button");
      button.type = "button";
      button.className = "ff-searchable__remove";
      button.textContent = `${option.label} ×`;
      button.setAttribute(
        "aria-label",
        this.config.removeLabel.replace("{label}", () => option.label),
      );
      button.disabled = this.disabled(option);
      button.addEventListener("click", () => {
        this.choose(option, false);
        this.input.focus();
      });
      this.pills.append(button);
    }
  }

  private show() {
    if (this.disabled() || this.destroyed) return;
    this.open = true;
    this.paintList();
  }

  private close() {
    if (this.destroyed) return;
    this.open = false;
    this.query = "";
    this.active = -1;
    this.input.value = this.select.multiple
      ? ""
      : (this.selectedOptions()[0]?.label ?? "");
    this.paintList();
  }

  private paintList() {
    this.list.hidden = !this.open;
    this.input.setAttribute("aria-expanded", String(this.open));
    this.input.removeAttribute("aria-activedescendant");
    this.list.replaceChildren();
    if (!this.open) {
      this.status.textContent = "";
      return;
    }
    const query = normalize(this.query.trim());
    this.choices = [];
    let lastGroup: Element | null = null;
    let groupElement: HTMLElement = this.list;
    for (const option of Array.from(this.select.options)) {
      if (
        option.hidden ||
        option.parentElement?.hidden ||
        (this.select.multiple && option.value === "") ||
        !normalize(option.label).includes(query)
      )
        continue;
      const group =
        option.parentElement?.tagName === "OPTGROUP"
          ? option.parentElement
          : null;
      if (group !== lastGroup) {
        groupElement = this.list;
        if (group) {
          groupElement = this.select.ownerDocument.createElement("div");
          groupElement.setAttribute("role", "group");
          groupElement.setAttribute(
            "aria-label",
            (group as HTMLOptGroupElement).label,
          );
          const heading = this.select.ownerDocument.createElement("div");
          heading.className = "ff-searchable__group";
          heading.textContent = (group as HTMLOptGroupElement).label;
          heading.setAttribute("aria-hidden", "true");
          groupElement.append(heading);
          this.list.append(groupElement);
        }
        lastGroup = group;
      }
      const item = this.select.ownerDocument.createElement("div");
      item.className = "ff-searchable__option";
      item.textContent = option.label || this.config.placeholder;
      item.setAttribute("role", "option");
      item.setAttribute("aria-selected", String(option.selected));
      const disabled = this.disabled(option);
      item.setAttribute("aria-disabled", String(disabled));
      if (!disabled) {
        const index = this.choices.push(option) - 1;
        item.id = `${this.list.id}-${index}`;
        item.addEventListener("click", () =>
          this.choose(option, !this.select.multiple || !option.selected),
        );
      }
      groupElement.append(item);
    }
    this.status.textContent = this.choices.length
      ? this.config.resultsLabel.replace("{count}", String(this.choices.length))
      : this.config.noResults;
    if (!this.list.children.length) {
      const empty = this.select.ownerDocument.createElement("div");
      empty.className = "ff-searchable__empty";
      empty.textContent = this.config.noResults;
      empty.setAttribute("role", "presentation");
      this.list.append(empty);
    }
    if (this.active >= this.choices.length)
      this.active = this.choices.length - 1;
    this.paintActive();
  }

  private paintActive() {
    this.list.querySelectorAll("[data-active]").forEach((item) => {
      item.removeAttribute("data-active");
    });
    const item =
      this.active >= 0
        ? this.select.ownerDocument.getElementById(
            `${this.list.id}-${this.active}`,
          )
        : null;
    if (!item) {
      this.input.removeAttribute("aria-activedescendant");
      return;
    }
    item.setAttribute("data-active", "");
    this.input.setAttribute("aria-activedescendant", item.id);
    item.scrollIntoView?.({ block: "nearest" });
  }

  private choose(option: HTMLOptionElement, selected: boolean) {
    if (this.disabled(option) || !this.select.contains(option)) return;
    option.selected = selected;
    this.query = "";
    this.active = -1;
    this.input.value = this.select.multiple ? "" : option.label;
    this.input.setCustomValidity("");
    if (!this.select.multiple) this.open = false;
    // Notify existing conditionals, calculations, summaries, and framework adapters.
    this.select.dispatchEvent(new Event("input", { bubbles: true }));
    this.select.dispatchEvent(new Event("change", { bubbles: true }));
    this.sync();
  }

  private keydown(event: KeyboardEvent) {
    if (event.isComposing || this.disabled()) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      this.show();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      this.active =
        this.active < 0
          ? direction > 0
            ? 0
            : this.choices.length - 1
          : Math.max(
              0,
              Math.min(this.choices.length - 1, this.active + direction),
            );
      this.paintActive();
    } else if (event.key === "Enter" && this.open) {
      event.preventDefault();
      const option = this.choices[this.active];
      if (option)
        this.choose(option, !this.select.multiple || !option.selected);
    } else if (event.key === "Escape" && this.open) {
      event.preventDefault();
      event.stopPropagation();
      this.close();
    } else if (event.key === "Tab") {
      this.close();
    } else if (
      event.key === "Backspace" &&
      this.select.multiple &&
      this.input.value === ""
    ) {
      const option = this.selectedOptions()
        .filter((item) => !this.disabled(item))
        .pop();
      if (option) {
        event.preventDefault();
        this.choose(option, false);
      }
    }
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    clearTimeout(this.resetTimer);
    this.observer.disconnect();
    this.listeners.forEach((remove) => {
      remove();
    });
    this.element.remove();
    this.select.classList.remove("ff-searchable-native");
    for (const [name, value] of [
      ["tabindex", this.originalTabIndex],
      ["aria-hidden", this.originalAriaHidden],
    ]) {
      if (value === null) this.select.removeAttribute(name as string);
      else this.select.setAttribute(name as string, value as string);
    }
    if (!this.hadFieldClass)
      this.field?.classList.remove("ff-searchable-field");
  }
}
