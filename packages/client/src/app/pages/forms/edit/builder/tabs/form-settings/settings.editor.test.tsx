import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { SettingsEditor } from "./settings.editor";

const fixture = vi.hoisted(() => ({ section: "general", usageLoaded: false }));
vi.mock("react-router-dom", () => ({
  useParams: () => ({ sectionHandle: fixture.section }),
  useResolvedPath: () => ({ pathname: "/settings" }),
}));
vi.mock("@ff-client/queries/forms", () => ({
  useQueryFormSettings: () => ({
    data: [
      {
        sections: [{ handle: "general", label: "General" }],
        properties: [] as unknown[],
      },
    ],
  }),
}));
vi.mock("@components/breadcrumbs/breadcrumbs", () => ({
  Breadcrumb: (): null => null,
}));
vi.mock("./field-component", () => ({ FieldComponent: (): null => null }));
vi.mock("./settings.embed", () => ({ FormEmbed: (): null => null }));
vi.mock("./settings", () => ({ TAB_EMBED: "embed", TAB_USAGE: "usage" }));
vi.mock("./settings.usage", () => {
  fixture.usageLoaded = true;
  return { FormUsage: () => <p>Usage tab mounted</p> };
});

it("does not import or mount Usage & Stats until its tab opens", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const container = document.createElement("div");
  const root = createRoot(container);
  try {
    await act(async () => root.render(<SettingsEditor />));
    expect(container.textContent).toBe("General");
    expect(fixture.usageLoaded).toBe(false);
    fixture.section = "usage";
    await act(async () => root.render(<SettingsEditor />));
    expect(fixture.usageLoaded).toBe(true);
    expect(container.textContent).toBe("Usage tab mounted");
    fixture.section = "general";
    await act(async () => root.render(<SettingsEditor />));
    expect(container.textContent).toBe("General");
  } finally {
    act(() => root.unmount());
    vi.unstubAllGlobals();
  }
});
