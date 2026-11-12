import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { expect, it, vi } from "vitest";
import { SettingsSidebar } from "./settings.sidebar";

vi.mock("@config/freeform/freeform.config", () => ({
  default: { limitations: { can: () => true } },
}));
vi.mock("@ff-client/queries/forms", () => ({
  useQueryFormSettings: () => ({
    data: [
      {
        handle: "general",
        properties: [] as never[],
        sections: [
          { handle: "general", label: "General", icon: "" },
          { handle: "storage", label: "Data Storage", icon: "" },
        ],
      },
    ],
  }),
}));
vi.mock("react-redux", () => ({ useSelector: () => ({}) }));
vi.mock("./settings.ownership", () => ({
  SettingsOwnership: (): null => null,
}));
vi.mock("@ff-client/utils/translations", () => ({
  default: (text: string) => text,
}));

it("changes sections inside Craft's enclosing form without submitting or discarding an edit", async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  sessionStorage.clear();
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const submit = vi.fn((event: React.FormEvent) => event.preventDefault());
  function Screen() {
    const { pathname } = useLocation();
    return (
      <form onSubmit={submit}>
        <SettingsSidebar />
        <input aria-label="Unsaved edit" defaultValue="Original" />
        <output>{pathname}</output>
      </form>
    );
  }
  try {
    await act(() =>
      root.render(
        <MemoryRouter initialEntries={["/forms/5/settings/general"]}>
          <Routes>
            <Route path="/forms/:formId/settings" element={<Screen />}>
              <Route path=":sectionHandle" element={null} />
            </Route>
          </Routes>
        </MemoryRouter>,
      ),
    );
    const input = host.querySelector("input")!;
    input.value = "Unsaved edit";
    for (const label of [
      "Data Storage",
      "Embed Form",
      "Usage & Stats",
      "General",
    ]) {
      const button = [...host.querySelectorAll("button")].find(
        (item) => item.textContent === label,
      )!;
      expect(button.type).toBe("button");
      await act(() => button.click());
      expect(host.querySelector("input")).toBe(input);
      expect(input.value).toBe("Unsaved edit");
    }
    expect(host.querySelector("output")?.textContent).toBe(
      "/forms/5/settings/general",
    );
    expect(submit).not.toHaveBeenCalled();
  } finally {
    await act(() => root.unmount());
    host.remove();
    sessionStorage.clear();
  }
});
