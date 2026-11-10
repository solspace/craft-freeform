import { beforeEach, describe, expect, it, vi } from "vitest";
import { bindSpamReviewActions } from "./spam-review";

describe("spam quick review", () => {
  let request: ReturnType<typeof vi.fn>;
  let refresh: ReturnType<typeof vi.fn>;
  let notify: ReturnType<typeof vi.fn>;
  let cleanup: () => void;
  const button = (operation = "approve") =>
    document.querySelector<HTMLButtonElement>(
      `[data-spam-review-id="10"] [data-spam-operation="${operation}"]`,
    )!;

  beforeEach(() => {
    document.body.innerHTML = `<table><tbody><tr><td><div data-spam-review-id="10">
      <button type="button" data-spam-operation="approve"><svg><path/></svg>Approve</button>
      <button type="button" data-spam-operation="delete">Delete</button>
    </div></td></tr><tr><td><div data-spam-review-id="11"><button data-spam-operation="approve">Approve</button></div></td></tr></tbody></table>`;
    request = vi.fn().mockResolvedValue(undefined);
    refresh = vi.fn().mockResolvedValue(undefined);
    notify = vi.fn();
    cleanup = bindSpamReviewActions(document.body, {
      request,
      refresh,
      notify,
      translate: (text: string) => text,
    });
  });

  it.each(["approve", "delete"])(
    "sends one %s request and refreshes the list",
    async (operation) => {
      button(operation).click();
      await vi.waitFor(() => expect(refresh).toHaveBeenCalledOnce());
      expect(request).toHaveBeenCalledWith(10, operation);
      expect(notify).toHaveBeenCalledWith(
        "success",
        operation === "approve"
          ? "Submission approved."
          : "Submission deleted.",
      );
    },
  );

  it("prevents double clicks and competing operations on the same row", async () => {
    let resolveRequest!: () => void;
    request.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveRequest = resolve;
      }),
    );
    button().click();
    button("delete").click();
    expect(button().disabled).toBe(true);
    expect(button("delete").disabled).toBe(true);
    expect(request).toHaveBeenCalledOnce();
    resolveRequest();
    await vi.waitFor(() => expect(refresh).toHaveBeenCalledOnce());
  });

  it("keeps the row and allows retry when the action fails", async () => {
    request.mockRejectedValueOnce(new Error("Action failed"));
    button().click();
    await vi.waitFor(() =>
      expect(notify).toHaveBeenCalledWith(
        "error",
        "Could not approve submission.",
      ),
    );
    expect(refresh).not.toHaveBeenCalled();
    expect(button().disabled).toBe(false);
    button().click();
    await vi.waitFor(() => expect(refresh).toHaveBeenCalledOnce());
  });

  it("does not repeat a successful approval when refreshing fails", async () => {
    refresh.mockRejectedValue(new Error("Refresh failed"));
    button().click();
    await vi.waitFor(() =>
      expect(notify).toHaveBeenLastCalledWith(
        "error",
        expect.stringContaining("list could not be refreshed"),
      ),
    );
    button().click();
    expect(request).toHaveBeenCalledOnce();
    expect(button().disabled).toBe(true);
  });

  it("requests keyboard focus on the next remaining row", async () => {
    button().focus();
    button().click();
    await vi.waitFor(() =>
      expect(refresh).toHaveBeenCalledWith({ focus: true, nextId: "11" }),
    );
  });

  it("handles clicks on icons without selecting the submission", async () => {
    const onClick = vi.fn();
    document.body.addEventListener("click", onClick);
    button()
      .querySelector("path")!
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await vi.waitFor(() => expect(request).toHaveBeenCalledOnce());
    expect(onClick).not.toHaveBeenCalled();
    document.body.removeEventListener("click", onClick);
  });

  it("does not act through controls belonging to a replaced list", () => {
    cleanup();
    button().click();
    expect(request).not.toHaveBeenCalled();
  });
});
