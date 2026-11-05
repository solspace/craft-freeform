import { act, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useWelcomeFormStart } from "./use-welcome-form-start";

let host: HTMLDivElement;
let root: ReturnType<typeof createRoot>;
const open = vi.fn();
function Harness({ canCreate = true }: { canCreate?: boolean }) {
  useWelcomeFormStart(canCreate, open);
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <>
      <output>
        {JSON.stringify({
          path: location.pathname + location.search + location.hash,
          state: location.state,
        })}
      </output>
      <button type="button" onClick={() => navigate("/other")}>
        Other page
      </button>
      <button type="button" onClick={() => navigate(-1)}>
        Back
      </button>
    </>
  );
}
beforeEach(() => {
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
  open.mockClear();
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
});
const render = async (state: unknown, canCreate = true) => {
  await act(async () =>
    root.render(
      <StrictMode>
        <MemoryRouter
          initialEntries={[
            { pathname: "/forms", search: "?period=7", hash: "#stats", state },
          ]}
        >
          <Harness canCreate={canCreate} />
        </MemoryRouter>
      </StrictMode>,
    ),
  );
};
const click = async (text: string) => {
  await act(async () =>
    [...host.querySelectorAll("button")]
      .find((button) => button.textContent === text)!
      .click(),
  );
};

describe("Welcome form creation handoff", () => {
  it("opens the existing creation chooser once and consumes only the Welcome flag", async () => {
    await render({ welcomeStart: true, view: "grid" });
    expect(open).toHaveBeenCalledOnce();
    expect(JSON.parse(host.querySelector("output")!.textContent!)).toEqual({
      path: "/forms?period=7#stats",
      state: { view: "grid" },
    });
    window.dispatchEvent(new Event("focus"));
    await click("Other page");
    await click("Back");
    expect(open).toHaveBeenCalledOnce();
    expect(host.querySelector("output")?.textContent).not.toContain(
      "welcomeStart",
    );
  });
  it("does not open creation for users without permission", async () => {
    await render({ welcomeStart: true }, false);
    expect(open).not.toHaveBeenCalled();
    expect(host.querySelector("output")?.textContent).not.toContain(
      "welcomeStart",
    );
  });
  it("leaves normal Forms visits alone", async () => {
    await render({ view: "list" });
    expect(open).not.toHaveBeenCalled();
    expect(host.querySelector("output")?.textContent).toContain(
      '"view":"list"',
    );
  });
});
