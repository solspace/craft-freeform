let nextId = 0;

/** A Craft-styled picker backed by the original select for submission and changes. */
export class DisclosureSelect {
  readonly button: HTMLButtonElement;
  readonly menu: HTMLDivElement;
  private readonly label: HTMLSpanElement;
  private open = false;
  private readonly originalHidden: boolean;
  private readonly originalTabIndex: number;
  private readonly labels: HTMLLabelElement[];
  private readonly observer: MutationObserver;

  constructor(
    readonly select: HTMLSelectElement,
    private readonly circles = false,
  ) {
    const doc = select.ownerDocument;
    this.originalHidden = select.hidden;
    this.originalTabIndex = select.tabIndex;
    this.button = doc.createElement("button");
    this.button.type = "button";
    this.button.className = "btn freeform-disclosure-select";
    this.button.id = `freeform-select-${++nextId}`;
    this.button.setAttribute("aria-haspopup", "menu");
    this.button.setAttribute("aria-expanded", "false");
    for (const attribute of [
      "aria-label",
      "aria-labelledby",
      "aria-describedby",
      "aria-invalid",
    ]) {
      const value = select.getAttribute(attribute);
      if (value) this.button.setAttribute(attribute, value);
    }
    this.labels = Array.from(select.labels ?? []);
    for (const label of this.labels) label.htmlFor = this.button.id;
    this.label = doc.createElement("span");
    this.label.className = "freeform-disclosure-label";
    this.button.append(this.label);
    const arrow = doc.createElement("span");
    arrow.className = "freeform-disclosure-arrow";
    arrow.setAttribute("aria-hidden", "true");
    this.button.append(arrow);
    this.menu = doc.createElement("div");
    this.menu.id = `${this.button.id}-menu`;
    this.menu.className =
      "menu menu--disclosure visible freeform-disclosure-menu";
    this.menu.setAttribute("role", "menu");
    this.menu.setAttribute("aria-labelledby", this.button.id);
    this.menu.hidden = true;
    this.button.setAttribute("aria-controls", this.menu.id);
    select.hidden = true;
    select.tabIndex = -1;
    select.after(this.button);
    select.parentElement?.classList.add("freeform-disclosure-container");
    this.button.addEventListener("click", () =>
      this.open ? this.close() : this.show(),
    );
    this.button.addEventListener("keydown", (event) => {
      if (["ArrowDown", "ArrowUp"].includes(event.key)) {
        event.preventDefault();
        this.show();
      }
    });
    this.menu.addEventListener("keydown", (event) => {
      const choices = this.choices();
      const current = choices.indexOf(doc.activeElement as HTMLButtonElement);
      let index: number;
      switch (event.key) {
        case "ArrowDown":
          index = (current + 1) % choices.length;
          break;
        case "ArrowUp":
          index = (current - 1 + choices.length) % choices.length;
          break;
        case "Home":
          index = 0;
          break;
        case "End":
          index = choices.length - 1;
          break;
        case "Escape":
          event.preventDefault();
          event.stopPropagation();
          this.close();
          return;
        case "Tab":
          this.close();
          return;
        default:
          return;
      }
      event.preventDefault();
      choices[index]?.focus();
    });
    select.addEventListener("change", this.sync);
    select.addEventListener("focus", this.focus);
    this.observer = new MutationObserver(this.sync);
    this.observer.observe(select, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["disabled", "selected", "label", "aria-invalid"],
    });
    this.sync();
  }

  private focus = () => this.button.focus();
  private choices = () =>
    Array.from(
      this.menu.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"),
    );
  private outside = (event: Event) => {
    if (
      !this.menu.contains(event.target as Node) &&
      !this.button.contains(event.target as Node)
    )
      this.close(false);
  };
  private reposition = () => {
    const view = this.select.ownerDocument.defaultView!;
    const rect = this.button.getBoundingClientRect();
    const width = Math.min(Math.max(rect.width, 180), view.innerWidth - 24);
    const below = view.innerHeight - rect.bottom - 8;
    const above = rect.top - 8;
    const upwards =
      below < Math.min(this.menu.scrollHeight, 160) && above > below;
    Object.assign(this.menu.style, {
      position: "fixed",
      width: `${width}px`,
      maxHeight: `${Math.max(40, upwards ? above : below)}px`,
      left: `${Math.max(12, Math.min(rect.left, view.innerWidth - width - 12))}px`,
      top: upwards ? "auto" : `${rect.bottom + 4}px`,
      bottom: upwards ? `${view.innerHeight - rect.top + 4}px` : "auto",
    });
  };
  private dot(option: HTMLOptionElement) {
    const circle = this.select.ownerDocument.createElement("span");
    circle.className = `status ${option.value ? option.dataset.statusColor || "gray" : "all"}`;
    circle.setAttribute("aria-hidden", "true");
    return circle;
  }

  sync = () => {
    const selected = this.select.selectedOptions[0];
    this.label.replaceChildren();
    if (selected && this.circles) this.label.append(this.dot(selected));
    const text = this.select.ownerDocument.createElement("span");
    text.textContent = selected?.label || "";
    this.label.append(text);
    this.button.disabled = this.select.matches(":disabled");
    if (this.open) this.close();
  };

  private show() {
    if (this.button.disabled || this.open) return;
    const doc = this.select.ownerDocument;
    const list = doc.createElement("ul");
    list.setAttribute("role", "none");
    for (const option of this.select.options) {
      if (option.hidden) continue;
      const row = doc.createElement("li");
      row.setAttribute("role", "none");
      const choice = doc.createElement("button");
      choice.type = "button";
      choice.className = "menu-item flex";
      choice.setAttribute("role", "menuitemradio");
      choice.setAttribute("aria-checked", String(option.selected));
      choice.disabled =
        option.disabled ||
        (option.parentElement instanceof HTMLOptGroupElement &&
          option.parentElement.disabled);
      choice.tabIndex = -1;
      if (this.circles) choice.append(this.dot(option));
      const text = doc.createElement("span");
      text.textContent = option.label;
      choice.append(text);
      if (option.selected) {
        const check = doc.createElement("span");
        check.className = "freeform-disclosure-check";
        check.setAttribute("data-icon", "check");
        check.setAttribute("aria-hidden", "true");
        choice.append(check);
      }
      choice.addEventListener("click", () => {
        this.select.value = option.value;
        this.close();
        this.select.dispatchEvent(new Event("change", { bubbles: true }));
      });
      row.append(choice);
      list.append(row);
    }
    this.menu.replaceChildren(list);
    doc.body.append(this.menu);
    this.menu.hidden = false;
    this.open = true;
    this.button.setAttribute("aria-expanded", "true");
    this.reposition();
    (
      this.menu.querySelector<HTMLButtonElement>(
        '[aria-checked="true"]:not(:disabled)',
      ) || this.choices()[0]
    )?.focus();
    doc.addEventListener("pointerdown", this.outside);
    doc.defaultView?.addEventListener("resize", this.reposition);
    doc.defaultView?.addEventListener("scroll", this.reposition, true);
  }

  private close(returnFocus = true) {
    if (!this.open) return;
    this.open = false;
    this.menu.hidden = true;
    this.menu.remove();
    this.button.setAttribute("aria-expanded", "false");
    const doc = this.select.ownerDocument;
    doc.removeEventListener("pointerdown", this.outside);
    doc.defaultView?.removeEventListener("resize", this.reposition);
    doc.defaultView?.removeEventListener("scroll", this.reposition, true);
    if (returnFocus && this.button.isConnected) this.button.focus();
  }

  destroy() {
    this.observer.disconnect();
    this.close(false);
    this.button.remove();
    this.select.hidden = this.originalHidden;
    this.select.tabIndex = this.originalTabIndex;
    for (const label of this.labels) label.htmlFor = this.select.id;
    this.select.removeEventListener("change", this.sync);
    this.select.removeEventListener("focus", this.focus);
  }
}
