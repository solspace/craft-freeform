import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { exportSubmissions } from "./export-csv";

const request = vi.fn();
const displayError = vi.fn();

beforeEach(() => {
  vi.stubGlobal("Craft", {
    sendActionRequest: request,
    cp: { displayError },
    t: (_category: string, message: string) => message,
    csrfTokenName: "CRAFT_CSRF_TOKEN",
    csrfTokenValue: "test-csrf",
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  request.mockReset();
  displayError.mockReset();
  document.body.replaceChildren();
});

describe("selected submission CSV export", () => {
  it("shows mixed-form validation in a toast without submitting a download", async () => {
    const message =
      "Please select submissions from a single form and try again.";
    request.mockResolvedValue({ data: { success: false, message } });
    const submit = vi.spyOn(HTMLFormElement.prototype, "submit");

    await exportSubmissions([101, 102]);

    expect(displayError).toHaveBeenCalledWith(message);
    expect(submit).not.toHaveBeenCalled();
    expect(document.querySelector("form")).toBeNull();
  });

  it("downloads the same selection with CSRF protection after validation", async () => {
    request.mockResolvedValue({ data: { success: true } });
    const submit = vi
      .spyOn(HTMLFormElement.prototype, "submit")
      .mockImplementation(function (this: HTMLFormElement) {
        expect(this.method).toBe("post");
        expect(Object.fromEntries(new FormData(this))).toEqual({
          action: "freeform/submissions/export",
          submissionIds: "101,102",
          CRAFT_CSRF_TOKEN: "test-csrf",
        });
      });

    await exportSubmissions([101, 102]);

    expect(request).toHaveBeenCalledWith(
      "POST",
      "freeform/submissions/validate-export",
      { data: { submissionIds: "101,102" } },
    );
    expect(submit).toHaveBeenCalledOnce();
    expect(displayError).not.toHaveBeenCalled();
    expect(document.querySelector("form")).toBeNull();
  });

  it("waits for validation and ignores duplicate clicks while it is pending", async () => {
    let resolve!: (value: unknown) => void;
    request.mockReturnValue(new Promise((done) => (resolve = done)));
    const submit = vi.spyOn(HTMLFormElement.prototype, "submit");

    const exportRequest = exportSubmissions([101, 102]);
    await exportSubmissions([101, 102]);
    expect(request).toHaveBeenCalledOnce();
    expect(submit).not.toHaveBeenCalled();

    resolve({ data: { success: false, message: "Select a single form." } });
    await exportRequest;
    expect(displayError).toHaveBeenCalledWith("Select a single form.");
    expect(submit).not.toHaveBeenCalled();
  });

  it("shows a toast after a failed request and permits a retry", async () => {
    request.mockRejectedValueOnce(new Error("Connection interrupted"));
    const submit = vi.spyOn(HTMLFormElement.prototype, "submit");
    await exportSubmissions([101]);
    expect(displayError).toHaveBeenCalledWith(
      "Could not export submissions. Please try again.",
    );
    expect(submit).not.toHaveBeenCalled();

    request.mockResolvedValue({
      data: { success: false, message: "No submissions found" },
    });
    await exportSubmissions([101]);
    expect(request).toHaveBeenCalledTimes(2);
    expect(displayError).toHaveBeenLastCalledWith("No submissions found");
  });
});
