import { useQueryFormIntegrations } from "@ff-client/queries/integrations";
import { useQueryFormNotifications } from "@ff-client/queries/notifications";
import {
  useQueryFormRules,
  useQueryNotificationRules,
} from "@ff-client/queries/rules";
import { configureStore } from "@reduxjs/toolkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Provider, useStore } from "react-redux";
import { Link, MemoryRouter, Route, Routes, useParams } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Edit } from "./edit";
import { reducer } from "./store";
import { save } from "./store/actions/form";
import { statePersistMiddleware } from "./store/middleware/state-persist";

const fixture = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  renders: vi.fn(),
}));
vi.mock("axios", () => ({ default: { get: fixture.get, post: fixture.post } }));
vi.mock("@ff-client/contexts/site/site.context", () => ({
  useSiteContext: () => ({ current: { handle: "default" } }),
}));
vi.mock("./builder/builder.loader", () => ({
  LoaderBuilder: () => <p>Loading form</p>,
}));
vi.mock("./builder/builder", () => ({
  Builder: () => {
    const id = Number(useParams().formId);
    const store = useStore();
    const rules = useQueryFormRules(id);
    const notificationRules = useQueryNotificationRules(id);
    const notifications = useQueryFormNotifications(id);
    const integrations = useQueryFormIntegrations(id);
    fixture.renders(store.getState(), {
      rules: rules.data,
      notificationRules: notificationRules.data,
      notifications: notifications.data,
      integrations: integrations.data,
    });
    return (
      <>
        <p>Ready {id}</p>
        <Link to="/forms/3">Other form</Link>
      </>
    );
  },
}));

const payload = (id: number) => ({
  form: {
    id,
    uid: `form-${id}`,
    name: `Form ${id}`,
    handle: `form${id}`,
    type: "regular",
    settings: {},
    translations: {},
    layout: {
      fields: [],
      rows: [],
      layouts: [{ uid: `layout-${id}` }],
      pages: [
        {
          uid: `page-${id}`,
          layoutUid: `layout-${id}`,
          label: "Details",
          order: 0,
        },
      ],
    },
  },
  rules: {
    fields: [
      {
        uid: `rule-${id}`,
        field: `field-${id}`,
        conditions: [],
        display: "show",
      },
    ],
    pages: [],
    buttons: [],
    submitForm: null,
  },
  notificationRules: [
    {
      uid: `notification-rule-${id}`,
      notification: `notification-${id}`,
      conditions: [],
    },
  ],
  notifications: [{ uid: `notification-${id}`, enabled: false }],
  integrations: [
    {
      id,
      instanceUid: `integration-${id}`,
      enabled: false,
      properties: [{ handle: "test", value: "saved" }],
    },
  ],
});
let host: HTMLDivElement;
let root: Root;
let client: QueryClient;
let editorStore: ReturnType<typeof configureStore>;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  fixture.get.mockReset();
  fixture.post.mockReset();
  fixture.renders.mockClear();
  fixture.get.mockImplementation(async (url: string) => {
    if (url === "/api/forms/settings") return { data: [] };
    const id = Number(url.match(/forms\/(\d+)\/builder/)?.[1]);
    if (id) return { data: payload(id) };
    throw new Error(`Unexpected request: ${url}`);
  });
  fixture.post.mockReturnValue(new Promise(() => {}));
  client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  editorStore = configureStore({
    reducer,
    middleware: (defaults) => defaults().concat(statePersistMiddleware),
  });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  client.clear();
  vi.unstubAllGlobals();
});
const mount = async () => {
  await act(async () =>
    root.render(
      <Provider store={editorStore}>
        <QueryClientProvider client={client}>
          <MemoryRouter initialEntries={["/forms/2"]}>
            <Routes>
              <Route path="/forms/:formId/*" element={<Edit />} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      </Provider>,
    ),
  );
  await act(async () => new Promise((resolve) => setTimeout(resolve, 20)));
};
it("hydrates all saved editor data before showing the builder and reuses it in tab queries and saving", async () => {
  await mount();
  expect(host.textContent).toContain("Ready 2");
  expect(fixture.get.mock.calls.map(([url]) => url).sort()).toEqual([
    "/api/forms/2/builder",
    "/api/forms/settings",
  ]);
  for (const [state, cached] of fixture.renders.mock.calls) {
    expect(state.form.id).toBe(2);
    expect(state.notifications.initialized).toBe(true);
    expect(state.notifications.items).toEqual(payload(2).notifications);
    expect(state.integrations[0].values).toEqual({ test: "saved" });
    expect(state.rules.fields.items).toEqual(payload(2).rules.fields);
    expect(state.rules.notifications.items).toEqual(
      payload(2).notificationRules,
    );
    expect(cached).toEqual({
      rules: payload(2).rules,
      notificationRules: payload(2).notificationRules,
      notifications: payload(2).notifications,
      integrations: payload(2).integrations,
    });
  }
  await act(async () => editorStore.dispatch(save()));
  expect(fixture.post).toHaveBeenCalledWith(
    "/api/forms/2",
    expect.objectContaining({
      notifications: payload(2).notifications,
      rules: expect.objectContaining({
        fields: payload(2).rules.fields,
        notifications: payload(2).notificationRules,
      }),
      integrations: [
        { id: 2, instanceUid: "integration-2", enabled: false, values: {} },
      ],
    }),
  );
});
it("replaces cached and Redux data when switching to another form", async () => {
  await mount();
  fixture.renders.mockClear();
  await act(async () => host.querySelector<HTMLAnchorElement>("a")!.click());
  await act(async () => new Promise((resolve) => setTimeout(resolve, 20)));
  expect(host.textContent).toContain("Ready 3");
  for (const [state, cached] of fixture.renders.mock.calls) {
    expect(state.form.id).toBe(3);
    expect(state.notifications.items).toEqual(payload(3).notifications);
    expect(cached.rules).toEqual(payload(3).rules);
  }
  expect(fixture.get.mock.calls.map(([url]) => url).sort()).toEqual([
    "/api/forms/2/builder",
    "/api/forms/3/builder",
    "/api/forms/settings",
  ]);
});
it("keeps the editor unavailable when the combined request fails", async () => {
  fixture.get.mockImplementation(async (url: string) => {
    if (url === "/api/forms/settings") return { data: [] };
    throw new Error("Unable to load form");
  });
  await mount();
  expect(fixture.renders).not.toHaveBeenCalled();
  expect(host.textContent).toContain("Unable to load form");
});
