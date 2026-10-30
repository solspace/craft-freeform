import { bindSpamReviewActions } from "@lib/cp/spam-review";
import { mountSubmissionStatuses } from "@lib/cp/submission-status";
import { bindSubmissionUndo } from "@lib/cp/submission-undo";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@lib/cp/submission-status", () => ({
  mountSubmissionStatuses: vi.fn(),
}));
vi.mock("@lib/cp/spam-review", () => ({ bindSpamReviewActions: vi.fn() }));
vi.mock("@lib/cp/submission-undo", () => ({ bindSubmissionUndo: vi.fn() }));

const createCollection = () => ({
  append: vi.fn(),
  html: vi.fn().mockReturnValue(""),
  on: vi.fn(),
  before: vi.fn(),
  find: vi.fn().mockReturnValue({ each: vi.fn() }),
});

const createCraft = () => {
  const extend = <T>(config: T) => config;
  return {
    Freeform: {} as Record<
      string,
      {
        afterInit(): void;
        destroy(): void;
        statusAction: string;
        spamReview?: boolean;
      }
    >,
    BaseElementIndex: { extend },
    TableElementIndexView: { extend },
    registerElementIndexClass: vi.fn(),
    sendActionRequest: vi.fn().mockResolvedValue({ data: { success: true } }),
    t: (_category: string, message: string) => message,
  };
};

describe("submission index status controls", () => {
  let craft: ReturnType<typeof createCraft>;
  let collection: ReturnType<typeof createCollection>;
  let cleanup: ReturnType<typeof vi.fn>;
  let reviewCleanup: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    cleanup = vi.fn();
    reviewCleanup = vi.fn();
    vi.mocked(mountSubmissionStatuses).mockReturnValue(cleanup);
    vi.mocked(bindSpamReviewActions).mockReturnValue(reviewCleanup);
    collection = createCollection();
    const jquery = Object.assign(vi.fn().mockReturnValue(collection), {
      proxy: vi.fn().mockReturnValue(vi.fn()),
    });
    craft = createCraft();
    vi.stubGlobal("Craft", craft);
    vi.stubGlobal("$", jquery);
    await import("./element-index");
  });

  afterEach(() => {
    document.body.replaceChildren();
    vi.unstubAllGlobals();
  });

  it.each([
    ["SubmissionsIndex", "freeform/submissions/set-status"],
    ["SpamSubmissionsIndex", "freeform/spam-submissions/set-status"],
  ])(
    "%s mounts the same controls and saves through its own lookup",
    async (name, action) => {
      const handlers: Record<string, () => void> = {};
      const index = {
        ...craft.Freeform[name],
        settings: { context: "index" },
        $elements: { 0: document.body, find: collection.find },
        $statusMenuContainer: collection,
        on: (event: string, callback: () => void) => {
          handlers[event] = callback;
        },
        base: vi.fn(),
        updateElements: vi.fn(),
        namespaceId: (id: string) => id.replaceAll("\\", "-"),
      };
      index.afterInit();
      handlers.updateElements();
      const [container, options] = vi.mocked(mountSubmissionStatuses).mock
        .calls[0];
      expect(container).toBe(document.body);
      await options.saveStatus(10, 2);
      expect(craft.sendActionRequest).toHaveBeenCalledWith("POST", action, {
        data: { submissionId: 10, statusId: 2 },
      });
      if (name === "SpamSubmissionsIndex") {
        const [reviewContainer, reviewOptions] = vi.mocked(
          bindSpamReviewActions,
        ).mock.calls[0];
        expect(reviewContainer).toBe(document.body);
        await reviewOptions.request(10, "delete");
        expect(craft.sendActionRequest).toHaveBeenLastCalledWith(
          "POST",
          "freeform/spam-submissions/review",
          { data: { submissionId: 10, operation: "delete" } },
        );
      } else {
        expect(bindSpamReviewActions).not.toHaveBeenCalled();
      }
      handlers.updateElements();
      expect(cleanup).toHaveBeenCalledOnce();
      index.destroy();
      expect(cleanup).toHaveBeenCalledTimes(2);
      if (name === "SpamSubmissionsIndex")
        expect(reviewCleanup).toHaveBeenCalledTimes(2);
    },
  );

  it.each(["SubmissionsIndex", "SpamSubmissionsIndex"])(
    "%s shares server Undo history and records successful quick actions",
    async (name) => {
      const history = [
        {
          token: "latest",
          operation: "status",
          title: "QA",
          expiresAt: Date.now() / 1000 + 1800,
        },
      ];
      vi.stubGlobal("freeformSubmissionUndoHistory", history);
      const template = document.createElement("template");
      template.id = "freeform-submission-undo";
      const slot = document.createElement("div");
      slot.className = "ff-submission-undo-slot";
      slot.append(document.createElement("button"));
      template.content.append(slot);
      document.body.append(template);
      const undo = { setHistory: vi.fn(), sync: vi.fn(), destroy: vi.fn() };
      vi.mocked(bindSubmissionUndo).mockReturnValue(undo);
      const handlers: Record<string, () => void> = {};
      const index = {
        ...craft.Freeform[name],
        settings: { context: "index" },
        $elements: { 0: document.body, find: collection.find },
        $statusMenuContainer: collection,
        on: (event: string, callback: () => void) => {
          handlers[event] = callback;
        },
        base: vi.fn(),
        updateElements: vi.fn(),
      };
      craft.sendActionRequest.mockResolvedValue({
        data: { success: true, undoHistory: history },
      });
      index.afterInit();
      const [button, undoOptions] = vi.mocked(bindSubmissionUndo).mock.calls[0];
      expect(button).toBeInstanceOf(HTMLButtonElement);
      expect(undoOptions.initialHistory).toEqual(history);
      handlers.updateElements();
      handlers.afterAction();
      expect(undo.sync).toHaveBeenCalledOnce();
      await vi
        .mocked(mountSubmissionStatuses)
        .mock.calls[0][1].saveStatus(10, 2);
      expect(undo.setHistory).toHaveBeenCalledWith(history);
      await undoOptions.requestUndo("latest");
      expect(craft.sendActionRequest).toHaveBeenLastCalledWith(
        "POST",
        "freeform/submissions/undo",
        { data: { token: "latest" } },
      );
      if (name === "SpamSubmissionsIndex") {
        await vi
          .mocked(bindSpamReviewActions)
          .mock.calls[0][1].request(10, "approve");
        expect(undo.setHistory).toHaveBeenCalledTimes(2);
      }
      index.destroy();
      expect(undo.destroy).toHaveBeenCalledOnce();
    },
  );
});
