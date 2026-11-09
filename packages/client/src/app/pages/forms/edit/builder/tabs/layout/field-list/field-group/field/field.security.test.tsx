import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { Field } from "./field";

const icon = '<svg viewBox="0 0 18 18"><path d="M1 1h16v16H1z"/></svg>';
let root: Root;
let host: HTMLDivElement;

function render(label: string, svg = icon, onClick = vi.fn()) {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() => root.render(<Field label={label} icon={svg} onClick={onClick} />));
}

afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  vi.unstubAllGlobals();
});

it.each([
  "<img src=x onerror=\"document.title='XSS-FIRED'\">",
  "<svg onload=\"document.title='XSS-FIRED'\"><script>alert(1)</script></svg>",
  '<a href="javascript:alert(1)">Label</a>',
])("removes executable markup from field and favorite labels: %s", (label) => {
  render(label);
  expect(host.querySelector("script, [onerror], [onload]")).toBeNull();
  expect(host.querySelector('a[href^="javascript:"]')).toBeNull();
  expect(host.firstElementChild!.getAttribute("title")).toBe(label);
});

it("keeps supported label formatting, SVG icons, and click behavior", () => {
  const onClick = vi.fn();
  render("<strong>Name</strong> &amp; <em>surname</em>", icon, onClick);
  expect(host.querySelector("span strong")?.textContent).toBe("Name");
  expect(host.querySelector("span em")?.textContent).toBe("surname");
  expect(host.querySelector("span")?.textContent).toBe("Name & surname");
  expect(host.querySelector("svg path")).not.toBeNull();
  act(() => (host.firstElementChild as HTMLElement).click());
  expect(onClick).toHaveBeenCalledOnce();
});

it("removes executable markup from field type icons", () => {
  render(
    "Name",
    '<svg onload="alert(1)"><script>alert(1)</script><path d="M0 0h10v10z"/></svg>',
  );
  expect(host.querySelector("svg path")).not.toBeNull();
  expect(host.querySelector("script, [onload]")).toBeNull();
});

it("sanitizes updated labels and icons when a field is reused", () => {
  render("Original");
  act(() =>
    root.render(
      <Field
        label='<img src=x onerror="alert(1)"><b>Updated</b>'
        icon='<svg onload="alert(1)"><path d="M0 0h10v10z"/></svg>'
      />,
    ),
  );
  expect(host.querySelector("[onerror], [onload]")).toBeNull();
  expect(host.querySelector("span b")?.textContent).toBe("Updated");
  expect(host.querySelector("svg path")).not.toBeNull();
});
