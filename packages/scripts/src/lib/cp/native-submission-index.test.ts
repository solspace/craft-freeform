import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  mountNativeSubmissionTools,
  openNativeNotificationDialog,
  openNativeQuickExport,
} from "./native-submission-index";

describe("native submission tools", () => {
  const markup = `<form><input name="_token" value="test-token"><h1>Export data</h1>
    <select name="form_id"><option value="5">Contact</option><option value="6">Quote</option></select>
    <div class="form-field-list" data-id="5"><input name="contact" value="1"></div>
    <div class="form-field-list" data-id="6"><input name="quote" value="1"></div>
    <div class="footer"><input class="btn cancel" value="Cancel"><input class="btn submit" value="Export"></div></form>`;
  const api = () => ({
    http: { get: vi.fn().mockResolvedValue({ data: markup }), post: vi.fn() },
    actionClient: {
      get: vi.fn().mockResolvedValue({ data: { undoHistory: [] } }),
      post: vi.fn(),
    },
    getCpUrl: (path: string) => `https://example.test/admin/${path}`,
    getActionUrl: (path: string) =>
      `https://example.test/admin/actions/${path}`,
    t: (message: string) => message,
    showSuccess: vi.fn(),
    showError: vi.fn(),
  });

  beforeEach(() => {
    document.body.innerHTML = '<button id="export">Quick Export</button>';
    Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
      configurable: true,
      value: function (this: HTMLDialogElement) {
        this.open = true;
      },
    });
    Object.defineProperty(HTMLDialogElement.prototype, "close", {
      configurable: true,
      value: function (this: HTMLDialogElement) {
        this.open = false;
        this.dispatchEvent(new Event("close"));
      },
    });
  });
  afterEach(() => {
    vi.restoreAllMocks();
    Reflect.deleteProperty(HTMLDialogElement.prototype, "showModal");
    Reflect.deleteProperty(HTMLDialogElement.prototype, "close");
    document.body.innerHTML = "";
  });

  it("uses the spam export scope and disables fields belonging to another form", async () => {
    const service = api();
    await openNativeQuickExport(
      service,
      document.querySelector("button"),
      true,
    );
    expect(
      new URL(service.http.get.mock.calls[0][0]).searchParams.get("isSpam"),
    ).toBe("true");
    const form = document.querySelector("form")!;
    expect(form.action).toBe(
      "https://example.test/admin/freeform/export/quick-export",
    );
    expect(
      form.querySelector<HTMLInputElement>('[name="contact"]')!.disabled,
    ).toBe(false);
    expect(
      form.querySelector<HTMLInputElement>('[name="quote"]')!.disabled,
    ).toBe(true);
    const selector = form.querySelector("select")!;
    selector.value = "6";
    selector.dispatchEvent(new Event("change"));
    expect(
      form.querySelector<HTMLInputElement>('[name="contact"]')!.disabled,
    ).toBe(true);
    expect(
      form.querySelector<HTMLInputElement>('[name="quote"]')!.disabled,
    ).toBe(false);
    document
      .querySelector<HTMLElement>('craft-button[variant="fill"]')!
      .click();
    expect(document.querySelector("dialog")).toBeNull();
    expect(document.activeElement?.id).toBe("export");
  });

  it("prevents duplicate dialog requests and restores the button after a failure", async () => {
    const service = api();
    service.http.get.mockRejectedValueOnce(new Error("Network unavailable"));
    const trigger = document.querySelector("button")!;
    const pending = openNativeQuickExport(service, trigger, false);
    await openNativeQuickExport(service, trigger, false);
    await expect(pending).rejects.toThrow("Network unavailable");
    expect(service.http.get).toHaveBeenCalledOnce();
    expect(trigger.disabled).toBe(false);
    expect(document.querySelector("dialog")).toBeNull();
    await openNativeQuickExport(service, trigger, false);
    expect(document.querySelector("dialog")?.open).toBe(true);
  });

  it("binds late-mounted rows once and keeps failed review actions retryable", async () => {
    const service = api();
    service.actionClient.post.mockRejectedValue(new Error("Save failed"));
    const dispose = mountNativeSubmissionTools(service);
    document.body.innerHTML = `<div data-freeform-native-index><button data-freeform-index-undo></button></div>
      <div data-spam-review-id="33"><button data-spam-operation="approve">Approve</button></div>`;
    await vi.waitFor(() =>
      expect(service.actionClient.get).toHaveBeenCalledOnce(),
    );
    const button = document.querySelector<HTMLButtonElement>(
      "[data-spam-operation]",
    )!;
    button.click();
    await vi.waitFor(() => expect(service.showError).toHaveBeenCalledOnce());
    expect(service.actionClient.post).toHaveBeenCalledWith(
      "freeform/spam-submissions/review",
      { submissionId: 33, operation: "approve" },
    );
    expect(button.disabled).toBe(false);
    document.body.append(document.createElement("div"));
    await Promise.resolve();
    button.click();
    await vi.waitFor(() =>
      expect(service.actionClient.post).toHaveBeenCalledTimes(2),
    );
    dispose();
  });
  it("opens the native notification action with the selected IDs and cancels without sending", async () => {
    const service = api();
    service.http.post = vi.fn().mockResolvedValue({
      data: `<form><h1 tabindex="-1" data-notification-title>Send Notifications</h1><textarea name="emails"></textarea><div class="footer"><button type="button">Cancel</button><button type="submit">Send Notifications</button></div></form>`,
    });
    const dispose = mountNativeSubmissionTools(service);
    window.dispatchEvent(
      new CustomEvent("freeform:send-notifications", {
        detail: { elementIds: [69, 271] },
      }),
    );
    await vi.waitFor(() =>
      expect(document.querySelector("dialog")?.open).toBe(true),
    );
    expect(service.http.post).toHaveBeenCalledExactlyOnceWith(
      "https://example.test/admin/freeform/notifications/send-notification-dialogue",
      { submissionIds: [69, 271] },
    );
    document
      .querySelector<HTMLElement>('craft-button[variant="fill"]')!
      .click();
    expect(document.querySelector("dialog")).toBeNull();
    expect(service.http.post).toHaveBeenCalledTimes(1);
    dispose();
  });

  it("validates notification recipients, preserves choices on send failure, and permits retry", async () => {
    const service = api();
    service.http.post = vi
      .fn()
      .mockResolvedValueOnce({
        data: `<form><h1 tabindex="-1" data-notification-title>Send Notifications</h1><select name="template"><option value="8">Template</option></select><textarea name="emails"></textarea><div class="footer"><button type="button">Cancel</button><button type="submit">Send Notifications</button></div></form>`,
      })
      .mockRejectedValueOnce({ response: { data: { message: "Mail failed" } } })
      .mockResolvedValueOnce({ data: true });
    await openNativeNotificationDialog(service, [69]);
    const send = document.querySelector<HTMLElement>(
      'craft-button[variant="primary"]',
    )!;
    send.click();
    expect(service.showError).toHaveBeenCalledWith(
      "Select a recipient or enter an email address.",
    );
    expect(service.http.post).toHaveBeenCalledTimes(1);
    document.querySelector("textarea")!.value = "test@example.com";
    send.click();
    await vi.waitFor(() =>
      expect(service.showError).toHaveBeenCalledWith("Mail failed"),
    );
    expect(document.querySelector("dialog")?.open).toBe(true);
    expect(document.querySelector("textarea")!.value).toBe("test@example.com");
    send.click();
    await vi.waitFor(() => expect(document.querySelector("dialog")).toBeNull());
    expect(service.http.post).toHaveBeenLastCalledWith(
      "https://example.test/admin/freeform/notifications/send-notification",
      {
        submissionIds: [69],
        templateMode: "custom",
        template: "8",
        emails: "test@example.com",
        selectedEmails: [],
      },
    );
    expect(service.showSuccess).toHaveBeenCalledWith(
      "Notifications sent successfully.",
    );
  });
});
