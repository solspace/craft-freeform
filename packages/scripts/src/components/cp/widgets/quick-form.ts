import { enhanceQuickFormTables } from "@lib/cp/quick-form-tables";
import { refreshWidget } from "@lib/cp/widgets/refresh-widget";

declare global {
  interface Window {
    FreeformQuickForm: typeof initQuickForm;
  }
}

export function initQuickForm(root: HTMLElement | null) {
  if (!root || root.dataset.initialized) return;
  root.dataset.initialized = "true";

  const success = root.querySelector<HTMLElement>("[data-quick-form-success]");
  const content = root.querySelector<HTMLElement>("[data-quick-form-content]");
  const another = root.querySelector<HTMLButtonElement>(
    "[data-quick-form-another]",
  );
  const feedback = root.querySelector<HTMLElement>("[data-widget-feedback]");
  // Freeform's form events don't bubble, so listen during capture on this widget only.
  root.addEventListener(
    "freeform-before-ajax-success",
    (
      event: Event & {
        response?: {
          success?: boolean;
          finished?: boolean;
          actions?: unknown[];
          onSuccess?: string;
          html?: string | null;
        };
      },
    ) => {
      const response = event.response;
      if (response?.success && response.finished && !response.actions?.length) {
        // The dashboard owns the confirmation; leave integration actions intact.
        response.onSuccess = "reload";
        response.html = null;
      }
    },
    true,
  );
  root.addEventListener(
    "freeform-render-success",
    (event) => {
      if (success) event.preventDefault();
    },
    true,
  );
  root.addEventListener(
    "freeform-ajax-success",
    (
      event: Event & {
        response?: {
          success?: boolean;
          finished?: boolean;
          actions?: unknown[];
        };
      },
    ) => {
      if (
        !success ||
        !content ||
        !event.response?.success ||
        !event.response.finished ||
        event.response.actions?.length
      )
        return;
      content.hidden = true;
      success.hidden = false;
      success.focus();
    },
    true,
  );
  another?.addEventListener("click", async () => {
    another.disabled = true;
    root.setAttribute("aria-busy", "true");
    if (feedback) feedback.hidden = true;
    try {
      const next = await refreshWidget(root, initQuickForm);
      next
        .querySelector<HTMLElement>(
          "input.freeform-input:not([type=hidden]), textarea.freeform-input, select.freeform-input",
        )
        ?.focus();
    } catch {
      if (feedback) {
        feedback.textContent =
          root.dataset.restartError ||
          "Could not load a fresh form. Please try again.";
        feedback.hidden = false;
      }
    } finally {
      another.disabled = false;
      root.removeAttribute("aria-busy");
    }
  });

  const enhance = () => {
    for (const label of root.querySelectorAll<HTMLLabelElement>(
      '.freeform-fieldtype-checkbox label:has(> input[type="checkbox"])',
    )) {
      if (label.querySelector("[data-quick-form-choice-label]")) continue;
      // Keep rich text and links together as one flex item beside the control.
      const text = document.createElement("span");
      text.setAttribute("data-quick-form-choice-label", "");
      for (const node of Array.from(label.childNodes)) {
        if (node instanceof HTMLInputElement) continue;
        text.append(node);
      }
      label.append(text);
    }
    if (root.querySelector("table[data-freeform-table]")) {
      const translate = (label: string) =>
        typeof Craft === "undefined" ? label : Craft.t("app", label);
      enhanceQuickFormTables(root, {
        add: translate("Add"),
        addRow: translate("Add a row"),
        removeRow: translate("Remove row"),
        rowActions: translate("Row actions"),
      });
    }
    for (const input of root.querySelectorAll<
      HTMLInputElement | HTMLTextAreaElement
    >("input.freeform-input, textarea.freeform-input")) {
      if (
        input instanceof HTMLInputElement &&
        [
          "hidden",
          "radio",
          "checkbox",
          "file",
          "range",
          "color",
          "submit",
          "button",
          "image",
          "reset",
        ].includes(input.type)
      )
        continue;
      input.classList.add("text", "fullwidth");
    }
    for (const select of root.querySelectorAll<HTMLSelectElement>(
      "select.freeform-input:not([multiple])",
    )) {
      const parent = select.parentElement;
      if (select.classList.contains("ff-searchable-native")) {
        // Searchable controls own their visible input and arrow. Initialization
        // can happen before or after this widget's native-select enhancement.
        if (parent?.hasAttribute("data-quick-form-select")) {
          parent.replaceWith(...Array.from(parent.childNodes));
        }
        continue;
      }
      if (!select.parentElement?.classList.contains("select")) {
        const wrapper = document.createElement("div");
        wrapper.className = "select fullwidth";
        wrapper.setAttribute("data-quick-form-select", "");
        select.before(wrapper);
        wrapper.append(select);
      }
    }
    for (const button of root.querySelectorAll<HTMLElement>(
      ".freeform-button-submit, .freeform-button-back, .freeform-button-save, [data-signature-clear]",
    )) {
      button.classList.add("btn");
      button.classList.toggle(
        "submit",
        button.classList.contains("freeform-button-submit"),
      );
    }
  };

  // This listener runs after the formatting template's defaults, including on AJAX pages.
  root.addEventListener(
    "freeform-stripe-appearance",
    (
      event: Event & {
        elementOptions?: { appearance?: Record<string, unknown> };
      },
    ) => {
      if (!event.elementOptions) return;
      const style = getComputedStyle(root);
      const color = (name: string, fallback: string) =>
        style.getPropertyValue(name).trim() || fallback;
      event.elementOptions.appearance = {
        theme: "stripe",
        variables: {
          fontFamily: style.fontFamily || "sans-serif",
          fontSizeBase: "14px",
          spacingUnit: "4px",
          borderRadius: "4px",
          colorText: color("--text-color", "#3f4d5a"),
          colorBackground: "#ffffff",
          colorPrimary: color("--primary-color", "#e12d39"),
          colorDanger: color("--error-color", "#cf1124"),
        },
        rules: {
          ".Input": {
            border: `1px solid ${color("--hairline-color", "#d5dce5")}`,
            boxShadow: "none",
          },
          ".Label": { fontSize: "14px", fontWeight: "600" },
        },
      };
    },
  );
  enhance();
  // Freeform replaces fields between pages and after AJAX validation.
  const observer = new MutationObserver(enhance);
  observer.observe(root, { childList: true, subtree: true });
}

window.FreeformQuickForm = initQuickForm;
