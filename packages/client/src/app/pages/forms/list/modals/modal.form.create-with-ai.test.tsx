import axios from "axios";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { pendingGenerationKey } from "./modal.form.ai-generation";
import { CreateWithAiFormModal } from "./modal.form.create-with-ai";
import { referenceFileError } from "./modal.form.reference-files";

const fixture = vi.hoisted(() => ({
  navigate: vi.fn(),
  close: vi.fn(),
  refresh: vi.fn(),
}));
vi.mock("react-router-dom", () => ({ useNavigate: () => fixture.navigate }));
vi.mock("axios", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    isAxiosError: (error: { isAxiosError?: boolean }) =>
      error?.isAxiosError === true,
  },
}));
vi.mock("./modal.form.create-with-ai.queries", () => ({
  useRefreshGeneratedForms: () => fixture.refresh,
  useAiIntegrations: () => ({
    data: [
      {
        uid: "vision",
        name: "Configured vision",
        model: "gpt-4o",
        referenceMimeTypes: ["application/pdf", "image/png", "image/jpeg"],
      },
      {
        uid: "text",
        name: "Text only",
        model: "text-model",
        referenceMimeTypes: [],
      },
      {
        uid: "solspace",
        name: "SolspaceAI",
        model: "",
        referenceMimeTypes: ["application/pdf", "image/png", "image/jpeg"],
      },
    ],
    isLoading: false,
    isError: false,
  }),
}));
vi.mock("@ff-client/utils/translations", () => ({
  default: (text: string) => text,
}));
vi.mock("@ff-client/hooks/use-on-keypress", () => ({
  useOnKeypress: () => {},
}));
vi.mock("@components/form-controls", () => ({
  FormComponent: ({
    value,
    property,
    updateValue,
  }: {
    value: string;
    property: { handle: string; options?: { value: string; label: string }[] };
    updateValue: (value: string) => void;
  }) =>
    property.options ? (
      <select
        id={property.handle}
        value={value}
        onChange={(event) => updateValue(event.target.value)}
      >
        {property.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    ) : (
      <input
        id={property.handle}
        value={value}
        onChange={(event) => updateValue(event.target.value)}
      />
    ),
}));
vi.mock("@components/loaders/loading-text/loading-text", () => ({
  LoadingText: ({ children }: { children: ReactNode }) => (
    <span>{children}</span>
  ),
}));
let root: Root;
let host: HTMLDivElement;
const button = (label: string) =>
  Array.from(host.querySelectorAll("button")).find(
    (node) => node.textContent === label,
  )!;
const pdf = (name = "form.pdf") =>
  new File(["%PDF-1.4\n%%EOF"], name, { type: "application/pdf" });
function upload(files: File[]) {
  const input = host.querySelector<HTMLInputElement>('[type="file"]')!;
  Object.defineProperty(input, "files", { value: files, configurable: true });
  act(() => input.dispatchEvent(new Event("change", { bubbles: true })));
}
function input(id: string, value: string) {
  const element = host.querySelector<HTMLInputElement>(`#${id}`)!;
  act(() => {
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )!.set!.call(element, value);
    element.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.clearAllMocks();
  sessionStorage.clear();
  localStorage.clear();
  vi.mocked(axios.post).mockReset();
  vi.mocked(axios.get).mockReset();
  vi.mocked(axios.post).mockResolvedValue({
    data: { status: "complete", formId: 42 },
  });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() => root.render(<CreateWithAiFormModal closeModal={fixture.close} />));
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
  sessionStorage.clear();
  localStorage.clear();
});
it("reconnects after gateway errors without displaying HTML or resubmitting", async () => {
  input("prompt", "Contact form");
  vi.mocked(axios.post).mockRejectedValueOnce({
    isAxiosError: true,
    response: {
      status: 502,
      data: "<html><body>nginx Bad Gateway</body></html>",
    },
  });
  await act(async () => button("Generate form").click());
  expect(host.textContent).not.toContain("<html>");
  expect(host.textContent).not.toContain("nginx");
  expect(axios.post).toHaveBeenCalledTimes(2);
  expect(axios.post).toHaveBeenLastCalledWith(
    expect.stringMatching(/ai-generation-progress/),
    {},
    expect.any(Object),
  );
  expect(axios.get).not.toHaveBeenCalled();
  expect(host.textContent).toContain("Your form is ready");
  expect(fixture.navigate).not.toHaveBeenCalled();
  act(() => button("Open form").click());
  expect(fixture.navigate).toHaveBeenCalledWith("/forms/42");
  expect(fixture.close).toHaveBeenCalledOnce();
  expect(host.querySelector<HTMLInputElement>("#prompt")!.value).toBe(
    "Contact form",
  );
});

it("discards HTML embedded in a JSON error message", async () => {
  input("prompt", "Contact form");
  vi.mocked(axios.post).mockRejectedValue({
    isAxiosError: true,
    response: {
      status: 400,
      data: { message: "AI error: <html>gateway details</html>" },
    },
  });
  await act(async () => button("Generate form").click());
  expect(host.textContent).toContain("Form generation failed");
  expect(host.textContent).not.toContain("gateway details");
});
it("resumes a queued generation when the dialog is reopened without submitting another generation", async () => {
  sessionStorage.setItem(pendingGenerationKey, "a".repeat(32));
  act(() => root.unmount());
  root = createRoot(host);
  await act(async () =>
    root.render(<CreateWithAiFormModal closeModal={fixture.close} />),
  );
  expect(axios.post).toHaveBeenCalledOnce();
  expect(axios.post).toHaveBeenCalledWith(
    expect.stringMatching(/ai-generation-progress/),
    {},
    expect.any(Object),
  );
  expect(host.textContent).toContain("Your form is ready");
  expect(fixture.navigate).not.toHaveBeenCalled();
  act(() => button("Open form").click());
  expect(fixture.navigate).toHaveBeenCalledWith("/forms/42");
  expect(sessionStorage.getItem(pendingGenerationKey)).toBeNull();
});
it("allows references through SolspaceAI without a client model setting", async () => {
  const select = host.querySelector<HTMLSelectElement>("select")!;
  act(() => {
    select.value = "solspace";
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
  expect(host.querySelector<HTMLInputElement>('[type="file"]')!.disabled).toBe(
    false,
  );
  expect(host.textContent).not.toContain("Configured model:");
  upload([pdf()]);
  vi.mocked(axios.post).mockResolvedValue({ data: { id: 43 } });
  await act(async () => button("Generate form").click());
  const payload = vi.mocked(axios.post).mock.calls[0][1] as FormData;
  expect(payload.get("integrationUid")).toBe("solspace");
  expect(payload.get("model")).toBeNull();
  expect(payload.getAll("references[]")).toHaveLength(1);
  expect(fixture.navigate).not.toHaveBeenCalled();
  act(() => button("Open form").click());
  expect(fixture.navigate).toHaveBeenCalledWith("/forms/43");
});
it("sends a file-only request as multipart in displayed order and opens the builder", async () => {
  upload([pdf("first.pdf"), pdf("second.pdf")]);
  act(() =>
    host
      .querySelector<HTMLButtonElement>('[aria-label="Move reference down"]')!
      .click(),
  );
  vi.mocked(axios.post).mockResolvedValue({ data: { id: 42 } });
  await act(async () => button("Generate form").click());
  const [url, body] = vi.mocked(axios.post).mock.calls[0];
  expect(url).toBe("/api/forms/generate-from-ai");
  expect(body).toBeInstanceOf(FormData);
  expect(
    (body as FormData)
      .getAll("references[]")
      .map((file) => (file as File).name),
  ).toEqual(["second.pdf", "first.pdf"]);
  expect((body as FormData).get("referenceFileCount")).toBe("2");
  expect((body as FormData).get("integrationUid")).toBe("vision");
  expect(host.textContent).toContain("Your form is ready");
  expect(fixture.navigate).not.toHaveBeenCalled();
  act(() => button("Open form").click());
  expect(fixture.navigate).toHaveBeenCalledWith("/forms/42");
  expect(fixture.close).toHaveBeenCalledOnce();
});
it("preserves JSON for text-only requests", async () => {
  input("prompt", "Contact form");
  vi.mocked(axios.post).mockResolvedValue({ data: { id: 7 } });
  await act(async () => button("Generate form").click());
  expect(axios.post).toHaveBeenCalledWith("/api/forms/generate-from-ai", {
    prompt: "Contact form",
    name: undefined,
    integrationUid: "vision",
    requestId: expect.stringMatching(/^[a-f0-9]{32}$/),
  });
});
it("retains references after failure and allows retry", async () => {
  upload([pdf()]);
  vi.mocked(axios.post)
    .mockRejectedValueOnce(new Error("Unavailable"))
    .mockResolvedValueOnce({ data: { id: 8 } });
  await act(async () => button("Generate form").click());
  expect(host.textContent).toContain("Form generation failed");
  expect(host.querySelectorAll("li")).toHaveLength(1);
  expect(fixture.close).not.toHaveBeenCalled();
  await act(async () => button("Generate form").click());
  expect(axios.post).toHaveBeenCalledTimes(2);
});
it("blocks incompatible integrations until references are removed", () => {
  upload([pdf()]);
  const select = host.querySelector<HTMLSelectElement>("select")!;
  act(() => {
    select.value = "text";
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
  expect(button("Generate form").disabled).toBe(true);
  expect(host.textContent).toContain("cannot read these references");
  expect(host.querySelector<HTMLInputElement>('[type="file"]')!.disabled).toBe(
    true,
  );
  act(() =>
    host
      .querySelector<HTMLButtonElement>(
        'button[aria-label^="Remove reference"]',
      )!
      .click(),
  );
  input("prompt", "Contact form");
  expect(button("Generate form").disabled).toBe(false);
});
it("prevents duplicate submission while generation is pending", async () => {
  upload([pdf()]);
  let resolve!: (value: unknown) => void;
  vi.mocked(axios.post).mockReturnValue(
    new Promise((done) => {
      resolve = done;
    }) as ReturnType<typeof axios.post>,
  );
  const generate = button("Generate form");
  act(() => {
    generate.click();
    generate.click();
  });
  expect(axios.post).toHaveBeenCalledOnce();
  expect(button("Close").disabled).toBe(false);
  await act(async () => resolve({ data: { id: 9 } }));
});
it("rejects invalid, empty, excessive and oversized uploads", () => {
  expect(referenceFileError([pdf("file.svg")])).toContain("valid PDF");
  expect(referenceFileError([new File([], "empty.pdf")])).toContain("nonempty");
  expect(referenceFileError(Array.from({ length: 6 }, () => pdf()))).toContain(
    "up to 5",
  );
  const large = new File([new Uint8Array(10 * 1024 * 1024)], "large.pdf", {
    type: "application/pdf",
  });
  expect(referenceFileError([large, pdf()])).toContain("10 MB");
  upload([pdf("invalid.svg")]);
  expect(host.querySelectorAll("li")).toHaveLength(0);
  expect(button("Generate form").disabled).toBe(true);
});

it("collapses and disables the inputs during generation and restores them on failure", async () => {
  input("prompt", "Contact form");
  input("name", "My contact form");
  let reject!: (error: unknown) => void;
  vi.mocked(axios.post).mockReturnValue(
    new Promise((_, fail) => {
      reject = fail;
    }) as ReturnType<typeof axios.post>,
  );
  act(() => button("Generate form").click());
  expect(host.querySelector("fieldset")!.disabled).toBe(true);
  expect(document.activeElement).toBe(button("Close"));
  expect(host.querySelector("[inert]")!.getAttribute("aria-hidden")).toBe(
    "true",
  );
  expect(host.querySelector('[role="status"]')!.textContent).toContain(
    "My contact form",
  );
  expect(host.textContent).toContain("Your current work will stay open.");
  expect(host.textContent).toContain("This may take a few minutes.");
  expect(host.querySelector("time")!.textContent).toMatch(/^\d{2}:\d{2}$/);
  expect(button("Generate form")).toBeUndefined();
  await act(async () => reject(new Error("Request failed")));
  expect(host.querySelector("fieldset")!.disabled).toBe(false);
  expect(host.querySelector<HTMLInputElement>("#prompt")!.value).toBe(
    "Contact form",
  );
  expect(button("Generate form")).toBeDefined();
});

it("does not navigate or resume polling when a closed dialog receives a late response", async () => {
  input("prompt", "Contact form");
  let resolve!: (value: unknown) => void;
  vi.mocked(axios.post).mockReturnValue(
    new Promise((done) => {
      resolve = done;
    }) as ReturnType<typeof axios.post>,
  );
  act(() => button("Generate form").click());
  act(() => button("Close").click());
  expect(fixture.close).toHaveBeenCalledOnce();
  await act(async () => resolve({ data: { status: "running" } }));
  expect(axios.post).toHaveBeenCalledOnce();
  expect(fixture.navigate).not.toHaveBeenCalled();
  expect(localStorage.getItem(pendingGenerationKey)).toMatch(/^[a-f0-9]{32}$/);
});

it("never navigates when progress completes after the dialog is dismissed", async () => {
  input("prompt", "Contact form");
  let resolve!: (value: unknown) => void;
  vi.mocked(axios.post)
    .mockResolvedValueOnce({ data: { status: "running" } })
    .mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
  await act(async () => {
    button("Generate form").click();
  });
  act(() => button("Close").click());
  await act(async () => resolve({ data: { status: "complete", formId: 99 } }));
  expect(fixture.navigate).not.toHaveBeenCalled();
  expect(host.textContent).not.toContain("Your form is ready");
});

it("refreshes the list and lets the user close a completed generation without opening another form", async () => {
  input("prompt", "Contact form");
  await act(async () => button("Generate form").click());
  expect(host.textContent).toContain("Your form is ready");
  expect(button("Open form")).toBeDefined();
  expect(fixture.refresh).toHaveBeenCalledOnce();
  act(() => button("Close").click());
  expect(fixture.close).toHaveBeenCalledOnce();
  expect(fixture.navigate).not.toHaveBeenCalled();
});

it("fills an example for review without submitting or changing the form name", () => {
  input("name", "My quote form");
  act(() => button("Quote request").click());
  expect(host.querySelector<HTMLInputElement>("#prompt")!.value).toContain(
    "service type, project description",
  );
  expect(host.querySelector<HTMLInputElement>("#name")!.value).toBe(
    "My quote form",
  );
  expect(document.activeElement).toBe(host.querySelector("#prompt"));
  expect(axios.post).not.toHaveBeenCalled();
});

it("opens the reference picker and hides prompt examples after attaching a file", () => {
  const picker = host.querySelector<HTMLInputElement>('[type="file"]')!;
  const choose = vi.spyOn(picker, "click").mockImplementation(() => {});
  act(() => button("Choose files").click());
  expect(choose).toHaveBeenCalledOnce();
  upload([pdf()]);
  expect(host.querySelector('[aria-label="Prompt examples"]')).toBeNull();
  expect(button("Add files")).toBeDefined();
  expect(host.querySelector("li")!.textContent).toContain("PDF");
  choose.mockRestore();
});
