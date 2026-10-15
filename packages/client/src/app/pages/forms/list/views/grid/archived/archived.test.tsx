import type { FormWithStats } from "@ff-client/types/forms";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Archived } from "./archived";

const fixture = vi.hoisted(() => ({
  canDelete: true,
  navigate: vi.fn(),
  invalidate: vi.fn(),
  openDelete: vi.fn(),
  mutation: { mutate: vi.fn(), isPending: false, isSuccess: false, context: 0 },
}));
vi.mock("@config/freeform/freeform.config", () => ({
  default: {
    metadata: {
      craft: { locale: "en_CA" },
      freeform: {
        get canDelete() {
          return fixture.canDelete;
        },
      },
    },
  },
}));
vi.mock("@ff-client/utils/translations", () => ({
  default: (text: string) => text,
}));
vi.mock("@ff-client/contexts/site/site.context", () => ({
  useSiteContext: () => ({ getCurrentHandleWithFallback: () => "default" }),
}));
vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: fixture.invalidate }),
}));
vi.mock("../grid.mutations", () => ({
  useArchiveFormMutation: () => fixture.mutation,
}));
vi.mock(
  "@ff-client/app/pages/forms/list/modals/hooks/use-delete-form-modal",
  () => ({ useDeleteFormModal: () => fixture.openDelete }),
);
vi.mock("react-router-dom", () => ({
  useNavigate: () => fixture.navigate,
  NavLink: ({ to, children }: { to: string; children: ReactNode }) => (
    <a href={to}>{children}</a>
  ),
}));

const form: FormWithStats = {
  id: 42,
  uid: "archived",
  type: "regular",
  name: "Archived contact form",
  handle: "contactUs",
  isNew: false,
  settings: {},
  dateArchived: "2026-10-14T12:00:00Z",
  counters: { submissions: 10, spam: 0 },
  chartData: [],
  links: [
    {
      label: "Edit",
      handle: "formTitle",
      type: "title",
      url: "42",
      count: 0,
      internal: true,
    },
    {
      label: "10 Submissions",
      handle: "submissions",
      type: "linkList",
      url: "/submissions",
      count: 10,
      internal: true,
    },
  ],
};
let root: Root;
let host: HTMLDivElement;
beforeEach(() => {
  fixture.canDelete = true;
  fixture.mutation.isPending = false;
  fixture.mutation.isSuccess = false;
  fixture.mutation.context = 0;
  vi.clearAllMocks();
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
});
const expand = async (): Promise<void> =>
  act(async () =>
    (host.querySelector("button[aria-expanded]") as HTMLButtonElement).click(),
  );

it("shows a counted disclosure, preserves form links and dates, and restores the chosen form", async () => {
  await act(async () => root.render(<Archived data={[form]} />));
  expect(host.textContent).toContain("Archived Forms1");
  expect(host.querySelector("ul")).toBeNull();
  await expand();
  expect(host.querySelector('button[aria-expanded="true"]')).not.toBeNull();
  expect(host.querySelector("time")?.dateTime).toBe("2026-10-14T12:00:00.000Z");
  expect(host.querySelector("code")?.textContent).toBe("contactUs");
  expect(host.querySelector('a[href="/submissions"]')?.textContent).toBe(
    "10 Submissions",
  );
  await act(async () =>
    (
      host.querySelector(
        'button[title="Archived contact form"]',
      ) as HTMLButtonElement
    ).click(),
  );
  expect(fixture.navigate).toHaveBeenCalledWith("42");
  await act(async () =>
    (
      host.querySelector(
        'button[aria-label^="Restore this Form"]',
      ) as HTMLButtonElement
    ).click(),
  );
  expect(fixture.mutation.mutate).toHaveBeenCalledWith(42);
  await expand();
  expect(host.querySelector("ul")).toBeNull();
});

it("opens the existing deletion dialog and hides deletion without permission", async () => {
  await act(async () => root.render(<Archived data={[form]} />));
  await expand();
  await act(async () =>
    (
      host.querySelector(
        'button[aria-label^="Delete this Form"]',
      ) as HTMLButtonElement
    ).click(),
  );
  expect(fixture.openDelete).toHaveBeenCalledOnce();
  fixture.canDelete = false;
  await act(async () => root.render(<Archived data={[form]} />));
  expect(
    host.querySelector('button[aria-label^="Delete this Form"]'),
  ).toBeNull();
});

it("disables restore and delete while restoring and omits an empty archive section", async () => {
  fixture.mutation.isPending = true;
  fixture.mutation.context = 42;
  await act(async () => root.render(<Archived data={[form]} />));
  await expand();
  const restore = host.querySelector(
    'button[aria-label^="Restore this Form"]',
  ) as HTMLButtonElement;
  expect(restore.disabled).toBe(true);
  expect(restore.textContent).toBe("Restoring");
  expect(
    (
      host.querySelector(
        'button[aria-label^="Delete this Form"]',
      ) as HTMLButtonElement
    ).disabled,
  ).toBe(true);
  await act(async () => restore.click());
  expect(fixture.mutation.mutate).not.toHaveBeenCalled();
  fixture.mutation.isPending = false;
  fixture.mutation.isSuccess = true;
  await act(async () => root.render(<Archived data={[form]} />));
  expect(
    (
      host.querySelector(
        'button[aria-label^="Restore this Form"]',
      ) as HTMLButtonElement
    ).disabled,
  ).toBe(true);
  await act(async () => root.render(<Archived data={[]} />));
  expect(host.innerHTML).toBe("");
});
