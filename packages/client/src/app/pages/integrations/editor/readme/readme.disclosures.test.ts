import { afterEach, describe, expect, it, vi } from "vitest";
import { animateReadmeDisclosures } from "./readme.disclosures";

afterEach(() => vi.unstubAllGlobals());

function setup(reducedMotion = false) {
  vi.stubGlobal("matchMedia", () => ({ matches: reducedMotion }));
  const container = document.createElement("div");
  container.innerHTML =
    "<details><summary>Help</summary><p>Instructions</p></details>";
  const details = container.querySelector("details")!;
  const summary = container.querySelector("summary")!;
  const animations: Animation[] = [];
  details.animate = vi.fn(() => {
    const animation = {
      cancel: vi.fn(),
      onfinish: null,
    } as unknown as Animation;
    animations.push(animation);
    return animation;
  });
  const cleanup = animateReadmeDisclosures(container);
  const click = () => {
    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    summary.dispatchEvent(event);
    return event;
  };
  const finish = () =>
    animations
      .at(-1)
      ?.onfinish?.call(
        animations.at(-1)!,
        new Event("finish") as AnimationPlaybackEvent,
      );
  return { details, summary, animations, cleanup, click, finish };
}

describe("README disclosure animation", () => {
  it("keeps content visible through closing and returns to native layout afterward", () => {
    const { details, click, finish, cleanup } = setup();
    click();
    expect(details.open).toBe(true);
    finish();
    click();
    expect(details.open).toBe(true);
    expect(details.dataset.closing).toBe("true");
    finish();
    expect(details.open).toBe(false);
    expect(details.style.overflow).toBe("");
    expect(details.style.height).toBe("");
    expect(details.dataset.closing).toBeUndefined();
    cleanup();
  });

  it("reverses a running animation and cancels it when unmounted", () => {
    const { details, animations, click, finish, cleanup } = setup();
    click();
    click();
    expect(animations[0].cancel).toHaveBeenCalled();
    expect(animations[0].onfinish).toBeNull();
    finish();
    expect(details.open).toBe(false);
    click();
    cleanup();
    expect(animations.at(-1)?.cancel).toHaveBeenCalled();
    expect(details.style.overflow).toBe("");
  });

  it("leaves native toggling in place when reduced motion is requested", () => {
    const { details, click, cleanup } = setup(true);
    expect(click().defaultPrevented).toBe(false);
    expect(details.animate).not.toHaveBeenCalled();
    cleanup();
  });

  it("leaves native toggling in place without the animation API", () => {
    const { details, click, cleanup } = setup();
    details.animate = undefined as unknown as typeof details.animate;
    expect(click().defaultPrevented).toBe(false);
    cleanup();
  });
});
