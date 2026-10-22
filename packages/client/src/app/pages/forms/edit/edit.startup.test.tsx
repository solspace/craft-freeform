import { useQueryFormIntegrations } from "@ff-client/queries/integrations";
import { useQueryFormNotifications } from "@ff-client/queries/notifications";
import {
  useQueryFormRules,
  useQueryNotificationRules,
} from "@ff-client/queries/rules";
import { configureStore } from "@reduxjs/toolkit";
import {
  focusManager,
  onlineManager,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Provider, useSelector, useStore } from "react-redux";
import {
  Link,
  MemoryRouter,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Edit } from "./edit";
import { type RootState, reducer } from "./store";
import { save } from "./store/actions/form";
import { statePersistMiddleware } from "./store/middleware/state-persist";
import { State } from "./store/slices/context";
import { formActions } from "./store/slices/form";
import { fieldActions } from "./store/slices/layout/fields";

const fixture = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  renders: vi.fn(),
}));
vi.mock("axios", () => ({ default: { get: fixture.get, post: fixture.post } }));
vi.mock("@ff-client/contexts/site/site.context", () => ({
  useSiteContext: () => ({ current: { handle: "default" } }),
}));
vi.mock("@ff-client/utils/notifications", () => ({
  notifications: { success: vi.fn(), error: vi.fn() },
}));
vi.mock("./builder/builder.loader", () => ({
  LoaderBuilder: () => <p>Loading form</p>,
}));
vi.mock("./builder/builder", () => ({
  Builder: () => {
    const id = Number(useParams().formId);
    const store = useStore();
    const maxLength = useSelector(
      (state: RootState) => state.layout.fields[0]?.properties.maxLength,
    );
    const settings = useSelector((state: RootState) => state.form.settings);
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
        <p>Max Length: {maxLength}</p>
        <p>Description: {settings.general?.description}</p>
        <p>AJAX: {String(settings.behavior?.ajax)}</p>
        <Link to="/forms/3">Other form</Link>
        <Link to="/forms">Forms overview</Link>
        <Link to={`/forms/${id}/settings`}>Settings tab</Link>
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
    settings: {
      general: { description: `Description ${id}` },
      behavior: { ajax: true },
    },
    translations: {},
    layout: {
      fields: [
        {
          uid: `field-${id}`,
          rowUid: `row-${id}`,
          typeClass: "Text",
          properties: { label: "Text", handle: "text", maxLength: 100 },
        },
      ],
      rows: [{ uid: `row-${id}`, layoutUid: `layout-${id}`, order: 0 }],
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
let navigate: ReturnType<typeof useNavigate>;

function Navigation() {
  navigate = useNavigate();
  return null;
}

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
  focusManager.setFocused(undefined);
  onlineManager.setOnline(true);
  vi.unstubAllGlobals();
});
const mount = async () => {
  await act(async () =>
    root.render(
      <Provider store={editorStore}>
        <QueryClientProvider client={client}>
          <MemoryRouter initialEntries={["/forms/2"]}>
            <Navigation />
            <Routes>
              <Route
                path="/forms"
                element={<Link to="/forms/2">Open form</Link>}
              />
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

const clickLink = async (text: string) => {
  const link = Array.from(host.querySelectorAll("a")).find(
    (item) => item.textContent === text,
  );
  expect(link).toBeDefined();
  await act(async () => link!.click());
  await act(async () => new Promise((resolve) => setTimeout(resolve, 20)));
};

const saveMaxLength = async (value: number) => {
  fixture.post.mockImplementation(async (_url, data) => {
    const saved = payload(2);
    saved.form.layout.fields = structuredClone(data.layout.fields);
    fixture.get.mockImplementation(async (url: string) => {
      if (url === "/api/forms/settings") return { data: [] };
      if (url === "/api/forms/2/builder") return { data: saved };
      return { data: payload(3) };
    });
    return { data: { form: { id: 2 } } };
  });
  await act(async () => {
    editorStore.dispatch(
      fieldActions.edit({ uid: "field-2", handle: "maxLength", value }),
    );
    editorStore.dispatch(save());
  });
  expect(fixture.post).toHaveBeenCalledWith(
    "/api/forms/2",
    expect.objectContaining({
      layout: expect.objectContaining({
        fields: [
          expect.objectContaining({
            properties: expect.objectContaining({ maxLength: value }),
          }),
        ],
      }),
    }),
  );
  expect(editorStore.getState().context.state).toBe(State.Idle);
};

it("reloads saved field settings when reopening through overview links", async () => {
  await mount();
  await saveMaxLength(250);
  await clickLink("Forms overview");
  await clickLink("Open form");

  expect(host.textContent).toContain("Max Length: 250");
  expect(editorStore.getState().layout.fields[0].properties.maxLength).toBe(
    250,
  );
  expect(
    fixture.get.mock.calls.filter(([url]) => url === "/api/forms/2/builder"),
  ).toHaveLength(2);
});

it.each([
  { namespace: "general", key: "description", value: "Updated description" },
  { namespace: "general", key: "description", value: "" },
  { namespace: "behavior", key: "ajax", value: false },
])(
  "reloads saved form settings after setting $namespace.$key to '$value'",
  async ({ namespace, key, value }) => {
    await mount();
    const saved = payload(2);
    fixture.post.mockImplementation(async (_url, data) => {
      saved.form.settings = structuredClone(data.form.settings);
      fixture.get.mockImplementation(async (url: string) => {
        if (url === "/api/forms/settings") return { data: [] };
        if (url === "/api/forms/2/builder") return { data: saved };
        return { data: payload(3) };
      });
      return { data: { form: { id: 2 } } };
    });
    await act(async () => {
      editorStore.dispatch(
        formActions.modifySettings({ namespace, key, value }),
      );
      editorStore.dispatch(save());
    });
    expect(fixture.post).toHaveBeenCalledWith(
      "/api/forms/2",
      expect.objectContaining({
        form: expect.objectContaining({
          settings: expect.objectContaining({
            [namespace]: expect.objectContaining({ [key]: value }),
          }),
        }),
      }),
    );
    expect(editorStore.getState().context.state).toBe(State.Idle);

    await clickLink("Forms overview");
    await clickLink("Open form");

    expect(editorStore.getState().form.settings[namespace][key]).toBe(value);
    expect(host.textContent).toContain(
      namespace === "general" ? `Description: ${value}` : `AJAX: ${value}`,
    );
    expect(
      fixture.get.mock.calls.filter(([url]) => url === "/api/forms/2/builder"),
    ).toHaveLength(2);
  },
);

it("reloads saved settings on history navigation between cached form IDs", async () => {
  await mount();
  await saveMaxLength(250);
  await clickLink("Other form");
  await act(async () => navigate(-1));
  await act(async () => new Promise((resolve) => setTimeout(resolve, 20)));
  expect(host.textContent).toContain("Ready 2");
  expect(host.textContent).toContain("Max Length: 250");
  await act(async () => navigate(1));
  await act(async () => new Promise((resolve) => setTimeout(resolve, 20)));
  expect(host.textContent).toContain("Ready 3");
  expect(
    fixture.get.mock.calls.filter(([url]) => url === "/api/forms/3/builder"),
  ).toHaveLength(2);
});

it("preserves unsaved settings across tab, window focus, and reconnect events", async () => {
  await mount();
  await act(async () =>
    editorStore.dispatch(
      fieldActions.edit({ uid: "field-2", handle: "maxLength", value: 300 }),
    ),
  );
  await clickLink("Settings tab");
  await act(async () => {
    focusManager.setFocused(false);
    onlineManager.setOnline(false);
  });
  await act(async () => {
    focusManager.setFocused(true);
    onlineManager.setOnline(true);
  });
  expect(host.textContent).toContain("Max Length: 300");
  expect(
    fixture.get.mock.calls.filter(([url]) => url === "/api/forms/2/builder"),
  ).toHaveLength(1);
});

it("keeps stale cached settings unavailable if reopening fails", async () => {
  await mount();
  await saveMaxLength(250);
  await clickLink("Forms overview");
  fixture.renders.mockClear();
  fixture.get.mockRejectedValue(new Error("Unable to reload form"));
  await clickLink("Open form");
  expect(host.textContent).toContain("Unable to reload form");
  expect(fixture.renders).not.toHaveBeenCalled();
});

it("waits for fresh data before hydrating a cached form, even when the response is unchanged", async () => {
  await mount();
  await clickLink("Other form");
  let resolve: (value: { data: ReturnType<typeof payload> }) => void;
  fixture.get.mockImplementation(
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  fixture.renders.mockClear();

  await act(async () => navigate(-1));
  expect(host.textContent).toContain("Loading form");
  expect(editorStore.getState().form.id).toBe(3);
  expect(fixture.renders).not.toHaveBeenCalled();

  await act(async () => resolve({ data: payload(2) }));
  await act(async () => new Promise((done) => setTimeout(done, 20)));
  expect(host.textContent).toContain("Ready 2");
  expect(editorStore.getState().form.id).toBe(2);
});

it("cancels an unfinished builder request when navigating away", async () => {
  fixture.get.mockImplementation(async (url: string) => {
    if (url === "/api/forms/settings") return { data: [] };
    return new Promise(() => {});
  });
  await mount();
  const signal = fixture.get.mock.calls.find(
    ([url]) => url === "/api/forms/2/builder",
  )?.[1]?.signal;
  expect(signal).toBeDefined();
  expect(signal.aborted).toBe(false);
  await act(async () => navigate("/forms"));
  expect(signal.aborted).toBe(true);
  expect(fixture.renders).not.toHaveBeenCalled();
});

it("preserves edited values and validation errors after a failed save", async () => {
  await mount();
  fixture.post.mockRejectedValue({
    errors: { fields: { "field-2": { maxLength: ["Invalid length"] } } },
  });
  await act(async () => {
    editorStore.dispatch(
      fieldActions.edit({ uid: "field-2", handle: "maxLength", value: 300 }),
    );
    editorStore.dispatch(save());
  });
  expect(editorStore.getState().context.state).toBe(State.Idle);
  expect(host.textContent).toContain("Max Length: 300");
  expect(editorStore.getState().layout.fields[0].errors.maxLength).toEqual([
    "Invalid length",
  ]);
  await clickLink("Settings tab");
  expect(host.textContent).toContain("Max Length: 300");
  expect(
    fixture.get.mock.calls.filter(([url]) => url === "/api/forms/2/builder"),
  ).toHaveLength(1);
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
