import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { initializeActivityFilters } from "./live-filters";

const response = (label: string) => ({
  ok: true,
  text: async () =>
    `<div data-activity-results><strong>${label}</strong></div>`,
});
const settle = async () => {
  for (let i = 0; i < 6; i++) await Promise.resolve();
};
const deferred = () => {
  let resolve!: (value: ReturnType<typeof response>) => void;
  const promise = new Promise<ReturnType<typeof response>>((done) => {
    resolve = done;
  });
  return { promise, resolve };
};
let dispose: () => void;
let fetcher: ReturnType<typeof vi.fn>;
let bind: ReturnType<typeof vi.fn>;
let root: HTMLElement;
const formSelect = () =>
  root.querySelector<HTMLSelectElement>('select[name="formId"]')!;
const search = () =>
  root.querySelector<HTMLInputElement>('.ff-activity-filters input[name="q"]')!;
const changeForm = (value: string) => {
  formSelect().value = value;
  formSelect().dispatchEvent(new Event("change", { bubbles: true }));
};
const typeSearch = (value: string) => {
  search().value = value;
  search().dispatchEvent(new Event("input", { bubbles: true }));
};

describe("live Activity filters", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("jQuery", undefined);
    window.history.replaceState(
      null,
      "",
      "/admin/freeform/activity?site=english",
    );
    document.body.innerHTML = `<div data-activity-log>
      <form class="ff-activity-view-form"><input data-activity-view-filter type="hidden" name="q" value=""><button type="submit" name="view" value="submissions">By submission</button><button type="submit" name="view" value="events">Individual events</button></form>
      <form class="ff-activity-filters" action="/admin/freeform/activity?site=english">
        <input name="q" value="">
        <select name="formId"><option value="0">All forms</option><option value="14">Contact</option><option value="20">Feedback</option></select>
        <select name="category"><option value="all">All activity</option><option value="email">Email</option></select>
        <select name="level"><option value="all">All outcomes</option><option value="error">Errors</option></select>
        <input type="hidden" name="view" value="submissions">
        <button data-activity-apply>Apply</button><span class="spinner hidden" data-activity-loading></span>
        <a data-activity-reset href="/admin/freeform/activity?site=english&view=submissions">Reset</a>
      </form>
      <p data-activity-filter-status class="visually-hidden" data-loading="Updating" data-complete="Updated" data-error="Try again"></p>
      <div data-activity-results><strong>Original</strong></div>
    </div>`;
    root = document.querySelector<HTMLElement>("[data-activity-log]")!;
    fetcher = vi.fn().mockResolvedValue(response("Updated"));
    bind = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    dispose = initializeActivityFilters(root, bind);
  });
  afterEach(() => {
    dispose();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("updates immediately on selection, preserves controls, and keeps the view switch in sync", async () => {
    const originalSelect = formSelect();
    expect(fetcher).not.toHaveBeenCalled();
    expect(
      root.querySelector<HTMLButtonElement>("[data-activity-apply]")!.hidden,
    ).toBe(true);
    changeForm("14");
    await settle();
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(new URL(fetcher.mock.calls[0][0]).searchParams.get("formId")).toBe(
      "14",
    );
    expect(root.querySelector("[data-activity-results]")!.textContent).toBe(
      "Updated",
    );
    expect(formSelect()).toBe(originalSelect);
    expect(formSelect().value).toBe("14");
    expect(
      root.querySelector<HTMLInputElement>(
        '.ff-activity-view-form [name="formId"]',
      )!.value,
    ).toBe("14");
    expect(window.location.search).toContain("formId=14");
    expect(bind).toHaveBeenCalledTimes(1);
  });

  it("submits a changed view even when Craft's button handler prevents default submission", async () => {
    changeForm("14");
    await settle();
    const viewForm = root.querySelector<HTMLFormElement>(
      ".ff-activity-view-form",
    )!;
    const button = viewForm.querySelector<HTMLButtonElement>(
      'button[value="events"]',
    )!;
    button.addEventListener("click", (event) => event.preventDefault());
    const submit = vi
      .spyOn(viewForm, "requestSubmit")
      .mockImplementation(() => {});
    button.click();
    expect(submit).toHaveBeenCalledWith(button);
    expect(new FormData(viewForm).get("formId")).toBe("14");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("updates pagination live and does not reset the page when unchanged controls emit a change", async () => {
    root.querySelector("[data-activity-results]")!.innerHTML =
      '<div class="pagination"><a class="page-link next-page" href="/admin/freeform/activity?site=english&view=submissions&before=50&page=2">Next</a></div>';
    root.querySelector<HTMLAnchorElement>(".next-page")!.click();
    await settle();
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(new URL(fetcher.mock.calls[0][0]).searchParams.get("before")).toBe(
      "50",
    );
    expect(window.location.search).toContain("page=2");
    changeForm("0");
    await settle();
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(window.location.search).toContain("page=2");
  });

  it("keeps All outcomes selected and removes the old outcome filter", async () => {
    const outcome = root.querySelector<HTMLSelectElement>(
      'select[name="level"]',
    )!;
    outcome.value = "error";
    outcome.dispatchEvent(new Event("change", { bubbles: true }));
    await settle();
    outcome.value = "all";
    outcome.dispatchEvent(new Event("change", { bubbles: true }));
    outcome.dispatchEvent(new Event("blur"));
    await settle();
    expect(outcome.value).toBe("all");
    expect(new URL(fetcher.mock.calls[1][0]).searchParams.has("level")).toBe(
      false,
    );
    expect(window.location.search).not.toContain("level=");
    expect(
      root
        .querySelector("[data-activity-reset]")!
        .classList.contains("disabled"),
    ).toBe(true);
  });

  it("keeps Reset visible and inactive until a filter is selected", async () => {
    const reset = root.querySelector<HTMLAnchorElement>(
      "[data-activity-reset]",
    )!;
    expect(reset.classList.contains("hidden")).toBe(false);
    expect(reset.getAttribute("aria-disabled")).toBe("true");
    reset.click();
    await settle();
    expect(fetcher).not.toHaveBeenCalled();
    changeForm("14");
    await settle();
    expect(reset.getAttribute("aria-disabled")).toBe("false");
    expect(reset.tabIndex).toBe(0);
  });

  it("waits for a pause in typing rather than requesting on every keystroke", async () => {
    typeSearch("sub");
    await vi.advanceTimersByTimeAsync(200);
    typeSearch("submission");
    await vi.advanceTimersByTimeAsync(349);
    expect(fetcher).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(new URL(fetcher.mock.calls[0][0]).searchParams.get("q")).toBe(
      "submission",
    );
  });

  it("aborts superseded requests and ignores stale responses even if cancellation is ignored", async () => {
    const first = deferred();
    const second = deferred();
    fetcher
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);
    changeForm("14");
    changeForm("20");
    expect(fetcher.mock.calls[0][1].signal.aborted).toBe(true);
    second.resolve(response("Feedback"));
    await settle();
    first.resolve(response("Stale Contact"));
    await settle();
    expect(root.querySelector("[data-activity-results]")!.textContent).toBe(
      "Feedback",
    );
    expect(window.location.search).toContain("formId=20");
  });

  it("preserves results on failure and allows an explicit retry", async () => {
    fetcher.mockRejectedValueOnce(new Error("Offline"));
    changeForm("14");
    await settle();
    expect(root.querySelector("[data-activity-results]")!.textContent).toBe(
      "Original",
    );
    expect(
      root.querySelector("[data-activity-filter-status]")!.textContent,
    ).toBe("Try again");
    expect(
      root.querySelector<HTMLButtonElement>("[data-activity-apply]")!.hidden,
    ).toBe(false);
    root
      .querySelector(".ff-activity-filters")!
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    await settle();
    expect(root.querySelector("[data-activity-results]")!.textContent).toBe(
      "Updated",
    );
    expect(
      root.querySelector<HTMLButtonElement>("[data-activity-apply]")!.hidden,
    ).toBe(true);
    expect(
      root.querySelector("[data-activity-results]")!.getAttribute("aria-busy"),
    ).toBe("false");
  });

  it("restores filters and results on browser history navigation without adding a history entry", async () => {
    changeForm("14");
    await settle();
    const push = vi.spyOn(window.history, "pushState");
    const setValue = vi.fn((value: string) => {
      formSelect().value = value;
    });
    Object.assign(formSelect(), { selectize: { setValue } });
    window.history.replaceState(
      null,
      "",
      "/admin/freeform/activity?site=english&formId=20&q=email",
    );
    window.dispatchEvent(new PopStateEvent("popstate"));
    await settle();
    expect(setValue).toHaveBeenCalledWith("20", true);
    expect(search().value).toBe("email");
    expect(push).not.toHaveBeenCalled();
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("clears a submission filter on reset and restores it through browser history", async () => {
    const submission = document.createElement("input");
    submission.type = "hidden";
    submission.name = "submissionId";
    submission.value = "42";
    root.querySelector(".ff-activity-filters")!.append(submission);
    changeForm("14");
    await settle();
    fetcher.mockClear();
    root.querySelector<HTMLAnchorElement>("[data-activity-reset]")!.click();
    await settle();
    expect(
      new URL(fetcher.mock.calls[0][0]).searchParams.has("submissionId"),
    ).toBe(false);
    expect(submission.disabled).toBe(true);
    window.history.replaceState(
      null,
      "",
      "/admin/freeform/activity?site=english&submissionId=42",
    );
    window.dispatchEvent(new PopStateEvent("popstate"));
    await settle();
    expect(submission.disabled).toBe(false);
    expect(submission.value).toBe("42");
  });

  it("cancels a pending change when returning to the already displayed filters", async () => {
    const first = deferred();
    fetcher.mockReturnValueOnce(first.promise);
    changeForm("14");
    changeForm("0");
    first.resolve(response("Stale Contact"));
    await settle();
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher.mock.calls[0][1].signal.aborted).toBe(true);
    expect(root.querySelector("[data-activity-results]")!.textContent).toBe(
      "Original",
    );
  });

  it("does not replace results with a login page or malformed response", async () => {
    fetcher.mockResolvedValueOnce({
      ok: true,
      text: async () => "<h1>Sign in</h1>",
    });
    changeForm("14");
    await settle();
    expect(root.querySelector("[data-activity-results]")!.textContent).toBe(
      "Original",
    );
    expect(
      root.querySelector<HTMLButtonElement>("[data-activity-apply]")!.hidden,
    ).toBe(false);
  });
});
