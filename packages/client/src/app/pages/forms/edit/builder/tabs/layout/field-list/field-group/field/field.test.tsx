import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { Field } from "./field";

it("keeps a sidebar field's native drag connection while its preview rerenders", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const connect = vi.fn();
  try {
    act(() => root.render(<Field icon="" label="Text" dragRef={connect} />));
    expect(connect).toHaveBeenCalledOnce();
    const node = connect.mock.calls[0][0];
    connect.mockClear();
    act(() =>
      root.render(<Field icon="" label="Updated text" dragRef={connect} />),
    );
    expect(connect).not.toHaveBeenCalled();
    expect(node.isConnected).toBe(true);
    act(() => root.unmount());
    expect(connect).toHaveBeenCalledExactlyOnceWith(null);
  } finally {
    if (host.firstChild) act(() => root.unmount());
    host.remove();
    vi.unstubAllGlobals();
  }
});
