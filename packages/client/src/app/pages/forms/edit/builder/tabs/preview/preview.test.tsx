import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { FormPreview } from "./preview";

const fixture = vi.hoisted(() => ({
  form: { id: 42, isNew: false },
  admin: true,
  post: vi.fn(),
}));
vi.mock("axios", () => ({ default: { post: fixture.post } }));
vi.mock("react-redux", () => ({ useSelector: () => fixture.form }));
vi.mock("react-router-dom", () => ({
  useResolvedPath: () => ({ pathname: "/forms/42/preview" }),
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
  fixture.post.mockReset();
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

it("renders an opaque sandbox and posts only a page selector to the protected route", async () => {
  await act(async () => root.render(<FormPreview />));
  expect(fixture.post).toHaveBeenCalledWith(
    "/api/forms/42/preview",
    { page: 0, advance: false, values: {} },
    expect.objectContaining({ params: { site: "default", revision: 0 } }),
  );
  const frame = host.querySelector("iframe")!;
  expect(frame.getAttribute("sandbox")).toBe("allow-scripts");
  expect(frame.getAttribute("referrerpolicy")).toBe("no-referrer");
  expect(frame.srcdoc).toContain("Saved form");
  expect(host.querySelectorAll("textarea")).toHaveLength(2);

  const viewport = host.querySelector("label > div") as HTMLElement;
  await act(async () => viewport.click());
  const viewportOptions = [
    ...host.querySelectorAll(".dropdown-rollout [data-value]"),
  ];
  expect(viewportOptions).toHaveLength(3);
  expect(
    new Set(
      viewportOptions.map(
        (option) => option.querySelector('svg[aria-hidden="true"]')?.innerHTML,
      ),
    ).size,
  ).toBe(3);
  await act(async () =>
    (
      host.querySelector(
        '.dropdown-rollout [data-value="375px"]',
      ) as HTMLElement
    ).click(),
  );
  expect(viewport.classList.contains("open")).toBe(false);
  expect(viewport.textContent).toBe("Mobile");
  await act(async () =>
    (host.querySelectorAll("label > div")[1] as HTMLElement).click(),
  );
  await act(async () =>
    (
      host.querySelector('.dropdown-rollout [data-value="1"]') as HTMLElement
    ).click(),
  );
  expect(host.querySelector("iframe")!.style.width).toBe("375px");
  expect(fixture.post).toHaveBeenLastCalledWith(
    "/api/forms/42/preview",
    { page: 1, advance: false, values: {} },
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
  fixture.form.isNew = true;
  await act(async () => root.render(<FormPreview />));
  expect(fixture.post).not.toHaveBeenCalled();
  expect(host.textContent).toContain("Save this form before previewing it.");
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
    { page: 0, advance: true, values: { employment: "employed" } },
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
    },
    expect.anything(),
  );
  fixture.post.mockResolvedValueOnce({ data: { complete: true, page: 0 } });
  await send("next", {}, "cccccccccccccccccccccccccccccccc");
  expect(host.textContent).toContain(
    "Preview complete. No submission was sent.",
  );
});
