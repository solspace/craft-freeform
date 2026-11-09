import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type AjaxRequest = {
  type: string;
  data: Record<string, unknown>;
  success: (html?: string) => void;
  error: (error?: { responseJSON: { message: string } }) => void;
  complete: () => void;
};
type ModalSettings = {
  hideOnEsc: boolean;
  hideOnShadeClick: boolean;
  onFadeOut: () => void;
  onFadeIn: () => void;
};
type ModalFixture = {
  settings: ModalSettings;
  destroy: () => void;
  hide: () => void;
};

describe("submission additional notification modal", () => {
  let requests: AjaxRequest[];
  let displayError: ReturnType<typeof vi.fn>;
  let displaySuccess: ReturnType<typeof vi.fn>;
  let modal: ModalFixture | undefined;

  // The entry point uses Craft's jQuery transport. Keep the fixture limited to
  // that boundary while exercising actual DOM selections and submit events.
  function wrap(elements: Element[]) {
    return {
      elements,
      html(html: string) {
        elements[0].innerHTML = html;
      },
      find(selector: string) {
        return wrap(
          elements.flatMap((element) =>
            Array.from(element.querySelectorAll(selector)),
          ),
        );
      },
      get(index: number) {
        return elements[index];
      },
      on(events: Record<string, EventListener>) {
        for (const [type, handler] of Object.entries(events)) {
          for (const element of elements)
            element.addEventListener(type, handler);
        }
      },
      prop(name: "disabled", value: boolean) {
        for (const element of elements)
          (element as HTMLButtonElement)[name] = value;
      },
      show() {},
      hide() {},
      remove() {
        for (const element of elements) element.remove();
      },
    };
  }

  beforeEach(async () => {
    vi.resetModules();
    document.body.innerHTML = "";
    requests = [];
    modal = undefined;
    displayError = vi.fn();
    displaySuccess = vi.fn();
    const jquery = Object.assign(
      (selector: string, context?: ReturnType<typeof wrap>) => {
        if (selector.startsWith("<")) {
          const wrapper = document.createElement("div");
          wrapper.innerHTML = selector;
          const element = wrapper.firstElementChild!;
          document.body.append(element);
          return wrap([element]);
        }
        return context
          ? context.find(selector)
          : wrap(Array.from(document.querySelectorAll(selector)));
      },
      {
        ajax: (request: AjaxRequest) => {
          requests.push(request);
        },
      },
    );
    vi.stubGlobal("$", jquery);
    vi.stubGlobal("Craft", {
      getCpUrl: (url: string) => url,
      csrfTokenName: "csrf",
      csrfTokenValue: "test-token",
      t: (_category: string, text: string) => text,
      cp: { displayError, displaySuccess },
    });
    vi.stubGlobal("Garnish", {
      Modal: class {
        settings: ModalSettings;
        constructor(content: ReturnType<typeof wrap>, settings: ModalSettings) {
          this.settings = {
            hideOnEsc: true,
            hideOnShadeClick: true,
            ...settings,
          };
          modal = this;
          this.destroy = vi.fn(() => content.remove());
          this.hide = vi.fn(() => settings.onFadeOut());
        }
        destroy() {}
        hide() {}
        updateSizeAndPosition() {}
      },
    });
    await import("./send-notification.js");
    (
      window as Window & { freeform_notify: (ids: number[]) => void }
    ).freeform_notify([1, 2]);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function openModal() {
    requests[0].success(`<form>
      <h1 tabindex="-1" data-notification-title>Send Notifications</h1>
      <select name="template"><option value="12">Test</option></select>
      <input type="checkbox" name="selectedEmails[]" value="alice@example.test">
      <textarea name="emails"></textarea>
      <button class="btn cancel" type="button">Cancel</button>
      <button class="btn submit" type="submit">Send</button><div class="spinner"></div>
    </form>`);
    const form = document.querySelector("form")!;
    // jsdom does not expose named controls as form properties.
    Object.defineProperty(form, "template", {
      value: form.querySelector("select"),
    });
    Object.defineProperty(form, "emails", {
      value: form.querySelector("textarea"),
    });
    return form;
  }

  function submit(form: HTMLFormElement) {
    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true }),
    );
  }

  it("loads recipients for exactly the selected submissions", () => {
    expect(requests[0].type).toBe("post");
    expect(requests[0].data).toEqual({
      submissionIds: [1, 2],
      csrf: "test-token",
    });
  });

  it("opens with focus on the title and leaves form controls available for keyboard focus", () => {
    const form = openModal();
    form.querySelector("select")!.focus();
    modal!.settings.onFadeIn();
    expect(document.activeElement).toBe(form.querySelector("h1"));
    expect(form.querySelector("h1")!.tabIndex).toBe(-1);
    form.querySelector("select")!.focus();
    expect(document.activeElement).toBe(form.querySelector("select"));
  });

  it("requires a selected or manually entered recipient", () => {
    submit(openModal());
    expect(requests).toHaveLength(1);
    expect(displayError).toHaveBeenCalledWith(
      "Select a recipient or enter an email address.",
    );
  });

  it("allows checkbox-only sends, prevents duplicate sends, and retains selections after failure", () => {
    const form = openModal();
    form.querySelector<HTMLInputElement>("input")!.click();
    submit(form);
    submit(form);
    expect(requests).toHaveLength(2);
    expect(requests[1].data).toEqual({
      template: "12",
      templateMode: "custom",
      emails: "",
      selectedEmails: ["alice@example.test"],
      submissionIds: [1, 2],
      csrf: "test-token",
    });
    expect(form.querySelector<HTMLButtonElement>(".submit")!.disabled).toBe(
      true,
    );
    requests[1].error({ responseJSON: { message: "Send failed" } });
    requests[1].complete();
    expect(displayError).toHaveBeenCalledWith("Send failed");
    expect(form.querySelector<HTMLInputElement>("input")!.checked).toBe(true);
    expect(form.querySelector<HTMLButtonElement>(".submit")!.disabled).toBe(
      false,
    );
    expect(modal!.hide).not.toHaveBeenCalled();
    submit(form);
    expect(requests).toHaveLength(3);
  });

  it("preserves manual-only sending and closes through the modal lifecycle on success", () => {
    const form = openModal();
    form.querySelector("textarea")!.value = "team@example.test";
    submit(form);
    expect(requests[1].data.selectedEmails).toEqual([]);
    expect(requests[1].data.emails).toBe("team@example.test");
    requests[1].success();
    requests[1].complete();
    expect(modal!.hide).toHaveBeenCalledOnce();
    expect(modal!.destroy).toHaveBeenCalledOnce();
    expect(displaySuccess).toHaveBeenCalledOnce();
    expect(document.querySelector("form")).toBeNull();
  });

  it("reports a failed recipient load without opening a modal", () => {
    requests[0].error();
    expect(modal).toBeUndefined();
    expect(displayError).toHaveBeenCalledWith(
      "Unable to load notification recipients. Please try again.",
    );
  });
});
