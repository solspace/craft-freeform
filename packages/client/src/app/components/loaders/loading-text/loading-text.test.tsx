import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { LoadingText } from "./loading-text";

it("removes idle spinner and dot animations and restores them while loading", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const render = (loading: boolean) => (
    <LoadingText loading={loading} loadingText="Saving" spinner instant>
      Save
    </LoadingText>
  );
  try {
    await act(async () => root.render(render(false)));
    expect(host.querySelector(".spinner-path")).toBeNull();
    expect(
      host.querySelectorAll('span[aria-hidden="true"] > span'),
    ).toHaveLength(0);
    await act(async () => root.render(render(true)));
    expect(host.querySelectorAll(".spinner-path")).toHaveLength(1);
    expect(
      host.querySelectorAll('span[aria-hidden="true"] > span'),
    ).toHaveLength(3);
    await act(async () => root.render(render(false)));
    expect(host.querySelector(".spinner-path")).toBeNull();
    expect(
      host.querySelectorAll('span[aria-hidden="true"] > span'),
    ).toHaveLength(0);
    expect(host.textContent).toContain("Save");
  } finally {
    await act(async () => root.unmount());
    host.remove();
    vi.unstubAllGlobals();
  }
});
