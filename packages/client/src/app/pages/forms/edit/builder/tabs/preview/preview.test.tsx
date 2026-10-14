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
beforeEach(() => {
  fixture.form = { id: 42, isNew: false };
  fixture.admin = true;
  fixture.post.mockReset();
  fixture.post.mockResolvedValue({
    data: {
      html: "<p>Saved form</p>",
      pages: ["Details", "Review"],
      available: true,
    },
  });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
});

it("renders an opaque sandbox and posts only a page selector to the protected route", async () => {
  await act(async () => root.render(<FormPreview />));
  expect(fixture.post).toHaveBeenCalledWith(
    "/api/forms/42/preview",
    { page: 0 },
    expect.objectContaining({ params: { site: "default", revision: 0 } }),
  );
  const frame = host.querySelector("iframe")!;
  expect(frame.getAttribute("sandbox")).toBe("allow-scripts");
  expect(frame.getAttribute("referrerpolicy")).toBe("no-referrer");
  expect(frame.srcdoc).toContain("Saved form");
  expect(host.querySelectorAll("textarea")).toHaveLength(2);

  await act(async () => {
    const selects = host.querySelectorAll("select");
    selects[0].value = "375px";
    selects[0].dispatchEvent(new Event("change", { bubbles: true }));
    selects[1].value = "1";
    selects[1].dispatchEvent(new Event("change", { bubbles: true }));
  });
  expect(host.querySelector("iframe")!.style.width).toBe("375px");
  expect(fixture.post).toHaveBeenLastCalledWith(
    "/api/forms/42/preview",
    { page: 1 },
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
