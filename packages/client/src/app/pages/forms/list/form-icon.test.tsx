import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { FormIcon } from "./form-icon";

const version = vi.hoisted(() => ({ supported: true }));
vi.mock("@config/freeform/freeform.config", () => ({
  default: {
    metadata: {
      craft: {
        get is5() {
          return version.supported;
        },
      },
    },
  },
}));
let root: Root;
let host: HTMLDivElement;
function render(svg?: string) {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() => root.render(<FormIcon svg={svg} color="#4385b7" />));
}
afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  version.supported = true;
  vi.unstubAllGlobals();
});
it("renders a decorative icon in the form color and sanitizes its SVG", () => {
  render(
    '<svg viewBox="0 0 10 10" onload="alert(1)"><script>alert(1)</script><path d="M0 0h10v10Z"/></svg>',
  );
  expect(host.querySelector("svg path")).not.toBeNull();
  expect(host.querySelector("script, [onload]")).toBeNull();
  expect(host.firstElementChild!.getAttribute("aria-hidden")).toBe("true");
  expect((host.firstElementChild as HTMLElement).style.color).toBe(
    "rgb(67, 133, 183)",
  );
});
it("leaves existing cards without icons unchanged", () => {
  render();
  expect(host.children).toHaveLength(0);
});
it("ignores saved icons on Craft 4", () => {
  version.supported = false;
  render("<svg/>");
  expect(host.children).toHaveLength(0);
});
