import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { FormPreview } from "./preview";

const fixture = vi.hoisted(() => ({
  form: { id: 42 as number | undefined, isNew: false },
  admin: true,
  canPreview: true,
  redirect: vi.fn(),
  post: vi.fn(),
  templates: vi.fn(),
}));
vi.mock("axios", () => ({ default: { post: fixture.post } }));
vi.mock("react-redux", () => ({ useSelector: () => fixture.form }));
vi.mock("react-router-dom", () => ({
  useResolvedPath: () => ({ pathname: "/forms/42/preview" }),
  Navigate: (props: unknown) => {
    fixture.redirect(props);
    return null;
  },
}));
vi.mock("@editor/store/slices/form/form.selectors", () => ({
  formSelectors: { current: vi.fn() },
}));
vi.mock("@components/breadcrumbs/breadcrumbs", () => ({
  Breadcrumb: () => null,
}));
vi.mock("@components/elements/pop-up-portal", () => ({
  PopUpPortal: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock(
  "@components/form-controls/preview/previewable-component.animations",
  () => ({
    useEditorAnimations: () => ({ editorAnimation: {} }),
  }),
);
vi.mock("@config/freeform/freeform.config", () => ({
  default: {
    limitations: { can: () => fixture.canPreview },
    metadata: {
      freeform: {
        get canManageHtmlEmbeds() {
          return fixture.admin;
        },
      },
    },
  },
}));
vi.mock("@ff-client/contexts/site/site.context", () => ({
  useSiteContext: () => ({ current: { handle: "default" } }),
}));
vi.mock("@ff-client/utils/translations", () => ({
  default: (value: string) => value,
}));
vi.mock("@ff-client/queries/forms", () => ({
  useQueryPreviewTemplates: (id?: number) => {
    fixture.templates(id);
    return {
      data: [
        { value: "tailwind-4-dark/index.twig", label: "Tailwind 4 Dark" },
        { value: "basic-light/index.twig", label: "Basic Light" },
      ],
      isLoading: false,
    };
  },
  useQueryFormSettings: () => ({
    data: [
      {
        handle: "general",
        properties: [{ handle: "previewCssUrls" }, { handle: "previewJsUrls" }],
      },
    ],
  }),
}));
vi.mock("../form-settings/field-component", () => ({
  FieldComponent: ({ property }: { property: { handle: string } }) => (
    <textarea aria-label={property.handle} />
  ),
}));

let root: Root;
let host: HTMLDivElement;
const originalScrollIntoView = Element.prototype.scrollIntoView;
beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
  fixture.form = { id: 42, isNew: false };
  fixture.admin = true;
  fixture.canPreview = true;
  fixture.redirect.mockClear();
  fixture.post.mockReset();
  fixture.templates.mockClear();
  fixture.post.mockResolvedValue({
    data: {
      html: "<p>Saved form</p>",
      pages: ["Details", "Review"],
      available: true,
      page: 0,
      channel: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      complete: false,
    },
  });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  Element.prototype.scrollIntoView = originalScrollIntoView;
});

it("redirects a restricted user without fetching templates or rendering a preview", async () => {
  fixture.canPreview = false;
  await act(async () => root.render(<FormPreview />));
  expect(fixture.redirect).toHaveBeenCalledWith({
    to: "..",
    relative: "path",
    replace: true,
  });
  expect(fixture.post).not.toHaveBeenCalled();
  expect(fixture.templates).not.toHaveBeenCalled();
  expect(host.querySelector("iframe")).toBeNull();
});

it("renders an opaque sandbox and posts only a page selector to the protected route", async () => {
  await act(async () => root.render(<FormPreview />));
  expect(fixture.post).toHaveBeenCalledWith(
    "/api/forms/42/preview",
    { page: 0, advance: false, values: {}, templateOverride: null },
    expect.objectContaining({
      params: { site: "default", revision: 0 },
      headers: { "X-Requested-With": "XMLHttpRequest" },
    }),
  );
  const frame = host.querySelector("iframe")!;
  expect(frame.getAttribute("sandbox")).toBe("allow-scripts");
  expect(frame.getAttribute("referrerpolicy")).toBe("no-referrer");
  expect(frame.srcdoc).toContain("Saved form");
  expect(host.querySelectorAll("textarea")).toHaveLength(2);

  const viewport = host.querySelectorAll("label > div")[1] as HTMLElement;
  await act(async () => viewport.click());
  const viewportOptions = [
    ...host.querySelectorAll(".dropdown-rollout [data-value]"),
  ];
  expect(viewportOptions).toHaveLength(8);
  expect(
    new Set(
      viewportOptions.map(
        (option) => option.querySelector('svg[aria-hidden="true"]')?.innerHTML,
      ),
    ).size,
  ).toBeGreaterThanOrEqual(5);
  await act(async () =>
    (
      host.querySelector(
        '.dropdown-rollout [data-value="375px"]',
      ) as HTMLElement
    ).click(),
  );
  expect(viewport.classList.contains("open")).toBe(false);
  expect(viewport.textContent).toBe("Mobile (375px)");
  await act(async () =>
    (host.querySelectorAll("label > div")[2] as HTMLElement).click(),
  );
  await act(async () =>
    (
      host.querySelector('.dropdown-rollout [data-value="1"]') as HTMLElement
    ).click(),
  );
  expect(host.querySelector("iframe")!.style.width).toBe("375px");
  expect(fixture.post).toHaveBeenLastCalledWith(
    "/api/forms/42/preview",
    { page: 1, advance: false, values: {}, templateOverride: null },
    expect.anything(),
  );
});

it("hides asset configuration for editors without admin access", async () => {
  fixture.admin = false;
  await act(async () => root.render(<FormPreview />));
  expect(host.querySelectorAll("textarea")).toHaveLength(0);
  expect(host.querySelector("iframe")).not.toBeNull();
});

it("does not request a preview before the form has been saved", async () => {
  fixture.form.id = undefined;
  fixture.form.isNew = true;
  await act(async () => root.render(<FormPreview />));
  expect(fixture.post).not.toHaveBeenCalled();
  expect(host.textContent).toContain("Save this form before previewing it.");
  expect(fixture.templates).toHaveBeenCalledWith(undefined);
  expect(host.querySelector("button")!.disabled).toBe(true);
});

it("previews a saved form created within the last hour and loads its template options", async () => {
  fixture.form.isNew = true;
  await act(async () => root.render(<FormPreview />));
  expect(fixture.post).toHaveBeenCalledWith(
    "/api/forms/42/preview",
    expect.anything(),
    expect.anything(),
  );
  expect(fixture.templates).toHaveBeenCalledWith(42);
  expect(host.querySelector("iframe")).not.toBeNull();
  expect(host.querySelector("button")!.disabled).toBe(false);
  expect(host.textContent).not.toContain(
    "Save this form before previewing it.",
  );
});

it("clears stale preview content when rendering fails", async () => {
  await act(async () => root.render(<FormPreview />));
  fixture.post.mockRejectedValueOnce(new Error("Template unavailable"));
  await act(async () => host.querySelector("button")!.click());
  expect(host.querySelector("iframe")).toBeNull();
  expect(host.querySelector('[role="alert"]')).not.toBeNull();
});

it("retains page answers and accepts navigation only from the current sandboxed frame", async () => {
  await act(async () => root.render(<FormPreview />));
  const send = async (
    action: string,
    values: Record<string, string>,
    channel = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    origin = "null",
    source: Window | null = host.querySelector("iframe")!.contentWindow,
  ): Promise<void> => {
    await act(async () =>
      window.dispatchEvent(
        new MessageEvent("message", {
          source,
          origin,
          data: { type: "freeform-preview", channel, action, values },
        }),
      ),
    );
  };
  await send("values", { employment: "employed" });
  expect(fixture.post).toHaveBeenCalledTimes(1);
  await send("next", {}, "wrong-channel");
  await send("next", {}, undefined, "https://evil.test");
  await send("next", {}, undefined, undefined, window);
  expect(fixture.post).toHaveBeenCalledTimes(1);

  fixture.post.mockResolvedValueOnce({
    data: {
      html: "<p>Review</p>",
      pages: ["Details", "Review"],
      available: true,
      page: 1,
      channel: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      complete: false,
    },
  });
  await send("next", { employment: "employed" });
  expect(fixture.post).toHaveBeenLastCalledWith(
    "/api/forms/42/preview",
    {
      page: 0,
      advance: true,
      values: { employment: "employed" },
      templateOverride: null,
    },
    expect.anything(),
  );
  fixture.post.mockResolvedValueOnce({
    data: {
      html: "<p>Details</p>",
      pages: ["Details", "Review"],
      available: true,
      page: 0,
      channel: "cccccccccccccccccccccccccccccccc",
      complete: false,
    },
  });
  await send("back", { employer: "Acme" }, "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb");
  expect(fixture.post).toHaveBeenLastCalledWith(
    "/api/forms/42/preview",
    {
      page: 0,
      advance: false,
      values: { employment: "employed", employer: "Acme" },
      templateOverride: null,
    },
    expect.anything(),
  );
  fixture.post.mockResolvedValueOnce({ data: { complete: true, page: 0 } });
  await send("next", {}, "cccccccccccccccccccccccccccccccc");
  expect(host.textContent).toContain(
    "Preview complete. No submission was sent.",
  );
});

it("switches sample templates without saving and retains answers when returning to the saved template", async () => {
  await act(async () => root.render(<FormPreview />));
  const frame = host.querySelector("iframe")!;
  await act(async () =>
    window.dispatchEvent(
      new MessageEvent("message", {
        source: frame.contentWindow,
        origin: "null",
        data: {
          type: "freeform-preview",
          channel: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          action: "values",
          values: { type: "business" },
        },
      }),
    ),
  );
  const template = host.querySelector("label > div") as HTMLElement;
  expect(template.textContent).toBe("Use Saved Template");
  await act(async () => template.click());
  const sample = host.querySelector(
    '.dropdown-rollout [data-value="tailwind-4-dark/index.twig"]',
  ) as HTMLElement;
  expect(sample.querySelector('img[aria-hidden="true"]')).not.toBeNull();
  await act(async () => sample.click());
  expect(template.textContent).toBe("Tailwind 4 Dark");
  expect(fixture.post).toHaveBeenLastCalledWith(
    "/api/forms/42/preview",
    {
      page: 0,
      advance: false,
      values: { type: "business" },
      templateOverride: "tailwind-4-dark/index.twig",
    },
    expect.anything(),
  );
  await act(async () => template.click());
  await act(async () =>
    (
      host.querySelector('.dropdown-rollout [data-value=""]') as HTMLElement
    ).click(),
  );
  expect(template.textContent).toBe("Use Saved Template");
  expect(fixture.post).toHaveBeenLastCalledWith(
    "/api/forms/42/preview",
    {
      page: 0,
      advance: false,
      values: { type: "business" },
      templateOverride: null,
    },
    expect.anything(),
  );
  expect(
    fixture.post.mock.calls.every(([url]) => url === "/api/forms/42/preview"),
  ).toBe(true);
});
