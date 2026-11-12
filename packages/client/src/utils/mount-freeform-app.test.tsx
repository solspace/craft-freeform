import { act, useEffect, useState } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { mountFreeformApp } from "./mount-freeform-app";

let dispose: (() => void) | undefined;
afterEach(async () => {
  await act(() => dispose?.());
  dispose = undefined;
  document.body.replaceChildren();
});

it("mounts restored screen fragments, cleans up old roots, and ignores unrelated screens", async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const cleanup = vi.fn();
  const Editor = () => {
    const [value, setValue] = useState("Original");
    useEffect(() => cleanup, []);
    return (
      <button type="button" onClick={() => setValue("Unsaved edit")}>
        {value}
      </button>
    );
  };
  await act(() => {
    dispose = mountFreeformApp(() => <Editor />);
  });
  expect(document.querySelector("button")).toBeNull();

  await act(async () => {
    document.body.innerHTML = '<main><div id="freeform-client"></div></main>';
  });
  const button = document.querySelector("button")!;
  await act(() => button.click());
  await act(async () => {
    document.querySelector("main")!.append(document.createElement("aside"));
  });
  expect(document.querySelector("button")).toBe(button);
  expect(button.textContent).toBe("Unsaved edit");
  expect(cleanup).not.toHaveBeenCalled();

  await act(async () => {
    document.body.innerHTML = "<main>Native Craft screen</main>";
  });
  expect(cleanup).toHaveBeenCalledTimes(1);
  expect(document.getElementById("freeform-client")).toBeNull();

  await act(async () => {
    document.body.innerHTML = '<main><div id="freeform-client"></div></main>';
  });
  expect(document.querySelector("button")?.textContent).toBe("Original");
  expect(document.querySelector("button")).not.toBe(button);
});
