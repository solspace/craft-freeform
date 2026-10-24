import { act } from "react";
import { createRoot } from "react-dom/client";
import {
  createMemoryRouter,
  Outlet,
  RouterProvider,
  useLocation,
} from "react-router-dom";
import { afterEach, expect, it, vi } from "vitest";
import { FormSettings } from "./settings";

vi.mock("@config/freeform/freeform.config", () => ({
  default: { limitations: { can: () => true } },
}));
vi.mock("@ff-client/queries/forms", () => ({
  useQueryFormSettings: () => ({
    data: [{ sections: [{ handle: "general" }] }],
    isFetching: false,
  }),
}));
vi.mock("@components/breadcrumbs/breadcrumbs", () => ({
  Breadcrumb: (): null => null,
}));
vi.mock("./settings.sidebar", () => ({ SettingsSidebar: (): null => null }));
vi.mock("./settings.styles", () => ({
  FormSettingsWrapper: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));
vi.mock("../tabs.hooks", () => ({
  useLastTab: () => ({ lastTab: "general", setLastTab: vi.fn() }),
}));
const roots: ReturnType<typeof createRoot>[] = [];
afterEach(async () => {
  for (const root of roots.splice(0)) await act(async () => root.unmount());
  document.body.innerHTML = "";
});
const Screen = () => {
  const location = useLocation();
  return (
    <div>
      {location.pathname}
      <Outlet />
    </div>
  );
};
const mount = async (
  initialEntries: string[],
  initialIndex = initialEntries.length - 1,
) => {
  const router = createMemoryRouter(
    [
      {
        path: "/forms/:formId/settings",
        element: <FormSettings />,
        children: [{ path: ":sectionHandle", element: <Screen /> }],
      },
      { path: "/forms", element: <div>Forms</div> },
      { path: "/other", element: <div>Other form</div> },
    ],
    { initialEntries, initialIndex },
  );
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  roots.push(root);
  await act(async () => root.render(<RouterProvider router={router} />));
  return router;
};
it("preserves an explicit settings section instead of redirecting to the last tab", async () => {
  const router = await mount(["/forms/15/settings/storage"]);
  expect(router.state.location.pathname).toBe("/forms/15/settings/storage");
});
it("keeps forward history when returning to settings with browser Back", async () => {
  const router = await mount([
    "/forms/15/settings/general",
    "/forms",
    "/other",
  ]);
  await act(async () => {
    await router.navigate(-2);
  });
  expect(router.state.location.pathname).toBe("/forms/15/settings/general");
  await act(async () => {
    await router.navigate(2);
  });
  expect(router.state.location.pathname).toBe("/other");
});
it("replaces the sectionless settings entry when restoring the last tab", async () => {
  const router = await mount(["/forms", "/forms/15/settings"]);
  expect(router.state.location.pathname).toBe("/forms/15/settings/general");
  await act(async () => {
    await router.navigate(-1);
  });
  expect(router.state.location.pathname).toBe("/forms");
});
